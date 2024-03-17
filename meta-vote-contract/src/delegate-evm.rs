use crate::*;
use crate::interface::*;
use near_sdk::{near_bindgen, PromiseResult, json_types::U128};

#[near_bindgen]
impl MetaVoteContract {

    // ************************
    // * Delegate EVM address *
    // ************************

    #[payable]
    /// called from the user account, with a ECDSA signature (ethereum signatures & the evm account)
    /// if confirmed by the operator, it moves to "delegated"
    pub fn pre_delegate_evm_address(
        &mut self,
        evm_address:String,
        signature:String) 
    {
        let account_id = env::predecessor_account_id();
        evm_pre_delegation.set(&evm_address,(account_id, signature));
    }


    // *************************
    // * Internals & callbacks *
    // *************************


    /// Inner method to get or create a Voter.
    pub(crate) fn internal_get_evm_delegate(&self, account_id: &AccountId) -> Vec<EvmAddress> {
        self.evm_delegates.get(account_id).unwrap_or(vec!())
    }
    pub(crate) fn internal_get_emv_delegate_or_panic(&self, account_id: &AccountId) -> Vec<EvmAddress> {
        match self.evm_delegates.get(account_id) {
            Some(a) => a,
            _ => panic!("{} is not a delegate", account_id),
        }
    }
}