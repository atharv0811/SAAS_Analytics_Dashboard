"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/states";

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Hook point for an error reporting service.
    console.error(error);
  }, [error]);

  return (
    <Card className="py-0">
      <ErrorState
        title="This page couldn't be loaded"
        description="Something went wrong while fetching your data. It's usually temporary, so please try again."
        onRetry={retry}
        className="py-20"
      />
    </Card>
  );
}
