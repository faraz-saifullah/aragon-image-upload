import { LeafIcon, BikiniIcon, AccessoriesIcon, AngleIcon } from '@/components/icons';

export interface PhotoRestriction {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

export const photoRestrictions: PhotoRestriction[] = [
  {
    icon: <LeafIcon />,
    title: 'No Low-Res / AI Photos',
    description: "Don't upload photos that are, blurry, too dark / bright, or AI-generated",
    image: '/aragon_assets/low_quality.webp',
  },
  {
    icon: <BikiniIcon />,
    title: 'No Revealing Clothes',
    description: "Don't upload photos with low necklines, or in skimpy outfits",
    image: '/aragon_assets/revealing.webp',
  },
  {
    icon: <AccessoriesIcon />,
    title: 'No Accessories',
    description: 'Avoid photos of you with hats, sunglasses, headphones, lanyards, etc.',
    image: '/aragon_assets/no_accessories.webp',
  },
  {
    icon: <AngleIcon />,
    title: 'No Unnatural Angles',
    description: "Avoid photos taken from the side, or where you're looking away",
    image: '/aragon_assets/taken_from_angle.webp',
  },
];
