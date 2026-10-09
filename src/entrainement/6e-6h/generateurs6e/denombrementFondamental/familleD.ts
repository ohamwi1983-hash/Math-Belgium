import { factorielle } from "../combinatoire";
import type { ExerciceDenombrementD, GroupeDenombD } from "../../core6e/denombrementFondamental.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille D ("Arrangements par blocs ou groupes") de `6gen43`.
 *
 * ============================================================================
 * **Paramètres concrets choisis** (documentés comme demandé par la mission)
 * ============================================================================
 * - "grouper" : `g`∈{3,4} groupes, chacun de taille∈{2,3,4} (ex. livres par discipline sur une
 *   étagère) — chaque groupe doit rester rassemblé, ordre interne à chaque groupe TOUJOURS libre
 *   (`internesParGroupe[i] = taille_i!`).
 * - "consecutivesOrdreFixe"/"consecutivesOrdreLibre" : mot de `nTotal`∈{6,...,10} lettres toutes
 *   différentes, dont `k`∈{2,3} doivent apparaître consécutivement — dans l'ordre alphabétique
 *   imposé (`ordreFixe`, 1 seul arrangement interne) ou dans un ordre quelconque entre elles
 *   (`ordreLibre`, `k!` arrangements internes).
 *
 * Dans les 2 familles de sous-types : `nombreUnites` = nombre de blocs/groupes + éléments isolés
 * restants (chaque bloc traité comme 1 seule unité) ; `arrangementsBlocs = nombreUnites!` ;
 * `resultatFinal = arrangementsBlocs × Π(internesParGroupe)`.
 */

const LETTRES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NOMS_GROUPES = ["Mathématiques", "Histoire", "Sciences", "Littérature", "Géographie"];

function tirerLettresDistinctes(count: number): string[] {
  const disponibles = [...LETTRES];
  const resultat: string[] = [];
  while (resultat.length < count) {
    const l = tirerParmi(disponibles.filter((x) => !resultat.includes(x)));
    resultat.push(l);
  }
  return resultat;
}

// ============================================================================
// Grouper par catégorie.
// ============================================================================

export function construireGrouper(): ExerciceDenombrementD {
  const g = tirerParmi([3, 4] as const);
  const noms = [...NOMS_GROUPES].sort(() => Math.random() - 0.5).slice(0, g);
  const groupes: GroupeDenombD[] = noms.map((nom) => ({ nom, taille: tirerEntier(2, 4) }));
  const nombreUnites = groupes.length;
  const arrangementsBlocs = factorielle(nombreUnites);
  const internesParGroupe = groupes.map((grp) => factorielle(grp.taille));
  const resultatFinal = arrangementsBlocs * internesParGroupe.reduce((a, b) => a * b, 1);
  return { famille: "D", sousType: "grouper", groupes, nombreUnites, arrangementsBlocs, internesParGroupe, resultatFinal };
}

// ============================================================================
// Lettres consécutives — ordre fixé / ordre libre.
// ============================================================================

function construireConsecutives(sousType: "consecutivesOrdreFixe" | "consecutivesOrdreLibre"): ExerciceDenombrementD {
  const nTotal = tirerEntier(6, 10);
  const k = tirerParmi([2, 3] as const);
  const lettres = tirerLettresDistinctes(nTotal);
  const lettresBloc = lettres.slice(0, k);
  const lettresBlocAffichees = sousType === "consecutivesOrdreFixe" ? [...lettresBloc].sort() : lettresBloc;
  const mot = lettres.join("");
  const nombreUnites = nTotal - k + 1;
  const arrangementsBlocs = factorielle(nombreUnites);
  const interne = sousType === "consecutivesOrdreFixe" ? 1 : factorielle(k);
  const resultatFinal = arrangementsBlocs * interne;
  return {
    famille: "D",
    sousType,
    mot,
    lettresConsecutives: lettresBlocAffichees.join(""),
    nombreUnites,
    arrangementsBlocs,
    internesParGroupe: [interne],
    resultatFinal,
  };
}

export function construireConsecutivesOrdreFixe(): ExerciceDenombrementD {
  return construireConsecutives("consecutivesOrdreFixe");
}

export function construireConsecutivesOrdreLibre(): ExerciceDenombrementD {
  return construireConsecutives("consecutivesOrdreLibre");
}

// ============================================================================
// Dispatch.
// ============================================================================

const CONSTRUCTEURS_D: (() => ExerciceDenombrementD)[] = [construireGrouper, construireConsecutivesOrdreFixe, construireConsecutivesOrdreLibre];

export function construireFamilleD(): ExerciceDenombrementD {
  return tirerParmi(CONSTRUCTEURS_D)();
}
