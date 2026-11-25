import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { droiteNormalisee, estNul, latexDroite, latexPoint, latexQ, q, qAdd, qB, qDiv, qMul, qNeg, qSub } from "../moteur6e/algebreLieux";
import type { Droite, Pt, Q } from "../moteur6e/algebreLieux";
import type { FormatCombinatoire } from "./fragmentsCombinatoire";

/**
 * Briques du corrigé « comme au tableau » des générateurs 6gen54–6gen57 (6e ch. 9 « Lieux
 * géométriques », audit, lot E), en plus de celles du ch. 7 (`corrigeCombinatoire.ts` : `fx`,
 * `utiliseCours`, `finaliserCombinatoire`, `corrigeDeLEcran`…). SANS `docx` : importé par les
 * adaptateurs papier ET par les applis (corrigé consultable après chaque réponse).
 *
 * - renvois `COURS_*` aux sections du chapitre ;
 * - droites : équation par un point et un vecteur normal, développée puis SIMPLIFIÉE (ax + by + c = 0,
 *   coefficients entiers premiers entre eux, convention du cours) ;
 * - systèmes 2 × 2 résolus par combinaison, une transformation par ligne (système écrit entre
 *   accolades `{…}` : la ligne n'est jamais coupée sur un « = » du système) ;
 * - `formatPapier` : consignes d'écran sans les indications de saisie (« une par ligne ») pour les
 *   titres « Étape n — … » du corrigé papier.
 */

export const COURS_DROITES = "cours, § 1";
export const COURS_CERCLES = "cours, § 2";
export const COURS_ELIMINATION = "cours, § 4";
export const COURS_GENERATRICES = "cours, § 5";
export const COURS_PARAMETRIQUE = "cours, § 6";

type Fragments = FragmentConsigne[];

/** Rationnel entre parenthèses s'il est négatif (« (−3) », « (−\frac{1}{2}) »). */
export function parQ(r: Q): string {
  return r.n < 0n ? `(${latexQ(r)})` : latexQ(r);
}
export const parN = (n: number) => (n < 0 ? `(${n})` : `${n}`);
export const lp = latexPoint;
export const ld = latexDroite;
export const nomPt = (nom: string, p: Pt) => `${nom}${latexPoint(p)}`;

/** « x − 3 », « x + \frac{1}{2} », « x » (variable décalée d'un rationnel). */
export function moinsQ(v: string, a: Q): string {
  if (estNul(a)) return v;
  return a.n > 0n ? `${v}-${latexQ(a)}` : `${v}+${latexQ(qNeg(a))}`;
}
/** Carré d'une expression décalée : « x^2 » ou « (x-3)^2 ». */
export function carreQ(v: string, a: Q): string {
  return estNul(a) ? `${v}^2` : `(${moinsQ(v, a)})^2`;
}

/** Terme « c(v − a) » d'une somme (« 3(x-2) », « -(y+1) », « 2x ») ; vide si c = 0. */
function termeProduit(c: Q, v: string, a: Q, premier: boolean): string {
  if (estNul(c)) return "";
  const neg = c.n < 0n;
  const abs = neg ? qNeg(c) : c;
  const coef = abs.n === 1n && abs.d === 1n ? "" : latexQ(abs);
  const corps = estNul(a) ? `${coef}${v}` : `${coef}(${moinsQ(v, a)})`;
  return premier ? `${neg ? "-" : ""}${corps}` : `${neg ? "-" : "+"}${corps}`;
}

/** « a(x − x₀) + b(y − y₀) = 0 » posée (avant développement). */
export function equationPosee(a: Q, b: Q, p: Pt): string {
  const t1 = termeProduit(a, "x", p.x, true);
  const t2 = termeProduit(b, "y", p.y, t1 === "");
  return `${t1}${t2}=0`;
}

/** Vecteur en colonne. */
export const vecteur = (u: Q, v: Q) => `\\begin{pmatrix}${latexQ(u)}\\\\ ${latexQ(v)}\\end{pmatrix}`;

/** Droite par un point et un vecteur normal (n₁ ; n₂) : équation posée, puis forme simplifiée. */
export function lignesDroiteNormale(p: Pt, n1: Q, n2: Q, justification: string | Fragments, nom?: string): { lignes: LigneCalcul[]; droite: Droite } {
  const d = droiteNormalisee(n1, n2, qNeg(qAdd(qMul(n1, p.x), qMul(n2, p.y))));
  const pose = equationPosee(n1, n2, p);
  const fin = latexDroite(d);
  const g = nom ? `${nom}\\,:\\ ` : "";
  const lignes = [ligne(`${g}${pose}`, justification)];
  if (fin !== pose) lignes.push(ligne(`${g}${fin}`, "on développe et on simplifie"));
  return { lignes, droite: d };
}

