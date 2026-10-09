import type { ExerciceEtudeLocale } from "../../core5e/etudeLocale.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudeLocale } from "./index";
import { CONSIGNE_GENERALE_ETUDE_LOCALE, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex } from "../../ui5e/formatEtudeLocale";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeLocale>` pour 5gen29 ("Étude locale
 * (extremums et points critiques)", 6e générateur du chapitre "Dérivées et applications",
 * `App5gen29.tsx`) — voir `generateurs5e/etudeComplete/exportEvaluation.ts` pour la méthodologie de
 * consolidation écrans→questions papier appliquée ci-dessous, et
 * `generateurs5e/limites/exportEvaluation.ts` pour la convention exacte du namespace 5e.
 *
 * **`f(x)`/`f'(x)`[/`f''(x)`] affichées UNE SEULE FOIS en tête de l'exercice** (`enteteFragments`),
 * jamais répétées question par question — comme à l'écran (`f'(x) et, si nécessaire, f''(x) te sont
 * DONNÉES`, jamais à dériver, voir `CONSIGNE_GENERALE_ETUDE_LOCALE`). ⚠️ Piège `enteteFragments`
 * (toujours rendu en mode KaTeX `displayMode:true` par `assemblerEvaluationHtml.ts`) : ce
 * générateur a POTENTIELLEMENT 3 expressions à afficher (f/f'/f'' si `niveau==="avance"`) — au lieu
 * de 3 fragments `latex()` courts entrelacés (le piège), elles sont jointes en **UN SEUL** fragment
 * `latex()` via `formatTermesDonneesLatex(exercice).join(" \\quad ")` (même patron que
 * `generateurs5e/limites/exportEvaluation.ts::construireCorrectionLimite`, qui joint plusieurs
 * termes d'une même étape avec `" \\quad "` DANS un seul appel `latex()`). Précédé d'UN SEUL
 * fragment `texte()` (la consigne générale) — texte + UN SEUL bloc LaTeX, jamais plusieurs.
 * `question.consigne`/`BlocCorrection.paragraphe` n'ont PAS cette contrainte (rendus inline, jamais
 * `displayMode:true` par défaut) : on y mélange librement texte et plusieurs fragments LaTeX courts.
 *
 * **Consolidation du pipeline (jusqu'à 7 écrans, `moteur5e/typesEtudeLocale.ts::ordreEcransEtudeLocale`)
 * en 1 ou 2 questions papier — jamais une question par micro-écran :**
 * - a) TOUJOURS présente — condense "domaine" (UNIQUEMENT si `rationnelleAvecCE`, sinon la phrase
 *   est simplement omise) + "resoudreFPrime" + "tableauFPrime" + "extremums" en UNE consigne :
 *   « [Détermine le domaine de définition de f,] calcule les zéros de f'(x), dresse le tableau de
 *   signes de f' (…), puis identifie les éventuels extremums de f, en justifiant. » La consigne
 *   reste volontairement **"éventuels"** — valide aussi bien quand il existe 0, 1 ou 2 extremums
 *   réels (ex. racine DOUBLE de f', `genererPolynomialeDouble` : aucun extremum, uniquement
 *   "ni l'un ni l'autre") : PIÈGE central du générateur explicitement rappelé dans la consigne
 *   elle-même (jamais supposé qu'un zéro de f' est automatiquement un extremum).
 * - b) UNIQUEMENT si `exercice.niveau==="avance"` — condense "resoudreFSeconde"+"tableauFSeconde"+
 *   "inflexions" en une seconde consigne symétrique, sur f''/la concavité/les points d'inflexion,
 *   avec le même rappel du piège (racine de f'' sans changement de signe réel ⟹ pas de PI).
 *
 * Décision volontaire : PAS de question séparée pour "domaine" (1 seule phrase de plus, jamais un
 * écran assez riche pour mériter sa propre question — contrairement à `etudeComplete`, où le domaine
 * porte une distinction point vide/exclusion réelle nettement plus substantielle).
 *
 * **Corrections RESYNTHÉTISÉES depuis les valeurs déjà connues de l'instance, jamais recalculées
 * indépendamment** — chaque bloc réutilise `formatReponseAttenduePhaseLatex` (`ui5e/formatEtudeLocale.ts`),
 * la fonction déjà écrite pour révéler la réponse attendue de CHAQUE écran côté session interactive
 * — jamais une seconde implémentation des dérivées/racines/classifications (qui vivent dans
 * `moteur5e/verificationEtudeLocale.ts`, JAMAIS importé ici, ni aucun autre symbole de `moteur5e/` —
 * couche A/couche B, règle non négociable du CLAUDE.md racine). Les écrans réellement présents pour
 * une instance donnée (domaine ? extremums ? niveau avancé ?) sont déterminés en relisant
 * directement les champs déjà connus de `exercice` (`type`, `niveau`, `classificationFPrime`,
 * `classificationFSeconde`) — même patron que `etudeComplete/exportEvaluation.ts`, qui relit
 * `exercice.exclusions`/`exercice.casSpecial` plutôt que d'importer la fonction équivalente de
 * `moteur5e/typesEtudeComplete.ts`.
 *
 * **PAS `regroupable`** (voir la doc de `AdaptateurFeuilleExercices.regroupable`,
 * `export/genererFeuilleExercices.ts`) : le nombre de questions par instance VARIE (1 si
 * `niveau==="base"`, 2 si `"avance"`) et la consigne de la question a) elle-même varie selon
 * l'instance (phrase "domaine" ajoutée UNIQUEMENT pour `rationnelleAvecCE`) — les 2 conditions
 * d'activation ("TOUJOURS une seule question, consigne GÉNÉRIQUE indépendante des valeurs tirées")
 * sont donc violées, comme pour `etudeComplete`. `regroupable` reste `false`/absent.
 */

function hasDomaine(exercice: ExerciceEtudeLocale): boolean {
  return exercice.type === "rationnelleAvecCE";
}

function hasExtremums(exercice: ExerciceEtudeLocale): boolean {
  return exercice.classificationFPrime.some((c) => c !== "ni_lun_ni_lautre");
}

function isAvance(exercice: ExerciceEtudeLocale): boolean {
  return exercice.niveau === "avance";
}

function hasInflexions(exercice: ExerciceEtudeLocale): boolean {
  return exercice.classificationFSeconde.some((c) => c === "pi");
}

// ============================================================================
// Question a) — f'(x), tableau de signes, extremums éventuels (TOUJOURS présente).
// ============================================================================

function consigneQuestionFPrime(exercice: ExerciceEtudeLocale): FragmentConsigne[] {
  const phraseDomaine = hasDomaine(exercice) ? "Détermine le domaine de définition de f, puis c" : "C";
  return [
    texte(
      `${phraseDomaine}alcule les éventuels zéros de f'(x), dresse le tableau de signes de f' sur ce domaine (variations de f qui en découlent), puis identifie les éventuels extremums de f (avec leur valeur f(x)), en justifiant. ATTENTION : un zéro de f' où le signe NE change PAS de part et d'autre n'est ni un maximum ni un minimum — vérifie TOUJOURS les deux côtés de chaque zéro.`,
    ),
  ];
}

