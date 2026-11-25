import type { DonneesGeneratrices, ExerciceMethodeGeneratrices, MorceauLieu, OptionRestrictionLieu } from "../../core6e/methodeGeneratrices.types";
import { latexN, lireEquation, melanger, q, latexQ, tirerEntier, tirerParmi } from "../../moteur6e/algebreLieux";
import type { Poly } from "../../moteur6e/algebreLieux";

/**
 * `6gen57` — méthode des génératrices (6e ch. 9, § 5 ; audit, lots B et C). Corrections de l'audit :
 * D2 attend y(3x − b − c) = 0 (facteur y singulier, point ((b+c)/3 ; 0) exclu ; G18, G19) ; C : cercle
 * privé de (2k ; 0), domaine et référence de α dans l'énoncé ; « parasite » devient une vraie réponse
 * (E par produit en croix, ajoutée en fin de catalogue) ; options de restriction de même forme,
 * mélangées ; variété élargie (A, B, C, D, E à plusieurs paramètres et positions).
 */

/** Polynôme d'une équation écrite au clavier (construction interne seulement). */
function P(texte: string, parametre: "α" | "t" = "α"): Poly {
  return lireEquation(texte, ["x", "y", parametre]).poly;
}
const s = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const pt = (x: number, y: number) => `\\left(${latexN(x)}\\,;${latexN(y)}\\right)`;
/** « x − 3 », « x + 2 », « x » en KaTeX. */
const moins = (v: string, n: number) => (n === 0 ? v : n > 0 ? `${v}-${n}` : `${v}+${-n}`);

function options(correcte: string, autres: string[]): { optionsRestriction: OptionRestrictionLieu[]; idRestrictionCorrecte: string } {
  const toutes = [{ id: "r0", label: correcte }, ...autres.map((label, i) => ({ id: `r${i + 1}`, label }))];
  return { optionsRestriction: melanger(toutes), idRestrictionCorrecte: "r0" };
}

function optionsDroite(correct: "entiere" | "privee" | "ouvert", eq: string, P0: string, P1: string, P2: string) {
  const libelles = {
    entiere: `la droite $${eq}$ entière`,
    privee: `la droite $${eq}$ privée du point $${P0}$`,
    ouvert: `le segment ouvert d'extrémités $${P1}$ et $${P2}$ (extrémités exclues)`,
    ferme: `le segment fermé d'extrémités $${P1}$ et $${P2}$ (extrémités comprises)`,
  };
  const ordre = ["entiere", "privee", "ouvert", "ferme"] as const;
  return { ...options(libelles[correct], ordre.filter((k) => k !== correct).map((k) => libelles[k])), restrictionLatex: libelles[correct] };
}

export function construireFamilleA(b = tirerEntier(2, 8), d = tirerEntier(2, 8)): ExerciceMethodeGeneratrices {
  const donnees: DonneesGeneratrices = { famille: "A", b, d };
  const morceaux: MorceauLieu[] = [
    { latex: "y=0", statut: "singulier" },
    { latex: `x=${latexQ(q(b, 2))}`, statut: "propre" },
  ];
  return {
    donnees,
    parametre: "α",
    noms: ["(AY)", "(BZ)"],
    generatrices: [P(`αx-${b}y=0`), P(`α(x-${b})+${b}y=0`)],
    generatricesLatex: [`\\alpha x-${b}y=0`, `\\alpha(x-${b})+${b}y=0`],
    elimine: P(`y(2x-${b})=0`),
    elimineTexte: `y(2x-${b})=0`,
    elimineLatex: `y(2x-${b})=0`,
    facteurs: 2,
    morceaux,
    ...optionsDroite("ouvert", `x=${latexQ(q(b, 2))}`, pt(b / 2, d / 2), pt(b / 2, 0), pt(b / 2, d / 2)),
  };
}

