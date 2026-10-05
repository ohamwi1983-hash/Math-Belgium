/**
 * Couche A — "Moyenne pondérée". N'importe que la banque de contextes déjà partagée pour
 * "Inégalité de Bienaymé-Tchebychev" (`generateurs/bienaymeTchebychev/contextes.ts`, import
 * générateur→générateur, explicitement autorisé — voir CLAUDE.md) ; sinon totalement indépendant,
 * comme les deux autres générateurs du chapitre 5.
 */
import type {
  ClasseMoyennePonderee,
  ExerciceMoyennePonderee,
  ExerciceMoyennePondereeClasses,
  ExerciceMoyennePondereeDiscrete,
  LigneMoyennePondereeDiscrete,
  VarianteMoyennePonderee,
} from "../../core/moyennePonderee.types";
import type { ContexteBienaymeTchebychev } from "../../core/bienaymeTchebychev.types";
import { CONTEXTES } from "../bienaymeTchebychev/contextes";
import { randomInt } from "./aleatoire";

/**
 * `n` toujours un DIVISEUR EXACT de 100 — même pool que "Regroupement en classes et histogramme"
 * (`generateurs/histogramme/index.ts::CANDIDATS_N`, dupliqué ici, pas importé — contrats
 * indépendants entre générateurs du même chapitre, même principe que le reste du projet). Voir le
 * contrat (`core/moyennePonderee.types.ts`) pour la justification complète — combiné à la boucle de
 * secours `arrondiPropre` ci-dessous, garantit toujours une moyenne à au plus 2 décimales.
 */
export const CANDIDATS_N: readonly number[] = [10, 20, 25];

const MAX_TENTATIVES_ARRONDI = 300;

const NOMBRE_VALEURS_MIN = 4;
const NOMBRE_VALEURS_MAX = 6;

/** Largeur minimale garantie de la plage de tirage des valeurs discrètes — même principe et même
 * étendue historique que "Tableau de fréquences" (dupliqué, pas importé) : certains contextes de la
 * banque ont un `plageXBar` trop étroit pour y tirer 4 à 6 entiers distincts. */
const LARGEUR_MIN_PLAGE = 14;

/** Élargit `[min,max]` symétriquement autour de son centre jusqu'à `largeurMin`, jamais en dessous
 * de 0 — dupliqué (pas importé) dans chaque générateur qui en a besoin. */
function elargirPlage(min: number, max: number, largeurMin: number): [number, number] {
  const largeur = max - min;
  if (largeur >= largeurMin) return [min, max];
  const centre = (min + max) / 2;
  const nouveauMin = Math.max(0, Math.round(centre - largeurMin / 2));
  return [nouveauMin, nouveauMin + largeurMin];
}

const NOMBRE_CLASSES_MIN = 4;
const NOMBRE_CLASSES_MAX = 5;
const AMPLITUDE_MIN = 2;
const AMPLITUDE_MAX = 5;

/** Jitter (unités entières) autour du centre de `contexte.plageXBar` pour la borne de départ des
 * classes — même principe que "Regroupement en classes et histogramme" (dupliqué, pas importé). */
const JITTER_BORNE_DEPART = 3;

/** Tire une amplitude PAR CLASSE (`promptgen32gen33corrections.md`, point 1 — remplace l'ancienne
 * amplitude unique commune à toutes les classes) — retire tant que toutes les amplitudes tirées
 * sont identiques, pour garantir PAR CONSTRUCTION au moins deux amplitudes distinctes dans le
 * tableau généré, jamais un tirage-puis-vérification a posteriori sur l'ensemble de l'exercice.
 * `nombreClasses` est toujours ≥ `NOMBRE_CLASSES_MIN=4`, donc cette boucle converge en pratique en
 * une poignée d'essais (jamais atteinte à `MAX_TENTATIVES_ARRONDI`, réutilisée ici par simple
 * confort plutôt qu'une constante dédiée). */
function tirerAmplitudes(nombreClasses: number): number[] {
  let amplitudes: number[];
  let tentative = 0;
  do {
    tentative++;
    amplitudes = Array.from({ length: nombreClasses }, () => randomInt(AMPLITUDE_MIN, AMPLITUDE_MAX));
  } while (new Set(amplitudes).size < 2 && tentative < MAX_TENTATIVES_ARRONDI);
  return amplitudes;
}

export const CATALOGUE_VARIANTES: { id: VarianteMoyennePonderee; label: string }[] = [
  { id: "discrete", label: "Données discrètes (x_i / n_i)" },
  { id: "classes", label: "Données groupées en classes" },
];

/** Arrondit à 2 décimales — évite le bruit de virgule flottante résiduel une fois la propreté déjà
 * confirmée par `arrondiPropre`. */
function arrondir2(x: number): number {
  return Math.round(x * 100) / 100;
}

/** Vrai si `valeur`, une fois arrondie à 2 décimales, reproduit exactement la valeur mathématique
 * réelle (à un bruit de virgule flottante minime près) — jamais une vraie décimale périodique ou
 * plus longue que 2 chiffres après la virgule (spec : "arrondit proprement"). */
function arrondiPropre(valeur: number): boolean {
  return Math.abs(Math.round(valeur * 100) / 100 - valeur) < 1e-9;
}

/** Tire `k` valeurs distinctes dans `[min,max]`, triées croissant — jamais un tirage-puis-filtrage
 * a posteriori du nombre réel de distinctes, `k` est fixé d'abord et le tirage réessaie jusqu'à
 * l'atteindre — même principe que "Tableau de fréquences" (dupliqué, pas importé). */
