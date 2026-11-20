/**
 * Messages ciblés des générateurs du 6e ch. 2 « Fonctions exponentielles » (6gen6–6gen12, audit
 * lot B) : quand la dernière réponse fausse trahit une erreur du COURS (facteur ln a oublié, signe
 * de l'exposant, sens non inversé pour une base < 1, racine t ≤ 0 gardée, r = 1 + p pour une
 * baisse…), un message le dit avant « Incorrect — tentative n/3 ». Jamais la réponse attendue.
 * Chaque fonction reçoit la saisie déjà jugée fausse et rend `null` si aucune erreur typique n'est
 * reconnue (message générique).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceEquationExponentielle } from "../core6e/equationsExponentielles.types";
import { evaluerExpressionExponentielle, evaluerValeurExponentielle } from "../moteur6e/expressionExponentielle";
import type { PhaseEquationExponentielle } from "../moteur6e/typesEquationsExponentielles";
import type { EnsembleReelGuide, MorceauIntervalle } from "../core6e/ensembleReel.types";
import type { ExerciceInequationExponentielle } from "../core6e/inequationsExponentielles.types";
import type { PhaseInequationExponentielle } from "../moteur6e/typesInequationsExponentielles";
import type { ExerciceDomaineDeriveeExponentielle } from "../core6e/domaineDeriveeExponentielles.types";
import type { PhaseDomaineDeriveeExponentielle } from "../moteur6e/typesDomaineDeriveeExponentielles";
import { referenceDeriveePuissance } from "../moteur6e/verificationDomaineDeriveeExponentielles";
import type { ExerciceGraphiqueDeriveeExponentielle } from "../core6e/graphiquesDeriveeExponentielles.types";
import { referenceDeriveeGraphique } from "../moteur6e/verificationGraphiquesDeriveeExponentielles";
import type { ExerciceEtudeFonctionExponentielle } from "../core6e/etudeFonctionExponentielle.types";
import type { ReponseAsymptotes, ReponseConcavite, ReponseCroissance } from "../moteur6e/verificationEtudeFonctionExponentielle";
import type { ExerciceExponentiellesProblemes } from "../core6e/exponentiellesProblemes.types";
import type { PhaseExponentiellesProblemes } from "../moteur6e/typesExponentiellesProblemes";
import type { ExerciceLimiteExponentielle } from "../core6e/limitesExponentielles.types";
import type { PhaseLimiteExponentielle } from "../moteur6e/typesLimitesExponentielles";

export type Fragments = FragmentConsigne[];
export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

const TOL = 1e-6;
export const proche = (a: number | null, b: number) => a !== null && Math.abs(a - b) <= TOL * Math.max(1, Math.abs(b));

/** Valeurs numériques d'une liste de saisies (null si l'une n'est pas un nombre). */
export function valeursDe(textes: string[]): number[] | null {
  const v = textes.map((x) => evaluerValeurExponentielle(x));
  return v.some((x) => x === null) ? null : (v as number[]);
}

/** La saisie (fonction de x) coïncide-t-elle avec `ref` aux points donnés ? */
export function memeFonction(texte: string, ref: (x: number) => number, points: number[], variable = "x"): boolean {
  let n = 0;
  for (const x of points) {
    const r = ref(x);
    if (!Number.isFinite(r)) continue;
    let v: number;
    try {
      v = evaluerExpressionExponentielle(texte, { [variable]: x });
    } catch {
      return false;
    }
    if (!Number.isFinite(v) || Math.abs(v - r) > 1e-6 * Math.max(1, Math.abs(r))) return false;
    n++;
  }
  return n >= 3;
}

// ============================================================================
// 6gen9 — équations exponentielles.
// ============================================================================

