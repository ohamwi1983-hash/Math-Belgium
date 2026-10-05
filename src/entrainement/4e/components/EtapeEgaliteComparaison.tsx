import { useState } from "react";
import type { ExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import { Katex } from "./Katex";
import { VecteurGraph } from "./VecteurGraph";
import { vecteursAffichesComparaison } from "../ui/formatComparaisonVecteurs";
import { diagnostiquerEgalite } from "../moteur/verificationComparaisonVecteurs";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExerciceComparaisonVecteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (texte: string) => void;
}

/** Dernière étape : écris l'égalité reliant `cibleEgalite` à `labelReference` (ex. `c = 2h`). */
export function EtapeEgaliteComparaison({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerEgalite(exercice, texte) : undefined;
  const erronee = statut !== undefined && statut !== "correct";
  const { points, vecteurs } = vecteursAffichesComparaison(exercice, [exercice.cibleEgalite]);

  return (
    <div>
      <VecteurGraph points={points} vecteurs={vecteurs} masquerAxes />
      <p className="prompt-text">
        Écris l'égalité reliant <Katex expression={`\\vec{${exercice.cibleEgalite}}`} /> à{" "}
        <Katex expression={`\\vec{${exercice.labelReference}}`} />.
      </p>

      <div className="field field-inline">
        <label className="field-label" htmlFor="comparaison-egalite">
          Égalité =
        </label>
        <input
          id="comparaison-egalite"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder={`ex : ${exercice.cibleEgalite} = 2${exercice.labelReference}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
      </div>
      {statut === "parse_error" && <p className="alert-error">{formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")}</p>}

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && statut !== "parse_error" && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
