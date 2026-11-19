import type { ExerciceEquationInequationSecondDegre, FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre } from "../../core/equationInequationSecondDegre.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { formatEquationInequationLatex, formatDomaineTexte, texteAidePoserSystemeNiveau2 } from "../../ui/formatEquationInequationSecondDegre";
import { segmentsPhraseEnonce } from "../../ui/formatOptimisation";
import {
  consigneEcranEquationInequation,
  correctionDetailleeEquationInequationSecondDegre,
  d,
  ecransEquationInequationSecondDegre,
  intervalleValideLatex,
  lettrePhaseEquationInequationSecondDegre,
  phraseConclusion,
} from "./corrigeDetaille";
import { croquisEquationInequationSvg } from "../croquisPapierSecondDegre";
import { CATALOGUE_FAMILLES, CATALOGUE_VARIANTES, PAIRES_VALIDES, construireAvecFamilleId, genererExerciceEquationInequationSecondDegre } from "./index";
import { profilEquationInequationSecondDegre } from "../profilsEvaluation4eCh2Ch3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationInequationSecondDegre>` pour gen57
 * (Équations et inéquations du second degré en contexte, chapitre 1,
 * `AppEquationInequationSecondDegre.tsx`) — feuille d'exercices et évaluation.
 *
 * Écrans : (poser le système, isoler et substituer — familles « système ») ou (poser l'équation /
 * l'inéquation), résoudre, valider avec le domaine, phrase de conclusion : les étapes de guidage
 * d'UN seul problème. Sur papier : le contexte (avec son croquis), le domaine de validité (donnée de
 * la situation : il ne se déduit pas toujours du texte), la question finale ; les écrans deviennent
 * les étapes du corrigé (une lettre par écran), corrigé détaillé « comme au tableau » dans
 * `corrigeDetaille.ts` (partagé avec l'appli).
 *
 * Catalogue = les 24 paires « famille::variante » du sélecteur de l'écran (même ordre, même
 * fonction de tirage — le QR code rouvre la même instance). Valeurs : celles de l'instance et des
 * fonctions de l'écran (`formatEquationInequationLatex`, `consigneValidation`, système de
 * `texteAidePoserSystemeNiveau2`, phrase de conclusion correcte). Seule l'écriture des intervalles
 * est précisée sur papier : une borne venant d'une racine d'une inéquation STRICTE est exclue.
 */

const LABEL_FAMILLE = Object.fromEntries(CATALOGUE_FAMILLES.map((f) => [f.id, f.label])) as Record<FamilleEquationInequationSecondDegre, string>;
const LABEL_VARIANTE = Object.fromEntries(CATALOGUE_VARIANTES.map((v) => [v.id, v.label])) as Record<VarianteEquationInequationSecondDegre, string>;

/** Mêmes 24 entrées, même ordre que `OPTIONS_DEV` de l'écran. */
export const CATALOGUE_PAIRES = PAIRES_VALIDES.map((p) => ({ id: `${p.familleId}::${p.varianteId}`, label: `${LABEL_FAMILLE[p.familleId]} — ${LABEL_VARIANTE[p.varianteId]}` }));

function construireDepuisPaire(id: string): ExerciceEquationInequationSecondDegre {
  const [familleId, varianteId] = id.split("::") as [FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre];
  return construireAvecFamilleId(familleId, varianteId);
}

/** Familles A (fonction donnée) : coefficients et seuil décimaux — la calculatrice est nécessaire. */
const FAMILLES_CALCULATRICE: FamilleEquationInequationSecondDegre[] = ["jetEau", "consommationCarburant", "populationPoissons"];
export const PAIRES_CALCULATRICE = CATALOGUE_PAIRES.map((p) => p.id).filter((id) => FAMILLES_CALCULATRICE.includes(id.split("::")[0] as FamilleEquationInequationSecondDegre));


const nomEquation = (e: ExerciceEquationInequationSecondDegre) => (e.variante === "equation" ? "équation" : "inéquation");

