import * as Yup from "yup";

const voteValidation = Yup.object().shape({
  amount_deposit: Yup.number().min(0).max(
    Yup.ref("balance"),
    `You dont have enough Voting Power. Lock METAS to get more.`
  ),
});

export default voteValidation;
