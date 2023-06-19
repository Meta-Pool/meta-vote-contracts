use crate::*;
// use meta_tools::utils::{assert_one_promise_result, get_linear_release_proportion};
use crate::utils::get_current_epoch_millis;
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, require, PromiseResult};
#[near_bindgen]
impl MpipContract {
    pub(crate) fn assert_only_admin(&self) {
        require!(
            self.admin_id == env::signer_account_id(),
            "Only the admin can call this function."
        );
    }

    pub(crate) fn assert_only_operator(&self) {
        require!(
            self.admin_id == env::signer_account_id()
                || self.operator_id == env::signer_account_id(),
            "Only the operator or admin can call this function."
        );
    }

    pub(crate) fn assert_only_operator_or_creator(&self, mpip_id: MpipId) {
        let proposal = self.internal_get_proposal(mpip_id);
        require!(
            self.operator_id == env::signer_account_id() || proposal.creator_id == env::signer_account_id(),
            "Only the admin or proposal creator can call this function."
        );
    }

    pub(crate) fn assert_open_for_new_mpips(&self) {
        require!(
            self.open_for_new_mpips == true,
            "Contract not open for new proposals"
        );
    }

    pub(crate) fn internal_is_vote_active(&self, mpip_id: MpipId) -> bool {
        todo!()
    }

    pub(crate) fn assert_vote_active(&self, mpip_id: MpipId) {
        todo!();
    }

    pub(crate) fn internal_has_voted(&self, mpip_id: MpipId, account_id: VoterId) -> bool {
        let proposal_vote = self.internal_get_proposal_vote(mpip_id);
        !proposal_vote.has_voted.get(&account_id).is_none()
    }

    pub(crate) fn assert_has_not_voted(&self, mpip_id: MpipId, account_id: VoterId) {
        require!(
            !self.internal_has_voted(mpip_id, account_id),
            "Account has already voted"
        );
    }

    pub(crate) fn assert_has_voted(&self, mpip_id: MpipId, account_id: VoterId) {
        require!(
            self.internal_has_voted(mpip_id, account_id),
            "Account has not voted"
        );
    }

    pub(crate) fn internal_check_proposal_treshold(&self, voting_power: u128) -> bool {
        self.min_voting_power_amount <= voting_power
    }

    pub(crate) fn internal_proposal_is_active(&self, mpip_id: MpipId) -> bool {
        let proposal = self.internal_get_proposal(mpip_id);
        // check if proposal has vote_start_timestamp
        match proposal.vote_start_timestamp {
            Some(date) => {
                get_current_epoch_millis() <= date
                    && !proposal.draft
                    && !proposal.canceled
                    && !proposal.executed
            }
            None => !proposal.draft && !proposal.canceled && !proposal.executed,
        }
    }

    pub(crate) fn internal_proposal_is_active_or_draft(&self, mpip_id: MpipId) -> bool {
        let proposal = self.internal_get_proposal(mpip_id);
        // check if proposal has vote_start_timestamp
        match proposal.vote_start_timestamp {
            Some(date) => {
                get_current_epoch_millis() <= date
                    && !proposal.canceled
                    && !proposal.executed
            }
            None => !proposal.canceled && !proposal.executed,
        }
    }

    pub(crate) fn internal_proposal_is_on_voting(&self, mpip_id: MpipId) -> bool {
        let proposal = self.internal_get_proposal(mpip_id);
        // check if proposal has vote_start_timestamp
        match proposal.vote_start_timestamp {
            Some(date) => {
                get_current_epoch_millis() >= date && get_current_epoch_millis() <= proposal.vote_end_timestamp.unwrap()
                    && !proposal.draft
                    && !proposal.canceled
                    && !proposal.executed
            }
            None => false
        }
    }

    pub(crate) fn assert_proposal_treshold(&self, voting_power: u128) {
        require!(
            self.internal_check_proposal_treshold(voting_power),
            "Voting Power below proposal treshold"
        )
    }

    pub(crate) fn assert_proposal_is_active(&self, mpip_id: MpipId) {
        require!(self.internal_proposal_is_active(mpip_id), "Proposal is not active")
    }

    pub(crate) fn assert_proposal_is_draft(&self, mpip_id: MpipId) {
        let proposal = self.internal_get_proposal(mpip_id);
        require!(proposal.draft, "Proposal is not on draft");
    }

    pub(crate) fn assert_proposal_is_active_or_draft(&self, mpip_id: MpipId) {
        require!(self.internal_proposal_is_active_or_draft(mpip_id), "Proposal is not active or in draft state")
    }

    pub(crate) fn assert_proposal_is_on_voting(&self, mpip_id: MpipId) {
        require!(self.internal_proposal_is_on_voting(mpip_id), "Proposal is not on voting period")
    }

    pub(crate) fn internal_get_proposal(&self, mpip_id: MpipId) -> Mpip {
        self.mpips.get(&mpip_id).expect("MPIP Id does not exist")
    }

    pub(crate) fn internal_get_proposal_vote(&self, mpip_id: MpipId) -> ProposalVote {
        self.mpip_votes
            .get(&mpip_id)
            .expect("MPIP Id does not exist.")
    }

    pub(crate) fn get_available_voting_power_from_promise(&self) -> Balance {
        require!(
            env::promise_results_count() == 1,
            "This is a callback method."
        );

        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Failed => env::panic_str("Meta Vote is not available!"),
            PromiseResult::Successful(result) => {
                let v_power = near_sdk::serde_json::from_slice::<U128>(&result).unwrap();
                v_power.0
            }
        }
    }

    pub(crate) fn internal_get_quorum(&self, total_voting_power: u128) -> u128 {
        total_voting_power * u128::from(self.quorum_floor) / 100
    }

    pub(crate) fn internal_is_quorum_reached(&self, mpip_id: MpipId, total_voting_power: u128) -> bool{
        let quorum = self.internal_get_quorum(total_voting_power);
        let proposal_vote = self.internal_get_proposal_vote(mpip_id);
        quorum <= proposal_vote.for_votes + proposal_vote.abstain_votes
    }
}
