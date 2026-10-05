import type { ExerciceQuelAngle } from "../core/quelAngle.types";
import { calculerAideCandidats, calculerAideProjections, calculerAideQuadrants } from "../ui/quelAngleAide";
import { texteAideQuadrants } from "../ui/formatQuelAngle";
import { CENTRE_CERCLE_TRIG, HAUTEUR_CERCLE_TRIG, RAYON_CERCLE_TRIG } from "../ui/cercleTrigGeometrie";
import { CercleTrigBase } from "./CercleTrigBase";

interface Props {
  exercice: ExerciceQuelAngle;
  aideActivee: boolean;
  onActiverAide: () => void;
}

/**
 * Aide UNIQUE de "Quel angle ?" (`promptcorrectionsgenerateur18aideunique.md`, remplace les 3
 * aides progressives d'origine) — même patron bouton+révélation que les aides du générateur 14
 * (`AideSignesCercleTrig`/`AideAnglePremierQuadrantCercleTrig`) : le contenu révélé précède le
 * bouton, qui reste toujours affiché (désactivé + relabellisé "Aide utilisée" une fois activé).
 *
 * Un seul cercle combine désormais les 3 anciens niveaux d'aide en une seule vue : les quadrants
 * concernés surlignés (`calculerAideQuadrants`) ; pour chaque solution, un point + son rayon + un
 * arc ORIENTÉ FLÉCHÉ depuis l'axe X positif, à un rayon d'arc propre à chaque candidat pour ne
 * jamais se chevaucher (`calculerAideCandidats`, `promptcorrectionrenduaidegenerateur18.md`,
 * point 1) — sans jamais annoter la valeur numérique de l'angle en toutes lettres à côté de l'arc
 * (l'élève doit encore la déterminer et l'inscrire) ; et une ligne pointillée par candidat jusqu'à
 * sa projection sur l'axe (ou la tangente) concerné par la variante (`calculerAideProjections`,
 * même prompt, point 2) — les deux pointillés convergent visuellement vers le même point, rendant
 * explicite que les deux candidats partagent la même valeur pour la fonction en cours. Le texte
 * "Les solutions se trouvent dans..." reste le seul texte de l'aide — plus aucune mention de
 * "formule de construction" ni de formule d'angle affichée en toutes lettres (ex. `180°+30°`),
 * retirées avec l'ancienne troisième aide.
 *
 * **Variante tan — droite tangente + règle de troncature** (correction demandée directement en
 * conversation, sans fichier prompt dédié) : la droite tangente en `(1,0)` (verticale, trait PLEIN
 * sur toute la hauteur du cadre) manquait — réutilise **littéralement** la classe CSS
 * `.cercle-trig-tangente` déjà en place pour l'aide "Signes" du générateur 14, même rendu exact.
 * Le marqueur de convergence n'est affiché que si `projections[0].visible` — quand l'intersection
 * réelle avec la tangente tombe hors du cadre (ex. `tan α=√3`, candidat à 60°), `calculerAideSignes`
 * tronque déjà le pointillé au bord du cadre (voir `quelAngleAide.ts::calculerAideProjections`) ;
 * seul le marqueur plein doit alors disparaître, jamais la ligne elle-même — même règle round 7 déjà
 * appliquée à l'aide "Signes" du générateur 14 (`AideSignesCercleTrig.tsx`).
 */
export function AideQuelAngle({ exercice, aideActivee, onActiverAide }: Props) {
  const { cheminsQuadrants, rayonsAxes } = calculerAideQuadrants(exercice.solutions);
  const candidats = calculerAideCandidats(exercice.solutions);
  const projections = calculerAideProjections(exercice.fonction, exercice.solutions);
  const centre = CENTRE_CERCLE_TRIG;
  const xTangente = CENTRE_CERCLE_TRIG.x + RAYON_CERCLE_TRIG;

  return (
    <div>
      {aideActivee && (
        <div className="quel-angle-aide">
          <p>{texteAideQuadrants(exercice)}</p>
          <CercleTrigBase ariaLabel="Cercle trigonométrique montrant les quadrants concernés, les points candidats et leurs projections">
            {exercice.fonction === "tan" && (
              <line x1={xTangente} y1={0} x2={xTangente} y2={HAUTEUR_CERCLE_TRIG} className="cercle-trig-tangente" />
            )}
            {cheminsQuadrants.map((chemin) => (
              <path key={chemin} d={chemin} className="quel-angle-quadrant-surligne" />
            ))}
            {rayonsAxes.map((rayon) => (
              <line
                key={`${rayon.x2}-${rayon.y2}`}
                x1={rayon.x1}
                y1={rayon.y1}
                x2={rayon.x2}
                y2={rayon.y2}
                className="quel-angle-axe-surligne"
              />
            ))}
            {candidats.map((candidat) => (
              <g key={`${candidat.point.x}-${candidat.point.y}`}>
                <path d={candidat.chemin} className="quel-angle-arc-candidat" />
                <polygon points={candidat.fleche} className="quel-angle-fleche-candidat" />
                <line x1={centre.x} y1={centre.y} x2={candidat.point.x} y2={candidat.point.y} className="quel-angle-rayon-candidat" />
                <circle cx={candidat.point.x} cy={candidat.point.y} r={5} className="quel-angle-point-candidat" />
              </g>
            ))}
            {projections.map((projection) => (
              <line
                key={`proj-${projection.point.x}-${projection.point.y}`}
                x1={projection.point.x}
                y1={projection.point.y}
                x2={projection.projection.x}
                y2={projection.projection.y}
                className="quel-angle-projection-candidat"
              />
            ))}
            {projections[0]?.visible && (
              <circle
                cx={projections[0].projection.x}
                cy={projections[0].projection.y}
                r={4}
                className="quel-angle-point-projection"
              />
            )}
          </CercleTrigBase>
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
        {aideActivee ? "Aide utilisée" : "Aide"}
      </button>
    </div>
  );
}
