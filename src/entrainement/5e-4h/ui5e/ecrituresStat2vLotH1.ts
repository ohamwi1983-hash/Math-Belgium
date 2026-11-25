import type { Pt } from "../core5e/stat2vLotH1";
import { arrondi, net } from "../core5e/stat2vLotH1";
import type { Frag, TableauDonnees } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";

/**
 * Écritures communes du lot H1 du 5e ch. 6 (5gen76, 5gen77, 5gen36, 5gen37, 5gen38) : décimaux à virgule
 * (`{,}` en KaTeX, « , » et « − » en texte), milliers séparés par une espace fine à partir de 10 000,
 * point moyen G(x̄ ; ȳ), droite y = ax + b, tableau de données (écran : `TableauDonnees` ; papier : tableau
 * KaTeX `array`, seul moyen pour qu'il passe aussi dans la copie Word). Aucune notation clavier ; source
 * unique de l'écran, du papier et du corrigé.
 */

/** Décimal en LaTeX : « 2{,}05 », « -0{,}25 », « 12\,500 » (au plus `dec` décimales). */
export function nL(v: number, dec = 10): string {
  const r = arrondi(v, dec);
  if (r === 0) return "0";
  const [ent, fr] = Math.abs(r).toFixed(Math.min(dec, 12)).replace(/\.?0+$/, "").split(".");
  const e = ent!.length > 4 ? ent!.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent!;
  return `${r < 0 ? "-" : ""}${e}${fr ? `{,}${fr}` : ""}`;
}

/** Décimal en texte brut : « 2,05 », « −0,25 », « 12 500 ». */
export function nT(v: number, dec = 10): string {
  return nL(v, dec).replace("{,}", ",").replace(/\\,/g, "\u202f").replace(/^-/, "−");
}

/** Décimal avec EXACTEMENT `dec` décimales (valeur arrondie annoncée : « 0{,}250 »). */
export function nFixeL(v: number, dec: number): string {
  const r = arrondi(v, dec);
  const s = Math.abs(r).toFixed(dec).replace(".", "{,}");
  return `${r < 0 ? "-" : ""}${s}`;
}

/** Facteur d'un produit : entre parenthèses s'il est négatif. */
export const parL = (v: number, dec = 10): string => (net(v) < 0 ? `(${nL(v, dec)})` : nL(v, dec));

/** « + 2{,}5 », « - 3 » (collé), rien pour 0. */
export const plusL = (v: number, dec = 10): string => (arrondi(v, dec) === 0 ? "" : arrondi(v, dec) > 0 ? `+${nL(v, dec)}` : nL(v, dec));

/** Coordonnées « (3\,;4{,}5) ». */
export const coordL = (P: Pt, dx = 10, dy = 10): string => `(${nL(P.x, dx)}\\,;${nL(P.y, dy)})`;

/** Point nommé « G(3\,;4{,}5) », « G_1(…) ». */
export const pointL = (nom: string, P: Pt, dx = 10, dy = 10): string => `${nom}${coordL(P, dx, dy)}`;

/** Droite « y=0{,}6x+2{,}2 » (coefficients arrondis à `da` et `db` décimales). */
export function droiteL(a: number, b: number, da = 10, db = 10): string {
  const ar = arrondi(a, da);
  const ax = ar === 0 ? "" : ar === 1 ? "x" : ar === -1 ? "-x" : `${nL(ar, da)}x`;
  const br = arrondi(b, db);
  if (ax === "") return `y=${nL(br, db)}`;
  return `y=${ax}${plusL(br, db)}`;
}

/** Données d'un tableau : libellés (texte brut, pour l'écran et l'aria), libellés KaTeX (papier). */
export interface EnTetesTableau {
  x: string;
  y: string;
}

/** Tableau de l'écran (rangées horizontales : une par grandeur). */
export function tableauEcran(p: readonly Pt[], ent: EnTetesTableau, dx: number, dy: number): TableauDonnees {
  return { entetes: [[tx(ent.x)], [tx(ent.y)]], lignes: p.map((q) => [nT(q.x, dx), nT(q.y, dy)]), horizontal: true };
}

/** Libellé d'en-tête en LaTeX : texte dans `\text{…}`, « xᵢ » / « yᵢ » en formule (`x_i`). */
const texteL = (s: string): string =>
  s
    .split(/(xᵢ|yᵢ)/)
    .map((m) => (m === "xᵢ" ? "x_i" : m === "yᵢ" ? "y_i" : m === "" ? "" : `\\text{${m.replace(/\\/g, "").replace(/([%$&#_{}])/g, "\\$1")}}`))
    .join("");

/** Tableau papier (KaTeX `array`), mêmes valeurs que l'écran ; coupé en deux blocs au-delà de 9 colonnes. */
export function tableauPapierL(p: readonly Pt[], ent: EnTetesTableau, dx: number, dy: number): string {
  return tableauCellulesL(
    p.map((q) => [nL(q.x, dx), nL(q.y, dy)]),
    ent,
  );
}

/** Tableau papier à cellules déjà écrites en LaTeX (« ? » pour une valeur effacée). */
export function tableauCellulesL(cellules: [string, string][], ent: EnTetesTableau): string {
  const coupe = Math.ceil(cellules.length / 2);
  const morceaux = cellules.length > 9 ? [cellules.slice(0, coupe), cellules.slice(coupe)] : [cellules];
  const bloc = (m: [string, string][]) =>
    `\\begin{array}{|l|${"c|".repeat(m.length)}}\\hline ${texteL(ent.x)}&${m.map((c) => c[0]).join("&")}\\\\\\hline ${texteL(ent.y)}&${m.map((c) => c[1]).join("&")}\\\\\\hline\\end{array}`;
  return morceaux.length === 1 ? bloc(morceaux[0]!) : `\\begin{array}{c}${morceaux.map(bloc).join("\\\\[6pt]")}\\end{array}`;
}

/** Tableau de l'écran à cellules déjà écrites en texte. */
export function tableauEcranCellules(cellules: [string, string][], ent: EnTetesTableau): TableauDonnees {
  return { entetes: [[tx(ent.x)], [tx(ent.y)]], lignes: cellules.map((c) => [c[0], c[1]]), horizontal: true };
}

/** Phrase de contexte + « : » pour annoncer le tableau affiché (papier). */
export function avantTableau(fr: Frag[]): Frag[] {
  const out = [...fr];
  const k = out.length - 1;
  const d = out[k];
  if (d && d.type === "texte") out[k] = { type: "texte", valeur: d.valeur.replace(/[.:]?\s*$/, " :") };
  return out;
}

/** Fragments « G(x̄ ; ȳ) = G(3 ; 4) ». */
export const pointMoyenFr = (G: Pt): Frag[] => [lx(`G${coordL(G)}`)];
