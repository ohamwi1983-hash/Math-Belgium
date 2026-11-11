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
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesIntegralesProblemes";
import type { PhaseIntegralesProblemes } from "../../moteur6e/typesIntegralesProblemes";
import {
  aideNiveau1,
  aideNiveau2,
  afficheAffine,
  blocDonnees,
  cLatexD,
  coefRacineLatex,
  consigneEcran,
  consigneGenerale,
  decimalLatex,
  demandeLatexF,
  fLatexE,
  formatReponseAttenduePhaseLatex,
  fractionLatex,
  multiplePiLatex,
  rationnelExactLatex,
  rationnelLatex,
  sommeAffineExacteLatex,
  sommeVolumeSimpleLatex,
  travailC,
  volumeSoustractionLatex,
  xLatexB,
} from "../../ui6e/formatIntegralesProblemes";
import { figureSurplusSvg, figureTrapezesSvg } from "../../ui6e/figureIntegralesProblemes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegralesProblemes } from "./index";
import type { IdVarianteIntegralesProblemes } from "./index";
import { LIBELLE_CAS_INTEGRALES_PROBLEMES, profilIntegralesProblemes } from "./profilEvaluation";

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

function reponse(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): FragmentConsigne[] {
  // Trapèzes (famille A) : le résultat final avec son unité (m² pour un terrain, m³ pour un mur).
  if (exercice.famille === "A" && phase === "aEcran2") {
    return [latex(`${formatReponseAttenduePhaseLatex(exercice, phase).join("")}\\ \\text{${exercice.contexte === "terrain" ? "m}^2" : "m}^3"}`)];
  }
  // Interprétation (famille E) : sur papier, la phrase rédigée de la bonne option de l'écran.
  if (exercice.famille === "E" && phase === "eEcran3") {
    const correcte = exercice.optionsInterpretation.find((o) => o.valeur === exercice.interpretationCorrecte);
    if (correcte) return [texte(correcte.label)];
  }
  return [latex(formatReponseAttenduePhaseLatex(exercice, phase).join(",\\quad "))];
}

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
    t(PRECISION),
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

interface ContenuEtape {
  methode: FragmentConsigne[];
  calcul?: string;
  piege?: string;
  figure?: string;
}

function aide1(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): FragmentConsigne[] | null {
  const a = aideNiveau1(exercice, phase);
  if (!a.texte) return null;
  return a.latex === null ? [t(a.texte)] : [t(`${a.texte} `), f(a.latex)];
}

function contenuA(e: ExerciceFamilleA_Problemes, phase: PhaseIntegralesProblemes): ContenuEtape {
  const n = e.y.length - 1;
  if (phase === "aEcran1") {
    const milieu = e.y.slice(1, n).join("+");
    return {
      methode: [t("Chaque bande de largeur Δx est approchée par un trapèze ; les hauteurs extrêmes comptent une demi-fois, les autres une fois.")],
      calcul: `S=\\dfrac{${e.y[0]}+${e.y[n]}}{2}+${milieu}`,
      figure: figureTrapezesSvg(e),
    };
  }
  const p = e.dimensionSupplementaire;
  return {
    methode: p === null ? [t("L'aire vaut Δx fois la somme S.")] : [t("L'aire de la coupe vaut Δx fois S ; le volume s'obtient en la multipliant par la profondeur p.")],
    calcul: p === null ? `\\text{Aire}\\approx ${e.deltaX}\\times ${rationnelLatex(e.sommeAttendue).split("\\approx")[0]}` : `V\\approx ${e.deltaX}\\times ${rationnelLatex(e.sommeAttendue).split("\\approx")[0]}\\times ${p}`,
    piege: "Compter les hauteurs extrêmes en entier : elles ne comptent qu'une demi-fois.",
  };
}

