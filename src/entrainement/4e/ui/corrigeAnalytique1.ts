import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { moinsH as moinsHRat, nombreTexte, plusQ as plusQRat, q as qRat, qp as qpRat, racineCarreeLatex, rationnel, sansDoublons } from "./corrigeChapitre3";
import { estMixte3, latexRadical3, parties3 } from "./radical3";

/**
 * Briques du corrigé détaillé « comme au tableau » des droites du chapitre 7 de 4e (« Géométrie
 * analytique plane », gen42–gen48 : équation, lecture, tracé, parallèles / perpendiculaires,
 * caractéristiques, distance, intersection) — règle `.claude/rules/feuilles-evaluations.md`, section
 * « Corrigé détaillé — comme au tableau ». Sans `docx` : importées par les applis ET les adaptateurs.
 * Une transformation par ligne, la règle à droite ; nombres exacts (fractions irréductibles `\dfrac`),
 * « − » typographique. Jamais « déterminant » : « critère de colinéarité » x_u·y_v − y_u·x_v.
 * Renvois au cours : numéros des sections de `geometrie-analytique-plane.ts`.
 */

export type Fragments = FragmentConsigne[];
export interface P {
  x: number;
  y: number;
}
/** Droite cartésienne a·x + b·y + c = 0. */
export interface D {
  a: number;
  b: number;
  c: number;
}

/* ---------------------------------------------------------------------------------------------
 * Nombres exacts : fractions ET p + r√3 (angles de 30°, 60°, 120°, 150° — décision 4 de l'audit du
 * 4e ch. 7). Pour une valeur rationnelle, mêmes écritures que `corrigeChapitre3` (corrigés des
 * autres instances identiques).
 * ------------------------------------------------------------------------------------------- */

/** Nombre exact en LaTeX (entier, `\dfrac`, « 2-3\sqrt{3} »). */
export function q(valeur: number): string {
  return latexRadical3(valeur) ?? qRat(valeur);
}

/** Même nombre, entre parenthèses s'il est négatif ou s'il est une somme (« (2-\sqrt{3}) »). */
export function qp(valeur: number): string {
  const r = latexRadical3(valeur);
  if (r === null) return qpRat(valeur);
  return valeur < 0 || estMixte3(valeur) ? `(${r})` : r;
}

/** « +3 », « -\dfrac{1}{2} », « +2-\sqrt{3} » (rien si nul). */
export function plusQ(valeur: number): string {
  const parts = parties3(valeur);
  if (parts === null) return plusQRat(valeur);
  const rad = latexRadical3(parts.radicale) as string;
  return `${plusQRat(parts.rationnelle)}${rad.startsWith("-") ? rad : `+${rad}`}`;
}

/** Monôme en tête : « 3x », « -x », « \sqrt{3}x », « (2-\sqrt{3})x » (partie vide : le nombre). */
export function mono(coef: number, partie = ""): string {
  const c = net(coef);
  if (partie === "") return q(c);
  if (c === 1) return partie;
  if (c === -1) return `-${partie}`;
  return estMixte3(c) ? `(${q(c)})${partie}` : `${q(c)}${partie}`;
}

/** Somme de monômes `[coef, partie]` (nuls omis, signes fusionnés) ; une constante p + r√3 donne
 * deux termes. */
export function somme(termes0: [number, string][]): string {
  const termes: [number, string][] = termes0.flatMap(([c0, partie]): [number, string][] => {
    const parts = partie === "" ? parties3(c0) : null;
    return parts !== null && Math.abs(parts.rationnelle) > 1e-12 ? [[parts.rationnelle, ""], [parts.radicale, ""]] : [[c0, partie]];
  });
  let s = "";
  for (const [c0, partie] of termes) {
    const c = net(c0);
    if (c === 0) continue;
    if (s === "") s = mono(c, partie);
    else if (estMixte3(c)) s += `+${mono(c, partie)}`;
    else s += c > 0 ? `+${mono(c, partie)}` : `-${mono(-c, partie)}`;
  }
  return s === "" ? "0" : s;
}

/** « x-3 », « x+\dfrac{1}{2} », « x-(2-\sqrt{3}) ». */
export function moinsH(h: number, x = "x"): string {
  if (estMixte3(h)) return `${x}-(${q(h)})`;
  const r = latexRadical3(h);
  if (r !== null) return r.startsWith("-") ? `${x}+${r.slice(1)}` : `${x}-${r}`;
  return moinsHRat(h, x);
}

