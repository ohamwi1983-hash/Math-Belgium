import type { ExerciceAireA, ExerciceAireB, ExerciceAireExcentriciteConique, SousTypeB } from "../../core6e/aireExcentriciteConique.types";
import { q, qAdd, qDiv, qMul, qNum, qSub, tirerEntier, tirerParmi } from "../../moteur6e/algebreLieux";
import type { Q } from "../../moteur6e/algebreLieux";

/**
 * `6gen60` — Aire, rayons focaux et excentricité (6e ch. 10 ; audit, lots B et C). Énoncés TIRÉS (audit
 * G16 : un seul exercice par variante A, e = √2/2 à chaque fois en B) : a, b tirés pour chaque k ;
 * B « abscisse du foyer » avec un rapport t (OP ∥ A′K, K(0 ; t·b)), « angle FBF′ » donné (e² =
 * (1 − cos α)/2), directrices pour k > 1 quelconque (e = 1/√k). Dénominateur du cosinus borné (≤ 60).
 */

const K_A: Record<string, Q> = { A_k_3_2: q(3, 2), A_k_2: q(2), A_k_5_2: q(5, 2), A_k_3: q(3) };

export function construireA(k: Q = tirerParmi(Object.values(K_A))): ExerciceAireA {
  for (;;) {
    const a = tirerEntier(3, 12);
    const b = tirerEntier(1, a - 1);
    // PF + PF′ = 2a et PF = k·PF′ ⇒ PF′ = 2a/(k + 1), PF = k·PF′.
    const pfp = qDiv(q(2 * a), qAdd(k, q(1)));
    const pf = qMul(k, pfp);
    const c2x4 = q(4 * (a * a - b * b));
    const cos = qDiv(qSub(qAdd(qMul(pf, pf), qMul(pfp, pfp)), c2x4), qMul(q(2), qMul(pf, pfp)));
    if (Math.abs(qNum(cos)) >= 0.97 || Number(cos.d) > 60) continue;
    const aire2 = qMul(q(1, 4), qMul(qMul(qMul(pf, pf), qMul(pfp, pfp)), qSub(q(1), qMul(cos, cos))));
    return { famille: "A", a, b, k, pf, pfp, cos, aire2 };
  }
}

const T_PARALLELE = [q(1), q(2), q(1, 2), q(3), q(3, 4), q(4, 3), q(1, 3), q(2, 3)];
const COS_ANGLE = [q(1, 2), q(0), q(-1, 2), q(7, 25), q(-7, 25), q(1, 9), q(7, 9), q(-7, 9), q(17, 25), q(1, 3), q(-1, 3)];
const K_CARRES = [q(4), q(9), q(9, 4), q(16, 9), q(25, 4), q(25, 9)];
const K_IRRATIONNELS = [q(2), q(3), q(5), q(3, 2), q(5, 2), q(6), q(7), q(5, 3)];

export function construireB(sousType: SousTypeB = tirerParmi(["abscisseFoyerParallele", "angleSommetNonFocal", "distanceDirectrices"] as const), kCarre?: boolean): ExerciceAireB {
  if (sousType === "abscisseFoyerParallele") {
    const t = tirerParmi(T_PARALLELE);
    return { famille: "B", sousType, parametre: t, e2: qDiv(q(1), qAdd(q(1), qMul(t, t))) };
  }
  if (sousType === "angleSommetNonFocal") {
    const c = tirerParmi(COS_ANGLE);
    return { famille: "B", sousType, parametre: c, e2: qMul(q(1, 2), qSub(q(1), c)) };
  }
  const carre = kCarre ?? Math.random() < 0.5;
  const k = tirerParmi(carre ? K_CARRES : K_IRRATIONNELS);
  return { famille: "B", sousType, parametre: k, e2: qDiv(q(1), k) };
}

/** Catalogue : identifiants et ordre d'avant gardés ; libellés de ce que fait la variante maintenant. */
export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "A_k_3_2", label: "A — aire du triangle focal, PF = 3/2·PF′" },
  { id: "A_k_2", label: "A — aire du triangle focal, PF = 2·PF′" },
  { id: "A_k_5_2", label: "A — aire du triangle focal, PF = 5/2·PF′" },
  { id: "A_k_3", label: "A — aire du triangle focal, PF = 3·PF′" },
  { id: "B_abscisseFoyerParallele", label: "B — point d'abscisse c et droite parallèle" },
  { id: "B_angleDroitSommetSecondaire", label: "B — angle FBF′ donné (B sommet de l'axe non focal)" },
  { id: "B_distanceDirectrices_carreParfait", label: "B — distance des directrices (e rationnelle)" },
  { id: "B_distanceDirectrices_irrationnel", label: "B — distance des directrices (e irrationnelle)" },
];

export function construireAvecVarianteId(id: string): ExerciceAireExcentriciteConique {
  if (K_A[id]) return construireA(K_A[id]);
  if (id === "B_abscisseFoyerParallele") return construireB("abscisseFoyerParallele");
  if (id === "B_angleDroitSommetSecondaire") return construireB("angleSommetNonFocal");
  return construireB("distanceDirectrices", id.endsWith("carreParfait"));
}

export function genererExerciceAireExcentriciteConique(): ExerciceAireExcentriciteConique {
  return Math.random() < 0.5 ? construireA() : construireB();
}
