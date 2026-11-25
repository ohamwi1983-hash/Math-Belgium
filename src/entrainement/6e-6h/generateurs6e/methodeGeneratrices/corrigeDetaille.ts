import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { ExerciceMethodeGeneratrices, MorceauLieu } from "../../core6e/methodeGeneratrices.types";
import { phasesPourExercice } from "../../moteur6e/typesMethodeGeneratrices";
import type { PhaseMethodeGeneratrices } from "../../moteur6e/typesMethodeGeneratrices";
import { latexN, latexQ, q } from "../../moteur6e/algebreLieux";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours } from "../../ui6e/corrigeCombinatoire";
import { COURS_GENERATRICES, avecFigure } from "../../ui6e/corrigeLieux";
import { figure6gen57 } from "../../ui6e/formatMethodeGeneratrices";

/**
 * Corrigé détaillé « comme au tableau » de `6gen57` (méthode des génératrices, 6e ch. 9, § 5 ; audit,
 * lot E), une lettre par écran — même source pour l'écran (corrigé consultable après chaque réponse)
 * et pour le papier :
 * a) les deux génératrices (points mobiles en fonction du paramètre, puis équations) ;
 * b) l'élimination du paramètre, une transformation par ligne, jusqu'à la forme factorisée ;
 * c) (d)) le statut de chaque morceau (singulier, parasite, propre), justifié ;
 * dernière lettre : la partie réellement décrite (coordonnées du point en fonction du paramètre,
 * domaine), avec la FIGURE du lieu (extrémités et point exclus en creux).
 */

type E = ExerciceMethodeGeneratrices;
type P = PhaseMethodeGeneratrices;
type F = FragmentConsigne[];

const N = latexN;
const moins = (v: string, n: number) => (n === 0 ? v : n > 0 ? `${v}-${n}` : `${v}+${-n}`);
/** Carré d'une expression : « x^2 » ou « (x-3)^2 ». */
const carre = (v: string) => (/[+-]/.test(v) ? `(${v})^2` : `${v}^2`);
/** Facteur entre parenthèses s'il contient un signe (« (x-3) »), sinon tel quel. */
const fac = (v: string) => (/[+-]/.test(v) ? `(${v})` : v);
const coef = (n: number) => (n === 1 ? "" : n === -1 ? "-" : `${n}`);
const parN = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const vec = (a: string, b: string) => `\\begin{pmatrix}${a}\\\\ ${b}\\end{pmatrix}`;
const pt = (x: string, y: string) => `\\left(${x}\\,;${y}\\right)`;

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function lettre(e: E, p: P): string {
  return lettreEtape(phasesPourExercice(e).indexOf(p));
}

function nomPoint(e: E): string {
  const d = e.donnees;
  if (d.famille === "D") return "G";
  return "I";
}

/** Coordonnées du point d'intersection des génératrices en fonction du paramètre. */
export function coordonneesPoint(e: E): string {
  const d = e.donnees;
  switch (d.famille) {
    case "A":
      return pt(latexQ(q(d.b, 2)), "\\dfrac{\\alpha}{2}");
    case "B":
      return pt(`\\dfrac{${d.c}(${d.a}-\\alpha)}{${2 * d.a}-\\alpha}`, `\\dfrac{${d.a}\\alpha}{${2 * d.a}-\\alpha}`);
    case "C":
      return pt(`${d.h === 0 ? "" : `${d.h}+`}\\dfrac{${2 * d.k}}{1+t^2}`, `\\dfrac{${2 * d.k}t}{1+t^2}`);
    case "D":
      return d.sousCas === 1 ? pt(`\\dfrac{\\alpha+${d.c}}{3}`, latexQ(q(d.h, 3))) : pt(latexQ(q(d.b + d.c, 3)), "\\dfrac{\\alpha}{3}");
    case "E":
      return pt(`${d.p + d.r}`, `\\dfrac{${d.p * d.r}}{\\alpha}`);
  }
}

