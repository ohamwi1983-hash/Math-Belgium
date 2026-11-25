import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { ExerciceIntersectionA, ExerciceIntersectionB, ExerciceIntersectionsConiques } from "../../core6e/intersectionsConiques.types";
import { phasesPourExercice } from "../../moteur6e/typesIntersectionsConiques";
import type { PhaseIntersectionsConiques } from "../../moteur6e/typesIntersectionsConiques";
import { latexPoint, latexQ, latexSomme, milieu, polyCoef, polyConstante, q, qAdd, qMul, qNum, qSub } from "../../moteur6e/algebreLieux";
import type { Q } from "../../moteur6e/algebreLieux";
import { latexConique, polyConique, ppcmDen } from "../../moteur6e/algebreConiques";
import { polyCercleB } from "../../moteur6e/verificationIntersectionsConiques";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { lignesDroiteNormale, vecteur } from "../../ui6e/corrigeLieux";
import { COURS_IDENTIFIER, COURS_INTERSECTION, avecFigureConique, carreL, decale, lignesDiscriminant, lignesSolutions, milliersDans, parQ, trinome, yMK } from "../../ui6e/corrigeConiques";
import { eqPoly } from "../../ui6e/textesConiques";
import { figure6gen61 } from "../../ui6e/formatIntersectionsConiques";
import { milliers } from "../../ui6e/fragmentsCombinatoire";
import { quadratique } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de `6gen61` (intersection d'une conique et d'une droite, 6e ch. 10,
 * § 4 ; audit, lot E), une lettre par écran — même source pour l'écran (corrigé consultable après chaque
 * réponse) et pour le papier. Équation de la conique depuis son sommet et son foyer (nature décidée par
 * c < a ou c > a), équation de la droite (deux points, médiatrice, hauteur), substitution, équation du
 * second degré à coefficients entiers (toute équation proportionnelle convient : le signe de Δ n'en dépend
 * pas), Δ, points communs exacts vérifiés ; famille B : combinaison λC₁ + μC₂ qui annule les termes
 * différents en x² et y² (cours, § 4). FIGURE (conique, droite, points communs) sous le dernier résultat.
 */

type E = ExerciceIntersectionsConiques;
type P = PhaseIntersectionsConiques;

const lq = latexQ;
const L = (e: E, p: P) => lettreEtape(phasesPourExercice(e).indexOf(p));
const figure = (e: E) => figure6gen61(e, phasesPourExercice(e));
const absQ = (r: Q) => (r.n < 0n ? q(-r.n, r.d) : r);

function corrigeConique(e: ExerciceIntersectionA, a: string): EtapeCorrection[] {
  const c = e.conique;
  if (c.type === "cercle") {
    return [
      utiliseCours(a, fx("Cercle de centre $O$ et de rayon $r$ : $x^2+y^2=r^2$, avec $r=OS$"), COURS_IDENTIFIER),
      calcul(a, [ligne(`r^2=OS^2=${[e.S.x, e.S.y].filter((v) => v.n !== 0n).map(carreL).join("+")}=${lq(c.r2)}`, "carré de la distance de O à S")]),
      resultat(a, fx(`$\\Gamma\\,:\\ ${latexConique(c)}$.`)),
    ];
  }
  if (c.type !== "ellipse" && c.type !== "hyperbole") return [];
  const aa = Math.round(Math.sqrt(qNum(c.a2)));
  const cc = Math.round(Math.sqrt(qNum(c.a2) + (c.type === "ellipse" ? -1 : 1) * qNum(c.b2)));
  const ell = c.type === "ellipse";
  return [
    utiliseCours(a, fx("Sur l'axe focal (celui de $S$ et $F$) : $a=OS$ et $c=OF$ ; le foyer est entre le centre et le sommet pour une ellipse ($c<a$, $b^2=a^2-c^2$), au-delà pour une hyperbole ($c>a$, $b^2=c^2-a^2$) ; $a^2$ va sous le carré de la variable de l'axe focal"), COURS_IDENTIFIER),
    calcul(a, [
      ligne(`a=OS=${aa}`, "distance du centre au sommet"),
      ligne(`c=OF=${cc}`, `distance du centre au foyer : c ${ell ? "<" : ">"} a, ${ell ? "ellipse" : "hyperbole"}`),
      ligne(ell ? `b^2=a^2-c^2=${aa * aa}-${cc * cc}=${lq(c.b2)}` : `b^2=c^2-a^2=${cc * cc}-${aa * aa}=${lq(c.b2)}`),
    ]),
    resultat(a, fx(`$\\Gamma$ est ${ell ? "une ellipse" : "une hyperbole"} d'axe focal ${c.axe === "x" ? "horizontal" : "vertical"} : $\\Gamma\\,:\\ ${latexConique(c)}$.`)),
  ];
}

