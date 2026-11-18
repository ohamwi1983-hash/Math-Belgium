import type { ExerciceNombresComplexes, ValeurComplexe } from "../../core6e/nombresComplexes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { LIBELLE_PHASE, blocDonnees, consigneEcran, entierComplexeLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatNombresComplexes";
import { phasesPourExercice } from "../../moteur6e/typesNombresComplexes";
import { correctionDetailleeNombresComplexes } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceNombresComplexes, type IdVarianteNombresComplexes } from "./index";
import { LIBELLE_CAS_NOMBRES_COMPLEXES, profilNombresComplexes } from "../profilsEvaluationComplexes34-36";

/**
 * Adaptateur feuille d'exercices / évaluation de `6gen34` (« Nombres complexes : opérations de base
 * et puissances de i ») — méthode `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier = l'expression à calculer + la consigne globale (« Calcule et écris le résultat
 *   sous la forme a+bi »), sans les étapes de guidage de l'écran ni rappel de méthode.
 * - Les écrans (`phasesPourExercice`, `consigneEcran`) deviennent les étapes du corrigé
 *   (`sousQuestion` = lettre de l'écran) ; les valeurs intermédiaires et finales sont celles de
 *   l'écran (`formatReponseAttenduePhaseLatex`, mêmes paramètres bruts de l'instance).
 */


const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Entier entre parenthèses s'il est négatif (facteur d'un produit écrit en clair). */
const p = (n: number) => (n < 0 ? `(${n})` : `${n}`);

const z = (re: number, im: number) => entierComplexeLatex(re, im);
const zv = (v: ValeurComplexe) => entierComplexeLatex(v.re, v.im);

/** Valeur attendue de l'écran n°`i` (même fonction que le récapitulatif de l'écran). */
function attendu(e: ExerciceNombresComplexes, i: number): string {
  return formatReponseAttenduePhaseLatex(e, phasesPourExercice(e)[i]).join(",\\ ");
}

function resultatFinal(e: ExerciceNombresComplexes): string {
  const phases = phasesPourExercice(e);
  return attendu(e, phases.length - 1);
}

function expressionLatex(e: ExerciceNombresComplexes): string {
  return blocDonnees(e).join(",\\ ");
}

// ============================================================================
// Énoncé
// ============================================================================

function entetePapier(e: ExerciceNombresComplexes): FragmentConsigne[] {
  return [texte("Calcule et écris le résultat sous la forme "), latex("a+bi"), texte(" : "), latex(expressionLatex(e)), texte(".")];
}

/** Énoncé « par écrans » : ses questions donnent les titres d'étapes du corrigé (« Étape n — … »). */
function construireEnonce(e: ExerciceNombresComplexes): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function enoncePapier(e: ExerciceNombresComplexes): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] } };
}