function etapeGeneratrices(e: E): EtapeCorrection[] {
  const l = lettre(e, "generatrices");
  const d = e.donnees;
  const [g1, g2] = e.generatricesLatex;
  const [n1, n2] = e.noms;
  let lignes: LigneCalcul[] = [];
  switch (d.famille) {
    case "A":
      lignes = [
        ligne(`\\overrightarrow{AY}=${vec(`${d.b}`, "\\alpha")}`, [{ type: "texte", valeur: "avec " }, { type: "latex", valeur: `A(0\\,;0)` }, { type: "texte", valeur: " et " }, { type: "latex", valeur: `Y(${d.b}\\,;\\alpha)` }]),
        ligne(`(AY)\\,:\\ ${g1}`, [{ type: "texte", valeur: "passe par l'origine, vecteur normal " }, { type: "latex", valeur: vec("\\alpha", `-${d.b}`) }]),
        ligne(`\\overrightarrow{BZ}=${vec(`-${d.b}`, "\\alpha")}`, [{ type: "texte", valeur: "avec " }, { type: "latex", valeur: `Z(0\\,;\\alpha)` }]),
        ligne(`(BZ)\\,:\\ ${g2}`, [{ type: "texte", valeur: "passe par B, vecteur normal " }, { type: "latex", valeur: vec("\\alpha", `${d.b}`) }]),
      ];
      break;
    case "B":
      lignes = [
        ligne(`x_E=\\dfrac{${d.c}(${d.a}-\\alpha)}{${d.a}}`, [{ type: "texte", valeur: "Thalès dans le triangle : " }, { type: "latex", valeur: `\\dfrac{x_E}{${d.c}}=\\dfrac{${d.a}-\\alpha}{${d.a}}` }, { type: "texte", valeur: ", et " }, { type: "latex", valeur: "y_E=\\alpha" }]),
        ligne(`(BE)\\,:\\ \\alpha x-\\dfrac{${d.c}(${d.a}-\\alpha)}{${d.a}}\\,y=0`, "passe par l'origine et par E"),
        ligne(`(BE)\\,:\\ ${g1}`, `on multiplie par ${d.a} et on regroupe`),
        ligne(`(CD)\\,:\\ \\alpha(x-${d.c})+${d.c}y=0`, [{ type: "texte", valeur: "passe par C et " }, { type: "latex", valeur: "D(0\\,;\\alpha)" }, { type: "texte", valeur: ", vecteur normal " }, { type: "latex", valeur: vec("\\alpha", `${d.c}`) }]),
        ligne(`(CD)\\,:\\ ${g2}`, "on réordonne"),
      ];
      break;
    case "C": {
      const X = moins("x", d.h);
      const Xk = moins("x", d.h + d.k);
      lignes = [
        ligne(`a\\,:\\ y=t\\,${fac(X)}`, "pente tan α = t, passe par A"),
        ligne(`b\\,:\\ y=\\dfrac{2t}{1-t^2}\\,${fac(Xk)}`, "pente tan 2α, passe par B"),
        ligne(`b\\,:\\ ${g2}`, [{ type: "texte", valeur: "on multiplie par " }, { type: "latex", valeur: "1-t^2" }]),
      ];
      break;
    }
    case "D":
      lignes =
        d.sousCas === 1
          ? [
              ligne(`M=${pt("\\dfrac{\\alpha}{2}", latexQ(q(d.h, 2)))},\\quad N=${pt(`\\dfrac{\\alpha+${d.c}}{2}`, latexQ(q(d.h, 2)))}`, "milieux de [AB] et [AC]"),
              ligne(`(BN)\\,:\\ ${g1}`, "passe par l'origine et par N"),
              ligne(`(CM)\\,:\\ ${g2}`, [{ type: "texte", valeur: "passe par C, vecteur directeur " }, { type: "latex", valeur: vec(`\\alpha-${2 * d.c}`, `${d.h}`) }]),
            ]
          : [
              ligne(`M=${pt(latexQ(q(d.b, 2)), "\\dfrac{\\alpha}{2}")},\\quad N=${pt(latexQ(q(d.c, 2)), "\\dfrac{\\alpha}{2}")}`, "milieux de [AB] et [AC]"),
              ligne(`(BN)\\,:\\ ${g1}`, [{ type: "texte", valeur: "passe par B, vecteur directeur " }, { type: "latex", valeur: vec(`${d.c - 2 * d.b}`, "\\alpha") }]),
              ligne(`(CM)\\,:\\ ${g2}`, [{ type: "texte", valeur: "passe par C, vecteur directeur " }, { type: "latex", valeur: vec(`${d.b - 2 * d.c}`, "\\alpha") }]),
            ];
      break;
    case "E":
      lignes = [
        ligne(`\\overrightarrow{AC}=${vec(`${-d.p}`, "\\alpha")}`, [{ type: "texte", valeur: "avec " }, { type: "latex", valeur: "C(0\\,;\\alpha)" }]),
        ligne(`a\\,:\\ ${coef(-d.p)}(${moins("x", d.p)})+\\alpha y=0`, "perpendiculaire à (AC) en A : AC est normal"),
        ligne(`a\\,:\\ ${g1}`, "on réordonne"),
        ligne(`\\overrightarrow{BC}=${vec(`${-d.r}`, "\\alpha")}`),
        ligne(`b\\,:\\ ${coef(-d.r)}(${moins("x", d.r)})+\\alpha y=0`, "perpendiculaire à (BC) en B"),
        ligne(`b\\,:\\ ${g2}`, "on réordonne"),
      ];
      break;
  }
  const par = e.parametre === "t" ? "$t$" : "$\\alpha$";
  return [
    utiliseCours(l, fx(`Une génératrice est une droite qui bouge avec le paramètre : on exprime ses points connus en fonction de ${par}, puis on écrit son équation (vecteur normal ou pente)`), COURS_GENERATRICES),
    calcul(l, lignes),
    resultat(l, fx(`$${n1}\\,:\\ ${g1}$ et $${n2}\\,:\\ ${g2}$.`)),
  ];
}

