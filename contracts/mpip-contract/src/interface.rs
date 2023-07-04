use near_sdk::json_types::U128;
use near_sdk::{ext_contract, AccountId};

use crate::types::VoterId;

#[ext_contract(ext_metavote)]
pub trait ExtMetaVote {
    fn vote(&mut self, voting_power: U128, contract_address: AccountId, votable_object_id: String);
    fn get_available_voting_power(&self, voter_id: VoterId);
}

// #[ext_contract(ext_self)]
// pub trait SelfMetaVote {
//     fn after_transfer_meta_callback(
//         &mut self,
//         voter_id: AccountId,
//         amount: U128
//     );
// }
