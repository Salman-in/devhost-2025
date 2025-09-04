import clsx from "clsx";
import {
  CSSProperties,
  ReactNode,
  ReactElement,
  isValidElement,
  cloneElement,
} from "react";

type ClippedCardProps = {
  className?: string;
  outerBg?: string;
  innerBg?: string;
  textColor?: string;
  width?: string;
  height?: string;
  style?: CSSProperties;
  children: ReactNode;
  asChild?: boolean;
};

export function ClippedCard({
  className = "",
  outerBg = "bg-primary",
  innerBg = "bg-black",
  textColor = "text-black",
  width = "w-full",
  height = "",
  style = {},
  children,
  asChild = false,
}: ClippedCardProps) {
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    return cloneElement(child, {
      className: clsx(
        child.props.className as string | undefined,
        "flex h-full w-full items-center justify-center",
      ),
    });
  }

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
          "flex h-fit w-full items-center gap-2",
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
