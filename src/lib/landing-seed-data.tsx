import { FAQ } from '@/types/faq';
import { Feature } from '@/types/feature';
import { Stat } from '@/types/stat';
import { Brain, LineChart, Shield, Sparkles } from 'lucide-react';

export const features: Feature[] = [
  {
    icon: <Brain />,
    title: 'AI-powered feedback',
    description:
      'Instant, case-by-case guidance on your differential and malignancy risk estimation.',
  },
  {
    icon: <Sparkles />,
    title: 'Realistic case library',
    description:
      'Diverse dermoscopic and clinical images curated with domain experts.',
  },
  {
    icon: <LineChart />,
    title: 'Progress & benchmarks',
    description:
      'Track accuracy, sensitivity/specificity, and compare with peer cohorts.',
  },
  {
    icon: <Shield />,
    title: 'Privacy & compliance',
    description:
      'De-identified data, GDPR-friendly workflows, and role-based access.',
  },
];

export const stats: Stat[] = [
  {
    id: 1,
    label: 'Practice cases',
    value: '2k+',
  },
  {
    id: 2,
    label: 'Avg. accuracy uplift',
    value: '+18%',
  },
  {
    id: 3,
    label: 'Avg. session length',
    value: '8-10 min',
  },
  {
    id: 4,
    label: 'Platforms',
    value: 'iOS • Android • Web',
  },
];

export const faqs: FAQ[] = [
  {
    id: 1,
    question: 'Who is Pigmemento for?',
    answer:
      'General practitioners, junior dermatologists, and medical trainees who want focused practice in melanoma recognition.',
  },
  {
    id: 2,
    question: 'How does the AI feedback work?',
    answer:
      'Your inputs are compared against expert-labeled cases. The system highlights salient visual features and explains decision boundaries in plain language.',
  },
  // {
  //   id: 3,
  //   question: 'Will you offer CME/CPD credits?',
  //   answer:
  //     "Yes — accreditation is planned. Join the waitlist to be notified as soon as it's live.",
  // },
  {
    id: 4,
    question: 'Is my data safe?',
    answer:
      'We minimize personal data collection, use encryption in transit/at rest, and support data export/deletion on request.',
  },
];
