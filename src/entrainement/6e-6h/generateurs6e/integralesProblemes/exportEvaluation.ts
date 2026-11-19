import type {
  ExerciceFamilleA_Problemes,
  ExerciceFamilleB_Problemes,
  ExerciceFamilleC_Problemes,
  ExerciceFamilleD_Problemes,
  ExerciceFamilleE_Problemes,
  ExerciceFamilleF_Problemes,
  ExerciceFamilleG_Problemes,
  ExerciceIntegralesProblemes,
} from "../../core6e/integralesProblemes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesIntegralesProblemes";
import {
  afficheAffine,
  blocDonnees,
  coefRacineLatex,
  consigneEcran,
  consigneGenerale,
  decimalLatex,
  demandeLatexF,
  fLatexE,
  fractionLatex,
  PRECISION_ARCHIMEDE,
  rationnelExactLatex,
} from "../../ui6e/formatIntegralesProblemes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegralesProblemes } from "./index";
import type { IdVarianteIntegralesProblemes } from "./index";
import { LIBELLE_CAS_INTEGRALES_PROBLEMES, profilIntegralesProblemes } from "./profilEvaluation";
import { correctionDetailleeIntegralesProblemes, piegeIntegralesProblemes, reponseIntegralesProblemes } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIntegralesProblemes>` pour `6gen29` (Intégrales et
 * primitives : problèmes) — feuille d'exercices et évaluation, méthode de
 * `.claude/rules/feuilles-evaluations.md` (modèle : 6gen22, `logarithmesProblemes/exportEvaluation.ts`).
 *
 * - `construireEnonce` : une question par écran du générateur interactif (= une ÉTAPE, lettre a, b…
 *   dans l'ordre des écrans) — ses consignes deviennent les titres « Étape n — … » du corrigé.
 * - `enoncePapier` : le problème tel qu'imprimé. Les VRAIES questions distinctes du problème restent
 *   en a) b) c) (B : v, x, résultat ; C : k, W [, W₂, comparaison] ; D : C(q), C(q₁), augmentation,
 *   coût moyen ; E : variation, moyenne, interprétation ; F : équilibre, surplus ; G_archimède : verre,
 *   débordement, fraction). Les étapes de pur guidage passent au corrigé : A (somme des trapèzes),
 *   G_soustraction (volume de la pièce pleine, puis matière : une seule demande), G_calotte
 *   (intégrande, primitive).
 * - Résultats : `formatReponseAttenduePhaseLatex` (ceux de l'appli), jamais recalculés à part ; les
 *   lignes « Calcul » posent l'opération avec les valeurs de l'instance (mêmes formateurs LaTeX que
 *   l'écran, exportés par `ui6e/formatIntegralesProblemes.ts`).
 */

const LETTRES = "abcdefgh";

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

const reponse = reponseIntegralesProblemes;

const PRECISION = " Donne chaque résultat sous forme exacte, ou arrondi au centième.";

// ============================================================================
// Énoncé interactif (étapes) — titres des étapes du corrigé.
// ============================================================================

function construireEnonce(exercice: ExerciceIntegralesProblemes): SectionExercice {
  return {
    enteteFragments: [...consigneGenerale(exercice), t(" Données : "), latex(blocDonnees(exercice).join(",\\quad ")), t(".")],
    questions: phasesPourExercice(exercice).map((phase) => ({ consigne: consigneEcran(exercice, phase) })),
  };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(exercice: ExerciceIntegralesProblemes): BlocCorrection[] {
  return phasesPourExercice(exercice).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(exercice, phase)] }));
}

// ============================================================================
// Énoncé papier.
// ============================================================================

const q = (...fragments: FragmentConsigne[]): QuestionExercice => ({ consigne: fragments });

/** Données de la famille A, une formule par valeur (Δx, chaque hauteur, profondeur) séparées par des
 * points-virgules : le rendu ne coupe jamais une égalité en fin de ligne. */
function donneesA(e: ExerciceFamilleA_Problemes): FragmentConsigne[] {
  const valeurs = [`\\Delta x=${e.deltaX}`, ...e.y.map((v, i) => `y_{${i}}=${v}`)];
  if (e.dimensionSupplementaire !== null) valeurs.push(`p=${e.dimensionSupplementaire}\\ \\text{m}`);
  return valeurs.flatMap((v, i) => (i === 0 ? [f(v)] : [t(" ; "), f(v)]));
}

function entetePapierB(e: ExerciceFamilleB_Problemes): FragmentConsigne[] {
  return [
    t("Un mobile se déplace en ligne droite (t en secondes, position en mètres). Son accélération (en m/s²) vaut "),
    f(`a(t)=${afficheAffine(e.k, e.p, "t")}`),
    t(" ; sa vitesse initiale vaut "),
    f(`v(0)=${e.v0}`),
    t(" m/s et sa position initiale "),
    f(`x(0)=${e.x0}`),
    t(" m."),
  ];
}

function questionsB(e: ExerciceFamilleB_Problemes): QuestionExercice[] {
  const derniere =
    e.sousType === "evaluer"
      ? q(t("Calcule la position du mobile à l'instant "), f(`t=${e.t1}`), t(" s."))
      : q(t("Détermine l'instant "), f("t\\geq 0"), t(" où le mobile atteint la position "), f(`x=${rationnelExactLatex(e.cible as number)}`), t(" m."));
  return [q(t("Détermine sa vitesse "), f("v(t)"), t(".")), q(t("Détermine sa position "), f("x(t)"), t(".")), derniere];
}

function entetePapierC(e: ExerciceFamilleC_Problemes): FragmentConsigne[] {
  return [
    t("La force nécessaire pour étirer un ressort suit la loi de Hooke : "),
    f("F(x)=k\\cdot x"),
    t(" (F en newtons, allongement x en mètres). On sait que "),
    f(`F(${e.x0})=${e.F0}`),
    t(". Le travail (en joules) pour étirer le ressort d'un allongement a à un allongement b vaut "),
    f("W=\\displaystyle\\int_a^b k\\cdot x\\,dx"),
    t("."),
  ];
}

function questionsC(e: ExerciceFamilleC_Problemes): QuestionExercice[] {
  const base = [q(t("Détermine k.")), q(t("Calcule le travail "), f("W"), t(" pour passer de "), f(`x=${e.a}`), t(" à "), f(`x=${e.b}`), t("."))];
  if (e.a2 === null) return base;
  return [
    ...base,
    q(t("Calcule le travail "), f("W_2"), t(" pour passer de "), f(`x=${e.a2}`), t(" à "), f(`x=${e.b2}`), t(".")),
    q(t("Les deux intervalles ont la même longueur. Lequel des deux travaux est le plus grand ? Justifie.")),
  ];
}

function entetePapierD(e: ExerciceFamilleD_Problemes): FragmentConsigne[] {
  return [
    t("Le coût marginal de production (en euros par unité) vaut "),
    f(`f(q)=${e.a}-${fractionLatex(e.bNum, e.bDen)}q`),
    t(", et le coût fixe vaut "),
    f(`C(0)=${e.F0}`),
    t(" €."),
    t(PRECISION),
  ];
}

function questionsD(e: ExerciceFamilleD_Problemes): QuestionExercice[] {
  return [
    q(t("Détermine le coût total "), f("C(q)"), t(".")),
    q(t("Calcule "), f(`C(${e.q1})`), t(".")),
    q(t("Calcule l'augmentation du coût total quand la production passe de "), f(`${e.q1}`), t(" à "), f(`${e.q2}`), t(" unités.")),
    q(t("Donne l'expression du coût moyen "), f("C_{\\text{moy}}(q)=\\dfrac{C(q)}{q}"), t(".")),
  ];
}

function contexteE(e: ExerciceFamilleE_Problemes) {
  return e.contexte === "stock"
    ? { sujet: "Le stock d'un entrepôt", unite: "en unités par jour", grandeur: "du stock" }
    : { sujet: "Le cours d'une action", unite: "en euros par jour", grandeur: "du cours" };
}

function entetePapierE(e: ExerciceFamilleE_Problemes): FragmentConsigne[] {
  const c = contexteE(e);
  return [
    t(`${c.sujet} varie au rythme `),
    f("f(t)"),
    t(` (${c.unite}, t en jours) : `),
    f("f(t)"),
    t(` est le taux de variation ${c.grandeur}. On donne `),
    f(`f(t)=${fLatexE(e)}`),
    t("."),
  ];
}

function questionsE(e: ExerciceFamilleE_Problemes): QuestionExercice[] {
  const { a, b } = e.exerciceMoyenne;
  return [
    q(t(`Calcule la variation totale ${contexteE(e).grandeur} entre `), f(`t=${a}`), t(" et "), f(`t=${b}`), t(".")),
    q(t("Calcule la valeur moyenne de f sur "), f(`[${a}\\,;\\,${b}]`), t(".")),
    q(t("Que représente cette valeur moyenne dans le contexte ?")),
  ];
}

function entetePapierF(e: ExerciceFamilleF_Problemes): FragmentConsigne[] {
  return [
    t("Sur un marché, la demande vaut "),
    f(`f(x)=${demandeLatexF(e)}`),
    t(" et l'offre "),
    f(`g(x)=${afficheAffine(e.m, e.p, "x")}`),
    t(" (x : quantité, prix en euros)."),
  ];
}

function questionsF(): QuestionExercice[] {
  return [
    q(t("Détermine le point d'équilibre "), f("(Q\\,;\\,P)"), t(", solution de "), f("f(x)=g(x)"), t(", avec Q et P arrondis au centième.")),
    q(t("Calcule le surplus du consommateur "), f("S=\\displaystyle\\int_0^Q \\big(f(x)-P\\big)\\,dx"), t(", arrondi au dixième.")),
  ];
}

function entetePapierArchimede(e: Extract<ExerciceFamilleG_Problemes, { sousType: "archimede" }>): FragmentConsigne[] {
  const p = e.paraboloide;
  return [
    t("Un verre a la forme du solide engendré par la rotation, autour de l'axe des abscisses, de la région sous la courbe de "),
    f(`f(x)=${coefRacineLatex(p.kNum, p.kDen)}\\sqrt{x}`),
    t(" pour "),
    f(`x\\in[0\\,;\\,${p.L}]`),
    t(". Il est rempli d'eau à ras bord. On y plonge une bille de rayon "),
    f(`r=${decimalLatex(e.r)}`),
    t(", entièrement immergée."),
    t(PRECISION_ARCHIMEDE),
  ];
}

function questionsArchimede(): QuestionExercice[] {
  return [
    q(t("Calcule le volume du verre.")),
    q(t("Calcule le volume d'eau qui déborde.")),
    q(t("Quelle fraction du volume d'eau initial a débordé ?")),
  ];
}

function enoncePapier(exercice: ExerciceIntegralesProblemes): EnoncePapier {
  const lettres = phasesPourExercice(exercice).map((_, i) => LETTRES[i]);
  // Problème à vraies questions : une question par étape, a) b) c)…
  const parEtape = (entete: FragmentConsigne[], questions: QuestionExercice[]): EnoncePapier => ({
    section: { enteteFragments: entete, questions },
    etapesParQuestion: lettres.map((l) => [l]),
  });
  switch (exercice.famille) {
    case "A":
      // La somme entre crochets est une étape de calcul, pas une question : énoncé seul.
      return { section: { enteteFragments: [...consigneGenerale(exercice), t(" Données : "), ...donneesA(exercice), t(".")], questions: [] }, reponseBreve: reponse(exercice, "aEcran2") };
    case "B":
      return parEtape([...entetePapierB(exercice), ...(exercice.sousType === "evaluer" ? [t(PRECISION)] : [])], questionsB(exercice));
    case "C":
      return parEtape(entetePapierC(exercice), questionsC(exercice));
    case "D":
      return parEtape(entetePapierD(exercice), questionsD(exercice));
    case "E":
      return parEtape(entetePapierE(exercice), questionsE(exercice));
    case "F":
      return parEtape(entetePapierF(exercice), questionsF());
    case "G":
      if (exercice.sousType === "archimede") return parEtape(entetePapierArchimede(exercice), questionsArchimede());
      // Soustraction (une demande : le volume de matière) et calotte (V(h)) : énoncé seul.
      return {
        section: { enteteFragments: consigneGenerale(exercice), questions: [] },
        reponseBreve: exercice.sousType === "soustraction" ? [...reponse(exercice, "gSoustractionEcran1"), t(" ; "), ...reponse(exercice, "gSoustractionEcran2")] : reponse(exercice, "gCalotteEcran3"),
      };
  }
}

// ============================================================================
// Corrigé détaillé : par étape, Méthode, Calcul, Piège éventuel, Conclusion.
// ============================================================================

function difficulte(exercice: ExerciceIntegralesProblemes): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "A":
      return exercice.contexte === "terrain" ? 1 : 2;
    case "B":
      return exercice.sousType === "evaluer" ? 2 : 3;
    case "C":
      return exercice.a2 === null ? 1 : 2;
    case "D":
    case "E":
      return 2;
    case "F":
      return 3;
    case "G":
      return exercice.sousType === "calotte" ? 3 : 2;
  }
}

function reponseBreve(exercice: ExerciceIntegralesProblemes): FragmentConsigne[] {
  const papier = enoncePapier(exercice);
  if (papier.reponseBreve) return papier.reponseBreve;
  return phasesPourExercice(exercice).flatMap((phase, i) => [t(`${i === 0 ? "" : " ; "}${LETTRES[i]}) `), ...reponse(exercice, phase)]);
}

/** Poids des étapes (total 4) : l'étape principale du problème pèse plus. */
function poids(exercice: ExerciceIntegralesProblemes): number[] {
  const n = phasesPourExercice(exercice).length;
  switch (exercice.famille) {
    case "A":
      return [2, 2];
    case "B":
      return [1.5, 1.5, 1];
    case "C":
      return n === 2 ? [1, 3] : [1, 1, 1, 1];
    case "D":
      return [1, 1, 1, 1];
    case "E":
      return [1.5, 1.5, 1];
    case "F":
      return [2, 2];
    case "G":
      if (exercice.sousType === "soustraction") return [3, 1];
      if (exercice.sousType === "archimede") return [2, 1, 1];
      return [1, 1, 2];
  }
}

function erreursFrequentes(exercice: ExerciceIntegralesProblemes): { texte: string; cout: string }[] {
  const liste: { texte: string; cout: string }[] = [];
  for (const phase of phasesPourExercice(exercice)) {
    const piege = piegeIntegralesProblemes(exercice, phase);
    if (piege) liste.push({ texte: piege, cout: "−1" });
  }
  liste.push({ texte: "Oublier l'unité du résultat ou arrondir trop tôt une valeur intermédiaire", cout: "−0,5" });
  return liste;
}

function bareme(exercice: ExerciceIntegralesProblemes): BaremeExercice {
  const phases = phasesPourExercice(exercice);
  const w = poids(exercice);
  const acceptees: FragmentConsigne[][] = [[t("Valeur exacte ou arrondie au centième ; un écart dû à l'arrondi d'une étape intermédiaire est toléré")]];
  if (exercice.famille === "F") acceptees.push([t("Q et P lus à la calculatrice à 0,01 près ; S à 0,1 près")]);
  if (exercice.famille === "G" && exercice.sousType === "archimede") acceptees.push([t("Fraction débordée : forme exacte, ou valeur approchée à trois chiffres significatifs")]);
  if (exercice.famille === "E") acceptees.push([t("Toute formulation équivalente : « le taux constant qui produirait la même variation totale »")]);
  return {
    reponseFinale: reponse(exercice, phases[phases.length - 1]),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(exercice, phase), points: w[i] })),
    erreursFrequentes: erreursFrequentes(exercice).map((e) => ({ description: [t(e.texte)], cout: e.cout })),
    reponsesAcceptees: acceptees,
  };
}

export const adaptateurEvaluationIntegralesProblemes: AdaptateurFeuilleExercices<ExerciceIntegralesProblemes> = {
  titreDocument: "Intégrales et primitives : problèmes — Évaluation",
  nomFichierBase: "integrales-problemes",
  genererInstance: genererExerciceIntegralesProblemes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteIntegralesProblemes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeIntegralesProblemes,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilIntegralesProblemes,
  libelleCasParticulier: LIBELLE_CAS_INTEGRALES_PROBLEMES,
  // Équilibre transcendant (famille F) : la calculatrice est indispensable pour cette variante.
  calculatriceIndispensable: ["F"],
};
