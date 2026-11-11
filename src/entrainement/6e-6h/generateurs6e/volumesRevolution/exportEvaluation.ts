import type { ExerciceVolumeA, ExerciceVolumeB, ExerciceVolumeC, ExerciceVolumeD, ExerciceVolumesRevolution, TermeDeveloppe } from "../../core6e/volumesRevolution.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  blocDonnees,
  consigneEcran,
  consigneGenerale,
  differenceCarresLatex,
  formatReponseAttenduePhaseLatex,
  kLatexD,
  nomsDessusDessous,
  sommePrimitiveVolumeLatex,
  sommeVolumeLatex,
} from "../../ui6e/formatVolumesRevolution";
import { CONSIGNE_PRECISION, decimalLatex, fractionLatex } from "../../ui6e/nombresExactsIntegrales";
import { figureVolumesRevolutionSvg } from "../../ui6e/figureVolumesRevolution";
import { phasesPourExercice } from "../../moteur6e/typesVolumesRevolution";
import type { PhaseVolumesRevolution } from "../../moteur6e/typesVolumesRevolution";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVolumesRevolution } from "./index";
import type { IdVarianteVolumesRevolution } from "./index";
import { coefficients, difference, dominant, donneesPapier, factoriseLatex, nettoyerConsigne, nombreCalculLatex, polynomeCoefsLatex } from "../calculAires/papierCommun";
import { LIBELLE_CAS_VOLUMES_REVOLUTION, profilVolumesRevolution } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceVolumesRevolution>` pour `6gen27` (Volumes de
 * révolution) — feuille d'exercices et évaluation, méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par ÉCRAN (= une étape, lettres a, b…) ; consignes d'écran
 *   nettoyées des tournures propres à l'écran → titres « Étape n — … » du corrigé.
 * - `enoncePapier` : consigne globale (formule du volume), données, UNE demande (le volume) pour les
 *   familles A, B, C — racines, développement de [f(x)]², primitive : étapes du corrigé. Famille D :
 *   trois VRAIES questions (volume du paraboloïde, du cylindre, rapport). En A trigonométrique, la
 *   consigne rappelle l'identité de cos² (l'écran la donnait).
 * - Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli) ; figure (région et solide) :
 *   `figureVolumesRevolutionSvg`, la même qu'à l'écran, sous la dernière étape du corrigé.
 */

const LETTRES = "abcdefgh";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

/** Étapes dont la réponse est un développement : on rappelle ce qui a été développé. */
function prefixe(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): string {
  if (phase === "aEcran1" || phase === "bEcran2") return "[f(x)]^2=";
  if (phase === "cEcran3" && exercice.famille === "C") return `${differenceCarresLatex(exercice)}=`;
  return "";
}

/** Consigne d'une étape (corrigé papier) : celle de l'écran, sans le rappel cos² quand f n'est pas trigonométrique. */
function consigneEtape(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): FragmentConsigne[] {
  const consigne = nettoyerConsigne(consigneEcran(exercice, phase));
  if (phase === "aEcran1" && exercice.famille === "A" && exercice.type !== "trigonometrique") return [...consigne.slice(0, 2), t(".")];
  return consigne;
}

function reponse(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): FragmentConsigne[] {
  return [latex(prefixe(exercice, phase) + formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

function derniere(exercice: ExerciceVolumesRevolution): PhaseVolumesRevolution {
  const phases = phasesPourExercice(exercice);
  return phases[phases.length - 1];
}

// ============================================================================
// Énoncé interactif (étapes) et corrigé historique.
// ============================================================================

function entete(exercice: ExerciceVolumesRevolution): FragmentConsigne[] {
  return [...consigneGenerale(exercice), ...donneesPapier(blocDonnees(exercice))];
}

function construireEnonce(exercice: ExerciceVolumesRevolution): SectionExercice {
  return { enteteFragments: entete(exercice), questions: phasesPourExercice(exercice).map((phase) => ({ consigne: consigneEtape(exercice, phase) })) };
}

function construireCorrection(exercice: ExerciceVolumesRevolution): BlocCorrection[] {
  return phasesPourExercice(exercice).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(exercice, phase)] }));
}

// ============================================================================
// Énoncé papier.
// ============================================================================

const q = (...fragments: FragmentConsigne[]): QuestionExercice => ({ consigne: fragments });

function enoncePapier(exercice: ExerciceVolumesRevolution): EnoncePapier {
  if (exercice.famille === "D") {
    return {
      section: {
        enteteFragments: [...entete(exercice), t(` ${CONSIGNE_PRECISION}`)],
        questions: [
          q(t("Calcule le volume du paraboloïde.")),
          q(t("Calcule le volume du cylindre englobant, de rayon "), f("f(L)"), t(" et de hauteur L.")),
          q(t("Calcule le rapport du volume du paraboloïde au volume du cylindre.")),
        ],
      },
      etapesParQuestion: [["a"], ["b"], ["c"]],
    };
  }
  const rappelTrig: FragmentConsigne[] =
    exercice.famille === "A" && exercice.type === "trigonometrique" ? [t(" Rappel : "), f("{\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}}"), t(".")] : [];
  return {
    section: { enteteFragments: [...entete(exercice), ...rappelTrig, t(` Calcule ce volume. ${CONSIGNE_PRECISION}`)], questions: [] },
    reponseBreve: reponse(exercice, derniere(exercice)),
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

interface ContenuEtape {
  methode: FragmentConsigne[];
  calcul?: string;
  piege?: string;
}

function methodeDeveloppementA(e: ExerciceVolumeA): FragmentConsigne[] {
  if (e.type === "trigonometrique") return [t("On abaisse le degré avec l'identité "), f("\\cos^2(x)=\\dfrac{1+\\cos(2x)}{2}"), t(".")];
  if (e.type === "exponentielle") return [t("Carré d'un binôme, avec "), f("\\left(e^{x}\\right)^2=e^{2x}"), t(" : "), f("(p\\,e^{x}+q)^2=p^2e^{2x}+2pq\\,e^{x}+q^2"), t(".")];
  return [t("Carré d'un binôme : "), f("(px+q)^2=p^2x^2+2pqx+q^2"), t(".")];
}

function piegeDeveloppement(e: ExerciceVolumeA | ExerciceVolumeB): string {
  if (e.famille === "A" && e.type === "trigonometrique") return "Écrire cos²(x) comme cos(x²) : c'est le carré du cosinus, pas le cosinus du carré.";
  return "Élever au carré terme à terme : (a + b)² n'est pas a² + b², il manque le double produit.";
}

function etapeVolume(developpe: ExerciceVolumeA["developpe"], a: number, b: number): ContenuEtape {
  return {
    methode: [t("On évalue la primitive entre les bornes, puis on multiplie par π.")],
    calcul: `V=\\pi\\left[${sommePrimitiveVolumeLatex(developpe)}\\right]_{${a}}^{${b}}`,
    piege: "Oublier le facteur π devant l'intégrale.",
  };
}

/** Méthode de la primitive : seulement les règles qui servent pour CE développement. */
function etapePrimitive(developpe: TermeDeveloppe[]): ContenuEtape {
  const regles: FragmentConsigne[][] = [];
  if (developpe.some((x) => x.type === "expRate2")) regles.push([f("e^{2x}"), t(" a pour primitive "), f("\\dfrac{e^{2x}}{2}")]);
  if (developpe.some((x) => x.type === "cosRate2")) regles.push([f("\\cos(2x)"), t(" a pour primitive "), f("\\dfrac{\\sin(2x)}{2}")]);
  if (regles.length === 0) regles.push([f("x^n"), t(" a pour primitive "), f("\\dfrac{x^{n+1}}{n+1}")]);
  return { methode: [t("On primitive terme à terme ; "), ...regles.flatMap((r, i) => (i === 0 ? r : [t(" et "), ...r])), t(".")] };
}

function contenuA(e: ExerciceVolumeA, phase: PhaseVolumesRevolution): ContenuEtape {
  if (phase === "aEcran1") return { methode: methodeDeveloppementA(e), calcul: `[f(x)]^2=\\left(${sommeVolumeLatex(e.termes)}\\right)^2`, piege: piegeDeveloppement(e) };
  if (phase === "aEcran2") return etapePrimitive(e.developpe);
  return etapeVolume(e.developpe, e.a, e.b);
}

function contenuB(e: ExerciceVolumeB, phase: PhaseVolumesRevolution): ContenuEtape {
  if (phase === "bEcran1") {
    const c = coefficients(e.termes);
    return { methode: [t("Les bornes sont les racines de f : on résout "), f("f(x)=0"), t(".")], calcul: `${sommeVolumeLatex(e.termes)}=${factoriseLatex(dominant(c), [{ r: e.r1 }, { r: e.r2 }])}` };
  }
  if (phase === "bEcran2") return { methode: [t("Carré d'un trinôme : on développe le produit "), f("f(x)\\cdot f(x)"), t(" et on réduit.")], calcul: `[f(x)]^2=\\left(${sommeVolumeLatex(e.termes)}\\right)^2`, piege: piegeDeveloppement(e) };
  if (phase === "bEcran3") return { methode: [t("On primitive terme à terme.")] };
  return etapeVolume(e.developpe, e.r1, e.r2);
}

function contenuC(e: ExerciceVolumeC, phase: PhaseVolumesRevolution): ContenuEtape {
  if (phase === "cEcran1") {
    const h = difference(e.termesF, e.termesG);
    return {
      methode: [t("Les bornes sont les abscisses des points d'intersection : on résout "), f("f(x)=g(x)"), t(".")],
      calcul: `f(x)-g(x)=${polynomeCoefsLatex(h)}=${factoriseLatex(dominant(h), [{ r: e.r1 }, { r: e.r2 }])}`,
    };
  }
  if (phase === "cEcran2") {
    const m = (e.r1 + e.r2) / 2;
    return { methode: [t("Le signe de f − g en un point de l'intervalle indique quelle courbe est au-dessus.")], calcul: `f\\left(${decimalLatex(m)}\\right)-g\\left(${decimalLatex(m)}\\right)=${nombreCalculLatex(e.fReference(m) - e.gReference(m))}` };
  }
  if (phase === "cEcran3") {
    const { dessus } = nomsDessusDessous(e);
    const termesDessus = dessus === "f" ? e.termesF : e.termesG;
    const termesDessous = dessus === "f" ? e.termesG : e.termesF;
    return {
      methode: [t("Méthode des rondelles : on soustrait les carrés, courbe du dessus moins courbe du dessous.")],
      calcul: `${differenceCarresLatex(e)}=\\left(${sommeVolumeLatex(termesDessus)}\\right)^2-\\left(${sommeVolumeLatex(termesDessous)}\\right)^2`,
      piege: "Élever la différence au carré, [f(x) − g(x)]², au lieu de soustraire les carrés.",
    };
  }
  return etapeVolume(e.developpe, e.r1, e.r2);
}

function contenuD(e: ExerciceVolumeD, phase: PhaseVolumesRevolution): ContenuEtape {
  const k = kLatexD(e);
  const k2 = fractionLatex(e.kNum * e.kNum, e.kDen * e.kDen);
  const k2x = k2 === "1" ? "" : k2;
  if (phase === "dEcran1") {
    return {
      methode: [t("Méthode des disques : le carré fait disparaître la racine.")],
      calcul: `V=\\pi\\displaystyle\\int_0^{${e.L}}\\left(${k}\\sqrt{x}\\right)^2dx=\\pi\\displaystyle\\int_0^{${e.L}}${k2x}x\\,dx=\\pi\\cdot ${k2x}\\dfrac{${e.L}^2}{2}`,
    };
  }
  if (phase === "dEcran2") {
    return {
      methode: [t("Volume d'un cylindre : aire de la base × hauteur, avec un rayon "), f(`f(${e.L})=${k}\\sqrt{${e.L}}`), t(".")],
      calcul: `V=\\pi\\left(${k}\\sqrt{${e.L}}\\right)^2\\cdot ${e.L}`,
      piege: "Prendre L pour le rayon : le rayon du cylindre est f(L), la hauteur est L.",
    };
  }
  return { methode: [t("On divise les deux volumes : π, "), f("k^2"), t(" et "), f("L^2"), t(" se simplifient — le paraboloïde occupe toujours la moitié de son cylindre.")] };
}

function contenuEtape(exercice: ExerciceVolumesRevolution, phase: PhaseVolumesRevolution): ContenuEtape {
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

function correctionDetaillee(exercice: ExerciceVolumesRevolution): EtapeCorrection[] {
  const phases = phasesPourExercice(exercice);
  return phases.flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    const contenu = contenuEtape(exercice, phase);
    const etapes: EtapeCorrection[] = [];
    if (contenu.methode.length > 0) etapes.push({ label: "Méthode", sousQuestion, fragments: contenu.methode });
    if (contenu.calcul) etapes.push({ label: "Calcul", sousQuestion, fragments: [f(contenu.calcul)] });
    if (contenu.piege) etapes.push({ label: "Piège", sousQuestion, fragments: [t(contenu.piege)] });
    const figure = i === phases.length - 1 ? { figureHtml: figureVolumesRevolutionSvg(exercice) } : {};
    etapes.push({ label: "Conclusion", sousQuestion, fragments: reponse(exercice, phase), ...figure });
    return etapes;
  });
}

// ============================================================================
// Difficulté, réponse brève, barème.
// ============================================================================

function difficulte(exercice: ExerciceVolumesRevolution): 1 | 2 | 3 {
  return exercice.famille === "C" ? 3 : 2;
}

function reponseBreve(exercice: ExerciceVolumesRevolution): FragmentConsigne[] {
  if (exercice.famille === "D") return phasesPourExercice(exercice).flatMap((phase, i) => [t(`${i === 0 ? "" : " ; "}${LETTRES[i]}) `), ...reponse(exercice, phase)]);
  return reponse(exercice, derniere(exercice));
}

function poids(exercice: ExerciceVolumesRevolution): number[] {
  switch (exercice.famille) {
    case "A":
      return [1.5, 1, 1.5];
    case "B":
    case "C":
      return [1, 1, 1, 1];
    case "D":
      return [1.5, 1.5, 1];
  }
}

function bareme(exercice: ExerciceVolumesRevolution): BaremeExercice {
  const phases = phasesPourExercice(exercice);
  const w = poids(exercice);
  const erreurs: { description: FragmentConsigne[]; cout: string }[] = [];
  for (const phase of phases) {
    const piege = contenuEtape(exercice, phase).piege;
    if (piege) erreurs.push({ description: [t(piege)], cout: "−1" });
  }
  return {
    reponseFinale: reponse(exercice, derniere(exercice)),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(exercice, phase), points: w[i] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Valeur exacte (multiple de π, forme avec e ou sin) ou arrondie au centième ; un développement non réduit mais juste est accepté")]],
  };
}

export const adaptateurEvaluationVolumesRevolution: AdaptateurFeuilleExercices<ExerciceVolumesRevolution> = {
  titreDocument: "Volumes de révolution — Évaluation",
  nomFichierBase: "volumes-revolution",
  genererInstance: genererExerciceVolumesRevolution,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteVolumesRevolution),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilVolumesRevolution,
  libelleCasParticulier: LIBELLE_CAS_VOLUMES_REVOLUTION,
};
