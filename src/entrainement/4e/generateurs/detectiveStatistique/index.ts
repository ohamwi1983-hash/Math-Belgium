import type {
  DonneesDetectiveStatistique,
  ExerciceCumules,
  ExerciceDetectiveStatistique,
  ExerciceDispersion,
  ExerciceGroupes,
  ExerciceMoyenne,
  ExercicePosition,
  IdDescriptionStatistique,
  TableauStat,
  TypeErreurStatistique,
  VarianteDetectiveStatistique,
} from "../../core/detectiveStatistique.types";
import {
  CONTEXTES,
  auPlusDecimales,
  calculCumules,
  calculDispersion,
  calculMoyenne,
  calculPosition,
  cumules,
  descriptionCorrecte,
  effectifTotal,
  moyennePonderee,
  moyenneValeurs,
  resultat,
  sommeProduits,
  sommeValeurs,
  trier,
} from "../../moteur/modeleDetectiveStatistique";

/**
 * Générateur de gen112 « Détective d'erreurs : statistique ». Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice (données, ordre des descriptions).
 *
 * Variante = exercice support. Dans chaque variante, le TYPE D'ERREUR (donc la ligne fausse) est
 * tiré uniformément AVANT les nombres et avant toute boucle de rejet : c'est le verdict des écrans
 * a) et b), jamais fixé par `forme`.
 * - moyenne : moyenneNonPonderee (ligne 2) | cumulMalLu (ligne 4) ;
 * - position : medianeNonTriee (ligne 1) | q1MalPlace (ligne 4) ;
 * - dispersion : moyenneNonPonderee (ligne 2) | varianceSansN (ligne 4) | sansRacine (ligne 5) ;
 * - cumules : q1MalPlace (ligne 2) | cumulMalLu (ligne 4) ;
 * - groupes : moyenneNonPonderee (ligne 2) | moyenneDesMoyennes (ligne 3).
 *
 * Les CONTRAINTES sur les données sont les mêmes pour tous les types d'une variante (aucun détail
 * des données ne trahit le verdict) et garantissent que CHAQUE erreur possible se voit : le
 * résultat final de la copie diffère du bon résultat, quel que soit le type tiré. Par exemple, en
 * « cumules », un effectif cumulé vaut toujours exactement n/4 (le piège de Q1 existe, qu'il soit
 * commis ou non) ; en « position », n est toujours un multiple de 4.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

/** k valeurs entières distinctes croissantes de [min ; max]. */
function valeursDistinctes(min: number, max: number, k: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return melanger(pool).slice(0, k).sort((a, b) => a - b);
}

/** k effectifs ≥ 1 de somme n. */
function effectifs(k: number, n: number): number[] {
  const e = Array.from({ length: k }, () => 1);
  for (let r = n - k; r > 0; r--) e[Math.floor(Math.random() * k)]! += 1;
  return e;
}

function tableau(contexte: number, k: number, n: number): TableauStat {
  const c = CONTEXTES[contexte]!;
  return { valeurs: valeursDistinctes(c.min, c.max, k), effectifs: effectifs(k, n) };
}

const egal = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// ---------------------------------------------------------------------------------------------
// Contraintes communes à tous les types d'une variante
// ---------------------------------------------------------------------------------------------

/** Toutes les erreurs de la variante changent nettement le résultat final (contrainte indépendante du type). */
function chaqueErreurSeVoit(e: DonneesDetectiveStatistique, types: readonly TypeErreurStatistique[]): boolean {
  return types.every((type) => {
    const f = { ...e, type } as DonneesDetectiveStatistique;
    // Écart net (au moins 0,1) : l'écart-type de la copie ne tombe jamais dans la tolérance de 0,01.
    return Math.abs(resultat(f, true) - resultat(f, false)) >= 0.1;
  });
}

export const TYPES_PAR_VARIANTE: Record<VarianteDetectiveStatistique, readonly TypeErreurStatistique[]> = {
  moyenne: ["moyenneNonPonderee", "cumulMalLu"],
  position: ["medianeNonTriee", "q1MalPlace"],
  dispersion: ["moyenneNonPonderee", "varianceSansN", "sansRacine"],
  cumules: ["q1MalPlace", "cumulMalLu"],
  groupes: ["moyenneNonPonderee", "moyenneDesMoyennes"],
};

