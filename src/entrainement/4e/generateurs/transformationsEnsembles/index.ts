import type {
  ExerciceTransformationsEnsembles,
  Intervalle,
  NiveauTransformations,
  Transformation,
  TypeTransformation,
} from "../../core/transformationsEnsembles.types";
import { appliquer, axeDe, natureDe } from "../../moteur/modeleTransformationsEnsembles";

/**
 * Générateur de « Domaine et ensemble image après transformations » (gen72). Tout le hasard passe
 * par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le
 * QR code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - jamais deux transformations consécutives du même type (TH puis TH, SOX puis SOX…) ;
 * - niveau 2 : au moins un étirement ou une compression ;
 * - au plus 2 symétries et au plus 2 étirements / compressions ; jamais deux transformations d'un
 *   même axe qui s'annulent (EH 3 puis CH 3, ensemble revenu à son point de départ) ;
 * - toutes les bornes, intermédiaires comprises, sont des entiers de valeur absolue ≤ 30 ;
 * - un intervalle borné a toujours un crochet ouvert et un crochet fermé (l'échange des crochets
 *   d'une symétrie se voit) ;
 * - par défaut, chaque ensemble subit au moins une transformation ; un ensemble inchangé (toutes les
 *   transformations du même axe) n'est tiré qu'une fois sur sept environ — c'est le cas particulier
 *   des évaluations (`profil.ts`).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

const TYPES_NIVEAU_1: TypeTransformation[] = ["TH", "TV", "SOX", "SOY"];
const TYPES_NIVEAU_2: TypeTransformation[] = ["TH", "TV", "SOX", "SOY", "EH", "CH", "EV", "CV"];
const BORNE_MAX = 30;
const PROBA_INCHANGE = 1 / 7;

function valeurPour(type: TypeTransformation): number {
  if (type === "SOX" || type === "SOY") return 0;
  if (type === "TH" || type === "TV") return choisir([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
  return choisir([2, 3, 4]);
}

/** Ensemble de départ : intervalle borné (un crochet ouvert, un fermé) ou demi-droite. */
function intervalleDeDepart(): Intervalle {
  if (Math.random() < 0.5) {
    const gauche = entier(-8, 5);
    const droite = gauche + entier(2, 9);
    const gaucheFerme = Math.random() < 0.5;
    return { gauche, gaucheFerme, droite, droiteFerme: !gaucheFerme };
  }
  const borne = entier(-8, 8);
  const ferme = Math.random() < 0.75;
  return Math.random() < 0.5
    ? { gauche: borne, gaucheFerme: ferme, droite: Infinity, droiteFerme: false }
    : { gauche: -Infinity, gaucheFerme: false, droite: borne, droiteFerme: ferme };
}

function bornesCorrectes(i: Intervalle): boolean {
  return [i.gauche, i.droite].every((b) => !Number.isFinite(b) || (Number.isInteger(b) && Math.abs(b) <= BORNE_MAX));
}

/** Tous les intervalles de la chaîne (départ compris) ont des bornes entières et modérées. */
function chaineCorrecte(depart: Intervalle, transformations: Transformation[], axe: "H" | "V"): boolean {
  let courant = depart;
  if (!bornesCorrectes(courant)) return false;
  for (const t of transformations) {
    if (axeDe(t) !== axe) continue;
    courant = appliquer(t, courant);
    if (!bornesCorrectes(courant)) return false;
  }
  return true;
}

/** Transformations d'un axe qui s'annulent (EH k et CH k, EV k et CV k, ou un ensemble qui revient à
 * son point de départ) : enchaînement artificiel, rejeté. */
function sansAnnulation(depart: Intervalle, transformations: Transformation[], axe: "H" | "V"): boolean {
  const liste = transformations.filter((t) => axeDe(t) === axe);
  for (const [etire, comprime] of [["EH", "CH"], ["EV", "CV"]] as const) {
    if (liste.some((a) => a.type === etire && liste.some((b) => b.type === comprime && b.valeur === a.valeur))) return false;
  }
  if (liste.length >= 2) {
    const final = liste.reduce((i, t) => appliquer(t, i), depart);
    if (final.gauche === depart.gauche && final.droite === depart.droite && final.gaucheFerme === depart.gaucheFerme && final.droiteFerme === depart.droiteFerme) return false;
  }
  return true;
}

function tirerTypes(niveau: NiveauTransformations, n: number, inchange: boolean): TypeTransformation[] | null {
  const pool = niveau === 1 ? TYPES_NIVEAU_1 : TYPES_NIVEAU_2;
  // Ensemble inchangé : toutes les transformations sur un même axe.
  const axeUnique = inchange ? choisir(["H", "V"] as const) : null;
  const disponibles = axeUnique ? pool.filter((t) => axeDe(t) === axeUnique) : pool;
  const types: TypeTransformation[] = [];
  for (let i = 0; i < n; i++) {
    const possibles = disponibles.filter((t) => t !== types[i - 1]);
    types.push(choisir(possibles));
  }
  if (niveau === 2 && !types.some((t) => natureDe(t) === "D")) return null;
  // Au plus 2 symétries et 2 dilatations : pas d'enchaînement artificiel, et des formes assez
  // fréquentes pour que chaque série retrouve celle de la série A (tirage équilibré).
  if (types.filter((t) => natureDe(t) === "S").length > 2 || types.filter((t) => natureDe(t) === "D").length > 2) return null;
  if (!inchange && (!types.some((t) => axeDe(t) === "H") || !types.some((t) => axeDe(t) === "V"))) return null;
  return types;
}

export function genererTransformationsEnsembles(niveau: NiveauTransformations, n: number, inchange?: boolean): ExerciceTransformationsEnsembles {
  const avecInchange = inchange ?? Math.random() < PROBA_INCHANGE;
  for (;;) {
    const types = tirerTypes(niveau, n, avecInchange);
    if (!types) continue;
    const transformations = types.map((type) => ({ type, valeur: valeurPour(type) }));
    const domaine = intervalleDeDepart();
    const image = intervalleDeDepart();
    if (!chaineCorrecte(domaine, transformations, "H") || !chaineCorrecte(image, transformations, "V")) continue;
    if (!sansAnnulation(domaine, transformations, "H") || !sansAnnulation(image, transformations, "V")) continue;
    return { niveau, domaine, image, transformations };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

const NOMBRES = [2, 3, 4, 5] as const;

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  ...NOMBRES.map((n) => ({ id: `n1-${n}`, label: `Translations et symétries — ${n} transformations` })),
  ...NOMBRES.map((n) => ({ id: `n2-${n}`, label: `Avec étirements et compressions — ${n} transformations` })),
];

export function construireAvecVariante(id: string): ExerciceTransformationsEnsembles {
  const m = /^n([12])-([2-5])$/.exec(id);
  if (!m) return genererExerciceTransformationsEnsembles();
  return genererTransformationsEnsembles(Number(m[1]) as NiveauTransformations, Number(m[2]));
}

/** Tirage libre : niveau 1, 2 à 4 transformations (le niveau 2 et les 5 transformations se choisissent). */
export function genererExerciceTransformationsEnsembles(): ExerciceTransformationsEnsembles {
  return genererTransformationsEnsembles(1, entier(2, 4));
}
