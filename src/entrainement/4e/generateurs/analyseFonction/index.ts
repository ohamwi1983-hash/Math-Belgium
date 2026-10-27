import type { Categorie, Exercice } from "../../core/generateur.types";
import type { ExerciceAnalyseFonction, GenerateurExerciceAnalyseFonction, TermeCoefficient } from "../../core/analyseFonction.types";
import { construireMiseEnEvidence } from "../secondDegre/categories/miseEnEvidence";
import { construireBinomeConjugue } from "../secondDegre/categories/binomeConjugue";
import { construireProduitRemarquable } from "../secondDegre/categories/produitRemarquable";
import { construireIrreductible } from "./construireIrreductible";
import { construireGrilleSigneVariation } from "./grilleSigneVariation";

/**
 * Section 1 de la spec : exclut explicitement la méthode générale (Δ) à la génération, pas
 * seulement à l'affichage — les 3 constructeurs réutilisés (secondDegre/categories) ne produisent
 * jamais cas_general par construction, donc aucun filtrage a posteriori n'est nécessaire.
 * `construireIrreductible` (4e catégorie, prompt-cas-non-factorisable.md) est équiprobable avec
 * les 3 autres — aucune n'est privilégiée.
 *
 * Plages `aRange`/`rRange` : élargies et signées suite à l'audit pilote (plus de comptage de
 * points, donc pratique répétée — les mêmes petits nombres positifs revenaient trop vite). Chaque
 * plage reste calibrée pour que le calcul resté à la charge de l'élève (yS = -a·r²/4 pour
 * `mise_en_evidence`, seul endroit où une vraie multiplication/division est nécessaire — `yS` vaut
 * `c` ou `0` dans les 2 autres) reste faisable sans calculatrice (ex. a=5,r=6 → 5·36/4 = 45).
 * `binomeConjugue`/`produitRemarquable` n'imposent aucun calcul équivalent à l'élève (yS = c ou 0),
 * d'où des plages plus larges. Ces 3 constructeurs sont partagés avec d'autres générateurs
 * (equationRationnelle, signesProduit, simplification, secondDegre, inequationRationnelle, non
 * audités) — leurs plages par défaut, utilisées par tous les autres appelants, restent inchangées.
 */
const construireMiseEnEvidenceEtendue = () => construireMiseEnEvidence({ aRange: [-5, 5], rRange: [-6, 6] });
const construireBinomeConjugueEtendu = () => construireBinomeConjugue({ aRange: [-6, 6], rMax: 8 });
const construireProduitRemarquableEtendu = () => construireProduitRemarquable({ aRange: [-6, 6], rRange: [-7, 7] });

const CONSTRUCTEURS: Array<() => Omit<Exercice, "formeAffichage">> = [
  construireMiseEnEvidenceEtendue,
  construireBinomeConjugueEtendu,
  construireProduitRemarquableEtendu,
  construireIrreductible,
];

function termesNonNuls(enonce: { a: number; b: number; c: number }): TermeCoefficient[] {
  const termes: TermeCoefficient[] = [];
  if (enonce.a !== 0) termes.push("a");
  if (enonce.b !== 0) termes.push("b");
  if (enonce.c !== 0) termes.push("c");
  return termes;
}

