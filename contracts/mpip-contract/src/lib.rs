use std::thread::available_parallelism;

use crate::constants::*;
use crate::interface::*;
use interface::ext_metavote::ext;
use mpip::Mpip;
use mpip::MpipJSON;
use mpip::MpipState;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::unordered_map::UnorderedMap;
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, require, AccountId, Balance, PanicOnDefault};
use types::*;
use utils::{days_to_millis, get_current_epoch_millis};
use vote::{Vote, VoteType};
use vote_counting::{ProposalVote, ProposalVoteJson};

mod constants;
mod deposit;
mod interface;
mod internal;
mod mpip;
mod types;
mod utils;
mod vote;
mod vote_counting;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct MpipContract {
    pub admin_id: AccountId,
    pub operator_id: AccountId,
    pub meta_token_contract_address: ContractAddress,
    pub meta_vote_contract_address: ContractAddress,
    pub mpips: UnorderedMap<MpipId, Mpip>,

    /// Duration of the voting period.
    pub voting_period: Days,

    // Delay in milliseconds between the proposal is Active (reviewed and accepted by manager)
    // an the vote starts.
    // This can be increased to leave time for users to buy voting power, or delegate it, before the voting of a proposal starts.
    pub voting_delay_millis: EpochMillis,

    /// Parameters to allow an Account to create a new MPIP. (proposal tresholds)
    pub min_meta_amount: Balance,
    pub min_st_near_amount: Balance,
    pub min_voting_power_amount: VotingPower,

    /// Cost of committing a new MPIP. Meta is burned. Near is for storage.
    pub mpip_cost_in_meta: Balance,
    pub mpip_storage_near_cost_per_kilobytes: Balance,

    /// The creation of new MPIPs could be stopped.
    pub open_for_new_mpips: bool,

    /// Minimum number of $META circulating supply required for a governing body to approve a proposal.
    /// If a quorum is set to 50%, this means that 50% of all circulating $META need to vote yes for the proposal to pass.
    // Percent is denominated in basis points 100% equals 10_000 basis points.
    pub quorum_floor: BasisPoints,

    pub mpip_votes: UnorderedMap<MpipId, ProposalVote>,
}

#[near_bindgen]
impl MpipContract {
    #[init]
    pub fn new(
        admin_id: AccountId,
        operator_id: AccountId,
        meta_token_contract_address: ContractAddress,
        meta_vote_contract_address: ContractAddress,
        voting_period: Days,
        voting_delay_millis: EpochMillis,
        min_meta_amount: U128,
        min_st_near_amount: U128,
        min_voting_power_amount: U128,
        mpip_cost_in_meta: U128,
        mpip_storage_near_cost_per_kilobytes: U128,
        quorum_floor: BasisPoints,
    ) -> Self {
        require!(!env::state_exists(), "The contract is already initialized");
        Self {
            admin_id,
            operator_id,
            meta_token_contract_address,
            meta_vote_contract_address,
            mpips: UnorderedMap::new(StorageKey::Mpips),
            voting_period,
            voting_delay_millis,
            min_meta_amount: min_meta_amount.0,
            min_st_near_amount: min_st_near_amount.0,
            min_voting_power_amount: min_voting_power_amount.0,
            mpip_cost_in_meta: mpip_cost_in_meta.0,
            mpip_storage_near_cost_per_kilobytes: mpip_storage_near_cost_per_kilobytes.0,
            open_for_new_mpips: true,
            quorum_floor,
            mpip_votes: UnorderedMap::new(StorageKey::MpipVotes),
        }
    }

    // *********
    // * Admin *
    // *********

    /// Stop/Re-activate the submission of new MPIPs.
    pub fn update_open_for_new_mpips(&mut self, new_value: bool) {
        self.assert_only_admin();
        self.open_for_new_mpips = new_value;
    }

    /// Update the Operator role.
    pub fn update_operator_role(&mut self, new_value: AccountId) {
        self.assert_only_admin();
        self.operator_id = new_value;
    }

    /// Update the Admin role.
    pub fn update_admin_role(&mut self, new_value: AccountId) {
        self.assert_only_admin();
        self.admin_id = new_value;
    }

    // ************
    // * Operator *
    // ************

    /// Update the voting period duration in days.
    pub fn update_voting_period(&mut self, new_value: Days) {
        self.assert_only_operator();
        self.voting_period = new_value;
    }

