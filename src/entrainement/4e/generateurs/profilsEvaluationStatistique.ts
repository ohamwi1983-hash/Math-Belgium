/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs du chapitre 4 de 4e (« Statistique descriptive », gen30–gen38). Décisions de
 * l'utilisateur (voir `.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ») :
 * - par défaut, une évaluation ne tire que des exercices COMPLETS (toutes les étapes à faire, aucun
 *   raccourci) ; un cas particulier ne sort que si le professeur coche « inclure un cas
 *   particulier » pour la ligne — et c'est alors le même dans toutes les séries ;
 * - calculatrice interdite → seulement des calculs faisables à la main ; autorisée → seulement des
 *   cas qui l'exigent (`calcul` absent = sans objet).
 *
 * Mesures (5 000 tirages par variante, scratchpad eq-4e4) qui fondent chaque choix — voir le
 * commentaire de chaque profil. Un cas TRIVIAL et rare (ex. tous les effectifs égaux, < 1 %) est
 * marqué cas particulier SANS libellé : il est simplement exclu des évaluations (aucune case
 * proposée, rien d'intéressant à imposer). Un vrai cas pédagogique (médiane entre deux valeurs,
 * série bimodale, piège de l'étendue) n'est PAS un cas particulier.
 *
 * Plusieurs caractéristiques à la fois → identifiants joints par « + » (jamais tirés pour la case).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceTableauFrequences } from "../core/tableauFrequences.types";
import type { ExerciceHistogramme } from "../core/histogramme.types";
import type { ExerciceMoyennePonderee } from "../core/moyennePonderee.types";
import type { ExerciceMediane } from "../core/mediane.types";
import type { ExerciceDispersion } from "../core/dispersion.types";
import type { ExerciceSynthese } from "../core/exerciceSynthese.types";
import type { ExerciceBienaymeTchebychev } from "../core/bienaymeTchebychev.types";
import type { ExerciceComparaisonSeries } from "../core/comparaisonSeries.types";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

const tousEgaux = (t: number[]) => t.length > 0 && t.every((x) => x === t[0]);

/** Valeur entière à 1e-9 près (√ d'une variance stockée en décimal exact). */
const estEntier = (x: number) => Number.isFinite(x) && Math.abs(x - Math.round(x)) < 1e-9;

/** Nombre de décimales significatives (après arrondi à 1e-6, pour absorber le bruit flottant). */
function decimales(x: number): number {
  const s = String(Math.round(x * 1e6) / 1e6);
  return s.includes(".") ? s.split(".")[1].length : 0;
}

/** gen30 — tableau de fréquences. n ∈ {10, 16, 20, 25} : toutes les fréquences ont au plus deux
 * décimales (0 % de cas « calculatrice ») → `calcul` sans objet. Tous les effectifs égaux : 0,7 %,
 * trivial → exclu sans case. */
export function profilTableauFrequences(e: ExerciceTableauFrequences): ProfilInstance {
  return { casParticulier: cas([tousEgaux(e.lignes.map((l) => l.effectif)) && "effectifs-egaux"]) };
}

/** gen31 — classes et histogramme. n divise toujours 100 (fréquences entières) → `calcul` sans
 * objet. Effectifs de classe tous égaux : ~1 %, trivial → exclu sans case. */
export function profilHistogramme(e: ExerciceHistogramme): ProfilInstance {
  return { casParticulier: cas([tousEgaux(e.classes.map((c) => c.effectif)) && "effectifs-egaux"]) };
}

/** gen32 — moyenne pondérée. Moyenne toujours à au plus deux décimales → `calcul` sans objet.
 * Effectifs tous égaux (la moyenne pondérée devient une moyenne simple) : ~0,8 % → exclu sans case. */
export function profilMoyennePonderee(e: ExerciceMoyennePonderee): ProfilInstance {
  const effectifs = e.variante === "discrete" ? e.lignes.map((l) => l.effectif) : e.classes.map((c) => c.effectif);
  return { casParticulier: cas([tousEgaux(effectifs) && "effectifs-egaux"]) };
}

export const LIBELLE_CAS_MEDIANE = "Inclure un cas particulier (effectif cumulé exactement égal à n/2, n/4 ou 3n/4, ou deux quartiles égaux)";

/** gen33 — médiane, quartiles, mode.
 * - discrète : un effectif cumulé ÉGAL à un seuil (n/2 : 9 % ; n/4 ou 3n/4 : 8,5 %) — on passe à la
 *   valeur suivante, cas limite de la règle « dépasse strictement » ; deux quartiles confondus
 *   (Q₁ = Q₂ ou Q₂ = Q₃ : 16,7 %) ;
 * - classes : effectif cumulé égal à un seuil (médiane 15 %, Q₁/Q₃ 15 %) — la valeur se lit
 *   directement sur une borne de classe, sans lecture graphique entre deux points.
 * Plusieurs modes (28 %) : vrai cas pédagogique, gardé. `calcul` sans objet. */
