use crate::*;
use near_sdk::json_types::U128;
use near_sdk::{env, log, near_bindgen, PromiseOrValue};

use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;

#[near_bindgen]
impl FungibleTokenReceiver for PipelineContract {
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let (id, votable_contract) = VotableObject::parse_votable_object(msg);

    //     let locking_period = match msg.parse::<Days>() {
    //         Ok(days) => days,
    //         Err(_) => panic!(
    //             "Invalid locking period. Must be between {} and {} days",
    //             self.min_locking_period,
    //             self.max_locking_period
    //         ),
    //     };

    //     let amount = amount.0;
    //     let voter_id = VoterId::from(sender_id);
    //     assert_eq!(
    //         env::predecessor_account_id(),
    //         self.meta_token_contract_address,
    //         "This contract only works with META from {}",
    //         self.meta_token_contract_address.to_string()
    //     );

    //     self.assert_min_deposit_amount(amount);
    //     log!(
    //         "DEPOSIT: {} META deposited from {}",
    //         amount,
    //         &voter_id,
    //     );
    //     let mut voter = self.internal_get_voter(&voter_id);
    //     self.deposit_locking_position(amount, locking_period, voter_id, &mut voter);

    //     // Return unused amount
        PromiseOrValue::Value(U128::from(0))
    }
}
