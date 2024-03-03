use near_sdk::json_types::U128;
use near_sdk::{ext_contract, AccountId, Gas};

use crate::TGAS;

pub const GAS_FOR_MIGRATION: Gas = Gas(200 * TGAS);
pub const GAS_FOR_RESOLVE_MIGRATION: Gas = Gas(10 * TGAS);

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
    ); // tuple Vec is (amount,unbound_days)
}

#[ext_contract(ext_self)]
pub trait SelfMetaVote {
    fn after_transfer_meta_callback(&mut self, voter_id: AccountId, amount: U128);
    fn after_migration(&mut self);
}
