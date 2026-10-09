import type { ContextePoissonB, ExerciceLoiPoissonB, StrategiePoissonB, TypeQuestionPoissonB } from "../../core6e/loiPoisson.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { CONTEXTES_B } from "./contextes";
import { probabilitePoisson } from "./poisson";

/**
 * Couche A (6e) — génération famille B ("Application directe de la loi de Poisson") pour `6gen53`.
 *
 * **Piège central (spec)** : λ n'est JAMAIS le taux de base donné tel quel — il doit être AJUSTÉ À
 * L'ÉCHELLE de la question posée (`facteurEchelle`) : multiplicatif direct pour un contexte
 * `"temporel"` (ex. taux/minute × nombre de minutes demandées), proportionnel pour un contexte
 * `"effectif"` (ex. taux "pour 1000" × effectifDemandé/1000). Tous les couples
 * (tauxBase,valeurCible) de `CANDIDATS_PAR_CONTEXTE` ci-dessous ont un `facteurEchelle` ≠ 1 —
 * garanti par construction — pour que le piège reste TOUJOURS testable (recopier `tauxBase` comme
 * λ doit TOUJOURS être rejeté).
 *
 * **Stratégies réutilisées de `6gen48`/`6gen50`, adaptées à la formule de Poisson (jamais celle du
 * binomial — voir `poisson.ts`)** : "exactement k" → terme unique ; "entre a et b" ou "au plus k" →
 * somme ; "au moins k" → complément. DIFFÉRENCE délibérée avec le binomial : "au plus k" n'est
 * JAMAIS traité en complément ici (contrairement à `6gen48`, qui bascule en complément quand k est
 * proche de n) — la loi de Poisson a un support INFINI (pas de "n" à côté duquel se trouverait un
 * complément court), donc "au plus k" reste TOUJOURS une somme directe de 0 à k.
 *
 * **Bornes choisies pour rester numériquement ET pédagogiquement raisonnables** : "exactement"/"au
 * moins" acceptent N'IMPORTE QUEL λ du catalogue (y compris λ=75, l'exemple même de la spec — voir
 * `candidatsPourType`) car un terme unique ou un petit complément restent des calculs courts quelle
 * que soit l'échelle de λ (voir `poisson.ts` pour la stabilité numérique). "Entre a et b"/"au plus"
 * sont en revanche restreints à λ≤10 : une somme centrée sur λ pour λ=75 nécessiterait une LISTE de
 * dizaines de termes, intenable pour un champ "termes à calculer" saisi à la main.
 */

const TYPES_QUESTION: readonly TypeQuestionPoissonB[] = ["exactement", "entreAetB", "auPlus", "auMoins"];

const STRATEGIE_PAR_TYPE: Record<TypeQuestionPoissonB, StrategiePoissonB> = {
  exactement: "termeUnique",
  entreAetB: "somme",
  auPlus: "somme",
  auMoins: "complement",
};

interface CandidatNumeriqueB {
  tauxBase: number;
  valeurCible: number;
}

/** Un couple par contexte AU MINIMUM inclut l'exemple donné par la spec elle-même — voir
 * `familleB.test.ts` ("piège central"). */
const CANDIDATS_PAR_CONTEXTE: Record<string, readonly CandidatNumeriqueB[]> = {
  defectueuxB: [
    { tauxBase: 3, valeurCible: 100 },
    { tauxBase: 5, valeurCible: 200 },
    { tauxBase: 2, valeurCible: 500 },
    { tauxBase: 8, valeurCible: 2000 },
  ],
  peageB: [
    { tauxBase: 5, valeurCible: 15 },
    { tauxBase: 2, valeurCible: 10 },
    { tauxBase: 3, valeurCible: 20 },
    { tauxBase: 0.5, valeurCible: 30 },
    { tauxBase: 1, valeurCible: 10 },
  ],
  virusB: [
    { tauxBase: 2, valeurCible: 4 },
    { tauxBase: 1, valeurCible: 6 },
    { tauxBase: 3, valeurCible: 3 },
    { tauxBase: 0.5, valeurCible: 8 },
  ],
  allergieB: [
    { tauxBase: 4, valeurCible: 5000 },
    { tauxBase: 2, valeurCible: 20000 },
    { tauxBase: 6, valeurCible: 2500 },
    { tauxBase: 8, valeurCible: 12000 },
  ],
  typoB: [
    { tauxBase: 2, valeurCible: 500 },
    { tauxBase: 4, valeurCible: 2000 },
    { tauxBase: 1, valeurCible: 3000 },
    { tauxBase: 5, valeurCible: 400 },
  ],
  pannesB: [
    { tauxBase: 0.5, valeurCible: 6 },
    { tauxBase: 1, valeurCible: 4 },
    { tauxBase: 2, valeurCible: 3 },
    { tauxBase: 1.5, valeurCible: 8 },
  ],
  gauchersB: [
    { tauxBase: 10, valeurCible: 30 },
    { tauxBase: 12, valeurCible: 50 },
    { tauxBase: 8, valeurCible: 75 },
    { tauxBase: 10, valeurCible: 80 },
  ],
};

