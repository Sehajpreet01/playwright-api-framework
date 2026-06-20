import { BaseController } from '../BaseController.js';

export class UsersController extends BaseController {
  listUsers() {
    return this.get('/api/v1/users');
  }

  getUser(id) {
    return this.get(`/api/v1/users/${id}`);
  }

  createUser(data) {
    return this.post('/api/v1/users', data);
  }

  updateUser(id, data) {
    return this.patch(`/api/v1/users/${id}`, data);
  }

  deleteUser(id) {
    return this.delete(`/api/v1/users/${id}`);
  }
}
