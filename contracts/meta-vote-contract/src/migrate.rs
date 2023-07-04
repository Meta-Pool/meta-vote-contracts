use crate::*;
use near_sdk::json_types::U128;
use near_sdk::{env, log, near_bindgen, PromiseOrValue};

use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;


#[derive(BorshDeserialize, BorshSerialize)]
pub struct OldState {
    pub owner_id: AccountId,
    pub voters: UnorderedMap<VoterId, Voter>,
    pub votes: UnorderedMap<ContractAddress, UnorderedMap<VotableObjId, VotingPower>>,
    pub min_locking_period: Days,
    pub max_locking_period: Days,
    pub min_deposit_amount: Meta,
    pub max_locking_positions: u8,
    pub max_voting_positions: u8,
    pub meta_token_contract_address: ContractAddress
}

#[near_bindgen]
impl MetaVoteContract {
    #[private]
    #[init(ignore_state)]
    pub fn migrate() -> Self {
        // retrieve the current state from the contract
        let old_state: OldState = env::state_read().expect("failed");

        // This can get EXPENSIVE. Turn off the migration after v0.1.1 -> v0.1.2.
        let mut total_voting_power: VotingPower = 0;
        for (_, voter) in old_state.voters.iter() {
            for position in voter.locking_positions.iter() {
                total_voting_power += position.voting_power;
            }
        }

        // return the new state
        Self {
            owner_id: old_state.owner_id, 
            voters: old_state.voters, 
            votes: old_state.votes, 
            min_locking_period: old_state.min_locking_period, 
            max_locking_period: old_state.max_locking_period, 
            min_deposit_amount: old_state.min_deposit_amount, 
            max_locking_positions: old_state.max_locking_positions, 
            max_voting_positions: old_state.max_voting_positions, 
            meta_token_contract_address: old_state.meta_token_contract_address, 
            total_voting_power
        }
    }
}