/** Voir en-tête de fichier — jamais 1 (le piège d'échelle doit toujours rester testable). */
export function calculerFacteurEchelle(contexte: ContextePoissonB, valeurCible: number): number {
  if (contexte.type === "temporel") return valeurCible;
  return valeurCible / (contexte.effectifReference as number);
}

interface CandidatB {
  contexte: ContextePoissonB;
  tauxBase: number;
  valeurCible: number;
  lambda: number;
}

function tousLesCandidatsB(): CandidatB[] {
  const resultat: CandidatB[] = [];
  for (const contexte of CONTEXTES_B) {
    for (const { tauxBase, valeurCible } of CANDIDATS_PAR_CONTEXTE[contexte.id] ?? []) {
      resultat.push({ contexte, tauxBase, valeurCible, lambda: tauxBase * calculerFacteurEchelle(contexte, valeurCible) });
    }
  }
  return resultat;
}

/** Filtre les candidats selon la stratégie visée — voir en-tête de fichier pour la justification
 * des seuils. */
function candidatsPourType(typeQuestion: TypeQuestionPoissonB): CandidatB[] {
  const tous = tousLesCandidatsB();
  if (typeQuestion === "exactement" || typeQuestion === "auMoins") return tous;
  return tous.filter((c) => c.lambda <= 10);
}

function sequence(debut: number, fin: number): number[] {
  const r: number[] = [];
  for (let i = debut; i <= fin; i++) r.push(i);
  return r;
}

interface StrategieEtTermes {
  strategie: StrategiePoissonB;
  k: number;
  kSecondaire: number | null;
  termesACalculer: number[];
}

/** Dérive k/les termes à calculer À PARTIR de λ (déjà connu et correct) — le mode (valeur la plus
 * probable) de la loi de Poisson est toujours proche de λ, donc centrer k/l'intervalle sur λ évite
 * une probabilité dégénérée (quasi nulle), peu intéressante pédagogiquement — sauf pour "au moins",
 * dont la spec fixe k petit (le complément reste court quelle que soit l'échelle de λ). */
function genererStrategieEtTermes(typeQuestion: TypeQuestionPoissonB, lambda: number): StrategieEtTermes {
  const strategie = STRATEGIE_PAR_TYPE[typeQuestion];
  switch (typeQuestion) {
    case "exactement": {
      const k = Math.max(0, Math.round(lambda) + tirerEntier(-2, 2));
      return { strategie, k, kSecondaire: null, termesACalculer: [k] };
    }
    case "entreAetB": {
      const a = Math.max(0, Math.round(lambda) - tirerEntier(1, 2));
      const b = a + tirerEntier(1, 3);
      return { strategie, k: a, kSecondaire: b, termesACalculer: sequence(a, b) };
    }
    case "auPlus": {
      const k = Math.max(1, Math.round(lambda) + tirerEntier(-1, 2));
      return { strategie, k, kSecondaire: null, termesACalculer: sequence(0, k) };
    }
    default: {
      // "auMoins"
      const k = tirerEntier(1, 3);
      return { strategie, k, kSecondaire: null, termesACalculer: sequence(0, k - 1) };
    }
  }
}

function calculerResultatFinal(strategie: StrategiePoissonB, valeursTermes: number[]): number {
  const somme = valeursTermes.reduce((acc, v) => acc + v, 0);
  if (strategie === "termeUnique") return valeursTermes[0];
  if (strategie === "complement") return 1 - somme;
  return somme;
}

/** Construction déterministe (`contexte`/`tauxBase`/`valeurCible`/`typeQuestion` fixés — `k`/les
 * bornes restent tirés aléatoirement dans leur plage valide, mirroir `construireAvecTypeQuestion`
 * de `6gen48`) — utilisée par `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. */
export function construireFamilleB(contexte: ContextePoissonB, tauxBase: number, valeurCible: number, typeQuestion: TypeQuestionPoissonB): ExerciceLoiPoissonB {
  const facteurEchelle = calculerFacteurEchelle(contexte, valeurCible);
  const lambda = tauxBase * facteurEchelle;
  const { strategie, k, kSecondaire, termesACalculer } = genererStrategieEtTermes(typeQuestion, lambda);
  const valeursTermes = termesACalculer.map((i) => probabilitePoisson(lambda, i));
  const resultatFinal = calculerResultatFinal(strategie, valeursTermes);
  return { famille: "B", contexte, tauxBase, valeurCible, facteurEchelle, lambda, typeQuestion, strategie, k, kSecondaire, termesACalculer, valeursTermes, resultatFinal };
}

export function genererFamilleB(): ExerciceLoiPoissonB {
  const typeQuestion = tirerParmi(TYPES_QUESTION);
  const candidat = tirerParmi(candidatsPourType(typeQuestion));
  return construireFamilleB(candidat.contexte, candidat.tauxBase, candidat.valeurCible, typeQuestion);
}
