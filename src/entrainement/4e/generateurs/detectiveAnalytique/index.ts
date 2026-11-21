import type { ExerciceDetectiveAnalytique, SupportDetective, TypeErreurAnalytique } from "../../core/detectiveAnalytique.types";
import { LEURRES_PAR_SUPPORT, TYPES_PAR_SUPPORT } from "../../moteur/modeleDetectiveAnalytique";
import { choisir, entier, melanger, nonNul, pgcd } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen99 « Détective d'erreurs : géométrie analytique ». Tout le hasard passe par
 * `Math.random` (le `?code=` rejoue le tirage : ordre des descriptions et position de la ligne fausse
 * compris).
 *
 * Variante = exercice support. Le TYPE D'ERREUR est tiré à pile ou face AVANT les nombres, puis `av`
 * (0 à 3 lignes justes avant la ligne fausse) uniformément : les deux verdicts sont équilibrés et les
 * contraintes sur les nombres sont les MÊMES pour les deux types d'un support (aucun détail des
 * nombres ne trahit l'erreur) :
 * - droite : β·x_A − α·y_A ≠ 0 (le signe de c se voit) ;
 * - perpendiculaire : a, b non nuls, |a| ≠ |b| ;
 * - pente : m ∈ {−3, −2, 2, 3} (l'inverse diffère), x_A ≠ 0 (m·x_A non nul) ;
 * - cercle : centre à coordonnées non nulles, r² ≥ 2 ;
 * - parabole : p ∈ {±1, ±2, ±3, ±4} ;
 * - distance : d écrite « αx = βy + γ » (α, β > 0 distincts), H entier, C = H + k·(α ; −β) ; la
 *   composante négative de CH est la plus petite en valeur absolue (un carré compté négatif laisse
 *   une racine réelle) ; la droite « mal ramenée » ne passe pas par C.
 */

export const CATALOGUE_VARIANTES: { id: SupportDetective; label: string }[] = [
  { id: "droite", label: "Équation d'une droite par un point et un vecteur directeur" },
  { id: "perpendiculaire", label: "Droite perpendiculaire passant par un point" },
  { id: "pente", label: "Pente et équation explicite par deux points" },
  { id: "cercle", label: "Centre et rayon d'un cercle (équation développée)" },
  { id: "parabole", label: "Foyer et directrice d'une parabole" },
  { id: "distance", label: "Distance d'un point à une droite" },
];

function donnees(s: SupportDetective): Record<string, number> {
  for (;;) {
    switch (s) {
      case "droite": {
        const al = nonNul(-4, 4);
        const be = nonNul(-4, 4);
        const xA = entier(-6, 6);
        const yA = entier(-6, 6);
        if (pgcd(al, be) !== 1 || be * xA - al * yA === 0) continue;
        return { xA, yA, al, be };
      }
      case "perpendiculaire": {
        const a = nonNul(-4, 4);
        const b = nonNul(-4, 4);
        if (pgcd(a, b) !== 1 || Math.abs(a) === Math.abs(b) || a < 0) continue;
        return { a, b, c: entier(-8, 8), xP: entier(-6, 6), yP: entier(-6, 6) };
      }
      case "pente": {
        const m = choisir([-3, -2, 2, 3]);
        const dx = choisir([-3, -2, -1, 1, 2, 3]);
        const xA = nonNul(-5, 5);
        const yA = entier(-6, 6);
        if (Math.abs(yA + m * dx) > 12 || Math.abs(xA + dx) > 9) continue;
        return { xA, yA, m, dx };
      }
      case "cercle": {
        const a = nonNul(-5, 5);
        const b = nonNul(-5, 5);
        const R = choisir([4, 9, 16, 25, 36, 5, 8, 10, 13, 18, 20]);
        return { a, b, R };
      }
      case "parabole":
        return { xS: entier(-4, 4), yS: entier(-4, 4), p: choisir([-4, -3, -2, -1, 1, 2, 3, 4]) };
      case "distance": {
        const [al, be] = choisir([
          [1, 2],
          [2, 1],
          [1, 3],
          [3, 1],
          [2, 3],
          [3, 2],
        ] as const);
        const k = choisir([-2, -1, 1, 2]);
        // CH = (−k·α ; k·β) : la composante négative doit être la plus petite en valeur absolue.
        const dx = -k * al;
        const dy = k * be;
        const neg = dx < 0 ? dx : dy;
        const pos = dx < 0 ? dy : dx;
        if (Math.abs(neg) >= Math.abs(pos)) continue;
        const xH = entier(-4, 4);
        const yH = entier(-4, 4);
        const ga = al * xH - be * yH;
        const xC = xH + k * al;
        const yC = yH - k * be;
        // Droite « mal ramenée » al·x + be·y + ga = 0 : C ne doit pas être dessus.
        if (al * xC + be * yC + ga === 0 || ga === 0) continue;
        return { al, be, ga, xH, yH, k };
      }
    }
  }
}

export function genererDetectiveAnalytique(support: SupportDetective, type?: TypeErreurAnalytique): ExerciceDetectiveAnalytique {
  const ty = type ?? choisir(TYPES_PAR_SUPPORT[support]);
  const d = donnees(support);
  const av = entier(0, 3);
  const [t1, t2] = TYPES_PAR_SUPPORT[support];
  const options = melanger([ty, ty === t1 ? t2 : t1, ...LEURRES_PAR_SUPPORT[support]]);
  return { support, type: ty, d, av, options };
}

export function construireAvecVariante(id: string): ExerciceDetectiveAnalytique {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceDetectiveAnalytique();
  return genererDetectiveAnalytique(id as SupportDetective);
}

export function genererExerciceDetectiveAnalytique(): ExerciceDetectiveAnalytique {
  return genererDetectiveAnalytique(choisir(CATALOGUE_VARIANTES).id);
}