/** Fisher-Yates — ordre d'affichage mélangé des termes non nuls (section 2 de la spec). */
function melanger<T>(items: T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Catégories réellement productibles par CE générateur (convention RETROFIT-variantes-
 * generateurs.md) — les 3 techniques sans Δ réutilisées de l'exercice 1, plus `irreductible`
 * (native à cet exercice, voir CLAUDE.md section "4e catégorie — irreductible") ; jamais
 * `cas_general` ni `mise_en_evidence_generalisee`, exclues à la génération (section 1 de la spec).
 */
export type VarianteAnalyseFonctionId = Exclude<Categorie, "cas_general" | "mise_en_evidence_generalisee">;

export interface VarianteAnalyseFonction {
  id: VarianteAnalyseFonctionId;
  label: string;
}

/** Proposition à valider par l'utilisateur (voir RETROFIT-variantes-generateurs.md). */
export const CATALOGUE_VARIANTES: VarianteAnalyseFonction[] = [
  { id: "mise_en_evidence", label: "Mise en évidence (c=0)" },
  { id: "binome_conjugue", label: "Binôme conjugué (b=0, différence de deux carrés)" },
  { id: "produit_remarquable", label: "Produit remarquable (Δ=0, carré parfait)" },
  { id: "irreductible", label: "Irréductible (Δ<0, aucune racine réelle)" },
];

const CONSTRUCTEURS_PAR_ID: Record<VarianteAnalyseFonctionId, () => Omit<Exercice, "formeAffichage">> = {
  mise_en_evidence: construireMiseEnEvidenceEtendue,
  binome_conjugue: construireBinomeConjugueEtendu,
  produit_remarquable: construireProduitRemarquableEtendu,
  irreductible: construireIrreductible,
};

/**
 * Assemble l'`ExerciceAnalyseFonction` complet (xS/yS/ordreTermes/grilleSigneVariation) à partir
 * d'un P2 déjà construit — factorisé hors de `construireAvecVarianteId`/`genererExerciceAnalyseFonction`
 * pour que les deux partagent exactement la même logique d'assemblage, jamais dupliquée.
 */
function assemblerExercice(construit: Omit<Exercice, "formeAffichage">): ExerciceAnalyseFonction {
  const exercice: Exercice = { ...construit, formeAffichage: "canonique" };
  const { a, b, c } = exercice.enonce;
  const xS = -b / (2 * a);
  const yS = a * xS * xS + b * xS + c;

  /**
   * `construireGrilleSigneVariation` attend une paire de racines réelles ; pour "irreductible"
   * (Δ<0, aucune racine réelle — exercice.solution.racines vaut [NaN, NaN], jamais lu), on lui
   * passe `[xS, xS]` à la place. Ce n'est pas une approximation : la fonction traite déjà une
   * racine double comme une colonne unique avec `signeYS` au centre — et `signeYS` vaut ici
   * exactement `signeA` (propriété de Δ<0, voir construireIrreductible), donc la ligne de signe
   * obtenue est bien constante sur toute la largeur, sans jamais de "0" — exactement la structure
   * voulue pour une parabole qui ne touche jamais Ox. Verrouillé par un test dédié
   * (index.test.ts) qui compare cette grille à une grille construite indépendamment.
   */
  const racinesPourGrille: [number, number] = exercice.categorie === "irreductible" ? [xS, xS] : exercice.solution.racines;

  return {
    exercice,
    ordreTermes: melanger(termesNonNuls(exercice.enonce)),
    xS,
    yS,
    grilleSigneVariation: construireGrilleSigneVariation(exercice.enonce, racinesPourGrille, xS, yS),
  };
}

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md).
 */
export function construireAvecVarianteId(varianteId: VarianteAnalyseFonctionId): ExerciceAnalyseFonction {
  return assemblerExercice(CONSTRUCTEURS_PAR_ID[varianteId]());
}

/**
 * Implémentation de la Couche A pour "Analyse d'une fonction du second degré" : tire une des 4
 * variantes du catalogue (poids égal — 3 techniques sans Δ plus "irreductible", qui, elle, EST
 * définie par Δ<0), formeAffichage forcée à "canonique" bien qu'inutilisée — la
 * présentation de f(x) est entièrement portée par src/ui/formatAnalyseFonction.ts (ordreTermes),
 * jamais par formatEnonceAffichage. xS/yS calculés directement depuis enonce, indépendamment de la
 * catégorie.
 */
export const genererExerciceAnalyseFonction: GenerateurExerciceAnalyseFonction = () => {
  const index = Math.floor(Math.random() * CONSTRUCTEURS.length);
  return assemblerExercice(CONSTRUCTEURS[index]());
};
