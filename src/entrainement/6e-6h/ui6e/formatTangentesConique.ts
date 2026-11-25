import type { DroiteMK, ExerciceTangenteD, ExerciceTangentesConique } from "../core6e/tangentesConique.types";
import type { PhaseTangentesConique } from "../moteur6e/typesTangentesConique";
import { latexDroite, latexPoint, latexQ, latexSomme, lireEquation, lireNombre, proportionnels, ptNum, q, qMul, qNum, qSub } from "../moteur6e/algebreLieux";
import { latexConique, penteAsymptote } from "../moteur6e/algebreConiques";
import type { Conique } from "../moteur6e/algebreConiques";
import { droiteMK, polyDegre2 } from "../moteur6e/verificationTangentesConique";
import { formeCentree } from "../generateurs6e/tangentesConique";
import { f } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";
import { champDroiteUI, champEquationUI, champListeEquationsUI, champListePointsUI, champNombreUI, d3, nomPoint } from "./textesLieux";
import { EXACT, L, eqPoly } from "./textesConiques";
import { figureLieux } from "./figureLieux";
import { ajouterConique, fenetreConique, objetsVides } from "./traceConiques";

/**
 * Textes de `6gen62` — Tangentes à une conique (6e ch. 10, § 5 ; audit, lots B et C). Réponses de chaque
 * écran rédigées (plus de « voir bloc de travail », G5 / P1), données en fractions (G21), tangente de la
 * parabole y·y_P = p(x + x_P) (décision 1), aides en KaTeX. Figure : la position de P (C) et la droite
 * donnée (B) n'apparaissent qu'APRÈS le verdict.
 */

type E = ExerciceTangentesConique;
type P = PhaseTangentesConique;

const lq = latexQ;
const yMK = (d: DroiteMK) => `y=${latexSomme([
  [d.m, "x"],
  [d.k, ""],
])}`;
const par = (r: { n: bigint; d: bigint }) => (r.n < 0n ? `\\left(${lq(r)}\\right)` : lq(r));

function formeD(e: ExerciceTangenteD): string {
  const c = e.conique;
  if (c.type === "ellipse") return "\\dfrac{x^2}{\\alpha}+\\dfrac{y^2}{\\beta}=1";
  return c.axe === "x" ? "\\dfrac{x^2}{\\alpha}-\\dfrac{y^2}{\\beta}=1" : "\\dfrac{y^2}{\\beta}-\\dfrac{x^2}{\\alpha}=1";
}

function natureTexte(c: Conique): string {
  return c.type === "ellipse" ? "l'ellipse" : c.type === "hyperbole" ? "l'hyperbole" : c.type === "parabole" ? "la parabole" : "le cercle";
}

