import type { Arcfonction } from "../core6e/cyclometrique.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceEquationsCyclometriques } from "../core6e/equationsCyclometriques.types";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { fragmentsDepuisTexte } from "../components6e/RetourSaisieExpo";
import { evaluerExpressionCyclometrique, evaluerValeurCyclometrique } from "../moteur6e/expressionCyclometrique";
import { diagnostiquerEnsembleReelGuide } from "../moteur6e/verificationEnsembleReel";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";
import {
  ARCFONCTIONS_SOUS_CAS,
  MAX_DEN,
  NOM_LATEX,
  formatEquationNonCycloLatex,
  formatIdentiteAvantCarreLatex,
  formatLineaireLatex,
  formatQuadratiqueLatex,
} from "./formatEquationsCyclometriques";
import { approxFractionLatex } from "./formatFraction";

/**
 * Aides et messages ciblés de `6gen3` (audit du 6e ch. 1, lot B : G3, G4 ; E10). Niveau 1 : la
 * propriété du cours ; niveau 2 : la propriété appliquée à l'instance, sans la réponse (jamais
 * l'équation finale, les solutions ni le tri). Texte : une phrase (formules courtes entre `$…$`)
 * terminée par « : », puis la formule en KaTeX ; aucune notation clavier, aucun « \arccos » brut,
 * aucune majuscule d'insistance.
 */

export interface AideEquationCyclo {
  texte: string;
  latex: string | null;
}

type Exo = ExerciceEquationsCyclometriques;
type Exo4 = Extract<Exo, { variante: "arcfonctionsDifferentes" }>;

const TRIG: Record<Arcfonction, string> = { arcsin: "\\sin", arccos: "\\cos", arctan: "\\tan" };
const IMAGE: Record<Arcfonction, string> = {
  arcsin: "\\left[-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right]",
  arccos: "[0\\,;\\pi]",
  arctan: "\\left]-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right[",
};
const fx = (v: number) => approxFractionLatex(v, MAX_DEN);

function arcfonctions(e: Exo): Arcfonction[] {
  return e.variante === "arcfonctionsDifferentes" ? ARCFONCTIONS_SOUS_CAS[e.sousCas] : [e.arcfonction];
}

// ============================================================================
// Écran « ce ».
// ============================================================================

export function aideCE1(e: Exo): AideEquationCyclo {
  const arcs = arcfonctions(e);
  const bornees = arcs.filter((a) => a !== "arctan");
  if (bornees.length === 0) return { texte: "$\\arctan$ est définie pour tout réel : son argument peut prendre n'importe quelle valeur.", latex: null };
  const uniques = [...new Set(bornees)];
  const noms = uniques.map((a) => `$${NOM_LATEX[a]}$`).join(" et ");
  const verbe = uniques.length > 1 ? "ne sont définies" : "n'est définie";
  const tan = arcs.includes("arctan") ? " ; $\\arctan$, elle, est définie pour tout réel" : "";
  return { texte: `${noms} ${verbe} que sur $[-1\\,;1]$ : chaque argument concerné doit y rester${tan}.`, latex: null };
}

export function aideCE2(e: Exo): AideEquationCyclo {
  switch (e.variante) {
    case "angleLineaire":
    case "angleQuadratique": {
      if (e.arcfonction === "arctan") return { texte: "Aucune inégalité à résoudre ici : écris l'ensemble de tous les réels.", latex: null };
      const interieur = e.variante === "angleLineaire" ? formatLineaireLatex(e.arg) : formatQuadratiqueLatex(e.arg);
      return { texte: "Résous cet encadrement (attention au sens si tu divises par un négatif) :", latex: `-1 \\leq ${interieur} \\leq 1` };
    }
    case "memeArcfonction":
      if (e.arcfonction === "arctan") return { texte: "Aucune inégalité à résoudre ici : écris l'ensemble de tous les réels.", latex: null };
      return { texte: "Résous les deux encadrements, puis garde les x qui vérifient les deux :", latex: `-1 \\leq ${formatLineaireLatex(e.arg1)} \\leq 1 \\quad\\text{et}\\quad -1 \\leq ${formatLineaireLatex(e.arg2)} \\leq 1` };
    case "arcfonctionsDifferentes": {
      const [a1, a2] = ARCFONCTIONS_SOUS_CAS[e.sousCas];
      const conds: string[] = [];
      if (a1 !== "arctan") conds.push(`-1 \\leq ${formatLineaireLatex(e.arg1)} \\leq 1`);
      if (a2 !== "arctan") conds.push(`-1 \\leq ${formatLineaireLatex(e.arg2)} \\leq 1`);
      return { texte: conds.length > 1 ? "Résous les deux encadrements, puis garde les x qui vérifient les deux :" : "Résous cet encadrement (attention au sens si tu divises par un négatif) :", latex: conds.join(" \\quad\\text{et}\\quad ") };
    }
  }
}

