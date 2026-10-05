/**
 * Couche A — "Regroupement en classes et histogramme". N'importe que la banque de contextes déjà
 * partagée pour "Inégalité de Bienaymé-Tchebychev" (`generateurs/bienaymeTchebychev/contextes.ts`,
 * import générateur→générateur, explicitement autorisé — voir CLAUDE.md) ; sinon totalement
 * indépendant, comme "Tableau de fréquences" avant lui.
 */
import type { ClasseHistogramme, ExerciceHistogramme, VarianteHistogramme } from "../../core/histogramme.types";
import type { ContexteBienaymeTchebychev } from "../../core/bienaymeTchebychev.types";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
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

/** Jitter (en unités entières) appliqué autour du centre de `contexte.plageXBar` pour la borne de
 * départ — conserve une part de variété d'un exercice à l'autre au sein d'un même contexte, jamais
 * une position figée uniquement dérivée du centre. */
const JITTER_BORNE_DEPART = 3;

export const CATALOGUE_VARIANTES: { id: VarianteHistogramme; label: string }[] = [
  { id: "effectif", label: "Hauteur = effectif" },
  { id: "frequence", label: "Hauteur = fréquence (%)" },
];

/** Arrondit à 1 décimale — évite le bruit de virgule flottante résiduel (`2.3000000000000003`). */
function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

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
 * Génère les `effectif` données brutes d'une classe — chacune une décimale à 1 chiffre strictement
 * à l'intérieur de `]borneInf, borneSup[` (jamais sur une frontière, voir le contrat). Si
 * `forcerFrontiere` est vrai, la toute première valeur générée vaut exactement `borneSup - 0,1` —
 * volontairement proche de la frontière partagée avec la classe suivante, support de l'Aide 1 de
 * l'écran "Classement" (`donneeFrontiere`).
 */
function construireDonneesClasse(borne: { borneInf: number; borneSup: number }, effectif: number, forcerFrontiere: boolean): number[] {
  const maxDecimales = (borne.borneSup - borne.borneInf) * 10 - 1;
  const valeurs: number[] = [];
  for (let i = 0; i < effectif; i++) {
    const decimales = forcerFrontiere && i === 0 ? maxDecimales : randomInt(1, maxDecimales);
    valeurs.push(round1(borne.borneInf + decimales / 10));
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
  const contexte = overrides?.contexte ?? CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
  const n = overrides?.n ?? CANDIDATS_N[randomInt(0, CANDIDATS_N.length - 1)];
  const nombreClasses = overrides?.nombreClasses ?? randomInt(NOMBRE_CLASSES_MIN, NOMBRE_CLASSES_MAX);
  const amplitude = overrides?.amplitude ?? randomInt(AMPLITUDE_MIN, AMPLITUDE_MAX);
  // Bornes de classes centrées sur le milieu de la plage réaliste du contexte (jamais en dessous de
  // 0 — une donnée individuelle n'est jamais réaliste négative pour aucun contexte de la banque),
  // avec un léger jitter pour ne pas figer systématiquement le même point de départ.
  const centre = (contexte.plageXBar[0] + contexte.plageXBar[1]) / 2;
  const etendueTotale = nombreClasses * amplitude;
  const borneDepart = Math.max(0, Math.round(centre - etendueTotale / 2) + randomInt(-JITTER_BORNE_DEPART, JITTER_BORNE_DEPART));

  const bornes = construireBornesClasses(nombreClasses, amplitude, borneDepart);
  const effectifs = tirerEffectifs(n, nombreClasses);
  // Jamais la dernière classe — il faut une classe suivante avec laquelle partager la frontière.
  const classeIndexFrontiere = randomInt(0, nombreClasses - 2);

  const donneesParClasse = bornes.map((borne, i) => construireDonneesClasse(borne, effectifs[i], i === classeIndexFrontiere));

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
