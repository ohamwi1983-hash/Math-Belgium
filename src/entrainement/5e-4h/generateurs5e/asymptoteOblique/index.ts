/**
 * Couche A (5e) — 5gen21 ("Asymptote oblique"). Construction "à l'envers" : a/b (quotient
 * Q(x)=ax+b)/c (reste, non nul)/D(x) (dénominateur, degré 1 ou 2) choisis EN PREMIER, coefficients
 * variés en signe/magnitude ; P(x) TOUJOURS dérivé ensuite par expansion algébrique exacte de
 * Q(x)*D(x)+c — jamais de rejet/régénération, le résultat est par construction toujours un P(x) à
 * coefficients entiers propres.
 */
import type { ExerciceAsymptoteOblique, ExerciceGen21, ExercicePositionAsymptote, VarianteAsymptoteOblique, VerdictPosition } from "../../core5e/asymptoteOblique.types";

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function entierNonNul(magnitudeMax: number): number {
  const magnitude = entierAleatoire(1, magnitudeMax);
  return Math.random() < 0.5 ? magnitude : -magnitude;
}

/** Convolution de 2 polynômes, `coeffs[i]` = coefficient de x^i (indice=degré) pour les 2 entrées
 * ET la sortie — degré de sortie = somme des 2 degrés d'entrée. */
function multiplierPolynomes(p: number[], q: number[]): number[] {
  const resultat = new Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) resultat[i + j] += p[i] * q[j];
  }
  return resultat;
}

/** D(x)=x-k, degré 1 (cas P2/P1). */
function genererDenominateurDegre1(): number[] {
  const k = entierAleatoire(-6, 6);
  return [-k, 1];
}

/** D(x)=x²+px+q, degré 2 (cas P3/P2) — `q` TOUJOURS strictement supérieur à `p²/4`, discriminant
 * négatif garanti : AUCUNE racine réelle, donc aucun point à exclure lors de l'échantillonnage de
 * vérification (contrairement au degré 1, où x=k doit l'être). */
function genererDenominateurDegre2(): number[] {
  const p = entierAleatoire(-4, 4);
  const qMin = Math.ceil((p * p) / 4) + 1;
  const q = qMin + entierAleatoire(0, 5);
  return [q, p, 1];
}

interface OptionsGenerationAsymptoteOblique {
  varianteForce?: VarianteAsymptoteOblique;
  degreDenominateurForce?: 1 | 2;
}

/** `options` — réservé au panneau dev (`SelecteurVarianteDev`), pour forcer manuellement la
 * variante et/ou le degré du dénominateur plutôt que le tirage aléatoire habituel. */
export function genererExerciceAsymptoteOblique(options: OptionsGenerationAsymptoteOblique = {}): ExerciceAsymptoteOblique {
  const a = entierNonNul(5);
  const b = entierAleatoire(-8, 8);
  const c = entierNonNul(6);
  const degreDenominateur = options.degreDenominateurForce ?? (Math.random() < 0.5 ? 1 : 2);
  const coeffsD = degreDenominateur === 1 ? genererDenominateurDegre1() : genererDenominateurDegre2();
  const variante: VarianteAsymptoteOblique = options.varianteForce ?? (Math.random() < 0.5 ? "divisionEuclidienne" : "viaLimites");

  // P(x)=Q(x)*D(x)+c = (ax+b)*D(x)+c — développement exact, arithmétique entière.
  const coeffsP = multiplierPolynomes([b, a], coeffsD);
  coeffsP[0] += c;

  return { variante, a, b, c, coeffsD, coeffsP };
}

// ============================================================================
// Famille « position de la courbe par rapport à son asymptote » (lots B–D).
// ============================================================================

const VERDICTS_POSITION: VerdictPosition[] = ["dessus", "dessous", "recoupe"];