export function cibleEquationsExpo(e: ExerciceEquationExponentielle, phase: PhaseEquationExponentielle, reponse: string | string[]): Fragments | null {
  if (e.famille === "A" && phase === "aEcran1" && typeof reponse === "string" && e.sousType !== "A2") {
    const v = evaluerValeurExponentielle(reponse);
    const p = e.sousType === "A1" ? e.p : e.d;
    if (p !== 0 && proche(v, -p)) return [t("Relis le signe de l'exposant : un nombre plus petit que 1 (de la forme "), l("\\frac{1}{a^{n}}"), t(") correspond à un exposant négatif, un nombre plus grand que 1 à un exposant positif.")];
    if (proche(v, e.valeurNumerique.num / e.valeurNumerique.den) && Math.abs(p) > 1) return [t("On demande l'exposant n tel que la base puissance n donne le second membre, pas le nombre lui-même.")];
    return null;
  }
  if (e.famille === "A" && phase === "aEcran2" && typeof reponse === "string" && e.sousType !== "A3") {
    const v = evaluerValeurExponentielle(reponse);
    const p = e.sousType === "A1" ? e.p : e.c;
    if (proche(v, (p + e.n) / e.m)) return [t("Relis le signe en isolant x : le terme constant de l'exposant change de membre, donc de signe.")];
    if (proche(v, (p - e.n) * e.m) && Math.abs(e.m) !== 1) return [t("Pour isoler x, on divise par son coefficient, on ne multiplie pas.")];
    return null;
  }
  if (e.famille === "B" && phase === "bEcran1" && typeof reponse === "string") {
    const P = [-3, -1, 0.5, 2, 4];
    if (memeFonction(reponse, (x) => e.m1 * x + e.n1, P)) return [t("La racine carrée divise l'exposant par 2 : "), l("\\sqrt{a^{u}}=a^{\\frac{u}{2}}"), t(".")];
    if (memeFonction(reponse, (x) => (e.m1 * x) / 2 + e.n1, P) || memeFonction(reponse, (x) => e.m1 * x + e.n1 / 2, P)) return [t("Tout l'exposant est divisé par 2, pas un seul de ses termes.")];
    return null;
  }
  if (e.famille === "C" && phase === "cEcran2" && Array.isArray(reponse)) {
    const v = valeursDe(reponse);
    const positives = e.solutionsT.filter((x) => x > 0);
    if (v && v.length === positives.length && positives.length < 2 && v.every((x) => positives.some((p) => proche(x, p)))) return [t("À cette étape, donne toutes les racines de l'équation en t, même négatives : le tri se fait à l'écran suivant.")];
    return null;
  }
  if (e.famille === "C" && phase === "cEcran3" && Array.isArray(reponse)) {
    const v = valeursDe(reponse);
    if (!v) return null;
    if (v.some((x) => e.solutionsT.some((ti) => ti <= 0 && proche(x, ti)))) return [t("Une valeur de t négative ou nulle ne donne aucune solution : "), l(`${e.base.estE ? "e" : e.base.den === 1 ? String(e.base.num) : `\\left(\\frac{${e.base.num}}{${e.base.den}}\\right)`}^{x}`), t(" est toujours strictement positif.")];
    if (v.length > 0 && v.every((x) => e.solutionsT.some((ti) => ti > 0 && proche(x, ti))) && !e.solutionsX.every((x) => e.solutionsT.includes(x))) return [t("Ce sont des valeurs de t : écris chaque valeur positive comme une puissance de la base pour obtenir x.")];
    return null;
  }
  return null;
}

// ============================================================================
// 6gen10 — inéquations exponentielles (ensembles de solutions).
// ============================================================================

/** L'unique intervalle de l'ensemble (null si ce n'est pas un seul intervalle). */
function seulMorceau(e: EnsembleReelGuide): MorceauIntervalle | null {
  return e.forme === "intervalles" && e.morceaux.length === 1 ? e.morceaux[0] : null;
}

const memeBorne = (a: number | null, b: number | null) => (a === null ? b === null : b !== null && Math.abs(a - b) < 1e-6);

/** La saisie est-elle la demi-droite OPPOSÉE (même borne, autre côté) à l'attendue ? */
function coteOppose(saisie: EnsembleReelGuide, attendu: EnsembleReelGuide): boolean {
  const s = seulMorceau(saisie);
  const a = seulMorceau(attendu);
  if (!s || !a) return false;
  if (a.inf === null && a.sup !== null) return s.sup === null && memeBorne(s.inf, a.sup);
  if (a.sup === null && a.inf !== null) return s.inf === null && memeBorne(s.sup, a.inf);
  return false;
}

