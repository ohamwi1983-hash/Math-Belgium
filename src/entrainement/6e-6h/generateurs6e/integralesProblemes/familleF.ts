import type { ExerciceFamilleF_Problemes } from "../../core6e/integralesProblemes.types";

/**
 * Couche A (6e) — famille F de `6gen29` : surplus consommateur, NOUVEAU PATRON pour ce chantier.
 * f(x)=A·e^(−k·x) (demande, décroissante), g(x)=m·x+p (offre, affine croissante, coefficients
 * ENTIERS "donnés explicitement" — spec : "pas de lecture graphique nécessaire").
 *
 * ============================================================================
 * **Point d'équilibre (Q,P) — résolu NUMÉRIQUEMENT, jamais par une forme fermée**
 * ============================================================================
 * f(x)−g(x)=0 est une équation TRANSCENDANTE (A·e^(−kx) contre une droite) : aucune forme fermée
 * générique. Contrairement au scénario `parametre` de 6gen25 (m choisi EXACTEMENT par construction
 * pour 3 techniques CANONIQUES reconnaissables), ce contexte économique n'a pas cette liberté sans
 * casser la contrainte "g donnée EXPLICITEMENT avec des coefficients propres" — Q,P restent donc
 * des valeurs NUMÉRIQUES (comparées par tolérance côté Couche B), résolues ici par BISECTION.
 *
 * **Unicité garantie** (jamais vérifiée a posteriori, prouvée par construction) : soit
 * h(x)=f(x)−g(x). h'(x) = −A·k·e^(−kx) − m < 0 pour tout x (A,k,m > 0) ⇒ h STRICTEMENT
 * décroissante sur ℝ ⇒ AU PLUS une racine. h(0)=A−p > 0 (car p < A·e^0 = A, et plus généralement
 * p est choisi petit face à A) et h(30) < 0 pour les plages de paramètres choisies (A≤40, m≥2)
 * ⇒ EXACTEMENT une racine dans [0;30], trouvée par bissection (convergence garantie, fonction
 * continue changeant de signe).
 */

function entierEntre(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const OPTIONS_K: { num: number; den: number }[] = [
  { num: 1, den: 5 }, // 0,2
  { num: 3, den: 10 }, // 0,3
  { num: 2, den: 5 }, // 0,4
  { num: 1, den: 2 }, // 0,5
];

/** Bissection générique — `h` continue, `h(gauche)>0`, `h(droite)<0` (signes STRICTS attendus en
 * entrée), retourne une racine à `iterations` de précision (30 itérations ⇒ précision ~1e-9 sur un
 * intervalle de longueur 30). */
export function bissection(h: (x: number) => number, gauche: number, droite: number, iterations = 60): number {
  let a = gauche;
  let b = droite;
  for (let i = 0; i < iterations; i++) {
    const m = (a + b) / 2;
    if (h(m) > 0) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

export function construireFamilleF(): ExerciceFamilleF_Problemes {
  const A = entierEntre(20, 40);
  const { num: kNum, den: kDen } = OPTIONS_K[Math.floor(Math.random() * OPTIONS_K.length)];
  const k = kNum / kDen;
  const m = entierEntre(2, 5);
  const p = entierEntre(0, 5);

  const f = (x: number) => A * Math.exp(-k * x);
  const g = (x: number) => m * x + p;
  const h = (x: number) => f(x) - g(x);

  const Q = bissection(h, 0, 30);
  const P = g(Q);

  const exerciceSansSurplus = { famille: "F" as const, A, kNum, kDen, m, p, Q, P, surplusAttendu: 0 };
  exerciceSansSurplus.surplusAttendu = surplusConsommateur(exerciceSansSurplus);
  return exerciceSansSurplus;
}

export function demandeReference(ex: ExerciceFamilleF_Problemes): (x: number) => number {
  const k = ex.kNum / ex.kDen;
  return (x: number) => ex.A * Math.exp(-k * x);
}

export function offreReference(ex: ExerciceFamilleF_Problemes): (x: number) => number {
  return (x: number) => ex.m * x + ex.p;
}

/** Primitive de f(x)=A·e^(−kx), constante nulle : F(x) = −(A/k)·e^(−kx). */
export function primitiveDemandeReference(ex: ExerciceFamilleF_Problemes): (x: number) => number {
  const k = ex.kNum / ex.kDen;
  return (x: number) => (-ex.A / k) * Math.exp(-k * x);
}

/** Surplus consommateur = ∫[0;Q] (f(x)−P) dx = F(Q)−F(0) − P·Q. */
export function surplusConsommateur(ex: ExerciceFamilleF_Problemes): number {
  const F = primitiveDemandeReference(ex);
  return F(ex.Q) - F(0) - ex.P * ex.Q;
}
