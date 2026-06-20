export class BaseController {
  constructor(request, token) {
    this.request = request;
    this.token   = token;
  }

  #headers() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type':  'application/json'
    };
  }

  get(url) {
    return this.request.get(url, { headers: this.#headers() });
  }

  post(url, body) {
    return this.request.post(url, { headers: this.#headers(), data: body });
  }

  patch(url, body) {
    return this.request.patch(url, { headers: this.#headers(), data: body });
  }

  delete(url) {
    return this.request.delete(url, { headers: this.#headers() });
  }
}
