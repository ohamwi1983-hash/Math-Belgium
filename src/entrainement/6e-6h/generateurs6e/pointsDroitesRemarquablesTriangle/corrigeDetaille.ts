import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { ExercicePointsDroitesRemarquablesTriangle } from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { phasesPourExercice } from "../../moteur6e/typesPointsDroitesRemarquablesTriangle";
import type { PhasePointsDroitesRemarquablesTriangle } from "../../moteur6e/typesPointsDroitesRemarquablesTriangle";
import { latexQ, milieu, perpendiculaire, q, qAdd, qB, qMul, qNeg, qSub, surDroite } from "../../moteur6e/algebreLieux";
import type { Droite, Pt, Q } from "../../moteur6e/algebreLieux";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { COURS_DROITES, avecFigure, dQ, equationLineaire, ld, lignesDroiteDeuxPoints, lignesDroiteNormale, lignesIntersection, lignesSymetrique, lignesSysteme, lp, nomPt, parQ, vecteur } from "../../ui6e/corrigeLieux";
import { figure6gen54 } from "../../ui6e/formatPointsDroitesRemarquablesTriangle";

/**
 * Corrigé détaillé « comme au tableau » de `6gen54` (constructions analytiques dans le triangle, 6e
 * ch. 9, § 1 ; audit, lot E), une lettre par écran — même source pour l'écran (corrigé consultable
 * après chaque réponse) et pour le papier. Droites en ax + by + c = 0 SIMPLIFIÉES, coordonnées
 * exactes, systèmes résolus ligne par ligne ; FIGURE (configuration et points construits) sous le
 * dernier résultat.
 */

type E = ExercicePointsDroitesRemarquablesTriangle;
type P = PhasePointsDroitesRemarquablesTriangle;

const lq = latexQ;
function L(e: E, p: P): string {
  return lettreEtape(phasesPourExercice(e).indexOf(p));
}
const figure = (e: E) => figure6gen54(e, phasesPourExercice(e));
const pt = (x: Q, y: Q): Pt => ({ x, y });
const plus = (a: Pt, b: Pt) => pt(qAdd(a.x, b.x), qAdd(a.y, b.y));
const moins = (a: Pt, b: Pt) => pt(qSub(a.x, b.x), qSub(a.y, b.y));
const vec = (v: Pt) => vecteur(v.x, v.y);

/** Lignes « x = u + v − w » et « y = … » d'un sommet par le parallélogramme des milieux. */
function lignesSommet(nom: string, p1: Pt, p2: Pt, p3: Pt, n1: string, n2: string, n3: string, res: Pt): LigneCalcul[] {
  return [
    ligne(`x_{${nom}}=x_{${n1}}+x_{${n2}}-x_{${n3}}=${lq(p1.x)}+${parQ(p2.x)}-${parQ(p3.x)}=${lq(res.x)}`),
    ligne(`y_{${nom}}=${lq(p1.y)}+${parQ(p2.y)}-${parQ(p3.y)}=${lq(res.y)}`),
  ];
}

function corrigeA(e: Extract<E, { famille: "A" }>): EtapeCorrection[] {
  const a = L(e, "aSommetA");
  const b = L(e, "aSommetsBC");
  return [
    utiliseCours(a, fx("Théorème des milieux : $AC'A'B'$ est un parallélogramme, donc $\\overrightarrow{AB'}=\\overrightarrow{C'A'}$ et $A=B'+C'-A'$"), COURS_DROITES),
    calcul(a, lignesSommet("A", e.Bp, e.Cp, e.Ap, "B'", "C'", "A'", e.A)),
    resultat(a, fx(`$${nomPt("A", e.A)}$.`)),
    utiliseCours(b, fx("Même raisonnement pour chaque sommet : $B=A'+C'-B'$ et $C=A'+B'-C'$"), COURS_DROITES),
    calcul(b, [...lignesSommet("B", e.Ap, e.Cp, e.Bp, "A'", "C'", "B'", e.B), ...lignesSommet("C", e.Ap, e.Bp, e.Cp, "A'", "B'", "C'", e.C)]),
    avecFigure(resultat(b, fx(`$${nomPt("B", e.B)}$ et $${nomPt("C", e.C)}$.`)), figure(e)),
    verification(b, fx(`Le milieu de $[BC]$ est $${lp(milieu(e.B, e.C))}=A'$.`)),
    piege(b, fx("Prendre un milieu pour un sommet, ou additionner les mauvais milieux : pour $A$, on additionne les milieux des deux côtés qui partent de $A$ ($B'$ et $C'$) et on retranche $A'$.")),
  ];
}

