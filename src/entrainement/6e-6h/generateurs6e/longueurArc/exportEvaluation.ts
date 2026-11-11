import type { ExerciceLongueurArc, ExerciceLongueurArcA, ExerciceLongueurArcB, ExerciceLongueurArcC } from "../../core6e/longueurArc.types";
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
import {
  blocDonnees,
  borneBLatex,
  coefPrimitiveC,
  consigneEcran,
  consigneGenerale,
  demiLatex,
  formatReponseAttenduePhaseLatex,
  formuleFPrimeCarreDeveloppeA,
  formulePrimitiveEnTB,
  formuleRacineSimplifieeA,
  kLatexC,
  unPlusKxLatex,
} from "../../ui6e/formatLongueurArc";
import { CONSIGNE_PRECISION, fractionLatex } from "../../ui6e/nombresExactsIntegrales";
import { figureLongueurArcSvg } from "../../ui6e/figureLongueurArc";
import { phasesPourExercice } from "../../moteur6e/typesLongueurArc";
import type { PhaseLongueurArc } from "../../moteur6e/typesLongueurArc";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLongueurArc } from "./index";
import type { IdVarianteLongueurArc } from "./index";
import { donneesPapier, nettoyerConsigne } from "../calculAires/papierCommun";
import { LIBELLE_CAS_LONGUEUR_ARC, profilLongueurArc } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLongueurArc>` pour `6gen28` (Longueur d'un arc de
 * courbe) — feuille d'exercices et évaluation, méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par ÉCRAN (= une étape) ; consignes d'écran nettoyées des
 *   tournures propres à l'écran → titres « Étape n — … » du corrigé.
 * - `enoncePapier` : consigne globale (formule de L), données, UNE demande (la longueur). Famille B
 *   (pour aller plus loin) : la substitution est imposée, avec la valeur de k² écrite en clair.
 *   f′, simplification de la racine, bornes en t, primitive : étapes du corrigé.
 * - Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli) ; figure (l'arc entre a et b) :
 *   `figureLongueurArcSvg`, la même qu'à l'écran, sous la dernière étape du corrigé.
 */

const LETTRES = "abcdefgh";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): FragmentConsigne[] {
  const prefixe = phase === "bEcran2" ? "\\text{fonction à intégrer : }" : phase === "bEcran3" || phase === "cEcran2" ? "\\text{primitive : }" : "";
  return [latex(prefixe + formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

function derniere(exercice: ExerciceLongueurArc): PhaseLongueurArc {
  const phases = phasesPourExercice(exercice);
  return phases[phases.length - 1];
}

// ============================================================================
// Énoncé interactif (étapes) et corrigé historique.
// ============================================================================

function entete(exercice: ExerciceLongueurArc): FragmentConsigne[] {
  return [...consigneGenerale(exercice), ...donneesPapier(blocDonnees(exercice))];
}

function construireEnonce(exercice: ExerciceLongueurArc): SectionExercice {
  return { enteteFragments: entete(exercice), questions: phasesPourExercice(exercice).map((phase) => ({ consigne: nettoyerConsigne(consigneEcran(exercice, phase)) })) };
}

function construireCorrection(exercice: ExerciceLongueurArc): BlocCorrection[] {
  return phasesPourExercice(exercice).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(exercice, phase)] }));
}

// ============================================================================
// Énoncé papier : une seule demande.
// ============================================================================

function enoncePapier(exercice: ExerciceLongueurArc): EnoncePapier {
  const substitution: FragmentConsigne[] =
    exercice.famille === "B" ? [t(" Utilise la substitution "), f(`t=\\sqrt{x^2+${exercice.k * exercice.k}}`), t(".")] : [];
  return {
    section: { enteteFragments: [...entete(exercice), ...substitution, t(` Calcule la longueur de cet arc. ${CONSIGNE_PRECISION}`)], questions: [] },
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

function primitiveRacineA(e: ExerciceLongueurArcA): string {
  if (e.forme === "log") return `\\dfrac{x^2}{${4 * e.c}}+${demiLatex(e.c)}\\ln(x)`;
  const n = e.n;
  const second = n - 1 === 1 ? `x^{${1 - n}}` : `\\dfrac{x^{${1 - n}}}{${n - 1}}`;
  return `\\dfrac{1}{2}\\left(\\dfrac{x^{${n + 1}}}{${n + 1}}-${second}\\right)`;
}

function contenuA(e: ExerciceLongueurArcA, phase: PhaseLongueurArc): ContenuEtape {
  if (phase === "aEcran1") {
    return e.forme === "log"
      ? { methode: [t("On dérive terme à terme, avec "), f("(\\ln x)'=\\dfrac{1}{x}"), t(".")] }
      : { methode: [t("On dérive terme à terme, avec "), f("\\left(x^p\\right)'=p\\,x^{p-1}"), t(" (exposants négatifs compris).")] };
  }
  if (phase === "aEcran2") {
    return {
      methode: [t("On développe "), f("[f'(x)]^2"), t(" ; en ajoutant 1, le terme constant change de signe et on reconnaît un carré parfait.")],
      calcul: `1+[f'(x)]^2=1+${formuleFPrimeCarreDeveloppeA(e)}=\\left(${formuleRacineSimplifieeA(e)}\\right)^2`,
      piege: "Écrire √(1 + [f′(x)]²) = 1 + f′(x) : la racine d'une somme n'est pas la somme des racines.",
    };
  }
  return {
    methode: [t("On intègre la forme simplifiée, positive sur l'intervalle.")],
    calcul: `L=\\displaystyle\\int_{${e.a}}^{${e.b}}\\left(${formuleRacineSimplifieeA(e)}\\right)dx=\\left[${primitiveRacineA(e)}\\right]_{${e.a}}^{${e.b}}`,
  };
}

