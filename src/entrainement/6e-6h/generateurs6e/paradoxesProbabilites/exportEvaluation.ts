import type { ExerciceParadoxesProbabilites } from "../../core6e/paradoxesProbabilites.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { valeursAttendues } from "../../moteur6e/verificationParadoxesProbabilites";
import {
  UNIVERS_DEUX_ENFANTS,
  blocDonnees,
  conclusionCorrecte,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  fractionLatex,
  informationTexte,
  issueFavorable,
  issuesCompatibles,
  millieme,
} from "../../ui6e/formatParadoxesProbabilites";
import { figureCorrigeSvg } from "../../ui6e/figureParadoxesProbabilites";
import { VARIANTES_CALCULATRICE_PARADOXES, profilParadoxesProbabilites } from "../profilsEvaluationParadoxes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceParadoxesProbabilites } from "./index";
import type { IdVarianteParadoxesProbabilites } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceParadoxesProbabilites>` de `6gen76` « Quand
 * l'intuition se trompe » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : l'histoire (consigne générale de l'écran, raisonnement de Méré compris) et UNE
 *   consigne globale. L'écran de PRÉDICTION (non noté, propre au générateur interactif) disparaît ;
 *   les trois autres écrans deviennent les étapes du corrigé (« Étape n — … »), lettres a, b, c.
 * - Corrigé : valeurs tirées des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`,
 *   `conclusionCorrecte`), une ligne « Piège » par étape où il y en a un, l'arbre en `figureHtml`
 *   (Monty Hall, deux enfants).
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

type Etape = "modeliser" | "calculer" | "conclure";
const ETAPES: Etape[] = ["modeliser", "calculer", "conclure"];
const LETTRES: Record<Etape, string> = { modeliser: "a", calculer: "b", conclure: "c" };

