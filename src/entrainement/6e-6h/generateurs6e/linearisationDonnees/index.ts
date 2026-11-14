import { arrondir, arrondiSignificatif, chaineLinearisation, CONTEXTES_LOGLOG, CONTEXTES_NEUTRES, CONTEXTES_SEMILOG, ecartAlignement, modeleEn } from "../../core6e/linearisationDonnees";
import type { ExerciceLinearisation, IdContexteLinearisation, ModeleDonnees, TypePrevision } from "../../core6e/linearisationDonnees";

/**
 * Couche A (6e) — générateur de `6gen89` « Linéariser des données : du tableau au modèle ».
 * N'utilise QUE `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue
 * exactement le même tirage, ici comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * - Les mesures sont arrondies à 3 chiffres significatifs (comme un relevé réel) : les points
 *   transformés sont presque, mais pas exactement, alignés.
 * - La droite passe par deux lignes désignées, distantes d'au moins 3 lignes (bonne précision) ; en
 *   log-log, jamais une ligne où x = 1 (ln x = 0 rendrait l'ordonnée à l'origine immédiate).
 * - Variante `choisir` : le modèle (issue de l'écran « choix ») est tiré AVANT la construction, une
 *   fois sur trois chacun ; la boucle de rejet ne garde que des tableaux où la bonne représentation
 *   aligne les points (écart < 1 %) et où les deux autres ne les alignent clairement pas (> 6 %).
 * - Le type de prévision (`valeur` ou `seuil`) est tiré une fois sur deux avant la construction.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

/** Réel dans [min ; max] par pas de `pas`. */
function pasDe(min: number, max: number, pas: number): number {
  return arrondir(min + pas * entier(0, Math.round((max - min) / pas)), 6);
}

/** Suite arithmétique de 6 abscisses. */
function abscissesArith(depart: number, pas: number): number[] {
  return Array.from({ length: 6 }, (_, i) => arrondir(depart + pas * i, 6));
}

/** `n` valeurs distinctes croissantes tirées dans `valeurs`. */
function sousListe(valeurs: readonly number[], n: number): number[] {
  const t = [...valeurs];
  while (t.length > n) t.splice(Math.floor(Math.random() * t.length), 1);
  return t;
}

const PAIRES_LIGNES: [number, number][] = [
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 4],
  [1, 5],
  [2, 5],
];

function choisirLignes(xs: number[], modele: ModeleDonnees): [number, number] {
  const valides = PAIRES_LIGNES.filter(([i, j]) => modele !== "puissance" || (Math.abs(Math.log(xs[i])) > 0.05 && Math.abs(Math.log(xs[j])) > 0.05));
  return parmi(valides);
}

interface Brouillon {
  xs: number[];
  k: number;
  parametre: number;
  ambiante: number;
}

/** Abscisses et paramètres d'un contexte (modèle réel du contexte). */
function brouillon(contexte: IdContexteLinearisation, modele: ModeleDonnees): Brouillon {
  switch (contexte) {
    case "refroidissement":
      return { xs: abscissesArith(parmi([2, 3, 4]), parmi([2, 3, 4])), k: entier(50, 70), parametre: pasDe(0.9, 0.96, 0.005), ambiante: entier(18, 22) };
    case "moore":
      return { xs: abscissesArith(parmi([1, 2]), parmi([2, 3])), k: entier(10, 80) * 10, parametre: pasDe(1.3, 1.45, 0.01), ambiante: 0 };
    case "bacteries":
      return { xs: abscissesArith(parmi([1, 2]), parmi([1, 2])), k: pasDe(2, 20, 0.5), parametre: pasDe(1.25, 1.5, 0.05), ambiante: 0 };
    case "decharge":
      return { xs: abscissesArith(parmi([1, 2]), parmi([1, 2])), k: pasDe(9, 12, 0.5), parametre: pasDe(0.8, 0.9, 0.01), ambiante: 0 };
    case "desintegration":
      return { xs: abscissesArith(parmi([1, 2]), parmi([2, 3])), k: entier(80, 200) * 10, parametre: pasDe(0.85, 0.94, 0.01), ambiante: 0 };
    case "kepler": {
      const r0 = pasDe(1.5, 3, 0.1);
      const raison = pasDe(1.4, 1.7, 0.05);
      const xs = Array.from({ length: 6 }, (_, i) => arrondiSignificatif(r0 * Math.pow(raison, i), 2));
      return { xs, k: pasDe(3, 8, 0.1), parametre: 1.5, ambiante: 0 };
    }
    case "metabolisme":
      return { xs: sousListe([2, 4, 8, 15, 30, 60, 120, 250, 500], 6), k: pasDe(3, 4, 0.1), parametre: parmi([0.72, 0.74, 0.75, 0.76]), ambiante: 0 };
    case "chute": {
      const pas = parmi([0.4, 0.5]);
      return { xs: abscissesArith(pas, pas), k: pasDe(1, 6, 0.05), parametre: 2, ambiante: 0 };
    }
    case "intensite":
      return { xs: sousListe([1.5, 2, 2.5, 3, 4, 5, 6, 8], 6), k: entier(20, 90) * 10, parametre: -2, ambiante: 0 };
    case "capteur":
    case "echantillon":
    case "composant":
      return brouillonNeutre(modele);
  }
}

