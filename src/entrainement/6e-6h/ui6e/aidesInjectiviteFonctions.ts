import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { formatAffineLatex } from "../generateurs6e/injectiviteFonctions/formatFLatex";
import { diagnostiquerEquivalenceFonction } from "../moteur6e/equivalenceExponentielle";
import type { CoteBranche } from "../moteur6e/typesInjectiviteFonctions";
import { diagnostiquerEnsembleReelGuide, verifierEnsembleReelGuide } from "../moteur6e/verificationEnsembleReel";
import { fragmentsDepuisTexte } from "../components6e/RetourSaisieExpo";
import { approxFractionLatex } from "./formatFraction";
import { formatFLatexAffichage, formatReciproqueLatex } from "./formatInjectiviteFonctions";

/**
 * Aides et messages ciblés de `6gen1` (audit du 6e ch. 1, lot B : G3, G4, G5). Deux niveaux par
 * écran — niveau 1 : la propriété du cours ; niveau 2 : la propriété appliquée à l'instance, SANS
 * la conclusion (jamais le domaine, le verdict « injective ? », l'intervalle, la réciproque ni
 * l'image). Texte : une phrase (formules courtes entre `$…$`) terminée par « : », puis la formule
 * en KaTeX. Aucune notation clavier, aucune majuscule d'insistance.
 */

export interface AideInjectivite {
  texte: string;
  latex: string | null;
}

const MAX_DEN = 24;
const fr = (v: number) => approxFractionLatex(v, MAX_DEN);

/** Membre de droite de l'expression affichée de f, la variable x remplacée par `v`. */
function expressionEn(exercice: ExerciceInjectiviteFonctions, v: string): string {
  const rhs = formatFLatexAffichage(exercice).split("=").slice(1).join("=").trim();
  return rhs.replace(/x/g, v);
}

// ============================================================================
// Écran 1 — domaine.
// ============================================================================

const SANS_CONDITION = "Repère ce qui pourrait empêcher le calcul de f(x) : une racine d'indice pair, un dénominateur ou un exposant négatif.";
const DIVISION = "Un exposant négatif est une division : la base ne peut pas valoir $0$.";

export function aideDomaine1(exercice: ExerciceInjectiviteFonctions): AideInjectivite {
  const p = exercice.parametres;
  switch (p.famille) {
    case "puissanceAffine":
    case "puissanceMonome":
      return { texte: p.n < 0 ? DIVISION : SANS_CONDITION, latex: null };
    case "racineNieme":
      if (p.n % 2 === 0) return { texte: "Sous une racine d'indice pair, le radicande doit être positif ou nul ; si la racine est au dénominateur, il doit être strictement positif.", latex: null };
      return { texte: p.n < 0 ? "Une racine d'indice impair accepte tout réel, mais une racine au dénominateur ne peut pas valoir $0$." : SANS_CONDITION, latex: null };
    case "racinePlusConstante":
      return { texte: "Sous une racine carrée, le radicande doit être positif ou nul.", latex: null };
    case "homographique":
      return { texte: "Un dénominateur ne peut pas valoir $0$.", latex: null };
    case "quadratique":
      return { texte: SANS_CONDITION, latex: null };
  }
}

const TOUT_REEL = { texte: "Une puissance d'exposant naturel, un polynôme et une racine d'indice impair se calculent pour tout réel. Regarde l'expression de f :", latex: null as string | null };

export function aideDomaine2(exercice: ExerciceInjectiviteFonctions): AideInjectivite {
  const p = exercice.parametres;
  const f = formatFLatexAffichage(exercice);
  switch (p.famille) {
    case "puissanceAffine":
      return p.n < 0 ? { texte: "Cherche la valeur de x qui annule la base :", latex: `${formatAffineLatex(p.a, p.b)} = 0` } : { ...TOUT_REEL, latex: f };
    case "racineNieme":
      if (p.n % 2 === 0) return { texte: "Résous l'inéquation imposée par la racine (attention au sens si tu divises par un négatif) :", latex: `${formatAffineLatex(p.a, p.b)} ${p.n < 0 ? ">" : "\\geq"} 0` };
      return p.n < 0 ? { texte: "Cherche la valeur de x qui annule la racine du dénominateur :", latex: `${formatAffineLatex(p.a, p.b)} = 0` } : { ...TOUT_REEL, latex: f };
    case "puissanceMonome":
      return p.n < 0 ? { texte: "Cherche la valeur de x qui annule la base de la puissance :", latex: `x^{${-p.n}} = 0` } : { ...TOUT_REEL, latex: f };
    case "racinePlusConstante":
      return { texte: "Résous l'inéquation imposée par la racine (attention au sens si tu divises par un négatif) :", latex: `${formatAffineLatex(p.a, p.b)} \\geq 0` };
    case "homographique":
      return { texte: "Cherche la valeur de x qui annule le dénominateur :", latex: `${formatAffineLatex(p.c, p.d)} = 0` };
    case "quadratique":
      return { ...TOUT_REEL, latex: f };
  }
}