export const FORMAT_6GEN62: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        return f(`Détermine la tangente à ${natureTexte(e.conique)} $\\Gamma$ au point $P$.` + EXACT);
      case "B":
        return f("Détermine les tangentes à l'hyperbole $\\Gamma$ qui sont parallèles à la droite $d$, s'il y en a." + EXACT);
      case "C":
        return f("Détermine les tangentes à l'ellipse $\\Gamma$ qui passent par le point $P$, s'il y en a." + EXACT);
      case "D":
        return f(`On cherche ${e.conique.type === "ellipse" ? "l'ellipse" : "l'hyperbole"} d'équation $${formeD(e)}$ ($\\alpha>0$, $\\beta>0$) qui passe par $P$ et qui est tangente à la droite $d$.` + EXACT);
      case "E":
        return f(`La droite $d$ ne coupe pas ${natureTexte(e.conique)} $\\Gamma$. Détermine le point de $\\Gamma$ le plus proche de $d$.` + EXACT);
    }
  },
  donnees(e) {
    switch (e.famille) {
      case "A":
        return [f(`$\\Gamma\\,:\\ ${latexConique(e.conique)}$`), f(`$${nomPoint("P", e.P)}$`)];
      case "B":
      case "E":
        return [f(`$\\Gamma\\,:\\ ${latexConique(e.conique)}$`), f(`$d\\,:\\ ${yMK(e.d)}$`)];
      case "C":
        return [f(`$\\Gamma\\,:\\ ${latexConique(e.conique)}$`), f(`$${nomPoint("P", e.P)}$`)];
      case "D":
        return [f(`$${nomPoint("P", e.P)}$`), f(`$d\\,:\\ ${yMK(e.d)}$`)];
    }
  },
  consigneEcran(e, p) {
    switch (p) {
      case "aPente":
        return f("Calcule la pente de la tangente en $P$ (par la dérivée ou par la forme dédoublée).");
      case "aTangente":
        return f("Écris une équation de la tangente en $P$.");
      case "bEquationK":
        return e.famille === "B" ? f(`Une droite parallèle à $d$ s'écrit $y=${latexSomme([[e.d.m, "x"]])}+k$. Écris la condition sur $k$ pour qu'elle soit tangente à $\\Gamma$.`) : [];
      case "bNombre":
        return f("Combien de tangentes à $\\Gamma$ sont parallèles à $d$ ?");
      case "bTangentes":
      case "cTangentes":
        return f("Écris une équation de chaque tangente (une par ligne).");
      case "cEquationM":
        return e.famille === "C" ? f(`Une droite non verticale qui passe par $P$ s'écrit $y-${par(e.P.y)}=m\\left(x-${par(e.P.x)}\\right)$. Écris l'équation en $m$ qui exprime qu'elle est tangente à $\\Gamma$.`) : [];
      case "cNombre":
        return f("Combien de tangentes à $\\Gamma$ passent par $P$ ?");
      case "dValeurs":
        return f("Calcule $\\alpha$ et $\\beta$.");
      case "dEquation":
        return f("Écris l'équation de la conique.");
      case "eContacts":
        return f("Le point cherché est le point de contact d'une tangente parallèle à $d$. Donne les points de contact des deux tangentes à $\\Gamma$ parallèles à $d$ (un par ligne).");
      case "eProche":
        return f("Lequel de ces deux points est le plus proche de $d$ ?");
    }
  },
  champs(e, p): ChampCombi[] {
    const choixNombre = (lib: string): ChampCombi[] => [
      {
        type: "choix",
        label: "",
        options: [
          { valeur: "0", label: `Aucune ${lib}` },
          { valeur: "2", label: "Deux" },
        ],
      },
    ];
    switch (p) {
      case "aPente":
        return [champNombreUI("Pente")];
      case "aTangente":
        return [champDroiteUI("Tangente")];
      case "bEquationK":
        return [champEquationUI("Condition sur $k$", ["k"])];
      case "bNombre":
      case "cNombre":
        return choixNombre("tangente");
      case "bTangentes":
      case "cTangentes":
        return [champListeEquationsUI("Tangentes")];
      case "cEquationM":
        return [champEquationUI("Équation en $m$", ["m"])];
      case "dValeurs":
        return [champNombreUI("$\\alpha$"), champNombreUI("$\\beta$")];
      case "dEquation":
        return [champEquationUI("Équation")];
      case "eContacts":
        return [champListePointsUI("Points de contact")];
      case "eProche":
        return e.famille === "E" ? [{ type: "choix", label: "", options: e.points.map((P, i) => ({ valeur: String(i), label: `$${latexPoint(P)}$` })) }] : [];
    }
  },
  aides: aides62,
  reponseAttendue: reponse62,
  explication: explication62,
  libellePhase: (_e, p) => LIBELLES[p],
  messageCible: cible62,
};

const LIBELLES: Record<P, string> = {
  aPente: "Pente de la tangente",
  aTangente: "Tangente",
  bEquationK: "Condition sur k",
  bNombre: "Nombre de tangentes",
  bTangentes: "Tangentes",
  cEquationM: "Équation en m",
  cNombre: "Nombre de tangentes",
  cTangentes: "Tangentes",
  dValeurs: "α et β",
  dEquation: "Équation",
  eContacts: "Points de contact",
  eProche: "Point le plus proche",
};

const DEDOUBLEE = "Forme dédoublée en $P(x_P\\,;y_P)$ : on remplace $x^2$ par $x\\,x_P$ et $y^2$ par $y\\,y_P$ (pour la parabole $y^2=2px$ : $y\\,y_P=p(x+x_P)$) ; ou bien on dérive la branche qui contient $P$.";
const CONDITION = "Condition du cours : $y=mx+k$ est tangente à $\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1$ si $k^2=a^2m^2+b^2$, à $\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1$ si $k^2=a^2m^2-b^2$, à $\\frac{y^2}{a^2}-\\frac{x^2}{b^2}=1$ si $k^2=a^2-b^2m^2$ (le discriminant de l'équation en $x$ est nul).";

function k2Formule(c: Conique, m: { n: bigint; d: bigint }): string {
  if (c.type !== "ellipse" && c.type !== "hyperbole") return "";
  const f2 = formeCentree(c);
  const sx = f2.sx < 0 ? "-" : "";
  const sy = f2.sy < 0 ? "-" : "+";
  return `k^2=${sx}${lq(f2.X)}\\cdot${par(m)}^2${sy}${lq(f2.Y)}`;
}

