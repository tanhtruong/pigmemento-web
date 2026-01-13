import { Button } from '@/components/ui/button';
import { ArrowRight, Smartphone } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useCallback, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { faqs, features, stats } from '@/lib/landing-seed-data';
import { paths } from '@/config/paths.ts';
import { Head } from '@/components/seo/head.tsx';

const LandingRoute = () => {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  const viewportOnce = useMemo(() => ({ once: true, amount: 0.2 }), []);

  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }),
    [],
  );

  const organizationJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Pigmemento',
      url: 'https://pigmemento.app',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'contact@pigmemento.app',
        },
      ],
    }),
    [],
  );

  const fadeUp = useMemo(
    () =>
      ({
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0 : 0.55,
            ease: 'easeOut',
          },
        },
      }) satisfies Variants,
    [shouldReduceMotion],
  );

  const fadeIn = useMemo(
    () =>
      ({
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: shouldReduceMotion ? 0 : 0.75,
            ease: 'easeOut',
          },
        },
      }) satisfies Variants,
    [shouldReduceMotion],
  );

  const stagger = useMemo(
    () =>
      ({
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : 0.08,
            delayChildren: shouldReduceMotion ? 0 : 0.08,
          },
        },
      }) satisfies Variants,
    [shouldReduceMotion],
  );
  const scrollToId = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
      }
    },
    [shouldReduceMotion],
  );

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    const target = state?.scrollTo;
    if (!target) return;

    // Defer until after paint so sections exist
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (target === '__top__') {
          window.scrollTo({
            top: 0,
            behavior: shouldReduceMotion ? 'auto' : 'smooth',
          });
        } else {
          scrollToId(target);
        }

        // Clear the state so refresh/back doesn't re-scroll
        navigate(location.pathname, { replace: true, state: null });
      }, 0);
    });
  }, [
    location.pathname,
    location.state,
    navigate,
    scrollToId,
    shouldReduceMotion,
  ]);

  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Head title="Pigmemento – Melanoma Recognition Training for Clinicians" />
      {/* Hero */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger}
        className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-16 text-center"
      >
        <motion.h1
          variants={fadeUp}
          className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
        >
          Melanoma recognition training for clinicians.{' '}
          <span className="bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
            Case by case.
          </span>
        </motion.h1>
        <motion.p
          variants={fadeIn}
          className="mx-auto max-w-2xl text-balance text-base text-neutral-600 md:text-lg"
        >
          Short quizzes using real clinical lesion images, guided feedback, and
          teaching points to improve visual assessment of pigmented lesions.
          Built for GPs and dermatology trainees. Educational use only - not for
          diagnosis.
        </motion.p>
        <motion.div
          variants={fadeIn}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <Badge variant="secondary">Educational use only</Badge>
          <Badge variant="secondary">Real cases + guided feedback</Badge>
          <Badge variant="secondary">Works on iOS, Android, and web</Badge>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="flex flex-col items-center gap-4 md:flex-row"
        >
          <Button onClick={() => scrollToId('waitlist')} asChild>
            <Link to={paths.auth.login.getHref()}>
              Try out Pigmemento <ArrowRight />
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => scrollToId('features')}>
            See how it works <ArrowRight />
          </Button>
        </motion.div>

        {/* App preview */}
        <motion.div variants={fadeUp} className="mt-10 w-full">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent>
                <img
                  src="/dashboard-drill-mock.png"
                  alt="Dashboard showing a timed drill attempt"
                  className="rounded-lg"
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={800}
                />
              </CardContent>
              <CardFooter className="text-sm justify-center">
                Timed drills dashboard (training mode)
              </CardFooter>
            </Card>
            <Card>
              <CardContent>
                <img
                  src="/library-review-mock.png"
                  alt="Case library with guided case review"
                  className="rounded-lg"
                  loading="lazy"
                  decoding="async"
                  width={1200}
                  height={800}
                />
              </CardContent>
              <CardFooter className="text-sm justify-center">
                Case library with guided review and teaching points
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </motion.section>

      {/* SEO intro */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-6">
        <div className="mx-auto max-w-3xl text-center text-sm text-neutral-600">
          <h2 className="sr-only">What is Pigmemento?</h2>
          <p>
            Pigmemento is an educational melanoma recognition trainer designed
            for clinicians, general practitioners, and dermatology trainees.
            Practice pattern recognition with case-based drills and structured
            feedback to help you spot high-risk features.
          </p>
          <p className="mt-3">
            This product is for medical education only and does not provide
            diagnosis or treatment recommendations.
          </p>
        </div>
      </section>

      {/* Stats */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        className="border-y bg-neutral-50/60 py-10"
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="text-center my-auto">
                <CardTitle className="text-2xl font-bold">
                  {stat.value}
                </CardTitle>
                <CardDescription>{stat.label}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Who it's for */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger}
        className="mx-auto w-full max-w-6xl px-6 py-16"
      >
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Who it’s for</h2>
          <p className="mx-auto mt-2 max-w-2xl text-neutral-600">
            Pigmemento is designed for clinicians and trainees who want to
            improve visual recognition of melanoma.
          </p>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <Card>
            <CardHeader>
              <CardTitle>General Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build confidence triaging suspicious lesions and recognizing
                common pitfalls.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dermatology trainees</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Practice pattern recognition with curated cases and expert-style
                feedback.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Students & exam prep</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Prepare for OSCEs and exams using realistic, case-based drills.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      {/* Features */}
      <motion.section
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger}
        className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20"
      >
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Why Pigmemento?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-neutral-600">
            Practice with high-quality cases, get actionable feedback, and see
            your skills grow session by session.
          </p>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="w-fit p-3 bg-neutral-100 rounded-2xl">
                  {feature.icon}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.section>

      {/* How it works */}
      <motion.section
        id="how"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger}
        className="mx-auto grid w-full max-w-6xl items-center gap-5 px-6 py-16 md:grid-cols-2 md:py-20"
      >
        <motion.div variants={fadeUp}>
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
            <ol className="mt-5 space-y-4 text-sm text-neutral-700">
              <li>
                <span className="font-semibold">1) Pick a track.</span> Melanoma
                focus, mixed lesions, or exam-style OSCEs.
              </li>
              <li>
                <span className="font-semibold">2) Review the case.</span>{' '}
                Clinical + dermoscopic images with relevant history.
              </li>
              <li>
                <span className="font-semibold">3) Decide & justify.</span>{' '}
                Benign vs malignant choice, ABCDE/7-point notes, and next-step
                reasoning (training).
              </li>
              <li>
                <span className="font-semibold">4) Get feedback.</span> See
                expert reasoning, key features, and pitfalls.
              </li>
              <li>
                <span className="font-semibold">5) Track progress.</span>{' '}
                Accuracy trends, streaks, and calibration over time.
              </li>
            </ol>
            <div className="mt-6 flex items-center gap-3 text-sm text-neutral-600">
              <Smartphone className="h-4 w-4" aria-hidden />
              <span>Works on iOS, Android, and web - no setup required.</span>
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeIn}>
          <Card>
            <CardContent>
              <img
                src="/pigmemento-showcase-1.gif"
                alt="Mobile demo of a melanoma recognition training quiz with guided feedback"
                className="w-full max-w-[220px] mx-auto h-auto rounded-xl shadow-sm border"
                loading="lazy"
                decoding="async"
                width={440}
                height={956}
              />
            </CardContent>
            <CardFooter className="text-sm justify-center">
              Pigmemento Demo
            </CardFooter>
          </Card>
        </motion.div>
      </motion.section>

      {/* Waitlist */}
      {/* <motion.section
        id="waitlist"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mx-auto w-full max-w-6xl px-6 py-16"
      >
        <Card>
          <CardHeader>
            <h3 className="text-2xl font-bold">Get early access</h3>
            <CardDescription>
              Join the waitlist to be the first to try Pigmemento and help shape
              the roadmap.
            </CardDescription>
            <div className="mt-3 text-sm text-neutral-600">
              No spam. Unsubscribe anytime.
            </div>
          </CardHeader>
          <CardContent>
            <WaitlistForm />
          </CardContent>
        </Card>
      </motion.section>*/}

      {/* FAQ */}
      <motion.section
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        className="mx-auto w-full max-w-6xl px-6 pb-20"
      >
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">FAQs</h2>
        <Accordion type="multiple">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id.toString()} value={faq.id.toString()}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.section>
    </>
  );
};

export default LandingRoute;
