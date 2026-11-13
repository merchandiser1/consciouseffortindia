import { submitApplication } from "@/app/controllers/applicationController";

export async function POST(req) {
  return submitApplication(req);
}