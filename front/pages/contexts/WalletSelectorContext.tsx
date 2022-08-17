import React, { useCallback, useContext, useEffect, useState } from "react";
import { map, distinctUntilChanged } from "rxjs";
import { NetworkId, setupWalletSelector, Wallet } from "@near-wallet-selector/core";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { NearWalletParams, setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupNightlyConnect } from "@near-wallet-selector/nightly-connect";
import { CONTRACT_ID, NETWORK_ID } from "../../lib/near";


declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
    account_id: string | null;
    wallet: Wallet | null;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
}



const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);
  
export const WalletSelectorContextProvider: React.FC = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);

  const setupNearWalletCustom = () => {
    return async (options: any) => {
      const wallet = await setupMyNearWallet({
        walletUrl: "https://wallet.testnet.near.org",
        iconUrl: "./assets/near-wallet-iconx.png",
      })(options);
  
      if (!wallet) {
        return null;
      }
  
      return {
        ...wallet,
        id: "near-wallet",
        metadata: {
          ...wallet.metadata,
          name: "NEAR Wallet",
          description: null,
          iconUrl: "./assets/near-wallet-icon.png",
          deprecated: false,
          available: true,
        },
      };
    };
  }

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: NETWORK_ID as NetworkId,
      debug: true,
      modules: [
        setupNearWalletCustom(),
        setupMyNearWallet(),
        setupSender(),
        setupMathWallet(),
        setupNightly(),
        setupLedger(),
        setupWalletConnect({
          projectId: "c4f79cc...",
          metadata: {
            name: "NEAR Wallet Selector",
            description: "Example dApp used by NEAR Wallet Selector",
            url: "https://github.com/near/wallet-selector",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
          },
        }),
        setupNightlyConnect({
          url: "wss://ncproxy.nightly.app/app",
          appMetadata: {
            additionalInfo: "",
            application: "NEAR Wallet Selector",
            description: "Example dApp used by NEAR Wallet Selector",
            icon: "https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png",
          },
        }),
      ],
    });


    const _modal = setupModal(_selector, { contractId: CONTRACT_ID || '' });
    const state = _selector.store.getState();

    setAccounts(state.accounts);

    window.selector = _selector;
    window.modal = _modal;
    window.account_id = _selector.isSignedIn()
      ? _selector.store.getState().accounts.find((account) => account.active)
          ?.accountId || null
      : null;
    window.wallet = _selector.isSignedIn() ? await _selector.wallet() : null;

    setSelector(_selector);
    setModal(_modal);
  }, []);

  useEffect(() => {
    init().catch((err: any) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state: any) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts: any) => {
        console.log("Accounts Update", nextAccounts);

        setAccounts(nextAccounts);
      });

    return () => subscription.unsubscribe();
  }, [selector]);

  if (!selector || !modal) {
    return null;
  }

  const accountId =
    accounts.find((account) => account.active)?.accountId || null;

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
      }}
    >
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
