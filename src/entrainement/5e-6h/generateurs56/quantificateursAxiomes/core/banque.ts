import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { ent, melanger, parmi } from "../../communReels/outilsReels";
import type { EnonceQuantifie, EtapeCalcul, IdAxiome, LigneJustif, OptionNegation } from "./types";

/**
 * Banques de `56gen17` : prédicats P(x ; y) (avec leurs deux ordres de quantificateurs, leur vérité,
 * le témoin ou le contre-exemple ligne à ligne), énoncés à un quantificateur, négations, et gabarits de
 * calculs justifiés par les axiomes du cours (tableaux de l'étape 3). Valeurs recalculées depuis les
 * paramètres tirés.
 */

const L = (latex: string, justification?: string): LigneJustif => (justification ? { latex, justification } : { latex });
const R = "\\mathbb{R}";
const N = "\\mathbb{N}";

interface Predicat {
  cle: string;
  ensX: string;
  ensY: string;
  p: string;
  np: string;
  /** ∀x ∃y : P */
  ae: { vrai: boolean; lignes: LigneJustif[]; raison: Frag[] };
  /** ∃y ∀x : P */
  ea: { vrai: boolean; lignes: LigneJustif[]; raison: Frag[] };
}

const moinsX = (c: number) => (c === 0 ? "-x" : `${c}-x`);
const moinsY = (c: number) => (c === 0 ? "-y" : `${c}-y`);

