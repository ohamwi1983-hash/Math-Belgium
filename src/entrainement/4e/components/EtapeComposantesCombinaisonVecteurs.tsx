import { useState } from "react";
import type { ExerciceCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { diagnostiquerX, diagnostiquerY } from "../moteur/verificationCombinaisonVecteurs";
import { formatEquationReduiteLatex, formatLabelXLatex, formatLabelYLatex, formatResultatLatex } from "../ui/formatCombinaisonVecteurs";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesComposantesCombinaison, messageComposantesCombinaison } from "../ui/retoursVecteurs2";
import { Katex } from "./Katex";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { DeuxChampsVecteurs } from "./DeuxChampsVecteurs";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceCombinaisonVecteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  onActiverAide: () => void;
  onValider: (reponse: { x: number; y: number }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran « composantes » (dernier) — calcul numérique final, une fois l'expression réduite confirmée
 * (rappelée par le récapitulatif) ; seul écran de la variante « sans parenthèses », dont
 * l'expression est déjà réduite (lot C, audit 4e ch. 6). 2 champs séparés (x, y), seul le champ
 * fautif marqué. Règles communes (lot B) : illisible sans tentative, message ciblé (composantes de
 * AB calculées A − B…), aides à deux niveaux (règle, puis la première composante posée).
 */
export function EtapeComposantesCombinaisonVecteurs({ exercice, tentativesUtilisees, tentativesMax, recapitulatif, onActiverAide, onValider, validation }: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");
  const saisie = useTentativeLisible<{ x: number; y: number }>();
  const lx = lireNombreSaisi(texteX);
  const ly = lireNombreSaisi(texteY);
  const complet = texteX.trim() !== "" && texteY.trim() !== "";
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const seulEcran = exercice.variante === "plate";

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {seulEcran ? (
        <p className="prompt-text">
          Calcule les composantes de <Katex expression={formatEquationReduiteLatex(exercice)} />.
        </p>
      ) : (
        <p className="prompt-text">
          Calcule les composantes de <Katex expression={formatResultatLatex(exercice)} />.
        </p>
      )}

      <DeuxChampsVecteurs
        id="combinaison-composantes"
        labelX={formatLabelXLatex(exercice)}
        labelY={formatLabelYLatex(exercice)}
        texteX={texteX}
        texteY={texteY}
        onX={setTexteX}
        onY={setTexteY}
        erreurX={jugee !== null && diagnostiquerX(exercice, jugee.x) !== "correct"}
        erreurY={jugee !== null && diagnostiquerY(exercice, jugee.y) !== "correct"}
        desactive={!!validation}
      />

      {!validation && (
        <>
          <AidesNiveaux aides={aidesComposantesCombinaison(exercice)} onPremiereAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter({ x: lx ?? Number.NaN, y: ly ?? Number.NaN }, lx !== null && ly !== null, onValider)}>
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible={ILLISIBLE_VECTEURS.composante}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={saisie.soumise !== null ? messageComposantesCombinaison(exercice, saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
