import type { AideEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ConditionCP, ExerciceCP, IdentiteCP, PartieCP, PhaseCP } from "../core6e/courbeParametree";
import { extremites, identite, intervalleT, phases, point } from "../core6e/courbeParametree";
import type { Poly, Pt, SpecFigure } from "./outilsLieuxLotH2";
import { carreL, cercleReduitL, COULEURS, equationPolyL, fenetreLieu, figureRepere, l, listeL, nL, normaliserPoly, t } from "./outilsLieuxLotH2";
import { aReprendre, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationCourbeParametree";
import { correctionDetailleeCP } from "../generateurs6e/courbeParametree/corrigeDetaille";

/**
 * Couche C — textes de `6gen129` « Courbe paramétrée : élimination et restriction » : énoncé (système
 * paramétrique et intervalle de t), consignes, options, aides à deux niveaux, réponses, figure. Source
 * unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceCP;

export const CONSIGNE_GLOBALE = "Élimine le paramètre t pour obtenir une équation cartésienne de la courbe, puis précise la partie de cette courbe réellement décrite par M.";

// ---------------------------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------------------------

/** « 2+3\cos t », « -\cos t », « 3t^2 ». */
export function affineL(constante: number, coef: number, fn: string): string {
  const abs = Math.abs(coef);
  const c = abs === 1 ? "" : nL(abs);
  if (constante === 0) return `${coef < 0 ? "-" : ""}${c}${fn}`;
  return `${nL(constante)}${coef < 0 ? "-" : "+"}${c}${fn}`;
}

export function systemeL(e: E): string {
  let x: string, y: string;
  switch (e.variante) {
    case "cercle":
      x = affineL(e.a, e.r, "\\cos t");
      y = affineL(e.b, e.r, "\\sin t");
      break;
    case "astroide":
      x = affineL(0, e.r, "\\cos^3 t");
      y = affineL(0, e.r, "\\sin^3 t");
      break;
    case "parabole":
      if (e.partie === "entiere") [x, y] = [affineL(e.p, 1, "t"), affineL(e.q, e.k, "t^2")];
      else if (e.partie === "moitie") [x, y] = [affineL(e.p, e.s, "t^2"), affineL(e.q, e.k, "t^4")];
      else [x, y] = [affineL(e.p, 1, "\\cos t"), affineL(e.q, e.k, "\\cos(2t)")];
      break;
    case "droite":
      if (e.partie === "entiere") [x, y] = [affineL(e.p, e.u, "t"), affineL(e.q, e.v, "t")];
      else if (e.partie === "moitie") [x, y] = [affineL(e.p, e.u, "t^2"), affineL(e.q, e.v, "t^2")];
      else [x, y] = [affineL(e.p, e.u, "\\cos^2 t"), affineL(e.q, e.v, "\\sin^2 t")];
      break;
  }
  return `\\begin{cases}x=${x}\\\\y=${y}\\end{cases}`;
}

const PI_L = ["0", "\\dfrac{\\pi}{2}", "\\pi", "\\dfrac{3\\pi}{2}", "2\\pi"];
export function intervalleL(e: E): string {
  const it = intervalleT(e);
  if (!it) return "t\\in\\mathbb{R}";
  if (e.partie === "entiere") return "t\\in[0\\,;2\\pi\\mathclose{[}";
  if (e.partie === "moitie") return e.indice === 3 ? "t\\in\\left[-\\dfrac{\\pi}{2}\\,;\\dfrac{\\pi}{2}\\right]" : `t\\in\\left[${PI_L[e.indice]}\\,;${PI_L[e.indice + 2]}\\right]`;
  return `t\\in\\left[${PI_L[e.indice]}\\,;${PI_L[e.indice + 1]}\\right]`;
}

export function consigneGenerale(e: E): Frag[] {
  return [t("Dans un repère orthonormé, un point "), l("M"), t(" se déplace selon la représentation paramétrique "), l(systemeL(e)), t(", avec "), l(intervalleL(e)), t(".")];
}

/** Équation cartésienne attendue (forme réduite du cours). */
export function equationL(e: E): string {
  switch (e.variante) {
    case "cercle":
      return cercleReduitL({ x: e.a, y: e.b }, e.r * e.r);
    case "astroide":
      return `x^{2/3}+y^{2/3}=${Math.round(Math.cbrt(e.r) ** 2)}`;
    case "parabole": {
      const k = e.partie === "arc" ? 2 * e.k : e.k;
      const c = e.partie === "arc" ? e.q - e.k : e.q;
      const coef = k === 1 ? "" : k === -1 ? "-" : nL(k);
      return `y=${coef}${carreL("x", e.p)}${c === 0 ? "" : c > 0 ? `+${nL(c)}` : `-${nL(-c)}`}`;
    }
    case "droite":
      return equationPolyL(normaliserPoly(polyDroiteCP(e)));
  }
}

export function polyDroiteCP(e: E): Poly {
  return e.partie === "arc" ? { x: e.v, y: e.u, "1": -e.v * e.p - e.u * e.q - e.u * e.v } : { x: e.v, y: -e.u, "1": -e.v * e.p + e.u * e.q };
}

export const NOMS_COURBE: Record<E["variante"], string> = { cercle: "le cercle", astroide: "l'astroïde", parabole: "la parabole", droite: "la droite" };

export function natureCourbe(e: E): Frag[] {
  if (e.variante === "cercle") return [t("le cercle de centre "), l(`(${nL(e.a)}\\,;${nL(e.b)})`), t(" et de rayon "), l(nL(e.r))];
  if (e.variante === "parabole") return [t("la parabole de sommet "), l(`(${nL(e.p)}\\,;${nL(e.partie === "arc" ? e.q - e.k : e.q)})`)];
  return [t(NOMS_COURBE[e.variante])];
}

export const LIBELLES_PARTIE: Record<E["variante"], Record<PartieCP, string>> = {
  cercle: { entiere: "Le cercle entier", moitie: "Un demi-cercle", arc: "Un quart de cercle" },
  astroide: { entiere: "L'astroïde entière", moitie: "Une moitié de l'astroïde", arc: "Un quart de l'astroïde" },
  parabole: { entiere: "La parabole entière", moitie: "Une demi-parabole (d'un seul côté de l'axe)", arc: "Un arc de parabole (une portion bornée)" },
  droite: { entiere: "La droite entière", moitie: "Une demi-droite", arc: "Un segment" },
};

export const LIBELLES_IDENTITE: Record<IdentiteCP, { texte: string; latex?: string }> = {
  pythagore: { texte: "Utiliser ", latex: "\\cos^2 t+\\sin^2 t=1" },
  duplication: { texte: "Utiliser ", latex: "\\cos(2t)=2\\cos^2 t-1" },
  isoler: { texte: "Isoler le paramètre (ou son carré) dans une équation et le remplacer dans l'autre" },
  tangente: { texte: "Utiliser ", latex: "\\tan t=\\dfrac{\\sin t}{\\cos t}" },
};
const ORDRE_IDENTITES: IdentiteCP[] = ["pythagore", "duplication", "isoler", "tangente"];
const fragsIdentite = (id: IdentiteCP): Frag[] => {
  const x = LIBELLES_IDENTITE[id];
  return x.latex ? [t(x.texte), l(x.latex)] : [t(x.texte)];
};

/** Les quatre conditions du support (une seule juste). */
export function conditions(e: E): ConditionCP[] {
  if (e.variante === "cercle" || e.variante === "astroide") {
    const cx = nL(e.variante === "cercle" ? e.a : 0);
    const cy = nL(e.variante === "cercle" ? e.b : 0);
    if (e.partie === "arc")
      return [
        { id: "q0", latex: `x\\geq ${cx}\\ \\text{et}\\ y\\geq ${cy}` },
        { id: "q1", latex: `x\\leq ${cx}\\ \\text{et}\\ y\\geq ${cy}` },
        { id: "q2", latex: `x\\leq ${cx}\\ \\text{et}\\ y\\leq ${cy}` },
        { id: "q3", latex: `x\\geq ${cx}\\ \\text{et}\\ y\\leq ${cy}` },
      ];
    return [
      { id: "q0", latex: `y\\geq ${cy}` },
      { id: "q1", latex: `x\\leq ${cx}` },
      { id: "q2", latex: `y\\leq ${cy}` },
      { id: "q3", latex: `x\\geq ${cx}` },
    ];
  }
  if (e.variante === "parabole")
    return [
      { id: "plus", latex: `x\\geq ${nL(e.p)}` },
      { id: "moins", latex: `x\\leq ${nL(e.p)}` },
      { id: "borne", latex: `${nL(e.p - 1)}\\leq x\\leq ${nL(e.p + 1)}` },
      { id: "demiBorne", latex: `${nL(e.p)}\\leq x\\leq ${nL(e.p + 1)}` },
    ];
  return [
    { id: "plus", latex: `x\\geq ${nL(e.p)}` },
    { id: "moins", latex: `x\\leq ${nL(e.p)}` },
    { id: "borne", latex: `${nL(Math.min(e.p, e.p + e.u))}\\leq x\\leq ${nL(Math.max(e.p, e.p + e.u))}` },
    { id: "large", latex: `${nL(e.p - Math.abs(e.u))}\\leq x\\leq ${nL(e.p + Math.abs(e.u))}` },
  ];
}

export function bonneCondition(e: E): string {
  if (e.variante === "cercle" || e.variante === "astroide") return `q${e.indice}`;
  if (e.partie === "arc") return "borne";
  const signe = e.variante === "parabole" ? e.s : Math.sign(e.u);
  return signe > 0 ? "plus" : "moins";
}
export const conditionJusteL = (e: E): string => conditions(e).find((c) => c.id === bonneCondition(e))!.latex;

export function reponse(e: E, p: PhaseCP): Frag[] {
  if (p === "identite") return fragsIdentite(identite(e));
  if (p === "equation") return [l(equationL(e)), t(" : "), ...natureCourbe(e)];
  if (p === "partie") return [t(LIBELLES_PARTIE[e.variante][e.partie])];
  return [l(conditionJusteL(e))];
}

export function libelle(_e: E, p: PhaseCP): string {
  return { identite: "Élimination", equation: "Équation cartésienne", partie: "Partie décrite", condition: "Condition" }[p];
}

export function consigne(_e: E, p: PhaseCP): Frag[] {
  if (p === "identite") return [t("Comment éliminer le paramètre "), l("t"), t(" ?")];
  if (p === "equation") return [t("Donne une équation cartésienne de la courbe sur laquelle se déplace "), l("M"), t(".")];
  if (p === "partie") return [t("Quand "), l("t"), t(" parcourt son intervalle, quelle partie de cette courbe "), l("M"), t(" décrit-il ?")];
  return [t("Quelle condition décrit cette partie de la courbe ?")];
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

/** (v − c)/k écrit sans dénominateur négatif : « \dfrac{x-3}{2} », « \dfrac{3-x}{2} », « -\dfrac{x}{2} », « x-3 ». */
export function fracL(v: string, c: number, k: number): string {
  const absK = Math.abs(k);
  let num: string;
  let signe = "";
  if (k > 0) num = c === 0 ? v : `${v}${c > 0 ? "-" : "+"}${nL(Math.abs(c))}`;
  else if (c === 0) {
    num = v;
    signe = "-";
  } else if (c > 0) num = `${nL(c)}-${v}`;
  else {
    num = `${v}+${nL(-c)}`;
    signe = "-";
  }
  return absK === 1 ? (signe ? `-(${num})`.replace(/^-\(([a-z])\)$/, "-$1") : num) : `${signe}\\dfrac{${num}}{${nL(absK)}}`;
}

export function premiereLigneL(e: E): string {
  switch (e.variante) {
    case "cercle":
      return `\\cos t=\\dfrac{${affineL(0, 1, "x")}${e.a ? (e.a > 0 ? `-${nL(e.a)}` : `+${nL(-e.a)}`) : ""}}{${nL(e.r)}}\\quad\\text{et}\\quad\\sin t=\\dfrac{y${e.b ? (e.b > 0 ? `-${nL(e.b)}` : `+${nL(-e.b)}`) : ""}}{${nL(e.r)}}`.replace(/\\dfrac\{([^{}]*)\}\{1\}/g, "$1");
    case "astroide":
      return e.r === 1 ? "\\cos t=\\sqrt[3]{x}\\quad\\text{et}\\quad\\sin t=\\sqrt[3]{y}" : `\\cos t=\\sqrt[3]{\\dfrac{x}{${e.r}}}\\quad\\text{et}\\quad\\sin t=\\sqrt[3]{\\dfrac{y}{${e.r}}}`;
    case "parabole":
      if (e.partie === "entiere") return `t=x${e.p ? (e.p > 0 ? `-${nL(e.p)}` : `+${nL(-e.p)}`) : ""}`;
      if (e.partie === "moitie") return `t^2=${e.s > 0 ? "" : "-("}x${e.p ? (e.p > 0 ? `-${nL(e.p)}` : `+${nL(-e.p)}`) : ""}${e.s > 0 ? "" : ")"}`;
      return `\\cos t=x${e.p ? (e.p > 0 ? `-${nL(e.p)}` : `+${nL(-e.p)}`) : ""}`;
    case "droite": {
      const v = e.partie === "entiere" ? "t" : e.partie === "moitie" ? "t^2" : "\\cos^2 t";
      return `${v}=${fracL("x", e.p, e.u)}`;
    }
  }
}

export function aide1(e: E, p: PhaseCP): AideEcran {
  if (p === "identite") return { texte: [t("Il faut une relation entre les expressions de "), l("x"), t(" et de "), l("y"), t(" qui ne contienne plus "), l("t"), t(" (cours, point 6).")] };
  if (p === "equation") {
    const id = identite(e);
    if (id === "isoler") return { texte: [t("Isole le paramètre (ou son carré) dans l'équation de "), l("x"), t(", puis remplace-le dans celle de "), l("y"), t(".")] };
    return { texte: [t("Identité à utiliser :")], latex: LIBELLES_IDENTITE[id].latex };
  }
  if (p === "partie") return { texte: [t("Le lieu complet est toute la courbe trouvée ; la partie décrite dépend des valeurs que prennent "), l("x"), t(" et "), l("y"), t(" quand "), l("t"), t(" parcourt son intervalle.")] };
  return { texte: [t("Traduis en "), l("x"), t(" (ou en "), l("y"), t(") les valeurs que prennent les expressions du paramètre sur l'intervalle.")] };
}

export function aide2(e: E, p: PhaseCP): AideEcran | null {
  if (p === "identite") {
    const x: Record<E["variante"], Frag[]> = {
      cercle: [l("x"), t(" contient "), l("\\cos t"), t(" et "), l("y"), t(" contient "), l("\\sin t"), t(", chacun au premier degré.")],
      astroide: [l("x"), t(" contient "), l("\\cos^3 t"), t(" et "), l("y"), t(" contient "), l("\\sin^3 t"), t(" : une racine cubique isole "), l("\\cos t"), t(" et "), l("\\sin t"), t(".")],
      parabole:
        e.partie === "arc"
          ? [l("x"), t(" contient "), l("\\cos t"), t(", mais "), l("y"), t(" contient "), l("\\cos(2t)"), t(".")]
          : e.partie === "moitie"
            ? [l("x"), t(" contient "), l("t^2"), t(" et "), l("y"), t(" contient "), l("t^4=\\left(t^2\\right)^2"), t(".")]
            : [l("x"), t(" contient "), l("t"), t(" au premier degré.")],
      droite:
        e.partie === "arc"
          ? [l("x"), t(" contient "), l("\\cos^2 t"), t(" et "), l("y"), t(" contient "), l("\\sin^2 t"), t(".")]
          : e.partie === "moitie"
            ? [l("x"), t(" et "), l("y"), t(" contiennent "), l("t^2"), t(".")]
            : [l("x"), t(" et "), l("y"), t(" contiennent "), l("t"), t(" au premier degré.")],
    };
    return { texte: x[e.variante] };
  }
  if (p === "equation") return { texte: [t("Commence par :")], latex: premiereLigneL(e) };
  if (p === "partie") {
    if (e.variante === "cercle" || e.variante === "astroide") return { texte: [t("Sur cet intervalle, quels signes prennent "), l("\\cos t"), t(" et "), l("\\sin t"), t(" ? Tous les couples sont-ils atteints ?")] };
    return { texte: [t("Quelles valeurs peut prendre "), l("x"), t(" quand "), l("t"), t(" parcourt "), l("\\mathbb{R}"), t(" ? Pense au signe d'un carré et aux bornes d'un cosinus.")] };
  }
  if (e.variante === "cercle" || e.variante === "astroide") return { texte: [t("Le signe de "), l(e.variante === "cercle" ? `x${e.a ? (e.a > 0 ? `-${nL(e.a)}` : `+${nL(-e.a)}`) : ""}` : "x"), t(" est celui de "), l("\\cos t"), t(", le signe de "), l(e.variante === "cercle" ? `y${e.b ? (e.b > 0 ? `-${nL(e.b)}` : `+${nL(-e.b)}`) : ""}` : "y"), t(" celui de "), l("\\sin t"), t(".")] };
  return { texte: [t("Écris "), l(`x${e.p ? (e.p > 0 ? `-${nL(e.p)}` : `+${nL(-e.p)}`) : ""}`), t(" à l'aide du paramètre et cherche toutes ses valeurs possibles.")] };
}

export function optionsIdentite(): OptionEcran[] {
  return ORDRE_IDENTITES.map((id) => ({ id, fragments: fragsIdentite(id) }));
}
export function optionsPartie(e: E): OptionEcran[] {
  return (["entiere", "moitie", "arc"] as const).map((id) => ({ id, fragments: [t(LIBELLES_PARTIE[e.variante][id])] }));
}
export function optionsCondition(e: E): OptionEcran[] {
  const c = conditions(e);
  return e.ordre.map((i) => ({ id: c[i]!.id, fragments: [l(c[i]!.latex)] }));
}

export function explicationChoix(e: E, p: PhaseCP): string {
  if (p === "identite") return identite(e) === "isoler" ? "Ici, le paramètre (ou son carré) s'isole directement." : "Ici, une identité trigonométrique relie les expressions de x et de y.";
  if (p === "partie") return `${LIBELLES_PARTIE[e.variante][e.partie]} : voir le corrigé.`;
  return "";
}

// ---------------------------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------------------------

function echantillon(e: E, t0: number, t1: number, n = 160): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => point(e, t0 + ((t1 - t0) * i) / n));
}

