import type { ContexteTestIndependance, DescripteursTable, ExerciceFamilleB, ExerciceFamilleBReconstruire, ExerciceFamilleBTableauDonne, ExerciceFamilleBTestIndependance, MethodeTestIndependance, TypeQuestionTable, VerdictTestIndependance } from "../../core6e/independanceBayes.types";

/**
 * Couche A (6e) — génération famille B ("Lire un tableau à double entrée de données réelles")
 * pour `6gen32`. 3 sous-types — voir `core6e/independanceBayes.types.ts` pour le contrat détaillé de
 * chacun.
 *
 * **Pourquoi le tableau 2×2 de `6gen30` familleA.ts n'est PAS réutilisé ici** : ce générateur a
 * besoin d'un tableau GÉNÉRIQUE R×C (3×3 pour "tableauDonne", 3×2 pour "tableauReconstruire") — le
 * générateur `6gen30` est spécifique à 2×2 (`nA`/`nB`/`nAetB`/`denominateur`, 4 champs scalaires
 * nommés, jamais un tableau `number[][]`) : généraliser ce format à R×C changerait sa forme même,
 * ce qui reviendrait à le réécrire plutôt qu'à le réutiliser — d'où `TableauDouble`
 * (`core6e/independanceBayes.types.ts`), un contrat NOUVEAU mais élémentaire (`cellules: number[][]`
 * + libellés), écrit une fois ici.
 */

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

// ============================================================================
// Sous-type "testIndependance" — tableau 2×2, incompatibles / indépendants / ni l'un ni l'autre.
// (Remplace l'ancien « histogramme avec interpolation », hors cours — audit 6e ch. 6.)
// ============================================================================

const CONTEXTES_TEST_INDEPENDANCE: readonly ContexteTestIndependance[] = [
  { id: "loisirs", texte: "On interroge les élèves d'une école sur leurs loisirs ; le tableau donne les effectifs. On choisit un élève au hasard.", definitionA: "l'élève pratique un sport en club", definitionB: "l'élève joue d'un instrument de musique" },
  { id: "magasin", texte: "Un magasin classe les clients d'une journée ; le tableau donne les effectifs. On choisit un client au hasard.", definitionA: "le client a acheté un article en promotion", definitionB: "le client a payé par carte" },
  { id: "quartier", texte: "Une enquête est menée auprès des habitants d'un quartier ; le tableau donne les effectifs. On choisit un habitant au hasard.", definitionA: "l'habitant possède une voiture", definitionB: "l'habitant possède un vélo" },
];

/** Écart relatif minimal |P(A∩B) − P(A)·P(B)| pour le cas « ni l'un ni l'autre » : jamais un tableau
 * « presque indépendant » où la différence se perdrait dans un arrondi. */
const ECART_MINIMAL_NI = 0.02;

function tableauIndependant(): [[number, number], [number, number]] {
  for (let tentative = 0; tentative < 200; tentative++) {
    const a = tirerEntier(1, 5);
    const b = tirerEntier(1, 5);
    const c = tirerEntier(1, 5);
    const d = tirerEntier(1, 5);
    const base = (a + b) * (c + d);
    const mMin = Math.ceil(40 / base);
    const mMax = Math.floor(300 / base);
    if (mMin > mMax) continue;
    const m = tirerEntier(Math.max(mMin, 2), Math.max(mMax, 2));
    if (m * base > 300) continue;
    return [[m * a * c, m * a * d], [m * b * c, m * b * d]];
  }
  return [[12, 18], [28, 42]];
}

function tableauIncompatible(): [[number, number], [number, number]] {
  return [[0, tirerEntier(8, 60)], [tirerEntier(8, 60), tirerEntier(8, 60)]];
}

function tableauNiLUnNiLAutre(): [[number, number], [number, number]] {
  for (let tentative = 0; tentative < 500; tentative++) {
    const cellules: [[number, number], [number, number]] = [[tirerEntier(5, 60), tirerEntier(5, 60)], [tirerEntier(5, 60), tirerEntier(5, 60)]];
    const [[x, y], [z, t]] = cellules;
    const n = x + y + z + t;
    const ecart = Math.abs(x / n - ((x + y) / n) * ((x + z) / n));
    if (x * n === (x + y) * (x + z) || ecart < ECART_MINIMAL_NI) continue;
    return cellules;
  }
  return [[10, 30], [30, 20]];
}

/** Construction déterministe (méthode et verdict fixables) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Verdict tiré de façon ÉQUIPROBABLE sinon : l'élève ne peut pas
 * deviner la réponse « par habitude ». */
export function construireFamilleBTestIndependance(methode: MethodeTestIndependance, verdict?: VerdictTestIndependance): ExerciceFamilleBTestIndependance {
  const v = verdict ?? tirerParmi(VERDICTS_TEST);
  const cellules = v === "independants" ? tableauIndependant() : v === "incompatibles" ? tableauIncompatible() : tableauNiLUnNiLAutre();
  return { famille: "B", sousType: "testIndependance", contexte: tirerParmi(CONTEXTES_TEST_INDEPENDANCE), cellules, methode };
}