function corrigeDroite(e: ExerciceIntersectionA, b: string): EtapeCorrection[] {
  const AB = { x: qSub(e.B.x, e.A.x), y: qSub(e.B.y, e.A.y) };
  const fin = ligne(yMK(e.m, e.k), "on isole y");
  if (e.sousTypeDroite === "deuxPoints") {
    return [
      utiliseCours(b, fx("La droite $(AB)$ a pour pente $m=\\dfrac{y_B-y_A}{x_B-x_A}$ et passe par $A$ : $y=mx+k$ avec $k=y_A-m\\,x_A$"), COURS_INTERSECTION),
      calcul(b, [ligne(`m=\\dfrac{${lq(e.B.y)}-${parQ(e.A.y)}}{${lq(e.B.x)}-${parQ(e.A.x)}}=${lq(e.m)}`, "pente de (AB)"), ligne(`k=${lq(e.A.y)}-${parQ(e.m)}\\cdot ${parQ(e.A.x)}=${lq(e.k)}`, "la droite passe par A")]),
      resultat(b, fx(`$d\\,:\\ ${yMK(e.m, e.k)}$.`)),
    ];
  }
  if (e.sousTypeDroite === "mediatrice") {
    const M = milieu(e.A, e.B);
    const r = lignesDroiteNormale(M, AB.x, AB.y, [{ type: "texte", valeur: "passe par M, vecteur normal " }, { type: "latex", valeur: `\\overrightarrow{AB}=${vecteur(AB.x, AB.y)}` }]);
    return [
      utiliseCours(b, fx("La médiatrice de $[AB]$ passe par le milieu $M$ de $[AB]$ et admet $\\overrightarrow{AB}$ comme vecteur normal"), COURS_INTERSECTION),
      calcul(b, [ligne(`M=${latexPoint(M)}`, "milieu de [AB]"), ...r.lignes, fin]),
      resultat(b, fx(`$d\\,:\\ ${yMK(e.m, e.k)}$.`)),
    ];
  }
  const r = lignesDroiteNormale(e.C!, AB.x, AB.y, [{ type: "texte", valeur: "passe par C, vecteur normal " }, { type: "latex", valeur: `\\overrightarrow{AB}=${vecteur(AB.x, AB.y)}` }]);
  return [
    utiliseCours(b, fx("La hauteur issue de $C$ passe par $C$ et est perpendiculaire à $(AB)$ : $\\overrightarrow{AB}$ en est un vecteur normal"), COURS_INTERSECTION),
    calcul(b, [...r.lignes, fin]),
    resultat(b, fx(`$d\\,:\\ ${yMK(e.m, e.k)}$.`)),
  ];
}

/** « x² + (mx + k)² = r² », « b²x² + a²(mx + k)² = a²b² »… puis l'équation développée et simplifiée. */
function lignesSubstitution(e: ExerciceIntersectionA): LigneCalcul[] {
  const P = polyConique(e.conique);
  const Lc = ppcmDen([...P.values()]);
  const al = qMul(q(Lc), polyCoef(P, { x: 2 }));
  const be = qMul(q(Lc), polyCoef(P, { y: 2 }));
  const ga = qMul(q(Lc), polyConstante(P));
  const ex = latexSomme([
    [e.m, "x"],
    [e.k, ""],
  ]);
  const carre = e.m.n === 0n ? carreL(e.k) : `\\left(${ex}\\right)^2`;
  const coef = (r: Q, premier: boolean) => {
    const s = r.n < 0n ? "-" : premier ? "" : "+";
    const v = absQ(r);
    return `${s}${v.n === 1n && v.d === 1n ? "" : lq(v)}`;
  };
  const cb = coef(be, false);
  const ligne1 = `${coef(al, true)}x^2${cb}${e.m.n === 0n && /\d/.test(cb) ? "\\cdot " : ""}${carre}=${lq(qMul(q(-1), ga))}`;
  const [A, B, C] = quadratique(e.conique, e.m, e.k).map((r) => qMul(q(Lc), r)) as [Q, Q, Q];
  const lignes: LigneCalcul[] = [ligne(milliersDans(ligne1), `on remplace y dans l'équation de Γ${Lc === 1n ? "" : ` multipliée par ${milliers(Lc)}`}`), ligne(milliersDans(trinome(A, B, C)), "on développe et on rassemble")];
  const eqT = `${latexSomme([
    [q(e.eq[0]), "x^2"],
    [q(e.eq[1]), "x"],
    [q(e.eq[2]), ""],
  ])}=0`;
  if (eqT !== trinome(A, B, C)) lignes.push(ligne(milliersDans(eqT), "on simplifie (on multiplie ou on divise par un même nombre)"));
  return lignes;
}

