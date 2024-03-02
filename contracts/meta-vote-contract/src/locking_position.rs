use crate::utils::proportional;
use crate::*;
use near_sdk::json_types::U128;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct LockingPosition {
    pub amount: MpDAOAmount,
    pub locking_period: Days,
    pub voting_power: u128,
    pub unlocking_started_at: Option<EpochMillis>,
}

impl LockingPosition {
    pub(crate) fn locking_period_millis(&self) -> u64 {
        days_to_millis(self.locking_period)
    }

    pub(crate) fn new(
        amount: MpDAOAmount,
        locking_period: Days,
        voting_power: u128,
        unlocking_started_at: Option<EpochMillis>
    ) -> Self {
        LockingPosition {
            amount,
            locking_period,
            voting_power,
            unlocking_started_at,
        }
    }

    pub(crate) fn is_locked(&self) -> bool {
        self.unlocking_started_at.is_none()
    }

    pub(crate) fn is_unlocking(&self) -> bool {
        match self.unlocking_started_at {
            Some(date) => get_current_epoch_millis() <= (date + self.locking_period_millis()),
            None => false,
        }
    }

    pub(crate) fn is_unlocked(&self) -> bool {
        match self.unlocking_started_at {
            Some(date) => get_current_epoch_millis() > (date + self.locking_period_millis()),
            None => false,
        }
    }

    pub(crate) fn to_json(&self, index: Option<PositionIndex>) -> LockingPositionJSON {
        LockingPositionJSON {
            index,
            amount: U128::from(self.amount),
            locking_period: self.locking_period,
            voting_power: U128::from(self.voting_power),
            unlocking_started_at: self.unlocking_started_at,
            is_unlocked: self.is_unlocked(),
            is_unlocking: self.is_unlocking(),
            is_locked: self.is_locked(),
        }
    }
}

#[near_bindgen]
impl MetaVoteContract {
    /// Voting power is proportional to unbound_period
    /// i.e: 30->0.5x, 60(default)->1, 120->2, 180->3, 240->4, 300->5x –Step: 30days
    /// formula is for multiplier: unbound_days/60
    /// formula for voting power is: govTokenLocked * unbound_days / 60
    pub(crate) fn calculate_voting_power(
        &self,
        mpdao_amount: MpDAOAmount,
        unbound_days: Days,
    ) -> u128 {
        assert!(mpdao_amount >= ONE_MPDAO); // at least 1 mpDAO, 1_000_0000
        // voting power is u128 with 24 decimals (NEAR standard) and mpdao_amount has 6 decimals
        let base_vp = mpdao_amount.checked_mul(E18).expect("vp overflow"); // convert to 24 decimals voting power
        assert!(unbound_days < 3600); // put a limit to unbound_days
        proportional(base_vp, unbound_days.into(), 60) // apply multiplier
    }

    fn increase_locking_position(
        &mut self,
        voter: &mut Voter,
        index: u64,
        mpdao_amount: MpDAOAmount,
        unbound_days: Days,
    ) {
        let voting_power = self.calculate_voting_power(mpdao_amount, unbound_days);
        let mut current_position = voter.get_position(index);
        current_position.amount += mpdao_amount;
        current_position.voting_power += voting_power;

        voter.locking_positions.replace(index, &current_position);
        voter.voting_power += voting_power;
        self.total_voting_power += voting_power;
    }

    pub(crate) fn internal_create_locking_position(
        &mut self,
        voter: &mut Voter,
        mpdao_amount: MpDAOAmount,
        unbound_days: Days,
        voting_power: u128,
        unlocking_started_at: Option<EpochMillis>
    ) {
        assert!(
            (voter.locking_positions.len() as u8) < self.max_locking_positions,
            "The max number of locking positions is {}",
            self.max_locking_positions
        );
        let locking_position = LockingPosition::new(mpdao_amount, unbound_days, voting_power,unlocking_started_at);
        voter.locking_positions.push(&locking_position);
        voter.voting_power += voting_power;
        self.total_voting_power += voting_power;
    }

    pub(crate) fn deposit_locking_position(
        &mut self,
        mpdao_amount: MpDAOAmount,
        unbound_days: Days,
        voter_id: &VoterId,
        voter: &mut Voter,
    ) {
        assert!(
            unbound_days >= self.min_unbound_period && unbound_days <= self.max_unbound_period,
            "Unbound period must be between {} and {} days",
            self.min_unbound_period,
            self.max_unbound_period
        );

        match voter.find_locked_position(unbound_days) {
            Some(index) => {
                // Deposit into existing locking position.
                self.increase_locking_position(voter, index, mpdao_amount, unbound_days);
            }
            None => {
                let voting_power = self.calculate_voting_power(mpdao_amount, unbound_days);
                self.internal_create_locking_position(voter, mpdao_amount, unbound_days, voting_power, None);
            }
        };
        self.voters.insert(&voter_id, &voter);
    }

    pub(crate) fn create_unlocking_position(
        &mut self,
        voter: &mut Voter,
        mpdao_amount: MpDAOAmount,
        unbound_days: Days,
        voting_power: u128,
    ) {
        // TODO: you can split this function into increase and create unlocking position
        // to avoid multiple unlocking positions. Or not, be careful with the rounding
        // in the days.
        assert!(
            (voter.locking_positions.len() as u8) < self.max_locking_positions,
            "The max number of locking positions is {}",
            self.max_locking_positions
        );
        let unlocking_position = LockingPosition::new(mpdao_amount, unbound_days, voting_power, Some(get_current_epoch_millis()));
        voter.locking_positions.push(&unlocking_position);
    }
}
