import type { ContexteBinomialeA, ExerciceBinomialeA, StrategieBinomialeA, TypeQuestionBinomialeA } from "../../core6e/binomialeSequenceOrdonnee.types";
import { coefficientBinomial } from "../combinatoire";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération famille A ("Probabilité binomiale") pour `6gen48`. `n` épreuves
 * indépendantes identiques, probabilité de succès `p` constante.
 *
 * ============================================================================
 * **CONSOLIDATION de `6gen33` famille B — lire avant de modifier ce fichier**
 * ============================================================================
 * `generateurs6e/probabilitesProblemes/familleB.ts` (chapitre "Probabilités", 6gen33) traitait déjà
 * `P(X=k)=C(n,k)p^k(1-p)^{n-k}` (sa propre fonction `probExactementK`, sa propre redéfinition LOCALE
 * de `coefficientBinomial`) pour `n∈{3,4,5}`, avec `k` toujours donné (jamais demandé à l'élève de
 * l'identifier) et seulement 2 variantes d'écran 3 (`auMoinsK`/`unDeChaqueResultat`). Ce fichier
 * REPREND la même formule mais l'ÉTEND :
 *   - `n∈{4,...,10}` (plage élargie, mission) ;
 *   - RÉUTILISE `coefficientBinomial` du fichier fondation `generateurs6e/combinatoire.ts` (celui de
 *     6gen43/44, PAS celui, local et non partagé, de `probabilitesProblemes/familleB.ts` — voir
 *     l'en-tête de `combinatoire.ts`, "Pourquoi ne PAS réutiliser..." pour la justification complète
 *     de cette distinction, qui s'applique ici À L'IDENTIQUE) ;
 *   - 5 types de question ("exactement"/"au moins"/"au plus"/"aucun"/"tous", contre 3 chez 6gen33 —
 *     "exactement" et "aucun"/"tous" n'existaient pas encore comme questions À PART ENTIÈRE) ;
 *   - AJOUTE un écran de stratégie explicite (écran 1 : "un seul terme" / "une somme" / "un
 *     complément") — 6gen33 ne demandait jamais à l'élève d'IDENTIFIER la stratégie, seulement de
 *     l'EXÉCUTER. C'est la vraie nouveauté pédagogique de ce générateur par rapport à 6gen33.
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — `6gen50` ("loi binomiale", pas encore construit) — lire avant de
 * modifier ce fichier**
 * ============================================================================
 * `6gen50` réutilise EXPLICITEMENT (spec de mission) la machinerie binomiale de cette famille A.
 * Fonctions PENSÉES pour cette réutilisation, exportées séparément d'un unique closure monolithique
 * (mirroir `moteur6e/verificationProbabilites.ts`, "LA brique réutilisable" documentée en en-tête) :
 *   - `probabiliteExactement(n, p, k): number` — LE calcul de référence `P(X=k)`, sans aucun état
 *     d'exercice autour. Fonction PURE, aucune dépendance à `ContexteBinomialeA`/génération
 *     aléatoire — c'est la fonction que `6gen50` doit importer directement pour toute vérité de
 *     référence "loi binomiale".
 *   - `determinerStrategieA(typeQuestion, n, k): StrategieBinomialeA` — dérive la stratégie d'un
 *     couple (question, k) déjà choisi, sans tirer quoi que ce soit au hasard — utile à `6gen50` si
 *     son propre écran de stratégie a besoin de la même classification sans repasser par la
 *     génération aléatoire de CE fichier.
 *   - `construireAvecTypeQuestion(n, p, typeQuestion): ExerciceBinomialeA` — construction
 *     DÉTERMINISTE (n/p/typeQuestion fixés, seul `k` — quand applicable — reste tiré aléatoirement
 *     dans sa plage valide) ; utilisée par `CATALOGUE_VARIANTES`/`construireAvecVarianteId`
 *     ci-dessous ET directement réutilisable par un futur générateur qui voudrait piloter n/p/type
 *     sans repasser par tout `genererFamilleA`.
 * `n∈{4,...,10}` et `CANDIDATS_P` restent des choix DE CE générateur (pédagogie 6gen48) — un
 * `6gen50` avec des besoins différents (n/p plus larges) doit passer ses propres valeurs à
 * `probabiliteExactement`/`construireAvecTypeQuestion`, jamais dupliquer la formule.
 */

const CONTEXTES_A: readonly ContexteBinomialeA[] = [
  { id: "tir", texte: "Un archer tire plusieurs flèches de manière indépendante, chaque tir ayant la même probabilité de succès.", labelSucces: "atteint la cible" },
  { id: "penalty", texte: "Un footballeur tire plusieurs penalties de manière indépendante, chaque tir ayant la même probabilité de succès.", labelSucces: "marque le but" },
  { id: "pileFace", texte: "On lance plusieurs fois une pièce équilibrée, les lancers étant indépendants.", labelSucces: "tombe sur pile" },
  { id: "vraiFaux", texte: "Un élève répond au hasard à plusieurs questions vrai/faux indépendantes.", labelSucces: "répond correctement" },
  { id: "sexe", texte: "Dans une famille, chaque naissance est indépendante des autres, avec la même probabilité pour chaque sexe.", labelSucces: "est une fille" },
];

const VALEURS_N: readonly number[] = [4, 5, 6, 7, 8, 9, 10];
/** `0,5` répété plusieurs fois — "le plus fréquent" (mission), pour les contextes équiprobables
 * (pile/face, vrai/faux, répartition par sexe) COMME pour un contexte à probabilité donnée
 * explicitement dans l'énoncé (tir/penalty). */
const CANDIDATS_P: readonly number[] = [0.5, 0.5, 0.5, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8];
const TYPES_QUESTION: readonly TypeQuestionBinomialeA[] = ["exactement", "auMoins", "auPlus", "aucun", "tous"];

/** LA fonction de référence — voir en-tête pour le contrat de réutilisation `6gen50`. */
export function probabiliteExactement(n: number, p: number, k: number): number {
  return coefficientBinomial(n, k) * p ** k * (1 - p) ** (n - k);
}

function sequence(debut: number, fin: number): number[] {
  const r: number[] = [];
  for (let i = debut; i <= fin; i++) r.push(i);
  return r;
}

/** Dérive la stratégie d'un couple (question, k) déjà choisi — voir en-tête pour le contrat de
 * réutilisation `6gen50`. `k` doit déjà respecter les bornes attendues pour `typeQuestion` (voir
 * `construireAvecTypeQuestion`, seul appelant interne). */
export function determinerStrategieA(typeQuestion: TypeQuestionBinomialeA, n: number, k: number): StrategieBinomialeA {
  if (typeQuestion === "exactement" || typeQuestion === "aucun" || typeQuestion === "tous") return "termeUnique";
  if (typeQuestion === "auMoins") return k === 1 ? "complement" : "somme";
  // "auPlus"
  return k === n - 1 ? "complement" : "somme";
}

/** Construction déterministe (`n`/`p`/`typeQuestion` fixés, `k` — quand applicable — tiré
 * aléatoirement dans sa plage valide) — voir en-tête pour le contrat de réutilisation `6gen50` et
 * `CATALOGUE_VARIANTES`/`construireAvecVarianteId` pour l'usage dev-panel. */
export function construireAvecTypeQuestion(n: number, p: number, typeQuestion: TypeQuestionBinomialeA): ExerciceBinomialeA {
  const contexte = tirerParmi(CONTEXTES_A);
  let k: number;
  let strategie: StrategieBinomialeA;
  let termesACalculer: number[];

  switch (typeQuestion) {
    case "exactement": {
      k = tirerEntier(1, n - 1);
      strategie = "termeUnique";
      termesACalculer = [k];
      break;
    }
    case "aucun": {
      k = 0;
      strategie = "termeUnique";
      termesACalculer = [0];
      break;
    }
    case "tous": {
      k = n;
      strategie = "termeUnique";
      termesACalculer = [n];
      break;
    }
    case "auMoins": {
      const utiliserComplement = n <= 4 ? true : tirerParmi([true, false]);
      if (utiliserComplement) {
        k = 1;
        strategie = "complement";
        termesACalculer = [0];
      } else {
        // Somme directe, k proche de n (2 à 3 termes) — "k petit" au sens "peu de termes à
        // additionner" (spec), jamais un k littéralement petit ici (voir en-tête classe).
        const nbTermes = Math.min(tirerEntier(2, 3), n - 2);
        k = n - nbTermes + 1;
        strategie = "somme";
        termesACalculer = sequence(k, n);
      }
      break;
    }
    default: {
      // "auPlus"
      const utiliserComplement = n <= 4 ? true : tirerParmi([true, false]);
      if (utiliserComplement) {
        k = n - 1;
        strategie = "complement";
        termesACalculer = [n];
      } else {
        const nbTermes = Math.min(tirerEntier(2, 3), n - 2);
        k = nbTermes - 1;
        strategie = "somme";
        termesACalculer = sequence(0, k);
      }
      break;
    }
  }

  const valeursTermes = termesACalculer.map((i) => probabiliteExactement(n, p, i));
  let resultatFinal: number;
  if (strategie === "termeUnique") resultatFinal = valeursTermes[0];
  else if (strategie === "complement") resultatFinal = 1 - valeursTermes[0];
  else resultatFinal = valeursTermes.reduce((acc, v) => acc + v, 0);

  return { famille: "A", contexte, n, p, k, typeQuestion, strategie, termesACalculer, valeursTermes, resultatFinal };
}

export function genererFamilleA(): ExerciceBinomialeA {
  const n = tirerParmi(VALEURS_N);
  const p = tirerParmi(CANDIDATS_P);
  const typeQuestion = tirerParmi(TYPES_QUESTION);
  return construireAvecTypeQuestion(n, p, typeQuestion);
}
