import { signup } from "@/app/controllers/userController";


export async function POST(req) {
  return signup(req);
}
