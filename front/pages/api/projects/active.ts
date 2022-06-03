// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Project, data } from "../_data";
import {
  getActiveProjects,
  getKickstarters,
  getProjectDetails,
} from "../../../lib/near";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  let result: { open: any[]; active: any[]; finished: any[] } = {
    open: [],
    active: [],
    finished: [],
  };

  const activeProjects = await getKickstarters();
  // TODO check active and successful flags to filter projects accordantly
  if (activeProjects) {
    for (const project of activeProjects) {
      const projectOnChain = await getProjectDetails(project.id);
      const projectStatic = data.find((sp) => sp.id === project.id);
      result.open.push({
        ...projectStatic,
        kickstarter: projectOnChain,
      });
    }
  }
  res.status(200).json(result);
}
