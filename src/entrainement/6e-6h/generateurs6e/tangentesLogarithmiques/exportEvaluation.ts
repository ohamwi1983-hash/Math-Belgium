import type { ExerciceTangentesLog } from "../../core6e/tangentesLogarithmiques.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesExercice } from "../../moteur6e/typesTangentesLogarithmiques";
import type { PhaseTangentesLog } from "../../moteur6e/typesTangentesLogarithmiques";
import { consigneGenerale, formatReponseAttendueLatex, penteD, x0Latex } from "../../ui6e/formatTangentesLogarithmiques";
import { latexComb, latexEquation } from "./exact";
import { profilTangentesLog } from "./profil";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangentesLog } from "./index";
import type { IdVarianteTangentesLog } from "./index";
import { correctionDetailleeTangentesLog } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTangentesLog>` de `6gen87` « Tangentes aux courbes
 * logarithmiques » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la fonction, la donnée (x₀, droite d ou point P) et UNE consigne globale ; les
 *   trois écrans deviennent les étapes du corrigé (« Étape n — … »). Aucune figure dans l'énoncé
 *   (rien à y lire) ; la courbe et la ou les tangentes vont dans le corrigé (`figureHtml`).
 * - Corrigé : valeurs tirées des MÊMES fonctions que l'écran (`formatReponseAttendueLatex`,
 *   `exact.ts`), domaine rappelé d'emblée, une ligne « Piège » ciblée.
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = ["a", "b", "c"];

function lettre(e: ExerciceTangentesLog, phase: PhaseTangentesLog): string {
  return LETTRES[phasesExercice(e).indexOf(phase)];
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function entetePapier(e: ExerciceTangentesLog): FragmentConsigne[] {
  return [...consigneGenerale(e), t(" Donne les résultats sous forme exacte.")];
}

/** Titres d'étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceTangentesLog, phase: PhaseTangentesLog): FragmentConsigne[] {
  switch (phase) {
    case "derivee":
      return [t("Calcule "), f("f'(x)"), t(".")];
    case "valeurs":
      return [t("Calcule "), f(`f\\left(${x0Latex(e)}\\right)`), t(" et "), f(`f'\\left(${x0Latex(e)}\\right)`), t(".")];
    case "equation":
      return [t(e.variante === "origine" ? "Écris l'équation de la tangente cherchée sous la forme " : "Écris l'équation de la tangente sous la forme "), f("y=mx+p"), t(".")];
    case "solutions":
      return [t("Résous "), f(`f'(x)=${penteD(e)}`), t(" dans le domaine de f : abscisses des points de contact.")];
    case "equations":
      return [t("Écris l'équation de chaque tangente parallèle à "), f("d"), t(".")];
    case "tangenteA":
      return [t("Écris l'équation de la tangente au point d'abscisse "), f("a"), t(", en fonction de "), f("a"), t(".")];
    case "valeurA":
      return [t("Exprime que "), f("P"), t(" appartient à cette tangente et déduis-en "), f("a"), t(".")];
  }
}

function reponseEtape(e: ExerciceTangentesLog, phase: PhaseTangentesLog): FragmentConsigne[] {
  return formatReponseAttendueLatex(e, phase).flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function construireEnonce(e: ExerciceTangentesLog): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceTangentesLog): BlocCorrection[] {
  return phasesExercice(e).map((phase) => ({ type: "paragraphe", fragments: [t(`${lettre(e, phase)}) `), ...reponseEtape(e, phase)] }));
}

function reponseBreve(e: ExerciceTangentesLog): FragmentConsigne[] {
  const eqs = e.contacts.map((c) => latexEquation(c.m, c.p));
  if (e.variante === "parallele") {
    return eqs.length === 1
      ? [t("Une seule tangente : "), f(eqs[0])]
      : [t("Deux tangentes : "), f(eqs[0]), t(" et "), f(eqs[1])];
  }
  if (e.variante === "origine") return [f(eqs[0]), t(" (point de contact d'abscisse "), f(latexComb(e.contacts[0].x0)), t(")")];
  return [f(eqs[0])];
}

function enoncePapier(e: ExerciceTangentesLog): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

const correctionDetaillee = correctionDetailleeTangentesLog;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceTangentesLog): CriteresDifficulte {
  const r = e.variante === "point" ? 0 : 1;
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: r, piege: r };
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

function bareme(e: ExerciceTangentesLog): BaremeExercice {
  const r = (phase: PhaseTangentesLog) => reponseEtape(e, phase);
  let criteres: CritereBareme[] = [];
  let erreursFrequentes: ErreurFrequente[] = [];
  switch (e.variante) {
    case "point":
      criteres = [
        { sousQuestion: "a", critere: [t("Dérivée : "), ...r("derivee")], points: 1 },
        { sousQuestion: "b", critere: [t("Valeurs exactes : "), ...r("valeurs")], points: 1 },
        { sousQuestion: "c", critere: [t("Équation de la tangente : "), ...r("equation")], points: 2 },
      ];
      erreursFrequentes = [
        { description: [t("Ordonnée à l'origine prise égale à "), f("f(x_0)")], cout: "−1" },
        { description: [t("Règle de dérivation mal appliquée (chaîne, produit, quotient, base a)")], cout: "0 pt sur a)" },
      ];
      break;
    case "parallele":
      criteres = [
        { sousQuestion: "a", critere: [t("Dérivée : "), ...r("derivee")], points: 1 },
        { sousQuestion: "b", critere: [t("Équation "), f(`f'(x)=${penteD(e)}`), t(" résolue, domaine vérifié : "), ...r("solutions")], points: 1.5 },
        { sousQuestion: "c", critere: [t("Équation(s) des tangentes : "), ...r("equations")], points: 1.5 },
      ];
      erreursFrequentes = [
        { description: [t("Solution hors du domaine conservée, ou solution oubliée")], cout: "−1" },
        { description: [t("Pente de la tangente différente de celle de d")], cout: "0 pt sur b)" },
      ];
      break;
    case "origine":
      criteres = [
        { sousQuestion: "a", critere: [t("Tangente au point d'abscisse a : "), ...r("tangenteA")], points: 1.5 },
        { sousQuestion: "b", critere: [t("Condition « P sur la tangente » et résolution : "), ...r("valeurA")], points: 1.5 },
        { sousQuestion: "c", critere: [t("Équation de la tangente : "), ...r("equation")], points: 1 },
      ];
      erreursFrequentes = [
        { description: [t("Point P substitué dans f au lieu de l'équation de la tangente")], cout: "0 pt sur b)" },
        { description: [t("Confusion entre l'abscisse a du point de contact et l'abscisse de P")], cout: "−1" },
      ];
      break;
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes,
    reponsesAcceptees: [[t("Toute équation équivalente, par exemple sous la forme "), f("ux+vy+w=0")], [t("Valeurs exactes non simplifiées mais correctes")]],
  };
}

export const adaptateurEvaluationTangentesLog: AdaptateurFeuilleExercices<ExerciceTangentesLog> = {
  titreDocument: "Tangentes aux courbes logarithmiques — Évaluation",
  nomFichierBase: "tangentes-courbes-logarithmiques",
  genererInstance: genererExerciceTangentesLog,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteTangentesLog),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilTangentesLog,
};
