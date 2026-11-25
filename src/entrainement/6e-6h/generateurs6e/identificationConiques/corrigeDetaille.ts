import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { ExerciceIdA1, ExerciceIdA2, ExerciceIdB, ExerciceIdC, ExerciceIdentificationConiques } from "../../core6e/identificationConiques.types";
import { phasesPourExercice } from "../../moteur6e/typesIdentificationConiques";
import type { PhaseIdentificationConiques } from "../../moteur6e/typesIdentificationConiques";
import { latexDroite, latexPoint, latexPoly, latexQ, latexRacine, latexSomme, polyAdd, polyConst, polyMul, polyScal, polyVar, q, qDiv, qMul, qNeg } from "../../moteur6e/algebreLieux";
import type { Q } from "../../moteur6e/algebreLieux";
import { c2Conique, foyersConique, latexConique, penteAsymptote } from "../../moteur6e/algebreConiques";
import type { Conique } from "../../moteur6e/algebreConiques";
import { polyEnonce } from "../../moteur6e/verificationIdentificationConiques";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { COURS_EXCENTRICITE, COURS_IDENTIFIER, avecFigureConique, decale, lignesC, ligneRacine, milliersDans } from "../../ui6e/corrigeConiques";
import { coefDevant, eqPoly, latexDeuxCarres, polyGeneral } from "../../ui6e/textesConiques";
import { equationC, figure6gen58 } from "../../ui6e/formatIdentificationConiques";

/**
 * Corrigé détaillé « comme au tableau » de `6gen58` (identifier une conique et ses éléments, 6e ch. 10,
 * § 1–2 ; audit, lot E), une lettre par écran — même source pour l'écran (corrigé consultable après
 * chaque réponse) et pour le papier. Nature décidée par la règle des signes du cours (cas dégénérés
 * compris, décision 4), complétion des carrés une transformation par ligne (coefficients RÉELS, plus de
 * « A(x − 2)² + B(y + 4)² »), forme réduite = 1, a, b, c en racines simplifiées, foyers, asymptotes,
 * foyer et directrice de la parabole (y² = 2px, p = dist(F ; d), décision 1), équations des droites ou
 * coordonnées du point des cas dégénérés, partie décrite de la famille C (demi-conique). FIGURE de
 * l'ensemble sous le dernier résultat (rien pour l'ensemble vide).
 */

type E = ExerciceIdentificationConiques;
type P = PhaseIdentificationConiques;
type Centree = Extract<Conique, { type: "ellipse" | "hyperbole" }>;

const lq = latexQ;
const L = (e: E, p: P) => lettreEtape(phasesPourExercice(e).indexOf(p));
const figure = (e: E) => figure6gen58(e, phasesPourExercice(e));
const NATURE: Record<string, string> = {
  ellipse: "une ellipse",
  cercle: "un cercle",
  hyperbole: "une hyperbole",
  point: "un seul point",
  vide: "l'ensemble vide",
  droitesSecantes: "deux droites sécantes",
  droitesParalleles: "deux droites parallèles",
};
const ORIENTATION: Record<string, string> = { droite: "vers la droite", gauche: "vers la gauche", haut: "vers le haut", bas: "vers le bas" };

/** Entier en texte, « − » typographique. */
const signeTexte = (n: number) => (n < 0 ? `−${-n}` : `${n}`);

const REGLE ="On isole la constante et on compare les signes : carrés de même signe, second membre de ce signe → ellipse (cercle si les coefficients sont égaux), nul → un seul point, de signe contraire → ensemble vide ; carrés de signes opposés, second membre non nul → hyperbole, nul → deux droites sécantes";

/** Justification de la nature (centrée : A1 et B, après isolement de la constante). */
function phraseNature(nature: string): string {
  switch (nature) {
    case "ellipse":
      return "Les coefficients des carrés ont le même signe que le second membre, et ils sont différents : c'est une ellipse.";
    case "cercle":
      return "Les coefficients des carrés sont égaux et ont le signe du second membre : c'est un cercle.";
    case "hyperbole":
      return "Les coefficients des carrés sont de signes opposés et le second membre n'est pas nul : c'est une hyperbole.";
    case "point":
      return "Deux carrés de même signe ont une somme nulle seulement si chacun est nul : un seul point.";
    case "vide":
      return "Deux carrés de même signe ne peuvent pas valoir un nombre de signe contraire : aucun point ne convient, l'ensemble est vide.";
    default:
      return "Carrés de signes opposés et second membre nul : une différence de deux carrés, qui se factorise — deux droites sécantes.";
  }
}

