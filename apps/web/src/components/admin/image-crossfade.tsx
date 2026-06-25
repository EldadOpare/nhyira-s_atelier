import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";

// Cycled through a set of images with a soft cross-fade. We used it on the admin
// cards so Nhyira saw the same switching effect the public site played.
export function ImageCrossfade({
  images,
  interval = 3000,
  className = "",
}: {
  images: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (images.length < 2) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  if (!images.length) {
    return (
      <div className={`flex items-center justify-center bg-[#F5F5F5] ${className}`}>
        <ImageIcon size={22} className="text-[#D4D4D4]" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === index ? "w-3 bg-white" : "w-1 bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
