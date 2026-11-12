/**
 * Petit plan de Gauss (Argand) en SVG — figure d'énoncé des générateurs `6gen40`/`6gen41` (audit
 * 6e ch. 5, décision K : « petit plan complexe des points et images, si raisonnable »). Purement
 * illustratif : aucune donnée n'y est lue pour vérifier une réponse.
 *
 * Cadre ajusté automatiquement aux points (origine toujours incluse), MÊME échelle sur les deux axes
 * (un angle droit reste droit, un cercle reste rond), graduation adaptée à l'étendue (1, 2, 5, 10…)
 * pour rester lisible quand un triangle s'étend jusqu'à ±40. Largeur fluide (`max-width: 100%`) :
 * jamais de débordement horizontal à 390 px. Couleurs via les jetons du thème (`--color-*`), donc
 * lisible en clair comme en sombre.
 */

export interface PointFigure {
  x: number;
  y: number;
  label: string;
  /** "image" : point image (couleur secondaire) ; défaut : point de départ. */
  role?: "depart" | "image";
}

export interface FlecheFigure {
  de: [number, number];
  vers: [number, number];
}

interface Props {
  points: PointFigure[];
  fleches?: FlecheFigure[];
  /** Polygones fermés (ex. un ou deux triangles), tracés sous les points. */
  polygones?: [number, number][][];
  legende?: string;
}

const LARGEUR = 260;
const MARGE = 18;

function pasGraduation(etendue: number): number {
  const brut = etendue / 8;
  for (const p of [1, 2, 5, 10, 20, 50]) if (p >= brut) return p;
  return 100;
}

export function PlanArgandMini({ points, fleches = [], polygones = [], legende }: Props) {
  const xs = [0, ...points.map((p) => p.x), ...polygones.flat().map((p) => p[0])];
  const ys = [0, ...points.map((p) => p.y), ...polygones.flat().map((p) => p[1])];
  let xMin = Math.min(...xs) - 1;
  let xMax = Math.max(...xs) + 1;
  let yMin = Math.min(...ys) - 1;
  let yMax = Math.max(...ys) + 1;
  // Cadre au moins 6 unités de côté, sinon un triangle minuscule remplirait toute la figure.
  if (xMax - xMin < 6) {
    const c = (xMax + xMin) / 2;
    xMin = c - 3;
    xMax = c + 3;
  }
  if (yMax - yMin < 6) {
    const c = (yMax + yMin) / 2;
    yMin = c - 3;
    yMax = c + 3;
  }
  const echelle = (LARGEUR - 2 * MARGE) / (xMax - xMin);
  // Hauteur dérivée de la MÊME échelle (repère orthonormé), bornée pour ne pas étirer l'écran.
  const echelleFinale = Math.min(echelle, 220 / (yMax - yMin));
  const largeur = (xMax - xMin) * echelleFinale + 2 * MARGE;
  const hauteur = (yMax - yMin) * echelleFinale + 2 * MARGE;
  const X = (x: number) => MARGE + (x - xMin) * echelleFinale;
  const Y = (y: number) => MARGE + (yMax - y) * echelleFinale;
  const pas = pasGraduation(Math.max(xMax - xMin, yMax - yMin));

  const graduationsX: number[] = [];
  for (let v = Math.ceil(xMin / pas) * pas; v <= xMax; v += pas) if (v !== 0) graduationsX.push(v);
  const graduationsY: number[] = [];
  for (let v = Math.ceil(yMin / pas) * pas; v <= yMax; v += pas) if (v !== 0) graduationsY.push(v);

  const trait = { stroke: "var(--color-text-muted)", strokeWidth: 1 };
  const grille = { stroke: "var(--color-border)", strokeWidth: 0.6 };

  return (
    <figure className="plan-argand-mini" style={{ margin: "12px 0 0", textAlign: "center" }}>
      <svg viewBox={`0 0 ${largeur.toFixed(1)} ${hauteur.toFixed(1)}`} width={largeur} style={{ maxWidth: "100%", height: "auto" }} role="img" aria-label={legende ?? "Plan complexe"}>
        <defs>
          <marker id="fleche-axe-argand" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" style={{ fill: "var(--color-text-muted)" }} />
          </marker>
          <marker id="fleche-image-argand" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" style={{ fill: "var(--color-success)" }} />
          </marker>
        </defs>
        {graduationsX.map((v) => (
          <line key={`gx${v}`} x1={X(v)} y1={Y(yMin)} x2={X(v)} y2={Y(yMax)} style={grille} />
        ))}
        {graduationsY.map((v) => (
          <line key={`gy${v}`} x1={X(xMin)} y1={Y(v)} x2={X(xMax)} y2={Y(v)} style={grille} />
        ))}
        <line x1={X(xMin)} y1={Y(0)} x2={X(xMax)} y2={Y(0)} style={trait} markerEnd="url(#fleche-axe-argand)" />
        <line x1={X(0)} y1={Y(yMin)} x2={X(0)} y2={Y(yMax)} style={trait} markerEnd="url(#fleche-axe-argand)" />
        <text x={X(xMax) - 4} y={Y(0) - 5} textAnchor="end" style={{ fill: "var(--color-text-muted)", fontSize: 10 }}>
          Re
        </text>
        <text x={X(0) + 5} y={Y(yMax) + 9} style={{ fill: "var(--color-text-muted)", fontSize: 10 }}>
          Im
        </text>
        <text x={X(pas) } y={Y(0) + 12} textAnchor="middle" style={{ fill: "var(--color-text-muted)", fontSize: 9 }}>
          {pas}
        </text>
        <text x={X(0) - 4} y={Y(0) + 12} textAnchor="end" style={{ fill: "var(--color-text-muted)", fontSize: 9 }}>
          O
        </text>
        {polygones.map((poly, i) => (
          <polygon
            key={`poly${i}`}
            points={poly.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(" ")}
            style={i === 0 ? { fill: "var(--color-primary-bg)", stroke: "var(--color-primary)", strokeWidth: 1.5 } : { fill: "var(--color-success-bg)", stroke: "var(--color-success)", strokeWidth: 1.5, fillOpacity: 0.6 }}
          />
        ))}
        {fleches.map((f, i) => (
          <line key={`f${i}`} x1={X(f.de[0])} y1={Y(f.de[1])} x2={X(f.vers[0])} y2={Y(f.vers[1])} style={{ stroke: "var(--color-success)", strokeWidth: 1.4, strokeDasharray: "4 3" }} markerEnd="url(#fleche-image-argand)" />
        ))}
        {points.map((p, i) => {
          const couleur = p.role === "image" ? "var(--color-success)" : "var(--color-primary)";
          const aDroite = X(p.x) < largeur - 30;
          return (
            <g key={`p${i}`}>
              <circle cx={X(p.x)} cy={Y(p.y)} r={3.2} style={{ fill: couleur }} />
              <text x={X(p.x) + (aDroite ? 6 : -6)} y={Y(p.y) - 6} textAnchor={aDroite ? "start" : "end"} style={{ fill: couleur, fontSize: 12, fontStyle: "italic", fontWeight: 600 }}>
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
      {legende && <figcaption style={{ fontSize: "0.85em", color: "var(--color-text-muted)" }}>{legende}</figcaption>}
    </figure>
  );
}