/** Droite (AB) par deux points : vecteur directeur, vecteur normal, équation. */
export function lignesDroiteDeuxPoints(A: Pt, B: Pt, nomA: string, nomB: string, nom?: string): { lignes: LigneCalcul[]; droite: Droite } {
  const u = qSub(B.x, A.x);
  const v = qSub(B.y, A.y);
  // Vecteur normal (v ; −u), ou son opposé pour que le premier coefficient non nul soit positif.
  const s = v.n < 0n || (v.n === 0n && u.n > 0n) ? q(-1) : q(1);
  const [n1, n2] = [qMul(s, v), qMul(s, qNeg(u))];
  const r = lignesDroiteNormale(A, n1, n2, [texte("vecteur normal "), latex(vecteur(n1, n2))], nom);
  return { lignes: [ligne(`\\overrightarrow{${nomA}${nomB}}=${vecteur(u, v)}`, "vecteur directeur"), ...r.lignes], droite: r.droite };
}

/** « a x + b y = k » d'une droite (membre de droite = −c), variables au choix. */
function membreGauche(a: Q, b: Q, vx: string, vy: string): string {
  const t1 = termeProduit(a, vx, q(0), true);
  const t2 = termeProduit(b, vy, q(0), t1 === "");
  return `${t1}${t2}` || "0";
}
export function equationLineaire(a: Q, b: Q, c: Q, vx = "x", vy = "y"): string {
  return `${membreGauche(a, b, vx, vy)}=${latexQ(qNeg(c))}`;
}

/** Système de deux équations a x + b y + c = 0, écrit entre accolades (une seule ligne). */
export function systemeLatex(e1: [Q, Q, Q], e2: [Q, Q, Q], vx = "x", vy = "y"): string {
  return `{\\begin{cases}${equationLineaire(...e1, vx, vy)}\\\\ ${equationLineaire(...e2, vx, vy)}\\end{cases}}`;
}

/** Facteur dans une justification en texte : « 3 », « (−3) », « 1/2 ». */
function facteurTexte(r: Q): string {
  const t = r.d === 1n ? `${r.n < 0n ? -r.n : r.n}` : `${r.n < 0n ? -r.n : r.n}/${r.d}`;
  return r.n < 0n ? `(−${t})` : t;
}

const dQ = (d: Droite): [Q, Q, Q] => [qB(d.a), qB(d.b), qB(d.c)];
export { dQ };

/**
 * Résolution d'un système 2 × 2 par combinaison, une transformation par ligne : le système, puis
 * (si aucune équation ne donne directement une inconnue) « (1) × b₂ − (2) × b₁ » qui élimine la
 * seconde inconnue, sa valeur, puis la première remplacée. Retourne aussi la solution.
 */
export function lignesSysteme(e1: [Q, Q, Q], e2: [Q, Q, Q], vx = "x", vy = "y", noms: [string, string] = ["(1)", "(2)"]): { lignes: LigneCalcul[]; x: Q; y: Q } {
  const [a1, b1, c1] = e1;
  const [a2, b2, c2] = e2;
  const lignes: LigneCalcul[] = [ligne(systemeLatex(e1, e2, vx, vy))];
  const det = qSub(qMul(a1, b2), qMul(a2, b1));
  if (estNul(det)) throw new Error("système sans solution unique");
  const x = qDiv(qSub(qMul(qNeg(c1), b2), qMul(qNeg(c2), b1)), det);
  const y = qDiv(qSub(qMul(a1, qNeg(c2)), qMul(a2, qNeg(c1))), det);
  const valeur = (v: string, r: Q, j: string | Fragments) => ligne(`${v}=${latexQ(r)}`, j);
  const un = (r: Q) => r.n === 1n && r.d === 1n;
  const division = (r: Q) => `on divise par ${latexQ(r).replace("-", "−")}`;
  /** « a·(valeur) » (« 3\cdot(−2) », « (−2) », « −(−2) »). */
  const fois = (a: Q, v: Q) => (un(a) ? parQ(v) : un(qNeg(a)) ? `-${parQ(v)}` : `${latexQ(a)}\\cdot ${parQ(v)}`);
  /** Équation k, la première inconnue connue : on remplace, on isole la seconde. */
  const remplacer = (k: 1 | 2, connue: "x" | "y") => {
    const [a, b, c] = k === 1 ? e1 : e2;
    const [coefConnu, coefCherche, vConnue, vCherchee, valConnue, valCherchee] = connue === "x" ? [a, b, vx, vy, x, y] : [b, a, vy, vx, y, x];
    const l: LigneCalcul[] = [];
    const reste = qSub(qNeg(c), qMul(coefConnu, valConnue));
    if (!estNul(coefConnu) && !estNul(valConnue)) {
      const terme = termeProduit(coefCherche, vCherchee, q(0), false);
      l.push(ligne(connue === "x" ? `${fois(coefConnu, valConnue)}${terme}=${latexQ(qNeg(c))}` : `${termeProduit(coefCherche, vCherchee, q(0), true)}${fois(coefConnu, valConnue).startsWith("-") ? "" : "+"}${fois(coefConnu, valConnue)}=${latexQ(qNeg(c))}`, `on remplace ${vConnue} dans ${noms[k - 1]}`));
      l.push(ligne(`${termeProduit(coefCherche, vCherchee, q(0), true)}=${latexQ(reste)}`));
    }
    if (!un(coefCherche)) l.push(valeur(vCherchee, valCherchee, division(coefCherche)));
    return l;
  };
  if (estNul(b1) || estNul(b2)) {
    // Une équation ne contient pas la seconde inconnue : elle donne la première.
    const k = estNul(b1) ? 1 : 2;
    const [a] = k === 1 ? e1 : e2;
    lignes.push(valeur(vx, x, un(a) ? `équation ${noms[k - 1]}` : `équation ${noms[k - 1]} : ${division(a)}`));
    lignes.push(...remplacer(k === 1 ? 2 : 1, "x"));
  } else if (estNul(a1) || estNul(a2)) {
    const k = estNul(a1) ? 1 : 2;
    const [, b] = k === 1 ? e1 : e2;
    lignes.push(valeur(vy, y, un(b) ? `équation ${noms[k - 1]}` : `équation ${noms[k - 1]} : ${division(b)}`));
    lignes.push(...remplacer(k === 1 ? 2 : 1, "y"));
  } else {
    // (1) × b₂ − (2) × b₁ : la seconde inconnue disparaît.
    const nx = qSub(qMul(qNeg(c1), b2), qMul(qNeg(c2), b1));
    lignes.push(ligne(`${termeProduit(det, vx, q(0), true)}=${latexQ(nx)}`, `${noms[0]} × ${facteurTexte(b2)} − ${noms[1]} × ${facteurTexte(b1)} : ${vy} disparaît`));
    if (!un(det)) lignes.push(valeur(vx, x, division(det)));
    lignes.push(...remplacer(1, "x"));
  }
  return { lignes, x, y };
}

