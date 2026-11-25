import { useMemo } from "react";
import katex from "katex";
import { lireFormule } from "../../lib/lectureFormules";

/**
 * Remplaçants de `InlineMath` / `BlockMath` (react-katex) avec la MÊME sortie (même élément, même
 * HTML KaTeX, `data-testid="react-katex"`, mêmes options : `throwOnError: false`, sortie par défaut),
 * plus une formule ACCESSIBLE : `role="img"` et `aria-label` = lecture en mots en français
 * (`lib/lectureFormules.ts`), pour que les lecteurs d'écran disent « u indice n plus 1 égale… » au
 * lieu de sauter la formule ou d'épeler le MathML. Aucun élément ajouté autour : les règles CSS des
 * générateurs (`.equation-box > *`, `.katex-display > .katex`…) visent toujours les mêmes nœuds.
 */
function rendu(math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math, { displayMode, throwOnError: false });
  } catch (e) {
    return String((e as Error).message);
  }
}

export function InlineMath({ math }: { math: string }) {
  const html = useMemo(() => rendu(math, false), [math]);
  const lu = lireFormule(math);
  return <span data-testid="react-katex" role={lu ? "img" : undefined} aria-label={lu || undefined} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BlockMath({ math }: { math: string }) {
  const html = useMemo(() => rendu(math, true), [math]);
  const lu = lireFormule(math);
  return <div data-testid="react-katex" role={lu ? "img" : undefined} aria-label={lu || undefined} dangerouslySetInnerHTML={{ __html: html }} />;
}