function predicats(): Predicat[] {
  const a = ent(1, 5);
  const c = ent(-6, 6);
  return [
    {
      cle: "plusGrand",
      ensX: R,
      ensY: R,
      p: `y>x+${a}`,
      np: `y\\leq x+${a}`,
      ae: { vrai: true, lignes: [L(`y=x+${a + 1}`, "y choisi après x, il peut dépendre de x"), L(`x+${a + 1}>x+${a}`, "vrai pour tout réel x")], raison: [tx("Pour chaque x, le réel "), lx(`y=x+${a + 1}`), tx(" convient : l'énoncé est vrai.")] },
      ea: { vrai: false, lignes: [L("x=y", "on teste ce x, le même y devant convenir pour tous"), L(`y>y+${a}`, `faux, car ${a} > 0`)], raison: [tx("Un même y devrait dépasser "), lx(`x+${a}`), tx(" pour tout x ; avec "), lx("x=y"), tx(", c'est faux : l'énoncé est faux.")] },
    },
    {
      cle: "somme",
      ensX: R,
      ensY: R,
      p: `x+y=${c}`,
      np: `x+y\\neq ${c}`,
      ae: { vrai: true, lignes: [L(`y=${moinsX(c)}`, "y choisi après x"), L(`x+(${moinsX(c)})=${c}`, "vrai pour tout réel x")], raison: [tx("Pour chaque x, "), lx(`y=${moinsX(c)}`), tx(" convient : l'énoncé est vrai.")] },
      ea: { vrai: false, lignes: [L(`x=${moinsY(c)}`, `donne x + y = ${c}`), L(`x=${moinsY(c + 1)}`, `donne x + y = ${c + 1}, pas ${c}`)], raison: [tx("Un même y ne peut pas convenir pour deux valeurs différentes de x : l'énoncé est faux.")] },
    },
    {
      cle: "neutreProduit",
      ensX: R,
      ensY: R,
      p: "x\\cdot y=x",
      np: "x\\cdot y\\neq x",
      ae: { vrai: true, lignes: [L("y=1", "pour chaque x"), L("x\\cdot 1=x", "1 est neutre pour la multiplication")], raison: [lx("y=1"), tx(" convient pour chaque x : l'énoncé est vrai.")] },
      ea: { vrai: true, lignes: [L("y=1", "le même y pour tous les x"), L("x\\cdot 1=x", "pour tout réel x")], raison: [tx("Le même "), lx("y=1"), tx(" convient pour tous les x : l'énoncé est vrai.")] },
    },
    {
      cle: "neutreSomme",
      ensX: R,
      ensY: R,
      p: "x+y=x",
      np: "x+y\\neq x",
      ae: { vrai: true, lignes: [L("y=0", "pour chaque x"), L("x+0=x", "0 est neutre pour l'addition")], raison: [lx("y=0"), tx(" convient pour chaque x : l'énoncé est vrai.")] },
      ea: { vrai: true, lignes: [L("y=0", "le même y pour tous les x"), L("x+0=x", "pour tout réel x")], raison: [tx("Le même "), lx("y=0"), tx(" convient pour tous les x : l'énoncé est vrai.")] },
    },
    {
      cle: "produitNul",
      ensX: R,
      ensY: R,
      p: "x\\cdot y=0",
      np: "x\\cdot y\\neq 0",
      ae: { vrai: true, lignes: [L("y=0", "pour chaque x"), L("x\\cdot 0=0", "un produit dont un facteur est nul est nul")], raison: [lx("y=0"), tx(" convient pour chaque x : l'énoncé est vrai.")] },
      ea: { vrai: true, lignes: [L("y=0", "le même y pour tous les x"), L("x\\cdot 0=0", "pour tout réel x")], raison: [tx("Le même "), lx("y=0"), tx(" convient pour tous les x : l'énoncé est vrai.")] },
    },
    {
      cle: "carre",
      ensX: R,
      ensY: R,
      p: `y^{2}=x+${a}`,
      np: `y^{2}\\neq x+${a}`,
      ae: { vrai: false, lignes: [L(`x=-${a + 1}`, "contre-exemple"), L("y^{2}=-1", "impossible : un carré n'est jamais négatif")], raison: [tx("Pour "), lx(`x=-${a + 1}`), tx(", aucun y ne convient : l'énoncé est faux.")] },
      ea: { vrai: false, lignes: [L(`x=-${a + 1}`, "quel que soit y"), L("y^{2}\\neq -1", "un carré n'est jamais négatif")], raison: [tx("Quel que soit y, le réel "), lx(`x=-${a + 1}`), tx(" le met en défaut : l'énoncé est faux.")] },
    },
    {
      cle: "carreMajore",
      ensX: R,
      ensY: R,
      p: "x^{2}\\leq y",
      np: "x^{2}>y",
      ae: { vrai: true, lignes: [L("y=x^{2}", "y choisi après x"), L("x^{2}\\leq x^{2}", "≤ est réflexive")], raison: [tx("Pour chaque x, "), lx("y=x^{2}"), tx(" convient : l'énoncé est vrai.")] },
      ea: { vrai: false, lignes: [L("x=\\left|y\\right|+1", "on teste ce x"), L("x^{2}\\geq\\left|y\\right|+1", "car x ≥ 1"), L("\\left|y\\right|+1>y", "car |y| ≥ y")], raison: [tx("Aucun y ne majore tous les carrés : avec "), lx("x=\\left|y\\right|+1"), tx(", "), lx("x^{2}>y"), tx(". L'énoncé est faux.")] },
    },
    {
      cle: "inverse",
      ensX: R,
      ensY: R,
      p: "x\\cdot y=1",
      np: "x\\cdot y\\neq 1",
      ae: { vrai: false, lignes: [L("x=0", "contre-exemple"), L("0\\cdot y=0\\neq 1", "pour tout réel y")], raison: [tx("Pour "), lx("x=0"), tx(", aucun y ne convient : l'énoncé est faux.")] },
      ea: { vrai: false, lignes: [L("x=0", "quel que soit y"), L("0\\cdot y=0\\neq 1")], raison: [tx("Quel que soit y, "), lx("x=0"), tx(" le met en défaut : l'énoncé est faux.")] },
    },
    {
      cle: "inverseR0",
      ensX: `${R}_0`,
      ensY: `${R}_0`,
      p: "x\\cdot y=1",
      np: "x\\cdot y\\neq 1",
      ae: { vrai: true, lignes: [L("y=\\dfrac{1}{x}", "existe car x ≠ 0"), L("x\\cdot\\dfrac{1}{x}=1", "inverse de x")], raison: [tx("Pour chaque réel non nul x, son inverse convient : l'énoncé est vrai.")] },
      ea: { vrai: false, lignes: [L("1\\cdot y=1", "avec x = 1 : y devrait valoir 1"), L("2\\cdot 1=2\\neq 1", "avec x = 2 : faux")], raison: [tx("Un même y ne peut pas être l'inverse de 1 et de 2 : l'énoncé est faux.")] },
    },
    {
      cle: "plusPetit",
      ensX: R,
      ensY: R,
      p: "y<x",
      np: "y\\geq x",
      ae: { vrai: true, lignes: [L("y=x-1", "y choisi après x"), L("x-1<x", "vrai pour tout réel x")], raison: [tx("Pour chaque x, "), lx("y=x-1"), tx(" convient : l'énoncé est vrai.")] },
      ea: { vrai: false, lignes: [L("x=y", "on teste ce x"), L("y<y", "faux")], raison: [tx("Avec "), lx("x=y"), tx(", "), lx("y<y"), tx(" est faux : aucun réel n'est plus petit que tous les réels. L'énoncé est faux.")] },
    },
    {
      cle: "valeurAbsolue",
      ensX: R,
      ensY: R,
      p: "\\left|x\\right|\\leq y",
      np: "\\left|x\\right|>y",
      ae: { vrai: true, lignes: [L("y=\\left|x\\right|", "y choisi après x"), L("\\left|x\\right|\\leq\\left|x\\right|", "≤ est réflexive")], raison: [tx("Pour chaque x, "), lx("y=\\left|x\\right|"), tx(" convient : l'énoncé est vrai.")] },
      ea: { vrai: false, lignes: [L("x=\\left|y\\right|+1", "on teste ce x"), L("\\left|x\\right|=\\left|y\\right|+1>y", "car |y| ≥ y")], raison: [tx("Avec "), lx("x=\\left|y\\right|+1"), tx(", la condition est fausse : l'énoncé est faux.")] },
    },
    {
      cle: "minoreCarre",
      ensX: R,
      ensY: R,
      p: "y\\leq x^{2}",
      np: "y>x^{2}",
      ae: { vrai: true, lignes: [L("y=0", "pour chaque x"), L("0\\leq x^{2}", "un carré est positif")], raison: [lx("y=0"), tx(" convient pour chaque x : l'énoncé est vrai.")] },
      ea: { vrai: true, lignes: [L("y=0", "le même y pour tous les x"), L("0\\leq x^{2}", "pour tout réel x")], raison: [tx("Le même "), lx("y=0"), tx(" convient pour tous les x : l'énoncé est vrai.")] },
    },
    {
      cle: "plusPetitNaturel",
      ensX: N,
      ensY: N,
      p: "y\\leq x",
      np: "y>x",
      ae: { vrai: true, lignes: [L("y=0", "pour chaque naturel x"), L("0\\leq x", "tout naturel est positif")], raison: [lx("y=0"), tx(" convient pour chaque naturel x : l'énoncé est vrai.")] },
      ea: { vrai: true, lignes: [L("y=0", "le même y pour tous les x"), L("0\\leq x", "pour tout naturel x")], raison: [tx("Le naturel "), lx("0"), tx(" est plus petit que tous les naturels : l'énoncé est vrai.")] },
    },
    {
      cle: "plusGrandNaturel",
      ensX: N,
      ensY: N,
      p: "x\\leq y",
      np: "x>y",
      ae: { vrai: true, lignes: [L("y=x", "pour chaque naturel x"), L("x\\leq x", "≤ est réflexive")], raison: [lx("y=x"), tx(" convient pour chaque x : l'énoncé est vrai.")] },
      ea: { vrai: false, lignes: [L("x=y+1", "on teste ce naturel"), L("y+1>y")], raison: [tx("Aucun naturel n'est plus grand que tous les naturels : "), lx("x=y+1"), tx(" le dépasse. L'énoncé est faux.")] },
    },
    {
      cle: "plusPetitStrictNaturel",
      ensX: N,
      ensY: N,
      p: "y<x",
      np: "y\\geq x",
      ae: { vrai: false, lignes: [L("x=0", "contre-exemple"), L("y\\geq 0", "pour tout naturel y")], raison: [tx("Pour "), lx("x=0"), tx(", aucun naturel n'est plus petit : l'énoncé est faux.")] },
      ea: { vrai: false, lignes: [L("x=0", "quel que soit y"), L("y\\geq 0", "aucun naturel n'est négatif")], raison: [tx("Quel que soit y, "), lx("x=0"), tx(" le met en défaut : l'énoncé est faux.")] },
    },
    {
      cle: "archimede",
      ensX: R,
      ensY: N,
      p: "y>x",
      np: "y\\leq x",
      ae: { vrai: true, lignes: [L("y>\\left|x\\right|\\geq x", "un naturel y plus grand que |x| existe (axiome d'Archimède)")], raison: [tx("Pour chaque réel x, un naturel plus grand que "), lx("\\left|x\\right|"), tx(" convient (axiome d'Archimède) : l'énoncé est vrai.")] },
      ea: { vrai: false, lignes: [L("x=y", "on teste ce réel"), L("y>y", "faux")], raison: [tx("Avec "), lx("x=y"), tx(", "), lx("y>y"), tx(" est faux : aucun naturel ne dépasse tous les réels. L'énoncé est faux.")] },
    },
    {
      cle: "entierEgal",
      ensX: R,
      ensY: "\\mathbb{Z}",
      p: "y=x",
      np: "y\\neq x",
      ae: { vrai: false, lignes: [L("x=\\dfrac{1}{2}", "contre-exemple"), L("y=\\dfrac{1}{2}\\notin\\mathbb{Z}", "aucun entier ne convient")], raison: [tx("Pour "), lx("x=\\dfrac{1}{2}"), tx(", aucun entier ne convient : l'énoncé est faux.")] },
      ea: { vrai: false, lignes: [L("x=y+1", "on teste ce réel"), L("y\\neq y+1")], raison: [tx("Un même entier ne peut pas être égal à deux réels différents : l'énoncé est faux.")] },
    },
    {
      cle: "pair",
      ensX: "\\mathbb{Z}",
      ensY: "\\mathbb{Z}",
      p: "x=2y",
      np: "x\\neq 2y",
      ae: { vrai: false, lignes: [L("x=1", "contre-exemple"), L("y=\\dfrac{1}{2}\\notin\\mathbb{Z}", "aucun entier ne convient")], raison: [lx("x=1"), tx(" n'est pas le double d'un entier : l'énoncé est faux.")] },
      ea: { vrai: false, lignes: [L("x=2y+1", "on teste cet entier"), L("2y+1\\neq 2y")], raison: [tx("Avec "), lx("x=2y+1"), tx(", l'égalité est fausse : l'énoncé est faux.")] },
    },
    {
      cle: "absMinore",
      ensX: R,
      ensY: R,
      p: "\\left|x\\right|\\geq y",
      np: "\\left|x\\right|<y",
      ae: { vrai: true, lignes: [L("y=\\left|x\\right|", "y choisi après x"), L("\\left|x\\right|\\geq\\left|x\\right|", "≤ est réflexive")], raison: [tx("Pour chaque x, "), lx("y=\\left|x\\right|"), tx(" convient : l'énoncé est vrai.")] },
      ea: { vrai: true, lignes: [L("y=0", "le même y pour tous les x"), L("\\left|x\\right|\\geq 0", "une valeur absolue est positive")], raison: [tx("Le même "), lx("y=0"), tx(" convient pour tous les x : l'énoncé est vrai.")] },
    },
  ];
}

