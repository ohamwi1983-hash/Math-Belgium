import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { ExerciceLieuxGeometriquesParametres, PhaseLieuxGeometriquesParametres } from "../../core6e/lieuxGeometriquesParametres.types";
import { latexCercle, latexDroite, latexN, latexPoly, latexQ, latexRacine, latexSomme, polyScal, pt, q, qDiv, qNum, qSub } from "../../moteur6e/algebreLieux";
import type { Pt } from "../../moteur6e/algebreLieux";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours } from "../../ui6e/corrigeCombinatoire";
import { COURS_ELIMINATION, COURS_PARAMETRIQUE, avecFigure, carreQ, lp } from "../../ui6e/corrigeLieux";
import { figure6gen56 } from "../../ui6e/formatLieuxGeometriquesParametres";

/**
 * Corrigé détaillé « comme au tableau » de `6gen56` (lieux géométriques et élimination de paramètre,
 * 6e ch. 9, § 4 et § 6 ; audit, lot E), une lettre par écran de l'instance (`e.phases`) — même source
 * pour l'écran (corrigé consultable après chaque réponse) et pour le papier. Équations écrites et
 * réduites (plus de nombres nus, audit E10), seuils justifiés, partie décrite des représentations
 * paramétriques ; FIGURE du lieu (cercle, point, droites, bande, losange, octogone, demi-parabole,
 * droite privée d'un point en creux) sous le dernier résultat — rien à tracer pour un lieu vide.
 */

type E = ExerciceLieuxGeometriquesParametres;
type P = PhaseLieuxGeometriquesParametres;
type F = FragmentConsigne[];

const N = latexN;
const n = (e: E, k: string) => Number(e.params[k]);
const moins = (v: string, x: number) => (x === 0 ? v : x > 0 ? `${v}-${N(x)}` : `${v}+${N(-x)}`);
const absL = (v: string, x: number) => `|${moins(v, x)}|`;
const L = (e: E, p: P) => lettreEtape(e.phases.indexOf(p));
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function figure(e: E): string {
  return figure6gen56(e, e.phases);
}
/** Résultat final : avec la figure, sauf pour un lieu vide (rien à représenter). */
function resultatFinal(e: E, lettre: string, fr: F): EtapeCorrection {
  const r = resultat(lettre, fr);
  return e.verdict === "vide" ? r : avecFigure(r, figure(e));
}

const NATURE: Record<string, string> = {
  deuxDroites: "deux droites",
  carre: "un carré posé sur une pointe",
  demiDroites: "quatre demi-droites",
  droite: "une droite",
  cercle: "un cercle",
  point: "un seul point",
  vide: "l'ensemble vide",
  bande: "une bande pleine (entre deux droites parallèles, bords compris)",
  regionCarre: "le carré plein (intérieur et bord)",
  parallelogramme: "un parallélogramme (son bord)",
  octogone: "un octogone (son bord)",
};

function natureCercle(e: E, lettre: string): EtapeCorrection[] {
  const R = e.R!;
  const r = qNum(R);
  const c = lp(e.centre!);
  const fr =
    r > 0
      ? fx(`$R=${latexQ(R)}>0$ : le lieu est le cercle de centre $\\Omega${c}$ et de rayon $\\sqrt{R}=${latexRacine(R)}$.`)
      : r === 0
        ? fx(`$R=0$ : une somme de deux carrés est nulle seulement si les deux le sont ; le lieu est le seul point $\\Omega${c}$.`)
        : fx(`$R=${latexQ(R)}<0$ : une somme de deux carrés n'est jamais négative ; le lieu est vide.`);
  return [utiliseCours(lettre, fx("$(x-x_0)^2+(y-y_0)^2=R$ : cercle de rayon $\\sqrt{R}$ si $R>0$, un seul point si $R=0$, aucun point si $R<0$"), COURS_ELIMINATION), resultatFinal(e, lettre, fr)];
}

/** Étape « centre et second membre » : division, complétion des carrés. */
function etapeCentreR(e: E, lettre: string, lignes: LigneCalcul[], methode: string): EtapeCorrection[] {
  return [
    utiliseCours(lettre, fx(methode), COURS_ELIMINATION),
    calcul(lettre, [...lignes, ligne(latexCercle(e.centre!, e.R!), "on complète les carrés")]),
    resultat(lettre, fx(`$\\Omega${lp(e.centre!)}$ et $R=${latexQ(e.R!)}$.`)),
  ];
}

