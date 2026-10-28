import type { ExerciceNiveau2Quadratique } from "../../core/caracteristiquesAlgebriques.types";
import { construireExerciceClassifie } from "../equationRationnelle/construireExerciceClassifie";
import { randomInt, randomIntNonNul } from "./aleatoire";
import { construireEquationSansRacine } from "./construireEquationSansRacine";

/**
 * Niveau 2, famille `carre` — `f(x) = (ax+b)² + (cx+d)`. Les zéros résolvent
 * `(ax+b)²+(cx+d)=0`, qui développe en `a²x² + (2ab+c)x + (b²+d) = 0` : une équation du 2nd degré
 * CLASSIQUE, de coefficient dominant `A=a²` (toujours un carré parfait, comme `a` l'est toujours
 * pour les 4 techniques de l'exercice "méthode la plus rapide"). Construction "racines d'abord" —
 * jamais un tirage de a,b,c,d puis une recherche de discriminant carré parfait (contrairement à
 * `inverse`, structurellement bilinéaire — voir sa section dédiée) : pour `a,b` FIXÉS, les
 * coefficients `B=2ab+c`/`C=b²+d` de l'équation cible sont chacun linéaires en `c`/`d`
 * indépendamment (aucune dépendance croisée), donc `c`/`d` s'obtiennent par simple inversion une
 * fois les racines choisies : `c = B-2ab`, `d = C-b²`.
 */
export function construireNiveau2Carre(): ExerciceNiveau2Quadratique {
  // 1 fois sur 3 : Δ<0, "aucun zéro" (audit gen13 — jamais tiré jusqu'ici, alors que l'écran "zéros"
  // propose ce choix ; même défaut que celui corrigé au niveau 1). Construction directe sur les
  // coefficients : `A=a²>0`, `C` choisi strictement au-delà de `B²/(4A)` (seuil qui annule Δ), puis
  // `c`/`d` par la même inversion que ci-dessous.
  if (Math.random() < 1 / 3) return construireSansRacine();
  for (let tentative = 0; tentative < 500; tentative++) {
    const a = randomIntNonNul(-3, 3);
    const b = randomInt(-5, 5);
    const r1 = randomInt(-6, 6);
    const r2 = randomInt(-6, 6);
    const A = a * a;
    const zeros = construireExerciceClassifie(A, r1, r2);
    const c = zeros.enonce.b - 2 * a * b;
    const d = zeros.enonce.c - b * b;
    if (c === 0) continue; // k dégénérerait en constante (niveau 1) — exclu, jamais c=0 au niveau 2
    return { niveau: "niveau2", famille: "carre", a, b, c, d, zeros };
  }
  throw new Error("construireNiveau2Carre : aucune combinaison valide trouvée après 500 tentatives");
}

function construireSansRacine(): ExerciceNiveau2Quadratique {
  for (let tentative = 0; tentative < 500; tentative++) {
    const a = randomIntNonNul(-3, 3);
    const b = randomInt(-5, 5);
    const A = a * a;
    const B = randomInt(-8, 8);
    const c = B - 2 * a * b;
    if (c === 0) continue; // jamais c=0 au niveau 2 (k dégénérerait en constante)
    const C = Math.floor((B * B) / (4 * A)) + randomInt(1, 4);
    const d = C - b * b;
    return { niveau: "niveau2", famille: "carre", a, b, c, d, zeros: construireEquationSansRacine(A, B, C) };
  }
  throw new Error("construireNiveau2Carre : aucune combinaison sans racine trouvée après 500 tentatives");
}
