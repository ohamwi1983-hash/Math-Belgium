/**
 * Couche A — "Regroupement en classes et histogramme". N'importe que la banque de contextes déjà
 * partagée pour "Inégalité de Bienaymé-Tchebychev" (`generateurs/bienaymeTchebychev/contextes.ts`,
 * import générateur→générateur, explicitement autorisé — voir CLAUDE.md) ; sinon totalement
 * indépendant, comme "Tableau de fréquences" avant lui.
 */
import type { ClasseHistogramme, ExerciceHistogramme, VarianteHistogramme } from "../../core/histogramme.types";
import type { ContexteBienaymeTchebychev } from "../../core/bienaymeTchebychev.types";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
import { type EchelleContexte, tirerEchelle, valeurEchelle, valeursRealistes } from "../bienaymeTchebychev/echelleContexte";
import { randomInt, trierAleatoirement } from "./aleatoire";

/**
 * `n` toujours un DIVISEUR EXACT de 100 (jamais seulement `2^a·5^b` comme le trentième exercice) —
 * garantit que `effectif*100/n` est toujours un pourcentage ENTIER, nécessaire pour que la grille
 * crantée à 1 % de l'écran de tracé (variante "fréquence") puisse toujours atteindre la valeur
 * exacte. Voir le contrat (`core/histogramme.types.ts`) pour la justification complète.
 */
export const CANDIDATS_N: readonly number[] = [10, 20, 25];

const NOMBRE_CLASSES_MIN = 4;
const NOMBRE_CLASSES_MAX = 5;
const AMPLITUDE_MIN = 2;
const AMPLITUDE_MAX = 5;

/** Tentatives de tirage (contexte + échelle) avant d'abandonner — les contextes dont la bande
 * réaliste est trop étroite pour 4 à 5 classes (sommeil, 100 m, consommation...) renvoient une
 * échelle `null` et sont simplement retirés (audit chapitre 4). */
const MAX_TENTATIVES = 500;

export const CATALOGUE_VARIANTES: { id: VarianteHistogramme; label: string }[] = [
  { id: "effectif", label: "Hauteur = effectif" },
  { id: "frequence", label: "Hauteur = fréquence (%)" },
];

function construireBornesClasses(nombreClasses: number, amplitude: number, borneDepart: number): { borneInf: number; borneSup: number }[] {
  return Array.from({ length: nombreClasses }, (_, i) => {
    const borneInf = borneDepart + i * amplitude;
    return { borneInf, borneSup: borneInf + amplitude };
  });
}

/** Répartit `n` en `nombreClasses` parts strictement positives (chaque classe apparaît au moins une
 * fois) — même principe que `tableauFrequences/index.ts::tirerEffectifs` (dupliqué, pas importé). */
function tirerEffectifs(n: number, nombreClasses: number): number[] {
  const effectifs = new Array(nombreClasses).fill(1) as number[];
  let reste = n - nombreClasses;
  while (reste > 0) {
    effectifs[randomInt(0, nombreClasses - 1)] += 1;
    reste -= 1;
  }
  return effectifs;
}

/**
 * Génère les `effectif` données brutes d'une classe (bornes en unités de l'échelle) — chacune sur la
 * grille du pas des données, strictement à l'intérieur de `]borneInf, borneSup[` (jamais sur une
 * frontière, voir le contrat). Si `forcerFrontiere` est vrai, la toute première valeur générée vaut
 * exactement `borneSup − pasDonnee` — volontairement proche de la frontière partagée avec la classe
 * suivante, support de l'Aide 1 de l'écran "Classement" (`donneeFrontiere`).
 */
