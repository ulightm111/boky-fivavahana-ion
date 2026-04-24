import { createAnimation } from "@ionic/vue";

let _forceDirection: "forward" | "back" | null = null;

export const setForceDirection = (dir: "forward" | "back" | null) => {
  _forceDirection = dir;
};

export const customAnimation = (_: HTMLElement, opts: any) => {
  const isBack = (_forceDirection || opts.direction) === "back";
  _forceDirection = null; // reset after reading
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;

  const isEnteringContent = enteringEl?.classList.contains("content-view-page");
  const isLeavingContent = leavingEl?.classList.contains("content-view-page");

  const isOpen = isEnteringContent && !isLeavingContent;
  const isClose = !isEnteringContent && isLeavingContent;
  
  const duration = isOpen || isClose ? 180 : 220;
  const easing = isOpen || isClose ? "cubic-bezier(0.25, 0.8, 0.25, 1)" : "cubic-bezier(0.25, 1, 0.5, 1)";

  const rootAnimation = createAnimation()
    .duration(duration)
    .easing(easing);

  if (enteringEl) {
    const enteringPage = createAnimation()
      .addElement(enteringEl)
      .beforeStyles({ background: "transparent" })
      .afterClearStyles(["background"]);
      
    rootAnimation.addAnimation([enteringPage]);

    const enteringContentEl = enteringEl.querySelector("ion-content");
    if (enteringContentEl) {
      const enteringContent = createAnimation().addElement(enteringContentEl);
      
      if (isOpen || isClose) {
        enteringContent
          .fromTo("opacity", "0", "1")
          .fromTo("transform", "scale(0.97)", "scale(1)");
      } else {
        enteringContent.fromTo(
          "transform",
          isBack ? "translateX(-100%)" : "translateX(100%)",
          "translateX(0)"
        );
      }
      rootAnimation.addAnimation([enteringContent]);
    }
  }

  if (leavingEl) {
    const leavingContentEl = leavingEl.querySelector("ion-content");
    if (leavingContentEl) {
      const leavingContent = createAnimation().addElement(leavingContentEl);
      
      if (isOpen || isClose) {
        leavingContent
          .fromTo("opacity", "1", "0")
          .fromTo("transform", "scale(1)", "scale(0.97)");
      } else {
        leavingContent.fromTo(
          "transform",
          "translateX(0)",
          isBack ? "translateX(100%)" : "translateX(-100%)"
        );
      }
      rootAnimation.addAnimation([leavingContent]);
    }
  }

  return rootAnimation;
};
