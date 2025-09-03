"use client";

import { ClippedButton } from "@/components/ClippedButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkIcon } from "lucide-react";

interface DriveLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (link: string) => Promise<void>;
  onValidate: (
    link: string,
  ) => Promise<{ accessible: boolean; message: string; status: number } | null>;
  link: string;
  onLinkChange: (link: string) => void;
  isValidating: boolean;
  isUpdating: boolean;
  updated: boolean;
  isDirty: boolean;
  error: string;
  validationResult: {
    accessible: boolean;
    message: string;
    status: number;
  } | null;
}

export default function DriveLinkModal({
  isOpen,
  onClose,
  onSubmit,
  onValidate,
  link,
  onLinkChange,
  isValidating,
  isUpdating,
  updated,
  isDirty,
  error,
  validationResult,
}: DriveLinkModalProps) {
  if (!isOpen) return null;

  const handleValidateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) return;

    const validationResult = await onValidate(link);
    if (validationResult && validationResult.accessible) {
      await onSubmit(link);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={{
        background: "rgba(0,0,0,0.98)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="mx-4 w-full max-w-md rounded-lg bg-black p-6">
        <h2 className="text-primary text-orbitron mb-4 flex items-center gap-2 text-xl font-bold">
          <LinkIcon className="h-4 w-4" />
          Add Drive Link
        </h2>

        <form onSubmit={handleValidateAndSubmit}>
          <div className="mb-4">
            <Label htmlFor="drive_link" className="mb-2">
              Google Drive Link
            </Label>
            <Input
              id="drive_link"
              type="url"
              value={link}
              onChange={(e) => onLinkChange(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="focus:ring-primary rounded-md border border-white px-3 py-2 text-white placeholder:text-gray-400 focus:ring-2 focus:outline-none"
              required
            />
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div
              className={`mb-4 rounded-md p-3 ${
                validationResult.accessible
                  ? "border border-green-200 bg-green-50"
                  : "border border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm ${
                  validationResult.accessible
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {validationResult.accessible ? "✓ " : "✗ "}
                {validationResult.message}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                HTTP Status: {validationResult.status}
              </p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-primary/60 text-sm">
              Please make sure your drive folder is set to &quot;Anyone with the
              link can view&quot; permissions.
            </p>
          </div>

          {error && !validationResult && (
            <p className="mb-4 text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3">
            <ClippedButton
              innerBg="bg-destructive hover:bg-red-500"
              type="button"
              onClick={onClose}
              className="bg-destructive flex-1 px-4 py-2 text-white transition-colors hover:bg-red-500 hover:text-black"
            >
              Cancel
            </ClippedButton>
            <ClippedButton
              innerBg="bg-primary hover:bg-brightness-90"
              type="submit"
              className="bg-primary hover:bg-brightness-90 flex-1 px-4 py-2 text-white transition-colors disabled:opacity-50"
              disabled={isUpdating || updated || !isDirty || isValidating}
            >
              {isValidating
                ? "Validating..."
                : isUpdating
                  ? "Saving..."
                  : updated
                    ? "Saved!"
                    : "Save Link"}
            </ClippedButton>
          </div>
        </form>
      </div>
    </div>
  );
}