export const COURS_DROITE = "(cours, point 1)";
export const COURS_LIRE_TRACER = "(cours, point 2)";
export const COURS_CARACTERISTIQUES = "(cours, point 3)";
export const COURS_RELATIONS = "(cours, point 4)";
export const COURS_INTERSECTION = "(cours, point 5)";
export const COURS_DISTANCE = "(cours, point 6)";

function net(v: number): number {
  return Object.is(v, -0) || Math.abs(v) < 1e-12 ? 0 : v;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** « A(2\,;\,-1) » : notation du cours (point en ligne, « ; »). */
export function pt(nom: string, p: P): string {
  return `${nom}(${q(p.x)}\\,;\\,${q(p.y)})`;
}

/** Composantes en colonne (notation du cours pour un vecteur). */
export function col(v: P): string {
  return `\\begin{pmatrix}${q(v.x)}\\\\${q(v.y)}\\end{pmatrix}`;
}

export function vec(nom: string): string {
  return `\\vec{${nom}}`;
}

/** Indice LaTeX d'un nom (« A » → « A », « u_1 » → « {u_1} »). */
function ind(nom: string): string {
  return nom.length > 1 ? `{${nom}}` : nom;
}

/** « 3\cdot 2 », « -2\cdot(-4) » : produit écrit tel quel (coefficient en tête, facteur parenthésé). */
export function produit(k: number, v: number): string {
  if (net(k) === 1) return qp(v);
  if (net(k) === -1) return `-${qp(v)}`;
  return `${q(k)}\\cdot ${qp(v)}`;
}

/** Terme d'une somme de produits : « +3\cdot 2 », « -2\cdot(-4) » (signe du coefficient fusionné). */
function produitSuite(k: number, v: number): string {
  if (Math.abs(net(k)) === 1) return `${k < 0 ? "-" : "+"}${qp(v)}`;
  return net(k) < 0 ? `-${q(-k)}\\cdot ${qp(v)}` : `+${q(k)}\\cdot ${qp(v)}`;
}

/** « ax+by+c » (terme nul omis). */
export function membre(d: D): string {
  return somme([
    [d.a, "x"],
    [d.b, "y"],
    [d.c, ""],
  ]);
}

export function equation(d: D): string {
  return `${membre(d)}=0`;
}

/** Coefficients entiers divisés par leur PGCD ; `signe` : premier coefficient non nul rendu positif. */
export function simplifiee(d: D, signe = false): { d: D; k: number } {
  // Coefficients non entiers (√3, fractions) : aucune simplification par un PGCD.
  if (![d.a, d.b, d.c].every((v) => Math.abs(v - Math.round(v)) < 1e-9)) return { d, k: 1 };
  const g = pgcd(pgcd(Math.round(Math.abs(d.a)), Math.round(Math.abs(d.b))), Math.round(Math.abs(d.c))) || 1;
  const s = signe && (d.a < 0 || (d.a === 0 && d.b < 0)) ? -1 : 1;
  const k = s * g;
  return { d: { a: net(d.a / k), b: net(d.b / k), c: net(d.c / k) }, k };
}

/** Ligne « on divise les deux membres par k » quand l'équation se simplifie (rien sinon). */
export function lignesSimplifier(d: D, signe = false): LigneCalcul[] {
  const { d: r, k } = simplifiee(d, signe);
  if (k === 1) return [];
  return [ligne(equation(r), `on divise les deux membres par ${nombreTexte(k)}`)];
}

/* ---------------------------------------------------------------------------------------------
 * Vecteur directeur
 * ------------------------------------------------------------------------------------------- */

/** \vec{u}=\vec{AB}=\begin{pmatrix}x_B−x_A\\y_B−y_A\end{pmatrix}, puis les composantes calculées. */
export function lignesVecteurDeuxPoints(nomVecteur: string, a: P, b: P, nomA = "A", nomB = "B"): LigneCalcul[] {
  const diff = (u: number, w: number) => `${q(u)}-${qp(w)}`;
  const gauche = nomVecteur === `${nomA}${nomB}` ? vec(nomVecteur) : `${vec(nomVecteur)}=${vec(`${nomA}${nomB}`)}`;
  return sansDoublons([
    ligne(`${gauche}=\\begin{pmatrix}${diff(b.x, a.x)}\\\\${diff(b.y, a.y)}\\end{pmatrix}`, "extrémité − origine"),
    ligne(`=${col({ x: b.x - a.x, y: b.y - a.y })}`),
  ]);
}

/** Vecteur lu (éventuellement fractionnaire) remplacé par un multiple à composantes entières. */
export function lignesMultipleEntier(lu: P, retenu: P): LigneCalcul[] {
  if (Math.abs(lu.x - retenu.x) < 1e-9 && Math.abs(lu.y - retenu.y) < 1e-9) return [];
  const k = Math.abs(lu.x) > 1e-12 ? retenu.x / lu.x : retenu.y / lu.y;
  const entiers = Number.isInteger(lu.x) && Number.isInteger(lu.y);
  const suite = `même direction${entiers ? "" : Number.isInteger(retenu.x) && Number.isInteger(retenu.y) ? ", composantes entières" : ", sans fraction"}`;
  if (latexRadical3(k) !== null) return [ligne(`${qp(k)}${col(lu)}=${col(retenu)}`, [texte("on multiplie par "), latex(q(k)), texte(` : ${suite}`)])];
  return [ligne(`${k === -1 ? "-" : q(k)}${col(lu)}=${col(retenu)}`, `on multiplie par ${nombreTexte(k)} : ${suite}`)];
}

/* ---------------------------------------------------------------------------------------------
 * Équations d'une droite depuis un point et un vecteur directeur (cours, § 1)
 * ------------------------------------------------------------------------------------------- */

/**
 * Forme cartésienne par ses coefficients (écran « coefficients » de gen42) : a = y_u, b = −x_u
 * (vecteur normal), c = −(a·x_A + b·y_A) (A est sur la droite), puis l'équation et sa simplification.
 */
export function lignesCoefficientsCartesiens(p: P, u: P, nomPoint = "A"): { lignes: LigneCalcul[]; d: D } {
  const a = net(u.y);
  const b = net(-u.x);
  const c = net(-(a * p.x + b * p.y));
  const i = ind(nomPoint);
  const d = { a, b, c };
  const lignes: LigneCalcul[] = [
    ligne(`a=y_{\\vec{u}}=${q(a)}`, [texte("vecteur normal : "), latex("\\vec{u}"), texte(" tourné d'un quart de tour")]),
    ligne(`b=-x_{\\vec{u}}=${q(b)}`),
    ligne(`c=-(a\\cdot x_${i}+b\\cdot y_${i})`, [texte(`${nomPoint} est sur la droite : `), latex(`a\\cdot x_${i}+b\\cdot y_${i}+c=0`)]),
    ligne(`=-(${produit(a, p.x)}${produitSuite(b, p.y)})`),
    ligne(`=-(${q(a * p.x)}${plusQ(b * p.y)})`),
    ligne(`=${q(c)}`),
    ligne(equation(d), "on remplace a, b et c dans ax + by + c = 0"),
    ...lignesSimplifier(d),
  ];
  return { lignes: dedoublonner(lignes), d };
}

/** « a(x−x_P)+b(y−y_P) » (facteur nul omis). */
function formeNormale(n: P, p: P): string {
  const termes: string[] = [];
  const terme = (c: number, v: number, variable: "x" | "y") => {
    if (net(c) === 0) return;
    const premier = termes.length === 0;
    const coef = c === 1 ? (premier ? "" : "+") : c === -1 ? "-" : premier ? q(c) : c > 0 ? `+${q(c)}` : `-${q(-c)}`;
    const seul = (variable === "x" ? net(n.y) === 0 : termes.length === 0) && c === 1;
    termes.push(net(v) === 0 ? `${coef}${variable}` : seul ? moinsH(v, variable) : `${coef}(${moinsH(v, variable)})`);
  };
  terme(n.x, p.x, "x");
  terme(n.y, p.y, "y");
  return termes.join("");
}

/**
 * Équation cartésienne y_u·(x − x_A) − x_u·(y − y_A) = 0 (vecteur normal (y_u ; −x_u)), distribuée,
 * réduite ; `simplifier` : coefficients divisés par leur PGCD, premier coefficient positif.
 */
export function lignesCartesienneParNormale(u: P, p: P, justificationDepart: string | Fragments, simplifier = false): { lignes: LigneCalcul[]; d: D; finale: D } {
  const n = { x: net(u.y), y: net(-u.x) };
  const d: D = { a: n.x, b: n.y, c: net(-(n.x * p.x + n.y * p.y)) };
  const developpe = somme([
    [n.x, "x"],
    [-n.x * p.x, ""],
    [n.y, "y"],
    [-n.y * p.y, ""],
  ]);
  const lignes: LigneCalcul[] = [ligne(`${formeNormale(n, p)}=0`, justificationDepart)];
  if (developpe !== membre(d)) lignes.push(ligne(`${developpe}=0`, "on distribue"));
  lignes.push(ligne(equation(d), "on réduit"));
  const finale = simplifier ? simplifiee(d, true).d : d;
  if (simplifier) lignes.push(...lignesSimplifier(d, true));
  return { lignes: dedoublonner(lignes), d, finale };
}

/** y = mx + p depuis A et u (x_u ≠ 0) : m = y_u/x_u, p = y_A − m·x_A. */
export function lignesExpliciteY(p0: P, u: P, nomPoint = "A"): { lignes: LigneCalcul[]; m: number; p: number } {
  const m = net(u.y / u.x);
  const p = net(p0.y - m * p0.x);
  const i = ind(nomPoint);
  const lignes: LigneCalcul[] = [
    ligne(`m=\\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}=\\dfrac{${q(u.y)}}{${q(u.x)}}`, "pente : quotient des composantes"),
    ligne(`=${q(m)}`),
    ligne(`p=y_${i}-m\\cdot x_${i}`, [texte(`${nomPoint} est sur la droite : `), latex(`y_${i}=m\\cdot x_${i}+p`)]),
    ligne(`=${q(p0.y)}-${qp(m)}\\cdot ${qp(p0.x)}`),
    ligne(`=${q(p0.y)}${plusQ(-m * p0.x)}`),
    ligne(`=${q(p)}`),
    ligne(`y=${somme([[m, "x"], [p, ""]])}`, "on remplace m et p dans y = mx + p"),
  ];
  return { lignes: dedoublonner(lignes), m, p };
}

/** x = ny + q depuis A et u (y_u ≠ 0) : n = x_u/y_u, q = x_A − n·y_A. */
export function lignesExpliciteX(p0: P, u: P, nomPoint = "A"): { lignes: LigneCalcul[]; n: number; q: number } {
  const n = net(u.x / u.y);
  const qq = net(p0.x - n * p0.y);
  const i = ind(nomPoint);
  const lignes: LigneCalcul[] = [
    ligne(`n=\\dfrac{x_{\\vec{u}}}{y_{\\vec{u}}}=\\dfrac{${q(u.x)}}{${q(u.y)}}`, "quotient des composantes (inverse de la pente)"),
    ligne(`=${q(n)}`),
    ligne(`q=x_${i}-n\\cdot y_${i}`, [texte(`${nomPoint} est sur la droite : `), latex(`x_${i}=n\\cdot y_${i}+q`)]),
    ligne(`=${q(p0.x)}-${qp(n)}\\cdot ${qp(p0.y)}`),
    ligne(`=${q(p0.x)}${plusQ(-n * p0.y)}`),
    ligne(`=${q(qq)}`),
    ligne(`x=${somme([[n, "y"], [qq, ""]])}`, "on remplace n et q dans x = ny + q"),
  ];
  return { lignes: dedoublonner(lignes), n, q: qq };
}

/** Équations paramétriques : une ligne par coordonnée, gabarit en justification. */
export function lignesParametriques(p: P, u: P, nomPoint = "A", nomVecteur = "u", param = "t"): LigneCalcul[] {
  const i = ind(nomPoint);
  return [
    ligne(`x=${somme([[p.x, ""], [u.x, param]])}`, [latex(`x=x_${i}+x_{\\vec{${nomVecteur}}}\\,${param}`)]),
    ligne(`y=${somme([[p.y, ""], [u.y, param]])}`, [latex(`y=y_${i}+y_{\\vec{${nomVecteur}}}\\,${param}`)]),
  ];
}

/** Une coordonnée connue, l'autre calculée sur ax + by + c = 0 (on remplace, on regroupe, on divise). */
export function lignesPointCartesienne(d: D, nom: string, p: P): LigneCalcul[] {
  const verticale = d.b === 0;
  const [cConnu, valConnue, cCherche, nomConnu, nomCherche, valCherchee] = verticale ? [d.b, p.y, d.a, "y", "x", p.x] : [d.a, p.x, d.b, "x", "y", p.y];
  const L: LigneCalcul[] = [ligne(`${nomConnu}_${nom}=${q(valConnue)}`, verticale ? "droite verticale : on choisit l'ordonnée" : "on choisit l'abscisse")];
  // Substitution : « 2\cdot 3+3y−6=0 » (ou « 3x−6=0 » quand le coefficient connu est nul).
  const termeConnu = cConnu === 0 ? "" : produit(cConnu, valConnue);
  const termeCherche = termeConnu === "" ? mono(cCherche, nomCherche) : cCherche > 0 ? `+${mono(cCherche, nomCherche)}` : `-${mono(-cCherche, nomCherche)}`;
  const avant = verticale ? `${mono(cCherche, nomCherche)}${termeConnu === "" ? "" : termeConnu.startsWith("-") ? termeConnu : `+${termeConnu}`}` : `${termeConnu}${termeCherche}`;
  L.push(ligne(`${avant}${plusQ(d.c)}=0`, "on remplace dans l'équation"));
  const k = -(cConnu * valConnue + d.c);
  L.push(ligne(`${mono(cCherche, nomCherche)}=${q(k)}`, "on passe les nombres dans l'autre membre"));
  if (cCherche === -1) L.push(ligne(`${nomCherche}_${nom}=${q(valCherchee)}`, "on change les signes des deux membres"));
  else if (cCherche !== 1) L.push(ligne(`${nomCherche}_${nom}=\\dfrac{${q(k)}}{${q(cCherche)}}`, `on divise par ${nombreTexte(cCherche)}`), ligne(`=${q(valCherchee)}`));
  else L.push(ligne(`${nomCherche}_${nom}=${q(valCherchee)}`));
  return dedoublonner(L);
}

/* ---------------------------------------------------------------------------------------------
 * Vérifications « le point est sur la droite »
 * ------------------------------------------------------------------------------------------- */

/** « a·x_P + b·y_P + c = 0 » sur l'équation cartésienne d. */
export function lignesPointSurCartesienne(d: D, p: P, nomPoint: string): LigneCalcul[] {
  const termes: string[] = [];
  const fois = (c: number, v: number) => {
    if (net(c) === 0) return;
    const premier = termes.length === 0;
    if (c === 1) termes.push(premier ? qp(v) : `+${qp(v)}`);
    else if (c === -1) termes.push(`-${qp(v)}`);
    else termes.push(premier ? produit(c, v) : produitSuite(c, v));
  };
  fois(d.a, p.x);
  fois(d.b, p.y);
  const v = net(d.a * p.x + d.b * p.y + d.c);
  const just = Math.abs(v) < 1e-9 ? `${nomPoint} vérifie l'équation : il est sur la droite` : `${nomPoint} ne vérifie pas l'équation : il n'est pas sur la droite`;
  return [ligne(`${termes.join("")}${plusQ(d.c)}=${q(v)}${Math.abs(v) < 1e-9 ? "" : "\\neq 0"}`, just)];
}

/** « m·x_P + p = y_P » sur y = mx + p. */
export function lignesPointSurExpliciteY(m: number, p: number, pt0: P, nomPoint: string): LigneCalcul[] {
  const y = net(m * pt0.x + p);
  const sur = Math.abs(y - pt0.y) < 1e-9;
  const gauche = net(m) === 0 ? q(p) : `${produit(m, pt0.x)}${plusQ(p)}`;
  return [ligne(`${gauche}=${q(y)}${sur ? "" : `\\neq ${q(pt0.y)}`}`, sur ? [texte("on retrouve "), latex(`y_${ind(nomPoint)}`), texte(` : ${nomPoint} est sur la droite`)] : [texte("ce n'est pas "), latex(`y_${ind(nomPoint)}`), texte(` : ${nomPoint} n'est pas sur la droite`)])];
}

/** « n·y_P + q = x_P » sur x = ny + q. */
export function lignesPointSurExpliciteX(n: number, qq: number, pt0: P, nomPoint: string): LigneCalcul[] {
  const x = net(n * pt0.y + qq);
  const sur = Math.abs(x - pt0.x) < 1e-9;
  const gauche = net(n) === 0 ? q(qq) : `${produit(n, pt0.y)}${plusQ(qq)}`;
  return [ligne(`${gauche}=${q(x)}${sur ? "" : `\\neq ${q(pt0.x)}`}`, sur ? [texte("on retrouve "), latex(`x_${ind(nomPoint)}`), texte(` : ${nomPoint} est sur la droite`)] : [texte("ce n'est pas "), latex(`x_${ind(nomPoint)}`), texte(` : ${nomPoint} n'est pas sur la droite`)])];
}

/* ---------------------------------------------------------------------------------------------
 * Pente, critères (cours, § 3 et § 4)
 * ------------------------------------------------------------------------------------------- */

/** « m = −a/b » lue sur ax + by + c = 0 (b ≠ 0). */
export function lignesPenteCartesienne(d: D, nom = "m"): LigneCalcul[] {
  return sansDoublons([ligne(`${nom}=-\\dfrac{a}{b}=-\\dfrac{${q(d.a)}}{${q(d.b)}}`, "pente de ax + by + c = 0"), ligne(`=${q(-d.a / d.b)}`)]);
}

/** Critère de colinéarité x_u·y_v − y_u·x_v, substitué (chaque produit écrit) puis calculé. */
export function lignesCritereColinearite(u: P, v: P, nomU = "u", nomV = "v", justification: string | Fragments = "critère de colinéarité"): LigneCalcul[] {
  const p1 = net(u.x * v.y);
  const p2 = net(u.y * v.x);
  const l1 = `x_{\\vec{${nomU}}}\\cdot y_{\\vec{${nomV}}}-y_{\\vec{${nomU}}}\\cdot x_{\\vec{${nomV}}}`;
  return sansDoublons([
    ligne(`${l1}=${qp(u.x)}\\cdot ${qp(v.y)}-${qp(u.y)}\\cdot ${qp(v.x)}`, justification),
    ligne(`=${q(p1)}-${qp(p2)}`),
    ligne(`=${q(p1 - p2)}`),
  ]);
}

/** Critère d'orthogonalité x_u·x_v + y_u·y_v, substitué (chaque produit écrit) puis calculé. */
export function lignesCritereOrthogonalite(u: P, v: P, nomU = "u", nomV = "v", justification: string | Fragments = "critère d'orthogonalité"): LigneCalcul[] {
  const p1 = net(u.x * v.x);
  const p2 = net(u.y * v.y);
  const l1 = `x_{\\vec{${nomU}}}\\cdot x_{\\vec{${nomV}}}+y_{\\vec{${nomU}}}\\cdot y_{\\vec{${nomV}}}`;
  return sansDoublons([
    ligne(`${l1}=${qp(u.x)}\\cdot ${qp(v.x)}+${qp(u.y)}\\cdot ${qp(v.y)}`, justification),
    ligne(`=${q(p1)}+${qp(p2)}`),
    ligne(`=${q(p1 + p2)}`),
  ]);
}

/* ---------------------------------------------------------------------------------------------
 * Système de deux équations du premier degré à deux inconnues (cours, § 5)
 * ------------------------------------------------------------------------------------------- */

/** Équation e·U + f·V = k (inconnues nommées). */
export interface Eq2 {
  e: number;
  f: number;
  k: number;
}

function membreEq(eq: Eq2, u: string, v: string): string {
  return somme([
    [eq.e, u],
    [eq.f, v],
  ]);
}

export function eqLatex(eq: Eq2, u: string, v: string): string {
  return `${membreEq(eq, u, v)}=${q(eq.k)}`;
}

/** « 3\cdot 2 », « -\,(…) » : coefficient devant une valeur substituée, en tête d'un membre. */
function coefValeur(c: number, valeur: string): string {
  if (c === 1) return valeur;
  if (c === -1) return `-${valeur}`;
  return `${q(c)}\\cdot ${valeur}`;
}

/**
 * Résolution « comme au tableau » de { (1) e₁U + f₁V = k₁ ; (2) e₂U + f₂V = k₂ } (système à solution
 * unique) : une équation sans U (ou sans V) se lit directement ; sinon substitution quand une inconnue a
 * le coefficient ±1 ; sinon combinaison qui élimine V. Une transformation par ligne.
 */
export function lignesSysteme2(eq1: Eq2, eq2: Eq2, u: string, v: string, sol: { u: number; v: number }): LigneCalcul[] {
  const L: LigneCalcul[] = [];
  const eqs = [eq1, eq2];
  const autre = (i: number) => eqs[1 - i];
  const num = (i: number) => `(${i + 1})`;
  // Valeur d'une inconnue dans l'autre équation : on remplace, on calcule, on isole.
  const finir = (i: number, connue: "u" | "v") => {
    const eq = autre(i);
    const [cConnue, cCherche, nomConnue, nomCherche, valConnue, valCherche] =
      connue === "u" ? [eq.e, eq.f, u, v, sol.u, sol.v] : [eq.f, eq.e, v, u, sol.v, sol.u];
    if (net(cCherche) === 0) return;
    if (net(cConnue) === 0) {
      L.push(...lignesIsoler(cCherche, eq.k, nomCherche, valCherche, `${num(1 - i)} ne contient pas ${nomConnue}`));
      return;
    }
    const sub = connue === "u" ? `${coefValeur(eq.e, qp(valConnue))}${coefSuiteVar(eq.f, nomCherche)}` : `${mono(eq.e, nomCherche)}${coefSuiteValeur(eq.f, qp(valConnue))}`;
    L.push(ligne(`${sub}=${q(eq.k)}`, `on remplace ${nomConnue} dans ${num(1 - i)}`));
    L.push(ligne(`${coefValeurProduit(cConnue, valConnue, cCherche, nomCherche, connue === "u")}=${q(eq.k)}`));
    L.push(...lignesIsoler(cCherche, eq.k - cConnue * valConnue, nomCherche, valCherche, undefined, true, cConnue * valConnue, eq.k));
  };
  // 1. Une équation à une seule inconnue.
  for (let i = 0; i < 2; i++) {
    const eq = eqs[i];
    if (net(eq.e) === 0 || net(eq.f) === 0) {
      const [c, nom, val, connue] = net(eq.e) === 0 ? [eq.f, v, sol.v, "v" as const] : [eq.e, u, sol.u, "u" as const];
      L.push(...lignesIsoler(c, eq.k, nom, val, `${num(i)} ne contient qu'une inconnue`));
      finir(i, connue);
      return dedoublonner(L);
    }
  }
  // 2. Substitution : une inconnue de coefficient ±1.
  const choix = [
    { i: 0, x: "v" as const },
    { i: 1, x: "v" as const },
    { i: 0, x: "u" as const },
    { i: 1, x: "u" as const },
  ].find(({ i, x }) => Math.abs(x === "v" ? eqs[i].f : eqs[i].e) === 1);
  if (choix) {
    const { i, x } = choix;
    const eq = eqs[i];
    const o = autre(i);
    // x isolée : nomX = (k − c·nomY)/coefX
    const [coefX, coefY, nomX, nomY] = x === "v" ? [eq.f, eq.e, v, u] : [eq.e, eq.f, u, v];
    const a1 = net(-coefY / coefX); // nomX = a1·nomY + b1
    const b1 = net(eq.k / coefX);
    const expr = somme([
      [a1, nomY],
      [b1, ""],
    ]);
    L.push(ligne(`${nomX}=${expr}`, `on isole ${nomX} dans ${num(i)}`));
    const [cX, cY] = x === "v" ? [o.f, o.e] : [o.e, o.f];
    const facteur = net(cX) === 1 ? `+(${expr})` : net(cX) === -1 ? `-(${expr})` : cX > 0 ? `+${q(cX)}(${expr})` : `-${q(-cX)}(${expr})`;
    const tete = net(cY) === 0 ? "" : mono(cY, nomY);
    const sub = tete === "" ? facteur.replace(/^\+/, "") : `${tete}${facteur}`;
    L.push(ligne(`${sub}=${q(o.k)}`, `on remplace ${nomX} dans ${num(1 - i)}`));
    const A = net(cY + cX * a1);
    const B = net(cX * b1);
    L.push(ligne(`${somme([[A, nomY], [B, ""]])}=${q(o.k)}`, "on développe et on réduit"));
    const valY = x === "v" ? sol.u : sol.v;
    const valX = x === "v" ? sol.v : sol.u;
    L.push(...lignesIsoler(A, o.k - B, nomY, valY, undefined, true, B, o.k));
    L.push(ligne(net(a1) === 0 ? `${nomX}=${q(valX)}` : `${nomX}=${coefValeur(a1, qp(valY))}${plusQ(b1)}=${q(valX)}`, `on remplace ${nomY} dans l'expression de ${nomX}`));
    return dedoublonner(L);
  }
  // 3. Combinaison : f₂·(1) − f₁·(2) élimine V.
  const A = net(eq2.f * eq1.e - eq1.f * eq2.e);
  const K = net(eq2.f * eq1.k - eq1.f * eq2.k);
  L.push(ligne(`${mono(A, u)}=${q(K)}`, [latex(`${qp(eq2.f)}\\cdot(1)-${qp(eq1.f)}\\cdot(2)`), texte(` : ${v} disparaît`)]));
  L.push(...lignesIsoler(A, K, u, sol.u, undefined, false));
  finir(0, "u");
  return dedoublonner(L);
}

/** « +3y », « −y » : terme en inconnue après un premier terme. */
function coefSuiteVar(c: number, nom: string): string {
  if (net(c) === 0) return "";
  return c > 0 ? `+${mono(c, nom)}` : `-${mono(-c, nom)}`;
}

/** « +3\cdot 2 », « −2\cdot(−1) » : valeur substituée après un premier terme. */
function coefSuiteValeur(c: number, valeur: string): string {
  if (net(c) === 0) return "";
  if (c === 1) return `+${valeur}`;
  if (c === -1) return `-${valeur}`;
  return c > 0 ? `+${q(c)}\\cdot ${valeur}` : `-${q(-c)}\\cdot ${valeur}`;
}

/** Après substitution : « 6+3y » (produit connu calculé, terme inconnu gardé). */
function coefValeurProduit(cConnue: number, valConnue: number, cCherche: number, nomCherche: string, connueEnTete: boolean): string {
  const produitConnu = net(cConnue * valConnue);
  return connueEnTete ? somme([[produitConnu, ""], [cCherche, nomCherche]]).replace(/^0$/, "0") : somme([[cCherche, nomCherche], [produitConnu, ""]]);
}

/** c·X = k (ou c·X + r = K avec `avecReste`) : on retire le terme connu, on divise. */
export function lignesIsoler(c: number, k: number, nom: string, valeur: number, justificationDepart?: string, avecReste = false, reste = 0, K = 0): LigneCalcul[] {
  const L: LigneCalcul[] = [];
  if (avecReste && net(reste) !== 0) {
    L.push(ligne(`${mono(c, nom)}=${q(K)}${reste > 0 ? "-" : "+"}${q(Math.abs(reste))}`, reste > 0 ? `on soustrait ${nombreTexte(reste)} aux deux membres` : `on ajoute ${nombreTexte(-reste)} aux deux membres`));
    L.push(ligne(`=${q(k)}`));
  } else if (!avecReste) L.push(ligne(`${mono(c, nom)}=${q(k)}`, justificationDepart));
  if (net(c) !== 1 && net(k) === 0) L.push(ligne(`${nom}=0`, `on divise les deux membres par ${nombreTexte(c)}`));
  else if (net(c) === -1) L.push(ligne(`${nom}=${q(valeur)}`, "on change les signes des deux membres"));
  else if (net(c) !== 1) {
    // Reste fractionnaire n/d : X = n / (d·c), jamais une fraction de fraction.
    const r = rationnel(k);
    const quotient = r && r.d > 1 ? `\\dfrac{${r.n}}{${r.d}\\cdot ${qp(c)}}` : `\\dfrac{${q(k)}}{${q(c)}}`;
    L.push(ligne(`${nom}=${quotient}`, `on divise les deux membres par ${nombreTexte(c)}`));
    L.push(ligne(`=${q(valeur)}`));
  }
  return L;
}

/* ---------------------------------------------------------------------------------------------
 * Distance de deux points (cours, § 6)
 * ------------------------------------------------------------------------------------------- */

/** x_Q − x_P, y_Q − y_P, puis PQ = √(Δx² + Δy²) et la racine simplifiée. */
export function lignesDistanceDeuxPoints(p: P, qq: P, nomP = "P", nomQ = "Q"): LigneCalcul[] {
  const dx = net(qq.x - p.x);
  const dy = net(qq.y - p.y);
  const carre = (t: number) => (t < 0 || !Number.isInteger(t) ? `\\left(${q(t)}\\right)^2` : `${q(t)}^2`);
  const n2 = net(dx * dx + dy * dy);
  const r = racineCarreeLatex(n2);
  const iP = ind(nomP);
  const iQ = ind(nomQ);
  return sansDoublons([
    ligne(`x_${iQ}-x_${iP}=${q(qq.x)}-${qp(p.x)}`, "écart des abscisses"),
    ligne(`=${q(dx)}`),
    ligne(`y_${iQ}-y_${iP}=${q(qq.y)}-${qp(p.y)}`, "écart des ordonnées"),
    ligne(`=${q(dy)}`),
    ligne(`${nomP}${nomQ}=\\sqrt{${carre(dx)}+${carre(dy)}}`, "distance de deux points (Pythagore)"),
    ligne(`=\\sqrt{${q(dx * dx)}+${q(dy * dy)}}`),
    ligne(`=\\sqrt{${q(n2)}}`),
    ...(r !== `\\sqrt{${q(n2)}}` ? [ligne(`=${r}`, Number.isInteger(Math.sqrt(n2)) ? `${nombreTexte(n2)} est un carré parfait` : "on simplifie la racine")] : []),
  ]);
}

/** Retire les lignes identiques consécutives (même LaTeX) puis les « = » qui répètent la précédente. */
export function dedoublonner(lignes: LigneCalcul[]): LigneCalcul[] {
  const out: LigneCalcul[] = [];
  for (const l of lignes) {
    const prec = out[out.length - 1];
    if (prec && prec.latex.replace(/\s/g, "") === l.latex.replace(/\s/g, "")) continue;
    out.push(l);
  }
  return sansDoublons(out);
}
