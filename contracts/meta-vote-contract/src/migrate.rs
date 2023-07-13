use crate::*;
use near_sdk::{env::{self, predecessor_account_id}, near_bindgen};

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
    pub meta_token_contract_address: ContractAddress,
    pub total_voting_power: VotingPower,
}

#[near_bindgen]
impl MetaVoteContract {
    #[init(ignore_state)]
    #[private] // only contract account can call this fn
    pub fn migrate() -> Self {
        // retrieve the current state from the contract
        let old_state: OldState = env::state_read().expect("failed");
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
            total_voting_power: old_state.total_voting_power,
            meta_to_distribute: 0,
            total_unclaimed_meta: 0,
            claimable_meta: UnorderedMap::new(StorageKey::Claimable),
        }
    }
}
