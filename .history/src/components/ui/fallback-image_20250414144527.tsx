"use client"

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FallbackImageProps {
  src: string
  alt: string
  width: number
  height: number
  fallbackSrc?: string
  className?: string
}

export function FallbackImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = "/globe.svg",
  className,
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn("w-full h-auto", className)}
      onError={() => {
        setImgSrc(fallbackSrc)
      }}
    />
  )
}