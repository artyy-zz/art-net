import Image from "next/image";
import Link from "next/link";
import { publicBrand } from "@/data/public-site";
import { cn } from "@/lib/utils";

export function Logo({
  href,
  className,
  inverse = false,
}: {
  href: string;
  className?: string;
  inverse?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center", className)}
      aria-label={publicBrand.name}
    >
      <span
        className={cn(
          "inline-flex overflow-hidden",
          inverse ? "brightness-0 invert" : undefined,
        )}
      >
        <Image
          src={publicBrand.logo}
          alt=""
          width={190}
          height={68}
          sizes="190px"
          className="h-12 w-auto object-contain"
        />
      </span>
    </Link>
  );
}
