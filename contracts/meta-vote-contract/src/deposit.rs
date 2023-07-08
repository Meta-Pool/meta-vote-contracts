use crate::*;
use near_sdk::env::predecessor_account_id;
use near_sdk::json_types::U128;
use near_sdk::{env, log, near_bindgen, PromiseOrValue};

use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;

#[near_bindgen]
impl FungibleTokenReceiver for MetaVoteContract {
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let amount = amount.0;

        // deposit for-claims, msg == "for-claims" means META to be later distributed to voters
        if msg == "for-claims" {
            self.meta_to_distribute += amount;
        }
        // else, user deposit to lock
        else {
            let locking_period = match msg.parse::<Days>() {
                Ok(days) => days,
                Err(_) => panic!("Err parsing locking_period from msg. Must be u16"),
            };

            let voter_id = VoterId::from(sender_id);
            assert_eq!(
                env::predecessor_account_id(),
                self.meta_token_contract_address,
                "This contract only works with META from {}",
                self.meta_token_contract_address.to_string()
            );

            self.assert_min_deposit_amount(amount);
            log!("DEPOSIT: {} META deposited from {}", amount, &voter_id,);
            let mut voter = self.internal_get_voter(&voter_id);
            self.deposit_locking_position(amount, locking_period, voter_id, &mut voter);
        }
        // Return unused amount
        PromiseOrValue::Value(U128::from(0))
    }
}

#[near_bindgen]
impl MetaVoteContract {
    fn assert_min_deposit_amount(&self, amount: Balance) {
        assert!(
            amount >= self.min_deposit_amount,
            "Minimum deposit amount is {} META.",
            self.min_deposit_amount
        );
    }

    // distributes meta from self.meta_to_distribute between existent voters
    pub fn distribute_for_claims(&mut self, distribute_info: Vec<(AccountId, U128)>) {
        self.assert_only_owner();
        let mut total_distributed = 0;
        for item in distribute_info {
            let mut voter = self.internal_get_voter_or_panic(&item.0);
            let amount = item.1 .0;
            voter.claimable_meta += amount;
            self.voters.insert(&item.0, &voter);
            total_distributed += amount;
        }
        assert!(
            total_distributed <= self.meta_to_distribute,
            "not enough meta_to_distribute {}",
            self.meta_to_distribute
        );
        self.meta_to_distribute -= total_distributed;
        self.total_unclaimed_meta += total_distributed;
    }

    // claim META and create/update a locking position
    pub fn claim_and_lock(&mut self, amount: U128, locking_period: u16) {
        let amount = amount.0;
        self.assert_min_deposit_amount(amount);
        let voter_id = VoterId::from(predecessor_account_id());
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        assert!(
            voter.claimable_meta >= amount,
            "you don't have enough claimable META"
        );
        log!(
            "{} CLAIMS {} META and lock at {} days",
            &voter_id,
            amount,
            locking_period
        );
        // update voter claimable & total
        voter.claimable_meta -= amount;
        self.voters.insert(&voter_id, &voter);
        self.total_unclaimed_meta -= amount;

        // create/update locking position
        self.deposit_locking_position(amount, locking_period, voter_id, &mut voter);
    }
}
