import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface KatexProps {
  expression: string;
  block?: boolean;
}

export function Katex({ expression, block = false }: KatexProps) {
  return block ? <BlockMath math={expression} /> : <InlineMath math={expression} />;
}
