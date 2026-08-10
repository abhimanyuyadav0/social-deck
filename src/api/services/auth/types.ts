export interface SocialDeckUser {
  id: string;
  _id?: string;
  name?: string;
  email: string;
  emailVerified?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: SocialDeckUser;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: { user: SocialDeckUser };
}

export interface MeResponse {
  success: boolean;
  data: SocialDeckUser;
}

export type User = SocialDeckUser;
