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

    // distributes meta from self.meta_to_distribute between existent voters
    pub fn distribute_for_claims(&mut self, distribute_info: Vec<(AccountId, U128)>) {
        self.assert_only_owner();
        let mut total_distributed = 0;
        for item in distribute_info {
            let amount =  item.1 .0;
            self.add_claimable_meta(&item.0,amount);
            total_distributed += amount;
        }
        assert!(
            total_distributed <= self.meta_to_distribute,
            "not enough meta_to_distribute. actual {}, requested {}",
            self.meta_to_distribute, total_distributed
        );
        self.meta_to_distribute -= total_distributed;
    }

    // claim META and create/update a locking position
    pub fn claim_and_lock(&mut self, amount: U128, locking_period: u16) {
        let amount = amount.0;
        self.assert_min_deposit_amount(amount);
        let voter_id = VoterId::from(predecessor_account_id());
        self.remove_claimable_meta(&voter_id, amount);
        let mut voter = self.internal_get_voter_or_panic(&voter_id);
        // create/update locking position
        self.deposit_locking_position(amount, locking_period, voter_id, &mut voter);
    }
}
