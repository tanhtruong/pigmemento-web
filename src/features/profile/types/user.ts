type Role = 'admin' | 'user';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLoginAt: string | null;
};

export type UpdateUserRequest = {
  name?: string;
};
