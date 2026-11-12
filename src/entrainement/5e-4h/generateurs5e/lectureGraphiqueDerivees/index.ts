/**
 * Couche A (5e) — génération pour 5gen30 ("Lecture graphique — dérivées et applications").
 * N'importe jamais rien de `moteur5e/`.
 *
 * 1. Comportement aux bords : `genererExerciceLectureGraphiqueLimites()` / `construireAvecFamilleId`
 *    (5gen22), positions d'AV RECADRÉES dans [−4 ; 4] pour la fenêtre fixe [−8 ; 8].
 * 2. Points clés (maximums, minimums, paliers) répartis entre les branches, en respectant la parité
 *    imposée par les directions aux bords (une branche qui part vers le bas et finit vers le haut a
 *    un nombre impair d'extremums).
 * 3. Construction morceau par morceau (`courbeNumerique.ts`), contrôle analytique, puis contrôles de
 *    lisibilité : au plus 3 points d'inflexion, tous les points remarquables à au moins 1 unité les
 *    uns des autres, valeurs dans la fenêtre, courbe à moins de 0,05 de son asymptote au bord.
 *    Tentatives bornées, cible réduite pas à pas, jamais de rejet illimité.
 */
import { construireAvecFamilleId, genererExerciceLectureGraphiqueLimites } from "../lectureGraphiqueLimites";
import type { ComportementVA, ExerciceLectureGraphiqueLimites } from "../../core5e/lectureGraphiqueLimites.types";
import type { ExerciceLectureGraphiqueDerivees } from "../../core5e/lectureGraphiqueDerivees.types";
import { analyserCourbe, BORNES_X_DERIVEES, capaciteBranche, directionsBranche, domainesBranches, ECART_BORD_MAX, ecartAuBord, tenterBranche, valeurMorceau } from "./courbeNumerique";
import type { BrancheConstruite } from "./courbeNumerique";

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Positions d'AV recadrées (1 AV dans [−3 ; 3], 2 AV dans [−3 ; 3] distantes d'au moins 3) : chaque
 * branche extérieure garde au moins 5 unités pour son gabarit et ses points clés. */
function recadrerAsymptotique(asymptotique: ExerciceLectureGraphiqueLimites): ExerciceLectureGraphiqueLimites {
  const { vas } = asymptotique;
  let positions: number[] = [];
  if (vas.length === 1) positions = [entier(-3, 3)];
  if (vas.length === 2) {
    const a = entier(-3, 0);
    positions = [a, entier(a + 3, 3)];
  }
  const nouvelles: ComportementVA[] = vas.map((va, i) => ({ ...va, position: positions[i] }));
  // Asymptote oblique de pente modérée (±0,5 ou ±1, ordonnée à l'origine dans [−2 ; 2]) : sur la fenêtre
  // [−8 ; 8], une pente 3 étirait le graphique sur près de 50 unités et écrasait les extremums.
  const infini = asymptotique.infini.type === "oblique" ? { type: "oblique" as const, pente: [-1, -0.5, 0.5, 1][entier(0, 3)], ordonnee: entier(-2, 2) } : asymptotique.infini;
  return { vas: nouvelles, infini };
}

const PI_MAX = 3;
const SEPARATION_MIN = 1;
const Y_MAX_COURBE = 9.5;

interface Cible {
  extremums: number;
  paliers: number;
}

/** Répartit les points clés entre les branches (au hasard, parmi celles qui ont encore de la place),
 * puis corrige la parité imposée par les directions de chaque branche. */
function repartir(asymptotique: ExerciceLectureGraphiqueLimites, cible: Cible): ("extremum" | "palier")[][] {
  const domaines = domainesBranches(asymptotique, BORNES_X_DERIVEES);
  const capacites = domaines.map((_, i) => capaciteBranche(asymptotique, i, BORNES_X_DERIVEES));
  const types: ("extremum" | "palier")[][] = domaines.map(() => []);
  const choisirBranche = (): number | null => {
    const libres = capacites.map((c, i) => (types[i].length < c ? i : -1)).filter((i) => i >= 0);
    return libres.length === 0 ? null : libres[Math.floor(Math.random() * libres.length)];
  };
  for (let k = 0; k < cible.extremums; k++) {
    const i = choisirBranche();
    if (i !== null) types[i].push("extremum");
  }
  for (let k = 0; k < cible.paliers; k++) {
    const i = choisirBranche();
    if (i === null) continue;
    const b = types[i];
    b.splice(Math.floor(Math.random() * (b.length + 1)), 0, "palier");
  }
  types.forEach((liste, i) => {
    const dirs = directionsBranche(asymptotique, i);
    const nbExtremums = liste.filter((t) => t === "extremum").length;
    let impairRequis: boolean | null = null;
    if (dirs.gauche !== null && dirs.droite !== null) impairRequis = dirs.gauche !== dirs.droite;
    // Une branche bornée par deux fois la même asymptote horizontale ne peut pas être monotone.
    const { infini } = asymptotique;
    if (domaines.length === 1 && infini.type === "horizontale" && infini.limiteMoinsInfini === infini.limitePlusInfini && nbExtremums === 0) impairRequis = true;
    if (impairRequis !== null && (nbExtremums % 2 === 1) !== impairRequis) {
      if (nbExtremums > 0 && (Math.random() < 0.5 || liste.length >= capacites[i])) liste.splice(liste.indexOf("extremum"), 1);
      else liste.splice(Math.floor(Math.random() * (liste.length + 1)), 0, "extremum");
    }
  });
  return types;
}

