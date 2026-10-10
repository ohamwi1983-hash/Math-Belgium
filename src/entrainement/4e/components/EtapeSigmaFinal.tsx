import { useState } from "react";
import type { ExerciceBienaymeTchebychevIntervalleVersSigma, ExerciceBienaymeTchebychevNombreVersSigma } from "../core/bienaymeTchebychev.types";
import { diagnostiquerSigma } from "../moteur/verificationBienaymeTchebychev";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { LABEL_SIGMA, PRECISION_UNITE, type ValeurEtatActuel, formatEtatActuelCombineLatex, kEtatActuel, pourcentAttendu0EtatActuel, texteAideSigmaNiveau1, texteAideSigmaNiveau2 } from "../ui/formatBienaymeTchebychev";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceBienaymeTchebychev } from "./EnonceBienaymeTchebychev";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

type Exercice = ExerciceBienaymeTchebychevIntervalleVersSigma | ExerciceBienaymeTchebychevNombreVersSigma;

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

const MAX = 2;

function pourcentAttendu0Pour(exercice: Exercice): ValeurEtatActuel | null {
  return exercice.variante === "nombreVersSigma" ? pourcentAttendu0EtatActuel(exercice) : null;
}

/** Rôle "σ retrouvé" (v5Sigma, v7Sigma) — dernier écran, arrondi standard (pas de piège). Rappelle k
 * (et le pourcentage écran 0 pour V7). */
export function EtapeSigmaFinal({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerSigma(exercice, texte) : undefined;

  return (
    <div>
      <EnonceBienaymeTchebychev exercice={exercice} />
      <EtatActuelPanel latex={formatEtatActuelCombineLatex(pourcentAttendu0Pour(exercice), kEtatActuel(exercice))} />
      <p className="prompt-text">
        Quel est l'écart-type <Katex expression={LABEL_SIGMA} /> (en {exercice.contexte.unite}) ? ({PRECISION_UNITE})
      </p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="bienayme-sigma-final">
          <Katex expression={`${LABEL_SIGMA} =`} />
        </label>
        <input
          id="bienayme-sigma-final"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 8"
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideSigmaNiveau1().texte}</p>
          <Katex expression={texteAideSigmaNiveau1().latex} block />
          {niveauAide >= 2 && (
            <>
              <p>{texteAideSigmaNiveau2(exercice).texte}</p>
              <Katex expression={texteAideSigmaNiveau2(exercice).latex} block />
            </>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={MAX} onActiverAide={onActiverAide} />

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
