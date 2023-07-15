use crate::*;
use near_sdk::json_types::U128;
use near_sdk::{env, log, near_bindgen, PromiseOrValue};
use near_sdk::{serde_json, ONE_NEAR};

use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;

const E24: u128 = ONE_NEAR;

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
        if msg.len() >= 11 && &msg[..11] == "for-claims:" {
            match serde_json::from_str(&msg[11..]) {
                Ok(info) => self.distribute_for_claims(amount, &info),
                Err(_) => panic!("Err parsing msg for-claims"),
            };
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

impl MetaVoteContract {
    // distributes meta from self.meta_to_distribute between existent voters
    pub(crate) fn distribute_for_claims(
        &mut self,
        total_amount: u128,
        distribute_info: &Vec<(String, u64)>,
    ) {
        let mut total_distributed = 0;
        for item in distribute_info {
            let amount = item.1 as u128 * E24;
            self.add_claimable_meta(&AccountId::new_unchecked(item.0.clone()), amount);
            total_distributed += amount;
        }
        assert!(
            total_distributed == total_amount,
            "total to distribute {} != total_amount sent {}",
            total_distributed,
            total_amount
        );
        self.accumulated_distributed_for_claims += total_distributed;
    }
}
