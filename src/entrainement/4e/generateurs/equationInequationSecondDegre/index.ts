/**
 * Couche A — "Équations/inéquations du second degré en contexte" (position 57). Dispatch vers les
 * mini-générateurs de famille (`familles/*.ts`) — 12 familles couvrant 4 architectures distinctes
 * (voir `core/equationInequationSecondDegre.types.ts`, en-tête) : A "fonction donnée" (3), B
 * "construction géométrique" (5), C "problèmes de nombres classiques" (2), D "système à 2
 * inconnues" (2). Les 2 axes (famille × variante) restent ENTIÈREMENT INDÉPENDANTS pour LES 12
 * FAMILLES : `PAIRES_VALIDES` est le produit cartésien complet, 12×2=24 paires.
 */
import type { ExerciceEquationInequationSecondDegre, FamilleEquationInequationSecondDegre, VarianteEquationInequationSecondDegre } from "../../core/equationInequationSecondDegre.types";
import { construireJetEau } from "./familles/jetEau";
import { construireConsommationCarburant } from "./familles/consommationCarburant";
import { construirePopulationPoissons } from "./familles/populationPoissons";
import { construireRectanglePerimetre } from "./familles/rectanglePerimetre";
import { construireEnclosAdosseMur } from "./familles/enclosAdosseMur";
import { construireTriangleRectangleCathetes } from "./familles/triangleRectangleCathetes";
import { construireCerfVolantDiagonales } from "./familles/cerfVolantDiagonales";
import { construireFacadeMaisonToit } from "./familles/facadeMaisonToit";
import { construireProduitEntiersConsecutifs } from "./familles/produitEntiersConsecutifs";
import { construireCarreMoinsNombre } from "./familles/carreMoinsNombre";
import { construireSommeProduit } from "./familles/sommeProduit";
import { construirePerimetreAire } from "./familles/perimetreAire";
import { randomInt } from "./aleatoire";

export const CATALOGUE_FAMILLES: { id: FamilleEquationInequationSecondDegre; label: string }[] = [
  // A — fonction donnée
  { id: "jetEau", label: "A · Hauteur d'un jet d'eau (fonction donnée)" },
  { id: "consommationCarburant", label: "A · Consommation de carburant (fonction donnée)" },
  { id: "populationPoissons", label: "A · Population piscicole (fonction donnée)" },
  // B — construction géométrique
  { id: "rectanglePerimetre", label: "B · Rectangle à périmètre fixé (construction)" },
  { id: "enclosAdosseMur", label: "B · Enclos adossé à un mur (construction)" },
  { id: "triangleRectangleCathetes", label: "B · Triangle rectangle, somme des cathètes (construction)" },
  { id: "cerfVolantDiagonales", label: "B · Cerf-volant, somme des diagonales (construction)" },
  { id: "facadeMaisonToit", label: "B · Façade de maison, mur et toit (construction)" },
  // C — problèmes de nombres classiques
  { id: "produitEntiersConsecutifs", label: "C · Produit de 2 entiers consécutifs (nombres)" },
  { id: "carreMoinsNombre", label: "C · Carré diminué du nombre (nombres)" },
  // D — système à 2 inconnues
  { id: "sommeProduit", label: "D · Somme et produit de 2 nombres (système)" },
  { id: "perimetreAire", label: "D · Périmètre et aire d'un rectangle (système)" },
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
  consommationCarburant: construireConsommationCarburant,
  populationPoissons: construirePopulationPoissons,
  rectanglePerimetre: construireRectanglePerimetre,
  enclosAdosseMur: construireEnclosAdosseMur,
  triangleRectangleCathetes: construireTriangleRectangleCathetes,
  cerfVolantDiagonales: construireCerfVolantDiagonales,
  facadeMaisonToit: construireFacadeMaisonToit,
  produitEntiersConsecutifs: construireProduitEntiersConsecutifs,
  carreMoinsNombre: construireCarreMoinsNombre,
  sommeProduit: construireSommeProduit,
  perimetreAire: construirePerimetreAire,
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
