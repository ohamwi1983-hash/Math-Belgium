import type { ClasseHistogramme, DemandeHistogramme, ExerciceFamilleB, ExerciceFamilleBHistogramme, ExerciceFamilleBReconstruire, ExerciceFamilleBTableauDonne, TypeQuestionTable } from "../../core6e/independanceBayes.types";

/**
 * Couche A (6e) — génération famille B ("Lire un tableau ou un histogramme de données réelles")
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
// Sous-type "histogramme avec interpolation".
// ============================================================================

const CONTEXTES_HISTOGRAMME: readonly { texte: string; variable: string; unite: string }[] = [
  { texte: "Voici la répartition des temps de trajet (en minutes) d'un échantillon d'élèves pour se rendre à l'école.", variable: "le temps de trajet", unite: "min" },
  { texte: "Voici la répartition des durées d'appel (en minutes) d'un échantillon de communications d'un centre d'appels.", variable: "la durée d'appel", unite: "min" },
  { texte: "Voici la répartition des masses (en kg) d'un échantillon de colis traités par un centre de tri.", variable: "la masse", unite: "kg" },
];

const LARGEUR_CLASSE = 10;

/** Construction déterministe (demande fixée) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Effectif de chaque classe toujours MULTIPLE de `LARGEUR_CLASSE`
 * (garantit que la portion interpolée `effectif × offset/largeur` reste toujours un entier exact,
 * jamais un flottant approximatif — voir `moteur6e/verificationIndependanceBayes.ts`). `cible`
 * choisie STRICTEMENT à l'intérieur d'une classe (offset dans [1, largeur-1]) — jamais sur une
 * borne (spec). */
export function construireFamilleBHistogramme(demande: DemandeHistogramme): ExerciceFamilleBHistogramme {
  const contexte = tirerParmi(CONTEXTES_HISTOGRAMME);
  const nombreClasses = tirerEntier(4, 5);
  const debutPremiere = tirerParmi([0, 10] as const);
  const classes: ClasseHistogramme[] = [];
  for (let i = 0; i < nombreClasses; i++) {
    const debut = debutPremiere + i * LARGEUR_CLASSE;
    const effectif = tirerEntier(1, 6) * LARGEUR_CLASSE;
    classes.push({ debut, fin: debut + LARGEUR_CLASSE, effectif });
  }
  const indexClasseCible = tirerEntier(0, nombreClasses - 1);
  const offset = tirerEntier(1, LARGEUR_CLASSE - 1);
  const cible = classes[indexClasseCible].debut + offset;
  return { famille: "B", sousType: "histogramme", contexte, classes, indexClasseCible, cible, demande };
}

const DEMANDES_HISTOGRAMME: readonly DemandeHistogramme[] = ["inferieur", "auMoins"];

export function genererFamilleBHistogramme(): ExerciceFamilleBHistogramme {
  return construireFamilleBHistogramme(tirerParmi(DEMANDES_HISTOGRAMME));
}

// ============================================================================
// Sous-type "grand tableau donné" — table 3×3 déjà complète.
// ============================================================================

const CONTEXTES_TABLEAU_DONNE: readonly { texte: string; libelleLignes: string[]; libelleColonnes: string[] }[] = [
  { texte: "Le tableau suivant présente la répartition d'élèves d'une école selon leur niveau scolaire et le sport qu'ils pratiquent.", libelleLignes: ["Niveau faible", "Niveau moyen", "Niveau élevé"], libelleColonnes: ["Football", "Natation", "Aucun sport"] },
  { texte: "Le tableau suivant présente la répartition de clients d'un magasin selon leur tranche d'âge et le moyen de paiement utilisé.", libelleLignes: ["Moins de 25 ans", "25 à 50 ans", "Plus de 50 ans"], libelleColonnes: ["Carte", "Espèces", "Virement"] },
];

const TYPES_QUESTION_TABLE: readonly TypeQuestionTable[] = ["jointe", "margLigne", "margColonne", "condLigneSachantColonne", "condColonneSachantLigne"];

/** Construction déterministe (typeQuestion fixé) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Cellules tirées librement (aucune contrainte de cohérence à
 * satisfaire — un tableau déjà DONNÉ, contrairement au sous-type "reconstruire"). */
export function construireFamilleBTableauDonne(typeQuestion: TypeQuestionTable): ExerciceFamilleBTableauDonne {
  const { texte, libelleLignes, libelleColonnes } = tirerParmi(CONTEXTES_TABLEAU_DONNE);
  const cellules = libelleLignes.map(() => libelleColonnes.map(() => tirerEntier(8, 40)));
  const ligneCible = tirerEntier(0, libelleLignes.length - 1);
  const colonneCible = tirerEntier(0, libelleColonnes.length - 1);
  return { famille: "B", sousType: "tableauDonne", contexte: { texte }, table: { libelleLignes: [...libelleLignes], libelleColonnes: [...libelleColonnes], cellules }, typeQuestion, ligneCible, colonneCible };
}

export function genererFamilleBTableauDonne(): ExerciceFamilleBTableauDonne {
  return construireFamilleBTableauDonne(tirerParmi(TYPES_QUESTION_TABLE));
}

// ============================================================================
// Sous-type "reconstruire depuis des %" — table 3×2 à taille FIXE.
// ============================================================================

const CONTEXTES_RECONSTRUIRE: readonly { texte: string; libelleLignes: [string, string, string]; libelleColonnes: [string, string] }[] = [
  { texte: "Un club sportif interroge ses 200 membres selon leur tranche d'âge et leur pratique en compétition.", libelleLignes: ["12-14 ans", "15-17 ans", "18 ans et plus"], libelleColonnes: ["Pratique en compétition", "Ne pratique pas en compétition"] },
  { texte: "Une entreprise de 200 salariés répartit son personnel selon le service et le télétravail.", libelleLignes: ["Service commercial", "Service technique", "Service administratif"], libelleColonnes: ["Pratique le télétravail", "Ne pratique pas le télétravail"] },
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
    const { texte, libelleLignes, libelleColonnes } = tirerParmi(CONTEXTES_RECONSTRUIRE);
    const ligneCibleFinale = tirerEntier(0, 2);
    const colonneCibleFinale = tirerEntier(0, 1);
    return { famille: "B", sousType: "tableauReconstruire", contexte: { texte, libelleLignes, libelleColonnes }, total, pourcentageLigne, pourcentageReussiteLigne1, pourcentageReussiteLigne2, pourcentageReussiteGlobale, typeQuestionFinale, ligneCibleFinale, colonneCibleFinale };
  }
  throw new Error("construireFamilleBReconstruire : aucun jeu de pourcentages valide trouvé après 200 tentatives");
}

export function genererFamilleBReconstruire(): ExerciceFamilleBReconstruire {
  return construireFamilleBReconstruire(tirerParmi(TYPES_QUESTION_TABLE));
}

// ============================================================================
// Point d'entrée famille B.
// ============================================================================

/** Tirage ÉQUIPROBABLE du sous-type (histogramme / tableauDonne / tableauReconstruire). */
export function genererFamilleB(): ExerciceFamilleB {
  const sousType = tirerParmi(["histogramme", "tableauDonne", "tableauReconstruire"] as const);
  if (sousType === "histogramme") return genererFamilleBHistogramme();
  if (sousType === "tableauDonne") return genererFamilleBTableauDonne();
  return genererFamilleBReconstruire();
}
