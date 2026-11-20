import type { ExerciceInequationTrigo, IntervalleX, Symbole, ValeurExacte } from "../core5e/inequationsTrigo";
import { arccosPi, arcsinPi, estStrict, estSup } from "../core5e/inequationsTrigo";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { piL, q, qL, qMul, qSub, qVal } from "./nombresTrigo";
import type { Q } from "./nombresTrigo";

/**
 * Couche C — textes de `5gen55` « Inéquations trigonométriques » : consignes, champs, aides,
 * réponses, écritures exactes (intervalles, familles). Source unique de l'écran, du récapitulatif,
 * du corrigé et du papier.
 */

type E = ExerciceInequationTrigo;
export type PhaseInequation = "isoler" | "arc" | "retour" | "intervalles" | "conclusion";

export function phases(e: E): PhaseInequation[] {
  return e.cas ? ["isoler", "conclusion"] : ["isoler", "arc", "retour", "intervalles"];
}

// ============================================================================
// Écritures.
// ============================================================================

export const SYMBOLE_L: Record<Symbole, string> = { ge: "\\geq", gt: ">", le: "\\leq", lt: "<" };
export const SYMBOLES_ECRAN = (["ge", "gt", "le", "lt"] as Symbole[]).map((id) => ({ id, latex: SYMBOLE_L[id] }));

export function valeurL(v: ValeurExacte): string {
  if (v.rad === 1) return qL(v.num);
  const s = v.num.n < 0 ? "-" : "";
  const n = Math.abs(v.num.n);
  const r = `\\sqrt{${v.rad}}`;
  if (v.num.d === 1) return `${s}${n === 1 ? "" : n}${r}`;
  return `${s}\\dfrac{${n === 1 ? "" : n}${r}}{${v.num.d}}`;
}

/** Argument u = ax + b. */
export function argL(e: E): string {
  const b = qVal(e.bPi) === 0 ? "" : e.bPi.n < 0 ? piL(e.bPi) : `+${piL(e.bPi)}`;
  return `${e.a}x${b}`;
}

const trigL = (e: E, arg: string) => `\\${e.fonction}\\left(${arg}\\right)`;
const trigUL = (e: E) => `\\${e.fonction} u`;

/** Membre de gauche affiché : k·trig(u) + d (u écrit en x, ou la lettre u). */
export function gaucheL(e: E, avecU = false): string {
  const t = avecU ? trigUL(e) : trigL(e, argL(e));
  const k = e.k === 1 ? "" : e.k === -1 ? "-" : `${e.k}`;
  const d = qVal(e.d) === 0 ? "" : e.d.n < 0 ? qL(e.d) : `+${qL(e.d)}`;
  return `${k}${t}${d}`;
}

export function enonceL(e: E, avecU = false): string {
  return `${gaucheL(e, avecU)}${SYMBOLE_L[e.symboleAffiche]}${valeurL(e.e)}`;
}

export function isoleL(e: E): string {
  return `${trigUL(e)}${SYMBOLE_L[e.symbole]}${valeurL(e.m)}`;
}

export const FENETRE_L = "[0\\,;\\,2\\pi\\mathclose{[}";

/** Intervalle « [a ; b] » (crochets ouvrants / fermants KaTeX corrects). */
export function intervalleL(o: "[" | "]", g: string, d: string, f: "[" | "]"): string {
  return `${o === "[" ? "[" : "\\mathopen{]}"}${g}\\,;\\,${d}${f === "]" ? "]" : "\\mathclose{[}"}`;
}

/** « kπ », « \dfrac{2k\pi}{3} ». */
export function kPeriodeL(p: Q): string {
  const num = p.n === 1 ? "k\\pi" : `${p.n}k\\pi`;
  return p.d === 1 ? num : `\\dfrac{${num}}{${p.d}}`;
}

function crochets(e: E): ["[" | "]", "[" | "]"] {
  return estStrict(e.symbole) ? ["]", "["] : ["[", "]"];
}

