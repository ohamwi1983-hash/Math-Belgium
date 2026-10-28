import type { ExerciceLimiteExponentielle } from "../core6e/limitesExponentielles.types";
import { phaseApres, phaseInitiale } from "../moteur6e/typesLimitesExponentielles";
import type { EtatSessionLimiteExponentielle, PhaseLimiteExponentielle } from "../moteur6e/typesLimitesExponentielles";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatCibleTexte } from "./formatLimitesExponentielles";

/**
 * Libellés courts du récapitulatif "Ce qu'on sait déjà", famille par famille — `6gen6` n'a (contrairement
 * à `equationsExpLog`/`6gen14`) ni `LIBELLE_PHASE` ni `PHASES_PAR_FAMILLE` préexistants : les 10 familles
 * (A, B, C, G, H, I, J, K, L, N) sont STRUCTURELLEMENT DISJOINTES (voir `typesLimitesExponentielles.ts`),
 * `Record<PhaseLimiteExponentielle, string>` ci-dessous est donc construit ici, exhaustivité garantie par
 * TypeScript (`Record` complet, jamais de `Partial`/cast).
 */
export const LIBELLE_PHASE: Record<PhaseLimiteExponentielle, string> = {
  // Famille A — 2 écrans.
  aExposant: "Limite de l'exposant",
  aGlobale: "Limite globale",

  // Famille B — 3 écrans.
  bExponentielle: "Limite du terme exponentiel",
  bPolynomiale: "Limite du terme polynomial",
  bGlobale: "Limite globale",

  // Famille C — 2 écrans.
  cFacteurs: "Limites des deux facteurs",
  cGlobale: "Limite du produit",

  // Famille G — 3 écrans (instance unique).
  gCombiner: "Fraction combinée",
  gOrdre1: "Ordre 1 suffisant ?",
  gConclure: "Limite finale",

  // Famille H — 4 écrans (L'Hôpital, une application, 0/0 pur exponentiel).
  hForme: "Forme indéterminée",
  hNumerateur: "Dérivée du numérateur",
  hDenominateur: "Dérivée du dénominateur",
  hConclure: "Limite finale (L'Hôpital)",

  // Famille I — 4 écrans (L'Hôpital, une application, 0/0 mixte trigonométrique).
  iForme: "Forme indéterminée",
  iNumerateur: "Dérivée du numérateur",
  iDenominateur: "Dérivée du dénominateur",
  iConclure: "Limite finale (L'Hôpital)",

  // Famille J — 4 écrans (L'Hôpital, une application, 0/0 mixte arcfonction).
  jForme: "Forme indéterminée",
  jNumerateur: "Dérivée du numérateur",
  jDenominateur: "Dérivée du dénominateur",
  jConclure: "Limite finale (L'Hôpital)",

  // Famille K — 6 écrans (L'Hôpital, DEUX applications).
  kForme: "Forme indéterminée",
  kNumerateur1: "Dérivée première du numérateur",
  kDenominateur1: "Dérivée première du dénominateur",
  kNumerateur2: "Dérivée seconde du numérateur",
  kDenominateur2: "Dérivée seconde du dénominateur",
  kConclure: "Limite finale (L'Hôpital x2)",

  // Famille L — 2 écrans (FI 1^∞ via pivot e).
  lReformuler: "Forme reformulée (pivot e)",
  lConclure: "Limite finale",

  // Famille N — 2 écrans (FI ∞^0/0^0 via loi des puissances).
  nCombiner: "Forme combinée (puissances)",
  nConclure: "Limite finale",
};

/** Reconstitue la séquence COMPLÈTE de phases de l'exercice courant en bouclant `phaseInitiale`
 * puis `phaseApres` jusqu'à `"termine"` — jamais une séquence supposée à l'avance : chaque famille
 * a un nombre d'écrans différent (2 à 6, voir `typesLimitesExponentielles.ts`). */
