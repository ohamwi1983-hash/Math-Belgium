import type { EnsembleReelGuide, MorceauIntervalle } from "../../core6e/ensembleReel.types";
import { ensembleDeuxMorceaux, ensemblePrivePoints, ensembleReel, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../ensembleReel";

/**
 * Construction des OPTIONS (bonne(s) réponse(s) + distracteurs plausibles) pour les 2 comboboxes
 * indépendantes de l'écran 5 ("bijective sur X dans Y") — Couche A, générées à la génération de
 * l'exercice (jamais recalculées côté présentation, voir `core6e/injectiviteFonctions.types.ts`).
 *
 * Comparaison structurelle LOCALE (jamais `moteur6e/verificationEnsembleReel.ts` : `generateurs6e/`
 * ne peut jamais importer `moteur6e/`, règle d'architecture non négociable) — sert uniquement à
 * dédupliquer un distracteur qui coïnciderait par hasard avec une réponse déjà correcte, jamais à
 * noter une réponse élève (la vraie vérification vit côté Couche B).
 */
function memeValeur(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) < 1e-6;
}

function memeMorceau(a: MorceauIntervalle, b: MorceauIntervalle): boolean {
  return memeValeur(a.inf, b.inf) && memeValeur(a.sup, b.sup) && a.infInclus === b.infInclus && a.supInclus === b.supInclus;
}

function structurellementEgal(a: EnsembleReelGuide, b: EnsembleReelGuide): boolean {
  if (a.forme !== b.forme) return false;
  if (a.forme === "reel") return true;
  if (a.forme === "prive_points") {
    return a.points.length === b.points.length && a.points.every((v, i) => memeValeur(v, b.points[i]));
  }
  return a.morceaux.length === b.morceaux.length && a.morceaux.every((m, i) => memeMorceau(m, b.morceaux[i]));
}

/** Bascule l'inclusion des bornes FINIES d'un intervalle (piège classique : oublier qu'un pôle/pivot
 * exclu se note avec un crochet ouvert). Sans effet sur `-∞`/`+∞` (toujours ouverts) ni sur
 * `reel`/`prive_points`. */
function toggleInclusion(e: EnsembleReelGuide): EnsembleReelGuide {
  if (e.forme !== "intervalles") return e;
  return {
    forme: "intervalles",
    points: [],
    morceaux: e.morceaux.map((m) => ({
      inf: m.inf,
      sup: m.sup,
      infInclus: m.inf === null ? m.infInclus : !m.infInclus,
      supInclus: m.sup === null ? m.supInclus : !m.supInclus,
    })),
  };
}

/** Distracteur classique : inverser le sens d'une demi-droite (`[k;+∞[` proposé à la place de
 * `]-∞;k]`, ou l'inverse). Sans effet sur un intervalle borné des deux côtés / `reel`/`prive_points`. */
function inverserSens(e: EnsembleReelGuide): EnsembleReelGuide | null {
  if (e.forme !== "intervalles" || e.morceaux.length !== 1) return null;
  const m = e.morceaux[0];
  if (m.inf === null && m.sup !== null) return ensembleUnMorceau(versLeHautDepuis(m.sup, m.supInclus));
  if (m.sup === null && m.inf !== null) return ensembleUnMorceau(versLeBasJusque(m.inf, m.infInclus));
  return null;
}

/**
 * Construit la liste des options d'une combobox : les réponses `corrects` (1 ou 2 — les 2 moitiés
 * symétriques d'un pivot le cas échéant) suivies de distracteurs plausibles, dédupliqués. Toujours
 * au moins 3 options, au plus 5 (checklist UI : "plusieurs intervalles").
 */
export function construireOptionsCombobox(corrects: EnsembleReelGuide[]): EnsembleReelGuide[] {
  const options: EnsembleReelGuide[] = [...corrects];
  const ajouter = (candidat: EnsembleReelGuide | null) => {
    if (candidat !== null && !options.some((o) => structurellementEgal(o, candidat))) options.push(candidat);
  };

  ajouter(ensembleReel());
  for (const c of corrects) ajouter(toggleInclusion(c));
  for (const c of corrects) ajouter(inverserSens(c));

  // Union des 2 moitiés — distracteur ciblé : croire (à tort) que la réunion des 2 branches reste
  // un intervalle d'injectivité, alors que ce n'en est pas un (f n'y est pas injective).
  if (corrects.length === 2 && corrects[0].forme === "intervalles" && corrects[1].forme === "intervalles") {
    ajouter(ensembleDeuxMorceaux(corrects[0].morceaux[0], corrects[1].morceaux[0]));
  }

  // Distracteurs dédiés à un ensemble "prive_points" (image d'une fonction homographique) : un
  // point exclu légèrement décalé, et une demi-droite plausible mais fausse.
  for (const c of corrects) {
    if (c.forme === "prive_points" && c.points.length === 1) {
      ajouter(ensemblePrivePoints([c.points[0] + 1]));
      ajouter(ensembleUnMorceau(versLeHautDepuis(c.points[0], true)));
    }
  }

  return melanger(options.slice(0, 5));
}

/** Fisher-Yates — les bonnes réponses ne doivent jamais systématiquement apparaître en tête de
 * liste (elles le seraient sinon : `corrects` est toujours ajouté en premier ci-dessus). */
function melanger<T>(tableau: T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}
