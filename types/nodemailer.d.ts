// Type declaration for nodemailer (no @types/nodemailer in package.json)
declare module "nodemailer" {
  interface Transporter {
    sendMail(options: any): Promise<any>;
  }
  interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: { user: string; pass: string };
  }
  function createTransport(options: TransportOptions): Transporter;
  export = { createTransport };
}
