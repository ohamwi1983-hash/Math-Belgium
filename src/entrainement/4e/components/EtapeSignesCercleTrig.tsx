import { useState } from "react";
import type { ExerciceCercleTrigonometrique, ReponseSignes, Signe, SigneTan } from "../core/cercleTrigonometrique.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import { formatEnonceCercleTrigLatex } from "../ui/formatCercleTrigonometrique";
import type { EtatCelluleSigne, EtatCelluleTan } from "../ui/cycleSigneCercleTrigonometrique";
import { celluleSigneErronee, cyclerSigneSinCos, cyclerSigneTan } from "../ui/cycleSigneCercleTrigonometrique";
import { AideSignesCercleTrig } from "./AideSignesCercleTrig";

/** Couleurs de la construction géométrique de l'aide "Signes" (section 8) — mêmes hex que les
 * projections/points du croquis (`App.css`, `.cercle-trig-projection-*`/`.cercle-trig-point-*`). */
const COULEUR_COS = "#2f9e44";
const COULEUR_SIN = "#1971c2";
const COULEUR_TAN = "#f783ac";

interface Props {
  exercice: ExerciceCercleTrigonometrique;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSignes) => void;
}

function libelle(valeur: EtatCelluleSigne | EtatCelluleTan): string {
  return valeur === "-" ? "−" : valeur === "indefini" ? "∄" : valeur;
}

/**
 * Dernière étape : tableau à cellules cycliques (correction 5,
 * promptcorrectionsgenerateurcercletrigo1.md), sur le modèle des tableaux de signes déjà existants
 * (`EtapeGrilleSignes.tsx`, exercice 5) — une seule ligne, 3 colonnes (sin/cos/tan). Chaque cellule
 * cycle en boucle jusqu'à "?" (jamais un état de départ à sens unique, contrairement au tableau de
 * l'exercice 5) : sin/cos sur 4 états (∄ exclu, sans sens mathématique pour ces deux lignes), tan
 * sur 5. "Valider" reste **verrouillé** tant qu'au moins une cellule affiche encore "?" (round 2,
 * promptcorrectionsgenerateurcercletrigo2.md, point 2 — revient sur le choix du round précédent,
 * qui laissait "Valider" toujours actif) : `ReponseSignes` continue d'accepter "?" au niveau du
 * type/de la vérification (filet de sécurité, jamais réellement atteint par ce bouton verrouillé),
 * mais l'écran lui-même n'autorise plus une soumission incomplète.
 *
 * Coloration au clic sur l'aide (promptcorrectionsgenerateur14lot2.md, section 5 — corrige la
 * portée d'un premier essai) : s'applique aux en-têtes du tableau (`sin(θ)`/`cos(θ)`/`tan(θ)`,
 * juste au-dessus de la ligne des cellules `?`), JAMAIS à la phrase de consigne ci-dessus, qui
 * reste toujours dans sa couleur de texte normale.
 */
export function EtapeSignesCercleTrig({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [sin, setSin] = useState<EtatCelluleSigne>("?");
  const [cos, setCos] = useState<EtatCelluleSigne>("?");
  const [tan, setTan] = useState<EtatCelluleTan>("?");

  const montrerErreurs = tentativesUtilisees > 0;
  const complet = sin !== "?" && cos !== "?" && tan !== "?";

  function classeCellule(saisie: EtatCelluleSigne | EtatCelluleTan, attendu: Signe | SigneTan): string {
    return montrerErreurs && celluleSigneErronee(saisie, attendu) ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatEnonceCercleTrigLatex(exercice.angleDepart)} block />
      </div>
      <p className="prompt-text">Quel est le signe de sin(θ), cos(θ) et tan(θ) ?</p>

      <div className="grille-signes-scroll">
        <table className="grille-signes">
          <thead>
            <tr>
              <th className="grille-signes-zone">
                <Katex expression={aideActivee ? `\\textcolor{${COULEUR_SIN}}{\\sin(\\theta)}` : "\\sin(\\theta)"} />
              </th>
              <th className="grille-signes-zone">
                <Katex expression={aideActivee ? `\\textcolor{${COULEUR_COS}}{\\cos(\\theta)}` : "\\cos(\\theta)"} />
              </th>
              <th className="grille-signes-zone">
                <Katex expression={aideActivee ? `\\textcolor{${COULEUR_TAN}}{\\tan(\\theta)}` : "\\tan(\\theta)"} />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="grille-signes-zone">
                <button type="button" className={classeCellule(sin, exercice.signeSin)} onClick={() => setSin(cyclerSigneSinCos)}>
                  {libelle(sin)}
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCellule(cos, exercice.signeCos)} onClick={() => setCos(cyclerSigneSinCos)}>
                  {libelle(cos)}
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCellule(tan, exercice.signeTan)} onClick={() => setTan(cyclerSigneTan)}>
                  {libelle(tan)}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AideSignesCercleTrig exercice={exercice} aideActivee={aideActivee} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider({ sin, cos, tan })}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
