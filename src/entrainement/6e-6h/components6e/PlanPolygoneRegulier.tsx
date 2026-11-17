/**
 * Plan complexe STATIQUE de `6gen97` « Polygones réguliers et racines n-ièmes » (écran) : repère
 * orthonormé à fenêtre FIXE (carrée, jamais recadrée sur la réponse), quadrillage, axes fléchés et
 * gradués, cercle circonscrit, polygone et points étiquetés. Les étiquettes sont posées à l'opposé
 * du centre du polygone (`centreEtiquettes`), avec un halo de la couleur du fond.
 *
 * Aucune coordonnée écrite à côté des points : les affixes des données sont dans l'énoncé, celles
 * des sommets demandés n'apparaissent qu'une fois l'écran correspondant validé.
 * Couleurs : jetons du thème (`var(--…)`), lisibles en clair comme en sombre.
 */

export type RolePointPolygone = "donnee" | "centre" | "trouve" | "neutre";

export interface PointFigurePolygone {
  x: number;
  y: number;
  label: string;
  role: RolePointPolygone;
}

export interface FigurePolygone {
  /** Fenêtre carrée [−borne ; borne]² (repère centré en O). */
  borne: number;
  /** Pas du quadrillage (1 ou 0,5). */
  pas: number;
  cercle?: { cx: number; cy: number; r: number };
  /** Sommets du polygone (contour), dans l'ordre. */
  polygone?: { x: number; y: number }[];
  /** Segment mis en évidence (côté [Z₀Z₁]…). */
  segment?: { de: { x: number; y: number }; a: { x: number; y: number } };
  points: PointFigurePolygone[];
  centreEtiquettes: { x: number; y: number };
  legende: string;
}

const COTE = 340;
const MARGE = 22;

const COULEUR: Record<RolePointPolygone, string> = {
  donnee: "var(--sky, #2f6fb0)",
  centre: "var(--plan, #5b4ea3)",
  trouve: "var(--good, #2f7a4f)",
  neutre: "var(--ink-soft, #51626f)",
};