const ae = (p: Predicat) => `\\forall x\\in ${p.ensX}\\ \\exists y\\in ${p.ensY} : ${p.p}`;
const ea = (p: Predicat) => `\\exists y\\in ${p.ensY}\\ \\forall x\\in ${p.ensX} : ${p.p}`;

const AIDE_AE: Frag[] = [tx("Ici, le y vient après x : pour un x donné (essaie quelques valeurs), peux-tu trouver un y qui convient ? Il peut dépendre de x.")];
const AIDE_EA: Frag[] = [tx("Ici, le y vient avant x : il faudrait un seul y qui convienne pour tous les x à la fois. Choisis un y, puis essaie plusieurs x.")];

function unQuantificateur(): EnonceQuantifie[] {
  const a = ent(1, 9);
  const s = (cle: string, latex: string, vrai: boolean, lignes: LigneJustif[], raison: Frag[], aide2: Frag[]): EnonceQuantifie => ({ cle, latex, vrai, lignes, raison, aide2 });
  const aideTout: Frag[] = [tx("Ici, « pour tout » : un seul contre-exemple suffit à rendre l'énoncé faux. Teste des valeurs particulières (0, un négatif…).")];
  const aideExiste: Frag[] = [tx("Ici, « il existe » : un seul exemple suffit à rendre l'énoncé vrai. Cherche une valeur qui convient.")];
  return [
    s("carrePositifStrict", "\\forall x\\in\\mathbb{R} : x^{2}>0", false, [L("x=0", "contre-exemple"), L("0^{2}=0", "pas > 0")], [lx("x=0"), tx(" est un contre-exemple : l'énoncé est faux.")], aideTout),
    s("carrePositif", "\\forall x\\in\\mathbb{R} : x^{2}\\geq 0", true, [L("x^{2}=x\\cdot x\\geq 0", "produit de deux réels de même signe")], [tx("Un carré est toujours positif ou nul : l'énoncé est vrai.")], aideTout),
    s("carreNegatif", "\\exists x\\in\\mathbb{R} : x^{2}<0", false, [L("x^{2}\\geq 0", "pour tout réel x")], [tx("Aucun réel n'a un carré négatif : l'énoncé est faux.")], aideExiste),
    s("carreEgal", "\\exists x\\in\\mathbb{R} : x^{2}=x", true, [L("x=1", "exemple"), L("1^{2}=1")], [lx("x=1"), tx(" convient : l'énoncé est vrai.")], aideExiste),
    s("absEgal", "\\forall x\\in\\mathbb{R} : \\left|x\\right|=x", false, [L("x=-1", "contre-exemple"), L("\\left|-1\\right|=1\\neq -1")], [lx("x=-1"), tx(" est un contre-exemple : l'énoncé est faux.")], aideTout),
    s("triangulaire", "\\forall x, y\\in\\mathbb{R} : \\left|x+y\\right|\\leq\\left|x\\right|+\\left|y\\right|", true, [L("\\left|x+y\\right|\\leq\\left|x\\right|+\\left|y\\right|", "inégalité triangulaire (étape 4)")], [tx("C'est l'inégalité triangulaire : l'énoncé est vrai.")], aideTout),
    s("absSomme", "\\forall x, y\\in\\mathbb{R} : \\left|x+y\\right|=\\left|x\\right|+\\left|y\\right|", false, [L("x=-1,\\ y=1", "contre-exemple"), L("\\left|-1+1\\right|=0\\neq 2")], [lx("x=-1"), tx(" et "), lx("y=1"), tx(" forment un contre-exemple : l'énoncé est faux.")], aideTout),
    s("plusA", `\\exists x\\in\\mathbb{R} : x+${a}=x`, false, [L(`(x+${a})-x=${a}`, "pour tout réel x"), L(`${a}\\neq 0`, `donc x + ${a} ≠ x`)], [tx("Pour tout x, "), lx(`(x+${a})-x=${a}\\neq 0`), tx(" : aucun réel ne convient, l'énoncé est faux.")], aideExiste),
    s("double", "\\forall x\\in\\mathbb{R} : 2x>x", false, [L("x=-1", "contre-exemple"), L("-2<-1")], [lx("x=-1"), tx(" est un contre-exemple : l'énoncé est faux.")], aideTout),
    s("doubleExiste", "\\exists x\\in\\mathbb{R} : 2x>x", true, [L("x=1", "exemple"), L("2>1")], [lx("x=1"), tx(" convient : l'énoncé est vrai.")], aideExiste),
    s("plusUn", "\\forall x\\in\\mathbb{R} : x<x+1", true, [L("x+1-x=1>0", "pour tout réel x")], [tx("Pour tout x, la différence vaut 1 : l'énoncé est vrai.")], aideTout),
  ];
}

