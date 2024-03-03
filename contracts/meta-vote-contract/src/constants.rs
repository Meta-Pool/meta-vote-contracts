use near_sdk::{BorshStorageKey, Gas, CryptoHash};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

pub const E24: u128 = 1_000_000_000_000_000_000_000_000;
pub const YOCTO_UNITS: u128 = E24;
pub const TGAS: u64 = 1_000_000_000_000;

/// Amount of gas for fungible token transfers.
pub const GAS_FOR_FT_TRANSFER: Gas = Gas(47 * TGAS);
pub const GAS_FOR_RESOLVE_TRANSFER: Gas = Gas(11 * TGAS);

#[derive(BorshSerialize, BorshDeserialize, BorshStorageKey)]
pub enum StorageKey {
    LockingPosition { hash_id: CryptoHash },
    VotePosition { hash_id: CryptoHash },
    Voters,
    Votes,
    ContractVotes { hash_id: CryptoHash },
    VoterVotes { hash_id: CryptoHash },
    Claimable,
    ClaimableStNear,
    AirdropData,
    MigratedUsers
}

