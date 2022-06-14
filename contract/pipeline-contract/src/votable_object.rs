use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

use geo_types::coord;
use geo_types::Coordinate;

// let c = coord! {
//     x: 40.02f64,
//     y: 116.34,
// };
// let (x, y) = c.x_y();

// assert_eq!(y, 116.34);
// assert_eq!(x, 40.02f64);

#[derive(BorshDeserialize, BorshSerialize)]
pub struct VotableObject {
    pub votable_contract: ContractAddress,
    pub id: VotableObjId,
    pub expiration: EpochMillis,
    pub location: Coordinate,

    pub official_result: Option<VotingPower>,
    pub votes_collected_at: Option<EpochMillis>,

}

// impl VotableObject {

// }