function lignesElimination(e: E): LigneCalcul[] {
  const d = e.donnees;
  switch (d.famille) {
    case "A":
      return [
        ligne(`\\alpha x-${d.b}y-\\left(\\alpha x-${d.b}\\alpha+${d.b}y\\right)=0`, "(1) − (2) : αx disparaît"),
        ligne(`${d.b}\\alpha-${2 * d.b}y=0`),
        ligne(`\\alpha=2y`, `on divise par ${d.b}`),
        ligne(`2y\\,x-${d.b}y=0`, "on remplace α dans (1)"),
        ligne(e.elimineLatex, "facteur commun y"),
      ];
    case "B": {
      const ac = d.a * d.c;
      return [
        ligne(`\\dfrac{${ac}y}{${d.a}x+${d.c}y}=\\dfrac{${d.c}y}{${d.c}-x}`, "α isolé dans chaque équation"),
        ligne(`${ac}y(${d.c}-x)=${d.c}y(${d.a}x+${d.c}y)`, "produit en croix"),
        ligne(`${d.a}y(${d.c}-x)=y(${d.a}x+${d.c}y)`, `on divise par ${d.c}`),
        ligne(`y(${ac}-${2 * d.a}x-${d.c}y)=0`, "tout dans un membre, facteur commun y"),
        ligne(e.elimineLatex, "on multiplie par −1"),
        ...(gcd(2 * d.a, d.c) > 1 ? [ligne(`y(${(2 * d.a) / gcd(2 * d.a, d.c)}x+${d.c / gcd(2 * d.a, d.c) === 1 ? "" : d.c / gcd(2 * d.a, d.c)}y-${(d.a * d.c) / gcd(2 * d.a, d.c)})=0`, `on simplifie le second facteur par ${gcd(2 * d.a, d.c)}`)] : []),
      ];
    }
    case "C": {
      const X = moins("x", d.h);
      const Xk = moins("x", d.h + d.k);
      return [
        ligne(`t=\\dfrac{y}{${X}}`, `de l'équation de a (x ≠ ${d.h})`),
        ligne(`\\left(${carre(X)}-y^2\\right)y=2y\\,${fac(X)}${fac(Xk)}`, [{ type: "texte", valeur: "on remplace t dans b, puis on multiplie par " }, { type: "latex", valeur: carre(X) }]),
        ligne(`y\\left(${carre(X)}-y^2-2${fac(X)}${fac(Xk)}\\right)=0`, "tout dans un membre, facteur commun y"),
        ligne(`y\\left(-${carre(X)}-y^2+${2 * d.k}${fac(X)}\\right)=0`, "on développe le dernier produit et on réduit"),
        ligne(e.elimineLatex, "on multiplie par −1"),
        ligne(`${carre(X)}-${2 * d.k}${fac(X)}+${d.k * d.k}+y^2=${d.k * d.k}`, "second facteur : on complète le carré"),
        ligne(`${carre(Xk)}+y^2=${d.k * d.k}`),
      ];
    }
    case "D":
      if (d.sousCas === 1)
        return [
          ligne(`${d.h}x-${d.h}(x-${d.c})=(\\alpha+${d.c})y-(\\alpha-${2 * d.c})y`, "(1) − (2) : αy disparaît"),
          ligne(`${d.h * d.c}=${3 * d.c}y`),
          ligne(e.elimineLatex, "tout dans un membre"),
          ligne(`y=${latexQ(q(d.h, 3))}`, `on divise par ${3 * d.c}`),
        ];
      return [
        ligne(`${parN(d.c - 2 * d.b)}\\,y\\,(${moins("x", d.c)})=${parN(d.b - 2 * d.c)}\\,y\\,(${moins("x", d.b)})`, "α isolé dans chaque équation, puis produit en croix"),
        ligne(`y\\left(${3 * (d.c - d.b)}x${d.b * d.b - d.c * d.c === 0 ? "" : `${d.b * d.b - d.c * d.c < 0 ? "" : "+"}${d.b * d.b - d.c * d.c}`}\\right)=0`, "tout dans un membre, on développe"),
        ligne(e.elimineLatex, "on factorise"),
      ];
    case "E": {
      const lp = `${coef(d.p)}(${moins("x", d.p)})`;
      const lr = `${coef(d.r)}(${moins("x", d.r)})`;
      if (d.methode === "produitCroise")
        return [
          ligne(`\\dfrac{${lp}}{y}=\\dfrac{${lr}}{y}`, "α isolé dans chaque équation"),
          ligne(`${lp}\\,y=${lr}\\,y`, "produit en croix"),
          ligne(`y\\left(${d.p - d.r}x${-(d.p * d.p - d.r * d.r) < 0 ? "" : "+"}${-(d.p * d.p - d.r * d.r)}\\right)=0`, "tout dans un membre, on développe"),
          ligne(e.elimineLatex, "on factorise"),
        ];
      return [
        ligne(`${lp}-${fac(lr)}=0`, "(1) − (2) : αy disparaît"),
        ligne(`${d.p - d.r}x${-(d.p * d.p - d.r * d.r) < 0 ? "" : "+"}${-(d.p * d.p - d.r * d.r)}=0`, "on développe"),
        ligne(e.elimineLatex, "on factorise"),
        ligne(`x=${d.p + d.r}`, `on divise par ${d.p - d.r}`.replace("-", "−")),
      ];
    }
  }
}

