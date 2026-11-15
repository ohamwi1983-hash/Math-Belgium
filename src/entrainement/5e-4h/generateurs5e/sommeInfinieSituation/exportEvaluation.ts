import { donnees, frac, divise, partieFixe, valeur } from "../../core5e/sommeInfinieSituation.types";
import type { ExerciceSommeInfinie } from "../../core5e/sommeInfinieSituation.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { PHASES } from "../../moteur5e/typesSommeInfinieSituation";
import type { PhaseSommeInfinie } from "../../moteur5e/typesSommeInfinieSituation";
import {
  aideNiveau1,
  calculSommeLatex,
  conditionFragments,
  consigneEcran,
  consigneGenerale,
  fracLatex,
  nbLatex,
  questionFinale,
  reponseFragments,
  reponseRecap,
} from "../../ui5e/formatSommeInfinieSituation";
import { PALETTE_PAPIER, construireSvgSommeInfinie } from "../../export5e/svgSommeInfinieSituation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSommeInfinie } from "./index";
import type { IdVarianteSommeInfinie } from "./index";
import { profilSommeInfinie } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSommeInfinie>` de `5gen48` « Somme infinie en
 * situation » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la situation (consigne générale de l'écran, figure pour les rebonds et les figures
 *   emboîtées), la question du problème et UNE demande de justification par la somme infinie ; les
 *   quatre étapes d'apprentissage (u₁, q, S∞ avec |q| < 1, réponse) passent dans le corrigé.
 * - Corrigé : une étape par écran (lettres a, b, c, d), valeurs tirées des MÊMES fonctions que l'écran
 *   (`aideNiveau1`, `reponseFragments`, `reponseRecap`, `calculSommeLatex`), une ligne « Piège »
 *   ciblée, une conclusion qui interprète le résultat.
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
function difficulte(e: ExerciceSommeInfinie): 1 | 2 | 3 {
  switch (e.variante) {
    case "periodique":
      return e.sousCas === "pur" ? 2 : 3;
    case "figures":
      return e.sousCas === "triangle" ? 2 : 3;
    default:
      return 3;
  }
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function nomPoursuivi(e: ExerciceSommeInfinie): string {
  if (e.variante !== "zenon") return "";
  return e.contexte === "achille" ? "la tortue" : e.contexte === "chien" ? "le maître" : "le piéton";
}

function nomPoursuivant(e: ExerciceSommeInfinie): string {
  if (e.variante !== "zenon") return "";
  return e.contexte === "achille" ? "Achille" : e.contexte === "chien" ? "le chien" : "le cycliste";
}

/** La ligne « Piège », sur l'étape où l'erreur classique se commet. */
function piege(e: ExerciceSommeInfinie): { phase: PhaseSommeInfinie; fragments: FragmentConsigne[] } {
  switch (e.variante) {
    case "periodique":
      if (valeur(partieFixe(e)) !== 0) {
        return { phase: "reponse", fragments: [t("Le nombre vaut la partie qui ne se répète pas PLUS "), f("S_\\infty"), t(" : l'oublier est l'erreur la plus fréquente ; la fraction finale doit encore être simplifiée.")] };
      }
      return { phase: "raison", fragments: [t(`Le bloc qui se répète compte ${e.periode.length} chiffres : d'un terme au suivant, il se décale de ${e.periode.length} rangs, donc `), f(`q=${fracLatex(donnees(e).q)}`), t(", et non "), f("\\dfrac{1}{10}"), t(".")] };
    case "rebonds":
      return {
        phase: "reponse",
        fragments: [t("Compter une seule fois les montées et les descentes donne "), f("h+S_\\infty"), t(" : chaque remontée est suivie d'une descente de même longueur ; seule la première chute n'est comptée qu'une fois.")],
      };
    case "zenon":
      return {
        phase: "premierTerme",
        fragments: [t(`La suite (uₙ) suit ${nomPoursuivi(e)} : à la 1re étape, ${nomPoursuivi(e)} parcourt `), f(`\\dfrac{${e.avance}}{${e.k}}`), t(` m ; les ${e.avance} m sont la distance parcourue par ${nomPoursuivant(e)}.`)],
      };
    case "figures":
      if (e.sousCas === "triangle") return { phase: "raison", fragments: [t("Joindre les milieux divise les côtés par 2 mais l'aire par 4 : "), f("q=\\dfrac{1}{4}"), t(", pas "), f("\\dfrac{1}{2}"), t(".")] };
      return { phase: "raison", fragments: [t("Une couronne sur deux est coloriée : d'une couronne coloriée à la suivante, l'aire est multipliée DEUX fois par "), f("\\dfrac{3}{4}"), t(", donc "), f("q=\\dfrac{9}{16}"), t(".")] };
  }
}

function conclusion(e: ExerciceSommeInfinie): FragmentConsigne[] {
  const d = donnees(e);
  switch (e.variante) {
    case "periodique":
      return [t("Donc "), f(`x=${fracLatex(d.reponse)}`), t(" : un nombre décimal illimité périodique s'écrit toujours comme une fraction.")];
    case "rebonds":
      return [t("Une infinité de rebonds, mais une distance totale finie : "), f(nbLatex(d.reponse)), t(`${uniteTexte(e)}.`)];
    case "zenon":
      return [t(`Une infinité d'étapes, mais une distance finie : ${nomPoursuivant(e)} rattrape ${nomPoursuivi(e)} à `), f(nbLatex(d.reponse)), t(" m de son point de départ — le paradoxe de Zénon est levé.")];
    case "figures":
      return [t("L'aire non coloriée vaut "), f(nbLatex(d.reponse)), t(" cm², soit "), f(fracLatex(divise(d.reponse, frac(e.aire)))), t(` de l'aire ${e.sousCas === "triangle" ? "du grand triangle" : "du premier hexagone"}.`)];
  }
}

function correctionDetaillee(e: ExerciceSommeInfinie): EtapeCorrection[] {
  const p = piege(e);
  return PHASES.flatMap((phase, i): EtapeCorrection[] => {
    const sousQuestion = LETTRES[i];
    const aide = aideNiveau1(e, phase);
    const lignes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion, fragments: [t(aide.texte), ...(aide.latex ? [t(" "), f(aide.latex)] : [])] }];
    if (phase === "sommeInfinie") {
      lignes.push({ label: "Condition", sousQuestion, fragments: [...conditionFragments(e), t(".")] });
      lignes.push({ label: "Calcul", sousQuestion, fragments: [f(calculSommeLatex(e)), t(`${uniteTexte(e)}.`)] });
    } else {
      lignes.push({ label: "Calcul", sousQuestion, fragments: reponseFragments(e, phase) });
    }
    if (phase === "reponse") lignes.push({ label: "Conclusion", sousQuestion, fragments: conclusion(e) });
    if (p.phase === phase) lignes.push({ label: "Piège", sousQuestion, fragments: p.fragments });
    return lignes;
  });
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilSommeInfinie,
};