/** Mêmes bornes, mais un crochet différent (borne comprise / exclue). */
function crochetDifferent(saisie: EnsembleReelGuide, attendu: EnsembleReelGuide): boolean {
  if (saisie.forme !== "intervalles" || attendu.forme !== "intervalles" || saisie.morceaux.length !== attendu.morceaux.length) return false;
  let different = false;
  for (let i = 0; i < saisie.morceaux.length; i++) {
    const s = saisie.morceaux[i];
    const a = attendu.morceaux[i];
    if (!memeBorne(s.inf, a.inf) || !memeBorne(s.sup, a.sup)) return false;
    if ((s.inf !== null && s.infInclus !== a.infInclus) || (s.sup !== null && s.supInclus !== a.supInclus)) different = true;
  }
  return different;
}

const MESSAGE_CROCHET: Fragments = [t("Les bornes sont justes, relis les crochets : une inégalité stricte exclut la borne, une inégalité large la comprend.")];

export function cibleInequationsExpo(e: ExerciceInequationExponentielle, phase: PhaseInequationExponentielle, saisie: EnsembleReelGuide): Fragments | null {
  let attendu: EnsembleReelGuide | null = null;
  let sens: Fragments | null = null;
  if (e.famille === "A" && phase === "aResoudre") {
    attendu = e.solutionEcran2;
    sens = e.baseSuperieureA1
      ? [t("La base est supérieure à 1 : en passant aux exposants, le sens de l'inégalité se conserve")]
      : [t("La base est comprise entre 0 et 1 : en passant aux exposants, le sens de l'inégalité s'inverse")];
    sens.push(t(e.m < 0 ? ", puis il s'inverse encore quand on divise par le coefficient négatif de x." : "."));
  } else if (e.famille === "E" && phase === "eResoudre") {
    attendu = e.solutionEcran2;
    sens = e.ratioSuperieurA1
      ? [t("Le rapport des bases est supérieur à 1 : le sens de l'inégalité se conserve en passant aux exposants")]
      : [t("Le rapport des bases est compris entre 0 et 1 : le sens de l'inégalité s'inverse en passant aux exposants")];
    sens.push(t(e.m < 0 ? ", puis encore une fois en divisant par le coefficient négatif de x." : "."));
  } else if (e.famille === "D" && e.sousType === "constant" && phase === "dConstantResoudre") {
    attendu = e.solutionEcran2;
    sens = e.premierFacteur.positif ? [t("Le premier facteur est positif : le sens de l'inégalité se conserve sur le second facteur.")] : [t("Le premier facteur est négatif : le sens de l'inégalité s'inverse sur le second facteur.")];
  } else if (e.famille === "D" && e.sousType === "variable" && phase === "dVariableTableau") {
    attendu = e.solutionEcran3;
  }
  if (!attendu) return null;
  if (sens && coteOppose(saisie, attendu)) return sens;
  if (crochetDifferent(saisie, attendu)) return MESSAGE_CROCHET;
  return null;
}

/** Zéro d'un facteur (écrans dVariableSigne). */
export function cibleSigneUnZero(e: ExerciceInequationExponentielle, phase: PhaseInequationExponentielle, zeroTexte: string): Fragments | null {
  if (e.famille !== "D" || e.sousType !== "variable") return null;
  const v = evaluerValeurExponentielle(zeroTexte);
  const [ce, autre] = phase === "dVariableSigne1" ? [e.zero1, e.zero2] : [e.zero2, e.zero1];
  if (proche(v, ce)) return [t("Le zéro est juste : relis comment change le signe du facteur autour de ce zéro (teste une valeur de chaque côté).")];
  if (proche(v, autre) && Math.abs(ce - autre) > 1e-9) return [t("C'est le zéro de l'autre facteur : résous « facteur = 0 » pour celui-ci.")];
  if (ce !== 0 && proche(v, -ce)) return [t("Relis le signe du zéro : résous « facteur = 0 » pas à pas.")];
  return null;
}

