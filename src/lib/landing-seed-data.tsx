import { FAQ } from '@/types/faq';
import { Feature } from '@/types/feature';
import { Stat } from '@/types/stat';
import { HeroCase } from '@/types/hero-case';
import { Microscope, MessageSquareText, Crosshair, Timer } from 'lucide-react';

/**
 * Case 001 — the playable lesion in the hero. The user judges it before signup;
 * the centerpiece later breaks down this same case as the expert payoff. The
 * credit intentionally omits the diagnosis so the call isn't spoiled up front.
 */
export const heroCase: HeroCase = {
  id: 'Case 001',
  imageSrc: '/ISIC_0000022.jpg',
  imageAlt: 'Dermoscopic image of a pigmented skin lesion',
  sourceCredit: 'ISIC_0000022 · COURTESY ISIC ARCHIVE',
  correctLabel: 'malignant',
  truth: 'It’s a melanoma.',
  cue: 'The colour shifts asymmetrically across the lesion — one of the strongest signals here.',
};

export const features: Feature[] = [
  {
    icon: <Microscope />,
    title: 'Real dermoscopic cases',
    description:
      'Curated from the ISIC Archive, not stock photos. Each lesion is the actual image a clinician would see.',
  },
  {
    icon: <MessageSquareText />,
    title: 'Feedback that teaches',
    description:
      'Every answer comes with the pattern reasoning — not just right or wrong.',
  },
  {
    icon: <Crosshair />,
    title: 'ABCDE-aware',
    description:
      'Annotations call out the features that actually drive the decision, on the image itself.',
  },
  {
    icon: <Timer />,
    title: 'Respects your time',
    description: '90-second drills. Sessions that fit a coffee break.',
  },
];

export const stats: Stat[] = [
  {
    id: 1,
    label: 'Practice cases',
    value: '1k+',
    tickerValue: 1000,
    formatValue: (n) => (n >= 1000 ? '1k+' : String(n)),
  },
  {
    id: 2,
    label: 'Average session length',
    value: '8-10 min',
  },
  {
    id: 3,
    label: 'Platforms',
    value: 'iOS • Android • Web',
  },
  {
    id: 4,
    label: 'Retain after 1 month',
    value: '85%',
    tickerValue: 85,
    formatValue: (n) => `${n}%`,
    percent: 85,
  },
];

export const faqs: FAQ[] = [
  {
    id: 1,
    question: 'Who is Pigmemento for?',
    answer:
      'General practitioners, dermatology trainees, and medical learners who want structured practice in melanoma recognition.',
  },
  {
    id: 2,
    question: 'Is Pigmemento a diagnostic tool?',
    answer:
      'No. Pigmemento is for educational use only and is not intended for diagnosis or clinical decision-making.',
  },
  {
    id: 3,
    question: 'Where do the cases come from?',
    answer:
      'Curated from the ISIC Archive — real, de-identified dermoscopic images, expert-reviewed and selected for teaching rather than the polished textbook version.',
  },
  {
    id: 4,
    question: 'Does it include dermoscopy?',
    answer:
      'Yes. Cases include dermoscopic images along with brief clinical context and the teaching points that drive the call.',
  },
  {
    id: 5,
    question: 'How does the feedback work?',
    answer:
      'After each answer you see the ground-truth diagnosis, the teaching points, and the visual cues to focus on — so every case, right or wrong, leaves you with the pattern.',
  },
  {
    id: 6,
    question: 'Is my data safe?',
    answer:
      'We minimise personal data, encrypt it in transit and at rest, and support data export or deletion on request. Cases are de-identified and we don’t request patient photos from you.',
  },
  {
    id: 7,
    question: 'What devices does it work on?',
    answer:
      'Pigmemento works on iOS, Android, and the web — no special setup required.',
  },
];