/** a, b, c de la forme réduite (racines simplifiées). */
function lignesDemiAxes(c: Centree): LigneCalcul[] {
  return [ligneRacine("a", c.a2, c.type === "ellipse" ? "a² : le plus grand dénominateur" : "a² : sous le carré précédé de « + »"), ligneRacine("b", c.b2), ...lignesC(c)];
}

/** Foyers (et asymptotes) d'une conique centrée en Ω. */
function lignesFoyers(c: Centree): LigneCalcul[] {
  const F = foyersConique(c);
  const lignes: LigneCalcul[] = [ligne(`F=${F[0].latex}\\ \\text{et}\\ F'=${F[1].latex}`, `sur l'axe focal (${c.axe === "x" ? "horizontal" : "vertical"}), à la distance c du centre`)];
  if (c.type === "hyperbole") {
    const m = penteAsymptote(c)!;
    lignes.push(ligne(c.axe === "x" ? `\\dfrac{b}{a}=\\dfrac{${latexRacine(c.b2)}}{${latexRacine(c.a2)}}=${lq(m)}` : `\\dfrac{a}{b}=\\dfrac{${latexRacine(c.a2)}}{${latexRacine(c.b2)}}=${lq(m)}`, "pente des asymptotes"));
  }
  return lignes;
}

function asymptotesLatex(c: Extract<Conique, { type: "hyperbole" }>): string {
  const m = penteAsymptote(c)!;
  const mm = lq(m) === "1" ? "" : lq(m);
  const xs = c.centre.x.n === 0n ? "x" : `(${decale("x", c.centre.x)})`;
  return `${decale("y", c.centre.y)}=\\pm ${mm}${xs}`;
}

function resultatFoyers(c: Centree): string {
  const F = foyersConique(c);
  return `Foyers : $F${F[0].latex}$ et $F'${F[1].latex}$${c.type === "hyperbole" ? ` ; asymptotes : $${asymptotesLatex(c)}$` : ""}.`;
}

/** Pente ±v/u des droites sécantes (A x'² + B y'² = 0, A·B < 0) : y' = ±√(−A/B) x'. */
function lignesDroitesSecantes(A: number, B: number, h: Q, k: Q): LigneCalcul[] {
  const r = q(-A, B);
  const m = q(Math.round(Math.sqrt(Math.abs(Number(r.n)))), Math.round(Math.sqrt(Number(r.d))));
  const xs = h.n === 0n ? "x" : `(${decale("x", h)})`;
  const ys = k.n === 0n ? "y" : `(${decale("y", k)})`;
  return [
    ligne(`${ys}^2=${lq(r) === "1" ? "" : lq(r)}${xs}^2`, "on isole le carré en y"),
    ligne(`${decale("y", k)}=\\pm ${lq(m) === "1" ? "" : lq(m)}${xs}`, "deux nombres de même carré sont égaux ou opposés"),
  ];
}

