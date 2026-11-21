import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../export/corrigeTableau";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { nombreTexte, plusQ, q, qp, racineSimplifiee, sansDoublons } from "./corrigeChapitre3";
import { finaliserCorrigeTriangles, largeurVisible } from "./corrigeTriangles";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 6 de 4e (Calcul vectoriel), moitié 1
 * (gen20–gen29), SANS `docx` (importées par l'appli ET les adaptateurs) — règle
 * `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau ».
 * Une transformation par ligne, la règle à droite ; notation du cours : `\vec{AB}`, composantes en
 * colonne, `A(x\,;\,y)`, norme `\|\vec{u}\|`. Jamais « déterminant » : « critère de colinéarité ».
 */

export type Fragments = FragmentConsigne[];
export interface V {
  x: number;
  y: number;
}

/** Renvois aux sections numérotées du chapitre `calcul-vectoriel.ts`. */
export const COURS_VECTEUR = "(cours, § 1)";
export const COURS_OPPOSES = "(cours, § 2)";
export const COURS_MULTIPLIER = "(cours, § 3)";
export const COURS_CHASLES = "(cours, § 6)";
export const COURS_COMPOSANTES = "(cours, § 8)";
export const COURS_ADDITION_REPERE = "(cours, § 9)";
export const COURS_MULTIPLICATION_REPERE = "(cours, § 10)";
export const COURS_NORME = "(cours, § 11)";
export const COURS_TRANSLATION_MILIEU = "(cours, § 12)";
export const COURS_COLINEARITE = "(cours, § 13)";
export const COURS_ORTHOGONALITE = "(cours, § 14)";
export const COURS_COMPARER = "(cours, § 16)";
export const COURS_RESULTANTE = "(cours, § 17)";

export const J_COMPOSANTES = "composantes : extrémité − origine";

function net(v: number): number {
  const r = Math.round(v * 1e9) / 1e9;
  return Object.is(r, -0) || r === 0 ? 0 : r;
}

// ---------------------------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------------------------

export function colonne(haut: string, bas: string): string {
  return `\\begin{pmatrix}${haut}\\\\${bas}\\end{pmatrix}`;
}

export function col(v: V): string {
  return colonne(q(v.x), q(v.y));
}

export function vec(nom: string): string {
  return `\\vec{${nom}}`;
}

export function pointL(nom: string, p: V): string {
  return `${nom}(${q(p.x)}\\,;\\,${q(p.y)})`;
}

/** Indice d'une coordonnée : `x_A`, `x_{A'}`. */
export function indice(nom: string): string {
  return nom.length > 1 ? `{${nom}}` : nom;
}

/** Coefficient devant un vecteur : « » (1), « - » (−1), « 3 », « \dfrac{1}{2} ». */
export function coefVec(k: number): string {
  return k === 1 ? "" : k === -1 ? "-" : q(k);
}

/** Terme « + k\vec{u} » / « - k\vec{u} » après un premier terme. */
export function termeVecSuite(k: number, nom: string): string {
  return `${k < 0 ? "-" : "+"}${coefVec(Math.abs(k))}${vec(nom)}`;
}

/** « a − b » (b entre parenthèses s'il est négatif). */
export function moins(a: number, b: number): string {
  return `${q(a)}-${qp(b)}`;
}

/** « a + b » (b entre parenthèses s'il est négatif). */
export function plus(a: number, b: number): string {
  return `${q(a)}+${qp(b)}`;
}

/** Produit « k·a » (facteurs négatifs entre parenthèses). */
export function fois(k: number, a: number): string {
  return `${qp(k)}\\cdot ${qp(a)}`;
}

export function sub(a: V, b: V): V {
  return { x: net(a.x - b.x), y: net(a.y - b.y) };
}

export function add(a: V, b: V): V {
  return { x: net(a.x + b.x), y: net(a.y + b.y) };
}

export function mul(k: number, a: V): V {
  return { x: net(k * a.x), y: net(k * a.y) };
}

/** Racine carrée exacte simplifiée : « 5 », « \sqrt{13} », « 3\sqrt{2} ». */
export function racineL(n: number): string {
  const { k, m } = racineSimplifiee(n);
  if (m === 1) return q(k);
  return k === 1 ? `\\sqrt{${m}}` : `${k}\\sqrt{${m}}`;
}

/** Texte d'un nombre dans une justification (« − » typographique). */
export function nT(v: number): string {
  return nombreTexte(v);
}

// ---------------------------------------------------------------------------------------------
// Lignes de calcul
// ---------------------------------------------------------------------------------------------

/** Composantes de \vec{AB} : extrémité − origine, puis la colonne. */
export function lignesComposantes(nom: string, a: V, b: V, justification: string | Fragments = J_COMPOSANTES): LigneCalcul[] {
  return [ligne(`${vec(nom)}=${colonne(moins(b.x, a.x), moins(b.y, a.y))}`, justification), ligne(`=${col(sub(b, a))}`)];
}

/** k\vec{u} : chaque composante multipliée par k. `gauche` : membre de gauche (« 3\vec{u} »). */
export function lignesMultiple(gauche: string, k: number, v: V, justification: string | Fragments = "chaque composante est multipliée par le coefficient"): LigneCalcul[] {
  if (k === 1) return [ligne(`${gauche}=${col(v)}`)];
  return sansDoublons([ligne(`${gauche}=${colonne(fois(k, v.x), fois(k, v.y))}`, justification), ligne(`=${col(mul(k, v))}`)]);
}

/** Coordonnée d'un point d'arrivée : `x_F = x_B + x_u`, substituée puis calculée. */
export function lignesCoordonnee(axe: "x" | "y", nomPoint: string, depart: number, deplacement: number, justification?: string | Fragments): LigneCalcul[] {
  return [ligne(`${axe}_${indice(nomPoint)}=${plus(depart, deplacement)}`, justification), ligne(`=${q(depart + deplacement)}`)];
}

/** Carré écrit : « 3^2 », « (-3)^2 ». */
export function carre(v: number): string {
  return `${qp(v)}^2`;
}

/** Norme d'un vecteur : `\|\vec{u}\|=\sqrt{x^2+y^2}` substituée, carrés, somme, racine simplifiée. */
export function lignesNorme(gauche: string, v: V, justification: string | Fragments = "norme : racine de la somme des carrés des composantes"): LigneCalcul[] {
  const n = v.x * v.x + v.y * v.y;
  const lignes: LigneCalcul[] = [ligne(`${gauche}=\\sqrt{${carre(v.x)}+${carre(v.y)}}`, justification), ligne(`=\\sqrt{${q(v.x * v.x)}+${q(v.y * v.y)}}`, "chaque carré est positif"), ligne(`=\\sqrt{${q(n)}}`)];
  const r = racineL(n);
  if (r !== `\\sqrt{${q(n)}}`) lignes.push(ligne(`=${r}`, Number.isInteger(Math.sqrt(n)) ? `${nT(n)} est un carré parfait` : `on simplifie la racine : ${nT(n)} = ${nT(racineSimplifiee(n).k ** 2)} · ${nT(racineSimplifiee(n).m)}`));
  return sansDoublons(lignes);
}

/** Critère de colinéarité x_u·y_v − y_u·x_v substitué, produits, valeur. */
export function lignesCritereColinearite(u: V, v: V, justification: string | Fragments = "critère de colinéarité"): LigneCalcul[] {
  const p1 = net(u.x * v.y);
  const p2 = net(u.y * v.x);
  return sansDoublons([ligne(`${fois(u.x, v.y)}-${fois(u.y, v.x)}=${q(p1)}-${qp(p2)}`, justification), ligne(`=${q(p1 - p2)}`)]);
}

/** Critère d'orthogonalité x_u·x_v + y_u·y_v substitué, produits, valeur. */
export function lignesCritereOrthogonalite(u: V, v: V, justification: string | Fragments = "critère d'orthogonalité (produit scalaire)"): LigneCalcul[] {
  const p1 = net(u.x * v.x);
  const p2 = net(u.y * v.y);
  return sansDoublons([ligne(`${fois(u.x, v.x)}+${fois(u.y, v.y)}=${q(p1)}+${qp(p2)}`, justification), ligne(`=${q(p1 + p2)}`)]);
}

// ---------------------------------------------------------------------------------------------
// Expressions affines en x (variantes « avec x ») et produits développés
// ---------------------------------------------------------------------------------------------

export interface Lin {
  coefX: number;
  constante: number;
}

/** Polynôme [c₀, c₁, c₂] (degré ≤ 2). */
export type Poly = [number, number, number];

export function linLatex(e: Lin): string {
  return polyLatex([e.constante, e.coefX, 0]);
}

/** « 2x^2-3x+1 » (termes nuls omis, « 0 » si tout est nul). */
export function polyLatex(p: Poly): string {
  const termes: string[] = [];
  const parties = ["", "x", "x^2"];
  for (let d = 2; d >= 0; d--) {
    const c = net(p[d]);
    if (c === 0) continue;
    const abs = Math.abs(c);
    const corps = d === 0 ? q(abs) : abs === 1 ? parties[d] : `${q(abs)}${parties[d]}`;
    termes.push(termes.length === 0 ? `${c < 0 ? "-" : ""}${corps}` : `${c < 0 ? "-" : "+"}${corps}`);
  }
  return termes.length ? termes.join("") : "0";
}

/** Facteur affine entre parenthèses si besoin (x présent ou négatif). */
export function facteurLin(e: Lin): string {
  const s = linLatex(e);
  return (e.coefX !== 0 && e.constante !== 0) || s.startsWith("-") ? `(${s})` : s;
}

/** Espace fine des milliers dans les nombres de 5 chiffres ou plus d'une formule (« 1\\,170\\,724 »). */
export function milliers(latexSource: string): string {
  return latexSource.replace(/(?<![\\d.,}])\d{5,}(?![\d])/g, (n) => n.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,"));
}

export function produitLin(a: Lin, b: Lin): Poly {
  return [net(a.constante * b.constante), net(a.coefX * b.constante + a.constante * b.coefX), net(a.coefX * b.coefX)];
}

export function moinsPoly(a: Poly, b: Poly): Poly {
  return [net(a[0] - b[0]), net(a[1] - b[1]), net(a[2] - b[2])];
}

export function plusPoly(a: Poly, b: Poly): Poly {
  return [net(a[0] + b[0]), net(a[1] + b[1]), net(a[2] + b[2])];
}

export function oppose(e: Lin): Lin {
  return { coefX: net(-e.coefX), constante: net(-e.constante) };
}

/** Écriture d'un polynôme entre parenthèses s'il a plusieurs termes ou commence par « − ». */
function entreParentheses(p: Poly): string {
  const s = polyLatex(p);
  const nbTermes = p.filter((c) => net(c) !== 0).length;
  return nbTermes > 1 || s.startsWith("-") ? `(${s})` : s;
}

/**
 * Critère (colinéarité : « − » ; orthogonalité : « + ») de deux produits de facteurs affines,
 * développé ligne à ligne : produits développés, signe distribué, réduit. Les lignes sont des
 * IDENTITÉS en x (le membre de gauche est la formule substituée de l'écran).
 */
export function lignesCritereLin(formuleSubstituee: string, p1: [Lin, Lin], p2: [Lin, Lin], operation: "-" | "+", justification: string | Fragments): { lignes: LigneCalcul[]; reduit: Poly } {
  const a = produitLin(p1[0], p1[1]);
  const b = produitLin(p2[0], p2[1]);
  const reduit = operation === "-" ? moinsPoly(a, b) : plusPoly(a, b);
  const aL = polyLatex(a);
  // « A − (B) » écrit sans parenthèses : signe distribué (ou parenthèses retirées).
  let distribue: string | null = null;
  const bTermes = b.filter((c) => net(c) !== 0).length;
  if (bTermes > 1 || polyLatex(b).startsWith("-")) {
    const bSigne: Poly = operation === "-" ? [-b[0], -b[1], -b[2]] : b;
    const termesB: string[] = [];
    for (let d = 2; d >= 0; d--) {
      const c = net(bSigne[d]);
      if (c === 0) continue;
      const p: Poly = [0, 0, 0];
      p[d] = Math.abs(c);
      termesB.push(`${c < 0 ? "-" : "+"}${polyLatex(p)}`);
    }
    distribue = aL === "0" ? termesB.join("").replace(/^\+/, "") : `${aL}${termesB.join("")}`;
  }
  const jDistribue = operation === "-" ? "on distribue le signe −" : "on retire les parenthèses";
  const premiere = `${formuleSubstituee}=${aL}${operation}${entreParentheses(b)}`;
  const lignes: LigneCalcul[] = [];
  // Mesuré sur papier (680 px) : au-delà de ≈ 32 caractères visibles, le membre de droite se coupait.
  if (largeurVisible(premiere) <= 32) {
    lignes.push(ligne(premiere, justification));
    if (distribue && largeurVisible(distribue) <= 22) lignes.push(ligne(`=${distribue}`, jDistribue));
    else if (distribue) {
      lignes.push(ligne(`=${polyLatex(reduit)}`, operation === "-" ? "on soustrait les termes de même degré" : "on additionne les termes de même degré"));
      return { lignes: sansDoublons(lignes), reduit };
    }
  } else {
    // Ligne trop longue pour la colonne (≈ 44 caractères visibles) : un produit développé par ligne, puis leur combinaison.
    lignes.push(
      ligne(`P_1=${facteurLin(p1[0])}\\cdot ${facteurLin(p1[1])}`, [...(typeof justification === "string" ? [texte(justification)] : justification), texte(" : premier produit P₁")]),
      ligne(`=${aL}`, "on développe"),
      ligne(`P_2=${facteurLin(p2[0])}\\cdot ${facteurLin(p2[1])}`, "second produit P₂"),
      ligne(`=${polyLatex(b)}`, "on développe"),
    );
    const combinaison = distribue ?? `${aL}${operation}${polyLatex(b)}`;
    // Combinaison trop longue pour la colonne : on réduit directement (termes de même degré).
    if (largeurVisible(combinaison) <= 16) lignes.push(ligne(`P_1${operation}P_2=${combinaison}`, operation === "-" ? "on distribue le signe −" : "on additionne les deux produits"));
    else {
      lignes.push(ligne(`P_1${operation}P_2=${polyLatex(reduit)}`, operation === "-" ? "on soustrait les termes de même degré" : "on additionne les termes de même degré"));
      return { lignes: sansDoublons(lignes), reduit };
    }
  }
  lignes.push(ligne(`=${polyLatex(reduit)}`, "on réduit"));
  return { lignes: sansDoublons(lignes), reduit };
}

/** Composantes d'un vecteur dont les points dépendent de x : extrémité − origine, puis réduites. */
export function lignesComposantesLin(nom: string, a: { x: Lin; y: Lin }, b: { x: Lin; y: Lin }): LigneCalcul[] {
  const diff = (u: Lin, w: Lin) => `${linLatex(u)}-${facteurLin(w)}`;
  const r = (u: Lin, w: Lin): Lin => ({ coefX: net(u.coefX - w.coefX), constante: net(u.constante - w.constante) });
  return sansDoublons([ligne(`${vec(nom)}=${colonne(diff(b.x, a.x), diff(b.y, a.y))}`, J_COMPOSANTES), ligne(`=${colonne(linLatex(r(b.x, a.x)), linLatex(r(b.y, a.y)))}`)]);
}

// ---------------------------------------------------------------------------------------------
// Finalisation
// ---------------------------------------------------------------------------------------------

/** Formules des phrases rédigées groupées `{…}` (aucune coupure à « = ») — même règle que 4e ch. 5. */
export function finaliserCorrigeVecteurs(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return finaliserCorrigeTriangles(etapes);
}

export { plusQ, q, qp, sansDoublons, latex, texte };

// ---------------------------------------------------------------------------------------------
// Étapes partagées par gen20 et gen21 (point à partir d'une relation vectorielle)
// ---------------------------------------------------------------------------------------------

/** Coordonnées d'un point d'arrivée : départ + composantes du déplacement (deux lignes par axe). */
export function lignesPointArrivee(nom: string, depart: V, deplacement: V, nomDeplacement: string): LigneCalcul[] {
  return [
    ...lignesCoordonnee("x", nom, depart.x, deplacement.x, [texte("abscisse : départ + première composante de "), latex(nomDeplacement)]),
    ...lignesCoordonnee("y", nom, depart.y, deplacement.y, [texte("ordonnée : départ + seconde composante de "), latex(nomDeplacement)]),
  ];
}

/** Image d'un point par une translation de vecteur donné en colonne. */
export function etapesTranslationPoint(l: string, o: { labelPoint: string; point: V; translation: V; pointCherche: string; reponse: V }): EtapeCorrection[] {
  const P = o.pointCherche;
  const nomVec = vec(`${o.labelPoint}${P}`);
  return [
    utilise(l, [
      texte(`${P} est l'image de ${o.labelPoint} par la translation de vecteur `),
      latex(col(o.translation)),
      texte(" : "),
      latex(`${nomVec}=${col(o.translation)}`),
      texte(`, donc on ajoute chaque composante du vecteur à la coordonnée correspondante de ${o.labelPoint} ${COURS_TRANSLATION_MILIEU}.`),
    ]),
    calcul(l, lignesPointArrivee(P, o.point, o.translation, col(o.translation))),
    resultat(l, [latex(pointL(P, o.reponse))]),
    verification(l, [texte("Les composantes de "), latex(nomVec), texte(" redonnent le vecteur de translation : ")], lignesComposantes(`${o.labelPoint}${P}`, o.point, o.reponse)),
    piege(l, [texte("On ajoute les composantes du vecteur aux coordonnées du point de départ ; une composante négative s'écrit entre parenthèses pour ne pas se tromper de signe.")]),
  ];
}

/** \vec{BF} = k\vec{BE} : composantes de \vec{BE}, puis k\vec{BE}, puis F = B + \vec{BF}. */
export function etapesMultiplePoint(l: string, o: { labelOrigine: string; pointOrigine: V; labelConnu: string; pointConnu: V; coefficient: number; pointCherche: string; reponse: V }, avecUtilise = true): EtapeCorrection[] {
  const { pointOrigine: B, labelOrigine: b, pointConnu: E, labelConnu: c, coefficient: k, pointCherche: P } = o;
  const be = sub(E, B);
  const bf = mul(k, be);
  const nomBE = `${b}${c}`;
  const nomBF = `${b}${P}`;
  return [
    ...(avecUtilise
      ? [
          utilise(l, [
            texte("Composantes d'un vecteur : extrémité − origine ; multiplier un vecteur par un réel multiplie chaque composante "),
            texte(`${COURS_MULTIPLICATION_REPERE}. Puis ${P} = ${b} + `),
            latex(vec(nomBF)),
            texte(` ${COURS_TRANSLATION_MILIEU}.`),
          ]),
        ]
      : []),
    calcul(l, lignesComposantes(nomBE, B, E), [], `Composantes de ${nomBE}`),
    calcul(l, lignesMultiple(`${vec(nomBF)}=${coefVec(k)}${vec(nomBE)}`, k, be), [], `Vecteur ${nomBF}`),
    calcul(l, lignesPointArrivee(P, B, bf, vec(nomBF)), [], `Coordonnées de ${P}`),
    resultat(l, [latex(pointL(P, o.reponse))]),
    verification(l, [texte("Les composantes de "), latex(vec(nomBF)), texte(" recalculées depuis les points : ")], [
      ligne(`${vec(nomBF)}=${colonne(moins(o.reponse.x, B.x), moins(o.reponse.y, B.y))}=${col(bf)}`, [texte("c'est bien "), latex(`${coefVec(k)}${vec(nomBE)}`)]),
    ]),
    piege(l, [texte("Le vecteur multiplié part de "), latex(b), texte(" : on ajoute le résultat aux coordonnées de "), latex(b), texte(", pas à celles de "), latex(c), texte(".")]),
  ];
}

/** Résolution de a·x + b = 0 : on retire b, on divise par a (une opération par ligne). */
export function lignesPremierDegreNul(a: number, b: number): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`${polyLatex([b, a, 0])}=0`)];
  if (net(b) !== 0) lignes.push(ligne(`${polyLatex([0, a, 0])}=${q(-b)}`, b > 0 ? `on soustrait ${nT(b)} aux deux membres` : `on ajoute ${nT(-b)} aux deux membres`));
  if (net(a) !== 1) {
    lignes.push(ligne(`x=\\dfrac{${q(-b)}}{${q(a)}}`, `on divise les deux membres par ${nT(a)}`));
    const sol = net(-b / a);
    if (q(sol) !== `\\dfrac{${q(-b)}}{${q(a)}}`) lignes.push(ligne(`=${q(sol)}`, Number.isInteger(sol) ? undefined : "fraction simplifiée"));
  }
  return lignes;
}
