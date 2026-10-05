import type { ResultatExerciceLimiteExponentielle } from "../moteur6e/typesLimitesExponentielles";
import { formatCibleTexte, totalPointsLimiteExponentielle } from "../ui6e/formatLimitesExponentielles";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceLimiteExponentielle;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — liste à plat, une `LigneRecap` PAR ÉCRAN RÉELLEMENT TRAVERSÉ de
 * l'exercice, colorée selon `statutRecap(details[phase].revele, details[phase].niveauAide)` —
 * remplace l'ancien affichage à score fractionnaire (`X/100`). Les écrans "factoriser"/
 * "reformuler"/"combiner"/"ordre1" n'ont pas de cible unique canonique (n'importe quelle
 * transformation algébriquement équivalente est acceptée, vérifiée par équivalence NUMÉRIQUE,
 * jamais comparée à une chaîne de référence figée) — leur ligne affiche donc ce qui a été vérifié
 * plutôt qu'une expression, contrairement aux écrans à cible catégorielle/numérique fixe (A/B/C-
 * globale/G-conclure), qui affichent la cible réelle.
 */
export function ResultatPanelLimiteExponentielle({ resultat, onContinuer, dernier }: Props) {
  const d = resultat.details;
  const exercice = resultat.exercice;
  const total = totalPointsLimiteExponentielle(resultat);

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {resultat.famille === "A" && exercice.famille === "A" && (
        <>
          <LigneRecap label="Limite de l'exposant" statut={statutRecap(d.aExposant?.revele ?? false, d.aExposant?.niveauAide ?? null)}>
            <Katex expression={formatCibleTexte(exercice.limiteExposant)} />
          </LigneRecap>
          <LigneRecap label="Limite globale" statut={statutRecap(d.aGlobale?.revele ?? false, d.aGlobale?.niveauAide ?? null)}>
            <Katex expression={formatCibleTexte(exercice.limiteGlobale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "B" && exercice.famille === "B" && (
        <>
          <LigneRecap label="Terme exponentiel" statut={statutRecap(d.bExponentielle?.revele ?? false, d.bExponentielle?.niveauAide ?? null)}>
            <Katex expression={formatCibleTexte(exercice.limiteExponentielle)} />
          </LigneRecap>
          <LigneRecap label="Terme polynomial" statut={statutRecap(d.bPolynomiale?.revele ?? false, d.bPolynomiale?.niveauAide ?? null)}>
            <Katex expression={formatCibleTexte(exercice.limitePolynomiale)} />
          </LigneRecap>
          <LigneRecap label="Limite globale" statut={statutRecap(d.bGlobale?.revele ?? false, d.bGlobale?.niveauAide ?? null)}>
            <Katex expression={formatCibleTexte(exercice.limiteGlobale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "C" && exercice.famille === "C" && (
        <>
          <LigneRecap label="Facteurs" statut={statutRecap(d.cFacteurs?.revele ?? false, d.cFacteurs?.niveauAide ?? null)}>
            <Katex expression={`${formatCibleTexte(exercice.limiteFacteur1)} \\quad , \\quad ${formatCibleTexte(exercice.limiteFacteur2)}`} />
          </LigneRecap>
          <LigneRecap label="Limite globale" statut={statutRecap(d.cGlobale?.revele ?? false, d.cGlobale?.niveauAide ?? null)}>
            <Katex expression={String(exercice.limiteGlobale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "G" && exercice.famille === "G" && (
        <>
          <LigneRecap label="Fraction combinée" statut={statutRecap(d.gCombiner?.revele ?? false, d.gCombiner?.niveauAide ?? null)}>
            Les deux termes combinés en une seule fraction, équivalente à f(x).
          </LigneRecap>
          <LigneRecap label="Ordre 1" statut={statutRecap(d.gOrdre1?.revele ?? false, d.gOrdre1?.niveauAide ?? null)}>
            Non — un développement à l'ordre 1 ne suffit pas ici (les termes dominants s'annulent).
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.gConclure?.revele ?? false, d.gConclure?.niveauAide ?? null)}>
            <Katex expression={String(exercice.limiteFinale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "H" && exercice.famille === "H" && (
        <>
          <LigneRecap label="Forme indéterminée" statut={statutRecap(d.hForme?.revele ?? false, d.hForme?.niveauAide ?? null)}>
            0/0
          </LigneRecap>
          <LigneRecap label="Dérivée du numérateur" statut={statutRecap(d.hNumerateur?.revele ?? false, d.hNumerateur?.niveauAide ?? null)}>
            {exercice.expAuNumerateur ? "Forme équivalente à f'(x), vérifiée par équivalence numérique." : <Katex expression={String(exercice.m)} />}
          </LigneRecap>
          <LigneRecap label="Dérivée du dénominateur" statut={statutRecap(d.hDenominateur?.revele ?? false, d.hDenominateur?.niveauAide ?? null)}>
            {exercice.expAuNumerateur ? <Katex expression={String(exercice.m)} /> : "Forme équivalente à g'(x), vérifiée par équivalence numérique."}
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.hConclure?.revele ?? false, d.hConclure?.niveauAide ?? null)}>
            <Katex expression={String(exercice.limiteFinale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "I" && exercice.famille === "I" && (
        <>
          <LigneRecap label="Forme indéterminée" statut={statutRecap(d.iForme?.revele ?? false, d.iForme?.niveauAide ?? null)}>
            0/0
          </LigneRecap>
          <LigneRecap label="Dérivée du numérateur" statut={statutRecap(d.iNumerateur?.revele ?? false, d.iNumerateur?.niveauAide ?? null)}>
            Forme équivalente à f'(x), vérifiée par équivalence numérique.
          </LigneRecap>
          <LigneRecap label="Dérivée du dénominateur" statut={statutRecap(d.iDenominateur?.revele ?? false, d.iDenominateur?.niveauAide ?? null)}>
            Forme équivalente à g'(x), vérifiée par équivalence numérique.
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.iConclure?.revele ?? false, d.iConclure?.niveauAide ?? null)}>
            <Katex expression={String(exercice.limiteFinale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "J" && exercice.famille === "J" && (
        <>
          <LigneRecap label="Forme indéterminée" statut={statutRecap(d.jForme?.revele ?? false, d.jForme?.niveauAide ?? null)}>
            0/0
          </LigneRecap>
          <LigneRecap label="Dérivée du numérateur" statut={statutRecap(d.jNumerateur?.revele ?? false, d.jNumerateur?.niveauAide ?? null)}>
            Forme équivalente à f'(x), vérifiée par équivalence numérique.
          </LigneRecap>
          <LigneRecap label="Dérivée du dénominateur" statut={statutRecap(d.jDenominateur?.revele ?? false, d.jDenominateur?.niveauAide ?? null)}>
            Forme équivalente à g'(x), vérifiée par équivalence numérique.
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.jConclure?.revele ?? false, d.jConclure?.niveauAide ?? null)}>
            <Katex expression={String(exercice.limiteFinale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "K" && exercice.famille === "K" && (
        <>
          <LigneRecap label="Forme indéterminée" statut={statutRecap(d.kForme?.revele ?? false, d.kForme?.niveauAide ?? null)}>
            0/0
          </LigneRecap>
          <LigneRecap label="Dérivée première du numérateur" statut={statutRecap(d.kNumerateur1?.revele ?? false, d.kNumerateur1?.niveauAide ?? null)}>
            Forme équivalente à f'(x), vérifiée par équivalence numérique.
          </LigneRecap>
          <LigneRecap label="Dérivée première du dénominateur" statut={statutRecap(d.kDenominateur1?.revele ?? false, d.kDenominateur1?.niveauAide ?? null)}>
            Forme équivalente à g'(x), vérifiée par équivalence numérique.
          </LigneRecap>
          <LigneRecap label="Dérivée seconde du numérateur" statut={statutRecap(d.kNumerateur2?.revele ?? false, d.kNumerateur2?.niveauAide ?? null)}>
            {exercice.expAuNumerateur ? "Forme équivalente à f''(x), vérifiée par équivalence numérique." : <Katex expression={String(2 * exercice.m)} />}
          </LigneRecap>
          <LigneRecap label="Dérivée seconde du dénominateur" statut={statutRecap(d.kDenominateur2?.revele ?? false, d.kDenominateur2?.niveauAide ?? null)}>
            {exercice.expAuNumerateur ? <Katex expression={String(2 * exercice.m)} /> : "Forme équivalente à g''(x), vérifiée par équivalence numérique."}
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.kConclure?.revele ?? false, d.kConclure?.niveauAide ?? null)}>
            <Katex expression={String(exercice.limiteFinale)} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "L" && exercice.famille === "L" && (
        <>
          <LigneRecap label="Reformulation" statut={statutRecap(d.lReformuler?.revele ?? false, d.lReformuler?.niveauAide ?? null)}>
            Forme reformulée vers le pivot (1+1/u)^u, équivalente à f(x).
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.lConclure?.revele ?? false, d.lConclure?.niveauAide ?? null)}>
            <Katex expression={`e^{${exercice.k * exercice.m}}`} />
          </LigneRecap>
        </>
      )}
      {resultat.famille === "N" && exercice.famille === "N" && (
        <>
          <LigneRecap label="Combinaison" statut={statutRecap(d.nCombiner?.revele ?? false, d.nCombiner?.niveauAide ?? null)}>
            Forme combinée via la loi des puissances, équivalente à f(x).
          </LigneRecap>
          <LigneRecap label="Conclusion" statut={statutRecap(d.nConclure?.revele ?? false, d.nConclure?.niveauAide ?? null)}>
            <Katex expression={`${exercice.base}^{${exercice.k * exercice.m}}`} />
          </LigneRecap>
        </>
      )}
      <div className="recap-final-total">Total : {Math.round(total.points)}/{total.maximum}</div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