const CROCHET = "Les bornes sont justes : relis les crochets. Une borne atteinte s'écrit avec un crochet tourné vers l'intérieur, et $-\\infty$, $+\\infty$ sont toujours exclus.";

export function cibleEnsemble(attendu: EnsembleReelGuide, reponse: EnsembleReelGuide, arcs: Arcfonction[]): FragmentConsigne[] | null {
  if (diagnostiquerEnsembleReelGuide(reponse, attendu) === "crochet") return fragmentsDepuisTexte(CROCHET);
  if (reponse.forme === "reel" && attendu.forme !== "reel" && arcs.some((a) => a !== "arctan")) return fragmentsDepuisTexte("$\\arcsin$ et $\\arccos$ ne sont définies que sur $[-1\\,;1]$ : l'argument est limité.");
  if (reponse.forme !== "reel" && attendu.forme === "reel") return fragmentsDepuisTexte("$\\arctan$ est définie pour tout réel : aucune valeur de x n'est exclue.");
  return null;
}

export function cibleCE(e: Exo, reponse: EnsembleReelGuide): FragmentConsigne[] | null {
  return cibleEnsemble(e.ce, reponse, arcfonctions(e));
}

// ============================================================================
// Écran « condition » (variante 4 seulement).
// ============================================================================

export function aideCondition1(e: Exo4): AideEquationCyclo {
  if (e.sousCas === "asin_acos") {
    return { texte: "$\\arcsin$ prend ses valeurs dans $\\left[-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right]$ et $\\arccos$ dans $[0\\,;\\pi]$ : un angle commun est dans $\\left[0\\,;\\frac{\\pi}{2}\\right]$, où le sinus et le cosinus sont positifs ou nuls. Les deux arguments doivent donc être positifs ou nuls.", latex: null };
  }
  if (e.sousCas === "asin_atan") {
    return { texte: "Sur $\\left]-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right[$, image de $\\arctan$, le sinus et la tangente ont le signe de l'angle : les deux arguments doivent avoir le même signe.", latex: null };
  }
  return { texte: "Un angle commun à $[0\\,;\\pi]$ (image de $\\arccos$) et à $\\left]-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right[$ (image de $\\arctan$) est dans $\\left[0\\,;\\frac{\\pi}{2}\\right[$ : son cosinus est strictement positif et sa tangente positive ou nulle.", latex: null };
}

export function aideCondition2(e: Exo4): AideEquationCyclo {
  const u = formatLineaireLatex(e.arg1);
  const v = formatLineaireLatex(e.arg2);
  if (e.sousCas === "asin_acos") return { texte: "Les deux inégalités à résoudre, puis à réunir par « et » :", latex: `${u} \\geq 0 \\quad\\text{et}\\quad ${v} \\geq 0` };
  if (e.sousCas === "asin_atan") return { texte: "Les deux arguments doivent avoir le même signe (ou être nuls ensemble) ; compare-les :", latex: `${v} = ${fx(e.arg2.a)}\\left(${u}\\right)` };
  return { texte: "Les deux inégalités à résoudre, puis à réunir par « et » :", latex: `${u} > 0 \\quad\\text{et}\\quad ${v} \\geq 0` };
}

export function cibleCondition(e: Exo4, reponse: EnsembleReelGuide): FragmentConsigne[] | null {
  return cibleEnsemble(e.conditionParasite, reponse, ["arcsin"]);
}

// ============================================================================
// Écran « equation ».
// ============================================================================

const IDENTITE: Record<Exo4["sousCas"], string> = {
  asin_acos: "\\cos(\\arcsin u) = \\sqrt{1-u^{2}}",
  asin_atan: "\\tan(\\arcsin u) = \\dfrac{u}{\\sqrt{1-u^{2}}}",
  acos_atan: "\\tan(\\arccos u) = \\dfrac{\\sqrt{1-u^{2}}}{u}",
};

