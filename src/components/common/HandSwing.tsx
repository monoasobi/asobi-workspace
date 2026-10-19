import { forwardRef } from "react";
import { MoveHorizontal, type LucideProps } from "lucide-react";

// Keep the saved hand-swing name compatible while displaying horizontal arrows.
export const HandSwing = forwardRef<SVGSVGElement, LucideProps>(
  function HandSwing(props, ref) {
    return <MoveHorizontal {...props} ref={ref} />;
  },
);