function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function listeIssues(issues: readonly string[]): string {
  return `\\{${issues.map((i) => `\\mathrm{${i}}`).join("\\,;\\,")}\\}`;
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function entetePapier(e: ExerciceParadoxesProbabilites): FragmentConsigne[] {
  const histoire = consigneGenerale(e);
  switch (e.famille) {
    case "mere":
      return [
        ...histoire,
        t(" "),
        f(blocDonnees(e)[0]),
        t(". Calcule la probabilité de gagner chaque pari (valeur exacte, puis arrondie au millième). Chaque pari est-il favorable au joueur ? Lequel est le meilleur ? Que penser du raisonnement de Méré ?"),
      ];
    case "montyHall":
      return [...histoire, t(" Calcule "), f("P(G)"), t(" et "), f("P(C)"), t(" (valeurs exactes), puis dis s'il vaut mieux garder sa porte ou en changer.")];
    case "deuxEnfants":
      return [...histoire, t(" Calcule-la en justifiant à l'aide d'issues équiprobables (sexe de l'aîné, puis du cadet).")];
  }
}

/** Titres d'étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceParadoxesProbabilites, etape: Etape): FragmentConsigne[] {
  switch (e.famille) {
    case "mere":
      if (etape === "modeliser") return [t("Calcule "), f("P(\\overline{A_1})"), t(" et "), f("P(\\overline{A_2})"), t(" en passant par l'événement contraire « aucun ».")];
      if (etape === "calculer") return [t("Déduis-en "), f("P(A_1)"), t(" et "), f("P(A_2)"), t(".")];
      return [t("Conclus : quels paris sont favorables au joueur, et lequel est le meilleur ?")];
    case "montyHall":
      if (etape === "modeliser") return [t("Construis l'arbre de ce que sait l'animateur : donne "), f("P(V)"), t(" et "), f("P(C\\mid\\overline{V})"), t(".")];
      if (etape === "calculer") return [t("Calcule "), f("P(G)"), t(" et "), f("P(C)"), t(".")];
      return [t("Conclus : faut-il garder sa porte ou en changer ?")];
    case "deuxEnfants":
      if (etape === "modeliser") return [t("Écris l'univers des issues équiprobables, puis les événements "), f("A"), t(" et "), f("B"), t(".")];
      if (etape === "calculer") return [t("Calcule "), f("P(B\\mid A)"), t(".")];
      return [t("Conclus en justifiant.")];
  }
}

function reponseEtape(e: ExerciceParadoxesProbabilites, etape: Etape): FragmentConsigne[] {
  return etape === "conclure" ? conclusionCorrecte(e) : liste(formatReponseAttenduePhaseLatex(e, etape));
}

function construireEnonce(e: ExerciceParadoxesProbabilites): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: ETAPES.map((etape) => ({ consigne: titreEtape(e, etape) })) };
}

function construireCorrection(e: ExerciceParadoxesProbabilites): BlocCorrection[] {
  return ETAPES.map((etape) => ({ type: "paragraphe", fragments: [t(`${LETTRES[etape]}) `), ...reponseEtape(e, etape)] }));
}

function reponseBreve(e: ExerciceParadoxesProbabilites): FragmentConsigne[] {
  return [...liste(formatReponseAttenduePhaseLatex(e, "calculer")), t(". "), ...conclusionCorrecte(e), t(".")];
}

function enoncePapier(e: ExerciceParadoxesProbabilites): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function piege(e: ExerciceParadoxesProbabilites, etape: Etape): FragmentConsigne[] | null {
  switch (e.famille) {
    case "mere":
      if (etape === "modeliser") return [t("Calculer la probabilité de « quatre 6 », "), f("\\left(\\frac{1}{6}\\right)^{4}"), t(", au lieu de celle de « aucun 6 » : le contraire de « au moins un » est « aucun », pas « tous ».")];
      if (etape === "conclure") {
        return [
          t("Raisonner par proportionnalité, "),
          f("4\\times\\frac{1}{6}"),
          t(" ou "),
          f(`${e.kLancersDouble}\\times\\frac{1}{36}`),
          t(" : on compte plusieurs fois les parties où le 6 sort plusieurs fois. Avec 7 lancers, ce calcul dépasserait même 1."),
        ];
      }
      return null;
    case "montyHall":
      if (etape === "conclure") {
        return [
          t("Croire que les portes encore fermées sont équiprobables (« ça revient au même ») : l'animateur sait où est la voiture et ne choisit pas au hasard la porte qu'il ouvre ; ta porte garde sa probabilité "),
          f(fractionLatex(1, e.nPortes, "t")),
          t("."),
        ];
      }
      if (etape === "modeliser") return [t("Mettre à jour "), f("P(V)"), t(" après l'ouverture d'une porte : l'animateur peut TOUJOURS ouvrir une porte à chèvre, son geste n'apprend rien sur ta porte.")];
      return null;
    case "deuxEnfants":
      if (etape !== "modeliser") return null;
      return e.information === "auMoinsUn"
        ? [t("Traiter les trois compositions « deux garçons », « un garçon et une fille », « deux filles » comme équiprobables : « un garçon et une fille » regroupe deux issues, GF et FG.")]
        : [t("Confondre cette information avec « au moins un des deux » : elle désigne un enfant précis, seul le sexe de l'autre enfant reste inconnu.")];
  }
}

function methode(e: ExerciceParadoxesProbabilites, etape: Etape): FragmentConsigne[] {
  switch (e.famille) {
    case "mere":
      if (etape === "modeliser") {
        return [
          t("Le contraire de « au moins un 6 en 4 lancers » est « pas de 6 à chacun des 4 lancers » ; les lancers sont indépendants, on multiplie. Avec deux dés, un double six a la probabilité "),
          f("\\frac{1}{6}\\times\\frac{1}{6}=\\frac{1}{36}"),
          t(", son contraire "),
          f("\\frac{35}{36}"),
          t("."),
        ];
      }
      if (etape === "calculer") return [t("On revient à l'événement lui-même : "), f("P(A)=1-P(\\overline{A})"), t(".")];
      return [t("Un pari est favorable au joueur quand sa probabilité de gain dépasse "), f("\\frac{1}{2}"), t(".")];
    case "montyHall": {
      const n = e.nPortes;
      if (etape === "modeliser") {
        return n === 3
          ? [t("Au moment du choix, les 3 portes sont équiprobables, et l'animateur ne déplace pas la voiture. Si elle n'est pas derrière ta porte, elle n'est pas derrière la porte ouverte : elle est derrière la dernière porte fermée, et changer gagne à coup sûr.")]
          : [
              t(`Au moment du choix, les ${n} portes sont équiprobables, et l'animateur ne déplace pas la voiture. Si elle n'est pas derrière ta porte, elle n'est pas derrière la porte ouverte : elle est derrière l'une des ${n - 2} portes que tu peux prendre en changeant, au hasard.`),
            ];
      }
      if (etape === "calculer") return [t("En gardant, on gagne exactement quand "), f("V"), t(" est réalisé. En changeant, on ne peut gagner que sur la branche "), f("\\overline{V}"), t(" : on multiplie les probabilités le long de cette branche.")];
      return [
        f(`P(C)=${fractionLatex(n - 1, n * (n - 2))}>${fractionLatex(1, n)}=P(G)`),
        ...(n === 3 ? [t(" : changer double la probabilité de gagner.")] : [t(" : changer multiplie la probabilité de gagner par "), f(fractionLatex(n - 1, n - 2)), t(".")]),
      ];
    }
    case "deuxEnfants": {
      const compat = issuesCompatibles(e);
      if (etape === "modeliser") {
        return [
          t("Les quatre issues "),
          f(`\\Omega=${listeIssues(UNIVERS_DEUX_ENFANTS)}`),
          t(` (sexe de l'aîné en premier) sont équiprobables. L'information « ${informationTexte(e)} » ne garde que les issues compatibles.`),
        ];
      }
      if (etape === "calculer") return [t("Les issues de "), f("A"), t(" restent équiprobables et "), f("B"), t(" est inclus dans "), f("A"), t(" : "), f("P(B\\mid A)=\\dfrac{\\#B}{\\#A}"), t(".")];
      return [t(`Seule l'issue ${issueFavorable(e)} réalise B parmi les ${compat.length} issues équiprobables de A.`)];
    }
  }
}

/** Comparaison au seuil 1/2 (Méré, étape « conclure »). */
function comparaisonMere(e: ExerciceParadoxesProbabilites): FragmentConsigne[] {
  const [p1, p2] = valeursAttendues(e, "calculer");
  const signe = (p: number) => (p > 0.5 ? ">" : "<");
  return [f(`P(A_1)\\approx ${millieme(p1)}${signe(p1)}0{,}5`), t(" et "), f(`P(A_2)\\approx ${millieme(p2)}${signe(p2)}0{,}5`), t(" ; de plus "), f("P(A_1)>P(A_2)"), t(".")];
}

function lignesEtape(e: ExerciceParadoxesProbabilites, etape: Etape): EtapeCorrection[] {
  const sq = LETTRES[etape];
  const lignes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion: sq, fragments: methode(e, etape) }];
  if (etape === "conclure" && e.famille === "mere") lignes.push({ label: "Calcul", sousQuestion: sq, fragments: comparaisonMere(e) });
  const figure = etape === "modeliser" ? figureCorrigeSvg(e) : null;
  lignes.push({ label: "Conclusion", sousQuestion: sq, fragments: [...reponseEtape(e, etape), ...(etape === "conclure" ? [t(".")] : [])], ...(figure ? { figureHtml: figure } : {}) });
  const p = piege(e, etape);
  if (p) lignes.push({ label: "Piège", sousQuestion: sq, fragments: p });
  return lignes;
}

