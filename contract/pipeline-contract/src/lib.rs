use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::Vector;
use near_sdk::collections::unordered_map::UnorderedMap;
use near_sdk::{env, near_bindgen, AccountId, Balance, PanicOnDefault, require};

mod constants;
mod deposit;
// mod internal;
// mod locking_position;
mod types;
mod utils;
mod event;
mod votable_object;
// mod withdraw;
// pub mod interface;

use types::*;
// use utils::get_current_epoch_millis;
use event::Event;
use votable_object::VotableObject;
// use crate::utils::{days_to_millis, millis_to_days};
use crate::constants::*;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct PipelineContract {
    pub owner_id: AccountId,

    // The Balance of the votable object.
    pub balance: Balance,
    pub votable_objects: Vector<VotableObject>,
    pub events: Vector<Event>,

    // Base fee in Meta to create a votable object.
    pub base_fee: Meta,
}

#[near_bindgen]
impl PipelineContract {
    #[init]
    pub fn new(
        owner_id: AccountId,
        base_fee: U128,
    ) -> Self {
        // require!(!env::state_exists(), "The contract is already initialized");
        Self {
            owner_id,
            balance: 0,
            votable_objects: Vector::new(Keys::VotableObjList),
            events: Vector::new(Keys::VotableObjList),
            base_fee: Meta::from(base_fee),
        }
    }

    // *************
    // * Unlocking *
    // *************
}