import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { moinsH, plusQ, q, qp, sansDoublons, somme } from "./corrigeChapitre3";
import {
  carreLatex,
  colonne,
  droiteLatex,
  membreDroite,
  milieu,
  nb,
  norme2,
  racine,
  racineDetaillee,
  reduireDroite,
  valeurDroite,
  vecteur,
  type Droite,
  type Fragments,
  type Pt,
} from "./geometrieLotG";

/**
 * Briques du corrigé détaillé « comme au tableau » du lot G du chapitre 7 de 4e (gen92–gen95), sans
 * `docx` (importées par l'appli ET les adaptateurs) : une transformation par ligne, la règle à droite.
 * Renvois au cours : numéros des sections du chapitre (§ 4 parallèles et perpendiculaires, § 5
 * intersection, § 6 distance, § 7 lieux et médiatrice, § 8 cercle).
 */

export const COURS_REPERER = "(cours, § 1)";
export const COURS_RELATIONS = "(cours, § 4)";
export const COURS_INTERSECTION = "(cours, § 5)";
export const COURS_DISTANCE = "(cours, § 6)";
export const COURS_LIEU = "(cours, § 7)";
export const COURS_CERCLE = "(cours, § 8)";

/** Coefficient devant une parenthèse en tête : « » (1), « - » (−1), « 3 ». */
function coefTete(c: number): string {
  return c === 1 ? "" : c === -1 ? "-" : q(c);
}

/** Terme « ± c(expr) » après un premier terme. */
function coefSuite(c: number): string {
  if (c === 1) return "+";
  if (c === -1) return "-";
  return c > 0 ? `+${q(c)}` : `-${q(-c)}`;
}

/** « a(x−x_P)+b(y−y_P) » (facteur nul omis). */
export function formeNormale(n: Pt, p: Pt): string {
  const terme = (c: number, v: number, variable: "x" | "y", premier: boolean) => {
    if (v === 0) {
      const t = c === 1 ? variable : c === -1 ? `-${variable}` : `${q(c)}${variable}`;
      return premier || t.startsWith("-") ? t : `+${t}`;
    }
    return `${premier ? coefTete(c) : coefSuite(c)}(${moinsH(v, variable)})`;
  };
  const termes: string[] = [];
  if (n.x !== 0) termes.push(terme(n.x, p.x, "x", true));
  if (n.y !== 0) termes.push(terme(n.y, p.y, "y", termes.length === 0));
  return termes.join("");
}

/** Droite par P de vecteur normal n : a(x − x_P) + b(y − y_P) = 0, développée, réduite, simplifiée. */
export function lignesDroiteNormale(n: Pt, p: Pt, justificationDepart: string | Fragments): LigneCalcul[] {
  const brut: Droite = { a: n.x, b: n.y, c: -(n.x * p.x + n.y * p.y) };
  const lignes: LigneCalcul[] = [ligne(`${formeNormale(n, p)}=0`, justificationDepart)];
  const developpe = somme([
    [n.x, "x"],
    [-n.x * p.x, ""],
    [n.y, "y"],
    [-n.y * p.y, ""],
  ]);
  if (developpe !== membreDroite(brut)) lignes.push(ligne(`${developpe}=0`, "on distribue"));
  lignes.push(ligne(`${droiteLatex(brut)}`, "on réduit"));
  const r = reduireDroite(brut);
  if (r.a !== brut.a || r.b !== brut.b || r.c !== brut.c) {
    const k = brut.a !== 0 ? brut.a / r.a : brut.b / r.b;
    lignes.push(ligne(droiteLatex(r), Number.isInteger(k) ? `on divise les deux membres par ${nb(k)}` : `on multiplie les deux membres par ${nb(1 / k)}`));
  }
  return dedoublonner(lignes);
}

/** Retire les lignes identiques consécutives (même LaTeX), la justification passe sur la gardée. */
export function dedoublonner(lignes: LigneCalcul[]): LigneCalcul[] {
  const out: LigneCalcul[] = [];
  for (const l of lignes) {
    const prec = out[out.length - 1];
    if (prec && prec.latex.replace(/\s/g, "") === l.latex.replace(/\s/g, "")) continue;
    out.push(l);
  }
  return sansDoublons(out);
}

