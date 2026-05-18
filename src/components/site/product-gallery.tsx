"use client";

import Image from "next/image";
import { ImageIcon, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

function EmptyImage({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center gap-3 rounded-lg border border-[var(--color-line)] bg-[#eef3f6] text-center text-sm font-semibold text-[var(--color-muted)]">
      <ImageIcon className="h-9 w-9" />
      <span>{label}</span>
    </div>
  );
}

export function ProductGallery({
  images,
  title,
  missingLabel,
  previewLabel,
  closeLabel,
}: {
  images: string[];
  title: string;
  missingLabel: string;
  previewLabel: string;
  closeLabel: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const activeImage = images[activeIndex] ?? null;

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isPreviewOpen]);

  if (!activeImage) {
    return <EmptyImage label={missingLabel} />;
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-lg border border-[var(--color-line)] bg-white shadow-[0_24px_70px_rgba(8,27,42,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(0,107,150,0.18)]"
          aria-label={previewLabel}
        >
          <Image
            src={activeImage}
            alt={title}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain p-8 transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white/90 text-[var(--color-foreground)] shadow-[0_12px_30px_rgba(8,27,42,0.1)]">
            <Maximize2 className="h-5 w-5" />
          </span>
        </button>

        {images.length > 1 ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border bg-white transition ${
                  index === activeIndex
                    ? "border-[var(--color-accent)] shadow-[0_12px_30px_rgba(0,107,150,0.14)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-line-strong)]"
                }`}
                aria-label={`${previewLabel} ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${title} ${index + 1}`}
                  fill
                  loading="lazy"
                  sizes="120px"
                  className="object-contain p-2"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isPreviewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(4,15,24,0.82)] p-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label={previewLabel}
          onMouseDown={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative h-[86vh] w-full max-w-6xl rounded-lg bg-white"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Image
              src={activeImage}
              alt={title}
              fill
              sizes="100vw"
              className="object-contain p-5 sm:p-8"
            />
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 bg-white text-[var(--color-foreground)] shadow-[0_12px_30px_rgba(8,27,42,0.12)]"
              aria-label={closeLabel}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