function pts(e: E): Pt[] {
  return (e.configuration.points ?? []).map((p) => pt(p.p.x, p.p.y));
}
const d2L = (A: Pt) => `${carreQ("x", A.x)}+${carreQ("y", A.y)}`;

function corrigeA(e: E): EtapeCorrection[] {
  const ln = L(e, "nature");
  if (e.sousType === "A_paralleles") {
    const [a, b, g, k] = ["a", "b", "g", "k"].map((x) => n(e, x));
    const expr = latexSomme([
      [q(a), "x"],
      [q(b), "y"],
      [q(g), ""],
    ]);
    const ld = L(e, "droites");
    const [d1, d2] = e.droites!;
    return [
      utiliseCours(ln, fx("Une valeur absolue égale à un nombre $k>0$ donne deux cas : $|u|=k\\iff u=k$ ou $u=-k$"), COURS_ELIMINATION),
      calcul(ln, [ligne(`|${expr}|=${k}\\iff ${expr}=${k}\\ \\text{ou}\\ ${expr}=-${k}`)]),
      resultat(ln, fx("Deux équations du premier degré, de mêmes coefficients de $x$ et de $y$ : le lieu est formé de deux droites parallèles.")),
      utiliseCours(ld, fx("On écrit chaque cas sous la forme $ax+by+c=0$"), COURS_ELIMINATION),
      calcul(ld, [ligne(latexDroite(d1), `premier cas : on passe ${k} dans le premier membre`), ligne(latexDroite(d2), "second cas")]),
      resultatFinal(e, ld, fx(`$${latexDroite(d1)}$ et $${latexDroite(d2)}$.`)),
      piege(ld, fx(`Ne garder que le cas $${expr}=${k}$ : la valeur absolue donne deux droites.`)),
    ];
  }
  const [p, qq, k] = ["p", "q", "k"].map((x) => n(e, x));
  const cas = (sx: string, sy: string, eq: string) => ligne(eq, [t("si "), l(`x${sx}${N(p)}`), t(" et "), l(`y${sy}${N(qq)}`)]);
  if (e.sousType === "A_losange") {
    const ls = L(e, "sommets");
    const S = e.sommets!;
    return [
      utiliseCours(ln, fx("On distingue les cas selon le signe de ce qui est entre les barres : dans chaque cas, l'équation est celle d'une droite, valable sur une partie du plan"), COURS_ELIMINATION),
      calcul(ln, [cas("\\geq ", "\\geq ", `x+y=${N(p + qq + k)}`), cas("\\leq ", "\\geq ", `x-y=${N(p - qq - k)}`), cas("\\leq ", "\\leq ", `x+y=${N(p + qq - k)}`), cas("\\geq ", "\\leq ", `x-y=${N(p - qq + k)}`)]),
      resultat(ln, fx(`Quatre segments de pente $1$ ou $-1$ qui se rejoignent : un carré posé sur une pointe, de centre $${lp(pt(p, qq))}$.`)),
      utiliseCours(ls, fx("Les sommets sont les points où une des deux valeurs absolues s'annule"), COURS_ELIMINATION),
      calcul(ls, [ligne(`x=${N(p)}\\ :\\ ${absL("y", qq)}=${k}\\iff y=${N(qq + k)}\\ \\text{ou}\\ y=${N(qq - k)}`), ligne(`y=${N(qq)}\\ :\\ ${absL("x", p)}=${k}\\iff x=${N(p + k)}\\ \\text{ou}\\ x=${N(p - k)}`)]),
      resultatFinal(e, ls, fx(`Sommets : ${S.map((x) => `$${lp(x)}$`).join(", ")}.`)),
      piege(ls, fx(`Prendre $(${N(p)}\\pm${k}\\,;${N(qq)}\\pm${k})$ : ce seraient les sommets d'un carré aux côtés parallèles aux axes.`)),
    ];
  }
  // A_nonBorne
  const ld = L(e, "droites");
  const ls = L(e, "sommets");
  const [O1, O2] = e.sommets!;
  return [
    utiliseCours(ln, fx("On distingue les cas selon le signe de ce qui est entre les barres : dans chaque cas, l'équation est celle d'une droite, valable sur une partie du plan seulement"), COURS_ELIMINATION),
    calcul(ln, [], fx(`$${absL("x", p)}-${absL("y", qq)}=${k}$ impose $${absL("x", p)}\\geq${k}$ : aucun point dans la bande $${N(p - k)}<x<${N(p + k)}$. Dans chacune des quatre régions délimitées par $x=${N(p)}$ et $y=${N(qq)}$, on obtient un morceau de droite de pente $1$ ou $-1$, qui part de l'axe $y=${N(qq)}$ et s'éloigne sans fin.`), "Raisonnement"),
    resultat(ln, fx("Le lieu n'est pas borné : quatre demi-droites.")),
    utiliseCours(ld, fx("On écrit les quatre cas de signes"), COURS_ELIMINATION),
    calcul(ld, [cas("\\geq ", "\\geq ", `x-y=${N(p - qq + k)}`), cas("\\geq ", "\\leq ", `x+y=${N(p + qq + k)}`), cas("\\leq ", "\\geq ", `x+y=${N(p + qq - k)}`), cas("\\leq ", "\\leq ", `x-y=${N(p - qq - k)}`)]),
    resultat(ld, fx(e.droites!.map((d) => `$${latexDroite(d)}$`).join(" ; ") + ".")),
    utiliseCours(ls, fx(`Les demi-droites partent de la droite $y=${N(qq)}$, où $${moins("y", qq)}$ change de signe`), COURS_ELIMINATION),
    calcul(ls, [ligne(`y=${N(qq)}\\ :\\ ${absL("x", p)}=${k}\\iff x=${N(p + k)}\\ \\text{ou}\\ x=${N(p - k)}`)]),
    resultatFinal(e, ls, fx(`Les demi-droites partent de $${lp(O1)}$ et de $${lp(O2)}$.`)),
    piege(ls, fx("Donner quatre droites entières : chaque équation n'est valable que dans sa région.")),
  ];
}

