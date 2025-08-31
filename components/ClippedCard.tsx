import clsx from "clsx";
import { CSSProperties, ReactNode } from "react";

type ClippedCardProps = {
  className?: string;
  outerBg?: string;
  innerBg?: string;
  textColor?: string;
  width?: string;
  height?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function ClippedCard({
  className = "",
  outerBg = "bg-primary",
  innerBg = "bg-black",
  textColor = "text-black",
  width = "max-w-3xl",
  height = "",
  style = {},
  children,
}: ClippedCardProps) {
  return (
    <div
      className={clsx("relative p-[1px]", outerBg, width, height, className)}
      style={{
        clipPath:
          "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
        ...style,
      }}
    >
      <div
        className={clsx(
          textColor,
          "flex h-full items-center gap-2",
          innerBg,
        )}
        style={{
          clipPath:
            "polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
