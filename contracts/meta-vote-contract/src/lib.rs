use crate::utils::{days_to_millis, millis_to_days};
use crate::{constants::*, locking_position::*};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::unordered_map::UnorderedMap;
use near_sdk::collections::Vector;
use near_sdk::json_types::{U128, U64};
use near_sdk::{env, log, near_bindgen, require, AccountId, Balance, PanicOnDefault};
use types::*;
use utils::{generate_hash_id, get_current_epoch_millis};
use voter::{Voter, VoterJSON};

mod constants;
mod deposit;
mod interface;
mod internal;
mod locking_position;
mod migrate;
mod types;
mod utils;
mod voter;
mod withdraw;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct MetaVoteContract {
    pub owner_id: AccountId,
    pub voters: UnorderedMap<VoterId, Voter>,
    pub votes: UnorderedMap<ContractAddress, UnorderedMap<VotableObjId, VotingPower>>,
    pub min_locking_period: Days,
    pub max_locking_period: Days,
    pub min_deposit_amount: Meta,
    pub max_locking_positions: u8,
    pub max_voting_positions: u8,
    pub meta_token_contract_address: ContractAddress,
    pub total_voting_power: VotingPower,

    // added v0.1.3
    pub claimable_meta: UnorderedMap<VoterId, u128>,
    pub accumulated_distributed_for_claims: u128, // accumulated total META distributed
    pub total_unclaimed_meta: u128,               // currently unclaimed META

    // added v0.1.4
    pub stnear_token_contract_address: ContractAddress,
    pub claimable_stnear: UnorderedMap<VoterId, u128>,
    pub accum_distributed_stnear_for_claims: u128, // accumulated total stNEAR distributed
    pub total_unclaimed_stnear: u128,              // currently unclaimed stNEAR

    // airdrop users encrypted data
    pub registration_cost: u128,
    pub airdrop_user_data: UnorderedMap<VoterId, String>,
}

#[near_bindgen]
impl MetaVoteContract {
    #[init]
    pub fn new(
        owner_id: AccountId,
        min_locking_period: Days,
        max_locking_period: Days,
        min_deposit_amount: U128,
        max_locking_positions: u8,
        max_voting_positions: u8,
        meta_token_contract_address: ContractAddress,
        stnear_token_contract_address: ContractAddress,
        registration_cost: U128,
    ) -> Self {
        require!(!env::state_exists(), "The contract is already initialized");
        require!(
            min_locking_period < max_locking_period,
            "Review the min and max locking period"
        );
        Self {
            owner_id,
            voters: UnorderedMap::new(StorageKey::Voters),
            votes: UnorderedMap::new(StorageKey::Votes),
            min_locking_period,
            max_locking_period,
            min_deposit_amount: Meta::from(min_deposit_amount),
            max_locking_positions,
            max_voting_positions,
            meta_token_contract_address,
            total_voting_power: 0,
            accumulated_distributed_for_claims: 0,
            total_unclaimed_meta: 0,
            claimable_meta: UnorderedMap::new(StorageKey::Claimable),
            stnear_token_contract_address,
            claimable_stnear: UnorderedMap::new(StorageKey::ClaimableStNear),
            accum_distributed_stnear_for_claims: 0,
            total_unclaimed_stnear: 0,
            registration_cost: registration_cost.0,
            airdrop_user_data: UnorderedMap::new(StorageKey::AirdropData),
        }
    }

    // ***********
    // * Airdrop *
    // ***********

    pub fn update_registration_cost(&mut self, new_cost: U128) {
        self.assert_only_owner();
        self.registration_cost = new_cost.0;
    }

    #[payable]
    pub fn update_airdrop_user_data(&mut self, encrypted_data: &String) {
        assert!(
            env::attached_deposit() == self.registration_cost,
            "Pay {} yoctos for the registration cost",
            self.registration_cost
        );
        self.airdrop_user_data
            .insert(&env::predecessor_account_id(), encrypted_data);
    }

    /// Returns a single airdrop data
    pub fn get_airdrop_account(&self, account_id: &AccountId) -> String {
        self.airdrop_user_data.get(&account_id).unwrap()
    }

