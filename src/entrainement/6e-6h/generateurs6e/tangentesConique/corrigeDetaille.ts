import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { DroiteMK, ExerciceTangenteA, ExerciceTangenteB, ExerciceTangenteC, ExerciceTangenteD, ExerciceTangenteE, ExerciceTangentesConique } from "../../core6e/tangentesConique.types";
import { phasesPourExercice } from "../../moteur6e/typesTangentesConique";
import type { PhaseTangentesConique } from "../../moteur6e/typesTangentesConique";
import { latexDroite, latexPoint, latexQ, latexRacine, latexSomme, q, qAdd, qDiv, qMul, qNeg, qNum, qSub } from "../../moteur6e/algebreLieux";
import type { Q } from "../../moteur6e/algebreLieux";
import { latexConique, penteAsymptote, ppcmDen, racineQ } from "../../moteur6e/algebreConiques";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { COURS_TANGENTES, avecFigureConique, carreL, decale, milliersDans, lignesDiscriminant, lignesSolutions, parQ, yMK } from "../../ui6e/corrigeConiques";
import { latex, texte } from "../../../export/corrigeTableau";
import { milliers } from "../../ui6e/fragmentsCombinatoire";
import { figure6gen62 } from "../../ui6e/formatTangentesConique";
import { formeCentree, k2Tangente, pointContact } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de `6gen62` (tangentes à une conique, 6e ch. 10, § 5 ; audit,
 * lot E), une lettre par écran — même source pour l'écran (corrigé consultable après chaque réponse) et
 * pour le papier. Notations du cours : pente par la dérivée de la branche qui contient P, contrôle par
 * la forme DÉDOUBLÉE (parabole y·y_P = p(x + x_P)), condition de tangence k² = a²m² + b² (ellipse),
 * k² = a²m² − b² (hyperbole d'axe focal horizontal), k² = a² − b²m² (axe focal vertical). Valeurs
 * exactes ; FIGURE (conique, droite donnée, tangentes, points de contact) sous le dernier résultat.
 */

type E = ExerciceTangentesConique;
type P = PhaseTangentesConique;

const lq = latexQ;
const L = (e: E, p: P) => lettreEtape(phasesPourExercice(e).indexOf(p));
const figure = (e: E) => figure6gen62(e, phasesPourExercice(e));
const kDe = (P: { x: Q; y: Q }, m: Q) => qSub(P.y, qMul(m, P.x));
/** « \dfrac{\left(\frac{6}{5}\right)^2}{4} » ; dénominateur 1 omis. */
const fracCarre = (v: Q, den: Q) => (den.n === 1n && den.d === 1n ? carreL(v) : `\\dfrac{${carreL(v)}}{${lq(den)}}`);
/** « \dfrac{x\cdot 3}{25} » ; dénominateur 1 omis. */
const fracProduit = (lettre: string, v: Q, den: Q) => (den.n === 1n && den.d === 1n ? `${lettre}\\cdot ${parQ(v)}` : `\\dfrac{${lettre}\\cdot ${parQ(v)}}{${lq(den)}}`);

/** « P vérifie l'équation » : premier membre de l'équation réduite calculé en P. */
function verifPoint(e: { conique: ExerciceTangenteA["conique"]; P: { x: Q; y: Q } }): string {
  const c = e.conique;
  if (c.type === "parabole") {
    const [v, w] = c.axe === "x" ? [e.P.y, e.P.x] : [e.P.x, e.P.y];
    const coef = qMul(q(2 * c.sens), c.p);
    return `${carreL(v)}=${lq(qMul(v, v))}=${lq(coef)}\\cdot ${parQ(w)}`;
  }
  if (c.type !== "ellipse" && c.type !== "hyperbole") return "";
  const f = formeCentree(c);
  const tx = fracCarre(e.P.x, f.X);
  const ty = fracCarre(e.P.y, f.Y);
  const somme = qAdd(qMul(q(f.sx), qDiv(qMul(e.P.x, e.P.x), f.X)), qMul(q(f.sy), qDiv(qMul(e.P.y, e.P.y), f.Y)));
  const corps = f.sx > 0 ? `${tx}${f.sy > 0 ? "+" : "-"}${ty}` : `${ty}-${tx}`;
  return `${corps}=${lq(somme)}`;
}

/** Forme dédoublée de la tangente en P (centrée ou parabole), posée avec les nombres. */
function dedoublee(e: ExerciceTangenteA): string {
  const c = e.conique;
  if (c.type === "parabole") {
    const p = qMul(q(c.sens), c.p);
    return c.axe === "x" ? `y\\cdot ${parQ(e.P.y)}=${lq(p)}\\left(${decale("x", qNeg(e.P.x))}\\right)` : `x\\cdot ${parQ(e.P.x)}=${lq(p)}\\left(${decale("y", qNeg(e.P.y))}\\right)`;
  }
  const f = formeCentree(c);
  const tx = fracProduit("x", e.P.x, f.X);
  const ty = fracProduit("y", e.P.y, f.Y);
  return `${f.sx > 0 ? `${tx}${f.sy > 0 ? "+" : "-"}${ty}` : `${ty}-${tx}`}=1`;
}

function corrigeA(e: ExerciceTangenteA): EtapeCorrection[] {
  const a = L(e, "aPente");
  const b = L(e, "aTangente");
  const c = e.conique;
  const k = kDe(e.P, e.pente);
  const out: EtapeCorrection[] = [];
  if (c.type === "parabole") {
    const p = qMul(q(c.sens), c.p);
    const eq = latexConique(c);
    const s = p.n < 0n ? "-" : "";
    const pa = lq(p.n < 0n ? qMul(q(-1), p) : p);
    out.push(
      utiliseCours(a, fx(c.axe === "x" ? `La pente de la tangente s'obtient en dérivant : de $${eq}$, on tire $2y\\,y'=${lq(qMul(q(2), p))}$, donc la pente en $P$ vaut $m=${s}\\dfrac{${pa}}{y_P}$` : `La parabole est le graphique de $y=${s}\\dfrac{x^2}{${lq(qMul(q(2), p.n < 0n ? qMul(q(-1), p) : p))}}$ ; sa dérivée en $x_P$ donne la pente : $m=${s}\\dfrac{x_P}{${pa}}$`), COURS_TANGENTES),
      calcul(a, [ligne(c.axe === "x" ? `m=${s}\\dfrac{${pa}}{${parQ(e.P.y)}}=${lq(e.pente)}` : `m=${s}\\dfrac{${parQ(e.P.x)}}{${pa}}=${lq(e.pente)}`)], fx(`$P${latexPoint(e.P)}$ est bien sur $\\Gamma$ : $${verifPoint(e)}$.`)),
    );
  } else if (c.type === "ellipse" || c.type === "hyperbole") {
    const f = formeCentree(c);
    const signe = c.type === "ellipse" ? "-" : "";
    const [num, den] = c.axe === "x" ? ["b^2", "a^2"] : ["a^2", "b^2"];
    out.push(
      utiliseCours(a, fx(`On dérive la branche qui contient $P$ ; pour $${latexConique(c)}$, la pente de la tangente en $P(x_P\\,;y_P)$ vaut $m=${signe}\\dfrac{${num}\\,x_P}{${den}\\,y_P}$`), COURS_TANGENTES),
      calcul(a, [ligne(`m=${signe}\\dfrac{${lq(f.Y)}\\cdot ${parQ(e.P.x)}}{${lq(f.X)}\\cdot ${parQ(e.P.y)}}=${lq(e.pente)}`)], fx(`$P${latexPoint(e.P)}$ est bien sur $\\Gamma$ : $${verifPoint(e)}$.`)),
    );
  }
  out.push(resultat(a, fx(`La pente de la tangente en $P$ vaut $m=${lq(e.pente)}$.`)));
  out.push(
    utiliseCours(b, fx("La tangente est la droite de pente $m$ qui passe par $P$ : $y-y_P=m(x-x_P)$"), COURS_TANGENTES),
    calcul(b, [ligne(`${decale("y", e.P.y)}=${lq(e.pente)}\\left(${decale("x", e.P.x)}\\right)`, "droite de pente m passant par P"), ligne(yMK(e.pente, k), "on développe")]),
    avecFigureConique(resultat(b, fx(`La tangente à $\\Gamma$ en $P$ a pour équation $${yMK(e.pente, k)}$, soit $${latexDroite(e.tangente)}$.`)), figure(e)),
    verification(b, fx(`La forme dédoublée en $P$ donne la même droite : $${dedoublee(e)}$, soit $${latexDroite(e.tangente)}$.`)),
    c.type === "parabole" ? piege(b, fx("Pour $y^2=2px$, la tangente en $P$ est $y\\,y_P=p(x+x_P)$ : le coefficient est $p$, pas $2p$.")) : piege(a, fx("Dériver la mauvaise branche (ou oublier le signe de $y_P$) change le signe de la pente : on dérive celle qui contient $P$.")),
  );
  return out;
}

/** « k² = a²m² − b² = 9·(1/2)² − 4 » posé avec les nombres (hyperbole ou ellipse centrée). */
function lignesConditionK(c: ExerciceTangenteB["conique"] | ExerciceTangenteE["conique"], m: Q, k2: Q): LigneCalcul[] {
  const f = formeCentree(c);
  const m2 = qMul(m, m);
  const tX = qMul(q(f.sx), qMul(f.X, m2));
  const tY = qMul(q(f.sy), f.Y);
  let formule: string;
  let posee: string;
  if (c.type === "ellipse") {
    formule = c.axe === "x" ? "a^2m^2+b^2" : "b^2m^2+a^2";
    posee = `${lq(f.X)}\\cdot ${carreL(m)}+${lq(f.Y)}`;
  } else if (c.axe === "x") {
    formule = "a^2m^2-b^2";
    posee = `${lq(f.X)}\\cdot ${carreL(m)}-${lq(f.Y)}`;
  } else {
    formule = "a^2-b^2m^2";
    posee = `${lq(f.Y)}-${lq(f.X)}\\cdot ${carreL(m)}`;
  }
  const lignes = [ligne(`k^2=${formule}=${posee}`, "condition de tangence")];
  const inter = c.type === "hyperbole" && c.axe === "y" ? `${lq(tY)}${tX.n < 0n ? "-" : "+"}${lq(tX.n < 0n ? qNeg(tX) : tX)}` : `${lq(tX)}${tY.n < 0n ? "-" : "+"}${lq(tY.n < 0n ? qNeg(tY) : tY)}`;
  lignes.push(ligne(`=${inter}`));
  lignes.push(ligne(`=${lq(k2)}`));
  return lignes;
}

function conditionTexte(c: ExerciceTangenteB["conique"] | ExerciceTangenteE["conique"]): string {
  if (c.type === "ellipse") return "$y=mx+k$ est tangente à l'ellipse si $k^2=a^2m^2+b^2$ (axe focal horizontal ; $a$ et $b$ échangent leurs rôles si l'axe focal est vertical)";
  return c.axe === "x" ? "$y=mx+k$ est tangente à l'hyperbole $\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1$ si $k^2=a^2m^2-b^2$" : "$y=mx+k$ est tangente à l'hyperbole $\\frac{y^2}{a^2}-\\frac{x^2}{b^2}=1$ si $k^2=a^2-b^2m^2$";
}

function corrigeB(e: ExerciceTangenteB): EtapeCorrection[] {
  const a = L(e, "bEquationK");
  const b = L(e, "bNombre");
  const c = e.conique;
  const out: EtapeCorrection[] = [
    utiliseCours(a, fx(`Les droites parallèles à $d$ s'écrivent $y=${latexSomme([[e.d.m, "x"]])}+k$. Condition de tangence : ${conditionTexte(c)}`), COURS_TANGENTES),
    calcul(a, lignesConditionK(c, e.d.m, e.k2)),
    resultat(a, fx(`Une parallèle à $d$ est tangente à $\\Gamma$ si et seulement si $k^2=${lq(e.k2)}$.`)),
    utiliseCours(b, fx("Un carré n'est jamais négatif : l'équation $k^2=K$ a deux solutions si $K>0$, aucune si $K<0$"), COURS_TANGENTES),
  ];
  const pa = penteAsymptote(c);
  const pente = `|m|=${lq(e.d.m.n < 0n ? qNeg(e.d.m) : e.d.m)}`;
  const compare = pa ? fx(`Les asymptotes ont pour pentes $\\pm${lq(pa)}$ et $${pente}$ : ${c.axe === "x" ? (e.verdict === 2 ? "$d$ est plus raide que les asymptotes, condition pour qu'une tangente lui soit parallèle." : "$d$ n'est pas plus raide que les asymptotes, aucune tangente ne lui est parallèle.") : e.verdict === 2 ? "$d$ est plus plate que les asymptotes (axe focal vertical), condition pour qu'une tangente lui soit parallèle." : "$d$ n'est pas plus plate que les asymptotes (axe focal vertical), aucune tangente ne lui est parallèle."}`) : [];
  if (e.verdict === 0) {
    out.push(
      avecFigureConique(resultat(b, fx(`$k^2=${lq(e.k2)}<0$ : aucune valeur de $k$ ne convient. Aucune tangente à $\\Gamma$ n'est parallèle à $d$.`)), figure(e)),
      ...(compare.length ? [verification(b, compare)] : []),
      piege(b, fx("Un $k^2$ négatif n'est pas une erreur de calcul : il signifie qu'aucune tangente n'est parallèle à $d$.")),
    );
    return out;
  }
  out.push(resultat(b, fx(`$k^2=${lq(e.k2)}>0$ : deux valeurs opposées de $k$, donc deux tangentes parallèles à $d$.`)));
  if (compare.length) out.push(verification(b, compare));
  const cc = L(e, "bTangentes");
  const K = racineQ(e.k2);
  out.push(
    utiliseCours(cc, fx("Chaque valeur de $k$ donne une tangente $y=mx+k$"), COURS_TANGENTES),
    calcul(cc, [ligne(`k_1=\\sqrt{${lq(e.k2)}}=${lq(K)}`), ligne(`k_2=-\\sqrt{${lq(e.k2)}}=${lq(qNeg(K))}`)]),
    avecFigureConique(resultat(cc, fx(`Les deux tangentes parallèles à $d$ : $${yMK(e.d.m, K)}$ et $${yMK(e.d.m, qNeg(K))}$.`)), figure(e)),
    piege(a, fx(c.axe === "y" ? "L'axe focal est vertical : la condition est $k^2=a^2-b^2m^2$, pas $a^2m^2-b^2$." : "Pour l'hyperbole, $k^2=a^2m^2-b^2$ : un « − », contrairement à l'ellipse.")),
  );
  return out;
}

function corrigeC(e: ExerciceTangenteC): EtapeCorrection[] {
  const a = L(e, "cEquationM");
  const b = L(e, "cNombre");
  const c = e.conique;
  const f = formeCentree(c);
  const kExpr = latexSomme([
    [e.P.y, ""],
    [qNeg(e.P.x), "m"],
  ]);
  const A = qSub(qMul(e.P.x, e.P.x), f.X);
  const B = qMul(q(-2), qMul(e.P.x, e.P.y));
  const C = qSub(qMul(e.P.y, e.P.y), f.Y);
  const eqM = e.eqM.map((x) => x.n) as [bigint, bigint, bigint];
  const s = qDiv(e.eqM[0], A);
  const trin = (u: Q, v: Q, w: Q) => `${latexSomme([
    [u, "m^2"],
    [v, "m"],
    [w, ""],
  ])}=0`;
  const lignesA: LigneCalcul[] = [
    ligne(`k=${kExpr}`, "la droite y = mx + k passe par P : k = y_P − m·x_P"),
    ligne(`\\left(${kExpr}\\right)^2=${lq(f.X)}m^2+${lq(f.Y)}`, "condition de tangence"),
    ligne(trin(A, B, C), "on développe et on rassemble"),
  ];
  if (!(s.n === 1n && s.d === 1n)) lignesA.push(ligne(trin(e.eqM[0], e.eqM[1], e.eqM[2]), s.d === 1n ? `on multiplie par ${s.n < 0n ? `−${-s.n}` : s.n}` : [texte("on multiplie par "), latex(lq(s))]));
  const disc = lignesDiscriminant(eqM, "m");
  const valeur = qAdd(qDiv(qMul(e.P.x, e.P.x), f.X), qDiv(qMul(e.P.y, e.P.y), f.Y));
  const out: EtapeCorrection[] = [
    utiliseCours(a, fx(`Une droite non verticale qui passe par $P$ s'écrit $y=mx+k$ avec $k=y_P-m\\,x_P$ ; par la condition de tangence, elle est tangente à l'ellipse $${latexConique(c)}$ si $k^2=${lq(f.X)}m^2+${lq(f.Y)}$`), COURS_TANGENTES),
    calcul(a, lignesA),
    resultat(a, fx(`L'équation en $m$ : $${trin(e.eqM[0], e.eqM[1], e.eqM[2])}$.`)),
    utiliseCours(b, fx("Le nombre de tangentes issues de $P$ est le nombre de solutions de l'équation en $m$ : on regarde le signe de son discriminant"), COURS_TANGENTES),
    calcul(b, disc.lignes),
  ];
  const termesP = [e.P.x.n !== 0n ? fracCarre(e.P.x, f.X) : "", e.P.y.n !== 0n ? fracCarre(e.P.y, f.Y) : ""].filter((t) => t).join("+");
  const verif = verification(b, fx(`Position de $P$ : $${termesP}=${lq(valeur)}$, ${qNum(valeur) < 1 ? "plus petit que 1 : $P$ est à l'intérieur de l'ellipse" : "plus grand que 1 : $P$ est à l'extérieur de l'ellipse"}.`));
  if (e.verdict === 0) {
    out.push(
      avecFigureConique(resultat(b, fx(`$\\Delta=${milliers(disc.delta)}<0$ : aucune tangente à $\\Gamma$ ne passe par $P$ ($P$ est à l'intérieur de l'ellipse).`)), figure(e)),
      verif,
      piege(b, fx("Un discriminant négatif n'est pas une erreur de calcul : $P$ est à l'intérieur de l'ellipse, aucune tangente ne passe par $P$.")),
    );
    return out;
  }
  out.push(resultat(b, fx(`$\\Delta=${milliers(disc.delta)}>0$ : deux tangentes à $\\Gamma$ passent par $P$ ($P$ est à l'extérieur de l'ellipse).`)), verif);
  const cc = L(e, "cTangentes");
  const sol = lignesSolutions(eqM, "m", "m");
  const [m1, m2] = sol.sol;
  const k1 = kDe(e.P, m1);
  const k2 = kDe(e.P, m2);
  out.push(
    utiliseCours(cc, fx("Chaque solution $m$ donne une tangente $y=mx+k$, avec $k=y_P-m\\,x_P$"), COURS_TANGENTES),
    calcul(cc, [...sol.lignes, ligne(`k_1=${lq(e.P.y)}-${parQ(m1)}\\cdot ${parQ(e.P.x)}=${lq(k1)}`), ligne(`k_2=${lq(e.P.y)}-${parQ(m2)}\\cdot ${parQ(e.P.x)}=${lq(k2)}`)]),
    avecFigureConique(resultat(cc, fx(`Les deux tangentes issues de $P$ : $${yMK(m1, k1)}$ et $${yMK(m2, k2)}$.`)), figure(e)),
    piege(cc, fx("Il y a deux tangentes : une seule droite ne suffit pas, l'équation en $m$ a deux solutions.")),
  );
  return out;
}

function corrigeD(e: ExerciceTangenteD): EtapeCorrection[] {
  const a = L(e, "dValeurs");
  const b = L(e, "dEquation");
  const f = formeCentree(e.conique);
  const { m, k } = e.d;
  const xp2 = qMul(e.P.x, e.P.x);
  const yp2 = qMul(e.P.y, e.P.y);
  const m2 = qMul(m, m);
  const k2 = qMul(k, k);
  const surLettre = (r: Q, l: string) => (r.d === 1n ? `\\dfrac{${r.n}}{${l}}` : `\\dfrac{${r.n}}{${r.d}\\,${l}}`);
  const tA = surLettre(xp2, "\\alpha");
  const tB = surLettre(yp2, "\\beta");
  const eq1 = xp2.n === 0n ? `${f.sy < 0 ? "-" : ""}${tB}=1` : yp2.n === 0n ? `${f.sx < 0 ? "-" : ""}${tA}=1` : f.sx > 0 ? `${tA}${f.sy > 0 ? "+" : "-"}${tB}=1` : `${tB}-${tA}=1`;
  const eq2 = `${lq(k2)}=${f.sx > 0 ? latexSomme([[m2, "\\alpha"], [q(f.sy), "\\beta"]]) : latexSomme([[q(1), "\\beta"], [qNeg(m2), "\\alpha"]])}`;
  // β = σy(k² − σx m² α).
  const betaDe = (al: Q) => qMul(q(f.sy), qSub(k2, qMul(q(f.sx), qMul(m2, al))));
  const betaExpr = f.sy > 0 ? latexSomme([[k2, ""], [qMul(q(-f.sx), m2), "\\alpha"]]) : latexSomme([[qNeg(k2), ""], [qMul(q(f.sx), m2), "\\alpha"]]);
  // σx m² α² + (y_P² − x_P² m² − k²) α + σx x_P² k² = 0, en entiers.
  const coef: [Q, Q, Q] = [qMul(q(f.sx), m2), qSub(qSub(yp2, qMul(xp2, m2)), k2), qMul(q(f.sx), qMul(xp2, k2))];
  const L2 = ppcmDen(coef);
  let eqA = coef.map((r) => (r.n * L2) / r.d) as [bigint, bigint, bigint];
  const g = [eqA[0], eqA[1], eqA[2]].reduce((u, w) => {
    let [x, y] = [u < 0n ? -u : u, w < 0n ? -w : w];
    while (y) [x, y] = [y, x % y];
    return x;
  }, 0n) || 1n;
  eqA = eqA.map((x) => x / g) as [bigint, bigint, bigint];
  if (eqA[0] < 0n || (eqA[0] === 0n && eqA[1] < 0n)) eqA = eqA.map((x) => -x) as [bigint, bigint, bigint];
  const lignesA: LigneCalcul[] = [ligne(`{\\begin{cases}${eq1}\\\\ ${eq2}\\end{cases}}`, "(1) P est sur la conique ; (2) d est tangente"), ligne(`\\beta=${betaExpr}`, "de (2)")];
  let alphas: Q[];
  const trinA = `${latexSomme([
    [q(eqA[0]), "\\alpha^2"],
    [q(eqA[1]), "\\alpha"],
    [q(eqA[2]), ""],
  ])}=0`;
  lignesA.push(ligne(milliersDans(trinA), "on remplace β dans (1), on multiplie par αβ et on simplifie"));
  if (eqA[0] === 0n) {
    const al = q(-eqA[2], eqA[1]);
    alphas = [al];
    lignesA.push(ligne(`\\alpha=${lq(al)}`));
  } else {
    const d = lignesDiscriminant(eqA, "α");
    const s = lignesSolutions(eqA, "\\alpha", "α");
    lignesA.push(...d.lignes, ...s.lignes);
    alphas = s.sol;
  }
  const valides = alphas.filter((al) => qNum(al) > 0 && qNum(betaDe(al)) > 0);
  const nomA = alphas.length > 1 ? (i: number) => `\\beta_${i + 1}` : () => "\\beta";
  alphas.forEach((al, i) => lignesA.push(ligne(`${nomA(i)}=${lq(betaDe(al))}`, alphas.length > 1 ? `avec α${i ? "₂" : "₁"}` : "")));
  const alpha = valides[0] ?? e.alpha;
  const beta = betaDe(alpha);
  const nature = e.conique.type === "ellipse" ? "l'ellipse" : "l'hyperbole";
  const forme = f.sx > 0 ? `\\dfrac{x^2}{\\alpha}${f.sy > 0 ? "+" : "-"}\\dfrac{y^2}{\\beta}=1` : "\\dfrac{y^2}{\\beta}-\\dfrac{x^2}{\\alpha}=1";
  const tangenceTexte = e.conique.type === "ellipse" ? "$k^2=a^2m^2+b^2$, ici $k^2=m^2\\alpha+\\beta$" : f.sx > 0 ? "$k^2=a^2m^2-b^2$, ici $k^2=m^2\\alpha-\\beta$" : "$k^2=a^2-b^2m^2$, ici $k^2=\\beta-m^2\\alpha$";
  const valeurP = qAdd(qMul(q(f.sx), qDiv(xp2, alpha)), qMul(q(f.sy), qDiv(yp2, beta)));
  const vA = fracCarre(e.P.x, alpha);
  const vB = fracCarre(e.P.y, beta);
  const verifP = `${xp2.n === 0n ? `${f.sy < 0 ? "-" : ""}${vB}` : yp2.n === 0n ? `${f.sx < 0 ? "-" : ""}${vA}` : f.sx > 0 ? `${vA}${f.sy > 0 ? "+" : "-"}${vB}` : `${vB}-${vA}`}=${lq(valeurP)}`;
  return [
    utiliseCours(a, fx(`On écrit deux conditions sur $\\alpha$ et $\\beta$ dans $${forme}$ : $P$ vérifie l'équation, et $d\\,:\\ y=mx+k$ est tangente (condition de tangence ${tangenceTexte})`), COURS_TANGENTES),
    calcul(a, lignesA),
    resultat(a, fx(`$\\alpha=${lq(alpha)}$ et $\\beta=${lq(beta)}$${alphas.length > 1 ? " : la seule solution avec $\\alpha>0$ et $\\beta>0$" : ""}.`)),
    utiliseCours(b, fx(`On remplace $\\alpha$ et $\\beta$ dans $${forme}$`), COURS_TANGENTES),
    avecFigureConique(resultat(b, fx(`${nature === "l'ellipse" ? "L'ellipse" : "L'hyperbole"} cherchée a pour équation $${latexConique(e.conique)}$.`)), figure(e)),
    verification(b, fx(`$P$ vérifie l'équation : $${verifP}$.`)),
    piege(a, fx(alphas.length > 1 ? "Garder les deux solutions : une seule donne $\\alpha>0$ et $\\beta>0$, les dénominateurs d'une équation réduite." : e.conique.type === "ellipse" ? "Écrire la condition de tangence de l'hyperbole (avec un « − ») pour une ellipse." : "Oublier le « − » de la condition de tangence d'une hyperbole.")),
  ];
}

function corrigeE(e: ExerciceTangenteE): EtapeCorrection[] {
  const a = L(e, "eContacts");
  const b = L(e, "eProche");
  const c = e.conique;
  const f = formeCentree(c);
  const m = e.d.m;
  const K2 = k2Tangente(f, m);
  const K = racineQ(K2);
  const ks = [K, qNeg(K)];
  const T = ks.map((k) => pointContact(f, { m, k } as DroiteMK));
  const ecarts = ks.map((k) => {
    const d = qSub(k, e.d.k);
    return d.n < 0n ? qNeg(d) : d;
  });
  const i = qNum(ecarts[0]) <= qNum(ecarts[1]) ? 0 : 1;
  // x_T = −σx·m·X/k, y_T = σy·Y/k.
  const numX = qMul(q(-f.sx), qMul(m, f.X));
  const numY = qMul(q(f.sy), f.Y);
  const nomT = (j: number) => `T_${j + 1}`;
  const tx = `\\dfrac{x\\,x_T}{${lq(f.X)}}`;
  const ty = `\\dfrac{y\\,y_T}{${lq(f.Y)}}`;
  const dedT = f.sx > 0 ? `${tx}${f.sy > 0 ? "+" : "-"}${ty}=1` : `${ty}-${tx}=1`;
  const lignesA: LigneCalcul[] = [...lignesConditionK(c, m, K2), ligne(`k=${lq(K)}\\ \\text{ou}\\ k=${lq(qNeg(K))}`, "deux tangentes parallèles à d")];
  ks.forEach((k, j) => {
    const quot = (nom: string, num: Q, v: Q) => {
      const brut = num.d === 1n && k.d === 1n ? `\\dfrac{${num.n}}{${k.n}}` : `\\dfrac{${lq(num)}}{${lq(k)}}`;
      const simple = num.d === 1n && k.d === 1n && k.n > 0n && lq(v) === `\\frac{${num.n}}{${k.n}}`;
      return simple ? `${nom}=${lq(v)}` : `${nom}=${brut}=${lq(v)}`;
    };
    lignesA.push(ligne(quot(`x_{${nomT(j)}}`, numX, T[j].x), j === 0 ? "point de contact de y = mx + k" : undefined), ligne(quot(`y_{${nomT(j)}}`, numY, T[j].y)));
  });
  return [
    utiliseCours(a, fx(`Le point de $\\Gamma$ le plus proche de $d$ est le point de contact d'une tangente parallèle à $d$. Condition de tangence de $y=mx+k$ : ${conditionTexte(c)} ; la tangente en $T(x_T\\,;y_T)$, de forme dédoublée $${dedT}$, s'écrit $y=mx+k$ si $x_T=\\dfrac{${lq(numX)}}{k}$ et $y_T=\\dfrac{${lq(numY)}}{k}$`), COURS_TANGENTES),
    calcul(a, lignesA),
    resultat(a, fx(`Les points de contact des deux tangentes parallèles à $d$ : $${nomT(0)}${latexPoint(T[0])}$ et $${nomT(1)}${latexPoint(T[1])}$.`)),
    utiliseCours(b, fx(`La distance de deux droites parallèles $y=mx+k$ et $y=mx+k_d$ vaut $\\dfrac{|k-k_d|}{\\sqrt{m^2+1}}$ : le point le plus proche de $d$ est sur la tangente dont l'ordonnée à l'origine $k$ est la plus proche de $k_d=${lq(e.d.k)}$`), COURS_TANGENTES),
    calcul(b, ks.map((k, j) => ligne(`|k_${j + 1}-k_d|=\\left|${lq(k)}-${parQ(e.d.k)}\\right|=${lq(ecarts[j])}`, j === 0 ? "tangente en T₁" : "tangente en T₂"))),
    avecFigureConique(resultat(b, fx(`Le point de $\\Gamma$ le plus proche de $d$ est $${nomT(i)}${latexPoint(T[i])}$.`)), figure(e)),
    piege(b, fx("Seuls les points de contact des tangentes parallèles à $d$ sont candidats ; on compare les deux, sans oublier les valeurs absolues.")),
  ];
}

export function correctionDetailleeTangentesConique(e: E): EtapeCorrection[] {
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
  }
}

/** Points de contact de 6gen62 E (réponse brève, barème). */
export function contactsE(e: ExerciceTangenteE): { T: { x: Q; y: Q }[]; proche: number } {
  const f = formeCentree(e.conique);
  const K = racineQ(k2Tangente(f, e.d.m));
  const ks = [K, qNeg(K)];
  const T = ks.map((k) => pointContact(f, { m: e.d.m, k }));
  const ec = ks.map((k) => Math.abs(qNum(k) - qNum(e.d.k)));
  return { T, proche: ec[0] <= ec[1] ? 0 : 1 };
}

export { latexRacine };
