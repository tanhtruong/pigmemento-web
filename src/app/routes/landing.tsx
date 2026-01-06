// import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
// import { paths } from '@/config/paths';
// import { isTokenValid } from '@/lib/auth';
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
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';
import WaitlistForm from '@/features/waitlist/components/waitlist-form';
import { faqs, features, stats } from '@/lib/landing-seed-data';
import { paths } from '@/config/paths';

const LandingRoute = () => {
  const shouldReduceMotion = useReducedMotion();
  // TODO: Add again when Auth is ready
  // const navigate = useNavigate();
  // const isLoggedin = isTokenValid();

  // const handleStart = () => {
  //   if (isLoggedin) {
  //     navigate(paths.app.dashboard.getHref());
  //   } else {
  //     navigate(paths.auth.login.getHref());
  //   }
  // };

  const viewportOnce = useMemo(() => ({ once: true, amount: 0.2 }), []);

  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: 0, y: 14 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.55,
          ease: 'easeOut',
        },
      },
    } satisfies Variants),
    [shouldReduceMotion]
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
    [shouldReduceMotion]
  );

  const stagger = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : 0.08,
          delayChildren: shouldReduceMotion ? 0 : 0.08,
        },
      },
    } satisfies Variants),
    [shouldReduceMotion]
  );
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <>
      {/* Hero */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={stagger}
        className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-16 text-center md:py-24"
      >
        <motion.h1
          variants={fadeUp}
          className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
        >
          Train your eye for melanoma.{' '}
          <span className="bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
            Case by case.
          </span>
        </motion.h1>
        <motion.p
          variants={fadeIn}
          className="mx-auto max-w-2xl text-balance text-base text-neutral-600 md:text-lg"
        >
          Short quizzes with real lesion images, guided feedback, and teaching
          points. Built for GPs and dermatology trainees. Educational use only -
          not for diagnosis.
        </motion.p>
        <motion.div
          variants={fadeIn}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <Badge variant="secondary">Educational use only</Badge>
          <Badge variant="secondary">Real cases + guided feedback</Badge>
          <Badge variant="secondary">iOS, Android, and web</Badge>
        </motion.div>
        <motion.div
          variants={fadeIn}
          className="flex flex-col items-center gap-4 md:flex-row"
        >
          <Button onClick={() => scrollToId('waitlist')}>
            Get early access
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
                Dashboard & Drill Attempt
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
                Case Library & Case Review
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </motion.section>

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
                Benign vs malignant choice, ABCDE notes, and next-step reasoning
                (training).
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
                alt="pigmemento showcase 1"
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
      <motion.section
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
      </motion.section>

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

      {/* Footer */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeIn}
        className="border-t bg-neutral-50/60"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Pigmemento. Educational use only - not
            for diagnosis. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-600">
            <Link to={paths.privacy.path}>Privacy</Link>
            {/*<a href="#" className="hover:text-neutral-900">
              Terms
            </a>*/}
            <a
              href="mailto:contact@pigmemento.app"
              className="hover:text-neutral-900"
            >
              contact@pigmemento.app
            </a>
          </div>
        </div>
      </motion.footer>
    </>
  );
};

export default LandingRoute;
