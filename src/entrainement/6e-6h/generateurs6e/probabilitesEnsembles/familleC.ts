import type { ConditionnelleFamilleC, ContexteFamilleC, DemandeEcran3FamilleC, ExerciceFamilleC, ZoneVennTrois } from "../../core6e/probabilitesEnsembles.types";

/**
 * Couche A (6e) — famille C de `6gen30` (« diagramme de Venn à trois ensembles », décision du
 * professeur) : on tire directement les effectifs ENTIERS des 8 zones ; les données de l'énoncé
 * (n(A), n(B), n(C), les trois intersections deux à deux, l'intersection des trois, le total) en
 * découlent, et toutes les réponses aussi (aucune probabilité flottante stockée).
 *
 * Bornes : centre 1 à 6, zones « deux seulement » 1 à 8, zones « un seul » 2 à 14, extérieur 1 à 10
 * (aucune zone vide : chaque zone raconte un cas réel ; total de 20 à 87). Les écritures restent
 * petites (deux chiffres) et la méthode « du centre vers l'extérieur » est toujours nécessaire.
 */

const CONTEXTES_C: readonly ContexteFamilleC[] = [
  {
    id: "langues",
    introduction: "Dans une école, on interroge les {N} élèves de 6e année sur les langues qu'ils étudient.",
    individu: "un élève",
    definitions: ["l'élève étudie l'anglais", "l'élève étudie le néerlandais", "l'élève étudie l'allemand"],
  },
  {
    id: "sports",
    introduction: "Un club omnisports compte {N} membres.",
    individu: "un membre",
    definitions: ["le membre pratique la natation", "le membre pratique le tennis", "le membre pratique le football"],
  },
  {
    id: "abonnements",
    introduction: "Dans un immeuble de {N} ménages, on relève les abonnements de chaque ménage.",
    individu: "un ménage",
    definitions: ["le ménage est abonné à un service de musique", "le ménage est abonné à un service de films", "le ménage est abonné à un journal en ligne"],
  },
];

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function tirerZones(): Record<ZoneVennTrois, number> {
  return {
    "111": tirerEntier(1, 6),
    "110": tirerEntier(1, 8),
    "101": tirerEntier(1, 8),
    "011": tirerEntier(1, 8),
    "100": tirerEntier(2, 14),
    "010": tirerEntier(2, 14),
    "001": tirerEntier(2, 14),
    "000": tirerEntier(1, 10),
  };
}

const INDICES = [0, 1, 2] as const;

function tirerConditionnelle(): ConditionnelleFamilleC {
  const x = tirerParmi(INDICES);
  if (Math.random() < 0.5) return { type: "XsachantAuMoinsDeux", x };
  const y = tirerParmi(INDICES.filter((i) => i !== x));
  return { type: "XsachantNonY", x, y };
}

/** Construction avec la demande de l'écran 3 fixée (variante), tout le reste tiré au hasard. */
export function construireFamilleC(demandeEcran3: DemandeEcran3FamilleC): ExerciceFamilleC {
  const zones = tirerZones();
  const total = Object.values(zones).reduce((a, b) => a + b, 0);
  return { famille: "C", contexte: tirerParmi(CONTEXTES_C), zones, total, demandeEcran3, conditionnelle: tirerConditionnelle() };
}

const DEMANDES: readonly DemandeEcran3FamilleC[] = ["union", "exactementUn", "auMoinsDeux"];

export function genererFamilleC(): ExerciceFamilleC {
  return construireFamilleC(tirerParmi(DEMANDES));
}

export { CONTEXTES_C };