/** Variante `choisir` : abscisses régulières positives, paramètres du modèle tiré. */
function brouillonNeutre(modele: ModeleDonnees): Brouillon {
  const xs = abscissesArith(parmi([1, 2]), parmi([1, 2]));
  switch (modele) {
    case "affine": {
      const pente = (Math.random() < 0.5 ? -1 : 1) * pasDe(0.8, 6, 0.1);
      const xMax = xs[xs.length - 1];
      // Ordonnée à l'origine : toutes les mesures restent > 1 (ln défini, la question reste ouverte).
      const pMin = pente < 0 ? -pente * xMax + 3 : 3;
      return { xs, k: arrondir(pMin + pasDe(2, 30, 0.5), 1), parametre: pente, ambiante: 0 };
    }
    case "exponentiel":
      return { xs, k: pasDe(3, 60, 0.5), parametre: Math.random() < 0.5 ? pasDe(1.2, 1.6, 0.02) : pasDe(0.62, 0.84, 0.02), ambiante: 0 };
    case "puissance":
      return { xs, k: pasDe(2, 30, 0.5), parametre: parmi([-1.5, -1, -0.5, 0.5, 1.5, 2, 2.5]), ambiante: 0 };
  }
}

/** Mesure arrondie : 3 chiffres significatifs, au dixième au moins pour la température. */
function mesure(contexte: IdContexteLinearisation, v: number): number {
  if (contexte === "refroidissement") return arrondir(v, 1);
  return arrondiSignificatif(v, 3);
}

/** Valeur « ronde » pour une cible de seuil (2 chiffres significatifs). */
function rond(v: number): number {
  return arrondiSignificatif(v, 2);
}

/** Cible de la prévision : abscisse x* (valeur) ou grandeur visée (seuil), au-delà du tableau. */
function tirerCible(contexte: IdContexteLinearisation, type: TypePrevision, b: Brouillon, modele: ModeleDonnees, ys: number[]): number {
  const xs = b.xs;
  const xMax = xs[xs.length - 1];
  if (type === "valeur") {
    if (modele === "puissance") {
      if (contexte === "metabolisme") return parmi([700, 800, 900, 1000]);
      if (contexte === "chute") return arrondir(xMax + parmi([0.5, 1, 1.5, 2]), 1);
      if (contexte === "kepler") return rond(xMax * pasDe(1.3, 2, 0.1));
      // Prévision exponentielle ou puissance du modèle neutre, éclairement : extrapolation modérée.
      if (contexte === "intensite") return rond(xMax * pasDe(1.2, 1.6, 0.1));
      return arrondir(xMax + (xs[1] - xs[0]) * entier(1, 2), 6);
    }
    const pas = xs[1] - xs[0];
    return arrondir(xMax + pas * entier(1, contexte === "capteur" || contexte === "echantillon" || contexte === "composant" ? 2 : 3), 6);
  }
  // Seuil : grandeur visée au-delà de la dernière mesure, dans le sens de variation.
  const yDernier = ys[ys.length - 1];
  const yPremier = ys[0];
  const croissant = yDernier > yPremier;
  if (contexte === "refroidissement") {
    // Température visée (entière) : écart entre 25 % et 75 % du dernier écart mesuré.
    const ecart = yDernier * pasDe(0.25, 0.75, 0.05);
    return Math.max(b.ambiante + 1, Math.round(b.ambiante + ecart));
  }
  return rond(croissant ? yDernier * pasDe(1.5, 4, 0.25) : yDernier * pasDe(0.3, 0.7, 0.05));
}