function contenuB(e: ExerciceFamilleB_Problemes, phase: PhaseIntegralesProblemes): ContenuEtape {
  if (phase === "bEcran1") {
    const sansConstante = sommeAffineExacteLatex([
      { num: e.k, den: 2, corps: "t^2" },
      { num: e.p, den: 1, corps: "t" },
    ]);
    return {
      methode: [t("La vitesse est une primitive de l'accélération ; la condition "), f("v(0)"), t(" fixe sa constante.")],
      calcul: `v(t)=${sansConstante}+C_1\\quad\\text{et}\\quad v(0)=C_1=${e.v0}`,
    };
  }
  if (phase === "bEcran2") {
    const sansConstante = sommeAffineExacteLatex([
      { num: e.k, den: 6, corps: "t^3" },
      { num: e.p, den: 2, corps: "t^2" },
      { num: e.v0, den: 1, corps: "t" },
    ]);
    return {
      methode: [t("La position est une primitive de la vitesse ; sa propre constante est fixée par "), f("x(0)"), t(".")],
      calcul: `x(t)=${sansConstante}+C_2\\quad\\text{et}\\quad x(0)=C_2=${e.x0}`,
      piege: "Réutiliser la constante de v(t) pour x(t) : chaque intégration introduit sa propre constante.",
    };
  }
  if (e.sousType === "evaluer") {
    return { methode: [t("On remplace t par "), f(`${e.t1}`), t(" dans "), f("x(t)"), t(".")], calcul: `x(${e.t1})=${xLatexB(e).replace(/t/g, `(${e.t1})`)}` };
  }
  return {
    methode: [t("Comme "), f("v(t)\\geq 0"), t(", la position "), f("x(t)"), t(" est croissante : l'équation a une seule solution positive, que l'on trouve en testant des valeurs entières de t.")],
    calcul: `x(${e.tSolution})=${rationnelExactLatex(e.cible as number)}`,
  };
}

