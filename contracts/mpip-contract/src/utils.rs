use crate::*;
use near_sdk::CryptoHash;

#[inline]
pub fn get_current_epoch_millis() -> EpochMillis {
    env::block_timestamp() / 1_000_000
}

#[inline]
pub fn days_to_millis(days: Days) -> u64 {
    (days as u64) * 24 * 60 * 60 * 1_000
}

pub fn generate_hash_id(id: String) -> CryptoHash {
    env::keccak256_array(id.as_bytes())
}
