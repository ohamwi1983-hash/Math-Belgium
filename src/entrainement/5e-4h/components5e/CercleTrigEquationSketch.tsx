import type { RegimeEquationTrig } from "../core5e/equationsTrigonometriques.types";
import { CENTRE, RAYON_PIXEL, TAILLE_CADRE, cheminArcOmbre, positionAngle, positionLabelAngle } from "../ui5e/cercleTrigEquationSketch";
import { formatAngleLabelTexte } from "../ui5e/formatEquationTrig";

interface Props {
  /** Vide sur l'écran "solutions" tant que l'aide 2 n'est pas activée (jamais donner la réponse en
   * avance) — toujours les vraies solutions au moment de la révélation (`ResultatPanel`). */
  points: number[];
  regime: RegimeEquationTrig;
  /** Additif, absent par défaut (`undefined`) — comportement historique inchangé pour tous les
   * consommateurs existants (5gen10/5gen11). Nouveau mode "arc ombré" (5gen13, Type 3 inéquation) :
   * ombrage d'un secteur [debut;fin] plutôt que des points isolés — les 2 modes peuvent coexister
   * sur le même cercle (le secteur est rendu EN DESSOUS des points/axes/cercle, jamais par-dessus). */
  arcOmbre?: { debut: number; fin: number } | null;
}

/** Diagramme SVG PUR (jamais Mafs — voir CLAUDE.md "Choix du rendu graphique") : cercle
 * trigonométrique en convention mathématique standard (θ=0 sur l'axe X+, sens anti-horaire). Vide
 * au départ (`points=[]`), peuplé progressivement (aide 2 : le premier point) puis entièrement une
 * fois la réponse validée/révélée — chaque point relié au centre par un trait en pointillé. */
export function CercleTrigEquationSketch({ points, regime, arcOmbre }: Props) {
  return (
    <div className="cercle-trig-equation-conteneur">
      <svg viewBox={`0 0 ${TAILLE_CADRE} ${TAILLE_CADRE}`} width="100%" height={TAILLE_CADRE} role="img" aria-label="Cercle trigonométrique">
        {arcOmbre && <path d={cheminArcOmbre(arcOmbre.debut, arcOmbre.fin)} className="cercle-trig-equation-arc-ombre" />}
        <line x1={0} y1={CENTRE.y} x2={TAILLE_CADRE} y2={CENTRE.y} className="cercle-trig-equation-axe" />
        <line x1={CENTRE.x} y1={0} x2={CENTRE.x} y2={TAILLE_CADRE} className="cercle-trig-equation-axe" />
        <circle cx={CENTRE.x} cy={CENTRE.y} r={RAYON_PIXEL} fill="none" className="cercle-trig-equation-cercle" />
        {points.map((theta, i) => {
          const p = positionAngle(theta);
          const labelPos = positionLabelAngle(theta);
          return (
            <g key={i}>
              <line x1={CENTRE.x} y1={CENTRE.y} x2={p.x} y2={p.y} className="cercle-trig-equation-pointille" strokeDasharray="4 3" />
              <circle cx={p.x} cy={p.y} r={4} className="cercle-trig-equation-point" />
              <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" className="cercle-trig-equation-label">
                {formatAngleLabelTexte(theta, regime)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
