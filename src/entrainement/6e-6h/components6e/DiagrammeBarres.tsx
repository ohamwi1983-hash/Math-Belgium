interface Props {
  titre: string;
  /** P(X = k) pour k = 0 … n. */
  probabilites: number[];
  /** Échelle verticale commune (plus grande probabilité de tous les diagrammes comparés). */
  maximum: number;
}

/**
 * Diagramme en barres d'une loi discrète (6gen50 B, audit, lot C : « loi complète… diagramme »).
 * Sans graduation verticale : on compare des FORMES (sommet, queue), pas des valeurs. Largeur fluide.
 */
export function DiagrammeBarres({ titre, probabilites, maximum }: Props) {
  const L = 150;
  const H = 110;
  const bas = 92;
  const haut = 78;
  const n = probabilites.length;
  const pas = (L - 20) / n;
  return (
    <figure style={{ margin: 0, textAlign: "center" }}>
      <svg viewBox={`0 0 ${L} ${H}`} width="100%" role="img" aria-label={`${titre} : diagramme en barres de ${n} valeurs`} style={{ display: "block", maxWidth: 220, margin: "0 auto", color: "var(--color-text, currentColor)" }}>
        <line x1={8} y1={bas} x2={L - 6} y2={bas} stroke="currentColor" strokeWidth="1" />
        {probabilites.map((p, k) => {
          const h = maximum > 0 ? (p / maximum) * haut : 0;
          const x = 12 + k * pas + pas * 0.15;
          return (
            <g key={k}>
              <rect x={x} y={bas - h} width={pas * 0.7} height={h} fill="var(--color-primary, currentColor)" opacity="0.8" />
              <text x={x + pas * 0.35} y={bas + 13} textAnchor="middle" fontSize="11" fill="currentColor">
                {k}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption style={{ fontWeight: 600, fontSize: 14 }}>{titre}</figcaption>
    </figure>
  );
}
