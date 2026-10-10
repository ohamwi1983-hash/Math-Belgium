import { useEffect, useState } from "react";
import type { ExerciceSimplification } from "../core/simplification.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { expressionLibreVersLatex } from "../ui/formatExpressionLatex";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { FractionHeader } from "./FractionHeader";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  /** Requis sauf si expressionAffichee est fourni (voir plus bas) — sert uniquement au FractionHeader par défaut. */
  exercice?: ExerciceSimplification;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  /** Remplace le FractionHeader par défaut — ex: la fraction P2/P1_1 développée pour "L'inconnue au dénominateur" (cas 4a/4b). */
  expressionAffichee?: string;
  /** Bloc "état actuel" (prompt-corrections-moteur-partage.md, point 1) — absent/null par défaut : rien de rendu. */
  etatActuel?: string | null;
  /**
   * Remplace la consigne par défaut ("Simplifie la fraction.") — ex: "Simplifie la fraction
   * ci-dessus." pour "L'inconnue au dénominateur" (cas 4a/4b), une fois l'énoncé à deux fractions
   * remplacé par un encadré "état actuel" n'affichant plus que la seule fraction concernée
   * (promptgenerateur4equationRationnelle.md, point 5).
   */
  question?: string;
  /**
   * Bloc "Énoncé" fixe (générateur 6, restructuration en 3 blocs) — absent par défaut :
   * comportement historique inchangé. Fourni : 3 blocs empilés (enonceFixe → EtatActuelPanel →
   * expressionAffichee, ce dernier omis s'il duplique enonceFixe) — voir EtapeIsolement.tsx.
   */
  enonceFixe?: string;
  /**
   * Statut à 3 valeurs (convention CLAUDE.md) — les deux champs (numérateur/dénominateur saisis)
   * sont diagnostiqués ensemble par `diagnostiquerSimplification` (verificationSimplification.ts),
   * un échec de parsing sur l'un OU l'autre étant prioritaire (prompt-generateurs123vague2.md,
   * générateur 3, point 2). Absent par défaut : message générique inchangé.
   */
  diagnostiquer?: (numerateur: string, denominateur: string) => StatutVerification;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (numerateur: string, denominateur: string) => void;
}

/**
 * Étape finale : deux champs libres, vérifiés par produit en croix (section 4 de la spec).
 *
 * Deux encadrés distincts (prompt-generateurs123vague2.md, générateur 3, point 6) — l'énoncé (la
 * fraction d'origine, jamais factorisée) et l'"état actuel" (la fraction déjà factorisée des deux
 * côtés mais pas encore simplifiée, calculée par calculerEtatActuelSimplification et transmise par
 * l'appelant) — plutôt qu'un unique bloc combiné "fraction brute = fraction factorisée" (retiré,
 * voir formatFractionAvecFactorisation), conforme au même patron "énoncé / état actuel" déjà
 * utilisé sur tous les autres écrans de ce générateur.
 */
export function EtapeSimplification({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  expressionAffichee,
  etatActuel,
  question,
  enonceFixe,
  diagnostiquer,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [numerateur, setNumerateur] = useState("");
  const [denominateur, setDenominateur] = useState("");

  /**
   * Aperçu en direct de la fraction simplifiée combinée, une fois les deux champs remplis (bug
   * utilisateur du 27/09) — même principe de "dernier rendu valide conservé, assombri sinon" que
   * ApercuExpressionLatex, mais combine deux champs plutôt qu'un seul, donc réplique la logique ici
   * plutôt que de réutiliser ce composant tel quel.
   */
  const [dernierApercuValide, setDernierApercuValide] = useState<string | null>(null);
  let apercuCourant: string | null;
  try {
    apercuCourant =
      numerateur.trim() === "" || denominateur.trim() === ""
        ? null
        : `\\frac{${expressionLibreVersLatex(numerateur)}}{${expressionLibreVersLatex(denominateur)}}`;
  } catch {
    apercuCourant = null;
  }
  useEffect(() => {
    if (apercuCourant !== null) setDernierApercuValide(apercuCourant);
    else if (numerateur.trim() === "" || denominateur.trim() === "") setDernierApercuValide(null);
  }, [apercuCourant, numerateur, denominateur]);
  const apercuPerime = dernierApercuValide !== null && apercuCourant === null;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {enonceFixe !== undefined ? (
        <>
          <div className="equation-box">
            <Katex expression={enonceFixe} block />
          </div>
          <EtatActuelPanel latex={etatActuel ?? null} />
          {expressionAffichee !== undefined && expressionAffichee !== enonceFixe && (
            <div className="equation-box">
              <Katex expression={expressionAffichee} block />
            </div>
          )}
        </>
      ) : (
        <>
          {expressionAffichee !== undefined ? (
            <div className="equation-box">
              <Katex expression={expressionAffichee} block />
            </div>
          ) : (
            <FractionHeader exercice={exercice as ExerciceSimplification} />
          )}
          <EtatActuelPanel latex={etatActuel ?? null} />
        </>
      )}
      <p className="prompt-text">{question ?? "Simplifie la fraction."}</p>
      {dernierApercuValide !== null && (
        <div className={`apercu-expression-latex contenu-conditionnel${apercuPerime ? " apercu-expression-latex-perime" : ""}`}>
          <span className="apercu-expression-latex-label">Fraction simplifiée =</span>
          <Katex expression={dernierApercuValide} />
        </div>
      )}
      <div className="field">
        <label className="field-label" htmlFor="simplification-numerateur">
          Numérateur simplifié
        </label>
        <input
          id="simplification-numerateur"
          className="text-input"
          value={numerateur}
          onChange={(e) => setNumerateur(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="simplification-denominateur">
          Dénominateur simplifié
        </label>
        <input
          id="simplification-denominateur"
          className="text-input"
          value={denominateur}
          onChange={(e) => setDenominateur(e.target.value)}
        />
      </div>
      <div>
        {aideActivee && (
          <p className="prompt-text">Simplifie en divisant numérateur et dénominateur par leur facteur commun.</p>
        )}
        <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={numerateur.trim() === "" || denominateur.trim() === ""}
        onClick={() => onValider(numerateur, denominateur)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, diagnostiquer?.(numerateur, denominateur))}
        </p>
      )}
    </div>
  );
}
