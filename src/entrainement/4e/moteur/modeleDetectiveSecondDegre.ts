import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { DonneesDetectiveSecondDegre, ExerciceInequationDetective, ExerciceInequationRationnelle, SymboleInegalite, TypeErreurSecondDegre, VarianteDetectiveSecondDegre } from "../core/detectiveSecondDegre.types";
import { lineaire, mono, moinsH, polynome, q, qp } from "../ui/corrigeChapitre3";
import { ENSEMBLE_VIDE, ensembleLatex, ensemblePoints, genreEnsemble, intervalleReel, normaliserEnsemble, valeursEnsemble, type EnsembleReel } from "../ui/ensembleSolutionTrinome";

/**
 * Modèle de gen121 « Détective d'erreurs : second degré » : énoncé, copie de l'élève fictif (avec
 * SON erreur, la suite en découle), ensemble-solution correct et ensemble de la copie. Valeurs
 * EXACTES (entiers, fractions ; racines carrées laissées sous le radical dans la copie quand
 * l'erreur fait apparaître un Δ qui n'est pas un carré). Une seule source pour l'écran, le papier et
 * le corrigé.
 */

type E = DonneesDetectiveSecondDegre;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** Ligne fausse (indice 0) de chaque type d'erreur. */
const LIGNE_FAUSSE: Record<TypeErreurSecondDegre, number> = {
  carreNegatif: 0,
  moinsB: 2,
  divisionFacteur: 0,
  signesRacines: 3,
  signe4ac: 0,
  deltaNegatifUneSolution: 1,
  sensNonInverse: 0,
  signeEntre: 3,
  ceFausse: 0,
  racineEtrangere: 5,
  produitEnCroix: 1,
  valeurCEIncluse: 4,
};

export const NOMBRE_LIGNES: Record<VarianteDetectiveSecondDegre, number> = {
  discriminant: 5,
  miseEnEvidence: 5,
  sansSolution: 4,
  inequation: 5,
  rationnelle: 6,
  inequationRationnelle: 5,
};

export function indiceLigneFausse(e: E): number {
  return LIGNE_FAUSSE[e.type];
}

export function nombreLignes(e: E): number {
  return NOMBRE_LIGNES[e.variante];
}

export function descriptionCorrecte(e: E): TypeErreurSecondDegre {
  return e.type;
}

/** Équation ou inéquation à résoudre. */
export function estInequation(e: E): boolean {
  return e.variante === "inequation" || e.variante === "inequationRationnelle";
}

// ---------------------------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------------------------

export function symboleLatex(s: SymboleInegalite): string {
  return s === "≤" ? "\\leq " : s === "≥" ? "\\geq " : s;
}

export function symboleInverse(s: SymboleInegalite): SymboleInegalite {
  return s === "<" ? ">" : s === ">" ? "<" : s === "≤" ? "≥" : "≤";
}

