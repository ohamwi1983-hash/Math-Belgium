import type {
  ExerciceCaracteristiquesAlgebriques,
  ExerciceCaracteristiquesAlgebriquesNiveau1,
  ExerciceCaracteristiquesAlgebriquesNiveau2,
  Fraction,
  GenerateurExerciceCaracteristiquesAlgebriques,
  NiveauCaracteristiquesAlgebriques,
  ReglagesFamillesFonctionReference,
} from "../../core/caracteristiquesAlgebriques.types";
import type { FamilleReference } from "../../core/fonctionsReference.types";
import { CATALOGUE_VARIANTES, FAMILLES, construireFileFamillesMelangee } from "../fonctionsReference/index";
import type { VarianteFonctionReference } from "../fonctionsReference/index";
import { pgcd, randomInt } from "./aleatoire";
import { construireNiveau2Carre } from "./construireNiveau2Carre";
import { construireNiveau2Cube } from "./construireNiveau2Cube";
import { construireNiveau2Inverse } from "./construireNiveau2Inverse";
import { construireNiveau2RacineCarree } from "./construireNiveau2RacineCarree";
import { construireNiveau2RacineCubique } from "./construireNiveau2RacineCubique";
import { construireNiveau2ValeurAbsolue } from "./construireNiveau2ValeurAbsolue";

/**
 * Catalogues de métadonnées `{id,label}` (convention RETROFIT-variantes-generateurs.md) — ce
 * générateur a DEUX axes de variante indépendants (voir AUDIT-variantes-generateurs.md, section 1,
 * exercice 13) : la famille (mêmes 6 valeurs que le dixième exercice — réutilisée telle quelle,
 * jamais dupliquée, import générateur→générateur déjà en place pour `FAMILLES`/
 * `construireFileFamillesMelangee` ci-dessus) et le niveau (2 valeurs, propre à ce générateur).
 * `construireNiveau1AvecFamille`/`construireNiveau2AvecFamille` jouent déjà, chacun pour son
 * niveau, le rôle de `construireAvecVarianteId` sur l'axe famille ; le niveau lui-même reste un
 * simple paramètre de `creerGenerateurCaracteristiquesAlgebriques` (toute la série, jamais mélangé
 * — voir sa documentation), pas encore une variante à quantité exacte comme l'axe famille.
 */
export { CATALOGUE_VARIANTES };
export type { VarianteFonctionReference };

export interface VarianteNiveauCaracteristiquesAlgebriques {
  id: NiveauCaracteristiquesAlgebriques;
  label: string;
}

export const CATALOGUE_NIVEAUX: VarianteNiveauCaracteristiquesAlgebriques[] = [
  { id: "niveau1", label: "Niveau 1 (k constant)" },
  { id: "niveau2", label: "Niveau 2 (k(x) = cx+d, du 1er degré)" },
];

/** Fraction irréductible, dénominateur toujours positif. */
function reduire(num: number, den: number): Fraction {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(num, den);
  return { num: num / g, den: den / g };
}

/**
 * Génère un rationnel non nul "libre" (numérateur/dénominateur petits entiers, signe tiré
 * indépendamment) — utilisé pour les 3 familles sans contrainte de "valeur parfaite" (`abs`,
 * `inverse`, `racine_cubique`, section 3 de la spec) : résoudre l'équation de zéro pour ces 3
 * familles ne nécessite jamais d'extraire une racine n-ième (voir
 * `verificationCaracteristiquesAlgebriques.ts`), donc n'importe quel rationnel convient.
 */
function fractionLibre(): Fraction {
  const signe = Math.random() < 0.5 ? -1 : 1;
  const num = randomInt(1, 6);
  const den = randomInt(1, 6);
  return reduire(signe * num, den);
}

/**
 * Génère `p/q` (coprimes, petits entiers positifs) — brique commune aux familles `carre`/`cube`,
 * qui ont toutes deux besoin d'un rationnel de départ dont la puissance (carrée ou cubique) sert à
 * construire `k` exactement.
 */
function rationnelPositifCoprime(max: number): { p: number; q: number } {
  let p: number;
  let q: number;
  do {
    p = randomInt(1, max);
    q = randomInt(1, max);
  } while (pgcd(p, q) !== 1);
  return { p, q };
}

function construireK(famille: FamilleReference): Fraction {
  switch (famille) {
    case "valeur_absolue":
    case "inverse":
    case "racine_cubique":
      return fractionLibre();
    case "carre": {
      // -k doit être le carré exact d'un rationnel (ex. k=-25/16, -k=(5/4)²) — jamais positif.
      const { p, q } = rationnelPositifCoprime(4);
      return reduire(-(p * p), q * q);
    }
    case "cube": {
      // k = ±(p/q)³ : ∛(-k) toujours rationnel exact, quel que soit le signe choisi.
      const { p, q } = rationnelPositifCoprime(3);
      const signe = Math.random() < 0.5 ? -1 : 1;
      return reduire(signe * p * p * p, q * q * q);
    }
    case "racine_carree": {
      // k strictement négatif (garantit -k>0, donc √(-k) toujours défini) — pas de contrainte de
      // "valeur parfaite" : élever (-k) au carré est toujours exact, aucune racine à extraire ici.
      const { num, den } = fractionLibre();
      return reduire(-Math.abs(num), den);
    }
  }
}

