import create from "zustand/vanilla";
import { PageBlockerState } from "../pages/components/PageBlocker";

export const blockerStore = create<PageBlockerState>(() => ({
  message: "Confirm this action in your wallet",
  isActive: false,
}));
