import * as Yup from "yup";
import { getNearConfig } from "../lib/near";


const lockValidation = Yup.object().shape({
  amount_lock: Yup.number()
  .min(1, "The amount to lock should be greater than 1 META.")
  .max(
    Yup.ref("balance"),
    `You dont have enough META. Visit <a href='${getNearConfig().refFinance}' target="blank"> this Link </a> to get more.`
  ),
});

export default lockValidation;
