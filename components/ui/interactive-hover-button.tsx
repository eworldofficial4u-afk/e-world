import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { soundEngine } from "@/hooks/useAudioEngine";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  silent?: boolean;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text, children, className, silent = false, onPointerEnter, onClick, ...props }, ref) => {
  const content = text ?? (typeof children === "string" ? children : "Button");

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!silent) soundEngine.playHoverBlip();
    onPointerEnter?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!silent) soundEngine.playClickPunch();
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      onPointerEnter={handlePointerEnter}
      onClick={handleClick}
      className={cn(
        "group relative min-w-32 cursor-pointer overflow-hidden rounded-full border border-white/20 bg-background/80 backdrop-blur-md p-2 px-5 text-center font-semibold text-foreground transition-colors duration-300 hover:border-white/50",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {content}
      </span>
      <div className="absolute inset-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span className="font-semibold">{content}</span>
        <ArrowRight className="w-4 h-4" />
      </div>
      <div className="absolute left-[20%] top-[40%] z-0 h-2 w-2 scale-[1] rounded-full bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[2.5] group-hover:bg-primary"></div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
