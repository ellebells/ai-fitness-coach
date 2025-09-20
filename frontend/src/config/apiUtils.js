// API utility functions
import axios from 'axios';
import { API_ENDPOINTS } from './api';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection to:', API_ENDPOINTS.health);
    const response = await axios.get(API_ENDPOINTS.health, { timeout: 5000 });
    console.log('Backend health check successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Backend connection failed:', error);
    return { success: false, error: error.message };
  }
};

export const debugApiEndpoints = () => {
  console.log('API Endpoints:', API_ENDPOINTS);
  console.log('Current origin:', window.location.origin);
};