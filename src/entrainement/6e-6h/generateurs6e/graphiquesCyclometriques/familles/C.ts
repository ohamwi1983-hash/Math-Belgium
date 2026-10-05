import type { Arcfonction } from "../../../core6e/cyclometrique.types";
import type { CandidatC, ExerciceGraphiqueC } from "../../../core6e/graphiquesCyclometriques.types";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";
import { calculerProprietesC } from "../proprietes";

const ARCFONCTIONS = ["arcsin", "arccos", "arctan"] as const;
const A_VALEURS = [-2, -1, 1, 2] as const;

const DECALAGES_SOMMET = [-1.2, -0.9, -0.7, 0.7, 0.9, 1.2] as const;

/**
 * Dérive `(b,xMax)` GARANTISSANT un domaine `x∈[-xMax;xMax]` non vide et à UN SEUL morceau pour
 * `arcfonction(a·x²+b)` (arcsin/arccos uniquement) — preuve : pour `a>0`, `value(x)=a·x²+b` est
 * minimale en `x=0` (`=b`), croissante ensuite ; la contrainte `-1≤value≤1` donne un intervalle
 * SYMÉTRIQUE `[-xMax;xMax]` (`xMax=√((1-b)/a)`) SEULEMENT si `b∈[-1;1]` (sinon la contrainte
 * `value≥-1` devient elle-même active et scinde le domaine en 2 morceaux disjoints, `[-xMax;-r]∪
 * [r;xMax]`) — symétrique pour `a<0` (maximum en `x=0`), `xMax=√((1+b)/|a|)`. `xMax` CIBLE choisi
 * EN PREMIER (avec une marge de sécurité pour que l'arrondi final de `b` reste dans `[-1;1]`), `b`
 * DÉRIVÉ puis arrondi au quart le plus proche (lisibilité), `xMax` RECALCULÉ depuis ce `b` arrondi
 * (jamais depuis la cible brute, pour rester parfaitement cohérent avec le `b` réellement affiché).
 */
function deriverBorneQuadratique(a: number): { b: number; xMax: number } {
  const borneSup = Math.sqrt(2 / Math.abs(a)) * 0.85;
  const xMaxCible = 0.3 + Math.random() * (borneSup - 0.3);
  const bBrut = a > 0 ? 1 - a * xMaxCible * xMaxCible : Math.abs(a) * xMaxCible * xMaxCible - 1;
  const b = Math.round(bBrut * 4) / 4;
  const xMax = a > 0 ? Math.sqrt((1 - b) / a) : Math.sqrt((1 + b) / Math.abs(a));
  return { b, xMax };
}

/**
 * Famille C — `f(x) = arcfonction(a·x²+b)`, arcfonction∈{arcsin,arccos,arctan}. Écran 1 : donner
 * le domaine (arcsin/arccos) ou confirmer domaine=ℝ (arctan). Écran 2 : sélectionner le bon
 * graphique.
 */
export function construireC(): ExerciceGraphiqueC {
  const arcfonction = tirerParmi(ARCFONCTIONS);

  if (arcfonction === "arctan") {
    const a = tirerParmi(A_VALEURS);
    const b = tirerParmi([-3, -2, -1, 0, 1, 2, 3] as const);
    const reel: CandidatC = { a, b, arcfonction, argumentLineaire: false, domaineTraceForce: false, decalageAffichage: 0 };
    return construireExercice(reel, null, null);
  }

  const a = tirerParmi(A_VALEURS);
  const { b, xMax } = deriverBorneQuadratique(a);
  const reel: CandidatC = {
    a,
    b,
    arcfonction,
    argumentLineaire: false,
    domaineTraceForce: false,
    decalageAffichage: 0,
  };
  return construireExercice(reel, -xMax, xMax);
}

function construireExercice(reel: CandidatC, domaineInf: number | null, domaineSup: number | null): ExerciceGraphiqueC {
  const domaineIncorrect: CandidatC =
    reel.arcfonction === "arctan" ? { ...reel, domaineTraceForce: true } : { ...reel, argumentLineaire: true };

  const formeInversee: CandidatC = { ...reel, a: -reel.a };

  const mauvaiseValeurSommet: CandidatC = { ...reel, decalageAffichage: tirerParmi(DECALAGES_SOMMET) };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, domaineIncorrect, formeInversee, mauvaiseValeurSommet]);
  return { famille: "C", reel, proprietes: calculerProprietesC(reel), domaineInf, domaineSup, candidats, indexCorrect };
}

export type { Arcfonction };
export { A_VALEURS as C_A_VALEURS };
