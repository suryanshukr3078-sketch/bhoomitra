'use client';

import React from 'react';
import {
  motion,
  useReducedMotion,
  HTMLMotionProps,
  Variants,
} from 'framer-motion';

/**
 * Custom hook returning whether the user prefers reduced motion.
 */
export function useMotionPreference() {
  const shouldReduceMotion = useReducedMotion();
  return Boolean(shouldReduceMotion);
}

/**
 * Container component that orchestrates staggered entrance of child elements.
 */
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
  initialDelay?: number;
  children: React.ReactNode;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.06,
  initialDelay = 0.04,
  className,
  ...props
}: StaggerContainerProps) {
  const prefersReduced = useMotionPreference();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReduced ? 0 : staggerDelay,
        delayChildren: prefersReduced ? 0 : initialDelay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered entrance item designed to be a direct child of StaggerContainer.
 */
interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export function StaggerItem({
  children,
  className,
  ...props
}: StaggerItemProps) {
  const prefersReduced = useMotionPreference();

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: prefersReduced ? 0 : 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReduced ? 0.01 : 0.25,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/**
 * Interactive card component with subtle hover elevation and tap feedback.
 */
interface MotionCardProps extends HTMLMotionProps<'article'> {
  children: React.ReactNode;
}

export function MotionCard({
  children,
  className,
  ...props
}: MotionCardProps) {
  const prefersReduced = useMotionPreference();

  return (
    <motion.article
      whileHover={
        prefersReduced
          ? undefined
          : {
              scale: 1.01,
              y: -2,
              transition: { duration: 0.18, ease: 'easeOut' },
            }
      }
      whileTap={
        prefersReduced
          ? undefined
          : {
              scale: 0.99,
              transition: { duration: 0.1, ease: 'easeOut' },
            }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.article>
  );
}

/**
 * Interactive button component with snappy hover/tap feedback.
 */
export const MotionButton = React.forwardRef<
  HTMLButtonElement,
  HTMLMotionProps<'button'>
>(({ children, className, ...props }, ref) => {
  const prefersReduced = useMotionPreference();

  return (
    <motion.button
      ref={ref}
      whileHover={
        prefersReduced
          ? undefined
          : {
              scale: 1.03,
              transition: { duration: 0.15, ease: 'easeOut' },
            }
      }
      whileTap={
        prefersReduced
          ? undefined
          : {
              scale: 0.97,
              transition: { duration: 0.08, ease: 'easeOut' },
            }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
});

MotionButton.displayName = 'MotionButton';

/**
 * Interactive anchor component for external links or anchor navigation.
 */
export const MotionAnchor = React.forwardRef<
  HTMLAnchorElement,
  HTMLMotionProps<'a'>
>(({ children, className, ...props }, ref) => {
  const prefersReduced = useMotionPreference();

  return (
    <motion.a
      ref={ref}
      whileHover={
        prefersReduced
          ? undefined
          : {
              scale: 1.03,
              transition: { duration: 0.15, ease: 'easeOut' },
            }
      }
      whileTap={
        prefersReduced
          ? undefined
          : {
              scale: 0.97,
              transition: { duration: 0.08, ease: 'easeOut' },
            }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.a>
  );
});

MotionAnchor.displayName = 'MotionAnchor';
