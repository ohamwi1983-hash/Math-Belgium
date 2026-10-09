import { calculerHypergeo } from "../probabiliteHypergeometrique/familleA";
import type { ExerciceEsperanceB, ExerciceEsperanceB_ContexteDirect, ExerciceEsperanceB_Hypergeometrique, IssueContexteEsperanceB, LigneLoiB } from "../../core6e/variablesDiscretesEsperance.types";
import { genererPoids, pgcd, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Construire une loi de probabilité et calculer
 * l'espérance") de `6gen49`. 2 sous-types équiprobables.
 *
 * ============================================================================
 * **Sous-type "hypergéométrique" — RÉUTILISE `calculerHypergeo` de `6gen47`, jamais réimplémenté**
 * ============================================================================
 * `calculerHypergeo(N,K,n,k)` (`generateurs6e/probabiliteHypergeometrique/familleA.ts`) calcule
 * DÉJÀ `C(K,k)·C(N-K,n-k)/C(N,n)` en s'appuyant sur `coefficientBinomial`
 * (`generateurs6e/combinatoire.ts`) — importé ici TEL QUEL (Couche A ↔ Couche A libre entre
 * générateurs 6e, CLAUDE.md). X = nombre de succès parmi `n` tirages sans remise dans une
 * population `N` dont `K` succès ; `loi` couvre le support COMPLET
 * `k∈[kMin,kMax]=[max(0,n-(N-K)),min(K,n)]` (mêmes bornes que le sous-type "exactement" de
 * `6gen47`) — les probabilités somment donc à 1 EXACTEMENT, jamais approximativement (vérifié par
 * test, `familleB.test.ts`).
 *
 * `N`/`K`/`n` tirés dans des plages modestes (population ≤16, tirage ≤4) choisies pour que le
 * support `[kMin,kMax]` compte TOUJOURS au moins 3 valeurs (retirage sinon) — une loi à 2 valeurs
 * rendrait le calcul d'espérance trivial (à peine plus qu'une moyenne pondérée à 2 termes).
 *
 * ============================================================================
 * **Sous-type "contexte direct"**
 * ============================================================================
 * Une petite banque de 3 contextes (urne de boules numérotées, dé à faces gagnantes/perdantes,
 * loterie à billets) — chaque résultat porte un gain (`valeur`, DÉJÀ CONNU du contexte, affiché en
 * données) et un effectif (`ps` = effectif/total, à calculer par l'élève). Effectifs tirés via
 * `genererPoids` (mêmes "décimales propres" que famille A).
 */

interface GabaritIssueB {
  label: string;
  valeur: number;
}

interface GabaritContexteB {
  phraseContexte: string[];
  issues: GabaritIssueB[];
}

function gabaritsContexteB(): GabaritContexteB[] {
  const gainA = tirerEntier(3, 8);
  const gainB = tirerEntier(1, 4);
  const perteC = tirerEntier(1, 3);
  const gainLoto = tirerEntier(10, 25);
  const perteBillet = tirerEntier(1, 3);
  return [
    {
      phraseContexte: ["\\text{Une urne contient des boules de 3 couleurs.}", "\\text{Chaque couleur rapporte un gain fixe.}"],
      issues: [
        { label: "Boule rouge", valeur: gainA },
        { label: "Boule bleue", valeur: gainB },
        { label: "Boule verte", valeur: -perteC },
      ],
    },
    {
      phraseContexte: ["\\text{Un dé truqué à 4 faces possibles.}", "\\text{Chaque face rapporte un gain fixe.}"],
      issues: [
        { label: "Face 1", valeur: gainA },
        { label: "Face 2", valeur: gainB },
        { label: "Face 3", valeur: 0 },
        { label: "Face 4", valeur: -perteC },
      ],
    },
    {
      phraseContexte: ["\\text{Une loterie propose 3 types de billets.}", "\\text{Chaque type rapporte un gain fixe.}"],
      issues: [
        { label: "Billet gagnant", valeur: gainLoto },
        { label: "Billet remboursé", valeur: 0 },
        { label: "Billet perdant", valeur: -perteBillet },
      ],
    },
  ];
}

const DENOMINATEUR_POIDS_B = 20;

export function construireContexteDirect(): ExerciceEsperanceB_ContexteDirect {
  const gabarit = tirerParmi(gabaritsContexteB());
  const m = gabarit.issues.length;
  const effectifs = genererPoids(m, DENOMINATEUR_POIDS_B);
  const totalEffectifs = DENOMINATEUR_POIDS_B;

  const issues: IssueContexteEsperanceB[] = gabarit.issues.map((g, i) => ({ label: g.label, valeur: g.valeur, effectif: effectifs[i] }));
  const loi: LigneLoiB[] = issues.map((issue) => {
    const d = pgcd(issue.effectif, totalEffectifs);
    return { valeur: issue.valeur, probabiliteNumerateur: issue.effectif / d, probabiliteDenominateur: totalEffectifs / d, probabilite: issue.effectif / totalEffectifs };
  });
  const esperance = loi.reduce((acc, ligne) => acc + ligne.valeur * ligne.probabilite, 0);

  return { famille: "B", sousType: "contexteDirect", phraseContexte: gabarit.phraseContexte, issues, totalEffectifs, loi, esperance };
}

const ESSAIS_MAX = 40;

function construireHypergeoUneFois(): ExerciceEsperanceB_Hypergeometrique {
  const N = tirerEntier(9, 16);
  const K = tirerEntier(3, Math.min(7, N - 2));
  const n = tirerEntier(2, Math.min(4, N - 1));
  const kMin = Math.max(0, n - (N - K));
  const kMax = Math.min(K, n);

  const loi: LigneLoiB[] = [];
  for (let k = kMin; k <= kMax; k++) {
    const { numerateurFacteur1, numerateurFacteur2, denominateur, probabilite } = calculerHypergeo(N, K, n, k);
    const numerateur = numerateurFacteur1 * numerateurFacteur2;
    const d = pgcd(numerateur, denominateur);
    loi.push({ valeur: k, probabiliteNumerateur: numerateur === 0 ? 0 : numerateur / d, probabiliteDenominateur: numerateur === 0 ? denominateur : denominateur / d, probabilite });
  }
  const esperance = loi.reduce((acc, ligne) => acc + ligne.valeur * ligne.probabilite, 0);

  return { famille: "B", sousType: "hypergeometrique", N, K, n, loi, esperance };
}

export function construireHypergeometrique(): ExerciceEsperanceB_Hypergeometrique {
  let dernier: ExerciceEsperanceB_Hypergeometrique | null = null;
  for (let essai = 0; essai < ESSAIS_MAX; essai++) {
    const exercice = construireHypergeoUneFois();
    dernier = exercice;
    if (exercice.loi.length >= 3) return exercice;
  }
  /* c8 ignore next */
  return dernier as ExerciceEsperanceB_Hypergeometrique;
}

export function construireFamilleB(): ExerciceEsperanceB {
  return tirerEntier(0, 1) === 0 ? construireContexteDirect() : construireHypergeometrique();
}