function aides62(e: E, p: P): AideCombi[] {
  switch (e.famille) {
    case "A": {
      if (p === "aTangente") return [{ texte: "Tangente de pente $m$ en $P$ :", latex: "y-y_P=m(x-x_P)" }, { texte: "Ici :", latex: `P${latexPoint(e.P)},\\quad m=${lq(e.pente)}` }];
      const c = e.conique;
      if (c.type === "parabole") return [{ texte: DEDOUBLEE }, { texte: "Ici :", latex: `p=${lq(c.p)},\\quad P${latexPoint(e.P)}` }];
      const fc = formeCentree(c);
      return [{ texte: DEDOUBLEE }, { texte: "En dérivant implicitement, la pente vaut :", latex: `m=-\\dfrac{${fc.sx < 0 ? "-" : ""}\\frac{x_P}{${lq(fc.X)}}}{${fc.sy < 0 ? "-" : ""}\\frac{y_P}{${lq(fc.Y)}}}` }];
    }
    case "B":
      if (p === "bEquationK") return [{ texte: CONDITION }, { texte: "Ici :", latex: `m=${lq(e.d.m)}` }];
      if (p === "bNombre") return [{ texte: "Un carré n'est jamais négatif." }, { texte: "La condition obtenue :", latex: `k^2=${lq(e.k2)}` }];
      return [{ texte: "Chaque valeur de $k$ donne une tangente $y=mx+k$." }, { texte: "La condition obtenue :", latex: `k^2=${lq(e.k2)}` }];
    case "C":
      if (p === "cEquationM") return [{ texte: CONDITION }, { texte: "Ici, l'ordonnée à l'origine de la droite :", latex: `k=${lq(e.P.y)}${qNum(e.P.x) < 0 ? "+" : "-"}${lq(q(e.P.x.n < 0n ? -e.P.x.n : e.P.x.n, e.P.x.d))}\\,m` }];
      if (p === "cNombre") return [{ texte: "Le nombre de tangentes est le nombre de solutions de l'équation en $m$ : regarde son discriminant." }, { texte: "L'équation :", latex: `${eqPoly(polyDegre2("m", e.eqM), ["m"])}` }];
      return [{ texte: "Résous l'équation en $m$ ; chaque solution donne une tangente $y=m(x-x_P)+y_P$." }, { texte: "L'équation :", latex: `${eqPoly(polyDegre2("m", e.eqM), ["m"])}` }];
    case "D": {
      const fc = formeCentree(e.conique);
      const sys = `\\begin{cases}${fc.sx < 0 ? "-" : ""}\\dfrac{${lq(qMul(e.P.x, e.P.x))}}{\\alpha}${fc.sy < 0 ? "-" : "+"}\\dfrac{${lq(qMul(e.P.y, e.P.y))}}{\\beta}=1\\\\ ${lq(qMul(e.d.k, e.d.k))}=${fc.sx < 0 ? "-" : ""}${lq(qMul(e.d.m, e.d.m))}\\,\\alpha${fc.sy < 0 ? "-" : "+"}\\beta\\end{cases}`;
      if (p === "dValeurs") return [{ texte: "$P$ vérifie l'équation ; la droite $d\\,:\\ y=mx+k$ est tangente (condition du cours, ici avec $\\alpha$ sous $x^2$ et $\\beta$ sous $y^2$)." }, { texte: "Le système :", latex: sys }];
      return [{ texte: "Remplace $\\alpha$ et $\\beta$ dans la forme donnée." }, { texte: "Ici :", latex: `\\alpha=${lq(e.alpha)},\\quad\\beta=${lq(e.beta)}` }];
    }
    case "E":
      if (p === "eContacts") return [{ texte: CONDITION + " Le point de contact est l'unique solution de l'équation en $x$." }, { texte: "Ici :", latex: `m=${lq(e.d.m)}` }];
      return [{ texte: "Distance d'un point à $d\\,:\\ mx-y+k=0$ :", latex: "\\dfrac{|m\\,x_0-y_0+k|}{\\sqrt{m^2+1}}" }, { texte: "Ici :", latex: `m=${lq(e.d.m)},\\quad k=${lq(e.d.k)}` }];
  }
}

