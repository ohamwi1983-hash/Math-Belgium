import type {
  ExerciceEquationsComplexes,
  ValeurComplexe,
} from "../../core6e/equationsComplexes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { LIBELLE_PHASE, OPTIONS_EQUATION_B, OPTIONS_EQUATION_E, OPTIONS_SYSTEME_A, blocDonnees, consigneEcran, entierComplexeLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatEquationsComplexes";
import { phasesPourExercice, type PhaseEquationsComplexes } from "../../moteur6e/typesEquationsComplexes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationsComplexes, type IdVarianteEquationsComplexes } from "./index";
import { correctionDetailleeEquationsComplexes } from "./corrigeDetaille";
import { LIBELLE_CAS_EQUATIONS_COMPLEXES, profilEquationsComplexes } from "../profilsEvaluationComplexes34-36";

/**
 * Adaptateur feuille d'exercices / évaluation de `6gen36` (« Équations dans ℂ ») — méthode
 * `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier = l'équation + la consigne globale (« Résous dans ℂ… »), sans méthode (ni « isole
 *   z », ni « pose u = z² ») ; les écrans deviennent les étapes du corrigé.
 * - Tirage libre (`genererInstance`) : familles C (Δ réel négatif) et E réelle (bicarrée) seulement,
 *   comme le générateur ; les variantes « approfondissement » restent au choix du professeur.
 * - Les écrans « à choix » (système, équation développée, équation en u) n'ont pas d'options sur
 *   papier : leur titre d'étape demande d'ÉCRIRE le système / l'équation.
 * - Valeurs : `formatReponseAttenduePhaseLatex` et les options correctes de l'écran.
 */

const zv = (v: ValeurComplexe) => entierComplexeLatex(v.re, v.im);
const add = (u: ValeurComplexe, v: ValeurComplexe): ValeurComplexe => ({ re: u.re + v.re + 0, im: u.im + v.im + 0 });
const neg = (u: ValeurComplexe): ValeurComplexe => ({ re: -u.re + 0, im: -u.im + 0 });
const ensemble = (vs: ValeurComplexe[]) => `S=\\left\\{${vs.map(zv).join(";\\ ")}\\right\\}`;

function attendu(e: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): string {
  return formatReponseAttenduePhaseLatex(e, phase).join(",\\ ");
}

/** « z − r » pour une racine réelle r. */
function equationLatex(e: ExerciceEquationsComplexes): string {
  return blocDonnees(e).join(",\\ ");
}

/** Consigne d'un écran, version papier : un écran « à choix » n'a pas d'options sur papier. */
function consigneEtape(e: ExerciceEquationsComplexes, phase: PhaseEquationsComplexes): FragmentConsigne[] {
  return consigneEcran(e, phase).map((f) => {
    if (f.type !== "texte") return f;
    const valeur = f.valeur
      .replace("puis choisis le système", "puis écris le système")
      .replace("puis choisis l'équation développée correcte.", "puis écris l'équation développée obtenue.")
      .replace(", et choisis-la ci-dessous.", ".");
    return valeur === f.valeur ? f : { ...f, valeur };
  });
}

// ============================================================================
// Énoncé
// ============================================================================

function entetePapier(e: ExerciceEquationsComplexes): FragmentConsigne[] {
  const precision: FragmentConsigne[] =
    e.famille === "A" && e.sousType === "avecBarre" ? [texte(", où "), latex("\\bar z"), texte(" désigne le conjugué de "), latex("z")] : [];
  const information: FragmentConsigne[] = e.famille === "F" ? [texte(" Le polynôme admet deux racines entières.")] : [];
  return [texte("Résous dans ℂ l'équation "), latex(equationLatex(e)), ...precision, texte("."), ...information, texte(" Donne les solutions sous la forme "), latex("a+bi"), texte(".")];
}

function construireEnonce(e: ExerciceEquationsComplexes): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEtape(e, phase) })) };
}

