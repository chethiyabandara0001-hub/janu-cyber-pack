// @ts-ignore
import { createExpressApp } from "../server";

let appPromise: any = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) {
      appPromise = createExpressApp();
    }
    const app = await appPromise;
    return app(req, res);
  } catch (error: any) {
    console.error("[VERCEL-HANDLER-ERROR]:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Server Initialization Error",
        message: error?.message || String(error),
        stack: process.env.NODE_ENV === "production" ? undefined : error?.stack
      });
    }
  }
}