function corrigeB(e: Extract<E, { famille: "B" }>): EtapeCorrection[] {
  const a = L(e, "bLongueurs");
  const b = L(e, "bPointI");
  const ab = moins(e.B, e.A);
  const bc = moins(e.C, e.B);
  const ac = moins(e.C, e.A);
  const k = q(e.AB, e.AB + e.BC);
  return [
    utiliseCours(a, fx("Distance de deux points : $AB=\\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}$"), COURS_DROITES),
    calcul(a, [
      ligne(`AB=\\sqrt{${parQ(ab.x)}^2+${parQ(ab.y)}^2}=\\sqrt{${e.AB * e.AB}}=${e.AB}`),
      ligne(`BC=\\sqrt{${parQ(bc.x)}^2+${parQ(bc.y)}^2}=\\sqrt{${e.BC * e.BC}}=${e.BC}`),
    ]),
    resultat(a, fx(`$AB=${e.AB}$ et $BC=${e.BC}$.`)),
    utiliseCours(b, fx("Théorème de la bissectrice : $I$ partage $[AC]$ dans le rapport des côtés adjacents, $\\dfrac{AI}{IC}=\\dfrac{AB}{BC}$, donc $\\overrightarrow{AI}=\\dfrac{AB}{AB+BC}\\,\\overrightarrow{AC}$"), COURS_DROITES),
    calcul(b, [
      ligne(`\\dfrac{AI}{AC}=\\dfrac{${e.AB}}{${e.AB}+${e.BC}}=${lq(k)}`, "AI/IC = AB/BC"),
      ligne(`\\overrightarrow{AC}=${vec(ac)}`),
      ligne(`x_I=${lq(e.A.x)}+${lq(k)}\\cdot ${parQ(ac.x)}=${lq(e.I.x)}`),
      ligne(`y_I=${lq(e.A.y)}+${lq(k)}\\cdot ${parQ(ac.y)}=${lq(e.I.y)}`),
    ]),
    avecFigure(resultat(b, fx(`$${nomPt("I", e.I)}$.`)), figure(e)),
    piege(b, fx(`$I$ n'est pas le milieu de $[AC]$ : il ne l'est que si $AB=BC$ (ici $${e.AB}\\neq${e.BC}$), et il est plus près du sommet du plus petit côté.`)),
  ];
}

function paramLatex(x0: Q, u: number): string {
  const base = lq(x0);
  if (u === 0) return base;
  const terme = u === 1 ? "t" : u === -1 ? "-t" : `${u}t`;
  if (x0.n === 0n) return terme;
  return `${base}${u > 0 ? "+" : ""}${terme}`;
}

