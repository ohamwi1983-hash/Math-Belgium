/**
 * Couche A — "L'un sans l'autre" (chapitre 3, seizième générateur — remplace "Angles associés" à
 * la même position, promptcreationgenerateur16unsanslautre.md). Construit toujours son quadrant/sa
 * valeur AVANT de calculer le reste (jamais un tirage-puis-classification), même principe que le
 * reste du projet.
 */
import type {
  ExerciceUnSansLautre,
  FonctionConnue,
  FonctionDonnee,
  GenerateurExerciceUnSansLautre,
  QuadrantOuvert,
  TypeValeurConnue,
} from "../../core/unSansLautre.types";
import { randomInt } from "./aleatoire";
import { POOL_QUELCONQUES, POOL_TANGENTE_QUELCONQUES, POOL_TANGENTE_TRIPLETS, POOL_TRIPLETS } from "./fractions";

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

/**
 * Variante « tan θ donné » : |tan θ| = p/q, signe de tan θ = signe de sin θ × signe de cos θ dans le
 * quadrant. cos²θ = 1/(1 + tan²θ) = q²/(p²+q²), cos θ = ±q/√(p²+q²), sin θ = tan θ · cos θ
 * = ±p/√(p²+q²). Mêmes tirages que les deux autres familles (quadrant, puis triplet ou non).
 */
function construireTangenteDonnee(overrides?: { quadrant?: QuadrantOuvert; typeValeur?: TypeValeurConnue; p?: number; q?: number }): ExerciceUnSansLautre {
  const quadrant = overrides?.quadrant ?? QUADRANTS[randomInt(0, QUADRANTS.length - 1)];
  const typeValeur = overrides?.typeValeur ?? (Math.random() < 0.5 ? "triplet" : "quelconque");
  const pool = typeValeur === "triplet" ? POOL_TANGENTE_TRIPLETS : POOL_TANGENTE_QUELCONQUES;
  const { p, q } = overrides?.p !== undefined && overrides?.q !== undefined ? { p: overrides.p, q: overrides.q } : pool[randomInt(0, pool.length - 1)];

  const { borneInf, borneSup } = INTERVALLES[quadrant];
  const signeCos = SIGNES[quadrant].cos;
  const signeSin = SIGNES[quadrant].sin;
  const signeConnu = (signeCos * signeSin) as 1 | -1;
  const valeurConnue = signeConnu * (p / q);
  const somme = p * p + q * q;
  const cosValeur = signeCos * (q / Math.sqrt(somme));
  const sinValeur = signeSin * (p / Math.sqrt(somme));

  return {
    fonctionConnue: "tan",
    fonctionCible: "cos",
    quadrant,
    borneInf,
    borneSup,
    typeValeur,
    p,
    q,
    signeConnu,
    valeurConnue,
    carreCibleNum: q * q,
    carreCibleDen: somme,
    signeCible: signeCos,
    valeurCible: cosValeur,
    sinValeur,
    cosValeur,
    tanValeur: valeurConnue,
  };
}

/** Convention CLAUDE.md ("Catalogue de variantes") — force la fonction donnée (cos, sin ou tan),
 * seul axe pédagogique discret de ce générateur. */
export function construireAvecVarianteId(
  varianteId: FonctionDonnee,
  overrides?: { quadrant?: QuadrantOuvert; typeValeur?: TypeValeurConnue; p?: number; q?: number },
): ExerciceUnSansLautre {
  if (varianteId === "tan") return construireTangenteDonnee(overrides);
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

/** « tan θ donné » en DERNIER : l'indice de variante d'un code `?code=` déjà imprimé reste valable. */
export const CATALOGUE_VARIANTES: { id: FonctionDonnee; label: string }[] = [
  { id: "cos", label: "cos θ donné (retrouver sin θ)" },
  { id: "sin", label: "sin θ donné (retrouver cos θ)" },
  { id: "tan", label: "tan θ donné (retrouver cos θ et sin θ)" },
];

export const genererExerciceUnSansLautre: GenerateurExerciceUnSansLautre = () => {
  const fonctionConnue = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(fonctionConnue);
};