/** Points de la courbe COMPLÈTE (figure). */
function courbeComplete(e: E): Pt[] {
  if (e.variante === "cercle" || e.variante === "astroide") return echantillon(e, 0, 2 * Math.PI, 240);
  if (e.variante === "parabole") {
    const k = e.partie === "arc" ? 2 * e.k : e.k;
    const c = e.partie === "arc" ? e.q - e.k : e.q;
    return Array.from({ length: 161 }, (_, i) => {
      const x = e.p - 5 + (10 * i) / 160;
      return { x, y: k * (x - e.p) ** 2 + c };
    });
  }
  const d = e.partie === "arc" ? { x: e.u, y: -e.v } : { x: e.u, y: e.v };
  const o = e.partie === "arc" ? { x: e.p, y: e.q + e.v } : { x: e.p, y: e.q };
  return [-12, 12].map((s) => ({ x: o.x + s * d.x, y: o.y + s * d.y }));
}

function partieDecrite(e: E): Pt[] {
  const it = intervalleT(e);
  if (it) return echantillon(e, it[0], it[1]);
  if (e.variante === "parabole") return e.partie === "arc" ? echantillon(e, 0, Math.PI) : echantillon(e, -2.4, 2.4);
  return e.partie === "arc" ? echantillon(e, 0, Math.PI / 2, 4) : e.partie === "moitie" ? echantillon(e, 0, 4, 4) : echantillon(e, -12, 12, 4);
}

