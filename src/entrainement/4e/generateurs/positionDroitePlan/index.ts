import type {
  CandidatSecantePositionDroitePlan,
  CandidatSegmentPositionDroitePlan,
  ConclusionPositionDroitePlan,
  ExercicePositionDroitePlan,
  GenerateurExercicePositionDroitePlan,
} from "../../core/positionDroitePlan.types";
import type { DroiteSolide3D, NomSolide3D, PlanSolide3D, Point3D, Solide3D } from "../../core/geometrieEspace.types";
import {
  classifierDroitePlan,
  EPSILON_3D,
  intersectionDroitePlan,
  normalePlan,
  normeCarree3D,
  pointAppartientAuPlan,
  pointSurSegmentOuvert,
  sommetCoincidant,
  sontParalleles3D,
  soustraire3D,
} from "../solide3D/geometrieEspace";
import { GABARITS_POSITION_DROITE_PLAN, GABARITS_SOLIDE3D, tirerNomGabarit } from "../solide3D/gabarits";

/**
 * Couche A — "Position d'une droite par rapport à un plan" (39e générateur, chapitre "Géométrie
 * dans l'espace"). Catalogue FERMÉ des 3 gabarits (voir `generateurs/solide3D/gabarits.ts`,
 * `GABARITS_POSITION_DROITE_PLAN` — jamais le tétraèdre, réservé aux 2 générateurs suivants) —
 * seule la combinaison plan/droite VARIE d'une instance à l'autre, jamais la forme du solide.
 *
 * **Enumération-puis-filtrage, jamais un tirage-puis-rejet global** : pour un gabarit fixé (petit
 * nombre de sommets, 6 à 8), toutes les paires de sommets (droites candidates) et tous les triplets
 * (plans candidats) sont énumérés — un espace de recherche minuscule (au plus C(8,2)×C(8,3)=28×56=
 * 1568 combinaisons), largement assez petit pour être parcouru en entier à chaque génération plutôt
 * que mis en cache. Chaque combinaison est classifiée via `classifierDroitePlan` (le même moteur de
 * vérité terrain que la vérification, jamais une seconde logique dupliquée), puis FILTRÉE selon des
 * contraintes propres à chaque catégorie (voir plus bas) avant d'être retenue comme instance
 * utilisable — ce n'est jamais la classification qui est reconstruite après coup depuis un tirage
 * aléatoire de plan/droite.
 */

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function tousLesSommets(solide: Solide3D): string[] {
  return Object.keys(solide.sommets);
}

function pairesDistinctes(noms: string[]): [string, string][] {
  const paires: [string, string][] = [];
  for (let i = 0; i < noms.length; i++) {
    for (let j = i + 1; j < noms.length; j++) {
      paires.push([noms[i], noms[j]]);
    }
  }
  return paires;
}

function triplesDistincts(noms: string[]): [string, string, string][] {
  const triples: [string, string, string][] = [];
  for (let i = 0; i < noms.length; i++) {
    for (let j = i + 1; j < noms.length; j++) {
      for (let k = j + 1; k < noms.length; k++) {
        triples.push([noms[i], noms[j], noms[k]]);
      }
    }
  }
  return triples;
}

function planValide(solide: Solide3D, plan: PlanSolide3D): boolean {
  const normale = normalePlan(solide.sommets[plan[0]], solide.sommets[plan[1]], solide.sommets[plan[2]]);
  return normeCarree3D(normale) > EPSILON_3D;
}

function pointsDuPlan(solide: Solide3D, plan: PlanSolide3D): [Point3D, Point3D, Point3D] {
  return [solide.sommets[plan[0]], solide.sommets[plan[1]], solide.sommets[plan[2]]];
}

function estAreteSolide(solide: Solide3D, paire: [string, string]): boolean {
  const [a, b] = paire;
  return solide.faces.some((face) => {
    for (let i = 0; i < face.length; i++) {
      const x = face[i];
      const y = face[(i + 1) % face.length];
      if ((x === a && y === b) || (x === b && y === a)) return true;
    }
    return false;
  });
}

function labelSegment(solide: Solide3D, paire: [string, string]): string {
  const [a, b] = paire;
  return estAreteSolide(solide, paire) ? `arête ${a}${b}` : `diagonale ${a}${b}`;
}

// --- Pool "incluse" ---------------------------------------------------------------------------

interface InstancePool {
  plan: PlanSolide3D;
  droite: DroiteSolide3D;
}

