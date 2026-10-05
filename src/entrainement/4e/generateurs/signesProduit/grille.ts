import type { Symbole } from "../../core/inequation.types";
import type { Borne, Crochet, Morceau } from "../../core/inequation.types";
import type {
  ExerciceSignesProduit,
  FacteurQuadratiqueIrreductible,
  FacteurSignesProduit,
  Grille,
  Signe,
  SolutionEnsembleProduit,
  ValeurCellule,
} from "../../core/signesProduit.types";

/**
 * Réfère une ligne du tableau classique (prompt-refonte-tableau-signes.md) à son origine :
 * - "p0" : un coefficient dominant négatif — soit celui d'un facteur linéaire k(x-p) (k<0), soit
 *   celui d'un facteur factorisable a(x-r1)(x-r2) (a<0, promptgenerateur5signesProduit.md point 8)
 *   — jamais de racine, toujours "-". Absent quand le coefficient est positif (une constante
 *   positive est invisible pour le signe, jamais trackée comme ligne).
 * - "p1" : une racine propre — soit celle d'un facteur linéaire (toujours monique dans le tableau
 *   quand son coefficient vaut 1 ou est négatif — déjà extrait dans une éventuelle ligne "p0"
 *   séparée dans ce dernier cas ; le libellé montre en revanche le facteur complet kx-kp quand le
 *   coefficient est positif et ≠1, jamais silencieusement divisé par k — voir
 *   ui/formatSignesProduit.ts::formatLigneLabel), soit l'une des 2 racines d'un facteur
 *   factorisable (toujours monique, racineIndex 0 = la plus petite, 1 = la plus grande).
 * - "p2" : un facteur irréductible (Δ<0), signe constant, jamais de racine.
 */
export type LigneRef =
  | { kind: "p0"; facteurIndex: number }
  | { kind: "p1"; facteurIndex: number; racineIndex?: 0 | 1 }
  | { kind: "p2"; facteurIndex: number };

/**
 * Ordre canonique des lignes du tableau : dans l'ordre des facteurs tels qu'affichés dans l'énoncé
 * (`exercice.facteurs`). Un facteur linéaire à coefficient négatif produit d'abord sa ligne "p0"
 * (le coefficient, toujours négatif) puis sa ligne "p1" (racine, toujours présentée sous forme
 * monique x-p — jamais kx-kp) ; à coefficient positif, seulement la ligne "p1" (un coefficient
 * positif est invisible au signe, jamais tracké, mais son libellé montre alors le facteur complet
 * kx-kp plutôt qu'une forme monique silencieusement divisée par k — voir
 * ui/formatSignesProduit.ts::formatLigneLabel, promptgenerateur5signesProduit.md point 3). Un
 * facteur factorisable produit toujours 2 lignes "p1" (une par racine, forme monique) précédées
 * d'une ligne "p0" pour son coefficient dominant UNIQUEMENT s'il est négatif
 * (promptgenerateur5signesProduit.md, point 8 — un coefficient dominant positif reste invisible au
 * signe comme pour un facteur linéaire, jamais sa propre ligne). Un facteur irréductible produit
 * toujours 1 ligne "p2". Partagée entre le générateur et la présentation — jamais recalculée
 * différemment des deux côtés.
 */
export function ordreLignesGrille(facteurs: FacteurSignesProduit[]): LigneRef[] {
  const lignes: LigneRef[] = [];
  facteurs.forEach((facteur, facteurIndex) => {
    if (facteur.type === "lineaire") {
      if (facteur.polynome.k < 0) lignes.push({ kind: "p0", facteurIndex });
      lignes.push({ kind: "p1", facteurIndex });
    } else if (facteur.type === "quadratique_factorisable") {
      if (facteur.exercice.enonce.a < 0) lignes.push({ kind: "p0", facteurIndex });
      lignes.push({ kind: "p1", facteurIndex, racineIndex: 0 });
      lignes.push({ kind: "p1", facteurIndex, racineIndex: 1 });
    } else {
      lignes.push({ kind: "p2", facteurIndex });
    }
  });
  return lignes;
}

