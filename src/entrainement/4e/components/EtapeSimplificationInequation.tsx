import { useState } from "react";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import type { StatutVerification } from "../moteur/statutVerification";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import type { FragmentConsigne } from "../ui/formatEquationDroite";

interface Props {
  tentativesUtilisees: number;
  tentativesMax: number;
  diagnostiquer: (valeur: string) => StatutVerification;
  aideActivee: boolean;
  onActiverAide: () => void;
  /** Aides à 2 niveaux (KaTeX) fournies par l'appli — remplacent l'aide historique à 1 niveau. */
  aides?: FragmentConsigne[][];
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (jamais la réponse). */
  messageCible?: (valeur: string) => FragmentConsigne[] | null;
  onValider: (reponse: string) => void;
  validation?: ValidationEtapeProps | null;
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
  tentativesUtilisees,
  tentativesMax,
  diagnostiquer,
  aideActivee,
  onActiverAide,
  aides,
  messageCible,
  onValider,
  validation,
}: Props) {
  const [reponse, setReponse] = useState("");
  const saisie = useTentativeLisible<string>();

  return (
    <div>
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
          onChange={(e) => setReponse(normaliserSigneMoins(e.target.value))}
        />
      </div>
      {!validation && (
        <>
          {aides ? (
            <AidesNiveaux aides={aides} onPremiereAide={onActiverAide} />
          ) : (
          <div>
            {aideActivee && (
              <div className="triangle-quelconque-aide">
                <p>
                  Cherche le plus grand diviseur commun aux trois coefficients, puis divise toute l'inéquation par ce
                  nombre (positif ou négatif). Si tu choisis un diviseur négatif, le sens de l'inégalité s'inverse —
                  indique alors le nouveau symbole dans ta réponse.
                </p>
              </div>
            )}
            <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
          </div>
          )}
          <button type="button" className="btn btn-primary" disabled={reponse.trim() === ""} onClick={() => saisie.tenter(reponse, /[<>≤≥]/.test(reponse) && diagnostiquer(reponse) !== "parse_error", onValider)}>
            Valider
          </button>
          <MessageRetour
            texteIllisible="Inéquation non reconnue : écris les deux membres et le symbole (<, >, ≤ ou ≥), en vérifiant les parenthèses et les signes. Cette saisie ne compte pas comme une tentative."
            illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={saisie.soumise !== null ? messageCible?.(saisie.soumise) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