function contenuB(e: ExerciceLongueurArcB, phase: PhaseLongueurArc): ContenuEtape {
  const k = e.k;
  const k2 = k * k;
  if (phase === "bEcran1") {
    return {
      methode: [t("On remplace x par chaque borne dans "), f(`t=\\sqrt{x^2+${k2}}`), t(".")],
      calcul: `t_1=\\sqrt{\\left(${borneBLatex(e.t1, k)}\\right)^2+${k2}}=\\sqrt{${e.t1 * e.t1}}\\qquad t_2=\\sqrt{\\left(${borneBLatex(e.t2, k)}\\right)^2+${k2}}=\\sqrt{${e.t2 * e.t2}}`,
    };
  }
  if (phase === "bEcran2") {
    return {
      methode: [t("Avec "), f(`f'(x)=\\dfrac{${k}}{x}`), t(", on a "), f(`1+[f'(x)]^2=\\dfrac{x^2+${k2}}{x^2}`), t(" ; en dérivant "), f(`t^2=x^2+${k2}`), t(", "), f("t\\,dt=x\\,dx"), t(".")],
      calcul: `\\dfrac{\\sqrt{x^2+${k2}}}{x}\\,dx=\\dfrac{t}{x}\\cdot\\dfrac{t\\,dt}{x}=\\dfrac{t^2}{x^2}\\,dt=\\dfrac{t^2}{t^2-${k2}}\\,dt`,
    };
  }
  if (phase === "bEcran3") {
    const coef = k === 2 ? "" : k % 2 === 0 ? `${k / 2}` : `\\dfrac{${k}}{2}`;
    return {
      methode: [t("On écrit la fraction comme 1 plus une fraction simple, puis on décompose en éléments simples ; chaque terme se primitive en un logarithme.")],
      calcul: `\\dfrac{t^2}{t^2-${k2}}=1+\\dfrac{${k2}}{t^2-${k2}}=1+${coef}\\left(\\dfrac{1}{t-${k}}-\\dfrac{1}{t+${k}}\\right)`,
    };
  }
  return {
    methode: [t("On évalue la primitive entre les bornes en t.")],
    calcul: `L=\\left[${formulePrimitiveEnTB(k)}\\right]_{${e.t1}}^{${e.t2}}`,
    piege: "Évaluer la primitive en t aux bornes en x (a et b) au lieu des bornes en t.",
  };
}