/** Racine portée par une ligne "p1" — undefined pour "p0"/"p2" (aucune racine réelle). */
function racineDeLigne(facteurs: FacteurSignesProduit[], ref: LigneRef): number | undefined {
  if (ref.kind !== "p1") return undefined;
  const facteur = facteurs[ref.facteurIndex];
  if (facteur.type === "lineaire") return facteur.polynome.p;
  if (facteur.type === "quadratique_factorisable") {
    const [r1, r2] = [...facteur.exercice.solution.racines].sort((a, b) => a - b);
    return ref.racineIndex === 0 ? r1 : r2;
  }
  return undefined;
}

/**
 * Valeur x représentative d'une colonne : exactement la racine pour une colonne "point" (indices
 * impairs), un point d'échantillonnage strictement à l'intérieur de la zone pour une colonne
 * "zone" (indices pairs) — jamais égal à une racine, donc jamais "0" pour une ligne p1 à cette
 * colonne.
 */
function valeurRepresentative(racines: number[], colonne: number): number {
  const n = racines.length;
  if (colonne % 2 === 1) return racines[(colonne - 1) / 2];
  const zone = colonne / 2;
  if (zone === 0) return racines[0] - 1;
  if (zone === n) return racines[n - 1] + 1;
  return (racines[zone - 1] + racines[zone]) / 2;
}

/** Valeur d'une ligne à une colonne donnée (x représentatif déjà résolu — voir valeurRepresentative). */
function valeurLigne(facteurs: FacteurSignesProduit[], ref: LigneRef, x: number): ValeurCellule {
  if (ref.kind === "p0") return "-";
  if (ref.kind === "p2") {
    return (facteurs[ref.facteurIndex] as FacteurQuadratiqueIrreductible).signe;
  }
  const racine = racineDeLigne(facteurs, ref) as number;
  if (x === racine) return "0";
  return x > racine ? "+" : "-";
}

/**
 * Construit la grille de signes attendue (modèle classique, colonnes alternées zone/point — voir
 * prompt-refonte-tableau-signes.md) et l'ensemble des racines distinctes triées. Chaque ligne est
 * évaluée directement à la valeur représentative de chaque colonne (jamais par propagation de
 * signe zone à zone) : une ligne "p1" vaut "0" exactement à sa propre colonne point, un signe
 * ailleurs ; "p0"/"p2" valent un signe constant, jamais "0". La ligne produit vaut "0" dès qu'une
 * ligne y vaut "0" (une seule à la fois, les racines étant toutes distinctes), sinon le produit
 * des signes.
 */
export function construireGrille(facteurs: FacteurSignesProduit[]): { racines: number[]; grille: Grille } {
  const refs = ordreLignesGrille(facteurs);
  const racines = refs
    .map((ref) => racineDeLigne(facteurs, ref))
    .filter((r): r is number => r !== undefined)
    .sort((a, b) => a - b);
  const nbColonnes = 2 * racines.length + 1;

  const lignes: ValeurCellule[][] = refs.map((ref) =>
    Array.from({ length: nbColonnes }, (_, colonne) => valeurLigne(facteurs, ref, valeurRepresentative(racines, colonne))),
  );

  const produit: ValeurCellule[] = Array.from({ length: nbColonnes }, (_, colonne) => {
    if (lignes.some((ligne) => ligne[colonne] === "0")) return "0";
    const signeProduit = lignes.reduce(
      (acc: 1 | -1, ligne) => (acc * (ligne[colonne] === "+" ? 1 : -1)) as 1 | -1,
      1,
    );
    return signeProduit > 0 ? "+" : "-";
  });

  return { racines, grille: { lignes, produit } };
}

