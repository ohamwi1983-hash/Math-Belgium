import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceSigma } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSigma } from "./index";
import type { IdVarianteSigma } from "./index";
import type { PhaseSigma } from "./ui/formatSigma";
import { consigne, phasesSigma, reponse, situation } from "./ui/formatSigma";
import { correctionDetailleeSigma } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen21` « Calculer avec le symbole Σ ». Énoncé papier = la somme + UNE
 * consigne globale (les écrans — nombre de termes, nature, parties… — passent dans le corrigé).
 * Regroupement a), b), c) : `REGROUPEMENTS["56gen21"]` (« Calcule chaque somme. », « Développe chaque
 * somme, puis calcule-la. », « … en fonction de n »).
 */

type E = ExerciceSigma;
const t = texte;
const f = latex;
const LETTRES = "abc";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: situation(e), questions: phasesSigma(e).map((p) => ({ consigne: consigne(e, p) })) };
}

/** Consigne globale du papier. */
export function consignePapier(e: E): FragmentConsigne[] {
  switch (e.variante) {
    case "ecrire":
      return [t("Écris cette somme avec le symbole Σ, l'indice "), f("i"), t(" allant de 1 à "), f("n"), t(", puis calcule-la.")];
    case "developper":
      return [t("Développe cette somme, puis calcule-la.")];
    case "litteral":
      return [t("Calcule "), f("S_n"), t(" en fonction de "), f("n"), t(".")];
    case "changementIndice":
      return [t("Écris cette somme avec un indice "), f("j"), t(" allant de 1 à un naturel à déterminer, puis calcule-la.")];
    default:
      return [t("Calcule cette somme.")];
  }
}

const derniere = (e: E): PhaseSigma => phasesSigma(e)[phasesSigma(e).length - 1];

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.variante) {
    case "ecrire":
      return [...reponse(e, "terme"), t(" ; "), ...reponse(e, "borne"), t(" ; "), ...reponse(e, "valeur")];
    case "changementIndice":
      return [...reponse(e, "nouveauTerme"), t(" ; "), ...reponse(e, "valeur")];
    default:
      return reponse(e, derniere(e));
  }
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: situation(e), questions: [{ consigne: consignePapier(e) }] }, etapesParQuestion: [phasesSigma(e).map((_, i) => LETTRES[i])], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phasesSigma(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode : choisir la formule (arithmétique / géométrique) ou la linéarité → 1 ; terme général,
  // développement et changement d'indice imposés par la consigne → 0. Piège dans les données : une
  // somme qui ne commence pas à i = 1 (premier terme et nombre de termes) — développer, une suite.
  const methode = e.variante === "uneSuite" || e.variante === "mixte" || e.variante === "litteral" ? 1 : 0;
  const piege = (e.variante === "developper" || e.variante === "uneSuite") && e.k !== 1 ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeSigma(e)), methode, piege, nombres: 0 };
}

const POINTS: Record<E["variante"], number[]> = {
  ecrire: [1.5, 1, 1.5],
  developper: [1, 1, 2],
  uneSuite: [1, 1, 2],
  mixte: [1.5, 1.5, 1],
  litteral: [1.5, 2.5],
  changementIndice: [1, 1.5, 1.5],
};

function bareme(e: E): BaremeExercice {
  const libelles: Partial<Record<PhaseSigma, string>> = {
    terme: "Terme général",
    borne: "Borne supérieure (nombre de termes)",
    valeur: "Valeur de la somme",
    nbTermes: "Nombre de termes",
    extremes: "Premier et dernier termes",
    nature: "Nature justifiée (différence ou quotient constant)",
    elements: "Premier terme, nombre de termes et dernier terme ou raison",
    partieGeo: "Linéarité et partie géométrique",
    partieArith: "Partie arithmétique",
    total: "Total",
    extremesN: "Premier et dernier termes",
    sommeN: "Somme en fonction de n",
    nouvelleBorne: "Nouvelles bornes",
    nouveauTerme: "Nouveau terme général",
  };
  const pts = POINTS[e.variante];
  return {
    reponseFinale: reponseBreve(e),
    criteres: phasesSigma(e).map((p, i) => ({ sousQuestion: LETTRES[i], critere: [t(`${libelles[p]} : `), ...reponse(e, p)], points: pts[i] })),
    erreursFrequentes: [
      { description: [t("Nombre de termes faux d'une unité (une borne oubliée)")], cout: "−0,5, suite notée sans double pénalité" },
      { description: [t("Exposant de "), f("q"), t(" différent du nombre de termes")], cout: "−0,5" },
      { description: [t("Division par 2 oubliée (somme arithmétique)")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute écriture équivalente du terme général ou de la somme (par exemple "), f("1{,}5\\cdot 2^{i}"), t(" pour "), f("3\\cdot 2^{i-1}"), t(")")], [t("Somme calculée en écrivant tous les termes, si elle est juste")]],
  };
}

export function profilSigma(e: E): ProfilInstance {
  // La touche Σ de la Casio Graph Math+ donne directement la valeur d'une somme numérique : « exacte »
  // quand c'est toute la réponse (développer, une suite, mixte). Écrire la somme avec Σ, changer
  // d'indice, une somme en fonction de n : la démarche est évaluée, pas de `calcul`.
  const calcul = e.variante === "developper" || e.variante === "uneSuite" || e.variante === "mixte" ? ("exacte" as const) : undefined;
  const forme = e.variante === "uneSuite" ? undefined : e.variante === "developper" || e.variante === "mixte" ? e.variante : `${e.variante}|${e.terme.kind}`;
  return { casParticulier: null, ...(calcul ? { calcul } : {}), ...(forme ? { forme } : {}) };
}

export const adaptateurEvaluationSigma: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Calculer avec le symbole Σ — Évaluation",
  nomFichierBase: "symbole-sigma",
  genererInstance: genererExerciceSigma,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteSigma),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeSigma,
  bareme,
  enoncePapier,
  profilInstance: profilSigma,
};
