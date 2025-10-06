// app/api/v1/create-order/route.ts

//this is for redirecting POST request to payment_helper

import { payment_helper } from "../_payment/utils";

export async function POST(req: Request) {
  return payment_helper(req);
}