function corrigeB(e: E): EtapeCorrection[] {
  const st = e.sousType;
  if (st === "B_bissectrices") {
    const [a1, b1, c1, a2, b2, c2, nn] = ["a1", "b1", "c1", "a2", "b2", "c2", "n"].map((x) => n(e, x));
    const e1 = latexSomme([
      [q(a1), "x"],
      [q(b1), "y"],
      [q(c1), ""],
    ]);
    const e2 = latexSomme([
      [q(a2), "x"],
      [q(b2), "y"],
      [q(c2), ""],
    ]);
    const ld = L(e, "droites");
    const [d1, d2] = e.droites!;
    return [
      utiliseCours(ld, fx("Distance d'un point à une droite : $\\mathrm{dist}(P\\,;d)=\\dfrac{|ax+by+c|}{\\sqrt{a^2+b^2}}$ ; puis $|u|=|v|\\iff u=v$ ou $u=-v$"), COURS_ELIMINATION),
      calcul(ld, [
        ligne(`\\dfrac{|${e1}|}{\\sqrt{${nn}}}=\\dfrac{|${e2}|}{\\sqrt{${nn}}}`, "égalité des distances"),
        ligne(`|${e1}|=|${e2}|`, "mêmes dénominateurs"),
        ligne(`${e1}=${e2}\\ \\text{ou}\\ ${e1}=-(${e2})`),
        ligne(latexDroite(d1), "premier cas, u = v"),
        ligne(latexDroite(d2), "second cas, u = −v"),
      ]),
      resultatFinal(e, ld, fx(`Deux droites perpendiculaires, les bissectrices des angles formés par $d_1$ et $d_2$ : $${latexDroite(d1)}$ et $${latexDroite(d2)}$.`)),
      piege(ld, fx("Ne garder que le cas $u=v$ : l'égalité des valeurs absolues donne deux droites.")),
    ];
  }
  const le = L(e, "equation");
  const lna = L(e, "nature");
  if (st === "B_droite") {
    const [A, B] = pts(e);
    const k = n(e, "k");
    const dev = `${latexPoly(e.equation!)}=0`;
    return [
      utiliseCours(le, fx("Carré de la distance : $PA^2=(x-x_A)^2+(y-y_A)^2$"), COURS_ELIMINATION),
      calcul(le, [ligne(`${d2L(A)}-\\left(${d2L(B)}\\right)=${k}`, "PA² − PB² = k"), ligne(dev, "on développe : x² et y² s'annulent"), ...(dev !== e.equationLatex ? [ligne(e.equationLatex!, "on simplifie")] : [])]),
      resultat(le, fx(`$${e.equationLatex}$.`)),
      utiliseCours(lna, fx("Une équation du premier degré en $x$ et $y$ est celle d'une droite"), COURS_ELIMINATION),
      resultatFinal(e, lna, fx(`Le lieu est une droite, perpendiculaire à $(AB)$ (de vecteur normal $\\overrightarrow{AB}$).`)),
      piege(lna, fx("Chercher un cercle : avec une DIFFÉRENCE de carrés de distances, les termes en $x^2$ et $y^2$ disparaissent.".replace("DIFFÉRENCE", "différence"))),
    ];
  }
  const lc = L(e, "centreR");
  if (st === "B_cerclePerp") {
    const [x0, y0, k] = ["x0", "y0", "k"].map((x) => n(e, x));
    return [
      utiliseCours(le, fx(`La distance de $P(x\\,;y)$ à la droite $a$ d'équation $x=${x0}$ est $${absL("x", x0)}$ ; son carré est $${carreQ("x", q(x0))}$ ; de même pour $b$`), COURS_ELIMINATION),
      calcul(le, [ligne(`${carreQ("x", q(x0))}+${carreQ("y", q(y0))}=${k}`, "somme des carrés des deux distances")]),
      resultat(le, fx(`$${carreQ("x", q(x0))}+${carreQ("y", q(y0))}=${k}$.`)),
      utiliseCours(lc, fx("L'équation a déjà la forme $(x-x_0)^2+(y-y_0)^2=R$ : on lit le centre et le second membre"), COURS_ELIMINATION),
      resultat(lc, fx(`$\\Omega${lp(e.centre!)}$ et $R=${k}$.`)),
      ...natureCercle(e, lna),
      piege(lna, fx("Prendre $R$ pour le rayon : le rayon est $\\sqrt{R}$.")),
    ];
  }
  if (st === "B_seuil2Points") {
    const [A, B] = pts(e);
    const k = n(e, "k");
    const seuil = n(e, "seuil");
    const moitie = polyScal(e.equation!, q(1, 2));
    return [
      utiliseCours(le, fx("Carré de la distance : $PA^2=(x-x_A)^2+(y-y_A)^2$"), COURS_ELIMINATION),
      calcul(le, [ligne(`${d2L(A)}+${d2L(B)}=${k}`, "PA² + PB² = k"), ligne(`${latexPoly(e.equation!)}=0`, "on développe et on réduit")]),
      resultat(le, fx(`$${latexPoly(e.equation!)}=0$.`)),
      ...etapeCentreR(e, lc, [ligne(`${latexPoly(moitie)}=0`, "on divise par 2")], "On divise par le coefficient de $x^2$, puis on complète les carrés"),
      ...natureCercle(e, lna),
      piege(lna, fx(`Au seuil $k=\\dfrac{AB^2}{2}=${N(seuil)}$, le lieu n'est pas un « tout petit cercle » mais le seul milieu de $[AB]$ ; en dessous, il est vide.`)),
    ];
  }
  if (st === "B_seuilCarre") {
    const [c, k] = ["c", "k"].map((x) => n(e, x));
    return [
      utiliseCours(le, fx(`Les côtés sont portés par les droites $x=\\pm${c}$ et $y=\\pm${c}$ ; la distance de $P(x\\,;y)$ à $x=${c}$ est $|x-${c}|$`), COURS_ELIMINATION),
      calcul(le, [ligne(`(x-${c})^2+(x+${c})^2+(y-${c})^2+(y+${c})^2=${k}`, "somme des carrés des quatre distances"), ligne(`2x^2+2y^2+${4 * c * c}=${k}`, "on développe")]),
      resultat(le, fx(`$2x^2+2y^2+${4 * c * c}=${k}$.`)),
      utiliseCours(lc, fx("On isole $x^2+y^2$"), COURS_ELIMINATION),
      calcul(lc, [ligne(`x^2+y^2=\\dfrac{${k}-${4 * c * c}}{2}=${latexQ(e.R!)}`, "on divise par 2")]),
      resultat(lc, fx(`$\\Omega(0\\,;0)$ et $R=${latexQ(e.R!)}$.`)),
      ...natureCercle(e, lna),
      piege(lna, fx(`Le seuil est $4c^2=${4 * c * c}$ pour une somme de carrés (et $4c$ pour une somme de distances simples).`)),
    ];
  }
  // B_apollonius
  const [a, h, kn, kd] = ["a", "h", "kn", "kd"].map((x) => n(e, x));
  const A = pt(h - a, 0);
  const B = pt(h + a, 0);
  const k = q(kn, kd);
  const pose = `${d2L(A)}=${kn === kd ? "" : latexQ(k)}\\left(${d2L(B)}\\right)`;
  if (e.verdict === "droite")
    return [
      utiliseCours(le, fx("Carré de la distance : $PA^2=(x-x_A)^2+(y-y_A)^2$"), COURS_ELIMINATION),
      calcul(le, [ligne(pose, "PA² = PB² (k = 1)"), ligne(`${latexPoly(e.equation!)}=0`, "on développe : x² et y² s'annulent"), ...(`${latexPoly(e.equation!)}=0` !== e.equationLatex ? [ligne(e.equationLatex!, "on simplifie")] : [])]),
      resultat(le, fx(`$${e.equationLatex}$.`)),
      utiliseCours(lna, fx("$PA^2=PB^2$ signifie $PA=PB$ : les points à égale distance de $A$ et de $B$"), COURS_ELIMINATION),
      resultatFinal(e, lna, fx("Le lieu est la médiatrice de $[AB]$, une droite.")),
      piege(lna, fx("Diviser par $1-k$ : pour $k=1$, c'est diviser par $0$ ; il n'y a pas de cercle.")),
    ];
  const unMoinsK = qSub(q(1), k);
  return [
    utiliseCours(le, fx("Carré de la distance : $PA^2=(x-x_A)^2+(y-y_A)^2$"), COURS_ELIMINATION),
    calcul(le, [ligne(pose, `PA² = k·PB²`), ligne(`${latexPoly(e.equation!)}=0`, "on développe et on regroupe")]),
    resultat(le, fx(`$${latexPoly(e.equation!)}=0$.`)),
    ...etapeCentreR(e, lc, [ligne(`${latexPoly(polyScal(e.equation!, qDiv(q(1), unMoinsK)))}=0`, [t("on divise par "), l(`1-k=${latexQ(unMoinsK)}`)])], "On divise par le coefficient de $x^2$ (ici $1-k$), puis on complète le carré en $x$"),
    ...natureCercle(e, lna),
    piege(lna, fx("Oublier de diviser par $1-k$ avant de compléter le carré : le centre et le second membre seraient faux.")),
  ];
}