export function construireFamilleB(a = tirerEntier(2, 7), c = tirerEntier(2, 7)): ExerciceMethodeGeneratrices {
  const propre = `${2 * a}x+${c}y-${a * c}=0`;
  return {
    donnees: { famille: "B", a, c },
    parametre: "α",
    noms: ["(BE)", "(CD)"],
    generatrices: [P(`α(${a}x+${c}y)=${a * c}y`), P(`α(${c}-x)=${c}y`)],
    generatricesLatex: [`\\alpha(${a}x+${c}y)=${a * c}y`, `\\alpha(${c}-x)=${c}y`],
    elimine: P(`y(${2 * a}x+${c}y-${a * c})=0`),
    elimineTexte: `y(${2 * a}x+${c}y-${a * c})=0`,
    elimineLatex: `y(${2 * a}x+${c}y-${a * c})=0`,
    facteurs: 2,
    morceaux: [
      { latex: "y=0", statut: "singulier" },
      { latex: propre, statut: "propre" },
    ],
    ...optionsDroite("ouvert", propre, pt(c / 2, 0), pt(c / 2, 0), pt(0, a)),
  };
}

export function construireFamilleC(h = tirerEntier(-2, 2), k = tirerEntier(2, 6)): ExerciceMethodeGeneratrices {
  const X = moins("x", h);
  const Xk = moins("x", h + k);
  const cercle = `(${moins("x", h + k)})^2+y^2=${k * k}`;
  // α ∈ ]0° ; 90°[ (aligné sur le cours réécrit) : P = (h + 2k/(1+t²) ; 2kt/(1+t²)), y > 0.
  const correcte = `le demi-cercle de $${cercle}$ situé au-dessus de $(AB)$, privé de ses extrémités`;
  return {
    donnees: { famille: "C", h, k },
    parametre: "t",
    noms: ["a", "b"],
    generatrices: [P(`y=t(x-${s(h)})`, "t"), P(`(1-t^2)y=2t(x-${s(h + k)})`, "t")],
    generatricesLatex: [`y=t(${X})`, `(1-t^2)\\,y=2t(${Xk})`],
    elimine: P(`y((x-${s(h)})^2+y^2-${2 * k}(x-${s(h)}))=0`),
    elimineTexte: `y((x-${s(h)})^2+y^2-${2 * k}(x-${s(h)}))=0`,
    elimineLatex: `y\\left((${X})^2+y^2-${2 * k}(${X})\\right)=0`,
    facteurs: 2,
    morceaux: [
      { latex: "y=0", statut: "parasite" },
      { latex: cercle, statut: "propre" },
    ],
    ...options(correcte, [`le cercle $${cercle}$ entier`, `le cercle $${cercle}$ privé du point $${pt(h + 2 * k, 0)}$`, `le demi-cercle de $${cercle}$ situé au-dessus de $(AB)$, extrémités comprises`]),
    restrictionLatex: correcte,
  };
}

export function construireSousCas1(c = tirerEntier(2, 7), h = tirerParmi([2, 3, 4, 5, 6, 9])): ExerciceMethodeGeneratrices {
  const propre = `y=${latexQ(q(h, 3))}`;
  return {
    donnees: { famille: "D", sousCas: 1, c, h },
    parametre: "α",
    noms: ["(BN)", "(CM)"],
    generatrices: [P(`${h}x=(α+${c})y`), P(`${h}(x-${c})=(α-${2 * c})y`)],
    generatricesLatex: [`${h}x=(\\alpha+${c})\\,y`, `${h}(x-${c})=(\\alpha-${2 * c})\\,y`],
    elimine: P(`3y-${h}=0`),
    elimineTexte: `3y-${h}=0`,
    elimineLatex: `${c}(3y-${h})=0`,
    facteurs: 1,
    morceaux: [{ latex: propre, statut: "propre" }],
    ...optionsDroite("entiere", propre, pt(c / 3, h / 3), pt(0, h / 3), pt(c, h / 3)),
  };
}

export function construireSousCas2(): ExerciceMethodeGeneratrices {
  let b = 0;
  let c = 0;
  while (b === c || b === 0 || c === 0 || c === 2 * b || b === 2 * c) {
    b = tirerEntier(-4, 7);
    c = tirerEntier(-4, 7);
  }
  const x0 = (b + c) / 3;
  const propre = `x=${latexN(x0)}`;
  return {
    donnees: { famille: "D", sousCas: 2, b, c },
    parametre: "α",
    noms: ["(BN)", "(CM)"],
    generatrices: [P(`α(x-${s(b)})=(${c - 2 * b})y`), P(`α(x-${s(c)})=(${b - 2 * c})y`)],
    generatricesLatex: [`\\alpha(${moins("x", b)})=${c - 2 * b === 1 ? "" : c - 2 * b === -1 ? "-" : c - 2 * b}y`, `\\alpha(${moins("x", c)})=${b - 2 * c === 1 ? "" : b - 2 * c === -1 ? "-" : b - 2 * c}y`],
    elimine: P(`y(3x-${s(b + c)})=0`),
    elimineTexte: `y(3x-${s(b + c)})=0`,
    elimineLatex: `${s(c - b)}\\,y\\,(${moins("3x", b + c)})=0`,
    facteurs: 2,
    morceaux: [
      { latex: "y=0", statut: "singulier" },
      { latex: propre, statut: "propre" },
    ],
    ...optionsDroite("privee", propre, pt(x0, 0), pt(x0, -Math.abs(b)), pt(x0, Math.abs(c))),
  };
}

