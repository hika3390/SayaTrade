import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      'no-var': 'off', // no-varルールをオフにする
      '@typescript-eslint/no-unused-vars'  : 'off', // no-unused-varsルールをオフにする
      '@typescript-eslint/no-explicit-any': 'off', // any型の使用を許可する
      '@typescript-eslint/no-empty-object-type': 'off', // 空のオブジェクト型の使用を許可する
    },
  },
];

export default eslintConfig;
