use crate::*;
use near_sdk::{near_bindgen};

#[near_bindgen]
impl MetaVoteContract {
    /// Inner method to get or create a Voter.
    pub(crate) fn internal_get_voter(&self, voter_id: &VoterId) -> Voter {
        self.voters.get(voter_id).unwrap_or(Voter::new(voter_id))
    }
}