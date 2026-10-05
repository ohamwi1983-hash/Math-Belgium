import { useState } from "react";
import type { ExerciceFormeCanoniqueFonctionReference, ReponseCanoniqueFR } from "../core/formeCanoniqueFonctionsReference.types";
import { diagnostiquerCanoniqueFR } from "../moteur/verificationFormeCanoniqueFonctionsReference";
import { formatFormeDepartLatex } from "../ui/formatFormeCanoniqueFonctionsReference";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceFormeCanoniqueFonctionReference;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseCanoniqueFR) => void;
}

const EXEMPLE: Record<ExerciceFormeCanoniqueFonctionReference["famille"], string> = {
  carre: "ex : 2(x-3)^2-1",
  cube: "ex : -8(x+2)^3",
  racine_carree: "ex : 2sqrt(x-1)",
  racine_cubique: "ex : -2cbrt(x+1)",
  inverse: "ex : 3/(x-1)+2",
  valeur_absolue: "ex : 3|x-2|",
};

/** Étape 1 (section 2 de la spec) : l'élève transforme la forme de départ en forme canonique
 * (vérification structurelle + algébrique, comme pour "Forme canonique et transformations" —
 * chapitre 1). Pas de graphe ici : le graphe n'apparaît qu'à partir de l'étape suivante (EH/CH/SOY),
 * une fois la famille reconnue et confirmée. */
export function EtapeCanoniqueFR({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [formeCanonique, setFormeCanonique] = useState("");
  const complet = formeCanonique.trim() !== "";
  const statut = tentativesUtilisees > 0 ? diagnostiquerCanoniqueFR(exercice, { formeCanonique }) : undefined;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatFormeDepartLatex(exercice)} block />
      </div>
      <p className="prompt-text">Simplifie cette expression pour obtenir la forme canonique.</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="canonique-fr-forme">
          f(x) =
        </label>
        <input
          id="canonique-fr-forme"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={EXEMPLE[exercice.famille]}
          value={formeCanonique}
          onChange={(e) => setFormeCanonique(e.target.value)}
        />
      </div>
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ formeCanonique })}>
        Valider
      </button>
      {statut !== undefined && statut !== "correct" && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
