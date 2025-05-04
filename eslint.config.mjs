import { defineConfig } from "eslint/config";
import babelParser from "@babel/eslint-parser";

export default defineConfig([{
    files: ["lib/**"],
    languageOptions: {
        parser: babelParser,
        parserOptions: {
            requireConfigFile: false,
            babelOptions: {
                babelrc: false,
                configFile: false,
                // your babel options
                presets: ["@babel/preset-env"],
            }
        }
    },
}]);