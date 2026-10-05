import type { ReactNode } from "react";
import type { TrajetCercleTrig } from "../ui/cercleTrigTrajet";
import { CENTRE_CERCLE_TRIG } from "../ui/cercleTrigGeometrie";
import { CercleTrigBase } from "./CercleTrigBase";

interface Props {
  trajet: TrajetCercleTrig;
  labelAngleBrutTexte: string;
  ariaLabel: string;
  /** Éléments SVG additionnels propres à chaque aide (point symétrique, tangente, projections...) —
   * même patron que `VecteurGraph` (chapitre 4) : superposés par-dessus la base commune, jamais
   * dupliqués d'une aide à l'autre. */
  children?: ReactNode;
  /** Masque le label numérique de l'angle brut (`labelAngleBrutTexte`) — additive, absente/`true`
   * par défaut (comportement historique inchangé). Introduite pour le générateur 17 (`promptgen17gen15correctionsvisuelles.md`,
   * A.3) : cette valeur y est désormais intégrée directement dans le label de la question
   * ("sin(151°)=?"), donc redondante à afficher une seconde fois près de l'arc. */
  afficherLabelAngleBrut?: boolean;
  /** Masque les chiffres romains I/II/III/IV des quadrants — propagée telle quelle à `CercleTrigBase`
   * (voir sa doc), additive, absente/`false` par défaut. */
  masquerChiffresRomains?: boolean;
  /** Masque le point (marqueur) à l'extrémité du rayon, sur le cercle — additive, absente/`true` par
   * défaut (comportement historique inchangé). Introduite pour le générateur 17
   * (`promptcorrectionsgen17gen12gen21.md`, point 2) : l'angle CIBLE (aide 1, violet) n'a plus besoin
   * de ce marqueur, seul le point de projection sur l'axe (ex. sin/cos/tan) reste affiché — le rayon
   * lui-même (la ligne du centre au cercle) reste inchangé. */
  afficherPointFinal?: boolean;
}

/**
 * Base SVG commune aux 3 nouvelles aides du générateur 14 (écrans "Réduction", "Angle du premier
 * quadrant", "Signes" — promptcorrectionsgenerateur14aides.md, sections 6/7/8) : le trajet de
 * l'angle brut (arc ou spirale, sens de parcours, rayon + point sur `angleReduit`, label de l'angle
 * brut), superposé sur `CercleTrigBase` (le socle purement géométrique — axes, cercle, labels de
 * quadrant, flèches, "O" — extrait de ce fichier et désormais partagé avec les aides du générateur
 * 18, "Quel angle ?" — `promptcreationgenerateur18quelangle.md`) : rendu DOM strictement inchangé
 * par cette extraction, jamais utilisée par le générateur 15 ("Valeurs remarquables"), qui continue
 * de réutiliser tel quel l'ancien `AideCercleTrigonometrique`/`CercleTrigSketch` — cette base est
 * propre au générateur 14.
 */
export function CercleTrigTrajetBase({
  trajet,
  labelAngleBrutTexte,
  ariaLabel,
  children,
  afficherLabelAngleBrut = true,
  masquerChiffresRomains = false,
  afficherPointFinal = true,
}: Props) {
  const centre = CENTRE_CERCLE_TRIG;

  return (
    <CercleTrigBase ariaLabel={ariaLabel} masquerChiffresRomains={masquerChiffresRomains}>
      <path d={trajet.chemin} className={trajet.type === "arc" ? "cercle-trig-arc" : "cercle-trig-spirale"} />
      <polygon points={trajet.fleche} className="cercle-trig-fleche-trajet" />
      <line x1={centre.x} y1={centre.y} x2={trajet.pointFinal.x} y2={trajet.pointFinal.y} className="cercle-trig-rayon" />
      {afficherPointFinal && <circle cx={trajet.pointFinal.x} cy={trajet.pointFinal.y} r={5} className="cercle-trig-point" />}
      {afficherLabelAngleBrut && (
        <text x={trajet.labelAngleBrut.x} y={trajet.labelAngleBrut.y} className="cercle-trig-label-angle">
          {labelAngleBrutTexte}
        </text>
      )}

      {children}
    </CercleTrigBase>
  );
}
