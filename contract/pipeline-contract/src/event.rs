use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Event {
    registration_due_date: EpochMillis,
    registered_votable_object: Event,
}

impl Event {

}