function corrigeC(e: Extract<E, { famille: "C" }>): EtapeCorrection[] {
  const a = L(e, "cExpression");
  const b = L(e, "cValeursT");
  const c = L(e, "cPointsC");
  const ab = moins(e.B, e.A);
  const expr = `${e.K}${e.M < 0 ? "" : "+"}${e.M}t`;
  // Composantes de AC(t), déjà réduites (« 2 + t », « −3 − 2t »).
  const acx = paramLatex(qSub(e.P0.x, e.A.x), e.u.x);
  const acy = paramLatex(qSub(e.P0.y, e.A.y), e.u.y);
  const facT = (s: string) => (/^\d+$/.test(s) ? s : `(${s})`);
  const t1 = q(2 * e.k - e.K, e.M);
  const t2 = q(-2 * e.k - e.K, e.M);
  return [
    utiliseCours(a, fx("Aire d'un triangle dans un repère orthonormé : la moitié de la valeur absolue de $\\det\\left(\\overrightarrow{AB},\\overrightarrow{AC}\\right)=x_{\\overrightarrow{AB}}\\,y_{\\overrightarrow{AC}}-y_{\\overrightarrow{AB}}\\,x_{\\overrightarrow{AC}}$, avec $C=C(t)$"), COURS_DROITES),
    calcul(a, [
      ligne(`\\overrightarrow{AB}=${vec(ab)}`),
      ligne(`\\overrightarrow{AC}=\\begin{pmatrix}${acx}\\\\ ${acy}\\end{pmatrix}`, [{ type: "latex", valeur: "C=C(t)" }]),
      ligne(`${parQ(ab.x)}\\cdot ${facT(acy)}-${parQ(ab.y)}\\cdot ${facT(acx)}=${expr}`, "on développe et on réduit"),
      ligne(`\\text{Aire}(t)=\\frac{1}{2}\\left|${expr}\\right|`),
    ]),
    resultat(a, fx(`$\\text{Aire}(t)=\\frac{1}{2}\\left|${expr}\\right|$.`)),
    utiliseCours(b, fx("Une valeur absolue égale à un nombre positif donne deux équations : $|u|=2k\\iff u=2k$ ou $u=-2k$"), COURS_DROITES),
    calcul(b, [
      ligne(`\\frac{1}{2}\\left|${expr}\\right|=${e.k}\\iff\\left|${expr}\\right|=${2 * e.k}`),
      ligne(`${expr}=${2 * e.k}\\iff t=${lq(t1)}`),
      ligne(`${expr}=-${2 * e.k}\\iff t=${lq(t2)}`),
    ]),
    resultat(b, fx(`$t=${lq(t1)}$ ou $t=${lq(t2)}$.`)),
    utiliseCours(c, fx("On remplace chaque valeur de $t$ dans le paramétrage $C(t)$ de $d$"), COURS_DROITES),
    calcul(c, [ligne(`C(${lq(t1)})=${lp(e.C[0])}`), ligne(`C(${lq(t2)})=${lp(e.C[1])}`)]),
    avecFigure(resultat(c, fx(`Deux points conviennent : $${nomPt("C_1", e.C[0])}$ et $${nomPt("C_2", e.C[1])}$.`)), figure(e)),
    verification(c, fx("Les deux points sont de part et d'autre de $(AB)$, symétriques par rapport au point où $d$ coupe $(AB)$.")),
    piege(c, fx("Ne donner qu'un point : la valeur absolue donne deux équations, donc deux valeurs de $t$.")),
  ];
}

/** Sommet X sur sa médiane, le milieu de [AX] sur l'autre médiane : système puis solution. */
function lignesSommetMediane(A: Pt, medX: Droite, medAutre: Droite, nom: string): { lignes: LigneCalcul[]; point: Pt } {
  // a(x_A + x)/2 + b(y_A + y)/2 + c = 0  ⟺  a x + b y + (a x_A + b y_A + 2c) = 0
  const a = qB(medAutre.a);
  const b = qB(medAutre.b);
  const c2 = qAdd(qAdd(qMul(a, A.x), qMul(b, A.y)), qMul(q(2), qB(medAutre.c)));
  const pose = `${medAutre.a}\\cdot\\dfrac{${lq(A.x)}+x}{2}${medAutre.b < 0n ? "" : "+"}${medAutre.b}\\cdot\\dfrac{${lq(A.y)}+y}{2}${medAutre.c < 0n ? "" : "+"}${medAutre.c}=0`;
  const sys = lignesSysteme(dQ(medX), [a, b, c2]);
  return {
    lignes: [ligne(pose, `milieu de [A${nom}] sur l'autre médiane`), ligne(`${equationLineaire(a, b, c2)}`, "on multiplie par 2"), ...sys.lignes],
    point: pt(sys.x, sys.y),
  };
}

function corrigeD(e: Extract<E, { famille: "D" }>): EtapeCorrection[] {
  const a = L(e, "dPointB");
  const b = L(e, "dPointC");
  const c = L(e, "dCotes");
  const B = lignesSommetMediane(e.A, e.medianeB, e.medianeC, "B");
  const C = lignesSommetMediane(e.A, e.medianeC, e.medianeB, "C");
  const AB = lignesDroiteDeuxPoints(e.A, e.B, "A", "B", "(AB)");
  const BC = lignesDroiteDeuxPoints(e.B, e.C, "B", "C", "(BC)");
  const CA = lignesDroiteDeuxPoints(e.C, e.A, "C", "A", "(CA)");
  return [
    utiliseCours(a, fx("$B(x\\,;y)$ est sur la médiane issue de $B$, et le milieu de $[AB]$ est sur la médiane issue de $C$ : deux équations, un système"), COURS_DROITES),
    calcul(a, B.lignes),
    resultat(a, fx(`$${nomPt("B", e.B)}$.`)),
    utiliseCours(b, fx("Même méthode : $C$ est sur sa médiane, et le milieu de $[AC]$ est sur la médiane issue de $B$"), COURS_DROITES),
    calcul(b, C.lignes),
    resultat(b, fx(`$${nomPt("C", e.C)}$.`)),
    utiliseCours(c, fx("Droite par deux points : un vecteur directeur $\\begin{pmatrix}u\\\\ v\\end{pmatrix}$ donne le vecteur normal $\\begin{pmatrix}v\\\\ -u\\end{pmatrix}$"), COURS_DROITES),
    calcul(c, [...AB.lignes.slice(1), ...BC.lignes.slice(1), ...CA.lignes.slice(1)], fx(`$\\overrightarrow{AB}=${vec(moins(e.B, e.A))}$, $\\overrightarrow{BC}=${vec(moins(e.C, e.B))}$, $\\overrightarrow{CA}=${vec(moins(e.A, e.C))}$ :`)),
    avecFigure(resultat(c, fx(`$(AB)\\,:\\ ${ld(e.AB)}$ ; $(BC)\\,:\\ ${ld(e.BC)}$ ; $(CA)\\,:\\ ${ld(e.CA)}$.`)), figure(e)),
    verification(c, fx("Chaque sommet vérifie les équations des deux côtés qui y passent.")),
    piege(a, fx("Écrire que $B$ est sur la médiane issue de $C$ : c'est le milieu de $[AB]$ qui y est, pas $B$.")),
  ];
}