export function estCarreParfait(n: number): boolean {
  if (n < 0) return false;
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

/** √n : entier si n est un carré, sinon `\sqrt{n}`. */
function racineLatex(n: number): string {
  return estCarreParfait(n) ? String(Math.round(Math.sqrt(n))) : `\\sqrt{${n}}`;
}

/** Ensemble {a ; b} en LaTeX, valeurs rangées. */
function paireLatex(valeurs: number[]): string {
  return `\\left\\{${[...new Set(valeurs)].sort((x, y) => x - y).map(q).join("\\,;\\,")}\\right\\}`;
}

/** Les deux racines (−b ± √Δ)/(2a) d'un trinôme : valeurs et écritures. `signeB` = +1 pour la bonne
 * formule (−b), −1 pour la formule fausse (b). */
function racinesFormule(a: number, b: number, delta: number, signeB = 1): { valeurs: [number, number]; numerateur: string; x1: string; x2: string; exactes: boolean } {
  const nb = signeB * -b;
  const exactes = estCarreParfait(delta);
  const s = Math.sqrt(delta);
  const v1 = (nb - s) / (2 * a);
  const v2 = (nb + s) / (2 * a);
  const rac = racineLatex(delta);
  const numerateur = `${q(nb)}\\pm ${rac}`;
  if (exactes) {
    const si = Math.round(s);
    return {
      valeurs: [v1, v2],
      numerateur,
      x1: `\\dfrac{${q(nb)}-${si}}{${2 * a}}=${q(v1)}`,
      x2: `\\dfrac{${q(nb)}+${si}}{${2 * a}}=${q(v2)}`,
      exactes,
    };
  }
  return { valeurs: [v1, v2], numerateur, x1: `\\dfrac{${q(nb)}-${rac}}{${2 * a}}`, x2: `\\dfrac{${q(nb)}+${rac}}{${2 * a}}`, exactes };
}

/** Écriture de S = {x₁ ; x₂} pour deux racines éventuellement irrationnelles. */
function ensembleRacinesLatex(r: ReturnType<typeof racinesFormule>): string {
  if (r.exactes) return paireLatex(r.valeurs);
  return `\\left\\{${r.x1}\\,;\\,${r.x2}\\right\\}`;
}

/** ∆ = b² − 4ac écrit en entiers : « (−3)^2-4\cdot 2\cdot(-5) ». `carreFaux` : −3² au lieu de (−3)². */
export function deltaEcrit(a: number, b: number, c: number, carreFaux = false): string {
  const carre = carreFaux ? `-${Math.abs(b)}^2` : `${qp(b)}^2`;
  return `${carre}-4\\cdot ${qp(a)}\\cdot ${qp(c)}`;
}

/** Somme de deux entiers écrite « 9+40 », « 25-32 ». */
function deuxTermes(x: number, y: number): string {
  return `${x}${y < 0 ? "-" : "+"}${Math.abs(y)}`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------------------------

export function enonceLatex(e: E): string {
  switch (e.variante) {
    case "discriminant":
    case "sansSolution":
      return `${polynome([e.a, e.b, e.c])}=0`;
    case "miseEnEvidence":
      return e.forme === "x" ? `${mono(e.k, "x^2")}=${mono(e.m, "x")}` : `(${moinsH(-e.p)})^2=${coefDevant(e.m)}(${moinsH(-e.p)})`;
    case "inequation":
      return `${polynome(coefsInequation(e))}${symboleLatex(e.symbole)}0`;
    case "rationnelle":
      return `\\dfrac{x^2}{${moinsH(e.p)}}=\\dfrac{${lineaire(e.p + e.r, -e.p * e.r)}}{${moinsH(e.p)}}`;
    case "inequationRationnelle":
      return `\\dfrac{${numerateurIR(e)}}{${moinsH(e.p)}}${symboleLatex(e.symbole)}1`;
  }
}

/** « 3 », « - », « » devant une parenthèse. */
function coefDevant(k: number): string {
  return k === 1 ? "" : k === -1 ? "-" : String(k);
}

export function coefsInequation(e: ExerciceInequationDetective): [number, number, number] {
  return [e.k, -e.k * (e.r1 + e.r2), e.k * e.r1 * e.r2];
}

export function numerateurIR(e: ExerciceInequationRationnelle): string {
  return lineaire(2, -(e.z + e.p));
}

// ---------------------------------------------------------------------------------------------
// Solutions
// ---------------------------------------------------------------------------------------------

function deltaDe(a: number, b: number, c: number): number {
  return b * b - 4 * a * c;
}

/** Ensemble d'une inéquation x² − sx + P ◇ 0 (racines r1 < r2), lu correctement ou à l'envers. */
function ensembleTrinomeUnitaire(r1: number, r2: number, symbole: SymboleInegalite, aLEnvers = false): EnsembleReel {
  const large = symbole === "≤" || symbole === "≥";
  const veutPositif = symbole === ">" || symbole === "≥";
  const exterieur = veutPositif !== aLEnvers;
  return exterieur ? normaliserEnsemble([intervalleReel(null, false, r1, large), intervalleReel(r2, large, null, false)]) : [intervalleReel(r1, large, r2, large)];
}

/** Ensemble de (x − z)/(x − p) ◇ 0 (symbole large), valeur interdite exclue (ou incluse à tort). */
function ensembleQuotient(z: number, p: number, symbole: "≤" | "≥", pInclus = false): EnsembleReel {
  const lo = Math.min(z, p);
  const hi = Math.max(z, p);
  const inclus = (v: number) => (v === z ? true : pInclus);
  if (symbole === "≥") return normaliserEnsemble([intervalleReel(null, false, lo, inclus(lo)), intervalleReel(hi, inclus(hi), null, false)]);
  return [intervalleReel(lo, inclus(lo), hi, inclus(hi))];
}

export function solutionCorrecte(e: E): EnsembleReel {
  switch (e.variante) {
    case "discriminant": {
      const r = racinesFormule(e.a, e.b, deltaDe(e.a, e.b, e.c));
      return ensemblePoints(r.valeurs);
    }
    case "miseEnEvidence":
      return e.forme === "x" ? ensemblePoints([0, e.m / e.k]) : ensemblePoints([-e.p, e.m - e.p]);
    case "sansSolution":
      return ENSEMBLE_VIDE;
    case "inequation":
      return ensembleTrinomeUnitaire(e.r1, e.r2, symboleInverse(e.symbole));
    case "rationnelle":
      return ensemblePoints([e.r]);
    case "inequationRationnelle":
      return ensembleQuotient(e.z, e.p, e.symbole);
  }
}

/** Ensemble de la copie (résultat faux de l'élève fictif). */
export function solutionCopie(e: E): EnsembleReel {
  switch (e.variante) {
    case "discriminant": {
      if (e.type === "carreNegatif") return ensemblePoints(racinesFormule(e.a, e.b, -e.b * e.b - 4 * e.a * e.c).valeurs);
      return ensemblePoints(racinesFormule(e.a, e.b, deltaDe(e.a, e.b, e.c), -1).valeurs);
    }
    case "miseEnEvidence": {
      if (e.forme === "x") return e.type === "divisionFacteur" ? ensemblePoints([e.m / e.k]) : ensemblePoints([0, -e.m / e.k]);
      return e.type === "divisionFacteur" ? ensemblePoints([e.m - e.p]) : ensemblePoints([e.p, e.p - e.m]);
    }
    case "sansSolution":
      if (e.type === "deltaNegatifUneSolution") return ensemblePoints([-e.b / (2 * e.a)]);
      return ensemblePoints(racinesFormule(e.a, e.b, e.b * e.b + 4 * e.a * e.c).valeurs);
    case "inequation":
      return e.type === "sensNonInverse" ? ensembleTrinomeUnitaire(e.r1, e.r2, e.symbole) : ensembleTrinomeUnitaire(e.r1, e.r2, symboleInverse(e.symbole), true);
    case "rationnelle":
      return ensemblePoints([e.p, e.r]);
    case "inequationRationnelle": {
      if (e.type === "valeurCEIncluse") return ensembleQuotient(e.z, e.p, e.symbole, true);
      const base = e.symbole === "≥" ? intervalleReel(e.z, true, null, false) : intervalleReel(null, false, e.z, true);
      return retirerPoint([base], e.p);
    }
  }
}

/** Retire un point d'un ensemble (s'il y est). */
function retirerPoint(ens: EnsembleReel, x: number): EnsembleReel {
  const out: EnsembleReel = [];
  for (const i of ens) {
    const dedans = (i.g === null || x > i.g || (x === i.g && i.gInclus)) && (i.d === null || x < i.d || (x === i.d && i.dInclus));
    if (!dedans) {
      out.push(i);
      continue;
    }
    out.push(intervalleReel(i.g, i.gInclus, x, false), intervalleReel(x, false, i.d, i.dInclus));
  }
  return normaliserEnsemble(out);
}

/** La valeur interdite est-elle dans l'ensemble de base de la copie « produit en croix » ? */
export function interditDansBaseCopie(e: ExerciceInequationRationnelle): boolean {
  return e.symbole === "≥" ? e.p >= e.z : e.p <= e.z;
}

// ---------------------------------------------------------------------------------------------
// Copie de l'élève fictif
// ---------------------------------------------------------------------------------------------

function ensembleCopieLatex(e: E): string {
  return ensembleSolutionLatex(solutionCopie(e));
}

/** S écrit pour une copie ou un corrigé (accolades adaptées aux fractions). */
export function ensembleSolutionLatex(s: EnsembleReel): string {
  return ensembleLatexAdapte(s);
}

function ensembleLatexAdapte(s: EnsembleReel): string {
  if (genreEnsemble(s) === "points") return paireLatex(valeursEnsemble(s));
  return ensembleLatex(s);
}

export function copieEleve(e: E): FragmentConsigne[][] {
  switch (e.variante) {
    case "discriminant": {
      const { a, b, c } = e;
      const faux = e.type === "carreNegatif";
      const carre = faux ? -b * b : b * b;
      const delta = carre - 4 * a * c;
      const r = racinesFormule(a, b, delta, e.type === "moinsB" ? -1 : 1);
      const formule = e.type === "moinsB" ? "\\dfrac{b\\pm\\sqrt{\\Delta}}{2a}" : "\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}";
      return [
        [l(`\\Delta=${deltaEcrit(a, b, c, faux)}=${deuxTermes(carre, -4 * a * c)}=${delta}`)],
        [l(`\\sqrt{\\Delta}=${estCarreParfait(delta) ? `\\sqrt{${delta}}=${racineLatex(delta)}` : `\\sqrt{${delta}}`}`)],
        [l(`x=${formule}=\\dfrac{${r.numerateur}}{${2 * a}}`)],
        [l(`x_1=${r.x1}`), t(" et "), l(`x_2=${r.x2}`)],
        [l(`S=${ensembleRacinesLatex(r)}`)],
      ];
    }
    case "miseEnEvidence": {
      if (e.forme === "x") {
        const { k, m } = e;
        const racine = m / k;
        if (e.type === "divisionFacteur") {
          return [
            [l(`${mono(k, "x")}=${q(m)}`), t(" (on divise les deux membres par "), l("x"), t(")")],
            [l(`x=${q(racine)}`)],
            [t("Vérification : "), l(`${coefMul(k)}${qp(racine)}^2=${q(k * racine * racine)}`), t(" et "), l(`${coefMul(m)}${qp(racine)}=${q(m * racine)}`)],
            [t("Une seule solution : "), l(`x=${q(racine)}`)],
            [l(`S=${ensembleCopieLatex(e)}`)],
          ];
        }
        return [
          [l(`${polynome([k, -m, 0])}=0`)],
          [l(`x(${lineaire(k, -m)})=0`)],
          [l("x=0"), t(" ou "), l(`${lineaire(k, -m)}=0`)],
          [l("x=0"), t(" ou "), l(`x=${q(-racine)}`)],
          [l(`S=${ensembleCopieLatex(e)}`)],
        ];
      }
      const { p, m } = e;
      const facteur = moinsH(-p);
      const r = m - p;
      if (e.type === "divisionFacteur") {
        return [
          [l(`${facteur}=${q(m)}`), t(" (on divise les deux membres par "), l(facteur), t(")")],
          [l(`x=${q(r)}`)],
          [t("Vérification : "), l(`(${q(r)}${p < 0 ? "-" : "+"}${Math.abs(p)})^2=${m * m}`), t(" et "), l(`${coefMul(m)}(${q(r)}${p < 0 ? "-" : "+"}${Math.abs(p)})=${m * m}`)],
          [t("Une seule solution : "), l(`x=${q(r)}`)],
          [l(`S=${ensembleCopieLatex(e)}`)],
        ];
      }
      return [
        [l(`(${facteur})^2${m > 0 ? "-" : "+"}${Math.abs(m) === 1 ? "" : Math.abs(m)}(${facteur})=0`)],
        [l(`(${facteur})\\,[(${facteur})${m > 0 ? "-" : "+"}${Math.abs(m)}]=0`)],
        [l(`(${facteur})(${moinsH(m - p)})=0`)],
        [l(`x=${q(p)}`), t(" ou "), l(`x=${q(p - m)}`)],
        [l(`S=${ensembleCopieLatex(e)}`)],
      ];
    }
    case "sansSolution": {
      const { a, b, c } = e;
      if (e.type === "signe4ac") {
        const delta = b * b + 4 * a * c;
        const r = racinesFormule(a, b, delta);
        return [
          [l(`\\Delta=${deltaEcrit(a, b, c)}=${deuxTermes(b * b, 4 * a * c)}=${delta}`)],
          [l("\\Delta>0"), t(" : deux solutions.")],
          [l(`x=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}=\\dfrac{${r.numerateur}}{${2 * a}}`)],
          [l(`S=${ensembleRacinesLatex(r)}`)],
        ];
      }
      const delta = deltaDe(a, b, c);
      return [
        [l(`\\Delta=${deltaEcrit(a, b, c)}=${deuxTermes(b * b, -4 * a * c)}=${delta}`)],
        [l("\\Delta<0"), t(" : une seule solution (racine double).")],
        [l(`x=-\\dfrac{b}{2a}=${-b < 0 ? "-" : ""}\\dfrac{${Math.abs(b)}}{${2 * a}}${Number.isInteger(-b / (2 * a)) || reduitAutrement(b, a) ? `=${q(-b / (2 * a))}` : ""}`)],
        [l(`S=${ensembleCopieLatex(e)}`)],
      ];
    }
    case "inequation": {
      const s = e.r1 + e.r2;
      const P = e.r1 * e.r2;
      const symCopie = e.type === "sensNonInverse" ? e.symbole : symboleInverse(e.symbole);
      const delta = (e.r2 - e.r1) ** 2;
      return [
        [l(`${polynome([1, -s, P])}${symboleLatex(symCopie)}0`), t(" (on divise les deux membres par "), l(String(e.k)), t(")")],
        [l(`\\Delta=${deltaEcrit(1, -s, P)}=${delta}`)],
        [l(`x=\\dfrac{${q(s)}\\pm ${Math.round(Math.sqrt(delta))}}{2}`), t(", donc "), l(`x_1=${q(e.r1)}`), t(" et "), l(`x_2=${q(e.r2)}`)],
        e.type === "signeEntre"
          ? [l("a=1>0"), t(" : le trinôme est positif entre les racines et négatif à l'extérieur.")]
          : [l("a=1>0"), t(" : le trinôme est positif à l'extérieur des racines et négatif entre elles.")],
        [l(`S=${ensembleCopieLatex(e)}`)],
      ];
    }
    case "rationnelle": {
      const { p, r } = e;
      const s = p + r;
      const P = p * r;
      const lo = Math.min(p, r);
      const hi = Math.max(p, r);
      const interditCopie = e.type === "ceFausse" ? -p : p;
      return [
        [t("CE : "), l(`${moinsH(p)}\\neq 0`), t(", donc "), l(`x\\neq ${q(interditCopie)}`)],
        [l(`x^2=${lineaire(s, -P)}`), t(" (on multiplie les deux membres par "), l(moinsH(p)), t(")")],
        [l(`${polynome([1, -s, P])}=0`)],
        [l(`\\Delta=${deltaEcrit(1, -s, P)}=${(p - r) ** 2}`)],
        [l(`x=\\dfrac{${q(s)}\\pm ${Math.abs(p - r)}}{2}`), t(", donc "), l(`x_1=${q(lo)}`), t(" et "), l(`x_2=${q(hi)}`)],
        e.type === "ceFausse"
          ? [t("Aucune des deux valeurs n'est "), l(q(-p)), t(" : "), l(`S=${ensembleCopieLatex(e)}`)]
          : [t("Les deux valeurs conviennent : "), l(`S=${ensembleCopieLatex(e)}`)],
      ];
    }
    case "inequationRationnelle": {
      const { z, p } = e;
      const sym = symboleLatex(e.symbole);
      const num = numerateurIR(e);
      const lignes: FragmentConsigne[][] = [[t("CE : "), l(`x\\neq ${q(p)}`)]];
      if (e.type === "produitEnCroix") {
        lignes.push(
          [l(`${num}${sym}${moinsH(p)}`), t(" (on multiplie les deux membres par "), l(moinsH(p)), t(")")],
          [l(`x${sym}${q(z)}`)],
          interditDansBaseCopie(e) ? [t("On retire la valeur interdite "), l(q(p)), t(".")] : [t("La valeur interdite "), l(q(p)), t(" n'est pas dans cet ensemble.")],
        );
      } else {
        lignes.push(
          [l(`\\dfrac{${num}}{${moinsH(p)}}-1${sym}0`)],
          [l(`\\dfrac{${moinsH(z)}}{${moinsH(p)}}${sym}0`)],
          [t("Le quotient s'annule en "), l(q(z)), t(" et n'existe pas en "), l(q(p)), t(" : il est positif à l'extérieur de ces deux valeurs, négatif entre elles.")],
        );
      }
      lignes.push([l(`S=${ensembleCopieLatex(e)}`)]);
      return lignes;
    }
  }
}

/** « 3\cdot » devant un nombre, « » pour 1, « -» pour −1. */
function coefMul(k: number): string {
  return k === 1 ? "" : k === -1 ? "-" : `${k}\\cdot `;
}

function pgcd(x: number, y: number): number {
  return y === 0 ? Math.abs(x) : pgcd(y, x % y);
}

/** La fraction |b|/(2a) se simplifie-t-elle ? */
function reduitAutrement(b: number, a: number): boolean {
  return pgcd(Math.abs(b), 2 * a) > 1;
}
