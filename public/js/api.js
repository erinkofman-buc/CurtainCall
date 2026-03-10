const API = {
  async fetch(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.errors ? JSON.stringify(data.errors) : `Request failed: ${res.status}`);
    }
    return res.json();
  },

  // Auth
  signup: (data) => API.fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => API.fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => API.fetch('/api/auth/logout', { method: 'POST' }),
  me: () => API.fetch('/api/auth/me'),

  // Listings
  getListings: (params) => API.fetch(`/api/listings?${new URLSearchParams(params)}`),
  getListing: (id) => API.fetch(`/api/listings/${id}`),
  getConstants: () => API.fetch('/api/listings/constants'),
  getMyListings: () => API.fetch('/api/listings/my/all'),
  createListing: (formData) => fetch('/api/listings', { method: 'POST', body: formData }).then(r => r.json()),
  updateListing: (id, formData) => fetch(`/api/listings/${id}`, { method: 'PUT', body: formData }).then(r => r.json()),
  deleteListing: (id) => API.fetch(`/api/listings/${id}`, { method: 'DELETE' }),

  // Inquiries
  sendInquiry: (data) => API.fetch('/api/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  getSentInquiries: () => API.fetch('/api/inquiries/sent'),
  getReceivedInquiries: () => API.fetch('/api/inquiries/received'),

  // Payments
  createConnect: () => API.fetch('/api/payments/connect/create', { method: 'POST' }),
  checkout: (listingId) => API.fetch('/api/payments/checkout', { method: 'POST', body: JSON.stringify({ listingId }) }),

  // AI
  getSongs: (data) => API.fetch('/api/ai/songs', { method: 'POST', body: JSON.stringify(data) }),
  getDescription: (data) => API.fetch('/api/ai/describe', { method: 'POST', body: JSON.stringify(data) }),
};
