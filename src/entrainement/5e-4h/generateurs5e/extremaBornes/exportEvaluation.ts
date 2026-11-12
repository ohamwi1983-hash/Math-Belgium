import type { ExerciceExtremaBornes } from "../../core5e/extremaBornes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneEcranExtremaBornes,
  consigneGeneraleExtremaBornesRiche,
  formatFDeTLatex,
  formatReponseAttenduePhaseLatex,
  texteAideNiveau1ExtremaBornes,
} from "../../ui5e/formatExtremaBornes";
import type { EcranExtremaBornes } from "../../moteur5e/typesExtremaBornes";
import { ORDRE_ECRANS_EXTREMA_BORNES } from "../../moteur5e/typesExtremaBornes";
import { construireSvgTableauVariations } from "../../export5e/svgTableauVariations";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, derivativeCoeffs, evalPoly, genererExerciceExtremaBornes } from "./index";
import { VARIANTES_CALCULATRICE_EXTREMA_BORNES, profilExtremaBornes } from "../profilsEvaluationDerivees34-35";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceExtremaBornes>` pour 5gen34 (« Extrema en contexte
 * borné ») — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = le contexte (grandeur, variable, intervalle RÉEL [0 ; T]), l'expression de f(t)
 * et la consigne globale « Détermine le maximum absolu et le minimum absolu de f sur [0 ; T] ». Les
 * 6 écrans du générateur (dérivée, résolution de f'(t) = 0, tableau de signes, valeurs aux
 * extremums locaux, valeurs aux bornes, comparaison — `ORDRE_ECRANS_EXTREMA_BORNES`) passent dans le
 * corrigé (« Étape n — consigne », mêmes consignes que l'écran, sans les tournures d'écran). Le
 * tableau de signes et de variations est imprimé en figure sous l'étape 3.
 *
 * Valeurs : `formatReponseAttenduePhaseLatex`, `formatFDeTLatex`, `texteAideNiveau1ExtremaBornes`
 * (écran) et les champs de l'instance (`racinesFPrime`, `classificationFPrime`, `T`, `evalPoly`) —
 * jamais recalculées autrement. Les candidats max/min (`candidatExtreme`) reprennent la comparaison
 * de `index.ts::calculerCas` (sans importer `moteur5e/verificationExtremaBornes.ts`).
 *
 * `regroupable` : non — l'énoncé papier remplace l'énoncé à étapes, ce que le chemin regroupé du
 * pipeline n'utilise pas.
 */

const LETTRES = "abcdefgh";

function fragmentsRiches(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? latex(morceau) : texte(morceau.replace(/ \?/g, "\u00a0?"))))
    .filter((f) => f.valeur !== "");
}

/** Nombre entier en Unicode, « − » typographique (figure SVG). */
function nombreUnicode(v: number): string {
  return v < 0 ? `−${Math.abs(v)}` : `${v}`;
}

interface Candidat {
  t: number;
  valeur: number;
  origine: "extremum" | "borne";
  classification: "max" | "min" | null;
}

function candidats(exercice: ExerciceExtremaBornes): Candidat[] {
  return [
    ...exercice.racinesFPrime.map((t, i): Candidat => ({ t, valeur: evalPoly(exercice.coeffs, t), origine: "extremum", classification: exercice.classificationFPrime[i] })),
    { t: 0, valeur: evalPoly(exercice.coeffs, 0), origine: "borne", classification: null },
    { t: exercice.T, valeur: evalPoly(exercice.coeffs, exercice.T), origine: "borne", classification: null },
  ];
}

function candidatExtreme(exercice: ExerciceExtremaBornes, sens: "max" | "min"): Candidat {
  return candidats(exercice).reduce((m, c) => ((sens === "max" ? c.valeur > m.valeur : c.valeur < m.valeur) ? c : m));
}

function reponseAttendue(exercice: ExerciceExtremaBornes, ecran: EcranExtremaBornes): string[] {
  return formatReponseAttenduePhaseLatex(exercice, ecran, candidatExtreme(exercice, "max"), candidatExtreme(exercice, "min"));
}

/** Consigne d'étape = celle de l'écran, sans ses tournures propres à la saisie. */
function consigneEtape(exercice: ExerciceExtremaBornes, ecran: EcranExtremaBornes): FragmentConsigne[] {
  const brute = consigneEcranExtremaBornes(ecran, exercice)
    .replace(/ \(une par champ, dans l'ordre que tu veux\)/, "")
    .replace(/ Une seule tentative\.$/, "");
  return fragmentsRiches(brute);
}

function entete(exercice: ExerciceExtremaBornes): FragmentConsigne[] {
  return [...fragmentsRiches(consigneGeneraleExtremaBornesRiche(exercice)), texte(" On donne "), latex(formatFDeTLatex(exercice)), texte(".")];
}

function intervalleLatex(exercice: ExerciceExtremaBornes): string {
  return `[0\\,;\\,${exercice.T}]`;
}

function construireEnonceExtremaBornes(exercice: ExerciceExtremaBornes): SectionExercice {
  return { enteteFragments: entete(exercice), questions: ORDRE_ECRANS_EXTREMA_BORNES.map((ecran) => ({ consigne: consigneEtape(exercice, ecran) })) };
}

function enoncePapierExtremaBornes(exercice: ExerciceExtremaBornes): EnoncePapier {
  const unite = exercice.contexte.uniteTemps;
  return {
    section: {
      enteteFragments: entete(exercice),
      questions: [
        {
          consigne: [
            texte("Détermine le maximum absolu et le minimum absolu de f sur "),
            latex(intervalleLatex(exercice)),
            texte(`, ainsi que les instants (en ${unite}) où ils sont atteints. Justifie ta démarche.`),
          ],
        },
      ],
    },
    etapesParQuestion: [ORDRE_ECRANS_EXTREMA_BORNES.map((_, i) => LETTRES[i])],
  };
}

function reponseBreveExtremaBornes(exercice: ExerciceExtremaBornes): FragmentConsigne[] {
  const [max, min] = reponseAttendue(exercice, "comparaison");
  return [latex(max), texte(" ; "), latex(min)];
}

/** f'(t) écrite en facteurs à partir de ses racines (vérité terrain de l'instance). */
function fPrimeFactoriseeLatex(exercice: ExerciceExtremaBornes): string {
  const coeffs = derivativeCoeffs(exercice.coeffs);
  const dominant = coeffs[coeffs.length - 1];
  const prefixe = dominant === 1 ? "" : dominant === -1 ? "-" : `${dominant}`;
  return `f'(t)=${prefixe}${exercice.racinesFPrime.map((r) => `(t-${r})`).join("")}`;
}

