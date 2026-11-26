// Copie 5e (6h) de `5e-4h/generateurs5e/sommeInfinieSituation/exportEvaluation.ts` (56gen7 ← 5gen48, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { donnees } from "./core/sommeInfinieSituation.types";
import type { ExerciceSommeInfinie } from "./core/sommeInfinieSituation.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { PHASES } from "./moteur/typesSommeInfinieSituation";
import { consigneEcran, consigneGenerale, fracLatex, nbLatex, questionFinale, reponseFragments, reponseRecap } from "./ui/formatSommeInfinieSituation";
import { PALETTE_PAPIER, construireSvgSommeInfinie } from "./export/svgSommeInfinieSituation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSommeInfinie } from "./";
import type { IdVarianteSommeInfinie } from "./";
import { profilSommeInfinie } from "./profilEvaluation";
import { correctionDetailleeSommeInfinie } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSommeInfinie>` de `5gen48` « Somme infinie en
 * situation » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la situation (consigne générale de l'écran, figure pour les rebonds et les figures
 *   emboîtées), la question du problème et UNE demande de justification par la somme infinie ; les
 *   quatre étapes d'apprentissage (u₁, q, S∞ avec |q| < 1, réponse) passent dans le corrigé.
 * - Corrigé détaillé « comme au tableau » : `corrigeDetaille.ts` (partagé avec l'appli), une étape
 *   par écran (lettres a, b, c, d).
 * - Toutes les valeurs exactes ; figure sans identifiant SVG. Version aménagée : même énoncé.
 */

const t = (valeur: string): FragmentConsigne => texte(valeur);
const f = (valeur: string): FragmentConsigne => latex(valeur);
const LETTRES = "abcd";

// ============================================================================
// Énoncés.
// ============================================================================

const JUSTIFICATION: FragmentConsigne[] = [t(" Justifie ta réponse à l'aide de la somme infinie des termes de la suite géométrique (uₙ) : premier terme, raison et condition d'existence.")];

function figurePapier(e: ExerciceSommeInfinie): string | undefined {
  return construireSvgSommeInfinie(e, PALETTE_PAPIER) ?? undefined;
}

function construireEnonce(e: ExerciceSommeInfinie): SectionExercice {
  return {
    enteteFragments: [...consigneGenerale(e), t(" "), ...questionFinale(e), ...JUSTIFICATION],
    enteteHtml: figurePapier(e),
    questions: PHASES.map((phase) => ({ consigne: consigneEcran(e, phase) })),
  };
}

function uniteTexte(e: ExerciceSommeInfinie): string {
  return e.variante === "periodique" ? "" : e.variante === "figures" ? " cm²" : e.variante === "rebonds" ? ` ${e.unite}` : " m";
}

function reponseBreve(e: ExerciceSommeInfinie): FragmentConsigne[] {
  const d = donnees(e);
  switch (e.variante) {
    case "periodique":
      return [f(`x=${fracLatex(d.reponse)}`), t(".")];
    case "rebonds":
      return [t("Distance totale : "), f(nbLatex(d.reponse)), t(`${uniteTexte(e)} (`), f(`S_\\infty=${nbLatex(d.sInfini)}`), t(`${uniteTexte(e)}).`)];
    case "zenon":
      return [t("Rattrapage à "), f(nbLatex(d.reponse)), t(" m du point de départ ("), f(`S_\\infty=${nbLatex(d.sInfini)}`), t(" m).")];
    case "figures":
      return [t("Aire non coloriée : "), f(nbLatex(d.reponse)), t(" cm² ("), f(`S_\\infty=${nbLatex(d.sInfini)}`), t(" cm²).")];
  }
}

function enoncePapier(e: ExerciceSommeInfinie): EnoncePapier {
  return { section: { enteteFragments: [...consigneGenerale(e), t(" "), ...questionFinale(e), ...JUSTIFICATION], enteteHtml: figurePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: ExerciceSommeInfinie): BlocCorrection[] {
  return PHASES.map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseFragments(e, phase)] }));
}

/** ★★ : nombre périodique pur, triangles des milieux ; ★★★ : partie non périodique à ajouter,
 * rebonds (descentes comptées deux fois), poursuite de Zénon, hexagones (une couronne sur deux). */
/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceSommeInfinie): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeSommeInfinie(e)), methode: e.variante === "periodique" ? 1 : 2, piege: 1 };
}

// ============================================================================
// Barème.
// ============================================================================

function critere(sousQuestion: string, fragments: FragmentConsigne[], points: number): CritereBareme {
  return { sousQuestion, critere: fragments, points };
}

function bareme(e: ExerciceSommeInfinie): BaremeExercice {
  const d = donnees(e);
  const criteres: CritereBareme[] = [
    critere("a", [t("Premier terme : "), f(reponseRecap(e, "premierTerme"))], 0.5),
    critere("b", [t("Raison : "), f(reponseRecap(e, "raison"))], 1),
    critere("c", [t("Condition "), f(`|q|=${fracLatex(d.q)}<1`), t(" vérifiée avant d'appliquer la formule")], 0.5),
    critere("c", [t("Somme infinie : "), f(reponseRecap(e, "sommeInfinie"))], 1),
    critere("d", [t("Réponse au problème : "), ...reponseBreve(e)], 1),
  ];
  const erreurs: ErreurFrequente[] = [
    { description: [t("Formule appliquée sans vérifier "), f("|q|<1")], cout: "−0,5" },
    { description: [t("Dénominateur "), f("1+q"), t(" au lieu de "), f("1-q")], cout: "−1" },
  ];
  switch (e.variante) {
    case "periodique":
      erreurs.push({ description: [t("Raison "), f("\\dfrac{1}{10}"), t(" quel que soit le nombre de chiffres du bloc")], cout: "−1, suite notée sans double pénalité" });
      erreurs.push({ description: [t("Partie non périodique oubliée, ou fraction non simplifiée")], cout: "−0,5" });
      break;
    case "rebonds":
      erreurs.push({ description: [t("Raison écrite comme un pourcentage ("), f(String(e.pourcent)), t(" au lieu de "), f(fracLatex(d.q)), t(")")], cout: "−1" });
      erreurs.push({ description: [t("Distance "), f("h+S_\\infty"), t(" (descentes oubliées) ou "), f("2(h+S_\\infty)"), t(" (première chute comptée deux fois)")], cout: "−1" });
      break;
    case "zenon":
      erreurs.push({ description: [t("Premier terme pris égal à l'avance (distance du poursuivant)")], cout: "−0,5, suite notée sans double pénalité" });
      erreurs.push({ description: [t("Réponse "), f("S_\\infty"), t(" sans y ajouter l'avance de départ")], cout: "−1" });
      break;
    case "figures":
      erreurs.push({
        description: e.sousCas === "triangle" ? [t("Raison "), f("\\dfrac{1}{2}"), t(" (rapport des côtés au lieu des aires)")] : [t("Raison "), f("\\dfrac{3}{4}"), t(" au lieu de "), f("\\dfrac{9}{16}"), t(" (une couronne sur deux)")],
        cout: "−1, suite notée sans double pénalité",
      });
      erreurs.push({ description: [t("Aire coloriée donnée au lieu de l'aire non coloriée")], cout: "−1" });
      break;
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [t("Valeur exacte sous toute forme équivalente (fraction, décimal fini) ; une valeur approchée seule ne suffit pas")],
      ...(e.variante === "periodique" ? [[t("Méthode « 10x − x » (ou 100x − x) pour obtenir la fraction, si la somme infinie est aussi écrite")]] : []),
    ],
  };
}

export const adaptateurEvaluationSommeInfinie: AdaptateurFeuilleExercices<ExerciceSommeInfinie> = {
  titreDocument: "Somme infinie en situation — Évaluation",
  nomFichierBase: "somme-infinie-en-situation",
  genererInstance: genererExerciceSommeInfinie,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteSommeInfinie),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeSommeInfinie,
  bareme,
  enoncePapier,
  profilInstance: profilSommeInfinie,
};
