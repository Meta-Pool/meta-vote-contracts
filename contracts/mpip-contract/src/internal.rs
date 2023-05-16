use crate::*;
use near_sdk::near_bindgen;

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
}