function corrigeA1(e: ExerciceIdA1): EtapeCorrection[] {
  const a = L(e, "a1Nature");
  const c = e.conique;
  const iso = `${latexPoly(polyGeneral(e.A, e.B, 0, 0, 0))}=${-e.F || 0}`;
  const lignesA: LigneCalcul[] = [ligne(eqPoly(polyEnonce(e)), "équation donnée"), ligne(iso, "on isole la constante")];
  if (c && e.F !== 0) lignesA.push(ligne(latexConique(c), `on divise par ${signeTexte(c.type === "cercle" ? e.A : -e.F)}`));
  const out: EtapeCorrection[] = [utiliseCours(a, fx(REGLE), COURS_EXCENTRICITE), calcul(a, lignesA)];
  const resNature = resultat(a, fx(`${phraseNature(e.nature)}${c && c.type !== "cercle" ? ` Forme réduite : $${latexConique(c)}$.` : ""}`));
  switch (e.nature) {
    case "vide":
      out.push(resNature, piege(a, fx("Ne pas conclure trop vite à une ellipse ou à un cercle : un second membre de signe contraire aux carrés donne l'ensemble vide.")));
      return out;
    case "point": {
      const b = L(e, "a1Point");
      out.push(
        resNature,
        utiliseCours(b, fx("Une somme de deux carrés de même signe n'est nulle que si chaque carré est nul"), COURS_EXCENTRICITE),
        calcul(b, [ligne("x^2=0\\ \\text{et}\\ y^2=0"), ligne("x=0\\ \\text{et}\\ y=0")]),
        avecFigureConique(resultat(b, fx("L'ensemble est réduit au point $(0\\,;0)$.")), figure(e)),
        piege(a, fx("On ne divise jamais par un second membre nul : la forme « $=1$ » n'existe pas ici.")),
      );
      return out;
    }
    case "droitesSecantes": {
      const b = L(e, "a1Droites");
      out.push(
        resNature,
        utiliseCours(b, fx("Une différence de deux carrés nulle : les deux nombres sont égaux ou opposés (on factorise)"), COURS_EXCENTRICITE),
        calcul(b, lignesDroitesSecantes(e.A, e.B, q(0), q(0))),
        avecFigureConique(resultat(b, fx(`Les deux droites sécantes : $${latexDroite(e.droites[0])}$ et $${latexDroite(e.droites[1])}$.`)), figure(e)),
        piege(a, fx("On ne divise jamais par un second membre nul : ce n'est pas une hyperbole, mais deux droites.")),
      );
      return out;
    }
    case "cercle": {
      const b = L(e, "a1Rayon");
      if (c?.type !== "cercle") return out;
      out.push(
        resNature,
        utiliseCours(b, fx("Cercle de centre $O$ et de rayon $r$ : $x^2+y^2=r^2$"), COURS_IDENTIFIER),
        calcul(b, [ligne(`r^2=${lq(c.r2)}`, "second membre de la forme réduite"), ligneRacine("r", c.r2)]),
        avecFigureConique(resultat(b, fx(`Cercle de centre $O(0\\,;0)$ et de rayon $r=${latexRacine(c.r2)}$.`)), figure(e)),
        piege(b, fx("Le second membre vaut $r^2$, pas $r$ : on en prend la racine carrée.")),
      );
      return out;
    }
    default: {
      if (c?.type !== "ellipse" && c?.type !== "hyperbole") return out;
      const b = L(e, "a1DemiAxes");
      const d = L(e, "a1Foyers");
      out.push(
        resNature,
        utiliseCours(b, fx(c.type === "ellipse" ? "Dans la forme réduite, $a^2$ est le plus grand dénominateur (demi-grand axe) et $c^2=a^2-b^2$" : "Dans la forme réduite, $a^2$ est le dénominateur du carré précédé de « + » (axe focal) et $c^2=a^2+b^2$"), COURS_IDENTIFIER),
        calcul(b, lignesDemiAxes(c)),
        resultat(b, fx(`$a=${latexRacine(c.a2)}$, $b=${latexRacine(c.b2)}$, $c=${latexRacine(c2Conique(c))}$.`)),
        utiliseCours(d, fx(c.type === "ellipse" ? "Les foyers sont sur l'axe focal, à la distance $c$ du centre" : "Les foyers sont sur l'axe focal, à la distance $c$ du centre ; asymptotes : $y=\\pm\\frac{b}{a}x$ (axe focal horizontal) ou $y=\\pm\\frac{a}{b}x$ (axe focal vertical)"), COURS_IDENTIFIER),
        calcul(d, lignesFoyers(c)),
        avecFigureConique(resultat(d, fx(resultatFoyers(c))), figure(e)),
        c.type === "ellipse" ? piege(b, fx("$a$ est toujours le demi-grand axe, sous le plus grand dénominateur — pas forcément sous $x^2$ dans l'équation réduite.")) : piege(b, fx("Pour une hyperbole, $c^2=a^2+b^2$ (et non $a^2-b^2$).")),
      );
      return out;
    }
  }
}

