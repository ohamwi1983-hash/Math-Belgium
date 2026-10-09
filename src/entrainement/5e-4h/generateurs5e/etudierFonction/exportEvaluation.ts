import type { ClassificationExtremum, RacineEtudeLocale } from "../../core5e/etudeLocale.types";
import type { ExerciceEtudierFonction, ExerciceRationnelleAO } from "../../core5e/etudierFonction.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import {
  CONSIGNE_GENERALE_ETUDIER_FONCTION,
  formatFDeXLatex,
  formatFPrimeDeXLatex,
  formatFSecondeDeXLatex,
  formatRacineLatex,
  formatReponseAttenduePhaseLatex,
} from "../../ui5e/formatEtudierFonction";
import { formatReponseAttenduePhaseLatex as formatReponseAttenduePhaseLatexEtudeLocale } from "../../ui5e/formatEtudeLocale";
import { valeurFEtudeLocale } from "../etudeLocale/index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudierFonction, valeurFRationnelleAO } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudierFonction>` pour 5gen31 ("Étudier une
 * fonction", CAPSTONE — synthèse finale — du chapitre "Dérivées et applications", `App5gen31.tsx`)
 * — méthodologie de consolidation écrans→questions papier héritée de
 * `generateurs5e/etudeComplete/exportEvaluation.ts` (5gen24, même chapitre "précédent").
 *
 * **`f(x)` affiché UNE SEULE FOIS en tête de l'exercice** (`enteteFragments`), jamais répété
 * question par question — comme à l'écran (`ui5e/formatEtudierFonction.ts::formatTermesDonneesLatex`,
 * qui ne donne QUE f(x), jamais f'(x)/f''(x) à l'avance : contrairement à 5gen29, l'élève les dérive
 * lui-même). ⚠️ Piège `enteteFragments` (toujours rendu en mode KaTeX `displayMode:true` par
 * `assemblerEvaluationHtml.ts`) : UN SEUL fragment `latex()` (`formatFDeXLatex`), jamais plusieurs
 * petits fragments LaTeX entrelacés avec du texte — voir `generateurs5e/etudeComplete/exportEvaluation.ts`
 * pour le même motif déjà appliqué dans ce chapitre.
 *
 * **Consolidation du pipeline (8 écrans possibles, longueur variable UNIQUEMENT sur "domaine" —
 * sauté si le domaine n'est pas restreint, voir `moteur5e/typesEtudierFonction.ts`) en EXACTEMENT
 * 4 questions papier lettrées a) à d), TOUJOURS présentes (contrairement à 5gen24, dont le nombre de
 * questions varie 3-5 selon l'instance) :**
 * - a) "domaine" (si présent) + "limites" → « Détermine le domaine de définition de f, puis calcule
 *   les limites de f à chaque borne de son domaine et en ±∞ ; donne les équations des éventuelles
 *   asymptotes. » Le domaine est TOUJOURS affiché dans la correction (même ℝ, quand non restreint) —
 *   `formatReponseAttenduePhaseLatex(exercice, "domaine")` gère les 2 cas de façon identique (délègue
 *   à `domaineAttendu`/`formatEnsembleReelGuideLatex`, qui retourne "\mathbb{R}" quand le domaine
 *   n'est pas restreint), donc AUCUN test `possedeDomaineRestreint` nécessaire côté adaptateur (ce
 *   prédicat vit dans `moteur5e/`, jamais importé ici).
 * - b) "calculerFPrime" + "tableauFPrime" → « Calcule f'(x), construis son tableau de signes, et
 *   déduis-en les variations de f (nature de chaque zéro de f' : MAX/min/ni l'un ni l'autre). »
 * - c) "calculerFSeconde" + "tableauFSeconde" → « Calcule f''(x), construis son tableau de signes, et
 *   déduis-en la concavité de f (point d'inflexion ou non). »
 * - d) "graphique" (placement de points par tap à l'écran) → question papier « donne les coordonnées
 *   de chaque point remarquable puis trace l'allure du graphique » — RESYNTHÉTISÉ depuis les valeurs
 *   déjà connues des questions b)/c) (abscisses des extremums/inflexions) plus f(0), jamais un second
 *   calcul de dérivée.
 *
 * Écran "recap" IGNORÉ (purement présentationnel, aucun score/aucune nouvelle information — voir tête
 * de fichier de `moteur5e/typesEtudierFonction.ts` : "aucune nouvelle question").
 *
 * **Corrections RESYNTHÉTISÉES depuis les valeurs déjà connues de l'instance, jamais recalculées
 * indépendamment :**
 * - Branche "etudeLocale" (`exercice.noyau: ExerciceEtudeLocale`) : réutilise TEL QUEL
 *   `formatReponseAttenduePhaseLatex` de `ui5e/formatEtudeLocale.ts` (5gen29 — présentation ↔
 *   présentation, exactement le même renvoi que fait déjà `ui5e/formatEtudierFonction.ts` pour
 *   `formatFDeXLatex`/`formatFPrimeDeXLatex`/`formatFSecondeDeXLatex`), appliqué à `exercice.noyau`,
 *   pour les phases "domaine"/"tableauFPrime"/"tableauFSeconde" — jamais réimplémenté.
 * - Branche "rationnelleAO" : `racinesFPrime`/`classificationFPrime` déjà présentes TELLES QUELLES
 *   sur l'instance (`core5e/etudierFonction.types.ts`) — seule leur mise en forme LaTeX (paire
 *   racine/nature) est répliquée localement ci-dessous (`formatRacineAvecClassificationLocal`),
 *   TOUJOURS vide côté f'' (`racinesFSeconde` n'existe structurellement pas pour cette famille — voir
 *   commentaire de tête de `core5e/etudierFonction.types.ts` : "f''(x) ne s'annule JAMAIS ⟹ AUCUN
 *   point d'inflexion pour cette famille" — réaffirmé tel quel dans la correction c), jamais recalculé
 *   par une étude de signe indépendante).
 * - Question d) (points clés) : abscisses via `racinesFPrime`/`classificationFPrime` déjà connues
 *   (mêmes valeurs que la question b), ordonnées calculées avec les évaluateurs f(x) de Couche A déjà
 *   utilisés à la génération (`valeurFEtudeLocale`/`valeurFRationnelleAO`, importés de
 *   `generateurs5e/etudeLocale/index.ts` et `./index.ts` — Couche A ↔ Couche A, JAMAIS `moteur5e/`,
 *   même patron que `moteur5e/verificationEtudierFonction.ts::valeurF` qui dispatche sur les 2 mêmes
 *   fonctions mais les réplique côté Couche B ; ici on les réutilise directement côté Couche A, aucune
 *   duplication d'algorithme de vérification).
 *
 * **PAS `regroupable`** (voir la doc de `AdaptateurFeuilleExercices.regroupable`,
 * `export/genererFeuilleExercices.ts`) : cet adaptateur produit TOUJOURS 4 questions par instance (a
 * à d), à consignes dépendant implicitement des valeurs tirées (nombre de limites/asymptotes à
 * calculer, présence ou non d'extremums/points d'inflexion) — aucun des 2 cas requis par
 * `regroupable` (UNE SEULE question, consigne totalement générique) n'est satisfait.
 *
 * **Aucune zone de réponse fixe** (`reponse` en lignes vierges uniquement, jamais de tableau) — même
 * décision que `etudeComplete/exportEvaluation.ts` : pas de structure tabulaire imposée sur la copie,
 * l'élève reconstruit son propre tableau de signes dans l'espace laissé.
 */

// ============================================================================
// Réplique locale (JAMAIS `moteur5e/`) — dispatch f(x) par famille, à partir des évaluateurs de
// Couche A déjà utilisés à la génération. Même patron que `moteur5e/verificationEtudierFonction.ts`
// ::valeurF`, mais construit uniquement depuis des imports Couche A ↔ Couche A.
// ============================================================================

function valeurFLocal(exercice: ExerciceEtudierFonction, x: number): number {
  return exercice.famille === "rationnelleAO" ? valeurFRationnelleAO(exercice, x) : valeurFEtudeLocale(exercice.noyau, x);
}

function racinesFPrimeLocal(exercice: ExerciceEtudierFonction): RacineEtudeLocale[] {
  return exercice.famille === "rationnelleAO" ? exercice.racinesFPrime : exercice.noyau.racinesFPrime;
}

function classificationFPrimeLocal(exercice: ExerciceEtudierFonction): ClassificationExtremum[] {
  return exercice.famille === "rationnelleAO" ? exercice.classificationFPrime : exercice.noyau.classificationFPrime;
}

/** Points d'inflexion — structurellement TOUJOURS vides pour "rationnelleAO" (voir tête de fichier
 * de `core5e/etudierFonction.types.ts`), jamais recalculés pour cette famille. */
function racinesFSecondeLocal(exercice: ExerciceEtudierFonction): RacineEtudeLocale[] {
  return exercice.famille === "rationnelleAO" ? [] : exercice.noyau.racinesFSeconde;
}

/** "x=<racine> ⟹ <MAX/min>" — réplique locale du format déjà utilisé par
 * `ui5e/formatEtudeLocale.ts::formatRacinesFPrimeAvecClassificationLatex` (non exportée), appliquée
 * ici à `exercice.racinesFPrime`/`classificationFPrime` (famille "rationnelleAO", TOUJOURS
 * "max"/"min" par construction — voir `core5e/etudierFonction.types.ts` — jamais
 * "ni_lun_ni_lautre" pour cette famille, le 3e cas est géré ici par simple exhaustivité). */
function libelleClassificationExtremumLocal(c: ClassificationExtremum): string {
  switch (c) {
    case "max":
      return "MAX";
    case "min":
      return "min";
    case "ni_lun_ni_lautre":
      return "ni l'un ni l'autre";
  }
}

function formatRacinesFPrimeAvecClassificationRationnelleAOLatex(exercice: ExerciceRationnelleAO): string[] {
  return exercice.racinesFPrime.map((r, i) => `x=${formatRacineLatex(r)} \\Rightarrow \\text{${libelleClassificationExtremumLocal(exercice.classificationFPrime[i])}}`);
}

/** Arrondi au centième — même convention que `ui5e/formatEtudeLocale.ts` (non exportée), répliquée
 * ici pour les ordonnées de la question d). */
function formatNombreLocal(v: number): string {
  const arrondi = Math.round(v * 100) / 100;
  return Number.isInteger(v) ? `${v}` : `${arrondi}`;
}

// ============================================================================
// Question a) — domaine + limites/asymptotes.
// ============================================================================

function questionDomaineLimites(): { consigne: FragmentConsigne[] } {
  return {
    consigne: [
      texte(
        "Détermine le domaine de définition de f. Calcule ensuite les limites de f à chaque borne de son domaine (équation de chaque asymptote verticale éventuelle) ainsi qu'en -∞ et +∞ (asymptote horizontale, oblique, ou aucune).",
      ),
    ],
  };
}

function correctionDomaineLimites(exercice: ExerciceEtudierFonction, lettre: string): BlocCorrection[] {
  const fragments: FragmentConsigne[] = [texte(`${lettre}) Domaine : `), latex(formatReponseAttenduePhaseLatex(exercice, "domaine")[0]), texte(".")];
  const limites = formatReponseAttenduePhaseLatex(exercice, "limites");
  limites.forEach((l, i) => {
    fragments.push(texte(i === 0 ? " Limites/asymptotes : " : " ; "));
    fragments.push(latex(l));
  });
  fragments.push(texte("."));
  return [{ type: "paragraphe", fragments }];
}

// ============================================================================
// Question b) — f'(x) + tableau de signes + variations.
// ============================================================================

function questionFPrime(): { consigne: FragmentConsigne[] } {
  return {
    consigne: [
      texte(
        "Calcule f'(x). Construis son tableau de signes, puis déduis-en les variations de f et la nature (maximum, minimum, ou ni l'un ni l'autre) de chaque zéro de f'(x).",
      ),
    ],
  };
}

function correctionFPrime(exercice: ExerciceEtudierFonction, lettre: string): BlocCorrection[] {
  const fragments: FragmentConsigne[] = [texte(`${lettre}) f'(x) = `), latex(formatFPrimeDeXLatex(exercice)), texte(". ")];
  const racines = racinesFPrimeLocal(exercice);
  if (racines.length === 0) {
    fragments.push(texte("f'(x) ne s'annule jamais : f est strictement monotone sur chaque intervalle de son domaine, aucun extremum."));
  } else {
    const lignes = exercice.famille === "rationnelleAO" ? formatRacinesFPrimeAvecClassificationRationnelleAOLatex(exercice) : formatReponseAttenduePhaseLatexEtudeLocale(exercice.noyau, "tableauFPrime");
    fragments.push(texte("Zéro(s) de f' et nature : "));
    lignes.forEach((l, i) => {
      if (i > 0) fragments.push(texte(" ; "));
      fragments.push(latex(l));
    });
    fragments.push(texte("."));
  }
  return [{ type: "paragraphe", fragments }];
}

// ============================================================================
// Question c) — f''(x) + tableau de signes + concavité.
// ============================================================================

function questionFSeconde(): { consigne: FragmentConsigne[] } {
  return {
    consigne: [
      texte(
        "Calcule f''(x) (dérivée de f'(x), même méthode qu'à la question précédente). Construis son tableau de signes, puis déduis-en la concavité de f et l'existence éventuelle d'un point d'inflexion.",
      ),
    ],
  };
}

function correctionFSeconde(exercice: ExerciceEtudierFonction, lettre: string): BlocCorrection[] {
  const fragments: FragmentConsigne[] = [texte(`${lettre}) f''(x) = `), latex(formatFSecondeDeXLatex(exercice)), texte(". ")];

  if (exercice.famille === "rationnelleAO") {
    // Toujours vide pour cette famille (preuve dans le commentaire de tête de
    // `core5e/etudierFonction.types.ts`) — jamais recalculée par une étude de signe indépendante.
    fragments.push(texte("f''(x) ne s'annule jamais : la concavité de f est constante de chaque côté de l'asymptote verticale (opposée d'un côté à l'autre), aucun point d'inflexion."));
    return [{ type: "paragraphe", fragments }];
  }

  const racinesSeconde = exercice.noyau.racinesFSeconde;
  if (racinesSeconde.length === 0) {
    fragments.push(texte("f''(x) ne s'annule jamais (ou ne change pas réellement de signe) : la concavité de f est constante sur chaque intervalle de son domaine, aucun point d'inflexion."));
  } else {
    const lignes = formatReponseAttenduePhaseLatexEtudeLocale(exercice.noyau, "tableauFSeconde");
    fragments.push(texte("Zéro(s) de f'' et nature : "));
    lignes.forEach((l, i) => {
      if (i > 0) fragments.push(texte(" ; "));
      fragments.push(latex(l));
    });
    fragments.push(texte("."));
  }
  return [{ type: "paragraphe", fragments }];
}

// ============================================================================
// Question d) — points clés (extremums/inflexions/origine) + allure du graphique.
// ============================================================================

function questionGraphique(): { consigne: FragmentConsigne[] } {
  return {
    consigne: [
      texte(
        "En t'appuyant sur les résultats précédents, donne les coordonnées de chaque point remarquable de f (extremum(s), éventuel point d'inflexion, et ordonnée à l'origine f(0)), puis trace l'allure du graphique de f.",
      ),
    ],
  };
}

/** Un "item" = les fragments décrivant UN point remarquable, ex. "(2;5) (MAX)" — assemblés ensuite
 * en une seule phrase, séparés par " ; ", jamais recalculés (coordonnées reconstruites uniquement à
 * partir des racines/classifications déjà connues de l'instance et de `valeurFLocal`). */
function itemPointLatex(xLatex: string, y: number, suffixeTexte: string): FragmentConsigne[] {
  return [latex(`(${xLatex}\\,;\\,${formatNombreLocal(y)})`), texte(` (${suffixeTexte})`)];
}

function correctionGraphique(exercice: ExerciceEtudierFonction, lettre: string): BlocCorrection[] {
  const items: FragmentConsigne[][] = [];

  const racinesExtremums = racinesFPrimeLocal(exercice);
  const classifications = classificationFPrimeLocal(exercice);
  racinesExtremums.forEach((r, i) => {
    const x = racineNumeriqueLocal(r);
    items.push(itemPointLatex(formatRacineLatex(r), valeurFLocal(exercice, x), libelleClassificationExtremumLocal(classifications[i])));
  });

  const racinesInflexion = racinesFSecondeLocal(exercice);
  racinesInflexion.forEach((r) => {
    const x = racineNumeriqueLocal(r);
    items.push(itemPointLatex(formatRacineLatex(r), valeurFLocal(exercice, x), "point d'inflexion"));
  });

  items.push(itemPointLatex("0", valeurFLocal(exercice, 0), "ordonnée à l'origine"));

  const fragments: FragmentConsigne[] = [texte(`${lettre}) Points remarquables — `)];
  items.forEach((item, i) => {
    if (i > 0) fragments.push(texte(" ; "));
    fragments.push(...item);
  });
  fragments.push(texte("."));

  return [{ type: "paragraphe", fragments }];
}

/** Valeur numérique d'une racine — réplique locale minimale (`RacineEtudeLocale` : exacte ou
 * `centre±√radicande`), JAMAIS importée de `moteur5e/` (qui réplique la même chose de son côté,
 * `verificationEtudeLocale.ts`) ni de `generateurs5e/etudeLocale/index.ts` (dont l'export du même
 * nom porte sur le même type mais reste réservé, dans ce fichier, à l'évaluation de f — la valeur
 * numérique d'une racine est un calcul plus élémentaire encore, répliqué ici pour ne dépendre que du
 * type `RacineEtudeLocale` lui-même). */
function racineNumeriqueLocal(r: RacineEtudeLocale): number {
  return r.exact ? r.valeur.num / r.valeur.den : r.centre + r.signe * Math.sqrt(r.radicande);
}

// ============================================================================
// Assemblage.
// ============================================================================

const LETTRES = "abcd";

function construireEnonceEtudierFonction(exercice: ExerciceEtudierFonction): SectionExercice {
  const etapes: (() => { consigne: FragmentConsigne[] })[] = [questionDomaineLimites, questionFPrime, questionFSeconde, questionGraphique];
  const NOMBRE_LIGNES = [4, 4, 4, 6];
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE_ETUDIER_FONCTION} `), latex(formatFDeXLatex(exercice))],
    questions: etapes.map((construire, i) => ({ ...construire(), reponse: { type: "lignes" as const, nombre: NOMBRE_LIGNES[i] } })),
  };
}

function construireCorrectionEtudierFonction(exercice: ExerciceEtudierFonction): BlocCorrection[] {
  const etapes: ((ex: ExerciceEtudierFonction, lettre: string) => BlocCorrection[])[] = [correctionDomaineLimites, correctionFPrime, correctionFSeconde, correctionGraphique];
  return etapes.flatMap((construire, i) => construire(exercice, LETTRES[i] ?? String(i + 1)));
}

export const adaptateurEvaluationEtudierFonction: AdaptateurFeuilleExercices<ExerciceEtudierFonction> = {
  titreDocument: "Étudier une fonction — Dérivées et applications — Évaluation",
  nomFichierBase: "etudier-fonction-derivees-applications",
  genererInstance: genererExerciceEtudierFonction,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceEtudierFonction,
  construireCorrection: construireCorrectionEtudierFonction,
};
