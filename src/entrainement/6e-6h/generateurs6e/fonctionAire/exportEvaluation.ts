import type { ExerciceFonctionAire } from "../../core6e/fonctionAire.types";
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
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  aireExacte,
  bornesDomaine,
  candidatsExtremums,
  extremumsA,
  intervallesSens,
  pointsTableau,
} from "../../moteur6e/modeleFonctionAire";
import { phasesPourExercice } from "../../moteur6e/typesFonctionAire";
import type { PhaseFonctionAire } from "../../moteur6e/typesFonctionAire";
import { abscissesValeursA, intervallesAires, pentesAttendues, valeursExactesAttendues } from "../../moteur6e/verificationFonctionAire";
import { figureCandidat, figureCorrigeExercice, figureFonctionF } from "../../ui6e/figureFonctionAire";
import {
  aLatex,
  consigneGenerale,
  equationTangenteLatex,
  integraleLatex,
  intervalleLatex,
  libelleNature,
  nombreLatex,
  reponseAttendue,
  valeurLatex,
} from "../../ui6e/formatFonctionAire";
import { profilFonctionAire } from "./profil";
import { correctionDetailleeFonctionAire } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionAire } from "./index";
import type { IdVarianteFonctionAire } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFonctionAire>` de `6gen78` « La fonction aire » —
 * méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la courbe de f sur quadrillage (`enteteHtml` ; variante `graphique` : plus les
 *   4 graphiques candidats numérotés 1 à 4), la définition de A et UNE consigne globale. Les écrans
 *   du générateur deviennent les étapes du corrigé (« Étape n — … »), lettres a, b.
 * - Corrigé : valeurs tirées des MÊMES fonctions que l'écran (`valeursExactesAttendues`,
 *   `reponseAttendue`, `tableauVariationsLatex`), une ligne « Piège » par étape, et la figure du
 *   corrigé (aires signées utilisées + courbe de A) sous la conclusion de la dernière étape.
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcdefgh";

function lettre(e: ExerciceFonctionAire, phase: PhaseFonctionAire): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

function listeEt(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(i === formules.length - 1 ? " et " : ", "), f(x)]));
}

function intervalleOuvertLatex(u: number, v: number): string {
  return `\\mathopen{]}${nombreLatex(u)}\\,;\\,${nombreLatex(v)}\\mathclose{[}`;
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function consignePapier(e: ExerciceFonctionAire): FragmentConsigne[] {
  const { x0, xn } = bornesDomaine(e);
  switch (e.variante) {
    case "valeurs":
      return [t(" Donne "), f(aLatex(e.a)), t(", puis calcule "), ...listeEt(e.points.map(aLatex)), t(" (valeurs exactes), en justifiant par des aires signées.")];
    case "variations":
      return [t(" Dresse le tableau de variations de A sur "), f(intervalleLatex(x0, xn)), t(", valeurs exactes de A comprises, en justifiant le sens de variation.")];
    case "extremums":
      return [t(" Détermine les extremums locaux de A sur "), f(intervalleOuvertLatex(x0, xn)), t(" : abscisse, nature et valeur exacte. Justifie.")];
    case "pente":
      return [
        t(" Donne la pente de la tangente à la courbe de A aux points d'abscisses "),
        f(nombreLatex(e.points[0])),
        t(" et "),
        f(nombreLatex(e.points[1])),
        t(", puis une équation de la tangente à la courbe de A au point d'abscisse "),
        f(nombreLatex(e.points[0])),
        t(" (valeurs exactes)."),
      ];
    case "graphique":
      return [t(" Parmi les graphiques 1 à 4, lequel représente la fonction aire A ? Justifie ton choix en éliminant les trois autres.")];
  }
}

function entetePapier(e: ExerciceFonctionAire): FragmentConsigne[] {
  return [...consigneGenerale(e), ...consignePapier(e)];
}

function figureEnonce(e: ExerciceFonctionAire): string {
  const fig = figureFonctionF(e);
  if (e.variante !== "graphique") return fig;
  const candidats = e.ordre.map((indice, i) => figureCandidat(e, indice, i + 1, 240)).join("");
  return `<div style="text-align:center">${fig}</div><div class="grille-graphes-cyclo">${candidats}</div>`;
}

/** Titres d'étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceFonctionAire, phase: PhaseFonctionAire): FragmentConsigne[] {
  switch (phase) {
    case "aires":
      return [t("Calcule "), ...listeEt(intervallesAires(e).map(([u, v]) => integraleLatex(u, v))), t(" à l'aide d'aires signées.")];
    case "valeursA":
      return [t("Déduis-en "), ...listeEt(abscissesValeursA(e).map(aLatex)), t(".")];
    case "sens":
      return [t("Sur chacun des intervalles "), ...listeEt(intervallesSens(e).map((i) => intervalleLatex(i.de, i.a))), t(", dis si A est croissante ou décroissante.")];
    case "tableau":
      return [t("Complète le tableau de variations par les valeurs de A.")];
    case "nature":
      return [t("En chacune des abscisses "), ...listeEt(candidatsExtremums(e).map((x) => `x=${nombreLatex(x)}`)), t(", dis si A admet un maximum local, un minimum local ou aucun extremum.")];
    case "valeursExt":
      return [t("Calcule la valeur de chaque extremum local de A.")];
    case "pentes":
      return [t("Donne "), f(`A'(${nombreLatex(e.points[0])})`), t(" et "), f(`A'(${nombreLatex(e.points[1])})`), t(".")];
    case "tangente":
      return [t("Calcule "), f(aLatex(e.points[0])), t(", puis une équation de la tangente au point d'abscisse "), f(nombreLatex(e.points[0])), t(".")];
    case "choixGraphique":
      return [t("Identifie le graphique de A et élimine les trois autres.")];
  }
}

function construireEnonce(e: ExerciceFonctionAire): SectionExercice {
  return { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceFonctionAire): BlocCorrection[] {
  const blocs: BlocCorrection[] = phasesPourExercice(e).map((phase) => ({ type: "paragraphe", fragments: [t(`${lettre(e, phase)}) `), ...reponseAttendue(e, phase)] }));
  blocs.push({ type: "html", html: figureCorrigeExercice(e) });
  return blocs;
}

function reponseBreve(e: ExerciceFonctionAire): FragmentConsigne[] {
  switch (e.variante) {
    case "valeurs":
      return [...reponseAttendue(e, "valeursA"), t(".")];
    case "variations":
      return reponseAttendue(e, "tableau");
    case "extremums":
      return extremumsA(e).flatMap((m, i) => [...(i > 0 ? [t(" ; ")] : []), t(`${libelleNature(m.nature)} en `), f(`x=${nombreLatex(m.x)}`), t(", "), f(`${aLatex(m.x)}=${valeurLatex(aireExacte(e, m.x))}`)]);
    case "pente":
      return [...reponseAttendue(e, "pentes"), t(" ; "), f(equationTangenteLatex(e)), t(".")];
    case "graphique":
      return [t(`Le graphique ${e.ordre.indexOf(0) + 1}.`)];
  }
}

function enoncePapier(e: ExerciceFonctionAire): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

const correctionDetaillee = correctionDetailleeFonctionAire;

function difficulte(e: ExerciceFonctionAire): 1 | 2 | 3 {
  return e.variante === "extremums" || e.variante === "valeurs" ? 3 : 2;
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

function criteresValeurs(e: ExerciceFonctionAire, phase: PhaseFonctionAire, xs: number[], total: number): CritereBareme[] {
  const sq = lettre(e, phase);
  return xs.map((x) => ({ sousQuestion: sq, critere: [f(`${aLatex(x)}=${valeurLatex(aireExacte(e, x))}`)], points: Math.round((total / xs.length) * 100) / 100 }));
}

const ERREUR_SIGNE: ErreurFrequente = { description: [t("Aires sous l'axe comptées positivement (aire géométrique au lieu d'aire signée)")], cout: "−1" };
const ERREUR_SENS: ErreurFrequente = { description: [t("Sens de variation de A lu sur celui de f (A décroît là où f décroît)")], cout: "0 pt sur le sens de variation" };
const ERREUR_ZEROS: ErreurFrequente = { description: [t("Extremums de A placés aux zéros de A ou aux extremums de f au lieu des changements de signe de f")], cout: "0 pt sur les abscisses" };

function bareme(e: ExerciceFonctionAire): BaremeExercice {
  const acceptees: FragmentConsigne[][] = [[t("Valeurs exactes sous toute forme équivalente (fraction, décimal exact)")]];
  if (e.morceaux.some((m) => m.type === "demiDisque")) acceptees.push([t("Valeur décimale arrondie au centième d'une expression en "), f("\\pi"), t(" si l'expression exacte figure dans le calcul")]);
  switch (e.variante) {
    case "valeurs": {
      const ints = intervallesAires(e);
      const vAires = valeursExactesAttendues(e, "aires");
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          ...ints.map(([u, v], i) => ({ sousQuestion: "a", critere: [f(`${integraleLatex(u, v)}=${valeurLatex(vAires[i])}`)], points: Math.round((1.5 / ints.length) * 100) / 100 })),
          { sousQuestion: "b", critere: [f(`${aLatex(e.a)}=0`)], points: 0.5 },
          ...criteresValeurs(e, "valeursA", e.points, 2),
        ],
        erreursFrequentes: [ERREUR_SIGNE, { description: [t("Oubli du signe moins pour une valeur de A à gauche de a, ou calcul depuis le bord du graphique au lieu de a")], cout: "−0,5 par valeur" }],
        reponsesAcceptees: acceptees,
      };
    }
    case "variations":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Justification : "), f("A'=f"), t(", A croît où f > 0 et décroît où f < 0")], points: 0.75 },
          { sousQuestion: "a", critere: [t("Sens de variation correct sur chaque intervalle")], points: 1.25 },
          ...criteresValeurs(e, "tableau", pointsTableau(e), 2),
        ],
        erreursFrequentes: [ERREUR_SENS, ERREUR_SIGNE, { description: [t("Valeur de A en a différente de 0")], cout: "−0,5" }],
        reponsesAcceptees: acceptees,
      };
    case "extremums":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Abscisses des extremums : changements de signe de f, avec justification")], points: 1 },
          { sousQuestion: "a", critere: [t("Nature (maximum ou minimum) correcte")], points: 1 },
          ...criteresValeurs(
            e,
            "valeursExt",
            extremumsA(e).map((m) => m.x),
            2,
          ),
        ],
        erreursFrequentes: [ERREUR_ZEROS, ERREUR_SIGNE],
        reponsesAcceptees: acceptees,
      };
    case "pente": {
      const m = pentesAttendues(e);
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          ...e.points.map((p, i) => ({ sousQuestion: "a", critere: [f(`A'(${nombreLatex(p)})=f(${nombreLatex(p)})=${nombreLatex(m[i])}`)], points: 0.75 })),
          { sousQuestion: "b", critere: [f(`${aLatex(e.points[0])}=${valeurLatex(aireExacte(e, e.points[0]))}`)], points: 1 },
          { sousQuestion: "b", critere: [t("Équation de la tangente : "), f(equationTangenteLatex(e))], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [t("Pente prise égale à l'aire A(p) au lieu de f(p)")], cout: "0 pt sur a)" },
          { description: [t("Ordonnée du point de contact prise égale à f(p) au lieu de A(p)")], cout: "−1" },
        ],
        reponsesAcceptees: [...acceptees, [t("Équation non développée "), f("y=A'(p)(x-p)+A(p)"), t(" avec les bonnes valeurs")]],
      };
    }
    case "graphique": {
      const n = e.ordre.indexOf(0) + 1;
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t(`Choix du graphique ${n}`)], points: 1 },
          { sousQuestion: "a", critere: [t("La courbe de A passe par "), f(`(${nombreLatex(e.a)}\\,;\\,0)`)], points: 1 },
          { sousQuestion: "a", critere: [t("A croît où f > 0 et décroît où f < 0 (extremums aux changements de signe de f)")], points: 1 },
          { sousQuestion: "a", critere: [t("Élimination argumentée des trois autres graphiques")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [t("Choix de la courbe de f elle-même")], cout: "0 pt" },
          { description: [t("Choix d'un graphique qui ne passe pas par "), f("(a\\,;\\,0)")], cout: "0 pt" },
        ],
        reponsesAcceptees: [[t("Toute justification correcte fondée sur "), f("A(a)=0"), t(" et "), f("A'=f")]],
      };
    }
  }
}

export const adaptateurEvaluationFonctionAire: AdaptateurFeuilleExercices<ExerciceFonctionAire> = {
  titreDocument: "La fonction aire — Évaluation",
  nomFichierBase: "fonction-aire",
  genererInstance: genererExerciceFonctionAire,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteFonctionAire),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilFonctionAire,
};
