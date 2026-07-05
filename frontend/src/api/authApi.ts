import { apiClient } from './apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export function login(request: LoginRequest) {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function register(request: RegisterRequest) {
  return apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