function corrigeA2(e: ExerciceIdA2): EtapeCorrection[] {
  const a = L(e, "a2Nature");
  const lignesA: LigneCalcul[] = [ligne(eqPoly(polyEnonce(e)), "équation donnée")];
  const out: EtapeCorrection[] = [];
  if (e.nature === "droitesParalleles") {
    const v = e.A !== 0 ? "x" : "y";
    const coefCarre = e.A !== 0 ? e.A : e.B;
    const lin = e.A !== 0 ? e.D : e.E;
    const m = q(lin, coefCarre);
    lignesA.push(ligne(`${latexSomme([[q(1), `${v}^2`], [m, v]])}=0`, coefCarre === 1 ? "équation réordonnée" : `on divise par ${coefCarre < 0 ? `−${-coefCarre}` : coefCarre}`), ligne(`${v}\\left(${decale(v, qNeg(m))}\\right)=0`, "on factorise"));
    const b = L(e, "a2Droites");
    out.push(
      utiliseCours(a, fx("Un seul carré : si le terme du premier degré porte sur une autre variable, c'est une parabole ; s'il porte sur la même variable, on factorise et on obtient deux droites parallèles (cas dégénéré)"), COURS_EXCENTRICITE),
      calcul(a, lignesA),
      resultat(a, fx(`Le terme du premier degré porte sur la même variable $${v}$ : un produit nul, deux droites parallèles à ${v === "x" ? "l'axe des ordonnées" : "l'axe des abscisses"}.`)),
      utiliseCours(b, fx("Un produit est nul si et seulement si un de ses facteurs est nul"), COURS_EXCENTRICITE),
      calcul(b, [ligne(`${v}=0\\ \\text{ou}\\ ${v}=${lq(qNeg(m))}`)]),
      avecFigureConique(resultat(b, fx(`Les deux droites parallèles : $${latexDroite(e.droites[0])}$ et $${latexDroite(e.droites[1])}$.`)), figure(e)),
      piege(a, fx("Diviser par la variable : on perdrait la droite $" + v + "=0$.")),
    );
    return out;
  }
  const c = e.conique as Extract<Conique, { type: "parabole" }>;
  const [v, w, coefCarre, lin] = c.axe === "x" ? ["y", "x", e.B, e.D] : ["x", "y", e.A, e.E];
  const coef = q(-lin, coefCarre);
  lignesA.push(ligne(`${coefCarre === 1 ? "" : coefCarre === -1 ? "-" : coefCarre}${v}^2=${lq(q(-lin))}${w}`, "on isole le carré"));
  if (coefCarre !== 1) lignesA.push(ligne(`${v}^2=${coefDevant(coef)}${w}`, `on divise par ${coefCarre < 0 ? `−${-coefCarre}` : coefCarre}`));
  const b = L(e, "a2P");
  const d = L(e, "a2FoyerDirectrice");
  const F = foyersConique(c)[0];
  const demi = qDiv(c.p, q(2));
  const dir = qMul(q(-c.sens), demi);
  out.push(
    utiliseCours(a, fx(`Un carré et un terme du premier degré dans l'autre variable : une parabole de sommet $O$, de forme réduite $${v}^2=\\pm 2p\\,${w}$ ($p>0$) ; le signe donne le sens d'ouverture`), COURS_IDENTIFIER),
    calcul(a, lignesA),
    resultat(a, fx(`C'est une parabole de sommet $O$, d'axe ${c.axe === "x" ? "horizontal" : "vertical"}, ouverte ${ORIENTATION[e.orientation!]}.`)),
    utiliseCours(b, fx(`Dans $${v}^2=${c.sens > 0 ? "" : "-"}2p\\,${w}$, le coefficient vaut ${c.sens > 0 ? "" : "l'opposé de "}$2p$, où $p$ est la distance du foyer à la directrice`), COURS_IDENTIFIER),
    calcul(b, [ligne(`2p=${lq(qMul(q(2), c.p))}`, "coefficient en valeur absolue"), ligne(`p=${lq(c.p)}`)]),
    resultat(b, fx(`$p=${lq(c.p)}$.`)),
    utiliseCours(d, fx("Le foyer est sur l'axe, à la distance $\\frac{p}{2}$ du sommet, du côté de l'ouverture ; la directrice est perpendiculaire à l'axe, à la distance $\\frac{p}{2}$ de l'autre côté"), COURS_IDENTIFIER),
    calcul(d, [ligne(`\\dfrac{p}{2}=${lq(demi)}`)]),
    avecFigureConique(resultat(d, fx(`Foyer $F${F.latex}$ ; directrice $d\\equiv ${c.axe}=${lq(dir)}$.`)), figure(e)),
    verification(d, fx("Le sommet $O$ est le milieu du segment qui joint le foyer à la directrice.")),
    piege(b, fx("Le coefficient vaut $2p$ : $p$ en est la moitié (et le foyer est à $\\frac{p}{2}$ du sommet, pas à $p$).")),
  );
  return out;
}

