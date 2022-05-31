use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, Vector};
use near_sdk::{env, near_bindgen, AccountId, Balance, PanicOnDefault};

mod constants;
mod deposit;
mod interface;
mod internal;
mod locking_position;
mod types;
mod utils;
mod vote_position;
mod voter;
use types::*;
use utils::get_current_epoch_millis;
use voter::Voter;

use crate::utils::{days_to_millis, millis_to_days};
use crate::{constants::*, vote_position::*, locking_position::*};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct MetaVoteContract {
    pub owner_id: AccountId,
    pub voters: UnorderedMap<VoterId, Voter>,
    pub min_locking_period: Days,
    pub max_locking_period: Days,
    pub min_deposit_amount: Meta,
    pub max_locking_positions: u8,
    pub max_voting_positions: u8,
    pub meta_token_contract_address: ContractAddress,
}

#[near_bindgen]
impl MetaVoteContract {
    #[init]
    pub fn new(
        owner_id: AccountId,
        min_locking_period: Days,
        max_locking_period: Days,
        min_deposit_amount: Meta,
        max_locking_positions: u8,
        max_voting_positions: u8,
        meta_token_contract_address: ContractAddress,
    ) -> Self {
        // assert!(!env::state_exists(), "The contract is already initialized");
        assert!(min_locking_period < max_locking_period, "Review the min and max locking period");
        Self {
            owner_id,
            voters: UnorderedMap::new(Keys::Voter),
            min_locking_period,
            max_locking_period,
            min_deposit_amount,
            max_locking_positions,
            max_voting_positions,
            meta_token_contract_address,
        }
    }

    // *************
    // * Unlocking *
    // *************

    pub fn unlock_position(&mut self, index: PositionIndex) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter(&voter_id);
        let mut locking_position = voter.locking_positions.get(index)
            .expect("Locking position not found!");

        let voting_power = locking_position.voting_power;
        assert!(voter.voting_power >= voting_power, "Not enough free voting power to unlock!");