function etapeElimination(e: E): EtapeCorrection[] {
  const l = lettre(e, "elimination");
  const d = e.donnees;
  const memeTerme = (d.famille === "D" && d.sousCas === 1) || (d.famille === "E" && d.methode === "soustraction") || d.famille === "A";
  const methode =
    d.famille === "C"
      ? "On tire $t$ de l'équation de $a$, on le remplace dans celle de $b$, puis on chasse les dénominateurs"
      : memeTerme
        ? "Les deux équations contiennent le même terme en $\\alpha$ : on les soustrait membre à membre"
        : "On isole $\\alpha$ dans chaque équation, on égale les deux expressions et on fait le produit en croix";
  const g = d.famille === "B" ? gcd(2 * d.a, d.c) : 1;
  const reduit = (m: MorceauLieu) => (d.famille === "B" && m.statut === "propre" && g > 1 ? `${(2 * d.a) / g}x+${d.c / g === 1 ? "" : d.c / g}y-${(d.a * d.c) / g}=0` : m.latex);
  const morceaux = e.morceaux.map((m) => `$${reduit(m)}$`).join(" ou ");
  const out: EtapeCorrection[] = [
    utiliseCours(l, fx(`${methode} ; on garde tous les facteurs, chacun est un morceau à étudier`), COURS_GENERATRICES),
    calcul(l, lignesElimination(e)),
    resultat(l, fx(`$${e.elimineLatex}$${e.morceaux.length > 1 ? `, soit ${morceaux}` : `, soit $${e.morceaux[0].latex}$`}.`)),
  ];
  if (e.facteurs >= 2 && e.morceaux[0].latex === "y=0" && !(d.famille === "E" && d.methode === "produitCroise"))
    out.push(piege(l, fx("Diviser par $y$ : c'est interdit quand $y$ peut être nul. Le facteur $y$ donne le morceau $y=0$, qu'on étudie ensuite.")));
  if (d.famille === "E" && d.methode === "produitCroise") out.push(piege(l, fx("Le produit en croix fait apparaître un facteur $y$ que la soustraction n'aurait pas donné : le morceau $y=0$ est à examiner, il peut être parasite.")));
  return out;
}

