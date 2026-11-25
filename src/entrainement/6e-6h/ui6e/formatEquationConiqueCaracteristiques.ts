import type { DonneeC, ExerciceEqC, ExerciceEqD, ExerciceEqParabole, ExerciceEquationConiqueCaracteristiques } from "../core6e/equationConiqueCaracteristiques.types";
import type { PhaseEquationConiqueCaracteristiques } from "../moteur6e/typesEquationConiqueCaracteristiques";
import { latexCarreDecale, latexQ, latexRacine, lireEquation, lireNombre, proportionnels, ptNum, q, qMul, qNum } from "../moteur6e/algebreLieux";
import type { Poly, Q } from "../moteur6e/algebreLieux";
import { foyersConique, latexConique, polyConique } from "../moteur6e/algebreConiques";
import type { Conique } from "../moteur6e/algebreConiques";
import { codeOuverture } from "../moteur6e/verificationEquationConiqueCaracteristiques";
import { f } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";
import { champEquationUI, champNombreUI, lp, nomPoint } from "./textesLieux";
import { EXACT, L, latexFrac } from "./textesConiques";
import { figureLieux } from "./figureLieux";
import type { P2 } from "./figureLieux";
import { ajouterConique, d3, fenetreConique, objetsVides } from "./traceConiques";
import { asymptotes } from "../moteur6e/algebreConiques";

/**
 * Textes de `6gen59` — Équation d'une conique depuis ses caractéristiques (6e ch. 10, § 1–2 ; audit,
 * lots B et C). Libellés de choix neutres (plus de « ici 2 > 6 vérifié à confirmer », G15), mots hors
 * du mode mathématique, « (y)² » supprimé, données nommées en toutes lettres (« distance entre les deux
 * directrices »), parabole y² = 2px (décision 1). Figure : les données (sommets, foyers, asymptotes,
 * point), puis la conique APRÈS l'équation.
 */

type E = ExerciceEquationConiqueCaracteristiques;
type P = PhaseEquationConiqueCaracteristiques;

const axeTexte = (axe: "x" | "y") => (axe === "x" ? "l'axe des abscisses" : "l'axe des ordonnées");
const NATURE_OPTIONS = [
  { valeur: "ellipse", label: "Une ellipse" },
  { valeur: "hyperbole", label: "Une hyperbole" },
];

/** Valeur exacte d'une donnée de la famille C. */
function valeurC(e: ExerciceEqC, d: DonneeC): Q {
  switch (d) {
    case "deuxC":
      return q(2 * e.c);
    case "deuxA":
      return q(2 * e.a);
    case "excentricite":
      return q(e.c, e.a);
    case "distanceDirectrices":
      return q(2 * e.a * e.a, e.c);
  }
}
function ligneC(e: ExerciceEqC, d: DonneeC): string {
  const v = latexQ(valeurC(e, d));
  switch (d) {
    case "deuxC":
      return `distance focale : $2c=${v}$`;
    case "deuxA":
      return `distance entre les deux sommets de l'axe focal : $2a=${v}$`;
    case "excentricite":
      return `excentricité : $e=${v}$`;
    case "distanceDirectrices":
      return `distance entre les deux directrices : $${v}$`;
  }
}

function formesParabole(e: ExerciceEqParabole) {
  const h = e.S.x;
  const k = e.S.y;
  const lin = (l: string, c: Q) => (c.n === 0n ? l : `(${l}${c.n < 0n ? "+" : "-"}${latexQ(q(c.n < 0n ? -c.n : c.n, c.d))})`);
  return [
    { valeur: "x+", label: `$${latexCarreDecale("y", k)}=2p${lin("x", h)}$` },
    { valeur: "x-", label: `$${latexCarreDecale("y", k)}=-2p${lin("x", h)}$` },
    { valeur: "y+", label: `$${latexCarreDecale("x", h)}=2p${lin("y", k)}$` },
    { valeur: "y-", label: `$${latexCarreDecale("x", h)}=-2p${lin("y", k)}$` },
  ];
}

