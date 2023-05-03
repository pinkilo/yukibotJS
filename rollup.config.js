const ts = require("@rollup/plugin-typescript")
const shebang = require("rollup-plugin-add-shebang")
const copy = require("rollup-plugin-copy")

module.exports = {
  input: "src/index.ts",
  output: {
    file: "build/yuki.js",
    format: "cjs",
  },
  watch: {
    include: ["src/**/*", "public/**/*"]
  },
  plugins: [
    ts({outputToFilesystem: false, tsconfig: "tsconfig.build.json"}),
    copy({targets: [{src: "public", dest: "build"}]}),
    shebang({
      include: "yuki.js",
      shebang: "#!/usr/bin/env node",
    }),
  ],
  external: [
    "path",
    "fs",
    "dotenv",
    "eslint",
    "express",
    "googleapis",
    "typescript",
    "ws",
    "winston",
    "util",
    "env",
    "process",
    "readline",
    "packetier"
  ],
}
