import type { ContexteFamilleA, DemandeEcran2FamilleA, EvenementTableauA, ExerciceFamilleA, IdContexteFamilleA, RelationEcran3A, SousTypeEcran3FamilleA, TroisiemeDonneeFamilleA } from "../../core6e/probabilitesEnsembles.types";

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

/** Écart minimal exigé entre P(A|B̄) et P(A|B) quand elles DIFFÈRENT (sous-type
 * « comparaisonConditionnelle ») : une comparaison faite sur des valeurs arrondies au centième reste
 * alors sans ambiguïté. Le cas « égales » est tiré à part, EXACTEMENT (tableau indépendant). */
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

function bornesA(denominateur: number): [number, number] {
  return [Math.round(denominateur * 0.3), Math.round(denominateur * 0.7)];
}

/** Indépendance exacte de A et B, par les effectifs entiers. */
function independants(e: Effectifs): boolean {
  return e.nAetB * e.denominateur === e.nA * e.nB;
}

/** Signe exact de P(A|B̄) − P(A|B), en entiers : (nA − nAetB)·nB − nAetB·(N − nB). */
function signeComparaison(e: Effectifs): number {
  return Math.sign((e.nA - e.nAetB) * e.nB - e.nAetB * (e.denominateur - e.nB));
}

let tablesIndependantes: Effectifs[] | null = null;

/** Toutes les tables INDÉPENDANTES possibles (nAetB = nA·nB/N entier) dans les mêmes bornes que
 * `genererEffectifs` — énumérées une fois. Les 4 cases sont alors automatiquement non vides. */
function toutesTablesIndependantes(): Effectifs[] {
  if (tablesIndependantes) return tablesIndependantes;
  const liste: Effectifs[] = [];
  for (const denominateur of DENOMINATEURS_A) {
    const [lo, hi] = bornesA(denominateur);
    for (let nA = lo; nA <= hi; nA++) {
      for (let nB = lo; nB <= hi; nB++) {
        if ((nA * nB) % denominateur === 0) liste.push({ denominateur, nA, nB, nAetB: (nA * nB) / denominateur });
      }
    }
  }
  tablesIndependantes = liste;
  return liste;
}

/** Contrainte facultative sur la table tirée. */
type ContrainteTable = "independante" | "dependante" | "conditionnelleSuperieure" | "conditionnelleInferieure" | null;

/** Tire un jeu d'effectifs {N, nA, nB, nAetB} valide (0<nA<N, 0<nB<N, 0<nAetB≤min(nA,nB),
 * nAetB≥nA+nB-N — i.e. les 4 cases du tableau à double entrée restent toutes strictement
 * positives) — jamais nAetB=0 (garde l'exemple non dégénéré : les 4 cases racontent chacune un cas
 * réel de la population). `contrainte` : table indépendante (tirée parmi l'énumération exacte,
 * dénominateur d'abord pour ne pas favoriser 24/36), dépendante, ou P(A|B̄) nettement supérieure /
 * inférieure à P(A|B) (écart ≥ `ECART_MINIMAL_CONDITIONNELLES`). Retries bornés (500 tentatives) :
 * l'espace de tirage est large, un échec total est en pratique impossible, mais un plafond évite
 * toute boucle infinie théorique. */
function genererEffectifs(contrainte: ContrainteTable): Effectifs {
  if (contrainte === "independante") {
    const toutes = toutesTablesIndependantes();
    const denominateur = tirerParmi([...new Set(toutes.map((t) => t.denominateur))]);
    return tirerParmi(toutes.filter((t) => t.denominateur === denominateur));
  }
  for (let tentative = 0; tentative < 500; tentative++) {
    const denominateur = tirerParmi(DENOMINATEURS_A);
    const [lo, hi] = bornesA(denominateur);
    const nA = tirerEntier(lo, hi);
    const nB = tirerEntier(lo, hi);
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
    const e: Effectifs = { denominateur, nA, nB, nAetB };
    if (contrainte === "dependante" && independants(e)) continue;
    if (contrainte === "conditionnelleSuperieure" || contrainte === "conditionnelleInferieure") {
      const ecart = (nA - nAetB) / (denominateur - nB) - nAetB / nB;
      if (Math.abs(ecart) < ECART_MINIMAL_CONDITIONNELLES) continue;
      if (signeComparaison(e) !== (contrainte === "conditionnelleSuperieure" ? 1 : -1)) continue;
    }
    return e;
  }
  throw new Error("genererEffectifs : aucun jeu d'effectifs valide trouvé après 500 tentatives");
}

/** Paires « croisées » (un événement lié à A, un lié à B) : indépendantes exactement quand la
 * table l'est, sinon ni l'un ni l'autre (les 4 cases étant non vides, jamais incompatibles). */
const PAIRES_CROISEES: readonly (readonly [EvenementTableauA, EvenementTableauA])[] = [
  ["A", "B"],
  ["A", "Bbar"],
  ["Abar", "B"],
  ["Abar", "Bbar"],
];

