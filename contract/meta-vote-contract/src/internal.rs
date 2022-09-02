use crate::*;
use near_sdk::near_bindgen;

#[near_bindgen]
impl MetaVoteContract {
    pub(crate) fn assert_only_owner(&self) {
        require!(
            self.owner_id == env::predecessor_account_id(),
            "Only the owner can call this function."
        );
    }

    /// Inner method to get or create a Voter.
    pub(crate) fn internal_get_voter(&self, voter_id: &VoterId) -> Voter {
        self.voters.get(voter_id).unwrap_or(Voter::new(voter_id))
    }

    fn internal_get_total_votes_for_address(
        &self,
        contract_address: &ContractAddress
    ) -> UnorderedMap<VotableObjId, VotingPower> {
        self.votes
        .get(&contract_address)
        .unwrap_or(
            UnorderedMap::new(
                StorageKey::ContractVotes {
                    hash_id: generate_hash_id(contract_address.to_string())
                }
            )
        )
    }

    pub(crate) fn internal_increase_total_votes(
        &mut self,
        voting_power: VotingPower,
        contract_address: &ContractAddress,
        votable_object_id: &VotableObjId
    ) {
        let mut votes_for_address = self.internal_get_total_votes_for_address(&contract_address);
        let mut votes = votes_for_address.get(&votable_object_id).unwrap_or(0_u128);
        votes += voting_power;

        votes_for_address.insert(&votable_object_id, &votes);
        self.votes.insert(&contract_address, &votes_for_address);
    }

    pub(crate) fn internal_decrease_total_votes(
        &mut self,
        voting_power: VotingPower,
        contract_address: &ContractAddress,
        votable_object_id: &VotableObjId
    ) {
        let mut votes_for_address = self.internal_get_total_votes_for_address(&contract_address);
        let mut votes = votes_for_address.get(&votable_object_id)
            .expect("Cannot decrease if the Contract Address has no Votable Object.");
        require!(votes >= voting_power, "Decreasing total is too large.");
        votes -= voting_power;

        if votes == 0 {
            votes_for_address.remove(&votable_object_id);
        } else {
            votes_for_address.insert(&votable_object_id, &votes);
        }

        if votes_for_address.is_empty() {
            self.votes.remove(&contract_address);
        } else {
            self.votes.insert(&contract_address, &votes_for_address);
        }
    }
}