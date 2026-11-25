import type { ExerciceIdA2, ExerciceIdB, ExerciceIdC, ExerciceIdentificationConiques } from "../core6e/identificationConiques.types";
import type { PhaseIdentificationConiques } from "../moteur6e/typesIdentificationConiques";
import { latexCarreDecale, latexDroite, latexPoly, latexQ, latexRacine, lireNombre, lirePoint, polyAdd, polyConst, polyMul, polyScal, polyVar, ptNum, q, qMul, qNum } from "../moteur6e/algebreLieux";
import { c2Conique, foyersConique, latexConique, penteAsymptote } from "../moteur6e/algebreConiques";
import type { Conique } from "../moteur6e/algebreConiques";
import { codeNatureC, polyEnonce } from "../moteur6e/verificationIdentificationConiques";
import { f } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";
import { champEquationUI, champListeEquationsUI, champListePointsUI, champNombreUI, champPointUI, lp, p2 } from "./textesLieux";
import { coefDevant, eqPoly, EXACT, L, latexDeuxCarres, latexFrac, nomPC, polyGeneral } from "./textesConiques";
import { figureLieux } from "./figureLieux";
import { ajouterConique, d3, fenetreConique, objetsVides } from "./traceConiques";

/**
 * Textes de `6gen58` — Identifier une conique et ses éléments (6e ch. 10, § 1–2 ; audit, lots B et C).
 * Réponses de chaque écran rédigées avec les nombres (plus de lettres A, B, ni de « voir corrigé en
 * classe »), aides à deux niveaux sans la réponse, champs à indication de FORMAT seulement, famille C
 * lue comme une moitié de conique, figure tracée APRÈS la nature (elle la trahirait).
 */

type E = ExerciceIdentificationConiques;
type P = PhaseIdentificationConiques;

const LIBELLE_NATURE: Record<string, string> = {
  ellipse: "une ellipse",
  cercle: "un cercle",
  hyperbole: "une hyperbole",
  point: "un seul point",
  vide: "l'ensemble vide (aucun point)",
  droitesSecantes: "deux droites sécantes",
  droitesParalleles: "deux droites parallèles",
  droite: "une parabole ouverte vers la droite",
  gauche: "une parabole ouverte vers la gauche",
  haut: "une parabole ouverte vers le haut",
  bas: "une parabole ouverte vers le bas",
};
const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const OPTIONS_CENTREES = ["ellipse", "cercle", "hyperbole", "point", "vide", "droitesSecantes"].map((v) => ({ valeur: v, label: maj(LIBELLE_NATURE[v]) }));
const OPTIONS_A2 = ["droite", "gauche", "haut", "bas", "droitesParalleles"].map((v) => ({ valeur: v, label: maj(LIBELLE_NATURE[v]) }));

function optionsC(e: ExerciceIdC) {
  const v = e.variableIsolee;
  const k = e.k;
  return [
    { valeur: "ellipseEntiere", label: "Une ellipse entière" },
    { valeur: "ellipsePlus", label: `La moitié d'ellipse où $${v}\\geq ${k}$` },
    { valeur: "ellipseMoins", label: `La moitié d'ellipse où $${v}\\leq ${k}$` },
    { valeur: "hyperboleEntiere", label: "Une hyperbole entière" },
    { valeur: "hyperbolePlus", label: `La partie d'hyperbole où $${v}\\geq ${k}$` },
    { valeur: "hyperboleMoins", label: `La partie d'hyperbole où $${v}\\leq ${k}$` },
  ];
}
function libelleC(e: ExerciceIdC): string {
  const o = optionsC(e).find((x) => x.valeur === codeNatureC(e))!;
  return o.label.charAt(0).toLowerCase() + o.label.slice(1);
}

// ---------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------

const mLatex = (e: ExerciceIdC) => latexFrac(e.mNum, e.mDen);
const m2 = (e: ExerciceIdC) => q(e.mNum * e.mNum, e.mDen * e.mDen);

function sousRacine(e: ExerciceIdC): string {
  const v = polyVar(e.variableRacine);
  return latexPoly(polyAdd(polyAdd(polyScal(polyMul(v, v), q(e.a2)), polyScal(v, q(e.a1))), polyConst(q(e.a0))), [e.variableRacine]);
}

export function equationC(e: ExerciceIdC): string {
  const debut = e.k === 0 ? (e.signeRacine < 0 ? "-" : "") : `${e.k}${e.signeRacine < 0 ? "-" : "+"}`;
  const m = e.mNum === e.mDen ? "" : mLatex(e);
  return `${e.variableIsolee}=${debut}${m}\\sqrt{${sousRacine(e)}}`;
}

