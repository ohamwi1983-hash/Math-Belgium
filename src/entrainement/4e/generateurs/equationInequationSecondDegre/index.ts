/**
 * Couche A — "Équations/inéquations du second degré en contexte" (position 57). Dispatch vers les
 * mini-générateurs de famille (`familles/*.ts`) — chacun accepte la `variante` en paramètre. Les 2
 * axes (famille × variante) sont ENTIÈREMENT INDÉPENDANTS pour 7 familles sur 8 (contrairement à
 * gen55, où chaque famille appartient à exactement une variante) — SAUF `achatGroupe` (famille Q,
 * extension `ca355440-specgen55optimisationseconddegre.md`/`f56fd11e-specgen56equationinequationseconddegre.md`,
 * voir CLAUDE.md), qui n'existe qu'en variante `"equation"` : un système à résoudre par substitution/
 * élimination n'a pas de pendant "inéquation" pédagogiquement sensé (décision explicite de la spec).
 *
 * `PAIRES_VALIDES` précalcule la liste exhaustive des combinaisons (famille, variante) réellement
 * tirables — 7×2+1×1=15 paires — et remplace le tirage à 2 axes indépendants d'origine (qui
 * produirait à tort `("achatGroupe","inequation")`, une combinaison sans réponse mathématiquement
 * sensée). `construireAvecFamilleId("achatGroupe","inequation")` appelé directement lève une erreur
 * explicite (jamais une réponse indéfinie) — même principe que `soumettreReponsePont` de gen58
 * refusant `sommetPartage`.
 */
import type { ExerciceEquationInequationSecondDegre, FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre } from "../../core/equationInequationSecondDegre.types";
import { construireChuteObjet } from "./familles/chuteObjet";
import { construireSeuilRentabilite } from "./familles/seuilRentabilite";
import { construireDistanceFreinage } from "./familles/distanceFreinage";
import { construireRemplissageReservoir } from "./familles/remplissageReservoir";
import { construireRectangleDimensions } from "./familles/rectangleDimensions";
import { construireResistancesParallele } from "./familles/resistancesParallele";
import { construireAchatGroupe } from "./familles/achatGroupe";
import { construireTriangleRectanglePerimetre } from "./familles/triangleRectanglePerimetre";
import { randomInt } from "./aleatoire";

export const CATALOGUE_FAMILLES: { id: FamilleEquationInequationSecondDegre; label: string }[] = [
  { id: "chuteObjet", label: "Chute/lancer d'un objet" },
  { id: "seuilRentabilite", label: "Seuil de rentabilité" },
  { id: "distanceFreinage", label: "Distance de freinage" },
  { id: "remplissageReservoir", label: "Remplissage/vidange d'un réservoir" },
  { id: "rectangleDimensions", label: "Dimensions d'un rectangle (périmètre et aire)" },
  { id: "resistancesParallele", label: "Résistances électriques en parallèle" },
  { id: "achatGroupe", label: "Achat groupé (système à 2 équations)" },
  { id: "triangleRectanglePerimetre", label: "Triangle rectangle (somme des cathètes)" },
];

export const CATALOGUE_VARIANTES: { id: VarianteEquationInequationSecondDegre; label: string }[] = [
  { id: "equation", label: "Équation (seuil ponctuel)" },
  { id: "inequation", label: "Inéquation (intervalle/durée)" },
];

type Constructeur = {
  (variante: "equation"): Extract<ExerciceEquationInequationSecondDegre, { variante: "equation" }>;
  (variante: "inequation"): Extract<ExerciceEquationInequationSecondDegre, { variante: "inequation" }>;
};

const CONSTRUCTEURS: Record<Exclude<FamilleEquationInequationSecondDegre, "achatGroupe">, Constructeur> = {
  chuteObjet: construireChuteObjet,
  seuilRentabilite: construireSeuilRentabilite,
  distanceFreinage: construireDistanceFreinage,
  remplissageReservoir: construireRemplissageReservoir,
  rectangleDimensions: construireRectangleDimensions,
  resistancesParallele: construireResistancesParallele,
  triangleRectanglePerimetre: construireTriangleRectanglePerimetre,
};

/** Toutes les combinaisons (famille, variante) réellement tirables — voir en-tête de fichier. */
export const PAIRES_VALIDES: { familleId: FamilleEquationInequationSecondDegre; varianteId: VarianteEquationInequationSecondDegre }[] = [
  ...CATALOGUE_FAMILLES.filter((f) => f.id !== "achatGroupe").flatMap((f) => CATALOGUE_VARIANTES.map((v) => ({ familleId: f.id, varianteId: v.id }))),
  { familleId: "achatGroupe", varianteId: "equation" },
];

export function construireAvecFamilleId(
  familleId: FamilleEquationInequationSecondDegre,
  variante: VarianteEquationInequationSecondDegre,
): ExerciceEquationInequationSecondDegre {
  if (familleId === "achatGroupe") {
    if (variante !== "equation") throw new Error("construireAvecFamilleId : la famille 'achatGroupe' n'existe qu'en variante 'equation'");
    return construireAchatGroupe();
  }
  return variante === "equation" ? CONSTRUCTEURS[familleId]("equation") : CONSTRUCTEURS[familleId]("inequation");
}

export function construireAvecVarianteId(variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const paires = PAIRES_VALIDES.filter((p) => p.varianteId === variante);
  const paire = paires[randomInt(0, paires.length - 1)]!;
  return construireAvecFamilleId(paire.familleId, paire.varianteId);
}

export function genererExerciceEquationInequationSecondDegre(): ExerciceEquationInequationSecondDegre {
  const paire = PAIRES_VALIDES[randomInt(0, PAIRES_VALIDES.length - 1)]!;
  return construireAvecFamilleId(paire.familleId, paire.varianteId);
}
