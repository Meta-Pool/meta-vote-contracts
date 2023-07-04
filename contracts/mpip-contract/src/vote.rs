use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use crate::types::{MpipId, VoterId};

/// Vote Types
#[derive(Serialize, Deserialize, Debug, BorshDeserialize, BorshSerialize, Clone, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub enum VoteType {
    Against,
    For,
    Abstain
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct VoteJson {
    pub mpip_id: MpipId,
    pub voter_id: VoterId,
    pub vote_type: VoteType,
    pub voting_power: U128,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, PartialEq, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Vote {
    pub mpip_id: MpipId,
    pub vote_type: VoteType,
    pub voting_power: u128,
}

impl Vote {
    pub(crate) fn new(mpip_id: MpipId, _vote_type: VoteType, _voting_power: u128) -> Self {
        Vote {
            mpip_id,
            vote_type: _vote_type,
            voting_power: _voting_power
        }
    }
    pub(crate) fn to_json(&self, voter_id: VoterId) -> VoteJson {
        VoteJson {
            mpip_id: self.mpip_id.clone(),
            voter_id: voter_id.clone(),
            vote_type: self.vote_type.clone(),
            voting_power: U128::from(self.voting_power),
        }
    }
}

// impl Deref for Vote {
//     type Target = MpipId;

//     fn deref(&self) -> &Self::Target {
//         &self.mpip_id
//     }
// }