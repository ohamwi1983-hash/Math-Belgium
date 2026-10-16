/**
 * Couche A — "Équations/inéquations du second degré en contexte" (position 57). Dispatch vers les
 * mini-générateurs de famille (`familles/*.ts`). Depuis la refonte (voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête), les 2 axes (famille × variante) sont
 * ENTIÈREMENT INDÉPENDANTS pour LES 7 FAMILLES (plus d'exception "système à 2 inconnues" —
 * l'ancienne famille `achatGroupe` a disparu avec toute la machinerie système) : `PAIRES_VALIDES`
 * est donc simplement le produit cartésien complet, 7×2=14 paires.
 */
import type { ExerciceEquationInequationSecondDegre, FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre } from "../../core/equationInequationSecondDegre.types";
import { construireJetEau } from "./familles/jetEau";
import { construireRendementEngrais } from "./familles/rendementEngrais";
import { construireConsommationCarburant } from "./familles/consommationCarburant";
import { construirePubliciteAudience } from "./familles/publiciteAudience";
import { construireCoutEntretienMachine } from "./familles/coutEntretienMachine";
import { construirePopulationPoissons } from "./familles/populationPoissons";
import { construireSautEnLongueur } from "./familles/sautEnLongueur";
import { randomInt } from "./aleatoire";

export const CATALOGUE_FAMILLES: { id: FamilleEquationInequationSecondDegre; label: string }[] = [
  { id: "jetEau", label: "Hauteur d'un jet d'eau" },
  { id: "rendementEngrais", label: "Rendement d'une culture selon l'engrais" },
  { id: "consommationCarburant", label: "Consommation de carburant selon la vitesse" },
  { id: "publiciteAudience", label: "Audience d'une campagne publicitaire" },
  { id: "coutEntretienMachine", label: "Coût d'entretien d'une machine selon son âge" },
  { id: "populationPoissons", label: "Population piscicole selon la nourriture distribuée" },
  { id: "sautEnLongueur", label: "Distance d'un saut en longueur selon la vitesse d'élan" },
];

export const CATALOGUE_VARIANTES: { id: VarianteEquationInequationSecondDegre; label: string }[] = [
  { id: "equation", label: "Équation (seuil ponctuel)" },
  { id: "inequation", label: "Inéquation (intervalle)" },
];

type Constructeur = {
  (variante: "equation"): Extract<ExerciceEquationInequationSecondDegre, { variante: "equation" }>;
  (variante: "inequation"): Extract<ExerciceEquationInequationSecondDegre, { variante: "inequation" }>;
};

const CONSTRUCTEURS: Record<FamilleEquationInequationSecondDegre, Constructeur> = {
  jetEau: construireJetEau,
  rendementEngrais: construireRendementEngrais,
  consommationCarburant: construireConsommationCarburant,
  publiciteAudience: construirePubliciteAudience,
  coutEntretienMachine: construireCoutEntretienMachine,
  populationPoissons: construirePopulationPoissons,
  sautEnLongueur: construireSautEnLongueur,
};

/** Toutes les combinaisons (famille, variante) tirables — produit cartésien complet, voir en-tête
 * de fichier. */
export const PAIRES_VALIDES: { familleId: FamilleEquationInequationSecondDegre; varianteId: VarianteEquationInequationSecondDegre }[] = CATALOGUE_FAMILLES.flatMap((f) =>
  CATALOGUE_VARIANTES.map((v) => ({ familleId: f.id, varianteId: v.id })),
);

export function construireAvecFamilleId(
  familleId: FamilleEquationInequationSecondDegre,
  variante: VarianteEquationInequationSecondDegre,
): ExerciceEquationInequationSecondDegre {
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