function construireDonneesClasse(
  borne: { borneInf: number; borneSup: number },
  effectif: number,
  forcerFrontiere: boolean,
  echelle: EchelleContexte,
  pasDonnee: number,
): number[] {
  const crans = Math.round(((borne.borneSup - borne.borneInf) * echelle.unite) / pasDonnee);
  const valeurs: number[] = [];
  for (let i = 0; i < effectif; i++) {
    const cran = forcerFrontiere && i === 0 ? crans - 1 : randomInt(1, crans - 1);
    valeurs.push(valeurEchelle(echelle, borne.borneInf + (cran * pasDonnee) / echelle.unite));
  }
  return valeurs;
}

/**
 * Construit un exercice pour une variante forcée (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?` permet de forcer aussi `n`/`amplitude`/`nombreClasses`/`contexte` — sans eux, ces
 * paramètres secondaires restent tirés aléatoirement, comme le générateur brut.
 */
export function construireAvecVarianteId(
  varianteId: VarianteHistogramme,
  overrides?: { n?: number; amplitude?: number; nombreClasses?: number; contexte?: ContexteBienaymeTchebychev },
): ExerciceHistogramme {
  const n = overrides?.n ?? CANDIDATS_N[randomInt(0, CANDIDATS_N.length - 1)];
  let contexte = overrides?.contexte ?? CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
  let nombreClasses = overrides?.nombreClasses ?? randomInt(NOMBRE_CLASSES_MIN, NOMBRE_CLASSES_MAX);
  let amplitudeUnites = randomInt(AMPLITUDE_MIN, AMPLITUDE_MAX);
  let echelle: EchelleContexte = { origine: 0, unite: 1 };
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    contexte = overrides?.contexte ?? CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
    nombreClasses = overrides?.nombreClasses ?? randomInt(NOMBRE_CLASSES_MIN, NOMBRE_CLASSES_MAX);
    amplitudeUnites = randomInt(AMPLITUDE_MIN, AMPLITUDE_MAX);
    // Unité ≥ 1 : bornes de classes toujours entières, amplitude « ronde » (A × unité).
    const tirage = tirerEchelle(contexte, nombreClasses * amplitudeUnites, { uniteMin: 1 });
    if (tirage === null) continue;
    echelle = tirage;
    if (valeursRealistes(contexte, [valeurEchelle(echelle, 0), valeurEchelle(echelle, nombreClasses * amplitudeUnites)])) break;
  }
  const amplitude = overrides?.amplitude ?? amplitudeUnites * echelle.unite;
  // Pas des données brutes : un dixième d'unité, jamais plus fin que le pas naturel du contexte
  // (entiers pour les grandeurs comptées).
  const pasDonnee = Math.max(contexte.pas, contexte.entier ? 1 : 0, echelle.unite / 10);
  const bornesUnites = construireBornesClasses(nombreClasses, amplitude / echelle.unite, 0);
  const bornes = bornesUnites.map((b) => ({ borneInf: valeurEchelle(echelle, b.borneInf), borneSup: valeurEchelle(echelle, b.borneSup) }));
  const effectifs = tirerEffectifs(n, nombreClasses);
  // Jamais la dernière classe — il faut une classe suivante avec laquelle partager la frontière.
  const classeIndexFrontiere = randomInt(0, nombreClasses - 2);

  const donneesParClasse = bornesUnites.map((borne, i) => construireDonneesClasse(borne, effectifs[i], i === classeIndexFrontiere, echelle, pasDonnee));

  const classes: ClasseHistogramme[] = bornes.map((borne, i) => ({
    borneInf: borne.borneInf,
    borneSup: borne.borneSup,
    effectif: effectifs[i],
    frequencePourcent: (effectifs[i] * 100) / n,
  }));

  const donneesBrutes = trierAleatoirement(donneesParClasse.flat());

  return {
    contexte,
    variante: varianteId,
    n,
    amplitude,
    classes,
    donneesBrutes,
    donneeFrontiere: { valeur: donneesParClasse[classeIndexFrontiere][0], classeIndex: classeIndexFrontiere },
  };
}

export function genererExerciceHistogramme(): ExerciceHistogramme {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