/** Construit un exercice NIVEAU 1 pour une famille DÉJÀ choisie — même principe que
 * `generateurs/fonctionsReference/index.ts::construireAvecFamille` (dixième exercice), extrait
 * pour être réutilisé par le mode "personnalisé" (voir `creerGenerateurCaracteristiquesAlgebriques`
 * ci-dessous). `a` un entier non nul dans [-4,4], `b` un entier dans [-5,5] — plages volontairement
 * petites pour rester lisible (les fractions de `k` grandissent déjà avec la famille). Comportement
 * strictement inchangé depuis l'introduction du niveau 2 (`niveau:"niveau1"` est un simple
 * discriminant ajouté au contrat, jamais une nouvelle valeur générée). */
export function construireNiveau1AvecFamille(famille: FamilleReference): ExerciceCaracteristiquesAlgebriquesNiveau1 {
  let a = randomInt(-4, 4);
  while (a === 0) a = randomInt(-4, 4);
  const b = randomInt(-5, 5);
  const k = construireK(famille);
  return { niveau: "niveau1", famille, a, b, k };
}

/**
 * Construit un exercice NIVEAU 2 pour une famille DÉJÀ choisie — dispatch vers l'un des 6
 * constructeurs dédiés (`construireNiveau2Xxx.ts`), chacun avec sa propre construction algébrique
 * (voir `core/caracteristiquesAlgebriques.types.ts` et chaque fichier pour le détail complet).
 */
export function construireNiveau2AvecFamille(famille: FamilleReference): ExerciceCaracteristiquesAlgebriquesNiveau2 {
  switch (famille) {
    case "carre":
      return construireNiveau2Carre();
    case "inverse":
      return construireNiveau2Inverse();
    case "racine_carree":
      return construireNiveau2RacineCarree();
    case "valeur_absolue":
      return construireNiveau2ValeurAbsolue();
    case "racine_cubique":
      return construireNiveau2RacineCubique();
    case "cube":
      return construireNiveau2Cube();
  }
}

function construireAvecFamilleEtNiveau(famille: FamilleReference, niveau: NiveauCaracteristiquesAlgebriques): ExerciceCaracteristiquesAlgebriques {
  return niveau === "niveau1" ? construireNiveau1AvecFamille(famille) : construireNiveau2AvecFamille(famille);
}

export const genererExerciceCaracteristiquesAlgebriques: GenerateurExerciceCaracteristiquesAlgebriques = () => {
  const famille = FAMILLES[randomInt(0, FAMILLES.length - 1)];
  return construireNiveau1AvecFamille(famille);
};

export const genererExerciceCaracteristiquesAlgebriquesNiveau2: GenerateurExerciceCaracteristiquesAlgebriques = () => {
  const famille = FAMILLES[randomInt(0, FAMILLES.length - 1)];
  return construireNiveau2AvecFamille(famille);
};

/**
 * Fabrique de générateur pilotée par le réglage professeur (mode aléatoire/personnalisé) — même
 * principe que `creerGenerateurFonctionReference` (dixième exercice) : `construireFileFamillesMelangee`
 * (générique sur `FamilleReference[]`, aucune dépendance au contrat `ExerciceFonctionReference`) est
 * réutilisée telle quelle, import générateur→générateur explicitement autorisé par l'architecture
 * du projet. `niveau` (nouveau, `prompt-niveau2caracteristiquesalgebriques.md`) s'applique
 * UNIFORMÉMENT à toute la série — pas de mélange niveau 1/niveau 2 au sein d'une même série, aucun
 * point du prompt ne le demandait et une série homogène reste la plus simple à corriger pour le
 * professeur.
 */
export function creerGenerateurCaracteristiquesAlgebriques(
  reglages: ReglagesFamillesFonctionReference,
  niveau: NiveauCaracteristiquesAlgebriques = "niveau1",
): GenerateurExerciceCaracteristiquesAlgebriques {
  if (reglages.mode === "aleatoire") {
    return () => {
      const famille = FAMILLES[randomInt(0, FAMILLES.length - 1)];
      return construireAvecFamilleEtNiveau(famille, niveau);
    };
  }
  const file = construireFileFamillesMelangee(reglages.quantites);
  let index = 0;
  return () => {
    const famille = file[index % file.length];
    index += 1;
    return construireAvecFamilleEtNiveau(famille, niveau);
  };
}
