use crate::*;
use near_sdk::json_types::{ValidAccountId, U128};
use near_sdk::{env, log, near_bindgen, PromiseOrValue};

use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;

#[near_bindgen]
impl FungibleTokenReceiver for MetaVoteContract {
    fn ft_on_transfer(
        &mut self,
        sender_id: ValidAccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let locking_period = match msg.parse::<Days>() {
            Ok(days) => days,
            Err(_) => panic!(
                "Invalid locking period. Must be between {} and {} days",
                self.min_locking_period,
                self.max_locking_period
            ),
        };

        let amount = amount.0;
        let voter_id = VoterId::from(sender_id);
        assert_eq!(
            env::predecessor_account_id(),
            self.meta_token_contract_address,
            "This contract only works with $META from {}",
            self.meta_token_contract_address
        );

        self.assert_min_deposit_amount(amount);
        log!(
            "DEPOSIT: {} $META deposited from {}",
            amount,
            &voter_id,
        );
        self.deposit_locking_position(amount, locking_period, voter_id);

        // Return unused amount
        PromiseOrValue::Value(U128::from(0))
    }
}

#[near_bindgen]
impl MetaVoteContract {
    fn assert_min_deposit_amount(&self, amount: Balance) {
        assert!(
            amount >= self.min_deposit_amount,
            "Minimum deposit amount is {} $META.",
            self.min_deposit_amount
        );
    }
}

// #[cfg(all(test, not(target_arch = "wasm32")))]
// #[allow(unused_imports)]
// mod tests {
//     use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
//     use near_contract_standards::storage_management::StorageManagement;
//     use near_sdk::test_utils::{accounts, VMContextBuilder};
//     use near_sdk::{testing_env, Balance};
//     use near_sdk::{MockedBlockchain, ValidatorId};
//     use std::convert::TryInto;

//     use super::*;

//     fn get_time_millis(ctx: &VMContextBuilder) -> u64 {
//         ctx.context.block_timestamp / 1_000_000
//     }

//     fn acc_metapool() -> ValidAccountId {
//         "metapool".try_into().unwrap()
//     }

//     fn acc_owner() -> ValidAccountId {
//         "owner".try_into().unwrap()
//     }

//     const STARTING_TIMESTAMP: u64 = 100_000_000_000_000_000;

//     fn setup_contract(predecessor: ValidAccountId) -> (VMContextBuilder, KatherineFundraising) {
//         let mut context = VMContextBuilder::new();
//         testing_env!(context.build());
//         testing_env!(context
//             .predecessor_account_id(predecessor)
//             .block_timestamp(STARTING_TIMESTAMP)
//             .build());
//         let contract = KatherineFundraising::new(
//             acc_owner().to_string(), // owner
//             0,
//             acc_metapool().to_string(),
//             1,
//         );
//         (context, contract)
//     }

//     #[test]
//     fn add_supporter_with_ext_callback() {
//         let supporter = accounts(0);
//         let kickstarter_owner = accounts(1);
//         let kickstarter_token_acc = accounts(2);
//         let (mut ctx, mut ctr) = setup_contract(acc_owner());

//         // create a kickstarter
//         let kickstarter_id = ctr.create_kickstarter(
//             "first_kickstarter".to_owned(),
//             "FK".to_owned(),
//             kickstarter_owner.to_string(),
//             get_time_millis(&ctx),
//             get_time_millis(&ctx) + 1_000 * 60 * 5,
//             kickstarter_token_acc.to_string(),
//         );
//         // become a supporter
//         testing_env!(ctx.predecessor_account_id(acc_metapool()).build());
//         let promise = ctr.ft_on_transfer(supporter.clone(), 1.into(), kickstarter_id.to_string());

//         match promise {
//             PromiseOrValue::Promise(_) => {
//                 println!("error, method returned a promise");
//                 std::panic!();
//             }
//             PromiseOrValue::Value(v) => v,
//         };

//         let kickstarter_data = ctr.get_kickstarter(kickstarter_id);
//         assert_eq!(
//             kickstarter_data.total_supporters, 1,
//             "incorrrect number of supporters for kickstarter"
//         );
//     }
// }
