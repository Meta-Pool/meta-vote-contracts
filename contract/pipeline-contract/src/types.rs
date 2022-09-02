use uint::construct_uint;
use near_sdk::{AccountId, Balance};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::json_types::U128;

pub type VoterId = AccountId;
pub type VotingPower = u128;
pub type Days = u16;
pub type Meta = Balance;
pub type ContractAddress = AccountId;
pub type VotableObjId = String;
pub type EpochMillis = u64;
pub type PositionIndex = u64;

construct_uint! {
    /// 256-bit unsigned integer.
    pub struct U256(4);
}

// #[derive(Serialize, Deserialize)]
// #[serde(crate = "near_sdk::serde")]
// pub struct VotableObjectJSON {
//     pub votable_contract: ContractAddressJSON,
//     pub id: VotableObjId,
//     pub current_votes: VotingPowerJSON
// }
