import type { ExerciceProblemesFonctionsReference, FamilleProbleme, SensQuestion } from "../../core/problemesFonctionsReference.types";

/**
 * Générateur gen68 — « Problèmes modélisés par une fonction de référence ». Toutes les données sont
 * tirées pour que la borne de l'ensemble-solution soit un ENTIER (aucune calculatrice) et qu'elle
 * tombe strictement à l'intérieur du domaine imposé par le contexte (la restriction au domaine est
 * donc visible dans la réponse — sauf pour le thermostat « écart inférieur à », dont l'intervalle
 * centré tient déjà dans la plage 10–30 °C) :
 * - trajet : d = s·T avec s (borne, multiple de 5) entre 50 et vmax − 10, T non entier le plus
 *   souvent (1 h 15, 1 h 30, 2 h 30, 45 min) pour le piège d'unité « 1 h 30 = 1,3 h » ;
 * - potager / aquarium : aire maximale carré parfait, volume maximal cube parfait, borne k² / k³ ;
 * - thermostat : consigne 18–22 °C, écart 2–5 °C, plage 10–30 °C ;
 * - location : forfait = s·(seuil − prix horaire), s entier entre 2 et 12 ;
 * - plaque : côté de la plaque 10–30 cm, borne k entre 3 et L − 3.
 * Les ordres d'affichage des choix sont tirés ICI (et non à l'affichage) pour que le code d'exercice
 * (`?code=`, graine) rouvre exactement le même écran.
 */

function entier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parmi<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j]!, t[i]!];
  }
  return t;
}

const SENS: SensQuestion[] = ["<", "≤", ">", "≥"];

const DUREES: { heures: number; minutes: number }[] = [
  { heures: 0, minutes: 45 },
  { heures: 1, minutes: 15 },
  { heures: 1, minutes: 30 },
  { heures: 2, minutes: 0 },
  { heures: 2, minutes: 30 },
  { heures: 3, minutes: 0 },
];

function parametresTrajet(): Record<string, number> {
  for (;;) {
    const vmax = parmi([90, 120]);
    const { heures, minutes } = parmi(DUREES);
    const t = heures + minutes / 60;
    const candidats: number[] = [];
    for (let s = 50; s <= vmax - 10; s += 5) {
      const d = s * t;
      if (Math.abs(d - Math.round(d)) < 1e-9 && d >= 60 && d <= 400) candidats.push(s);
    }
    if (candidats.length === 0) continue;
    const s = parmi(candidats);
    return { d: Math.round(s * t), vmax, heures, minutes };
  }
}

function parametresPotager(): Record<string, number> {
  const r = parmi([8, 9, 10, 11, 12]);
  return { amax: r * r, k: entier(3, r - 2) };
}

function parametresAquarium(): Record<string, number> {
  const r = parmi([5, 6, 7, 8, 9, 10]);
  return { vmax: r * r * r, k: entier(2, r - 1) };
}

function parametresThermostat(): Record<string, number> {
  return { consigne: entier(18, 22), k: entier(2, 5) };
}

function parametresLocation(): Record<string, number> {
  for (;;) {
    const prixHeure = entier(4, 15);
    const s = entier(2, 12);
    const ecart = entier(2, 20);
    const forfait = s * ecart;
    if (forfait < 20 || forfait > 200 || forfait % 5 !== 0) continue;
    if (prixHeure + ecart > 40) continue;
    return { forfait, prixHeure, seuil: prixHeure + ecart };
  }
}

function parametresPlaque(): Record<string, number> {
  const cote = parmi([10, 12, 15, 20, 25, 30]);
  return { cote, k: entier(3, cote - 3) };
}

const PARAMETRES: Record<FamilleProbleme, () => Record<string, number>> = {
  trajet: parametresTrajet,
  potager: parametresPotager,
  aquarium: parametresAquarium,
  thermostat: parametresThermostat,
  location: parametresLocation,
  plaque: parametresPlaque,
};

export const FAMILLES: FamilleProbleme[] = ["trajet", "potager", "aquarium", "thermostat", "location", "plaque"];

export const CATALOGUE_VARIANTES: { id: FamilleProbleme; label: string }[] = [
  { id: "trajet", label: "Durée d'un trajet (inverse)" },
  { id: "potager", label: "Côté d'un potager carré (racine carrée)" },
  { id: "aquarium", label: "Arête d'un aquarium cubique (racine cubique)" },
  { id: "thermostat", label: "Écart à une température (valeur absolue)" },
  { id: "location", label: "Coût horaire moyen (inverse translatée)" },
  { id: "plaque", label: "Aire d'un carré découpé (carré)" },
];

export function construireAvecVarianteId(id: string): ExerciceProblemesFonctionsReference {
  const famille = (FAMILLES as string[]).includes(id) ? (id as FamilleProbleme) : parmi(FAMILLES);
  const p = PARAMETRES[famille]();
  const sens = parmi(SENS);
  return { famille, sens, p, ordreDomaine: melange(4), ordreInterpretation: melange(4) };
}

export function genererExerciceProblemesFonctionsReference(): ExerciceProblemesFonctionsReference {
  return construireAvecVarianteId(parmi(FAMILLES));
}