type Forme = "ae" | "ea" | "tout" | "existe";

/** Énoncés de verdict imposé (`vrai`), en évitant les clés déjà prises. La FORME (∀x ∃y, ∃y ∀x, ∀, ∃)
 * est tirée indépendamment du verdict (35 / 35 / 15 / 15 %), puis un énoncé de cette forme et de ce
 * verdict : la forme ne trahit jamais le verdict (avant, « ∃y ∀x » était faux 82 fois sur 100). */
export function tirerEnonce(vrai: boolean, pris: Set<string>): EnonceQuantifie {
  for (;;) {
    const r = Math.random();
    const forme: Forme = r < 0.35 ? "ae" : r < 0.7 ? "ea" : r < 0.85 ? "tout" : "existe";
    if (forme === "ae" || forme === "ea") {
      const candidats = predicats().filter((p) => (forme === "ae" ? p.ae : p.ea).vrai === vrai && !pris.has(p.cle));
      if (candidats.length === 0) continue;
      const p = parmi(candidats);
      const v = forme === "ae" ? p.ae : p.ea;
      return { cle: p.cle, latex: forme === "ae" ? ae(p) : ea(p), vrai, lignes: v.lignes, raison: v.raison, aide2: forme === "ae" ? AIDE_AE : AIDE_EA };
    }
    const candidats = unQuantificateur().filter((s) => s.vrai === vrai && !pris.has(s.cle) && s.latex.startsWith(forme === "tout" ? "\\forall" : "\\exists"));
    if (candidats.length === 0) continue;
    return parmi(candidats);
  }
}

