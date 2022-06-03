import { useQuery } from "react-query";
import {
  queryExample
} from "../queries/example";


export const useExample = () => {
  return useQuery("example", () => queryExample(), {
    onError: (err) => {
      console.error(err);
    },
  });
};


