import type { Category } from '@/types/category';

export type Club = {
  id: string;
  name: string;
  categoryId: string;
  creatorId: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  membersCount?: number;
  projectsCount?: number;
};

export type CreateClubPayload = {
  name: string;
  categoryId: string;
  description?: string;
  imageUrl?: string;
};

export type UpdateClubPayload = Partial<CreateClubPayload>;