function raisonnementStatut(e: E, m: MorceauLieu): F {
  const d = e.donnees;
  if (m.statut === "singulier") {
    const confondues = (() => {
      switch (d.famille) {
        case "A":
          return `$(AY)\\,:\\ -${d.b}y=0$ et $(BZ)\\,:\\ ${d.b}y=0$`;
        case "B":
          return `$(BE)\\,:\\ 0=${d.a * d.c}y$ et $(CD)\\,:\\ 0=${d.c}y$`;
        case "D":
          return d.sousCas === 2 ? `$(BN)\\,:\\ 0=${parN(d.c - 2 * d.b)}\\,y$ et $(CM)\\,:\\ 0=${parN(d.b - 2 * d.c)}\\,y$` : "";
        default:
          return "";
      }
    })();
    return fx(`Pour $\\alpha=0$ : ${confondues}. Les deux génératrices sont la même droite $y=0$ : elles sont confondues, leur « point d'intersection » n'est pas défini. Le morceau $${m.latex}$ ne fait pas partie du lieu (et $\\alpha=0$ est d'ailleurs exclu du domaine).`);
  }
  if (m.statut === "parasite") {
    if (d.famille === "C") return fx(`Un point de $y=0$ vérifierait $t(${moins("x", d.h)})=0$, donc $x=${d.h}$ (car $t>0$), et $2t(${moins("x", d.h + d.k)})=0$, donc $x=${d.h + d.k}$ : impossible. Aucune valeur du paramètre ne donne un point de ce morceau : il vient de la multiplication par un dénominateur.`);
    if (d.famille === "E") return fx(`Un point de $y=0$ vérifierait $0=${coef(d.p)}(${moins("x", d.p)})$ et $0=${coef(d.r)}(${moins("x", d.r)})$, donc $x=${d.p}$ et $x=${d.r}$ en même temps : impossible. Aucune valeur de $\\alpha$ ne donne un point de ce morceau : il vient du produit en croix.`);
  }
  return fx(`Pour chaque valeur du paramètre, le point d'intersection des génératrices est $${nomPoint(e)}${coordonneesPoint(e)}$ (on résout le système) ; il vérifie $${m.latex}$ : le morceau est atteint, il est propre.`);
}

function etapeStatut(e: E, p: "statut1" | "statut2"): EtapeCorrection[] {
  const l = lettre(e, p);
  const m = e.morceaux[p === "statut1" ? 0 : 1];
  const libelle = { singulier: "singulier", parasite: "parasite", propre: "propre" }[m.statut];
  return [
    p === "statut1"
      ? utiliseCours(l, fx("Un morceau est singulier si, pour une valeur du paramètre, les deux génératrices sont confondues ; parasite si aucune valeur du paramètre ne donne ses points ; propre sinon"), COURS_GENERATRICES)
      : utiliseCours(l, fx("Même critère : on cherche pour quelles valeurs du paramètre le point d'intersection est sur ce morceau"), COURS_GENERATRICES),
    calcul(l, [], raisonnementStatut(e, m), "Raisonnement"),
    resultat(l, fx(`Le morceau $${m.latex}$ est ${libelle}.`)),
  ];
}