function construireCorrection(e: ExerciceNombresComplexes): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `), latex(formatReponseAttenduePhaseLatex(e, phase).join(",\\ "))],
  }));
}

// ============================================================================
// Corrigé détaillé
// ============================================================================

const correctionDetaillee = correctionDetailleeNombresComplexes;

// ============================================================================
// Réponse brève, difficulté, barème
// ============================================================================

function reponseBreve(e: ExerciceNombresComplexes): FragmentConsigne[] {
  return [latex(`${expressionLatex(e)}=${resultatFinal(e)}`)];
}

function difficulte(e: ExerciceNombresComplexes): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
      return 1;
    case "B":
      return e.sousType === "cube" ? 2 : 1;
    case "C":
    case "D":
      return 2;
    case "E":
    case "F":
      return 3;
    case "G":
      return e.n < 0 ? 2 : 1;
  }
}

const crit = (sousQuestion: string, points: number, ...critere: FragmentConsigne[]) => ({ sousQuestion, points, critere });

function bareme(e: ExerciceNombresComplexes): BaremeExercice {
  const reponseFinale = reponseBreve(e);
  switch (e.famille) {
    case "A":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Parties réelles regroupées : "), latex(`${e.a}${e.operation}${p(e.c)}=${e.resultat.re}`)),
          crit("a", 1.5, texte("Parties imaginaires regroupées : "), latex(`${e.b}${e.operation}${p(e.d)}=${e.resultat.im}`)),
          crit("a", 1, texte("Résultat écrit sous la forme "), latex("a+bi")),
        ],
        erreursFrequentes:
          e.operation === "-"
            ? [{ description: [texte("Signe « − » non distribué sur la partie imaginaire")], cout: "−1,5" }]
            : [{ description: [texte("Parties réelle et imaginaire additionnées ensemble")], cout: "−2" }],
      };
    case "B":
      if (e.sousType === "cube")
        return {
          reponseFinale,
          criteres: [
            crit("a", 1, texte("Carré développé (double produit, "), latex("i^2=-1"), texte(")")),
            crit("a", 1, texte("Carré : "), latex(attendu(e, 0))),
            crit("b", 1, texte("Produit du carré par "), latex(z(e.a, e.b)), texte(" développé")),
            crit("b", 1, texte("Cube : "), latex(attendu(e, 1))),
          ],
          erreursFrequentes: [{ description: [latex("(a+bi)^3"), texte(" calculé comme "), latex("a^3+b^3i^3")], cout: "0 pt sur b)" }],
        };
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte(e.sousType === "carre" ? "Identité remarquable appliquée avec le double produit" : "Développement complet (4 produits)")),
          crit("a", 1, texte("Remplacement de "), latex("i^2"), texte(" par "), latex("-1")),
          crit("a", 1, texte("Parties réelles et imaginaires regroupées")),
          crit("a", 0.5, texte("Résultat : "), latex(attendu(e, 0))),
        ],
        erreursFrequentes: [
          { description: [latex("i^2"), texte(" remplacé par "), latex("1"), texte(" (ou laissé tel quel)")], cout: "−1" },
          ...(e.sousType === "carre" ? [{ description: [texte("Double produit oublié")], cout: "−1,5" }] : []),
        ],
      };
    case "C":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte("Multiplication par le conjugué "), latex(z(e.c, -e.d))),
          crit("a", 1, texte("Numérateur : "), latex(zv(e.numerateurDeveloppe))),
          crit("a", 1, texte("Dénominateur : "), latex(`${e.denominateurDeveloppe}`)),
          crit("b", 1, texte("Forme "), latex("a+bi"), texte(" : "), latex(attendu(e, 1))),
        ],
        erreursFrequentes: [
          { description: [texte("Dénominateur "), latex("c^2-d^2")], cout: "−1" },
          { description: [texte("Numérateur et dénominateur divisés partie par partie sans conjugué")], cout: "0 pt sur a)" },
        ],
        reponsesAcceptees: [[latex(`\\dfrac{${zv(e.numerateurDeveloppe)}}{${e.denominateurDeveloppe}}`), texte(" (forme non séparée), si la simplification est juste")]],
      };
    case "D":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Multiplication par "), latex("-i"), texte(" (ou par "), latex("i"), texte(") en haut et en bas")),
          crit("a", 1.5, texte("Numérateur : "), latex(`(${z(e.a, e.b)})\\cdot(-i)=${z(e.b, -e.a)}`)),
          crit("a", 1, texte("Résultat : "), latex(attendu(e, 0))),
        ],
        erreursFrequentes: [{ description: [latex("\\dfrac{1}{i}"), texte(" remplacé par "), latex("i")], cout: "−2" }],
      };
    case "E":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("1re fraction sous la forme "), latex("a+bi")),
          crit("a", 1.5, texte("2e fraction sous la forme "), latex("a+bi")),
          crit("b", 1, texte("Somme : "), latex(attendu(e, 1))),
        ],
        erreursFrequentes: [{ description: [texte("Numérateurs et dénominateurs additionnés entre eux")], cout: "0 pt" }],
      };
    case "F":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte(e.d === 0 ? "Division de chaque partie par le dénominateur réel" : "Multiplication par le conjugué du dénominateur")),
          crit("a", 1.5, texte("Quotient simplifié : "), latex(attendu(e, 0))),
          crit("b", 1.5, texte("Carré : "), latex(attendu(e, 1))),
        ],
        erreursFrequentes: [{ description: [texte("Carré calculé sans simplifier : erreur de calcul dans le développement")], cout: "−1" }],
      };
    case "G":
      return {
        reponseFinale,
        criteres: [
          crit("a", 2, texte("Reste de la division par 4 : "), latex(`${e.reste}`)),
          crit("b", 2, texte("Valeur : "), latex(`i^{${e.n}}=${attendu(e, 1)}`)),
        ],
        erreursFrequentes: [
          { description: [texte("Quotient utilisé à la place du reste")], cout: "0 pt" },
          ...(e.n < 0 ? [{ description: [texte("Reste négatif (ou cycle parcouru à l'envers)")], cout: "−2" }] : []),
        ],
      };
  }
}

export const adaptateurEvaluationNombresComplexes: AdaptateurFeuilleExercices<ExerciceNombresComplexes> = {
  profilInstance: profilNombresComplexes,
  libelleCasParticulier: LIBELLE_CAS_NOMBRES_COMPLEXES,
  titreDocument: "Nombres complexes : opérations de base et puissances de i — Évaluation",
  nomFichierBase: "nombres-complexes-base",
  genererInstance: genererExerciceNombresComplexes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteNombresComplexes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
};