    /// Update minimum Meta amount to submit a MPIP.
    pub fn update_min_meta_amount(&mut self, new_value: U128) {
        self.assert_only_operator();
        self.min_meta_amount = new_value.0;
    }

    /// Update minimum stNEAR amount to submit a MPIP.
    pub fn update_min_st_near_amount(&mut self, new_value: U128) {
        self.assert_only_operator();
        self.min_st_near_amount = new_value.0;
    }

    /// Update minimum voting power to submit a MPIP.
    pub fn update_min_voting_power_amount(&mut self, new_value: U128) {
        self.assert_only_operator();
        self.min_voting_power_amount = new_value.0;
    }

    /// Update the cost in Meta to submit a MPIP.
    pub fn update_mpip_cost_in_meta(&mut self, new_value: U128) {
        self.assert_only_operator();
        self.mpip_cost_in_meta = new_value.0;
    }

    /// Update the storage cost per kilobytes in Near to submit a MPIP.
    pub fn update_mpip_storage_near_cost_per_kilobytes(&mut self, new_value: U128) {
        self.assert_only_operator();
        self.mpip_storage_near_cost_per_kilobytes = new_value.0;
    }

    /// Update quorum floor: percent of all voting power need to vote yes for the proposal to pass.
    pub fn update_quorum_floor(&mut self, new_value: U128) {
        self.assert_only_operator();
        self.quorum_floor = new_value.0 as u32;
    }

    pub fn start_voting_period(&mut self, mpip_id: MpipId, comments: String) {
        self.assert_only_operator();
        self.assert_proposal_is_active(mpip_id);
        let mut proposal = self.internal_get_proposal(mpip_id);
        // dump comments into the proposal
        // proposal.comments = comments;
        let now = get_current_epoch_millis();
        proposal.vote_start_timestamp = Some(now);
        proposal.vote_end_timestamp = Some(now + days_to_millis(self.voting_period));
        self.mpips.insert(&mpip_id, &proposal);
    }

    // *********
    // * Proposal creators functions *
    // *********

