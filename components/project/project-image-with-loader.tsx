"use client"

import { useState } from "react"
import Image from "next/image"

import { appPath } from "@/lib/base-path"

interface ProjectImageWithLoaderProps {
  src: string
  alt: string
}

export function ProjectImageWithLoader({ src, alt }: ProjectImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const isUploadedDataImage = src.startsWith("data:image/")
  const resolvedSrc = appPath(src)

  return (
    <div className="relative overflow-hidden rounded-xl">
      {isLoading && <div className="bg-muted absolute inset-0 z-10 animate-pulse"></div>}
      {isUploadedDataImage ? (
        <img
          src={resolvedSrc}
          alt={alt}
          className="h-auto w-full object-cover"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      ) : (
        <Image
          src={resolvedSrc}
          alt={alt}
          width={800}
          height={400}
          className="h-auto w-full object-cover"
          priority
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      )}
    </div>
  )
}