const VERDICTS_TEST: readonly VerdictTestIndependance[] = ["incompatibles", "independants", "ni"];

export function genererFamilleBTestIndependance(): ExerciceFamilleBTestIndependance {
  return construireFamilleBTestIndependance(tirerParmi(["produit", "conditionnelle"] as const));
}

// ============================================================================
// Sous-type "grand tableau donné" — table 3×3 déjà complète.
// ============================================================================

/** `descripteurs` : de quoi formuler la question en français (« qu'il soit de niveau faible »,
 * « parmi les élèves pratiquant le football ») SANS annoncer la nature de la probabilité (jointe,
 * marginale, conditionnelle) — c'est à l'élève de la reconnaître (audit 6e ch. 6). */
const CONTEXTES_TABLEAU_DONNE: readonly { texte: string; libelleLignes: string[]; libelleColonnes: string[]; descripteurs: DescripteursTable }[] = [
  {
    texte: "Le tableau suivant présente la répartition d'élèves d'une école selon leur niveau scolaire et le sport qu'ils pratiquent.",
    libelleLignes: ["Niveau faible", "Niveau moyen", "Niveau élevé"],
    libelleColonnes: ["Football", "Natation", "Aucun sport"],
    descripteurs: {
      individu: "un élève",
      pronom: "il",
      lignes: [
        { sujet: "soit de niveau faible", groupe: "élèves de niveau faible" },
        { sujet: "soit de niveau moyen", groupe: "élèves de niveau moyen" },
        { sujet: "soit de niveau élevé", groupe: "élèves de niveau élevé" },
      ],
      colonnes: [
        { sujet: "pratique le football", groupe: "élèves qui pratiquent le football" },
        { sujet: "pratique la natation", groupe: "élèves qui pratiquent la natation" },
        { sujet: "ne pratique aucun sport", groupe: "élèves qui ne pratiquent aucun sport" },
      ],
    },
  },
  {
    texte: "Le tableau suivant présente la répartition de clients d'un magasin selon leur tranche d'âge et le moyen de paiement utilisé.",
    libelleLignes: ["Moins de 25 ans", "25 à 50 ans", "Plus de 50 ans"],
    libelleColonnes: ["Carte", "Espèces", "Virement"],
    descripteurs: {
      individu: "un client",
      pronom: "il",
      lignes: [
        { sujet: "ait moins de 25 ans", groupe: "clients de moins de 25 ans" },
        { sujet: "ait entre 25 et 50 ans", groupe: "clients de 25 à 50 ans" },
        { sujet: "ait plus de 50 ans", groupe: "clients de plus de 50 ans" },
      ],
      colonnes: [
        { sujet: "paie par carte", groupe: "clients qui paient par carte" },
        { sujet: "paie en espèces", groupe: "clients qui paient en espèces" },
        { sujet: "paie par virement", groupe: "clients qui paient par virement" },
      ],
    },
  },
];

const TYPES_QUESTION_TABLE: readonly TypeQuestionTable[] = ["jointe", "margLigne", "margColonne", "condLigneSachantColonne", "condColonneSachantLigne"];

/** Construction déterministe (typeQuestion fixé) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Cellules tirées librement (aucune contrainte de cohérence à
 * satisfaire — un tableau déjà DONNÉ, contrairement au sous-type "reconstruire"). */
export function construireFamilleBTableauDonne(typeQuestion: TypeQuestionTable): ExerciceFamilleBTableauDonne {
  const { texte, libelleLignes, libelleColonnes, descripteurs } = tirerParmi(CONTEXTES_TABLEAU_DONNE);
  const cellules = libelleLignes.map(() => libelleColonnes.map(() => tirerEntier(8, 40)));
  const ligneCible = tirerEntier(0, libelleLignes.length - 1);
  const colonneCible = tirerEntier(0, libelleColonnes.length - 1);
  return { famille: "B", sousType: "tableauDonne", contexte: { texte, descripteurs }, table: { libelleLignes: [...libelleLignes], libelleColonnes: [...libelleColonnes], cellules }, typeQuestion, ligneCible, colonneCible };
}

export function genererFamilleBTableauDonne(): ExerciceFamilleBTableauDonne {
  return construireFamilleBTableauDonne(tirerParmi(TYPES_QUESTION_TABLE));
}

// ============================================================================
// Sous-type "reconstruire depuis des %" — table 3×2 à taille FIXE.
// ============================================================================

