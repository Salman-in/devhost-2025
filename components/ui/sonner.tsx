"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps, toast } from "sonner";
import React from "react";
import { ClippedButton } from "@/components/ClippedButton";

const clipPathShape =
  "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster flex justify-center"
      toastOptions={{
        className: "relative flex justify-center items-center font-orbitron",
        style: {
          display: "inline-flex",
          width: "fit-content",
          maxWidth: "95vw",
          whiteSpace: "normal",
          position: "relative",
        },
      }}
      {...props}
    />
  );
};

export const showConfirmationToast = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  toast.custom(
    (t) => (
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "95vw",
        }}
      >
        {/* Border layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: clipPathShape,
            border: "2px solid #00ff00",
            pointerEvents: "none",
            zIndex: 0,
            boxSizing: "border-box",
          }}
        />

        {/* Content layer */}
        <div
          style={{
            clipPath: clipPathShape,
            background: "#101810",
            color: "white",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "95vw",
            wordBreak: "break-word", // ensures long text wraps
          }}
        >
          <p
            className="text-center text-sm"
            style={{ width: "100%", margin: 0 }}
          >
            {message}
          </p>

          <div className="mt-4 flex w-full flex-wrap justify-center gap-2">
            <ClippedButton
              innerBg="bg-primary"
              textColor="text-black"
              className="min-w-[120px] flex-1"
              onClick={() => {
                onConfirm();
                toast.dismiss(t);
              }}
            >
              Yes
            </ClippedButton>
            <ClippedButton
              innerBg="bg-red-500"
              textColor="text-white"
              className="min-w-[120px] flex-1"
              onClick={() => {
                onCancel?.();
                toast.dismiss(t);
              }}
            >
              Cancel
            </ClippedButton>
          </div>
        </div>
      </div>
    ),
    { duration: Infinity },
  );
};

export { Toaster };
