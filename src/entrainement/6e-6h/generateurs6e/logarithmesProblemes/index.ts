import type { ExerciceLogarithmesProblemes, FamilleLogarithmesProblemes } from "../../core6e/logarithmesProblemes.types";
import { construireA, construireA_resoudreT, construireA_resoudreTaux, construireA_tauxDecroissance } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";
import { construireF } from "./familles/F";
import { construireG } from "./familles/G";
import { tirerParmi } from "./aleatoire";

/** Tirage ÉQUIPROBABLE de la FAMILLE (spec explicite : "Tirage aléatoire d'1 famille parmi 7 (A à
 * G, équiprobable)") — le sous-type/contexte est ensuite tiré À L'INTÉRIEUR du constructeur de
 * chaque famille, même principe que `exponentiellesProblemes/index.ts` (6gen12). */
export const CATALOGUE_FAMILLES: { id: FamilleLogarithmesProblemes; label: string }[] = [
  { id: "A", label: "A — Croissance/décroissance, résoudre pour t ou le taux" },
  { id: "B", label: "B — Modèle à 2 points, extrapolation" },
  { id: "C", label: "C — Radioactivité, demi-vie" },
  { id: "D", label: "D — Asymptote non nulle" },
  { id: "E", label: "E — Échelle logarithmique généralisée" },
  { id: "F", label: "F — Courbe logistique généralisée" },
  { id: "G", label: "G — Équilibre offre/demande" },
];

const CONSTRUCTEURS: Record<FamilleLogarithmesProblemes, () => ExerciceLogarithmesProblemes> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
  E: construireE,
  F: construireF,
  G: construireG,
};

export function construireAvecFamilleId(id: FamilleLogarithmesProblemes): ExerciceLogarithmesProblemes {
  return CONSTRUCTEURS[id]();
}

export function genererExerciceLogarithmesProblemes(): ExerciceLogarithmesProblemes {
  return construireAvecFamilleId(tirerParmi(CATALOGUE_FAMILLES.map((c) => c.id)));
}

/**
 * Catalogue FIN pour le sélecteur dev (`SelecteurVarianteDev`) — une entrée par
 * FAMILLE/SOUS-TYPE/VARIANTE/CONTEXTE réellement distinct côté écrans, pour pouvoir forcer
 * déterministement chaque cas lors des vérifications Playwright (7 familles, mais certaines ont
 * plusieurs sous-types/contextes structurellement différents — voir le prompt, point 9). Jamais
 * utilisé par le tirage aléatoire normal de l'élève (`genererExerciceLogarithmesProblemes`
 * ci-dessus, qui reste un tirage à 7 branches équiprobables).
 */
export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "A-resoudreT-simple", label: "A1 — Résoudre pour t (seuil simple)" },
  { id: "A-resoudreT-fenetre", label: "A1 — Résoudre pour t (fenêtre, 2 seuils)" },
  { id: "A-resoudreTaux", label: "A2 — Résoudre pour le taux (racine n-ième)" },
  { id: "A-tauxDecroissance", label: "A3 — Taux depuis un point de décroissance" },
  { id: "B", label: "B — Modèle à 2 points, extrapolation" },
  { id: "C-versT", label: "C — Demi-vie (λ donné, trouver T)" },
  { id: "C-versLambda", label: "C — Demi-vie (T donné, trouver λ)" },
  { id: "D", label: "D — Asymptote non nulle" },
  { id: "E-pH-deduire", label: "E — pH (avec déduction de a, b)" },
  { id: "E-pH-direct", label: "E — pH (a, b donnés)" },
  { id: "E-decibels-deduire", label: "E — Décibels (avec déduction de a, b)" },
  { id: "E-decibels-direct", label: "E — Décibels (a, b donnés)" },
  { id: "E-magnitude-deduire", label: "E — Magnitude sismique (avec déduction de a, b)" },
  { id: "E-magnitude-direct", label: "E — Magnitude sismique (a, b donnés)" },
  { id: "F", label: "F — Courbe logistique généralisée" },
  { id: "G", label: "G — Équilibre offre/demande" },
];

export function construireAvecVarianteId(id: string): ExerciceLogarithmesProblemes {
  switch (id) {
    case "A-resoudreT-simple":
      return construireA_resoudreT("simple");
    case "A-resoudreT-fenetre":
      return construireA_resoudreT("fenetre");
    case "A-resoudreTaux":
      return construireA_resoudreTaux();
    case "A-tauxDecroissance":
      return construireA_tauxDecroissance();
    case "B":
      return construireB();
    case "C-versT":
      return construireC("versT");
    case "C-versLambda":
      return construireC("versLambda");
    case "D":
      return construireD();
    case "E-pH-deduire":
      return construireE("pH", true);
    case "E-pH-direct":
      return construireE("pH", false);
    case "E-decibels-deduire":
      return construireE("decibels", true);
    case "E-decibels-direct":
      return construireE("decibels", false);
    case "E-magnitude-deduire":
      return construireE("magnitude", true);
    case "E-magnitude-direct":
      return construireE("magnitude", false);
    case "F":
      return construireF();
    case "G":
      return construireG();
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}
