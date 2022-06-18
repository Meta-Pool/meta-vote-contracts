import { WalletConnection } from "near-api-js";
import create from "zustand";

interface WalletState {
  wallet: WalletConnection | null;
  setWallet: (value: WalletConnection | null) => void;
}

export const useStore = create<WalletState>((set) => ({
  wallet: null,
  setWallet: (value: WalletConnection | null) => set((state) => ({...state , wallet: value })),
}));
