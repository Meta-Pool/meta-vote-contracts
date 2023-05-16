use crate::utils::{days_to_millis, millis_to_days};
use crate::constants::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::Vector;
use near_sdk::collections::unordered_map::UnorderedMap;
use near_sdk::json_types::U128;
use near_sdk::{env, log, near_bindgen, AccountId, Balance, PanicOnDefault, require};
use types::*;
use utils::{generate_hash_id, get_current_epoch_millis};
use mpip::{Mpip, MpipJSON};

mod constants;
mod deposit;
mod internal;
mod types;
mod utils;
mod mpip;
mod interface;

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

    /// Parameters to allow an Account to create a new MPIP.
    pub min_meta_amount: Balance,
    pub min_st_near_amount: Balance,
    pub min_voting_power_amount: VotingPower,

    /// Cost of committing a new MPIP. Meta is burned. Near is for storage.
    pub mpip_cost_in_meta: Balance,
    pub mpip_storage_near_cost_per_kilobytes: Balance,

    /// The creation of new MPIPs could be stopped.
    pub open_for_new_mpips: bool,
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
        min_meta_amount: U128,
        min_st_near_amount: U128,
        min_voting_power_amount: U128,
        mpip_cost_in_meta: U128,
        mpip_storage_near_cost_per_kilobytes: U128,
    ) -> Self {
        require!(!env::state_exists(), "The contract is already initialized");
        Self {
            admin_id,
            operator_id,
            meta_token_contract_address,
            meta_vote_contract_address,
            mpips: UnorderedMap::new(StorageKey::Mpips),
            voting_period,
            min_meta_amount: min_meta_amount.0,
            min_st_near_amount: min_st_near_amount.0,
            min_voting_power_amount: min_voting_power_amount.0,
            mpip_cost_in_meta: mpip_cost_in_meta.0,
            mpip_storage_near_cost_per_kilobytes: mpip_storage_near_cost_per_kilobytes.0,
            open_for_new_mpips: true,
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

    // *********
    // * MPIPs *
    // *********

    /// Check if account has the minimum META tokens to participate in Governance.
    pub fn check_min_meta_amount(&self, account: AccountId) -> bool {
        todo!();
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests;