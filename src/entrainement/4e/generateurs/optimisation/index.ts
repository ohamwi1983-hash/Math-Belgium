/**
 * Couche A — "Problèmes d'optimisation (fonction du second degré)", cinquante-cinquième générateur
 * (`promptimplementationgen55.md`, étendu ensuite à 7 familles — voir CLAUDE.md). Dispatch vers les
 * 7 mini-générateurs de famille (`familles/*.ts`) — chacun embarque sa propre narrative ET ses
 * propres plages numériques, jamais une simple variation de paramètres sur un gabarit unique (voir
 * CLAUDE.md, rappel d'architecture de la spec).
 *
 * **Deux catalogues INDÉPENDANTS** (convention CLAUDE.md "Catalogue de variantes", décision
 * explicite du prompt d'implémentation — jamais un catalogue combiné) : `CATALOGUE_VARIANTES`
 * (`modelisation`/`fonctionDonnee`) et `CATALOGUE_FAMILLES` (les 7 familles narratives, A/B/C/E/G/T/V
 * de la spec — `sommeDeuxCarres`/`formeParabolique` sont chacune la fusion de 2 anciens ids de code
 * distincts, corrigée par `promptverificationfusionsmanquantesgen55.md`). Chaque famille appartient
 * à EXACTEMENT une variante (`aireEnclos`/`revenuPrix`/`sommeDeuxCarres`/`rectangleInscrit` →
 * `modelisation`, `formeParabolique`/`coutProduction`/`grandeurTemps` → `fonctionDonnee`) — jamais
 * un croisement libre des deux axes, une famille encode sa variante par construction.
 *
 * **Choix non spécifié par la spec, tranché ici plutôt que deviné silencieusement** (signalé
 * explicitement, comme demandé par le prompt en cas d'ambiguïté) : `genererExerciceOptimisation`
 * (le générateur "brut" zéro-argument) tire UNIFORMÉMENT parmi les 7 FAMILLES directement — pas
 * d'abord une variante à 50/50 puis une famille en son sein (ce qui aurait sur-représenté
 * `modelisation`, 4 familles contre 3 pour `fonctionDonnee`). `construireAvecVarianteId` reste
 * disponible séparément pour un usage qui a explicitement besoin de forcer l'axe `variante` (ex.
 * tests, mode professeur).
 */
import type { ExerciceOptimisation, GenerateurExerciceOptimisation, VarianteOptimisation } from "../../core/optimisation.types";
import { construireAireEnclos } from "./familles/aireEnclos";
import { construireRevenuPrix } from "./familles/revenuPrix";
import { construireFormeParabolique } from "./familles/formeParabolique";
import { construireCoutProduction } from "./familles/coutProduction";
import { construireSommeDeuxCarres } from "./familles/sommeDeuxCarres";
import { construireRectangleInscrit } from "./familles/rectangleInscrit";
import { construireGrandeurTemps } from "./familles/grandeurTemps";
import { randomInt } from "./aleatoire";

/**
 * Les 7 familles RÉELLES de CE générateur (A/B/C/E/G/T/V de la spec — voir CLAUDE.md, "Création —
 * cinquante-cinquième exercice") — type LOCAL, volontairement plus étroit que le champ
 * `famille: FamilleOptimisationModelisation` du contrat partagé (`core/optimisation.types.ts`),
 * élargi depuis pour accueillir les familles du cinquante-septième exercice (qui embarque un
 * `ExerciceOptimisationModelisation` complet). Garde l'exhaustivité de `CONSTRUCTEURS` scopée aux 7
 * familles que CE générateur construit réellement, sans forcer gen55 à connaître les familles d'un
 * autre exercice.
 */
type FamilleOptimisationGen55 =
  | "aireEnclos"
  | "revenuPrix"
  | "formeParabolique"
  | "coutProduction"
  | "sommeDeuxCarres"
  | "rectangleInscrit"
  | "grandeurTemps";

export const CATALOGUE_VARIANTES: { id: VarianteOptimisation; label: string }[] = [
  { id: "modelisation", label: "Modélisation (l'élève construit la fonction)" },
  { id: "fonctionDonnee", label: "Fonction donnée (décision sommet/borne)" },
];

export const CATALOGUE_FAMILLES: { id: FamilleOptimisationGen55; label: string }[] = [
  { id: "aireEnclos", label: "Aire d'un enclos rectangulaire" },
  { id: "revenuPrix", label: "Revenu/bénéfice en fonction du prix" },
  { id: "formeParabolique", label: "Forme/trajectoire parabolique" },
  { id: "coutProduction", label: "Coût de production" },
  { id: "sommeDeuxCarres", label: "Somme fixe répartie en deux (valeur/coût minimal)" },
  { id: "rectangleInscrit", label: "Rectangle inscrit dans un triangle isocèle" },
  { id: "grandeurTemps", label: "Grandeur en fonction du temps (température ou bénéfice)" },
];

const FAMILLES_PAR_VARIANTE: Record<VarianteOptimisation, FamilleOptimisationGen55[]> = {
  modelisation: ["aireEnclos", "revenuPrix", "sommeDeuxCarres", "rectangleInscrit"],
  fonctionDonnee: ["formeParabolique", "coutProduction", "grandeurTemps"],
};

const CONSTRUCTEURS: Record<FamilleOptimisationGen55, () => ExerciceOptimisation> = {
  aireEnclos: construireAireEnclos,
  revenuPrix: construireRevenuPrix,
  formeParabolique: construireFormeParabolique,
  coutProduction: construireCoutProduction,
  sommeDeuxCarres: construireSommeDeuxCarres,
  rectangleInscrit: construireRectangleInscrit,
  grandeurTemps: construireGrandeurTemps,
};

export function construireAvecFamilleId(familleId: FamilleOptimisationGen55): ExerciceOptimisation {
  return CONSTRUCTEURS[familleId]();
}

export function construireAvecVarianteId(varianteId: VarianteOptimisation): ExerciceOptimisation {
  const familles = FAMILLES_PAR_VARIANTE[varianteId];
  return construireAvecFamilleId(familles[randomInt(0, familles.length - 1)]);
}

export const genererExerciceOptimisation: GenerateurExerciceOptimisation = () => {
  const familles = CATALOGUE_FAMILLES.map((f) => f.id);
  return construireAvecFamilleId(familles[randomInt(0, familles.length - 1)]);
};
