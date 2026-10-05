import type { ExerciceDeuxFractionsLineaires } from "../../core/equationRationnelle.types";
import { construireSousVarianteA } from "./construireSousVarianteA";
import { construireSousVarianteB } from "./construireSousVarianteB";
import { construireSousVarianteC } from "./construireSousVarianteC";

const SOUS_VARIANTES: Array<() => ExerciceDeuxFractionsLineaires> = [
  construireSousVarianteA,
  construireSousVarianteB,
  construireSousVarianteC,
];

/**
 * Construction "deux_fractions_lineaires" (prompt-2-cas3-degre1.md) : tire équiprobablement l'une
 * des 3 sous-variantes (a/b/c), jamais exposée dans le contrat retourné — la sous-variante tirée
 * est un détail de construction, pas une propriété que la Couche B a besoin de connaître (elle
 * reste générique sur `equationIsolee.categorie` et `ce`, voir core/equationRationnelle.types.ts).
 */
export function construireDeuxFractionsLineaires(): ExerciceDeuxFractionsLineaires {
  const index = Math.floor(Math.random() * SOUS_VARIANTES.length);
  return SOUS_VARIANTES[index]();
}