/** Sous-ensemble des colonnes "zone" (indices pairs) d'une ligne produit — jamais "0" par construction (voir construireGrille). */
export function extraireSignesZones(produit: ValeurCellule[]): Signe[] {
  return produit.filter((_, colonne) => colonne % 2 === 0) as Signe[];
}

/** Notation francophone (voir core/inequation.types.ts) : gauche fermé="[" /ouvert="]", droite fermé="]" /ouvert="[". */
function construireMorceauZone(zone: number, racines: number[], inclureBornes: boolean): Morceau {
  const n = racines.length;
  const borneGauche: Borne = zone === 0 ? "-inf" : racines[zone - 1];
  const borneDroite: Borne = zone === n ? "+inf" : racines[zone];
  const crochetGauche: Crochet = zone === 0 ? "]" : inclureBornes ? "[" : "]";
  const crochetDroit: Crochet = zone === n ? "[" : inclureBornes ? "]" : "[";
  return { crochetGauche, borneGauche, crochetDroit, borneDroite };
}

/**
 * Ensemble-solution à partir des signes de zone déjà extraits (extraireSignesZones) — jamais
 * redérivée d'une nouvelle évaluation, pour rester cohérente avec la grille affichée à l'élève.
 * Utilise `SolutionEnsembleProduit` (morceaux en liste, extensible — voir core/signesProduit.types.ts)
 * plutôt que le `SolutionEnsemble` de l'exercice "tableau de signes" (limité à 2 morceaux fixes).
 * En pratique, comme tous les facteurs sont simples (racines toutes distinctes), le signe du
 * produit alterne strictement d'une zone à l'autre, donc au plus 2 morceaux sont jamais produits
 * ici (y compris pour 3 racines / 4 zones) — mais rien dans cette fonction ne suppose cette borne,
 * elle construit simplement une entrée par zone satisfaisante.
 */
export function classifierSolutionProduit(racines: number[], zonesProduit: Signe[], symbole: Symbole): SolutionEnsembleProduit {
  const inclureBornes = symbole === "≤" || symbole === "≥";
  const satisfaitPositif = symbole === ">" || symbole === "≥";
  const zonesSatisfaisantes = zonesProduit
    .map((signe, zone) => ({ signe, zone }))
    .filter(({ signe }) => (satisfaitPositif ? signe === "+" : signe === "-"))
    .map(({ zone }) => zone);

  if (zonesSatisfaisantes.length === 0) return { forme: "vide" };
  if (zonesSatisfaisantes.length === zonesProduit.length) return { forme: "reel" };

  const morceaux = zonesSatisfaisantes.map((zone) => construireMorceauZone(zone, racines, inclureBornes));
  if (morceaux.length === 1) return { forme: "intervalle", morceau: morceaux[0] };
  return { forme: "union", morceaux };
}

/** Une colonne (zone ou point) satisfait l'inégalité si son signe correspond au symbole ; une colonne à "0" ne satisfait que les symboles larges (≤/≥). */
export function colonneSatisfait(valeur: ValeurCellule, symbole: Symbole): boolean {
  if (valeur === "0") return symbole === "≤" || symbole === "≥";
  const positif = valeur === "+";
  return symbole === ">" || symbole === "≥" ? positif : !positif;
}

/**
 * Étape "Aide" (section 6, prompt-refonte-tableau-signes.md) : détermine quelles colonnes de la
 * grille confirmée satisfont l'inégalité demandée, et lesquelles des valeurs de racine de l'en-tête
 * leur correspondent (colonne point 2j+1 pour la racine j) — utilisé pour l'encadré vert de l'aide,
 * jamais pour la vérification de la réponse de l'élève (qui reste verifierGrille, moteur/).
 */
export function calculerAideGrille(exercice: ExerciceSignesProduit): { colonnes: boolean[]; racines: boolean[] } {
  const colonnes = exercice.grille.produit.map((valeur) => colonneSatisfait(valeur, exercice.symbole));
  const racines = exercice.racines.map((_, j) => colonnes[2 * j + 1]);
  return { colonnes, racines };
}