export function aideEquation1(e: Exo): AideEquationCyclo {
  switch (e.variante) {
    case "angleLineaire":
    case "angleQuadratique":
      return { texte: `Applique $${TRIG[e.arcfonction]}$ aux deux membres : $${TRIG[e.arcfonction]}(${NOM_LATEX[e.arcfonction]}\\,u) = u$ (sur le domaine), et l'angle donne une valeur remarquable.`, latex: null };
    case "memeArcfonction":
      return { texte: `$${NOM_LATEX[e.arcfonction]}$ est injective : deux images égales viennent de deux arguments égaux.`, latex: null };
    case "arcfonctionsDifferentes":
      return { texte: "Applique la même fonction trigonométrique aux deux membres, utilise l'identité ci-dessous pour faire disparaître les arcfonctions, puis élève au carré : les solutions obtenues ne sont que des candidates.", latex: IDENTITE[e.sousCas] };
  }
}

export function aideEquation2(e: Exo): AideEquationCyclo {
  switch (e.variante) {
    case "angleLineaire":
    case "angleQuadratique": {
      const u = e.variante === "angleLineaire" ? formatLineaireLatex(e.arg) : formatQuadratiqueLatex(e.arg);
      return { texte: "Il reste à calculer la valeur remarquable du membre de droite :", latex: `${NOM_LATEX[e.arcfonction]}\\left(${u}\\right) = ${e.angle.latex} \\iff ${u} = ${TRIG[e.arcfonction]}\\left(${e.angle.latex}\\right)` };
    }
    case "memeArcfonction":
      return { texte: "Applique l'injectivité aux deux arguments de l'équation :", latex: `${NOM_LATEX[e.arcfonction]}(A) = ${NOM_LATEX[e.arcfonction]}(B) \\iff A = B` };
    case "arcfonctionsDifferentes":
      return { texte: "Après l'identité, avant la mise au carré, on obtient :", latex: formatIdentiteAvantCarreLatex(e) };
  }
}

/** Référence (membre de gauche − membre de droite) de l'équation « en gardant l'angle » (variantes 1
 * et 3) : l'erreur « 2x − 1 = π/6 ». */
function differenceAngleGarde(e: Exo): ((x: number) => number) | null {
  if (e.variante === "angleLineaire") return (x) => e.arg.a * x + e.arg.b - e.angle.numerique;
  if (e.variante === "angleQuadratique") return (x) => e.arg.a * x * x + e.arg.b * x + e.arg.c - e.angle.numerique;
  return null;
}

function equationProportionnelle(texte: string, ref: (x: number) => number): boolean {
  const parties = texte.split("=");
  if (parties.length !== 2) return false;
  let ratio: number | null = null;
  for (const x of [0.31, -0.72, 1.47, -1.83, 2.29, -0.14]) {
    let d: number;
    try {
      d = evaluerExpressionCyclometrique(parties[0], x) - evaluerExpressionCyclometrique(parties[1], x);
    } catch {
      return false;
    }
    const r = ref(x);
    if (!Number.isFinite(d) || Math.abs(r) < 1e-6) continue;
    const q = d / r;
    if (ratio === null) ratio = q;
    else if (Math.abs(q - ratio) > 1e-6 * Math.max(1, Math.abs(ratio))) return false;
  }
  return ratio !== null && Math.abs(ratio) > 1e-9;
}

export function cibleEquation(e: Exo, texte: string): FragmentConsigne[] | null {
  const angle = differenceAngleGarde(e);
  if (angle && equationProportionnelle(texte, angle)) {
    return fragmentsDepuisTexte(`Tu as gardé l'angle : en appliquant $${TRIG[(e as { arcfonction: Arcfonction }).arcfonction]}$ aux deux membres, le membre de droite devient une valeur remarquable.`);
  }
  if (e.variante === "arcfonctionsDifferentes" && /sqrt|√|rac/i.test(texte)) return fragmentsDepuisTexte("Il reste une racine : élève les deux membres au carré pour obtenir une équation polynomiale.");
  if (/arc|asin|acos|atan/i.test(texte)) return fragmentsDepuisTexte("Il reste une arcfonction : l'équation demandée n'en contient plus aucune.");
  return null;
}

// ============================================================================
// Écran « solutions ».
// ============================================================================

export function aideSolutions1(e: Exo): AideEquationCyclo {
  switch (e.variante) {
    case "angleLineaire":
    case "memeArcfonction":
      return { texte: "Une équation du premier degré $ax=b$ avec $a\\neq 0$ a exactement une solution, $x=\\dfrac{b}{a}$.", latex: null };
    case "angleQuadratique":
      return { texte: "Ramène l'équation à la forme $(x-h)^{2}=k$ : deux solutions si $k>0$, une si $k=0$, aucune si $k<0$.", latex: null };
    case "arcfonctionsDifferentes":
      if (e.sousCas === "asin_acos") return { texte: "Développe et regroupe : tu obtiens une équation du second degré ; calcule son discriminant.", latex: null };
      return { texte: "Pose $t$ égal à l'argument du premier membre, puis $T=t^{2}$ : l'équation devient du second degré en $T$. Une valeur $T<0$ ne donne aucun $t$ ; $T\\geq 0$ donne $t=\\pm\\sqrt{T}$.", latex: null };
  }
}

