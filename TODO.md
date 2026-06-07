# TODO - Fix registration/account creation + transaction/ledger consistency

## Step 1: Auto-create account on registration
- Update `src/controllers/auth.controller.js` so that `userRegisterController` creates an `account` document for the new user after saving the user.
- Ensure it uses `accountModel` and imports it.

## Step 2: Fix transaction/account status casing mismatch
- Update `src/controllers/transaction.controller.js` checks to use `active` (lowercase) to match `accounts.model.js` enum.

## Step 3: Fix ledger type casing mismatch
- Update `src/controllers/transaction.controller.js` ledger writes to use `debit`/`credit` (lowercase) to match `ledger.model.js` enum.

## Step 4: Fix missing `await` in `createInitialFundsController`
- Add `await`/correct query usage for `toUserAccount`.

## Step 5: Run quick verification
- Start server (if not running) and hit:
  - `POST /api/auth/register`
  - then verify `accounts` collection has a document for that user
  - and hit a transaction endpoint to ensure it doesn’t fail due to status/type enums.

