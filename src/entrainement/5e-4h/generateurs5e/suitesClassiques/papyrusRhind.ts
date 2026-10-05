import type { ExercicePapyrusRhind } from "../../core5e/suitesClassiques.types";
import { sommeArithmetique, termeArithmetique } from "../suitesArithmetiques/parametres";

/** Scénario 2 — papyrus de Rhind (5 parts en progression arithmétique, somme=100).
 *
 * Système posé par l'élève : 5a+10Δ=100 (somme des 5 termes) et 7(2a+Δ)=3a+9Δ (la somme des 2
 * PLUS GRANDES parts vaut 1/7 de la somme des 3 plus petites — condition historique du papyrus).
 * Résolu ici algébriquement pour DÉRIVER a/Δ, jamais recopié :
 *   eq2 ⟺ 14a+7Δ=3a+9Δ ⟺ 11a=2Δ ⟺ Δ=5.5a
 *   eq1 ⟺ a=20-2Δ (substitution directe de sommeArithmetique(a,Δ,5)=100 ⟺ 5a+10Δ=100)
 *   ⟹ Δ=5.5(20-2Δ)=110-11Δ ⟹ 12Δ=110 ⟹ Δ=110/12=55/6
 */
export function construirePapyrusRhind(): ExercicePapyrusRhind {
  const sommeTotale = 100;
  const delta = 110 / 12; // = 55/6 = 9+1/6
  const a = 20 - 2 * delta; // = 5/3 = 1+2/3
  const termes: [number, number, number, number, number] = [
    termeArithmetique(a, delta, 1),
    termeArithmetique(a, delta, 2),
    termeArithmetique(a, delta, 3),
    termeArithmetique(a, delta, 4),
    termeArithmetique(a, delta, 5),
  ];
  return { scenario: "papyrusRhind", sommeTotale, a, delta, termes };
}

/** Vérifie que (a,delta) satisfait bien les 2 équations du système d'origine — utilisée par les
 * tests pour cross-vérifier la résolution ci-dessus indépendamment de la formule fermée. */
export function verifieSystemePapyrusRhind(a: number, delta: number): { eq1: number; eq2Gauche: number; eq2Droite: number } {
  return {
    eq1: sommeArithmetique(a, delta, 5),
    eq2Gauche: 7 * (2 * a + delta),
    eq2Droite: 3 * a + 9 * delta,
  };
}
