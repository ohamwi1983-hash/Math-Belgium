import type { ExerciceRationnelle, SlotCE, SousCasRationnelle } from "../../core5e/domaineDefinition.types";
import { choisirParmi, deuxEntiersDistincts, entierAleatoire, entierNonNulAleatoire } from "./aleatoire";
import { formatFacteurLineaireLatex, formatPolynomeLatex, multiplierPolynomes, polynomeCarreParfait, polynomeLineaire, polynomeQuadratiqueDepuisRacines, reduireNumerateurConstant } from "./polynome";
import { ensemblePrivePoints, ensembleReel } from "./resolutionSigne";

export const SOUS_CAS_RATIONNELLE: SousCasRationnelle[] = ["lineaireSimple", "quadratiqueFactorisable", "carreParfait", "factoriseAvecCarre", "vacuous"];

/**
 * Habillage de f(x) — 50/50 fraction pure ou "N2(x) ± fraction" (le prompt demande explicitement
 * les deux formes d'affichage) ; n'affecte jamais la CE/résolution/domf, qui ne dépendent que de
 * D(x).
 */
function fLatexRationnelle(numeriateurLatex: string, denominateurLatex: string): string {
  const fraction = `\\dfrac{${numeriateurLatex}}{${denominateurLatex}}`;
  if (Math.random() < 0.5) return `f(x) = ${fraction}`;
  const m = entierNonNulAleatoire(1, 3);
  const p = entierAleatoire(-5, 5);
  const membreLineaire = formatPolynomeLatex(polynomeLineaire(m, p));
  const signe = Math.random() < 0.5 ? "+" : "-";
  return `f(x) = ${membreLineaire} ${signe} ${fraction}`;
}

function numerateurConstant(): string {
  return String(entierNonNulAleatoire(1, 9));
}

function slotDenominateur(latex: string, coeffs: number[]): SlotCE {
  return { id: "denominateur", role: "denominateur", latex, texte: latex, coeffs, symboleAttendu: "≠" };
}

/** Seul sous-cas dont le numérateur est une constante tirée INDÉPENDAMMENT du dénominateur (les 4
 * autres ont un dénominateur de contenu 1 par construction, jamais de facteur commun possible avec
 * une constante) — réduit par PGCD avant affichage (A.7, voir `reduireNumerateurConstant`), sinon
 * ~11% des tirages affichaient une fraction non réduite (ex. 6/(3x+9) au lieu de 2/(x+3)). */
function construireLineaireSimple(): ExerciceRationnelle {
  const a = entierNonNulAleatoire(1, 3);
  const b = entierAleatoire(-9, 9);
  const { numerateur, denominateur: coeffs } = reduireNumerateurConstant(entierNonNulAleatoire(1, 9), polynomeLineaire(a, b));
  const denLatex = formatPolynomeLatex(coeffs);
  const resolution = ensemblePrivePoints([-coeffs[0] / coeffs[1]]);
  return {
    famille: "rationnelle",
    sousCas: "lineaireSimple",
    fLatex: fLatexRationnelle(String(numerateur), denLatex),
    slots: [slotDenominateur(denLatex, coeffs)],
    resolution,
    domf: resolution,
    aucuneCE: false,
  };
}

function construireQuadratiqueFactorisable(): ExerciceRationnelle {
  const [r1, r2] = deuxEntiersDistincts(-6, 6);
  const coeffs = polynomeQuadratiqueDepuisRacines(1, r1, r2);
  const denLatex = formatPolynomeLatex(coeffs);
  const resolution = ensemblePrivePoints([r1, r2]);
  return {
    famille: "rationnelle",
    sousCas: "quadratiqueFactorisable",
    fLatex: fLatexRationnelle(numerateurConstant(), denLatex),
    slots: [slotDenominateur(denLatex, coeffs)],
    resolution,
    domf: resolution,
    aucuneCE: false,
  };
}

function construireCarreParfait(): ExerciceRationnelle {
  const r = entierAleatoire(-6, 6);
  const coeffs = polynomeCarreParfait(1, r);
  const denLatex = formatPolynomeLatex(coeffs);
  const resolution = ensemblePrivePoints([r]);
  return {
    famille: "rationnelle",
    sousCas: "carreParfait",
    fLatex: fLatexRationnelle(numerateurConstant(), denLatex),
    slots: [slotDenominateur(denLatex, coeffs)],
    resolution,
    domf: resolution,
    aucuneCE: false,
  };
}

function construireFactoriseAvecCarre(): ExerciceRationnelle {
  const [r1, r2] = deuxEntiersDistincts(-6, 6);
  const coeffs = multiplierPolynomes(polynomeLineaire(1, -r1), polynomeCarreParfait(1, r2));
  const denLatex = `${formatFacteurLineaireLatex(r1)}${formatFacteurLineaireLatex(r2)}^2`;
  const resolution = ensemblePrivePoints([r1, r2]);
  return {
    famille: "rationnelle",
    sousCas: "factoriseAvecCarre",
    fLatex: fLatexRationnelle(numerateurConstant(), denLatex),
    slots: [slotDenominateur(denLatex, coeffs)],
    resolution,
    domf: resolution,
    aucuneCE: false,
  };
}

function construireVacuous(): ExerciceRationnelle {
  const c = entierAleatoire(1, 9);
  const coeffs = [c, 0, 1];
  const denLatex = formatPolynomeLatex(coeffs);
  const resolution = ensembleReel();
  return {
    famille: "rationnelle",
    sousCas: "vacuous",
    fLatex: fLatexRationnelle(numerateurConstant(), denLatex),
    slots: [slotDenominateur(denLatex, coeffs)],
    resolution,
    domf: resolution,
    // Dénominateur toujours >0 (forme x²+c, c>0) — CE structurellement "toujours vraie", gate="Aucune
    // CE" dès l'écran 1, conformément au principe unifié 1.10 (voir CLAUDE.md section 5gen1).
    aucuneCE: true,
  };
}

const CONSTRUCTEURS: Record<SousCasRationnelle, () => ExerciceRationnelle> = {
  lineaireSimple: construireLineaireSimple,
  quadratiqueFactorisable: construireQuadratiqueFactorisable,
  carreParfait: construireCarreParfait,
  factoriseAvecCarre: construireFactoriseAvecCarre,
  vacuous: construireVacuous,
};

export function construireRationnelleAvecSousCas(sousCas: SousCasRationnelle): ExerciceRationnelle {
  return CONSTRUCTEURS[sousCas]();
}

/** Tirage UNIFORME parmi les 5 sous-cas — garantit leur fréquence comparable (contrainte explicite de la spec). */
export function genererExerciceRationnelle(): ExerciceRationnelle {
  return construireRationnelleAvecSousCas(choisirParmi(SOUS_CAS_RATIONNELLE));
}
