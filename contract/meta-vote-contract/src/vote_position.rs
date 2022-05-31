use crate::*;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct VotePosition {
    pub amount: VotePower,
    pub votable_contract: String,
    pub votable_id: u64,
}