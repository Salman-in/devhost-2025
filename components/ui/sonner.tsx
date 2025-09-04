"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps, toast } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  const clipPathShape =
    "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group flex justify-center"
      toastOptions={{
        className:
          "bg-[#101810] border border-primary px-6 py-4 text-center flex justify-center items-center shadow-lg",
        style: {
          borderRadius: 0,
          display: "inline-flex",
          width: "fit-content",
          maxWidth: "95vw",
          whiteSpace: "nowrap",
          clipPath: clipPathShape,
        },
      }}
      style={
        {
          "--normal-bg": "#101810",
          "--normal-text": "white",
          "--normal-border": "var(--primary)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

// Example function to show a simple toast
export const showSimpleToast = (message: string) => {
  toast(message, {
    duration: 4000,
    position: "top-center",
  });
};

export { Toaster };
