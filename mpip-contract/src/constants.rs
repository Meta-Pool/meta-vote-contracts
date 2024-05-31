use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{BorshStorageKey, CryptoHash, Gas};

pub const TGAS: u64 = 1_000_000_000_000;

pub const ONE_HUNDRED: u16 = 10_000;

/// Amount of gas for fungible token transfers.
pub const GAS_FOR_GET_VOTING_POWER: Gas = Gas(10 * TGAS);
pub const GAS_FOR_RESOLVE_VOTE: Gas = Gas(11 * TGAS);

#[derive(BorshSerialize, BorshDeserialize, BorshStorageKey)]
pub enum StorageKey {
    Mpips,
    HasVoted{ hash_id: CryptoHash },
    MpipVotes,
    Voters,
    Proposers,
    Votes { hash_id: CryptoHash },
}