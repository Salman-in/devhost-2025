"use client";

import { ClippedButton } from "@/components/ClippedButton";
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
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="border-primary/40 mx-2 w-full max-w-xl rounded-lg border bg-[#101810] p-6">
        <h2 className="text-primary font-orbitron mb-4 flex items-center gap-2 text-xl font-bold">
          <LinkIcon className="h-4 w-4" />
          Add Drive Link
        </h2>

        <form onSubmit={handleValidateAndSubmit}>
          <div className="mb-4">
            <Label htmlFor="drive_link" className="text-primary mb-2 text-sm">
              Google Drive Link
            </Label>
            <Input
              id="drive_link"
              type="url"
              value={link}
              onChange={(e) => onLinkChange(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="focus:ring-primary border-primary/40 placeholder:text-primary/50 rounded-md border bg-black px-3 py-2 text-white focus:ring-2 focus:outline-none"
              required
            />
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div
              className={`mb-4 rounded-md border p-3 ${
                validationResult.accessible
                  ? "border-green-500 bg-green-900/40"
                  : "border-red-500 bg-red-900/40"
              }`}
            >
              <p
                className={`text-sm ${
                  validationResult.accessible
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {validationResult.accessible ? "✓ " : "✗ "}
                {validationResult.message}
              </p>
              <p className="text-primary/50 mt-1 text-xs">
                HTTP Status: {validationResult.status}
              </p>
            </div>
          )}

          {/* Info Section */}
          <div className="border-primary/30 mb-6 space-y-2 border-t pt-4">
            <div className="border-primary/30 rounded-md border bg-black/40 p-3">
              <p className="text-primary/80 text-sm">
                Please make sure your drive folder is set to{" "}
                <span className="text-primary font-semibold">
                  &quot;Anyone with the link can view&quot;
                </span>{" "}
                permissions.
              </p>
            </div>

            <div className="rounded-md border border-yellow-500 bg-yellow-900/40 p-3">
              <p className="text-sm font-medium text-yellow-300">
                ⚠️ The drive link must contain the abstract ppt, named as{" "}
                <span className="font-bold text-yellow-200">abstract.pptx</span>{" "}
                or{" "}
                <span className="font-bold text-yellow-200">abstract.pdf</span>.
              </p>
            </div>
          </div>

          {error && !validationResult && (
            <p className="mb-4 text-sm text-red-500">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <ClippedButton
              innerBg="bg-red-500"
              textColor="text-white"
              type="button"
              onClick={onClose}
            >
              Cancel
            </ClippedButton>
            <ClippedButton
              innerBg="bg-primary"
              type="submit"
              className="bg-primary"
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
