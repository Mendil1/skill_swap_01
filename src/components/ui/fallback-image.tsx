"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FallbackImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  fallbackSrc?: string;
  className?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
}

// Memoize the component to prevent unnecessary re-renders
export const FallbackImage = memo(function FallbackImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = "/globe.svg",
  className,
  priority = false,
  loading,
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn("w-full h-auto", className)}
      onError={() => {
        setImgSrc(fallbackSrc);
      }}
      priority={priority}
      loading={loading}
      unoptimized={src.startsWith('data:')} // Don't optimize data URLs
    />
  );
});
