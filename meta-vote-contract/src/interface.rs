use crate::*;

use near_sdk::ext_contract;
use near_sdk::json_types::{U128, ValidAccountId};

#[ext_contract(nep141_token)]
pub trait NEP141Token {
    fn ft_transfer_call(
        &mut self,
        receiver_id: ValidAccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    );

    fn ft_transfer(
        &mut self,
        receiver_id: ValidAccountId,
        amount: U128,
        memo: Option<String>,
    );
}