// ============================================================================
// Dérivées (6gen7, 6gen8, 6gen12) : rapport saisie / référence.
// ============================================================================

/** Rapport constant saisie / référence aux points donnés (null s'il varie ou si la saisie ne se lit pas). */
export function rapportConstant(texte: string, ref: (x: number) => number, points: number[]): number | null {
  let r: number | null = null;
  for (const x of points) {
    const a = ref(x);
    if (!Number.isFinite(a) || Math.abs(a) < 1e-9) continue;
    let v: number;
    try {
      v = evaluerExpressionExponentielle(texte, { x });
    } catch {
      return null;
    }
    if (!Number.isFinite(v)) return null;
    const q = v / a;
    if (r === null) r = q;
    else if (Math.abs(q - r) > 1e-4 * Math.max(1, Math.abs(r))) return null;
  }
  return r;
}

/** Message pour une dérivée d'exponentielle de base `base` dont la saisie est proportionnelle à la référence. */
export function messageRapportDerivee(r: number | null, base: number): Fragments | null {
  if (r === null) return null;
  const lnB = Math.log(base);
  if (Math.abs(base - Math.E) > 1e-9 && Math.abs(r * lnB - 1) < 1e-3) return [t("Il manque le facteur "), l("\\ln a"), t(" : la dérivée de "), l("a^{u}"), t(" est "), l("u'\\cdot\\ln a\\cdot a^{u}"), t(".")];
  if (Math.abs(base - Math.E) > 1e-9 && Math.abs(r / lnB - 1) < 1e-3) return [t("Le facteur "), l("\\ln a"), t(" n'apparaît qu'une fois : relis la dérivée de "), l("a^{u}"), t(".")];
  if (Math.abs(r + 1) < 1e-3) return [t("Relis le signe : la dérivée d'une exponentielle d'exposant négatif, comme "), l("e^{-kx}"), t(", porte un signe moins.")];
  return null;
}

export function cibleDomaineDerivee(e: ExerciceDomaineDeriveeExponentielle, phase: PhaseDomaineDeriveeExponentielle, texte: string): Fragments | null {
  if ((e.famille === "A" && phase === "aDerivee") || (e.famille === "B" && phase === "bDerivee")) {
    const { ref, points } = referenceDeriveePuissance(e);
    const r = rapportConstant(texte, ref, points);
    const m = messageRapportDerivee(r, e.base);
    if (m) return m;
    const coefU = e.famille === "A" && e.sousType === "direct" && e.g.type === "affine" ? e.g.m : null;
    if (r !== null && coefU !== null && Math.abs(coefU) !== 1 && Math.abs(r * coefU - 1) < 1e-3) return [t("Il manque la dérivée de l'exposant (règle de la chaîne) : la dérivée de "), l("a^{u(x)}"), t(" contient le facteur "), l("u'(x)"), t(".")];
    return null;
  }
  return null;
}

/** 6gen8, écran « derivee » : facteur ln a oublié (B), signe (D), carré du dénominateur oublié. */
export function cibleDeriveeGraphique(e: ExerciceGraphiqueDeriveeExponentielle, texte: string): Fragments | null {
  const r = referenceDeriveeGraphique(e);
  if (!r) return null;
  const m = messageRapportDerivee(rapportConstant(texte, r.ref, r.points), r.base);
  if (m) return m;
  return null;
}

// ============================================================================
// 6gen11 — étude de fonction.
// ============================================================================

export function cibleAsymptotesEtude(e: ExerciceEtudeFonctionExponentielle, r: ReponseAsymptotes): Fragments | null {
  if (e.famille === "B" && r.type === "b" && r.cote !== e.coteAsymptoteVerticale)
    return [t("L'asymptote verticale n'existe que du côté où la limite est infinie : reprends les limites à gauche et à droite de la valeur exclue.")];
  if (e.famille !== "B" && r.type === "deux") {
    const attenduPlus = e.asymptotePlusInfini.type !== "aucune";
    const attenduMoins = e.asymptoteMoinsInfini.type !== "aucune";
    if (r.plusInfini.existe === attenduMoins && r.moinsInfini.existe === attenduPlus && attenduPlus !== attenduMoins)
      return [t("L'asymptote est du mauvais côté : une limite finie donne une asymptote horizontale de ce côté-là seulement ; une limite infinie n'en donne pas.")];
    if (e.famille === "C" && (r.plusInfini.texte + r.moinsInfini.texte).replace(/\s/g, "").toLowerCase().includes("y=0"))
      return [t("En −∞, f(x) ne tend pas vers 0 : cherche une droite oblique y = ax + b dont f(x) se rapproche.")];
  }
  return null;
}

