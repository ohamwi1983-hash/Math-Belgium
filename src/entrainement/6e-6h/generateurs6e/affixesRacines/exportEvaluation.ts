import type { ExerciceAffixesRacines, ValeurComplexe } from "../../core6e/affixesRacines.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { LIBELLE_PHASE, blocDonnees, consigneEcran, consigneGenerale, entierComplexeLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatAffixesRacines";
import { phasesPourExercice } from "../../moteur6e/typesAffixesRacines";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAffixesRacines, type IdVarianteAffixesRacines } from "./index";
import { correctionDetailleeAffixesRacines } from "./corrigeDetaille";
import { LIBELLE_CAS_AFFIXES_RACINES, profilAffixesRacines } from "../profilsEvaluationComplexes34-36";

/**
 * Adaptateur feuille d'exercices / évaluation de `6gen35` (« Nombres complexes : affixes et racines
 * carrées ») — méthode `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier = données + consigne globale ; les écrans deviennent les étapes du corrigé
 *   (`sousQuestion` = lettre de l'écran), valeurs tirées de `formatReponseAttenduePhaseLatex`.
 * - Les écrans « à choix » (relation du parallélogramme, système de la racine carrée) n'ont pas de
 *   liste d'options sur papier : leur titre d'étape demande d'ÉCRIRE la relation / le système.
 * - Familles B et D : figure du plan (repère orthonormé) sous la conclusion du corrigé.
 */


const LETTRES = "abcdefghijklmnopqrstuvwxyz";

const z = (re: number, im: number) => entierComplexeLatex(re, im);

/** Nombre avec au plus une décimale (milieux demi-entiers), virgule décimale. */
function nombreLatex(v: number): string {
  return String(v).replace(".", "{,}");
}

/** Affixe dont les parties peuvent être des demi-entiers (milieu de 6gen35 D). */
function affixeLatex(v: ValeurComplexe): string {
  if (Number.isInteger(v.re) && Number.isInteger(v.im)) return z(v.re, v.im);
  const re = v.re === 0 ? "" : nombreLatex(v.re);
  if (v.im === 0) return re;
  const mag = Math.abs(v.im) === 1 ? "" : nombreLatex(Math.abs(v.im));
  if (v.re === 0) return `${v.im < 0 ? "-" : ""}${mag}i`;
  return `${re}${v.im < 0 ? "-" : "+"}${mag}i`;
}

function attendu(e: ExerciceAffixesRacines, i: number): string {
  return formatReponseAttenduePhaseLatex(e, phasesPourExercice(e)[i]).join(",\\ ");
}

/** Consigne d'un écran, version papier : un écran « à choix » n'a pas d'options sur papier. */
function consigneEtape(e: ExerciceAffixesRacines, phase: ReturnType<typeof phasesPourExercice>[number]): FragmentConsigne[] {
  return consigneEcran(e, phase).map((f) => {
    if (f.type !== "texte") return f;
    const valeur = f.valeur
      .replace(/^Choisis le système vérifié par x et y/, "Écris le système vérifié par x et y")
      .replace(/ \(0 s'il n'y a pas de partie réelle\/imaginaire\)\./, ".")
      .replace(/ \(virgule décimale si besoin\)\./, ".");
    return valeur === f.valeur ? f : { ...f, valeur };
  });
}

// ============================================================================
// Énoncé
// ============================================================================

function donnees(e: ExerciceAffixesRacines): string {
  return blocDonnees(e).join(",\\ ");
}

function entetePapier(e: ExerciceAffixesRacines): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [texte("Soit "), latex(donnees(e)), texte(". Calcule "), latex("z+\\bar z"), texte(" et "), latex("z-\\bar z"), texte(" et écris chacun sous la forme "), latex("a+bi"), texte(".")];
    case "C":
      return [texte("Détermine les racines carrées complexes de "), latex(z(e.a, e.b)), texte(". Écris-les sous la forme "), latex("a+bi"), texte(".")];
    case "B":
    case "D":
      return [...consigneGenerale(e), texte(" Données : "), latex(donnees(e)), texte(".")];
  }
}

function construireEnonce(e: ExerciceAffixesRacines): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEtape(e, phase) })) };
}

function enoncePapier(e: ExerciceAffixesRacines): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] } };
}

