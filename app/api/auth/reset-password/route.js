import { resetPassword } from "@/app/controllers/userController";


export async function POST(req) {
  return resetPassword(req);
}
