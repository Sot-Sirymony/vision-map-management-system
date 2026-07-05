export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  role: string;
};

export type AuthState = {
  token: string | null;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  } | null;
};