/** Vérification « le point P est sur d » : « a·x_P + b·y_P + c = 0 ». */
export function lignesPointSurDroite(d: Droite, p: Pt, nomPoint: string): LigneCalcul[] {
  const termes: string[] = [];
  const fois = (c: number, v: number, premier: boolean) => {
    if (c === 0) return;
    const t = `${c === 1 ? "" : c === -1 ? "-" : q(c)}${c === 1 || c === -1 ? qp(v) : `\\cdot ${qp(v)}`}`;
    termes.push(premier || t.startsWith("-") ? t : `+${t}`);
  };
  fois(d.a, p.x, true);
  fois(d.b, p.y, termes.length === 0);
  const constante = d.c === 0 ? "" : d.c > 0 ? `+${q(d.c)}` : `-${q(-d.c)}`;
  const v = valeurDroite(d, p.x, p.y);
  return [ligne(`${termes.join("")}${constante}=${q(v)}`, Math.abs(v) < 1e-9 ? `${nomPoint} vérifie l'équation : il est sur la droite` : `${nomPoint} ne vérifie pas l'équation`)];
}

/** Composantes d'un vecteur AB : « \vec{AB}=\begin{pmatrix}x_B−x_A\\…\end{pmatrix}=… ». */
export function lignesVecteur(nom: string, a: Pt, b: Pt): LigneCalcul[] {
  const v = vecteur(a, b);
  const diff = (u: number, w: number) => `${q(u)}-${qp(w)}`;
  return dedoublonner([
    ligne(`\\vec{${nom}}=\\begin{pmatrix}${diff(b.x, a.x)}\\\\${diff(b.y, a.y)}\\end{pmatrix}`, "arrivée moins départ"),
    ligne(`=${colonne(v)}`),
  ]);
}

/** Norme : « AB=\sqrt{u^2+v^2}=\sqrt{n}=… » (une égalité par ligne). */
export function lignesNorme(nom: string, v: Pt, justification = "norme du vecteur (Pythagore)"): LigneCalcul[] {
  const carre = (t: number) => (t < 0 ? `(${q(t)})^2` : `${q(t)}^2`);
  const n = norme2(v);
  const lignes: LigneCalcul[] = [ligne(`${nom}=\\sqrt{${carre(v.x)}+${carre(v.y)}}`, justification), ligne(`=\\sqrt{${q(n)}}`)];
  const r = racine(n);
  if (r !== `\\sqrt{${q(n)}}`) lignes.push(ligne(`=${r}`, Number.isInteger(Math.sqrt(n)) ? `${nb(n)} est un carré parfait` : "on simplifie la racine"));
  return lignes;
}

/** Milieu de [AB] : « x_M=\dfrac{x_A+x_B}{2}=… », idem pour y. */
export function lignesMilieu(nom: string, a: Pt, b: Pt): LigneCalcul[] {
  const m = milieu(a, b);
  const somme2 = (u: number, w: number) => `\\dfrac{${q(u)}+${qp(w)}}{2}`;
  const indice = nom.length > 1 ? `{${nom}}` : nom;
  return [
    ligne(`x_${indice}=${somme2(a.x, b.x)}=${q(m.x)}`, "moyenne des abscisses"),
    ligne(`y_${indice}=${somme2(a.y, b.y)}=${q(m.y)}`, "moyenne des ordonnées"),
  ];
}

/** Centre et rayon depuis « x²+y²+Dx+Ey+F=0 » (coefficient 1) : regrouper, compléter les carrés. */
export function lignesCentreRayon(c: Pt, r2: number): LigneCalcul[] {
  const D = -2 * c.x;
  const E = -2 * c.y;
  const F = c.x * c.x + c.y * c.y - r2;
  const groupe = (coef: number, v: "x" | "y") => (coef === 0 ? `${v}^2` : `(${somme([[1, `${v}^2`], [coef, v]])})`);
  const complete = (a: number, v: "x" | "y") => (a === 0 ? `${v}^2` : `${carreLatex(a, v)}-${q(a * a)}`);
  const lignes: LigneCalcul[] = [
    ligne(`${somme([[1, "x^2"], [1, "y^2"], [D, "x"], [E, "y"], [F, ""]])}=0`, "l'équation donnée"),
    ligne(`${groupe(D, "x")}+${groupe(E, "y")}=${q(-F)}`, "on regroupe les termes en x et en y, la constante passe à droite"),
  ];
  if (c.x !== 0 || c.y !== 0) {
    lignes.push(
      ligne(`${complete(c.x, "x")}+${complete(c.y, "y")}=${q(-F)}`, [texte("on complète les carrés : "), latex("x^2-2ax=(x-a)^2-a^2")]),
    );
  }
  lignes.push(ligne(`${carreLatex(c.x, "x")}+${carreLatex(c.y, "y")}=${q(r2)}`, "on regroupe les constantes à droite"));
  return dedoublonner(lignes);
}