export function arcL(e: E): string {
  const [o, f] = crochets(e);
  return `u\\in${intervalleL(o, piL(e.arcU![0]), piL(e.arcU![1]), f)}+2k\\pi`;
}

export function familleL(e: E): string {
  const [o, f] = crochets(e);
  return `x\\in${intervalleL(o, piL(e.xg!), piL(e.xd!), f)}+${kPeriodeL(e.periode)}`;
}

export function intervalleXL(iv: IntervalleX): string {
  return intervalleL(iv.o, piL(iv.g), piL(iv.d), iv.f);
}

export function ensembleL(e: E): string {
  if (e.cas === "toujoursVraie") return `S=${FENETRE_L}`;
  if (e.cas === "toujoursFausse") return "S=\\varnothing";
  return `S=${e.intervalles.map(intervalleXL).join("\\cup ")}`;
}

/** Angle remarquable de l'arc : α = arcsin m (sin) ou β, angle de [0 ; π] de cosinus m (cos). */
export function angleRefPi(e: E): Q {
  return e.fonction === "sin" ? arcsinPi(e.m) : arccosPi(e.m);
}

// ============================================================================
// Écrans.
// ============================================================================

export function consigneGenerale(e: E): Frag[] {
  return [tx("Résous dans "), lx(FENETRE_L), tx(" l'inéquation "), lx(enonceL(e)), tx(".")];
}

export function libelle(_e: E, phase: PhaseInequation): string {
  switch (phase) {
    case "isoler":
      return "Inéquation en u";
    case "arc":
      return "Arc du cercle";
    case "retour":
      return "Retour à x";
    case "intervalles":
      return "Solutions";
    case "conclusion":
      return "Conclusion";
  }
}

export function consigne(e: E, phase: PhaseInequation): Frag[] {
  const fn = e.fonction === "sin" ? "le sinus" : "le cosinus";
  switch (phase) {
    case "isoler":
      return [tx("Pose "), lx(`u=${argL(e)}`), tx(` et isole ${fn} : choisis le symbole et donne le nombre `), lx("m"), tx(" pour écrire l'inéquation sous la forme "), lx(`${trigUL(e)}\\;\\square\\; m`), tx(".")];
    case "arc":
      return [tx("Lis l'arc solution sur le cercle : donne ses bornes "), lx("u_1"), tx(" et "), lx("u_2"), tx(" (avec "), lx("u_1<u_2"), tx(") pour que les solutions soient "), lx(`u\\in[u_1\\,;\\,u_2]+2k\\pi`), tx(" (crochets selon l'inégalité).")];
    case "retour":
      return [tx("Reviens à "), lx("x"), tx(" : l'arc "), lx(arcL(e)), tx(" donne "), lx(`x\\in[x_1\\,;\\,x_2]+k\\,p`), tx(". Donne "), lx("x_1"), tx(", "), lx("x_2"), tx(" et la période "), lx("p"), tx(".")];
    case "intervalles":
      return [tx("Donne l'ensemble des solutions dans "), lx(FENETRE_L), tx(" à partir de "), lx(familleL(e)), tx(" : un intervalle par ligne, avec ses crochets.")];
    case "conclusion":
      return [tx("Que peux-tu conclure ?")];
  }
}

export function champs(_e: E, phase: PhaseInequation): ChampEcran[] {
  switch (phase) {
    case "isoler":
      return [{ label: "m", labelLatex: "m =", placeholder: "ex. : 1/2 ou −√3/2" }];
    case "arc":
      return [
        { label: "u₁", labelLatex: "u_1 =", placeholder: "ex. : π/6" },
        { label: "u₂", labelLatex: "u_2 =", placeholder: "ex. : 5π/6" },
      ];
    case "retour":
      return [
        { label: "x₁", labelLatex: "x_1 =", placeholder: "ex. : π/4" },
        { label: "x₂", labelLatex: "x_2 =", placeholder: "ex. : 7π/12" },
        { label: "p", labelLatex: "p =", placeholder: "ex. : π" },
      ];
    default:
      return [];
  }
}

