import { Cashfree, CFEnvironment } from "cashfree-pg";

const clientId =
  process.env.CASHFREE_CLIENT_ID || process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID;
const clientSecret =
  process.env.CASHFREE_CLIENT_SECRET ||
  process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET;

const env =
  process.env.NEXT_PUBLIC_CASHFREE_MODE === "production"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

if (!clientId || !clientSecret) {
  throw new Error("Credentials invalid");
}
export const cashfree = new Cashfree(env, clientId, clientSecret);
