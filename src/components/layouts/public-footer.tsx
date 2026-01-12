import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Link } from 'react-router';
import { paths } from '@/config/paths.ts';
import { useMemo } from 'react';

export const PublicFooter = () => {
  const shouldReduceMotion = useReducedMotion();
  const viewportOnce = useMemo(() => ({ once: true, amount: 0.2 }), []);

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

  return (
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
  );
};
