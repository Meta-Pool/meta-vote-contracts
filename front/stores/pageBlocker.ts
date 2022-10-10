import create from "zustand/vanilla";
import { PageBlockerState } from "@meta-pool-apps/meta-shared-components";

export const blockerStore = create<PageBlockerState>(() => ({
  message: "Confirm this action in your wallet",
  isActive: false,
}));
