export const siteNavMotion = {
  hidden: {
    opacity: 0,
    y: -18
  },
  visible: {
    opacity: 1,
    y: 0
  }
} as const;

export const siteMotionTimings = {
  nav: { duration: 0.16, ease: [0.2, 0, 0, 1], type: "tween" }
} as const;
