export type TokenCalt =
  | "metapoolm"
  | "metayieldlogo"
  | "metavotelogo"
  | "metabondslogo"
  | "metawalletlogo"
  | "metarecipeslogo"
  | "metalogo"
  | "metacircle"
  | "stnearlogo"
  | "stnearcircle"
  | "nearlogo"
  | "nearcircle"
  | "auroralogo"
  | "auroracircle"
  | "matetime";

  export const NativeCurrencies = ["NEAR"] as const;
  export type NativeCurrency = typeof NativeCurrencies[number]
  

  export enum TokenNameCalt {
    "NEAR" = "nearcircle",
    "STNEAR" = "stnearcircle",
    "META" = "metacircle"
  }