const CONTEXTES_RECONSTRUIRE: readonly { texte: string; libelleLignes: [string, string, string]; libelleColonnes: [string, string]; descripteurs: DescripteursTable }[] = [
  {
    texte: "Un club sportif interroge ses 200 membres selon leur tranche d'âge et leur pratique en compétition.",
    libelleLignes: ["12-14 ans", "15-17 ans", "18 ans et plus"],
    libelleColonnes: ["Pratique en compétition", "Ne pratique pas en compétition"],
    descripteurs: {
      individu: "un membre",
      pronom: "il",
      lignes: [
        { sujet: "ait entre 12 et 14 ans", groupe: "membres de 12 à 14 ans" },
        { sujet: "ait entre 15 et 17 ans", groupe: "membres de 15 à 17 ans" },
        { sujet: "ait 18 ans ou plus", groupe: "membres de 18 ans et plus" },
      ],
      colonnes: [
        { sujet: "pratique en compétition", groupe: "membres qui pratiquent en compétition" },
        { sujet: "ne pratique pas en compétition", groupe: "membres qui ne pratiquent pas en compétition" },
      ],
    },
  },
  {
    texte: "Une entreprise de 200 salariés répartit son personnel selon le service et le télétravail.",
    libelleLignes: ["Service commercial", "Service technique", "Service administratif"],
    libelleColonnes: ["Pratique le télétravail", "Ne pratique pas le télétravail"],
    descripteurs: {
      individu: "un salarié",
      pronom: "il",
      lignes: [
        { sujet: "travaille au service commercial", groupe: "salariés du service commercial" },
        { sujet: "travaille au service technique", groupe: "salariés du service technique" },
        { sujet: "travaille au service administratif", groupe: "salariés du service administratif" },
      ],
      colonnes: [
        { sujet: "pratique le télétravail", groupe: "salariés qui pratiquent le télétravail" },
        { sujet: "ne pratique pas le télétravail", groupe: "salariés qui ne pratiquent pas le télétravail" },
      ],
    },
  },
];

const TOTAL_RECONSTRUIRE = 200;
const CANDIDATS_POURCENTAGE_LIGNE: readonly number[] = [20, 30, 40];
const CANDIDATS_POURCENTAGE_REUSSITE: readonly number[] = [20, 30, 40, 50, 60, 70, 80];
const CANDIDATS_POURCENTAGE_GLOBAL: readonly number[] = [20, 30, 40, 50, 60];

/** Construction déterministe (typeQuestionFinale fixé) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Retirage borné (200 tentatives) tant que la cellule colonne-1 de la
 * ligne 3 (déduite par différence, `pourcentageReussiteGlobale × total − cell00 − cell10`) ne tombe
 * pas STRICTEMENT entre 0 et le total de la ligne 3 — sinon la case colonne-2 correspondante
 * deviendrait négative ou nulle (tableau dégénéré), même piège de conception que `6gen30`
 * `genererEffectifs`. */
export function construireFamilleBReconstruire(typeQuestionFinale: TypeQuestionTable): ExerciceFamilleBReconstruire {
  const total = TOTAL_RECONSTRUIRE;
  for (let tentative = 0; tentative < 200; tentative++) {
    const a = tirerParmi(CANDIDATS_POURCENTAGE_LIGNE);
    const b = tirerParmi(CANDIDATS_POURCENTAGE_LIGNE);
    const c = 100 - a - b;
    if (c < 20 || c > 50) continue;
    const pourcentageLigne: [number, number, number] = [a, b, c];
    const pourcentageReussiteLigne1 = tirerParmi(CANDIDATS_POURCENTAGE_REUSSITE);
    const pourcentageReussiteLigne2 = tirerParmi(CANDIDATS_POURCENTAGE_REUSSITE);
    const rowTotal2 = (total * c) / 100;
    const cell00 = (total * a * pourcentageReussiteLigne1) / 10000;
    const cell10 = (total * b * pourcentageReussiteLigne2) / 10000;
    const pourcentageReussiteGlobale = tirerParmi(CANDIDATS_POURCENTAGE_GLOBAL);
    const col1Total = (total * pourcentageReussiteGlobale) / 100;
    const cell20 = col1Total - cell00 - cell10;
    if (cell20 <= 0 || cell20 >= rowTotal2) continue;
    const { texte, libelleLignes, libelleColonnes, descripteurs } = tirerParmi(CONTEXTES_RECONSTRUIRE);
    const ligneCibleFinale = tirerEntier(0, 2);
    const colonneCibleFinale = tirerEntier(0, 1);
    return { famille: "B", sousType: "tableauReconstruire", contexte: { texte, libelleLignes, libelleColonnes, descripteurs }, total, pourcentageLigne, pourcentageReussiteLigne1, pourcentageReussiteLigne2, pourcentageReussiteGlobale, typeQuestionFinale, ligneCibleFinale, colonneCibleFinale };
  }
  throw new Error("construireFamilleBReconstruire : aucun jeu de pourcentages valide trouvé après 200 tentatives");
}

export function genererFamilleBReconstruire(): ExerciceFamilleBReconstruire {
  return construireFamilleBReconstruire(tirerParmi(TYPES_QUESTION_TABLE));
}

// ============================================================================
// Point d'entrée famille B.
// ============================================================================

/** Tirage ÉQUIPROBABLE du sous-type (testIndependance / tableauDonne / tableauReconstruire). */
export function genererFamilleB(): ExerciceFamilleB {
  const sousType = tirerParmi(["testIndependance", "tableauDonne", "tableauReconstruire"] as const);
  if (sousType === "testIndependance") return genererFamilleBTestIndependance();
  if (sousType === "tableauDonne") return genererFamilleBTableauDonne();
  return genererFamilleBReconstruire();
}
