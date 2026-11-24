import type { ExerciceFamilleD, ExerciceTiragesArbres, FractionExacte } from "../../core6e/tiragesArbres.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeTiragesArbres as correctionDetaillee } from "./corrigeDetaille";
import {
  branchesArbreD,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  fx,
  reduire,
} from "../../ui6e/formatTiragesArbres";
import { arbreTiragesSvg } from "../../ui6e/figuresTiragesArbres";
import { phasesPourExercice } from "../../moteur6e/typesTiragesArbres";
import type { PhaseTiragesArbres } from "../../moteur6e/typesTiragesArbres";
import { LIBELLE_CAS_TIRAGES_ARBRES, profilTiragesArbres } from "../profilsEvaluationTiragesArbres";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTiragesArbres } from "./index";
import type { IdVarianteTiragesArbres } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTiragesArbres>` pour `6gen31` (Tirages et arbres) —
 * méthode `.claude/rules/feuilles-evaluations.md` (refonte de l'audit 6e ch. 6, décision I).
 *
 * Énoncé papier = situation + annonce de la précision + les VRAIES questions (chacune une
 * probabilité distincte) ; les étapes de pur guidage passent dans le corrigé :
 * - A : a) même couleur (étapes 1–2 : chemins unicolores, puis somme), b) question de l'écran 3 ;
 * - B : a) à d), une probabilité par écran (positions données, toutes, exactement k, aucune / au
 *   moins 3) ;
 * - C : a) p (et q) — étapes 1–2 : équation(s) puis résolution —, b) probabilité de l'écran 3 ;
 * - D : l'arbre des deux tirages est DONNÉ (structure, branches nommées p₁…p₆ — pas a…f, qui
 *   seraient confondues avec les lettres des questions) : a) les six branches, b) un chemin,
 *   c) exactement une, d) au moins une.
 * Corrigé : « Étape n — consigne », méthode, calcul (expressions des aides de l'écran, effectuées),
 * conclusion en fraction irréductible puis « = » ou « ≈ » décimal à la précision annoncée, piège ;
 * l'arbre complet (fractions sur les branches, probabilité de chaque chemin) en `figureHtml` pour
 * les familles A et D. Jamais de C(n,k) ni de « loi ».
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcdefghij";
const NBSP = " ";

const PRECISION = "Donne chaque probabilité sous forme exacte (fraction irréductible) ou arrondie au centième (au millième si elle est inférieure à 0,1).";

// ============================================================================
// Valeurs : fraction exacte, puis « = » / « ≈ » décimal à la précision annoncée.
// ============================================================================

/** Valeur du membre de droite d'une réponse LaTeX (`P(…)=\dfrac{a}{b}` ou entier). */
function valeurMembreDroit(l: string): number | null {
  const droite = l.slice(l.lastIndexOf("=") + 1);
  const fr = /^(-?)\\dfrac\{(\d+)\}\{(\d+)\}$/.exec(droite);
  if (fr) return (fr[1] ? -1 : 1) * (Number(fr[2]) / Number(fr[3]));
  const n = /^-?\d+$/.exec(droite);
  return n ? Number(droite) : null;
}

function decimal(v: number, chiffres: number): string {
  return v.toFixed(chiffres).replace(".", "{,}");
}

/** « =0{,}25 » (décimal exact court) ou « \approx 0{,}27 » (arrondi annoncé) ; « » pour un entier. */
function suffixeDecimal(v: number): string {
  if (Number.isInteger(v)) return "";
  for (let c = 1; c <= 3; c++) if (Math.abs(v * 10 ** c - Math.round(v * 10 ** c)) < 1e-9) return `=${decimal(v, c)}`;
  return `\\approx ${decimal(v, Math.abs(v) < 0.1 ? 3 : 2)}`;
}

/** Réponse de l'écran (même source que le récapitulatif), suivie de sa valeur décimale. */
function avecDecimal(l: string): string {
  const v = valeurMembreDroit(l);
  return v === null || l.includes("p=") || l.includes("q=") ? l : `${l}${suffixeDecimal(v)}`;
}

function reponse(e: ExerciceTiragesArbres, phase: PhaseTiragesArbres): string[] {
  return formatReponseAttenduePhaseLatex(e, phase);
}

/** Réponse d'un écran en fragments, avec décimales (lignes séparées par « ; »). */
function reponseFragments(e: ExerciceTiragesArbres, phase: PhaseTiragesArbres, decimales = true): FragmentConsigne[] {
  const lignes = reponse(e, phase).map((l) => (decimales ? avecDecimal(l) : l));
  return lignes.flatMap((l, i) => (i === 0 ? [f(l)] : [t(" ; "), f(l)]));
}

/** Membre de droite (fraction irréductible) d'une réponse. */
function droite(l: string): string {
  return l.slice(l.lastIndexOf("=") + 1);
}

function fracReduite(fr: FractionExacte): string {
  return fx(reduire(fr));
}

// ============================================================================
// Énoncé papier.
// ============================================================================

interface QuestionPapier {
  consigne: FragmentConsigne[];
  /** Étapes (écrans) couvertes, lettres a, b, c… dans l'ordre des écrans. */
  etapes: string[];
}

function questionsPapier(e: ExerciceTiragesArbres): QuestionPapier[] {
  const phases = phasesPourExercice(e);
  const lettre = (p: PhaseTiragesArbres) => LETTRES[phases.indexOf(p)];
  switch (e.famille) {
    case "A":
      return [
        { consigne: consigneEcran(e, "aEcran2"), etapes: [lettre("aEcran1"), lettre("aEcran2")] },
        { consigne: consigneEcran(e, "aEcran3"), etapes: [lettre("aEcran3")] },
      ];
    case "B":
      return phases.map((p) => ({ consigne: consigneEcran(e, p), etapes: [lettre(p)] }));
    case "C":
      return [
        { consigne: e.sousType === "special" ? [t("Calcule "), f("p"), t(".")] : [t("Calcule "), f("p"), t(" et "), f("q"), t(".")], etapes: [lettre("cEcran1"), lettre("cEcran2")] },
        { consigne: consigneEcran(e, "cEcran3"), etapes: [lettre("cEcran3")] },
      ];
    case "D":
      return [
        { consigne: [t("Détermine les probabilités "), f("p_1,\\ p_2,\\ \\ldots,\\ p_6"), t(" portées par les branches de l'arbre.")], etapes: ["a"] },
        { consigne: consigneEcran(e, "dEcran2"), etapes: ["b"] },
        { consigne: consigneEcran(e, "dEcran3"), etapes: ["c"] },
        { consigne: consigneEcran(e, "dEcran4"), etapes: ["d"] },
      ];
  }
}

function entetePapier(e: ExerciceTiragesArbres): FragmentConsigne[] {
  const situation = consigneGenerale(e);
  const arbre = e.famille === "D" ? [t(" L'arbre ci-dessous représente les deux tirages ; "), f("p_1,\\ \\ldots,\\ p_6"), t(" désignent les probabilités portées par ses branches.")] : [];
  return [...situation, ...arbre, t(` ${PRECISION}`)];
}

const INDICES = ["₁", "₂", "₃", "₄", "₅", "₆"];
/** Ordre p₁…p₆ = ordre a…f de l'écran (`branchesArbreD`). */
function indiceBrancheD(chemin: number[]): number {
  return chemin.length === 1 ? chemin[0] : 2 + chemin[0] * 2 + chemin[1];
}

function arbreDonneD(e: ExerciceFamilleD): string {
  return arbreTiragesSvg({
    profondeur: 2,
    initiales: [e.initiale1, e.initiale2],
    etiquette: (chemin) => ({ texte: `p${INDICES[indiceBrancheD(chemin)]}` }),
    libelle: "Arbre des deux tirages",
  });
}

function construireEnoncePapier(e: ExerciceTiragesArbres): SectionExercice {
  return {
    enteteFragments: entetePapier(e),
    ...(e.famille === "D" ? { enteteHtml: arbreDonneD(e) } : {}),
    questions: questionsPapier(e).map((q) => ({ consigne: q.consigne })),
  };
}

function reponseBreve(e: ExerciceTiragesArbres): FragmentConsigne[] {
  const phases = phasesPourExercice(e);
  return questionsPapier(e).flatMap((q, i) => {
    const derniere = phases[LETTRES.indexOf(q.etapes[q.etapes.length - 1])];
    const corps = e.famille === "D" && derniere === "dEcran1" ? brancheResume(e) : reponseFragments(e, derniere);
    return [...(i === 0 ? [] : [t(" ; ")]), t(`${LETTRES[i]})${NBSP}`), ...corps];
  });
}

function brancheResume(e: ExerciceFamilleD): FragmentConsigne[] {
  const b = branchesArbreD(e);
  return [f(b.map((fr, i) => `p_${i + 1}=${fracReduite(fr)}`).join(",\\ "))];
}

function enoncePapier(e: ExerciceTiragesArbres): EnoncePapier {
  const qs = questionsPapier(e);
  return { section: construireEnoncePapier(e), etapesParQuestion: qs.map((q) => q.etapes), reponseBreve: reponseBreve(e) };
}

/** Énoncé « par écran » (une sous-question par étape d'apprentissage) — repli des pipelines qui
 * n'utilisent pas `enoncePapier`. */
function construireEnonce(e: ExerciceTiragesArbres): SectionExercice {
  return {
    enteteFragments: entetePapier(e),
    ...(e.famille === "D" ? { enteteHtml: arbreDonneD(e) } : {}),
    questions: phasesPourExercice(e).map((phase) => ({ consigne: phase === "dEcran1" ? questionsPapier(e)[0].consigne : consigneEcran(e, phase) })),
  };
}

function construireCorrection(e: ExerciceTiragesArbres): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...(phase === "dEcran1" ? brancheResume(e as ExerciceFamilleD) : reponseFragments(e, phase))] }));
}

// ============================================================================
// Difficulté, barème.
// ============================================================================

/** Niveau (`niveauDifficulte.ts`) : une étape par écran, méthode 1 (règle du produit, somme de
 * chemins incompatibles, événement contraire, dénombrement d'arrangements, équation de la somme des
 * probabilités : à choisir parmi les outils du cours). Piège dans les données : famille B seulement
 * (un cas qui n'en est pas un — « exactement n − 1 bien placées » est impossible). Nombres 0 :
 * fractions exactes. */
function criteresDifficulte(e: ExerciceTiragesArbres): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 1, piege: e.famille === "B" ? 1 : 0, nombres: 0 };
}

function criteres(e: ExerciceTiragesArbres): CritereBareme[] {
  const fin = (ph: PhaseTiragesArbres) => droite(reponse(e, ph)[0]);
  switch (e.famille) {
    case "A":
      return [
        { sousQuestion: "a", critere: [t("Chemins unicolores par la règle du produit : "), f(`${fin("aEcran1")}\\ \\text{et}\\ ${droite(reponse(e, "aEcran1")[1])}`)], points: 1.5 },
        { sousQuestion: "b", critere: [t("Somme de deux événements incompatibles : "), f(fin("aEcran2"))], points: 1 },
        { sousQuestion: "c", critere: [t(e.questionEcran3 === "auMoinsUne" ? "Événement contraire : " : "Nombre de chemins × probabilité d'un chemin : "), f(fin("aEcran3"))], points: 1.5 },
      ];
    case "B":
      return [
        { sousQuestion: "a", critere: [t("Positions données : "), f(fin("bEcran1"))], points: 1 },
        { sousQuestion: "b", critere: [t("Un chemin sur n! : "), f(fin("bEcran2"))], points: 0.5 },
        { sousQuestion: "c", critere: [t("Comptage des arrangements favorables : "), f(fin("bEcran3"))], points: 1.5 },
        { sousQuestion: "d", critere: [t(e.demandeEcran4 === "auMoinsTrois" ? "Somme de cas incompatibles : " : "Événement contraire : "), f(fin("bEcran4"))], points: 1 },
      ];
    case "C":
      return [
        { sousQuestion: "a", critere: [t(e.sousType === "special" ? "Équation de la somme des probabilités" : "Relation et équation de la somme")], points: 1 },
        { sousQuestion: "b", critere: [f(reponse(e, "cEcran2").join(",\\ "))], points: 1.5 },
        { sousQuestion: "c", critere: [t("Somme des probabilités des faces : "), f(fin("cEcran3"))], points: 1.5 },
      ];
    case "D":
      return [
        { sousQuestion: "a", critere: [t("Les six branches de l'arbre (le deuxième tirage tient compte du premier)")], points: 1.5 },
        { sousQuestion: "b", critere: [t("Règle du produit : "), f(fin("dEcran2"))], points: 0.5 },
        { sousQuestion: "c", critere: [t("Somme de deux chemins : "), f(fin("dEcran3"))], points: 1 },
        { sousQuestion: "d", critere: [t("Événement contraire : "), f(fin("dEcran4"))], points: 1 },
      ];
  }
}

function bareme(e: ExerciceTiragesArbres): BaremeExercice {
  const pieges = correctionDetaillee(e).filter((l) => l.type === "piege");
  return {
    reponseFinale: reponseBreve(e),
    criteres: criteres(e),
    erreursFrequentes: pieges.map((l) => ({ description: l.fragments, cout: "−1" })),
    reponsesAcceptees: [[t("Fraction non simplifiée, décimal arrondi au centième (au millième sous 0,1) ou pourcentage équivalent ; une erreur reportée d'une question à la suivante n'est sanctionnée qu'une fois")]],
  };
}

export const adaptateurEvaluationTiragesArbres: AdaptateurFeuilleExercices<ExerciceTiragesArbres> = {
  titreDocument: "Tirages et arbres de probabilité — Évaluation",
  nomFichierBase: "tirages-arbres",
  genererInstance: genererExerciceTiragesArbres,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteTiragesArbres),
  construireEnonce,
  construireCorrection,
  reponseBreve,
  correctionDetaillee,
  criteresDifficulte,
  bareme,
  enoncePapier,
  profilInstance: profilTiragesArbres,
  libelleCasParticulier: LIBELLE_CAS_TIRAGES_ARBRES,
};