        locking_position.unlocking_started_at = Some(get_current_epoch_millis());
        voter.locking_positions.replace(index, &locking_position);
        voter.voting_power -= voting_power;
        self.voters.insert(&voter_id, &voter);
    }

    pub fn unlock_partial_position(&mut self, index: PositionIndex, amount: MetaJSON) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter(&voter_id);
        let mut locking_position = voter.locking_positions.get(index)
            .expect("Locking position not found!");

        let locking_period = locking_position.locking_period;
        let amount = Meta::from(amount);

        // TODO: Fix this, do not panic! instead run outer function.
        assert!(
            locking_position.amount > amount,
            "Amount too large! If you want to remove all amount use the fn unlock_position"
        );
        assert!(
            (locking_position.amount - amount) >= self.min_deposit_amount,
            "A locking position cannot have less than {} $META",
            self.min_deposit_amount
        );
        let remove_voting_power = self.calculate_voting_power(amount, locking_period);
        assert!(
            locking_position.voting_power >= remove_voting_power
                && voter.voting_power >= remove_voting_power,
            "Not enough free voting power to unlock!"
        );

        // Create a NEW unlocking position
        self.create_unlocking_position(&mut voter, amount, locking_period, remove_voting_power);

        // Decrease current locking position
        locking_position.voting_power -= remove_voting_power;
        locking_position.amount -= amount;
        voter.locking_positions.replace(index, &locking_position);

        voter.voting_power -= remove_voting_power;
        self.voters.insert(&voter_id, &voter);
    }

    // ***********
    // * Re-Lock *
    // ***********

    pub fn relock_position(
        &mut self,
        index: PositionIndex,
        locking_period: Days,
        amount_from_balance: MetaJSON
    ) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter(&voter_id);
        let locking_position = voter.locking_positions.get(index)
            .expect("Locking position not found!");

        // Check voter balance and unlocking position amount.
        let amount_from_balance = amount_from_balance.0;
        assert!(
            voter.balance >= amount_from_balance,
            "Not enough balance."
        );
        // Check if position is unlocking.
        assert!(
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
        }
        let amount = locking_position.amount + amount_from_balance;
        voter.remove_position(index);
        voter.balance -= amount_from_balance;
        self.deposit_locking_position(
            amount,
            locking_period,
            voter_id,
            &mut voter
        );
    }

    pub fn relock_partial_position(
        &mut self,
        index: PositionIndex,
        amount_from_position: MetaJSON,
        locking_period: Days,
        amount_from_balance: MetaJSON
    ) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter(&voter_id);
        let mut locking_position = voter.locking_positions.get(index)
            .expect("Locking position not found!");

        // Check voter balance and unlocking position amount.
        let amount_from_balance = amount_from_balance.0;
        let amount_from_position = amount_from_position.0;
        assert!(
            voter.balance >= amount_from_balance,
            "Not enough balance."
        );
        assert!(
            locking_position.amount >= amount_from_position,
            "Locking position amount is not enough."
        );
        let amount = amount_from_balance + amount_from_position;
        assert!(
            amount >= self.min_deposit_amount,
            "A locking position cannot have less than {} $META.",
            self.min_deposit_amount
        );
        // Check if position is unlocking.
        assert!(
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
                "A locking position cannot have less than {} $META.",
                self.min_deposit_amount
            );
            locking_position.amount = new_amount;
            voter.locking_positions.replace(index, &locking_position);
        } else {
            voter.balance += locking_position.amount - amount_from_position;
            voter.remove_position(index);
        }
        voter.balance -= amount_from_balance;
        self.deposit_locking_position(
            amount,
            locking_period,
            voter_id,
            &mut voter
        );
    }

    pub fn relock_from_balance(
        &mut self,
        locking_period: Days,
        amount_from_balance: MetaJSON
    ) {
        let voter_id = env::predecessor_account_id();
        let mut voter = self.internal_get_voter(&voter_id);

        let amount = amount_from_balance.0;
        assert!(
            voter.balance >= amount,
            "Not enough balance."
        );
        assert!(
            amount >= self.min_deposit_amount,
            "A locking position cannot have less than {} $META.",
            self.min_deposit_amount
        );
        voter.balance -= amount;
        self.deposit_locking_position(
            amount,
            locking_period,
            voter_id,
            &mut voter
        );
    }

    // ****************
    // * View Methods *
    // ****************

    pub fn get_all_locking_positions(&self) -> Vec<LockingPositionJSON> {
        let mut result = Vec::new();
        let voter_id = env::predecessor_account_id();
        let voter = self.internal_get_voter(&voter_id);
        for index in 0..voter.locking_positions.len() {
            let locking_position = voter.locking_positions.get(index)
                .expect("Locking position not found!");
            result.push(
                locking_position.to_json(Some(index))
            );
        }
        result
    }

    pub fn get_locking_position(&self, index: PositionIndex) -> Option<LockingPositionJSON> {
        let voter_id = env::predecessor_account_id();
        let voter = self.internal_get_voter(&voter_id);
        match voter.locking_positions.get(index) {
            Some(locking_position) => Some(locking_position.to_json(Some(index))),
            None => None,
        }
    }

    pub fn get_balance(&self) -> BalanceJSON {
        let voter_id = env::predecessor_account_id();
        let voter = self.internal_get_voter(&voter_id);
        let balance = voter.balance + voter.sum_unlocked();
        BalanceJSON::from(balance)
    }

    pub fn get_locked_balance(&self) -> BalanceJSON {
        let voter_id = env::predecessor_account_id();
        let voter = self.internal_get_voter(&voter_id);
        BalanceJSON::from(voter.sum_locked())
    }

    pub fn get_unlocking_balance(&self) -> BalanceJSON {
        let voter_id = env::predecessor_account_id();
        let voter = self.internal_get_voter(&voter_id);
        BalanceJSON::from(voter.sum_unlocking())
    }

    pub fn get_available_voting_power(&self) -> VotePowerJSON {
        let voter_id = env::predecessor_account_id();
        let voter = self.internal_get_voter(&voter_id);
        VotePowerJSON::from(voter.voting_power)
    }

    pub fn get_used_voting_power(&self) -> VotePowerJSON {
        let voter_id = env::predecessor_account_id();
        let voter = self.internal_get_voter(&voter_id);
        VotePowerJSON::from(voter.sum_used_votes())
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
    use near_sdk::{testing_env, VMContext};
    use near_sdk::json_types::U128;
    mod utils;
    use utils::*;
    use super::*;

    fn new_contract() -> MetaVoteContract {
        MetaVoteContract::new(
            owner_account(),
            MIN_LOCKING_PERIOD,
            MAX_LOCKING_PERIOD,
            MIN_DEPOSIT_AMOUNT,
            MAX_LOCKING_POSITIONS,
            MAX_VOTING_POSITIONS,
            meta_token_account(),
        )
    }

    fn get_contract_setup(context: VMContext) -> MetaVoteContract {
        testing_env!(context.clone());
        let contract = new_contract();
        contract
    }

    #[test]
    fn test_single_deposit() {
        let context = get_context(
            meta_token_account(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            to_ts(GENESIS_TIME_IN_DAYS),
        );
        let mut contract = get_contract_setup(context);

        let sender_id: AccountId = voter_account();
        let amount = U128::from(2 * YOCTO_UNITS);
        let msg: String = "30".to_owned();

        contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());
        assert_eq!(1, contract.voters.len(), "Voter was not created!");

        let voter = contract.internal_get_voter(&sender_id);
        assert_eq!(1, voter.locking_positions.len(), "Locking position was not created!");

        let vote_power = contract.calculate_voting_power(
            Meta::from(amount),
            msg.parse::<Days>().unwrap()
        );
        assert_eq!(vote_power, voter.voting_power, "Incorrect voting power calculation!");
    }

    #[test]
    fn test_multiple_deposit_same_locking_period() {
        let context = get_context(
            meta_token_account(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            to_ts(GENESIS_TIME_IN_DAYS),
        );
        let mut contract = get_contract_setup(context);

        let sender_id: AccountId = voter_account();
        let amount = U128::from(2 * YOCTO_UNITS);
        let msg: String = "30".to_owned();

        contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

        let new_amount = U128::from(5 * YOCTO_UNITS);
        contract.ft_on_transfer(sender_id.clone(), new_amount.clone(), msg.clone());

        let voter = contract.internal_get_voter(&sender_id);
        assert_eq!(1, voter.locking_positions.len(), "Locking position was not created!");

        let total_vote_power = contract.calculate_voting_power(
            Meta::from(amount.clone()),
            msg.parse::<Days>().unwrap()
        ) + contract.calculate_voting_power(
            Meta::from(new_amount.clone()),
            msg.parse::<Days>().unwrap()
        );

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id,
            ntoy(TEST_INITIAL_BALANCE),
            0,
            to_ts(GENESIS_TIME_IN_DAYS),
        );
        testing_env!(context.clone());
        assert_eq!(
            VotePowerJSON::from(total_vote_power),
            contract.get_available_voting_power(),
            "Incorrect voting power calculation!"
        );

        let locked_balance = u128::from(amount) + u128::from(new_amount);
        assert_eq!(
            BalanceJSON::from(locked_balance),
            contract.get_locked_balance(),
            "Incorrect locked balance sum!"
        );
        assert_eq!(
            BalanceJSON::from(0),
            contract.get_balance(),
            "Incorrect balance!"
        );
    }

    #[test]
    fn test_multiple_deposit_diff_locking_period() {
        let context = get_context(
            meta_token_account(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            to_ts(GENESIS_TIME_IN_DAYS),
        );
        let mut contract = get_contract_setup(context);

        let sender_id: AccountId = voter_account();
        let amount = U128::from(2 * YOCTO_UNITS);
        let msg: String = "30".to_owned();

        contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

        let new_amount = U128::from(5 * YOCTO_UNITS);
        let new_msg: String = "200".to_owned();
        contract.ft_on_transfer(sender_id.clone(), new_amount.clone(), new_msg.clone());

        let voter = contract.internal_get_voter(&sender_id);
        assert_eq!(2, voter.locking_positions.len(), "Locking position was not created!");

        let total_vote_power = contract.calculate_voting_power(
            Meta::from(amount),
            msg.parse::<Days>().unwrap()
        ) + contract.calculate_voting_power(
            Meta::from(new_amount),
            new_msg.parse::<Days>().unwrap()
        );

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id,
            ntoy(TEST_INITIAL_BALANCE),
            0,
            to_ts(GENESIS_TIME_IN_DAYS),
        );
        testing_env!(context.clone());
        assert_eq!(
            VotePowerJSON::from(total_vote_power),
            contract.get_available_voting_power(),
            "Incorrect voting power calculation!"
        );

        let locked_balance = u128::from(amount) + u128::from(new_amount);
        assert_eq!(
            BalanceJSON::from(locked_balance),
            contract.get_locked_balance(),
            "Incorrect locked balance sum!"
        );
        assert_eq!(
            BalanceJSON::from(0),
            contract.get_balance(),
            "Incorrect balance!"
        );
    }

    #[test]
    fn test_unlock_position() {
        let context = get_context(
            meta_token_account(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            to_ts(GENESIS_TIME_IN_DAYS),
        );
        let mut contract = get_contract_setup(context);

        let sender_id: AccountId = voter_account();
        let amount = U128::from(2 * YOCTO_UNITS);
        let msg: String = "30".to_owned();

        contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            to_ts(GENESIS_TIME_IN_DAYS),
        );
        testing_env!(context.clone());

        assert_eq!(amount, contract.get_locked_balance(), "Incorrect locked balance!");
        assert_eq!(BalanceJSON::from(0), contract.get_unlocking_balance(), "Incorrect unlocking balance!");

        let voter = contract.internal_get_voter(&sender_id);
        let index = contract.get_all_locking_positions()
            .first()
            .unwrap()
            .index
            .unwrap();
        contract.unlock_position(index);
        assert_eq!(1, voter.locking_positions.len(), "Locking position was not created!");

        let unlocking_started_at = contract.get_all_locking_positions()
            .first()
            .unwrap()
            .unlocking_started_at;
        assert!(unlocking_started_at.is_some(), "Position is not unlocked!");
        assert_eq!(BalanceJSON::from(0), contract.get_locked_balance(), "Incorrect locked balance!");
        assert_eq!(amount, contract.get_unlocking_balance(), "Incorrect unlocking balance!");

        let voter = contract.internal_get_voter(&sender_id);
        assert_eq!(voter.voting_power, 0, "Voting power was not removed!");
    }

    #[test]
    fn test_unlock_partial_position() {
        let context = get_context(
            meta_token_account(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            to_ts(GENESIS_TIME_IN_DAYS),
        );
        let mut contract = get_contract_setup(context);

        let sender_id: AccountId = voter_account();
        let amount = U128::from(2 * YOCTO_UNITS);
        let msg: String = "30".to_owned();
        contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

        let new_amount = U128::from(5 * YOCTO_UNITS);
        let new_msg: String = "200".to_owned();
        contract.ft_on_transfer(sender_id.clone(), new_amount.clone(), new_msg.clone());

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            to_ts(GENESIS_TIME_IN_DAYS),
        );
        testing_env!(context.clone());

        let total_amount = BalanceJSON::from(u128::from(amount) + u128::from(new_amount));
        assert_eq!(total_amount, contract.get_locked_balance(), "Incorrect locked balance!");
        assert_eq!(BalanceJSON::from(0), contract.get_unlocking_balance(), "Incorrect unlocking balance!");

        // Partially removing the last (second) locking position.
        let index = contract.get_all_locking_positions()
            .last()
            .unwrap()
            .index
            .unwrap();
        let third_amount = U128::from(4 * YOCTO_UNITS);
        contract.unlock_partial_position(index, third_amount);
        let voter = contract.internal_get_voter(&sender_id);
        assert_eq!(3, voter.locking_positions.len(), "Locking position was not created!");

        let unlocking_started_at = contract.get_all_locking_positions()
            .last()
            .unwrap()
            .unlocking_started_at;
        assert!(unlocking_started_at.is_some(), "Position is not unlocked!");
        let locked_amount = BalanceJSON::from(
            u128::from(amount) + u128::from(new_amount) - u128::from(third_amount)
        );
        assert_eq!(locked_amount, contract.get_locked_balance(), "Incorrect locked balance!");
        assert_eq!(third_amount, contract.get_unlocking_balance(), "Incorrect unlocking balance!");

        let voter = contract.internal_get_voter(&sender_id);
        let total_vote_power = contract.calculate_voting_power(
            Meta::from(amount),
            msg.parse::<Days>().unwrap()
        ) + contract.calculate_voting_power(
            Meta::from(new_amount) - Meta::from(third_amount),
            new_msg.parse::<Days>().unwrap()
        );
        assert_eq!(voter.voting_power, total_vote_power, "Voting power was not removed!");
    }

    fn generate_relock_position_context() -> MetaVoteContract {
        const LOCKING_PERIOD: u64 = 100;
        let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS);
        let timestamp_1 = to_ts(GENESIS_TIME_IN_DAYS + 5);
        let timestamp_2 = to_ts(GENESIS_TIME_IN_DAYS + 5 + LOCKING_PERIOD);
        let context = get_context(
            meta_token_account(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_0,
        );
        let mut contract = get_contract_setup(context);

        let sender_id: AccountId = voter_account();
        let amount = U128::from(10 * YOCTO_UNITS);
        let msg: String = LOCKING_PERIOD.to_string();
        contract.ft_on_transfer(sender_id.clone(), amount.clone(), msg.clone());

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_1,
        );
        testing_env!(context.clone());
        let index = contract.get_all_locking_positions()
            .first()
            .unwrap()
            .index
            .unwrap();
        contract.unlock_position(index);
        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        assert_eq!(
            locking_position.unlocking_started_at.unwrap(),
            nanos_to_millis(timestamp_1),
            "Incorrect unlocking started at date."
        );
        assert_eq!(
            locking_position.unlocking_started_at.unwrap()
                + locking_position.locking_period_millis(),
            nanos_to_millis(timestamp_2),
            "Incorrect unlocking finish date."
        );
        assert_eq!(
            BalanceJSON::from(0),
            contract.get_locked_balance(),
            "Incorrect locked balance!"
        );
        assert_eq!(
            amount,
            contract.get_unlocking_balance(),
            "Incorrect unlocking balance!"
        );
        contract
    }

    #[test]
    #[should_panic(expected="The new locking period should be greater than 88 days.")]
    fn test_relock_position_1() {
        let mut contract = generate_relock_position_context();
        let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 12);
        let sender_id: AccountId = voter_account();

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_0,
        );
        testing_env!(context.clone());
        contract.relock_position(0, 30, MetaJSON::from(0));
    }

    #[test]
    fn test_relock_position_2() {
        let mut contract = generate_relock_position_context();
        let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 12);
        let sender_id: AccountId = voter_account();

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_0,
        );
        testing_env!(context.clone());
        let index = contract.get_all_locking_positions()
            .first()
            .unwrap()
            .index
            .unwrap();
        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        assert_eq!(voter.voting_power, 0, "Voting power should be 0.");

        let amount = locking_position.amount;
        let locking_period: Days = 89;
        contract.relock_position(0, locking_period, MetaJSON::from(0));

        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        assert_eq!(
            voter.voting_power,
            contract.calculate_voting_power(amount, locking_period),
            "Voting power of Voter is incorrect.");
        assert_eq!(
            BalanceJSON::from(locking_position.amount),
            contract.get_locked_balance(),
            "Incorrect locked balance!"
        );
        assert_eq!(
            BalanceJSON::from(0),
            contract.get_unlocking_balance(),
            "Incorrect unlocking balance!"
        );
        assert!(
            locking_position.unlocking_started_at.is_none(),
            "Unlocking started should be None."
        );
    }

    #[test]
    fn test_relock_position_3() {
        let mut contract = generate_relock_position_context();
        let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 177);
        let sender_id: AccountId = voter_account();

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_0,
        );
        testing_env!(context.clone());
        let index = contract.get_all_locking_positions()
            .first()
            .unwrap()
            .index
            .unwrap();
        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        assert_eq!(voter.voting_power, 0, "Voting power should be 0.");

        let amount = locking_position.amount;
        let locking_period: Days = 30;
        contract.relock_position(0, locking_period, MetaJSON::from(0));

        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        assert_eq!(
            voter.voting_power,
            contract.calculate_voting_power(amount, locking_period),
            "Voting power of Voter is incorrect.");
        assert_eq!(
            BalanceJSON::from(locking_position.amount),
            contract.get_locked_balance(),
            "Incorrect locked balance!"
        );
        assert_eq!(
            BalanceJSON::from(0),
            contract.get_unlocking_balance(),
            "Incorrect unlocking balance!"
        );
        assert!(
            locking_position.unlocking_started_at.is_none(),
            "Unlocking started should be None."
        );
    }

    #[test]
    #[should_panic(expected="The new locking period should be greater than 77 days.")]
    fn test_relock_partial_position_1() {
        let mut contract = generate_relock_position_context();
        let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 23);
        let sender_id: AccountId = voter_account();

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_0,
        );
        testing_env!(context.clone());
        let index = contract.get_all_locking_positions()
            .first()
            .unwrap()
            .index
            .unwrap();
        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        contract.relock_partial_position(
            index,
            MetaJSON::from(
                locking_position.amount - 2 * YOCTO_UNITS
            ),
            30,
            MetaJSON::from(0)
        );
    }

    #[test]
    fn test_relock_partial_position_2() {
        let mut contract = generate_relock_position_context();
        let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 23);
        let sender_id: AccountId = voter_account();

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_0,
        );
        testing_env!(context.clone());
        let index = contract.get_all_locking_positions()
            .first()
            .unwrap()
            .index
            .unwrap();
        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        assert_eq!(voter.voting_power, 0, "Voting power should be 0.");

        let keep_amount = 2 * YOCTO_UNITS;
        let relock_amount = locking_position.amount - keep_amount;
        let locking_period: Days = 89;
        contract.relock_partial_position(
            index,
            MetaJSON::from(relock_amount),
            locking_period,
            MetaJSON::from(0)
        );

        // The Unlocking is index 0, and the Relocked is index 1.
        let index = contract.get_all_locking_positions()
            .last()
            .unwrap()
            .index
            .unwrap();
        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        assert_eq!(voter.locking_positions.len(), 2, "Incorrect locking position.");
        assert_eq!(
            voter.voting_power,
            contract.calculate_voting_power(relock_amount, locking_period),
            "Voting power of Voter is incorrect."
        );
        assert_eq!(
            BalanceJSON::from(relock_amount),
            contract.get_locked_balance(),
            "Incorrect locked balance!"
        );
        assert_eq!(
            BalanceJSON::from(keep_amount),
            contract.get_unlocking_balance(),
            "Incorrect unlocking balance!"
        );
        assert!(
            locking_position.unlocking_started_at.is_none(),
            "Unlocking started should be None."
        );
    }

    #[test]
    fn test_relock_partial_position_3() {
        let mut contract = generate_relock_position_context();
        let timestamp_0 = to_ts(GENESIS_TIME_IN_DAYS + 5 + 177);
        let sender_id: AccountId = voter_account();

        // New context: the voter is doing the call now!
        let context = get_context(
            sender_id.clone(),
            ntoy(TEST_INITIAL_BALANCE),
            0,
            timestamp_0,
        );
        testing_env!(context.clone());
        let index = contract.get_all_locking_positions()
            .first()
            .unwrap()
            .index
            .unwrap();
        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        assert_eq!(voter.voting_power, 0, "Voting power should be 0.");

        let keep_amount = 2 * YOCTO_UNITS;
        let relock_amount = locking_position.amount - keep_amount;
        let locking_period: Days = 30;
        contract.relock_partial_position(
            index,
            MetaJSON::from(relock_amount),
            locking_period,
            MetaJSON::from(0)
        );

        // The Unlocking is index 0, and the Relocked is ALSO index 0.
        let voter = contract.internal_get_voter(&sender_id);
        let locking_position = voter.locking_positions.get(index).unwrap();
        assert_eq!(voter.locking_positions.len(), 1, "Incorrect locking position.");
        assert_eq!(
            voter.voting_power,
            contract.calculate_voting_power(relock_amount, locking_period),
            "Voting power of Voter is incorrect."
        );
        assert_eq!(
            voter.balance,
            keep_amount,
            "Voter balance is incorrect."
        );
        assert_eq!(
            BalanceJSON::from(keep_amount),
            contract.get_balance(),
            "Incorrect free balance!"
        );
        assert_eq!(
            BalanceJSON::from(relock_amount),
            contract.get_locked_balance(),
            "Incorrect locked balance!"
        );
        assert_eq!(
            BalanceJSON::from(0),
            contract.get_unlocking_balance(),
            "Incorrect unlocking balance!"
        );
        assert!(
            locking_position.unlocking_started_at.is_none(),
            "Unlocking started should be None."
        );

        contract.unlock_position(index);
        // WIP -----------------------------
    }

    // fn test_relock_partial_position()

    // fn test_relock_from_balance()
}