function raisonnementRestriction(e: E): F {
  const d = e.donnees;
  const c = coordonneesPoint(e);
  switch (d.famille) {
    case "A":
      return fx(`$I${c}$ avec $\\alpha\\in\\,\\mathopen{]}0\\,;${d.d}\\mathclose{[}$ : l'ordonnée $\\dfrac{\\alpha}{2}$ parcourt $\\mathopen{]}0\\,;${N(d.d / 2)}\\mathclose{[}$, les bornes ne sont jamais atteintes.`);
    case "B":
      return fx(`$I${c}$ avec $\\alpha\\in\\,\\mathopen{]}0\\,;${d.a}\\mathclose{[}$ : quand $\\alpha$ tend vers $0$, $I$ tend vers $(${N(d.c / 2)}\\,;0)$ ; quand $\\alpha$ tend vers $${d.a}$, il tend vers $A(0\\,;${d.a})$. Ces extrémités ne sont pas atteintes.`);
    case "C":
      return fx(`$I${c}$ : $y>0$, et $x$ parcourt $\\mathopen{]}${d.h}\\,;${d.h + 2 * d.k}\\mathclose{[}$ quand $t$ parcourt $\\mathopen{]}0\\,;+\\infty\\mathclose{[}$ ; les extrémités $A(${d.h}\\,;0)$ et $(${d.h + 2 * d.k}\\,;0)$ ne sont jamais atteintes.`);
    case "D":
      return d.sousCas === 1
        ? fx(`$G${c}$ : quand $\\alpha$ parcourt $\\mathbb{R}$, l'abscisse de $G$ prend toutes les valeurs réelles.`)
        : fx(`$G${c}$ : l'ordonnée $\\dfrac{\\alpha}{3}$ prend toutes les valeurs sauf $0$ ($\\alpha\\neq0$ : sinon le triangle est aplati).`);
    case "E":
      return fx(`$I${c}$ : $\\alpha\\neq0$, et l'ordonnée $\\dfrac{${d.p * d.r}}{\\alpha}$ prend toutes les valeurs sauf $0$ (il faudrait un $\\alpha$ infini).`);
  }
}

function etapeRestriction(e: E): EtapeCorrection[] {
  const l = lettre(e, "restriction");
  const d = e.donnees;
  const fig = figure6gen57(e, ["restriction"]);
  const out: EtapeCorrection[] = [
    utiliseCours(l, fx("Le lieu est formé des points réellement atteints : on regarde ce que deviennent les coordonnées du point quand le paramètre parcourt son domaine (bornes exclues, valeurs interdites)"), COURS_GENERATRICES),
    calcul(l, [], raisonnementRestriction(e), "Raisonnement"),
    avecFigure(resultat(l, fx(`Le lieu est ${e.restrictionLatex}.`)), fig),
  ];
  if (d.famille === "D" && d.sousCas === 1) out.push(piege(l, fx("Restreindre « par réflexe » : ici la droite $(BC)$ n'est jamais atteinte par $A$, le triangle n'est jamais aplati et toute la droite est décrite.")));
  if (d.famille === "E" && d.methode === "soustraction") out.push(piege(l, fx(`Oublier le point $(${d.p + d.r}\\,;0)$ : il n'est jamais atteint.`)));
  return out;
}

export function correctionDetailleeMethodeGeneratrices(e: E): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [...etapeGeneratrices(e), ...etapeElimination(e), ...etapeStatut(e, "statut1")];
  if (e.morceaux.length === 2) etapes.push(...etapeStatut(e, "statut2"));
  etapes.push(...etapeRestriction(e));
  return finaliserCombinatoire(etapes);
}