/** Compteur des motifs de rejet (mesures et tests uniquement). */
export const motifsRejet: Record<string, number> = {};
function rejet(motif: string): null {
  motifsRejet[motif] = (motifsRejet[motif] ?? 0) + 1;
  return null;
}

function controlerLisibilite(asymptotique: ExerciceLectureGraphiqueLimites, branches: BrancheConstruite[]): ExerciceLectureGraphiqueDerivees | null {
  const analyse = analyserCourbe(branches);
  if (!analyse.valide) return rejet(analyse.raison ?? "analyse");
  const morceaux = branches.flatMap((b) => b.morceaux);
  if (analyse.inflexions.length > PI_MAX) return rejet("trop de PI");
  // Points remarquables (extremums, paliers, PI hors paliers) deux à deux à ≥ 1 unité.
  const positions = [...analyse.extrema.map((e) => e.position), ...analyse.inflexions.map((p) => p.position)].sort((a, b) => a - b);
  for (let i = 1; i < positions.length; i++) {
    const ecart = positions[i] - positions[i - 1];
    const memePalier = ecart < 1e-9 && analyse.paliers.some((p) => Math.abs(p.position - positions[i]) < 1e-9);
    if (!memePalier && ecart < SEPARATION_MIN) return rejet("séparation");
  }
  // Ni PI ni extremum trop près d'une AV.
  for (const va of asymptotique.vas) if (positions.some((x) => Math.abs(x - va.position) < 1)) return rejet("près d'une AV");
  if (ecartAuBord(asymptotique, morceaux, BORNES_X_DERIVEES) > ECART_BORD_MAX) return rejet("écart au bord");
  // Valeurs dans la fenêtre (hors divergence près d'une AV).
  for (const m of morceaux) {
    // Les gabarits suivent leur asymptote (divergence, oblique) : seule la partie « dessinée » compte.
    if (m.kind === "divergence" || (m.kind === "expo" && m.pente !== 0)) continue;
    for (let i = 0; i <= 8; i++) {
      const x = m.x0 + ((m.x1 - m.x0) * i) / 8;
      if (Math.abs(valeurMorceau(m, x)) > Y_MAX_COURBE) return rejet("hors fenêtre");
    }
  }
  return { asymptotique, bornesX: BORNES_X_DERIVEES, morceaux, extrema: analyse.extrema, paliers: analyse.paliers, inflexions: analyse.inflexions };
}

const TENTATIVES_PAR_BRANCHE = 40;

/** Une branche valide (contrôle analytique de la branche seule), en au plus TENTATIVES_PAR_BRANCHE
 * tirages — les branches sont indépendantes, on ne recommence pas tout pour une seule branche. */
function brancheValide(asymptotique: ExerciceLectureGraphiqueLimites, index: number, types: ("extremum" | "palier")[]): BrancheConstruite | null {
  for (let t = 0; t < TENTATIVES_PAR_BRANCHE; t++) {
    const b = tenterBranche(asymptotique, index, BORNES_X_DERIVEES, types);
    if (b && analyserCourbe([b]).valide) return b;
  }
  return null;
}

function tenter(asymptotique: ExerciceLectureGraphiqueLimites, cible: Cible): ExerciceLectureGraphiqueDerivees | null {
  const types = repartir(asymptotique, cible);
  if (types.flat().filter((t) => t === "extremum").length > 3) return rejet("plus de 3 extremums");
  const branches: BrancheConstruite[] = [];
  for (let i = 0; i < types.length; i++) {
    const b = brancheValide(asymptotique, i, types[i]);
    if (!b) return rejet(`branche ${i}`);
    branches.push(b);
  }
  return controlerLisibilite(asymptotique, branches);
}

const TENTATIVES_PAR_CIBLE = 12;

/** Construit l'exercice ; la cible est réduite pas à pas si elle est irréalisable (repli sans palier,
 * puis moins d'extremums). La parité imposée par les bords peut ajouter ou retirer un extremum. */
