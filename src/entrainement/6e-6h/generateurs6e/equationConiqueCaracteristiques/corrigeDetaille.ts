import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { DonneeC, ExerciceEqC, ExerciceEqD, ExerciceEqParabole, ExerciceEquationConiqueCaracteristiques } from "../../core6e/equationConiqueCaracteristiques.types";
import { phasesPourExercice } from "../../moteur6e/typesEquationConiqueCaracteristiques";
import type { PhaseEquationConiqueCaracteristiques } from "../../moteur6e/typesEquationConiqueCaracteristiques";
import { latexPoint, latexQ, q, qDiv, qMul, qNum, qSub } from "../../moteur6e/algebreLieux";
import type { Q } from "../../moteur6e/algebreLieux";
import { foyersConique, latexConique, qAbs } from "../../moteur6e/algebreConiques";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { COURS_EXCENTRICITE, COURS_IDENTIFIER, avecFigureConique, carreL, decale, parQ } from "../../ui6e/corrigeConiques";
import { figure6gen59 } from "../../ui6e/formatEquationConiqueCaracteristiques";

/**
 * Corrigé détaillé « comme au tableau » de `6gen59` (équation d'une conique depuis ses caractéristiques,
 * 6e ch. 10, § 1–2 ; audit, lot E), une lettre par écran — même source pour l'écran et le papier.
 * Conventions du cours : a = demi-grand axe (ellipse) ou demi-axe focal (hyperbole), b² = a² − c² ou
 * c² − a², e = c/a, directrices à la distance a²/c du centre, parabole (y − k)² = ±2p(x − h) avec
 * p = dist(F ; d) = 2·SF (décision 1). FIGURE de la conique et de ses données sous le dernier résultat.
 */

type E = ExerciceEquationConiqueCaracteristiques;
type P = PhaseEquationConiqueCaracteristiques;

const lq = latexQ;
const L = (e: E, p: P) => lettreEtape(phasesPourExercice(e).indexOf(p));
const figure = (e: E) => figure6gen59(e, phasesPourExercice(e));
const axeTexte = (axe: "x" | "y") => (axe === "x" ? "l'axe des abscisses" : "l'axe des ordonnées");

function utiliseEquation(e: E, sq: string): EtapeCorrection {
  const c = e.conique;
  if (c.type === "parabole") return utiliseCours(sq, fx("On remplace $p$ dans la forme choisie"), COURS_IDENTIFIER);
  return utiliseCours(sq, fx(`Centre $O$ : $a^2$ va sous le carré de la variable de l'axe focal (${axeTexte(c.type === "ellipse" || c.type === "hyperbole" ? c.axe : "x")}) ; les carrés s'ajoutent pour une ellipse, se soustraient pour une hyperbole`), COURS_IDENTIFIER);
}

function etapeEquation(e: E, sq: string, verif: string | null, calculs: LigneCalcul[] = []): EtapeCorrection[] {
  const nom = e.conique.type === "parabole" ? "La parabole" : e.conique.type === "ellipse" ? "L'ellipse" : "L'hyperbole";
  return [
    utiliseEquation(e, sq),
    ...(calculs.length ? [calcul(sq, calculs)] : []),
    avecFigureConique(resultat(sq, fx(`${nom} a pour équation $${latexConique(e.conique)}$.`)), figure(e)),
    ...(verif ? [verification(sq, fx(verif))] : []),
  ];
}

/** « Le sommet S(a ; 0) vérifie l'équation » écrit avec les nombres. */
function verifSommet(e: E, S: { x: Q; y: Q }, nomS = "S"): string | null {
  const c = e.conique;
  if (c.type !== "ellipse" && c.type !== "hyperbole") return null;
  const [u, v] = c.axe === "x" ? [S.x, S.y] : [S.y, S.x];
  if (v.n !== 0n) return null;
  return `$${nomS}${latexPoint(S)}$ vérifie l'équation : $\\dfrac{${carreL(u)}}{${lq(c.a2)}}=1$.`;
}

