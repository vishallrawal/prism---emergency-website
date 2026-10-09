module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'PRISM Emergency Response API',
    version: '1.0.0',
    description: 'Development API for PRISM safety, emergency-service, routing, blood-donor, and administration features.'
  },
  servers: [{ url: 'http://localhost:5000', description: 'Local development server' }],
  tags: [
    { name: 'System' }, { name: 'Authentication' }, { name: 'Services' },
    { name: 'Blood donors' }, { name: 'Maps' }, { name: 'AI' }, { name: 'Admin' }
  ],
  paths: {
    '/api/health': { get: { tags: ['System'], summary: 'Server health check', responses: { 200: { description: 'Server status' } } } },
    '/api/auth/register': { post: { tags: ['Authentication'], summary: 'Create a user account', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } }, responses: { 201: { description: 'Account created' }, 400: { description: 'Invalid request' }, 409: { description: 'Email already registered' } } } },
    '/api/auth/login': { post: { tags: ['Authentication'], summary: 'Sign in and create a session', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } }, responses: { 200: { description: 'Signed in' }, 401: { description: 'Invalid credentials' } } } },
    '/api/auth/logout': { post: { tags: ['Authentication'], summary: 'End the active session', responses: { 200: { description: 'Signed out' } } } },
    '/api/auth/me': { get: { tags: ['Authentication'], summary: 'Get active user', responses: { 200: { description: 'Active user' }, 401: { description: 'No session' } } } },
    '/api/auth/profile': { put: { tags: ['Authentication'], summary: 'Update active user profile', responses: { 200: { description: 'Profile updated' }, 401: { description: 'No session' } } } },
    '/api/services': { get: { tags: ['Services'], summary: 'List nearby emergency services', parameters: [{ name: 'category', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Service list' } } } },
    '/api/services/counts': { get: { tags: ['Services'], summary: 'Count services by category', responses: { 200: { description: 'Category counts' } } } },
    '/api/blood-donors': { get: { tags: ['Blood donors'], summary: 'List blood donors', parameters: [{ name: 'bloodGroup', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Donor list' } } } },
    '/api/blood-donors/request': { post: { tags: ['Blood donors'], summary: 'Create an urgent blood request', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BloodRequest' } } } }, responses: { 201: { description: 'Request dispatched' }, 400: { description: 'Invalid request' } } } },
    '/api/blood-donors/requests': { get: { tags: ['Blood donors'], summary: 'List blood requests', responses: { 200: { description: 'Request list' } } } },
    '/api/maps/config': { get: { tags: ['Maps'], summary: 'Get map configuration', responses: { 200: { description: 'Map configuration' }, 503: { description: 'TomTom is not configured' } } } },
    '/api/maps/route': { get: { tags: ['Maps'], summary: 'Calculate an emergency route', parameters: [{ name: 'start', in: 'query', required: true, schema: { type: 'string' } }, { name: 'end', in: 'query', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Route' }, 400: { description: 'Missing locations' } } } },
    '/api/ai/chat': { post: { tags: ['AI'], summary: 'Ask the emergency assistant', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['message'], properties: { message: { type: 'string' } } } } } }, responses: { 200: { description: 'Assistant reply' } } } },
    '/api/admin/login': { post: { tags: ['Admin'], summary: 'Sign in as an administrator', responses: { 200: { description: 'Admin session created' }, 403: { description: 'Not an administrator' } } } },
    '/api/admin/stats': { get: { tags: ['Admin'], summary: 'Get dashboard metrics (admin session required)', responses: { 200: { description: 'Dashboard metrics' }, 403: { description: 'Admin session required' } } } },
    '/api/admin/users': { get: { tags: ['Admin'], summary: 'List users (admin session required)', responses: { 200: { description: 'User list' }, 403: { description: 'Admin session required' } } } }
  },
  components: {
    schemas: {
      RegisterRequest: { type: 'object', required: ['fullName', 'email', 'password', 'confirmPassword'], properties: { fullName: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' }, confirmPassword: { type: 'string', format: 'password' } } },
      LoginRequest: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password' } } },
      BloodRequest: { type: 'object', required: ['patientName', 'bloodGroup', 'hospitalLocation', 'contactNumber'], properties: { patientName: { type: 'string' }, bloodGroup: { type: 'string' }, hospitalLocation: { type: 'string' }, contactNumber: { type: 'string' } } }
    }
  }
};