function equationEnonce(e: E): string {
  return e.famille === "C" ? equationC(e) : eqPoly(polyEnonce(e));
}

/** Forme « deux carrés » de la famille B (coefficients A, B ; second membre M). */
function formeB(e: ExerciceIdB): string {
  return latexDeuxCarres(e.A, e.centre.x, e.B, e.centre.y, e.M);
}

/** C : (v − k)² = m²(…) puis les deux carrés, coefficients entiers positifs. */
function carreC(e: ExerciceIdC): string {
  const m = m2(e);
  return `(${e.variableIsolee}${e.k === 0 ? "" : e.k < 0 ? `+${-e.k}` : `-${e.k}`})^2=${coefDevant(m) === "" ? "" : coefDevant(m)}\\left(${sousRacine(e)}\\right)`;
}
function formeC(e: ExerciceIdC): string {
  const cr = e.mNum * e.mNum;
  const ci = (e.nature === "ellipse" ? 1 : -1) * e.mDen * e.mDen;
  const M = e.mNum * e.mNum * e.r * e.r;
  const [cx, hx, cy, hy] = e.variableRacine === "x" ? [cr, e.h, ci, e.k] : [ci, e.k, cr, e.h];
  if (cx < 0) return `${coefDevant(cy)}${latexCarreDecale("y", q(hy))}-${coefDevant(-cx)}${latexCarreDecale("x", q(hx))}=${M}`;
  return latexDeuxCarres(cx, hx, cy, hy, M);
}

const egal = (v: string) => ({ ...champEquationUI(v) });

function elementsLatex(c: Conique): string[] {
  if (c.type !== "ellipse" && c.type !== "hyperbole") return [];
  return [`a=${latexRacine(c.a2)}`, `b=${latexRacine(c.b2)}`, `c=${latexRacine(c2Conique(c))}`];
}
function foyersLatex(c: Conique): string[] {
  const F = foyersConique(c);
  const r = F.length === 2 ? [nomPC("F", F[0]), nomPC("F'", F[1])] : F.map((x) => nomPC("F", x));
  if (c.type === "hyperbole") {
    const m = penteAsymptote(c)!;
    const h = c.centre.x;
    const k = c.centre.y;
    const mq = latexQ(m);
    const mm = mq === "1" ? "" : mq;
    const xs = h.n === 0n ? "x" : `(x${h.n < 0n ? "+" : "-"}${latexQ(q(h.n < 0n ? -h.n : h.n, h.d))})`;
    const ys = k.n === 0n ? "y" : `y${k.n < 0n ? "+" : "-"}${latexQ(q(k.n < 0n ? -k.n : k.n, k.d))}`;
    r.push(`${ys}=\\pm ${mm}${xs}`);
  }
  return r;
}

function directriceLatex(c: Extract<Conique, { type: "parabole" }>): string {
  return `d\\equiv ${c.axe}=${latexQ(qMul(q(-c.sens, 2), c.p))}`;
}

// ---------------------------------------------------------------------------
// Format
// ---------------------------------------------------------------------------