/** Énoncé à nier (∀∃ ou ∃∀) et ses quatre options, mélangées. */
export function tirerNegation(pris: Set<string>): { aNier: string; options: OptionNegation[]; cle: string; p: string; np: string } {
  for (;;) {
    const p = parmi(predicats());
    if (pris.has(p.cle)) continue;
    const { ensX: X, ensY: Y } = p;
    if (Math.random() < 0.5) {
      const options: OptionNegation[] = [
        { id: "juste", sorte: "juste", latex: `\\exists x\\in ${X}\\ \\forall y\\in ${Y} : ${p.np}` },
        { id: "predicat", sorte: "predicat", latex: `\\forall x\\in ${X}\\ \\exists y\\in ${Y} : ${p.np}` },
        { id: "quantificateurs", sorte: "quantificateurs", latex: `\\exists x\\in ${X}\\ \\forall y\\in ${Y} : ${p.p}` },
        { id: "ordre", sorte: "ordre", latex: `\\exists y\\in ${Y}\\ \\forall x\\in ${X} : ${p.np}` },
      ];
      return { aNier: ae(p), options: melanger(options), cle: p.cle, p: p.p, np: p.np };
    }
    const options: OptionNegation[] = [
      { id: "juste", sorte: "juste", latex: `\\forall y\\in ${Y}\\ \\exists x\\in ${X} : ${p.np}` },
      { id: "predicat", sorte: "predicat", latex: `\\exists y\\in ${Y}\\ \\forall x\\in ${X} : ${p.np}` },
      { id: "quantificateurs", sorte: "quantificateurs", latex: `\\forall y\\in ${Y}\\ \\exists x\\in ${X} : ${p.p}` },
      { id: "ordre", sorte: "ordre", latex: `\\forall x\\in ${X}\\ \\exists y\\in ${Y} : ${p.np}` },
    ];
    return { aNier: ea(p), options: melanger(options), cle: p.cle, p: p.p, np: p.np };
  }
}