export function construireFamilleD() {
  return tirerParmi([construireSousCas1, construireSousCas2] as const)();
}

export function construireFamilleE(methode: "soustraction" | "produitCroise" = "soustraction"): ExerciceMethodeGeneratrices {
  let p = 0;
  let r = 0;
  while (p === r || p === 0 || r === 0 || p + r === 0) {
    p = tirerEntier(-4, 5);
    r = tirerEntier(-4, 5);
  }
  const propre = `x=${p + r}`;
  const pc = methode === "produitCroise";
  const lin = (n: number) => `${n === 1 ? "" : n === -1 ? "-" : n}(${moins("x", n)})`;
  return {
    donnees: { famille: "E", methode, p, r },
    parametre: "α",
    noms: ["a", "b"],
    generatrices: [P(`αy=${s(p)}(x-${s(p)})`), P(`αy=${s(r)}(x-${s(r)})`)],
    generatricesLatex: [`\\alpha y=${lin(p)}`, `\\alpha y=${lin(r)}`],
    elimine: pc ? P(`y(x-${s(p + r)})=0`) : P(`x-${s(p + r)}=0`),
    elimineTexte: pc ? `y(x-${s(p + r)})=0` : `x-${s(p + r)}=0`,
    elimineLatex: pc ? `${s(p - r)}\\,y\\,(${moins("x", p + r)})=0` : `${s(p - r)}(${moins("x", p + r)})=0`,
    facteurs: pc ? 2 : 1,
    morceaux: pc
      ? [
          { latex: "y=0", statut: "parasite" },
          { latex: propre, statut: "propre" },
        ]
      : [{ latex: propre, statut: "propre" }],
    ...optionsDroite("privee", propre, pt(p + r, 0), pt(p + r, -Math.abs(p)), pt(p + r, Math.abs(r))),
  };
}

export type IdVarianteMethodeGeneratrices = "A" | "B" | "C" | "D_sousCas1" | "D_sousCas2" | "E" | "E_produitCroise";

/** Catalogue : identifiants et ordre d'avant gardés, « E_produitCroise » ajouté EN FIN. */
export const CATALOGUE_VARIANTES: { id: IdVarianteMethodeGeneratrices; label: string }[] = [
  { id: "A", label: "A — Parallélogramme" },
  { id: "B", label: "B — Triangle et céviennes parallèles" },
  { id: "C", label: "C — Angles α et 2α" },
  { id: "D_sousCas1", label: "D — Centre de gravité, A sur une parallèle à (BC)" },
  { id: "D_sousCas2", label: "D — Centre de gravité, A sur l'axe des ordonnées" },
  { id: "E", label: "E — Perpendiculaires variables (soustraction)" },
  { id: "E_produitCroise", label: "E — Perpendiculaires variables (produit en croix)" },
];

export function construireAvecVarianteId(id: string): ExerciceMethodeGeneratrices {
  switch (id as IdVarianteMethodeGeneratrices) {
    case "A":
      return construireFamilleA();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
    case "D_sousCas1":
      return construireSousCas1();
    case "D_sousCas2":
      return construireSousCas2();
    case "E":
      return construireFamilleE("soustraction");
    default:
      return construireFamilleE("produitCroise");
  }
}

export function genererExerciceMethodeGeneratrices(): ExerciceMethodeGeneratrices {
  const famille = tirerParmi(["A", "B", "C", "D", "E"] as const);
  if (famille === "D") return construireFamilleD();
  if (famille === "E") return construireFamilleE(Math.random() < 0.5 ? "soustraction" : "produitCroise");
  return construireAvecVarianteId(famille);
}
