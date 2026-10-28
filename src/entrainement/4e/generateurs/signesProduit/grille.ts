import type { Symbole } from "../../core/inequation.types";
import type { Borne, Crochet, Morceau } from "../../core/inequation.types";
import type {
  ExerciceSignesProduit,
  FacteurQuadratiqueIrreductible,
  FacteurSignesProduit,
  Grille,
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
 * - "carre" : un facteur au carré a(x−r)² (catégorie produit_remarquable, racine double) — une seule
 *   ligne « (x−r)² », « + » partout sauf « 0 » en r : un carré n'est jamais négatif (plus lisible que
 *   deux lignes « x−r » identiques). Son coefficient dominant négatif a sa ligne "p0" comme les autres.
 */
export type LigneRef =
  | { kind: "p0"; facteurIndex: number }
  | { kind: "p1"; facteurIndex: number; racineIndex?: 0 | 1 }
  | { kind: "p2"; facteurIndex: number }
  | { kind: "carre"; facteurIndex: number };

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
      if (facteur.exercice.categorie === "produit_remarquable") {
        lignes.push({ kind: "carre", facteurIndex });
      } else {
        lignes.push({ kind: "p1", facteurIndex, racineIndex: 0 });
        lignes.push({ kind: "p1", facteurIndex, racineIndex: 1 });
      }
    } else {
      lignes.push({ kind: "p2", facteurIndex });
    }
  });
  return lignes;
}

/** Racine portée par une ligne "p1" — undefined pour "p0"/"p2" (aucune racine réelle). */
function racineDeLigne(facteurs: FacteurSignesProduit[], ref: LigneRef): number | undefined {
  if (ref.kind === "carre") {
    const facteur = facteurs[ref.facteurIndex];
    return facteur.type === "quadratique_factorisable" ? facteur.exercice.solution.racines[0] : undefined;
  }
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
  if (ref.kind === "carre") return "+";
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
  // Dédoublonnées : une racine double (ligne "carre") n'occupe qu'UNE colonne.
  const racines = [...new Set(refs.map((ref) => racineDeLigne(facteurs, ref)).filter((r): r is number => r !== undefined))].sort(
    (a, b) => a - b,
  );
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

/**
 * Ensemble-solution à partir des colonnes satisfaites du tableau (2n+1 colonnes alternées
 * zone/point, n racines distinctes triées) — générique gen5/gen6 (audit, racines doubles) : les
 * colonnes satisfaites consécutives forment des morceaux maximaux ; une colonne point isolée (zones
 * voisines non satisfaites — racine double avec ≤/≥) devient un point isolé. Bornes : une colonne
 * point satisfaite en extrémité de morceau donne un crochet fermé, une zone en extrémité un crochet
 * ouvert sur la racine voisine (qui n'est donc pas solution : « 0 » avec un symbole strict, ou « ∄ »).
 * Formes : "vide", "reel", "reel_sauf_points" (toutes les zones, seules des colonnes point manquent),
 * "point", "intervalle", "union", "mixte" (morceau(x) + point(s) isolé(s)). Avec des racines toutes
 * simples (signe alterné), le résultat est identique à l'ancienne construction zone par zone.
 */
export function classifierSolutionParColonnes(racines: number[], colonnesSatisfaites: boolean[]): SolutionEnsembleProduit {
  const nbColonnes = colonnesSatisfaites.length;
  if (colonnesSatisfaites.every((c) => !c)) return { forme: "vide" };
  if (colonnesSatisfaites.every((c) => c)) return { forme: "reel" };
  const toutesZones = colonnesSatisfaites.every((c, colonne) => colonne % 2 === 1 || c);
  if (toutesZones) {
    return {
      forme: "reel_sauf_points",
      valeurs: racines.filter((_, j) => !colonnesSatisfaites[2 * j + 1]),
    };
  }

  const morceaux: Morceau[] = [];
  const points: number[] = [];
  let colonne = 0;
  while (colonne < nbColonnes) {
    if (!colonnesSatisfaites[colonne]) {
      colonne++;
      continue;
    }
    const debut = colonne;
    while (colonne + 1 < nbColonnes && colonnesSatisfaites[colonne + 1]) colonne++;
    const fin = colonne;
    colonne++;
    if (debut === fin && debut % 2 === 1) {
      points.push(racines[(debut - 1) / 2]);
      continue;
    }
    const borneGauche: Borne = debut === 0 ? "-inf" : debut % 2 === 1 ? racines[(debut - 1) / 2] : racines[debut / 2 - 1];
    const crochetGauche: Crochet = debut % 2 === 1 ? "[" : "]";
    const borneDroite: Borne = fin === nbColonnes - 1 ? "+inf" : fin % 2 === 1 ? racines[(fin - 1) / 2] : racines[fin / 2];
    const crochetDroit: Crochet = fin % 2 === 1 ? "]" : "[";
    morceaux.push({ crochetGauche, borneGauche, crochetDroit, borneDroite });
  }

  if (morceaux.length === 0) return points.length === 1 ? { forme: "point", valeur: points[0] } : { forme: "mixte", morceaux, points };
  if (points.length > 0) return { forme: "mixte", morceaux, points };
  return morceaux.length === 1 ? { forme: "intervalle", morceau: morceaux[0] } : { forme: "union", morceaux };
}

/** Ensemble-solution du produit, depuis la ligne produit complète (zones ET points) — voir classifierSolutionParColonnes. */
export function classifierSolutionProduit(racines: number[], produit: ValeurCellule[], symbole: Symbole): SolutionEnsembleProduit {
  return classifierSolutionParColonnes(racines, produit.map((valeur) => colonneSatisfait(valeur, symbole)));
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
