import type { Bout, ExerciceTableauLimites, Intrus, Situation } from "../core5e/tableauLimitesGraphique";
import { branches, LETTRES, lettreCorrecte } from "../core5e/tableauLimitesGraphique";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { fragmentsVersHtml } from "../../export/genererFeuilleExercicesHtml";
import type { AideEcran, ChampEcran, Frag, OptionEcran, TableauDonnees } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { cibleT, moinsDroiteL, polyL } from "./ecrituresLimitesLotG";
import type { SpecGraphe } from "./figureLimitesLotG";
import { grapheSvg, grilleGraphesSvg } from "./figureLimitesLotG";

/**
 * Couche C — textes, tableau et figures de `5gen66` « Du tableau de limites au graphique » :
 * tableau des limites (écran : `TableauDonnees` ; papier : HTML avec KaTeX), quatre graphiques
 * candidats dans UN SVG (lettres A–D), consignes, champs, aides, messages ciblés sur l'intrus choisi,
 * réponses. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceTableauLimites;
export type PhaseTableauLimites = "graphique" | "av" | "horiz";
export const PHASES: PhaseTableauLimites[] = ["graphique", "av", "horiz"];

// ============================================================================
// Écritures.
// ============================================================================

const infT = (s: number) => (s > 0 ? "+∞" : "−∞");
export const infL = (s: number) => (s > 0 ? "+\\infty" : "-\\infty");
const nbT = (v: number) => (v < 0 ? `−${-v}` : `${v}`);

/** Limite d'un bout en −∞ (cote −1) ou +∞ (cote 1). */
function limBoutT(b: Bout, cote: number): string {
  return b.type === "h" ? nbT(b.L) : infT(b.m * cote);
}
export function limBoutL(b: Bout, cote: number): string {
  return b.type === "h" ? `${b.L}` : infL(b.m * cote);
}
export const droiteL = (b: Bout): string => (b.type === "h" ? `y=${b.L}` : `y=${polyL([b.m, b.q])}`);

export const domaineL = (s: Situation): string => `\\mathbb{R}\\setminus\\{${s.av.join(";")}\\}`;
export const estOblique = (s: Situation): boolean => s.droite.type === "o";

/** Colonnes du tableau : (x, f(x) [, écart à l'oblique]). */
function colonnes(s: Situation): string[][] {
  const ob = estOblique(s);
  const col = (x: string, fx: string, ecart: string) => (ob ? [x, fx, ecart] : [x, fx]);
  const c: string[][] = [col("−∞", limBoutT(s.gauche, -1), "0")];
  s.av.forEach((p, i) => {
    c.push(col(cibleT({ type: "point", a: p, cote: "-" }), infT(s.cotes[i]![0]), ""));
    c.push(col(cibleT({ type: "point", a: p, cote: "+" }), infT(s.cotes[i]![1]), ""));
  });
  c.push(col("+∞", limBoutT(s.droite, 1), "0"));
  return c;
}

function entetes(s: Situation): Frag[][] {
  const base: Frag[][] = [[tx("x tend vers")], [lx("f(x)"), tx(" tend vers")]];
  if (estOblique(s) && s.droite.type === "o") base.push([lx(moinsDroiteL(s.droite.m, s.droite.q)), tx(" tend vers")]);
  return base;
}

export function tableau(e: E): TableauDonnees {
  return { entetes: entetes(e.sit), lignes: colonnes(e.sit), horizontal: true };
}

/** Tableau papier (KaTeX dans les en-têtes). */
export function tableauHtml(e: E): string {
  const cell = "border:1px solid #444;padding:3px 7px;text-align:center;font-size:13px;white-space:nowrap";
  const th = `${cell};background:#f2f2f2;font-weight:600;text-align:left`;
  const ent = entetes(e.sit);
  const cols = colonnes(e.sit);
  const corps = ent.map((h, i) => `<tr><th style="${th}">${fragmentsVersHtml(h as unknown as FragmentConsigne[])}</th>${cols.map((c) => `<td style="${cell}">${c[i]}</td>`).join("")}</tr>`).join("");
  return `<table style="border-collapse:collapse;margin:6px auto">${corps}</table>`;
}

// ============================================================================
// Figures.
// ============================================================================

export function spec(s: Situation, opts: Partial<SpecGraphe> = {}): SpecGraphe {
  return {
    xmin: -7,
    xmax: 7,
    ymin: -7,
    ymax: 7,
    branches: branches(s),
    av: s.av,
    ah: [s.gauche, s.droite].filter((b) => b.type === "h").map((b) => (b as { L: number }).L).filter((v, i, t) => t.indexOf(v) === i),
    ao: s.droite.type === "o" ? [{ m: s.droite.m, q: s.droite.q }, ...(s.gauche.type === "o" && (s.gauche.m !== s.droite.m || s.gauche.q !== s.droite.q) ? [{ m: s.gauche.m, q: s.gauche.q }] : [])] : [],
    carreau: 10,
    police: 9,
    ...opts,
  };
}

