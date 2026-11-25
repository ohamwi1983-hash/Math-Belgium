import { InlineMath, BlockMath } from "../../components/KatexAccessible";
import "katex/dist/katex.min.css";
import { normaliserLogDecimal } from "../../../lib/notationLog";

interface KatexProps {
  expression: string;
  block?: boolean;
}

export function Katex({ expression, block = false }: KatexProps) {
  const math = normaliserLogDecimal(expression);
  return block ? <BlockMath math={math} /> : <InlineMath math={math} />;
}
