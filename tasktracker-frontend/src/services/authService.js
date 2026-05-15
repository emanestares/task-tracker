import apiClient from '../api/client';

const AuthService = {
  async login(credentials) {
    const { data } = await apiClient.post('/api/auth/login', credentials);
    return data; // expects { token, user }
  },

  async register(payload) {
    const { data } = await apiClient.post('/api/auth/register', payload);
    return data;
  },

  async editProfile(payload) {
    const { data } = await apiClient.post('/api/auth/edit', payload);
    return data;
  },
};

export default AuthService;
