const util = require("util");

function formatMeta(meta) {
  try {
    if (!meta) return "";
    if (typeof meta === "string") return meta;
    return JSON.stringify(meta);
  } catch (e) {
    return String(meta);
  }
}

const logger = {
  info: (msg, meta) =>
    console.log(
      JSON.stringify({
        level: "info",
        message: msg,
        meta: formatMeta(meta),
        timestamp: new Date().toISOString(),
      }),
    ),
  error: (msg, meta) =>
    console.error(
      JSON.stringify({
        level: "error",
        message: msg,
        meta: formatMeta(meta),
        timestamp: new Date().toISOString(),
      }),
    ),
  warn: (msg, meta) =>
    console.warn(
      JSON.stringify({
        level: "warn",
        message: msg,
        meta: formatMeta(meta),
        timestamp: new Date().toISOString(),
      }),
    ),
  debug: (msg, meta) =>
    console.debug(
      JSON.stringify({
        level: "debug",
        message: msg,
        meta: formatMeta(meta),
        timestamp: new Date().toISOString(),
      }),
    ),
  child: () => logger,
};

module.exports = logger;
