#![allow(unused_imports)]
#![allow(unused_variables)]
#![allow(dead_code)]

use near_sdk::{AccountId, MockedBlockchain, PromiseResult, VMContext, Balance, PublicKey, Gas};

use crate::constants::YOCTO_UNITS;
use crate::types::*;

pub const LOCKUP_NEAR: u128 = 1000;
pub const GENESIS_TIME_IN_DAYS: u64 = 500;
pub const YEAR: u64 = 365;
pub const TEST_INITIAL_BALANCE: u128 = 100;

pub const MIN_LOCKING_PERIOD: Days = 30;
pub const MAX_LOCKING_PERIOD: Days = 300;
pub const MIN_DEPOSIT_AMOUNT: Balance = 1 * YOCTO_UNITS;
pub const MAX_LOCKING_POSITIONS: u8 = 20;
pub const MAX_VOTING_POSITIONS: u8 = 100;

pub fn system_account() -> AccountId {
    AccountId::new_unchecked("system.metavote.near".to_string())
}

pub fn contract_account() -> AccountId {
    AccountId::new_unchecked("contract.metavote.near".to_string())
}

pub fn treasury_account() -> AccountId {
    AccountId::new_unchecked("treasury.metavote.near".to_string())
}

pub fn owner_account() -> AccountId {
    AccountId::new_unchecked("owner.metavote.near".to_string())
}

pub fn non_owner() -> AccountId {
    AccountId::new_unchecked("non_owner.metavote.near".to_string())
}

pub fn developer_account() -> AccountId {
    AccountId::new_unchecked("developer.metavote.near".to_string())
}

pub fn operator_account() -> AccountId {
    AccountId::new_unchecked("operator.metavote.near".to_string())
}

pub fn meta_token_account() -> AccountId {
    AccountId::new_unchecked("meta-token.metavote.near".to_string())
}

pub fn voter_account() -> AccountId {
    AccountId::new_unchecked("voter.metavote.near".to_string())
}

pub fn votable_account() -> AccountId {
    AccountId::new_unchecked("votable.metavote.near".to_string())
}

pub fn ntoy(near_amount: u128) -> u128 {
    return near_amount * 10u128.pow(24)
}

pub fn yton(yoctos_amount: u128) -> f64 {
    return yoctos_amount as f64 / 10u128.pow(24) as f64
}
//convert yocto to f64 NEAR truncate to 4 dec places
pub fn ytof(yoctos_amount: u128) -> f64 {
    let four_dec_f:f64 = ((yoctos_amount / 10u128.pow(20)) as u32).into();
    return four_dec_f / 10000.0;
}

pub fn to_nanos(num_days: u64) -> u64 {
    return num_days * 86400_000_000_000
}

#[inline]
pub fn nanos_to_millis(nanoseconds: u64) -> EpochMillis {
    nanoseconds / 1_000_000
}

pub fn to_ts(num_days: u64) -> u64 {
    // 2018-08-01 UTC in nanoseconds
    1533081600_000_000_000 + to_nanos(num_days)
}

pub fn assert_almost_eq_with_max_delta(left: u128, right: u128, max_delta: u128) {
    assert!(
        std::cmp::max(left, right) - std::cmp::min(left, right) < max_delta,
        "Left {} is not even close to Right {} within delta {}",
        left, right, max_delta
    );
}

pub fn assert_almost_eq(left: u128, right: u128) {
    assert_almost_eq_with_max_delta(left, right, ntoy(10));
}

pub fn get_context(
    predecessor_account_id: AccountId,
    account_balance: u128,
    account_locked_balance: u128,
    block_timestamp: u64,
) -> VMContext {
    let ed: PublicKey = "ed25519:6E8sCci9badyRkXb3JoRpBj5p8C6Tw41ELDZoiihKEtp"
        .parse()
        .unwrap();
    let seed: [u8; 32] = [0; 32];
    VMContext {
        current_account_id: contract_account(),
        signer_account_id: predecessor_account_id.clone(),
        signer_account_pk: ed,
        predecessor_account_id,
        input: vec![],
        block_index: 1,
        block_timestamp,
        epoch_height: 1,
        account_balance,
        account_locked_balance,
        storage_usage: 10u64.pow(6),
        attached_deposit: 0,
        prepaid_gas: Gas(10u64.pow(15)),
        random_seed: seed,
        view_config: None,
        output_data_receivers: Vec::new()
    }
}
