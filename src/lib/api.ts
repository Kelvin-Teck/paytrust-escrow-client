const BASE_URL = 'https://paytrust-escrow-wallet.onrender.com/api/v1';

export const authApi = {
  login: async (payload: any) => {
    console.log('[API Request] POST /auth/login with payload:', payload);
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('[API Response] /auth/login status:', response.status, 'data:', data);
      
      if (!response.ok) throw new Error(data.message || 'Login failed');
      return data;
    } catch (error) {
      console.error('[API Error] /auth/login error:', error);
      throw error;
    }
  },

  register: async (payload: any) => {
    console.log('[API Request] POST /auth/register with payload:', payload);
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('[API Response] /auth/register status:', response.status, 'data:', data);
      
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      return data;
    } catch (error) {
      console.error('[API Error] /auth/register error:', error);
      throw error;
    }
  },

  verify: async (payload: { email: string; code: string }) => {
    console.log('[API Request] POST /auth/verify with payload:', payload);
    try {
      const response = await fetch(`${BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('[API Response] /auth/verify status:', response.status, 'data:', data);
      
      if (!response.ok) throw new Error(data.message || 'Verification failed');
      return data;
    } catch (error) {
      console.error('[API Error] /auth/verify error:', error);
      throw error;
    }
  },

  resendVerification: async (payload: { email: string }) => {
    console.log('[API Request] POST /auth/resend-verification with payload:', payload);
    try {
      const response = await fetch(`${BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('[API Response] /auth/resend-verification status:', response.status, 'data:', data);
      
      if (!response.ok) throw new Error(data.message || 'Failed to resend code');
      return data;
    } catch (error) {
      console.error('[API Error] /auth/resend-verification error:', error);
      throw error;
    }
  },
};
