"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimateOnViewProps {
  children: ReactNode;
  animation?: string;
  delay?: number;
  threshold?: number;
  className?: string;
}

export function AnimateOnView({
  children,
  animation = "fade-in-scale",
  delay = 0,
  threshold = 0.1,
  className,
}: AnimateOnViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-opacity",
        isVisible ? animation : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
