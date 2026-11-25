import type { ReactNode } from "react";

/**
 * Figure SVG (chaîne de `ui6e/figureLieux.ts`, la même que celle du corrigé papier) des générateurs
 * du 6e ch. 9 : centrée, 300 px au plus, jamais plus large que l'écran.
 */
export function FigureLieux({ svg, legende }: { svg: string; legende?: ReactNode }) {
  return (
    <figure className="figure-lieux" style={{ margin: "8px auto", maxWidth: 300, width: "100%" }}>
      <div style={{ lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: svg }} />
      {legende && <figcaption style={{ fontSize: "0.85rem", marginTop: 4, textAlign: "center" }}>{legende}</figcaption>}
    </figure>
  );
}
