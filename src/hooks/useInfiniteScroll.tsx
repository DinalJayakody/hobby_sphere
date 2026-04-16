import { useEffect, useRef } from "react";

interface Props {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const useInfiniteScroll = ({
  loading,
  hasMore,
  onLoadMore,
}: Props) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" } // prefetch before reaching bottom
    );

    const node = observerRef.current;
    if (node) observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [loading, hasMore, onLoadMore]);

  return observerRef;
};
