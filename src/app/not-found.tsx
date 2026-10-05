import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand-mark";
import { EmptyState } from "@/components/shared/states";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4">
      <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold tracking-tight">
        <BrandMark />
        MetricFlow
      </Link>
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        className="w-full max-w-md rounded-xl border bg-card py-14"
        action={
          <Button asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </main>
  );
}
