import { logout } from "@/app/controllers/userController";



export async function POST(req) {
  return logout(req);
}
