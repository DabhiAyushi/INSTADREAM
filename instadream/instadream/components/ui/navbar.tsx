"use client";

import { LucideClock4, LucideSparkle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="text-lg font-semibold">
          InstaDream
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-1 rounded-full border p-0.5">
          <Button
            variant={isActive("/") ? "primary_outline" : "ghost"}
            className="!rounded-full "
            size={"icon"}
            asChild
          >
            <Link href="/">
              <LucideSparkle />
            </Link>
          </Button>
          <Button
            variant={isActive("/history") ? "primary_outline" : "ghost"}
            className="!rounded-full "
            size={"icon"}
            asChild
          >
            <Link href="/history">
              <LucideClock4 />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
