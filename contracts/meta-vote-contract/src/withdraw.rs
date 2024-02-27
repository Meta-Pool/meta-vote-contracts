use crate::*;
use crate::interface::*;
use near_sdk::{near_bindgen, PromiseResult, json_types::U128};

#[near_bindgen]
impl MetaVoteContract {
    pub(crate) fn transfer_mpdao_to_voter(
        &mut self,
        voter_id: VoterId,
        amount: MpDAOAmount
    ) {
        ext_ft::ext(self.mpdao_token_contract_address.clone())
            .with_static_gas(GAS_FOR_FT_TRANSFER)
            .with_attached_deposit(1)
            .ft_transfer(
                voter_id.clone(),
                U128::from(amount),
                None
        ).then(
            Self::ext(env::current_account_id())
                .with_static_gas(GAS_FOR_RESOLVE_TRANSFER)
                .after_transfer_mpdao_callback(
                    voter_id,
                    U128::from(amount)
                )
        );
    }

    #[private]
    pub fn after_transfer_mpdao_callback(
        &mut self,
        voter_id: VoterId,
        amount: U128
    ) {
        let amount = amount.0;
        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Successful(_) => {
                log!("WITHDRAW: {} mpDAO transfer to {}", amount, voter_id.to_string());
            },
            PromiseResult::Failed => {
                log!(
                    "FAILED: {} mpDAO not transferred. Recovering {} state.",
                    amount, &voter_id.to_string()
                );
                self.restore_transfer_to_mpdao(amount, voter_id);
            },
        };
    }

    fn restore_transfer_to_mpdao(
        &mut self,
        amount: Balance,
        voter_id: VoterId
    ) {
        let mut voter = self.internal_get_voter(&voter_id);
        voter.balance += amount;
        self.voters.insert(&voter_id, &voter);
    }

    /// This transfer is only to claim available stNEAR
    pub(crate) fn transfer_stnear_to_voter(
        &mut self,
        voter_id: VoterId,
        amount: Balance
    ) {
        ext_ft::ext(self.stnear_token_contract_address.clone())
            .with_static_gas(GAS_FOR_FT_TRANSFER)
            .with_attached_deposit(1)
            .ft_transfer(
                voter_id.clone(),
                U128::from(amount),
                None
        ).then(
            Self::ext(env::current_account_id())
                .with_static_gas(GAS_FOR_RESOLVE_TRANSFER)
                .after_transfer_stnear_callback(
                    voter_id,
                    U128::from(amount)
                )
        );
    }

    #[private]
    pub fn after_transfer_stnear_callback(
        &mut self,
        voter_id: VoterId,
        amount: U128
    ) {
        let amount = amount.0;
        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Successful(_) => {
                log!("WITHDRAW: {} stNEAR transfer to {}", amount, voter_id.to_string());
            },
            PromiseResult::Failed => {
                log!(
                    "FAILED: {} stNEAR not transferred. Recovering {} state.",
                    amount, &voter_id.to_string()
                );
                self.add_claimable_stnear(&voter_id, amount);
            },
        };
    }
}