function corrigeC(e: E): EtapeCorrection[] {
  const [m, h, k, D, Ec, Fc] = ["m", "h", "k", "D", "E", "F"].map((x) => n(e, x));
  const lc = L(e, "centreR");
  const lna = L(e, "nature");
  const divise = latexSomme([
    [q(D, m), "x"],
    [q(Ec, m), "y"],
    [q(Fc, m), ""],
  ]);
  const suite = (r: string) => (r === "0" ? "" : r.startsWith("-") ? r : `+${r}`);
  const corr = (x: number) => (x === 0 ? "" : `-${x * x}`);
  const fm = q(Fc, m);
  return [
    ...etapeCentreR(
      e,
      lc,
      [
        ...(m !== 1 ? [ligne(`x^2+y^2${suite(divise)}=0`, `on divise par ${m}`.replace("-", "−"))] : []),
        ligne(`${carreQ("x", q(h))}${corr(h)}+${carreQ("y", q(k))}${corr(k)}${suite(latexQ(fm))}=0`, [l("x^2+px=\\left(x+\\frac{p}{2}\\right)^2-\\frac{p^2}{4}")]),
      ],
      "On divise par le coefficient de $x^2$ et de $y^2$, puis on complète les carrés",
    ),
    ...natureCercle(e, lna),
    piege(lna, fx("Lire le centre sans diviser par le coefficient de $x^2$ : le centre est $\\left(-\\dfrac{D}{2m}\\,;-\\dfrac{E}{2m}\\right)$ ; et une telle équation n'est pas toujours celle d'un cercle.")),
  ];
}