function phraseFragments(phrase: string): FragmentConsigne[] {
  return segmentsPhraseEnonce(phrase).map((s) => (s.type === "katex" ? latex(s.valeur) : texte(s.valeur)));
}

function enteteEnonce(e: ExerciceEquationInequationSecondDegre, avecConsigne: boolean): FragmentConsigne[] {
  const { contexte } = e.base;
  const fragments = phraseFragments(contexte.phraseEnonce);
  if (e.voieSysteme && !contexte.croquis) fragments.push(texte(` On note ${contexte.labelVariable} ${contexte.nomVariable}.`));
  fragments.push(texte(` Dans cette situation, ${contexte.labelVariable} varie dans le domaine de validité ${formatDomaineTexte(e)}.`));
  if (avecConsigne) fragments.push(texte(` ${e.questionFinale} Justifie en posant une ${nomEquation(e)} du second degré, en la résolvant, puis en tenant compte du domaine de validité.`));
  return fragments;
}

function construireEnonceEquationInequation(e: ExerciceEquationInequationSecondDegre): SectionExercice {
  return {
    enteteFragments: enteteEnonce(e, false),
    enteteHtml: croquisEquationInequationSvg(e.base.contexte.croquis),
    questions: ecransEquationInequationSecondDegre(e).map((phase) => ({ consigne: consigneEcranEquationInequation(e, phase) })),
  };
}

function enoncePapierEquationInequation(e: ExerciceEquationInequationSecondDegre): EnoncePapier {
  return { section: { enteteFragments: enteteEnonce(e, true), enteteHtml: croquisEquationInequationSvg(e.base.contexte.croquis), questions: [] } };
}

function construireCorrectionEquationInequation(e: ExerciceEquationInequationSecondDegre): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [latex(formatEquationInequationLatex(e))] },
    { type: "paragraphe", fragments: [texte(phraseConclusion(e))] },
  ];
}

function reponseBreveEquationInequation(e: ExerciceEquationInequationSecondDegre): FragmentConsigne[] {
  return [texte(phraseConclusion(e))];
}

/**
 * Niveau (grille commune) : un écran = une étape ; le choix de la phrase de conclusion est une
 * lecture. Méthode : 1 quand la fonction est donnée (familles A, formule du contexte), 2 quand l'élève
 * construit la grandeur (familles B, C) ou le système (D). Piège dans les données : racine hors du
 * domaine à rejeter, intervalle coupé par le domaine. Nombres : coefficients décimaux des familles A
 * (calculatrice).
 */
function criteresEquationInequation(e: ExerciceEquationInequationSecondDegre): CriteresDifficulte {
  const lecture = [lettrePhaseEquationInequationSecondDegre(e, "interpretation")];
  const piege =
    e.variante === "equation"
      ? e.racinesValides.length < e.racinesCandidates.length
      : e.intervalleValide.inf !== e.intervalleBrut.inf || e.intervalleValide.sup !== e.intervalleBrut.sup;
  return {
    ...etapesDuCorrige(correctionDetailleeEquationInequationSecondDegre(e), lecture),
    methode: FAMILLES_CALCULATRICE.includes(e.famille) ? 1 : 2,
    piege: piege ? 1 : 0,
    nombres: FAMILLES_CALCULATRICE.includes(e.famille) ? 1 : 0,
  };
}

