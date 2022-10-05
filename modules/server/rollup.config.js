import CommonJs from "@rollup/plugin-commonjs";
import Json from "@rollup/plugin-json";
import NodeResolve from "@rollup/plugin-node-resolve";
import Replace from "@rollup/plugin-replace";
import Typescript from "@rollup/plugin-typescript";

// NOTE: this config includes a hacky fixes to handle circular dependencies
// https://github.com/rollup/rollup/issues/1507#issuecomment-340550539

export default {
  input: "./src/index.ts",
  output: [{
    file: "build/bundle.js",
    format: "cjs",
    sourcemap: true,
  }],
  onwarn: (warning, warn) => {
    // Ignore known warnings
    const fromPkg = (pkgName) => warning?.id?.startsWith(`/root/node_modules/${pkgName}`);
    if (warning.code === "EVAL" && fromPkg("depd")) return;
    warn(warning);
  },
  external: [
    "ipfs-client",
    "native-fetch",
    "node-fetch",
    "readable-stream",
    "readable-stream/transform",
  ],
  plugins: [
    NodeResolve({
      exportConditions: ["node"],
      preferBuiltins: true,
    }),
    Replace({
      delimiters: ["", ""],
      preventAssignment: true,
      values: {
        "require('readable-stream/transform')": "require('stream').Transform",
        'require("readable-stream/transform")': 'require("stream").Transform',
        "readable-stream": "stream",
      }
    }),
    Json({ compact: true }),
    Typescript({
      outputToFilesystem: true,
      tsconfig: "./tsconfig.json",
    }),
    CommonJs({
      include: ["./src/index.ts", /node_modules/],
      transformMixedEsModules: true,
    }),
  ],
};
