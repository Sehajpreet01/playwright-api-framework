// Products API — /api/v1/products
//
// Describe blocks:
//   1. GET list — independent, runs in any order
//   2. CRUD flow (serial) — Create → Get → Update → Delete with shared state

import { test, expect } from '@playwright/test';
import { getAuthToken, getNonSuperAuthToken } from '../../utils/authHelper.js';
import { ProductsController } from '../../controllers/products/ProductsController.js';
import { projectId } from '../../utils/config.js';


// ─── GET LIST ────────────────────────────────────────────────────────────────

test.describe('Products - GET list @products', () => {
  let api;
  let guestApi;

  test.beforeAll(async ({ request }) => {
    const token      = await getAuthToken(request);
    const guestToken = await getNonSuperAuthToken(request);
    api      = new ProductsController(request, token);
    guestApi = new ProductsController(request, guestToken);
  });


  test('GET list - 200 returns array with correct structure', async () => {
    const res = await api.listProducts();

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);

    const first = body.products[0];
    expect(first.id).toBeTruthy();
    expect(typeof first.name).toBe('string');
    expect(typeof first.price).toBe('number');
  });


  test('GET list - 200 filter by category', async () => {
    const res = await api.listProducts({ category: 'electronics' });

    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
  });


  test('GET list - 401 no token', async ({ request }) => {
    const res = await request.get('/api/v1/products');

    expect(res.status()).toBe(401);
  });


  test('GET list - 403 guest cannot list all products', async () => {
    const res = await guestApi.listProducts();

    expect(res.status()).toBe(403);
  });
});


// ─── CRUD FLOW ───────────────────────────────────────────────────────────────

test.describe.serial('Products - CRUD flow @products', () => {
  let api;
  let productId;

  const productName = `QA Product ${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    const token = await getAuthToken(request);
    api = new ProductsController(request, token);
  });


  // ── POST ──────────────────────────────────────────────────────────────────

  test('POST create - 201 returns new product', async () => {
    const res = await api.createProduct({
      name:       productName,
      price:      99.99,
      category:   'electronics',
      project_id: projectId
    });

    expect(res.status()).toBe(201);

    const body = await res.json();
    productId  = body.product.id;
    expect(productId).toBeTruthy();
    expect(body.product.name).toBe(productName);
  });


  test('POST create - 400 missing required fields', async () => {
    const res = await api.createProduct({ price: 10 });

    expect(res.status()).toBe(400);
  });


  // ── GET SINGLE ────────────────────────────────────────────────────────────

  test('GET single - 200 returns correct product', async () => {
    expect(productId).toBeDefined();

    const res  = await api.getProduct(productId);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.product.id).toBe(productId);
    expect(body.product.name).toBe(productName);
  });


  test('GET single - 404 non-existent ID', async () => {
    const res = await api.getProduct(0);
    expect(res.status()).toBe(404);
  });


  // ── PATCH ─────────────────────────────────────────────────────────────────

  test('PATCH update - 200 name changes', async () => {
    expect(productId).toBeDefined();

    const res = await api.updateProduct(productId, { name: 'QA Product Updated' });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.product.name).toBe('QA Product Updated');
  });


  // ── DELETE ────────────────────────────────────────────────────────────────

  test('DELETE - 204 success then 404 on GET', async () => {
    expect(productId).toBeDefined();

    const res = await api.deleteProduct(productId);
    expect(res.status()).toBe(204);

    const getRes = await api.getProduct(productId);
    expect(getRes.status()).toBe(404);
  });
});
