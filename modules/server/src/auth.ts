import express from "express";

import { env } from "./env";
import { logger } from "./utils";

const log = logger.child({ module: "AuthRouter" });

export const authRouter = express.Router();

const authHeaderKey = "authorization";
const authType = "Basic";
const encodedToken = Buffer.from(`ligmex:${env.vipToken}`).toString("base64");

const restrictedMethods = ["DELETE", "POST", "PUT"];
const restrictedPaths = ["/ipfs"];

authRouter.use((req, res, next) => {
  if (restrictedPaths.includes(req.path) || restrictedMethods.includes(req.method)) {
    const authHeader = req.headers[authHeaderKey];
    if (!req.headers[authHeaderKey] || authHeader !== `${authType} ${encodedToken}`) {
      res.setHeader("www-authenticate", authType);
      // Log a description re why auth failed
      const prefix = `Failed to auth ${req.method} to ${req.path}`;
      if (!authHeader) {
        log.warn(`${prefix}, no ${authHeaderKey} header provided.`);
      } else if (!authHeader.includes(" ")) {
        log.warn(`${prefix}, invalid auth header format. Got: "${authHeader}"`);
      } else if (!authHeader.startsWith(`${authType} `)) {
        log.warn(`${prefix}, invalid auth type. Got ${authHeader.split(" ")[0]} (!== ${authType})`);
      } else {
        const givenHeader = Buffer.from(authHeader.split(" ")[1]!, "base64").toString("utf8");
        if (!givenHeader || !givenHeader.includes(":")) {
          log.warn(`${prefix}, invalid header format. Got: "${givenHeader}"`);
        } else {
          const givenToken = givenHeader.split(":")[1];
          if (env.vipToken !== givenToken)  {
            log.warn(`${prefix}, invalid password. Got: ${givenToken} (!= ${env.vipToken})`);
          } else {
            log.warn(`${prefix}, unknown error verifying token: ${givenToken}`);
          }
        }
      }
      res.status(401).send("Unauthorized");
    } else {
      log.info(`Successfully authenticated ${req.method} to ${req.path}`);
      next();
    }
  } else {
    log.debug(`Authentication not required for ${req.method} to ${req.path}`);
    next();
  }
});