/** Complétion des carrés de la famille B, une transformation par ligne. */
function lignesCompletionB(e: ExerciceIdB): LigneCalcul[] {
  const h = e.centre.x;
  const k = e.centre.y;
  const groupe = (coef: number, v: string, c: Q, apresMoins = false) => {
    const interieur = c.n === 0n ? `${v}^2` : latexSomme([[q(1), `${v}^2`], [qMul(q(-2), c), v]]);
    if (c.n === 0n) return `${coefDevant(coef)}${v}^2`;
    return coef === 1 && !apresMoins ? interieur : `${coefDevant(coef)}\\left(${interieur}\\right)`;
  };
  const gx = groupe(e.A, "x", h);
  const gyAbs = groupe(Math.abs(e.B), "y", k, e.B < 0);
  const termeCarre = (coef: number, v: string, c: Q) => `${coefDevant(coef)}${c.n === 0n ? `${v}^2` : `(${decale(v, c)})^2`}`;
  const ajouts = latexSomme([
    [q(-e.F), ""],
    [qMul(q(e.A), qMul(h, h)), ""],
    [qMul(q(e.B), qMul(k, k)), ""],
  ]);
  const gauche = `${termeCarre(e.A, "x", h)}${e.B < 0 ? "-" : "+"}${termeCarre(Math.abs(e.B), "y", k)}`;
  return [
    ligne(milliersDans(eqPoly(polyEnonce(e))), "équation donnée"),
    ligne(milliersDans(`${gx}${e.B < 0 ? "-" : "+"}${gyAbs}=${-e.F || 0}`), "on regroupe, coefficient du carré en évidence"),
    ligne(milliersDans(`${gauche}=${ajouts}`), "on complète les carrés (on ajoute la même quantité aux deux membres)"),
    ligne(milliersDans(`${gauche}=${e.M}`), "constantes regroupées"),
  ];
}

