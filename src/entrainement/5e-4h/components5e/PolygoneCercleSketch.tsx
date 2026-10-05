import type { Surlignage } from "../ui5e/polygoneCercleSketch";
import { CENTRE, RAYON_PIXEL, TAILLE_CADRE, cheminArc, cheminSecteur, positionLabelSommet, positionSommet } from "../ui5e/polygoneCercleSketch";
import { labelSommet } from "../ui5e/formatPolygonesArcsSecteurs";

interface Props {
  r: number;
  n: number;
  /** `null` pour l'écran "cercle entier" (aucun surlignage). */
  surlignage: Surlignage | null;
}

const COULEUR_SURLIGNAGE = "#f08c00";
const COULEUR_CERCLE = "#495057";
const COULEUR_SOMMET = "#1971c2";

/** Diagramme SVG PUR (jamais Mafs — voir CLAUDE.md, "Choix du rendu graphique") : aucune
 * coordonnée n'est jamais lue par l'élève, seul le comptage visuel des sommets/crans compte.
 * Persiste sur tous les écrans d'un même exercice (bloc de données redondant classique), seul le
 * `surlignage` change d'un écran à l'autre. */
export function PolygoneCercleSketch({ r, n, surlignage }: Props) {
  const sommets = Array.from({ length: n }, (_, i) => i);
  return (
    <div className="polygone-cercle-conteneur">
      <svg viewBox={`0 0 ${TAILLE_CADRE} ${TAILLE_CADRE}`} width="100%" height={TAILLE_CADRE} role="img" aria-label={`Cercle de rayon r=${r} avec ${n} sommets régulièrement espacés`}>
        <circle cx={CENTRE.x} cy={CENTRE.y} r={RAYON_PIXEL} fill="none" stroke={COULEUR_CERCLE} strokeWidth={2} />
        {surlignage?.type === "secteur" && <path d={cheminSecteur(surlignage.segment, n)} fill={COULEUR_SURLIGNAGE} fillOpacity={0.35} stroke={COULEUR_SURLIGNAGE} strokeWidth={2} />}
        {surlignage?.type === "arc" && <path d={cheminArc(surlignage.segment, n)} fill="none" stroke={COULEUR_SURLIGNAGE} strokeWidth={5} strokeLinecap="round" />}
        {sommets.map((i) => {
          const p = positionSommet(i, n);
          const labelPos = positionLabelSommet(i, n);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill={COULEUR_SOMMET} />
              <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" className="polygone-cercle-label">
                {labelSommet(i)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
