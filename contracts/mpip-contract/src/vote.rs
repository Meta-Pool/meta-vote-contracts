use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};

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
    pub vote_type: VoteType,
    pub voting_power: U128,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Vote {
    pub vote_type: VoteType,
    pub voting_power: u128,
}


impl Vote {
    pub(crate) fn new(_vote_type: VoteType, _voting_power: u128) -> Self {
        Vote {
            vote_type: _vote_type,
            voting_power: _voting_power
        }
    }
    pub(crate) fn to_json(&self) -> VoteJson {
        VoteJson {
            vote_type: self.vote_type.clone(),
            voting_power: U128::from(self.voting_power),
        }
    }
}