function sequenceDesPhases(exercice: ExerciceLimiteExponentielle): PhaseLimiteExponentielle[] {
  const sequence: PhaseLimiteExponentielle[] = [];
  let phase: PhaseLimiteExponentielle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

/**
 * Valeur (+ `estLatex`) attendue d'un écran DÉJÀ CLOS — réplique EXACTEMENT, champ par champ, la
 * fonction `reponseAttenduePhase` interne à `App6gen6.tsx` (panneau de validation inline), jamais
 * une valeur recalculée séparément. Mêmes narrowings `exercice.famille === "X"` puis `phase ===`
 * (TypeScript ne peut pas prouver la correspondance phase/famille depuis le seul préfixe de lettre).
 */
function valeurPhase(exercice: ExerciceLimiteExponentielle, phase: PhaseLimiteExponentielle): { valeur: string; estLatex: boolean } {
  if (exercice.famille === "A") {
    if (phase === "aExposant") return { valeur: formatCibleTexte(exercice.limiteExposant), estLatex: true };
    if (phase === "aGlobale") return { valeur: formatCibleTexte(exercice.limiteGlobale), estLatex: true };
  }
  if (exercice.famille === "B") {
    if (phase === "bExponentielle") return { valeur: formatCibleTexte(exercice.limiteExponentielle), estLatex: true };
    if (phase === "bPolynomiale") return { valeur: formatCibleTexte(exercice.limitePolynomiale), estLatex: true };
    if (phase === "bGlobale") return { valeur: formatCibleTexte(exercice.limiteGlobale), estLatex: true };
  }
  if (exercice.famille === "C") {
    if (phase === "cFacteurs") {
      return { valeur: `${formatCibleTexte(exercice.limiteFacteur1)} \\quad , \\quad ${formatCibleTexte(exercice.limiteFacteur2)}`, estLatex: true };
    }
    if (phase === "cGlobale") return { valeur: String(exercice.limiteGlobale), estLatex: true };
  }
  if (exercice.famille === "G") {
    if (phase === "gCombiner") return { valeur: "Les deux termes combinés en une seule fraction, équivalente à f(x).", estLatex: false };
    if (phase === "gOrdre1") return { valeur: "Non — un développement à l'ordre 1 ne suffit pas ici (les termes dominants s'annulent).", estLatex: false };
    if (phase === "gConclure") return { valeur: String(exercice.limiteFinale), estLatex: true };
  }
  if (exercice.famille === "H") {
    if (phase === "hForme") return { valeur: "0/0", estLatex: false };
    if (phase === "hNumerateur") {
      return exercice.expAuNumerateur
        ? { valeur: "Forme équivalente à f'(x), vérifiée par équivalence numérique.", estLatex: false }
        : { valeur: String(exercice.m), estLatex: true };
    }
    if (phase === "hDenominateur") {
      return exercice.expAuNumerateur
        ? { valeur: String(exercice.m), estLatex: true }
        : { valeur: "Forme équivalente à g'(x), vérifiée par équivalence numérique.", estLatex: false };
    }
    if (phase === "hConclure") return { valeur: String(exercice.limiteFinale), estLatex: true };
  }
  if (exercice.famille === "I") {
    if (phase === "iForme") return { valeur: "0/0", estLatex: false };
    if (phase === "iNumerateur") return { valeur: "Forme équivalente à f'(x), vérifiée par équivalence numérique.", estLatex: false };
    if (phase === "iDenominateur") return { valeur: "Forme équivalente à g'(x), vérifiée par équivalence numérique.", estLatex: false };
    if (phase === "iConclure") return { valeur: String(exercice.limiteFinale), estLatex: true };
  }
  if (exercice.famille === "J") {
    if (phase === "jForme") return { valeur: "0/0", estLatex: false };
    if (phase === "jNumerateur") return { valeur: "Forme équivalente à f'(x), vérifiée par équivalence numérique.", estLatex: false };
    if (phase === "jDenominateur") return { valeur: "Forme équivalente à g'(x), vérifiée par équivalence numérique.", estLatex: false };
    if (phase === "jConclure") return { valeur: String(exercice.limiteFinale), estLatex: true };
  }
  if (exercice.famille === "K") {
    if (phase === "kForme") return { valeur: "0/0", estLatex: false };
    if (phase === "kNumerateur1") return { valeur: "Forme équivalente à f'(x), vérifiée par équivalence numérique.", estLatex: false };
    if (phase === "kDenominateur1") return { valeur: "Forme équivalente à g'(x), vérifiée par équivalence numérique.", estLatex: false };
    if (phase === "kNumerateur2") {
      return exercice.expAuNumerateur
        ? { valeur: "Forme équivalente à f''(x), vérifiée par équivalence numérique.", estLatex: false }
        : { valeur: String(2 * exercice.m), estLatex: true };
    }
    if (phase === "kDenominateur2") {
      return exercice.expAuNumerateur
        ? { valeur: String(2 * exercice.m), estLatex: true }
        : { valeur: "Forme équivalente à g''(x), vérifiée par équivalence numérique.", estLatex: false };
    }
    if (phase === "kConclure") return { valeur: String(exercice.limiteFinale), estLatex: true };
  }
  if (exercice.famille === "L") {
    if (phase === "lReformuler") return { valeur: "Forme reformulée vers le pivot (1+1/u)^u, équivalente à f(x).", estLatex: false };
    if (phase === "lConclure") return { valeur: `e^{${exercice.k * exercice.m}}`, estLatex: true };
  }
  if (exercice.famille === "N") {
    if (phase === "nCombiner") return { valeur: "Forme combinée via la loi des puissances, équivalente à f(x).", estLatex: false };
    if (phase === "nConclure") return { valeur: `${exercice.base}^{${exercice.k * exercice.m}}`, estLatex: true };
  }
  // Inatteignable à l'exécution (préfixe de phase par lettre de famille, voir
  // `typesLimitesExponentielles.ts`) — filet de sécurité typé plutôt qu'un `as never`.
  return { valeur: "", estLatex: false };
}

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours. Reconstitue la séquence
 * RÉELLE de phases via `phaseInitiale`/`phaseApres` (jamais une séquence supposée à l'avance), et
 * réutilise `valeurPhase` (donc EXACTEMENT le même format que le panneau de validation inline de
 * `App6gen6.tsx`) pour la valeur de chaque entrée. `revele` vient de `detailsPartiels[phase].revele`
 * — JAMAIS de `scoresPartiels[phase] === 0` : un score pouvait tomber à 0 par pénalité d'aide seule (supprimée depuis),
 * sans que la réponse ait été révélée (piège documenté dans `typesLimitesExponentielles.ts`,
 * `DetailPhaseLimiteExponentielle`).
 */
export function calculerRecapitulatifLimitesExponentielles(etat: EtatSessionLimiteExponentielle): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequenceDesPhases(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const { valeur, estLatex } = valeurPhase(exercice, phase);
    const revele = etat.detailsPartiels[phase]?.revele ?? false;
    return { libelle: LIBELLE_PHASE[phase], estLatex, valeur, revele };
  });
}

/** Une puce par écran RÉELLEMENT traversé par la famille de l'exercice courant (séquence
 * reconstituée via `phaseInitiale`/`phaseApres`), jamais une séquence fixe commune aux 10 familles
 * (structurellement disjointes, voir en-tête de `typesLimitesExponentielles.ts`). Statut par
 * `detailsPartiels[phase].revele`, pas par score (même garde-fou que `calculerRecapitulatifLimitesExponentielles`
 * ci-dessus). */
export function calculerSegmentsProgressionLimitesExponentielles(etat: EtatSessionLimiteExponentielle) {
  const sequence = sequenceDesPhases(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    const detail = etat.detailsPartiels[phase];
    if (detail === undefined) return "a-venir" as const;
    return detail.revele ? ("revele" as const) : ("correcte" as const);
  });
}