function corrigeE(e: Extract<E, { famille: "E" }>): EtapeCorrection[] {
  const a = L(e, "eNombre");
  const ab = lignesDroiteDeuxPoints(e.A, e.B, "A", "B", "(AB)");
  const I = milieu(e.A, e.B);
  const sur = surDroite(e.P, ab.droite);
  const val = qAdd(qAdd(qMul(qB(ab.droite.a), e.P.x), qMul(qB(ab.droite.b), e.P.y)), qB(ab.droite.c));
  const out: EtapeCorrection[] = [
    utiliseCours(a, fx("Une droite est à égale distance de $A$ et de $B$ si et seulement si elle est parallèle à $(AB)$ ou passe par le milieu $I$ de $[AB]$"), COURS_DROITES),
    calcul(a, [
      ...ab.lignes,
      ligne(`I=${lp(I)}`, "milieu de [AB]"),
      ligne(`${ab.droite.a}\\cdot ${parQ(e.P.x)}${ab.droite.b < 0n ? "" : "+"}${ab.droite.b}\\cdot ${parQ(e.P.y)}${ab.droite.c < 0n ? "" : "+"}${ab.droite.c}=${lq(val)}`, sur ? "P est sur (AB)" : "P n'est pas sur (AB)"),
    ]),
  ];
  const fin = e.position === "milieu";
  const conclusion =
    e.position === "milieu"
      ? "$P=I$ est le milieu de $[AB]$ : toute droite passant par $P$ passe par le milieu de $[AB]$. Il y a une infinité de droites."
      : e.position === "surAB"
        ? "$P$ est sur $(AB)$ sans en être le milieu : la parallèle à $(AB)$ par $P$ et la droite $(PI)$ sont toutes deux $(AB)$. Une seule droite convient."
        : "$P$ n'est pas sur $(AB)$ : la parallèle à $(AB)$ par $P$ et la droite $(PI)$ sont deux droites distinctes. Deux droites conviennent.";
  out.push(fin ? avecFigure(resultat(a, fx(conclusion)), figure(e)) : resultat(a, fx(conclusion)));
  if (fin) {
    out.push(piege(a, fx("Chercher « les deux droites » sans regarder la position de $P$ : ici $P$ est le milieu de $[AB]$.")));
    return out;
  }
  const b = L(e, "eDroites");
  if (e.position === "surAB") {
    out.push(
      utiliseCours(b, fx("La seule droite qui convient est $(AB)$"), COURS_DROITES),
      calcul(b, [ligne(`(AB)\\,:\\ ${ld(ab.droite)}`, "calculée à l'étape 1")]),
      avecFigure(resultat(b, fx(`Une seule droite : $(AB)\\,:\\ ${ld(ab.droite)}$.`)), figure(e)),
      piege(b, fx("Donner deux droites : quand $P$ est sur $(AB)$, la parallèle et la droite par le milieu sont la même droite $(AB)$.")),
    );
    return out;
  }
  const par = lignesDroiteNormale(e.P, qB(ab.droite.a), qB(ab.droite.b), "parallèle à (AB) : même vecteur normal, passe par P", "d_1");
  const pi = lignesDroiteDeuxPoints(e.P, I, "P", "I", "d_2");
  out.push(
    utiliseCours(b, fx("Les deux droites : la parallèle à $(AB)$ passant par $P$ (même vecteur normal), et la droite $(PI)$"), COURS_DROITES),
    calcul(b, [...par.lignes, ...pi.lignes]),
    avecFigure(resultat(b, fx(`$d_1\\,:\\ ${ld(par.droite)}$ et $d_2\\,:\\ ${ld(pi.droite)}$.`)), figure(e)),
    piege(b, fx("Oublier la parallèle à $(AB)$ : elle laisse aussi $A$ et $B$ à égale distance, sans passer par le milieu.")),
  );
  return out;
}

function corrigeF(e: Extract<E, { famille: "F" }>): EtapeCorrection[] {
  const a = L(e, "fPerpendiculaire");
  const b = L(e, "fPied");
  const c = L(e, "fSymetrique");
  const ab = moins(e.B, e.A);
  const perp = lignesDroiteNormale(e.P, ab.x, ab.y, [{ type: "texte", valeur: "vecteur normal " }, { type: "latex", valeur: `\\overrightarrow{AB}=${vec(ab)}` }, { type: "texte", valeur: ", passe par P" }]);
  const H = lignesIntersection(e.droiteAB, e.perpendiculaire);
  const AB = lignesDroiteDeuxPoints(e.A, e.B, "A", "B", "(AB)");
  return [
    utiliseCours(a, fx("$\\overrightarrow{AB}$ est un vecteur normal de toute perpendiculaire à $(AB)$"), COURS_DROITES),
    calcul(a, perp.lignes),
    resultat(a, fx(`$${ld(e.perpendiculaire)}$.`)),
    utiliseCours(b, fx("$H$ est sur $(AB)$ et sur la perpendiculaire : on résout le système de leurs deux équations"), COURS_DROITES),
    calcul(b, [...AB.lignes.slice(1), ...H.lignes]),
    resultat(b, fx(`$${nomPt("H", e.H)}$.`)),
    utiliseCours(c, fx("$H$ est le milieu de $[PQ]$ : $Q=2H-P$"), COURS_DROITES),
    calcul(c, lignesSymetrique("Q", e.H, e.P, "H", "P")),
    avecFigure(resultat(c, fx(`$${nomPt("Q", e.Q)}$.`)), figure(e)),
    piege(c, fx("Écrire $Q=2P-H$ : c'est $H$ le milieu de $[PQ]$, pas $P$.")),
  ];
}

