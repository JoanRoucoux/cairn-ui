/** @type {import("prettier").Config} */
export default {
  printWidth: 120,
  singleQuote: true,
  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  importOrder: ['^@angular/(.*)$', '<THIRD_PARTY_MODULES>', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
      },
    },
  ],
};