function corrigeD(e: E): EtapeCorrection[] {
  const le = L(e, "equation");
  const lr = L(e, "restriction");
  const choix = (e.restrictions ?? []).find((o) => o.valeur === e.restriction)?.label ?? "";
  const resultatR = resultatFinal(e, lr, fx(`Le point décrit ${choix.replace(/^./, (c) => c.toLowerCase())}.`));
  if (e.sousType === "D_substitution") {
    const forme = String(e.params.forme);
    const [p, qq, r] = ["p", "q", "r"].map((x) => n(e, x));
    const lignes =
      forme === "racine"
        ? [ligne(`\\sqrt{t}=${moins("x", p)}`, "on isole √t"), ligne(`t=(${moins("x", p)})^2`, "on élève au carré"), ligne(e.equationLatex!, "on remplace t dans y")]
        : forme === "racineMoins"
          ? [ligne(`\\sqrt{t}=${N(p)}-x`, "on isole √t"), ligne(`t=(${moins("x", p)})^2`, "on élève au carré"), ligne(e.equationLatex!, "on remplace t dans y")]
          : [ligne(`t=${moins("x", p)}`, "on isole t"), ligne(e.equationLatex!, "on remplace t dans y")];
    const raisonnement = forme === "racine" ? fx(`$\\sqrt{t}\\geq0$, donc $x=${p === 0 ? "" : `${p}+`}\\sqrt{t}\\geq${N(p)}$ ; et $x$ prend toutes les valeurs $\\geq${N(p)}$.`) : forme === "racineMoins" ? fx(`$\\sqrt{t}\\geq0$, donc $x\\leq${N(p)}$ ; et $x$ prend toutes les valeurs $\\leq${N(p)}$.`) : fx("$t$ parcourt $\\mathbb{R}$, donc $x$ prend toutes les valeurs réelles.");
    void qq;
    void r;
    return [
      utiliseCours(le, fx("On isole le paramètre (ou $\\sqrt{t}$) dans l'équation de $x$, puis on le remplace dans celle de $y$"), COURS_PARAMETRIQUE),
      calcul(le, lignes),
      resultat(le, fx(`$${e.equationLatex}$ : une parabole.`)),
      utiliseCours(lr, fx("La partie décrite dépend des valeurs que prend $x$ quand $t$ parcourt son domaine"), COURS_PARAMETRIQUE),
      calcul(lr, [], raisonnement, "Raisonnement"),
      resultatR,
      piege(lr, fx("Élever au carré fait perdre le signe de $\\sqrt{t}$ : on le retrouve dans le domaine, sinon on donne toute la parabole.")),
    ];
  }
  if (e.sousType === "D_fractions") {
    const forme = String(e.params.forme);
    const [a, b, c, pente] = ["a", "b", "c", "pente"].map((x) => n(e, x));
    const lignes =
      forme === "fraction"
        ? [
            ligne(`y=\\dfrac{${latexSomme([
              [q(c), "t"],
              [q(b), ""],
            ])}}{${moins("t", -a)}}=${c}+\\dfrac{${pente}}{${moins("t", -a)}}`, "on décompose la fraction"),
            ligne(`y=${c}${pente < 0 ? "" : "+"}${pente}x`, [t("car "), l(`\\dfrac{1}{${moins("t", -a)}}=x`)]),
            ligne(e.equationLatex!, "on réordonne"),
          ]
        : [ligne(`t^${forme === "cube" ? 3 : 2}=${moins("x", a)}`, `on isole t${forme === "cube" ? "³" : "²"}`), ligne(`y=${b}${c < 0 ? "" : "+"}${c}(${moins("x", a)})`, "on remplace dans y"), ligne(e.equationLatex!, "on développe")];
    const raisonnement = forme === "fraction" ? fx(`$x=\\dfrac{1}{${moins("t", -a)}}$ ne vaut jamais $0$, et prend toutes les autres valeurs : le point $(0\\,;${c})$ de la droite n'est jamais atteint.`) : forme === "cube" ? fx("$t^3$ prend toutes les valeurs réelles quand $t$ parcourt $\\mathbb{R}$, donc $x$ aussi.") : fx(`$t^2\\geq0$, donc $x\\geq${N(a)}$ : le point part de $(${N(a)}\\,;${N(b)})$ dans un seul sens.`);
    return [
      utiliseCours(le, fx(forme === "fraction" ? "On exprime $y$ à l'aide de $x$ : ici $\\dfrac{1}{t+a}$ est justement $x$" : "On isole la puissance de $t$ dans l'équation de $x$, puis on la remplace dans celle de $y$"), COURS_PARAMETRIQUE),
      calcul(le, lignes),
      resultat(le, fx(`$${e.equationLatex}$ : une droite.`)),
      utiliseCours(lr, fx("La partie décrite dépend des valeurs que prend $x$ quand $t$ parcourt son domaine"), COURS_PARAMETRIQUE),
      calcul(lr, [], raisonnement, "Raisonnement"),
      resultatR,
      piege(lr, fx("Donner toute la droite sans regarder les valeurs que $x$ peut prendre.")),
    ];
  }
  // D_ratio
  const [m, nn, a, b] = ["m", "n", "a", "b"].map((x) => n(e, x));
  const reels = e.params.domaine === "reels";
  const pa = (v: number) => (v < 0 ? `(${v})` : `${v}`);
  return [
    utiliseCours(le, fx(`On élève $x$ et $y$ à des puissances qui font apparaître la même puissance de $t$`), COURS_PARAMETRIQUE),
    calcul(le, [ligne(`x^${nn}=${pa(a)}^${nn}\\,t^{${m * nn}}`, `x à la puissance ${nn}`), ligne(`y^${m}=${pa(b)}^${m}\\,t^{${m * nn}}`, `y à la puissance ${m}`), ligne(e.equationLatex!, [t("on élimine "), l(`t^{${m * nn}}`)])]),
    resultat(le, fx(`$${e.equationLatex}$.`)),
    utiliseCours(lr, fx("La partie décrite dépend des valeurs que prennent $x$ et $y$ quand $t$ parcourt son domaine"), COURS_PARAMETRIQUE),
    calcul(lr, [], reels ? fx("Pour chaque point de la courbe, on retrouve une valeur réelle de $t$ : toute la courbe est décrite.") : fx("Pour $t>0$, $x$ et $y$ gardent chacun un signe fixe et ne s'annulent jamais : une moitié de la courbe, sans l'origine."), "Raisonnement"),
    resultatR,
    piege(lr, fx("Élever à une puissance paire fait perdre le signe : on vérifie quels signes de $x$ et $y$ sont réellement obtenus.")),
  ];
}