function contenuC(e: ExerciceFamilleC_Problemes, phase: PhaseIntegralesProblemes): ContenuEtape {
  const k = e.k === 1 ? "" : `${e.k}`;
  const travail = (a: number, b: number, nom: string) => `${nom}=\\displaystyle\\int_{${a}}^{${b}} ${k}x\\,dx=\\left[\\dfrac{${k}x^2}{2}\\right]_{${a}}^{${b}}=\\dfrac{${e.k === 1 ? "" : `${e.k}\\left(`}${b}^2-${a}^2${e.k === 1 ? "" : "\\right)"}}{2}`;
  if (phase === "cEcran1") return { methode: [t("D'après la loi de Hooke, "), f("F(x_0)=k\\cdot x_0"), t(".")], calcul: `k=\\dfrac{${e.F0}}{${e.x0}}` };
  if (phase === "cEcran2") return { methode: [t("Une primitive de "), f("kx"), t(" est "), f("\\dfrac{kx^2}{2}"), t(".")], calcul: travail(e.a, e.b, "W"), piege: "Oublier le facteur 1/2 de la primitive de kx." };
  if (phase === "cEcran3") return { methode: [t("Même calcul sur le second intervalle.")], calcul: travail(e.a2 as number, e.b2 as number, "W_2") };
  return {
    methode: [t("La force "), f("F(x)=kx"), t(" augmente avec l'allongement : à longueur égale, le travail est plus grand sur l'intervalle le plus éloigné de 0.")],
    calcul: `W=${rationnelLatex(travailC(e.k, e.a, e.b))}\\qquad W_2=${rationnelLatex(travailC(e.k, e.a2 as number, e.b2 as number))}`,
    piege: "Le travail ne dépend pas que de la longueur de l'intervalle, mais aussi de sa position.",
  };
}

function contenuD(e: ExerciceFamilleD_Problemes, phase: PhaseIntegralesProblemes): ContenuEtape {
  if (phase === "dEcran1") {
    return {
      methode: [t("Le coût total est la primitive du coût marginal qui vaut "), f("C(0)"), t(" en 0.")],
      calcul: `C(q)=${e.a}q-${fractionLatex(e.bNum, 2 * e.bDen)}q^2+K\\quad\\text{et}\\quad C(0)=K=${e.F0}`,
    };
  }
  if (phase === "dEcran2") return { methode: [t("On remplace q par "), f(`${e.q1}`), t(" dans "), f("C(q)"), t(".")] };
  if (phase === "dEcran3") return { methode: aide1(e, phase) ?? [], calcul: aideNiveau2(e, phase).latex ?? undefined, piege: "Donner C(q₂) au lieu de la différence C(q₂) − C(q₁)." };
  return { methode: [t("On divise le coût total par la quantité produite.")], calcul: `C_{\\text{moy}}(q)=\\dfrac{C(q)}{q}=\\dfrac{${cLatexD(e)}}{q}` };
}

function contenuE(e: ExerciceFamilleE_Problemes, phase: PhaseIntegralesProblemes): ContenuEtape {
  const { a, b } = e.exerciceMoyenne;
  const termes = e.exerciceMoyenne.primitive.famille === "A" && e.exerciceMoyenne.primitive.sousType === "direct" ? e.exerciceMoyenne.primitive.termes : [];
  const m = termes.find((x) => x.type === "puissance")?.coef ?? 0;
  const c = termes.find((x) => x.type === "constante")?.coef ?? 0;
  const primitive = sommeAffineExacteLatex([
    { num: m, den: 2, corps: "t^2" },
    { num: c, den: 1, corps: "t" },
  ]);
  if (phase === "eEcran1") {
    return {
      methode: [t("La variation totale d'une grandeur est l'intégrale de son taux de variation.")],
      calcul: `\\displaystyle\\int_{${a}}^{${b}} f(t)\\,dt=\\left[${primitive}\\right]_{${a}}^{${b}}`,
    };
  }
  if (phase === "eEcran2") {
    const integrale = e.exerciceMoyenne.primitive.primitiveReference(b) - e.exerciceMoyenne.primitive.primitiveReference(a);
    return { methode: [t("La valeur moyenne est l'intégrale divisée par la longueur de l'intervalle.")], calcul: `\\dfrac{1}{${b}-${a}}\\displaystyle\\int_{${a}}^{${b}} f(t)\\,dt=\\dfrac{${rationnelLatex(integrale).split("\\approx")[0]}}{${b - a}}` };
  }
  return {
    methode: [t("f n'est pas la grandeur elle-même mais son taux de variation : sa valeur moyenne est un taux moyen, exprimé dans la même unité que f.")],
    piege: "Confondre avec le niveau moyen : f n'est pas la grandeur elle-même, mais sa vitesse de variation.",
  };
}

function contenuF(e: ExerciceFamilleF_Problemes, phase: PhaseIntegralesProblemes): ContenuEtape {
  if (phase === "fEcran1") {
    return {
      methode: [t("Le point d'équilibre est l'intersection de la demande et de l'offre : on résout "), f("f(x)=g(x)"), t(" à la calculatrice (graphiquement ou avec le solveur), puis "), f("P=g(Q)"), t(".")],
    };
  }
  const aSurK = fractionLatex(e.A * e.kDen, e.kNum);
  return {
    methode: [t("Le surplus est l'aire entre la courbe de demande et la droite du prix d'équilibre, de 0 à Q ; une primitive de "), f(`${demandeLatexF(e)}`), t(" est "), f(`-${aSurK}${demandeLatexF(e).slice(String(e.A).length)}`), t(".")],
    calcul: aideNiveau2(e, phase).latex ?? undefined,
    piege: "Arrondir Q et P trop tôt : garde au moins deux décimales jusqu'au calcul de S.",
    figure: figureSurplusSvg(e),
  };
}

function contenuG(e: ExerciceFamilleG_Problemes, phase: PhaseIntegralesProblemes): ContenuEtape {
  if (e.sousType === "soustraction") {
    const vt = e.volumeTotal;
    if (phase === "gSoustractionEcran1") {
      return {
        methode: [t("Méthode des disques : "), f("V=\\pi\\displaystyle\\int_a^b [f(x)]^2\\,dx"), t(".")],
        calcul: `V=\\pi\\displaystyle\\int_{${vt.a}}^{${vt.b}}\\left(${sommeVolumeSimpleLatex(vt.termes)}\\right)^2dx${volumeSoustractionLatex(e, e.volumeTotalAttendu)}`,
      };
    }
    return {
      methode: [t("Le trou est un cylindre de rayon "), f("\\rho"), t(" et de longueur "), f("b-a"), t(" : son volume vaut "), f("\\pi\\rho^2(b-a)"), t(". On le retire du volume de la pièce pleine.")],
      calcul: `V_{\\text{trou}}=\\pi\\cdot\\left(${fractionLatex(e.rayonTrouNum, e.rayonTrouDen)}\\right)^2\\cdot ${e.longueurTrou}`,
      piege: "Soustraire les rayons (ou les fonctions) au lieu des volumes.",
    };
  }
  if (e.sousType === "archimede") {
    const p = e.paraboloide;
    if (phase === "gArchimedeEcran1") {
      return {
        methode: [t("Méthode des disques : le carré fait disparaître la racine.")],
        calcul: `V_{\\text{verre}}=\\pi\\displaystyle\\int_0^{${p.L}}\\left(${coefRacineLatex(p.kNum, p.kDen)}\\sqrt{x}\\right)^2dx=\\pi\\cdot ${fractionLatex(p.kNum * p.kNum, p.kDen * p.kDen)}\\cdot\\dfrac{${p.L}^2}{2}`,
      };
    }
    if (phase === "gArchimedeEcran2") return { methode: aide1(e, phase) ?? [], calcul: `V_{\\text{bille}}=\\dfrac{4}{3}\\pi\\cdot ${decimalLatex(e.r)}^3` };
    return {
      methode: [t("Fraction débordée : volume de la bille divisé par le volume du verre (π se simplifie).")],
      calcul: `\\dfrac{V_{\\text{bille}}}{V_{\\text{verre}}}=\\dfrac{${multiplePiLatex((4 / 3) * e.r ** 3).split("\\approx")[0]}}{${multiplePiLatex(p.volumeParaboloide / Math.PI).split("\\approx")[0]}}`,
    };
  }
  const r = e.r;
  const h = e.hDemande;
  if (phase === "gCalotteEcran1") return { methode: [t("On remplace r par "), f(`${r}`), t(" dans l'intégrande.")] };
  if (phase === "gCalotteEcran2") return { methode: [t("En développant, "), f(`${r}^2-(y-${r})^2=${2 * r}y-y^2`), t(", dont une primitive est la fonction ci-dessous.")] };
  return {
    methode: [t("On évalue la primitive entre 0 et h, puis on multiplie par π.")],
    calcul: `V(${h})=\\pi\\left[${r}y^2-\\dfrac{y^3}{3}\\right]_0^{${h}}=\\pi\\left(${r}\\cdot ${h}^2-\\dfrac{${h}^3}{3}\\right)`,
    piege: "Oublier le facteur π devant l'intégrale.",
  };
}

function contenuEtape(exercice: ExerciceIntegralesProblemes, phase: PhaseIntegralesProblemes): ContenuEtape {
  switch (exercice.famille) {
    case "A":
      return contenuA(exercice, phase);
    case "B":
      return contenuB(exercice, phase);
    case "C":
      return contenuC(exercice, phase);
    case "D":
      return contenuD(exercice, phase);
    case "E":
      return contenuE(exercice, phase);
    case "F":
      return contenuF(exercice, phase);
    case "G":
      return contenuG(exercice, phase);
  }
}

function correctionDetaillee(exercice: ExerciceIntegralesProblemes): EtapeCorrection[] {
  return phasesPourExercice(exercice).flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    const contenu = contenuEtape(exercice, phase);
    const etapes: EtapeCorrection[] = [];
    if (contenu.methode.length > 0) etapes.push({ label: "Méthode", sousQuestion, fragments: contenu.methode, ...(contenu.figure ? { figureHtml: contenu.figure } : {}) });
    if (contenu.calcul) etapes.push({ label: "Calcul", sousQuestion, fragments: [f(contenu.calcul)] });
    if (contenu.piege) etapes.push({ label: "Piège", sousQuestion, fragments: [t(contenu.piege)] });
    etapes.push({ label: "Conclusion", sousQuestion, fragments: reponse(exercice, phase) });
    return etapes;
  });
}

// ============================================================================
// Difficulté, réponse brève, barème.
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
    const piege = contenuEtape(exercice, phase).piege;
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
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilIntegralesProblemes,
  libelleCasParticulier: LIBELLE_CAS_INTEGRALES_PROBLEMES,
  // Équilibre transcendant (famille F) : la calculatrice est indispensable pour cette variante.
  calculatriceIndispensable: ["F"],
};