function penteD(e: ExerciceEqD): string {
  return e.conique.axe === "x" ? latexFrac(e.b, e.a) : latexFrac(e.a, e.b);
}
function donneeD(e: ExerciceEqD): string {
  const F = foyersConique(e.conique)[0];
  if (e.donnee === "sommet") return `sommet $${nomPoint("S", e.conique.axe === "x" ? { x: q(e.a), y: q(0) } : { x: q(0), y: q(e.a) })}$`;
  if (e.donnee === "foyer") return `foyer $F${F.latex}$`;
  return `distance focale $2c=${latexRacine(q(4 * (e.a * e.a + e.b * e.b)))}$ ; axe focal : ${axeTexte(e.conique.axe)}`;
}

export const FORMAT_6GEN59: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        if (e.sousType === "memeAxe") return f("On donne un sommet $S$ et un foyer $F$ d'une conique de centre $O$ dont les axes de symétrie sont les axes du repère ; $S$ et $F$ sont sur l'axe focal. Détermine sa nature, puis son équation." + EXACT);
        if (e.sousType === "axesPerpendiculaires") return f("On donne un sommet $S$ de l'axe non focal et un foyer $F$ d'une ellipse de centre $O$ dont les axes de symétrie sont les axes du repère. Détermine son équation." + EXACT);
        return f("On donne deux sommets d'une ellipse de centre $O$, situés sur les deux axes du repère. Détermine son équation." + EXACT);
      case "B":
        return f("Détermine l'équation de la parabole décrite ci-dessous." + EXACT);
      case "C":
        return f(`Une conique a pour centre $O$ et pour axe focal ${axeTexte(e.conique.axe)}. On donne deux de ses caractéristiques. Détermine sa nature, puis son équation.` + EXACT);
      case "D":
        return f("Une hyperbole a pour centre $O$ et pour axes de symétrie les axes du repère. Détermine son équation à partir des données ci-dessous." + EXACT);
    }
  },
  donnees(e) {
    switch (e.famille) {
      case "A":
        if (e.sousType === "deuxSommets") return [f(`$${nomPoint("S", e.S)}$ et $${nomPoint("S'", e.Sp)}$`)];
        return [f(`sommet $${nomPoint("S", e.S)}$, foyer $${nomPoint("F", e.F)}$`)];
      case "B":
        return e.donnee === "foyer"
          ? [f(`sommet $${nomPoint("S", e.S)}$, foyer $${nomPoint("F", e.F)}$`)]
          : [f(`sommet $${nomPoint("S", e.S)}$, point $${nomPoint("P", e.P!)}$ de la parabole`), f(`axe de symétrie parallèle à ${axeTexte(e.conique.axe)}`)];
      case "C":
        return e.donnees.map((d) => f(ligneC(e, d)));
      case "D":
        return [f(`asymptotes : $y=\\pm ${penteD(e) === "1" ? "" : penteD(e)}x$`), f(donneeD(e))];
    }
  },
  consigneEcran(e, p) {
    switch (p) {
      case "mNature":
      case "cNature":
        return f("Cette conique est-elle une ellipse ou une hyperbole ?");
      case "mValeurs":
        return f("Donne $a$ (demi-axe focal), $c$ (distance du centre à un foyer) et $b^2$.");
      case "pAxe":
        return f("Quel est l'axe focal de cette ellipse ?");
      case "pValeurs":
        return f("Donne $b$ (demi-petit axe), $c$ (distance du centre à un foyer), puis $a^2$.");
      case "sValeurs":
        return f("Donne $a$ (demi-grand axe) et $b$ (demi-petit axe).");
      case "bOuverture":
        return f("Quelle forme d'équation convient, avec $p>0$ ?");
      case "bP":
        return e.famille === "B" && e.donnee === "point" ? f("Calcule le paramètre $p$ : le point $P$ vérifie l'équation.") : f("Calcule le paramètre $p$ (distance du foyer à la directrice).");
      case "cValeurs":
        return f("Calcule $a$ (demi-axe focal) et $c$ (distance du centre à un foyer).");
      case "cEquation":
        return f("Calcule $b^2$, puis écris l'équation de la conique.");
      case "dValeurs":
        return f("Calcule $a$ (demi-axe focal) et $b$.");
      case "equation":
        return e.famille === "B" ? f("Écris l'équation de la parabole.") : f("Écris l'équation de la conique.");
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "mNature":
      case "cNature":
        return [{ type: "choix", label: "", options: NATURE_OPTIONS }];
      case "mValeurs":
        return [champNombreUI("$a$"), champNombreUI("$c$"), champNombreUI("$b^2$")];
      case "pAxe":
        return [{ type: "choix", label: "", options: [{ valeur: "x", label: "L'axe des abscisses" }, { valeur: "y", label: "L'axe des ordonnées" }] }];
      case "pValeurs":
        return [champNombreUI("$b$"), champNombreUI("$c$"), champNombreUI("$a^2$")];
      case "sValeurs":
      case "dValeurs":
        return [champNombreUI("$a$"), champNombreUI("$b$")];
      case "bOuverture":
        return [{ type: "choix", label: "", options: formesParabole(e as ExerciceEqParabole) }];
      case "bP":
        return [champNombreUI("$p$")];
      case "cValeurs":
        return [champNombreUI("$a$"), champNombreUI("$c$")];
      case "cEquation":
        return [champNombreUI("$b^2$"), champEquationUI("Équation")];
      case "equation":
        return [champEquationUI("Équation")];
    }
  },
  aides: aides59,
  reponseAttendue: reponse59,
  explication: explication59,
  libellePhase: (_e, p) => LIBELLES[p],
  messageCible: cible59,
};