function corrigeE(e: E): EtapeCorrection[] {
  const ln = L(e, "nature");
  const st = e.sousType;
  const nat = NATURE[e.nature ?? e.verdict] ?? "";
  const seulEcran = e.phases.length === 1;
  const res = (fr: F) => (seulEcran ? resultatFinal(e, ln, fr) : resultat(ln, fr));
  if (st === "E_paralleles") {
    const [p, d, k] = ["p", "d", "k"].map((x) => n(e, x));
    const v = e.params.verticale ? "x" : "y";
    const out: EtapeCorrection[] = [
      utiliseCours(ln, fx(`Distance de $P$ à la droite $${v}=c$ : $|${v}-c|$ ; on étudie la somme des deux distances selon la position de $P$ par rapport à la bande`), COURS_ELIMINATION),
      calcul(ln, [], fx(`Entre $a$ et $b$, la somme des distances vaut l'écartement $${d}$ ; à l'extérieur, elle vaut $${d}$ plus deux fois la distance à la bande, donc plus que $${d}$. Ici $k=${k}${k < d ? "<" : k === d ? "=" : ">"}${d}$.`), "Raisonnement"),
      res(fx(`Le lieu est ${nat}.`)),
    ];
    if (e.droites) {
      const lw = L(e, "droites");
      out.push(
        utiliseCours(lw, fx("À l'extérieur de la bande, on enlève les valeurs absolues avec le bon signe"), COURS_ELIMINATION),
        calcul(lw, [
          ligne(`(${moins(v, p)})+(${moins(v, p + d)})=${k}\\iff ${v}=${N(p + (d + k) / 2)}`, [t("si "), l(`${v}\\geq${p + d}`)]),
          ligne(`(${N(p)}-${v})+(${N(p + d)}-${v})=${k}\\iff ${v}=${N(p + (d - k) / 2)}`, [t("si "), l(`${v}\\leq${p}`)]),
        ]),
        resultatFinal(e, lw, fx(`$${latexDroite(e.droites[0])}$ et $${latexDroite(e.droites[1])}$.`)),
      );
    }
    out.push(piege(out[out.length - 1].sousQuestion, fx(`Comparer $k$ à $0$ au lieu de l'écartement $${d}$ : la somme des distances ne descend jamais sous l'écartement des deux droites.`)));
    return out;
  }
  if (st === "E_perpendiculaires" || st === "E_secantes") {
    const ls = L(e, "sommets");
    const S = e.sommets!;
    if (st === "E_perpendiculaires") {
      const [p, qq, k] = ["p", "q", "k"].map((x) => n(e, x));
      return [
        utiliseCours(ln, fx(`La distance de $P(x\\,;y)$ à $a$ est $${absL("x", p)}$, à $b$ est $${absL("y", qq)}$`), COURS_ELIMINATION),
        calcul(ln, [ligne(`${absL("x", p)}+${absL("y", qq)}=${k}`, "somme des distances")]),
        res(fx(`Selon les signes, quatre segments de pente $1$ ou $-1$ : ${nat}, centré au point d'intersection de $a$ et $b$.`)),
        utiliseCours(ls, fx("Les sommets sont sur $a$ ou sur $b$ : là où une des deux distances est nulle"), COURS_ELIMINATION),
        calcul(ls, [ligne(`x=${N(p)}\\ :\\ ${absL("y", qq)}=${k}\\iff y=${N(qq + k)}\\ \\text{ou}\\ y=${N(qq - k)}`), ligne(`y=${N(qq)}\\ :\\ ${absL("x", p)}=${k}\\iff x=${N(p + k)}\\ \\text{ou}\\ x=${N(p - k)}`)]),
        resultatFinal(e, ls, fx(`Sommets : ${S.map((x) => `$${lp(x)}$`).join(", ")}.`)),
        piege(ls, fx("Prendre les sommets d'un carré aux côtés parallèles aux axes : ici les sommets sont sur $a$ et sur $b$.")),
      ];
    }
    const [pp, qq0, nn, k] = ["pp", "qq", "n", "k"].map((x) => n(e, x));
    const bL = latexSomme([
      [q(pp), "x"],
      [q(-qq0), "y"],
    ]);
    return [
      utiliseCours(ln, fx("Distance d'un point à une droite : $\\mathrm{dist}(P\\,;d)=\\dfrac{|ax+by+c|}{\\sqrt{a^2+b^2}}$"), COURS_ELIMINATION),
      calcul(ln, [ligne(`|y|+\\dfrac{|${bL}|}{${nn}}=${k}`, "somme des distances à a et à b")]),
      res(fx(`Dans chacune des quatre régions délimitées par $a$ et $b$, un segment ; les sommets sont sur $a$ et sur $b$, et les diagonales, portées par $a$ et $b$, se coupent en leur milieu : ${nat} (pas un losange : $a$ et $b$ ne sont pas perpendiculaires).`)),
      utiliseCours(ls, fx("Sur $a$, la distance à $a$ est nulle ; sur $b$, la distance à $b$ est nulle"), COURS_ELIMINATION),
      calcul(ls, [ligne(`y=0\\ :\\ \\dfrac{|${pp}x|}{${nn}}=${k}\\iff x=\\pm${latexQ(q(nn * k, pp))}`), ligne(`${bL}=0\\ :\\ |y|=${k}\\iff y=\\pm${k}`)]),
      resultatFinal(e, ls, fx(`Sommets : ${S.map((x) => `$${lp(x)}$`).join(", ")}.`)),
      piege(ls, fx("Oublier de diviser par la norme du vecteur normal de $b$ dans la distance.")),
    ];
  }
  // E_carre
  const [c, j, k] = ["c", "j", "k"].map((x) => n(e, x));
  const out: EtapeCorrection[] = [
    utiliseCours(ln, fx(`Pour deux côtés opposés, portés par $x=-${c}$ et $x=${c}$, la somme des distances vaut $2c=${2 * c}$ entre ces droites et $2|x|$ à l'extérieur ; de même en $y$`), COURS_ELIMINATION),
    calcul(ln, [], fx(`La somme des quatre distances vaut donc au moins $4c=${4 * c}$, atteint exactement sur tout le carré. Ici $k=${k}${k < 4 * c ? "<" : k === 4 * c ? "=" : ">"}${4 * c}$.`), "Raisonnement"),
    res(fx(`Le lieu est ${nat}.`)),
  ];
  if (e.sommets) {
    const ls = L(e, "sommets");
    const mm = c + j;
    out.push(
      utiliseCours(ls, fx("Au-dessus du carré (entre $x=-c$ et $x=c$), la somme vaut $2c+2y$ ; dans un coin, elle vaut $2|x|+2|y|$"), COURS_ELIMINATION),
      calcul(ls, [ligne(`${2 * c}+2y=${k}\\iff y=${mm}`, [t("pour "), l(`-${c}\\leq x\\leq ${c}`)]), ligne(`2x+2y=${k}\\iff x+y=${k / 2}`, "coin en haut à droite : segment oblique")]),
      resultatFinal(e, ls, fx(`Par symétrie, les huit sommets : ${e.sommets.map((x) => `$${lp(x)}$`).join(", ")}.`)),
    );
  }
  out.push(piege(out[out.length - 1].sousQuestion, fx("Le seuil est $4c$ pour une somme de distances simples ($4c^2$ pour une somme de carrés).")));
  return out;
}

export function correctionDetailleeLieux(e: E): EtapeCorrection[] {
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