/** Condition « radicande ≥ 0 » (ou > 0) à coefficient négatif : l'ensemble qu'on obtient en
 * oubliant de changer le sens de l'inégalité. */
function domaineSensNonChange(exercice: ExerciceInjectiviteFonctions): EnsembleReelGuide | null {
  const p = exercice.parametres;
  if (!((p.famille === "racinePlusConstante" || (p.famille === "racineNieme" && p.n % 2 === 0)) && p.a < 0)) return null;
  const seuil = -p.b / p.a;
  const strict = p.famille === "racineNieme" && p.n < 0;
  return { forme: "intervalles", points: [], morceaux: [{ inf: seuil, sup: null, infInclus: !strict, supInclus: false }] };
}

const CROCHET = "Les bornes sont justes : relis les crochets. Une borne qui n'est pas atteinte s'écrit avec un crochet tourné vers l'extérieur, et $-\\infty$, $+\\infty$ sont toujours exclus.";

export function cibleDomaine(exercice: ExerciceInjectiviteFonctions, reponse: EnsembleReelGuide): FragmentConsigne[] | null {
  const sens = domaineSensNonChange(exercice);
  if (sens && verifierEnsembleReelGuide(reponse, sens)) return fragmentsDepuisTexte("Pour isoler x, tu divises par un nombre négatif : le sens de l'inégalité change.");
  if (diagnostiquerEnsembleReelGuide(reponse, exercice.domaine) === "crochet") return fragmentsDepuisTexte(CROCHET);
  if (reponse.forme === "reel" && exercice.domaine.forme !== "reel") return fragmentsDepuisTexte("Une condition est à poser : regarde la racine ou le dénominateur de f.");
  if (reponse.forme !== "reel" && exercice.domaine.forme === "reel") return fragmentsDepuisTexte("Aucune opération de f n'exclut de réel : relis l'expression.");
  return null;
}

// ============================================================================
// Écran 2 — injective ? (verdict, puis plus grand intervalle si « Non »).
// ============================================================================

export const AIDE_INJECTIVE_1: AideInjectivite = {
  texte:
    "f est injective quand deux réels distincts ont toujours des images distinctes, autrement dit quand $f(x_1)=f(x_2)$ entraîne $x_1=x_2$. Une fonction strictement monotone sur un intervalle y est injective ; une fonction dont le graphique a un axe de symétrie vertical ne l'est pas.",
  latex: null,
};

/** Niveau 2 : l'égalité des images POSÉE pour l'instance — la même phrase quel que soit le verdict. */
export function aideInjective2(exercice: ExerciceInjectiviteFonctions): AideInjectivite {
  return {
    texte: "Pose l'égalité des images et regarde si elle oblige $x_1=x_2$ (attention aux puissances paires et aux carrés) :",
    latex: `${expressionEn(exercice, "x_1")} = ${expressionEn(exercice, "x_2")}`,
  };
}

export const AIDE_INTERVALLE_1: AideInjectivite = {
  texte: "Sur tout son domaine, f prend deux fois certaines valeurs. On garde un intervalle où f est strictement monotone, le plus grand possible : il s'arrête à l'axe de symétrie du graphique.",
  latex: null,
};

