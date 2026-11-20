import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import type { ExerciceDetectiveFonctions, ScenarioDetectiveFonctions, VarianteDetectiveFonctions } from "../core5e/detectiveFonctions.types";
import type { AideEcran, Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { Ensemble } from "./ensemblesReels";
import { ensembleL, intervalle, nombreL, priveDe, R, reunion, VIDE } from "./ensemblesReels";

/**
 * Modèle de `5gen58` « Détective d'erreurs : fonctions et composées » : à partir des paramètres
 * entiers du scénario, la copie de l'élève fictif (cohérente avec SON erreur), la ligne fausse, la
 * bonne description, la réponse corrigée (écran 3) et le contenu du corrigé détaillé. Une seule
 * source pour l'écran, le papier et le corrigé.
 */

type E = ExerciceDetectiveFonctions;
const t = tx;
const l = lx;

export type GenreValeur = "ensemble" | "expression" | "nombre";

export interface ValeurDetective {
  genre: GenreValeur;
  label: string;
  labelLatex: string;
  placeholder: string;
  ensemble?: Ensemble;
  fonction?: (x: number) => number;
  nombre?: number;
  /** Écriture complète de la bonne réponse (« \operatorname{dom}f=… »). */
  latex: string;
}

export interface BlocCorrige {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDetective {
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  /** Règle employée par chaque ligne (aide de niveau 2 de l'écran 1), texte sans notation. */
  regles: string[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  valeur: ValeurDetective;
  /** Résultat (faux) de la copie : une saisie qui le reprend reçoit `piege`. */
  copieEnsemble?: Ensemble;
  copieFonction?: (x: number) => number;
  copieNombre?: number;
  piege: Frag[];
  corrigeA: BlocCorrige;
  corrigeB: BlocCorrige;
  corrigeC: BlocCorrige & { verification?: BlocCorrige };
}

// ============================================================================
// Écritures.
// ============================================================================

/** « ax + b » (a = ±1 → « x », « −x » ; b = 0 omis). */
export function lin(a: number, b: number, v = "x"): string {
  const ax = a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`;
  return b === 0 ? ax : `${ax}${b > 0 ? "+" : ""}${b}`;
}
/** « b − x » (b = 0 → « −x »). */
const bMoinsX = (b: number) => (b === 0 ? "-x" : `${b}-x`);
const parN = (v: number) => (v < 0 ? `(${v})` : `${v}`);
/** « x + b » avec x remplacé par v (le radicande tel qu'il est affiché). */
const linSub = (v: number, b: number) => `${v}${b === 0 ? "" : b > 0 ? `+${b}` : b}`;
const nb = (v: number) => (v < 0 ? `−${-v}` : `${v}`);
/** Rationnel simple en texte (« −5/2 », « 3 »). */
function qT(v: number): string {
  if (Number.isInteger(v)) return nb(v);
  for (let d = 2; d <= 60; d++) {
    const n = Math.round(v * d);
    if (Math.abs(v * d - n) < 1e-9) return `${n < 0 ? "−" : ""}${Math.abs(n)}/${d}`;
  }
  return nb(v);
}

// ============================================================================
// Descriptions (écran 2).
// ============================================================================

export const DESCRIPTION_CORRECTE: Record<VarianteDetectiveFonctions, string> = {
  sens: "sens",
  strict: "strict",
  union: "union",
  condition2: "condition2",
  ordre: "ordre",
  portion: "portion",
};

export const LEURRES: Record<VarianteDetectiveFonctions, string[]> = {
  sens: ["sensStrict", "sensDiviserK", "sensCrochet"],
  strict: ["strictSens", "strictSeulDenominateur", "strictBorne"],
  union: ["unionSens", "unionStrict", "unionPremier"],
  condition2: ["condOrdre", "condReunion", "condSens"],
  ordre: ["ordreCarre", "ordreProduit", "ordreConstante"],
  portion: ["portionCalcul", "portionOrdre", "portionDedans"],
};

/** Texte d'une description (bonne ou leurre), adapté à l'instance. */
export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.d;
  switch (id) {
    case "sens":
      return [t("En divisant par "), l(`-${d.k}`), t(", un nombre négatif, il fallait changer le sens de l'inégalité.")];
    case "sensStrict":
      return [t("Sous une racine carrée, le nombre doit être strictement positif : il fallait « > 0 ».")];
    case "sensDiviserK":
      return [t("Il fallait diviser par "), l(`${d.k}`), t(" et non par "), l(`-${d.k}`), t(".")];
    case "sensCrochet":
      return [t("La borne "), l(nombreL(d.c / d.k)), t(" devait être exclue : crochet ouvert.")];
    case "strict":
      return [l(`\\sqrt{${lin(d.k, d.p)}}\\neq 0`), t(" exclut "), l(`${lin(d.k, d.p)}=0`), t(" : il fallait « > 0 », pas « ≥ 0 ».")];
    case "strictSens":
      return [t("En isolant x, il fallait changer le sens de l'inégalité.")];
    case "strictSeulDenominateur":
      return [t("Une racine au dénominateur n'impose qu'une condition : la racine non nulle, sans condition sur le nombre sous la racine.")];
    case "strictBorne":
      return [t("La borne vaut "), l(nombreL(d.p / d.k)), t(" et non "), l(nombreL(-d.p / d.k)), t(".")];
    case "union":
      return [t("Les deux racines doivent exister en même temps : il fallait l'intersection des deux conditions, pas leur réunion.")];
    case "unionSens":
      return [t("À la ligne 2, le sens de l'inégalité est faux.")];
    case "unionStrict":
      return [t("Les deux conditions devaient être strictes (« > 0 »).")];
    case "unionPremier":
      return [t("Le domaine d'une somme est celui de son premier terme seulement.")];
    case "condition2":
      return e.scenario === "C1"
        ? [t("Il manque la condition 2 : "), l("g(x)"), t(" doit appartenir au domaine de "), l("f"), t(", donc "), l(`\\sqrt{${lin(1, d.p)}}\\neq ${d.k}`), t(".")]
        : [t("Le domaine se lit sur "), l("f\\big(g(x)\\big)"), t(" avant de simplifier : "), l("g(x)"), t(" doit exister, il faut "), l(`${d.s === 1 ? lin(1, -d.p) : bMoinsX(d.p)}\\geq 0`), t(".")];
    case "condOrdre":
      return [t("f et g ont été composées dans le mauvais ordre.")];
    case "condReunion":
      return [t("Il fallait réunir les conditions au lieu de les combiner.")];
    case "condSens":
      return [t("Le sens de l'inégalité de la condition 1 est faux.")];
    case "ordre": {
      const [A, B] = d.t === 0 ? ["f", "g"] : ["g", "f"];
      return [l(`(${A}\\circ ${B})(x)=${A}\\big(${B}(x)\\big)`), t(" : on applique d'abord "), l(B), t(", la fonction écrite à droite ; la copie a appliqué les fonctions dans l'autre ordre.")];
    }
    case "ordreCarre":
      return [t("Le carré a été mal développé.")];
    case "ordreProduit":
      return [t("Il fallait multiplier f(x) par g(x).")];
    case "ordreConstante":
      return [t("Une constante a été oubliée en remplaçant x.")];
    case "portion":
      return [l("g"), t(" est définie sur "), l("\\mathbb{R}"), t(" : une valeur hors de la portion tracée existe bien, on la calcule avec la formule de "), l("g"), t(".")];
    case "portionCalcul":
      return [l(`f(${d.a})`), t(" est mal calculé.")];
    case "portionOrdre":
      return [t("Il fallait calculer "), l(`f\\big(g(${d.a})\\big)`), t(".")];
    case "portionDedans":
      return [t("La valeur intermédiaire est bien dans la portion tracée.")];
  }
  return [t(id)];
}

// ============================================================================
// Copies.
// ============================================================================

const LIGNES_PAR_SCENARIO: Record<ScenarioDetectiveFonctions, number> = { S: 4, T: 4, U: 4, C1: 3, C2: 3, O: 3, P: 4 };
export const nombreLignes = (e: E) => LIGNES_PAR_SCENARIO[e.scenario];

function copieS(e: E): CopieDetective {
  const { k, c, o } = e.d;
  const rad = o === 0 ? `${c}-${k}x` : `-${k}x+${c}`;
  const q = c / k;
  const qL = nombreL(q);
  const juste: Ensemble = [intervalle(-Infinity, false, q, true)];
  const faux: Ensemble = [intervalle(q, true, Infinity, false)];
  const x0 = Math.floor(q) + 1;
  return {
    enonce: [t("Déterminer le domaine de "), l(`f(x)=\\sqrt{${rad}}`), t(".")],
    lignes: [[t("Condition : "), l(`${rad}\\geq 0`)], [l(`-${k}x\\geq -${c}`)], [l(`x\\geq ${qL}`)], [l(`\\operatorname{dom}f=${ensembleL(faux)}`)]],
    ligneFausse: 2,
    regles: ["nombre sous la racine positif ou nul", `on retranche ${c} des deux membres`, `on divise les deux membres par −${k}`, "on écrit l'ensemble des x obtenus"],
    regleCours: { texte: [t("Multiplier ou diviser les deux membres d'une inégalité par un nombre négatif change son sens :")], latex: "a<b\\ \\text{ et }\\ c<0\\ \\Longrightarrow\\ ca>cb" },
    aideCorrection: { texte: [t("Reprends à partir de la ligne 3 : divise par "), l(`-${k}`), t(" en changeant le sens, puis écris l'intervalle (crochet fermé : la borne vérifie « ≥ 0 »).")] },
    valeur: { genre: "ensemble", label: "dom f", labelLatex: "\\operatorname{dom}f=", placeholder: "ex. : ]−∞ ; 3]", ensemble: juste, latex: `\\operatorname{dom}f=${ensembleL(juste)}` },
    copieEnsemble: faux,
    piege: [t("C'est le domaine de la copie : en divisant par "), l(`-${k}`), t(", le sens « ≥ » devient « ≤ ».")],
    corrigeA: {
      utilise: [t("On refait le passage de la ligne 2 à la ligne 3, puis on teste une valeur que la copie garde.")],
      lignes: [ligne(`-${k}x\\geq -${c}`, "ligne 2, juste"), ligne(`x\\leq ${qL}`, `on divise par −${k} < 0 : le sens change`), ligne(`${c}-${k}\\times ${parN(x0)}=${c - k * x0}<0`, `x = ${nb(x0)} vérifie la ligne 3 de la copie, mais pas la condition`)],
    },
    corrigeB: {
      utilise: [t("Diviser les deux membres d'une inégalité par un nombre négatif change son sens (cours, § 1).")],
      lignes: [ligne("2<3", "deux nombres rangés"), ligne(`-${k}\\times 2>-${k}\\times 3`, `on multiplie par −${k} : le sens change`)],
    },
    corrigeC: {
      utilise: [t("Racine carrée : le nombre sous la racine doit être positif ou nul (cours, § 1). On reprend la résolution à partir de la ligne 3.")],
      lignes: [ligne(`${rad}\\geq 0`, "condition d'existence"), ligne(`-${k}x\\geq -${c}`, `on retranche ${c}`), ligne(`x\\leq ${qL}`, `on divise par −${k} < 0 : le sens change`)],
      verification: { utilise: [t("Vérification : une valeur du domaine trouvé, puis la borne.")], lignes: [ligne(`${c}-${k}\\times ${parN(x0 - 2)}=${c - k * (x0 - 2)}\\geq 0`, `x = ${nb(x0 - 2)} convient`), ligne(`${c}-${k}\\times ${qL.startsWith("-") ? `(${qL})` : qL}=0`, "la borne convient : √0 = 0")] },
    },
  };
}

function copieT(e: E): CopieDetective {
  const { k, p, n } = e.d;
  const rad = lin(k, p);
  const b = -p / k;
  const bL = nombreL(b);
  const juste: Ensemble = [intervalle(b, false, Infinity, false)];
  const faux: Ensemble = [intervalle(b, true, Infinity, false)];
  const x1 = Math.floor(b) + 1;
  const kx = k === 1 ? "x" : `${k}x`;
  return {
    enonce: [t("Déterminer le domaine de "), l(`f(x)=\\dfrac{${n}}{\\sqrt{${rad}}}`), t(".")],
    lignes: [
      [t("Conditions : "), l(`${rad}\\geq 0`), t(" (sous la racine) et "), l(`\\sqrt{${rad}}\\neq 0`), t(" (dénominateur)")],
      [t("Ensemble : "), l(`${rad}\\geq 0`)],
      [l(`${kx}\\geq ${-p}`)],
      [l(`\\operatorname{dom}f=${ensembleL(faux)}`)],
    ],
    ligneFausse: 1,
    regles: ["deux conditions : racine et dénominateur", "on réunit les deux conditions en une seule", `on ${p > 0 ? "retranche" : "ajoute"} ${Math.abs(p)}`, "on écrit l'ensemble des x obtenus"],
    regleCours: { texte: [t("Racine au dénominateur : le nombre sous la racine doit être positif ou nul et la racine non nulle, donc :")], latex: "\\dfrac{N}{\\sqrt{A}}\\text{ existe}\\iff A>0" },
    aideCorrection: { texte: [t("Reprends à partir de la ligne 2 avec la condition stricte "), l(`${rad}>0`), t(", puis isole x : la borne est-elle comprise ?")] },
    valeur: { genre: "ensemble", label: "dom f", labelLatex: "\\operatorname{dom}f=", placeholder: "ex. : ]2 ; +∞[", ensemble: juste, latex: `\\operatorname{dom}f=${ensembleL(juste)}` },
    copieEnsemble: faux,
    piege: [t("C'est le domaine de la copie : pour "), l(`x=${bL}`), t(", "), l(`\\sqrt{0}=0`), t(" serait au dénominateur.")],
    corrigeA: {
      utilise: [t("On teste la borne que la copie garde : elle annule la racine du dénominateur.")],
      lignes: [ligne(`${k === 1 ? "" : `${k}\\times `}${b < 0 || !Number.isInteger(b) ? `\\left(${bL}\\right)` : bL}${p > 0 ? "+" : ""}${p}=0`, `x = ${qT(b)} est gardé par la ligne 2`), ligne("\\sqrt{0}=0", "le dénominateur serait nul : la ligne 2 est fausse")],
    },
    corrigeB: {
      utilise: [t("Racine au dénominateur : nombre sous la racine positif ou nul et racine non nulle, donc strictement positif (cours, § 1).")],
      lignes: [ligne("\\sqrt{0}=0", "une racine nulle ne peut pas être au dénominateur")],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne 2 avec la condition stricte.")],
      lignes: [ligne(`${rad}>0`, "racine au dénominateur"), ligne(`${kx}>${-p}`, `on ${p > 0 ? "retranche" : "ajoute"} ${Math.abs(p)}`), ...(k === 1 ? [] : [ligne(`x>${bL}`, `on divise par ${k}`)])],
      verification: { utilise: [t("Vérification avec une valeur du domaine :")], lignes: [ligne(`${k === 1 ? "" : `${k}\\times `}${parN(x1)}${p > 0 ? "+" : ""}${p}=${k * x1 + p}>0`, `x = ${nb(x1)} convient`)] },
    },
  };
}

function copieU(e: E): CopieDetective {
  const { a, b } = e.d;
  const r1 = lin(1, -a);
  const r2 = bMoinsX(b);
  const vide = a > b;
  const juste: Ensemble = vide ? VIDE : [intervalle(a, true, b, true)];
  // Résultat de la copie : la réunion des deux conditions (ℝ si a ≤ b).
  const reunionCopie: Ensemble = reunion([intervalle(a, true, Infinity, false)], [intervalle(-Infinity, false, b, true)]);
  const x0 = vide ? a : b + 1;
  return {
    enonce: [t("Déterminer le domaine de "), l(`f(x)=\\sqrt{${r1}}+\\sqrt{${r2}}`), t(".")],
    lignes: [
      [l(`${r1}\\geq 0`), t(" donc "), l(`x\\geq ${a}`)],
      [l(`${r2}\\geq 0`), t(" donc "), l(`x\\leq ${b}`)],
      [l(`\\operatorname{dom}f=[${a}\\,;\\,+\\infty\\mathclose{[}\\cup\\mathopen{]}-\\infty\\,;\\,${b}]`)],
      [l(`\\operatorname{dom}f=${ensembleL(reunionCopie)}`)],
    ],
    ligneFausse: 2,
    regles: ["première racine : nombre positif ou nul", "seconde racine : nombre positif ou nul", "on combine les deux conditions", "on simplifie l'ensemble"],
    regleCours: { texte: [t("Une somme existe si chacun de ses termes existe : on garde les x qui vérifient les deux conditions à la fois :")], latex: "\\operatorname{dom}f=D_1\\cap D_2" },
    aideCorrection: { texte: [t("Reprends à partir de la ligne 3 : quels x sont à la fois "), l(`\\geq ${a}`), t(" et "), l(`\\leq ${b}`), t(" ? Il se peut qu'il n'y en ait aucun.")] },
    valeur: { genre: "ensemble", label: "dom f", labelLatex: "\\operatorname{dom}f=", placeholder: "ex. : [−2 ; 5] ou ∅", ensemble: juste, latex: `\\operatorname{dom}f=${ensembleL(juste)}` },
    copieEnsemble: reunionCopie,
    piege: [t("C'est le domaine de la copie : pour "), l(`x=${x0}`), t(", "), l(`\\sqrt{${b}-${parN(x0)}}`), t(" n'existe pas.")],
    corrigeA: {
      utilise: [t("On teste une valeur que la réunion garde : chaque racine doit exister.")],
      lignes: [ligne(`${b}-${parN(x0)}=${b - x0}<0`, `x = ${nb(x0)} est dans la réunion, mais la seconde racine n'existe pas`)],
    },
    corrigeB: {
      utilise: [t("Le domaine d'une somme est l'intersection des domaines de ses termes : les deux conditions doivent être vraies en même temps (cours, § 1).")],
      lignes: [ligne(`x\\geq ${a}`, "condition 1"), ligne(`x\\leq ${b}`, "condition 2, en même temps")],
    },
    corrigeC: vide
      ? {
          utilise: [t("On cherche les x qui sont à la fois supérieurs ou égaux à "), l(`${a}`), t(" et inférieurs ou égaux à "), l(`${b}`), t(".")],
          lignes: [ligne(`${a}>${b}`, "aucun nombre n'est à la fois au-dessus de la plus grande borne et en dessous de la plus petite")],
        }
      : {
          utilise: [t("On cherche les x qui vérifient les deux conditions à la fois.")],
          lignes: [ligne(`${a}\\leq x\\leq ${b}`, "intersection des deux conditions")],
          verification: { utilise: [t("Vérification avec une borne :")], lignes: [ligne(`${linSub(a, -a)}=0\\geq 0`, `x = ${nb(a)} : première racine`), ligne(`${b}-${parN(a)}=${b - a}\\geq 0`, `x = ${nb(a)} : seconde racine`)] },
        },
  };
}

function copieC1(e: E): CopieDetective {
  const { k, p } = e.d;
  const g = lin(1, p);
  const ex = k * k - p;
  const juste = priveDe([intervalle(-p, true, Infinity, false)], [ex]);
  const faux: Ensemble = [intervalle(-p, true, Infinity, false)];
  return {
    enonce: [t("Avec "), l(`f(x)=\\dfrac{1}{x-${k}}`), t(" et "), l(`g(x)=\\sqrt{${g}}`), t(", déterminer "), l("(f\\circ g)(x)"), t(" et son domaine.")],
    lignes: [[l(`(f\\circ g)(x)=f\\big(g(x)\\big)=\\dfrac{1}{\\sqrt{${g}}-${k}}`)], [t("Condition 1 : "), l("x\\in\\operatorname{dom}g"), t(", soit "), l(`${g}\\geq 0`), t(", donc "), l(`x\\geq ${-p}`)], [l(`\\operatorname{dom}(f\\circ g)=${ensembleL(faux)}`)]],
    ligneFausse: 2,
    regles: ["on remplace x par g(x) dans f", "la fonction intérieure g doit exister", "on conclut le domaine"],
    regleCours: { texte: [t("Domaine d'une composée : deux conditions, la fonction intérieure existe et sa valeur est acceptée par la fonction extérieure :")], latex: "x\\in\\operatorname{dom}(f\\circ g)\\iff x\\in\\operatorname{dom}g\\ \\text{ et }\\ g(x)\\in\\operatorname{dom}f" },
    aideCorrection: { texte: [t("Ajoute la condition 2 : le dénominateur de "), l("f(g(x))"), t(" ne doit pas s'annuler, "), l(`\\sqrt{${g}}\\neq ${k}`), t(". Élève au carré pour trouver la valeur à retirer.")] },
    valeur: { genre: "ensemble", label: "dom (f∘g)", labelLatex: "\\operatorname{dom}(f\\circ g)=", placeholder: "ex. : [−3 ; 1[ ∪ ]1 ; +∞[", ensemble: juste, latex: `\\operatorname{dom}(f\\circ g)=${ensembleL(juste)}` },
    copieEnsemble: faux,
    piege: [t("C'est le domaine de la copie : pour "), l(`x=${ex}`), t(", le dénominateur "), l(`\\sqrt{${linSub(ex, p)}}-${k}`), t(" est nul.")],
    corrigeA: {
      utilise: [t("On teste une valeur que la copie garde : le dénominateur de la composée doit être non nul.")],
      lignes: [ligne(`\\sqrt{${linSub(ex, p)}}-${k}=\\sqrt{${k * k}}-${k}`, `x = ${nb(ex)}`), ligne(`=${k}-${k}`), ligne("=0", "dénominateur nul : la ligne 3 est fausse")],
    },
    corrigeB: {
      utilise: [t("Domaine d'une composée : "), l("x\\in\\operatorname{dom}g"), t(" et "), l("g(x)\\in\\operatorname{dom}f"), t(" (cours, § 3).")],
      lignes: [ligne(`\\operatorname{dom}f=\\mathbb{R}\\setminus\\{${k}\\}`, "condition 2 : g(x) ≠ " + k)],
    },
    corrigeC: {
      utilise: [t("On reprend la ligne 3 avec les deux conditions.")],
      lignes: [ligne(`x\\geq ${-p}`, "condition 1 (ligne 2, juste)"), ligne(`\\sqrt{${g}}\\neq ${k}`, "condition 2 : dénominateur de f non nul"), ligne(`${g}\\neq ${k * k}`, "on élève au carré (deux nombres positifs)"), ligne(`x\\neq ${ex}`, p > 0 ? `on retranche ${p}` : p < 0 ? `on ajoute ${-p}` : "x est isolé")],
    },
  };
}

function copieC2(e: E): CopieDetective {
  const { p, s } = e.d;
  const rad = s === 1 ? lin(1, -p) : bMoinsX(p);
  const juste: Ensemble = s === 1 ? [intervalle(p, true, Infinity, false)] : [intervalle(-Infinity, false, p, true)];
  const x0 = s === 1 ? p - 1 : p + 1;
  return {
    enonce: [t("Avec "), l("f(x)=x^2"), t(" et "), l(`g(x)=\\sqrt{${rad}}`), t(", déterminer "), l("(f\\circ g)(x)"), t(" et son domaine.")],
    lignes: [[l(`(f\\circ g)(x)=f\\big(g(x)\\big)=\\left(\\sqrt{${rad}}\\right)^2`)], [l(`(f\\circ g)(x)=${rad}`)], [l(rad), t(" est un polynôme, donc "), l("\\operatorname{dom}(f\\circ g)=\\mathbb{R}")]],
    ligneFausse: 2,
    regles: ["on remplace x par g(x) dans f", "on simplifie le carré d'une racine", "on lit le domaine"],
    regleCours: { texte: [t("Domaine d'une composée : on le lit sur l'écriture de départ f(g(x)), avant de simplifier ; la fonction intérieure doit exister :")], latex: "x\\in\\operatorname{dom}(f\\circ g)\\iff x\\in\\operatorname{dom}g\\ \\text{ et }\\ g(x)\\in\\operatorname{dom}f" },
    aideCorrection: { texte: [t("Reprends à la ligne 3 : pour quels x "), l(`\\sqrt{${rad}}`), t(" existe-t-il ? La condition 2 ("), l("\\operatorname{dom}f=\\mathbb{R}"), t(") est toujours vraie.")] },
    valeur: { genre: "ensemble", label: "dom (f∘g)", labelLatex: "\\operatorname{dom}(f\\circ g)=", placeholder: "ex. : [2 ; +∞[", ensemble: juste, latex: `\\operatorname{dom}(f\\circ g)=${ensembleL(juste)}` },
    copieEnsemble: R,
    piege: [t("C'est le domaine de la copie : pour "), l(`x=${x0}`), t(", "), l(`g(${x0})`), t(" n'existe pas, donc "), l(`f\\big(g(${x0})\\big)`), t(" non plus.")],
    corrigeA: {
      utilise: [t("On teste une valeur que la copie garde : la fonction intérieure doit exister.")],
      lignes: [ligne(s === 1 ? `${linSub(x0, -p)}=-1<0` : `${p}-${parN(x0)}=-1<0`, `pour x = ${nb(x0)}, g(x) n'existe pas`)],
    },
    corrigeB: {
      utilise: [t("Le domaine d'une composée se lit sur f(g(x)) avant toute simplification : "), l("x\\in\\operatorname{dom}g"), t(" et "), l("g(x)\\in\\operatorname{dom}f"), t(" (cours, § 3).")],
      lignes: [ligne(`\\operatorname{dom}g=${ensembleL(juste)}`, "condition 1")],
    },
    corrigeC: {
      utilise: [t("On reprend la ligne 3 avec les deux conditions.")],
      lignes: [ligne(`${rad}\\geq 0`, "condition 1 : g(x) existe"), ligne(`g(x)\\in\\mathbb{R}`, "condition 2 : dom f = ℝ, toujours vraie"), ligne(s === 1 ? `x\\geq ${p}` : `x\\leq ${p}`, s === 1 ? (p === 0 ? "x est isolé" : p > 0 ? `on ajoute ${p}` : `on retranche ${-p}`) : "on isole x : le sens change en multipliant par −1")],
    },
  };
}

export function polynomeL(a2: number, a1: number, a0: number): string {
  const termes: string[] = [];
  if (a2 !== 0) termes.push(a2 === 1 ? "x^2" : a2 === -1 ? "-x^2" : `${a2}x^2`);
  if (a1 !== 0) termes.push(`${termes.length && a1 > 0 ? "+" : ""}${a1 === 1 ? "x" : a1 === -1 ? "-x" : `${a1}x`}`);
  if (a0 !== 0 || termes.length === 0) termes.push(`${termes.length && a0 > 0 ? "+" : ""}${a0}`);
  return termes.join("");
}

function copieO(e: E): CopieDetective {
  const { c, m, q, t: cible } = e.d;
  const fL = polynomeL(1, 0, c);
  const gL = lin(m, q);
  const fg = { a2: m * m, a1: 2 * m * q, a0: q * q + c };
  const gf = { a2: m, a1: 0, a0: m * c + q };
  const [A, B] = cible === 0 ? ["f", "g"] : ["g", "f"];
  const bon = cible === 0 ? fg : gf;
  const faux = cible === 0 ? gf : fg;
  const ev = (p: { a2: number; a1: number; a0: number }) => (x: number) => p.a2 * x * x + p.a1 * x + p.a0;
  const x0 = [1, 2, -1].find((x) => ev(bon)(x) !== ev(faux)(x)) ?? 1;
  const copie2 = cible === 0 ? `=${m}(x^2${c > 0 ? "+" : ""}${c})${q > 0 ? "+" : ""}${q}` : `=(${gL})^2${c > 0 ? "+" : ""}${c}`;
  const bonL = polynomeL(bon.a2, bon.a1, bon.a0);
  const fauxL = polynomeL(faux.a2, faux.a1, faux.a0);
  const gx0 = m * x0 + q;
  const fx0 = x0 * x0 + c;
  const lignesC: LigneCalcul[] =
    cible === 0
      ? [ligne("(f\\circ g)(x)=f\\big(g(x)\\big)", "g d'abord, puis f"), ligne(`=(${gL})^2${c > 0 ? "+" : ""}${c}`, "on remplace x par g(x) dans f"), ligne(`=${polynomeL(m * m, 2 * m * q, q * q)}${c > 0 ? "+" : ""}${c}`, "on développe le carré"), ligne(`=${bonL}`, "on réduit")]
      : [ligne("(g\\circ f)(x)=g\\big(f(x)\\big)", "f d'abord, puis g"), ligne(`=${m}(x^2${c > 0 ? "+" : ""}${c})${q > 0 ? "+" : ""}${q}`, "on remplace x par f(x) dans g"), ligne(`=${m}x^2${m * c > 0 ? "+" : ""}${m * c}${q > 0 ? "+" : ""}${q}`, "on distribue"), ligne(`=${bonL}`, "on réduit")];
  return {
    enonce: [t("Avec "), l(`f(x)=${fL}`), t(" et "), l(`g(x)=${gL}`), t(", calculer "), l(`(${A}\\circ ${B})(x)`), t(".")],
    lignes: [[l(`(${A}\\circ ${B})(x)=${B}\\big(${A}(x)\\big)`)], [l(copie2)], [l(`=${fauxL}`)]],
    ligneFausse: 0,
    regles: ["définition de la composée", `on remplace x par ${A}(x)`, "on développe et on réduit"],
    regleCours: { texte: [t("Une composée se lit de droite à gauche : la fonction écrite à droite du rond s'applique d'abord :")], latex: `(${A}\\circ ${B})(x)=${A}\\big(${B}(x)\\big)` },
    aideCorrection: { texte: [t("Reprends dès la ligne 1 : remplace x par "), l(`${B}(x)=${B === "g" ? gL : fL}`), t(" dans "), l(`${A}(x)`), t(", puis développe et réduis.")] },
    valeur: { genre: "expression", label: `(${A}∘${B})(x)`, labelLatex: `(${A}\\circ ${B})(x)=`, placeholder: "ex. : 4x² − 12x + 10", fonction: ev(bon), latex: `(${A}\\circ ${B})(x)=${bonL}` },
    copieFonction: ev(faux),
    piege: [t("C'est le résultat de la copie : il correspond à "), l(`(${B}\\circ ${A})(x)`), t(", l'autre ordre.")],
    corrigeA: {
      utilise: [t("On compare la ligne 1 à la définition, puis on teste la valeur "), l(`x=${x0}`), t(".")],
      lignes:
        cible === 0
          ? [ligne(`g(${x0})=${gx0}`), ligne(`f(${gx0})=${parN(gx0)}^2${c > 0 ? "+" : ""}${c}`, `donc (f∘g)(${nb(x0)}) = f(${nb(gx0)})`), ligne(`=${gx0 * gx0 + c}`), ligne(`${ev(faux)(x0)}\\neq ${gx0 * gx0 + c}`, "la copie trouve une autre valeur")]
          : [ligne(`f(${x0})=${fx0}`), ligne(`g(${fx0})=${m}\\times ${fx0}${q > 0 ? "+" : ""}${q}`, `donc (g∘f)(${nb(x0)}) = g(${nb(fx0)})`), ligne(`=${m * fx0 + q}`), ligne(`${ev(faux)(x0)}\\neq ${m * fx0 + q}`, "la copie trouve une autre valeur")],
    },
    corrigeB: {
      utilise: [t("Définition de la composée (cours, § 2) : "), l(`(${A}\\circ ${B})(x)=${A}\\big(${B}(x)\\big)`), t(", on applique d'abord "), l(B), t(".")],
      lignes: [ligne(`(${A}\\circ ${B})(${x0})=${A}\\big(${B}(${x0})\\big)`, `${B} reçoit ${nb(x0)} en premier`)],
    },
    corrigeC: { utilise: [t("On reprend dès la ligne 1 avec le bon ordre.")], lignes: lignesC, verification: { utilise: [t("Vérification en "), l(`x=${x0}`), t(" avec l'expression trouvée :")], lignes: [ligne(`(${A}\\circ ${B})(${x0})=${ev(bon)(x0)}`, "même valeur qu'à l'étape a")] } },
  };
}

function copieP(e: E): CopieDetective {
  const { m, q, c, a } = e.d;
  const fa = m * a + q;
  const res = fa * fa - c;
  return {
    enonce: [t("Avec "), l(`f(x)=${lin(m, q)}`), t(" et "), l(`g(x)=x^2-${c}`), t(" (g est définie sur "), l("\\mathbb{R}"), t(" ; son graphe n'est tracé que pour "), l("-4\\leq x\\leq 4"), t("), calculer "), l(`(g\\circ f)(${a})`), t(".")],
    lignes: [[l(`(g\\circ f)(${a})=g\\big(f(${a})\\big)`)], [l(`f(${a})=${m}\\times ${parN(a)}${q > 0 ? "+" : ""}${q === 0 ? "" : q}=${fa}`)], [l(`${fa}`), t(" sort de la portion tracée du graphe de g")], [t("donc "), l(`(g\\circ f)(${a})`), t(" n'existe pas")]],
    ligneFausse: 3,
    regles: ["définition de la composée", "on calcule la valeur intermédiaire", "on situe cette valeur sur le graphe de g", "on conclut"],
    regleCours: { texte: [t("Une composée n'existe pas seulement si la valeur intermédiaire sort du domaine de la seconde fonction ; hors de la portion tracée, elle existe mais ne se lit pas :")], latex: `(g\\circ f)(a)\\text{ existe}\\iff f(a)\\in\\operatorname{dom}g` },
    aideCorrection: { texte: [t("Reprends à la ligne 4 : "), l("g"), t(" est définie sur "), l("\\mathbb{R}"), t(", calcule "), l(`g(${fa})`), t(" avec sa formule.")] },
    valeur: { genre: "nombre", label: `(g∘f)(${a})`, labelLatex: `(g\\circ f)(${a})=`, placeholder: "ex. : 46", nombre: res, latex: `(g\\circ f)(${a})=${res}` },
    piege: [t("La valeur existe : "), l(`${fa}\\in\\mathbb{R}=\\operatorname{dom}g`), t(". Calcule-la avec la formule de "), l("g"), t(".")],
    corrigeA: {
      utilise: [t("On compare la valeur intermédiaire au domaine de "), l("g"), t(" (pas à la portion tracée).")],
      lignes: [ligne(`${fa}\\in\\operatorname{dom}g`, "dom g = ℝ : la ligne 4 est fausse")],
    },
    corrigeB: {
      utilise: [t("Hors de la portion tracée, la valeur existe mais ne se lit pas ; « n'existe pas » seulement hors du domaine (cours, § 4).")],
      lignes: [ligne("\\operatorname{dom}g=\\mathbb{R}", "g(x) = x² − " + c + " se calcule pour tout x")],
    },
    corrigeC: {
      utilise: [t("On reprend à la ligne 4 : on applique "), l("g"), t(" à la valeur intermédiaire, avec sa formule.")],
      lignes: [ligne(`g(${fa})=${parN(fa)}^2-${c}`, `on remplace x par ${nb(fa)}`), ligne(`=${fa * fa}-${c}`), ligne(`=${res}`)],
    },
  };
}

export function copie(e: E): CopieDetective {
  switch (e.scenario) {
    case "S":
      return copieS(e);
    case "T":
      return copieT(e);
    case "U":
      return copieU(e);
    case "C1":
      return copieC1(e);
    case "C2":
      return copieC2(e);
    case "O":
      return copieO(e);
    case "P":
      return copieP(e);
  }
}