export function figureCP(e: E, final: boolean): string {
  const cadre: Pt[] = [];
  if (e.variante === "cercle") cadre.push({ x: e.a - e.r, y: e.b - e.r }, { x: e.a + e.r, y: e.b + e.r });
  else if (e.variante === "astroide") cadre.push({ x: -e.r, y: -e.r }, { x: e.r, y: e.r });
  else if (e.variante === "parabole") {
    const k = e.partie === "arc" ? 2 * e.k : e.k;
    const c = e.partie === "arc" ? e.q - e.k : e.q;
    cadre.push({ x: e.p - 3, y: c }, { x: e.p + 3, y: c + Math.sign(k) * Math.min(6, Math.abs(k) * 4) });
  } else cadre.push({ x: e.p - 4, y: e.q - 4 }, { x: e.p + 4, y: e.q + 4 }, ...extremites(e));
  const fen = fenetreLieu(cadre, e.variante === "astroide" && e.r === 1 ? 0.5 : 1, e.variante === "astroide" && e.r === 1 ? 3 : 8);
  const largeur = Math.max(fen.xMax - fen.xMin, fen.yMax - fen.yMin);
  const unite = Math.max(12, Math.min(40, Math.floor(300 / largeur)));
  const spec: SpecFigure = { fenetre: fen, unite, graduationsLisibles: true, courbes: [{ points: courbeComplete(e), couleur: final ? "#9aa1ab" : COULEURS.bleu }] };
  if (final) {
    spec.courbes!.push({ points: partieDecrite(e), couleur: COULEURS.accent });
    spec.points = extremites(e).map((m) => ({ P: m, couleur: COULEURS.accent }));
  }
  return figureRepere(spec);
}