/** Situation représentée par la lettre i (A = 0). */
export function situationLettre(e: E, i: number): Situation {
  const k = e.ordre[i]!;
  return k < 0 ? e.sit : e.intrus[k]!.sit;
}

export const figureCandidats = (e: E, carreau = 10, police = 9): string => grilleGraphesSvg(LETTRES.map((l, i) => spec(situationLettre(e, i), { lettre: l, carreau, police })));
export const figureEcran = (e: E): string => figureCandidats(e, 11, 9);
export const figurePapier = (e: E): string => figureCandidats(e, 10, 9);
export const figureCorrige = (e: E): string => grapheSvg(spec(e.sit, { carreau: 16, police: 10, etiquettes: true, couleur: true }));

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseTableauLimites, string> = { graphique: "Graphique", av: "Asymptote verticale", horiz: "Asymptote horizontale ou oblique" };

export function libelle(e: E, p: PhaseTableauLimites): string {
  if (p === "av") return e.sit.av.length > 1 ? "Asymptotes verticales" : "Asymptote verticale";
  if (p === "horiz") return estOblique(e.sit) ? "Asymptote oblique" : e.variante === "deuxAh" ? "Asymptotes horizontales" : "Asymptote horizontale";
  return LIBELLES[p];
}

export function consigneGenerale(e: E): Frag[] {
  return [tx("Voici le tableau des limites d'une fonction f définie sur "), lx(domaineL(e.sit)), tx(". Les quatre graphiques A, B, C et D sont complets (asymptotes en pointillés).")];
}

export function consigne(e: E, p: PhaseTableauLimites): Frag[] {
  if (p === "graphique") return [tx("Quel graphique peut représenter f ? Compare chaque limite du tableau à chaque graphique.")];
  if (p === "av") return e.sit.av.length > 1 ? [tx("Donne les équations des deux asymptotes verticales.")] : [tx("Donne l'équation de l'asymptote verticale.")];
  if (estOblique(e.sit)) return [tx("Donne l'équation de l'asymptote oblique.")];
  if (e.variante === "deuxAh") return [tx("Donne l'équation de l'asymptote horizontale en "), lx("-\\infty"), tx(", puis en "), lx("+\\infty"), tx(".")];
  return [tx("Donne l'équation de l'asymptote horizontale.")];
}

export function optionsGraphique(): OptionEcran[] {
  return LETTRES.map((l) => ({ id: l, fragments: [tx(`Graphique ${l}`)] }));
}

export function champs(e: E, p: PhaseTableauLimites): ChampEcran[] {
  if (p === "av") return e.sit.av.length > 1 ? [{ label: "Première asymptote verticale", labelLatex: "x=", placeholder: "ex. : 6" }, { label: "Seconde asymptote verticale", labelLatex: "x=", placeholder: "ex. : 9" }] : [{ label: "Asymptote verticale", labelLatex: "x=", placeholder: "ex. : 6" }];
  if (estOblique(e.sit)) return [{ label: "Asymptote oblique", labelLatex: "y=", placeholder: "ex. : 3x + 4", apercu: true }];
  if (e.variante === "deuxAh") return [{ label: "En −∞", labelLatex: "\\text{en }-\\infty :\\ y=", placeholder: "ex. : 6" }, { label: "En +∞", labelLatex: "\\text{en }+\\infty :\\ y=", placeholder: "ex. : −6" }];
  return [{ label: "Asymptote horizontale", labelLatex: "y=", placeholder: "ex. : 6" }];
}

const coteT = (c: 0 | 1) => (c === 0 ? "à gauche" : "à droite");

