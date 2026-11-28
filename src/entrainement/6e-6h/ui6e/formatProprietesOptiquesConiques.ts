import type { ExerciceProprietesOptiquesConiques } from "../core6e/proprietesOptiquesConiques.types";
import type { PhaseProprietesOptiquesConiques } from "../moteur6e/typesProprietesOptiquesConiques";
import { latexDroite, latexPoint, latexQ, latexSomme, lireEquation, lirePoint, polyDroite, proportionnels, ptNum, q, qMul, qNum, qSub } from "../moteur6e/algebreLieux";
import { latexConique } from "../moteur6e/algebreConiques";
import { droiteParDeuxPoints } from "../moteur6e/algebreLieux";
import { f } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";
import { champDroiteUI, champPointUI } from "./textesLieux";
import { EXACT, L } from "./textesConiques";
import { figureLieux } from "./figureLieux";
import type { P2 } from "./figureLieux";
import { ajouterConique, fenetreConique, objetsVides } from "./traceConiques";

/**
 * Textes de `6gen63` — Propriétés optiques des coniques (6e ch. 10, § 6 ; audit, lots B et C). Valeurs
 * exactes à petits dénominateurs, propriété optique en vrai choix (passe par F′ / semble venir de F′ /
 * parallèle à l'axe / passe par F), consignes sans majuscules d'insistance, figure : rayon incident après
 * les foyers, rayon réfléchi (demi-droite) après la réponse.
 */

type E = ExerciceProprietesOptiquesConiques;
type P = PhaseProprietesOptiquesConiques;

const lq = latexQ;
const NOM = { ellipse: "l'ellipse", hyperbole: "l'hyperbole", parabole: "la parabole" } as const;

const OPTIONS_PROPRIETE = [
  { valeur: "passeParFp", label: "Le rayon réfléchi passe par l'autre foyer $F'$." },
  { valeur: "semblaVenirDeFp", label: "Le rayon réfléchi semble venir de l'autre foyer $F'$ : c'est son prolongement qui passe par $F'$." },
  { valeur: "paralleleAxe", label: "Le rayon réfléchi est parallèle à l'axe focal." },
  { valeur: "passeParF", label: "Le rayon réfléchi passe par le foyer $F$." },
];

/** Réponse courte (rappel « Ce qu'on sait déjà » : une formule KaTeX ne passe pas à la ligne). */
const REPONSE_PROPRIETE: Record<string, string> = {
  passeParFp: "\\text{passe par }F'",
  semblaVenirDeFp: "\\text{semble venir de }F'",
  paralleleAxe: "\\text{parallèle à l'axe focal}",
  passeParF: "\\text{passe par }F",
};

const droiteIncidente = (e: E) => `y=${latexSomme([
  [e.m, "x"],
  [qSub(e.R.y, qMul(e.m, e.R.x)), ""],
])}`;
const sensTexte = (e: E) => (e.sens > 0 ? "vers la droite (abscisses croissantes)" : "vers la gauche (abscisses décroissantes)");

function reflechiLatex(e: E): string {
  const d = e.reflechi;
  if (d.a === 0n) return `y=${lq(q(-d.c, d.b))}`;
  if (d.b === 0n) return `x=${lq(q(-d.c, d.a))}`;
  const m = q(-d.a, d.b);
  const k = q(-d.c, d.b);
  return `y=${latexSomme([
    [m, "x"],
    [k, ""],
  ])}`;
}

export const FORMAT_6GEN63: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    const debut = `Un miroir a la forme de ${NOM[e.famille]} $\\Gamma$ ci-dessous.`;
    const rayon =
      e.mode === "parallele"
        ? ` Un rayon lumineux arrive parallèlement à l'axe focal, le long de la droite $y=${lq(e.R.y)}$, en venant de la droite.`
        : e.famille === "parabole"
          ? ` Un rayon lumineux part du foyer $F$ ${sensTexte(e)}, en suivant une droite de pente $${lq(e.m)}$.`
          : ` Un rayon lumineux part du foyer $F$ d'abscisse négative, ${sensTexte(e)}, en suivant une droite de pente $${lq(e.m)}$.`;
    return f(`${debut}${rayon} Il se réfléchit sur $\\Gamma$ au point $R$. Détermine le trajet du rayon après la réflexion.` + EXACT);
  },
  donnees: (e) => [f(`$\\Gamma\\,:\\ ${latexConique(e.conique)}$`)],
  consigneEcran(e, p) {
    switch (p) {
      case "foyers":
        return e.Fp ? f("Donne les coordonnées des foyers : $F$ (abscisse négative) et $F'$.") : f("Donne les coordonnées du foyer $F$ de la parabole.");
      case "impact":
        return f("Calcule les coordonnées du point $R$ où le rayon atteint le miroir.");
      case "propriete":
        return f("Que fait le rayon après la réflexion en $R$ ?");
      case "reflechi":
        return f("Écris une équation de la droite qui porte le rayon réfléchi.");
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "foyers":
        return e.Fp ? [champPointUI("$F$"), champPointUI("$F'$")] : [champPointUI("$F$")];
      case "impact":
        return [champPointUI("$R$")];
      case "propriete":
        return [{ type: "choix", label: "", options: OPTIONS_PROPRIETE }];
      case "reflechi":
        return [champDroiteUI("Droite du rayon réfléchi")];
    }
  },
  aides: aides63,
  reponseAttendue: reponse63,
  explication: explication63,
  libellePhase: (_e, p) => LIBELLES[p],
  messageCible: cible63,
};