/**
 * Pied H de la perpendiculaire à d ≡ ax + by + c = 0 menée par C, comme dans le cours (§ 6) :
 * perpendiculaire paramétrique de vecteur directeur (a ; b), substitution dans d, valeur de t, H.
 * Droite verticale ou horizontale : raccourci (H a l'abscisse de d et l'ordonnée de C, ou l'inverse).
 */
export function lignesPied(d: Droite, c: Pt, h: Pt, nomCentre = "C"): LigneCalcul[] {
  if (d.b === 0) {
    const k = -d.c / d.a;
    return [
      ligne(`d\\equiv x=${q(k)}`, "d est verticale"),
      ligne(`x_H=${q(k)}`, "H est sur d"),
      ligne(`y_H=y_{${nomCentre}}=${q(c.y)}`, `la perpendiculaire par ${nomCentre} est horizontale`),
    ];
  }
  if (d.a === 0) {
    const k = -d.c / d.b;
    return [
      ligne(`d\\equiv y=${q(k)}`, "d est horizontale"),
      ligne(`y_H=${q(k)}`, "H est sur d"),
      ligne(`x_H=x_{${nomCentre}}=${q(c.x)}`, `la perpendiculaire par ${nomCentre} est verticale`),
    ];
  }
  const n2 = d.a * d.a + d.b * d.b;
  const v = valeurDroite(d, c.x, c.y);
  const t = -v / n2;
  const coord = (c0: number, k: number) => somme([[c0, ""], [k, "t"]]);
  const facteur = (k: number, expr: string, premier: boolean) => (premier ? `${coefTete(k)}(${expr})` : `${coefSuite(k)}(${expr})`);
  const subst = `${facteur(d.a, coord(c.x, d.a), true)}${facteur(d.b, coord(c.y, d.b), false)}${plusQ(d.c)}`;
  return dedoublonner([
    ligne(`\\vec{n}=${colonne({ x: d.a, y: d.b })}`, "vecteur normal de d : directeur de la perpendiculaire p"),
    ligne(`p\\equiv\\begin{cases}x=${coord(c.x, d.a)}\\\\y=${coord(c.y, d.b)}\\end{cases}`, `p passe par ${nomCentre}`),
    ligne(`${subst}=0`, "H est sur d : on remplace x et y dans l'équation de d"),
    ligne(`${somme([[n2, "t"], [v, ""]])}=0`, "on développe et on réduit"),
    ligne(`t=${q(t)}`),
    ligne(`x_H=${q(c.x)}${d.a < 0 ? "-" : "+"}${Math.abs(d.a) === 1 ? qp(t) : `${q(Math.abs(d.a))}\\cdot ${qp(t)}`}=${q(h.x)}`, "on remplace t dans p"),
    ligne(`y_H=${q(c.y)}${d.b < 0 ? "-" : "+"}${Math.abs(d.b) === 1 ? qp(t) : `${q(Math.abs(d.b))}\\cdot ${qp(t)}`}=${q(h.y)}`),
  ]);
}

/** Distance CH : composantes de CH puis norme (ou écart d'abscisses / d'ordonnées si d est axiale). */
export function lignesDistance(d: Droite, c: Pt, h: Pt, nomCentre = "C"): LigneCalcul[] {
  if (d.b === 0) return [ligne(`${nomCentre}H=|x_{${nomCentre}}-x_H|=|${q(c.x)}-${qp(h.x)}|`, "d est verticale : écart des abscisses"), ligne(`=${q(Math.abs(c.x - h.x))}`)];
  if (d.a === 0) return [ligne(`${nomCentre}H=|y_{${nomCentre}}-y_H|=|${q(c.y)}-${qp(h.y)}|`, "d est horizontale : écart des ordonnées"), ligne(`=${q(Math.abs(c.y - h.y))}`)];
  return [...lignesVecteur(`${nomCentre}H`, c, h), ...lignesNorme(`${nomCentre}H`, vecteur(c, h))];
}

