export type IHeroBanner = {
  id: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HeroBannerInput = Omit<IHeroBanner, 'id' | 'imageUrl' | 'createdAt' | 'updatedAt'>;
