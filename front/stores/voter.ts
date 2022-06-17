import create from "zustand";

export interface VoterContractData {
  votingPower: string,
  inUseVPower: string,
  projectsFinished: string,
  projectsVoted: string,
  metaLocked: string,
  metaUnlocking: string,
  metaToWithdraw: string,
  lockingPositions: Array<any>,
  votingResults: Array<any>,
}

export interface VoterData {
  voterData: VoterContractData,
  setVoterData: (newVoterData: VoterContractData) => void
}

const initVoterData: VoterContractData = {
  votingPower: '0',
  inUseVPower: '0',
  projectsFinished: '0',
  projectsVoted: '0',
  metaLocked: '0',
  metaUnlocking: '0',
  metaToWithdraw: '0',
  lockingPositions: [],
  votingResults: []
}

export const useStore = create<VoterData>((set) => ({
  voterData: initVoterData,
  setVoterData: (newVoterData: VoterContractData) => set((state) => {
    return ({ ...state , voterData: newVoterData })
  })
}));