/** Message ciblé : l'erreur que porte le graphique intrus. */
export function messageIntrus(e: E, lettre: string): Frag[] | null {
  const i = LETTRES.indexOf(lettre);
  const k = e.ordre[i];
  if (k === undefined || k < 0) return null;
  const x: Intrus = e.intrus[k]!;
  const s = e.sit;
  const g = `Graphique ${lettre} : `;
  switch (x.type) {
    case "coteAV": {
      const p = s.av[x.iav!]!;
      const c = x.cote!;
      return [tx(`${g}${coteT(c)} de `), lx(`x=${p}`), tx(", la courbe part vers "), lx(infL(x.sit.cotes[x.iav!]![c])), tx(" alors que le tableau donne "), lx(infL(s.cotes[x.iav!]![c])), tx(".")];
    }
    case "echangeGD":
      return [tx(`${g}les limites à gauche et à droite de `), lx(`x=${s.av[x.iav!]}`), tx(" sont échangées.")];
    case "ahValeur": {
      const L = s.droite.type === "h" ? s.droite.L : 0;
      const L2 = x.sit.droite.type === "h" ? x.sit.droite.L : 0;
      return [tx(`${g}la courbe passe par la hauteur `), lx(`y=${L}`), tx(", mais en "), lx("+\\infty"), tx(" elle s'approche de "), lx(`y=${L2}`), tx(". Une asymptote horizontale n'est pas une valeur atteinte : c'est la droite dont la courbe s'approche.")];
    }
    case "aoPente":
      return [tx(`${g}l'asymptote oblique n'a pas la bonne pente (`), lx(droiteL(x.sit.droite)), tx(" au lieu de "), lx(droiteL(s.droite)), tx(").")];
    case "aoOrdonnee":
      return [tx(`${g}l'asymptote oblique n'a pas la bonne ordonnée à l'origine (`), lx(droiteL(x.sit.droite)), tx(" au lieu de "), lx(droiteL(s.droite)), tx(").")];
    case "echangeInfinis":
      return [tx(`${g}les limites en `), lx("-\\infty"), tx(" et en "), lx("+\\infty"), tx(" sont échangées.")];
    case "avDeplacee":
      return [tx(`${g}l'asymptote verticale est en `), lx(`x=${x.sit.av.find((v) => !s.av.includes(v))}`), tx(", pas en "), lx(`x=${s.av.find((v) => !x.sit.av.includes(v))}`), tx(".")];
  }
}

export function aide1(_e: E, p: PhaseTableauLimites): AideEcran {
  if (p === "graphique") return { texte: [tx("Lis chaque limite du tableau sur chaque graphique : un seul désaccord suffit pour éliminer un graphique. Une limite infinie en "), lx("p^-"), tx(" se voit à gauche de la droite "), lx("x=p"), tx(", en "), lx("p^+"), tx(" à droite.")] };
  if (p === "av") return { texte: [tx("Une limite infinie quand x tend vers une valeur p (à gauche ou à droite) donne l'asymptote verticale "), lx("x=p"), tx(".")] };
  return { texte: [tx("Une limite finie L en "), lx("\\pm\\infty"), tx(" donne l'asymptote horizontale "), lx("y=L"), tx(" ; si "), lx("f(x)-(mx+q)"), tx(" tend vers 0, la droite "), lx("y=mx+q"), tx(" est asymptote oblique.")] };
}

export function aide2(e: E, p: PhaseTableauLimites): AideEcran | null {
  const s = e.sit;
  if (p === "graphique") {
    const conds: Frag[] = [];
    s.av.forEach((v, i) => conds.push(tx(i ? " ; " : ""), tx("près de "), lx(`x=${v}`), tx(", la courbe monte ou descend comme "), lx(`${infL(s.cotes[i]![0])}`), tx(" à gauche et "), lx(`${infL(s.cotes[i]![1])}`), tx(" à droite")));
    return { texte: [tx("Ici : "), ...conds, tx(" ; puis compare le comportement en "), lx("-\\infty"), tx(" et en "), lx("+\\infty"), tx(".")] };
  }
  if (p === "av") return { texte: [tx("Ici, regarde les colonnes marquées "), lx("^-"), tx(" et "), lx("^+"), tx(" du tableau : la valeur de x qui y figure donne l'asymptote.")] };
  return { texte: [tx(estOblique(s) ? "Ici, la dernière ligne du tableau donne la droite dont l'écart tend vers 0." : "Ici, regarde les colonnes « −∞ » et « +∞ » du tableau.")] };
}

export function reponse(e: E, p: PhaseTableauLimites): Frag[] {
  const s = e.sit;
  if (p === "graphique") return [tx(`Graphique ${lettreCorrecte(e)}`)];
  if (p === "av") return s.av.length > 1 ? [lx(`x=${s.av[0]}`), tx(" et "), lx(`x=${s.av[1]}`)] : [lx(`x=${s.av[0]}`)];
  if (e.variante === "deuxAh") return [lx(droiteL(s.gauche)), tx(" en "), lx("-\\infty"), tx(", "), lx(droiteL(s.droite)), tx(" en "), lx("+\\infty")];
  return [lx(droiteL(s.droite))];
}

export const recap = reponse;

export function messageIllisible(e: E, p: PhaseTableauLimites): string {
  if (p === "horiz" && estOblique(e.sit)) return "Équation non reconnue : écris la droite avec x, par exemple 2x − 1 (ou y = 2x − 1). Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un entier, par exemple 3 ou −2. Cette saisie ne compte pas comme une tentative.";
}