const LIBELLES: Record<P, string> = {
  mNature: "Nature",
  mValeurs: "a, c et b²",
  pAxe: "Axe focal",
  pValeurs: "b, c et a²",
  sValeurs: "a et b",
  bOuverture: "Forme de l'équation",
  bP: "Paramètre p",
  cValeurs: "a et c",
  cNature: "Nature",
  cEquation: "b² et équation",
  dValeurs: "a et b",
  equation: "Équation",
};

const RELATIONS_C = "Relations du cours : $2c$ est la distance focale, $2a$ la distance entre les sommets de l'axe focal, $e=\\frac{c}{a}$, et les directrices sont les droites $x=\\pm\\frac{a^2}{c}$, distantes de $\\frac{2a^2}{c}$ (axe focal horizontal).";

function aides59(e: E, p: P): AideCombi[] {
  switch (p) {
    case "mNature":
      return [{ texte: "Pour une ellipse, les foyers sont entre les sommets ($c<a$) ; pour une hyperbole, ils sont au-delà ($c>a$)." }, { texte: "Ici, compare les distances au centre :", latex: e.famille === "A" && e.sousType === "memeAxe" ? `OS=${e.a},\\qquad OF=${e.c}` : "" }];
    case "mValeurs":
      return [{ texte: "$a=OS$ et $c=OF$ ; puis :", latex: "\\text{ellipse : } b^2=a^2-c^2\\qquad\\text{hyperbole : } b^2=c^2-a^2" }, { texte: "Ici :", latex: e.famille === "A" && e.sousType === "memeAxe" ? `S${lp(e.S)},\\quad F${lp(e.F)}` : "" }];
    case "pAxe":
      return [{ texte: "Les foyers sont toujours sur l'axe focal ; le sommet donné est sur l'autre axe." }, { texte: "Ici :", latex: e.famille === "A" && e.sousType === "axesPerpendiculaires" ? `F${lp(e.F)}` : "" }];
    case "pValeurs":
      return [{ texte: "Le sommet de l'axe non focal donne $b$, le foyer donne $c$ ; pour une ellipse :", latex: "a^2=b^2+c^2" }, { texte: "Ici :", latex: e.famille === "A" && e.sousType === "axesPerpendiculaires" ? `S${lp(e.S)},\\quad F${lp(e.F)}` : "" }];
    case "sValeurs":
      return [{ texte: "$a$ est le plus grand demi-axe : l'axe focal est celui du sommet le plus éloigné du centre." }, { texte: "Ici :", latex: e.famille === "A" && e.sousType === "deuxSommets" ? `OS=${Math.abs(qNum(e.S.x))},\\qquad OS'=${Math.abs(qNum(e.Sp.y))}` : "" }];
    case "bOuverture":
      return [
        { texte: "Le carré porte sur la variable perpendiculaire à l'axe ; le signe de $2p$ donne le sens d'ouverture (vers le foyer, ou vers le point)." },
        { texte: e.famille === "B" && e.donnee === "point" ? `L'axe est parallèle à ${axeTexte(e.conique.axe)} ; compare $P$ et $S$ :` : "Compare $F$ et $S$ :", latex: e.famille === "B" ? (e.donnee === "point" ? `S${lp(e.S)},\\quad P${lp(e.P!)}` : `S${lp(e.S)},\\quad F${lp(e.F)}`) : "" },
      ];
    case "bP":
      return e.famille === "B" && e.donnee === "point"
        ? [{ texte: "Remplace les coordonnées de $P$ dans la forme choisie, puis isole $p$." }, { texte: "Avec la forme confirmée :", latex: `${latexCarreDecale(e.conique.axe === "x" ? "y" : "x", e.conique.axe === "x" ? e.S.y : e.S.x)}=${e.conique.sens > 0 ? "" : "-"}2p\\,(\\ldots)` }]
        : [{ texte: "Le foyer est à la distance $\\frac{p}{2}$ du sommet :", latex: "p=2\\cdot SF" }, { texte: "Ici :", latex: e.famille === "B" ? `S${lp(e.S)},\\quad F${lp(e.F)}` : "" }];
    case "cValeurs":
      return [{ texte: RELATIONS_C }, { texte: "Ici :", latex: e.famille === "C" ? e.donnees.map((d) => (d === "deuxC" ? `2c=${latexQ(valeurC(e, d))}` : d === "deuxA" ? `2a=${latexQ(valeurC(e, d))}` : d === "excentricite" ? `\\frac{c}{a}=${latexQ(valeurC(e, d))}` : `\\frac{2a^2}{c}=${latexQ(valeurC(e, d))}`)).join(",\\qquad ") : "" }];
    case "cNature":
      return [{ texte: "Une ellipse a une excentricité $e<1$ ($c<a$) ; une hyperbole $e>1$ ($c>a$)." }, { texte: "Ici :", latex: e.famille === "C" ? `a=${e.a},\\quad c=${e.c}` : "" }];
    case "cEquation":
      return [{ texte: "Calcule $b^2$ selon la nature, puis place $a^2$ sous le carré de l'axe focal :", latex: "\\text{ellipse : } b^2=a^2-c^2\\qquad\\text{hyperbole : } b^2=c^2-a^2" }, { texte: "Axe focal :", latex: e.famille === "C" ? `\\text{${axeTexte(e.conique.axe)}}` : "" }];
    case "dValeurs":
      return [
        { texte: "Asymptotes : $y=\\pm\\frac{b}{a}x$ si l'axe focal est horizontal, $y=\\pm\\frac{a}{b}x$ s'il est vertical ; et $c^2=a^2+b^2$." },
        { texte: "Ici :", latex: e.famille === "D" ? `\\text{pente }${penteD(e)},\\quad\\text{axe focal : ${e.conique.axe === "x" ? "horizontal" : "vertical"}}` : "" },
      ];
    case "equation": {
      const c = e.conique;
      if (c.type === "parabole") return [{ texte: "Remplace $p$ dans la forme choisie." }, { texte: "Ici :", latex: `p=${latexQ(c.p)}` }];
      return [{ texte: "Pour une ellipse ou une hyperbole, $a^2$ est sous le carré de l'axe focal :", latex: "\\frac{x^2}{a^2}\\pm\\frac{y^2}{b^2}=1\\qquad\\frac{y^2}{a^2}\\pm\\frac{x^2}{b^2}=1" }, { texte: "Ici :", latex: c.type === "ellipse" || c.type === "hyperbole" ? `a^2=${latexQ(c.a2)},\\quad b^2=${latexQ(c.b2)}` : "" }];
    }
  }
}