function corrigeB(e: ExerciceIdB): EtapeCorrection[] {
  const a = L(e, "bForme");
  const b = L(e, "bNature");
  const c = e.conique;
  const forme = latexDeuxCarres(e.A, e.centre.x, e.B, e.centre.y, e.M);
  const centre = `\\Omega${latexPoint(e.centre)}`;
  const out: EtapeCorrection[] = [
    utiliseCours(a, fx("Réduction par translation : on regroupe les termes en $x$ et en $y$, on met le coefficient du carré en évidence, puis on complète chaque carré, $x^2-2hx=(x-h)^2-h^2$"), COURS_EXCENTRICITE),
    calcul(a, lignesCompletionB(e)),
    resultat(a, fx(`$${forme}$ : la courbe est centrée en $${centre}$.`)),
    utiliseCours(b, fx(REGLE), COURS_EXCENTRICITE),
  ];
  if (c && e.M !== 0) out.push(calcul(b, [ligne(milliersDans(latexConique(c)), `on divise par ${signeTexte(c.type === "cercle" ? e.A : e.M)}`)]));
  out.push(resultat(b, fx(`${phraseNature(e.nature)}${c && c.type !== "cercle" ? ` Forme réduite : $${latexConique(c)}$.` : ""}`)));
  switch (e.nature) {
    case "vide":
      out.push(piege(b, fx("Un second membre de signe contraire aux carrés : ce n'est ni une ellipse ni un cercle, l'ensemble est vide.")));
      return out;
    case "point": {
      const d = L(e, "bPoint");
      out.push(
        utiliseCours(d, fx("Une somme de deux carrés de même signe n'est nulle que si chaque carré est nul"), COURS_EXCENTRICITE),
        calcul(d, [ligne(`${decale("x", e.centre.x)}=0\\ \\text{et}\\ ${decale("y", e.centre.y)}=0`)]),
        avecFigureConique(resultat(d, fx(`L'ensemble est réduit au point $${centre}$.`)), figure(e)),
        piege(b, fx("On ne divise jamais par un second membre nul : la forme « $=1$ » n'existe pas ici.")),
      );
      return out;
    }
    case "droitesSecantes": {
      const d = L(e, "bDroites");
      out.push(
        utiliseCours(d, fx("Une différence de deux carrés nulle : les deux nombres sont égaux ou opposés"), COURS_EXCENTRICITE),
        calcul(d, lignesDroitesSecantes(e.A, e.B, e.centre.x, e.centre.y)),
        avecFigureConique(resultat(d, fx(`Deux droites sécantes en $${centre}$ : $${latexDroite(e.droites[0])}$ et $${latexDroite(e.droites[1])}$.`)), figure(e)),
        piege(b, fx("On ne divise jamais par un second membre nul : ce n'est pas une hyperbole, mais deux droites.")),
      );
      return out;
    }
    case "cercle": {
      if (c?.type !== "cercle") return out;
      const d = L(e, "bCentreRayon");
      out.push(
        utiliseCours(d, fx("Cercle de centre $\\Omega(h\\,;k)$ et de rayon $r$ : $(x-h)^2+(y-k)^2=r^2$"), COURS_IDENTIFIER),
        calcul(d, [ligne(`r^2=${lq(c.r2)}`, "second membre de la forme réduite"), ligneRacine("r", c.r2)]),
        avecFigureConique(resultat(d, fx(`Cercle de centre $${centre}$ et de rayon $r=${latexRacine(c.r2)}$.`)), figure(e)),
        piege(d, fx("$(x-h)^2$ donne l'abscisse $h$ du centre, de signe opposé au nombre écrit dans la parenthèse.")),
      );
      return out;
    }
    default: {
      if (c?.type !== "ellipse" && c?.type !== "hyperbole") return out;
      const d = L(e, "bCentreDemiAxes");
      const f = L(e, "bFoyers");
      out.push(
        utiliseCours(d, fx(c.type === "ellipse" ? "Centre : $\\Omega(h\\,;k)$ lu dans $(x-h)^2$ et $(y-k)^2$ ; $a^2$ est le plus grand dénominateur et $c^2=a^2-b^2$" : "Centre : $\\Omega(h\\,;k)$ lu dans $(x-h)^2$ et $(y-k)^2$ ; $a^2$ est sous le carré précédé de « + » et $c^2=a^2+b^2$"), COURS_IDENTIFIER),
        calcul(d, lignesDemiAxes(c)),
        resultat(d, fx(`Centre $${centre}$ ; $a=${latexRacine(c.a2)}$, $b=${latexRacine(c.b2)}$, $c=${latexRacine(c2Conique(c))}$.`)),
        utiliseCours(f, fx(c.type === "ellipse" ? "Les foyers sont sur l'axe focal, à la distance $c$ du centre $\\Omega$" : "Les foyers sont sur l'axe focal, à la distance $c$ du centre $\\Omega$ ; les asymptotes passent par $\\Omega$, de pentes $\\pm\\frac{b}{a}$ (axe focal horizontal) ou $\\pm\\frac{a}{b}$ (vertical)"), COURS_IDENTIFIER),
        calcul(f, lignesFoyers(c)),
        avecFigureConique(resultat(f, fx(resultatFoyers(c))), figure(e)),
        piege(a, fx("En complétant, on ajoute aux deux membres le carré multiplié par le coefficient mis en évidence, et pas le carré seul.")),
      );
      return out;
    }
  }
}