function corrigeA(e: Extract<E, { famille: "A" }>): EtapeCorrection[] {
  if (e.sousType === "memeAxe") {
    const a = L(e, "mNature");
    const b = L(e, "mValeurs");
    const c = L(e, "equation");
    const ell = e.nature === "ellipse";
    return [
      utiliseCours(a, fx("Pour une ellipse, les foyers sont entre les sommets de l'axe focal ($c<a$) ; pour une hyperbole, ils sont au-delà ($c>a$)"), COURS_IDENTIFIER),
      calcul(a, [ligne(`OS=${e.a}`, "distance du centre au sommet"), ligne(`OF=${e.c}`, "distance du centre au foyer")]),
      resultat(a, fx(ell ? `$OF<OS$ : le foyer est entre le centre et le sommet, c'est une ellipse.` : `$OF>OS$ : le foyer est au-delà du sommet, c'est une hyperbole.`)),
      utiliseCours(b, fx(ell ? "$a=OS$, $c=OF$ et, pour une ellipse, $b^2=a^2-c^2$" : "$a=OS$, $c=OF$ et, pour une hyperbole, $b^2=c^2-a^2$"), COURS_IDENTIFIER),
      calcul(b, [ligne(`a=${e.a}`), ligne(`c=${e.c}`), ligne(ell ? `b^2=a^2-c^2=${e.a * e.a}-${e.c * e.c}=${lq(e.conique.b2)}` : `b^2=c^2-a^2=${e.c * e.c}-${e.a * e.a}=${lq(e.conique.b2)}`)]),
      resultat(b, fx(`$a=${e.a}$, $c=${e.c}$, $b^2=${lq(e.conique.b2)}$.`)),
      ...etapeEquation(e, c, verifSommet(e, e.S)),
      ell ? piege(c, fx("$a^2$ va sous le carré de la variable de l'axe focal (celui de $S$ et $F$), pas forcément sous $x^2$.")) : piege(b, fx("Pour une hyperbole, $b^2=c^2-a^2$ (et non $a^2-c^2$, qui serait négatif).")),
    ];
  }
  if (e.sousType === "axesPerpendiculaires") {
    const a = L(e, "pAxe");
    const b = L(e, "pValeurs");
    const c = L(e, "equation");
    return [
      utiliseCours(a, fx("Les foyers sont toujours sur l'axe focal ; un sommet de l'axe non focal est sur l'autre axe"), COURS_IDENTIFIER),
      resultat(a, fx(`Le foyer $F${latexPoint(e.F)}$ est sur ${axeTexte(e.axeFocal)} : c'est l'axe focal (le sommet $S$ est sur l'autre axe).`)),
      utiliseCours(b, fx("Le sommet de l'axe non focal donne $b=OS$, le foyer donne $c=OF$ ; pour une ellipse, $a^2=b^2+c^2$"), COURS_IDENTIFIER),
      calcul(b, [ligne(`b=OS=${e.b}`), ligne(`c=OF=${e.c}`), ligne(`a^2=b^2+c^2=${e.b * e.b}+${e.c * e.c}=${e.b * e.b + e.c * e.c}`)]),
      resultat(b, fx(`$b=${e.b}$, $c=${e.c}$, $a^2=${e.b * e.b + e.c * e.c}$.`)),
      ...etapeEquation(e, c, null),
      piege(a, fx("C'est le foyer, jamais le sommet donné, qui fixe l'axe focal ; $a^2$ va sous le carré de cette variable.")),
    ];
  }
  const a = L(e, "sValeurs");
  const c = L(e, "equation");
  const p = Math.abs(qNum(e.S.x));
  const r = Math.abs(qNum(e.Sp.y));
  return [
    utiliseCours(a, fx("$a$ est le demi-grand axe : l'axe focal est celui du sommet le plus éloigné du centre"), COURS_IDENTIFIER),
    calcul(a, [ligne(`OS=${p}`), ligne(`OS'=${r}`), ligne(`a=${e.a}\\ \\text{et}\\ b=${e.b}`, `le plus grand des deux est a : axe focal = ${axeTexte(p > r ? "x" : "y")}`)]),
    resultat(a, fx(`$a=${e.a}$, $b=${e.b}$ ; l'axe focal est ${axeTexte(p > r ? "x" : "y")}.`)),
    ...etapeEquation(e, c, verifSommet(e, p > r ? e.S : e.Sp, p > r ? "S" : "S'")),
    piege(a, fx("$a$ n'est pas toujours sur l'axe des abscisses : c'est le plus grand des deux demi-axes.")),
  ];
}

