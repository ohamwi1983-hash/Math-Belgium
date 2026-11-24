import { net, polyDerivee, polyVal } from "../ui5e/ecrituresApplicationsDerivees";

/**
 * Couche core — `5gen70` « Taux de variation instantané en contexte » (5e ch. 5, § 3 « Fonction
 * dérivée », processus 2 APPLIQUER). Un modèle polynomial f d'une grandeur du contexte ; on compare
 * le taux de variation MOYEN sur [a ; b] et le taux INSTANTANÉ f′(a), on donne son unité (unité de f
 * par unité de la variable) et on l'interprète (signe : la grandeur augmente ou diminue).
 * Contextes (variantes) : température T(t) (°C, heures), altitude d'un drone h(t) (m, secondes),
 * bénéfice B(q) (€, pièces), population N(t) (milliers d'habitants, années).
 * Le signe de f′(a) (verdict de l'interprétation) est tiré moitié / moitié AVANT les nombres. Tous les
 * f′(a) sont entiers non nuls ; le taux moyen est un décimal exact.
 */

export type VarianteTauxInstantane = "temperature" | "altitude" | "benefice" | "population";

export interface ExerciceTauxInstantane {
  variante: VarianteTauxInstantane;
  /** Coefficients du modèle, du plus haut degré au plus bas. */
  coefs: number[];
  /** Instant a (taux instantané) et borne b du taux moyen sur [a ; b]. */
  a: number;
  b: number;
  /** Domaine du modèle [0 ; tmax]. */
  tmax: number;
  /** Ordre d'affichage des options (unités, interprétations) ; l'option 0 est la bonne. */
  ordreUnites: number[];
  ordreInterpretations: number[];
}

type E = ExerciceTauxInstantane;

export interface ContexteTaux {
  nom: string;
  variable: string;
  /** Unité de f (texte), unité de la variable (texte, singulier). */
  uniteF: string;
  uniteX: string;
  /** Unité du taux (bonne), puis trois unités fausses : unité de f, inverse, produit. */
  unites: [string, string, string, string];
  /** « par heure », « par seconde »… (interprétation). */
  parX: string;
  grandeur: string;
  /** Instant en clair (« t = 3 h », « q = 30 pièces »). */
  instant: (x: number) => string;
}

export const CONTEXTES: Record<VarianteTauxInstantane, ContexteTaux> = {
  temperature: {
    nom: "T",
    variable: "t",
    uniteF: "°C",
    uniteX: "h",
    unites: ["°C/h", "°C", "h/°C", "°C·h"],
    parX: "°C par heure",
    grandeur: "la température",
    instant: (x) => `t = ${x} h`,
  },
  altitude: {
    nom: "h",
    variable: "t",
    uniteF: "m",
    uniteX: "s",
    unites: ["m/s", "m", "s/m", "m·s"],
    parX: "mètres par seconde",
    grandeur: "l'altitude du drone",
    instant: (x) => `t = ${x} s`,
  },
  benefice: {
    nom: "B",
    variable: "q",
    uniteF: "€",
    uniteX: "pièce",
    unites: ["€/pièce", "€", "pièce/€", "€·pièce"],
    parX: "€ par pièce supplémentaire",
    grandeur: "le bénéfice",
    instant: (x) => `q = ${x} pièces`,
  },
  population: {
    nom: "N",
    variable: "t",
    uniteF: "milliers d'habitants",
    uniteX: "an",
    unites: ["milliers d'habitants par an", "milliers d'habitants", "années par millier d'habitants", "milliers d'habitants × années"],
    parX: "milliers d'habitants par an",
    grandeur: "la population",
    instant: (x) => `t = ${x} (en ${2000 + x})`,
  },
};

export const contexte = (e: E): ContexteTaux => CONTEXTES[e.variante];
export const valeur = (e: E, x: number): number => net(polyVal(e.coefs, x));
export const deriveeCoefs = (e: E): number[] => polyDerivee(e.coefs);
export const deriveeEn = (e: E, x: number): number => net(polyVal(deriveeCoefs(e), x));
export const tauxMoyen = (e: E): number => net((valeur(e, e.b) - valeur(e, e.a)) / (e.b - e.a));
export const tauxInstantane = (e: E): number => deriveeEn(e, e.a);

/** Points de contrôle d'une dérivée saisie (dans le domaine). */
export function pointsControle(e: E): number[] {
  const m = e.tmax;
  return [0.13, 0.31, 0.47, 0.62, 0.86].map((k) => net(k * m));
}
