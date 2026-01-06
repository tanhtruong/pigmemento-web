import { FAQ } from '@/types/faq';
import { Feature } from '@/types/feature';
import { Stat } from '@/types/stat';
import { Brain, LineChart, Shield, Sparkles } from 'lucide-react';

export const features: Feature[] = [
  {
    icon: <Brain />,
    title: 'Case-Based Training',
    description:
      'Instant, case-by-case guidance on your differential and malignancy risk estimation.',
  },
  {
    icon: <Sparkles />,
    title: 'Realistic Case Library',
    description:
      'Diverse dermoscopic and clinical images curated with domain experts.',
  },
  {
    icon: <LineChart />,
    title: 'Progress & Benchmarks',
    description:
      'Track accuracy, sensitivity/specificity, and compare with peer cohorts.',
  },
  {
    icon: <Shield />,
    title: 'Privacy & Compliance',
    description:
      'De-identified data, GDPR-friendly workflows, and role-based access.',
  },
];

export const stats: Stat[] = [
  {
    id: 1,
    label: 'Practice cases',
    value: '1k+',
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
      'Cases are curated from high-quality educational datasets and expert-reviewed sources. All content is de-identified and intended for learning.',
  },
  {
    id: 4,
    question: 'Does it include dermoscopy?',
    answer:
      'Yes. Training cases can include clinical and dermoscopic images along with brief context and teaching points.',
  },
  {
    id: 5,
    question: 'How does the feedback work?',
    answer:
      'After each answer, you’ll see the ground truth label, teaching points, and visual cues to focus on. When available, attention maps are shown as a learning aid - not a diagnostic output.',
  },
  {
    id: 6,
    question: 'Do you collect patient photos or allow uploads?',
    answer:
      'Not at launch. Pigmemento focuses on curated training cases, and we do not request or store patient photos uploaded by users.',
  },
  {
    id: 7,
    question: 'Is my data safe?',
    answer:
      'We minimize personal data collection, encrypt data in transit and at rest, and support data export/deletion on request where applicable.',
  },
  {
    id: 8,
    question: 'Do I need an account?',
    answer:
      'Early versions may allow lightweight access. If accounts are enabled, we only collect what’s needed to run the app and track learning progress.',
  },
  {
    id: 9,
    question: 'What devices does it work on?',
    answer:
      'Pigmemento works on iOS, Android, and the web - no special setup required.',
  },
  {
    id: 10,
    question: 'Can I use it offline?',
    answer:
      'An internet connection is recommended for the best experience since cases and updates are delivered online.',
  },
  {
    id: 11,
    question: 'Will you offer CME/CPD credits?',
    answer:
      'Not initially. CME/CPD accreditation is a potential future roadmap item - join the waitlist to be notified of updates.',
  },
  {
    id: 12,
    question: 'Will there be a free tier or pricing?',
    answer:
      'Pricing is still being finalized. Join the waitlist and we’ll share details before launch.',
  },
];
