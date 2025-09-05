"use client";

import { ReactNode, isValidElement, cloneElement, ReactElement } from "react";
import clsx from "clsx";
import { ClippedCard } from "./ClippedCard";

type ClippedButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  innerBg?: string;
  outerBg?: string;
  textColor?: string;
  type?: "button" | "submit";
  className?: string;
  asChild?: boolean;
};

export function ClippedButton({
  children,
  onClick,
  disabled,
  innerBg = "bg-primary",
  outerBg = "bg-transparent",
  textColor = "text-black",
  type = "button",
  className = "",
  asChild = false,
}: ClippedButtonProps) {
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }>;
    return (
      <ClippedCard
        className={`flex-1 ${className}`}
        innerBg={innerBg}
        outerBg={outerBg}
      >
        {cloneElement(child, {
          className: clsx(
            child.props.className,
            "w-full px-5 py-2 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2",
            textColor,
          ),
        })}
      </ClippedCard>
    );
  }

  return (
    <ClippedCard
      className={`font-orbitron flex-1 hover:brightness-95 ${className}`}
      innerBg={innerBg}
      outerBg={outerBg}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={clsx(
          "flex w-full cursor-pointer items-center justify-center gap-2 px-5 py-2 text-xs font-bold tracking-widest uppercase disabled:opacity-50",
          textColor,
        )}
      >
        {children}
      </button>
    </ClippedCard>
  );
}
