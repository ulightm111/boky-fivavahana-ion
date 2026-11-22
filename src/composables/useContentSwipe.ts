import {
  onMounted,
  onUnmounted,
  ref,
  type ComputedRef,
  type Ref,
} from "vue";

interface SwipeItem {
  id: string | number;
  type: "song" | "section" | "subsection";
  section?: string;
}

interface UseContentSwipeOptions {
  contentRef: Ref<any>;
  bookId: ComputedRef<number>;
  book: ComputedRef<any>;
  isSalamo: ComputedRef<boolean>;
  getBookData: (book: any) => any[];
  canGoPrev: ComputedRef<boolean>;
  canGoNext: ComputedRef<boolean>;
  currentTitleIndex: Ref<number>;
  currentTitlesList: Ref<SwipeItem[]>;
  navigatePrev: () => void;
  navigateNext: () => void;
}

export const useContentSwipe = (options: UseContentSwipeOptions) => {
  const {
    contentRef,
    bookId,
    book,
    isSalamo,
    getBookData,
    canGoPrev,
    canGoNext,
    currentTitleIndex,
    currentTitlesList,
    navigatePrev,
    navigateNext,
  } = options;

  const SWIPE_THRESHOLD = 100;
  const SWIPE_DETECTION_THRESHOLD = 24;
  const HORIZONTAL_DOMINANCE_RATIO = 1.3;
  const swipeStart = ref<{ x: number; y: number } | null>(null);
  const swipeElement = ref<HTMLElement | null>(null);
  const previewElement = ref<HTMLElement | null>(null);
  const isHorizontalSwipe = ref(false);
  const previewMode = ref<"liturgia" | "psalm" | "song" | "">("");
  const previewSide = ref<"next" | "prev">("next");
  const previewItem = ref<any>(null);
  const previewHtml = ref<string[]>([]);
  const previewSubTitle = ref("");

  let swipeFrame: number | null = null;
  let pendingSwipeDelta = 0;
  let pendingSwipeWidth = 0;
  let scrollElement: HTMLElement | null = null;
  const preloadedContent = new Map<string, any>();

  const requestFrame = (callback: FrameRequestCallback): number => {
    if (typeof window.requestAnimationFrame === "function") {
      return window.requestAnimationFrame(callback);
    }

    return window.setTimeout(() => callback(Date.now()), 16);
  };

  const cancelFrame = (frameId: number) => {
    if (typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(frameId);
    } else {
      window.clearTimeout(frameId);
    }
  };

  onMounted(async () => {
    scrollElement =
      (await contentRef.value?.$el?.getScrollElement?.()) ?? null;
  });

  const getItemPath = (item: SwipeItem | null): string => {
    if (!item) return "";
    if (item.type === "song") {
      return `/books/${bookId.value}/song/${item.id}`;
    }
    if (item.type === "section") {
      return `/books/${bookId.value}/section/${encodeURIComponent(String(item.id))}`;
    }
    if (item.type === "subsection") {
      return `/books/${bookId.value}/section/${encodeURIComponent(
        item.section || "",
      )}/subsection/${item.id}`;
    }
    return "";
  };

  const clearPreview = () => {
    previewMode.value = "";
    previewItem.value = null;
    previewHtml.value = [];
    previewSubTitle.value = "";
  };

  const preloadAdjacentContent = () => {
    const neighbors = [
      currentTitleIndex.value > 0
        ? currentTitlesList.value[currentTitleIndex.value - 1]
        : null,
      currentTitleIndex.value >= 0 &&
      currentTitleIndex.value < currentTitlesList.value.length - 1
        ? currentTitlesList.value[currentTitleIndex.value + 1]
        : null,
    ];

    neighbors.forEach((item) => {
      const path = getItemPath(item);
      if (!path || preloadedContent.has(path)) return;

      const data = getBookData(book.value);
      let content: any = null;

      if (item?.type === "song") {
        content = data.find((entry: any) => entry.id === item.id) ?? null;
      } else if (item?.type === "section") {
        content = data.find((entry: any) => entry.section === item.id) ?? null;
      } else if (item?.type === "subsection") {
        const section = data.find(
          (entry: any) => entry.section === item.section,
        );
        content = section?.subsections?.[item.id as number] ?? null;
      }

      if (content) preloadedContent.set(path, content);
    });
  };

  const showPreview = (direction: "forward" | "back") => {
    const index =
      direction === "forward"
        ? currentTitleIndex.value + 1
        : currentTitleIndex.value - 1;
    const item = currentTitlesList.value[index];
    if (!item) {
      clearPreview();
      return;
    }

    const content = preloadedContent.get(getItemPath(item)) ?? null;
    if (!content) {
      clearPreview();
      return;
    }

    previewSide.value = direction === "forward" ? "next" : "prev";

    if (item.type === "song") {
      previewItem.value = content;
      previewMode.value = isSalamo.value ? "psalm" : "song";
    } else if (item.type === "subsection") {
      previewItem.value = content;
      previewMode.value = "liturgia";
      previewSubTitle.value = content.subsection || "";
      previewHtml.value = content.content || [];
    } else if (item.type === "section") {
      previewItem.value = content;
      previewMode.value = "liturgia";
      previewSubTitle.value = "";
      previewHtml.value = content.content || [];
    }

    requestFrame(() => {
      const preview =
        previewElement.value ??
        (document.querySelector(
          ".ion-page:not(.ion-page-hidden) .swipe-preview",
        ) as HTMLElement | null);

      if (!preview) return;

      preview.style.top = `${scrollElement?.scrollTop ?? 0}px`;
      preview.scrollTop = 0;
      previewElement.value = preview;
    });
  };

  const resetSwipeVisual = () => {
    if (!swipeElement.value) return;

    swipeElement.value.style.transition = "none";
    swipeElement.value.style.transform = "";
    if (previewElement.value) {
      previewElement.value.style.transition = "none";
      previewElement.value.style.transform = "";
    }
    clearPreview();
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      swipeStart.value = null;
      return;
    }

    const touch = event.touches[0];
    swipeStart.value = { x: touch.clientX, y: touch.clientY };
    isHorizontalSwipe.value = false;
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (!swipeStart.value || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - swipeStart.value.x;
    const deltaY = touch.clientY - swipeStart.value.y;

    if (!isHorizontalSwipe.value) {
      if (Math.abs(deltaX) < SWIPE_DETECTION_THRESHOLD) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY) * HORIZONTAL_DOMINANCE_RATIO) {
        return;
      }
      isHorizontalSwipe.value = true;
      showPreview(deltaX < 0 ? "forward" : "back");
    }

    if (event.cancelable) event.preventDefault();

    const canNavigate = deltaX < 0 ? canGoNext.value : canGoPrev.value;
    pendingSwipeWidth = swipeElement.value?.clientWidth || window.innerWidth;
    pendingSwipeDelta = deltaX * (canNavigate ? 1 : 0.28);

    if (swipeFrame !== null) return;

    swipeFrame = requestFrame(() => {
      swipeFrame = null;
      if (!swipeStart.value) return;

      if (swipeElement.value) {
        swipeElement.value.style.transition = "none";
        swipeElement.value.style.transform = `translate3d(${pendingSwipeDelta}px, 0, 0)`;
      }

      if (previewElement.value) {
        previewElement.value.style.transition = "none";
        const previewOffset =
          previewSide.value === "next"
            ? pendingSwipeWidth + pendingSwipeDelta
            : -pendingSwipeWidth + pendingSwipeDelta;
        previewElement.value.style.transform = `translate3d(${previewOffset}px, 0, 0)`;
      }
    });
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (!swipeStart.value || event.changedTouches.length !== 1) {
      swipeStart.value = null;
      isHorizontalSwipe.value = false;
      resetSwipeVisual();
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStart.value.x;
    const deltaY = touch.clientY - swipeStart.value.y;
    swipeStart.value = null;

    if (
      !isHorizontalSwipe.value ||
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    ) {
      isHorizontalSwipe.value = false;
      resetSwipeVisual();
      return;
    }

    const direction: "forward" | "back" = deltaX < 0 ? "forward" : "back";
    const canNavigate =
      direction === "forward" ? canGoNext.value : canGoPrev.value;
    if (!canNavigate) {
      isHorizontalSwipe.value = false;
      resetSwipeVisual();
      return;
    }

    isHorizontalSwipe.value = false;
    resetSwipeVisual();

    if (direction === "forward") navigateNext();
    else navigatePrev();
  };

  const handleTouchCancel = () => {
    swipeStart.value = null;
    isHorizontalSwipe.value = false;
    resetSwipeVisual();
  };

  onUnmounted(() => {
    if (swipeFrame !== null) cancelFrame(swipeFrame);
  });

  return {
    swipeElement,
    previewElement,
    previewMode,
    previewSide,
    previewItem,
    previewHtml,
    previewSubTitle,
    preloadAdjacentContent,
    clearPreview,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  };
};
