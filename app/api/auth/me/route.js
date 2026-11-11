import { me } from "@/app/controllers/userController";



export async function GET(req) {
  return me(req);
}