function reponse62(e: E, p: P): string[] {
  switch (e.famille) {
    case "A":
      return p === "aPente" ? [`m=${lq(e.pente)}`] : [yMK({ m: e.pente, k: qSub(e.P.y, qMul(e.pente, e.P.x)) })];
    case "B":
      if (p === "bEquationK") return [`k^2=${lq(e.k2)}`];
      if (p === "bNombre") return [`\\text{${e.verdict === 0 ? "aucune" : "deux"}}`];
      return e.tangentes.map(yMK);
    case "C":
      if (p === "cEquationM") return [eqPoly(polyDegre2("m", e.eqM), ["m"])];
      if (p === "cNombre") return [`\\text{${e.verdict === 0 ? "aucune" : "deux"}}`];
      return e.tangentes.map(yMK);
    case "D":
      return p === "dValeurs" ? [`\\alpha=${lq(e.alpha)}`, `\\beta=${lq(e.beta)}`] : [latexConique(e.conique)];
    case "E":
      return p === "eContacts" ? e.points.map(latexPoint) : [latexPoint(e.points[e.proche])];
  }
}

function explication62(e: E, p: P): FragmentConsigne[][] {
  switch (e.famille) {
    case "A": {
      const t = yMK({ m: e.pente, k: qSub(e.P.y, qMul(e.pente, e.P.x)) });
      if (p === "aPente") return L(`La pente en $P$ vaut $m=${lq(e.pente)}$.`, e.conique.type === "parabole" ? "Piège : pour $y^2=2px$, la tangente est $y\\,y_P=p(x+x_P)$ (et non $2p$)." : "Piège : on dérive la branche qui contient $P$ (signe de $y_P$).");
      return L(`$y-${par(e.P.y)}=${lq(e.pente)}\\left(x-${par(e.P.x)}\\right)$, soit $${t}$.`, `Vérification : la forme dédoublée en $P$ donne la même droite, $${latexDroite(e.tangente)}$.`);
    }
    case "B": {
      const a = penteAsymptote(e.conique);
      if (p === "bEquationK") return L(`$${k2Formule(e.conique, e.d.m)}$, soit $k^2=${lq(e.k2)}$.`, e.conique.axe === "y" ? "Piège : axe focal vertical, la condition est $k^2=a^2-b^2m^2$." : "Piège : pour l'hyperbole, $k^2=a^2m^2-b^2$ (un « − »).");
      if (p === "bNombre") return L(e.verdict === 0 ? `$k^2=${lq(e.k2)}<0$ : aucune valeur de $k$, aucune tangente parallèle à $d$.` : `$k^2=${lq(e.k2)}>0$ : deux valeurs opposées de $k$, deux tangentes.`, a ? `Pente des asymptotes : $\\pm${lq(a)}$ ; pente de $d$ : $${lq(e.d.m)}$.` : "");
      return L(`$k=\\pm\\sqrt{${lq(e.k2)}}$ : ${e.tangentes.map((t) => `$${yMK(t)}$`).join(" et ")}.`);
    }
    case "C":
      if (p === "cEquationM") return L(`$k=y_P-m\\,x_P$ dans la condition de tangence, puis on développe : $${eqPoly(polyDegre2("m", e.eqM), ["m"])}$.`);
      if (p === "cNombre") {
        const D = qSub(qMul(e.eqM[1], e.eqM[1]), qMul(q(4), qMul(e.eqM[0], e.eqM[2])));
        return L(`Discriminant de l'équation en $m$ : $\\Delta=${lq(D)}$ ${e.verdict === 0 ? "$<0$ : aucune tangente ; $P$ est à l'intérieur de l'ellipse" : "$>0$ : deux tangentes ; $P$ est à l'extérieur de l'ellipse"}.`);
      }
      return L(`Les deux solutions en $m$ donnent ${e.tangentes.map((t) => `$${yMK(t)}$`).join(" et ")}.`, "Vérification : chaque droite passe par $P$.");
    case "D":
      if (p === "dValeurs") return L(`On résout le système : $\\alpha=${lq(e.alpha)}$ et $\\beta=${lq(e.beta)}$ (la seule solution avec $\\alpha>0$ et $\\beta>0$).`, "Piège : la condition de tangence d'une hyperbole porte un « − ».");
      return L(`$${latexConique(e.conique)}$.`, "Vérification : $P$ vérifie l'équation et $d$ ne la coupe qu'en un point.");
    case "E": {
      if (p === "eContacts") return L(`Les tangentes parallèles à $d$ ont pour pente $${lq(e.d.m)}$ ; la condition de tangence donne deux valeurs de $k$, puis les points de contact ${e.points.map((P) => `$${latexPoint(P)}$`).join(" et ")}.`);
      return L(`On compare les distances à $d$ (ou les ordonnées à l'origine des tangentes à celle de $d$) : le point le plus proche est $${latexPoint(e.points[e.proche])}$.`, "Piège : seuls les points de contact des tangentes parallèles à $d$ sont candidats.");
    }
  }
}