function contenuC(e: ExerciceLongueurArcC, phase: PhaseLongueurArc): ContenuEtape {
  if (phase === "cEcran1") {
    const coefDerivee = fractionLatex(3 * e.cNum, 2 * e.cDen);
    return {
      methode: [t("On dérive "), f("x^{3/2}"), t(" en "), f("\\dfrac{3}{2}x^{1/2}"), t(", puis on élève au carré : "), f("\\left(\\sqrt{x}\\right)^2=x"), t(".")],
      calcul: `f'(x)=${coefDerivee === "1" ? "" : coefDerivee}\\sqrt{x}\\quad\\Longrightarrow\\quad 1+[f'(x)]^2=1+${kLatexC(e) === "1" ? "" : kLatexC(e)}x`,
    };
  }
  if (phase === "cEcran2") {
    return {
      methode: [t("Racine d'une expression du premier degré : composée affine, une primitive de "), f("\\sqrt{1+kx}"), t(" est "), f("\\dfrac{1}{k}\\cdot\\dfrac{2}{3}(1+kx)^{3/2}"), t(".")],
      piege: "Oublier le facteur 1/k de la composée affine.",
    };
  }
  return {
    methode: [t("On évalue la primitive entre a et b.")],
    calcul: `L=\\left[${coefPrimitiveC(e)}\\left(${unPlusKxLatex(e)}\\right)^{3/2}\\right]_{${e.a}}^{${e.b}}`,
  };
}

function contenuEtape(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): ContenuEtape {
  switch (exercice.famille) {
    case "A":
      return contenuA(exercice, phase);
    case "B":
      return contenuB(exercice, phase);
    case "C":
      return contenuC(exercice, phase);
  }
}

function correctionDetaillee(exercice: ExerciceLongueurArc): EtapeCorrection[] {
  const phases = phasesPourExercice(exercice);
  return phases.flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    const contenu = contenuEtape(exercice, phase);
    const etapes: EtapeCorrection[] = [];
    if (contenu.methode.length > 0) etapes.push({ label: "Méthode", sousQuestion, fragments: contenu.methode });
    if (contenu.calcul) etapes.push({ label: "Calcul", sousQuestion, fragments: [f(contenu.calcul)] });
    if (contenu.piege) etapes.push({ label: "Piège", sousQuestion, fragments: [t(contenu.piege)] });
    const figure = i === phases.length - 1 ? { figureHtml: figureLongueurArcSvg(exercice) } : {};
    etapes.push({ label: "Conclusion", sousQuestion, fragments: reponse(exercice, phase), ...figure });
    return etapes;
  });
}

// ============================================================================
// Difficulté, réponse brève, barème.
// ============================================================================

function difficulte(exercice: ExerciceLongueurArc): 1 | 2 | 3 {
  if (exercice.famille === "B") return 3;
  return exercice.famille === "C" ? 1 : 2;
}

function reponseBreve(exercice: ExerciceLongueurArc): FragmentConsigne[] {
  return reponse(exercice, derniere(exercice));
}

function poids(exercice: ExerciceLongueurArc): number[] {
  switch (exercice.famille) {
    case "A":
      return [1, 1.5, 1.5];
    case "B":
      return [1, 1, 1, 1];
    case "C":
      return [1.5, 1, 1.5];
  }
}

function bareme(exercice: ExerciceLongueurArc): BaremeExercice {
  const phases = phasesPourExercice(exercice);
  const w = poids(exercice);
  const erreurs: { description: FragmentConsigne[]; cout: string }[] = [];
  for (const phase of phases) {
    const piege = contenuEtape(exercice, phase).piege;
    if (piege) erreurs.push({ description: [t(piege)], cout: "−1" });
  }
  erreurs.push({ description: [t("Oublier le « 1 + » ou la racine dans la formule de la longueur")], cout: "−2" });
  return {
    reponseFinale: reponse(exercice, derniere(exercice)),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(exercice, phase), points: w[i] })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[t("Valeur exacte (fraction, ou fraction plus un logarithme) ou arrondie au centième")]],
  };
}

export const adaptateurEvaluationLongueurArc: AdaptateurFeuilleExercices<ExerciceLongueurArc> = {
  titreDocument: "Longueur d'un arc de courbe — Évaluation",
  nomFichierBase: "longueur-arc",
  genererInstance: genererExerciceLongueurArc,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteLongueurArc),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilLongueurArc,
  libelleCasParticulier: LIBELLE_CAS_LONGUEUR_ARC,
};