export const FORMAT_6GEN58: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A1":
      case "A2":
        return f("Quelle est la nature de l'ensemble des points dont les coordonnées vérifient l'équation ci-dessous ? Détermine ensuite ses éléments." + EXACT);
      case "B":
        return f("On donne l'équation d'une courbe. Réduis-la en complétant les carrés, déduis-en sa nature, puis ses éléments." + EXACT);
      case "C":
        return f("On donne la courbe $\\Gamma$ ci-dessous. Est-ce une conique entière ? Détermine ensuite les éléments de la conique dont elle fait partie." + EXACT);
    }
  },
  donnees: (e) => [f(`${e.famille === "C" ? "$\\Gamma\\,:\\ " : "$"}${equationEnonce(e)}$`)],
  consigneEcran(e, p) {
    switch (p) {
      case "a1Nature":
      case "a2Nature":
        return f("Quelle est la nature de cet ensemble ?");
      case "bNature":
        return f("À partir de la forme obtenue, quelle est la nature de cet ensemble ?");
      case "cNature":
        return f("Quelle est la courbe $\\Gamma$ de l'énoncé ?");
      case "a1Rayon":
        return f("Calcule le rayon $r$ du cercle.");
      case "a1Point":
      case "bPoint":
        return f("Donne les coordonnées de ce point.");
      case "a1Droites":
      case "bDroites":
      case "a2Droites":
        return f("Écris une équation de chacune des deux droites (une par ligne).");
      case "a1DemiAxes":
        return e.conique?.type === "ellipse" ? f("Calcule $a$ (demi-grand axe), $b$ (demi-petit axe) et $c$ (distance du centre à un foyer).") : f("Calcule $a$ (demi-axe focal), $b$ et $c$ (distance du centre à un foyer).");
      case "a1Foyers":
      case "bFoyers":
        return e.conique?.type === "hyperbole" ? f("Donne les deux foyers, puis une équation de chacune des deux asymptotes (une par ligne).") : f("Donne les coordonnées des deux foyers (un par ligne).");
      case "a2P":
        return f("Donne le paramètre $p$ de la parabole ($p$ : distance du foyer à la directrice).");
      case "a2FoyerDirectrice":
        return f("Donne le foyer $F$ et une équation de la directrice $d$.");
      case "bForme":
        return f("Complète les carrés : écris l'équation sous la forme $\\alpha(x-h)^2+\\beta(y-k)^2=\\gamma$.");
      case "bCentreRayon":
        return f("Donne le centre $\\Omega$ et le rayon $r$ du cercle.");
      case "bCentreDemiAxes":
        return e.conique?.type === "ellipse" ? f("Donne le centre $\\Omega$, puis $a$ (demi-grand axe), $b$ (demi-petit axe) et $c$.") : f("Donne le centre $\\Omega$, puis $a$ (demi-axe focal), $b$ et $c$.");
      case "cCarre":
        return f("Élève les deux membres au carré : écris l'équation obtenue, sans racine.");
      case "cForme":
        return f("Complète le carré : écris cette équation sous la forme $\\alpha(x-h)^2+\\beta(y-k)^2=\\gamma$.");
      case "cElements":
        return f("Pour la conique complète, donne le centre $\\Omega$, puis $a$ (demi-axe focal) et $b$.");
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "a1Nature":
      case "bNature":
        return [{ type: "choix", label: "", options: OPTIONS_CENTREES }];
      case "a2Nature":
        return [{ type: "choix", label: "", options: OPTIONS_A2 }];
      case "cNature":
        return [{ type: "choix", label: "", options: optionsC(e as ExerciceIdC) }];
      case "a1Rayon":
        return [champNombreUI("Rayon $r$")];
      case "bCentreRayon":
        return [champPointUI("Centre $\\Omega$"), champNombreUI("Rayon $r$")];
      case "a1Point":
      case "bPoint":
        return [champPointUI("Point")];
      case "a1Droites":
      case "bDroites":
      case "a2Droites":
        return [champListeEquationsUI("Droites")];
      case "a1DemiAxes":
        return [champNombreUI("$a$"), champNombreUI("$b$"), champNombreUI("$c$")];
      case "bCentreDemiAxes":
        return [champPointUI("Centre $\\Omega$"), champNombreUI("$a$"), champNombreUI("$b$"), champNombreUI("$c$")];
      case "a1Foyers":
      case "bFoyers":
        return e.conique?.type === "hyperbole" ? [champListePointsUI("Foyers"), champListeEquationsUI("Asymptotes")] : [champListePointsUI("Foyers")];
      case "a2P":
        return [champNombreUI("$p$")];
      case "a2FoyerDirectrice":
        return [champPointUI("Foyer $F$"), egal("Directrice $d$")];
      case "bForme":
      case "cForme":
        return [egal("Équation")];
      case "cCarre":
        return [egal("Équation sans racine")];
      case "cElements":
        return [champPointUI("Centre $\\Omega$"), champNombreUI("$a$"), champNombreUI("$b$")];
    }
  },
  aides: aides58,
  reponseAttendue: reponse58,
  explication: explication58,
  libellePhase: (_e, p) => LIBELLES[p],
  messageCible: cible58,
};

const LIBELLES: Record<P, string> = {
  a1Nature: "Nature",
  a1Rayon: "Rayon",
  a1Point: "Le point",
  a1Droites: "Les deux droites",
  a1DemiAxes: "a, b et c",
  a1Foyers: "Foyers",
  a2Nature: "Nature",
  a2P: "Paramètre p",
  a2FoyerDirectrice: "Foyer et directrice",
  a2Droites: "Les deux droites",
  bForme: "Carrés complétés",
  bNature: "Nature",
  bCentreRayon: "Centre et rayon",
  bPoint: "Le point",
  bDroites: "Les deux droites",
  bCentreDemiAxes: "Centre, a, b et c",
  bFoyers: "Foyers",
  cCarre: "Équation sans racine",
  cForme: "Carré complété",
  cNature: "Nature de Γ",
  cElements: "Centre, a et b",
};

