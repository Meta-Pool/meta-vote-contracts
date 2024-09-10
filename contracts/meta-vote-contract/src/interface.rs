use near_sdk::json_types::U128;
use near_sdk::{ext_contract, AccountId, Gas};

use crate::TGAS;

pub const GAS_FOR_GOVERNANCE_MIGRATION: Gas = Gas(125 * TGAS); // reduced from 200 to 125, to accommodate 2FA near contract that uses (250 TGas)
pub const GAS_FOR_RESOLVE_GOVERNANCE_MIGRATION: Gas = Gas(10 * TGAS);

#[ext_contract(ext_ft)]
pub trait FungibleTokenCore {
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    );

    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
}

#[ext_contract(ext_new_gov_contract)]
pub trait Migration {
    fn migration_create_lps(
        &mut self,
        voter_id: AccountId,
        locking_positions: Vec<(U128, u16)>,
        associated_user_data: Option<String>
    ); // tuple Vec is (amount,unbound_days)
}

#[ext_contract(ext_self)]
pub trait SelfMetaVote {
    fn after_transfer_meta_callback(&mut self, voter_id: AccountId, amount: U128);
    fn after_migration(&mut self);
}