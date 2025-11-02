import { SelfieIcon, VarietyIcon, CalendarIcon, SunIcon } from '@/components/icons';

export interface PhotoRequirement {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

export const photoRequirements: PhotoRequirement[] = [
  {
    icon: <SelfieIcon />,
    title: 'Selfies',
    description: 'Upload frontal selfies that are well-lit and taken at eye-level',
    image: '/aragon_assets/selfie.webp',
  },
  {
    icon: <VarietyIcon />,
    title: 'Variety',
    description: 'Upload photos in different outfits and backgrounds.',
    image: '/aragon_assets/variety.webp',
  },
  {
    icon: <CalendarIcon />,
    title: 'Recency & Consistency',
    description:
      'Upload recent photos (last 6 months). Choose ones where your hairstyle is consistent and your hair is tidy.',
    image: '/aragon_assets/recency.webp',
  },
  {
    icon: <SunIcon />,
    title: 'Clear',
    description:
      'Upload photos taken from a good distance, ideally taken from the chest or waist up.',
    image: '/aragon_assets/clarity.webp',
  },
];
