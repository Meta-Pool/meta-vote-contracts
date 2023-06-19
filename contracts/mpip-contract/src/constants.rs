use near_sdk::{BorshStorageKey, Gas};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

pub const YOCTO_UNITS: u128 = 1_000_000_000_000_000_000_000_000;
pub const TGAS: u64 = 1_000_000_000_000;

/// Amount of gas for fungible token transfers.
pub const GAS_FOR_FT_TRANSFER: Gas = Gas(47 * TGAS);
pub const GAS_FOR_RESOLVE_TRANSFER: Gas = Gas(11 * TGAS);
pub const GAS_FOR_GET_VOTING_POWER: Gas = Gas(10 * TGAS);
pub const GAS_FOR_VOTE: Gas = Gas( 200 * TGAS);
pub const GAS_FOR_RESOLVE_VOTE: Gas = Gas(11 * TGAS);

#[derive(BorshSerialize, BorshDeserialize, BorshStorageKey)]
pub enum StorageKey {
    Mpips,
    HasVoted,
    MpipVotes
}