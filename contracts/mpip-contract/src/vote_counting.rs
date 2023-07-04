use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

// /////////////////
// Comment struct //
// /////////////////

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct ProposalVoteJson {
    pub for_votes: U128,
    pub against_votes: U128,
    pub abstain_votes: U128,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct ProposalVote {
    pub for_votes: u128,
    pub against_votes: u128,
    pub abstain_votes: u128,
    pub has_voted: UnorderedMap<VoterId, Vote>,
}

impl ProposalVote {
    pub(crate) fn new() -> Self {
        ProposalVote {
            for_votes: 0,
            against_votes: 0,
            abstain_votes: 0,
            has_voted: UnorderedMap::new(StorageKey::HasVoted),
        }
    }

    pub(crate) fn to_json(&self) -> ProposalVoteJson {
        ProposalVoteJson {
            for_votes: U128::from(self.for_votes),
            abstain_votes: U128::from(self.abstain_votes),
            against_votes: U128::from(self.against_votes),
        }
    }
}