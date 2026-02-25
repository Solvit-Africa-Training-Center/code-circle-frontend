export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryPayload = {
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
};
