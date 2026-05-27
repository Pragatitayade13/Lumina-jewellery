import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  business: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.business = action.payload.business;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      try {
        localStorage.setItem('luxeorbit_user', JSON.stringify(action.payload.user));
        if (action.payload.business) {
          localStorage.setItem('luxeorbit_business', JSON.stringify(action.payload.business));
        } else {
          localStorage.removeItem('luxeorbit_business');
        }
        if (action.payload.token) {
          localStorage.setItem('luxeorbit_token', action.payload.token);
        }
      } catch (e) {
        console.error('Error saving credentials to localStorage', e);
      }
    },
    logout: (state) => {
      state.user = null;
      state.business = null;
      state.token = null;
      state.isAuthenticated = false;
      try {
        localStorage.removeItem('luxeorbit_user');
        localStorage.removeItem('luxeorbit_business');
        localStorage.removeItem('luxeorbit_token');
      } catch (e) {
        console.error('Error removing credentials from localStorage', e);
      }
    },
  },
});

export const { setAuthLoading, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
