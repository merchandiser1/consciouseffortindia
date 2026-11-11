import { resendOtp } from "@/app/controllers/userController";



export async function POST(req) {
  return resendOtp(req);
}
