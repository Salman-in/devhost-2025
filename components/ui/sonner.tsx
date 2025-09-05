"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group text-primary rounded-none bg-[#101810]"
      toastOptions={{
        descriptionClassName: "font-orbitron",
        className: "font-orbitron border border-primary rounded-none",
        style: {
          borderRadius: 0,
          border: "1px solid var(--primary)",
          color: "white",
        },
      }}
      style={
        {
          "--normal-bg": "#101810",
          "--normal-text": "var(--primary)",
          "--normal-border": "var(--border-primary)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
