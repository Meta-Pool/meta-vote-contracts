use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use json::JsonValue;

#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct VoterJSON {
    pub voter_id: AccountId,
    pub balance: U128,
    pub locking_position: String,
    pub voting_power: U128,
    pub vote_position: String
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Voter {
    pub balance: Meta,
    pub locking_positions: Vector<LockingPosition>,
    pub voting_power: VotingPower,
    pub vote_positions: UnorderedMap<ContractAddress, UnorderedMap<VotableObjId, VotingPower>>
}

impl Voter {
    pub(crate) fn new(id: &VoterId) -> Self {
        Self {
            balance: 0,
            locking_positions: Vector::new(
                StorageKey::LockingPosition {
                    hash_id: generate_hash_id(id.to_string())
                }
            ),
            voting_power: 0,
            vote_positions: UnorderedMap::new(
                StorageKey::VotePosition {
                    hash_id: generate_hash_id(id.to_string())
                }
            )
        }
    }

    pub(crate) fn is_empty(&self) -> bool {
        self.balance == 0 && self.locking_positions.is_empty()
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

    pub(crate) fn sum_used_votes(&self) -> VotingPower {
        let mut result = 0_u128;
        for map in self.vote_positions.values() {
            result += map.values().sum::<u128>();
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

    pub(crate) fn get_position(&self, index: PositionIndex) -> LockingPosition {
        self.locking_positions.get(index).expect("Index out of range!")
    }

    pub(crate) fn remove_position(&mut self, index: PositionIndex) {
        self.locking_positions.swap_remove(index);
    }

    pub(crate) fn get_votes_for_address(
        &self,
        voter_id: &VoterId,
        contract_address: &ContractAddress
    ) -> UnorderedMap<VotableObjId, VotingPower> {
        let id = format!("{}-{}", voter_id.to_string(), contract_address.as_str());
        self.vote_positions
            .get(&contract_address)
            .unwrap_or(
                UnorderedMap::new(
                    StorageKey::VoterVotes {
                        hash_id: generate_hash_id(id.to_string())
                    }
                )
            )
    }

    pub(crate) fn get_unlocked_position_index(&self) -> Vec<PositionIndex> {
        let mut result = Vec::new();
        for index in 0..self.locking_positions.len() {
            let locking_position = self.locking_positions.get(index)
                .expect("Locking position not found!");
            if locking_position.is_unlocked() {
                result.push(index);
            }
        }
        result
    }

    pub(crate) fn to_json(&self, voter_id: VoterId) -> VoterJSON {
        let mut locking_positions = Vec::<JsonValue>::new();
        for index in 0..self.locking_positions.len() {
            let pos = self.locking_positions.get(index).unwrap();
            locking_positions.push(
                JsonValue::String(
                    serde_json::to_string(&pos.to_json(Some(index))).unwrap()
                )
            );
        }

        let mut vote_positions = JsonValue::new_object();
        for key in self.vote_positions.keys_as_vector().iter() {
            let pos = self.vote_positions.get(&key).unwrap();
            let mut to_insert = JsonValue::new_object();
            for obj in pos.keys_as_vector().iter() {
                let value = JsonValue::String(pos.get(&obj).unwrap().to_string());
                let _ = to_insert.insert(&obj, value);
            }
            let _ = vote_positions.insert(&key.to_string(), to_insert);
        }

        VoterJSON {
            voter_id,
            balance: U128::from(self.balance),
            locking_position: json::stringify(locking_positions),
            voting_power: U128::from(self.voting_power),
            vote_position: json::stringify(vote_positions)
        }
    }
}
