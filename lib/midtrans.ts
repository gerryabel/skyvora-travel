// lib/midtrans.ts
// Midtrans Snap client configuration

// @ts-ignore: midtrans-client has no TypeScript types
const midtransClient = require("midtrans-client") as any;

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

export default snap;

// Map metode payment kita ke Midtrans payment type
export function getMidtransPaymentType(metode: string): string[] {
  switch (metode) {
    case "gopay":
      return ["gopay"];
    case "ovo":
      return ["ovo"];
    case "shopeepay":
      return ["shopeepay"];
    case "va_bca":
      return ["bank_transfer", "bca"];
    case "va_mandiri":
      return ["bank_transfer", "mandiri"];
    case "va_bri":
      return ["bank_transfer", "bri"];
    case "transfer":
      return ["bank_transfer"];
    default:
      return [];
  }
}

// Generate unique order ID
export function generateOrderId(bookingId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ABL-${bookingId.substring(0, 6)}-${timestamp}-${random}`;
}
