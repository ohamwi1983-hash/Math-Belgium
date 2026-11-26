// Copie 5e (6h) de `5e-4h/generateurs5e/modeliserSuite/exportEvaluation.ts` (56gen9 ← 5gen47, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { anneeDuRang, somme, terme } from "./core/modeliserSuite";
import type { ExerciceModeliserSuite } from "./core/modeliserSuite";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "./moteur/typesModeliserSuite";
import type { PhaseModeliserSuite } from "./moteur/typesModeliserSuite";
import { consigneEcran, consigneGenerale, fragmentsSituation, libellePhase, phrasePrecision, phraseQuestion, reponseFragments, reponseRecap, valeur } from "./ui/formatModeliserSuite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceModeliserSuite } from "./";
import type { IdVarianteModeliserSuite } from "./";
import { profilModeliserSuite } from "./profilEvaluation";
import { correctionDetailleeModeliserSuite } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceModeliserSuite>` de `5gen47` « Modéliser une
 * situation par une suite » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la situation (données, évolution annuelle, définition de uₙ et année de rang 1),
 *   la question posée avec sa précision et son unité, puis UNE demande globale (« justifie : nature,
 *   premier terme, raison » ; « par un tableau de valeurs » pour un seuil). Les cinq étapes
 *   d'apprentissage (nature, u₁, raison, rang/N/tableau, réponse) passent dans le corrigé.
 * - Corrigé détaillé « comme au tableau » : `corrigeDetaille.ts` (partagé avec l'appli), une étape
 *   par écran (lettres a à e dans l'ordre des écrans).
 * - Aucune figure. Version aménagée : même énoncé.
 */

const t = (valeur: string): FragmentConsigne => texte(valeur);
const f = (valeur: string): FragmentConsigne => latex(valeur);
const LETTRES = "abcde";

// ============================================================================
// Énoncés.
// ============================================================================

function demande(e: ExerciceModeliserSuite): string {
  const base = "Modélise la situation par une suite : justifie sa nature et donne son premier terme et sa raison, puis réponds à la question";
  return e.variante === "seuil" ? `${base} à l'aide d'un tableau de valeurs.` : `${base}.`;
}

function entetePapier(e: ExerciceModeliserSuite): FragmentConsigne[] {
  const precision = phrasePrecision(e);
  return [...fragmentsSituation(e), t(` ${phraseQuestion(e)}${precision ? ` ${precision}` : ""} ${demande(e)}`)];
}

/** Titre d'étape du corrigé (« Étape n — … »), rédigé pour le papier. */
function titreEtape(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): FragmentConsigne[] {
  if (phase === "tableau" && e.variante === "seuil") {
    const [a, , , b] = e.rangsTable;
    return [t("Calcule les termes de "), f(`u_{${a}}`), t(" à "), f(`u_{${b}}`), t(e.mode === "calcul" ? " (valeurs arrondies)." : ".")];
  }
  if (phase === "annee" && e.variante === "seuil") return [t(phraseQuestion(e))];
  return consigneEcran(e, phase);
}

function construireEnonce(e: ExerciceModeliserSuite): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function reponseBreve(e: ExerciceModeliserSuite): FragmentConsigne[] {
  switch (e.variante) {
    case "terme": {
      const v = valeur(e, terme(e, e.rang));
      return [f(`u_{${e.rang}}${v.approchee ? "\\approx" : "="} ${v.latex}`), t(` ${e.contexte.unite} (en ${anneeDuRang(e, e.rang)}).`)];
    }
    case "somme": {
      const v = valeur(e, somme(e, e.nombre));
      return [f(`S_{${e.nombre}}${v.approchee ? "\\approx" : "="} ${v.latex}`), t(` ${e.contexte.unite}.`)];
    }
    case "seuil":
      return [t(`En ${anneeDuRang(e, e.rangSeuil)} (rang ${e.rangSeuil}).`)];
  }
}

function enoncePapier(e: ExerciceModeliserSuite): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: ExerciceModeliserSuite): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseFragments(e, phase)] }));
}

/** ★★ modélisation directe ; ★★★ si u₁ est à calculer (valeur de l'année précédente) ou si le
 * seuil se cherche par tableau. Jamais selon la nature (ce serait trahir le verdict). */
/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceModeliserSuite): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeModeliserSuite(e)), methode: 2, piege: 1 };
}

// ============================================================================
// Barème.
// ============================================================================

const POINTS: Record<PhaseModeliserSuite, number> = {
  nature: 0.5,
  premierTerme: 0.5,
  raison: 1,
  rang: 0.5,
  nombreTermes: 0.5,
  tableau: 1,
  terme: 1.5,
  somme: 1.5,
  annee: 1,
};

function critere(sousQuestion: string, fragments: FragmentConsigne[], points: number): CritereBareme {
  return { sousQuestion, critere: fragments, points };
}

function valeursRecap(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): FragmentConsigne[] {
  const r = reponseRecap(e, phase);
  if ("texte" in r) return [t(r.texte)];
  return r.latex.flatMap((x, i) => [...(i === 0 ? [] : [t(" ; ")]), f(x)]);
}

function libelleCritere(e: ExerciceModeliserSuite, phase: PhaseModeliserSuite): string {
  switch (phase) {
    case "nature":
      return "Nature de la suite justifiée";
    case "premierTerme":
      return "Premier terme selon la convention de rang";
    case "raison":
      return "Raison";
    case "terme":
    case "somme":
      return `${libellePhase(e, phase)}, avec l'unité`;
    case "annee":
      return "Première année (et non le rang)";
    default:
      return libellePhase(e, phase);
  }
}

