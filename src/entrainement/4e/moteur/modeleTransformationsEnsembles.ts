import type {
  Axe,
  ExerciceTransformationsEnsembles,
  Intervalle,
  NatureTransformation,
  Transformation,
  TypeTransformation,
} from "../core/transformationsEnsembles.types";

/**
 * Modèle de gen72 : effet d'une transformation du graphique sur le domaine (transformations
 * horizontales) ou sur l'ensemble image (transformations verticales). Une seule source pour l'écran,
 * les aides, la vérification et l'adaptateur de feuilles.
 */

const AXES: Record<TypeTransformation, Axe> = { TH: "H", SOY: "H", EH: "H", CH: "H", TV: "V", SOX: "V", EV: "V", CV: "V" };
const NATURES: Record<TypeTransformation, NatureTransformation> = { TH: "T", TV: "T", SOX: "S", SOY: "S", EH: "D", CH: "D", EV: "D", CV: "D" };

export function axeDe(t: Transformation | TypeTransformation): Axe {
  return AXES[typeof t === "string" ? t : t.type];
}

export function natureDe(t: Transformation | TypeTransformation): NatureTransformation {
  return NATURES[typeof t === "string" ? t : t.type];
}

/** −0 → 0 (affichage « 0 », jamais « −0 »). */
function net(n: number): number {
  return n === 0 ? 0 : n;
}

/** Image d'un intervalle par une transformation de son axe (l'autre axe le laisse inchangé). */
export function appliquer(t: Transformation, i: Intervalle): Intervalle {
  switch (t.type) {
    case "TH":
    case "TV":
      return { ...i, gauche: net(i.gauche + t.valeur), droite: net(i.droite + t.valeur) };
    case "SOX":
    case "SOY":
      // Les bornes changent de signe et s'échangent ; chaque crochet suit sa borne.
      return { gauche: net(-i.droite), gaucheFerme: i.droiteFerme, droite: net(-i.gauche), droiteFerme: i.gaucheFerme };
    case "EH":
    case "EV":
      return { ...i, gauche: net(i.gauche * t.valeur), droite: net(i.droite * t.valeur) };
    case "CH":
    case "CV":
      return { ...i, gauche: net(i.gauche / t.valeur), droite: net(i.droite / t.valeur) };
  }
}

/** Transformations d'un axe, avec leur rang (1, 2…) dans la liste de l'énoncé. */
export function transformationsDeLAxe(e: ExerciceTransformationsEnsembles, axe: Axe): { t: Transformation; rang: number }[] {
  return e.transformations.map((t, i) => ({ t, rang: i + 1 })).filter(({ t }) => axeDe(t) === axe);
}

export function ensembleDeDepart(e: ExerciceTransformationsEnsembles, axe: Axe): Intervalle {
  return axe === "H" ? e.domaine : e.image;
}

/** Intervalles successifs après chaque transformation de l'axe (vide si aucune ne l'affecte). */
export function chaine(e: ExerciceTransformationsEnsembles, axe: Axe): Intervalle[] {
  const resultat: Intervalle[] = [];
  let courant = ensembleDeDepart(e, axe);
  for (const { t } of transformationsDeLAxe(e, axe)) {
    courant = appliquer(t, courant);
    resultat.push(courant);
  }
  return resultat;
}

/** Ensemble final (domaine ou ensemble image de g). */
export function ensembleFinal(e: ExerciceTransformationsEnsembles, axe: Axe): Intervalle {
  const c = chaine(e, axe);
  return c.length === 0 ? ensembleDeDepart(e, axe) : c[c.length - 1]!;
}

export function egauxIntervalles(a: Intervalle, b: Intervalle): boolean {
  return memesBornes(a, b) && memesCrochets(a, b);
}

function proches(u: number, v: number): boolean {
  return u === v || Math.abs(u - v) < 1e-9;
}

export function memesBornes(a: Intervalle, b: Intervalle): boolean {
  return proches(a.gauche, b.gauche) && proches(a.droite, b.droite);
}

export function memesCrochets(a: Intervalle, b: Intervalle): boolean {
  return a.gaucheFerme === b.gaucheFerme && a.droiteFerme === b.droiteFerme;
}