function cible62(e: E, p: P, v: string[]): FragmentConsigne[] | null {
  const pres = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));
  if (e.famille === "A" && p === "aPente") {
    try {
      const x = lireNombre(v[0]).valeur;
      if (pres(x, -qNum(e.pente))) return f("Attention au signe de la pente (dérive la branche qui contient $P$).");
      if (e.conique.type === "parabole" && (pres(x, 2 * qNum(e.pente)) || pres(x, qNum(e.pente) / 2))) return f("Pour $y^2=2px$, la tangente en $P$ est $y\\,y_P=p(x+x_P)$ : sa pente est $\\frac{p}{y_P}$.");
    } catch {
      return null;
    }
  }
  if (e.famille === "B" && p === "bEquationK") {
    try {
      const poly = lireEquation(v[0], ["k"]).poly;
      const fc = formeCentree(e.conique);
      const autre = qSub(qMul(q(-fc.sx), qMul(qMul(e.d.m, e.d.m), fc.X)), qMul(q(fc.sy), fc.Y));
      if (proportionnels(poly, polyDegre2("k", [q(1), q(0), autre]))) return f("Le signe de la condition est inversé : vérifie l'axe focal de l'hyperbole.");
    } catch {
      return null;
    }
  }
  if ((e.famille === "B" || e.famille === "C") && (p === "bTangentes" || p === "cTangentes") && v[0].split("\n").filter((l) => l.trim()).length === 1) return f("Il manque une tangente : il y en a deux.");
  if (e.famille === "D" && p === "dValeurs") {
    try {
      const a = lireNombre(v[0]).valeur;
      const b = lireNombre(v[1]).valeur;
      if (pres(a, qNum(e.beta)) && pres(b, qNum(e.alpha))) return f("$\\alpha$ est sous $x^2$, $\\beta$ sous $y^2$.");
    } catch {
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------

export function figure6gen62(e: E, closes: readonly P[]): string {
  const o = objetsVides();
  const c = e.conique;
  const autres: { x: number; y: number }[] = [];
  if (e.famille === "A" || e.famille === "C" || e.famille === "D") autres.push(ptNum(e.P));
  if (e.famille === "E") {
    autres.push(...e.points.map(ptNum));
    // Pied de la perpendiculaire du centre à d : la droite d reste dans la fenêtre.
    const m = qNum(e.d.m);
    const k = qNum(e.d.k);
    autres.push({ x: (-m * k) / (1 + m * m), y: k / (1 + m * m) });
  }
  const fen = fenetreConique(c, autres);
  const ext = Math.max(fen.xmax - fen.xmin, fen.ymax - fen.ymin);
  switch (e.famille) {
    case "A":
      ajouterConique(o, c, ext, { couleur: "bleu" });
      o.points.push({ p: ptNum(e.P), nom: "P" });
      if (closes.includes("aTangente")) o.droites.push({ ...d3(e.tangente), couleur: "vert", epais: true });
      break;
    case "B":
      ajouterConique(o, c, ext, { couleur: "bleu", asymptotes: closes.includes("bNombre") });
      if (closes.includes("bNombre")) o.droites.push({ ...d3(droiteMK(e.d)), couleur: "gris", pointilles: true, nom: "d" });
      if (closes.includes("bTangentes")) for (const t of e.tangentes) o.droites.push({ ...d3(droiteMK(t)), couleur: "vert", epais: true });
      break;
    case "C":
      ajouterConique(o, c, ext, { couleur: "bleu" });
      if (closes.includes("cNombre")) o.points.push({ p: ptNum(e.P), nom: "P" });
      if (closes.includes("cTangentes")) for (const t of e.tangentes) o.droites.push({ ...d3(droiteMK(t)), couleur: "vert", epais: true });
      break;
    case "D":
      o.points.push({ p: ptNum(e.P), nom: "P" });
      o.droites.push({ ...d3(droiteMK(e.d)), couleur: "accent", nom: "d" });
      if (closes.includes("dEquation")) ajouterConique(o, c, ext, { couleur: "vert" });
      break;
    case "E":
      ajouterConique(o, c, ext, { couleur: "bleu" });
      o.droites.push({ ...d3(droiteMK(e.d)), couleur: "accent", nom: "d" });
      if (closes.includes("eContacts")) {
        e.points.forEach((P, i) => {
          o.points.push({ p: ptNum(P), nom: `T${i ? "₂" : "₁"}`, couleur: closes.includes("eProche") && i === e.proche ? "vert" : "encre" });
          o.droites.push({ ...d3(droiteMK({ m: e.d.m, k: qSub(P.y, qMul(e.d.m, P.x)) })), couleur: "gris", pointilles: true });
        });
      }
      break;
  }
  o.fenetre = fen;
  return figureLieux(o);
}
