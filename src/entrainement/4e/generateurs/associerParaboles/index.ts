import type { ExerciceAssocierParaboles, ParaboleDonnee, VarianteAssocierParaboles } from "../../core/associerParaboles.types";
import { fenetre, ordonneeOrigine, zerosReels } from "../../moteur/modeleAssocierParaboles";

/**
 * Générateur de gen128 « Associer paraboles et équations » (hasard par `Math.random` :
 * `genererAvecCode` rouvre le même exercice, même ordre des courbes). Contraintes communes : sommets,
 * zéros (quand il y en a) et ordonnées à l'origine ENTIERS ; fenêtre commune d'au plus 14 × 14
 * unités ; quatre paraboles deux à deux distinctes.
 */

export const CATALOGUE_VARIANTES: { id: VarianteAssocierParaboles; label: string }[] = [
  { id: "signesSommet", label: "Forme canonique : seuls les signes du sommet changent" },
  { id: "coefficientA", label: "Forme canonique : même sommet, a, −a, 1/a, −1/a" },
  { id: "factorisee", label: "Forme factorisée : zéros opposés, a opposé" },
  { id: "troisEcritures", label: "Trois écritures mêlées (factorisée, canonique, développée)" },
];

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function choisir<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
function melanger<T>(t: T[]): T[] {
  const c = [...t];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
}
const signe = () => (Math.random() < 0.5 ? -1 : 1);

function tirer(variante: VarianteAssocierParaboles): ParaboleDonnee[] {
  switch (variante) {
    case "signesSommet": {
      const a = choisir([-2, -1, 1, 2]);
      const h = entier(1, 3);
      const k = Math.abs(a) === 2 ? 2 : choisir([1, 4]);
      return [
        { a, h, k, ecriture: "canonique" },
        { a, h: -h, k, ecriture: "canonique" },
        { a, h, k: -k, ecriture: "canonique" },
        { a, h: -h, k: -k, ecriture: "canonique" },
      ];
    }
    case "coefficientA": {
      const m = choisir([2, 3]);
      const h = m * signe();
      const k = m * signe();
      return [m, -m, 1 / m, -1 / m].map((a) => ({ a, h, k, ecriture: "canonique" as const }));
    }
    case "factorisee": {
      const a = choisir([-2, -1, 1, 2]);
      const d = Math.abs(a) === 2 ? 1 : entier(1, 2);
      const h = entier(1, 3) * signe();
      const k = -a * d * d;
      return [
        { a, h, k, ecriture: "factorisee" },
        { a, h: -h, k, ecriture: "factorisee" },
        { a: -a, h, k: -k, ecriture: "factorisee" },
        { a: -a, h: -h, k: -k, ecriture: "factorisee" },
      ];
    }
    case "troisEcritures": {
      const a = choisir([-1, 1]);
      const d = entier(1, 2);
      const h = entier(1, 3) * signe();
      const k = -a * d * d;
      return [
        { a, h, k, ecriture: "factorisee" },
        { a, h: -h, k, ecriture: "canonique" },
        { a: -a, h, k, ecriture: "developpee" },
        { a, h, k: -k, ecriture: "canonique" },
      ];
    }
  }
}

/** Contraintes de lecture : sommet, zéros et ordonnée à l'origine entiers ; fenêtre ≤ 14 × 14. */
export function lisible(ps: ParaboleDonnee[]): boolean {
  for (const p of ps) {
    if (!Number.isInteger(p.h) || !Number.isInteger(p.k)) return false;
    if (zerosReels(p).some((z) => Math.abs(z - Math.round(z)) > 1e-9)) return false;
    const c = ordonneeOrigine(p);
    if (Math.abs(c - Math.round(c)) > 1e-9) return false;
  }
  const f = fenetre({ paraboles: ps });
  return f.xMax - f.xMin <= 14 && f.yMax - f.yMin <= 14;
}

export function genererAssocierParaboles(variante: VarianteAssocierParaboles): ExerciceAssocierParaboles {
  for (;;) {
    const ps = tirer(variante);
    if (!lisible(ps)) continue;
    return { variante, paraboles: melanger(ps), ordre: melanger([0, 1, 2, 3]) };
  }
}

export function construireAvecVariante(id: string): ExerciceAssocierParaboles {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceAssocierParaboles();
  return genererAssocierParaboles(id as VarianteAssocierParaboles);
}

export function genererExerciceAssocierParaboles(): ExerciceAssocierParaboles {
  return genererAssocierParaboles(choisir(CATALOGUE_VARIANTES).id);
}
