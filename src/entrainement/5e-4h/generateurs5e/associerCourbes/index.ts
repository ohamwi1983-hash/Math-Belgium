import { courbesDistinctes, fenetre, type ExerciceAssocierCourbes, type VarianteAssocierCourbes } from "../../moteur5e/modeleAssocierCourbes";
import type { SinusoideExacte } from "../../moteur5e/sinusoideExacte";
import { choisir, entier, melanger, rat } from "../../moteur5e/trigExact";

/**
 * Générateur de 5gen53 « Associer formules et courbes » (hasard par `Math.random` : `genererAvecCode`
 * rouvre le même exercice, même ordre des courbes).
 * - dephasage : même A, ω ∈ {2, 3, 1/2}, b ; quatre φ distincts parmi les multiples de π/4 de ]−π ; π]
 *   (piège : φ n'est pas le décalage, Φ = −φ/ω) ;
 * - amplitude : même ω, φ, b ; A ∈ {a, −a, a′, −a′} (piège : signe de A, courbe retournée) ;
 * - pulsation : φ = 0 sauf une, ω ∈ {1/2, 1, 2} et une quatrième −sin(2x) (piège : ω n'est pas T) ;
 * - melange : une expression de base et trois variantes qui changent chacune UN paramètre (−A, b, ω).
 * Les quatre courbes sont toujours nettement distinctes ; l'ordre des courbes est mélangé.
 */

export const CATALOGUE_VARIANTES: { id: VarianteAssocierCourbes; label: string }[] = [
  { id: "dephasage", label: "Seul φ change (φ ou Φ ?)" },
  { id: "amplitude", label: "Seul A change (signe de A)" },
  { id: "pulsation", label: "Seul ω change (ω ou T ?)" },
  { id: "melange", label: "Un paramètre différent par expression" },
];

const PHI_QUARTS = [-3, -2, -1, 0, 1, 2, 3, 4].map((k) => rat(k, 4));

function sin(A: number, omega: ReturnType<typeof rat>, phi: ReturnType<typeof rat>, b: number): SinusoideExacte {
  return { A, omega, phi, b, enPi: true };
}

function tirer(variante: VarianteAssocierCourbes): SinusoideExacte[] {
  const A = choisir([1, 2, 3]) * (Math.random() < 0.5 ? -1 : 1);
  const b = entier(-2, 2);
  switch (variante) {
    case "dephasage": {
      const w = choisir([rat(2), rat(3), rat(1, 2)]);
      return melanger(PHI_QUARTS).slice(0, 4).map((phi) => sin(A, w, phi, b));
    }
    case "amplitude": {
      const w = choisir([rat(1), rat(2), rat(1, 2)]);
      const phi = choisir(PHI_QUARTS);
      const [a1, a2] = melanger([1, 2, 3]);
      return [a1!, -a1!, a2!, -a2!].map((a) => sin(a, w, phi, b));
    }
    case "pulsation":
      return [sin(Math.abs(A), rat(1, 2), rat(0), b), sin(Math.abs(A), rat(1), rat(0), b), sin(Math.abs(A), rat(2), rat(0), b), sin(Math.abs(A), rat(2), rat(1), b)];
    case "melange": {
      const w = choisir([rat(1), rat(2)]);
      const autreW = w.n === 1 && w.d === 1 ? rat(2) : rat(1);
      const phi = choisir([-1, 0, 1, 2].map((k) => rat(k, 2)));
      const b2 = b + (b >= 1 ? -2 : 2);
      return [sin(A, w, phi, b), sin(-A, w, phi, b), sin(A, w, phi, b2), sin(A, autreW, phi, b)];
    }
  }
}

export function genererAssocierCourbes(variante: VarianteAssocierCourbes): ExerciceAssocierCourbes {
  for (;;) {
    const expressions = melanger(tirer(variante));
    const f = fenetre({ variante, expressions });
    if (f.colonnes > 16) continue;
    let ok = true;
    for (let i = 0; i < 4 && ok; i++) for (let j = i + 1; j < 4 && ok; j++) ok = courbesDistinctes(expressions[i]!, expressions[j]!, f);
    if (!ok) continue;
    return { variante, expressions, ordre: melanger([0, 1, 2, 3]) };
  }
}

export function construireAvecVariante(id: string): ExerciceAssocierCourbes {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceAssocierCourbes();
  return genererAssocierCourbes(id as VarianteAssocierCourbes);
}

export function genererExerciceAssocierCourbes(): ExerciceAssocierCourbes {
  return genererAssocierCourbes(choisir(CATALOGUE_VARIANTES).id);
}