export function cibleCroissanceEtude(e: ExerciceEtudeFonctionExponentielle, r: ReponseCroissance | ReponseConcavite, ecran: "croissance" | "concavite"): Fragments | null {
  const attendu = ecran === "croissance" ? e.croissance.type : e.concavite.type;
  const paires: [string, string][] = [["minimum", "maximum"], ["croissante_partout", "decroissante_partout"], ["convexe_partout", "concave_partout"]];
  if (paires.some(([a, b]) => (attendu === a && r.type === b) || (attendu === b && r.type === a)))
    return ecran === "croissance"
      ? [t("Relis le signe de f′ : f est croissante là où f′ est positive, décroissante là où f′ est négative.")]
      : [t("Relis le signe de f″ : f est convexe là où f″ est positive, concave là où f″ est négative.")];
  if (r.type === attendu) return [t("La nature est juste : recalcule l'abscisse où la dérivée s'annule.")];
  return null;
}

// ============================================================================
// 6gen12 — problèmes.
// ============================================================================

const POINTS_T12 = [0, 1, 2, 3, 5];

export function cibleProblemesExpo(e: ExerciceExponentiellesProblemes, phase: PhaseExponentiellesProblemes, texte: string): Fragments | null {
  if (e.famille === "A" && e.sousType === "evaluer" && phase === "aEcran1") {
    const inverse = e.croissance ? 1 - e.p / 100 : 1 + e.p / 100;
    if (memeFonction(texte, (u) => e.Q0 * Math.pow(inverse, u), POINTS_T12, "t"))
      return e.croissance
        ? [t("C'est une hausse : le facteur multiplicateur est "), l("1+\\dfrac{p}{100}"), t(", plus grand que 1.")]
        : [t("C'est une baisse : le facteur multiplicateur est "), l("1-\\dfrac{p}{100}"), t(", plus petit que 1.")];
    if (memeFonction(texte, (u) => e.Q0 * Math.pow(e.p, u), POINTS_T12, "t") || memeFonction(texte, (u) => e.Q0 * Math.pow(e.p / 100, u), POINTS_T12, "t"))
      return [t("Le facteur multiplicateur d'une variation de p % est "), l("1\\pm\\dfrac{p}{100}"), t(", pas le pourcentage lui-même.")];
    return null;
  }
  if (e.famille === "A" && e.sousType === "doublement" && phase === "aEcran1") {
    if (memeFonction(texte, (u) => u - e.T, POINTS_T12, "t")) return [t("Relis l'ordre : l'instant t est avant l'instant de référence T, le nombre de reculs est positif.")];
    return null;
  }
  if (e.famille === "B" && phase === "bEcran1") {
    if (memeFonction(texte, (u) => e.Q0 * Math.pow(1 + e.p / 100, u), POINTS_T12, "t")) return [t("Ce qui reste diminue : le facteur multiplicateur est "), l("1-\\dfrac{p}{100}"), t(".")];
    if (memeFonction(texte, (u) => e.Q0 * (1 - Math.pow(e.q, u)), POINTS_T12, "t")) return [t("C'est l'expression de ce qui a été retiré ; on demande d'abord ce qui reste.")];
    return null;
  }
  if (e.famille === "B" && phase === "bEcran2") {
    if (memeFonction(texte, (u) => e.Q0 * Math.pow(e.q, u), POINTS_T12, "t")) return [t("C'est ce qui reste ; le complément est ce qui a été retiré : "), l("Q_0-\\text{reste}(t)"), t(".")];
    return null;
  }
  return null;
}

// ============================================================================
// 6gen6 — limites (règle de L'Hôpital, pivot e, loi des puissances).
// ============================================================================

