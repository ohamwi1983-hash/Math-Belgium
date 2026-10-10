import { useState } from "react";
import type {
  ExerciceBienaymeTchebychevIntervalleVersSigma,
  ExerciceBienaymeTchebychevIntervalleVersXBar,
  ExerciceBienaymeTchebychevNombreVersIntervalle,
  ExerciceBienaymeTchebychevNombreVersSigma,
  ExerciceBienaymeTchebychevNombreVersXBar,
  ExerciceBienaymeTchebychevPourcentVersIntervalle,
} from "../core/bienaymeTchebychev.types";
import { diagnostiquerK } from "../moteur/verificationBienaymeTchebychev";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { LABEL_K, PRECISION_K, type ValeurEtatActuel, formatEtatActuelCombineLatex, pourcentAttendu0EtatActuel, texteAideKDepuisPourcentNiveau1, texteAideKDepuisPourcentNiveau2 } from "../ui/formatBienaymeTchebychev";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceBienaymeTchebychev } from "./EnonceBienaymeTchebychev";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

type Exercice =
  | ExerciceBienaymeTchebychevPourcentVersIntervalle
  | ExerciceBienaymeTchebychevNombreVersIntervalle
  | ExerciceBienaymeTchebychevIntervalleVersSigma
  | ExerciceBienaymeTchebychevIntervalleVersXBar
  | ExerciceBienaymeTchebychevNombreVersSigma
  | ExerciceBienaymeTchebychevNombreVersXBar;

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

const MAX = 2;

/** Pourcentage à substituer dans l'aide niveau 2 — soit la donnée directe `pourcentDonne` (V2/V5/V6),
 * soit la valeur CONFIRMÉE à l'écran précédent `pourcentAttendu0` (V4/V7/V8). Discrimination par
 * `switch` sur `variante` (jamais un `in`/`??` en cascade, qui ne narrowe pas correctement l'union
 * après une variable intermédiaire). */
function pourcentAffichePour(exercice: Exercice): number {
  switch (exercice.variante) {
    case "pourcentVersIntervalle":
    case "intervalleVersSigma":
    case "intervalleVersXBar":
      return exercice.pourcentDonne;
    case "nombreVersIntervalle":
    case "nombreVersSigma":
    case "nombreVersXBar":
      return exercice.pourcentAttendu0;
  }
}

/** `null` pour V2/V5/V6 (pourcentage déjà visible dans l'énoncé, rien à rappeler) — la valeur
 * CONFIRMÉE `pourcentAttendu0` pour V4/V7/V8 (bloc "état actuel"). */
function pourcentAttendu0Pour(exercice: Exercice): ValeurEtatActuel | null {
  switch (exercice.variante) {
    case "nombreVersIntervalle":
    case "nombreVersSigma":
    case "nombreVersXBar":
      return pourcentAttendu0EtatActuel(exercice);
    default:
      return null;
  }
}

/** Rôle "k depuis un pourcentage donné" (v2K, v4K, v5K, v6K, v7K, v8K) — le pourcentage est soit une
 * DONNÉE directe de l'énoncé (V2/V5/V6, `pourcentDonne`, déjà affiché dans l'énoncé, aucun bloc "état
 * actuel" nécessaire), soit une valeur CONFIRMÉE à l'écran précédent (V4/V7/V8, `pourcentAttendu0`,
 * rappelée via `EtatActuelPanel`). */
export function EtapeKDepuisPourcent({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");
  const complet = texte.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerK(exercice, texte) : undefined;

  const pourcentAttendu0 = pourcentAttendu0Pour(exercice);
  const pourcentAffiche = pourcentAffichePour(exercice);

  return (
    <div>
      <EnonceBienaymeTchebychev exercice={exercice} />
      <EtatActuelPanel latex={formatEtatActuelCombineLatex(pourcentAttendu0, null)} />
      <p className="prompt-text">
        Détermine <Katex expression={LABEL_K} /> pour ce pourcentage minimal ({PRECISION_K}).
      </p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="bienayme-k-pourcent">
          <Katex expression={`${LABEL_K} \\approx`} />
        </label>
        <input
          id="bienayme-k-pourcent"
          className={`text-input${statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder="ex : 2,5"
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideKDepuisPourcentNiveau1().texte}</p>
          <Katex expression={texteAideKDepuisPourcentNiveau1().latex} block />
          {niveauAide >= 2 && (
            <>
              <p>{texteAideKDepuisPourcentNiveau2(pourcentAffiche).texte}</p>
              <Katex expression={texteAideKDepuisPourcentNiveau2(pourcentAffiche).latex} block />
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
