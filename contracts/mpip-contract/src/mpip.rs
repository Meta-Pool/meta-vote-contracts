use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

// /////////////////
// Comment struct //
// /////////////////

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct MpipJSON {
    pub mpip_id: MpipId,
    pub title: String,
    pub body: String,
    pub comments: String,
    pub data: String,
    pub extra: String,
    pub creator_id: AccountId
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Mpip {
    pub mpip_id: MpipId,
    pub title: String,
    pub body: String,
    pub comments: String,
    pub data: String,
    pub extra: String,
    pub creator_id: AccountId
}

impl Mpip {
    pub(crate) fn new(id: MpipId) -> Self {
        Mpip {
            mpip_id: id,
            title: "".to_string(),
            body: "".to_string(),
            comments: "".to_string(),
            data: "".to_string(),
            extra: "".to_string(),
            creator_id: env::signer_account_id()
        }
    }

    pub(crate) fn to_json(&self, mpip_id: MpipId) -> MpipJSON {
        MpipJSON {
            mpip_id,
            title: self.title.clone(),
            body: self.body.clone(),
            comments: self.comments.clone(),
            data: self.data.clone(),
            extra: self.extra.clone(),
            creator_id: self.creator_id.clone()
        }
    }
}