/** f(x) = P(x)/D(x) avec D(x) = x² + px + q (Δ < 0), d donnée (AO y = ax + b ou AH y = b) et reste
 * R(x) = rx + s : verdict tiré EN PREMIER, à parts égales ; les nombres ensuite (x₀ entier pour un
 * recoupement, reste constant non nul sinon). */
export function genererExercicePositionAsymptote(asymptote: "oblique" | "horizontale"): ExercicePositionAsymptote {
  const verdict = VERDICTS_POSITION[Math.floor(Math.random() * 3)];
  const a = asymptote === "oblique" ? entierNonNul(3) : 0;
  const b = asymptote === "oblique" ? entierAleatoire(-6, 6) : entierNonNul(5);
  const p = entierAleatoire(-4, 4);
  const q = Math.ceil((p * p) / 4) + 1 + entierAleatoire(0, 4);
  const coeffsD = [q, p, 1];
  let r = 0;
  let s: number;
  if (verdict === "recoupe") {
    r = entierNonNul(3);
    const x0 = entierAleatoire(-4, 4);
    s = -r * x0;
  } else {
    s = (verdict === "dessus" ? 1 : -1) * entierAleatoire(1, 7);
  }
  const coeffsP = multiplierPolynomes([b, a], coeffsD);
  coeffsP[0] += s;
  coeffsP[1] += r;
  while (coeffsP.length > 1 && coeffsP[coeffsP.length - 1] === 0) coeffsP.pop();
  return { variante: "position", asymptote, a, b, r, s, coeffsD, coeffsP, verdict };
}

/**
 * Catalogue : les deux familles « position » sont AJOUTÉES EN FIN (indices 4 et 5) pour que les codes
 * `?code=` déjà imprimés (indice de variante 0–3) rouvrent toujours le même exercice.
 */
export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "divisionEuclidienne-degre1", label: "Via division euclidienne — P2/P1" },
  { id: "divisionEuclidienne-degre2", label: "Via division euclidienne — P3/P2" },
  { id: "viaLimites-degre1", label: "Via les limites — P2/P1" },
  { id: "viaLimites-degre2", label: "Via les limites — P3/P2" },
  { id: "position-ao", label: "Position de la courbe par rapport à son asymptote oblique" },
  { id: "position-ah", label: "Position de la courbe par rapport à son asymptote horizontale" },
];

/**
 * Tirage libre de l'APPLI (bouton « Nouvel exercice ») : une fois sur trois la famille « position »,
 * sinon l'ancien tirage. Le tirage libre de l'adaptateur et des codes (`genererExerciceAsymptoteOblique`)
 * reste celui d'avant, octet pour octet : un ancien code libre rouvre le même exercice.
 */
export function genererExerciceGen21Libre(): ExerciceGen21 {
  if (Math.random() < 1 / 3) return genererExercicePositionAsymptote(Math.random() < 0.5 ? "oblique" : "horizontale");
  return genererExerciceAsymptoteOblique();
}

export function construireGen21AvecFamilleId(id: string): ExerciceGen21 {
  if (id === "position-ao") return genererExercicePositionAsymptote("oblique");
  if (id === "position-ah") return genererExercicePositionAsymptote("horizontale");
  return construireAvecFamilleId(id);
}

export function construireAvecFamilleId(id: string): ExerciceAsymptoteOblique {
  switch (id) {
    case "divisionEuclidienne-degre1":
      return genererExerciceAsymptoteOblique({ varianteForce: "divisionEuclidienne", degreDenominateurForce: 1 });
    case "divisionEuclidienne-degre2":
      return genererExerciceAsymptoteOblique({ varianteForce: "divisionEuclidienne", degreDenominateurForce: 2 });
    case "viaLimites-degre1":
      return genererExerciceAsymptoteOblique({ varianteForce: "viaLimites", degreDenominateurForce: 1 });
    case "viaLimites-degre2":
      return genererExerciceAsymptoteOblique({ varianteForce: "viaLimites", degreDenominateurForce: 2 });
    default:
      throw new Error(`construireAvecFamilleId : id inconnu "${id}"`);
  }
}