function correctionDetaillee(e: ExerciceParadoxesProbabilites): EtapeCorrection[] {
  return ETAPES.flatMap((etape) => lignesEtape(e, etape));
}

function difficulte(e: ExerciceParadoxesProbabilites): 1 | 2 | 3 {
  if (e.famille === "mere") return 2;
  if (e.famille === "montyHall") return 3;
  return e.information === "auMoinsUn" ? 3 : 2;
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

function bareme(e: ExerciceParadoxesProbabilites): BaremeExercice {
  const m = formatReponseAttenduePhaseLatex(e, "modeliser");
  const c = formatReponseAttenduePhaseLatex(e, "calculer");
  const conclusion = { sousQuestion: "c", critere: [t("Conclusion : "), ...conclusionCorrecte(e)], points: 1 };
  switch (e.famille) {
    case "mere":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Événement contraire du pari 1 : "), f(m[0])], points: 0.75 },
          { sousQuestion: "a", critere: [t("Événement contraire du pari 2 : "), f(m[1])], points: 0.75 },
          { sousQuestion: "b", critere: [f(c[0])], points: 0.75 },
          { sousQuestion: "b", critere: [f(c[1])], points: 0.75 },
          conclusion,
        ],
        erreursFrequentes: [
          { description: [t("Proportionnalité de Méré ("), f("4\\times\\frac{1}{6}"), t(") au lieu de l'événement contraire")], cout: "0 pt sur a) et b)" },
          { description: [t("Probabilité de « tous des 6 » au lieu de « aucun 6 »")], cout: "−1" },
          { description: [t("Donner "), f("P(\\overline{A})"), t(" comme probabilité de gain (oubli de "), f("1-\\ldots"), t(")")], cout: "−0,5" },
        ],
        reponsesAcceptees: [[t("Valeur exacte, valeur arrondie au millième ou pourcentage équivalent")], [t("Arrondi au centième si la comparaison à "), f("\\frac{1}{2}"), t(" reste correcte : la moitié des points du calcul")]],
      };
    case "montyHall":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [f(m[0]), t(", justifiée (le geste de l'animateur ne change rien)")], points: 0.5 },
          { sousQuestion: "a", critere: [f(m[1])], points: 1 },
          { sousQuestion: "b", critere: [f(c[0])], points: 0.5 },
          { sousQuestion: "b", critere: [f(c[1])], points: 1 },
          conclusion,
        ],
        erreursFrequentes: [
          { description: [t("« Ça revient au même » : portes restantes jugées équiprobables")], cout: "0 pt sur b) et c)" },
          { description: [t("Oublier le facteur "), f("\\frac{1}{n-2}"), t(" quand plusieurs portes restent fermées")], cout: "−1" },
        ],
        reponsesAcceptees: [[t("Fractions équivalentes ou décimaux arrondis au millième")], [t("Dénombrement des cas équiprobables (voiture derrière chaque porte) au lieu d'un arbre, s'il aboutit aux mêmes probabilités")]],
      };
    case "deuxEnfants":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Univers de 4 issues équiprobables (aîné, cadet)")], points: 0.5 },
          { sousQuestion: "a", critere: [f(m[0]), t(" ; "), f(m[1])], points: 1 },
          { sousQuestion: "b", critere: [f(c[0])], points: 1.5 },
          conclusion,
        ],
        erreursFrequentes: [
          e.information === "auMoinsUn"
            ? { description: [t("Compositions (2 garçons, 1 garçon et 1 fille, 2 filles) jugées équiprobables : réponse "), f("\\frac{1}{2}")], cout: "0 pt sur a) et b)" }
            : { description: [t("Information traitée comme « au moins un » : réponse "), f("\\frac{1}{3}")], cout: "0 pt sur a) et b)" },
          { description: [t("Information ignorée : réponse "), f("\\frac{1}{4}")], cout: "0 pt sur a) et b)" },
        ],
        reponsesAcceptees: [[t("Calcul par la formule "), f("P(B\\mid A)=\\dfrac{P(A\\cap B)}{P(A)}"), t(" au lieu du dénombrement")], [t("Fraction ou décimal arrondi au millième")]],
      };
  }
}

export const adaptateurEvaluationParadoxesProbabilites: AdaptateurFeuilleExercices<ExerciceParadoxesProbabilites> = {
  titreDocument: "Quand l'intuition se trompe — Évaluation",
  nomFichierBase: "intuition-probabilites",
  genererInstance: genererExerciceParadoxesProbabilites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteParadoxesProbabilites),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilParadoxesProbabilites,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_PARADOXES,
};