export function optionsConclusion(): OptionEcran[] {
  return [
    { id: "vraie", fragments: [tx("L'inéquation est toujours vraie : "), lx(`S=${FENETRE_L}`)] },
    { id: "fausse", fragments: [tx("L'inéquation n'a aucune solution : "), lx("S=\\varnothing")] },
    { id: "arc", fragments: [tx("Il faut lire un arc sur le cercle trigonométrique.")] },
  ];
}

// ============================================================================
// Aides.
// ============================================================================

export function aide1(e: E, phase: PhaseInequation): AideEcran {
  switch (phase) {
    case "isoler":
      return { texte: [tx("Isole comme dans une équation : retranche la constante, puis divise par le coefficient. Diviser par un nombre négatif change le sens de l'inégalité :")], latex: "-2\\sin u\\geq 1\\iff \\sin u\\leq -\\dfrac{1}{2}" };
    case "arc":
      if (e.fonction === "sin")
        return {
          texte: [tx("Le sinus est l'ordonnée du point du cercle : trace la droite horizontale "), lx("\\sin u=m"), tx(". L'arc solution est au-dessus (pour ≥) ou au-dessous (pour ≤), parcouru dans le sens trigonométrique (cours, § 8) :")],
          latex: "\\sin u\\geq m\\iff u\\in[\\arcsin m\\,;\\,\\pi-\\arcsin m]+2k\\pi",
        };
      return {
        texte: [tx("Le cosinus est l'abscisse du point du cercle : trace la droite verticale "), lx("\\cos u=m"), tx(". L'arc solution est à droite (pour ≥) ou à gauche (pour ≤) ; si "), lx("\\beta"), tx(" est l'angle de "), lx("[0\\,;\\,\\pi]"), tx(" de cosinus "), lx("m"), tx(" :")],
        latex: "\\cos u\\geq m\\iff u\\in[-\\beta\\,;\\,\\beta]+2k\\pi",
      };
    case "retour":
      return { texte: [tx("Pour chaque borne, résous "), lx("ax+b=\\text{borne}+2k\\pi"), tx(" : retranche "), lx("b"), tx(", puis divise chaque terme par "), lx("a"), tx(", la période aussi :")], latex: "x=\\dfrac{u-b}{a}+k\\,\\dfrac{2\\pi}{a}" };
    case "intervalles":
      return { texte: [tx("Donne à "), lx("k"), tx(" les valeurs entières 0, 1, 2… et −1, −2… ; garde les intervalles qui rencontrent "), lx(FENETRE_L), tx(", et coupe en 0 et en "), lx("2\\pi"), tx(" ceux qui dépassent ("), lx("2\\pi"), tx(" est exclu).")] };
    case "conclusion":
      return { texte: [tx("Un sinus et un cosinus sont toujours compris entre "), lx("-1"), tx(" et "), lx("1"), tx(" : compare "), lx("m"), tx(" à ces bornes.")] };
  }
}