function correctionQuestionFPrime(exercice: ExerciceEtudeLocale, lettre: string): BlocCorrection[] {
  const fragments: FragmentConsigne[] = [texte(`${lettre}) `)];

  if (hasDomaine(exercice)) {
    fragments.push(texte("Domaine : "), latex(formatReponseAttenduePhaseLatex(exercice, "domaine")[0]), texte(". "));
  }

  fragments.push(texte("Zéros de f'(x) : "), latex(formatReponseAttenduePhaseLatex(exercice, "resoudreFPrime")[0]), texte("."));

  const classification = formatReponseAttenduePhaseLatex(exercice, "tableauFPrime");
  fragments.push(texte(" Tableau de signes de f' — classification de chaque zéro : "));
  classification.forEach((c, i) => {
    if (i > 0) fragments.push(texte(" ; "));
    fragments.push(latex(c));
  });
  fragments.push(texte("."));

  if (hasExtremums(exercice)) {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, "extremums");
    fragments.push(texte(" Valeur de f aux extremums retenus : "));
    valeurs.forEach((v, i) => {
      if (i > 0) fragments.push(texte(" ; "));
      fragments.push(latex(v));
    });
    fragments.push(texte("."));
  } else {
    fragments.push(texte(" Aucun zéro de f' ne donne lieu à un changement de signe réel : f n'a AUCUN extremum."));
  }

  return [{ type: "paragraphe", fragments }];
}

