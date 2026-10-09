import type { ContexteFamilleA, DemandeEcran2FamilleA, ExerciceFamilleA, IdContexteFamilleA, SousTypeEcran3FamilleA, TroisiemeDonneeFamilleA } from "../../core6e/probabilitesEnsembles.types";

/**
 * Couche A (6e) — génération famille A ("Inclusion-exclusion, tableau à double entrée") pour
 * `6gen30`. Tire des EFFECTIFS entiers (`nA`, `nB`, `nAetB`, `denominateur`) — jamais une
 * probabilité flottante stockée directement (convention CLAUDE.md, voir en-tête de
 * `core6e/probabilitesEnsembles.types.ts`) : toute probabilité affichée/vérifiée se calcule à la
 * volée en divisant deux de ces entiers, garantie une fraction exacte représentable.
 */

const CONTEXTES_A: readonly ContexteFamilleA[] = [
  { id: "menus", texte: "Dans un restaurant, on interroge un client au hasard parmi la clientèle d'une semaine. A : le client a choisi une entrée. B : le client a choisi un dessert." },
  { id: "sportsCamp", texte: "Dans un camp de vacances, on interroge un participant au hasard. A : le participant pratique la natation. B : le participant pratique le tir à l'arc." },
  { id: "appareils", texte: "Dans un sondage réalisé auprès des ménages d'un quartier, on choisit un ménage au hasard. A : le ménage possède un lave-vaisselle. B : le ménage possède un sèche-linge." },
];

const DENOMINATEURS_A: readonly number[] = [20, 24, 25, 30, 36, 40, 50];

const DEMANDES_ECRAN2_A: readonly DemandeEcran2FamilleA[] = ["AetBbar", "AbaretB", "condAsachantB", "condBsachantA"];

/** Écart minimal exigé entre P(A|B̄) et P(A|B) pour le sous-type "comparaisonConditionnelle" de
 * l'écran 3 — la spec les annonce "généralement différentes" ; en dessous de cet écart la
 * comparaison deviendrait ambiguë au regard de la tolérance de vérification (0,01, voir
 * `moteur6e/verificationProbabilites.ts`), donc la génération RETIRE tant que l'écart réel est trop
 * faible (voir `genererEffectifs` ci-dessous) plutôt que de risquer une instance dégénérée. */
const ECART_MINIMAL_CONDITIONNELLES = 0.05;

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

interface Effectifs {
  denominateur: number;
  nA: number;
  nB: number;
  nAetB: number;
}

/** Tire un jeu d'effectifs {N, nA, nB, nAetB} valide (0<nA<N, 0<nB<N, 0<nAetB≤min(nA,nB),
 * nAetB≥nA+nB-N — i.e. les 4 cases du tableau à double entrée restent toutes strictement
 * positives) — jamais nAetB=0 (garde l'exemple non dégénéré : les 4 cases racontent chacune un cas
 * réel de la population). Si `exigerEcartConditionnelles` est vrai, retire tant que
 * |P(A|B̄)-P(A|B)| < `ECART_MINIMAL_CONDITIONNELLES` (nécessaire uniquement pour le sous-type
 * "comparaisonConditionnelle" de l'écran 3 — voir son appelant). Retries bornés (200 tentatives) :
 * l'espace de tirage est large, un échec total est en pratique impossible, mais un plafond évite
 * toute boucle infinie théorique. */
function genererEffectifs(exigerEcartConditionnelles: boolean): Effectifs {
  for (let tentative = 0; tentative < 200; tentative++) {
    const denominateur = tirerParmi(DENOMINATEURS_A);
    const nA = tirerEntier(Math.round(denominateur * 0.3), Math.round(denominateur * 0.7));
    const nB = tirerEntier(Math.round(denominateur * 0.3), Math.round(denominateur * 0.7));
    // min : garantit nAetB≥1 (case A∩B non vide) ET nAetB>nA+nB-N (case Ā∩B̄ non vide, sinon
    // P(A∪B)=1 et la 4e case du tableau tomberait à 0 — trouvé par TDD, voir
    // `familleA.test.ts`, "génère des effectifs cohérents").
    // max : garantit nAetB<min(nA,nB), donc que les DEUX cases A∩B̄ ET Ā∩B restent non vides
    // (sinon A⊆B ou B⊆A rendrait une case nulle — même piège que `min` ci-dessus, trouvé par le
    // même test TDD).
    const min = Math.max(1, nA + nB - denominateur + 1);
    const max = Math.min(nA, nB) - 1;
    if (min > max) continue;
    const nAetB = tirerEntier(min, max);
    if (exigerEcartConditionnelles) {
      const pAsachantBbar = (nA - nAetB) / (denominateur - nB);
      const pAsachantB = nAetB / nB;
      if (Math.abs(pAsachantBbar - pAsachantB) < ECART_MINIMAL_CONDITIONNELLES) continue;
    }
    return { denominateur, nA, nB, nAetB };
  }
  throw new Error("genererEffectifs : aucun jeu d'effectifs valide trouvé après 200 tentatives");
}

/** Construction déterministe (troisième donnée + sous-type écran 3 fixés, tout le reste tiré au
 * hasard) — utilisée par `CATALOGUE_VARIANTES`/`construireAvecVarianteId` (convention permanente,
 * voir `generateurs6e/probabilitesEnsembles/index.ts`). */
export function construireFamilleA(troisiemeDonnee: TroisiemeDonneeFamilleA, sousTypeEcran3: SousTypeEcran3FamilleA): ExerciceFamilleA {
  const { denominateur, nA, nB, nAetB } = genererEffectifs(sousTypeEcran3 === "comparaisonConditionnelle");
  const contexte = tirerParmi(CONTEXTES_A);
  const demandeEcran2 = tirerParmi(DEMANDES_ECRAN2_A);
  return { famille: "A", contexte, denominateur, nA, nB, nAetB, troisiemeDonnee, demandeEcran2, sousTypeEcran3 };
}

const TROISIEMES_DONNEES_A: readonly TroisiemeDonneeFamilleA[] = ["PAetB", "PAouB", "PniAniB"];
const SOUS_TYPES_ECRAN3_A: readonly SousTypeEcran3FamilleA[] = ["incompatibilite", "comparaisonConditionnelle"];

/** Tirage ÉQUIPROBABLE de la troisième donnée ET du sous-type écran 3 (spec : chacun "varie"
 * indépendamment). */
export function genererFamilleA(): ExerciceFamilleA {
  return construireFamilleA(tirerParmi(TROISIEMES_DONNEES_A), tirerParmi(SOUS_TYPES_ECRAN3_A));
}

// Réexport pour les tests / `index.ts`.
export { CONTEXTES_A };
export type { IdContexteFamilleA };
