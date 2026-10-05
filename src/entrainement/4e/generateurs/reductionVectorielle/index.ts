/**
 * Couche A — "Réduction d'une somme de vecteurs (Chasles)" (chapitre "Calcul vectoriel",
 * cinquième générateur). Simplification délibérée par rapport à l'exemple illustratif de la spec
 * (`\vec{FA}+\vec{FM}-\vec{OL}-2\vec{QS}` — figure source non disponible dans ce dépôt) : plutôt
 * que de dépendre de relations géométriques propres à chaque figure (ex. "telle diagonale vaut le
 * double de tel côté"), l'expression à réduire est construite comme une CHAÎNE TÉLESCOPIQUE de
 * Chasles (toujours mathématiquement valide, quels que soient les points intermédiaires choisis)
 * additionnée de 0 à 2 "paires annulantes" (`k\vec{RS}+k\vec{SR}=\vec 0`, corollaire immédiat de
 * Chasles) — fidèle à l'objectif ("réduire... en utilisant la relation de Chasles") sans exiger de
 * relation géométrique figure-spécifique, et généralisable identiquement aux 4 figures.
 */
import type {
  ExerciceReductionVectorielle,
  FigureReduction,
  GenerateurExerciceReductionVectorielle,
  TermeReduction,
} from "../../core/reductionVectorielle.types";
import { FIGURES } from "./figures";
import { randomInt } from "./aleatoire";

const COEFFICIENTS_ANNULATION = [-3, -2, -1, 1, 2, 3];

function melanger<T>(items: T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function tirerPointsDistincts(noms: string[], n: number): string[] {
  return melanger(noms).slice(0, n);
}

function construireChaineTelescopique(chemin: string[]): TermeReduction[] {
  const termes: TermeReduction[] = [];
  for (let i = 0; i < chemin.length - 1; i++) {
    const [depart, arrivee] = [chemin[i], chemin[i + 1]];
    if (Math.random() < 0.5) {
      termes.push({ origine: depart, arrivee, coefficient: 1 });
    } else {
      // -\vec{arrivee,depart} = \vec{depart,arrivee} — même vecteur, notation inversée.
      termes.push({ origine: arrivee, arrivee: depart, coefficient: -1 });
    }
  }
  return termes;
}

function construirePaireAnnulante(noms: string[]): TermeReduction[] {
  const [r, s] = tirerPointsDistincts(noms, 2);
  const k = COEFFICIENTS_ANNULATION[randomInt(0, COEFFICIENTS_ANNULATION.length - 1)];
  // k*\vec{RS} + k*\vec{SR} = k*(\vec{RS}+\vec{SR}) = \vec 0 (corollaire de Chasles).
  return [
    { origine: r, arrivee: s, coefficient: k },
    { origine: s, arrivee: r, coefficient: k },
  ];
}

function construireAvecFigure(figure: FigureReduction): ExerciceReductionVectorielle {
  const { points } = FIGURES[figure];
  const noms = Object.keys(points);

  const [pointDepart, pointArrivee] = tirerPointsDistincts(noms, 2);
  const nombreSegments = randomInt(2, 3);
  const intermediaires = tirerPointsDistincts(
    noms.filter((n) => n !== pointDepart && n !== pointArrivee),
    nombreSegments - 1,
  );
  const chemin = [pointDepart, ...intermediaires, pointArrivee];

  const termes = [...construireChaineTelescopique(chemin)];
  const nombrePairesAnnulantes = randomInt(0, 2);
  for (let i = 0; i < nombrePairesAnnulantes; i++) {
    termes.push(...construirePaireAnnulante(noms));
  }

  return {
    figure,
    points,
    termes: melanger(termes),
    pointDepart,
    pointArrivee,
    reponse: {
      x: points[pointArrivee].x - points[pointDepart].x,
      y: points[pointArrivee].y - points[pointDepart].y,
    },
  };
}

export const CATALOGUE_VARIANTES: { id: FigureReduction; label: string }[] = [
  { id: "hexagone", label: "Hexagone régulier + centre" },
  { id: "etoile", label: "Étoile à 6 branches" },
  { id: "trapeze", label: "Trapèze + diagonales" },
  { id: "triangleMedianes", label: "Triangle + médianes" },
];

export function construireAvecVarianteId(varianteId: FigureReduction): ExerciceReductionVectorielle {
  return construireAvecFigure(varianteId);
}

export const genererExerciceReductionVectorielle: GenerateurExerciceReductionVectorielle = () => {
  const figure = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecFigure(figure);
};
