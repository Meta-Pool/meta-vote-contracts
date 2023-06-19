use uint::construct_uint;
use near_sdk::{AccountId, Balance};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

pub type MpipId = u32;

pub type VoterId = AccountId;
pub type VotingPower = u128;
pub type Days = u16;
pub type Meta = Balance;
pub type ContractAddress = AccountId;
pub type VotableObjId = String;
pub type EpochMillis = u64;
pub type PositionIndex = u64;
pub type BasisPoints = u32;

construct_uint! {
    /// 256-bit unsigned integer.
    pub struct U256(4);
}