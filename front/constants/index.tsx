
 export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_METAVOTE;

export const enum ACTION_TYPE {
    RELOCK,
    LOCK,
    UNLOCK,
    WITHDRAW,
    VOTE
  }

export const MODAL_TEXT = {
    UNLOCK: {
      title: `Remove vote position`,
      text: `Are you sure you want to remove this position? Your tokens will release when locking period ends.`
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