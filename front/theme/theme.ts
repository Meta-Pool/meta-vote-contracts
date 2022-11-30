import { color, extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { theme as proTheme } from "@chakra-ui/pro-theme";
import { colors } from "../constants/colors";

const sizes = {
  sizes: {
    ...proTheme.space,
    max: "max-content",
    min: "min-content",
    full: "100%",
    "3xs": "14rem",
    "2xs": "16rem",
    xs: "20rem",
    sm: "24rem",
    md: "28rem",
    lg: "32rem",
    xl: "76px",
    "2xl": "42rem",
    "3xl": "48rem",
    "4xl": "56rem",
    "5xl": "64rem",
    "6xl": "72rem",
    "7xl": "80rem",
    "8xl": "90rem",
    container: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
};

const customTheme = extendTheme(
  {
    initialColorMode: "light",
    useSystemColorMode: false,
    colors: { ...colors, brand: colors.indigo },
    sizes,
    styles: {
      global: () => ({
        body: {
          // bg: "linear-gradient(180deg, #4121EE -2.88%, #735DE9 100%)",
        }
      })
    },
    breakpoints: {
      sm: '30em',
      md: '72em',
      lg: '62em',
      xl: '80em',
      '2xl': '96em',
    },    
    fonts: {
      heading: "Inter",
      body: "Inter",
      meta: "Meta Space"
    },
  },
  proTheme
);

export default customTheme;