function baremeEquationInequation(e: ExerciceEquationInequationSecondDegre): BaremeExercice {
  const L = (phase: Parameters<typeof lettrePhaseEquationInequationSecondDegre>[1]) => lettrePhaseEquationInequationSecondDegre(e, phase);
  const v = e.base.contexte.labelVariable;
  const lPoser = e.voieSysteme ? L("isolerSubstituer") : L("poserEquationInequation");
  const validation = e.variante === "equation" ? [latex(e.racinesValides.map((r) => `${v} = ${d(r)}`).join(" \\text{ ou } "))] : [latex(intervalleValideLatex(e))];
  const criteres: CritereBareme[] = [
    ...(e.voieSysteme && e.systeme ? [{ sousQuestion: L("poserSysteme"), critere: [texte("Système des deux relations : "), latex(texteAidePoserSystemeNiveau2(e))], points: 1 }] : []),
    { sousQuestion: lPoser, critere: [texte(`${e.variante === "equation" ? "Équation" : "Inéquation"} posée : `), latex(formatEquationInequationLatex(e))], points: e.voieSysteme ? 0.5 : 1.5 },
    { sousQuestion: L("resoudre"), critere: [texte("Résolution (discriminant ou factorisation, racines" + (e.variante === "inequation" ? ", signe du trinôme" : "") + ")")], points: 1 },
    { sousQuestion: L("validation"), critere: [texte("Confrontation au domaine : "), ...validation], points: 1 },
    { sousQuestion: L("interpretation"), critere: [texte(e.base.contexte.uniteGrandeur ? "Conclusion rédigée avec l'unité" : "Conclusion rédigée")], points: 0.5 },
  ];
  const erreurs: ErreurFrequente[] = [
    e.variante === "equation"
      ? { description: [texte("Racine hors du domaine gardée (ou racine valide rejetée)")], cout: "0 pt sur la validation" }
      : { description: [texte("Intervalle des solutions donné sans l'intersecter avec le domaine")], cout: "0 pt sur la validation" },
    ...(e.variante === "inequation" && e.entiers ? [{ description: [texte("Intervalle donné au lieu de l'ensemble des entiers qu'il contient")], cout: "moitié des points de la validation" }] : []),
    { description: [texte("Seuil oublié en ramenant à 0 (Δ calculé avec c au lieu de c − k)")], cout: "−1, suite notée sans double pénalité" },
    { description: [texte("Valeur de la variable et valeur de la grandeur confondues dans la conclusion")], cout: "0 pt sur la conclusion" },
  ];
  if (e.variante === "inequation") erreurs.push({ description: [texte("Signe du trinôme inversé (solution prise à l'extérieur des racines)")], cout: "−1" });
  return {
    reponseFinale: [texte(phraseConclusion(e))],
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Racines obtenues par factorisation plutôt que par le discriminant")],
      [texte(`${e.variante === "equation" ? "Équation" : "Inéquation"} posée sous la forme `), latex(e.variante === "equation" ? "f(x) - k = 0" : "f(x) - k \\;\\Diamond\\; 0"), texte(" (ou multipliée par un nombre non nul, le symbole inversé si ce nombre est négatif)")],
      e.variante === "inequation" && e.entiers
        ? [texte("Ensemble des entiers écrit en extension ou « de … à … » (par exemple tous les entiers de 3 à 12)")]
        : [texte("Ensemble des solutions écrit avec des inégalités (par exemple 7 < x < 19) plutôt qu'en intervalle")],
    ],
  };
}

export const adaptateurEvaluationEquationInequationSecondDegre: AdaptateurFeuilleExercices<ExerciceEquationInequationSecondDegre> = {
  profilInstance: profilEquationInequationSecondDegre,
  calculatriceIndispensable: PAIRES_CALCULATRICE,
  titreDocument: "Équations et inéquations du second degré en contexte — Évaluation",
  nomFichierBase: "equations-inequations-contexte",
  genererInstance: genererExerciceEquationInequationSecondDegre,
  catalogueVariantes: CATALOGUE_PAIRES,
  genererInstanceAvecVariante: construireDepuisPaire,
  construireEnonce: construireEnonceEquationInequation,
  construireCorrection: construireCorrectionEquationInequation,
  criteresDifficulte: criteresEquationInequation,
  reponseBreve: reponseBreveEquationInequation,
  correctionDetaillee: correctionDetailleeEquationInequationSecondDegre,
  bareme: baremeEquationInequation,
  enoncePapier: enoncePapierEquationInequation,
};