function reponse59(e: E, p: P): string[] {
  const c = e.conique;
  switch (p) {
    case "mNature":
    case "cNature":
      return [`\\text{${e.famille === "A" && e.sousType === "memeAxe" ? (e.nature === "ellipse" ? "une ellipse" : "une hyperbole") : e.famille === "C" ? (e.nature === "ellipse" ? "une ellipse" : "une hyperbole") : ""}}`];
    case "mValeurs":
      return e.famille === "A" && e.sousType === "memeAxe" ? [`a=${e.a}`, `c=${e.c}`, `b^2=${Math.abs(e.a * e.a - e.c * e.c)}`] : [];
    case "pAxe":
      return e.famille === "A" && e.sousType === "axesPerpendiculaires" ? [`\\text{${axeTexte(e.axeFocal)}}`] : [];
    case "pValeurs":
      return e.famille === "A" && e.sousType === "axesPerpendiculaires" ? [`b=${e.b}`, `c=${e.c}`, `a^2=${e.b * e.b + e.c * e.c}`] : [];
    case "sValeurs":
      return e.famille === "A" && e.sousType === "deuxSommets" ? [`a=${e.a}`, `b=${e.b}`] : [];
    case "bOuverture":
      return e.famille === "B" ? [formesParabole(e).find((o) => o.valeur === codeOuverture(e))!.label.replace(/\$/g, "")] : [];
    case "bP":
      return e.famille === "B" ? [`p=${latexQ(e.conique.p)}`] : [];
    case "cValeurs":
      return e.famille === "C" ? [`a=${e.a}`, `c=${e.c}`] : [];
    case "cEquation":
      return e.famille === "C" ? [`b^2=${Math.abs(e.a * e.a - e.c * e.c)}`, latexConique(c)] : [];
    case "dValeurs":
      return e.famille === "D" ? [`a=${e.a}`, `b=${e.b}`] : [];
    case "equation":
      return [latexConique(c)];
  }
}