export function aideIntervalle2(exercice: ExerciceInjectiviteFonctions): AideInjectivite {
  const p = exercice.parametres;
  switch (p.famille) {
    case "puissanceAffine":
      return { texte: "La puissance paire change de sens là où sa base s'annule :", latex: `${formatAffineLatex(p.a, p.b)} = 0` };
    case "puissanceMonome":
      return { texte: "Le graphique d'une puissance paire de $x$ est symétrique par rapport à l'axe des ordonnées :", latex: `x^{${Math.abs(p.n)}} = (-x)^{${Math.abs(p.n)}}` };
    case "quadratique":
      return { texte: "La parabole change de sens à l'abscisse de son sommet :", latex: `x = -\\dfrac{b}{2a} = -\\dfrac{${p.b < 0 ? `(${p.b})` : p.b}}{2\\cdot ${p.a < 0 ? `(${p.a})` : p.a}}` };
    default:
      return { texte: "Cherche l'abscisse où f change de sens de variation.", latex: null };
  }
}

export function cibleIntervalle(exercice: ExerciceInjectiviteFonctions, reponse: EnsembleReelGuide): FragmentConsigne[] | null {
  const dg = diagnostiquerEnsembleReelGuide(reponse, exercice.intervalleGauche);
  const dd = diagnostiquerEnsembleReelGuide(reponse, exercice.intervalleDroite);
  if (dg === "crochet" || dd === "crochet") return fragmentsDepuisTexte(CROCHET);
  const pivot = exercice.pivot;
  if (pivot !== null && reponse.forme === "intervalles" && reponse.morceaux.some((m) => (m.inf === null || m.inf < pivot - 1e-9) && (m.sup === null || m.sup > pivot + 1e-9))) {
    return fragmentsDepuisTexte("Ton intervalle contient deux réels symétriques par rapport à l'axe de symétrie du graphique : ils ont la même image.");
  }
  if (reponse.forme !== "intervalles") return fragmentsDepuisTexte("On demande un seul intervalle, une moitié du domaine.");
  return null;
}

// ============================================================================
// Écran 3 — réciproque.
// ============================================================================

export const AIDE_RECIPROQUE_1: AideInjectivite = {
  texte: "Méthode : on pose $y=f(x)$, on échange $x$ et $y$, puis on isole $y$. Attention : la réciproque $f^{-1}$ n'est pas l'inverse $\\dfrac{1}{f}$.",
  latex: null,
};

export function aideReciproque2(exercice: ExerciceInjectiviteFonctions): AideInjectivite {
  const branche = exercice.injective ? "" : " (sur l'intervalle choisi, garde le signe qui lui correspond)";
  return { texte: `Après l'échange de $x$ et $y$, il reste à isoler $y$ dans cette égalité${branche} :`, latex: `x = ${expressionEn(exercice, "y")}` };
}

function points(e: EnsembleReelGuide): number[] {
  if (e.forme === "reel") return [-5, -2.3, -0.6, 0.7, 1.9, 4.4];
  if (e.forme === "prive_points") return [-5, -2.3, -0.6, 0.7, 1.9, 4.4].filter((v) => !e.points.some((q) => Math.abs(q - v) < 1e-6));
  const pts: number[] = [];
  for (const m of e.morceaux) {
    if (m.inf !== null && m.sup !== null) pts.push(...[0.2, 0.45, 0.7, 0.9].map((t) => (m.inf as number) + t * ((m.sup as number) - (m.inf as number))));
    else if (m.inf !== null) pts.push(...[0.4, 1.3, 2.7, 5.1].map((o) => (m.inf as number) + o));
    else if (m.sup !== null) pts.push(...[0.4, 1.3, 2.7, 5.1].map((o) => (m.sup as number) - o));
    else pts.push(-3, -0.6, 0.7, 3);
  }
  return pts;
}

export function cibleReciproque(exercice: ExerciceInjectiviteFonctions, cote: CoteBranche, texte: string): FragmentConsigne[] | null {
  // 1/f et f se comparent sur le DOMAINE de f ; l'autre moitié de la réciproque, sur l'image.
  const ptsDom = points(exercice.domaine);
  const vaut = (ref: (x: number) => number, pts = ptsDom) => diagnostiquerEquivalenceFonction(texte, ref, pts) === "correct";
  if (vaut((x) => 1 / exercice.fReference(x))) return fragmentsDepuisTexte("Tu as écrit l'inverse $\\dfrac{1}{f(x)}$ : la réciproque s'obtient en échangeant $x$ et $y$, puis en isolant $y$.");
  if (vaut((x) => exercice.fReference(x))) return fragmentsDepuisTexte("C'est l'expression de f elle-même : échange $x$ et $y$ avant d'isoler $y$.");
  const autre = cote === "gauche" ? exercice.fInverseDroite : exercice.fInverseGauche;
  if (!exercice.injective && vaut(autre, points(exercice.image))) return fragmentsDepuisTexte("C'est la réciproque sur l'autre moitié du domaine : sur l'intervalle choisi, garde le signe (ou la racine) qui lui correspond.");
  return null;
}

