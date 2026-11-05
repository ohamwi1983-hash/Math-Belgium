import type { ExerciceDomaineDeriveeLogarithme, FamilleDomaineDeriveeLogarithme } from "../../core6e/domaineDeriveeLogarithme.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  ErreurFrequente,
  EtapeAmenagee,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phaseApres, phaseInitiale } from "../../moteur6e/typesDomaineDeriveeLogarithme";
import type { PhaseDomaineDeriveeLogarithme } from "../../moteur6e/typesDomaineDeriveeLogarithme";
import { aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, reponseAttendueLatex } from "../../ui6e/formatDomaineDeriveeLogarithme";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDomaineDeriveeLogarithme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDomaineDeriveeLogarithme>` pour `6gen16` (Domaine,
 * dérivée et dérivation logarithmique) — feuille d'évaluation, voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Contrairement à `deriveesCyclometriques` (une seule question générique par instance), les 7
 * familles A-G de ce générateur ont un nombre d'écrans DIFFÉRENT (2 pour A/B/F, 3 pour C/D/E/G) et
 * une consigne d'en-tête qui dépend de la formule tirée (`blocDonnees`) — jamais `regroupable`.
 * Chaque question écrite correspond exactement à un écran interactif réel (voir
 * `moteur6e/typesDomaineDeriveeLogarithme.ts::phaseApres`) — jamais une question inventée.
 *
 * **Corrigé** (audit 6e ch. 3, point 28) : chaque réponse vient de `reponseAttendueLatex`
 * (`ui6e/formatDomaineDeriveeLogarithme.ts`), la MÊME source que la révélation à l'écran —
 * dérivées simplifiées, jamais « ·ln(e) », « (1)·ln(…) » ni « ln5·5ˣ/(5ˣ·ln5) ». Les anciennes
 * copies locales des formateurs (`facteursLatexC`, `uvLatexG`...) sont supprimées.
 */

function entete(exercice: ExerciceDomaineDeriveeLogarithme): SectionExercice["enteteFragments"] {
  return [latex(blocDonnees(exercice)[0])];
}

/** Lignes de réponse par écran — domaine/identification courts, dérivées plus longues. */
function lignesPhase(phase: PhaseDomaineDeriveeLogarithme): number {
  if (phase.endsWith("Domaine") || phase === "eSimplifier" || phase === "gIdentifier") return 2;
  if (phase === "fDerivee") return 4;
  return 3;
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function phasesDeLExercice(exercice: ExerciceDomaineDeriveeLogarithme): PhaseDomaineDeriveeLogarithme[] {
  const phases: PhaseDomaineDeriveeLogarithme[] = [];
  let phase: PhaseDomaineDeriveeLogarithme | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase);
  }
  return phases;
}

function construireEnonceDomaineDeriveeLogarithme(exercice: ExerciceDomaineDeriveeLogarithme): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: phasesDeLExercice(exercice).map((phase) => ({ consigne: consigneEcran(exercice, phase), reponse: { type: "lignes", nombre: lignesPhase(phase) } })),
  };
}

function construireCorrectionDomaineDeriveeLogarithme(exercice: ExerciceDomaineDeriveeLogarithme): BlocCorrection[] {
  return phasesDeLExercice(exercice).map((phase, i) => {
    const lettre = LETTRES[i] ?? String(i + 1);
    const reponse = reponseAttendueLatex(exercice, phase);
    if (reponse === null && "domaine" in exercice) {
      const precision = exercice.famille === "E" ? " (sur l'expression originale)" : "";
      return { type: "paragraphe", fragments: [texte(`${lettre}) Domaine${precision} : `), latex(formatEnsembleReelLatex(exercice.domaine))] };
    }
    return { type: "paragraphe", fragments: [texte(`${lettre}) `), latex(reponse ?? "")] };
  });
}

// ============================================================================
// Champs enrichis (corrigé détaillé, barème, version aménagée) — tout est CALCULÉ à partir des mêmes
// sources que l'écran interactif : `reponseAttendueLatex` (réponses), `formatEnsembleReelLatex`
// (domaine), `aideNiveau1` (rappel de méthode, jamais la réponse — audit 6e ch. 3, point 9) et
// `aideNiveau2` (ingrédients intermédiaires u, u′, conditions non résolues...), ce dernier écarté
// dès qu'il contient un trou « ? » ou une forme volontairement fausse.
// ============================================================================

type Exercice = ExerciceDomaineDeriveeLogarithme;
type Phase = PhaseDomaineDeriveeLogarithme;

function lettre(i: number): string {
  return LETTRES[i] ?? String(i + 1);
}

function estDomaine(phase: Phase): boolean {
  return phase.endsWith("Domaine");
}

function domaineLatex(exercice: Exercice): string | null {
  return "domaine" in exercice ? `D_f = ${formatEnsembleReelLatex(exercice.domaine)}` : null;
}

/** Réponse attendue d'une phase, en LaTeX (domaine ou `reponseAttendueLatex`). */
function reponsePhase(exercice: Exercice, phase: Phase): string {
  return reponseAttendueLatex(exercice, phase) ?? domaineLatex(exercice) ?? "";
}

/** Ingrédients intermédiaires (`aideNiveau2`) s'ils sont présentables tels quels dans un corrigé. */
function ingredients(exercice: Exercice, phase: Phase): string | null {
  const l = aideNiveau2(exercice, phase).latex;
  if (!l || l.includes("?") || l.includes("FAUX")) return null;
  return l;
}

/** Écrans dont l'aide 2 ne fait que RÉPÉTER les résultats de l'écran précédent. */
function repeteEcranPrecedent(phase: Phase): boolean {
  return phase === "cAssemblage" || phase === "dAssemblage" || phase === "eDerivee" || phase === "gIsoler";
}

/** Point exclu « caché » (dénominateur qui s'annule alors que tout semble défini). */
function piegeDomaine(exercice: Exercice): string | null {
  if (exercice.famille === "D" && exercice.sousType === "expoSurLn") return "\\ln(x) \\neq 0 \\iff x \\neq 1";
  if (exercice.famille === "F" && exercice.sousType === "arctanLog") return `1-\\log_{${exercice.base}}(x) \\neq 0 \\iff x \\neq ${exercice.base}`;
  return null;
}

function rappelPhase(exercice: Exercice, phase: Phase): FragmentConsigne[] {
  const a = aideNiveau1(exercice, phase);
  return a.latex ? [texte(`${a.texte} `), latex(a.latex)] : [texte(a.texte)];
}

/** Libellé court de l'écran (corrigé, barème). */
function libellePhase(phase: Phase): string {
  if (estDomaine(phase)) return "Domaine";
  switch (phase) {
    case "cFacteurs":
      return "Facteurs";
    case "dND":
      return "N′ et D′";
    case "cAssemblage":
    case "dAssemblage":
      return "Assemblage";
    case "eSimplifier":
      return "Simplifier";
    case "gIdentifier":
      return "Identifier";
    case "gFPrimeSurF":
      return "f′/f";
    case "gIsoler":
      return "Isoler f′";
    default:
      return "Dérivée";
  }
}

/** Écran de dérivée « en un bloc » (A, B, F) — découpé en deux critères : ingrédients, puis résultat. */
function estDeriveeEnUnBloc(phase: Phase): boolean {
  return phase === "aDerivee" || phase === "bDerivee" || phase === "fDerivee";
}

function correctionDetailleeDomaineDeriveeLogarithme(exercice: Exercice): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  phasesDeLExercice(exercice).forEach((phase, i) => {
    const sousQuestion = lettre(i);
    const ing = repeteEcranPrecedent(phase) ? null : ingredients(exercice, phase);
    if (estDomaine(phase)) {
      if (exercice.famille === "E") etapes.push({ label: "Méthode", sousQuestion, fragments: [texte("Le domaine se lit sur l'expression ORIGINALE, avant toute simplification.")] });
      if (ing) etapes.push({ label: "Conditions", sousQuestion, fragments: [latex(ing)] });
      const piege = piegeDomaine(exercice);
      if (piege) etapes.push({ label: "Piège", sousQuestion, fragments: [texte("Le dénominateur ne peut pas s'annuler : "), latex(piege), texte(".")] });
      etapes.push({ label: "Domaine", sousQuestion, fragments: [latex(reponsePhase(exercice, phase))] });
      return;
    }
    const formule = aideNiveau1(exercice, phase).latex;
    if (formule) etapes.push({ label: "Formule", sousQuestion, fragments: [latex(formule)] });
    if (ing) etapes.push({ label: "Ingrédients", sousQuestion, fragments: [latex(ing)] });
    etapes.push({ label: libellePhase(phase), sousQuestion, fragments: [latex(reponsePhase(exercice, phase))] });
  });
  return etapes;
}

/** Réponse finale : domaine (sauf G) puis dernière réponse (f′(x)). */
function reponseBreveDomaineDeriveeLogarithme(exercice: Exercice): FragmentConsigne[] {
  const phases = phasesDeLExercice(exercice);
  const finale = latex(reponsePhase(exercice, phases[phases.length - 1]));
  const dom = domaineLatex(exercice);
  return dom ? [latex(dom), texte(" ; "), finale] : [finale];
}

/** Poids de chaque écran dans le barème (somme 4). Les écrans de dérivée « en un bloc » pèsent
 * 2,5 = 1 (ingrédients) + 1,5 (résultat), voir `criteresPhase`. */
function poidsPhase(exercice: Exercice, phase: Phase): number {
  if (exercice.famille === "G") return phase === "gFPrimeSurF" ? 2 : 1;
  if (estDomaine(phase)) return exercice.famille === "A" || exercice.famille === "B" || exercice.famille === "F" ? 1.5 : 1;
  return estDeriveeEnUnBloc(phase) ? 2.5 : 1.5;
}

function criteresPhase(exercice: Exercice, phase: Phase, sousQuestion: string): CritereBareme[] {
  const reponse = latex(reponsePhase(exercice, phase));
  const poids = poidsPhase(exercice, phase);
  if (estDomaine(phase)) {
    const piege = piegeDomaine(exercice);
    const debut = exercice.famille === "E" ? "Conditions sur l'expression originale, domaine " : piege ? "Conditions (dont le point exclu), domaine " : "Conditions posées et croisées, domaine ";
    return [{ sousQuestion, critere: [texte(debut), reponse], points: poids }];
  }
  if (estDeriveeEnUnBloc(phase)) {
    const ing = ingredients(exercice, phase);
    return [
      { sousQuestion, critere: ing ? [texte("Ingrédients corrects : "), latex(ing)] : [texte("Décomposition en fonctions emboîtées, chaque niveau dérivé")], points: 1 },
      { sousQuestion, critere: [texte("Formule appliquée : "), reponse], points: poids - 1 },
    ];
  }
  return [{ sousQuestion, critere: [texte(`${libellePhase(phase)} : `), reponse], points: poids }];
}

function erreursFrequentes(exercice: Exercice): ErreurFrequente[] {
  const erreurs: ErreurFrequente[] = [];
  switch (exercice.famille) {
    case "A":
    case "B":
      if (exercice.famille === "B" && exercice.sousType === "doubleContrainte") erreurs.push({ description: [texte("Une seule des deux conditions (argument du log > 0, radicande ≥ 0)")], cout: "moitié des points de a)" });
      if (exercice.famille === "B" && exercice.sousType === "quadratique") erreurs.push({ description: [texte("Garder un seul des deux morceaux du domaine")], cout: "moitié des points de a)" });
      if (exercice.famille === "B" && (exercice.sousType === "racineInterne" || exercice.sousType === "racineSimplifiee")) erreurs.push({ description: [texte("Bornes incluses : la racine doit être STRICTEMENT positive dans le log")], cout: "−0,5" });
      if (exercice.famille === "A" && exercice.sousType === "affine" && exercice.m < 0) erreurs.push({ description: [texte("Sens de l'inégalité non inversé en divisant par un nombre négatif")], cout: "0 pt sur a)" });
      if (!("baseEstE" in exercice && exercice.baseEstE)) erreurs.push({ description: [texte("Oublier le facteur "), latex("\\ln(b)"), texte(" au dénominateur")], cout: "−1" });
      erreurs.push({ description: [texte("Oublier de multiplier par la dérivée de l'intérieur (règle de la chaîne)")], cout: "−1" });
      break;
    case "C":
      erreurs.push({ description: [latex("(uv)' = u'v'")], cout: "0 pt sur c)" });
      if (exercice.sousType === "trigLn") erreurs.push({ description: [texte("Chercher une condition sur le sinus/cosinus alors que l'argument du log reste entre 1 et 3")], cout: "0 pt sur a)" });
      break;
    case "D":
      if (exercice.sousType === "expoSurLn") erreurs.push({ description: [texte("Oublier d'exclure "), latex("x = 1"), texte(" (là où "), latex("\\ln(x) = 0"), texte(")")], cout: "moitié des points de a)" });
      erreurs.push({ description: [texte("Numérateur inversé ("), latex("ND' - N'D"), texte(") ou "), latex("D^2"), texte(" oublié")], cout: "−1" });
      break;
    case "E":
      if (exercice.sousType === "puissanceAbs" || exercice.sousType === "valeurAbsolueQuadratique") erreurs.push({ description: [texte("Oublier la valeur absolue en descendant l'exposant")], cout: "−1 sur b)" });
      if (exercice.sousType === "combinaison") erreurs.push({ description: [texte("Confondre "), latex("(\\ln x)^3"), texte(" et "), latex("3\\ln(x)")], cout: "0 pt sur b)" });
      erreurs.push({ description: [texte("Domaine calculé sur la forme simplifiée au lieu de l'expression originale")], cout: "0 pt sur a)" });
      break;
    case "F":
      if (exercice.sousType === "arctanLog") erreurs.push({ description: [texte("Oublier d'exclure "), latex(`x = ${exercice.base}`), texte(" (dénominateur nul)")], cout: "moitié des points de a)" });
      erreurs.push({ description: [texte("Oublier un niveau de la règle de la chaîne")], cout: "−1" });
      break;
    case "G":
      erreurs.push({ description: [texte("Dériver "), latex("u^v"), texte(" comme "), latex("v\\cdot u^{v-1}"), texte(" (exposant variable traité comme une constante)")], cout: "0 pt sur b) et c)" });
      erreurs.push({ description: [texte("Donner "), latex("f'/f"), texte(" comme réponse finale, sans multiplier par "), latex("f(x)")], cout: "0 pt sur c)" });
      break;
  }
  return erreurs.slice(0, 3);
}

function baremeDomaineDeriveeLogarithme(exercice: Exercice): BaremeExercice {
  const criteres = phasesDeLExercice(exercice).flatMap((phase, i) => criteresPhase(exercice, phase, lettre(i)));
  const acceptees: FragmentConsigne[][] = [[texte("Toute écriture équivalente de "), latex("f'(x)"), texte(", même non simplifiée")]];
  if ("domaine" in exercice) acceptees.push([texte("Domaine écrit par inégalités plutôt qu'en intervalles")]);
  if (exercice.famille === "E") acceptees.push([texte("Dérivée juste calculée directement sur l'expression originale")]);
  return { reponseFinale: reponseBreveDomaineDeriveeLogarithme(exercice), criteres, erreursFrequentes: erreursFrequentes(exercice), reponsesAcceptees: acceptees };
}

/** Consigne de l'étape « ingrédients » d'une dérivée en un bloc (A, B, F). */
function consigneIngredients(exercice: Exercice): FragmentConsigne[] {
  if (exercice.famille === "B" && exercice.sousType === "doubleContrainte") return [texte("Écris la fonction sous la racine, "), latex("w(x)"), texte(", et sa dérivée "), latex("w'(x)"), texte(".")];
  if (exercice.famille === "F") return [texte("Décompose f en fonctions emboîtées et dérive chaque niveau séparément.")];
  return [texte("Écris l'argument du logarithme, "), latex("u(x)"), texte(", et sa dérivée "), latex("u'(x)"), texte(".")];
}

function enonceAmenageDomaineDeriveeLogarithme(exercice: Exercice): EtapeAmenagee[] {
  return phasesDeLExercice(exercice).flatMap((phase): EtapeAmenagee[] => {
    const poids = poidsPhase(exercice, phase);
    if (estDeriveeEnUnBloc(phase)) {
      return [
        { consigne: consigneIngredients(exercice), rappel: [texte("La dérivée de l'intérieur sert dans la règle de la chaîne.")], points: 1 },
        { consigne: [texte("Remplace dans la formule, puis simplifie "), latex("f'(x)"), texte(".")], rappel: rappelPhase(exercice, phase), points: poids - 1 },
      ];
    }
    return [{ consigne: consigneEcran(exercice, phase), rappel: rappelPhase(exercice, phase), points: poids }];
  });
}

function difficulteDomaineDeriveeLogarithme(exercice: Exercice): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
      return 1;
    case "B":
      return exercice.sousType === "doubleContrainte" ? 3 : 2;
    case "C":
      return 2;
    case "D":
      return exercice.sousType === "expoSurLn" ? 3 : 2;
    case "E":
      return exercice.sousType === "puissanceSimple" ? 2 : 3;
    case "F":
      return exercice.sousType === "arctanLog" ? 3 : 2;
    case "G":
      return 3;
  }
}

// ============================================================================
// Dispatch public + export de l'adaptateur.
// ============================================================================

export const adaptateurEvaluationDomaineDeriveeLogarithme: AdaptateurFeuilleExercices<ExerciceDomaineDeriveeLogarithme> = {
  titreDocument: "Domaine, dérivée et dérivation logarithmique — Évaluation",
  nomFichierBase: "domaine-derivee-logarithme",
  genererInstance: genererExerciceDomaineDeriveeLogarithme,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleDomaineDeriveeLogarithme),
  construireEnonce: construireEnonceDomaineDeriveeLogarithme,
  construireCorrection: construireCorrectionDomaineDeriveeLogarithme,
  difficulte: difficulteDomaineDeriveeLogarithme,
  reponseBreve: reponseBreveDomaineDeriveeLogarithme,
  correctionDetaillee: correctionDetailleeDomaineDeriveeLogarithme,
  bareme: baremeDomaineDeriveeLogarithme,
  enonceAmenage: enonceAmenageDomaineDeriveeLogarithme,
  dureeMinutes: 6,
  // Nombre de questions VARIABLE selon la famille (2 pour A/B/F, 3 pour C/D/E/G) et en-tête
  // dépendant de l'instance (`blocDonnees`) — aucune des conditions de `regroupable` n'est réunie.
};