/** « Ax² + By² = −F » (A1) ou « (lettre)² = coef·(autre) » (A2), pour les aides. */
function isoleA1(e: Extract<E, { famille: "A1" }>): string {
  return `${latexPoly(polyGeneral(e.A, e.B, 0, 0, 0))}=${-e.F || 0}`;
}
function isoleA2(e: ExerciceIdA2): string {
  if (e.A !== 0) return e.D !== 0 ? `x^2=${latexQ(q(-e.D, e.A))}x` : `x^2=${latexQ(q(-e.E, e.A))}y`;
  return e.E !== 0 ? `y^2=${latexQ(q(-e.E, e.B))}y` : `y^2=${latexQ(q(-e.D, e.B))}x`;
}
function groupeB(e: ExerciceIdB): string {
  const h = qNum(e.centre.x);
  const k = qNum(e.centre.y);
  const gx = h === 0 ? "x^2" : `x^2${-2 * h < 0 ? "" : "+"}${-2 * h}x`;
  const gy = k === 0 ? "y^2" : `y^2${-2 * k < 0 ? "" : "+"}${-2 * k}y`;
  return `${coefDevant(e.A)}\\left(${gx}\\right)${e.B < 0 ? "-" : "+"}${coefDevant(Math.abs(e.B))}\\left(${gy}\\right)=${-e.F}`;
}

const REGLE_NATURE = "Isole la constante, puis compare les signes. Coefficients des carrés de même signe : ellipse (cercle s'ils sont égaux) si le second membre a ce signe, un seul point s'il est nul, l'ensemble vide sinon. Coefficients de signes opposés : hyperbole, ou deux droites sécantes si le second membre est nul.";

function aides58(e: E, p: P): AideCombi[] {
  const c = e.conique;
  switch (p) {
    case "a1Nature":
      return [{ texte: REGLE_NATURE }, { texte: "Ici :", latex: isoleA1(e as Extract<E, { famille: "A1" }>) }];
    case "bNature":
      return [{ texte: REGLE_NATURE }, { texte: "La forme obtenue :", latex: formeB(e as ExerciceIdB) }];
    case "a2Nature":
      return [{ texte: "La variable au carré donne l'axe focal, celle du premier degré le sens d'ouverture. Si le terme du premier degré porte sur la même variable que le carré, factorise." }, { texte: "En isolant le carré :", latex: isoleA2(e as ExerciceIdA2) }];
    case "cNature":
      return [
        { texte: "Une racine carrée est positive : $v=k+m\\sqrt{\\ldots}$ ne donne que les points où $v\\geq k$. Le signe du carré sous la racine, une fois complété, distingue l'ellipse de l'hyperbole." },
        { texte: "La forme obtenue :", latex: formeC(e as ExerciceIdC) },
      ];
    case "a1Rayon":
      return [{ texte: "Divise par le coefficient commun des carrés :", latex: "x^2+y^2=r^2" }, { texte: "Ici :", latex: `x^2+y^2=${c?.type === "cercle" ? latexQ(c.r2) : ""}` }];
    case "a1Point":
    case "bPoint":
      return [{ texte: "Une somme de deux carrés de même signe n'est nulle que si chaque carré est nul." }, { texte: "Ici :", latex: e.famille === "B" ? formeB(e) : isoleA1(e as Extract<E, { famille: "A1" }>) }];
    case "a1Droites":
    case "bDroites":
      return [{ texte: "Une différence de deux carrés se factorise :", latex: "u^2-v^2=(u-v)(u+v)" }, { texte: "Ici :", latex: e.famille === "B" ? formeB(e) : isoleA1(e as Extract<E, { famille: "A1" }>) }];
    case "a2Droites":
      return [{ texte: "Mets la variable en évidence, puis annule chaque facteur :", latex: "v^2+mv=v(v+m)" }, { texte: "Ici :", latex: isoleA2(e as ExerciceIdA2) }];
    case "a1DemiAxes":
    case "bCentreDemiAxes":
    case "cElements": {
      const reg = c?.type === "hyperbole" ? "c^2=a^2+b^2" : "c^2=a^2-b^2";
      return [
        { texte: `Divise pour obtenir $1$ au second membre. Pour une ellipse, $a^2$ est le plus grand dénominateur ; pour une hyperbole, celui du carré précédé de « + ». ${p === "cElements" ? "" : "Ensuite :"}`, latex: p === "cElements" ? undefined : reg },
        { texte: e.famille === "A1" ? "Ici :" : "La forme obtenue :", latex: e.famille === "A1" ? isoleA1(e) : e.famille === "B" ? formeB(e) : formeC(e as ExerciceIdC) },
      ];
    }
    case "a1Foyers":
    case "bFoyers":
      return [
        { texte: c?.type === "hyperbole" ? "Les foyers sont sur l'axe focal, à la distance $c$ du centre. Asymptotes (axe focal horizontal, centre $\\Omega(h\\,;k)$) :" : "Les foyers sont sur l'axe focal, à la distance $c$ du centre.", latex: c?.type === "hyperbole" ? "y-k=\\pm\\frac{b}{a}(x-h)\\quad\\text{ou, axe focal vertical : }\\ y-k=\\pm\\frac{a}{b}(x-h)" : undefined },
        { texte: "Ici :", latex: c?.type === "ellipse" || c?.type === "hyperbole" ? `c=${latexRacine(c2Conique(c))},\\quad \\Omega${lp(c.centre)},\\quad\\text{axe focal ${c.axe === "x" ? "horizontal" : "vertical"}}` : undefined },
      ];
    case "a2P":
      return [{ texte: "Forme réduite du cours, $p>0$ :", latex: "y^2=2px,\\quad y^2=-2px,\\quad x^2=2py,\\quad x^2=-2py" }, { texte: "En isolant le carré :", latex: isoleA2(e as ExerciceIdA2) }];
    case "a2FoyerDirectrice":
      return [{ texte: "Pour $y^2=2px$ : le foyer est $F\\left(\\frac{p}{2}\\,;0\\right)$ et la directrice $d\\equiv x=-\\frac{p}{2}$ ; le foyer est du côté de l'ouverture." }, { texte: "Ici :", latex: c?.type === "parabole" ? `p=${latexQ(c.p)}` : "" }];
    case "bForme":
      return [{ texte: "Groupe les termes en $x$ et en $y$, mets le coefficient du carré en évidence, puis complète :", latex: "x^2+2hx=(x+h)^2-h^2" }, { texte: "Après regroupement :", latex: groupeB(e as ExerciceIdB) }];
    case "bCentreRayon":
      return [{ texte: "Divise par le coefficient commun :", latex: "(x-h)^2+(y-k)^2=r^2,\\quad \\Omega(h\\,;k)" }, { texte: "La forme obtenue :", latex: formeB(e as ExerciceIdB) }];
    case "cCarre": {
      const ec = e as ExerciceIdC;
      return [{ texte: "La racine est déjà isolée : élève les deux membres au carré.", latex: `(v-k)^2=m^2\\left(\\ldots\\right)` }, { texte: "Ici :", latex: `m=${mLatex(ec)},\\quad k=${ec.k}` }];
    }
    case "cForme": {
      const ec = e as ExerciceIdC;
      const s = ec.nature === "ellipse" ? -1 : 1;
      const v = ec.variableRacine;
      const carre = ec.h === 0 ? `${v}^2` : `(${v}${ec.h < 0 ? "+" : "-"}${Math.abs(ec.h)})^2`;
      return [{ texte: "Complète le carré sous la racine, puis regroupe les deux carrés dans le même membre." }, { texte: "Sous la racine :", latex: `${sousRacine(ec)}=${s < 0 ? "-" : ""}${carre}${s < 0 ? "+" : "-"}${ec.r * ec.r}` }];
    }
  }
}

