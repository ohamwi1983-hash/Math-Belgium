import type { ExerciceInequationLogarithmique, SousTypeB, SousTypeC } from "../../core6e/inequationsLogarithmiques.types";
import { tirerParmi } from "./aleatoire";
import { construireA } from "./familles/A";
import { construireB, construireBDirect, construireBRacine } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";
import { construireF } from "./familles/F";

/**
 * Catalogue à granularité FINE pour `6gen15` — même principe que
 * `generateurs6e/inequationsExponentielles/index.ts` (6gen10) : chaque sous-type/famille est
 * forçable individuellement depuis le panneau dev. **Extension délibérée par rapport à 6gen10** :
 * la famille A n'a PAS de sous-type structurel, mais le tirage `base>1`/`base<1` reste le piège
 * pédagogique CENTRAL de ce générateur entier (rappelé dans chaque famille A/B/C/D) — un entretien
 * manuel exhaustif exige de pouvoir forcer les deux cas sans dépendre du hasard (retirer jusqu'à
 * tomber sur le bon signe). D'où des entrées `A-sup1`/`A-inf1` (et l'équivalent pour B/C/D)
 * qu'aucun catalogue de 6gen10 n'avait — `construireAvecFamilleId` boucle une génération normale
 * jusqu'à obtenir le signe de base demandé (retry borné, jamais un chemin de génération séparé
 * dupliqué).
 */
export type IdVarianteInequationLogarithmique =
  | "A-sup1"
  | "A-inf1"
  | "B-direct-sup1"
  | "B-direct-inf1"
  | "B-racine-sup1"
  | "B-racine-inf1"
  | "C-produit-sup1"
  | "C-produit-inf1"
  | "C-quotient-sup1"
  | "C-quotient-inf1"
  | "D-sup1"
  | "D-inf1"
  | "E"
  | "F";

export const CATALOGUE_FAMILLES: { id: IdVarianteInequationLogarithmique; label: string }[] = [
  { id: "A-sup1", label: "A — log_base(u) R k (base>1)" },
  { id: "A-inf1", label: "A — log_base(u) R k (base<1)" },
  { id: "B-direct-sup1", label: "B — comparaison directe, affine (base>1)" },
  { id: "B-direct-inf1", label: "B — comparaison directe, affine (base<1)" },
  { id: "B-racine-sup1", label: "B — comparaison directe, avec racine (base>1)" },
  { id: "B-racine-inf1", label: "B — comparaison directe, avec racine (base<1)" },
  { id: "C-produit-sup1", label: "C — combiner en produit (base>1)" },
  { id: "C-produit-inf1", label: "C — combiner en produit (base<1)" },
  { id: "C-quotient-sup1", label: "C — combiner en quotient (base>1)" },
  { id: "C-quotient-inf1", label: "C — combiner en quotient (base<1)" },
  { id: "D-sup1", label: "D — quadratique en y=log_base(x) (base>1)" },
  { id: "D-inf1", label: "D — quadratique en y=log_base(x) (base<1)" },
  { id: "E", label: "E — domaine vide par construction" },
  { id: "F", label: "F — base paramétrique a, split a>1/0<a<1" },
];

const MAX_TENTATIVES_SIGNE = 200;

function construireAvecSigneImpose<T extends { baseSuperieureA1: boolean }>(generer: () => T, superieureA1: boolean): T {
  for (let i = 0; i < MAX_TENTATIVES_SIGNE; i++) {
    const ex = generer();
    if (ex.baseSuperieureA1 === superieureA1) return ex;
  }
  throw new Error("construireAvecSigneImpose : aucune instance du signe de base demandé trouvée après le nombre maximal de tentatives");
}

export function construireAvecFamilleId(id: IdVarianteInequationLogarithmique): ExerciceInequationLogarithmique {
  switch (id) {
    case "A-sup1":
      return construireAvecSigneImpose(construireA, true);
    case "A-inf1":
      return construireAvecSigneImpose(construireA, false);
    case "B-direct-sup1":
      return construireAvecSigneImpose(construireBDirect, true);
    case "B-direct-inf1":
      return construireAvecSigneImpose(construireBDirect, false);
    case "B-racine-sup1":
      return construireAvecSigneImpose(construireBRacine, true);
    case "B-racine-inf1":
      return construireAvecSigneImpose(construireBRacine, false);
    case "C-produit-sup1":
      return construireAvecSigneImpose(() => construireC("produit"), true);
    case "C-produit-inf1":
      return construireAvecSigneImpose(() => construireC("produit"), false);
    case "C-quotient-sup1":
      return construireAvecSigneImpose(() => construireC("quotient"), true);
    case "C-quotient-inf1":
      return construireAvecSigneImpose(() => construireC("quotient"), false);
    case "D-sup1":
      return construireAvecSigneImpose(construireD, true);
    case "D-inf1":
      return construireAvecSigneImpose(construireD, false);
    case "E":
      return construireE();
    case "F":
      return construireF();
  }
}

const SOUS_TYPES_B: SousTypeB[] = ["direct", "racine"];
const SOUS_TYPES_C: SousTypeC[] = ["produit", "quotient"];

/**
 * Tirage à 2 niveaux — famille ÉQUIPROBABLE parmi A/B/C/D/E/F (spec explicite : "Tirage aléatoire
 * d'1 famille parmi 6... équiprobable"), PUIS sous-type équiprobable À L'INTÉRIEUR de B/C — jamais
 * un tirage uniforme direct sur le catalogue fin, qui sur-représenterait B/C/D (2-4 entrées
 * chacune, dont le signe de base) par rapport à E/F (1 chacune).
 */
export function genererExerciceInequationLogarithmique(): ExerciceInequationLogarithmique {
  const famille = tirerParmi(["A", "B", "C", "D", "E", "F"] as const);
  switch (famille) {
    case "A":
      return construireA();
    case "B":
      return construireB(tirerParmi(SOUS_TYPES_B));
    case "C":
      return construireC(tirerParmi(SOUS_TYPES_C));
    case "D":
      return construireD();
    case "E":
      return construireE();
    case "F":
      return construireF();
  }
}
