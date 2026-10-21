import type { Caracteristique, ExposantLog, Noeud, NomVariable } from "../../core6e/decompositionLogarithme";
import { TOUTES_CARACTERISTIQUES } from "../../core6e/decompositionLogarithme";
import type { ExerciceProprieteLogarithme } from "../../core6e/proprietesLogarithme.types";

/**
 * Couche A (6e) — génération pour `6gen13` ("Propriétés du logarithme", chapitre 3), REFONTE
 * TOTALE : 5 caractéristiques (produit, quotient, puissance, racine, changement de base) — le
 * catalogue de variantes est maintenant TOUTE combinaison de 1 à 4 d'entre elles (générée par
 * combinatoire, jamais une liste à la main — demande explicite) : 5 isolées + C(5,2)=10 paires +
 * C(5,3)=10 triplets + C(5,4)=5 quadruplets = 30 variantes. Voir `core6e/decompositionLogarithme.ts`
 * pour la construction de l'arbre/l'ordre aléatoire et `moteur6e/typesProprietesLogarithme.ts` pour
 * le nombre d'écrans (= nombre de caractéristiques). Exercice PUREMENT SYMBOLIQUE (aucune valeur
 * numérique générée, voir `core6e/proprietesLogarithme.types.ts`).
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function melanger<T>(arr: readonly T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Toutes les combinaisons de `taille` éléments de `arr`, ordre de `arr` préservé à l'intérieur de
 * chaque combinaison (l'ordre RÉEL de construction de l'arbre est, lui, tiré aléatoirement à chaque
 * exercice — voir `construireArbre` — cette fonction ne sert qu'à énumérer le CATALOGUE). */
function combinaisons<T>(arr: readonly T[], taille: number): T[][] {
  if (taille === 0) return [[]];
  if (taille > arr.length) return [];
  const [premier, ...reste] = arr;
  const avecPremier = combinaisons(reste, taille - 1).map((c) => [premier, ...c]);
  const sansPremier = combinaisons(reste, taille);
  return [...avecPremier, ...sansPremier];
}

const EXPOSANTS: readonly ExposantLog[] = [2, 3, 4];

const LIBELLE_CARACTERISTIQUE: Record<Caracteristique, string> = {
  produit: "Produit",
  quotient: "Quotient",
  puissance: "Puissance",
  racine: "Racine",
  changementBase: "Changement de base",
};

/** Identifiant stable et lisible d'une combinaison — caractéristiques dans l'ORDRE FIXE de
 * `TOUTES_CARACTERISTIQUES` (jamais l'ordre de tirage, qui lui varie par exercice), jamais recalculé
 * ailleurs. */
function idDeCombo(caracteristiques: readonly Caracteristique[]): string {
  return TOUTES_CARACTERISTIQUES.filter((c) => caracteristiques.includes(c)).join("+");
}

function labelDeCombo(caracteristiques: readonly Caracteristique[]): string {
  return TOUTES_CARACTERISTIQUES.filter((c) => caracteristiques.includes(c))
    .map((c) => LIBELLE_CARACTERISTIQUE[c])
    .join(" + ");
}

/** Catalogue `{id,label}` — 1 entrée par combinaison (jamais par exercice individuel, les valeurs
 * numériques/l'ordre de construction restent tirés à CHAQUE génération, voir `construireAvecVarianteId`). */
export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [1, 2, 3, 4].flatMap((taille) =>
  combinaisons(TOUTES_CARACTERISTIQUES, taille).map((combo) => ({ id: idDeCombo(combo), label: labelDeCombo(combo) })),
);

function comboDepuisId(id: string): Caracteristique[] {
  const parties = id.split("+") as Caracteristique[];
  const combo = TOUTES_CARACTERISTIQUES.filter((c) => parties.includes(c));
  if (combo.length !== parties.length) throw new Error(`comboDepuisId : identifiant de combinaison invalide "${id}"`);
  return combo;
}

/** Construit l'arbre depuis un ORDRE ALÉATOIRE des caractéristiques d'argument (produit/quotient/
 * puissance/racine — jamais `changementBase`, voir l'en-tête de `decompositionLogarithme.ts`) :
 * `produit`/`quotient` introduisent une variable neuve (N puis P, au plus une fois chacune) ;
 * `puissance`/`racine` enveloppent simplement le nœud courant. */
function construireArbre(ordre: readonly ("produit" | "quotient" | "puissance" | "racine")[]): { arbre: Noeud; aN: boolean; aP: boolean } {
  let noeud: Noeud = { kind: "var", nom: "M" };
  let prochaineVariable: NomVariable = "N";
  let aN = false;
  let aP = false;
  for (const caracteristique of ordre) {
    if (caracteristique === "produit" || caracteristique === "quotient") {
      noeud = { kind: caracteristique, gauche: noeud, droite: { kind: "var", nom: prochaineVariable } };
      if (prochaineVariable === "N") aN = true;
      else aP = true;
      prochaineVariable = prochaineVariable === "N" ? "P" : "N";
    } else if (caracteristique === "puissance") {
      noeud = { kind: "puissance", interieur: noeud, p: tirerParmi(EXPOSANTS) };
    } else {
      noeud = { kind: "racine", interieur: noeud, k: tirerParmi(EXPOSANTS) };
    }
  }
  return { arbre: noeud, aN, aP };
}

export function construireAvecCombo(caracteristiques: readonly Caracteristique[]): ExerciceProprieteLogarithme {
  const avecChangementBase = caracteristiques.includes("changementBase");
  const argument = melanger(caracteristiques.filter((c): c is "produit" | "quotient" | "puissance" | "racine" => c !== "changementBase"));
  const { arbre, aN, aP } = construireArbre(argument);
  const b = avecChangementBase ? "b" : null;

  return { arbre, avecChangementBase, avecN: aN, avecP: aP, b };
}

export function construireAvecVarianteId(id: string): ExerciceProprieteLogarithme {
  return construireAvecCombo(comboDepuisId(id));
}

/** Tirage ÉQUIPROBABLE parmi les 30 combinaisons du catalogue. */
export function genererExerciceProprietesLogarithme(): ExerciceProprieteLogarithme {
  return construireAvecVarianteId(tirerParmi(CATALOGUE_VARIANTES).id);
}
