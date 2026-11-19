import { createEnquiry, getEnquiries } from "../../controllers/enquiryController";

export async function POST(req) {
  return createEnquiry(req);
}

export async function GET() {
  return getEnquiries();
}