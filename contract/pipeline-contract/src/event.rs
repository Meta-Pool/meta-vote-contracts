use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Event {
    registration_due_date: EpochMillis,
}

impl Event {

    pub fn new() -> Self {
        Event { registration_due_date: 0 }
    }

}