/**
 * Couche A — "L'un sans l'autre" (chapitre 3, seizième générateur — remplace "Angles associés" à
 * la même position, promptcreationgenerateur16unsanslautre.md). Construit toujours son quadrant/sa
 * valeur AVANT de calculer le reste (jamais un tirage-puis-classification), même principe que le
 * reste du projet.
 */
import type {
  ExerciceUnSansLautre,
  FonctionConnue,
  GenerateurExerciceUnSansLautre,
  QuadrantOuvert,
  TypeValeurConnue,
} from "../../core/unSansLautre.types";
import { randomInt } from "./aleatoire";
import { POOL_QUELCONQUES, POOL_TRIPLETS } from "./fractions";

/** Signe de cos/sin par quadrant — table classique, jamais redérivée à la volée. */
const SIGNES: Record<QuadrantOuvert, Record<FonctionConnue, 1 | -1>> = {
  I: { cos: 1, sin: 1 },
  II: { cos: -1, sin: 1 },
  III: { cos: -1, sin: -1 },
  IV: { cos: 1, sin: -1 },
};

/** Intervalle ouvert sur θ (degrés) correspondant à chaque quadrant — toujours l'intervalle
 * complet du quadrant, jamais un sous-intervalle : suffisant pour fixer le quadrant sans ambiguïté
 * (section "Génération des variantes" de la spec). */
const INTERVALLES: Record<QuadrantOuvert, { borneInf: number; borneSup: number }> = {
  I: { borneInf: 0, borneSup: 90 },
  II: { borneInf: 90, borneSup: 180 },
  III: { borneInf: 180, borneSup: 270 },
  IV: { borneInf: 270, borneSup: 360 },
};

const QUADRANTS: QuadrantOuvert[] = ["I", "II", "III", "IV"];

function tirerFraction(typeValeur: TypeValeurConnue): { p: number; q: number } {
  const pool = typeValeur === "triplet" ? POOL_TRIPLETS : POOL_QUELCONQUES;
  return pool[randomInt(0, pool.length - 1)];
}

/** Convention CLAUDE.md ("Catalogue de variantes") — force la fonction donnée (cos ou sin), seul
 * axe pédagogique discret de ce générateur (tirage 50/50 explicite de la spec). */
export function construireAvecVarianteId(
  varianteId: FonctionConnue,
  overrides?: { quadrant?: QuadrantOuvert; typeValeur?: TypeValeurConnue; p?: number; q?: number },
): ExerciceUnSansLautre {
  const fonctionConnue = varianteId;
  const fonctionCible: FonctionConnue = fonctionConnue === "cos" ? "sin" : "cos";
  const quadrant = overrides?.quadrant ?? QUADRANTS[randomInt(0, QUADRANTS.length - 1)];
  const typeValeur = overrides?.typeValeur ?? (Math.random() < 0.5 ? "triplet" : "quelconque");
  const { p, q } =
    overrides?.p !== undefined && overrides?.q !== undefined ? { p: overrides.p, q: overrides.q } : tirerFraction(typeValeur);

  const { borneInf, borneSup } = INTERVALLES[quadrant];
  const signeConnu = SIGNES[quadrant][fonctionConnue];
  const valeurConnue = signeConnu * (p / q);

  // (q²-p²)/q² — toujours déjà irréductible (gcd(p,q)=1 ⟹ gcd(q²-p²,q²)=1, voir index.test.ts).
  const carreCibleNum = q * q - p * p;
  const carreCibleDen = q * q;

  const signeCible = SIGNES[quadrant][fonctionCible];
  const valeurCible = signeCible * (Math.sqrt(carreCibleNum) / q);

  const sinValeur = fonctionConnue === "sin" ? valeurConnue : valeurCible;
  const cosValeur = fonctionConnue === "cos" ? valeurConnue : valeurCible;
  const tanValeur = sinValeur / cosValeur;

  return {
    fonctionConnue,
    fonctionCible,
    quadrant,
    borneInf,
    borneSup,
    typeValeur,
    p,
    q,
    signeConnu,
    valeurConnue,
    carreCibleNum,
    carreCibleDen,
    signeCible,
    valeurCible,
    sinValeur,
    cosValeur,
    tanValeur,
  };
}

export const CATALOGUE_VARIANTES: { id: FonctionConnue; label: string }[] = [
  { id: "cos", label: "cos θ donné (retrouver sin θ)" },
  { id: "sin", label: "sin θ donné (retrouver cos θ)" },
];

export const genererExerciceUnSansLautre: GenerateurExerciceUnSansLautre = () => {
  const fonctionConnue = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(fonctionConnue);
};
