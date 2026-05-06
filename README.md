# Frontend

Next.js App Router starter using TypeScript.

## Run locally

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env`.
3. Start the app:

   ```powershell
   npm run dev
   ```

## TDD workflow

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Run the fast unit/component test lane:

   ```powershell
   npm run test:watch
   ```

3. Run the CI-style unit lane once:

   ```powershell
   npm run test
   ```

4. Run typechecking and a production build:

   ```powershell
   npm run typecheck
   npm run build
   ```

5. Install the Playwright browser once, then run the browser smoke test:

   ```powershell
   npx playwright install chromium
   npm run test:e2e
   ```


