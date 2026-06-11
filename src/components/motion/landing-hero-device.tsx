import { SoftCircleReveal } from './soft-circle-reveal';

type LandingHeroDeviceProps = {
  imageSrc: string;
  imageAlt: string;
};

const HERO_SIZE = 480;

export const LandingHeroDevice = ({
  imageSrc,
  imageAlt,
}: LandingHeroDeviceProps) => {
  return (
    <SoftCircleReveal
      configuration="silent"
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      size={HERO_SIZE}
      interactive
      autoplay
    />
  );
};