// ============================================================================
// Axiomes.
// ============================================================================

export const AXIOMES: { id: IdAxiome; nom: string; famille: "add" | "mul" | "ord" | "def"; latex: string }[] = [
  { id: "addAssoc", nom: "associativité de l'addition", famille: "add", latex: "x+(y+z)=(x+y)+z" },
  { id: "addNeutre", nom: "0, neutre de l'addition", famille: "add", latex: "0+x=x=x+0" },
  { id: "addSym", nom: "opposé (symétrique pour l'addition)", famille: "add", latex: "x+(-x)=0" },
  { id: "addComm", nom: "commutativité de l'addition", famille: "add", latex: "x+y=y+x" },
  { id: "mulAssoc", nom: "associativité de la multiplication", famille: "mul", latex: "x\\cdot(y\\cdot z)=(x\\cdot y)\\cdot z" },
  { id: "mulNeutre", nom: "1, neutre de la multiplication", famille: "mul", latex: "1\\cdot x=x=x\\cdot 1" },
  { id: "mulSym", nom: "inverse (symétrique pour la multiplication)", famille: "mul", latex: "x\\cdot\\dfrac{1}{x}=1\\ (x\\neq 0)" },
  { id: "mulComm", nom: "commutativité de la multiplication", famille: "mul", latex: "x\\cdot y=y\\cdot x" },
  { id: "distrib", nom: "distributivité", famille: "mul", latex: "x\\cdot(y+z)=x\\cdot y+x\\cdot z" },
  { id: "ordTrans", nom: "transitivité de ≤", famille: "ord", latex: "x\\leq y\\ \\text{et}\\ y\\leq z\\ \\Rightarrow\\ x\\leq z" },
  { id: "ordAdd", nom: "compatibilité de ≤ avec l'addition", famille: "ord", latex: "x\\leq y\\ \\Rightarrow\\ x+z\\leq y+z" },
  { id: "ordMul", nom: "compatibilité de ≤ avec la multiplication par un positif", famille: "ord", latex: "x\\leq y\\ \\text{et}\\ 0\\leq z\\ \\Rightarrow\\ x\\cdot z\\leq y\\cdot z" },
  { id: "defSous", nom: "définition de la soustraction", famille: "def", latex: "x-y=x+(-y)" },
  { id: "defDiv", nom: "définition de la division", famille: "def", latex: "\\dfrac{x}{y}=x\\cdot\\dfrac{1}{y}\\ (y\\neq 0)" },
];
export const axiome = (id: IdAxiome) => AXIOMES.find((a) => a.id === id)!;

