import type { ReactNode } from "react";
import { calculerZonesCercleQuadrantSelecteur } from "../ui/cercleQuadrantSelecteur";

interface Props {
  ariaLabel: string;
  /** Éléments SVG additionnels propres à chaque consommateur (trajet, quadrants surlignés, points
   * candidats...) — superposés par-dessus la base commune, jamais dupliqués d'un consommateur à
   * l'autre. */
  children?: ReactNode;
  /** Masque les chiffres romains I/II/III/IV des quadrants — additive, absente/`false` par défaut
   * (comportement historique inchangé pour tous les consommateurs existants). Introduite pour le
   * générateur 17 ("Angles associés", `promptgen17gen15correctionsvisuelles.md`, A.1), dont les
   * aides n'ont jamais besoin de cette numérotation (jamais de question posée sur le numéro du
   * quadrant lui-même dans cet exercice) — jamais appliquée aux générateurs 14/15/18, qui la
   * conservent. */
  masquerChiffresRomains?: boolean;
}

/**
 * Base SVG purement géométrique et statique du cercle trigonométrique — axes X/Y avec flèches,
 * cercle, labellisation des quadrants I-IV, label "O" à l'origine. Aucune interaction (aucun
 * `onClick`), aucun contenu spécifique à un exercice : extraite de `CercleTrigTrajetBase.tsx`
 * (générateur 14, "Placement et lecture sur le cercle trigonométrique") pour devenir le socle
 * commun aux trois consommateurs réels de cette géométrie — `CercleTrigTrajetBase` elle-même
 * (générateurs 14 et 15, trajet de l'angle brut superposé via `children`) et les aides du
 * générateur 18 ("Quel angle ?", quadrants surlignés / points candidats + arcs, voir
 * `promptcreationgenerateur18quelangle.md`) — plutôt que d'en redévelopper une nouvelle instance.
 * `CercleQuadrantSelecteur.tsx` (l'écran "Quadrant" interactif, cliquable) reste volontairement
 * séparée : ses zones cliquables et sa surbrillance de sélection sont un concept différent
 * (interaction utilisateur, pas une simple illustration statique), pas une simple superposition de
 * `children` par-dessus cette base.
 */
export function CercleTrigBase({ ariaLabel, children, masquerChiffresRomains = false }: Props) {
  const { largeur, hauteur, centre, rayon, zonesQuadrant, flecheX, flecheY, labelOx, labelOy, labelOrigine } =
    calculerZonesCercleQuadrantSelecteur();

  return (
    <svg className="cercle-trig-trajet" viewBox={`0 0 ${largeur} ${hauteur}`} role="img" aria-label={ariaLabel}>
      <line x1={0} y1={centre.y} x2={largeur} y2={centre.y} className="cercle-trig-axe" />
      <line x1={centre.x} y1={0} x2={centre.x} y2={hauteur} className="cercle-trig-axe" />
      <circle cx={centre.x} cy={centre.y} r={rayon} className="cercle-trig-cercle" />

      {!masquerChiffresRomains &&
        zonesQuadrant.map((zone) => (
          <text key={zone.quadrant} x={zone.label.x} y={zone.label.y} className="cercle-trig-label-quadrant">
            {zone.quadrant}
          </text>
        ))}

      <polygon points={flecheX} className="cercle-quadrant-fleche" />
      <polygon points={flecheY} className="cercle-quadrant-fleche" />
      <text x={labelOx.x} y={labelOx.y} className="cercle-trig-label">
        X
      </text>
      <text x={labelOy.x} y={labelOy.y} className="cercle-trig-label">
        Y
      </text>
      <text x={labelOrigine.x} y={labelOrigine.y} className="cercle-quadrant-label-origine">
        O
      </text>

      {children}
    </svg>
  );
}