/**
 * Intersection de deux droites sécantes, résolue « comme au tableau » : par substitution quand une
 * inconnue a le coefficient ±1, sinon par combinaison (on élimine y). Équations numérotées (1), (2).
 */
export function lignesIntersection(d1: Droite, d2: Droite, sol: Pt, nom = "I"): LigneCalcul[] {
  const L: LigneCalcul[] = [];
  const indice = nom.length > 1 ? `{${nom}}` : nom;
  // Inconnue isolable : coefficient ±1.
  const choix: { eq: 1 | 2; v: "x" | "y" } | null =
    Math.abs(d1.b) === 1 ? { eq: 1, v: "y" } : Math.abs(d2.b) === 1 ? { eq: 2, v: "y" } : Math.abs(d1.a) === 1 ? { eq: 1, v: "x" } : Math.abs(d2.a) === 1 ? { eq: 2, v: "x" } : null;
  if (choix) {
    const [di, dj] = choix.eq === 1 ? [d1, d2] : [d2, d1];
    if (choix.v === "y") {
      // y = −(a x + c)/b
      const m = -di.a / di.b;
      const p = -di.c / di.b;
      const expr = somme([
        [m, "x"],
        [p, ""],
      ]);
      L.push(ligne(`y=${expr}`, `on isole y dans (${choix.eq})`));
      const A = dj.a + dj.b * m;
      const B = dj.b * p + dj.c;
      if (dj.b !== 0) {
        const sub = m === 0 ? `${somme([[dj.a, "x"]])}${dj.b < 0 ? "-" : "+"}${Math.abs(dj.b) === 1 ? qp(p) : `${q(Math.abs(dj.b))}\\cdot ${qp(p)}`}${plusQ(dj.c)}` : `${somme([[dj.a, "x"]])}${coefSuite(dj.b)}(${expr})${plusQ(dj.c)}`;
        L.push(ligne(`${dj.a === 0 ? `${coefTete(dj.b)}(${expr})${plusQ(dj.c)}` : sub}=0`, `on remplace y dans (${choix.eq === 1 ? 2 : 1})`));
        L.push(ligne(`${somme([[A, "x"], [B, ""]])}=0`, "on développe et on réduit"));
      } else {
        L.push(ligne(`${somme([[A, "x"], [B, ""]])}=0`, `(${choix.eq === 1 ? 2 : 1}) ne contient pas y`));
      }
      L.push(ligne(`x_${indice}=${q(sol.x)}`));
      L.push(ligne(m === 0 || sol.x === 0 ? `y_${indice}=${q(sol.y)}` : `y_${indice}=${substX(m, p, sol.x)}=${q(sol.y)}`, "on remplace x"));
    } else {
      const m = -di.b / di.a;
      const p = -di.c / di.a;
      const expr = somme([
        [m, "y"],
        [p, ""],
      ]);
      L.push(ligne(`x=${expr}`, `on isole x dans (${choix.eq})`));
      const A = dj.b + dj.a * m;
      const B = dj.a * p + dj.c;
      if (dj.a !== 0) {
        const sub = `${m === 0 ? `${dj.a === 1 ? "" : dj.a === -1 ? "-" : `${q(dj.a)}\\cdot `}${qp(p)}` : `${coefTete(dj.a)}(${expr})`}${dj.b === 0 ? "" : dj.b > 0 ? `+${mono1(dj.b, "y")}` : `-${mono1(-dj.b, "y")}`}${plusQ(dj.c)}`;
        L.push(ligne(`${sub}=0`, `on remplace x dans (${choix.eq === 1 ? 2 : 1})`));
        L.push(ligne(`${somme([[A, "y"], [B, ""]])}=0`, "on développe et on réduit"));
      } else {
        L.push(ligne(`${somme([[A, "y"], [B, ""]])}=0`, `(${choix.eq === 1 ? 2 : 1}) ne contient pas x`));
      }
      L.push(ligne(`y_${indice}=${q(sol.y)}`));
      L.push(ligne(m === 0 || sol.y === 0 ? `x_${indice}=${q(sol.x)}` : `x_${indice}=${substX(m, p, sol.y)}=${q(sol.x)}`, "on remplace y"));
    }
    return dedoublonner(L);
  }
  // Une équation sans y : x se lit directement.
  if (d1.b === 0 || d2.b === 0) {
    const [dx, nx, dy0, ny] = d1.b === 0 ? [d1, 1, d2, 2] : [d2, 2, d1, 1];
    L.push(ligne(`${somme([[dx.a, "x"], [dx.c, ""]])}=0`, `(${nx}) ne contient pas y`));
    L.push(ligne(`x_${indice}=${q(sol.x)}`));
    L.push(ligne(`${coefTete(dy0.b)}y=${q(-dy0.c - dy0.a * sol.x)}`, `on remplace x dans (${ny})`));
    L.push(ligne(`y_${indice}=${q(sol.y)}`));
    return dedoublonner(L);
  }
  // Combinaison : b2·(1) − b1·(2) élimine y.
  const k1 = d2.b;
  const k2 = d1.b;
  const A = k1 * d1.a - k2 * d2.a;
  const C = k1 * d1.c - k2 * d2.c;
  L.push(ligne(`${somme([[A, "x"], [C, ""]])}=0`, [latex(`${qp(k1)}\\cdot(1)-${qp(k2)}\\cdot(2)`), texte(" : y disparaît")]));
  L.push(ligne(`x_${indice}=${q(sol.x)}`));
  const [dy, numero] = d1.b !== 0 ? [d1, 1] : [d2, 2];
  L.push(ligne(`${coefTete(dy.b)}y=${q(-dy.c - dy.a * sol.x)}`, [texte(`on remplace x dans (${numero})`)]));
  L.push(ligne(`y_${indice}=${q(sol.y)}`));
  return dedoublonner(L);
}

