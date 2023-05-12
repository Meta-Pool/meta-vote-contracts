use crate::*;
use crate::interface::*;
use near_sdk::{near_bindgen, PromiseResult, json_types::U128};

#[near_bindgen]
impl MetaVoteContract {
    pub(crate) fn transfer_meta_to_voter(
        &mut self,
        voter_id: VoterId,
        amount: Meta
    ) {
        ext_ft::ext(self.meta_token_contract_address.clone())
            .with_static_gas(GAS_FOR_FT_TRANSFER)
            .with_attached_deposit(1)
            .ft_transfer(
                voter_id.clone(),
                U128::from(amount),
                None
        ).then(
            Self::ext(env::current_account_id())
                .with_static_gas(GAS_FOR_RESOLVE_TRANSFER)
                .after_transfer_meta_callback(
                    voter_id,
                    U128::from(amount)
                )
        );
    }

    #[private]
    pub fn after_transfer_meta_callback(
        &mut self,
        voter_id: VoterId,
        amount: U128
    ) {
        let amount = amount.0;
        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Successful(_) => {

                log!("WITHDRAW: {} META transfer to {}", amount, voter_id.to_string());
            },
            PromiseResult::Failed => {
                log!(
                    "FAILED: {} META not transfered. Recovering {} state.",
                    amount, &voter_id.to_string()
                );
                self.restore_transfer_to_meta(amount, voter_id);
            },
        };
    }

    fn restore_transfer_to_meta(
        &mut self,
        amount: Balance,
        voter_id: VoterId
    ) {
        let mut voter = self.internal_get_voter(&voter_id);
        voter.balance += amount;
        self.voters.insert(&voter_id, &voter);
    }
}