function enoncePapier(e: ExerciceEquationsComplexes): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] } };
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function construireCorrection(e: ExerciceEquationsComplexes): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `), latex(attendu(e, phase))] }));
}

// ============================================================================
// Corrigé détaillé
// ============================================================================

const correctionDetaillee = correctionDetailleeEquationsComplexes;

// ============================================================================
// Réponse brève, difficulté, barème
// ============================================================================

function solutions(e: ExerciceEquationsComplexes): ValeurComplexe[] {
  switch (e.famille) {
    case "A":
      return e.sousType === "sansBarre" ? [e.z] : [{ re: e.x, im: e.y }];
    case "B":
      return [e.z];
    case "C":
    case "D":
      return e.racines;
    case "E":
    case "F":
      return e.racines;
  }
}

function reponseBreve(e: ExerciceEquationsComplexes): FragmentConsigne[] {
  return [latex(ensemble(solutions(e)))];
}

function difficulte(e: ExerciceEquationsComplexes): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
    case "B":
    case "C":
      return 2;
    case "E":
      return e.u1.im === 0 && e.u2.im === 0 ? 2 : 3;
    case "D":
    case "F":
      return 3;
  }
}

const crit = (sousQuestion: string, points: number, ...critere: FragmentConsigne[]) => ({ sousQuestion, points, critere });

function bareme(e: ExerciceEquationsComplexes): BaremeExercice {
  const reponseFinale = reponseBreve(e);
  switch (e.famille) {
    case "A":
      if (e.sousType === "sansBarre")
        return {
          reponseFinale,
          criteres: [
            crit("a", 1.5, texte("Termes en "), latex("z"), texte(" regroupés : "), latex(`(${zv(add(e.a, neg(e.c)))})\\,z=${zv(add(e.d, neg(e.b)))}`)),
            crit("a", 1.5, texte("Division par le complexe (conjugué)")),
            crit("a", 1, texte("Solution : "), latex(`z=${zv(e.z)}`)),
          ],
          erreursFrequentes: [{ description: [texte("Division partie par partie, sans conjugué")], cout: "−1,5" }],
        };
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte("Substitution "), latex("z=x+yi"), texte(", "), latex("\\bar z=x-yi"), texte(" et développement")),
          crit("a", 1, texte("Système : "), latex(OPTIONS_SYSTEME_A(e).find((o) => o.id === "correct")!.latex)),
          crit("b", 0.5, latex(`x=${e.x}`)),
          crit("b", 0.5, latex(`y=${e.y}`)),
          crit("b", 1, texte("Solution : "), latex(`z=${entierComplexeLatex(e.x, e.y)}`)),
        ],
        erreursFrequentes: [{ description: [texte("Signe de y non changé dans le conjugué")], cout: "−1" }],
      };
    case "B":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Équation sans fraction : "), latex(OPTIONS_EQUATION_B(e).find((o) => o.id === "correct")!.latex)),
          crit("b", 1, texte("Termes en "), latex("z"), texte(" regroupés")),
          crit("b", 1, texte("Division par le conjugué : "), latex(`z=${zv(e.z)}`)),
          crit("b", 0.5, texte("Valeur interdite écartée (condition vérifiée)")),
        ],
        erreursFrequentes: [{ description: [texte("Seul le terme en "), latex("z"), texte(" du dénominateur multiplié par "), latex(zv(e.k))], cout: "−1,5" }],
      };
    case "C":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, latex(`\\Delta=${e.delta}`)),
          crit("b", 1, latex(`\\sqrt{\\Delta}`), texte(" remplacé par "), latex(`i\\sqrt{${-e.delta}}=${Math.round(Math.sqrt(-e.delta))}i`)),
          crit("b", 1.5, texte("Les 2 solutions conjuguées : "), latex(`${zv(e.racines[0])}`), texte(" et "), latex(`${zv(e.racines[1])}`)),
        ],
        erreursFrequentes: [
          { description: [texte("« Pas de solution » car Δ < 0")], cout: "0 pt sur b)" },
          { description: [texte("Une seule solution donnée")], cout: "−1" },
        ],
      };
    case "D":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, latex(`\\Delta=${zv(e.delta)}`)),
          crit("b", 1.5, texte("Racines carrées de Δ : "), latex(`\\pm(${zv(e.racinesDelta[0])})`)),
          crit("c", 1, texte("Les 2 solutions : "), latex(`${zv(e.racines[0])}`), texte(" et "), latex(`${zv(e.racines[1])}`)),
        ],
        erreursFrequentes: [{ description: [texte("Signe de "), latex("-b"), texte(" appliqué à une seule partie")], cout: "−1" }],
      };
    case "E":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte("Équation en u : "), latex(OPTIONS_EQUATION_E(e).find((o) => o.id === "correct")!.latex)),
          crit("b", 1.5, latex(`u_1=${zv(e.u1)}`), texte(" et "), latex(`u_2=${zv(e.u2)}`)),
          crit("c", 1.5, texte("Les 4 solutions (2 opposées par valeur de u)")),
        ],
        erreursFrequentes: [
          { description: [texte("Valeurs de u données comme solutions (sans revenir à z)")], cout: "0 pt sur c)" },
          { description: [texte("Une seule racine carrée par valeur de u")], cout: "−1" },
        ],
      };
    case "F":
      return {
        reponseFinale,
        criteres: [
          crit("a", 0.5, texte("Racine entière "), latex(`${e.r1}`), texte(" (ou "), latex(`${e.r2}`), texte(")")),
          crit("b", 1, texte("Première division (quotient du 3e degré)")),
          crit("c", 1, texte("Deuxième racine et quotient du 2e degré")),
          crit("d", 1, texte("Les 2 solutions complexes conjuguées")),
          crit("e", 0.5, texte("Ensemble des 4 solutions")),
        ],
        erreursFrequentes: [{ description: [texte("Racines du 2e degré oubliées (seules les racines entières données)")], cout: "−1,5" }],
      };
  }
}

export const adaptateurEvaluationEquationsComplexes: AdaptateurFeuilleExercices<ExerciceEquationsComplexes> = {
  profilInstance: profilEquationsComplexes,
  libelleCasParticulier: LIBELLE_CAS_EQUATIONS_COMPLEXES,
  titreDocument: "Équations dans ℂ — Évaluation",
  nomFichierBase: "equations-complexes",
  genererInstance: genererExerciceEquationsComplexes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteEquationsComplexes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};