/** La réciproque attendue sur la moitié choisie (pour la réponse affichée à la clôture). */
export function reciproqueAttendueLatex(exercice: ExerciceInjectiviteFonctions, cote: CoteBranche): string {
  return `f^{-1}(x)=${formatReciproqueLatex(exercice, cote)}`;
}

// ============================================================================
// Écran 4 — image.
// ============================================================================

export const AIDE_IMAGE_1: AideInjectivite = {
  texte: "L'image de f est l'ensemble des valeurs $f(x)$ prises quand $x$ parcourt le domaine : c'est aussi le domaine de $f^{-1}$, restreint aux valeurs réellement atteintes.",
  latex: null,
};

export function aideImage2(exercice: ExerciceInjectiviteFonctions): AideInjectivite {
  const p = exercice.parametres;
  if (exercice.image.forme === "reel") {
    return { texte: "Regarde les valeurs de f aux deux bouts du domaine (limites en $-\\infty$ et en $+\\infty$) : f prend-elle des valeurs aussi grandes et aussi petites qu'on veut ?", latex: null };
  }
  if (p.famille === "homographique") {
    return { texte: "En isolant $x$ dans $y=f(x)$, on trouve un quotient : pour quelle valeur de $y$ n'existe-t-il pas ?", latex: `x = \\dfrac{${formatAffineLatex(-p.d, p.b).replace(/x/g, "y")}}{${formatAffineLatex(p.c, -p.a).replace(/x/g, "y")}}` };
  }
  if (exercice.image.forme === "prive_points" && p.famille === "puissanceMonome") {
    return { texte: "Une fraction de numérateur non nul ne vaut jamais $0$ : quelle valeur f ne peut-elle pas prendre ?", latex: `${expressionEn(exercice, "x")}` };
  }
  if (exercice.image.forme === "prive_points") return { texte: "Cherche la valeur que f ne peut pas atteindre.", latex: null };
  const m = exercice.image.morceaux[0];
  const borne = m.inf !== null ? m.inf : (m.sup as number);
  return {
    texte: "Valeur de f au point où elle change de sens (ou au bord de son domaine) ; reste à savoir de quel côté se prolongent les autres valeurs :",
    latex: `y = ${fr(borne)}`,
  };
}

export function cibleImage(exercice: ExerciceInjectiviteFonctions, reponse: EnsembleReelGuide): FragmentConsigne[] | null {
  if (diagnostiquerEnsembleReelGuide(reponse, exercice.image) === "crochet") return fragmentsDepuisTexte(CROCHET);
  if (!verifierEnsembleReelGuide(exercice.domaine, exercice.image) && verifierEnsembleReelGuide(reponse, exercice.domaine)) {
    return fragmentsDepuisTexte("C'est le domaine de f : l'image est l'ensemble des valeurs $f(x)$, pas celui des $x$.");
  }
  return null;
}

// ============================================================================
// Écran 5 — bijection (deux listes : choix fermé, une tentative).
// ============================================================================

export const AIDE_BIJECTION_1: AideInjectivite = {
  texte: "f est une bijection de $X$ dans $Y$ quand chaque élément de $Y$ a exactement un antécédent dans $X$ : f doit être injective sur $X$, et $Y$ doit être l'ensemble des images des éléments de $X$.",
  latex: null,
};

export const AIDE_BIJECTION_2: AideInjectivite = {
  texte: "Pour $X$, reprends un intervalle sur lequel f est injective (écran « injectivité ») ; pour $Y$, l'ensemble des valeurs prises par f sur $X$ (écran « image »).",
  latex: null,
};

export function cibleBijection(xCorrect: boolean, yCorrect: boolean): FragmentConsigne[] | null {
  if (!xCorrect && yCorrect) return fragmentsDepuisTexte("Y est juste ; X doit être un intervalle sur lequel f est injective.");
  if (xCorrect && !yCorrect) return fragmentsDepuisTexte("X est juste ; Y doit être l'ensemble des valeurs prises par f sur X.");
  return null;
}
