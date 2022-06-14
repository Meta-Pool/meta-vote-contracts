use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::Vector;
use near_sdk::collections::unordered_map::UnorderedMap;
use near_sdk::{env, log, near_bindgen, AccountId, Balance, PanicOnDefault, require};

// mod constants;
// mod deposit;
// mod internal;
// mod locking_position;
mod types;
// mod utils;
mod event;
mod votable_object;
// mod withdraw;
// pub mod interface;

use types::*;
// use utils::get_current_epoch_millis;
use event::Event;
use votable_object::VotableObject;
// use crate::utils::{days_to_millis, millis_to_days};
// use crate::{constants::*, locking_position::*};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct PipelineContract {
    pub owner_id: AccountId,

    // The Balance of the votable object.
    pub balance: Balance,
    pub votable_objects: Vector<VotableObject>,
    pub events: Vector<Event>,
}
