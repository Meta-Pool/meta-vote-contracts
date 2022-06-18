use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

// let c = coord! {
//     x: 40.02f64,
//     y: 116.34,
// };
// let (x, y) = c.x_y();

// assert_eq!(y, 116.34);
// assert_eq!(x, 40.02f64);

#[derive(BorshDeserialize, BorshSerialize)]
pub struct VotableObject {
    pub votable_contract: ContractAddress,
    pub id: VotableObjId,
    pub expiration: EpochMillis,
    pub event: Option<Event>,

    pub official_result: Option<VotingPower>,
    pub votes_collected_at: Option<EpochMillis>,

    // Balance is a fee in Meta.
    pub balance: Meta,
}

impl VotableObject {
    /// The msg should have the folliwing format votable_object_id@contract_address.
    /// Votable object id is a string, and contract address a valid Account Id.
    pub(crate) fn parse_votable_object(msg: String) -> (VotableObjId, ContractAddress) {
        let (id, votable_contract) = msg.split_once("@")
            .expect("Votable object not in correct format [i.e. id@contract_address]");
        let id: VotableObjId = id.to_string();
        require!(!id.is_empty(), "Votable object is not correct.");
        let votable_contract = ContractAddress::new_unchecked(votable_contract.to_string());
        (id, votable_contract)
    }
}