/** Signe de f' sur chacun des intervalles délimités par 0, les racines et T — déduit de la nature
 * des extremums (+ avant un maximum, − avant un minimum, alternance aux racines simples). */
function signesFPrime(exercice: ExerciceExtremaBornes): ("+" | "−")[] {
  const premier = exercice.classificationFPrime[0] === "max" ? "+" : "−";
  return Array.from({ length: exercice.racinesFPrime.length + 1 }, (_, i) => ((i % 2 === 0) === (premier === "+") ? "+" : "−"));
}

function figureTableau(exercice: ExerciceExtremaBornes): string {
  const abscissesNum = [0, ...exercice.racinesFPrime, exercice.T];
  const valeurs = abscissesNum.map((t) => evalPoly(exercice.coeffs, t));
  return construireSvgTableauVariations(
    {
      variable: "t",
      libelleDerivee: "f′(t)",
      libelleFonction: "f(t)",
      abscisses: abscissesNum.map(nombreUnicode),
      zeros: abscissesNum.map((_, i) => i > 0 && i < abscissesNum.length - 1),
      signes: signesFPrime(exercice),
      valeurs: valeurs.map(nombreUnicode),
    },
    valeurs,
  );
}

function aide(ecran: EcranExtremaBornes, exercice: ExerciceExtremaBornes): FragmentConsigne[] {
  const a = texteAideNiveau1ExtremaBornes(ecran, exercice);
  return [...fragmentsRiches(a.texte), ...(a.latex ? [texte(" "), latex(a.latex)] : [])];
}