    /// Returns a list of airdrop data
    pub fn get_airdrop_accounts(&self, from_index: u32, limit: u32) -> Vec<(String, String)> {
        let keys = self.airdrop_user_data.keys_as_vector();
        let voters_len = keys.len() as u64;
        let start = from_index as u64;
        let limit = limit as u64;
        let mut results = Vec::<(String,String)>::new();
        for index in start..std::cmp::min(start + limit, voters_len) {
            let voter_id = keys.get(index).unwrap();
            let airdrop_data = self.airdrop_user_data.get(&voter_id).unwrap();
            results.push((voter_id.to_string(), airdrop_data));
        }
        results
    }

    // ****************
    // * claim & Lock *
    // ****************

    // claim META and create/update a locking position
    pub fn claim_and_lock(&mut self, amount: U128, locking_period: u16) {
        let amount = amount.0;
        self.assert_min_deposit_amount(amount);
        let voter_id = VoterId::from(env::predecessor_account_id());
        self.remove_claimable_meta(&voter_id, amount);
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        // create/update locking position
        self.deposit_locking_position(amount, locking_period, voter_id, &mut voter);
    }

    // claim stNear
    pub fn claim_stnear(&mut self, amount: U128) {
        let amount = amount.0;
        let voter_id = VoterId::from(env::predecessor_account_id());
        self.remove_claimable_stnear(&voter_id, amount);

        // IMPORTANT: if user is not a voter, then the claim is not available.
        let _voter = self.internal_get_voter_or_panic(&voter_id);
        self.transfer_stnear_to_voter(voter_id, amount);
    }

    // *************
    // * Unlocking *
    // *************

    pub fn unlock_position(&mut self, index: PositionIndex) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let mut locking_position = voter.get_position(index);

        let voting_power = locking_position.voting_power;
        assert!(
            voter.voting_power >= voting_power,
            "Not enough free voting power to unlock! You have {}, required {}.",
            voter.voting_power,
            voting_power
        );

