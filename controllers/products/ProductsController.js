import { BaseController } from '../BaseController.js';

export class ProductsController extends BaseController {
  listProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/api/v1/products${query ? '?' + query : ''}`);
  }

  getProduct(id) {
    return this.get(`/api/v1/products/${id}`);
  }

  createProduct(data) {
    return this.post('/api/v1/products', data);
  }

  updateProduct(id, data) {
    return this.patch(`/api/v1/products/${id}`, data);
  }

  deleteProduct(id) {
    return this.delete(`/api/v1/products/${id}`);
  }
}
