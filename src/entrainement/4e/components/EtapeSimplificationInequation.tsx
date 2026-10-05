import { useState } from "react";
import type { ExerciceInequation } from "../core/inequation.types";
import { Katex } from "./Katex";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { formatInequationLatex } from "../ui/formatInequation";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceInequation;
  tentativesUtilisees: number;
  tentativesMax: number;
  diagnostiquer: (valeur: string) => StatutVerification;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
}

/**
 * Étape "simplification" du générateur "Tableau de signes d'un trinôme du second degré" (gen2,
 * nouvelle, précède désormais racines quand pgcd(|a|,|b|,|c|) > 1, ex. 4x²-16x+16≥0) — même
 * principe que EtapeSimplificationCoefficients.tsx (gen1), copié plutôt qu'importé (contrat
 * différent : ax²+bx+c ◇ 0, jamais "=0" — voir moteur/simplificationInequation.ts). Toujours la
 * toute première étape de l'exercice quand elle a lieu, donc jamais de récapitulatif/état actuel
 * ici (rien n'a encore été confirmé). Deux réponses valides (bug utilisateur du 26/09, voir
 * moteur/verificationInequation.ts::diagnostiquerSimplification) : le trinôme réduit seul (division
 * par le pgcd positif, symbole/`a` inchangés — le cas le plus courant) OU le trinôme réduit
 * OPPOSÉ suivi du symbole retourné (division par un facteur négatif, ex. "x²-2x-24 ≤ 0" pour
 * "-4x²+8x+96 ≥ 0") — le champ accepte donc, en plus du trinôme seul, un symbole ("<","≤" (ou
 * "<="), ">","≥" (ou ">=")) suivi de "0".
 */
export function EtapeSimplificationInequation({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  diagnostiquer,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [reponse, setReponse] = useState("");

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatInequationLatex(exercice.enonce, exercice.symbole)} block />
      </div>
      <p className="prompt-text">Simplifie cette inéquation au maximum (coefficients entiers, sans facteur commun).</p>
      <ApercuExpressionLatex texte={reponse} label="Inéquation simplifiée =" />
      <div className="field">
        <label className="field-label" htmlFor="simplification-inequation">
          Inéquation simplifiée
        </label>
        <input
          id="simplification-inequation"
          className="text-input"
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
        />
      </div>
      <div>
        {aideActivee && (
          <p className="prompt-text">
            Cherche le plus grand diviseur commun aux trois coefficients, puis divise toute l'inéquation par ce
            nombre (positif ou négatif). Si tu choisis un diviseur négatif, le sens de l'inégalité s'inverse —
            indique alors le nouveau symbole dans ta réponse.
          </p>
        )}
        <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
          {aideActivee ? "Aide utilisée" : "Aide"}
        </button>
      </div>
      <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, diagnostiquer(reponse))}
        </p>
      )}
    </div>
  );
}
