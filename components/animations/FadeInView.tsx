'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface FadeInViewProps {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  threshold?: number
  once?: boolean
  className?: string
}

export function FadeInView({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.8,
  threshold = 0.2,
  once = true,
  className = '',
}: FadeInViewProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })

  const directionOffset = {
    up: { y: 60 },
    down: { y: -60 },
    left: { x: 60 },
    right: { x: -60 },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              x: 0,
              y: 0,
            }
          : {}
      }
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