export function construireExercice(asymptotiqueBrut: ExerciceLectureGraphiqueLimites, cible: Cible): ExerciceLectureGraphiqueDerivees {
  const asymptotique = recadrerAsymptotique(asymptotiqueBrut);
  const cibles: Cible[] = [cible];
  if (cible.paliers > 0) cibles.push({ extremums: cible.extremums, paliers: 0 });
  for (let e = cible.extremums - 1; e >= 0; e--) cibles.push({ extremums: e, paliers: 0 });
  cibles.push({ extremums: 1, paliers: 0 }, { extremums: 2, paliers: 0 });
  for (const c of cibles) {
    for (let t = 0; t < TENTATIVES_PAR_CIBLE; t++) {
      const exo = tenter(asymptotique, c);
      if (exo) return exo;
    }
  }
  // Repli : autre comportement aux bords tiré au hasard (jamais atteint en pratique, voir les mesures).
  return construireExercice(genererExerciceLectureGraphiqueLimites(), { extremums: 1, paliers: 0 });
}

const POIDS_EXTREMUMS: [number, number][] = [
  [0, 1],
  [1, 2.5],
  [2, 2.5],
  [3, 1],
];

function tirerPondere(poids: [number, number][]): number {
  const total = poids.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [n, p] of poids) {
    if (r < p) return n;
    r -= p;
  }
  return poids[0][0];
}

export function genererExerciceLectureGraphiqueDerivees(): ExerciceLectureGraphiqueDerivees {
  return construireExercice(genererExerciceLectureGraphiqueLimites(), { extremums: tirerPondere(POIDS_EXTREMUMS), paliers: Math.random() < 0.45 ? 1 : 0 });
}

// ============================================================================
// Panneau dev — structures représentatives. Les nombres annoncés sont des CIBLES : la parité imposée
// par les bords ou la place disponible peut ajouter ou retirer un extremum.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "0va-horizontale-0ext-0pi", label: "0 AV — horizontale distincte, monotone" },
  { id: "0va-horizontale-1ext-0pi", label: "0 AV — horizontale, 1 extremum" },
  { id: "0va-horizontale-2ext-1pi", label: "0 AV — horizontale, 2 extremums" },
  { id: "0va-horizontale-3ext-2pi", label: "0 AV — horizontale distincte, palier" },
  { id: "0va-oblique-2ext-0pi", label: "0 AV — oblique, 2 extremums" },
  { id: "1va-horizontale-1ext-1pi", label: "1 AV — horizontale, 1 extremum" },
  { id: "1va-oblique-2ext-1pi", label: "1 AV — oblique, 2 extremums" },
  { id: "1va-aucune-0ext-0pi", label: "1 AV — sans asymptote à l'infini, palier" },
  { id: "2va-opposes-horizontale-2ext-2pi", label: "2 AV — horizontale, 2 extremums" },
  { id: "2va-mixte-oblique-3ext-2pi", label: "2 AV — oblique, 2 extremums" },
  { id: "2va-pointIsole-1ext-1pi", label: "2 AV (point isolé) — 1 extremum" },
];

export function construireAvecVarianteId(id: string): ExerciceLectureGraphiqueDerivees {
  switch (id) {
    case "0va-horizontale-0ext-0pi":
      return construireExercice(construireAvecFamilleId("0va-horizontale-distincte"), { extremums: 0, paliers: 0 });
    case "0va-horizontale-1ext-0pi":
      return construireExercice(construireAvecFamilleId("0va-horizontale"), { extremums: 1, paliers: 0 });
    case "0va-horizontale-2ext-1pi":
      return construireExercice(construireAvecFamilleId("0va-horizontale"), { extremums: 2, paliers: 0 });
    case "0va-horizontale-3ext-2pi":
      return construireExercice(construireAvecFamilleId("0va-horizontale-distincte"), { extremums: 0, paliers: 1 });
    case "0va-oblique-2ext-0pi":
      return construireExercice(construireAvecFamilleId("0va-oblique"), { extremums: 2, paliers: 0 });
    case "1va-horizontale-1ext-1pi":
      return construireExercice(construireAvecFamilleId("1va-opposes-horizontale"), { extremums: 1, paliers: 0 });
    case "1va-oblique-2ext-1pi":
      return construireExercice(construireAvecFamilleId("1va-opposes-oblique"), { extremums: 2, paliers: 0 });
    case "1va-aucune-0ext-0pi":
      return construireExercice(construireAvecFamilleId("1va-aucune"), { extremums: 0, paliers: 1 });
    case "2va-opposes-horizontale-2ext-2pi":
      return construireExercice(construireAvecFamilleId("2va-opposes-horizontale"), { extremums: 2, paliers: 0 });
    case "2va-mixte-oblique-3ext-2pi":
      return construireExercice(construireAvecFamilleId("2va-mixte-oblique"), { extremums: 2, paliers: 0 });
    case "2va-pointIsole-1ext-1pi":
      return construireExercice(construireAvecFamilleId("2va-pointIsole"), { extremums: 1, paliers: 0 });
    default:
      throw new Error(`construireAvecVarianteId : id inconnu "${id}"`);
  }
}
