import { METAPOOL_CONTRACT_ID, METAPOOL_DEV_CONTRACT_ID, IS_PRODUCTION } from "../../../lib/near";
import { NativeCurrencies, NativeCurrency, TokenCalt, TokenNameCalt } from "./tokenIcon.types";
export const getCurrencyTokenCalt = (currency: NativeCurrency): TokenCalt => {
  return TokenNameCalt[currency];
};

export const isDenominationACurrency = (denomination: any): denomination is NativeCurrency => {
  return typeof denomination === 'string' && NativeCurrencies.indexOf(denomination as any) !== -1;
};

export const isNearDenomination = (denomination: any): boolean=> {
  return denomination == 'NEAR';
};

export const isStNearDenomination = (denomination: any) : boolean => {
  return IS_PRODUCTION ? denomination == METAPOOL_CONTRACT_ID : denomination == METAPOOL_DEV_CONTRACT_ID;
}