function construirePoolIncluse(solide: Solide3D): InstancePool[] {
  const noms = tousLesSommets(solide);
  const plans = triplesDistincts(noms).filter((p) => planValide(solide, p));
  const pool: InstancePool[] = [];
  for (const plan of plans) {
    for (const droite of pairesDistinctes(noms)) {
      if (classifierDroitePlan(solide, droite, plan) === "incluse") {
        pool.push({ plan, droite });
      }
    }
  }
  return pool;
}

// --- Pool "parallele" --------------------------------------------------------------------------

/** Segments candidats de l'écran 2 (une arête ou diagonale du plan par direction DISTINCTE, jamais
 * 2 candidats colinéaires — garantit une seule bonne réponse parmi les choix proposés). */
function construireCandidatsParallele(solide: Solide3D, plan: PlanSolide3D): CandidatSegmentPositionDroitePlan[] {
  const planPoints = pointsDuPlan(solide, plan);
  const nomsDansLePlan = tousLesSommets(solide).filter((nom) => pointAppartientAuPlan(solide.sommets[nom], planPoints));
  const candidats: CandidatSegmentPositionDroitePlan[] = [];
  for (const paire of pairesDistinctes(nomsDansLePlan)) {
    const direction = soustraire3D(solide.sommets[paire[1]], solide.sommets[paire[0]]);
    const dejaRepresente = candidats.some((c) =>
      sontParalleles3D(direction, soustraire3D(solide.sommets[c.sommets[1]], solide.sommets[c.sommets[0]])),
    );
    if (!dejaRepresente) {
      candidats.push({ type: "segment", sommets: paire, label: labelSegment(solide, paire) });
    }
  }
  return candidats;
}

interface InstanceParallele extends InstancePool {
  candidats: CandidatSegmentPositionDroitePlan[];
}

function construirePoolParallele(solide: Solide3D): InstanceParallele[] {
  const noms = tousLesSommets(solide);
  const plans = triplesDistincts(noms).filter((p) => planValide(solide, p));
  const pool: InstanceParallele[] = [];
  for (const plan of plans) {
    const candidats = construireCandidatsParallele(solide, plan);
    // Au moins 3 candidats pour que le choix soit pédagogiquement significatif (spec : "liste de
    // plusieurs arêtes/diagonales candidates").
    if (candidats.length < 3) continue;
    for (const droite of pairesDistinctes(noms)) {
      if (classifierDroitePlan(solide, droite, plan) !== "parallele") continue;
      const direction = soustraire3D(solide.sommets[droite[1]], solide.sommets[droite[0]]);
      // Contrainte de génération : la direction de la droite doit correspondre EXACTEMENT à un des
      // candidats proposés — sinon aucune bonne réponse ne serait sélectionnable dans la liste.
      const correspond = candidats.some((c) => sontParalleles3D(direction, soustraire3D(solide.sommets[c.sommets[1]], solide.sommets[c.sommets[0]])));
      if (!correspond) continue;
      pool.push({ plan, droite, candidats });
    }
  }
  return pool;
}

// --- Pool "secante" ------------------------------------------------------------------------------

function construireCandidatsSecante(solide: Solide3D, cibleCorrecte: CandidatSecantePositionDroitePlan): CandidatSecantePositionDroitePlan[] {
  const noms = tousLesSommets(solide);
  const aretes = pairesDistinctes(noms).filter((p) => estAreteSolide(solide, p));

  const estCible = (candidat: CandidatSecantePositionDroitePlan): boolean => {
    if (cibleCorrecte.type === "sommet") return candidat.type === "sommet" && candidat.nom === cibleCorrecte.nom;
    return (
      candidat.type === "arete" &&
      new Set(candidat.sommets).size === 2 &&
      candidat.sommets.every((n) => cibleCorrecte.sommets.includes(n))
    );
  };

  const distracteursSommets: CandidatSecantePositionDroitePlan[] = noms
    .map((nom): CandidatSecantePositionDroitePlan => ({ type: "sommet", nom }))
    .filter((c) => !estCible(c));
  const distracteursAretes: CandidatSecantePositionDroitePlan[] = aretes
    .map((p): CandidatSecantePositionDroitePlan => ({ type: "arete", sommets: p, label: labelSegment(solide, p) }))
    .filter((c) => !estCible(c));

  const distracteurs = melanger([...distracteursSommets, ...distracteursAretes]).slice(0, 4);
  return melanger([cibleCorrecte, ...distracteurs]);
}

interface InstanceSecante extends InstancePool {
  candidats: CandidatSecantePositionDroitePlan[];
}

