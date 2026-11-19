import type { SolutionEnsembleProduit } from "../core/signesProduit.types";
import { appartientProduit } from "../ui/aidesSecondDegre";

interface Props {
  /** Fonction étudiée (produit ou quotient), évaluée numériquement. */
  f: (x: number) => number;
  /** Racines du numérateur (zéros de f). */
  zeros: number[];
  /** Valeurs interdites (dénominateur nul) : asymptotes verticales, double barre. */
  interdites?: number[];
  /** Ensemble des solutions : la partie de l'axe solution est surlignée. */
  solution?: SolutionEnsembleProduit;
  /** Nom de la fonction (« P(x) », « Q(x) »). */
  nom?: string;
}

const L = 340;
const H = 230;
const MG = 26;
const HAUT_COURBE = 150;
const Y_AXE = 90;

function nombreTypo(v: number): string {
  const r = Math.round(v * 100) / 100;
  return (r < 0 ? "−" : "") + String(Math.abs(r)).replace(".", ",");
}

/**
 * Courbe d'un produit / d'un quotient et sa ligne de signes (gen5, gen6), montrée APRÈS la
 * validation de l'écran du tableau de signes et de l'ensemble des solutions (audit 4e ch. 2, lot B :
 * « la grille de signes d'un produit lue sur la courbe », cours § 3). Les zéros sont des points
 * pleins, les valeurs interdites des droites pointillées ; sous l'axe, le signe de chaque zone ; la
 * partie de l'axe qui est solution est surlignée en vert.
 */
export function CourbeSignes({ f, zeros, interdites = [], solution, nom = "f(x)" }: Props) {
  const points = [...new Set([...zeros, ...interdites])].sort((a, b) => a - b);
  const xmin = (points[0] ?? 0) - 2;
  const xmax = (points[points.length - 1] ?? 0) + 2;
  const sx = (x: number) => MG + ((x - xmin) / (xmax - xmin)) * (L - 2 * MG);
  const loinInterdite = (x: number) => interdites.every((v) => Math.abs(x - v) > (xmax - xmin) / 40);
  const N = 240;
  const echantillons: { x: number; y: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const x = xmin + ((xmax - xmin) * i) / N;
    const y = f(x);
    if (Number.isFinite(y) && loinInterdite(x)) echantillons.push({ x, y });
  }
  const amplitudes = echantillons.map((p) => Math.abs(p.y)).sort((a, b) => a - b);
  const ymax = Math.max(1, amplitudes[Math.floor(amplitudes.length * 0.9)] ?? 1);
  const sy = (y: number) => Y_AXE - (Math.max(-ymax * 1.2, Math.min(ymax * 1.2, y)) / ymax) * (HAUT_COURBE / 2 - 12);
  // Tracés coupés aux valeurs interdites.
  const traces: string[] = [];
  let courant: string[] = [];
  let xPrec: number | null = null;
  for (const p of echantillons) {
    if (xPrec !== null && interdites.some((v) => xPrec! < v && p.x > v)) {
      if (courant.length > 1) traces.push(courant.join(" "));
      courant = [];
    }
    courant.push(`${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`);
    xPrec = p.x;
  }
  if (courant.length > 1) traces.push(courant.join(" "));
  // Zones de signe et parties solutions de l'axe.
  const bords = [xmin, ...points, xmax];
  const zones = bords.slice(0, -1).map((g, i) => {
    const d = bords[i + 1]!;
    const m = (g + d) / 2;
    const v = f(m);
    return { g, d, m, signe: v > 0 ? "+" : "−", solution: solution ? appartientProduit(solution, m) : false };
  });
  const yLigne = HAUT_COURBE + 28;
  return (
    <figure className="courbe-signes">
      <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label={`Courbe de ${nom} et son signe`}>
        <line x1={MG - 10} y1={Y_AXE} x2={L - MG + 10} y2={Y_AXE} className="cs-axe" />
        {zones.filter((z) => z.solution).map((z, i) => (
          <line key={`s${i}`} x1={sx(z.g)} y1={Y_AXE} x2={sx(z.d)} y2={Y_AXE} className="cs-solution" />
        ))}
        {interdites.map((v, i) => (
          <line key={`i${i}`} x1={sx(v)} y1={10} x2={sx(v)} y2={HAUT_COURBE + 4} className="cs-interdite" />
        ))}
        {traces.map((t, i) => (
          <polyline key={`t${i}`} points={t} className="cs-courbe" />
        ))}
        {zeros.map((z, i) => (
          <g key={`z${i}`}>
            <circle cx={sx(z)} cy={Y_AXE} r={4} className={solution && appartientProduit(solution, z) ? "cs-zero cs-zero-solution" : "cs-zero"} />
          </g>
        ))}
        {/* Ligne de signes, comme la dernière ligne du tableau. */}
        <text x={6} y={yLigne + 5} className="cs-nom">
          {nom}
        </text>
        <line x1={MG} y1={yLigne + 14} x2={L - MG} y2={yLigne + 14} className="cs-trait" />
        {zones.map((z, i) => (
          <text key={`g${i}`} x={sx(z.m)} y={yLigne + 6} textAnchor="middle" className={z.solution ? "cs-signe cs-signe-solution" : "cs-signe"}>
            {z.signe}
          </text>
        ))}
        {points.map((v, i) => (
          <g key={`p${i}`}>
            <text x={sx(v)} y={yLigne + 6} textAnchor="middle" className="cs-signe">
              {interdites.includes(v) ? "‖" : "0"}
            </text>
            <text x={sx(v)} y={yLigne + 30} textAnchor="middle" className="cs-graduation">
              {nombreTypo(v)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>
        Courbe de <i>{nom.replace("(x)", "")}</i> : au-dessus de l'axe là où le signe est « + », en dessous là où il est « − ». En vert, les x solutions.
      </figcaption>
    </figure>
  );
}
