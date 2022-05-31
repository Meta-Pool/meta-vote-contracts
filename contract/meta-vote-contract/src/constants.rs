use near_sdk::BorshStorageKey;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

pub const YOCTO_UNITS: u128 = 1_000_000_000_000_000_000_000_000;

#[derive(BorshSerialize, BorshDeserialize, BorshStorageKey)]
pub enum Keys {
    LockingPosition,
    VotePosition,
    Voter,
}

impl Keys {
	/// Creates unique prefix for collections based on a String id.
	pub fn as_prefix(&self, id: &str) -> String {
		match self {
			Keys::LockingPosition => format!("{}{}", "LP", id),
			Keys::VotePosition => format!("{}{}", "VP", id),
			Keys::Voter => format!("{}{}", "V", id),
        }
    }
}