export function figure(e: E, p: PhaseCP): string | null {
  return p === "partie" || p === "condition" ? figureCP(e, false) : null;
}

// ---------------------------------------------------------------------------------------------
// Définition
// ---------------------------------------------------------------------------------------------

export const recap = reponse;

/** `6gen129` : élimination (choix jugé), équation (champ), partie (choix jugé, verdict), condition
 * (choix jugé ; absente pour la courbe entière : quatre puces dans tous les cas). */
export const DEFINITION_CP: DefinitionEcrans<E, PhaseCP> = {
  phases,
  estChoix: (_e, p) => p !== "equation",
  mode: (e, p) => {
    if (p === "identite") return { type: "choix", options: optionsIdentite() };
    if (p === "partie") return { type: "choix", options: optionsPartie(e) };
    if (p === "condition") return { type: "choix", options: optionsCondition(e) };
    return { type: "champs", champs: [{ label: "Équation cartésienne", placeholder: "équation en x et y" }] };
  },
  libelle,
  consigneGenerale,
  figure,
  consigne,
  aReprendre,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e, p) => (p === "identite" ? identite(e) : p === "partie" ? e.partie : bonneCondition(e)),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeCP,
  apercuEnonce: (e) => [t("Représentation paramétrique de M, "), l(intervalleL(e))],
};

export { listeL };