function reponse58(e: E, p: P): string[] {
  const c = e.conique;
  switch (p) {
    case "a1Nature":
    case "bNature":
    case "a2Nature":
      return [`\\text{${LIBELLE_NATURE[e.famille === "A2" && e.orientation ? e.orientation : e.nature]}}`];
    case "cNature": {
      const ec = e as ExerciceIdC;
      const lib = libelleC(ec);
      const [t, m] = lib.split("$");
      return [`\\text{${t}}${m ?? ""}`];
    }
    case "a1Rayon":
      return c?.type === "cercle" ? [`r=${latexRacine(c.r2)}`] : [];
    case "bCentreRayon":
      return c?.type === "cercle" ? [`\\Omega${lp(c.centre)}`, `r=${latexRacine(c.r2)}`] : [];
    case "a1Point":
    case "bPoint":
      return [lp(e.point!)];
    case "a1Droites":
    case "bDroites":
    case "a2Droites":
      return e.droites.map(latexDroite);
    case "a1DemiAxes":
      return elementsLatex(c!);
    case "bCentreDemiAxes":
      return c?.type === "ellipse" || c?.type === "hyperbole" ? [`\\Omega${lp(c.centre)}`, ...elementsLatex(c)] : [];
    case "a1Foyers":
    case "bFoyers":
      return foyersLatex(c!);
    case "a2P":
      return c?.type === "parabole" ? [`p=${latexQ(c.p)}`] : [];
    case "a2FoyerDirectrice":
      return c?.type === "parabole" ? [nomPC("F", foyersConique(c)[0]), directriceLatex(c)] : [];
    case "bForme":
      return [formeB(e as ExerciceIdB)];
    case "cCarre":
      return [carreC(e as ExerciceIdC)];
    case "cForme":
      return [formeC(e as ExerciceIdC)];
    case "cElements":
      return c?.type === "ellipse" || c?.type === "hyperbole" ? [`\\Omega${lp(c.centre)}`, `a=${latexRacine(c.a2)}`, `b=${latexRacine(c.b2)}`] : [];
  }
}

