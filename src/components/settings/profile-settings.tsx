"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { SaveButton } from "@/components/settings/save-button";
import { SettingsSection } from "@/components/settings/settings-section";
import { getInitials } from "@/lib/format";
import { profileSchema, type ProfileValues } from "@/lib/schemas/settings";
import { saveSettings } from "@/services/mutations";
import type { UserProfile } from "@/types";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const FORM_ID = "profile-form";

export function ProfileSettings({ user }: { user: UserProfile }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email, company: user.company, role: user.role, bio: "" },
  });

  // Release the previous preview URL whenever it is replaced or the page unmounts.
  useEffect(
    () => () => {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    },
    [avatarUrl],
  );

  const name = useWatch({ control, name: "name" });
  const bioLength = useWatch({ control, name: "bio" })?.length ?? 0;

  const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Unsupported file", { description: "Upload a PNG, JPG, GIF or WebP image." });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image is too large", { description: "Profile photos must be 2 MB or smaller." });
      return;
    }
    setAvatarUrl(URL.createObjectURL(file));
    toast.success("Profile photo updated", { description: "The preview is stored only for this session." });
  };

  const onSubmit = async (values: ProfileValues) => {
    await saveSettings(values);
    reset(values);
    toast.success("Profile saved", { description: "Your personal details have been updated." });
  };

  return (
    <SettingsSection
      title="Profile"
      description="How you appear to teammates in reports, comments and email digests."
      footer={<SaveButton form={FORM_ID} isSubmitting={isSubmitting} isDirty={isDirty} saved={isSubmitSuccessful} />}
    >
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Avatar className="size-16">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile photo preview" />}
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {getInitials(name || user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
              <Upload />
              Upload photo
            </Button>
            {avatarUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarUrl(null)}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF or WebP. Max 2 MB.</p>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-label="Upload profile photo"
            onChange={onAvatarChange}
          />
        </div>
      </div>

      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" error={errors.name?.message}>
          {(field) => <Input {...field} {...register("name")} autoComplete="name" />}
        </FormField>
        <FormField label="Email address" error={errors.email?.message}>
          {(field) => <Input {...field} {...register("email")} type="email" autoComplete="email" />}
        </FormField>
        <FormField label="Company" error={errors.company?.message}>
          {(field) => <Input {...field} {...register("company")} autoComplete="organization" />}
        </FormField>
        <FormField label="Role" error={errors.role?.message}>
          {(field) => <Input {...field} {...register("role")} autoComplete="organization-title" />}
        </FormField>
        <FormField
          label="Bio"
          error={errors.bio?.message}
          description={`${bioLength}/160 characters · shown on shared dashboards`}
          className="sm:col-span-2"
        >
          {(field) => (
            <Textarea
              {...field}
              {...register("bio")}
              rows={3}
              placeholder="Revenue operations lead focused on retention and pricing."
            />
          )}
        </FormField>
      </form>
    </SettingsSection>
  );
}