function correctionDetailleeExtremaBornes(exercice: ExerciceExtremaBornes): EtapeCorrection[] {
  const max = candidatExtreme(exercice, "max");
  const min = candidatExtreme(exercice, "min");
  const [conclusionMax, conclusionMin] = reponseAttendue(exercice, "comparaison");
  const borne = [max, min].filter((c) => c.origine === "borne");
  const piege: FragmentConsigne[] =
    borne.length > 0
      ? [
          texte("S'arrêter aux extremums locaux : ici, "),
          ...borne.flatMap((c, i) => [
            ...(i > 0 ? [texte(" et ")] : []),
            texte(c === max ? "le maximum absolu" : "le minimum absolu"),
            texte(" est atteint à la borne "),
            latex(`t=${c.t}`),
          ]),
          texte(", pas à un extremum local."),
        ]
      : [texte("Oublier les bornes : ici, les deux extremums absolus sont des extremums locaux, mais il fallait comparer aussi "), latex(`f(0)`), texte(" et "), latex(`f(${exercice.T})`), texte(" pour le savoir.")];
  return [
    { label: "Méthode", sousQuestion: "a", fragments: aide("deriver", exercice) },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(reponseAttendue(exercice, "deriver")[0]), texte(".")] },
    { label: "Méthode", sousQuestion: "b", fragments: aide("racines", exercice) },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(fPrimeFactoriseeLatex(exercice)), texte(", donc "), latex(reponseAttendue(exercice, "racines")[0]), texte(".")] },
    {
      label: "Tableau",
      sousQuestion: "c",
      fragments: [texte("Signe de f′ sur "), latex(intervalleLatex(exercice)), texte(" et variations de f : "), latex(reponseAttendue(exercice, "tableauFPrime").join(" \\quad ")), texte(".")],
      figureHtml: figureTableau(exercice),
    },
    { label: "Calcul", sousQuestion: "d", fragments: [latex(reponseAttendue(exercice, "valeursExtremums").join(" \\quad ")), texte(".")] },
    { label: "Calcul", sousQuestion: "e", fragments: [latex(reponseAttendue(exercice, "valeursBornes").join(" \\quad ")), texte(".")] },
    { label: "Conclusion", sousQuestion: "f", fragments: [texte("On compare toutes ces valeurs : "), latex(conclusionMax), texte(" ; "), latex(conclusionMin), texte(".")] },
    { label: "Piège", sousQuestion: "f", fragments: piege },
  ];
}

function baremeExtremaBornes(exercice: ExerciceExtremaBornes): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  return {
    reponseFinale: reponseBreveExtremaBornes(exercice),
    criteres: [
      c("a", "Dérivée f′(t) correcte", 0.5),
      c("b", "Solutions de f′(t) = 0 dans l'intervalle", 1),
      c("c", "Tableau de signes de f′ et nature de chaque extremum local", 0.5),
      c("d", "Valeurs de f aux extremums locaux", 0.5),
      c("e", "Valeurs de f aux deux bornes", 0.5),
      c("f", "Maximum et minimum absolus identifiés, avec les instants", 1),
    ],
    erreursFrequentes: [
      { description: [texte("Ne pas calculer f aux bornes 0 et " + exercice.T + " (conclusion tirée des seuls extremums locaux)")], cout: "0 pt sur la conclusion si elle est fausse" },
      { description: [texte("Remplacer t dans f′(t) au lieu de f(t) pour obtenir les valeurs")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Conclusion rédigée en contexte (grandeur et instant, avec les unités)")]],
  };
}

function difficulteExtremaBornes(exercice: ExerciceExtremaBornes): 1 | 2 | 3 {
  return exercice.degre === 4 ? 3 : 2;
}

/** Ancien corrigé (repli, documents Word) : les étapes du corrigé détaillé, en paragraphes. */
function construireCorrectionExtremaBornes(exercice: ExerciceExtremaBornes): BlocCorrection[] {
  return correctionDetailleeExtremaBornes(exercice)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationExtremaBornes: AdaptateurFeuilleExercices<ExerciceExtremaBornes> = {
  titreDocument: "Extrema en contexte borné — Évaluation",
  nomFichierBase: "extrema-bornes",
  genererInstance: () => genererExerciceExtremaBornes(),
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceExtremaBornes,
  construireCorrection: construireCorrectionExtremaBornes,
  difficulte: difficulteExtremaBornes,
  reponseBreve: reponseBreveExtremaBornes,
  correctionDetaillee: correctionDetailleeExtremaBornes,
  bareme: baremeExtremaBornes,
  enoncePapier: enoncePapierExtremaBornes,
  dureeMinutes: 12,
  profilInstance: profilExtremaBornes,
  calculatriceIndispensable: [...VARIANTES_CALCULATRICE_EXTREMA_BORNES],
};
