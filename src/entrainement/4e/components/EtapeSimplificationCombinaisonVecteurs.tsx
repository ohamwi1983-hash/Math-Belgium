import { useState } from "react";
import type { ExerciceCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import { formatResultatLatex, formatTermesExpressionLatex, placeholderReduction, vecteursPresentsLatex } from "../ui/formatCombinaisonVecteurs";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { aidesReductionCombinaison, messageReductionCombinaison, reductionLisible } from "../ui/retoursVecteurs2";
import { Katex } from "./Katex";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceCombinaisonVecteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 (variantes à parenthèses, vecteur répété, paire AB/BA) — un champ de saisie libre UNIQUE :
 * l'élève écrit directement l'expression réduite complète (ex. `-3u+3v+12AB`). La consigne liste les
 * vecteurs réellement présents dans l'expression (`vecteursPresentsLatex`).
 *
 * Aides (audit 4e ch. 6, lots B et C — G6) : deux niveaux, la règle puis UN terme distribué, jamais
 * l'expression distribuée entière (dans la variante « parenthèses », elle EST la réponse à l'ordre
 * près). La variante « sans parenthèses » n'a plus cet écran (`phaseInitiale`).
 */
export function EtapeSimplificationCombinaisonVecteurs({ exercice, tentativesUtilisees, tentativesMax, onActiverAide, onValider, validation }: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const complet = texte.trim() !== "";
  const vecteursConsigne = vecteursPresentsLatex(exercice);
  const jugee = tentativesUtilisees > 0 && !saisie.illisible ? saisie.soumise : null;

  return (
    <div>
      <p className="prompt-text">
        Calcule et réduis l'expression suivante en fonction des vecteurs{" "}
        {vecteursConsigne.map((latex, i) => (
          <span key={latex}>
            {i > 0 && ", "}
            <Katex expression={latex} />
          </span>
        ))}
        .
      </p>
      <div className="equation-box equation-box-termes">
        {formatTermesExpressionLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="combinaison-simplification">
          <Katex expression={`${formatResultatLatex(exercice)} =`} />
        </label>
        <input
          id="combinaison-simplification"
          className={`text-input${jugee !== null ? " is-erronee" : ""}`}
          placeholder={placeholderReduction(exercice)}
          value={texte}
          disabled={!!validation}
          onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
        />
      </div>

      {!validation && (
        <>
          <AidesNiveaux aides={aidesReductionCombinaison(exercice)} onPremiereAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(texte, reductionLisible(exercice, texte), onValider)}>
            Valider
          </button>
          <MessageRetour
            illisible={saisie.illisible}
            texteIllisible={ILLISIBLE_VECTEURS.combinaison}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cible={saisie.soumise !== null ? messageReductionCombinaison(exercice, saisie.soumise) : null}
          />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
