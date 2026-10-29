import { useState } from "react";
import type { ExerciceRelationGeneraleRV } from "../core/relationVectorielle.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { diagnostiquerCoordonnees, diagnostiquerX, diagnostiquerY } from "../moteur/verificationRelationVectorielle";
import { formatLabelXLatex, formatLabelYLatex } from "../ui/formatRelationVectorielle";
import { filtrerSaisieNumeriqueFraction, gererKeyDownNumeriqueFraction } from "../ui/bloquerSaisieNonNumerique";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { formatMessageErreur } from "../ui/messageErreur";
import { AideRelationVectorielle } from "./AideRelationVectorielle";
import { Katex } from "./Katex";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceRelationGeneraleRV;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (x: number, y: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 2 (dernier) de la variante `relationGenerale` — même mécanique de champs séparés/marquage
 * en direct qu'`EtapeTranslationVectorielle`, avec en plus le récapitulatif de la traduction déjà
 * confirmée à l'écran précédent (jamais la saisie de l'élève, toujours la vraie relation). Réutilise
 * la MÊME aide (persistante entre les deux écrans d'un même exercice, voir
 * `sessionRelationVectorielle.ts`). */
export function EtapeCoordonneesRelationVectorielle({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [texteX, setTexteX] = useState("");
  const [texteY, setTexteY] = useState("");

  const complet = texteX.trim() !== "" && texteY.trim() !== "";
  const x = (parserNombreOuFraction(texteX) ?? Number.NaN);
  const y = (parserNombreOuFraction(texteY) ?? Number.NaN);
  const statut = complet ? diagnostiquerCoordonnees(exercice, x, y) : undefined;

  const apresEchec = tentativesUtilisees > 0;
  const xErronee = apresEchec && diagnostiquerX(exercice, x) !== "correct";
  const yErronee = apresEchec && diagnostiquerY(exercice, y) !== "correct";

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">Calcule maintenant les coordonnées de {exercice.pointCherche}.</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relation-vectorielle-coordonnees-x">
            <Katex expression={formatLabelXLatex(exercice)} />
          </label>
          <input
            id="relation-vectorielle-coordonnees-x"
            className={`text-input${xErronee ? " is-erronee" : ""}`}
            placeholder="ex : 3"
            value={texteX}
            onChange={(e) => setTexteX(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relation-vectorielle-coordonnees-y">
            <Katex expression={formatLabelYLatex(exercice)} />
          </label>
          <input
            id="relation-vectorielle-coordonnees-y"
            className={`text-input${yErronee ? " is-erronee" : ""}`}
            placeholder="ex : -2"
            value={texteY}
            onChange={(e) => setTexteY(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
      </div>

      <AideRelationVectorielle exercice={exercice} aideActivee={aideActivee} onActiverAide={onActiverAide} />

      {!validation && (
        <>
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(x, y)}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
