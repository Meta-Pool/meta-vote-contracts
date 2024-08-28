use crate::*;
use near_sdk::{env, near_bindgen};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct OldState {
    pub owner_id: AccountId,
    pub operator_id: AccountId,
    pub voters: UnorderedMap<VoterId, Voter>,
    pub votes: UnorderedMap<ContractAddress, UnorderedMap<VotableObjId, u128>>,
    pub min_unbond_period: Days,
    pub max_unbond_period: Days,
    pub min_deposit_amount: MpDAOAmount,
    pub max_locking_positions: u8,
    pub max_voting_positions: u8,
    pub mpdao_token_contract_address: AccountId, // governance tokens
    pub total_voting_power: u128,

    // mpdao as rewards
    pub claimable_mpdao: UnorderedMap<VoterId, u128>,
    pub accumulated_mpdao_distributed_for_claims: u128, // accumulated total mpDAO distributed
    pub total_unclaimed_mpdao: u128,                    // currently unclaimed mpDAO

    // stNear as rewards
    pub stnear_token_contract_address: AccountId,
    pub claimable_stnear: UnorderedMap<VoterId, u128>,
    pub accum_distributed_stnear_for_claims: u128, // accumulated total stNEAR distributed
    pub total_unclaimed_stnear: u128,              // currently unclaimed stNEAR

    // association with other blockchain addresses, users' encrypted data
    pub registration_cost: u128,
    pub associated_user_data: UnorderedMap<VoterId, String>,

    pub prev_governance_contract: String,

    pub evm_delegates: UnorderedMap<String, Vec<EvmAddress>>,
    pub evm_pre_delegation: LookupMap<EvmAddress, (String, EvmSignature)>,
    pub evm_delegation_signatures: LookupMap<EvmAddress, (String, EvmSignature)>,
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
            operator_id: old.operator_id,
            voters: old.voters,
            votes: old.votes,
            min_unbond_period: old.min_unbond_period,
            max_unbond_period: old.max_unbond_period,
            min_deposit_amount: old.min_deposit_amount,
            max_locking_positions: old.max_locking_positions,
            max_voting_positions: old.max_voting_positions,
            mpdao_token_contract_address: old.mpdao_token_contract_address,
            total_voting_power: old.total_voting_power,

            // mpdao as rewards
            claimable_mpdao: old.claimable_mpdao,
            accumulated_mpdao_distributed_for_claims: old.accumulated_mpdao_distributed_for_claims,
            total_unclaimed_mpdao: old.total_unclaimed_mpdao,

            // stNear as rewards
            stnear_token_contract_address: old.stnear_token_contract_address,
            claimable_stnear: old.claimable_stnear,
            accum_distributed_stnear_for_claims: old.accum_distributed_stnear_for_claims,
            total_unclaimed_stnear: old.total_unclaimed_stnear,

            // association with other blockchain addresses, users' encrypted data
            registration_cost: old.registration_cost,
            associated_user_data: old.associated_user_data,
            prev_governance_contract: old.prev_governance_contract,

            evm_delegates: old.evm_delegates,
            evm_delegation_signatures: old.evm_delegation_signatures,
            evm_pre_delegation: old.evm_pre_delegation,

            lock_votes_in_end_timestamp_ms: 0,
            lock_votes_in_address: None,
            lock_votes_in_numeric_id: 0,
        }
    }
}