function explication59(e: E, p: P): FragmentConsigne[][] {
  const c = e.conique;
  switch (p) {
    case "mNature":
      if (e.famille !== "A" || e.sousType !== "memeAxe") return [];
      return L(`$OS=${e.a}$ et $OF=${e.c}$ : ${e.c < e.a ? "le foyer est entre le centre et le sommet, $c<a$ : c'est une ellipse" : "le foyer est au-delà du sommet, $c>a$ : c'est une hyperbole"}.`);
    case "mValeurs":
      if (e.famille !== "A" || e.sousType !== "memeAxe") return [];
      return L(`$a=OS=${e.a}$, $c=OF=${e.c}$, puis $b^2=${e.nature === "ellipse" ? "a^2-c^2" : "c^2-a^2"}=${Math.abs(e.a * e.a - e.c * e.c)}$.`, "Piège : pour une hyperbole, $b^2=c^2-a^2$ (et non $a^2-c^2$, qui serait négatif).");
    case "pAxe":
      if (e.famille !== "A" || e.sousType !== "axesPerpendiculaires") return [];
      return L(`Le foyer $F${lp(e.F)}$ est sur ${axeTexte(e.axeFocal)} : c'est l'axe focal. Le sommet $S$ est sur l'autre axe.`, "Piège : c'est le foyer, jamais le sommet donné, qui fixe l'axe focal.");
    case "pValeurs":
      if (e.famille !== "A" || e.sousType !== "axesPerpendiculaires") return [];
      return L(`$b=OS=${e.b}$, $c=OF=${e.c}$, donc $a^2=b^2+c^2=${e.b * e.b + e.c * e.c}$.`);
    case "sValeurs":
      if (e.famille !== "A" || e.sousType !== "deuxSommets") return [];
      return L(`Le plus grand des deux demi-axes est $a=${e.a}$, l'autre est $b=${e.b}$ : l'axe focal est ${axeTexte(c.type === "ellipse" ? c.axe : "x")}.`, "Piège : $a$ n'est pas forcément sur l'axe des abscisses.");
    case "bOuverture":
      if (e.famille !== "B") return [];
      return L(`L'axe de symétrie est parallèle à ${axeTexte(e.conique.axe)} : le carré porte sur $${e.conique.axe === "x" ? "y" : "x"}$. La parabole s'ouvre vers ${e.donnee === "foyer" ? "le foyer" : "le point P"} : $${formesParabole(e).find((o) => o.valeur === codeOuverture(e))!.label.replace(/\$/g, "")}$.`);
    case "bP":
      if (e.famille !== "B") return [];
      return e.donnee === "foyer"
        ? L(`$SF=\\frac{p}{2}=${latexQ(qMul(q(1, 2), e.conique.p))}$, donc $p=${latexQ(e.conique.p)}$.`, "Piège : $p$ est la distance du foyer à la directrice, le double de $SF$.")
        : L(`On remplace les coordonnées de $P$ dans la forme choisie, puis on isole $p$ : $p=${latexQ(e.conique.p)}$.`);
    case "cValeurs":
      if (e.famille !== "C") return [];
      return L(RELATIONS_C, `Avec les données : $a=${e.a}$ et $c=${e.c}$.`);
    case "cNature":
      if (e.famille !== "C") return [];
      return L(`$e=\\frac{c}{a}=${latexFrac(e.c, e.a)}$ ${e.c < e.a ? "$<1$ : ellipse" : "$>1$ : hyperbole"}.`, "Piège : on ne suppose jamais la nature, on la déduit de $e$.");
    case "cEquation":
      if (e.famille !== "C") return [];
      return L(`$b^2=${e.nature === "ellipse" ? "a^2-c^2" : "c^2-a^2"}=${Math.abs(e.a * e.a - e.c * e.c)}$, d'où $${latexConique(c)}$.`);
    case "dValeurs":
      if (e.famille !== "D") return [];
      return L(
        `Pente des asymptotes : $${e.conique.axe === "x" ? "\\frac{b}{a}" : "\\frac{a}{b}"}=${penteD(e)}$.`,
        e.donnee === "sommet" ? `Le sommet donne $a=${e.a}$, puis $b=${e.b}$.` : `Avec $c^2=a^2+b^2=${e.a * e.a + e.b * e.b}$ : $a=${e.a}$, $b=${e.b}$.`,
        e.conique.axe === "y" ? "Piège : axe focal vertical, la pente vaut $\\frac{a}{b}$ et non $\\frac{b}{a}$." : "Piège : $c^2=a^2+b^2$ pour une hyperbole.",
      );
    case "equation":
      return L(`$${latexConique(c)}$`, "Vérification : les données (sommet, foyer, point) vérifient l'équation.");
  }
}

