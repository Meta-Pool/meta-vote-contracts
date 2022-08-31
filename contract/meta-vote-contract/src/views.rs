use crate::MetaVoteContract;
use crate::types::*;
use near_sdk::json_types::U128;

/**********************/
/*   View functions   */
/**********************/

impl MetaVoteContract {
    pub fn get_all_locking_positions(
        &self,
        voter_id: VoterId
    ) -> Vec<LockingPositionJSON> {
        let mut result = Vec::new();
        let voter = self.internal_get_voter(&voter_id);
        for index in 0..voter.locking_positions.len() {
            let locking_position = voter.locking_positions.get(index)
                .expect("Locking position not found!");
            result.push(
                locking_position.to_json(Some(index))
            );
        }
        result
    }

    pub fn get_locking_position(
        &self,
        index: PositionIndex,
        voter_id: VoterId
    ) -> Option<LockingPositionJSON> {
        let voter = self.internal_get_voter(&voter_id);
        match voter.locking_positions.get(index) {
            Some(locking_position) => Some(locking_position.to_json(Some(index))),
            None => None,
        }
    }

    pub fn get_balance(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        let balance = voter.balance + voter.sum_unlocked();
        U128::from(balance)
    }

    pub fn get_locked_balance(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        U128::from(voter.sum_locked())
    }

    pub fn get_unlocking_balance(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        U128::from(voter.sum_unlocking())
    }

    pub fn get_available_voting_power(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        U128::from(voter.voting_power)
    }

    pub fn get_used_voting_power(&self, voter_id: VoterId) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        U128::from(voter.sum_used_votes())
    }

    pub fn get_total_votes(
        &self,
        contract_address: ContractAddress,
        votable_object_id: VotableObjId
    ) -> U128 {
        let votes = match self.votes.get(&contract_address) {
            Some(object) => {
                object.get(&votable_object_id).unwrap_or(0_u128)
            },
            None => 0_u128,
        };
        U128::from(votes)
    }

    pub fn get_votes_by_contract(
        &self,
        contract_address: ContractAddress
    ) -> Vec<VotableObjectJSON> {
        let objects = self.votes.get(&contract_address)
            .expect("Contract Address not in Meta Vote.");
        let mut results: Vec<VotableObjectJSON> = Vec::new();
        for (id, voting_power) in objects.iter() {
            results.push(
                VotableObjectJSON {
                    votable_contract: contract_address.to_string(),
                    id,
                    current_votes: U128::from(voting_power)
                }
            )
        }
        results.sort_by_key(|v| v.current_votes.0);
        results
    }

    pub fn get_votes_by_voter(
        &self,
        voter_id: VoterId
    ) -> Vec<VotableObjectJSON> {
        let mut results: Vec<VotableObjectJSON> = Vec::new();
        let voter = self.internal_get_voter(&voter_id);
        for contract_address in voter.vote_positions.keys_as_vector().iter() {
            let votes_for_address = voter.vote_positions.get(&contract_address).unwrap();
            for (id, voting_power) in votes_for_address.iter() {
                results.push(
                    VotableObjectJSON {
                        votable_contract: contract_address.to_string(),
                        id,
                        current_votes: U128::from(voting_power)
                    }
                )
            }
        }
        results.sort_by_key(|v| v.current_votes.0);
        results
    }

    pub fn get_votes_for_object(
        &self,
        voter_id: VoterId,
        contract_address: ContractAddress,
        votable_object_id: VotableObjId
    ) -> U128 {
        let voter = self.internal_get_voter(&voter_id);
        let votes = match voter.vote_positions.get(&contract_address) {
            Some(votes_for_address) => {
                votes_for_address.get(&votable_object_id).unwrap_or(0_u128)
            },
            None => 0_u128,
        };
        U128::from(votes)
    }
}