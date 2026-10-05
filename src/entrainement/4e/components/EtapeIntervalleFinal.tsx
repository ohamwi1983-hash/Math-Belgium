import { useState } from "react";
import type { ExerciceBienaymeTchebychevNombreVersIntervalle, ExerciceBienaymeTchebychevPourcentVersIntervalle } from "../core/bienaymeTchebychev.types";
import { diagnostiquerIntervalleAttendu } from "../moteur/verificationBienaymeTchebychev";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  PRECISION_UNITE,
  type ValeurEtatActuel,
  formatEtatActuelCombineLatex,
  kEtatActuel,
  libelleBoutonAide,
  pourcentAttendu0EtatActuel,
  texteAideIntervalleFinalNiveau1,
} from "../ui/formatBienaymeTchebychev";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceBienaymeTchebychev } from "./EnonceBienaymeTchebychev";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

type Exercice = ExerciceBienaymeTchebychevPourcentVersIntervalle | ExerciceBienaymeTchebychevNombreVersIntervalle;

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (borneInf: string, borneSup: string) => void;
}

const MAX = 1;

function pourcentAttendu0Pour(exercice: Exercice): ValeurEtatActuel | null {
  return exercice.variante === "nombreVersIntervalle" ? pourcentAttendu0EtatActuel(exercice) : null;
}

/** `parse_error` prioritaire si l'un des deux champs échoue au parsing, sinon un statut générique
 * "not_equivalent" (le message affiché est identique pour tout ce qui n'est pas `parse_error`). */
function statutPrioritaire(statut: { borneInf: string; borneSup: string } | undefined): "parse_error" | "not_equivalent" | undefined {
  if (!statut) return undefined;
  if (statut.borneInf === "parse_error" || statut.borneSup === "parse_error") return "parse_error";
  return "not_equivalent";
}

/** Rôle "intervalle final" (v2Intervalle, v4Intervalle) — 2 champs indépendants, marqués en rouge
 * séparément (isole une erreur de signe sur une seule borne). Les bornes attendues sont toujours
 * ÉLARGIES vers l'extérieur (piège), déjà capturé par `borneInfAttendue`/`borneSupAttendue` (Couche
 * A), jamais par ce composant. */
export function EtapeIntervalleFinal({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [borneInf, setBorneInf] = useState("");
  const [borneSup, setBorneSup] = useState("");
  const complet = borneInf.trim() !== "" && borneSup.trim() !== "";
  const statut = complet && tentativesUtilisees > 0 ? diagnostiquerIntervalleAttendu(exercice, { borneInf, borneSup }) : undefined;

  return (
    <div>
      <EnonceBienaymeTchebychev exercice={exercice} />
      <EtatActuelPanel latex={formatEtatActuelCombineLatex(pourcentAttendu0Pour(exercice), kEtatActuel(exercice))} />
      <p className="prompt-text">
        Quel est l'intervalle garanti (en {exercice.contexte.unite}) ? ({PRECISION_UNITE})
      </p>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor="bienayme-intervalle-inf">
            Borne inférieure =
          </label>
          <input
            id="bienayme-intervalle-inf"
            className={`text-input${statut !== undefined && statut.borneInf !== "correct" ? " is-erronee" : ""}`}
            placeholder="ex : 10"
            value={borneInf}
            onChange={(e) => setBorneInf(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="bienayme-intervalle-sup">
            Borne supérieure =
          </label>
          <input
            id="bienayme-intervalle-sup"
            className={`text-input${statut !== undefined && statut.borneSup !== "correct" ? " is-erronee" : ""}`}
            placeholder="ex : 30"
            value={borneSup}
            onChange={(e) => setBorneSup(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideIntervalleFinalNiveau1().texte}</p>
          <Katex expression={texteAideIntervalleFinalNiveau1().latex} block />
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= MAX} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, MAX)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(borneInf, borneSup)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutPrioritaire(statut))}
        </p>
      )}
    </div>
  );
}
