import * as Yup from "yup";
import { getNearConfig } from "../lib/near";

const lockValidation = Yup.object().shape({
  amount_deposit: Yup.number().max(
    Yup.ref("balance"),
    `You dont have enough META. Visit <a href='${getNearConfig().metapoolUrl}' target="blank"> Metapool </a> to get more.`
  ),
});

export default lockValidation;
