use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

// /////////////////
// Comment struct //
// /////////////////

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct CommentJSON {
    pub voter_id: AccountId,
    pub locking_positions: Vec<LockingPositionJSON>,
    pub voting_power: U128,
    pub vote_positions: Vec<VotePositionJSON>
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Comment {
    pub text: String,
    pub extra: String,
    // TODO: What's the difference between AccountId and Account?
    pub owner_id: AccountId,
    pub mpip_id: MpipId
}

// //////////////
// MPIP struct //
// //////////////

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct MpipJSON {
    pub voter_id: AccountId,
    pub locking_positions: Vec<LockingPositionJSON>,
    pub voting_power: U128,
    pub vote_positions: Vec<VotePositionJSON>
}

/// **Mpip Status flow**:
/// 
/// ```txt
/// |
/// | -- flow to right -->
/// |                                     .-->|Accepted|
/// |-----|In Review|--->|Voting Period|-< 
/// |                                     *-->|Rejected|
/// ```
/// 
/// The unique and secuential `id` is asigned to the new Mpip candidate
/// when the voting period starts. 

pub enum MpipStatus {
    InReview,
    VotingPeriod,
    Accepted,
    Rejected
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Mpip {
    /// The `mpip_id` is asigned only if the idea is pushed to a voting and evaluation period.
    pub id: Option<MpipId>,
    pub title: String,
    pub description: String,
    pub comments: Vector<Comment>,
    pub data: Option<String>,
    pub extra: Option<String>,

    /// The account that created the pre-voting-period Mpip.
    pub creator_id: Account,

    /// The account that submit the Mpip to a voting period.
    pub publisher_id: Option<Account>,

    /// The account that first closed the voting period.
    pub closer_id: Option<Account>,
}

impl Mpip {
    pub(crate) fn new() -> Self {
        Self {

        }
    }

    pub(crate) fn to_json(&self, voter_id: VoterId) -> VoterJSON {
        let mut locking_positions = Vec::<LockingPositionJSON>::new();
        for index in 0..self.locking_positions.len() {
            let pos = self.locking_positions.get(index).unwrap();
            locking_positions.push(pos.to_json(Some(index)));
        }

        let mut vote_positions = Vec::<VotePositionJSON>::new();
        for address in self.vote_positions.keys_as_vector().iter() {
            let pos = self.vote_positions.get(&address).unwrap();
            for obj in pos.keys_as_vector().iter() {
                let value = pos.get(&obj).unwrap();
                vote_positions.push(
                    VotePositionJSON {
                        votable_address: address.clone(),
                        votable_object_id: obj,
                        voting_power: U128::from(value)
                    }
                );
            }
        }

        VoterJSON {
            voter_id,
            locking_positions,
            voting_power: U128::from(self.voting_power),
            vote_positions
        }
    }
}
