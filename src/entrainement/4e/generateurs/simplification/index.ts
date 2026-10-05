import type { Categorie, Exercice } from "../../core/generateur.types";
import type { ExerciceSimplification, GenerateurExerciceSimplification, TypeFraction } from "../../core/simplification.types";
import { tirerRacineCommune } from "./aleatoire";
import { construireP2Impose } from "./construireP2Impose";
import type { TechniqueP2 } from "./construireP2Impose";
import { construirePolynomeLineaire } from "./construirePolynomeLineaire";

const TYPES: TypeFraction[] = ["P2/P2", "P1/P2", "P2/P1"];

/**
 * mise_en_evidence et binome_conjugue ont une seconde racine structurellement fixe (0 et -p
 * respectivement) : si le dénominateur les utilise, le numérateur doit les éviter pour ne pas
 * reproduire exactement le même polynôme (cas dégénéré, section 2). cas_general a une seconde
 * racine librement choisie — sa collision éventuelle est déjà évitée via racinesInterdites.
 * Exportée : réutilisée telle quelle par generateurs/inequationRationnelle/construireFacteurCommun.ts
 * (variante "facteur commun"), qui a besoin de la même construction P2/P2 racine commune.
 */
export function techniqueASecondeRacineFixe(categorie: Categorie): TechniqueP2 | undefined {
  return categorie === "mise_en_evidence" || categorie === "binome_conjugue" ? categorie : undefined;
}

/** Exportée pour la même raison que techniqueASecondeRacineFixe ci-dessus. */
export function secondeRacine(exercice: Exercice, p: number): number {
  return exercice.solution.racines.find((r) => r !== p) ?? exercice.solution.racines[0];
}

/**
 * Un constructeur par type de fraction — extraits des 3 blocs `if` jusque-là inline dans
 * `genererExerciceSimplification` (refactor préalable requis par RETROFIT-variantes-generateurs.md
 * avant d'appliquer la convention `{id,label}`/`construireAvecVarianteId` : le choix de type n'était
 * pas isolé dans une fonction adressable par id, voir AUDIT-variantes-generateurs.md, section 5).
 * Comportement strictement inchangé — même logique, seulement nommée et paramétrée sur
 * `racineCommune` plutôt que de la lire depuis une fermeture partagée.
 */
function construireP2P2(racineCommune: number): ExerciceSimplification {
  const denominateur = construireP2Impose(racineCommune, { exclureProduitRemarquable: true });
  const numerateur = construireP2Impose(racineCommune, {
    exclureTechnique: techniqueASecondeRacineFixe(denominateur.categorie),
    racinesInterdites: [secondeRacine(denominateur, racineCommune)],
  });
  return { type: "P2/P2", racineCommune, denominateur, numerateur };
}

function construireP1P2(racineCommune: number): ExerciceSimplification {
  const denominateur = construireP2Impose(racineCommune, { exclureProduitRemarquable: true });
  const numerateur = construirePolynomeLineaire(racineCommune);
  return { type: "P1/P2", racineCommune, denominateur, numerateur };
}

function construireP2P1(racineCommune: number): ExerciceSimplification {
  const denominateur = construirePolynomeLineaire(racineCommune);
  const numerateur = construireP2Impose(racineCommune);
  return { type: "P2/P1", racineCommune, denominateur, numerateur };
}

const CONSTRUCTEURS_PAR_ID: Record<TypeFraction, (racineCommune: number) => ExerciceSimplification> = {
  "P2/P2": construireP2P2,
  "P1/P2": construireP1P2,
  "P2/P1": construireP2P1,
};

export interface VarianteSimplification {
  id: TypeFraction;
  label: string;
}

/** Proposition à valider par l'utilisateur (voir RETROFIT-variantes-generateurs.md). */
export const CATALOGUE_VARIANTES: VarianteSimplification[] = [
  { id: "P2/P2", label: "Numérateur et dénominateur du 2nd degré" },
  { id: "P1/P2", label: "Numérateur du 1er degré, dénominateur du 2nd degré" },
  { id: "P2/P1", label: "Numérateur du 2nd degré, dénominateur du 1er degré" },
];

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md). `overrides?.racineCommune`, s'il est fourni, force la racine commune (p) plutôt
 * que de la laisser tirée aléatoirement par `tirerRacineCommune` — jamais 0 (voir sa documentation,
 * `aleatoire.ts`) : forcer explicitement 0 ici produirait un exercice structurellement dégénéré,
 * donc non validé, laissé à la responsabilité de l'appelant plutôt que revalidé silencieusement.
 */
export function construireAvecVarianteId(varianteId: TypeFraction, overrides?: { racineCommune?: number }): ExerciceSimplification {
  const racineCommune = overrides?.racineCommune ?? tirerRacineCommune();
  return CONSTRUCTEURS_PAR_ID[varianteId](racineCommune);
}

/** Implémentation de la Couche A (spec-simplification-fractions.md) — 3 types équiprobables. */
export const genererExerciceSimplification: GenerateurExerciceSimplification = () => {
  const racineCommune = tirerRacineCommune();
  const type = TYPES[Math.floor(Math.random() * TYPES.length)];
  return CONSTRUCTEURS_PAR_ID[type](racineCommune);
};