function explicationNature(e: E): string[] {
  const lib = LIBELLE_NATURE[e.nature];
  switch (e.nature) {
    case "ellipse":
      return [`Les carrés ont des coefficients de même signe et le second membre a ce signe : c'est ${lib}${e.conique?.type === "ellipse" ? `, $${latexConique(e.conique)}$` : ""}.`, "Piège : si les deux coefficients étaient égaux, ce serait un cercle."];
    case "cercle":
      return [`Les coefficients de $x^2$ et de $y^2$ sont égaux et le second membre a leur signe : c'est ${lib}.`];
    case "hyperbole":
      return [`Les carrés ont des coefficients de signes opposés et le second membre n'est pas nul : c'est ${lib}${e.conique?.type === "hyperbole" ? `, $${latexConique(e.conique)}$` : ""}.`, "Piège : l'axe focal est celui du carré de même signe que le second membre."];
    case "point":
      return ["Deux carrés de même signe, second membre nul : chaque carré est nul, il reste un seul point.", "Piège : on ne divise jamais par une constante nulle."];
    case "vide":
      return ["Deux carrés de même signe ne peuvent pas égaler un nombre de signe contraire : aucun point ne convient, l'ensemble est vide."];
    case "droitesSecantes":
      return ["Coefficients de signes opposés et second membre nul : c'est une différence de deux carrés, qui se factorise en deux facteurs du premier degré : deux droites sécantes."];
    default:
      return [];
  }
}

function explication58(e: E, p: P): FragmentConsigne[][] {
  const c = e.conique;
  switch (p) {
    case "a1Nature":
      return L(`On isole la constante : $${isoleA1(e as Extract<E, { famille: "A1" }>)}$.`, ...explicationNature(e));
    case "bNature":
      return L(`Forme obtenue : $${formeB(e as ExerciceIdB)}$.`, ...explicationNature(e));
    case "a2Nature": {
      const ea = e as ExerciceIdA2;
      return ea.nature === "parabole"
        ? L(`En isolant le carré : $${isoleA2(ea)}$. Un carré et un terme du premier degré dans l'autre variable : une parabole. Le signe du second membre donne le sens d'ouverture : ${LIBELLE_NATURE[ea.orientation!]}.`)
        : L(`En isolant le carré : $${isoleA2(ea)}$. Le terme du premier degré porte sur la même variable : on factorise, et chaque facteur nul donne une droite parallèle à un axe.`);
    }
    case "cNature": {
      const ec = e as ExerciceIdC;
      return L(`Après élévation au carré et complétion : $${formeC(ec)}$ : ${ec.nature === "ellipse" ? "une ellipse" : "une hyperbole"}.`, `Mais la racine est positive : dans l'énoncé, $${ec.variableIsolee}${ec.signeRacine > 0 ? "\\geq" : "\\leq"}${ec.k}$. La courbe $\\Gamma$ est donc ${libelleC(ec).replace(/\$/g, "$")}.`, "Piège : élever au carré ajoute l'autre moitié, celle de l'autre signe devant la racine.");
    }
    case "a1Rayon":
      return c?.type === "cercle" ? L(`$x^2+y^2=${latexQ(c.r2)}$, donc $r=${latexRacine(c.r2)}$.`, "Piège : le second membre est $r^2$, pas $r$.") : [];
    case "bCentreRayon":
      return c?.type === "cercle" ? L(`$${latexConique(c)}$ : centre $\\Omega${lp(c.centre)}$ et $r=${latexRacine(c.r2)}$.`, "Piège : $(x-h)^2$ donne l'abscisse $h$, de signe opposé au nombre écrit.") : [];
    case "a1Point":
    case "bPoint":
      return L(`Chaque carré est nul : le seul point est $${lp(e.point!)}$.`);
    case "a1Droites":
    case "bDroites":
    case "a2Droites":
      return L(`On factorise, puis chaque facteur nul donne une droite : ${e.droites.map((d) => `$${latexDroite(d)}$`).join(" et ")}.`);
    case "a1DemiAxes":
    case "bCentreDemiAxes":
    case "cElements":
      if (c?.type !== "ellipse" && c?.type !== "hyperbole") return [];
      return L(
        `Forme réduite : $${latexConique(c)}$.`,
        `$a=${latexRacine(c.a2)}$, $b=${latexRacine(c.b2)}$${p === "cElements" ? "" : `, $c^2=${c.type === "ellipse" ? "a^2-b^2" : "a^2+b^2"}=${latexQ(c2Conique(c))}$, donc $c=${latexRacine(c2Conique(c))}$`}.`,
        c.type === "ellipse" ? "Piège : $a$ est toujours le demi-grand axe, sous le plus grand dénominateur — pas forcément sous $x^2$." : "Piège : pour une hyperbole, $c^2=a^2+b^2$, et $a$ est sous le carré précédé de « + ».",
      );
    case "a1Foyers":
    case "bFoyers":
      if (c?.type !== "ellipse" && c?.type !== "hyperbole") return [];
      return L(`Les foyers sont sur l'axe focal ${c.axe === "x" ? "horizontal" : "vertical"}, à la distance $c=${latexRacine(c2Conique(c))}$ du centre : ${foyersLatex(c).slice(0, 2).map((x) => `$${x}$`).join(" et ")}.`, ...(c.type === "hyperbole" ? [`Asymptotes : $${foyersLatex(c)[2]}$.`] : []));
    case "a2P":
      return c?.type === "parabole" ? L(`En isolant le carré : $${latexConique(c)}$. Le coefficient vaut $${c.sens > 0 ? "" : "-"}2p$, donc $p=${latexQ(c.p)}$.`, "Piège : le coefficient du second membre vaut $2p$, pas $p$ ni $4p$.") : [];
    case "a2FoyerDirectrice":
      return c?.type === "parabole" ? L(`Le foyer est à la distance $\\frac{p}{2}=${latexQ(q(c.p.n, c.p.d * 2n))}$ du sommet, du côté de l'ouverture : $${nomPC("F", foyersConique(c)[0])}$ ; la directrice est de l'autre côté : $${directriceLatex(c)}$.`) : [];
    case "bForme":
      return L(`On groupe et on complète : $${groupeB(e as ExerciceIdB)}$, d'où $${formeB(e as ExerciceIdB)}$.`, "Piège : en complétant, on ajoute le carré multiplié par le coefficient mis en évidence, des deux côtés.");
    case "cCarre":
      return L(`$${carreC(e as ExerciceIdC)}$ (les deux membres sont élevés au carré).`);
    case "cForme":
      return L(`On complète le carré sous la racine, puis on regroupe : $${formeC(e as ExerciceIdC)}$.`);
  }
}

