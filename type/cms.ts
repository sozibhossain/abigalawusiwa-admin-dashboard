// types/cms.ts
export type CmsBanner = {
  _id: string;
  title: string;
  type: string;
  content?: string;
  images: string[];
  isActive: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};
