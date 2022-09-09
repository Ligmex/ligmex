import express from "express";

import { logger } from "../utils";

import { rmPin } from "./delete";
import { lsPins } from "./list";
import { read } from "./read";
import { save } from "./save";

export const ipfsRouter = express.Router();

const log = logger.child({ module: "IpfsRouter" });

// Get list of pins
ipfsRouter.get("/", async (req, res, _next): Promise<void> => {
  try {
    const result = await lsPins();
    res.setHeader("content-type", "application/json");
    res.status(200).send(result);
  } catch (e) {
    log.error(e);
    res.status(500).send(e.message);
  }
});

// Get content at path
ipfsRouter.get("/*", async (req, res, _next): Promise<void> => {
  try {
    const path = `/ipfs/${req.path.replace(/^\//, "")}`;
    log.info(`${req.method}-ing path ${path}`);
    const { contentType, content } = await read(path);
    res.setHeader("content-type", contentType);
    log.info(`Returning ${contentType} content`);
    res.status(200).send(content);
  } catch (e) {
    log.error(e);
    res.status(500).send(e.message);
  }
});

// Delete pin for content at path
ipfsRouter.delete("/*", async (req, res, _next): Promise<void> => {
  try {
    const path = `/ipfs/${req.path.replace(/^\//, "")}`;
    log.info(`${req.method}-ing path ${path}`);
    const result = await rmPin(path);
    res.setHeader("content-type", "application/json");
    res.status(200).send(result);
  } catch (e) {
    log.error(e);
    res.status(500).send(e.message);
  }
});

// Upload payload
const upload = async (req, res, _next): Promise<void> => {
  try {
    log.info(`${req.method}-ing path ${req.path} w ${req.body.length || 0} bytes of data`);
    const result = await save(req.body);
    log.info(`Added file to ipfs with path: ${result}`);
    res.send(result);
  } catch (e) {
    log.error(e.message);
    res.status(500).send(e.message);
  }
};
ipfsRouter.put("/", upload);
ipfsRouter.post("/", upload);