function lirePoly(v: string): Poly | null {
  try {
    return lireEquation(v, ["x", "y"]).poly;
  } catch {
    return null;
  }
}
function nombre(v: string): number | null {
  try {
    return lireNombre(v).valeur;
  } catch {
    return null;
  }
}
const pres = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));

function echangee(c: Conique): Conique | null {
  if (c.type === "ellipse" || c.type === "hyperbole") return { ...c, axe: c.axe === "x" ? "y" : "x" };
  return null;
}

function cible59(e: E, p: P, v: string[]): FragmentConsigne[] | null {
  const c = e.conique;
  if ((p === "mValeurs" || p === "cEquation") && (c.type === "ellipse" || c.type === "hyperbole")) {
    const i = p === "mValeurs" ? 2 : 0;
    const x = nombre(v[i]);
    if (x !== null && pres(x, -qNum(c.b2))) return f("$b^2$ est positif : pour une hyperbole, $b^2=c^2-a^2$.");
  }
  if (p === "equation" || p === "cEquation") {
    const poly = lirePoly(v[p === "cEquation" ? 1 : 0]);
    if (!poly) return null;
    const ech = echangee(c);
    if (ech && proportionnels(poly, polyConique(ech))) return f("$a^2$ et $b^2$ sont échangés : $a^2$ va sous le carré de la variable de l'axe focal.");
    if (c.type === "parabole") {
      const deux: Conique = { ...c, p: qMul(q(2), c.p) };
      const demi: Conique = { ...c, p: qMul(q(1, 2), c.p) };
      if (proportionnels(poly, polyConique(deux)) || proportionnels(poly, polyConique(demi))) return f("Le coefficient vaut $2p$, avec $p$ la distance du foyer à la directrice.");
      const autre: Conique = { ...c, sens: c.sens > 0 ? -1 : 1 };
      if (proportionnels(poly, polyConique(autre))) return f("Le signe de $2p$ donne le sens d'ouverture : vers le foyer (ou le point donné).");
    }
    if (c.type === "ellipse" || c.type === "hyperbole") {
      const autre: Conique = { ...c, type: c.type === "ellipse" ? "hyperbole" : "ellipse" };
      if (proportionnels(poly, polyConique(autre))) return f(`C'est ${c.type === "ellipse" ? "une ellipse : les deux carrés s'ajoutent" : "une hyperbole : les deux carrés se soustraient"}.`);
    }
    return null;
  }
  if (p === "bP" && c.type === "parabole") {
    const x = nombre(v[0]);
    if (x !== null && pres(x, qNum(c.p) / 2)) return f("$p$ est la distance du foyer à la directrice : le double de la distance sommet–foyer.");
    if (x !== null && pres(x, 2 * qNum(c.p))) return f("Le coefficient de l'équation vaut $2p$ : $p$ en est la moitié.");
  }
  if (p === "sValeurs" && e.famille === "A" && e.sousType === "deuxSommets") {
    const a = nombre(v[0]);
    if (a !== null && pres(a, e.b)) return f("$a$ est le demi-grand axe : le plus grand des deux.");
  }
  if (p === "dValeurs" && e.famille === "D") {
    const a = nombre(v[0]);
    const b = nombre(v[1]);
    if (a !== null && b !== null && pres(a, e.b) && pres(b, e.a) && e.a !== e.b) return f(e.conique.axe === "y" ? "Axe focal vertical : les asymptotes ont pour pente $\\frac{a}{b}$." : "Axe focal horizontal : les asymptotes ont pour pente $\\frac{b}{a}$.");
  }
  return null;
}

