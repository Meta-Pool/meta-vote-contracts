// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Project, data } from "../../_data";
import { getSupporterDetailedList } from "../../../../lib/near";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { id } = req.query as { id: string };
  const result = await getSupporterDetailedList(id);
  res.status(200).json(result);
}
