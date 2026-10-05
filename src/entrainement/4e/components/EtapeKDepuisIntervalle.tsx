import { useState } from "react";
import type { ExerciceBienaymeTchebychevIntervalleVersNombre, ExerciceBienaymeTchebychevIntervalleVersPourcent } from "../core/bienaymeTchebychev.types";
import { diagnostiquerK } from "../moteur/verificationBienaymeTchebychev";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { LABEL_K, PRECISION_K, libelleBoutonAide, texteAideKDepuisIntervalleNiveau1, texteAideKDepuisIntervalleNiveau2 } from "../ui/formatBienaymeTchebychev";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceBienaymeTchebychev } from "./EnonceBienaymeTchebychev";
import { Katex } from "./Katex";

type Exercice = ExerciceBienaymeTchebychevIntervalleVersPourcent | ExerciceBienaymeTchebychevIntervalleVersNombre;

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

const MAX = 2;

/** Rôle "k depuis un intervalle donné" (v1K, v3K) — toujours le premier écran de sa variante, jamais
 * de bloc "état actuel" (rien n'est encore confirmé). */
export function EtapeKDepuisIntervalle({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerK(exercice, texte) : undefined;

  return (
    <div>
      <EnonceBienaymeTchebychev exercice={exercice} />
      <p className="prompt-text">
        Détermine <Katex expression={LABEL_K} /> pour cet intervalle ({PRECISION_K}).
      </p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="bienayme-k-intervalle">
          <Katex expression={`${LABEL_K} \\approx`} />
        </label>
        <input
          id="bienayme-k-intervalle"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 2,5"
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideKDepuisIntervalleNiveau1().texte}</p>
          <Katex expression={texteAideKDepuisIntervalleNiveau1().latex} block />
          {niveauAide >= 2 && (
            <>
              <p>{texteAideKDepuisIntervalleNiveau2(exercice).texte}</p>
              <Katex expression={texteAideKDepuisIntervalleNiveau2(exercice).latex} block />
            </>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= MAX} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, MAX)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(texte)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
