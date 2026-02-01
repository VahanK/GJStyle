// Animation durations (luxury = slower)
export const durations = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.8,
  slower: 1.0,
  slowest: 1.2,
}

// Custom easing curves (no linear ever!)
export const easings = {
  // Primary easing - use for most animations
  easeOutExpo: [0.19, 1, 0.22, 1],

  // Smooth general-purpose
  smooth: [0.43, 0.13, 0.23, 0.96],

  // Snappy interactions
  snappy: [0.22, 1, 0.36, 1],

  // Gentle fade-ins
  gentle: [0.33, 1, 0.68, 1],
}

// Movement distances
export const offsets = {
  small: 20,
  medium: 40,
  large: 60,
  xlarge: 80,
}

// Stagger delays
export const stagger = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
  slower: 0.2,
}
