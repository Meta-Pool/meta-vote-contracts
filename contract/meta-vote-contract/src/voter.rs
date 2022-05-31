use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Voter {
    pub balance: Meta,
    pub locking_positions: Vector<LockingPosition>,
    pub voting_power: VotePower,
    pub vote_positions: Vector<VotePosition>,
}

impl Voter {
    pub(crate) fn new(id: &VoterId) -> Self {
        Self {
            balance: 0,
            locking_positions: Vector::new(
                Keys::LockingPosition.as_prefix(id.as_str()).as_bytes()
            ),
            voting_power: 0,
            vote_positions: Vector::new(
                Keys::VotePosition.as_prefix(id.as_str()).as_bytes()
            ),
        }
    }

    pub(crate) fn sum_locked(&self) -> Meta {
        let mut result = 0_u128;
        for locking_position in self.locking_positions.iter() {
            if locking_position.is_locked() {
                result += locking_position.amount;
            }
        }
        result
    }

    pub(crate) fn sum_unlocking(&self) -> Meta {
        let mut result = 0_u128;
        for locking_position in self.locking_positions.iter() {
            if locking_position.is_unlocking() {
                result += locking_position.amount;
            }
        }
        result
    }

    pub(crate) fn sum_unlocked(&self) -> Meta {
        let mut result = 0_u128;
        for locking_position in self.locking_positions.iter() {
            if locking_position.is_unlocked() {
                result += locking_position.amount;
            }
        }
        result
    }

    pub(crate) fn sum_used_votes(&self) -> VotePower {
        let mut result = 0_u128;
        for vote_position in self.vote_positions.iter() {
            result += vote_position.amount;
        }
        result
    }

    pub(crate) fn find_locked_position(&self, locking_period: Days) -> Option<u64> {
        let mut index = 0_u64;
        for locking_position in self.locking_positions.iter() {
            if locking_position.locking_period == locking_period
                    && locking_position.is_locked() {
                return Some(index);
            }
            index += 1;
        }
        None
    }

    pub(crate) fn get_locking_position(&self, index: PositionIndex) -> LockingPosition {
        self.locking_positions.get(index).expect("Index out of range!")
    }

    pub(crate) fn remove_position(&mut self, index: PositionIndex) {
        self.locking_positions.swap_remove(index);
    }
}