function mono1(c: number, v: string): string {
  return c === 1 ? v : `${q(c)}${v}`;
}

/** « m·(valeur)+p » écrit pour une substitution numérique. */
function substX(m: number, p: number, v: number): string {
  const terme = m === 0 ? "" : m === 1 ? qp(v) : m === -1 ? `-${qp(v)}` : `${q(m)}\\cdot ${qp(v)}`;
  return `${terme}${terme === "" ? q(p) : plusQ(p)}` || "0";
}

/** Les deux équations numérotées d'un système, en lignes (affichage). */
export function lignesSysteme(d1: Droite, d2: Droite, j1: string, j2: string): LigneCalcul[] {
  return [ligne(`\\text{(1)}\\;\\;${droiteLatex(d1)}`, j1), ligne(`\\text{(2)}\\;\\;${droiteLatex(d2)}`, j2)];
}

/** « r=\sqrt{n}=… » */
export function rayonLatex(r2: number): string {
  return `r=${racineDetaillee(r2)}`;
}

/** Équation du cercle de centre c et de rayon √r2 : substitution, rayon élevé au carré. */
export function lignesEquationCercle(c: Pt, r2: number): LigneCalcul[] {
  const r = Math.sqrt(r2);
  const membre = `${carreLatex(c.x, "x")}+${carreLatex(c.y, "y")}`;
  return dedoublonner([
    ligne(`${membre}=${Number.isInteger(r) ? `${q(r)}^2` : `\\left(${racine(r2)}\\right)^2`}`, `centre (${nb(c.x)} ; ${nb(c.y)}), rayon r`),
    ligne(`${membre}=${q(r2)}`, "on élève le rayon au carré"),
  ]);
}

/** Vérification « le point P est sur le cercle » : (x_P − x₀)² + (y_P − y₀)² = r². */
export function lignesPointSurCercle(c: Pt, r2: number, p: Pt, nomPoint: string): LigneCalcul[] {
  const carre = (v: number, c0: number) => (c0 === 0 ? (v < 0 ? `(${q(v)})^2` : `${q(v)}^2`) : `(${q(v)}${c0 < 0 ? `+${q(-c0)}` : `-${q(c0)}`})^2`);
  const val = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
  return [ligne(`${carre(p.x, c.x)}+${carre(p.y, c.y)}=${q(val)}`, Math.abs(val - r2) < 1e-9 ? `${nomPoint} vérifie l'équation : il est sur le cercle` : `${nomPoint} ne vérifie pas l'équation`)];
}

export { racine };