export function PlanPolygoneRegulier({ figure }: { figure: FigurePolygone }) {
  const { borne, pas } = figure;
  const unite = (COTE - 2 * MARGE) / (2 * borne);
  const X = (x: number) => MARGE + (x + borne) * unite;
  const Y = (y: number) => MARGE + (borne - y) * unite;
  const doux = "var(--ink-soft, #51626f)";
  const pale = "var(--ink-faint, #8a97a1)";
  const halo = { stroke: "var(--surface, #ffffff)", strokeWidth: 3, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };

  const lignes: number[] = [];
  for (let v = -borne; v <= borne + 1e-9; v += pas) lignes.push(Math.round(v * 1000) / 1000);
  const graduations: number[] = [];
  for (let v = -Math.floor(borne - 0.5); v <= borne - 0.5; v++) if (v !== 0) graduations.push(v);
  const pasGrad = borne > 5 ? 2 : 1;

  function positionEtiquette(p: { x: number; y: number }) {
    let dx = p.x - figure.centreEtiquettes.x;
    let dy = p.y - figure.centreEtiquettes.y;
    const d = Math.hypot(dx, dy);
    if (d < 1e-9) {
      dx = -0.7;
      dy = -0.7;
    } else {
      dx /= d;
      dy /= d;
    }
    const tx = X(p.x) + dx * 13;
    const ty = Y(p.y) - dy * 13 + 5;
    const ancre: "start" | "end" | "middle" = dx > 0.35 ? "start" : dx < -0.35 ? "end" : "middle";
    return { tx, ty, ancre };
  }

  return (
    <figure className="plan-polygone-regulier" style={{ margin: "10px 0 6px", textAlign: "center" }}>
      <svg viewBox={`0 0 ${COTE} ${COTE}`} width="100%" style={{ maxWidth: COTE, height: "auto", display: "block", margin: "0 auto" }} role="img" aria-label={figure.legende}>
        <defs>
          <marker id="ppr-axe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: doux }} />
          </marker>
        </defs>
        {lignes.map((v) => (
          <g key={`g${v}`}>
            <line x1={X(v)} y1={Y(-borne)} x2={X(v)} y2={Y(borne)} style={{ stroke: pale, strokeWidth: Number.isInteger(v) ? 0.6 : 0.4, strokeOpacity: 0.55 }} />
            <line x1={X(-borne)} y1={Y(v)} x2={X(borne)} y2={Y(v)} style={{ stroke: pale, strokeWidth: Number.isInteger(v) ? 0.6 : 0.4, strokeOpacity: 0.55 }} />
          </g>
        ))}
        <line x1={X(-borne)} y1={Y(0)} x2={X(borne) + 10} y2={Y(0)} style={{ stroke: doux, strokeWidth: 1.2 }} markerEnd="url(#ppr-axe)" />
        <line x1={X(0)} y1={Y(-borne)} x2={X(0)} y2={Y(borne) - 10} style={{ stroke: doux, strokeWidth: 1.2 }} markerEnd="url(#ppr-axe)" />
        <text x={X(borne) + 4} y={Y(0) + 15} style={{ fill: doux, fontSize: 11 }}>
          Re
        </text>
        <text x={X(0) + 6} y={Y(borne) - 4} style={{ fill: doux, fontSize: 11 }}>
          Im
        </text>
        {graduations
          .filter((v) => v % pasGrad === 0)
          .map((v) => (
            <g key={`t${v}`}>
              <line x1={X(v)} y1={Y(0) - 3} x2={X(v)} y2={Y(0) + 3} style={{ stroke: doux, strokeWidth: 1 }} />
              <text x={X(v)} y={Y(0) + 13} textAnchor="middle" style={{ fill: doux, fontSize: 9.5, ...halo }}>
                {String(v).replace("-", "−")}
              </text>
              <line x1={X(0) - 3} y1={Y(v)} x2={X(0) + 3} y2={Y(v)} style={{ stroke: doux, strokeWidth: 1 }} />
              <text x={X(0) - 5} y={Y(v) + 3.5} textAnchor="end" style={{ fill: doux, fontSize: 9.5, ...halo }}>
                {String(v).replace("-", "−")}
              </text>
            </g>
          ))}
        <text x={X(0) - 5} y={Y(0) + 13} textAnchor="end" style={{ fill: doux, fontSize: 10, ...halo }}>
          O
        </text>
        {figure.cercle && (
          <circle cx={X(figure.cercle.cx)} cy={Y(figure.cercle.cy)} r={figure.cercle.r * unite} style={{ fill: "none", stroke: COULEUR.centre, strokeWidth: 1.2, strokeDasharray: "5 4", strokeOpacity: 0.8 }} />
        )}
        {figure.polygone && figure.polygone.length > 1 && (
          <polygon
            points={figure.polygone.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ")}
            style={{ fill: "var(--good-soft, #dcefe2)", fillOpacity: 0.45, stroke: COULEUR.trouve, strokeWidth: 1.6 }}
          />
        )}
        {figure.segment && (
          <line x1={X(figure.segment.de.x)} y1={Y(figure.segment.de.y)} x2={X(figure.segment.a.x)} y2={Y(figure.segment.a.y)} style={{ stroke: "var(--accent, #b65c1f)", strokeWidth: 3 }} />
        )}
        {figure.points.map((p, i) => {
          const e = positionEtiquette(p);
          const couleur = COULEUR[p.role];
          return (
            <g key={`p${i}`}>
              <circle cx={X(p.x)} cy={Y(p.y)} r={p.role === "neutre" ? 3 : 4.5} style={{ fill: couleur }} />
              {p.label && (
                <text x={e.tx} y={e.ty} textAnchor={e.ancre} style={{ fill: couleur, fontSize: 14, fontWeight: 700, fontStyle: "italic", ...halo }}>
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{figure.legende}</figcaption>
    </figure>
  );
}
