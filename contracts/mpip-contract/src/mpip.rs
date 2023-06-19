use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

// /////////////////
// Comment struct //
// /////////////////

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub enum MpipState {
    Draft,  // proposer share the idea. Giving awareneness from the community via discussion or poll
    Active, // reviewed and accepted by managers 
    VotingProcess, // on voting process
    Accepted, // accepted by votes
    Rejected, // rejected by votes
    Executed, // proposal executed, performing on-chain actions
    Canceled,  // canceled by manager after community awareness
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct MpipJSON {
    pub mpip_id: MpipId,
    pub title: String,
    pub body: String,
    // pub comments: String,
    pub data: String,
    pub extra: String,
    pub creator_id: AccountId,
    pub vote_start_timestamp: Option<EpochMillis>,
    pub vote_end_timestamp: Option<EpochMillis>,
    pub draft: bool,
    pub executed: bool,
    pub canceled: bool,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Mpip {
    pub mpip_id: MpipId,
    pub title: String,
    pub short_description: String,
    pub body: String,
    // pub comments: String,
    pub data: String,
    pub extra: String,
    pub creator_id: AccountId,
    pub vote_start_timestamp: Option<EpochMillis>,
    pub vote_end_timestamp: Option<EpochMillis>,
    pub draft: bool,
    pub executed: bool,
    pub canceled: bool,
}

impl Mpip {
    pub(crate) fn new(
        id: MpipId,
        title: String,
        short_description: String,
        body: String,
        data: String,
        extra: String,
    ) -> Self {
        Mpip {
            mpip_id: id,
            title: title,
            short_description: short_description,
            body: body,
            // comments: "".to_string(),
            data: data,
            extra: extra,
            creator_id: env::signer_account_id(),
            vote_end_timestamp: None,
            vote_start_timestamp: None,
            draft: true,
            executed: false,
            canceled: false,
        }
    }

    pub(crate) fn to_json(&self) -> MpipJSON {
        MpipJSON {
            mpip_id: self.mpip_id.clone(),
            title: self.title.clone(),
            body: self.body.clone(),
            // comments: self.comments.clone(),
            data: self.data.clone(),
            extra: self.extra.clone(),
            creator_id: self.creator_id.clone(),
            vote_end_timestamp: self.vote_end_timestamp.clone(),
            vote_start_timestamp: self.vote_start_timestamp.clone(),
            executed: self.executed,
            canceled: self.canceled,
            draft: self.draft,
        }
    }
}

impl MpipContract {
    pub(crate) fn internal_create_proposal(
        &mut self,
        mpip_id: MpipId,
        title: String,
        short_description: String,
        body: String,
        data: String,
        extra: String
    ) -> MpipId {
        let proposal = Mpip::new(mpip_id, title, short_description, body, data, extra);
        self.mpips.insert(&mpip_id, &proposal);
        proposal.mpip_id.into()
    }

    pub(crate) fn internal_get_proposal_state(
        &self,
        mpip_id: MpipId,
        total_voting_power: u128,
    ) -> MpipState {
        let proposal = self.internal_get_proposal(mpip_id);
        if proposal.executed {
            return MpipState::Executed;
        } else if proposal.canceled {
            return MpipState::Canceled;
        } else if proposal.draft {
            return MpipState::Draft;
        }
       
        if self.internal_proposal_is_on_voting(mpip_id) {
            return MpipState::VotingProcess;
        } else if self.internal_proposal_is_active(mpip_id) {
            return MpipState::Active;
        }
        
        if self.internal_is_quorum_reached(mpip_id, total_voting_power)
            && self.get_proposal_vote_succeeded(mpip_id)
        {
            return MpipState::Accepted;
        } else {
            return MpipState::Rejected;
        }
    }
}
