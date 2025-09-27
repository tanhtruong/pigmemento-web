// import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
// import { paths } from '@/config/paths';
// import { isTokenValid } from '@/lib/auth';

import { ArrowRight, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link, useLocation } from 'react-router';
import { useEffect } from 'react';
import WaitlistForm from '@/features/waitlist/components/waitlist-form';
import { faqs, features, stats } from '@/lib/landing-seed-data';

const LandingRoute = () => {
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

  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-16 text-center md:py-24">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl"
        >
          Train your eye.{' '}
          <span className="bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
            Save more lives.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mx-auto max-w-2xl text-balance text-base text-neutral-600 md:text-lg"
        >
          Interactive, AI-powered melanoma recognition practice for GPs and
          dermatology trainees — on mobile and web.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col items-center gap-4 md:flex-row"
        >
          <Button asChild>
            <Link to={{ hash: 'waitlist' }}>Start training</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to={{ hash: 'features' }}>
              Explore features <ArrowRight />
            </Link>
          </Button>
        </motion.div>

        {/* App preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-10 w-full"
        >
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardContent>
                <AspectRatio
                  ratio={4 / 3}
                  className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl"
                ></AspectRatio>
              </CardContent>
              <CardFooter className="text-sm justify-center">
                Screenshot placeholder — dashboard
              </CardFooter>
            </Card>
            <Card>
              <CardContent>
                <AspectRatio
                  ratio={4 / 3}
                  className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl"
                ></AspectRatio>
              </CardContent>
              <CardFooter className="text-sm justify-center">
                Screenshot placeholder — case view
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y bg-neutral-50/60 py-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
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
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20"
      >
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Why Pigmemento?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-neutral-600">
            Practice with high-quality cases, get actionable feedback, and see
            your skills grow session by session.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-6xl px-6 pb-8 md:pb-14">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
            <ol className="mt-5 space-y-4 text-sm text-neutral-700">
              <li>
                <span className="font-semibold">1) Pick a track</span> —
                melanoma focus, mixed lesions, or exam-style OSCEs.
              </li>
              <li>
                <span className="font-semibold">2) Review the case</span> —
                clinical + dermoscopic images with relevant history.
              </li>
              <li>
                <span className="font-semibold">3) Decide & justify</span> —
                risk estimate, ABCDE notes, and management plan.
              </li>
              <li>
                <span className="font-semibold">4) Get feedback</span> — see
                expert reasoning, key features, and pitfalls.
              </li>
              <li>
                <span className="font-semibold">5) Track progress</span> —
                accuracy trends, sensitivity/specificity, streaks.
              </li>
            </ol>
            <div className="mt-6 flex items-center gap-3 text-sm text-neutral-600">
              <Smartphone className="h-4 w-4" aria-hidden />
              <span>Works on iOS, Android, and web — no setup required.</span>
            </div>
          </div>
          <Card>
            <CardContent>
              <AspectRatio
                ratio={4 / 3}
                className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl"
              ></AspectRatio>
            </CardContent>
            <CardFooter className="text-sm justify-center">
              Short demo placeholder - replace with an embedded video or GIF.
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="mx-auto w-full max-w-6xl px-6 py-16">
        <Card>
          <CardHeader>
            <h3 className="text-2xl font-bold">Get early access</h3>
            <CardDescription>
              Join the waitlist to be the first to try Pigmemento and help shape
              the roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WaitlistForm />
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-3xl font-bold md:text-4xl">FAQ</h2>
        <Accordion type="multiple">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id.toString()} value={faq.id.toString()}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="border-t bg-neutral-50/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Pigmemento. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-600">
            {/* <a href="#" className="hover:text-neutral-900">
              Privacy
            </a>
            <a href="#" className="hover:text-neutral-900">
              Terms
            </a> */}
            <a
              href="mailto:contact@pigmemento.app"
              className="hover:text-neutral-900"
            >
              contact@pigmemento.app
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingRoute;