function rot(v: Pt): Pt {
  return pt(qNeg(v.y), v.x);
}

function corrigeG(e: Extract<E, { famille: "G" }>): EtapeCorrection[] {
  const a = L(e, "gPremier");
  const b = L(e, "gDeuxieme");
  const c = L(e, "gTroisieme");
  if (e.sousType === "sommetDiagonale") {
    const perp = perpendiculaire(e.droiteBD, e.A);
    const pl = lignesDroiteNormale(e.A, qNeg(qB(e.droiteBD.b)), qB(e.droiteBD.a), "perpendiculaire à (BD) : vecteur normal tourné d'un quart de tour, passe par A", "d");
    const O = lignesIntersection(e.droiteBD, perp);
    const OA = moins(e.A, e.O);
    return [
      utiliseCours(a, fx("Les diagonales d'un carré sont perpendiculaires et se coupent en leur milieu : $O$ est le pied de la perpendiculaire à $(BD)$ passant par $A$"), COURS_DROITES),
      calcul(a, [...pl.lignes, ...O.lignes]),
      resultat(a, fx(`$${nomPt("O", e.O)}$.`)),
      utiliseCours(b, fx("$O$ est le milieu de la diagonale $[AC]$ : $C=2O-A$"), COURS_DROITES),
      calcul(b, lignesSymetrique("C", e.O, e.A, "O", "A")),
      resultat(b, fx(`$${nomPt("C", e.C)}$.`)),
      utiliseCours(c, fx("Les diagonales ont même longueur et sont perpendiculaires : $\\overrightarrow{OB}$ et $\\overrightarrow{OD}$ s'obtiennent en faisant tourner $\\overrightarrow{OA}$ d'un quart de tour, dans un sens puis dans l'autre ($\\begin{pmatrix}u\\\\ v\\end{pmatrix}\\mapsto\\begin{pmatrix}-v\\\\ u\\end{pmatrix}$)"), COURS_DROITES),
      calcul(c, [
        ligne(`\\overrightarrow{OA}=${vec(OA)}`),
        ligne(`O+${vec(rot(OA))}=${lp(plus(e.O, rot(OA)))}`, "quart de tour dans un sens"),
        ligne(`O-${vec(rot(OA))}=${lp(moins(e.O, rot(OA)))}`, "dans l'autre sens"),
      ]),
      avecFigure(resultat(c, fx(`Les deux autres sommets sont $${lp(e.B)}$ et $${lp(e.D)}$ ; l'un ou l'autre peut s'appeler $B$ (l'énoncé ne fixe pas le sens du carré).`)), figure(e)),
      verification(c, fx("Les deux points sont sur $(BD)$, à la distance $OA$ de $O$.")),
      piege(c, fx("Tourner $\\overrightarrow{OA}$ dans un seul sens et oublier le second sommet, ou prendre $C$ (symétrique de $A$) pour $B$.")),
    ];
  }
  const pl = lignesDroiteNormale(e.P, qNeg(qB(e.droiteAB.b)), qB(e.droiteAB.a), "perpendiculaire à (AB) passant par P", "d");
  const M = lignesIntersection(e.droiteAB, perpendiculaire(e.droiteAB, e.P));
  const MP = moins(e.P, e.M);
  return [
    utiliseCours(a, fx("Le centre est à égale distance des côtés : le milieu $M$ de $[AB]$ est le pied de la perpendiculaire à $(AB)$ passant par $P$"), COURS_DROITES),
    calcul(a, [...pl.lignes, ...M.lignes]),
    resultat(a, fx(`$${nomPt("M", e.M)}$.`)),
    utiliseCours(b, fx("Dans un carré, $MA=MB=MP$ (la moitié du côté) et $(AB)\\perp(MP)$ : $\\overrightarrow{MA}$ et $\\overrightarrow{MB}$ s'obtiennent en faisant tourner $\\overrightarrow{MP}$ d'un quart de tour, dans un sens puis dans l'autre"), COURS_DROITES),
    calcul(b, [ligne(`\\overrightarrow{MP}=${vec(MP)}`), ligne(`M+${vec(rot(MP))}=${lp(plus(e.M, rot(MP)))}`, "quart de tour dans un sens"), ligne(`M-${vec(rot(MP))}=${lp(moins(e.M, rot(MP)))}`, "dans l'autre sens")]),
    resultat(b, fx(`Les sommets du côté porté par $(AB)$ : $${lp(e.A)}$ et $${lp(e.B)}$.`)),
    utiliseCours(c, fx("$P$ est le milieu des deux diagonales : chaque sommet a pour opposé son symétrique par rapport à $P$"), COURS_DROITES),
    calcul(c, [...lignesSymetrique("C", e.P, e.A, "P", "A"), ...lignesSymetrique("D", e.P, e.B, "P", "B")]),
    avecFigure(resultat(c, fx(`Les quatre sommets : $${lp(e.A)}$, $${lp(e.B)}$, $${lp(e.C)}$, $${lp(e.D)}$ (dans cet ordre, ils se suivent sur le carré ; toute autre façon de les nommer en tournant autour du carré convient).`)), figure(e)),
    piege(c, fx("Prendre le symétrique de $A$ par rapport à $M$ : les sommets opposés sont symétriques par rapport au centre $P$.")),
  ];
}

