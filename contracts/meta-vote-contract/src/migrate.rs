use crate::*;
use near_sdk::{env, near_bindgen};

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

    // added v0.1.3
    pub claimable_meta: UnorderedMap<VoterId, u128>,
    pub accumulated_distributed_for_claims: u128, // accumulated total META distributed
    pub total_unclaimed_meta: u128,               // currently unclaimed META

    // added v0.1.4
    pub stnear_token_contract_address: ContractAddress,
    pub claimable_stnear: UnorderedMap<VoterId, u128>,
    pub accum_distributed_stnear_for_claims: u128, // accumulated total stNEAR distributed
    pub total_unclaimed_stnear: u128,              // currently unclaimed stNEAR

    // airdrop users encrypted data, v0.1.5
    pub registration_cost: u128,
    pub airdrop_user_data: UnorderedMap<VoterId, String>,
}

#[near_bindgen]
impl MetaVoteContract {
    #[init(ignore_state)]
    #[private] // only contract account can call this fn
    pub fn migrate() -> Self {
        // retrieve the current state from the contract
        let old: OldState = env::state_read().expect("failed");
        // return the new state
        Self {
            owner_id: old.owner_id,
            voters: old.voters,
            votes: old.votes,
            min_locking_period: old.min_locking_period,
            max_locking_period: old.max_locking_period,
            min_deposit_amount: old.min_deposit_amount,
            max_locking_positions: old.max_locking_positions,
            max_voting_positions: old.max_voting_positions,
            meta_token_contract_address: old.meta_token_contract_address,
            total_voting_power: old.total_voting_power,
            accumulated_distributed_for_claims: old.accumulated_distributed_for_claims,
            total_unclaimed_meta: old.total_unclaimed_meta,
            claimable_meta: old.claimable_meta,
            stnear_token_contract_address: old.stnear_token_contract_address,
            claimable_stnear: old.claimable_stnear,
            accum_distributed_stnear_for_claims: old.accum_distributed_stnear_for_claims,
            total_unclaimed_stnear: old.total_unclaimed_stnear,
            registration_cost: old.registration_cost,
            airdrop_user_data: old.airdrop_user_data,
            // -- NEW FIELDS
            migrated_users: LookupSet::new(StorageKey::MigratedUsers),
            new_governance_contract_id: None
        }
    }
}