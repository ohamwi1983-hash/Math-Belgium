import { useState } from "react";
import type { Exercice } from "../core/generateur.types";
import { Katex } from "./Katex";
import { ApercuExpressionLatex } from "./ApercuExpressionLatex";
import { formatEnonceAffichage } from "../ui/formatEquation";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: Exercice;
  tentativesUtilisees: number;
  tentativesMax: number;
  diagnostiquer: (valeur: string) => StatutVerification;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
}

/**
 * Étape "simplification" du générateur "Second degré — méthode la plus rapide" (gen1, nouvelle,
 * précède désormais l'isolement/la reconnaissance quand pgcd(|a|,|b|,|c|) > 1, ex. 2x²-10x=0) —
 * toujours la toute première étape de l'exercice quand elle a lieu (voir phaseInitiale dans
 * moteur/session.ts), donc jamais de RecapitulatifPanel ni d'EtatActuelPanel ici : rien n'a encore
 * été confirmé (même principe que l'absence historique de ces blocs sur EtapeIsolement quand elle
 * ouvre l'exercice). Nom distinct d'`EtapeSimplification.tsx` (générateur "L'inconnue au
 * dénominateur", simplification d'une FRACTION à deux champs numérateur/dénominateur — contrat
 * totalement différent) pour ne pas créer de collision de nom entre deux générateurs indépendants.
 */
export function EtapeSimplificationCoefficients({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  diagnostiquer,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [reponse, setReponse] = useState("");
  const expression = formatEnonceAffichage(exercice.enonce, exercice.formeAffichage, exercice.parametresAffichage, exercice.irrationnel);

  return (
    <div>
      <div className="equation-box">
        <Katex expression={expression} block />
      </div>
      <p className="prompt-text">Simplifie cette équation au maximum (coefficients entiers, sans facteur commun).</p>
      <ApercuExpressionLatex texte={reponse} label="Équation simplifiée :" />
      <div className="field">
        <label className="field-label" htmlFor="simplification-coefficients">
          Équation simplifiée
        </label>
        <input
          id="simplification-coefficients"
          className="text-input"
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
        />
      </div>
      <div>
        {aideActivee && (
          <p className="prompt-text">
            Cherche le plus grand diviseur commun aux trois coefficients, puis divise toute l'équation par ce nombre.
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
