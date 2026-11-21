import { useState } from "react";
import type { ExerciceTriangleCotes } from "../core/normeDistance.types";
import { evaluerCalculIsocele } from "../moteur/verificationNormeDistance";
import type { ReponseCalculIsocele } from "../moteur/verificationNormeDistance";
import { CONSIGNE_GENERALE_ISOCELE, PLACEHOLDER_LONGUEUR, formatLabelNormeLatex, formatTermesDonneesIsoceleLatex } from "../ui/formatNormeDistance";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesCalculTriangleCotes, lireValeurExacte, messageCalculTriangleCotes } from "../ui/retoursVecteurs3";
import { lireExpressionNorme } from "../moteur/verificationNormeDistance";
import { PiedVecteurs } from "./PiedVecteurs";
import { useTentativeLisible } from "./RetourSaisie";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceTriangleCotes;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCalculIsocele) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "calcul" — variante 4, écran 2 : consigne générale + bloc de données redondant (les 3
 * vecteurs confirmés à l'écran 1, listés dans le récapitulatif "Ce qu'on sait déjà") + 3 champs de
 * texte libre (fraction/irrationnel irréductible acceptés), labels en notation norme
 * ($\|\vec{AB}\|=$, remplace l'ancien "AB="). Aide à 2 niveaux, limitée à $\vec{AB}$ —
 * `promptgen26refontecomplete.md`, Partie D.
 */
export function EtapeCalculIsocele({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [ab, setAb] = useState("");
  const [ac, setAc] = useState("");
  const [bc, setBc] = useState("");
  const complet = ab.trim() !== "" && ac.trim() !== "" && bc.trim() !== "";

  function construireReponse(): ReponseCalculIsocele {
    return { ab, ac, bc };
  }

  // Règles communes (audit 4e ch. 6, lot B) : valeur illisible OU décimale approchée refusée sans
  // tentative (on demande la valeur exacte) ; seuls les champs de la dernière réponse jugée sont marqués.
  const cibles = [exercice.longueurAB, exercice.longueurAC, exercice.longueurBC];
  const lectures = [ab, ac, bc].map((t, i) => lireValeurExacte(t, cibles[i]));
  const approchee = lectures.some((l) => l.approchee);
  const saisie = useTentativeLisible<ReponseCalculIsocele>();
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;
  const evaluation = jugee === null ? null : evaluerCalculIsocele(exercice, jugee);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ISOCELE}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {formatTermesDonneesIsoceleLatex(exercice).map((t, i) => (
              <Katex key={i} expression={t} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">Calcule la longueur des 3 côtés du triangle (valeurs exactes, simplifiées).</p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-isocele-ab">
          <Katex expression={formatLabelNormeLatex(exercice.labelA, exercice.labelB)} />
        </label>
        <input disabled={!!validation}
          id="norme-distance-isocele-ab"
          className={`text-input${evaluation !== null && evaluation.ab !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_LONGUEUR}
          value={ab}
          onChange={(e) => setAb(normaliserSigneMoins(e.target.value))}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-isocele-ac">
          <Katex expression={formatLabelNormeLatex(exercice.labelA, exercice.labelC)} />
        </label>
        <input disabled={!!validation}
          id="norme-distance-isocele-ac"
          className={`text-input${evaluation !== null && evaluation.ac !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_LONGUEUR}
          value={ac}
          onChange={(e) => setAc(normaliserSigneMoins(e.target.value))}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="norme-distance-isocele-bc">
          <Katex expression={formatLabelNormeLatex(exercice.labelB, exercice.labelC)} />
        </label>
        <input disabled={!!validation}
          id="norme-distance-isocele-bc"
          className={`text-input${evaluation !== null && evaluation.bc !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_LONGUEUR}
          value={bc}
          onChange={(e) => setBc(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {!validation && (
        <PiedVecteurs
          aides={aidesCalculTriangleCotes(exercice)}
          onPremiereAide={onActiverAide}
          complet={complet}
          saisie={saisie}
          reponse={construireReponse}
          lisible={() => lectures.every((l) => l.valeur !== null && !l.approchee)}
          onValider={onValider}
          texteIllisible={approchee ? ILLISIBLE_VECTEURS.normeApprochee : ILLISIBLE_VECTEURS.norme}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => messageCalculTriangleCotes(exercice, [r.ab, r.ac, r.bc].map((t) => lireExpressionNorme(t) ?? Number.NaN))}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