// ---------------------------------------------------------------------------
// Messages ciblés
// ---------------------------------------------------------------------------

const pres = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));
function nombre(v: string): number | null {
  try {
    return lireNombre(v).valeur;
  } catch {
    return null;
  }
}

function cible58(e: E, p: P, v: string[]): FragmentConsigne[] | null {
  const c = e.conique;
  if ((p === "a1DemiAxes" || p === "bCentreDemiAxes" || p === "cElements") && (c?.type === "ellipse" || c?.type === "hyperbole")) {
    const o = p === "bCentreDemiAxes" || p === "cElements" ? 1 : 0;
    const a = nombre(v[o]);
    const b = nombre(v[o + 1]);
    const cc = p === "cElements" ? null : nombre(v[o + 2]);
    if (a !== null && b !== null && pres(a, Math.sqrt(qNum(c.b2))) && pres(b, Math.sqrt(qNum(c.a2))) && qNum(c.a2) !== qNum(c.b2)) return f(c.type === "ellipse" ? "$a$ est le demi-grand axe : c'est la racine du plus grand dénominateur." : "$a$ est sous le carré précédé de « + » (axe focal).");
    if (cc !== null && c.type === "ellipse" && pres(cc, Math.sqrt(qNum(c.a2) + qNum(c.b2)))) return f("Pour une ellipse, $c^2=a^2-b^2$.");
    if (cc !== null && c.type === "hyperbole" && qNum(c.a2) > qNum(c.b2) && pres(cc, Math.sqrt(qNum(c.a2) - qNum(c.b2)))) return f("Pour une hyperbole, $c^2=a^2+b^2$.");
    if (a !== null && pres(a, qNum(c.a2)) && qNum(c.a2) !== 1) return f("C'est $a^2$ : $a$ en est la racine carrée.");
  }
  if (p === "a2P" && c?.type === "parabole") {
    const x = nombre(v[0]);
    if (x !== null && pres(x, 2 * qNum(c.p))) return f("Le coefficient du second membre vaut $2p$ : $p$ en est la moitié.");
    if (x !== null && pres(x, qNum(c.p) / 2)) return f("Dans le cours, $y^2=2px$ : le coefficient vaut $2p$, pas $4p$.");
  }
  if (p === "a2FoyerDirectrice" && c?.type === "parabole") {
    try {
      const F = lirePoint(v[0]);
      const vrai = foyersConique(c)[0];
      const fx = F.x.valeur;
      const fy = F.y.valeur;
      const loin = c.axe === "x" ? pres(fx, vrai.x * 2) && pres(fy, vrai.y) : pres(fy, vrai.y * 2) && pres(fx, vrai.x);
      if (loin && qNum(c.p) !== 0) return f("Le foyer est à la distance $\\frac{p}{2}$ du sommet, pas $p$.");
    } catch {
      return null;
    }
  }
  if ((p === "a1Foyers" || p === "bFoyers") && (c?.type === "ellipse" || c?.type === "hyperbole")) {
    const lignes = v[0].split("\n").filter((l) => l.trim());
    try {
      const pts = lignes.map((l) => lirePoint(l));
      const F = foyersConique(c);
      const echanges = pts.length === 2 && pts.every((x) => F.some((g) => pres(x.x.valeur, g.y) && pres(x.y.valeur, g.x))) && !pts.every((x) => F.some((g) => pres(x.x.valeur, g.x) && pres(x.y.valeur, g.y)));
      if (echanges) return f(`Les foyers sont sur l'axe focal, ici ${c.axe === "x" ? "horizontal" : "vertical"}.`);
    } catch {
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Figure (tracée après la nature, qu'elle trahirait)
// ---------------------------------------------------------------------------

export function figure6gen58(e: E, closes: readonly P[]): string | null {
  const ferme = (ph: P) => closes.includes(ph);
  const natureJugee = ferme("a1Nature") || ferme("a2Nature") || ferme("bNature") || ferme("cNature");
  if (!natureJugee) return null;
  const o = objetsVides();
  const c = e.conique;
  const autres = e.point ? [p2(e.point)] : [];
  const centre = c && c.type !== "parabole" ? ptNum(c.centre) : e.famille === "B" ? ptNum(e.centre) : { x: 0, y: 0 };
  autres.push(centre);
  const fen = fenetreConique(c, autres.concat(e.droites.length ? [{ x: centre.x - 3, y: centre.y - 3 }, { x: centre.x + 3, y: centre.y + 3 }] : []));
  const etendue = Math.max(fen.xmax - fen.xmin, fen.ymax - fen.ymin);
  if (c) {
    if (e.famille === "C") {
      ajouterConique(o, c, etendue, { couleur: "gris", epais: false, pointilles: true });
      const ec = e;
      const garde = (pt: { x: number; y: number }) => {
        const v = ec.variableIsolee === "x" ? pt.x : pt.y;
        return ec.signeRacine > 0 ? v >= ec.k - 1e-9 : v <= ec.k + 1e-9;
      };
      const tmp = objetsVides();
      ajouterConique(tmp, c, etendue, { couleur: "bleu" });
      for (const courbe of tmp.courbes) {
        let morceau: { x: number; y: number }[] = [];
        for (const pt of courbe.pts) {
          if (garde(pt)) morceau.push(pt);
          else {
            if (morceau.length > 1) o.courbes.push({ ...courbe, pts: morceau });
            morceau = [];
          }
        }
        if (morceau.length > 1) o.courbes.push({ ...courbe, pts: morceau });
      }
    } else ajouterConique(o, c, etendue, { couleur: "bleu" });
  }
  if (e.point) o.points.push({ p: p2(e.point), nom: "Ω", couleur: "bleu" });
  for (const d of e.droites) o.droites.push({ ...d3(d), couleur: "bleu", epais: true });
  // Foyers, asymptotes, directrice : seulement APRÈS l'écran qui les demande ; centre après l'écran du centre.
  const foyers = ferme("a1Foyers") || ferme("bFoyers") || ferme("a2FoyerDirectrice");
  if (c && foyers && c.type !== "cercle") {
    const ancien = o.courbes.length;
    ajouterConique(o, c, etendue, { foyers: c.type === "parabole" ? ["F"] : true, asymptotes: true, directrices: c.type === "parabole" });
    o.courbes.splice(ancien);
  }
  const centreVu = ferme("bCentreDemiAxes") || ferme("bCentreRayon") || ferme("cElements") || ferme("a1DemiAxes") || ferme("a1Rayon");
  if (c && centreVu && c.type !== "parabole") o.points.push({ p: ptNum(c.centre), nom: "Ω", couleur: "encre" });
  o.fenetre = fen;
  return figureLieux(o);
}
