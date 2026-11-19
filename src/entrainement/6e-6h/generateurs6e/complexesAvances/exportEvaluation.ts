import type { ExerciceComplexesAvances, ExerciceComplexesD } from "../../core6e/complexesAvances.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { blocDonnees, consigneEcran, consigneGenerale, equationDReelles, formatReponseAttenduePhaseLatex } from "../../ui6e/formatComplexesAvances";
import { phasesPourExercice } from "../../moteur6e/typesComplexesAvances";
import type { PhaseComplexesAvances } from "../../moteur6e/typesComplexesAvances";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComplexesAvances } from "./index";
import type { IdVarianteComplexesAvances } from "./index";
import { profilComplexesAvances } from "../profilsEvaluationComplexes40-42";
import { correctionDetailleeComplexesAvances, piege } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComplexesAvances>` pour `6gen42` (Compléments sur
 * les nombres complexes) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (titres « Étape n — … » du corrigé), nettoyées des
 *   tournures d'écran (« une seule tentative », « confirmé », saisie « zb », « une ligne par
 *   solution »…).
 * - `enoncePapier` : énoncé + consigne globale (A, B, C, D coef/modules, E) ; deux vraies questions
 *   pour D ratio (résoudre uⁿ = k, puis z) et D réelles (la valeur de m, puis les solutions). Les QCM
 *   d'écran (A, C, E) deviennent des questions ouvertes ; le verdict de C (|z′| = 1 ou non) n'est
 *   jamais annoncé.
 * - Figures du corrigé (`figureHtml`) : le lieu géométrique (droite, cercle, demi-droite(s), points
 *   exclus), l'intersection droite-cercle, la condition de A (demi-droites hors d'un disque), le
 *   cercle unité et la médiatrice (D modules), les droites (AB) et (CD) (E).
 * - Les variantes « approfondissement » (Thalès, Apollonius) restent hors du tirage libre
 *   (`genererExerciceComplexesAvances`) : elles ne sortent que si le professeur les choisit.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

/** Tournures d'écran → papier, appliquées aux consignes d'écran réutilisées comme titres d'étapes. */
const REECRITURES: [RegExp, string][] = [
  [/ \(une seule tentative\)/g, ""],
  [/ \(un champ par condition\)/g, ""],
  [/ \(une ligne par solution\)/g, ""],
  [/ \(expression en z et zb\)/g, ""],
  [/ \(calculatrice autorisée\)/g, ""],
  [/confirmées/g, "obtenues"],
  [/confirmée/g, "obtenue"],
  [/confirmés/g, "obtenus"],
  [/confirmé/g, "obtenu"],
  [/donnes-en/g, "donne-en"],
  [/\bzb\b/g, "z̄"],
];

function papier(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map((fr) => (fr.type === "texte" ? { ...fr, valeur: REECRITURES.reduce((s, [re, par]) => s.replace(re, par), fr.valeur) } : fr));
}

/** Données d'écran, séparées par des virgules (l'écran les espace seulement par « \quad »). */
const virgules = (l: string) => l.replace(/\\quad /g, ",\\quad ");
const donnees = (e: ExerciceComplexesAvances): FragmentConsigne[] => [t(" Données : "), f(blocDonnees(e).map(virgules).join(",\\quad ")), t(".")];

// ---------------------------------------------------------------------------------------------
// Énoncé papier
// ---------------------------------------------------------------------------------------------

function entetePapier(e: ExerciceComplexesAvances): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [
        t("On considère un nombre complexe non nul "),
        f("z=a+bi"),
        t(" (a et b réels) d'argument θ, et les entiers "),
        f(`n=${e.n}`),
        t(" et "),
        f(`k=${e.k}`),
        t(". Détermine la condition sur a et b pour que "),
        f("z^n"),
        t(" soit un réel strictement supérieur à k."),
      ];
    case "B":
      return [
        ...consigneGenerale(e),
        ...(e.sousType === "intersection" ? [] : [t(" Précise ses éléments caractéristiques (points, centre et rayon, origine…) et les points exclus éventuels.")]),
        ...donnees(e),
      ];
    case "C": {
      const [ligneP, transformation] = blocDonnees(e);
      const [p, pBarre] = ligneP.split("\\quad ");
      return [
        t("Le point d'affixe z appartient au cercle unité ("),
        f("|z|=1"),
        t(", donc "),
        f("z\\cdot\\bar z=1"),
        t("), et on pose "),
        f(transformation),
        t(" avec "),
        f(p),
        t(" (donc "),
        f(pBarre),
        t("). Le point d'affixe z′ est-il lui aussi sur le cercle unité ? Justifie sans poser z = x + yi."),
      ];
    }
    case "D":
      return entetePapierD(e);
    case "E":
      return [...consigneGenerale(e), ...donnees(e), t(" Donne l'argument en valeur exacte, ou arrondi au centième si ce n'est pas un angle remarquable.")];
  }
}

function entetePapierD(e: ExerciceComplexesD): FragmentConsigne[] {
  switch (e.sousType) {
    case "ratio":
      return [t("On considère l'équation "), f("(z+c)^n=k\\cdot z^n"), t(" d'inconnue complexe z ≠ 0, avec "), f(virgules(blocDonnees(e)[0])), t(". On pose "), f("u=\\dfrac{z+c}{z}"), t(".")];
    case "reelles":
      return [t("L'équation suivante, d'inconnue complexe z, dépend d'un paramètre réel m : "), f(equationDReelles(e)), t(".")];
    case "coef":
    case "modules":
      return [...consigneGenerale(e), ...donnees(e)];
  }
}

function questionsPapier(e: ExerciceComplexesAvances): QuestionExercice[] {
  if (e.famille !== "D") return [];
  if (e.sousType === "ratio")
    return [
      { consigne: [t("Résous l'équation "), f("u^n=k"), t(" dans ℂ.")] },
      { consigne: [t("Déduis-en la solution z associée à la solution réelle "), f(`u=${e.m}`), t(".")] },
    ];
  if (e.sousType === "reelles")
    return [{ consigne: [t("Trouve la valeur de m pour laquelle cette équation admet deux solutions réelles.")] }, { consigne: [t("Donne alors ces deux solutions.")] }];
  return [];
}

function etapesParQuestion(e: ExerciceComplexesAvances): string[][] | undefined {
  if (e.famille === "D" && e.sousType === "ratio") return [["a"], ["b"]];
  if (e.famille === "D" && e.sousType === "reelles") return [["a", "b"], ["c"]];
  return undefined;
}

function titreEtape(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] {
  switch (phase) {
    case "aEcran1":
      return [t("Quelle condition sur θ garantit que "), f("z^n"), t(" est un réel strictement positif, et pas seulement un réel ?")];
    case "aEcran2":
      return [t("Traduis cette condition sur θ en une condition sur a et b.")];
    case "aEcran3":
      return [t("Ajoute la condition sur le module pour que "), f("z^n"), t(" dépasse strictement k : écris la condition complète.")];
    case "cEcran3":
      return [t("Remplace "), f("z\\cdot\\bar z"), t(" par 1 dans les deux développements et compare-les. Conclus sur "), f("|z'|"), t(".")];
    case "eEcran3":
      return [t("Conclus : les droites (AB) et (CD) sont-elles parallèles, perpendiculaires, ou ni l'un ni l'autre ?")];
    default:
      return papier(consigneEcran(e, phase));
  }
}

function construireEnonce(e: ExerciceComplexesAvances): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(e: ExerciceComplexesAvances): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function phaseFinale(e: ExerciceComplexesAvances): PhaseComplexesAvances {
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

function reponseFinaleSimple(e: ExerciceComplexesAvances): FragmentConsigne[] {
  if (e.famille === "B" && e.sousType !== "intersection") return [...reponse(e, "bEcran1"), t(" : "), ...reponse(e, "bEcran2")];
  if (e.famille === "E") return [...reponse(e, "eEcran2"), t(" : "), ...reponse(e, "eEcran3")];
  return reponse(e, phaseFinale(e));
}

function enoncePapier(e: ExerciceComplexesAvances): EnoncePapier {
  const questions = questionsPapier(e);
  if (questions.length === 0) return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseFinaleSimple(e) };
  const phases = phasesPourExercice(e);
  const groupes = etapesParQuestion(e) ?? [];
  const rep = groupes.flatMap((lettres, q) => [t(`${q === 0 ? "" : " ; "}${LETTRES[q]}) `), ...reponse(e, phases[LETTRES.indexOf(lettres[lettres.length - 1])])]);
  return { section: { enteteFragments: entetePapier(e), questions }, etapesParQuestion: groupes, reponseBreve: rep };
}

const correctionDetaillee = correctionDetailleeComplexesAvances;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceComplexesAvances): CriteresDifficulte {
  let methode: 0 | 1 = 1;
  let piege: 0 | 1 = 1;
  if (e.famille === "B") {
    if (e.sousType === "cercleA" || e.sousType === "cercleO") [methode, piege] = [0, 0];
    else if (e.sousType === "intersection" || e.sousType === "apollonius") piege = 0;
  } else if (e.famille === "C") piege = 0;
  else if (e.famille === "D") [methode, piege] = e.sousType === "ratio" ? [0, 1] : [1, 0];
  else if (e.famille === "E") methode = 0;
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode, piege, anglesEnPi: true };
}

function reponseBreve(e: ExerciceComplexesAvances): FragmentConsigne[] {
  return enoncePapier(e).reponseBreve ?? reponseFinaleSimple(e);
}

function poids(e: ExerciceComplexesAvances): number[] {
  switch (e.famille) {
    case "A":
      return [1.5, 1.5, 1];
    case "B":
      return e.sousType === "intersection" ? [1.5, 1, 1.5] : [2, 2];
    case "C":
      return [1.5, 1.5, 1];
    case "D":
      return { ratio: [2.5, 1.5], reelles: [1.5, 1.5, 1], coef: [2, 2], modules: [1, 3] }[e.sousType];
    case "E":
      return [2, 1, 1];
  }
}

function bareme(e: ExerciceComplexesAvances): BaremeExercice {
  const phases = phasesPourExercice(e);
  const p = poids(e);
  const erreurs = phases.map((phase) => piege(e, phase)).filter((x): x is FragmentConsigne[] => !!x);
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(e, phase), points: p[i] })),
    erreursFrequentes: erreurs.map((description) => ({ description, cout: "−1" })),
    reponsesAcceptees: [[t("Toute équation équivalente (forme développée ou réduite)")], [t("Tout argument égal à 2π près (à π près pour un argument modulo π)")]],
  };
}

export const adaptateurEvaluationComplexesAvances: AdaptateurFeuilleExercices<ExerciceComplexesAvances> = {
  titreDocument: "Compléments sur les nombres complexes — Évaluation",
  nomFichierBase: "complexes-avances",
  genererInstance: genererExerciceComplexesAvances,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteComplexesAvances),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilComplexesAvances,
};