export function profilMediane(e: ExerciceMediane): ProfilInstance {
  const seuils = [e.seuil, e.seuilQ1, e.seuilQ3];
  if (e.variante === "discrete") {
    return {
      casParticulier: cas([
        e.lignes.some((l) => seuils.includes(l.effectifCumule)) && "seuil-atteint",
        (e.q1 === e.mediane || e.mediane === e.q3) && "quartiles-confondus",
      ]),
    };
  }
  return { casParticulier: cas([e.classes.some((c) => seuils.includes(c.effectifCumule)) && "seuil-atteint"]) };
}

/** gen34 — variance et écart-type. L'écart-type demandé n'est calculable sans calculatrice que si
 * la variance est un carré parfait (σ entier : 1,5 % des tirages, 74 séries distinctes sur 5 000)
 * → `'exacte'` seulement dans ce cas, sinon `'calculatrice'`. x̄ est toujours entier (construction).
 * Effectifs tous égaux : 0,8 % → exclu sans case. */
export function profilDispersion(e: ExerciceDispersion): ProfilInstance {
  return {
    casParticulier: cas([tousEgaux(e.lignes.map((l) => l.effectif)) && "effectifs-egaux"]),
    calcul: estEntier(Math.sqrt(e.varianceAttendue)) ? "exacte" : "calculatrice",
  };
}

/** gen35 — exercice de synthèse : mêmes cas que gen33 pour la partie médiane / quartiles (discrète :
 * seuil atteint 11,5 % + 9,5 %, quartiles confondus 19,9 % ; classes : seuil atteint 23,2 % +
 * 10,9 %). Calculatrice : l'écart-type n'est faisable à la main que si σ est entier (discrète 1,6 %,
 * classes 0,3 %). Le pourcentage de Bienaymé-Tchebychev est toujours k = 2 (75 %). */
export function profilExerciceSynthese(e: ExerciceSynthese): ProfilInstance {
  const seuils = [e.seuil, e.seuilQ1, e.seuilQ3];
  const cumuls = e.variante === "discrete" ? e.lignes.map((l) => l.effectifCumule) : e.classes.map((c) => c.effectifCumule);
  return {
    casParticulier: cas([
      cumuls.some((c) => seuils.includes(c)) && "seuil-atteint",
      e.variante === "discrete" && (e.q1 === e.mediane || e.mediane === e.q3) && "quartiles-confondus",
    ]),
    calcul: estEntier(Math.sqrt(e.varianceAttendue)) ? "exacte" : "calculatrice",
  };
}

/** gen37 — Bienaymé-Tchebychev. Faisable à la main seulement si k est entier ET 1/k² s'écrit en
 * pourcentage à au plus deux décimales (k = 2 : 75 % ; 4 : 93,75 % ; 5 : 96 % ; 10 : 99 %) ; sinon
 * il faut une racine carrée (pourcentage → k) ou une division non décimale → `'calculatrice'`.
 * Variantes « … vers x̄ » : x̄ est le centre de l'intervalle, aucun k → `calcul` sans objet.
 * Part « à la main » : 14 à 16 % (intervalle → pourcentage / nombre, … vers x̄), 0,9 à 2,1 %
 * (pourcentage ou nombre → intervalle / σ). Aucun cas particulier. */
export function profilBienaymeTchebychev(e: ExerciceBienaymeTchebychev): ProfilInstance {
  if (e.variante === "intervalleVersXBar" || e.variante === "nombreVersXBar") return { casParticulier: null };
  const k = Math.round(e.kAttendu * 1e6) / 1e6;
  return { casParticulier: null, calcul: Number.isInteger(k) && decimales(100 / (k * k)) <= 2 ? "exacte" : "calculatrice" };
}

export const LIBELLE_CAS_COMPARAISON = "Inclure une question de lecture (effectif ou fréquence cumulée à une valeur, ou dans une tranche)";

/** gen38 — comparaison de deux séries. Le TYPE de question est tiré au hasard dans une même
 * variante : « seuil » (une lecture d'effectif ou de fréquence cumulée, ou deux lectures et une
 * soustraction) est bien plus court qu'une comparaison argumentée (tableaux : 51 % de « seuil » ;
 * graphique : 25 % ; récapitulatif : 0 %) → cas particulier. Médianes, σ, écarts interquartiles
 * jamais égaux entre A et B (0 %). `calcul` sans objet. */
export function profilComparaisonSeries(e: ExerciceComparaisonSeries): ProfilInstance {
  // `forme` : le type de question (centrage, dispersion, interprétation…) est imposé identique
  // d'une série à l'autre, question par question (décision de l'utilisateur).
  return { casParticulier: e.question.type === "seuil" ? "lecture-seuil" : null, forme: e.question.type };
}