function construireCorrection(e: ExerciceAffixesRacines): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `), latex(formatReponseAttenduePhaseLatex(e, phase).join(",\\ "))],
  }));
}

// ============================================================================
// Corrigé détaillé
// ============================================================================

const correctionDetaillee = correctionDetailleeAffixesRacines;

// ============================================================================
// Réponse brève, difficulté, barème
// ============================================================================

function reponseBreve(e: ExerciceAffixesRacines): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [latex(attendu(e, 0))];
    case "B":
      return [latex(attendu(e, 1))];
    case "C":
      return [latex(`z_1=${z(e.xPositif, e.yDeduit)}`), texte(" et "), latex(`z_2=${z(-e.xPositif, -e.yDeduit)}`)];
    case "D":
      return [latex(`z_M=${affixeLatex(e.milieu)}`), texte(" et "), latex(`AB=${e.distance}`)];
  }
}

function difficulte(e: ExerciceAffixesRacines): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
      return 1;
    case "B":
    case "D":
      return 2;
    case "C":
      return 3;
  }
}

const crit = (sousQuestion: string, points: number, ...critere: FragmentConsigne[]) => ({ sousQuestion, points, critere });

function bareme(e: ExerciceAffixesRacines): BaremeExercice {
  const reponseFinale = reponseBreve(e);
  switch (e.famille) {
    case "A":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte("Conjugué : "), latex(`\\bar z=${z(e.a, -e.b)}`)),
          crit("a", 1.5, latex(`z+\\bar z=${z(e.somme.re, e.somme.im)}`)),
          crit("a", 1.5, latex(`z-\\bar z=${z(e.difference.re, e.difference.im)}`)),
        ],
        erreursFrequentes: [
          { description: [latex("z-\\bar z"), texte(" écrit sans le "), latex("i"), texte(" (réel au lieu d'imaginaire pur)")], cout: "−1" },
          { description: [texte("Conjugué qui change aussi le signe de la partie réelle")], cout: "−1" },
        ],
      };
    case "B":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Relation "), latex("z_D=z_A-z_B+z_C"), texte(" (diagonales de même milieu)")),
          crit("b", 1, texte("Partie réelle de "), latex("z_D"), texte(" : "), latex(`${e.reD2 / 2}`)),
          crit("b", 1, texte("Partie imaginaire de "), latex("z_D"), texte(" : "), latex(`${e.imD2 / 2}`)),
          crit("b", 0.5, texte("Affixe écrite sous la forme "), latex("a+bi")),
        ],
        erreursFrequentes: [{ description: [texte("Relation "), latex("z_D=z_A+z_B-z_C"), texte(" (mauvais sommet opposé)")], cout: "0 pt sur a)" }],
      };
    case "C":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Système : parties réelles, imaginaires et modules ("), latex(`x^2+y^2=${e.module}`), texte(")")),
          crit("b", 1, latex(`x=\\pm${e.xPositif}`)),
          crit("c", 1.5, texte("y déduit de "), latex("2xy=b"), texte(" et les 2 racines opposées")),
        ],
        erreursFrequentes: [
          { description: [texte("Une seule racine donnée (l'opposée oubliée)")], cout: "−1" },
          { description: [texte("Signe de y choisi sans utiliser "), latex("2xy=b")], cout: "−1" },
          { description: [texte("Module pris égal à "), latex("a^2+b^2"), texte(" (racine carrée oubliée)")], cout: "0 pt sur a)" },
        ],
      };
    case "D":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Milieu : "), latex(`z_M=${affixeLatex(e.milieu)}`)),
          crit("b", 1, texte("Différence : "), latex(`z_B-z_A=${z(e.difference.re, e.difference.im)}`)),
          crit("b", 1.5, texte("Distance : module, "), latex(`AB=${e.distance}`)),
        ],
        erreursFrequentes: [
          { description: [texte("Somme des affixes non divisée par 2")], cout: "−1" },
          { description: [latex("|z_B|-|z_A|"), texte(" au lieu de "), latex("|z_B-z_A|")], cout: "−1,5" },
        ],
      };
  }
}

export const adaptateurEvaluationAffixesRacines: AdaptateurFeuilleExercices<ExerciceAffixesRacines> = {
  profilInstance: profilAffixesRacines,
  libelleCasParticulier: LIBELLE_CAS_AFFIXES_RACINES,
  titreDocument: "Nombres complexes : affixes et racines carrées — Évaluation",
  nomFichierBase: "affixes-racines",
  genererInstance: genererExerciceAffixesRacines,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteAffixesRacines),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};