function corrigeA(e: ExerciceIntersectionA): EtapeCorrection[] {
  const a = L(e, "aConique");
  const b = L(e, "aDroite");
  const c = L(e, "aEquationX");
  const d = L(e, "aNombre");
  const disc = lignesDiscriminant(e.eq, "x");
  const eqT = `${latexSomme([
    [q(e.eq[0]), "x^2"],
    [q(e.eq[1]), "x"],
    [q(e.eq[2]), ""],
  ])}=0`;
  const out: EtapeCorrection[] = [
    ...corrigeConique(e, a),
    ...corrigeDroite(e, b),
    utiliseCours(c, fx("On remplace $y$ par son expression tirée de l'équation de $d$ dans l'équation de $\\Gamma$ : on obtient une équation en $x$ seulement"), COURS_INTERSECTION),
    calcul(c, lignesSubstitution(e)),
    resultat(c, fx(`$${milliersDans(eqT)}$ (toute équation proportionnelle convient).`)),
    utiliseCours(d, fx("Équation du second degré : $\\Delta>0$, deux points communs ; $\\Delta=0$, un seul ($d$ est tangente à $\\Gamma$) ; $\\Delta<0$, aucun"), COURS_INTERSECTION),
    calcul(d, disc.lignes),
  ];
  const nb = e.verdict;
  const signe = nb === 2 ? ">" : nb === 1 ? "=" : "<";
  const conclusion = nb === 2 ? "deux points communs ($d$ est sécante)." : nb === 1 ? "un seul point commun : $d$ est tangente à $\\Gamma$." : "aucun point commun ($d$ est extérieure à $\\Gamma$).";
  if (nb === 0) {
    out.push(
      avecFigureConique(resultat(d, fx(`$\\Delta=${milliers(disc.delta)}${signe}0$ : ${conclusion}`)), figure(e)),
      piege(d, fx("Un discriminant négatif n'est pas une erreur de calcul : la droite ne rencontre pas la conique.")),
    );
    return out;
  }
  out.push(resultat(d, fx(`$\\Delta=${nb === 1 ? "0" : `${milliers(disc.delta)}${signe}0`}$ : ${conclusion}`)));
  const f = L(e, "aPoints");
  const sol = lignesSolutions(e.eq, "x");
  const pts = sol.sol.map((x) => ({ x, y: qAdd(qMul(e.m, x), e.k) }));
  const nom = (i: number) => (pts.length > 1 ? `y_${i + 1}` : "y");
  const fin = e.k.n === 0n ? "" : `${e.k.n < 0n ? "-" : "+"}${lq(absQ(e.k))}`;
  const lignesY = pts.map((P, i) => ligne(`${nom(i)}=${lq(e.m)}\\cdot ${parQ(P.x)}${fin}=${lq(P.y)}`, i === 0 ? "ordonnée par l'équation de d" : undefined));
  // y = 0·x + k : écriture directe.
  const lignesYs = e.m.n === 0n ? [ligne(`y=${lq(e.k)}`, "d est horizontale")] : lignesY;
  const verif = (() => {
    const P0 = pts[0];
    const Pc = polyConique(e.conique);
    let s = q(0);
    for (const [cle, co] of Pc) {
      let t = co;
      if (cle !== "") for (const mo of cle.split(",")) {
        const [v, ex] = mo.split(":");
        for (let i = 0; i < Number(ex); i++) t = qMul(t, v === "x" ? P0.x : P0.y);
      }
      s = qAdd(s, t);
    }
    return s.n === 0n;
  })();
  out.push(
    utiliseCours(f, fx("Les solutions de l'équation en $x$ sont les abscisses des points communs ; l'équation de $d$ donne leurs ordonnées"), COURS_INTERSECTION),
    calcul(f, [...sol.lignes, ...lignesYs]),
    avecFigureConique(resultat(f, fx(pts.length > 1 ? `Les points communs : $${latexPoint(pts[0])}$ et $${latexPoint(pts[1])}$.` : `Le point commun (point de contact) : $${latexPoint(pts[0])}$.`)), figure(e)),
    ...(verif ? [verification(f, fx(`$${latexPoint(pts[0])}$ vérifie l'équation de $\\Gamma$ et celle de $d$${pts.length > 1 ? " (de même pour l'autre point)" : ""}.`))] : []),
    nb === 1 ? piege(d, fx("$\\Delta=0$ ne veut pas dire « aucun point » : il y a exactement un point commun, et $d$ est tangente à $\\Gamma$.")) : piege(a, fx("$a^2$ va sous le carré de la variable de l'axe focal, celui du sommet et du foyer donnés.")),
  );
  return out;
}