function construire(variante: ExerciceLinearisation["variante"], modele: ModeleDonnees, contexte: IdContexteLinearisation, type: TypePrevision): ExerciceLinearisation {
  for (let essai = 0; essai < 500; essai++) {
    const b = brouillon(contexte, modele);
    const ys = b.xs.map((x) => mesure(contexte, modeleEn(modele, b.k, b.parametre, x)));
    if (ys.some((y) => !(y > 0))) continue;
    if (new Set(ys).size < ys.length) continue;
    if (variante === "choisir") {
      if (ys.some((y) => y < 1)) continue;
      const autres = (["affine", "exponentiel", "puissance"] as ModeleDonnees[]).filter((m) => m !== modele);
      if (ecartAlignement({ xs: b.xs, ys }, modele) > 0.01) continue;
      if (autres.some((m) => ecartAlignement({ xs: b.xs, ys }, m) < 0.06)) continue;
    }
    const cible = tirerCible(contexte, type, b, modele, ys);
    if (!(cible > 0)) continue;
    const e: ExerciceLinearisation = { variante, modele, contexte, xs: b.xs, ys, lignes: choisirLignes(b.xs, modele), typePrevision: type, cible, ambiante: b.ambiante };
    // Prévision sensée (grandeur positive) et tolérance raisonnable (au plus 5 % de part et d'autre).
    const c = chaineLinearisation(e);
    if (!(c.prevision > 0) || !(c.yPrevision > 0)) continue;
    if ((c.accepte.prevision.max - c.accepte.prevision.min) / 2 > 0.05 * c.prevision) continue;
    return e;
  }
  throw new Error("6gen89 : aucun tableau valide trouvé");
}

export type IdVarianteLinearisation = "semilog" | "loglog" | "choisir";

export const CATALOGUE_VARIANTES: { id: IdVarianteLinearisation; label: string }[] = [
  { id: "semilog", label: "Exponentielle — semi-log (ln y en fonction de t)" },
  { id: "loglog", label: "Puissance — log-log (ln y en fonction de ln x)" },
  { id: "choisir", label: "Choisir la représentation (aucune, semi-log ou log-log)" },
];

export function construireAvecVarianteId(id: IdVarianteLinearisation): ExerciceLinearisation {
  switch (id) {
    case "semilog": {
      const type: TypePrevision = Math.random() < 0.5 ? "valeur" : "seuil";
      return construire("semilog", "exponentiel", parmi(CONTEXTES_SEMILOG), type);
    }
    case "loglog": {
      const type: TypePrevision = Math.random() < 0.5 ? "valeur" : "seuil";
      return construire("loglog", "puissance", parmi(CONTEXTES_LOGLOG), type);
    }
    case "choisir": {
      // Issue du choix tirée AVANT la construction : équilibrée.
      const modele = parmi(["affine", "exponentiel", "puissance"] as ModeleDonnees[]);
      return construire("choisir", modele, parmi(CONTEXTES_NEUTRES), "valeur");
    }
  }
}

/** Tirage libre : semi-log 40 %, log-log 40 %, choisir 20 %. */
export function genererExerciceLinearisation(): ExerciceLinearisation {
  const r = Math.random();
  return construireAvecVarianteId(r < 0.4 ? "semilog" : r < 0.8 ? "loglog" : "choisir");
}