function corrigeH(e: Extract<E, { famille: "H" }>): EtapeCorrection[] {
  const a = L(e, "hSymetrique");
  const b = L(e, "hRayon");
  const perp = perpendiculaire(e.d, e.P);
  const pl = lignesDroiteNormale(e.P, qNeg(qB(e.d.b)), qB(e.d.a), "perpendiculaire à d passant par P", "p");
  const H = lignesIntersection(e.d, perp);
  const ray = lignesDroiteDeuxPoints(e.Pp, e.M, "P'", "M", "r");
  const billard = e.contexte === "billard";
  return [
    utiliseCours(a, fx("Symétrique par rapport à une droite : perpendiculaire à $d$ passant par $P$, pied $H$ (intersection avec $d$), puis $P'=2H-P$"), COURS_DROITES),
    calcul(a, [...pl.lignes, ...H.lignes, ligne(`H=${lp(H.point)}`, "pied de la perpendiculaire"), ...lignesSymetrique("P'", H.point, e.P, "H", "P")]),
    resultat(a, fx(`$${nomPt("P'", e.Pp)}$.`)),
    utiliseCours(b, fx(`Loi de la réflexion : ${billard ? "après le rebond, la boule" : "le rayon réfléchi"} semble venir du symétrique $P'$ de $P$ ; ${billard ? "sa trajectoire" : "il"} est portée par la droite $(P'M)$`), COURS_DROITES),
    calcul(b, ray.lignes),
    avecFigure(resultat(b, fx(`$${ld(e.rayonReflechi)}$.`)), figure(e)),
    piege(b, fx(billard ? "Donner la droite $(PM)$ suivie avant le rebond, ou la bande $d$ elle-même : après le rebond, la boule suit $(P'M)$." : "Donner la droite $(PM)$ du rayon incident, ou le miroir $d$ lui-même : le rayon réfléchi est porté par $(P'M)$.")),
  ];
}

export function correctionDetailleePointsDroites(e: E): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliserCombinatoire(corrigeA(e));
    case "B":
      return finaliserCombinatoire(corrigeB(e));
    case "C":
      return finaliserCombinatoire(corrigeC(e));
    case "D":
      return finaliserCombinatoire(corrigeD(e));
    case "E":
      return finaliserCombinatoire(corrigeE(e));
    case "F":
      return finaliserCombinatoire(corrigeF(e));
    case "G":
      return finaliserCombinatoire(corrigeG(e));
    case "H":
      return finaliserCombinatoire(corrigeH(e));
  }
}