function moyenneValide(e: ExerciceMoyenne): boolean {
  const T = e.tableau;
  const m = moyennePonderee(T);
  const m2 = moyenneValeurs(T);
  if (sommeValeurs(T) % 2 !== 0 || !auPlusDecimales(m, 2)) return false;
  if (egal(m, m2) || T.valeurs.some((x) => egal(x, m) || egal(x, m2))) return false;
  // Une valeur entre les deux moyennes (l'erreur de pondération change le compte) ; au moins deux
  // valeurs au-dessus de x̄ (l'erreur de cumul ne tombe pas sur l'effectif total).
  if (!T.valeurs.some((x) => x > Math.min(m, m2) && x < Math.max(m, m2))) return false;
  if (T.valeurs.filter((x) => x > m).length < 2 || T.valeurs.filter((x) => x > m2).length < 1) return false;
  const p = calculMoyenne({ ...e, type: "cumulMalLu" }, false).pourcentage;
  return p > 0 && p < 100 && chaqueErreurSeVoit(e, TYPES_PAR_VARIANTE.moyenne);
}

function positionValide(e: ExercicePosition): boolean {
  const s = e.serie;
  const n = s.length;
  const r = trier(s);
  // Médiane et Q3 sans ambiguïté (les deux valeurs autour du seuil sont égales) ; le piège de Q1
  // se voit (les valeurs de rang n/4 et n/4 + 1 diffèrent).
  if (r[n / 2 - 1] !== r[n / 2] || r[(3 * n) / 4 - 1] !== r[(3 * n) / 4] || r[n / 4 - 1] === r[n / 4]) return false;
  if (r[(3 * n) / 4]! - r[n / 4]! <= 0) return false;
  // Série non rangée : médiane différente, quartiles dans le bon ordre, écart différent.
  const nt = calculPosition({ ...e, type: "medianeNonTriee" }, true);
  if (nt.mediane === r[n / 2] || nt.q3 - nt.q1 <= 0) return false;
  // Une série nettement désordonnée (au moins la moitié des valeurs hors de leur place).
  if (s.filter((x, i) => x !== r[i]).length < n / 2) return false;
  return chaqueErreurSeVoit(e, TYPES_PAR_VARIANTE.position);
}

function dispersionValide(e: ExerciceDispersion): boolean {
  const T = e.tableau;
  const m = moyennePonderee(T);
  if (sommeValeurs(T) % 2 !== 0 || !auPlusDecimales(m, 1) || !auPlusDecimales(2 * m, 0)) return false;
  if (egal(m, moyenneValeurs(T))) return false;
  const k = calculDispersion({ ...e, type: "sansRacine" }, false);
  if (k.varianceArrondie <= 1.5) return false;
  return chaqueErreurSeVoit(e, TYPES_PAR_VARIANTE.dispersion);
}

function cumulesValide(e: ExerciceCumules): boolean {
  const T = e.tableau;
  const n = effectifTotal(T);
  const C = cumules(T);
  const i0 = C.indexOf(n / 4);
  // Le piège de Q1 existe toujours (un cumulé vaut exactement n/4, ni sur la première ligne ni trop
  // tard) ; aucun cumulé ne vaut 3n/4 (Q3 sans piège) ; Q1 < Q3.
  if (i0 < 1 || i0 > T.valeurs.length - 3) return false;
  if (C.includes((3 * n) / 4)) return false;
  const k = calculCumules({ ...e, type: "cumulMalLu" }, false);
  if (k.iQ3 <= k.iQ1) return false;
  return chaqueErreurSeVoit(e, TYPES_PAR_VARIANTE.cumules);
}

function groupesValide(e: ExerciceGroupes): boolean {
  const T = e.tableau;
  const nA = effectifTotal(T);
  const mA = moyennePonderee(T);
  const c = CONTEXTES[e.contexte]!;
  if (sommeValeurs(T) % 2 !== 0 || !auPlusDecimales(mA, 2)) return false;
  if (Math.abs(nA - e.nB) < 6 || Math.abs(mA - e.moyenneB) < 1) return false;
  if (e.moyenneB <= c.min || e.moyenneB >= c.max) return false;
  const reunie = (sommeProduits(T) + e.nB * e.moyenneB) / (nA + e.nB);
  if (!auPlusDecimales(reunie, 2)) return false;
  if (egal(mA, moyenneValeurs(T))) return false;
  return chaqueErreurSeVoit(e, TYPES_PAR_VARIANTE.groupes);
}

// ---------------------------------------------------------------------------------------------
// Tirage des nombres, type d'erreur déjà fixé
// ---------------------------------------------------------------------------------------------

function tirerMoyenne(type: ExerciceMoyenne["type"]): ExerciceMoyenne {
  for (;;) {
    const contexte = entier(0, CONTEXTES.length - 1);
    const e: ExerciceMoyenne = { variante: "moyenne", type, contexte, tableau: tableau(contexte, 4, choisir([20, 25, 40, 50])) };
    if (moyenneValide(e)) return e;
  }
}

