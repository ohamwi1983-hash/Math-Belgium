/**
 * Couche A (5e) — tirage aléatoire de la valeur cible k et construction du "cas" complet (spécial,
 * aucune solution, ou général — 3 régimes garantis pour cos/sin, cf. CLAUDE.md/spec 5gen10) pour
 * 5gen10. Délègue toute la construction des branches à `identites.ts` (pur, déjà testé) — ce module
 * ne fait que choisir k (catalogue exact ou décimal) et dispatcher.
 */
import type { FonctionTrig, RegimeEquationTrig } from "../../core5e/equationsTrigonometriques.types";
import type { BrancheAngle } from "../../core5e/equationsTrigonometriques.types";
import { valeurNumerique } from "../parametresSinusoide/rationnelPi";
import { CATALOGUE_COS, CATALOGUE_SIN, CATALOGUE_TAN } from "./angles";
import { branchesGeneralesCos, branchesGeneralesSin, brancheSpecialeCos, brancheSpecialeSin, brancheTan } from "./identites";

export interface CasGenereEquationTrig {
  k: number;
  kLatex: string;
  regime: RegimeEquationTrig;
  aucuneSolution: boolean;
  casSpecial: boolean;
  branchesU: BrancheAngle[];
}

/** Arrondi à la PREMIÈRE décimale — cohérent avec la convention d'affichage D.1
 * (`ui5e/formatEquationTrig.ts::arrondi1`) : k est arrondi ICI, À LA GÉNÉRATION (pas seulement à
 * l'affichage), pour que `k.valeur` (consommé par la vérification) et `k.latex` (affiché à l'élève)
 * restent TOUJOURS la même valeur — jamais un k affiché "0,3" pendant qu'un k réel "0,34" sert de
 * cible à la vérification (aurait fait échouer une réponse élève par ailleurs mathématiquement
 * correcte, l'écart dépassant largement `TOLERANCE_EQUATION_TRIG`). */
function arrondi1(v: number): number {
  const r = Math.round(v * 10) / 10;
  return Object.is(r, -0) ? 0 : r;
}

/** Convention française — "." → "," (même principe que `ui/formatBienaymeTchebychev.ts`, réimplémenté
 * ici car `src/generateurs5e/` ne peut jamais importer `src/ui/`/`src/ui5e/`). */
function formatDecimalLatex(v: number): string {
  return arrondi1(v).toString().replace(".", ",");
}

function tirerSigne(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

function tirerDansIntervalle(min: number, max: number): number {
  return arrondi1(min + Math.random() * (max - min));
}

function choisirDansCatalogue<T>(catalogue: T[]): T {
  return catalogue[Math.floor(Math.random() * catalogue.length)];
}

function tirerCasCos(): CasGenereEquationTrig {
  const r = Math.random();
  if (r < 0.15) {
    const signe = tirerSigne();
    return { k: signe, kLatex: signe === 1 ? "1" : "-1", regime: "exact", aucuneSolution: false, casSpecial: true, branchesU: [brancheSpecialeCos(signe)] };
  }
  if (r < 0.3) {
    const k = tirerSigne() * tirerDansIntervalle(1.1, 1.9);
    return { k, kLatex: formatDecimalLatex(k), regime: "decimal", aucuneSolution: true, casSpecial: false, branchesU: [] };
  }
  if (Math.random() < 0.6) {
    const entree = choisirDansCatalogue(CATALOGUE_COS);
    return { k: entree.k, kLatex: entree.kLatex, regime: "exact", aucuneSolution: false, casSpecial: false, branchesU: branchesGeneralesCos(entree.B, valeurNumerique(entree.B)) };
  }
  const k = tirerDansIntervalle(-0.9, 0.9);
  const B = Math.acos(k);
  return { k, kLatex: formatDecimalLatex(k), regime: "decimal", aucuneSolution: false, casSpecial: false, branchesU: branchesGeneralesCos(null, B) };
}

function tirerCasSin(): CasGenereEquationTrig {
  const r = Math.random();
  if (r < 0.15) {
    const signe = tirerSigne();
    return { k: signe, kLatex: signe === 1 ? "1" : "-1", regime: "exact", aucuneSolution: false, casSpecial: true, branchesU: [brancheSpecialeSin(signe)] };
  }
  if (r < 0.3) {
    const k = tirerSigne() * tirerDansIntervalle(1.1, 1.9);
    return { k, kLatex: formatDecimalLatex(k), regime: "decimal", aucuneSolution: true, casSpecial: false, branchesU: [] };
  }
  if (Math.random() < 0.6) {
    const entree = choisirDansCatalogue(CATALOGUE_SIN);
    return { k: entree.k, kLatex: entree.kLatex, regime: "exact", aucuneSolution: false, casSpecial: false, branchesU: branchesGeneralesSin(entree.B, valeurNumerique(entree.B)) };
  }
  const k = tirerDansIntervalle(-0.9, 0.9);
  const B = Math.asin(k);
  return { k, kLatex: formatDecimalLatex(k), regime: "decimal", aucuneSolution: false, casSpecial: false, branchesU: branchesGeneralesSin(null, B) };
}

function tirerCasTan(): CasGenereEquationTrig {
  if (Math.random() < 0.55) {
    const entree = choisirDansCatalogue(CATALOGUE_TAN);
    return { k: entree.k, kLatex: entree.kLatex, regime: "exact", aucuneSolution: false, casSpecial: false, branchesU: brancheTan(entree.B, valeurNumerique(entree.B)) };
  }
  const k = tirerSigne() * tirerDansIntervalle(0.3, 3.8);
  const B = Math.atan(k);
  return { k, kLatex: formatDecimalLatex(k), regime: "decimal", aucuneSolution: false, casSpecial: false, branchesU: brancheTan(null, B) };
}

export function tirerCas(fonction: FonctionTrig): CasGenereEquationTrig {
  if (fonction === "cos") return tirerCasCos();
  if (fonction === "sin") return tirerCasSin();
  return tirerCasTan();
}