/** Intersection de deux droites (forme ax + by + c = 0) : lignes de résolution et point. */
export function lignesIntersection(d1: Droite, d2: Droite): { lignes: LigneCalcul[]; point: Pt } {
  const r = lignesSysteme(dQ(d1), dQ(d2));
  return { lignes: r.lignes, point: { x: r.x, y: r.y } };
}

/** Coordonnée « 2·h − p » d'un symétrique (Q = 2H − P), une ligne par coordonnée. */
export function lignesSymetrique(nomQ: string, H: Pt, P: Pt, nomH: string, nomP: string): LigneCalcul[] {
  const Q2 = { x: qSub(qMul(q(2), H.x), P.x), y: qSub(qMul(q(2), H.y), P.y) };
  return [
    ligne(`x_{${nomQ}}=2x_{${nomH}}-x_{${nomP}}=2\\cdot ${parQ(H.x)}-${parQ(P.x)}=${latexQ(Q2.x)}`, `${nomH} milieu de [${nomP}${nomQ}]`),
    ligne(`y_{${nomQ}}=2\\cdot ${parQ(H.y)}-${parQ(P.y)}=${latexQ(Q2.y)}`),
  ];
}

/** Carré d'une distance : « AB^2=(x_B-x_A)^2+(y_B-y_A)^2=… ». */
export function lignesDistance2(nom: string, A: Pt, B: Pt): { lignes: LigneCalcul[]; d2: Q } {
  const dx = qSub(B.x, A.x);
  const dy = qSub(B.y, A.y);
  const d2 = qAdd(qMul(dx, dx), qMul(dy, dy));
  return { lignes: [ligne(`${nom}^2=${parQ(dx)}^2+${parQ(dy)}^2=${latexQ(d2)}`, "carré de la distance de deux points")], d2 };
}

/** Indications d'écran retirées des consignes (titres « Étape n — … » du corrigé papier). */
const INDICATIONS_ECRAN = [/ \((?:une?|un) par ligne[^)]*\)/g, / \(une réponse par ligne[^)]*\)/g];
export function sansIndicationsEcran(fragments: Fragments): Fragments {
  return fragments.map((f) => (f.type === "texte" ? { ...f, valeur: INDICATIONS_ECRAN.reduce((v, m) => v.replace(m, ""), f.valeur) } : f));
}
/** Format de l'écran pour le papier : mêmes textes, consignes d'écran sans indication de saisie. */
export function formatPapier<E, P extends string>(format: FormatCombinatoire<E, P>): FormatCombinatoire<E, P> {
  return { ...format, consigneEcran: (e, p) => sansIndicationsEcran(format.consigneEcran(e, p)) };
}

/** Ligne du corrigé avec la figure (chaîne SVG de `figureLieux`, la même que l'écran). */
export function avecFigure(etape: EtapeCorrection, svg: string): EtapeCorrection {
  // Figure bornée à 9 cm (comme le lot H1, `figureCorrigeLot`) : pleine largeur, elle prenait une demi-page.
  return { ...etape, figureHtml: `<div style="max-width:9cm;margin:0 auto">${svg}</div>` };
}

/** Un nombre rationnel « décimal » ou fraction pour un texte (entre $). */
export const qL = latexQ;
