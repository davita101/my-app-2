import { useCallback, useEffect, useRef } from "react";

export default function useInfiniteScroll(loadMore: () => void, enabled = true) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastNodeRef = useRef<Element | null>(null);

  const setNode = useCallback(
    (node: Element | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      lastNodeRef.current = node;
      if (!node || !enabled) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      });
      observerRef.current.observe(node);
    },
    [loadMore, enabled]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return setNode;
}
