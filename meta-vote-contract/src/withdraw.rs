use crate::*;
use crate::interface::*;
use near_sdk::{json_types::U128, near_bindgen, Promise, PromiseResult};

#[near_bindgen]
impl MetaVoteContract {

    // ************
    // * Withdraw *
    // ************

    pub fn withdraw(
        &mut self,
        position_index_list: Vec<PositionIndex>,
        amount_from_balance: U128String,
    ) {
        let voter_id = env::predecessor_account_id().as_str().to_string();
        let voter = self.internal_get_voter_or_panic(&voter_id);
        let amount_from_balance = MpDAOAmount::from(amount_from_balance);
        assert!(
            voter.balance >= amount_from_balance,
            "Not enough balance. You have {} mpDAO in balance, required {}.",
            voter.balance,
            amount_from_balance
        );
        let remaining_balance = voter.balance - amount_from_balance;
        // Clear locking positions, it can increase the voter balance.
        if position_index_list.len() > 0 {
            self.clear_locking_position(position_index_list);
        }
        // get voter again, because clear_locking_position alters the state
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let total_to_withdraw = voter.balance - remaining_balance;
        require!(total_to_withdraw > 0, "Nothing to withdraw.");
        voter.balance -= total_to_withdraw;

        if voter.is_empty() {
            self.voters.remove(&voter_id);
            log!("GODSPEED: {} is no longer part of Meta Vote!", &voter_id);
        } else {
            self.voters.insert(&voter_id, &voter);
        }
        self.transfer_mpdao_to_voter(voter_id, total_to_withdraw);
    }

    pub fn withdraw_all(&mut self) {
        let voter_id = env::predecessor_account_id().as_str().to_string();
        let voter = self.internal_get_voter_or_panic(&voter_id);

        let position_index_list = voter.get_unlocked_position_index();
        // Clear locking positions could increase the voter balance.
        if position_index_list.len() > 0 {
            self.clear_locking_position(position_index_list);
        }
        // get voter again because clear locking positions could increase the voter balance.
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        let total_to_withdraw = voter.balance;
        require!(total_to_withdraw > 0, "Nothing to withdraw.");
        voter.balance = 0;

        if voter.is_empty() {
            self.voters.remove(&voter_id);
            log!("GODSPEED: {} is no longer part of Meta Vote!", &voter_id);
        } else {
            self.voters.insert(&voter_id, &voter);
        }
        self.transfer_mpdao_to_voter(voter_id, total_to_withdraw);
    }

    // *************************
    // * Internals & callbacks *
    // *************************

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
        &self,
        source: &String,
        receiver: &String,
        amount: Balance
    ) -> Promise {
        ext_ft::ext(self.stnear_token_contract_address.clone())
            .with_static_gas(GAS_FOR_FT_TRANSFER)
            .with_attached_deposit(1)
            .ft_transfer(
                receiver.clone(),
                U128::from(amount),
                None
        ).then(
            Self::ext(env::current_account_id())
                .with_static_gas(GAS_FOR_RESOLVE_TRANSFER)
                .after_transfer_stnear_callback(
                    &source,
                    U128::from(amount)
                )
        )
    }

    #[private]
    pub fn after_transfer_stnear_callback(
        &mut self,
        source: &String,
        amount: U128
    ) {
        let amount = amount.0;
        match env::promise_result(0) {
            PromiseResult::NotReady => unreachable!(),
            PromiseResult::Successful(_) => {
                log!("{} WITHDRAW {} stNEAR", source, amount);
            },
            PromiseResult::Failed => {
                log!(
                    "FAILED: {} stNEAR not transferred. Recovering {} state.",
                    amount, source
                );
                self.add_claimable_stnear(source, amount);
            },
        };
    }
}