export function aide2(e: E, phase: PhaseInequation): AideEcran | null {
  switch (phase) {
    case "isoler": {
      const t: Frag[] = [tx("Ici, avec "), lx(`u=${argL(e)}`), tx(" :")];
      if (e.k < 0) t.push(tx(" tu divises par "), lx(`${e.k}`), tx(", un nombre négatif."));
      return { texte: t, latex: enonceL(e, true) };
    }
    case "arc": {
      const ref = angleRefPi(e);
      if (e.fonction === "sin")
        return {
          texte: [tx("Ici, la droite horizontale "), lx(`\\sin u=${valeurL(e.m)}`), tx(" coupe le cercle en "), lx("\\alpha"), tx(" et "), lx("\\pi-\\alpha"), tx(", avec "), lx("\\alpha"), tx(" dans "), lx("\\left[-\\dfrac{\\pi}{2}\\,;\\dfrac{\\pi}{2}\\right]"), tx(estSup(e.symbole) ? ". Garde l'arc du haut." : ". Garde l'arc du bas : sa borne droite est 2π + α.")],
          latex: `\\sin\\alpha=${valeurL(e.m)}`,
        };
      void ref;
      return {
        texte: [tx("Ici, la droite verticale "), lx(`\\cos u=${valeurL(e.m)}`), tx(" coupe le cercle en "), lx("\\beta"), tx(" et "), lx("-\\beta"), tx(", avec "), lx("\\beta"), tx(" dans "), lx("[0\\,;\\,\\pi]"), tx(estSup(e.symbole) ? ". Garde l'arc de droite, de −β à β." : ". Garde l'arc de gauche, de β à 2π − β.")],
        latex: `\\cos\\beta=${valeurL(e.m)}`,
      };
    }
    case "retour":
      return { texte: [tx("Ici, pour les deux bornes de l'arc :")], latex: `${argL(e)}=${plus2k(piL(e.arcU![0]))}\\qquad ${argL(e)}=${plus2k(piL(e.arcU![1]))}` };
    case "intervalles": {
      const [o, f] = crochets(e);
      return { texte: [tx("Ici, la période vaut "), lx(piL(e.periode)), tx(" : écris les intervalles pour k = −1, 0, 1, 2… et ne garde que ce qui tombe dans "), lx(FENETRE_L), tx(" :")], latex: `${intervalleL(o, `${piL(e.xg!)}+${kPeriodeL(e.periode)}`, `${piL(e.xd!)}+${kPeriodeL(e.periode)}`, f)}` };
    }
    case "conclusion":
      return null;
  }
}

export function messageIllisible(_e: E, phase: PhaseInequation): string {
  if (phase === "isoler") return "Nombre non reconnu : écris une valeur comme 1/2, −√3/2 ou 0,87. Cette saisie ne compte pas comme une tentative.";
  return "Angle non reconnu : écris un angle en radians comme π/6, −5π/12 ou 2π/3 (« π » ou « pi »). Cette saisie ne compte pas comme une tentative.";
}

// ============================================================================
// Réponses.
// ============================================================================

export function reponse(e: E, phase: PhaseInequation): Frag[] {
  switch (phase) {
    case "isoler":
      return [lx(isoleL(e)), tx(" avec "), lx(`u=${argL(e)}`)];
    case "arc":
      return [lx(arcL(e))];
    case "retour":
      return [lx(`x_1=${piL(e.xg!)}`), tx(" ; "), lx(`x_2=${piL(e.xd!)}`), tx(" ; "), lx(`p=${piL(e.periode)}`), tx(", d'où "), lx(familleL(e))];
    case "intervalles":
      return [lx(ensembleL(e))];
    case "conclusion":
      return [tx(e.cas === "toujoursVraie" ? "L'inéquation est toujours vraie : " : "L'inéquation n'a aucune solution : "), lx(ensembleL(e))];
  }
}

export function recap(e: E, phase: PhaseInequation): Frag[] {
  if (phase === "retour") return [lx(familleL(e))];
  return reponse(e, phase);
}

export function explicationChoix(e: E): string {
  const borne = e.cas === "toujoursVraie" ? "tous les nombres u vérifient l'inégalité" : "aucun nombre u ne vérifie l'inégalité";
  return `Comme m sort de [−1 ; 1], ${borne} : pas d'arc à lire.`;
}

/** « α + 2kπ », mais « 2kπ » seul quand α vaut 0. */
function plus2k(a: string): string {
  return a === "0" ? "2k\\pi" : `${a}+2k\\pi`;
}

/** Valeur de x d'un multiple de π (contrôles). */
export const valPi = (a: Q) => qVal(a) * Math.PI;
export { q, qMul, qSub };