function formeParabole(e: ExerciceEqParabole): string {
  const c = e.conique;
  const [carre, lin] = c.axe === "x" ? [decale("y", e.S.y), decale("x", e.S.x)] : [decale("x", e.S.x), decale("y", e.S.y)];
  const v = c.axe === "x" ? (e.S.y.n === 0n ? "y^2" : `(${carre})^2`) : e.S.x.n === 0n ? "x^2" : `(${carre})^2`;
  const w = (c.axe === "x" ? e.S.x : e.S.y).n === 0n ? (c.axe === "x" ? "x" : "y") : `(${lin})`;
  return `${v}=${c.sens > 0 ? "" : "-"}2p\\,${w}`;
}

function corrigeB(e: ExerciceEqParabole): EtapeCorrection[] {
  const a = L(e, "bOuverture");
  const b = L(e, "bP");
  const c = L(e, "equation");
  const cn = e.conique;
  const ouverture = cn.axe === "x" ? (cn.sens > 0 ? "vers la droite" : "vers la gauche") : cn.sens > 0 ? "vers le haut" : "vers le bas";
  const lignesP: LigneCalcul[] = [];
  if (e.donnee === "foyer") {
    const sf = cn.axe === "x" ? qAbs(qSub(e.F.x, e.S.x)) : qAbs(qSub(e.F.y, e.S.y));
    lignesP.push(ligne(`SF=${lq(sf)}`, "distance du sommet au foyer"), ligne(`p=2\\cdot SF=${lq(cn.p)}`, "le foyer est à p/2 du sommet"));
  } else {
    const Pp = e.P!;
    const [dv, dw] = cn.axe === "x" ? [qSub(Pp.y, e.S.y), qSub(Pp.x, e.S.x)] : [qSub(Pp.x, e.S.x), qSub(Pp.y, e.S.y)];
    const s = cn.sens > 0 ? "" : "-";
    lignesP.push(
      ligne(`${carreL(dv)}=${s}2p\\cdot ${parQ(dw)}`, "on remplace les coordonnées de P"),
      ligne(`${lq(qMul(dv, dv))}=${lq(qMul(q(2 * cn.sens), dw))}\\,p`),
      ligne(`p=${lq(cn.p)}`, `on divise par ${lq(qMul(q(2 * cn.sens), dw)).replace("-", "−")}`),
    );
  }
  const verif = e.donnee === "point" ? `$P${latexPoint(e.P!)}$ vérifie l'équation.` : `Le foyer est à la distance $\\frac{p}{2}=${lq(qDiv(cn.p, q(2)))}$ du sommet, du côté de l'ouverture : $F${latexPoint(e.F)}$.`;
  return [
    utiliseCours(a, fx("Parabole de sommet $S(h\\,;k)$ : le carré porte sur la variable perpendiculaire à l'axe, et le signe de $2p$ ($p>0$) donne le sens d'ouverture — vers le foyer, ou vers le point donné"), COURS_IDENTIFIER),
    resultat(a, fx(`${e.donnee === "foyer" ? `$S$ et $F$ sont sur une parallèle à ${axeTexte(cn.axe)}` : `L'axe est parallèle à ${axeTexte(cn.axe)}`} et la parabole s'ouvre ${ouverture} : $${formeParabole(e)}$.`)),
    utiliseCours(b, fx(e.donnee === "foyer" ? "$p$ est la distance du foyer à la directrice ; le sommet est au milieu, donc $p=2\\cdot SF$" : "Le point $P$ est sur la parabole : ses coordonnées vérifient l'équation"), COURS_IDENTIFIER),
    calcul(b, lignesP),
    resultat(b, fx(`$p=${lq(cn.p)}$.`)),
    ...etapeEquation(e, c, verif),
    piege(b, fx("$p$ est la distance du foyer à la directrice, le double de la distance sommet–foyer ; le coefficient de l'équation vaut $2p$.")),
  ];
}

function valeurC(e: ExerciceEqC, d: DonneeC): Q {
  if (d === "deuxC") return q(2 * e.c);
  if (d === "deuxA") return q(2 * e.a);
  if (d === "excentricite") return q(e.c, e.a);
  return q(2 * e.a * e.a, e.c);
}

function lignesValeursC(e: ExerciceEqC): LigneCalcul[] {
  const [d1, d2] = e.donnees;
  const v = (d: DonneeC) => lq(valeurC(e, d));
  const k = (d: DonneeC) => valeurC(e, d);
  if (d1 === "deuxC" && d2 === "excentricite") return [ligne(`c=\\dfrac{${v(d1)}}{2}=${e.c}`), ligne(`a=\\dfrac{c}{e}=${e.c}\\cdot\\dfrac{${k(d2).d}}{${k(d2).n}}=${e.a}`, "e = c/a")];
  if (d1 === "deuxC" && d2 === "distanceDirectrices") return [ligne(`c=\\dfrac{${v(d1)}}{2}=${e.c}`), ligne(`\\dfrac{2a^2}{c}=${v(d2)}`, "distance des directrices"), ligne(`a^2=\\dfrac{${v(d2)}\\cdot ${e.c}}{2}=${e.a * e.a}`), ligne(`a=${e.a}`)];
  if (d1 === "deuxA" && d2 === "excentricite") return [ligne(`a=\\dfrac{${v(d1)}}{2}=${e.a}`), ligne(`c=e\\cdot a=${v(d2)}\\cdot ${e.a}=${e.c}`, "e = c/a")];
  if (d1 === "deuxA" && d2 === "distanceDirectrices") return [ligne(`a=\\dfrac{${v(d1)}}{2}=${e.a}`), ligne(`\\dfrac{2a^2}{c}=${v(d2)}`, "distance des directrices"), ligne(`c=\\dfrac{2\\cdot ${e.a * e.a}}{${v(d2)}}=${e.c}`)];
  // e et distance des directrices : a²/c = a/e.
  return [ligne(`\\dfrac{2a^2}{c}=\\dfrac{2a}{e}=${v(d2)}`, "c = e·a"), ligne(`a=\\dfrac{${v(d2)}\\cdot ${v(d1)}}{2}=${e.a}`), ligne(`c=e\\cdot a=${v(d1)}\\cdot ${e.a}=${e.c}`)];
}

function corrigeC(e: ExerciceEqC): EtapeCorrection[] {
  const a = L(e, "cValeurs");
  const b = L(e, "cNature");
  const c = L(e, "cEquation");
  const ell = e.nature === "ellipse";
  const b2 = Math.abs(e.a * e.a - e.c * e.c);
  return [
    utiliseCours(a, fx("Relations du cours : $2c$ est la distance focale, $2a$ la distance entre les sommets de l'axe focal, $e=\\frac{c}{a}$, et les directrices sont à la distance $\\frac{a^2}{c}$ du centre, donc distantes de $\\frac{2a^2}{c}$"), COURS_EXCENTRICITE),
    calcul(a, lignesValeursC(e)),
    resultat(a, fx(`$a=${e.a}$ et $c=${e.c}$.`)),
    utiliseCours(b, fx("Ellipse : $e<1$ ($c<a$) ; hyperbole : $e>1$ ($c>a$)"), COURS_EXCENTRICITE),
    calcul(b, [ligne(`e=\\dfrac{c}{a}=\\dfrac{${e.c}}{${e.a}}${lq(q(e.c, e.a)) === `\\frac{${e.c}}{${e.a}}` ? "" : `=${lq(q(e.c, e.a))}`}`)]),
    resultat(b, fx(`$e${ell ? "<" : ">"}1$ : c'est ${ell ? "une ellipse" : "une hyperbole"}.`)),
    utiliseCours(c, fx(ell ? "Pour une ellipse, $b^2=a^2-c^2$ ; $a^2$ va sous le carré de la variable de l'axe focal" : "Pour une hyperbole, $b^2=c^2-a^2$ ; $a^2$ va sous le carré de la variable de l'axe focal"), COURS_IDENTIFIER),
    calcul(c, [ligne(ell ? `b^2=a^2-c^2=${e.a * e.a}-${e.c * e.c}=${b2}` : `b^2=c^2-a^2=${e.c * e.c}-${e.a * e.a}=${b2}`)]),
    avecFigureConique(resultat(c, fx(`${ell ? "L'ellipse" : "L'hyperbole"} a pour équation $${latexConique(e.conique)}$.`)), figure(e)),
    piege(b, fx("On ne suppose jamais la nature : on la déduit de $e=\\frac{c}{a}$ (inférieure ou supérieure à 1).")),
  ];
}

function corrigeD(e: ExerciceEqD): EtapeCorrection[] {
  const a = L(e, "dValeurs");
  const c = L(e, "equation");
  const axe = e.conique.axe;
  const m = axe === "x" ? q(e.b, e.a) : q(e.a, e.b);
  const lignes: LigneCalcul[] = [ligne(axe === "x" ? `\\dfrac{b}{a}=${lq(m)}` : `\\dfrac{a}{b}=${lq(m)}`, "pente positive des asymptotes")];
  const c2 = e.a * e.a + e.b * e.b;
  const bDeA = axe === "x" ? `b=${lq(m)}\\,a` : `b=${lq(qDiv(q(1), m))}\\,a`;
  const k = axe === "x" ? qMul(m, m) : qDiv(q(1), qMul(m, m));
  if (e.donnee === "sommet") lignes.push(ligne(`a=OS=${e.a}`, "le sommet est sur l'axe focal"), ligne(`b=${axe === "x" ? `${lq(m)}\\cdot ${e.a}` : `\\dfrac{${e.a}}{${lq(m)}}`}=${e.b}`));
  else {
    lignes.push(
      ligne(e.donnee === "foyer" ? `c^2=OF^2=${c2}` : `c^2=\\left(\\dfrac{2c}{2}\\right)^2=${c2}`, e.donnee === "foyer" ? "distance du centre au foyer" : "demi-distance focale"),
      ligne(bDeA, "pente des asymptotes"),
      ligne(`a^2+${lq(k)}\\,a^2=${c2}`, "c² = a² + b²"),
      ligne(`a^2=${e.a * e.a}`),
      ligne(`a=${e.a}\\ \\text{et}\\ b=${e.b}`),
    );
  }
  const F = foyersConique(e.conique)[0];
  return [
    utiliseCours(a, fx("Asymptotes : $y=\\pm\\frac{b}{a}x$ si l'axe focal est horizontal, $y=\\pm\\frac{a}{b}x$ s'il est vertical ; et $c^2=a^2+b^2$"), COURS_IDENTIFIER),
    calcul(a, lignes),
    resultat(a, fx(`$a=${e.a}$ et $b=${e.b}$.`)),
    ...etapeEquation(e, c, e.donnee === "foyer" ? `$c^2=a^2+b^2=${c2}$ : le foyer $F${F.latex}$ convient.` : verifSommet(e, axe === "x" ? { x: q(e.a), y: q(0) } : { x: q(0), y: q(e.a) })),
    piege(a, fx(axe === "y" ? "Axe focal vertical : les asymptotes ont pour pente $\\frac{a}{b}$, et non $\\frac{b}{a}$." : "Pour une hyperbole, $c^2=a^2+b^2$ (et non $a^2-b^2$).")),
  ];
}

export function correctionDetailleeEquationConiqueCaracteristiques(e: E): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliserCombinatoire(corrigeA(e));
    case "B":
      return finaliserCombinatoire(corrigeB(e));
    case "C":
      return finaliserCombinatoire(corrigeC(e));
    case "D":
      return finaliserCombinatoire(corrigeD(e));
  }
}
