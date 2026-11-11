import type { ExerciceAireA, ExerciceAireB, ExerciceAireC, ExerciceAireD, ExerciceCalculAires, SigneFonction } from "../../core6e/calculAires.types";
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
import { blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, polynomeLatex } from "../../ui6e/formatCalculAires";
import { CONSIGNE_PRECISION, decimalLatex } from "../../ui6e/nombresExactsIntegrales";
import { figureCalculAiresSvg } from "../../ui6e/figureCalculAires";
import { phasesPourExercice } from "../../moteur6e/typesCalculAires";
import type { PhaseCalculAires } from "../../moteur6e/typesCalculAires";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCalculAires } from "./index";
import type { IdVarianteCalculAires } from "./index";
import { coefficients, difference, dominant, donneesPapier, factoriseLatex, nettoyerConsigne, nombreCalculLatex, polynomeCoefsLatex, primitiveCoefs } from "./papierCommun";
import { LIBELLE_CAS_CALCUL_AIRES, profilCalculAires } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCalculAires>` pour `6gen26` (Calcul d'aires par
 * intégrale) — feuille d'exercices et évaluation, méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par ÉCRAN du générateur (= une étape, lettres a, b… dans l'ordre
 *   des écrans) ; ses consignes (`consigneEcran`, nettoyées des tournures d'écran) deviennent les
 *   titres « Étape n — … » du corrigé.
 * - `enoncePapier` : l'énoncé imprimé — consigne globale, données, UNE seule demande (l'aire, ou m
 *   pour le paramètre). Signe, racines, ordre des courbes, intégrales par morceau : étapes du corrigé.
 * - Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli). Les lignes « Calcul » posent
 *   l'opération avec les valeurs de l'instance (primitive, forme factorisée…).
 * - Figure (région hachurée, racines ou intersections) : `figureCalculAiresSvg`, la même qu'à l'écran,
 *   sous la dernière étape du corrigé — jamais dans l'énoncé (les données sont des formules).
 */

const LETTRES = "abcdefgh";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(exercice: ExerciceCalculAires, phase: PhaseCalculAires): FragmentConsigne[] {
  return [latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

function derniere(exercice: ExerciceCalculAires): PhaseCalculAires {
  const phases = phasesPourExercice(exercice);
  return phases[phases.length - 1];
}

// ============================================================================
// Énoncé interactif (étapes) et corrigé historique.
// ============================================================================

function entete(exercice: ExerciceCalculAires): FragmentConsigne[] {
  return [...consigneGenerale(exercice), ...donneesPapier(blocDonnees(exercice))];
}

function construireEnonce(exercice: ExerciceCalculAires): SectionExercice {
  return { enteteFragments: entete(exercice), questions: phasesPourExercice(exercice).map((phase) => ({ consigne: nettoyerConsigne(consigneEcran(exercice, phase)) })) };
}

function construireCorrection(exercice: ExerciceCalculAires): BlocCorrection[] {
  return phasesPourExercice(exercice).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(exercice, phase)] }));
}

// ============================================================================
// Énoncé papier : une seule demande.
// ============================================================================

function demande(exercice: ExerciceCalculAires): FragmentConsigne[] {
  if (exercice.famille === "D" && exercice.sousType === "parametre") return [t(" Détermine la valeur de "), f("m"), t(".")];
  if (exercice.famille === "C") return [t(` Calcule cette aire totale. ${CONSIGNE_PRECISION}`)];
  return [t(` Calcule cette aire. ${CONSIGNE_PRECISION}`)];
}

function enoncePapier(exercice: ExerciceCalculAires): EnoncePapier {
  return {
    section: { enteteFragments: [...entete(exercice), ...demande(exercice)], questions: [] },
    reponseBreve: reponse(exercice, derniere(exercice)),
  };
}

// ============================================================================
// Corrigé détaillé : par étape, Méthode, Calcul, Piège éventuel, Conclusion.
// ============================================================================

interface ContenuEtape {
  methode: FragmentConsigne[];
  calcul?: string;
  piege?: string;
}

const SIGNE_LATEX: Record<SigneFonction, string> = { positif: "f(x)\\geq 0", negatif: "f(x)\\leq 0" };

/** Valeur de f en un point, écrite pour une ligne de calcul. */
function valeurEn(termes: ExerciceAireB["termes"], x: number): number {
  let s = 0;
  for (const [n, c] of coefficients(termes)) s += c * x ** n;
  return s;
}

/** Valeur de la dérivée d'un polynôme (en termes) en x — sert à repérer la racine double. */
function deriveeEn(termes: ExerciceAireB["termes"], x: number): number {
  let s = 0;
  for (const [n, c] of coefficients(termes)) if (n > 0) s += n * c * x ** (n - 1);
  return s;
}

function primitiveLatexTermeA(e: ExerciceAireA): string {
  const c = e.terme.coef;
  const coef = c === 1 ? "" : c === -1 ? "-" : `${c}`;
  if (e.terme.type === "expX") return `${coef}e^{x}`;
  if (e.terme.type === "invX") return `${coef}\\ln|x|`;
  return `${coef}\\sin(x)`;
}

function methodeSigneA(e: ExerciceAireA): FragmentConsigne[] {
  if (e.terme.type === "expX") return [t("Une exponentielle est toujours strictement positive : f a le signe de son coefficient.")];
  if (e.terme.type === "invX") return [t("Sur l'intervalle, x garde un seul signe (0 n'en fait pas partie) : f a le signe du produit de son coefficient par x.")];
  return [t("Sur [−1 ; 1], on reste entre "), f("-\\frac{\\pi}{2}"), t(" et "), f("\\frac{\\pi}{2}"), t(", où "), f("\\cos(x)>0"), t(" : f a le signe de son coefficient.")];
}

function contenuA(e: ExerciceAireA, phase: PhaseCalculAires): ContenuEtape {
  if (phase === "aEcran1") return { methode: methodeSigneA(e) };
  return {
    methode: e.signe === "positif" ? [t("Comme "), f("f\\geq 0"), t(", l'aire est l'intégrale de f sur l'intervalle.")] : [t("Comme "), f("f\\leq 0"), t(", l'aire est l'opposé de l'intégrale de f : une aire est toujours positive.")],
    calcul: `${e.signe === "positif" ? "" : "-"}\\displaystyle\\int_{${e.a}}^{${e.b}} f(x)\\,dx=${e.signe === "positif" ? "" : "-"}\\left[${primitiveLatexTermeA(e)}\\right]_{${e.a}}^{${e.b}}`,
    piege: e.signe === "negatif" ? "Donner l'intégrale (négative) au lieu de son opposé : une aire n'est jamais négative." : undefined,
  };
}

function racinesB(e: ExerciceAireB): { r: number; m?: number }[] {
  if (e.type === "parabole") return [{ r: e.r1 }, { r: e.r2 }];
  const doubleEnR1 = Math.abs(deriveeEn(e.termes, e.r1)) < 1e-9;
  return doubleEnR1 ? [{ r: e.r1, m: 2 }, { r: e.r2 }] : [{ r: e.r1 }, { r: e.r2, m: 2 }];
}

function contenuB(e: ExerciceAireB, phase: PhaseCalculAires): ContenuEtape {
  const c = coefficients(e.termes);
  if (phase === "bEcran1") {
    return {
      methode: [t("Sans bornes données, la région est limitée par les points où la courbe coupe l'axe : on résout "), f("f(x)=0"), t(".")],
      calcul: `${polynomeLatex(e.termes)}=${factoriseLatex(dominant(c), racinesB(e))}`,
    };
  }
  if (phase === "bEcran2") {
    const m = (e.r1 + e.r2) / 2;
    return { methode: [t("Le signe est constant entre les racines : on teste une valeur de l'intervalle.")], calcul: `f\\left(${decimalLatex(m)}\\right)=${nombreCalculLatex(valeurEn(e.termes, m))}` };
  }
  return {
    methode: [t("L'aire vaut "), f(e.signe === "positif" ? "\\displaystyle\\int_{r_1}^{r_2} f(x)\\,dx" : "-\\displaystyle\\int_{r_1}^{r_2} f(x)\\,dx"), t(" ; une primitive de f s'obtient terme à terme.")],
    calcul: `${e.signe === "positif" ? "" : "-"}\\displaystyle\\int_{${e.r1}}^{${e.r2}} f(x)\\,dx=${e.signe === "positif" ? "" : "-"}\\left[${polynomeCoefsLatex(primitiveCoefs(c))}\\right]_{${e.r1}}^{${e.r2}}`,
    piege: e.signe === "negatif" ? "Oublier le signe moins : sous l'axe, l'intégrale est négative mais l'aire est positive." : undefined,
  };
}

function contenuC(e: ExerciceAireC, phase: PhaseCalculAires): ContenuEtape {
  const c = coefficients(e.termes);
  if (phase === "cEcran1") {
    return { methode: [t("On résout "), f("f(x)=0"), t(" (forme factorisée).")], calcul: `${polynomeLatex(e.termes)}=${factoriseLatex(dominant(c), [{ r: e.r1 }, { r: e.r2 }, { r: e.r3 }])}` };
  }
  if (phase === "cEcran2") {
    return { methode: [t("f change de signe à chaque racine simple : on teste une valeur dans chaque sous-intervalle.")], calcul: `\\text{sur }]${e.r1};${e.r2}[\\ :\\ ${SIGNE_LATEX[e.signeGauche]}\\qquad\\text{sur }]${e.r2};${e.r3}[\\ :\\ ${SIGNE_LATEX[e.signeDroit]}` };
  }
  const primitive = polynomeCoefsLatex(primitiveCoefs(c));
  if (phase === "cEcran3") {
    return {
      methode: [t("On intègre séparément sur chaque sous-intervalle, avec la même primitive.")],
      calcul: `I_1=\\left[${primitive}\\right]_{${e.r1}}^{${e.r2}}\\qquad I_2=\\left[${primitive}\\right]_{${e.r2}}^{${e.r3}}`,
    };
  }
  return {
    methode: [t("Chaque morceau compte pour sa valeur absolue : "), f("\\text{Aire}=|I_1|+|I_2|"), t(".")],
    piege: "Calculer une seule intégrale de r₁ à r₃ : les parties positive et négative se compensent.",
  };
}

function contenuD(e: ExerciceAireD, phase: PhaseCalculAires): ContenuEtape {
  if (e.sousType === "parametre") {
    const droite = e.motif === "droiteParOrigine";
    if (phase === "dEcran2") {
      return { methode: droite ? [t("Sur "), f("[0;m]"), t(", "), f("x^2\\leq mx"), t(" (car "), f("x(x-m)\\leq 0"), t(") : la droite est au-dessus.")] : [t("Sur "), f("[-\\sqrt{m};\\sqrt{m}]"), t(", "), f("x^2\\leq m"), t(" : la droite horizontale est au-dessus.")] };
    }
    if (phase === "dEcran3") {
      return {
        methode: [t("Aire = intégrale de (courbe du dessus − courbe du dessous) sur l'intervalle.")],
        calcul: droite
          ? "\\displaystyle\\int_0^m \\left(mx-x^2\\right)dx=\\left[\\dfrac{mx^2}{2}-\\dfrac{x^3}{3}\\right]_0^m=\\dfrac{m^3}{2}-\\dfrac{m^3}{3}"
          : "\\displaystyle\\int_{-\\sqrt{m}}^{\\sqrt{m}} \\left(m-x^2\\right)dx=\\left[mx-\\dfrac{x^3}{3}\\right]_{-\\sqrt{m}}^{\\sqrt{m}}=2\\left(m\\sqrt{m}-\\dfrac{m\\sqrt{m}}{3}\\right)",
      };
    }
    return {
      methode: [t("On égale l'aire en fonction de m à l'aire visée, puis on résout pour "), f("m>0"), t(".")],
      calcul: droite ? `\\dfrac{m^3}{6}=\\text{aire visée}\\iff m^3=${e.m ** 3}` : `\\dfrac{4}{3}m\\sqrt{m}=\\text{aire visée}\\iff m\\sqrt{m}=${nombreCalculLatex(e.m * Math.sqrt(e.m))}`,
    };
  }
  const h = difference(e.termesF, e.termesG);
  const dessusMoinsDessous = e.ordre === "fSurG" ? "f(x)-g(x)" : "g(x)-f(x)";
  if (phase === "dEcran1") {
    return {
      methode: [t("Les bornes sont les abscisses des points d'intersection : on résout "), f("f(x)=g(x)"), t(", c'est-à-dire "), f("f(x)-g(x)=0"), t(".")],
      calcul: `f(x)-g(x)=${polynomeCoefsLatex(h)}=${factoriseLatex(dominant(h), [{ r: e.r1 }, { r: e.r2 }])}`,
    };
  }
  if (phase === "dEcran2") {
    const m = (e.r1 + e.r2) / 2;
    return { methode: [t("Le signe de f − g en un point de l'intervalle indique quelle courbe est au-dessus.")], calcul: `f\\left(${decimalLatex(m)}\\right)-g\\left(${decimalLatex(m)}\\right)=${nombreCalculLatex(e.fReference(m) - e.gReference(m))}` };
  }
  const integrande = e.ordre === "fSurG" ? h : new Map([...h].map(([n, v]) => [n, -v] as [number, number]));
  return {
    methode: [t("Aire = intégrale de (courbe du dessus − courbe du dessous) : "), f(dessusMoinsDessous), t(".")],
    calcul: `\\displaystyle\\int_{${e.r1}}^{${e.r2}} \\left(${dessusMoinsDessous}\\right)dx=\\left[${polynomeCoefsLatex(primitiveCoefs(integrande))}\\right]_{${e.r1}}^{${e.r2}}`,
    piege: "Intégrer f − g sans savoir quelle courbe est au-dessus : le résultat peut être négatif.",
  };
}

function contenuEtape(exercice: ExerciceCalculAires, phase: PhaseCalculAires): ContenuEtape {
  switch (exercice.famille) {
    case "A":
      return contenuA(exercice, phase);
    case "B":
      return contenuB(exercice, phase);
    case "C":
      return contenuC(exercice, phase);
    case "D":
      return contenuD(exercice, phase);
  }
}

function correctionDetaillee(exercice: ExerciceCalculAires): EtapeCorrection[] {
  const phases = phasesPourExercice(exercice);
  return phases.flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    const contenu = contenuEtape(exercice, phase);
    const etapes: EtapeCorrection[] = [];
    if (contenu.methode.length > 0) etapes.push({ label: "Méthode", sousQuestion, fragments: contenu.methode });
    if (contenu.calcul) etapes.push({ label: "Calcul", sousQuestion, fragments: [f(contenu.calcul)] });
    if (contenu.piege) etapes.push({ label: "Piège", sousQuestion, fragments: [t(contenu.piege)] });
    const derniereEtape = i === phases.length - 1;
    etapes.push({ label: "Conclusion", sousQuestion, fragments: reponse(exercice, phase), ...(derniereEtape ? { figureHtml: figureCalculAiresSvg(exercice) } : {}) });
    return etapes;
  });
}

// ============================================================================
// Difficulté, réponse brève, barème.
// ============================================================================

function difficulte(exercice: ExerciceCalculAires): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
      return 1;
    case "B":
      return 2;
    case "C":
      return 3;
    case "D":
      return exercice.sousType === "parametre" ? 3 : 2;
  }
}

function reponseBreve(exercice: ExerciceCalculAires): FragmentConsigne[] {
  return reponse(exercice, derniere(exercice));
}

/** Poids des étapes (total 4) : le calcul final pèse le plus. */
function poids(exercice: ExerciceCalculAires): number[] {
  switch (exercice.famille) {
    case "A":
      return [1, 3];
    case "B":
      return [1, 1, 2];
    case "C":
      return [1, 1, 1, 1];
    case "D":
      if (exercice.sousType === "bornesDonnees") return [1, 3];
      if (exercice.sousType === "bornesATrouver") return [1, 1, 2];
      return [1, 1.5, 1.5];
  }
}

function bareme(exercice: ExerciceCalculAires): BaremeExercice {
  const phases = phasesPourExercice(exercice);
  const w = poids(exercice);
  const erreurs: { description: FragmentConsigne[]; cout: string }[] = [];
  for (const phase of phases) {
    const piege = contenuEtape(exercice, phase).piege;
    if (piege) erreurs.push({ description: [t(piege)], cout: "−1" });
  }
  erreurs.push({ description: [t("Erreur dans la primitive ou dans le calcul de F(b) − F(a)")], cout: "−1" });
  return {
    reponseFinale: reponse(exercice, derniere(exercice)),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(exercice, phase), points: w[i] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Valeur exacte ou arrondie au centième ; toute écriture équivalente de la valeur exacte")]],
  };
}

export const adaptateurEvaluationCalculAires: AdaptateurFeuilleExercices<ExerciceCalculAires> = {
  titreDocument: "Calcul d'aires par intégrale — Évaluation",
  nomFichierBase: "calcul-aires",
  genererInstance: genererExerciceCalculAires,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteCalculAires),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilCalculAires,
  libelleCasParticulier: LIBELLE_CAS_CALCUL_AIRES,
};
