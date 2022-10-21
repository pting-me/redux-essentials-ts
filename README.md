# Redux Essentials - TypeScript

This is a TypeScript version of the [Redux Essentials Tutorial](https://github.com/reduxjs/redux-essentials-example-app). It tries to follow the original as closely as possible, with a few notable differences:

- All JavaScript files are converted to TypeScript
  - Extensions have been made into `.ts` and `.tsx`, depending on their use of JSX
- ESLint setup includes TypeScript
- Vite is used for building rather than `react-scripts` (Webpack)
  - Vite requires `index.html` to be in a different location. See [here](https://vitejs.dev/guide/#index-html-and-project-root) for more details.
- `index.js` is now `main.tsx`, and `index.css` is now `main.css`
  - This isn't strictly required but it's a Vite convention.
- React Router upgraded to v6
  - There are a lot of API changes that are incompatible. See [here](https://blog.logrocket.com/migrating-react-router-v6-complete-guide/) for more details.
- `faker` has been replaced with `@faker-js/faker`
  - `faker` appears to be unmaintained, and as for the latest package... [see for yourself](https://www.npmjs.com/package/faker/v/6.6.6).
- Unused libraries are uninstalled
- Husky will run `Prettier` at every commit
  - If this is undesirable, simply delete the `lint-staged` portion at the bottom of `package.json`.
- `App.js` has been renamed to `AppContainer.tsx`
  - This is to avoid naming conflicts (e.g. if `app/index.ts` were to be added).
  - IMO it's better to renamed `app` to something like `lib`, but that would require more code changes. This change is easier to follow.
- Function component declarations (e.g. `function MyComponent()`) have been changed to arrow function expressions (e.g. `const MyComponent: FC<Props> =`)
  - This facilitates better typing practices, and is more common in modern code.
  - The two are not strictly the same. See [here](https://exploringjs.com/impatient-js/ch_callables.html) for more details.