// ============================================================================
// Question b) — f''(x), tableau de signes, points d'inflexion éventuels (UNIQUEMENT si "avance").
// ============================================================================

function consigneQuestionFSeconde(): FragmentConsigne[] {
  return [
    texte(
      "Calcule les éventuels zéros de f''(x), dresse le tableau de signes de f'' (concavité de f qui en découle), puis identifie les éventuels points d'inflexion de f (avec leur valeur f(x)), en justifiant. ATTENTION : un zéro de f'' où le signe NE change PAS de part et d'autre n'est PAS un point d'inflexion — vérifie TOUJOURS les deux côtés de chaque zéro.",
    ),
  ];
}

function correctionQuestionFSeconde(exercice: ExerciceEtudeLocale, lettre: string): BlocCorrection[] {
  const fragments: FragmentConsigne[] = [texte(`${lettre}) `)];

  fragments.push(texte("Zéros de f''(x) : "), latex(formatReponseAttenduePhaseLatex(exercice, "resoudreFSeconde")[0]), texte("."));

  const classification = formatReponseAttenduePhaseLatex(exercice, "tableauFSeconde");
  fragments.push(texte(" Tableau de signes de f'' — classification de chaque zéro : "));
  classification.forEach((c, i) => {
    if (i > 0) fragments.push(texte(" ; "));
    fragments.push(latex(c));
  });
  fragments.push(texte("."));

  if (hasInflexions(exercice)) {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, "inflexions");
    fragments.push(texte(" Valeur de f aux points d'inflexion retenus : "));
    valeurs.forEach((v, i) => {
      if (i > 0) fragments.push(texte(" ; "));
      fragments.push(latex(v));
    });
    fragments.push(texte("."));
  } else {
    fragments.push(texte(" Aucun zéro de f'' ne donne lieu à un changement de signe réel : f n'a AUCUN point d'inflexion."));
  }

  return [{ type: "paragraphe", fragments }];
}

// ============================================================================
// Assemblage.
// ============================================================================

const LETTRES = "ab";

function construireEnonceEtudeLocale(exercice: ExerciceEtudeLocale): SectionExercice {
  const questions: SectionExercice["questions"] = [{ consigne: consigneQuestionFPrime(exercice), reponse: { type: "lignes", nombre: 8 } }];
  if (isAvance(exercice)) {
    questions.push({ consigne: consigneQuestionFSeconde(), reponse: { type: "lignes", nombre: 7 } });
  }
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE_ETUDE_LOCALE} `), latex(formatTermesDonneesLatex(exercice).join(" \\quad "))],
    questions,
  };
}

function construireCorrectionEtudeLocale(exercice: ExerciceEtudeLocale): BlocCorrection[] {
  const blocs: BlocCorrection[] = [...correctionQuestionFPrime(exercice, LETTRES[0])];
  if (isAvance(exercice)) {
    blocs.push(...correctionQuestionFSeconde(exercice, LETTRES[1]));
  }
  return blocs;
}

export const adaptateurEvaluationEtudeLocale: AdaptateurFeuilleExercices<ExerciceEtudeLocale> = {
  titreDocument: "Étude locale (extremums et points critiques) — Évaluation",
  nomFichierBase: "etude-locale-extremums",
  genererInstance: genererExerciceEtudeLocale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceEtudeLocale,
  construireCorrection: construireCorrectionEtudeLocale,
};