function corrigeC(e: ExerciceIdC): EtapeCorrection[] {
  const a = L(e, "cCarre");
  const b = L(e, "cForme");
  const n = L(e, "cNature");
  const d = L(e, "cElements");
  const c = e.conique as Centree;
  const vi = e.variableIsolee;
  const w = e.variableRacine;
  const m = q(e.mNum, e.mDen);
  const m2 = qMul(m, m);
  const W = polyVar(w);
  const sous = latexPoly(polyAdd(polyAdd(polyScal(polyMul(W, W), q(e.a2)), polyScal(W, q(e.a1))), polyConst(q(e.a0))), [w]);
  const s = e.nature === "ellipse" ? -1 : 1;
  const carreW = e.h === 0 ? `${w}^2` : `(${decale(w, q(e.h))})^2`;
  const carreV = e.k === 0 ? `${vi}^2` : `(${decale(vi, q(e.k))})^2`;
  const complete = s < 0 ? `-${carreW}+${e.r * e.r}` : `${carreW}-${e.r * e.r}`;
  const sens = e.signeRacine > 0 ? "\\geq" : "\\leq";
  // Forme « deux carrés » : mNum²(w − h)² ± mDen²(v − k)² = mNum² r² (variable sous la racine d'abord).
  const cr = e.mNum * e.mNum;
  const ci = e.mDen * e.mDen;
  const M = e.mNum * e.mNum * e.r * e.r;
  const forme = s < 0 ? `${coefDevant(cr)}${carreW}+${coefDevant(ci)}${carreV}=${M}` : `${coefDevant(cr)}${carreW}-${coefDevant(ci)}${carreV}=${M}`;
  const partie = `${e.nature === "ellipse" ? "la moitié de l'ellipse" : "la partie de l'hyperbole"} où $${vi}${sens}${e.k}$`;
  const coefM = coefDevant(m2);
  return [
    utiliseCours(a, fx(`La racine est isolée : une racine carrée est positive, donc l'équation impose $${vi}${sens}${e.k}$ ; on élève ensuite les deux membres au carré`), COURS_EXCENTRICITE),
    calcul(a, [ligne(equationC(e), "équation donnée"), ligne(`${carreV}=${coefM}\\left(${sous}\\right)`, "on élève les deux membres au carré")]),
    resultat(a, fx(`$${carreV}=${coefM}\\left(${sous}\\right)$, avec la condition $${vi}${sens}${e.k}$.`)),
    utiliseCours(b, fx("On complète le carré sous la racine, puis on regroupe les deux carrés dans le même membre"), COURS_EXCENTRICITE),
    calcul(b, [ligne(`${sous}=${complete}`, "on complète le carré"), ligne(`${carreV}=${coefM}\\left(${complete}\\right)`, "on remplace"), ligne(forme, `on développe${ci === 1 ? "" : `, on multiplie par ${ci}`} et on regroupe les carrés`)]),
    resultat(b, fx(`$${forme}$.`)),
    utiliseCours(n, fx("On divise par le second membre pour lire la nature ; la condition de la première étape ne garde qu'une partie de la courbe"), COURS_EXCENTRICITE),
    calcul(n, [ligne(latexConique(c), `on divise par ${M}`)]),
    resultat(n, fx(`Ces points sont sur ${e.nature === "ellipse" ? "une ellipse" : "une hyperbole"} ; avec la condition $${vi}${sens}${e.k}$, la courbe $\\Gamma$ est ${partie}, pas la conique entière.`)),
    utiliseCours(d, fx(e.nature === "ellipse" ? "Centre lu dans les carrés ; $a$ est le demi-grand axe (plus grand dénominateur), $b$ le demi-petit axe" : "Centre lu dans les carrés ; $a$ est la racine du dénominateur du carré précédé de « + » (axe focal)"), COURS_IDENTIFIER),
    calcul(d, [ligneRacine("a", c.a2), ligneRacine("b", c.b2)]),
    avecFigureConique(resultat(d, fx(`Conique complète : centre $\\Omega${latexPoint(c.centre)}$, $a=${latexRacine(c.a2)}$, $b=${latexRacine(c.b2)}$ ; $\\Gamma$ en est ${partie} (en trait plein sur la figure).`)), figure(e)),
    piege(n, fx("Élever au carré ajoute l'autre partie de la conique (celle de l'autre signe devant la racine) : $\\Gamma$ n'est pas la conique entière.")),
  ];
}

export function correctionDetailleeIdentificationConiques(e: E): EtapeCorrection[] {
  switch (e.famille) {
    case "A1":
      return finaliserCombinatoire(corrigeA1(e));
    case "A2":
      return finaliserCombinatoire(corrigeA2(e));
    case "B":
      return finaliserCombinatoire(corrigeB(e));
    case "C":
      return finaliserCombinatoire(corrigeC(e));
  }
}

export { NATURE as NATURE_6GEN58, ORIENTATION as ORIENTATION_6GEN58, asymptotesLatex };
