import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { normaliserLimites } from "../../../lib/notationLog";

interface KatexProps {
  expression: string;
  block?: boolean;
}

export function Katex({ expression, block = false }: KatexProps) {
  const math = normaliserLimites(expression);
  return block ? <BlockMath math={math} /> : <InlineMath math={math} />;
}