        log!(
            "UNLOCK: {} unlocked position {}.",
            &voter_id.to_string(),
            index
        );
        locking_position.unlocking_started_at = Some(get_current_epoch_millis());
        voter.locking_positions.replace(index, &locking_position);
        voter.voting_power -= voting_power;
        self.total_voting_power = self.total_voting_power.saturating_sub(voting_power);
        self.voters.insert(&voter_id, &voter);
    }

    pub fn unlock_partial_position(&mut self, index: PositionIndex, amount: U128) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let mut locking_position = voter.get_position(index);

        let locking_period = locking_position.locking_period;
        let amount = Meta::from(amount);

        // If the amount equals the total, then the unlock is not partial.
        if amount == locking_position.amount {
            return self.unlock_position(index);
        }
        require!(locking_position.amount > amount, "Amount too large!");
        assert!(
            (locking_position.amount - amount) >= self.min_deposit_amount,
            "A locking position cannot have less than {} META",
            self.min_deposit_amount
        );
        let remove_voting_power = self.calculate_voting_power(amount, locking_period);
        assert!(
            locking_position.voting_power >= remove_voting_power,
            "Not enough free voting power to unlock! Locking position has {}, required {}.",
            locking_position.voting_power,
            remove_voting_power
        );
        assert!(
            voter.voting_power >= remove_voting_power,
            "Not enough free voting power to unlock! You have {}, required {}.",
            voter.voting_power,
            remove_voting_power
        );

        log!(
            "UNLOCK: {} partially unlocked position {}.",
            &voter_id.to_string(),
            index
        );
        // Create a NEW unlocking position
        self.create_unlocking_position(&mut voter, amount, locking_period, remove_voting_power);

        // Decrease current locking position
        locking_position.voting_power -= remove_voting_power;
        locking_position.amount -= amount;
        voter.locking_positions.replace(index, &locking_position);

        voter.voting_power -= remove_voting_power;
        self.total_voting_power = self.total_voting_power.saturating_sub(remove_voting_power);
        self.voters.insert(&voter_id, &voter);
    }

    // ********************************
    // * extend locking position days *
    // ********************************

    pub fn locking_position_extend_days(&mut self, index: PositionIndex, new_locking_period: Days) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let mut locking_position = voter.get_position(index);

        // position should be locked
        require!(
            locking_position.unlocking_started_at.is_none(),
            "position should be locked in order to extend time"
        );
        require!(
            new_locking_period > locking_position.locking_period,
            "new auto-lock period should be greater than previous one"
        );

        log!(
            "EXTEND-TIME: {} position #{} {} days",
            &voter_id.to_string(),
            index,
            new_locking_period
        );

        let old_voting_power = locking_position.voting_power;
        let new_voting_power =
            self.calculate_voting_power(locking_position.amount, new_locking_period);

        // update to new total-voting-power (add delta)
        self.total_voting_power += new_voting_power - old_voting_power;

        // update to new voter-voting-power (add delta)
        voter.voting_power += new_voting_power - old_voting_power;

        // update position
        locking_position.locking_period = new_locking_period;
        locking_position.voting_power = new_voting_power;

        // save
        voter.locking_positions.replace(index, &locking_position);
        self.voters.insert(&voter_id, &voter);
    }

    // ***********
    // * Re-Lock *
    // ***********

    pub fn relock_position(
        &mut self,
        index: PositionIndex,
        locking_period: Days,
        amount_from_balance: U128,
    ) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let locking_position = voter.get_position(index);

        // Check voter balance and unlocking position amount.
        let amount_from_balance = amount_from_balance.0;
        assert!(
            voter.balance >= amount_from_balance,
            "Not enough balance. You have {} META in balance, required {}.",
            voter.balance,
            amount_from_balance
        );
        // Check if position is unlocking.
        require!(
            locking_position.unlocking_started_at.is_some(),
            "Cannot re-lock a locked position."
        );

        let now = get_current_epoch_millis();
        let unlocking_date = locking_position.unlocking_started_at.unwrap()
            + locking_position.locking_period_millis();

        if now < unlocking_date {
            // Position is still in the **unlocking** period, (unlocking_date is in the future)
            let remaining = unlocking_date - now;
            assert!(
                remaining < days_to_millis(locking_period),
                "The new locking period should be greater than {} days.",
                millis_to_days(remaining)
            );
        }

        log!(
            "RELOCK: {} relocked position {}.",
            &voter_id.to_string(),
            index
        );
        let amount = locking_position.amount + amount_from_balance;
        voter.remove_position(index);
        voter.balance -= amount_from_balance;
        self.deposit_locking_position(amount, locking_period, voter_id, &mut voter);
    }

    pub fn relock_partial_position(
        &mut self,
        index: PositionIndex,
        amount_from_position: U128,
        locking_period: Days,
        amount_from_balance: U128,
    ) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let mut locking_position = voter.get_position(index);

        // Check voter balance and unlocking position amount.
        let amount_from_balance = amount_from_balance.0;
        let amount_from_position = amount_from_position.0;
        assert!(
            voter.balance >= amount_from_balance,
            "Not enough balance. You have {} META in balance, required {}.",
            voter.balance,
            amount_from_balance
        );
        assert!(
            locking_position.amount >= amount_from_position,
            "Locking position amount is not enough. Locking position has {} META, required {}.",
            locking_position.amount,
            amount_from_position
        );
        let amount = amount_from_balance + amount_from_position;
        assert!(
            amount >= self.min_deposit_amount,
            "A locking position cannot have less than {} META.",
            self.min_deposit_amount
        );
        // Check if position is unlocking.
        require!(
            locking_position.unlocking_started_at.is_some(),
            "Cannot re-lock a locked position."
        );

        let now = get_current_epoch_millis();
        let unlocking_date = locking_position.unlocking_started_at.unwrap()
            + locking_position.locking_period_millis();

        if now < unlocking_date {
            // Position is **unlocking**.
            let remaining = unlocking_date - now;
            assert!(
                remaining < days_to_millis(locking_period),
                "The new locking period should be greater than {} days.",
                millis_to_days(remaining)
            );

            let new_amount = locking_position.amount - amount_from_position;
            assert!(
                amount >= self.min_deposit_amount,
                "A locking position cannot have less than {} META.",
                self.min_deposit_amount
            );
            assert!(new_amount > 0, "Use relock_position() function instead.");

            locking_position.amount = new_amount;
            voter.locking_positions.replace(index, &locking_position);
        } else {
            voter.balance += locking_position.amount - amount_from_position;
            voter.remove_position(index);
        }

        log!(
            "RELOCK: {} partially relocked position {}.",
            &voter_id.to_string(),
            index
        );
        voter.balance -= amount_from_balance;
        self.deposit_locking_position(amount, locking_period, voter_id, &mut voter);
    }

    pub fn relock_from_balance(&mut self, locking_period: Days, amount_from_balance: U128) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);

        let amount = amount_from_balance.0;
        assert!(
            voter.balance >= amount,
            "Not enough balance. You have {} META in balance, required {}.",
            voter.balance,
            amount
        );
        assert!(
            amount >= self.min_deposit_amount,
            "A locking position cannot have less than {} META.",
            self.min_deposit_amount
        );

        log!("RELOCK: {} relocked position.", &voter_id.to_string());
        voter.balance -= amount;
        self.deposit_locking_position(amount, locking_period, voter_id, &mut voter);
    }

    // ******************
    // * Clear Position *
    // ******************

    // clear SEVERAL locking positions
    pub fn clear_locking_position(&mut self, position_index_list: Vec<PositionIndex>) {
        require!(position_index_list.len() > 0, "Index list is empty.");
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let mut position_index_list = position_index_list;

        position_index_list.sort();
        position_index_list.reverse();
        for index in position_index_list {
            let locking_position = voter.get_position(index);
            if locking_position.is_unlocked() {
                voter.balance += locking_position.amount;
                voter.remove_position(index);
            }
        }
        self.voters.insert(&voter_id, &voter);
    }

    // ************
    // * Withdraw *
    // ************

    pub fn withdraw(&mut self, position_index_list: Vec<PositionIndex>, amount_from_balance: U128) {
        let voter_id = env::predecessor_account_id();
        let voter = self.internal_get_voter_or_panic(&voter_id);
        let amount_from_balance = Meta::from(amount_from_balance);
        assert!(
            voter.balance >= amount_from_balance,
            "Not enough balance. You have {} META in balance, required {}.",
            voter.balance,
            amount_from_balance
        );
        let remaining_balance = voter.balance - amount_from_balance;
        // Clear locking positions, it can increase the voter balance.
        if position_index_list.len() > 0 {
            self.clear_locking_position(position_index_list);
        }
        // get voter again, because clear_locking_position alters the state
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let total_to_withdraw = voter.balance - remaining_balance;
        require!(total_to_withdraw > 0, "Nothing to withdraw.");
        voter.balance -= total_to_withdraw;

        if voter.is_empty() {
            self.voters.remove(&voter_id);
            log!("GODSPEED: {} is no longer part of Meta Vote!", &voter_id);
        } else {
            self.voters.insert(&voter_id, &voter);
        }
        self.transfer_meta_to_voter(voter_id, total_to_withdraw);
    }

    pub fn withdraw_all(&mut self) {
        let voter_id = env::predecessor_account_id();
        let voter = self.internal_get_voter_or_panic(&voter_id);

        let position_index_list = voter.get_unlocked_position_index();
        // Clear locking positions could increase the voter balance.
        if position_index_list.len() > 0 {
            self.clear_locking_position(position_index_list);
        }
        // get voter again because clear locking positions could increase the voter balance.
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let total_to_withdraw = voter.balance;
        require!(total_to_withdraw > 0, "Nothing to withdraw.");
        voter.balance = 0;

        if voter.is_empty() {
            self.voters.remove(&voter_id);
            log!("GODSPEED: {} is no longer part of Meta Vote!", &voter_id);
        } else {
            self.voters.insert(&voter_id, &voter);
        }
        self.transfer_meta_to_voter(voter_id, total_to_withdraw);
    }

    // **********
    // * Voting *
    // **********

    pub fn vote(
        &mut self,
        voting_power: U128,
        contract_address: ContractAddress,
        votable_object_id: VotableObjId,
    ) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let voting_power = VotingPower::from(voting_power);
        assert!(
            voter.voting_power >= voting_power,
            "Not enough free voting power. You have {}, requested {}.",
            voter.voting_power,
            voting_power
        );
        assert!(
            voter.vote_positions.len() <= self.max_voting_positions as u64,
            "Cannot exceed {} voting positions.",
            self.max_voting_positions
        );

        let mut votes_for_address = voter.get_votes_for_address(&voter_id, &contract_address);
        let mut votes = votes_for_address.get(&votable_object_id).unwrap_or(0_u128);

        voter.voting_power -= voting_power;
        votes += voting_power;
        votes_for_address.insert(&votable_object_id, &votes);
        voter
            .vote_positions
            .insert(&contract_address, &votes_for_address);
        self.voters.insert(&voter_id, &voter);

        log!(
            "VOTE: {} gave {} votes for object {} at address {}.",
            &voter_id,
            voting_power.to_string(),
            &votable_object_id,
            contract_address.as_str()
        );

        // Update Meta Vote state.
        self.internal_increase_total_votes(voting_power, &contract_address, &votable_object_id);
    }

    pub fn rebalance(
        &mut self,
        voting_power: U128,
        contract_address: ContractAddress,
        votable_object_id: VotableObjId,
    ) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let voting_power = VotingPower::from(voting_power);

        let mut votes_for_address = voter.get_votes_for_address(&voter_id, &contract_address);
        let mut votes = votes_for_address
            .get(&votable_object_id)
            .expect("Rebalance not allowed for nonexisting Votable Object.");

        require!(
            votes != voting_power,
            "Cannot rebalance to same Voting Power."
        );
        if voting_power == 0 {
            return self.unvote(contract_address, votable_object_id);
        }

        if votes < voting_power {
            // Increase votes.
            let additional_votes = voting_power - votes;
            assert!(
                voter.voting_power >= additional_votes,
                "Not enough free voting power to unlock! You have {}, required {}.",
                voter.voting_power,
                additional_votes
            );
            voter.voting_power -= additional_votes;
            votes += additional_votes;

            log!(
                "VOTE: {} increased to {} votes for object {} at address {}.",
                &voter_id,
                voting_power.to_string(),
                &votable_object_id,
                contract_address.as_str()
            );

            self.internal_increase_total_votes(
                additional_votes,
                &contract_address,
                &votable_object_id,
            );
        } else {
            // Decrease votes.
            let remove_votes = votes - voting_power;
            voter.voting_power += remove_votes;
            votes -= remove_votes;

            log!(
                "VOTE: {} decreased to {} votes for object {} at address {}.",
                &voter_id,
                voting_power.to_string(),
                &votable_object_id,
                contract_address.as_str()
            );

            self.internal_decrease_total_votes(remove_votes, &contract_address, &votable_object_id);
        }
        votes_for_address.insert(&votable_object_id, &votes);
        voter
            .vote_positions
            .insert(&contract_address, &votes_for_address);
        self.voters.insert(&voter_id, &voter);
    }

    pub fn unvote(&mut self, contract_address: ContractAddress, votable_object_id: VotableObjId) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter_or_panic(&voter_id);

        let mut votes_for_address = voter.get_votes_for_address(&voter_id, &contract_address);
        let votes = votes_for_address
            .get(&votable_object_id)
            .expect("Cannot unvote a Votable Object without votes.");

        voter.voting_power += votes;
        votes_for_address.remove(&votable_object_id);

        if votes_for_address.is_empty() {
            voter.vote_positions.remove(&contract_address);
        } else {
            voter
                .vote_positions
                .insert(&contract_address, &votes_for_address);
        }
        self.voters.insert(&voter_id, &voter);

        log!(
            "UNVOTE: {} unvoted object {} at address {}.",
            &voter_id,
            &votable_object_id,
            contract_address.as_str()
        );

        // Update Meta Vote state.
        self.internal_decrease_total_votes(votes, &contract_address, &votable_object_id);
    }

    // *********
    // * Admin *
    // *********

    pub fn update_min_locking_period(&mut self, new_period: Days) {
        self.assert_only_owner();
        self.min_locking_period = new_period;
    }

    /**********************/
    /*   View functions   */
    /**********************/

    pub fn get_owner_id(&self) -> String {
        self.owner_id.to_string()
    }

    pub fn get_voters_count(&self) -> U64 {
        self.voters.len().into()
    }

    pub fn get_total_voting_power(&self) -> U128 {
        U128::from(self.total_voting_power)
    }

    // get all information for a single voter: voter + locking-positions + voting-positions
    pub fn get_voter_info(&self, voter_id: &AccountId) -> VoterJSON {
        let voter = self.voters.get(&voter_id).unwrap();
        voter.to_json(voter_id)
    }

    // get all information for multiple voters, by index: Vec<voter + locking-positions + voting-positions>
    pub fn get_voters(&self, from_index: u32, limit: u32) -> Vec<VoterJSON> {
        let keys = self.voters.keys_as_vector();
        let voters_len = keys.len() as u64;
        let start = from_index as u64;
        let limit = limit as u64;

        let mut results = Vec::<VoterJSON>::new();
        for index in start..std::cmp::min(start + limit, voters_len) {
            let voter_id = keys.get(index).unwrap();
            let voter = self.voters.get(&voter_id).unwrap();
            results.push(voter.to_json(&voter_id));
        }
        results
    }

    pub fn get_balance(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        let balance = voter.balance + voter.sum_unlocked();
        U128::from(balance)
    }

    pub fn get_claimable_meta(&self, voter_id: &VoterId) -> U128 {
        U128::from(self.claimable_meta.get(&voter_id).unwrap_or_default())
    }

    pub fn get_claimable_stnear(&self, voter_id: &VoterId) -> U128 {
        U128::from(self.claimable_stnear.get(&voter_id).unwrap_or_default())
    }

    // get all claims
    pub fn get_claims(&self, from_index: u32, limit: u32) -> Vec<(AccountId, U128)> {
        let mut results = Vec::<(AccountId, U128)>::new();
        let keys = self.claimable_meta.keys_as_vector();
        let start = from_index as u64;
        let limit = limit as u64;
        for index in start..std::cmp::min(start + limit, keys.len()) {
            let voter_id = keys.get(index).unwrap();
            let amount = self.claimable_meta.get(&voter_id).unwrap();
            results.push((voter_id, amount.into()));
        }
        results
    }

    pub fn get_locked_balance(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        U128::from(voter.sum_locked())
    }

    pub fn get_unlocking_balance(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        U128::from(voter.sum_unlocking())
    }

    pub fn get_available_voting_power(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        U128::from(voter.voting_power)
    }

    pub fn get_used_voting_power(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        U128::from(voter.sum_used_votes())
    }

    pub fn get_locking_period(&self) -> (Days, Days) {
        (self.min_locking_period, self.max_locking_period)
    }

    // all locking positions for a voter
    pub fn get_all_locking_positions(&self, voter_id: VoterId) -> Vec<LockingPositionJSON> {
        let mut result = Vec::new();
        let voter = self.internal_get_voter(&voter_id);
        for index in 0..voter.locking_positions.len() {
            let locking_position = voter
                .locking_positions
                .get(index)
                .expect("Locking position not found!");
            result.push(locking_position.to_json(Some(index)));
        }
        result
    }

    pub fn get_locking_position(
        &self,
        index: PositionIndex,
        voter_id: VoterId,
    ) -> Option<LockingPositionJSON> {
        let voter = self.internal_get_voter(&voter_id);
        match voter.locking_positions.get(index) {
            Some(locking_position) => Some(locking_position.to_json(Some(index))),
            None => None,
        }
    }

    // votes by app and votable_object
    pub fn get_total_votes(
        &self,
        contract_address: ContractAddress,
        votable_object_id: VotableObjId,
    ) -> U128 {
        let votes = match self.votes.get(&contract_address) {
            Some(object) => object.get(&votable_object_id).unwrap_or(0_u128),
            None => 0_u128,
        };
        U128::from(votes)
    }

    // votes by app (contract)
    pub fn get_votes_by_contract(
        &self,
        contract_address: ContractAddress,
    ) -> Vec<VotableObjectJSON> {
        let objects = self
            .votes
            .get(&contract_address)
            .unwrap_or(UnorderedMap::new(StorageKey::Votes));

        let mut results: Vec<VotableObjectJSON> = Vec::new();
        for (id, voting_power) in objects.iter() {
            results.push(VotableObjectJSON {
                votable_contract: contract_address.to_string(),
                id,
                current_votes: U128::from(voting_power),
            })
        }
        results.sort_by_key(|v| v.current_votes.0);
        results
    }

    // given a voter, total votes per app + object_id
    pub fn get_votes_by_voter(&self, voter_id: VoterId) -> Vec<VotableObjectJSON> {
        let mut results: Vec<VotableObjectJSON> = Vec::new();
        let voter = self.internal_get_voter(&voter_id);
        for contract_address in voter.vote_positions.keys_as_vector().iter() {
            let votes_for_address = voter.vote_positions.get(&contract_address).unwrap();
            for (id, voting_power) in votes_for_address.iter() {
                results.push(VotableObjectJSON {
                    votable_contract: contract_address.to_string(),
                    id,
                    current_votes: U128::from(voting_power),
                })
            }
        }
        results.sort_by_key(|v| v.current_votes.0);
        results
    }

    pub fn get_votes_for_object(
        &self,
        voter_id: VoterId,
        contract_address: ContractAddress,
        votable_object_id: VotableObjId,
    ) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        let votes = match voter.vote_positions.get(&contract_address) {
            Some(votes_for_address) => votes_for_address.get(&votable_object_id).unwrap_or(0_u128),
            None => 0_u128,
        };
        U128::from(votes)
    }

    // query current meta ready for distribution
    pub fn get_total_unclaimed_meta(&self) -> U128 {
        self.total_unclaimed_meta.into()
    }
    // query total_distributed meta for claims
    pub fn get_accumulated_distributed_for_claims(&self) -> U128 {
        self.accumulated_distributed_for_claims.into()
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests;