function corrigeB(e: ExerciceIntersectionB): EtapeCorrection[] {
  const a = L(e, "bCouple");
  const b = L(e, "bCercle");
  const c = L(e, "bCentreRayon");
  const C1 = latexSomme([
    [q(1), "x^2"],
    [q(e.b1), "x"],
    [q(-1), "y"],
    [q(e.c1), ""],
  ]);
  const C2 = latexSomme([
    [q(e.A2), "x^2"],
    [q(e.B2), "y^2"],
    [q(e.D2), "x"],
    [q(e.E2), "y"],
    [q(e.F2), ""],
  ]);
  const K = e.B2;
  const h = e.centre.x;
  const k = e.centre.y;
  const dev = latexSomme([
    [q(K), "x^2"],
    [q(K), "y^2"],
    [qMul(q(-2 * K), h), "x"],
    [qMul(q(-2 * K), k), "y"],
    [q(K * (qNum(h) ** 2 + qNum(k) ** 2 - e.rayon ** 2)), ""],
  ]);
  const cercle = eqPoly(polyCercleB(e));
  const r2 = e.rayon * e.rayon;
  const lambda = `${e.lambda < 0 ? `(${e.lambda})` : e.lambda}`;
  return [
    utiliseCours(a, fx("Tout point commun à $C_1$ et $C_2$ vérifie aussi toute combinaison $\\lambda\\cdot C_1+\\mu\\cdot C_2=0$ des deux équations ; c'est l'équation d'un cercle si les coefficients de $x^2$ et de $y^2$ sont égaux (et sans terme en $xy$). On écrit $C_1\\,:\\ " + C1 + "=0$"), COURS_INTERSECTION),
    calcul(a, [ligne(`\\lambda+${e.A2}\\mu=${e.B2}\\mu`, "coefficients de x² et de y² égaux"), ligne(`\\lambda=${e.lambda}\\mu`), ligne(`\\mu=1\\ \\Rightarrow\\ \\lambda=${e.lambda}`, "on choisit μ = 1")]),
    resultat(a, fx(`$(\\lambda\\,;\\mu)=(${e.lambda}\\,;1)$, ou tout couple proportionnel.`)),
    utiliseCours(b, fx("On remplace $\\lambda$ et $\\mu$, on développe et on réduit, puis on divise par le coefficient commun de $x^2$ et $y^2$"), COURS_INTERSECTION),
    calcul(b, [ligne(milliersDans(`${lambda}\\left(${C1}\\right)+${C2}=0`), "λ·C₁ + μ·C₂ = 0 avec μ = 1"), ligne(milliersDans(`${dev}=0`), "on développe et on réduit"), ligne(cercle, `on divise par ${K}`)]),
    resultat(b, fx(`Les points communs à $C_1$ et $C_2$ sont sur la courbe $${cercle}$.`)),
    utiliseCours(c, fx("On complète les carrés : $(x-h)^2+(y-k)^2=r^2$, centre $\\Omega(h\\,;k)$, rayon $r$"), COURS_INTERSECTION),
    calcul(c, [ligne(`${h.n === 0n ? "x^2" : `(${decale("x", h)})^2`}+${k.n === 0n ? "y^2" : `(${decale("y", k)})^2`}=${r2}`, "on complète les carrés"), ligne(`r=\\sqrt{${r2}}=${e.rayon}`)]),
    avecFigureConique(resultat(c, fx(`C'est le cercle de centre $\\Omega${latexPoint(e.centre)}$ et de rayon $r=${e.rayon}$ : les points communs à $C_1$ et $C_2$ sont sur ce cercle.`)), figure(e)),
    verification(c, fx("$r^2>0$ : c'est bien un cercle (et non un point ou l'ensemble vide).")),
    piege(a, fx("Il ne faut pas résoudre le système : la combinaison suffit, et elle doit égaliser les coefficients de $x^2$ et de $y^2$.")),
  ];
}

export function correctionDetailleeIntersectionsConiques(e: E): EtapeCorrection[] {
  return finaliserCombinatoire(e.famille === "A" ? corrigeA(e) : corrigeB(e));
}