const LIBELLES: Record<P, string> = {
  foyers: "Foyers",
  impact: "Point d'impact R",
  propriete: "Propriété optique",
  reflechi: "Rayon réfléchi",
};

function aides63(e: E, p: P): AideCombi[] {
  const c = e.conique;
  switch (p) {
    case "foyers":
      if (c.type === "parabole") return [{ texte: "Pour $y^2=2px$, le foyer est $F\\left(\\frac{p}{2}\\,;0\\right)$." }, { texte: "Ici :", latex: `2p=${lq(qMul(q(2), c.p))}` }];
      return [{ texte: "Les foyers sont sur l'axe focal, à la distance $c$ du centre :", latex: c.type === "ellipse" ? "c^2=a^2-b^2" : "c^2=a^2+b^2" }, { texte: "Ici :", latex: c.type === "ellipse" || c.type === "hyperbole" ? `a^2=${lq(c.a2)},\\quad b^2=${lq(c.b2)}` : "" }];
    case "impact":
      if (e.mode === "parallele") return [{ texte: "Le point d'impact est sur la droite du rayon et sur $\\Gamma$." }, { texte: "Ici :", latex: `y=${lq(e.R.y)}` }];
      return [{ texte: "Écris la droite du rayon (elle passe par $F$, pente donnée), remplace $y$ dans l'équation de $\\Gamma$ et résous : garde le point atteint dans le sens de propagation." }, { texte: "La droite du rayon :", latex: droiteIncidente(e) }];
    case "propriete":
      return [{ texte: "Propriétés optiques du cours (point 6) : ellipse, un rayon issu d'un foyer ; hyperbole, un rayon issu d'un foyer ; parabole, un rayon issu du foyer ou parallèle à l'axe." }, { texte: e.famille === "parabole" ? (e.mode === "parallele" ? "Ici, le rayon arrive parallèlement à l'axe d'une parabole." : "Ici, le rayon part du foyer d'une parabole.") : `Ici, le rayon part d'un foyer de ${NOM[e.famille]}.` }];
    case "reflechi":
      return [{ texte: "Le rayon réfléchi est porté par la droite qui passe par $R$ et par le point de la propriété ($F'$ ou $F$), ou bien il est parallèle à l'axe." }, { texte: "Ici :", latex: `R${latexPoint(e.R)}${e.Fp ? `,\\quad F'${latexPoint(e.Fp)}` : `,\\quad F${latexPoint(e.F)}`}` }];
  }
}

function reponse63(e: E, p: P): string[] {
  switch (p) {
    case "foyers":
      return e.Fp ? [`F${latexPoint(e.F)}`, `F'${latexPoint(e.Fp)}`] : [`F${latexPoint(e.F)}`];
    case "impact":
      return [`R${latexPoint(e.R)}`];
    case "propriete":
      return [REPONSE_PROPRIETE[e.propriete]];
    case "reflechi":
      return [reflechiLatex(e)];
  }
}

function explication63(e: E, p: P): FragmentConsigne[][] {
  const c = e.conique;
  switch (p) {
    case "foyers":
      if (c.type === "parabole") return L(`$2p=${lq(qMul(q(2), c.p))}$, donc $p=${lq(c.p)}$ et $F${latexPoint(e.F)}$.`, "Piège : le foyer est à la distance $\\frac{p}{2}$ du sommet.");
      return L(`$c^2=${c.type === "ellipse" ? "a^2-b^2" : "a^2+b^2"}=${Math.round(qNum(e.Fp!.x) ** 2)}$, donc $F${latexPoint(e.F)}$ et $F'${latexPoint(e.Fp!)}$.`);
    case "impact":
      if (e.mode === "parallele") return L(`On remplace $y=${lq(e.R.y)}$ dans l'équation : $R${latexPoint(e.R)}$.`);
      return L(`La droite du rayon, $${droiteIncidente(e)}$, coupe $\\Gamma$ en $R${latexPoint(e.R)}$ et en $${latexPoint(e.autre!)}$.`, `Le rayon part de $F$ ${sensTexte(e)} : il atteint d'abord $R$.`, "Piège : l'autre point est sur la même droite, mais pas sur le trajet du rayon.");
    case "propriete":
      if (e.propriete === "passeParFp") return L("Ellipse : tout rayon issu d'un foyer se réfléchit en passant par l'autre foyer.");
      if (e.propriete === "semblaVenirDeFp") return L("Hyperbole : un rayon issu d'un foyer se réfléchit comme s'il venait de l'autre foyer $F'$ ; il s'éloigne de $F'$, et c'est son prolongement qui passe par $F'$.");
      if (e.propriete === "paralleleAxe") return L("Parabole : un rayon issu du foyer se réfléchit parallèlement à l'axe focal (principe du phare).");
      return L("Parabole : un rayon parallèle à l'axe se réfléchit en passant par le foyer (principe de l'antenne parabolique).");
    case "reflechi":
      return L(
        `Le rayon réfléchi est porté par $${reflechiLatex(e)}$, soit $${latexDroite(e.reflechi)}$.`,
        e.propriete === "semblaVenirDeFp" ? "C'est une demi-droite d'origine $R$, du côté opposé à $F'$." : e.propriete === "passeParFp" ? "C'est la demi-droite d'origine $R$ qui passe par $F'$." : "C'est une demi-droite d'origine $R$.",
      );
  }
}

function cible63(e: E, p: P, v: string[]): FragmentConsigne[] | null {
  const pres = (a: number, b: number) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));
  if (p === "impact" && e.autre) {
    try {
      const R = lirePoint(v[0]);
      if (pres(R.x.valeur, qNum(e.autre.x)) && pres(R.y.valeur, qNum(e.autre.y))) return f(`Ce point est bien sur la droite du rayon, mais le rayon part de $F$ ${sensTexte(e)} : il ne l'atteint pas.`);
    } catch {
      return null;
    }
  }
  if (p === "foyers" && e.conique.type === "parabole") {
    try {
      const F = lirePoint(v[0]);
      if (pres(F.x.valeur, 2 * qNum(e.F.x))) return f("Le foyer est à la distance $\\frac{p}{2}$ du sommet, pas $p$.");
    } catch {
      return null;
    }
  }
  if (p === "reflechi") {
    try {
      const poly = lireEquation(v[0], ["x", "y"]).poly;
      const tangenteLike = e.Fp ? droiteParDeuxPoints(e.R, e.F) : null;
      if (tangenteLike && proportionnels(poly, polyDroite(tangenteLike))) return f("C'est la droite du rayon incident : le rayon réfléchi passe par l'autre foyer (ou son prolongement).");
    } catch {
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Figure
// ---------------------------------------------------------------------------

export function figure6gen63(e: E, closes: readonly P[]): string {
  const o = objetsVides();
  const c = e.conique;
  const F = ptNum(e.F);
  const R = ptNum(e.R);
  const pts: P2[] = [F, R, ...(e.Fp ? [ptNum(e.Fp)] : [])];
  const fen = fenetreConique(c, pts);
  const ext = Math.max(fen.xmax - fen.xmin, fen.ymax - fen.ymin);
  ajouterConique(o, c, ext, { couleur: "bleu" });
  const loin = (o2: P2, u: P2) => {
    const n = Math.hypot(u.x, u.y) || 1;
    return { x: o2.x + (u.x / n) * ext * 3, y: o2.y + (u.y / n) * ext * 3 };
  };
  if (closes.includes("foyers")) {
    o.points.push({ p: F, nom: "F", couleur: "accent" });
    if (e.Fp) o.points.push({ p: ptNum(e.Fp), nom: "F′", couleur: "accent" });
    // Rayon incident : de F vers R (ou depuis la droite pour un rayon parallèle à l'axe).
    if (e.mode === "parallele") o.courbes.push({ pts: [loin(R, { x: 1, y: 0 }), R], couleur: "accent", epais: true, coupe: true });
    else if (closes.includes("impact")) o.segments.push({ a: F, b: R, couleur: "accent", epais: true });
    else o.courbes.push({ pts: [F, loin(F, { x: e.sens, y: e.sens * qNum(e.m) })], couleur: "accent", epais: true, coupe: true });
  }
  if (closes.includes("impact")) o.points.push({ p: R, nom: "R" });
  else if (closes.includes("foyers")) o.points.push({ p: R, nom: "?", couleur: "vert" });
  if (closes.includes("reflechi")) {
    if (e.propriete === "passeParFp") o.courbes.push({ pts: [R, loin(R, { x: qNum(e.Fp!.x) - R.x, y: qNum(e.Fp!.y) - R.y })], couleur: "vert", epais: true, coupe: true });
    else if (e.propriete === "semblaVenirDeFp") {
      const Fp = ptNum(e.Fp!);
      o.courbes.push({ pts: [R, loin(R, { x: R.x - Fp.x, y: R.y - Fp.y })], couleur: "vert", epais: true, coupe: true });
      o.segments.push({ a: R, b: Fp, couleur: "gris", pointilles: true });
    } else if (e.propriete === "paralleleAxe") o.courbes.push({ pts: [R, loin(R, { x: 1, y: 0 })], couleur: "vert", epais: true, coupe: true });
    else o.courbes.push({ pts: [R, loin(R, { x: F.x - R.x, y: F.y - R.y })], couleur: "vert", epais: true, coupe: true });
  }
  o.fenetre = fen;
  return figureLieux(o);
}
