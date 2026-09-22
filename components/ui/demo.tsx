// Demos for UI components
import ConstellationGrid from "@/components/ui/constellation-grid";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function InteractiveHoverButtonDemo() {
  return (
    <div className="relative justify-center flex items-center p-6">
      <InteractiveHoverButton text="Button" />
    </div>
  );
}

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  return <ConstellationGrid />;
}
