import Bugsnag from "@bugsnag/js";
import BugsnagPluginExpress from "@bugsnag/plugin-express";
import * as fs from "node:fs";

// Figure out the version which comes from the main package.json
const packageJson =
  process.env.NODE_ENV === "production"
    ? fs.readFileSync("../package.json", "utf-8")
    : "";
const version =
  process.env.NODE_ENV === "production"
    ? `${JSON.parse(packageJson).version}`
    : process.env.npm_package_version;

process.env.npm_package_version = version;
console.log("process.env.npm_package_version", process.env.npm_package_version);

Bugsnag.start({
  appVersion: process.env.npm_package_version,
  apiKey: process.env.BS_TOKEN || "",
  plugins: [BugsnagPluginExpress],
  enabledReleaseStages: ["production"],
  logger: null,
  releaseStage:
    process.env.NODE_ENV === "production" ? "production" : "development",
});

export default Bugsnag;
