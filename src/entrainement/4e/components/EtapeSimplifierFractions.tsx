import { useState } from "react";
import type { FractionAReduire } from "../core/equationRationnelle.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { formatPolynomeLineaireDeveloppe } from "../ui/formatEquationRationnelle";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";

interface Props {
  fractions: FractionAReduire[];
  expressionAffichee: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /**
   * Statut à 3 valeurs (convention CLAUDE.md) — les champs des 1-2 fractions sont diagnostiqués
   * ensemble (diagnostiquerSimplifierToutes, verificationEquationRationnelle.ts), un échec de
   * parsing sur n'importe lequel étant prioritaire. Absent par défaut : message générique inchangé.
   */
  diagnostiquer?: (reponses: Array<{ numerateur: string; denominateur: string }>) => StatutVerification;
  onValider: (reponses: Array<{ numerateur: string; denominateur: string }>) => void;
}

const LABEL_COTE: Record<"gauche" | "droite", string> = {
  gauche: "Fraction de gauche",
  droite: "Fraction de droite",
};

/**
 * Étape "simplifier" (prompt-3-simplifier-et-isolement-flexible.md) : une ou deux fractions
 * individuellement réductibles, chacune avec son propre couple de champs numérateur/dénominateur
 * (même format à deux champs que l'exercice "Simplifier"). Un seul "Valider" soumet toutes les
 * fractions en une seule tentative (tout ou rien), notée par le composant générique "étape avec
 * tentatives" côté moteur.
 */
export function EtapeSimplifierFractions({
  fractions,
  expressionAffichee,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  diagnostiquer,
  onValider,
}: Props) {
  const [numerateurs, setNumerateurs] = useState<string[]>(() => fractions.map(() => ""));
  const [denominateurs, setDenominateurs] = useState<string[]>(() => fractions.map(() => ""));

  function modifierNumerateur(index: number, valeur: string) {
    setNumerateurs((valeurs) => valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  function modifierDenominateur(index: number, valeur: string) {
    setDenominateurs((valeurs) => valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  const tousRemplis = numerateurs.every((v) => v.trim() !== "") && denominateurs.every((v) => v.trim() !== "");
  const reponses = fractions.map((_, index) => ({ numerateur: numerateurs[index], denominateur: denominateurs[index] }));

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={expressionAffichee} block />
      </div>
      <p className="prompt-text">
        {fractions.length > 1
          ? "Ces deux fractions sont réductibles. Simplifie-les."
          : "Cette fraction est réductible. Simplifie-la."}
      </p>
      {fractions.map((fraction, index) => (
        <div key={fraction.cote}>
          <div className="equation-box">
            <Katex
              expression={`\\frac{${formatPolynomeLineaireDeveloppe(fraction.numerateur)}}{${formatPolynomeLineaireDeveloppe(fraction.denominateur)}}`}
              block
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`simplifier-numerateur-${fraction.cote}`}>
              {LABEL_COTE[fraction.cote]} — numérateur simplifié
            </label>
            <input
              id={`simplifier-numerateur-${fraction.cote}`}
              className="text-input"
              value={numerateurs[index]}
              onChange={(e) => modifierNumerateur(index, e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`simplifier-denominateur-${fraction.cote}`}>
              {LABEL_COTE[fraction.cote]} — dénominateur simplifié
            </label>
            <input
              id={`simplifier-denominateur-${fraction.cote}`}
              className="text-input"
              value={denominateurs[index]}
              onChange={(e) => modifierDenominateur(index, e.target.value)}
            />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-primary" disabled={!tousRemplis} onClick={() => onValider(reponses)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, diagnostiquer?.(reponses))}
        </p>
      )}
    </div>
  );
}
