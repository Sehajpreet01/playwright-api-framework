<div align="center">

# 🎭 Playwright API Starter

**A production-ready API test automation framework built on [Playwright](https://playwright.dev/)**

[![Playwright](https://img.shields.io/badge/Playwright-1.44+-45ba4b?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![ESM](https://img.shields.io/badge/module-ESM-f7df1e?logo=javascript&logoColor=black)](https://nodejs.org/api/esm.html)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/your-username/playwright-api-starter/pulls)

*Token caching · Controller pattern · Environment switching · Parallel + serial CRUD flows*

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Token Caching** | Module-level cache + in-flight dedup — 4 token calls across an entire suite |
| 🏗️ **Controller Pattern** | Thin API wrappers keep tests focused on assertions, not URL strings |
| 🌍 **Environment Switching** | `ENV=dev` / `ENV=prod` with a single flag, no code changes |
| ⚡ **Parallel + Serial** | Independent tests run in parallel; stateful CRUD flows run serial |
| 📊 **HTML Reports** | Built-in Playwright HTML report with one command |

---

## 📁 Project Structure

```
playwright-api-starter/
├── controllers/
│   ├── BaseController.js          # Shared HTTP methods + auth headers
│   ├── products/
│   │   └── ProductsController.js  # Products API wrapper
│   └── users/
│       └── UsersController.js     # Users API wrapper
├── tests/
│   └── products/
│       └── products.spec.js       # GET list + CRUD flow tests
├── utils/
│   ├── authHelper.js              # Token fetching with caching + deduplication
│   └── config.js                  # Environment-aware config
├── playwright.config.js
├── .env.example                   # Template — copy to .env and fill in values
└── package.json
```

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-username/playwright-api-starter.git
cd playwright-api-starter

# 2. Install dependencies
npm install
npx playwright install

# 3. Set up your environment
cp .env.example .env
# Edit .env with your API base URL and credentials
```

---

## 📋 Project Setup — Step by Step

### Prerequisites

Make sure you have these installed before continuing:

| Tool | Min Version | Check |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | `node -v` |
| [npm](https://www.npmjs.com/) | 9+ | `npm -v` |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/playwright-api-starter.git
cd playwright-api-starter
```

---

### Step 2 — Install dependencies

```bash
npm install
```

This installs:
- `@playwright/test` — test runner and HTTP client
- `dotenv` — loads `.env` files
- `cross-env` — cross-platform environment variable support

---

### Step 3 — Install Playwright browsers

```bash
npx playwright install
```

> **Note:** Playwright bundles its own browser binaries. This downloads them locally — internet access required on first run.

---

### Step 4 — Set up your `.env` file

```bash
# On Mac/Linux
cp .env.example .env

# On Windows
copy .env.example .env
```

Open `.env` and fill in your values:

```env
# ── Dev environment ────────────────────────────────
BASE_URL_dev=https://api.dev.example.com
TOKEN_URL_dev=https://auth.dev.example.com/oauth/token
CLIENT_ID_dev=your_dev_client_id
CLIENT_SECRET_dev=your_dev_client_secret

# ── Prod environment ───────────────────────────────
BASE_URL_prod=https://api.example.com
TOKEN_URL_prod=https://auth.example.com/oauth/token
CLIENT_ID_prod=your_prod_client_id
CLIENT_SECRET_prod=your_prod_client_secret
```

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

### Step 5 — Verify the setup

Run the test suite against dev to confirm everything is wired up:

```bash
npm run test:dev
```

You should see output like:

```
Running 6 tests using 4 workers

  ✓ [products] › GET /products returns a list (312ms)
  ✓ [products] › CRUD › POST creates a product (541ms)
  ✓ [products] › CRUD › GET returns the product (198ms)
  ✓ [products] › CRUD › PATCH updates the product (221ms)
  ✓ [products] › CRUD › DELETE removes the product (189ms)
  ✓ [products] › GET /products returns 401 without token (102ms)

  6 passed (2.1s)
```

---

### Step 6 — Open the HTML report

```bash
npm run report
```

This opens a browser with a full interactive report showing pass/fail, timings, and request/response details for every test.

---

### Optional — Run a specific tag

```bash
npx playwright test --grep @products
```

---

## 🧪 Running Tests

```bash
# Run all tests against dev
npm run test:dev

# Run all tests against prod
npm run test:prod

# Filter by tag
npx playwright test --grep @products

# Open the last HTML report
npm run report
```

---

## 🏗️ Architecture

<details>
<summary><strong>Controller Pattern</strong> — keep tests clean</summary>

Every API surface gets its own controller that extends `BaseController`. Controllers own URLs and request shape — tests stay pure assertions.

```js
// tests/products/products.spec.js
const res = await api.createProduct({ name: 'Widget', price: 9.99 });
expect(res.status()).toBe(201);
```

**Adding a new API is 3 steps:**
1. Create `controllers/orders/OrdersController.js` extending `BaseController`
2. Create `tests/orders/orders.spec.js` following the GET + CRUD pattern
3. Add new env vars to `.env.example` and `utils/config.js`

</details>

<details>
<summary><strong>Token Caching</strong> — one call per worker, period</summary>

`authHelper.js` caches tokens at the module level for the lifetime of each Playwright worker process.

- Tokens are reused until `expires_in - 60s` (buffer for clock skew)
- In-flight deduplication: if multiple `beforeAll` blocks fire at the same time, only **one** `/oauth/token` request is made — the rest await the same promise

**Result:** 4 total `/oauth/token` calls across a full suite with 4 workers — regardless of test count.

</details>

<details>
<summary><strong>Environment Switching</strong> — zero code changes between envs</summary>

All credentials, base URLs, and IDs are read from `.env` using the `ENV` suffix pattern:

```
BASE_URL_dev=https://api.dev.example.com
BASE_URL_prod=https://api.example.com

CLIENT_ID_dev=abc123
CLIENT_ID_prod=xyz789
```

Switch by setting `ENV` at runtime:

```bash
npm run test:dev    # ENV=dev  → reads *_dev vars
npm run test:prod   # ENV=prod → reads *_prod vars
```

</details>

<details>
<summary><strong>beforeAll, not beforeEach</strong> — no redundant auth calls</summary>

Auth tokens are fetched once per `describe` block (`beforeAll`), not before every test. Combined with module-level caching, this eliminates all redundant auth calls.

</details>

<details>
<summary><strong>Serial CRUD Flows</strong> — controlled state across tests</summary>

Tests that share state (create → get → update → delete) are grouped in `test.describe.serial`. Independent tests (GET list, 401, 403) live in a separate describe block and run in parallel.

```js
// Parallel — no shared state
test.describe('GET /products', () => { ... });

// Serial — each test depends on the previous
test.describe.serial('Product CRUD', () => {
  test('POST creates a product', ...);
  test('GET returns the product', ...);
  test('PATCH updates the product', ...);
  test('DELETE removes the product', ...);
});
```

</details>

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
# Base URLs
BASE_URL_dev=https://api.dev.example.com
BASE_URL_prod=https://api.example.com

# OAuth credentials (dev)
CLIENT_ID_dev=your_client_id
CLIENT_SECRET_dev=your_client_secret
TOKEN_URL_dev=https://auth.dev.example.com/oauth/token

# OAuth credentials (prod)
CLIENT_ID_prod=your_client_id
CLIENT_SECRET_prod=your_client_secret
TOKEN_URL_prod=https://auth.example.com/oauth/token
```

---

## 🛠️ Tech Stack

| Package | Purpose |
|---|---|
| [`@playwright/test`](https://playwright.dev/) | Test runner + HTTP client |
| [`dotenv`](https://github.com/motdotla/dotenv) | Environment variable loading |
| [`cross-env`](https://github.com/kentcdodds/cross-env) | Cross-platform `ENV=` prefix |

---

<div align="center">

Built with ❤️ using [Playwright](https://playwright.dev/)

</div>