function construirePoolSecante(solide: Solide3D): InstanceSecante[] {
  const noms = tousLesSommets(solide);
  const plans = triplesDistincts(noms).filter((p) => planValide(solide, p));
  const aretesSolide = pairesDistinctes(noms).filter((p) => estAreteSolide(solide, p));
  const pool: InstanceSecante[] = [];
  for (const plan of plans) {
    const planPoints = pointsDuPlan(solide, plan);
    for (const droite of pairesDistinctes(noms)) {
      if (classifierDroitePlan(solide, droite, plan) !== "secante") continue;
      const intersection = intersectionDroitePlan([solide.sommets[droite[0]], solide.sommets[droite[1]]], planPoints);
      if (!intersection) continue; // ne devrait jamais arriver ici (classification "secante" garantit une intersection)

      const nomSommet = sommetCoincidant(solide, intersection);
      let cible: CandidatSecantePositionDroitePlan | null = null;
      if (nomSommet) {
        cible = { type: "sommet", nom: nomSommet };
      } else {
        const areteTrouvee = aretesSolide.find((p) => pointSurSegmentOuvert(intersection, solide.sommets[p[0]], solide.sommets[p[1]]));
        if (areteTrouvee) cible = { type: "arete", sommets: areteTrouvee, label: labelSegment(solide, areteTrouvee) };
      }
      // Contrainte de génération explicite (spec) : rejeter toute instance dont l'intersection
      // réelle ne tombe EXACTEMENT sur aucun sommet ni aucune arête nommée du solide.
      if (!cible) continue;

      pool.push({ plan, droite, candidats: construireCandidatsSecante(solide, cible) });
    }
  }
  return pool;
}

// --- Assemblage final ----------------------------------------------------------------------------

function tenterGenererIncluse(solide: Solide3D): ExercicePositionDroitePlan | null {
  const pool = construirePoolIncluse(solide);
  if (pool.length === 0) return null;
  const choix = pool[randomInt(0, pool.length - 1)];
  return { solide, plan: choix.plan, droite: choix.droite, classification: "incluse", candidatsParallele: [], candidatsSecante: [] };
}

function tenterGenererParallele(solide: Solide3D): ExercicePositionDroitePlan | null {
  const pool = construirePoolParallele(solide);
  if (pool.length === 0) return null;
  const choix = pool[randomInt(0, pool.length - 1)];
  return {
    solide,
    plan: choix.plan,
    droite: choix.droite,
    classification: "parallele",
    candidatsParallele: choix.candidats,
    candidatsSecante: [],
  };
}

function tenterGenererSecante(solide: Solide3D): ExercicePositionDroitePlan | null {
  const pool = construirePoolSecante(solide);
  if (pool.length === 0) return null;
  const choix = pool[randomInt(0, pool.length - 1)];
  return {
    solide,
    plan: choix.plan,
    droite: choix.droite,
    classification: "secante",
    candidatsParallele: [],
    candidatsSecante: choix.candidats,
  };
}

function tenter(varianteId: ConclusionPositionDroitePlan, solide: Solide3D): ExercicePositionDroitePlan | null {
  if (varianteId === "incluse") return tenterGenererIncluse(solide);
  if (varianteId === "parallele") return tenterGenererParallele(solide);
  return tenterGenererSecante(solide);
}

const MAX_TENTATIVES = 200;

export const CATALOGUE_VARIANTES: { id: ConclusionPositionDroitePlan; label: string }[] = [
  { id: "incluse", label: "Droite incluse dans le plan" },
  { id: "parallele", label: "Droite parallèle au plan" },
  { id: "secante", label: "Droite sécante au plan" },
];

/** Force la variante (catégorie) demandée — `overrides.nomGabarit` optionnel pour forcer aussi le
 * gabarit, sinon tiré uniformément parmi les 3 (convention CLAUDE.md, `{id,label}` +
 * `construireAvecVarianteId`). */
export function construireAvecVarianteId(
  varianteId: ConclusionPositionDroitePlan,
  overrides?: { nomGabarit?: NomSolide3D },
): ExercicePositionDroitePlan {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const nomGabarit = overrides?.nomGabarit ?? tirerNomGabarit(GABARITS_POSITION_DROITE_PLAN);
    const solide = GABARITS_SOLIDE3D[nomGabarit];
    const resultat = tenter(varianteId, solide);
    if (resultat) return resultat;
    if (overrides?.nomGabarit) {
      throw new Error(`construireAvecVarianteId : aucune instance "${varianteId}" possible pour le gabarit ${overrides.nomGabarit}`);
    }
  }
  throw new Error(`construireAvecVarianteId : aucune instance "${varianteId}" trouvée après ${MAX_TENTATIVES} tentatives`);
}

export const genererExercicePositionDroitePlan: GenerateurExercicePositionDroitePlan = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
};
