import { apiRequest } from "./queryClient";
import type { LoginData, SignupData, User } from "@shared/schema";

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/signup", data);
    return response.json();
  },

  getMe: async (): Promise<Omit<User, 'password'>> => {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    
    return response.json();
  },
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
