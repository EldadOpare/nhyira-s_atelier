import React, { useState, useEffect, useRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  title: string;
  category: string;
  image: string;
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Controls how far the items are from the center. */
  radius?: number;
  /** Controls the speed of auto-rotation when not scrolling. */
  autoRotateSpeed?: number;
  /**
   * Tall element the gallery sticks inside. Scroll progress through it drives
   * the rotation, so the gallery turns with its own section and not the page.
   */
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  onItemClick?: (index: number) => void;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 600, autoRotateSpeed = 0.02, scrollContainerRef, onItemClick, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    // Auto-rotation adds on top of the scroll angle instead of fighting it.
    const scrollRotationRef = useRef(0);
    const autoRotationRef = useRef(0);
    // Auto-rotation only runs once the section has been reached. Above it the
    // ring sits at rest, so scrolling back up leaves it as it first appeared.
    const startedRef = useRef(false);

    useEffect(() => {
      const handleScroll = () => {
        const el = scrollContainerRef?.current;
        if (!el) return;
        setIsScrolling(true);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

        const rect = el.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
        scrollRotationRef.current = progress * 360;
        startedRef.current = progress > 0;
        if (!startedRef.current) autoRotationRef.current = 0;
        setRotation(scrollRotationRef.current + autoRotationRef.current);

        scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      };
    }, [scrollContainerRef]);

    useEffect(() => {
      const autoRotate = () => {
        if (!isScrolling && startedRef.current) {
          autoRotationRef.current += autoRotateSpeed;
          setRotation(scrollRotationRef.current + autoRotationRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };
      animationFrameRef.current = requestAnimationFrame(autoRotate);
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }, [isScrolling, autoRotateSpeed]);

    const anglePerItem = 360 / items.length;

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Circular 3D Gallery"
        className={cn("relative w-full h-full flex items-center justify-center", className)}
        style={{ perspective: "2000px" }}
        {...props}
      >
        <div
          className="relative w-full h-full"
          style={{ transform: `rotateY(${rotation}deg)`, transformStyle: "preserve-3d" }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            const opacity = Math.max(0.5, 1 - normalizedAngle / 180);

            return (
              <div
                key={i}
                role="group"
                aria-label={item.title}
                className="absolute w-[300px] h-[400px]"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-150px",
                  marginTop: "-200px",
                  opacity,
                  // Without this the back of the ring shows through, mirrored.
                  backfaceVisibility: "hidden",
                  transition: "opacity 0.3s linear",
                }}
              >
                <div
                  className="relative w-full h-full overflow-hidden rounded-[18px] group cursor-pointer bg-white"
                  onClick={() => onItemClick?.(i)}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    draggable={false}
                  />
                  <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/55 via-black/20 to-transparent text-white">
                    <p className="font-label text-[10px] tracking-[0.2em] text-[#C9A84C] uppercase mb-1">{item.category}</p>
                    <h3 className="font-heading text-2xl">{item.title}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

CircularGallery.displayName = "CircularGallery";

export { CircularGallery };