function tirerValeursDistinctes(k: number, min: number, max: number): number[] {
  const valeurs = new Set<number>();
  while (valeurs.size < k) {
    valeurs.add(randomInt(min, max));
  }
  return [...valeurs].sort((a, b) => a - b);
}

/** Répartit `n` en `k` parts strictement positives — même principe que "Tableau de fréquences"/
 * "Regroupement en classes et histogramme" (dupliqué, pas importé). */
function tirerEffectifs(n: number, k: number): number[] {
  const effectifs = new Array(k).fill(1) as number[];
  let reste = n - k;
  while (reste > 0) {
    effectifs[randomInt(0, k - 1)] += 1;
    reste -= 1;
  }
  return effectifs;
}

function construireDiscrete(contexte: ContexteBienaymeTchebychev): ExerciceMoyennePondereeDiscrete {
  let lignes: LigneMoyennePondereeDiscrete[] = [];
  let n = CANDIDATS_N[0];
  let sommeXN = 0;
  let moyenne = 0;
  let tentative = 0;
  const [min, max] = elargirPlage(contexte.plageXBar[0], contexte.plageXBar[1], LARGEUR_MIN_PLAGE);

  do {
    tentative++;
    const k = randomInt(NOMBRE_VALEURS_MIN, NOMBRE_VALEURS_MAX);
    const valeurs = tirerValeursDistinctes(k, min, max);
    n = CANDIDATS_N[randomInt(0, CANDIDATS_N.length - 1)];
    const effectifs = tirerEffectifs(n, k);
    lignes = valeurs.map((valeur, i) => ({ valeur, effectif: effectifs[i] }));
    sommeXN = lignes.reduce((acc, ligne) => acc + ligne.valeur * ligne.effectif, 0);
    moyenne = sommeXN / n;
  } while (!arrondiPropre(moyenne) && tentative < MAX_TENTATIVES_ARRONDI);

  return { contexte, variante: "discrete", n, sommeXN, moyenne: arrondir2(moyenne), lignes };
}

function construireClasses(contexte: ContexteBienaymeTchebychev): ExerciceMoyennePondereeClasses {
  let classes: ClasseMoyennePonderee[] = [];
  let n = CANDIDATS_N[0];
  let sommeXN = 0;
  let moyenne = 0;
  let tentative = 0;

  do {
    tentative++;
    const nombreClasses = randomInt(NOMBRE_CLASSES_MIN, NOMBRE_CLASSES_MAX);
    // Amplitude PROPRE à chaque classe (`promptgen32gen33corrections.md`, point 1 — remplace
    // l'ancienne amplitude unique commune à toutes) — `tirerAmplitudes` garantit déjà au moins deux
    // valeurs distinctes, jamais un tableau uniforme.
    const amplitudes = tirerAmplitudes(nombreClasses);
    // Bornes centrées sur le milieu de la plage réaliste du contexte (jamais en dessous de 0),
    // avec un léger jitter pour ne pas figer systématiquement le même point de départ — même
    // principe que "Regroupement en classes et histogramme".
    const centre = (contexte.plageXBar[0] + contexte.plageXBar[1]) / 2;
    const etendueTotale = amplitudes.reduce((acc, a) => acc + a, 0);
    const borneDepart = Math.max(0, Math.round(centre - etendueTotale / 2) + randomInt(-JITTER_BORNE_DEPART, JITTER_BORNE_DEPART));
    n = CANDIDATS_N[randomInt(0, CANDIDATS_N.length - 1)];
    const effectifs = tirerEffectifs(n, nombreClasses);
    let borneCourante = borneDepart;
    classes = amplitudes.map((amplitude, i) => {
      const borneInf = borneCourante;
      const borneSup = borneInf + amplitude;
      borneCourante = borneSup;
      return { borneInf, borneSup, effectif: effectifs[i], centre: (borneInf + borneSup) / 2 };
    });
    sommeXN = classes.reduce((acc, classe) => acc + classe.centre * classe.effectif, 0);
    moyenne = sommeXN / n;
  } while (!arrondiPropre(moyenne) && tentative < MAX_TENTATIVES_ARRONDI);

  return { contexte, variante: "classes", n, sommeXN, moyenne: arrondir2(moyenne), classes };
}

/** Construit un exercice pour une variante forcée (convention CLAUDE.md, "Catalogue de
 * variantes..."). `overrides?.contexte` permet de forcer aussi le contexte narratif — sans lui, un
 * contexte est tiré aléatoirement dans la banque partagée, comme le générateur brut (les fixtures
 * de test construisent directement un `ExerciceMoyennePonderee` à la main plutôt que de passer par
 * ce générateur pour leurs autres besoins, même principe que "Tableau de fréquences"/"Regroupement
 * en classes et histogramme"). */
export function construireAvecVarianteId(
  varianteId: VarianteMoyennePonderee,
  overrides?: { contexte?: ContexteBienaymeTchebychev },
): ExerciceMoyennePonderee {
  const contexte = overrides?.contexte ?? CONTEXTES[randomInt(0, CONTEXTES.length - 1)];
  return varianteId === "discrete" ? construireDiscrete(contexte) : construireClasses(contexte);
}

export function genererExerciceMoyennePonderee(): ExerciceMoyennePonderee {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
