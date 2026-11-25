import { useId } from "react";

export interface EtiquetteGauss {
  /** Abscisse en unités de z (écart à μ divisé par σ). */
  z: number;
  /** Texte sous l'axe (« 1,23 », « 170 », « t »). */
  texte: string;
}

interface Props {
  /** Aires hachurées (bornes en unités de z ; null = −∞ / +∞). */
  aires: { de: number | null; a: number | null }[];
  etiquettes: EtiquetteGauss[];
  /** Nom de l'axe (« z », « x (cm) »). */
  axe?: string;
  /** Description pour les lecteurs d'écran. */
  description: string;
}

const L = 320;
const H = 150;
const X0 = 14;
const X1 = L - 14;
const Y_AXE = 112;
const HAUT = 92;
const Z_LIM = 3.6;

function px(z: number): number {
  return X0 + ((Math.max(-Z_LIM, Math.min(Z_LIM, z)) + Z_LIM) / (2 * Z_LIM)) * (X1 - X0);
}
function py(z: number): number {
  return Y_AXE - HAUT * Math.exp((-z * z) / 2);
}

function cheminAire(de: number | null, a: number | null): string {
  const zg = de === null ? -Z_LIM : Math.max(-Z_LIM, de);
  const zd = a === null ? Z_LIM : Math.min(Z_LIM, a);
  const aire: string[] = [`M${px(zg).toFixed(1)},${Y_AXE}`];
  if (zd > zg) {
    for (let i = 0; i <= 60; i++) {
      const z = zg + (i / 60) * (zd - zg);
      aire.push(`L${px(z).toFixed(1)},${py(z).toFixed(1)}`);
    }
  }
  aire.push(`L${px(zd).toFixed(1)},${Y_AXE}Z`);
  return aire.join(" ");
}

/**
 * Courbe de Gauss avec l'aire demandée HACHURÉE (6gen51, audit, lot C) : la probabilité cherchée est
 * l'aire sous la courbe entre les bornes ; une borne inconnue (sens inverse) porte son nom (« t »,
 * « a »). Dessin en unités de z (la courbe est la même pour toute loi normale, seules les étiquettes de
 * l'axe changent), largeur fluide (390 px : aucune coupe), couleurs du thème.
 */
export function CourbeGauss({ aires, etiquettes, axe = "z", description }: Props) {
  const id = useId().replace(/:/g, "");
  const courbe: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const z = -Z_LIM + (i / 120) * 2 * Z_LIM;
    courbe.push(`${i === 0 ? "M" : "L"}${px(z).toFixed(1)},${py(z).toFixed(1)}`);
  }
  // Étiquettes trop proches : la suivante descend d'une ligne.
  const triees = [...etiquettes].sort((u, v) => u.z - v.z);
  const placees = triees.map((e, i) => ({ ...e, ligne: i > 0 && Math.abs(px(e.z) - px(triees[i - 1].z)) < 38 ? 1 : 0 }));
  for (let i = 2; i < placees.length; i++) if (placees[i].ligne === 1 && placees[i - 1].ligne === 1) placees[i].ligne = 0;
  return (
    <figure className="courbe-gauss" style={{ margin: "8px auto", maxWidth: 360 }}>
      <svg viewBox={`0 0 ${L} ${H}`} width="100%" role="img" aria-label={description} style={{ display: "block", color: "var(--color-text, currentColor)" }}>
        <defs>
          <pattern id={`hach-${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-primary, currentColor)" strokeWidth="2" />
          </pattern>
        </defs>
        {aires.map((r, i) => (
          <path key={i} d={cheminAire(r.de, r.a)} fill={`url(#hach-${id})`} stroke="none" opacity="0.85" />
        ))}
        <line x1={X0} y1={Y_AXE} x2={X1} y2={Y_AXE} stroke="currentColor" strokeWidth="1" />
        <path d={courbe.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.6" />
        <line x1={px(0)} y1={Y_AXE} x2={px(0)} y2={py(0)} stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />
        {placees.map((e, i) => (
          <g key={i}>
            <line x1={px(e.z)} y1={Y_AXE - 4} x2={px(e.z)} y2={Y_AXE + 4} stroke="currentColor" strokeWidth="1" />
            <text x={px(e.z)} y={Y_AXE + 17 + e.ligne * 14} textAnchor="middle" fontSize="12" fill="currentColor">
              {e.texte}
            </text>
          </g>
        ))}
        <text x={X1} y={Y_AXE - 6} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.75">
          {axe}
        </text>
      </svg>
    </figure>
  );
}
