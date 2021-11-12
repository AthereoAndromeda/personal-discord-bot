import path from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import pino from "pino";
import { checkNodeEnv } from "../utils";

const logPaths = {
  info: path.resolve(__dirname, "../../logs/info.log"),
  error: path.resolve(__dirname, "../../logs/error.log"),
};

export function setupLogFiles(_logPaths: { [k: string]: string }) {
  for (const key in _logPaths) {
    const logPath = _logPaths[key];

    if (!existsSync(path.resolve(logPath, "../"))) {
      mkdirSync(path.resolve(logPath, "../"));
    }

    if (!existsSync(logPath)) {
      writeFileSync(logPath, "");
    }
  }
}

setupLogFiles(logPaths);

const targets: pino.TransportTargetOptions[] = [
  {
    target: "pino/file",
    options: { destination: logPaths.info },
    level: "debug",
  },
  {
    target: "pino/file",
    options: { destination: logPaths.error },
    level: "error",
  },
];

if (checkNodeEnv("development")) {
  targets.push({
    target: "pino-pretty",
    options: { destination: 1 },
    level: "debug",
  });
}

const pinoTransport = pino.transport({ targets });
const logger = pino(pinoTransport);

export default logger;