function bareme(e: ExerciceModeliserSuite): BaremeExercice {
  const phases = phasesPourExercice(e);
  const criteres = phases.map((phase, i) => critere(LETTRES[i], [t(`${libelleCritere(e, phase)} : `), ...valeursRecap(e, phase)], POINTS[phase]));
  const erreurs: ErreurFrequente[] = [];
  if (e.nature === "geometrique" && e.formulation === "pourcent") erreurs.push({ description: [t("Raison égale au taux seul ("), f("q=\\dfrac{t}{100}"), t(" au lieu de "), f("1\\pm\\dfrac{t}{100}"), t(")")], cout: "−1, suite notée sans double pénalité" });
  if (e.nature === "arithmetique" && e.formulation === "pourcentInitial") erreurs.push({ description: [t("Suite prise pour géométrique à cause du symbole %")], cout: "0 pt sur la nature et la raison, suite notée sans double pénalité" });
  if (e.depart === "avant") erreurs.push({ description: [t("Valeur de l'année précédente prise pour "), f("u_1")], cout: "−0,5, suite notée sans double pénalité" });
  switch (e.variante) {
    case "terme":
      erreurs.push({ description: [t("Rang décalé d'une unité (année − année de rang 1, sans le + 1)")], cout: "−0,5" });
      erreurs.push({ description: [t("Somme calculée au lieu du terme")], cout: "0 pt sur la réponse" });
      break;
    case "somme":
      erreurs.push({ description: [t("Dernier terme "), f("u_N"), t(" donné au lieu du total "), f("S_N")], cout: "0 pt sur la réponse" });
      erreurs.push({ description: [t("Nombre de termes N décalé d'une unité")], cout: "−0,5" });
      break;
    case "seuil":
      erreurs.push({ description: [t("Rang donné au lieu de l'année")], cout: "−0,5" });
      erreurs.push({ description: [t("Année sans vérifier que l'année précédente ne franchit pas encore le seuil")], cout: "−0,5" });
      break;
  }
  if (e.mode === "calcul") erreurs.push({ description: [t("Unité absente ou arrondi non respecté")], cout: "−0,5" });
  const acceptees: FragmentConsigne[][] = [];
  if (e.mode === "calcul") acceptees.push([t(`Écart d'une unité sur l'arrondi (${e.contexte.decimales === 0 ? "unité" : e.contexte.decimales === 1 ? "dixième" : "centième"}) dû aux arrondis intermédiaires`)]);
  if (e.variante === "seuil") acceptees.push([t("Résolution par une inéquation ou par essais successifs, si le premier rang est justifié")]);
  if (e.variante === "terme" || e.variante === "somme") acceptees.push([t("Calcul année par année, s'il est complet")]);
  return { reponseFinale: reponseBreve(e), criteres, erreursFrequentes: erreurs, reponsesAcceptees: acceptees };
}

export const adaptateurEvaluationModeliserSuite: AdaptateurFeuilleExercices<ExerciceModeliserSuite> = {
  titreDocument: "Modéliser une situation par une suite — Évaluation",
  nomFichierBase: "modeliser-situation-suite",
  genererInstance: genererExerciceModeliserSuite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteModeliserSuite),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeModeliserSuite,
  bareme,
  enoncePapier,
  profilInstance: profilModeliserSuite,
};
