import { useState } from "react";
import type { ExerciceBienaymeTchebychevIntervalleVersXBar, ExerciceBienaymeTchebychevNombreVersXBar } from "../core/bienaymeTchebychev.types";
import { diagnostiquerXBar } from "../moteur/verificationBienaymeTchebychev";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  LABEL_XBAR,
  PRECISION_UNITE,
  type ValeurEtatActuel,
  formatEtatActuelCombineLatex,
  kEtatActuel,
  libelleBoutonAide,
  pourcentAttendu0EtatActuel,
  texteAideXBarNiveau1,
  texteAideXBarNiveau2,
} from "../ui/formatBienaymeTchebychev";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceBienaymeTchebychev } from "./EnonceBienaymeTchebychev";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

type Exercice = ExerciceBienaymeTchebychevIntervalleVersXBar | ExerciceBienaymeTchebychevNombreVersXBar;

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
  return exercice.variante === "nombreVersXBar" ? pourcentAttendu0EtatActuel(exercice) : null;
}

/** Rôle "x̄ retrouvé" (v6XBar, v8XBar) — dernier écran, arrondi standard (pas de piège). Rappelle k
 * (et le pourcentage écran 0 pour V8). */
export function EtapeXBarFinal({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerXBar(exercice, texte) : undefined;

  return (
    <div>
      <EnonceBienaymeTchebychev exercice={exercice} />
      <EtatActuelPanel latex={formatEtatActuelCombineLatex(pourcentAttendu0Pour(exercice), kEtatActuel(exercice))} />
      <p className="prompt-text">
        Quelle est la moyenne <Katex expression={LABEL_XBAR} /> (en {exercice.contexte.unite}) ? ({PRECISION_UNITE})
      </p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="bienayme-xbar-final">
          <Katex expression={`${LABEL_XBAR} =`} />
        </label>
        <input
          id="bienayme-xbar-final"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 172"
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideXBarNiveau1().texte}</p>
          <Katex expression={texteAideXBarNiveau1().latex} block />
          {niveauAide >= 2 && (
            <>
              <p>{texteAideXBarNiveau2(exercice).texte}</p>
              <Katex expression={texteAideXBarNiveau2(exercice).latex} block />
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
