import type {
  ExerciceInequationRationnelle,
  GenerateurExerciceInequationRationnelle,
  NiveauInequationRationnelle,
  ReglagesInequationRationnelle,
} from "../../core/inequationRationnelle.types";
import { choisirNiveau } from "./choisirNiveau";
import { construireNiveau1 } from "./construireNiveau1";
import { construireNiveau2 } from "./construireNiveau2";
import { construireNiveau3 } from "./construireNiveau3";
import { construireNiveau4 } from "./construireNiveau4";
import { construireDenominateurCarre } from "./construireDenominateurCarre";
import { construireFacteurCommun } from "./construireFacteurCommun";
import { construireSansFacteurCommun } from "./construireSansFacteurCommun";
import { construireCubique } from "./construireCubique";

/**
 * Un constructeur par niveau implémenté — les 4 niveaux de l'axe "que vaut G(x) ?" plus les
 * variantes orthogonales "dénominateur au carré", "facteur commun", "sans facteur commun" et
 * "cubique" (voir core/inequationRationnelle.types.ts).
 */
const CONSTRUCTEURS: Record<NiveauInequationRationnelle, () => ExerciceInequationRationnelle> = {
  niveau1: construireNiveau1,
  niveau2: construireNiveau2,
  niveau3: construireNiveau3,
  niveau4: construireNiveau4,
  denominateurCarre: construireDenominateurCarre,
  facteurCommun: construireFacteurCommun,
  sansFacteurCommun: construireSansFacteurCommun,
  cubique: construireCubique,
};

/**
 * Catalogue de métadonnées `{id,label}` (convention RETROFIT-variantes-generateurs.md) — `id`
 * réutilise directement `NiveauInequationRationnelle`, dans le même ordre que `CONSTRUCTEURS`
 * ci-dessus (une désynchronisation entre les deux serait de toute façon une erreur de compilation
 * TypeScript, `CONSTRUCTEURS` étant un `Record` complet sur ce même type union — voir
 * AUDIT-variantes-generateurs.md, section 3a, sur ce point déjà le plus robuste des 13
 * générateurs).
 */
export interface VarianteInequationRationnelle {
  id: NiveauInequationRationnelle;
  label: string;
}

export const CATALOGUE_VARIANTES: VarianteInequationRationnelle[] = [
  { id: "niveau1", label: "Niveau 1 — quotient de deux polynômes du 1er degré" },
  { id: "niveau2", label: "Niveau 2 — quotient égal à une constante" },
  { id: "niveau3", label: "Niveau 3 — quotient égal à un polynôme du 1er degré" },
  { id: "niveau4", label: "Niveau 4 — quotient de deux fractions du 1er degré" },
  { id: "denominateurCarre", label: "Dénominateur au carré" },
  { id: "facteurCommun", label: "Facteur commun à simplifier" },
  { id: "sansFacteurCommun", label: "Numérateur et dénominateur du 2nd degré, sans facteur commun" },
  { id: "cubique", label: "Numérateur du 3e degré (mise en évidence de x)" },
];

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md) — délègue directement à `CONSTRUCTEURS`, déjà indexé par id. Aucun des 8
 * constructeurs n'accepte de paramètre supplémentaire (contrairement aux exercices 10/11, dont les
 * `th`/`tv` peuvent être forcés) : pas de second paramètre `overrides?` ici, il n'y a rien à
 * surcharger.
 */
export function construireAvecVarianteId(varianteId: NiveauInequationRationnelle): ExerciceInequationRationnelle {
  return CONSTRUCTEURS[varianteId]();
}

/**
 * Fabrique de générateur (Couche A) — contrairement au reste du projet, ce générateur a besoin
 * d'un réglage externe (niveauxActifs/repartition) pour décider quel niveau construire à chaque
 * appel. Pour que la Couche B reste inchangée (elle appelle toujours `generateur()` sans
 * argument, voir CLAUDE.md), ce réglage est capturé dans la fermeture au moment de la création du
 * générateur, plutôt que passé à chaque appel.
 */
export function creerGenerateurInequationRationnelle(
  reglages: ReglagesInequationRationnelle,
): GenerateurExerciceInequationRationnelle {
  return () => construireAvecVarianteId(choisirNiveau(reglages));
}
