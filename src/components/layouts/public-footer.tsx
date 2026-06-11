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
      className="border-hairline relative z-10 border-t"
    >
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs md:flex-row">
        <p>
          © {new Date().getFullYear()} Pigmemento. Educational use only — not
          for diagnosis. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            to={paths.privacy.path}
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <a
            href="mailto:contact@pigmemento.app"
            className="hover:text-foreground transition-colors"
          >
            contact@pigmemento.app
          </a>
        </div>
      </div>
    </motion.footer>
  );
};