const POINTS_L6 = [-1.7, -1.1, -0.6, 0.6, 1.1, 1.7];

/** Dérivée attendue de la partie exponentielle à cet écran (null si l'écran porte l'autre partie). */
function refDeriveeExpoLimite(e: ExerciceLimiteExponentielle, phase: PhaseLimiteExponentielle): ((x: number) => number) | null {
  if (e.famille === "H" && ((phase === "hNumerateur" && e.expAuNumerateur) || (phase === "hDenominateur" && !e.expAuNumerateur)))
    return (x) => e.k * Math.log(e.base) * Math.pow(e.base, e.k * (x - e.x0));
  if (e.famille === "I" && ((phase === "iNumerateur" && !e.sinAuNumerateur) || (phase === "iDenominateur" && e.sinAuNumerateur)))
    return (x) => e.m * Math.log(e.base) * Math.pow(e.base, e.m * (x - e.x0));
  if (e.famille === "J" && ((phase === "jNumerateur" && !e.arcAuNumerateur) || (phase === "jDenominateur" && e.arcAuNumerateur)))
    return (x) => e.m * Math.log(e.base) * Math.pow(e.base, e.m * (x - e.x0));
  if (e.famille === "K") {
    const premier = (phase === "kNumerateur1" && e.expAuNumerateur) || (phase === "kDenominateur1" && !e.expAuNumerateur);
    const second = (phase === "kNumerateur2" && e.expAuNumerateur) || (phase === "kDenominateur2" && !e.expAuNumerateur);
    const lnA = Math.log(e.base);
    if (premier) return (x) => e.k * lnA * (Math.pow(e.base, e.k * (x - e.x0)) - 1);
    if (second) return (x) => e.k * e.k * lnA * lnA * Math.pow(e.base, e.k * (x - e.x0));
  }
  return null;
}

export function cibleLimitesExpo(e: ExerciceLimiteExponentielle, phase: PhaseLimiteExponentielle, texte: string): Fragments | null {
  const ref = refDeriveeExpoLimite(e, phase);
  if (ref && (e.famille === "H" || e.famille === "I" || e.famille === "J" || e.famille === "K")) return messageRapportDerivee(rapportConstant(texte, ref, POINTS_L6.map((d) => e.x0 + d)), e.base);
  if (e.famille === "H" || e.famille === "I" || e.famille === "J" || e.famille === "K") {
    if (phase !== "hConclure" && phase !== "iConclure" && phase !== "jConclure" && phase !== "kConclure") return null;
    const v = evaluerValeurExponentielle(texte);
    const L = e.limiteFinale;
    const lnA = Math.log(e.base);
    if (Math.abs(L * L - 1) > 1e-6 && proche(v, 1 / L)) return [t("Relis le sens du quotient : la limite est celle de la dérivée du numérateur divisée par la dérivée du dénominateur.")];
    if (proche(v, L / lnA) || proche(v, L * lnA)) return [t("Relis le facteur "), l("\\ln a"), t(" : il vient de la dérivée de "), l("a^{u}"), t(", une seule fois par dérivée.")];
    if (proche(v, -L)) return [t("Relis les signes des deux dérivées en ce point.")];
    return null;
  }
  if (e.famille === "L" && phase === "lConclure") {
    const v = evaluerValeurExponentielle(texte);
    if (e.k * e.m !== e.k + e.m && proche(v, Math.exp(e.k + e.m))) return [t("Les exposants se multiplient : "), l("\\left(a^{p}\\right)^{q}=a^{pq}"), t(".")];
    if (proche(v, Math.exp(1))) return [t("Le pivot donne e ; la puissance qui reste s'applique encore à e.")];
    return null;
  }
  if (e.famille === "N" && phase === "nConclure") {
    const v = evaluerValeurExponentielle(texte);
    if (e.k * e.m !== e.k + e.m && proche(v, Math.pow(e.base, e.k + e.m))) return [t("Les exposants se multiplient : "), l("\\left(a^{p}\\right)^{q}=a^{pq}"), t(".")];
    return null;
  }
  return null;
}
