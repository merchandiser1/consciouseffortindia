import { login } from "@/app/controllers/userController";



export async function POST(req) {
  return login(req);
}