function tirerPosition(type: ExercicePosition["type"]): ExercicePosition {
  for (;;) {
    const contexte = entier(0, CONTEXTES.length - 1);
    const c = CONTEXTES[contexte]!;
    const n = choisir([12, 16]);
    const serie = Array.from({ length: n }, () => entier(c.min, c.max));
    const e: ExercicePosition = { variante: "position", type, contexte, serie };
    if (positionValide(e)) return e;
  }
}

function tirerDispersion(type: ExerciceDispersion["type"]): ExerciceDispersion {
  for (;;) {
    const contexte = entier(0, CONTEXTES.length - 1);
    const e: ExerciceDispersion = { variante: "dispersion", type, contexte, tableau: tableau(contexte, 4, choisir([10, 20])) };
    if (dispersionValide(e)) return e;
  }
}

function tirerCumules(type: ExerciceCumules["type"]): ExerciceCumules {
  for (;;) {
    const contexte = entier(0, CONTEXTES.length - 1);
    const e: ExerciceCumules = { variante: "cumules", type, contexte, tableau: tableau(contexte, 5, choisir([20, 40])) };
    if (cumulesValide(e)) return e;
  }
}

function tirerGroupes(type: ExerciceGroupes["type"]): ExerciceGroupes {
  for (;;) {
    const contexte = entier(0, CONTEXTES.length - 1);
    const c = CONTEXTES[contexte]!;
    const T = tableau(contexte, 4, entier(10, 25));
    const nB = entier(8, 30);
    const moyenneB = entier(2 * c.min + 2, 2 * c.max - 2) / 2;
    const e: ExerciceGroupes = { variante: "groupes", type, contexte, tableau: T, nB, moyenneB };
    if (groupesValide(e)) return e;
  }
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2 : la bonne + 3 leurres (toujours FAUX pour cette ligne)
// ---------------------------------------------------------------------------------------------

export const LEURRES: Record<TypeErreurStatistique, IdDescriptionStatistique[]> = {
  moyenneNonPonderee: ["moyenneMilieu", "moyenneExtremes", "moyenneCumules"],
  cumulMalLu: ["cumulDirect", "cumulAdditionner", "cumulDiviserK"],
  medianeNonTriee: ["medianeMoyenne", "medianeDoublons", "medianeRangSeuil"],
  q1MalPlace: ["q1MoitieSuperieure", "q1SeuilMoitie", "q1MoitieMediane"],
  sansRacine: ["nMoinsUn", "ecartMoitie", "ecartCarre"],
  varianceSansN: ["nMoinsUn", "sansCarre", "diviserK"],
  moyenneDesMoyennes: ["sommeMoyennes", "ponderationInversee", "plusGrandeMoyenne"],
};

function avecOptions(d: DonneesDetectiveStatistique): ExerciceDetectiveStatistique {
  const bonne = descriptionCorrecte(d) as TypeErreurStatistique;
  return { ...d, options: melanger([bonne, ...LEURRES[bonne]]) };
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveStatistique; label: string }[] = [
  { id: "moyenne", label: "Moyenne pondérée et pourcentage au-dessus de la moyenne" },
  { id: "position", label: "Médiane, quartiles et écart interquartile (série brute)" },
  { id: "dispersion", label: "Variance et écart-type" },
  { id: "cumules", label: "Effectifs cumulés : Q1, Q3 et pourcentage entre les deux" },
  { id: "groupes", label: "Moyenne de deux groupes réunis" },
];

export function genererDetectiveStatistique(variante: VarianteDetectiveStatistique): ExerciceDetectiveStatistique {
  switch (variante) {
    case "moyenne":
      return avecOptions(tirerMoyenne(choisir(["moyenneNonPonderee", "cumulMalLu"] as const)));
    case "position":
      return avecOptions(tirerPosition(choisir(["medianeNonTriee", "q1MalPlace"] as const)));
    case "dispersion":
      return avecOptions(tirerDispersion(choisir(["moyenneNonPonderee", "varianceSansN", "sansRacine"] as const)));
    case "cumules":
      return avecOptions(tirerCumules(choisir(["q1MalPlace", "cumulMalLu"] as const)));
    case "groupes":
      return avecOptions(tirerGroupes(choisir(["moyenneNonPonderee", "moyenneDesMoyennes"] as const)));
  }
}

export function construireAvecVariante(id: string): ExerciceDetectiveStatistique {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceDetectiveStatistique();
  return genererDetectiveStatistique(id as VarianteDetectiveStatistique);
}

/** Tirage libre : une variante au hasard. */
export function genererExerciceDetectiveStatistique(): ExerciceDetectiveStatistique {
  return genererDetectiveStatistique(choisir(CATALOGUE_VARIANTES).id);
}