/** Bonne réponse + trois leurres (deux de la même famille quand c'est possible), ordre canonique. */
function optionsPour(id: IdAxiome): IdAxiome[] {
  const fam = axiome(id).famille;
  const meme = melanger(AXIOMES.filter((a) => a.id !== id && a.famille === fam).map((a) => a.id)).slice(0, 2);
  const autres = melanger(AXIOMES.filter((a) => a.id !== id && !meme.includes(a.id)).map((a) => a.id));
  const choix = new Set<IdAxiome>([id, ...meme, ...autres.slice(0, 3 - meme.length)]);
  return AXIOMES.map((a) => a.id).filter((x) => choix.has(x));
}

interface GabaritCalcul {
  cle: string;
  hypotheses: string;
  depart: string;
  etapes: [string, IdAxiome][];
}

function gabarits(): GabaritCalcul[] {
  const a = ent(2, 9);
  const b = ent(2, 9);
  const c = ent(10, 30);
  const k = ent(2, 5);
  return [
    { cle: "simplifierSomme", hypotheses: "", depart: `(x+${a})+(-${a})`, etapes: [[`=x+\\big(${a}+(-${a})\\big)`, "addAssoc"], ["=x+0", "addSym"], ["=x", "addNeutre"]] },
    { cle: "simplifierProduit", hypotheses: "", depart: `(${a}\\cdot x)\\cdot\\dfrac{1}{${a}}`, etapes: [[`=(x\\cdot ${a})\\cdot\\dfrac{1}{${a}}`, "mulComm"], [`=x\\cdot\\left(${a}\\cdot\\dfrac{1}{${a}}\\right)`, "mulAssoc"], ["=x\\cdot 1", "mulSym"]] },
    { cle: "distribuer", hypotheses: "", depart: `${a}\\cdot(x+${b})+(-${a * b})`, etapes: [[`=(${a}\\cdot x+${a * b})+(-${a * b})`, "distrib"], [`=${a}\\cdot x+\\big(${a * b}+(-${a * b})\\big)`, "addAssoc"], [`=${a}\\cdot x+0`, "addSym"]] },
    { cle: "commuterDistribuer", hypotheses: "", depart: "(x+y)\\cdot z", etapes: [["=z\\cdot(x+y)", "mulComm"], ["=z\\cdot x+z\\cdot y", "distrib"], ["=z\\cdot x+y\\cdot z", "mulComm"]] },
    { cle: "inegalites", hypotheses: `x\\leq y\\ \\text{et}\\ y+${a}\\leq ${c}`, depart: "", etapes: [[`x+${a}\\leq y+${a}`, "ordAdd"], [`x+${a}\\leq ${c}`, "ordTrans"], [`(x+${a})\\cdot ${k}\\leq ${c}\\cdot ${k}`, "ordMul"]] },
    { cle: "soustraction", hypotheses: "", depart: `(x-${a})+${a}`, etapes: [[`=\\big(x+(-${a})\\big)+${a}`, "defSous"], [`=x+\\big((-${a})+${a}\\big)`, "addAssoc"], ["=x+0", "addSym"]] },
    { cle: "division", hypotheses: "", depart: `\\dfrac{x}{${a}}\\cdot ${a}`, etapes: [[`=\\left(x\\cdot\\dfrac{1}{${a}}\\right)\\cdot ${a}`, "defDiv"], [`=x\\cdot\\left(\\dfrac{1}{${a}}\\cdot ${a}\\right)`, "mulAssoc"], ["=x\\cdot 1", "mulSym"]] },
    { cle: "commuterAssocier", hypotheses: "", depart: `(${a}+x)+(-${a})`, etapes: [[`=(x+${a})+(-${a})`, "addComm"], [`=x+\\big(${a}+(-${a})\\big)`, "addAssoc"], ["=x+0", "addSym"]] },
  ];
}

export function tirerCalcul(): { cle: string; hypotheses: string; depart: string; etapes: EtapeCalcul[] } {
  const g = parmi(gabarits());
  return { cle: g.cle, hypotheses: g.hypotheses, depart: g.depart, etapes: g.etapes.map(([latex, id]) => ({ latex, axiome: id, options: optionsPour(id) })) };
}
