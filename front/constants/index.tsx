export const MIN_LOCK_DAYS = 30;
export const DEFAULT_LOCK_DAYS = 90;

export const MAX_LOCK_DAYS = 300;

export const MODAL_DURATION = {
  LONG: 9000,
  SUCCESS: 3000,
  ERROR: 5000
}

export const FETCH_VOTES_INTERVAL = process.env.NEXT_PUBLIC_VOTER_DATA_REFETCH_INTERVAL ? parseInt(process.env.NEXT_PUBLIC_VOTER_DATA_REFETCH_INTERVAL) : 5000;
export const FETCH_VOTER_DATA_INTERVAL = process.env.NEXT_PUBLIC_VOTES_REFETCH_INTERVAL ? parseInt(process.env.NEXT_PUBLIC_VOTES_REFETCH_INTERVAL) : 5000;
export const FETCH_WHITELISTED_TOKENS_INTERVAL = 10000;
export const FETCH_METAPOOL_STATE_INTERVAL = 2000;
export const FETCH_NEAR_PRICE_INTERVAL = 2000;
export const FETCH_TOKEN_BALANCE_INTERVAL = 5000;

export const GET_META_DEFAULT_SLIPPAGE = 0.3;
export const GET_META_MIN_SLIPPAGE = 0.01;
export const GET_META_ENABLED =  (process.env.NEXT_PUBLIC_ENABLE_GET_META && process.env.NEXT_PUBLIC_ENABLE_GET_META == "true") || false;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_METAVOTE||"metayield.app";

export const enum ACTION_TYPE {
    RELOCK,
    LOCK,
    UNLOCK,
    WITHDRAW,
    VOTE
  }

export const MODAL_TEXT = {
    UNLOCK: {
      CONFIRM: {
        title: `Start unlocking`,
        text: `Are you sure you want to start unlocking this position? Your tokens will be released when the locking period ends.`
      },
      ERROR_NOT_ENOUGH: {
        title: `Not Enough Available Voting Power`,
        text: `Your available voting power is not enough to unlock this position.<br><br> Your are trying to unlock <b> :positionAmount </b> and only have <b> :votingPowerAvailable </b> available.`
      }
    },
    RELOCK: {
      title: `Confirmation`,
      text: `Are you sure you want to relock your 
    position?`
    },
    WITHDRAW: {
      title: `Confirmation`,
      text: `Are you sure you want to withdraw your 
    position?`
    },
    VOTE: {
      title: `Confirmation`,
      text: `Are you sure you want to remove your vote
      position?`
    }
  }

  