import { ClippedCard } from "./ClippedCard";

export function ClippedButton({
  children,
  onClick,
  disabled,
  innerBg = "bg-primary",
  outerBg = "bg-transparent",
  textColor = "text-black",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  innerBg?: string;
  outerBg?: string;
  textColor?: string;
  type?: "button" | "submit";
}) {
  return (
    <ClippedCard
      className="flex-1 hover:brightness-95"
      innerBg={innerBg}
      outerBg={outerBg}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`w-full px-5 py-2 text-xs font-bold tracking-widest uppercase ${textColor} flex cursor-pointer items-center justify-center gap-2 disabled:opacity-50`}
      >
        {children}
      </button>
    </ClippedCard>
  );
}
