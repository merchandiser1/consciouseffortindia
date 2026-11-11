import { verifyOtp } from "@/app/controllers/userController";



export async function POST(req) {
  return verifyOtp(req);
}
