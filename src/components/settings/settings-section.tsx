import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Card shell shared by every settings panel: header, body and an action footer. */
export function SettingsSection({ title, description, children, footer, className }: SettingsSectionProps) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="border-b px-5 py-4 sm:px-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-5 py-5 sm:px-6">{children}</CardContent>
      {footer && <CardFooter className="justify-end gap-2 px-5 py-3 sm:px-6">{footer}</CardFooter>}
    </Card>
  );
}
