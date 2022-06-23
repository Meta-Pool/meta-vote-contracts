
export const CONTRACT_ADDRESS = 'metayield-proyect';

export const enum ACTION_TYPE {
    RELOCK,
    LOCK,
    UNLOCK,
    WITHDRAW,
    VOTE
  }

export const MODAL_TEXT = {
    UNLOCK: {
      title: `Confirmation`,
      text: `Are you sure you want to unlock your 
    position?`
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
      position? Tokens remain locked until finish.`
    }
  }