    /// Creates a new proposal
    pub fn create_proposal(
        &mut self,
        title: String,
        short_description: String,
        body: String,
        data: String,
        extra: String,
    ) {
        ext_metavote::ext(self.meta_vote_contract_address.clone())
            .with_static_gas(GAS_FOR_GET_VOTING_POWER)
            .with_attached_deposit(1)
            .get_available_voting_power(env::predecessor_account_id())
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(GAS_FOR_RESOLVE_VOTE)
                    .private_create_proposal(title, short_description, body, data, extra),
            );
    }

    #[private]
    pub fn private_create_proposal(
        &mut self,
        title: String,
        short_description: String,
        body: String,
        data: String,
        extra: String,
    ) {
        let available_v_power = self.get_available_voting_power_from_promise();
        self.assert_proposal_treshold(available_v_power);
        self.assert_open_for_new_mpips();
        let id = self.mpips.len() as MpipId;
        self.internal_create_proposal(id, title, short_description, body, data, extra);
    }

    pub fn cancel_proposal(&mut self, mpip_id: MpipId) {
        self.assert_only_operator_or_creator(mpip_id);
        self.assert_proposal_is_active(mpip_id);
        let mut proposal = self.internal_get_proposal(mpip_id);
        proposal.canceled = true;
        self.mpips.insert(&mpip_id, &proposal);
    }

    // *********
    // * View functions *
    // *********

    /// Check proposal threshold:
    /// if acccount has the minimum Voting Power to participate in Governance.
    pub fn check_proposal_treshold(&self, account_id: AccountId, voting_power: U128) -> bool {
        self.internal_check_proposal_treshold(voting_power.0)
    }

    pub fn get_proposal_votes(&self, mpip_id: MpipId) -> ProposalVoteJson {
        let proposal_vote = self.internal_get_proposal_vote(mpip_id);
        proposal_vote.to_json()
    }

    pub fn get_quorum_reached(&self, mpip_id: MpipId, total_voting_power: U128) -> bool {
        self.assert_only_operator();
        // self.assert_proposal_is_on_voting(mpip_id);
        self.internal_is_quorum_reached(mpip_id, total_voting_power.0)
    }

    pub fn get_proposal_vote_succeeded(&self, mpip_id: MpipId) -> bool {
        let proposal_vote = self.internal_get_proposal_vote(mpip_id);
        proposal_vote.for_votes > proposal_vote.against_votes
    }

    pub fn get_proposal_state(&self, mpip_id: MpipId, total_voting_power: U128) -> MpipState {
        self.internal_get_proposal_state(mpip_id, total_voting_power.0)
    }

    pub fn get_proposal(&self, mpip_id: MpipId) -> MpipJSON {
        let proposal = self.internal_get_proposal(mpip_id);
        proposal.to_json()
    }

    pub fn get_proposals(&self) -> Vec<MpipJSON> {
        let mut result = Vec::new();
        for (_id, proposal) in self.mpips.iter() {
            result.push(proposal.to_json());
        }
        result
    }

    // *********
    // * VOTER FUNCTIONS *
    // *********

    pub fn vote_proposal(&mut self, mpip_id: MpipId, vote: VoteType, voting_power: U128) {
        self.assert_vote_active(mpip_id);
        self.assert_has_not_voted(mpip_id, env::predecessor_account_id());
        ext_metavote::ext(self.meta_vote_contract_address.clone())
            .with_static_gas(GAS_FOR_GET_VOTING_POWER)
            .with_attached_deposit(1)
            .get_available_voting_power(env::predecessor_account_id())
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(GAS_FOR_RESOLVE_VOTE)
                    .private_vote_proposal(
                        mpip_id,
                        voting_power.clone(),
                        env::predecessor_account_id(),
                        vote,
                    ),
            );
    }

    #[private]
    pub fn private_vote_proposal(
        &mut self,
        mpip_id: u32,
        voting_power: U128,
        account_id: AccountId,
        vote_type: VoteType,
    ) {
        let available_v_power = self.get_available_voting_power_from_promise();
        self.assert_has_not_voted(mpip_id, account_id.clone());
        assert!(
            available_v_power >= voting_power.0,
            "Not enough free voting power to vote! You have {}, required {}.",
            available_v_power,
            voting_power.0
        );
        let mut proposal_vote = self.internal_get_proposal_vote(mpip_id);
        // let vote = Vote::new(vote_type.clone(), voting_power);
        let vote = Vote::new(vote_type.clone(), voting_power.0);

        proposal_vote.has_voted.insert(&account_id, &vote);

        match vote_type {
            VoteType::For => {
                proposal_vote.for_votes += voting_power.0;
            }
            VoteType::Against => {
                proposal_vote.against_votes += voting_power.0;
            }
            VoteType::Abstain => {
                proposal_vote.abstain_votes += voting_power.0;
            }
            _ => env::panic_str("Vote is not one of the valid options!"),
        }

        self.mpip_votes.insert(&mpip_id, &proposal_vote);
    }

    pub fn remove_vote_proposal(&mut self, mpip_id: MpipId) {
        self.assert_vote_active(mpip_id);
        self.assert_has_voted(mpip_id, env::predecessor_account_id());
        let mut proposal_vote = self.internal_get_proposal_vote(mpip_id);
        let user_vote = proposal_vote
            .has_voted
            .get(&env::predecessor_account_id())
            .unwrap();

        match user_vote.vote_type {
            VoteType::For => {
                proposal_vote.for_votes -= user_vote.voting_power;
            }
            VoteType::Against => {
                proposal_vote.against_votes -= user_vote.voting_power;
            }
            VoteType::Abstain => {
                proposal_vote.abstain_votes -= user_vote.voting_power;
            }
            _ => env::panic_str("Vote is not one of the valid options!"),
        }
        proposal_vote
            .has_voted
            .remove(&env::predecessor_account_id());
        self.mpip_votes.insert(&mpip_id, &proposal_vote);
    }

    pub fn has_voted(&self, account_id: AccountId, mpip_id: MpipId) -> bool {
        self.internal_has_voted(mpip_id, account_id)
    }

    pub fn get_my_vote(&self, mpip_id: MpipId) -> Option<Vote> {
        let proposal_vote = self.internal_get_proposal_vote(mpip_id);
        proposal_vote.has_voted.get(&env::predecessor_account_id())
    }

    // *********
    // * BOT FUNCTIONS *
    // *********

    pub fn process_voting_status(&mut self, mpip_id: MpipId, total_voting_power: U128) {
        self.assert_only_operator();
        if !self.internal_proposal_is_on_voting(mpip_id) {
            return;
        }
        let mut proposal = self.internal_get_proposal(mpip_id);
        if get_current_epoch_millis() >= proposal.vote_end_timestamp.unwrap() {
            if self.internal_is_quorum_reached(mpip_id, total_voting_power.0) {
                // TODO EXECUTE
                proposal.executed = true;
                self.mpips.insert(&mpip_id, &proposal);
            }
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests;