export function aideSolutions2(e: Exo): AideEquationCyclo {
  switch (e.variante) {
    case "angleLineaire":
      return { texte: "Isole le terme en $x$ :", latex: `${fx(e.arg.a)}\\,x = \\ldots` };
    case "memeArcfonction":
      return { texte: "Regroupe les termes en $x$ d'un côté :", latex: `${fx(e.arg1.a - e.arg2.a)}\\,x = \\ldots` };
    case "angleQuadratique": {
      const h = -e.arg.b / (2 * e.arg.a);
      return { texte: "Le trinôme est un multiple d'un carré :", latex: `${formatQuadratiqueLatex(e.arg)} = ${fx(e.arg.a)}\\left(x ${h > 0 ? "-" : "+"} ${fx(Math.abs(h))}\\right)^{2}` };
    }
    case "arcfonctionsDifferentes": {
      if (e.sousCas === "asin_acos") return { texte: "L'équation du second degré à développer :", latex: formatEquationNonCycloLatex(e) };
      const m = fx(e.arg2.a);
      const t = `t = ${formatLineaireLatex(e.arg1)}`;
      if (e.sousCas === "asin_atan") return { texte: `Avec $${t}$, le second argument vaut $${m}\\,t$ et l'équation devient :`, latex: `\\left(${m}\\right)^{2} t^{2}\\left(1-t^{2}\\right) = t^{2}` };
      return { texte: `Avec $${t}$, le second argument vaut $${m}\\,t$ et l'équation devient :`, latex: `t^{2}\\left(1+\\left(${m}\\right)^{2} t^{2}\\right) = 1` };
    }
  }
}

export function cibleSolutions(e: Exo, textes: string[]): FragmentConsigne[] | null {
  const tous = e.candidats.map((c) => c.x);
  const valeurs = textes.map((t) => evaluerValeurCyclometrique(t.replace(/^\s*x\s*=\s*/i, "")));
  if (valeurs.some((v) => v === null)) return null;
  const vs = valeurs as number[];
  if (vs.length === 0 && tous.length > 0) return fragmentsDepuisTexte("L'équation sans arcfonction a des solutions : résous-la avant de trier.");
  if (vs.length > 0 && tous.length === 0) return fragmentsDepuisTexte("Vérifie le signe du nombre auquel le carré est égal : un carré n'est jamais négatif.");
  const dans = (v: number) => tous.some((x) => Math.abs(x - v) < 0.01);
  if (vs.length < tous.length && vs.every(dans)) {
    const acceptes = e.candidats.filter((c) => c.accepteAttendu).map((c) => c.x);
    if (acceptes.length === vs.length && vs.every((v) => acceptes.some((x) => Math.abs(x - v) < 0.01))) {
      return fragmentsDepuisTexte("On demande toutes les solutions de l'équation sans arcfonction, avant le tri : il se fait à l'écran suivant.");
    }
    return fragmentsDepuisTexte("Il manque une solution : en prenant une racine carrée, pense aux deux signes $\\pm$.");
  }
  return null;
}

// ============================================================================
// Écran « acceptRejet » (choix fermés : une tentative).
// ============================================================================

export function aideAcceptRejet1(e: Exo): AideEquationCyclo {
  const base = "Une candidate n'est solution que si elle vérifie la condition d'existence (CE) du premier écran.";
  if (e.variante !== "arcfonctionsDifferentes") return { texte: base, latex: null };
  return { texte: `${base} La mise au carré a pu ajouter des solutions parasites : une candidate doit aussi vérifier la condition de compatibilité.`, latex: null };
}

export function aideAcceptRejet2(e: Exo): AideEquationCyclo {
  if (e.variante !== "arcfonctionsDifferentes") return { texte: "La CE établie au premier écran ; compare chaque candidate à cet ensemble :", latex: `x \\in ${formatEnsembleReelLatex(e.ce, MAX_DEN)}` };
  return {
    texte: "La CE et la condition de compatibilité ; une candidate doit vérifier les deux :",
    latex: `x \\in ${formatEnsembleReelLatex(e.ce, MAX_DEN)} \\quad\\text{et}\\quad x \\in ${formatEnsembleReelLatex(e.conditionParasite, MAX_DEN)}`,
  };
}

export const IMAGE_ARC_EQUATIONS = IMAGE;