// ---------------------------------------------------------------------------
// Figure : les données, puis la conique après l'équation
// ---------------------------------------------------------------------------

export function figure6gen59(e: E, closes: readonly P[]): string | null {
  const c = e.conique;
  const o = objetsVides();
  const pts: P2[] = [];
  const point = (p: { x: number; y: number }, nom: string, couleur: "encre" | "accent" | "violet" = "encre") => {
    o.points.push({ p, nom, couleur });
    pts.push(p);
  };
  if (e.famille === "A") {
    if (e.sousType === "deuxSommets") {
      point(ptNum(e.S), "S");
      point(ptNum(e.Sp), "S′");
    } else {
      point(ptNum(e.S), "S");
      point(ptNum(e.F), "F", "accent");
    }
  } else if (e.famille === "B") {
    point(ptNum(e.S), "S");
    if (e.donnee === "foyer") point(ptNum(e.F), "F", "accent");
    else {
      point(ptNum(e.P!), "P");
      const S = ptNum(e.S);
      o.droites.push(e.conique.axe === "x" ? { a: 0, b: 1, c: -S.y, couleur: "gris", pointilles: true } : { a: 1, b: 0, c: -S.x, couleur: "gris", pointilles: true });
    }
  } else if (e.famille === "C") {
    if (!closes.includes("cValeurs")) return null;
    foyersConique(c).forEach((F, i) => point({ x: F.x, y: F.y }, i ? "F′" : "F", "accent"));
  } else {
    for (const d of asymptotes(e.conique)) o.droites.push({ ...d3(d), couleur: "gris", pointilles: true });
    if (e.donnee === "sommet") point(e.conique.axe === "x" ? { x: e.a, y: 0 } : { x: 0, y: e.a }, "S");
    else if (e.donnee === "foyer") {
      const F = foyersConique(e.conique)[0];
      point({ x: F.x, y: F.y }, "F", "accent");
    }
  }
  const fini = closes.includes("equation") || closes.includes("cEquation");
  const fen = fenetreConique(c, pts);
  if (fini) ajouterConique(o, c, Math.max(fen.xmax - fen.xmin, fen.ymax - fen.ymin), { couleur: "vert", foyers: e.famille === "A" && e.sousType !== "memeAxe" ? true : false });
  o.fenetre = fen;
  return figureLieux(o);
}