/** Paires d'intersection VIDE (incompatibles, jamais indépendantes : les deux sont de probabilité
 * non nulle). */
const PAIRES_INCOMPATIBLES: readonly (readonly [EvenementTableauA, EvenementTableauA])[] = [
  ["AetBbar", "AbaretB"],
  ["AetB", "AbaretBbar"],
  ["A", "AbaretB"],
  ["B", "AetBbar"],
  ["Abar", "AetB"],
  ["Bbar", "AbaretB"],
];

/** Paires emboîtées (l'une contient l'autre) : intersection non vide, jamais indépendantes (il
 * faudrait P = 1 pour le plus grand des deux) — toujours « ni l'un ni l'autre ». */
const PAIRES_EMBOITEES: readonly (readonly [EvenementTableauA, EvenementTableauA])[] = [
  ["A", "AetB"],
  ["B", "AbaretB"],
  ["Abar", "AbaretBbar"],
  ["Bbar", "AetBbar"],
];

const RELATIONS: readonly RelationEcran3A[] = ["incompatibles", "independants", "ni_l_un_ni_l_autre"];

function melanger<T>(paire: readonly [T, T]): readonly [T, T] {
  return Math.random() < 0.5 ? paire : [paire[1], paire[0]];
}

/** Table + paire pour l'écran 3 « relation » : la réponse visée est tirée ÉQUIPROBABLEMENT
 * (incompatibles / indépendants / ni l'un ni l'autre), puis la table et la paire sont construites
 * pour la réaliser. « Ni l'un ni l'autre » : 2 fois sur 3 une paire croisée sur une table dépendante
 * (seul le calcul tranche), 1 fois sur 3 une paire emboîtée. */
function tirerRelation(): { effectifs: Effectifs; paire: readonly [EvenementTableauA, EvenementTableauA] } {
  const visee = tirerParmi(RELATIONS);
  if (visee === "incompatibles") return { effectifs: genererEffectifs(null), paire: melanger(tirerParmi(PAIRES_INCOMPATIBLES)) };
  if (visee === "independants") return { effectifs: genererEffectifs("independante"), paire: melanger(tirerParmi(PAIRES_CROISEES)) };
  if (Math.random() < 1 / 3) return { effectifs: genererEffectifs(null), paire: melanger(tirerParmi(PAIRES_EMBOITEES)) };
  return { effectifs: genererEffectifs("dependante"), paire: melanger(tirerParmi(PAIRES_CROISEES)) };
}

/** Table pour l'écran 3 « comparaisonConditionnelle » : les 3 réponses (>, <, =) sont
 * équiprobables ; « = » ⟺ tableau indépendant. */
function tirerComparaison(): Effectifs {
  const visee = tirerParmi(["conditionnelleSuperieure", "conditionnelleInferieure", "independante"] as const);
  return genererEffectifs(visee);
}

/** Construction déterministe (troisième donnée + sous-type écran 3 fixés, tout le reste tiré au
 * hasard) — utilisée par `CATALOGUE_VARIANTES`/`construireAvecVarianteId` (convention permanente,
 * voir `generateurs6e/probabilitesEnsembles/index.ts`). */
export function construireFamilleA(troisiemeDonnee: TroisiemeDonneeFamilleA, sousTypeEcran3: SousTypeEcran3FamilleA): ExerciceFamilleA {
  let effectifs: Effectifs;
  let paireEcran3: readonly [EvenementTableauA, EvenementTableauA] | null = null;
  if (sousTypeEcran3 === "relation") {
    const r = tirerRelation();
    effectifs = r.effectifs;
    paireEcran3 = r.paire;
  } else {
    effectifs = tirerComparaison();
  }
  const { denominateur, nA, nB, nAetB } = effectifs;
  const contexte = tirerParmi(CONTEXTES_A);
  const demandeEcran2 = tirerParmi(DEMANDES_ECRAN2_A);
  return { famille: "A", contexte, denominateur, nA, nB, nAetB, troisiemeDonnee, demandeEcran2, sousTypeEcran3, paireEcran3 };
}

const TROISIEMES_DONNEES_A: readonly TroisiemeDonneeFamilleA[] = ["PAetB", "PAouB", "PniAniB"];
const SOUS_TYPES_ECRAN3_A: readonly SousTypeEcran3FamilleA[] = ["relation", "comparaisonConditionnelle"];

/** Tirage ÉQUIPROBABLE de la troisième donnée ET du sous-type écran 3 (spec : chacun "varie"
 * indépendamment). */
export function genererFamilleA(): ExerciceFamilleA {
  return construireFamilleA(tirerParmi(TROISIEMES_DONNEES_A), tirerParmi(SOUS_TYPES_ECRAN3_A));
}

// Réexport pour les tests / `index.ts`.
export { CONTEXTES_A };
export type { IdContexteFamilleA };
