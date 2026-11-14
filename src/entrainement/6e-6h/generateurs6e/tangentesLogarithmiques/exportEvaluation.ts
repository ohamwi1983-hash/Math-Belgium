import type { ContactTangente, ExerciceTangentesLog } from "../../core6e/tangentesLogarithmiques.types";
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
import { phasesExercice } from "../../moteur6e/typesTangentesLogarithmiques";
import type { PhaseTangentesLog } from "../../moteur6e/typesTangentesLogarithmiques";
import { consigneGenerale, formatReponseAttendueLatex, penteD, pointP, x0Latex } from "../../ui6e/formatTangentesLogarithmiques";
import { figureTangentesSvg } from "../../ui6e/figureTangentesLogarithmiques";
import { latexComb, latexEquation, latexEquationNonDeveloppee } from "./exact";
import { profilTangentesLog } from "./profil";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangentesLog } from "./index";
import type { IdVarianteTangentesLog } from "./index";

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

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function calculEquation(c: ContactTangente, prefixe: FragmentConsigne[] = []): FragmentConsigne[] {
  const finale = latexEquation(c.m, c.p);
  const nonDev = latexEquationNonDeveloppee(c);
  return nonDev === finale ? [...prefixe, f(finale)] : [...prefixe, f(nonDev), t(", soit après développement "), f(finale)];
}

function valeurEn(e: ExerciceTangentesLog, c: ContactTangente): FragmentConsigne {
  const x0 = latexComb(c.x0);
  const brut = e.fonction.fDe(x0);
  const exact = latexComb(c.fx0);
  return f(brut === exact ? `f\\left(${x0}\\right)=${exact}` : `f\\left(${x0}\\right)=${brut}=${exact}`);
}

function penteEn(e: ExerciceTangentesLog, c: ContactTangente): FragmentConsigne {
  const x0 = latexComb(c.x0);
  const brut = e.fonction.dfDe(x0);
  const exact = latexComb(c.dfx0);
  return f(brut === exact ? `f'\\left(${x0}\\right)=${exact}` : `f'\\left(${x0}\\right)=${brut}=${exact}`);
}

const LIGNE_FORMULE: FragmentConsigne[] = [t("Tangente au point d'abscisse x₀ : "), f("y=f'(x_0)(x-x_0)+f(x_0)"), t(".")];

function lignesEtape(e: ExerciceTangentesLog, phase: PhaseTangentesLog): EtapeCorrection[] {
  const sq = lettre(e, phase);
  const fn = e.fonction;
  const c = e.contacts[0];
  const L = (label: string, fragments: FragmentConsigne[], figure = false): EtapeCorrection => ({
    label,
    sousQuestion: sq,
    fragments,
    ...(figure ? { figureHtml: figureTangentesSvg(e, true) } : {}),
  });
  const conclusion = (figure = false) => L("Conclusion", [...reponseEtape(e, phase), t(".")], figure);
  const domaine = L("Domaine", [t("f est définie sur "), f(fn.domaineLatex), t(".")]);
  switch (phase) {
    case "derivee":
      return [domaine, L("Méthode", [t(`${fn.regle.texte} `), f(fn.regle.latex ?? ""), t(".")]), L("Calcul", [t(`${fn.detail.texte} `), f(fn.detail.latex ?? ""), t(".")]), conclusion()];
    case "valeurs":
      return [L("Calcul", [valeurEn(e, c), t(" ; "), penteEn(e, c), t(".")]), conclusion()];
    case "equation":
      if (e.variante === "origine") {
        return [
          L("Calcul", [penteEn(e, c), t(" ; la tangente passe par "), f(pointP(e)), t(", son ordonnée à l'origine vaut donc "), f(latexComb(e.pP)), t(".")]),
          conclusion(true),
        ];
      }
      return [
        L("Méthode", LIGNE_FORMULE),
        L("Calcul", [...calculEquation(c), t(".")]),
        conclusion(true),
        L("Piège", [t("Prendre "), f("f(x_0)"), t(" pour ordonnée à l'origine : la tangente passe par le point de contact "), f("(x_0\\,;\\,f(x_0))"), t(", pas par "), f("(0\\,;\\,f(x_0))"), t(".")]),
      ];
    case "solutions": {
      if (e.variante !== "parallele") return [];
      const lignes: EtapeCorrection[] = [
        L("Méthode", [t("Deux droites parallèles ont la même pente : on résout "), f(`f'(x)=${penteD(e)}`), t(" dans le domaine "), f(fn.domaineLatex), t(".")]),
        L("Calcul", [f(e.chaineEquation), t(".")]),
      ];
      if (e.double) {
        lignes.push(L("Calcul", [t("Le discriminant est nul : une racine double, "), f(`x=${e.racines[0]}`), t(".")]));
      } else {
        lignes.push(L("Calcul", [t("Solutions de l'équation du second degré : "), f(e.racines.map((r) => `x=${r}`).join("\\quad ")), t(".")]));
      }
      for (const r of e.rejetees) lignes.push(L("Condition", [f(`${r}\\notin ${fn.domaineLatex}`), t(" : cette valeur est rejetée.")]));
      lignes.push(conclusion());
      lignes.push(
        L(
          "Piège",
          e.rejetees.length > 0
            ? [t("Garder la racine négative : elle n'est pas dans le domaine de f, aucune tangente n'y existe.")]
            : e.double
              ? [t("Conclure qu'il n'y a pas de tangente quand le discriminant est nul : une racine double donne UNE tangente.")]
              : [t("S'arrêter à la première solution : chacune des deux racines donne une tangente.")],
        ),
      );
      return lignes;
    }
    case "equations":
      return [
        L("Méthode", LIGNE_FORMULE),
        ...e.contacts.map((k) => L("Calcul", [valeurEn(e, k), t(" ; pente "), f(latexComb(k.m)), t(" : "), ...calculEquation(k), t(".")])),
        conclusion(true),
      ];
    case "tangenteA":
      if (e.variante !== "origine") return [];
      return [domaine, L("Méthode", [t("Tangente au point d'abscisse a : "), f("y=f'(a)(x-a)+f(a)"), t(".")]), L("Calcul", [f(`f(a)=${e.faLatex},\\qquad f'(a)=${e.dfaLatex}`), t(".")]), conclusion()];
    case "valeurA":
      if (e.variante !== "origine") return [];
      return [
        L("Méthode", [f("P"), t(" appartient à la tangente : on remplace "), f("x"), t(" par 0 et "), f("y"), t(" par "), f(latexComb(e.pP)), t(".")]),
        L("Calcul", [f(e.resolution), t(".")]),
        L("Conclusion", [...reponseEtape(e, phase), t(", qui appartient bien au domaine de f.")]),
        L("Piège", [t("Remplacer x par 0 dans f elle-même : P n'est pas un point de la courbe (0 n'est même pas dans le domaine) ; c'est l'équation de la tangente qu'il doit vérifier.")]),
      ];
  }
}

function correctionDetaillee(e: ExerciceTangentesLog): EtapeCorrection[] {
  return phasesExercice(e).flatMap((phase) => lignesEtape(e, phase));
}

function difficulte(e: ExerciceTangentesLog): 1 | 2 | 3 {
  return e.variante === "point" ? 2 : 3;
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilTangentesLog,
};
