import { createAnimation } from "@ionic/vue";

type Direction = "forward" | "back";

interface CustomAnimationOptions {
  direction?: Direction;
  enteringEl?: HTMLElement | null;
  leavingEl?: HTMLElement | null;
}

let _forceDirection: Direction | null = null;

export const setForceDirection = (dir: Direction | null) => {
  _forceDirection = dir;
};

const getContentElement = (pageEl?: HTMLElement | null) => {
  return pageEl?.querySelector("ion-content") as HTMLElement | null;
};

const setWillChange = (el: HTMLElement | null) => {
  if (!el) return;
  el.style.willChange = "transform, opacity";
};

const clearWillChange = (el: HTMLElement | null) => {
  if (!el) return;
  el.style.willChange = "";
};

export const customAnimation = (_: HTMLElement, opts: CustomAnimationOptions) => {
  const direction = _forceDirection || opts.direction || "forward";
  _forceDirection = null;

  const isBack = direction === "back";

  const enteringEl = opts.enteringEl ?? null;
  const leavingEl = opts.leavingEl ?? null;

  const enteringContentEl = getContentElement(enteringEl);
  const leavingContentEl = getContentElement(leavingEl);

  const isEnteringContent = !!enteringEl?.classList.contains("content-view-page");
  const isLeavingContent = !!leavingEl?.classList.contains("content-view-page");

  const isOpen = isEnteringContent && !isLeavingContent;
  const isClose = !isEnteringContent && isLeavingContent;

  const duration = isOpen || isClose ? 170 : 210;
  const easing = "cubic-bezier(0.4, 0.0, 0.2, 1)";

  const rootAnimation = createAnimation()
    .duration(duration)
    .easing(easing);

  const slideFrom = isBack ? "-100%" : "100%";
  const slideTo = "0%";
  const slideOut = isBack ? "100%" : "-100%";

  // --- ENTERING ---
  if (enteringEl && enteringContentEl) {
    setWillChange(enteringContentEl);

    const enteringPage = createAnimation()
      .addElement(enteringEl)
      .beforeStyles({ background: "transparent" })
      .afterClearStyles(["background"]);

    const enteringContent = createAnimation()
      .addElement(enteringContentEl);

    if (isOpen || isClose) {
      enteringContent
        .fromTo("opacity", "0", "1")
        .fromTo("transform", "translateZ(0) scale(0.98)", "translateZ(0) scale(1)");
    } else {
      enteringContent.fromTo(
        "transform",
        `translate3d(${slideFrom},0,0)`,
        `translate3d(${slideTo},0,0)`
      );
    }

    enteringContent.afterAddWrite(() => clearWillChange(enteringContentEl));

    rootAnimation.addAnimation([enteringPage, enteringContent]);
  }

  // --- LEAVING ---
  if (leavingEl && leavingContentEl) {
    setWillChange(leavingContentEl);

    const leavingContent = createAnimation()
      .addElement(leavingContentEl);

    if (isOpen || isClose) {
      leavingContent
        .fromTo("opacity", "1", "0")
        .fromTo("transform", "translateZ(0) scale(1)", "translateZ(0) scale(0.98)");
    } else {
      leavingContent.fromTo(
        "transform",
        "translate3d(0,0,0)",
        `translate3d(${slideOut},0,0)`
      );
    }

    leavingContent.afterAddWrite(() => clearWillChange(leavingContentEl));

    rootAnimation.addAnimation([leavingContent]);
  }

  return rootAnimation;
};