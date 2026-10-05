import type { PolynomeLineaire } from "../../core/simplification.types";
import type { Borne, Crochet, Morceau, Symbole } from "../../core/inequation.types";
import type { Signe, SolutionEnsembleProduit, ValeurCellule } from "../../core/signesProduit.types";
import type { GrilleQuotient, ValeurCelluleQuotient } from "../../core/inequationRationnelle.types";

/**
 * Valeur x représentative d'une colonne (n racines distinctes ⇒ 2n+1 colonnes — 5 en niveaux 1-2,
 * 7 en niveau 3) : exactement la racine pour une colonne "point" (indices impairs), un point
 * d'échantillonnage strictement à l'intérieur de la zone pour une colonne "zone" (indices pairs) —
 * même principe que valeurRepresentative (generateurs/signesProduit/grille.ts), dupliqué ici car
 * non exporté là-bas (calcul trivial, pas de couplage supplémentaire souhaité). Générique sur le
 * nombre de racines — réutilisé tel quel par construireGrilleQuotientNiveau3.ts.
 */
export function valeurRepresentative(racines: number[], colonne: number): number {
  const n = racines.length;
  if (colonne % 2 === 1) return racines[(colonne - 1) / 2];
  const zone = colonne / 2;
  if (zone === 0) return racines[0] - 1;
  if (zone === n) return racines[n - 1] + 1;
  return (racines[zone - 1] + racines[zone]) / 2;
}

/** Signe de k(x-p) — réutilisé tel quel par construireGrilleQuotientNiveau3.ts pour sa ligne D. */
export function signeLineaire(poly: PolynomeLineaire, x: number): ValeurCellule {
  const valeur = poly.k * (x - poly.p);
  if (valeur === 0) return "0";
  return valeur > 0 ? "+" : "-";
}

/**
 * Signe du quotient N/D — calculé par DIVISION des deux lignes précédentes, jamais par
 * multiplication (contrairement au tableau de signes produit) : "∄" dès que D vaut "0" (quotient
 * non défini, priment sur tout le reste), "0" si N vaut "0" (et D non nul — garanti par
 * construction, racines toujours distinctes), sinon "+" si N et D ont même signe, "-" sinon.
 * Exportée : réutilisée par construireGrilleQuotientNiveau3.ts (avec N = signe du PRODUIT des deux
 * facteurs de P2_1, calculé séparément — voir ce fichier).
 */
export function signeQuotient(n: ValeurCellule, d: ValeurCellule): ValeurCelluleQuotient {
  if (d === "0") return "∄";
  if (n === "0") return "0";
  return n === d ? "+" : "-";
}

/**
 * Construit la grille de signes attendue pour P1_1/P1_2 ◇ 0 (niveau 1) : les deux racines
 * (numérateur, dénominateur) sont toujours distinctes (garanti par la construction de l'exercice,
 * jamais vérifié ici) — triées croissant pour former l'en-tête. Chaque colonne est évaluée
 * directement à sa valeur représentative (jamais par propagation de signe zone à zone), même
 * principe que construireGrille (signesProduit).
 */
export function construireGrilleQuotient(
  numerateur: PolynomeLineaire,
  denominateur: PolynomeLineaire,
): { racines: [number, number]; ce: number; grille: GrilleQuotient } {
  const racines = [numerateur.p, denominateur.p].sort((a, b) => a - b) as [number, number];
  const nbColonnes = 2 * racines.length + 1;
  const points = Array.from({ length: nbColonnes }, (_, colonne) => valeurRepresentative(racines, colonne));

  const ligneNumerateur = points.map((x) => signeLineaire(numerateur, x));
  const ligneDenominateur = points.map((x) => signeLineaire(denominateur, x));
  const ligneQuotient = ligneNumerateur.map((n, i) => signeQuotient(n, ligneDenominateur[i]));

  return { racines, ce: denominateur.p, grille: { ligneNumerateur, ligneDenominateur, ligneQuotient } };
}

/**
 * Sous-ensemble des colonnes "zone" (indices pairs) de la ligne quotient — jamais "0" ni "∄" par
 * construction (les racines ne tombent jamais sur une colonne zone, voir valeurRepresentative).
 */
export function extraireSignesZonesQuotient(ligneQuotient: ValeurCelluleQuotient[]): Signe[] {
  return ligneQuotient.filter((_, colonne) => colonne % 2 === 0) as Signe[];
}

function crochet(side: "gauche" | "droite", ferme: boolean): Crochet {
  if (side === "gauche") return ferme ? "[" : "]";
  return ferme ? "]" : "[";
}

/**
 * Morceau d'une zone satisfaisante, avec une nuance absente du tableau de signes produit
 * (attention particulière demandée par la spec, section 3) : une borne à la racine du
 * dénominateur (CE) reste TOUJOURS ouverte, même pour un symbole large (≤/≥) — le quotient n'y
 * est pas défini, il ne peut jamais être "inclus". Seule la borne à la racine du numérateur suit
 * la règle habituelle (fermée seulement si le symbole est large).
 */
function construireMorceauZoneQuotient(zone: number, racines: number[], ce: number | number[], inclureBornes: boolean): Morceau {
  const ceListe = Array.isArray(ce) ? ce : [ce];
  const n = racines.length;
  const borneGauche: Borne = zone === 0 ? "-inf" : racines[zone - 1];
  const borneDroite: Borne = zone === n ? "+inf" : racines[zone];
  const fermeGauche = zone !== 0 && !ceListe.includes(racines[zone - 1]) && inclureBornes;
  const fermeDroit = zone !== n && !ceListe.includes(racines[zone]) && inclureBornes;
  return {
    crochetGauche: zone === 0 ? "]" : crochet("gauche", fermeGauche),
    borneGauche,
    crochetDroit: zone === n ? "[" : crochet("droite", fermeDroit),
    borneDroite,
  };
}

/**
 * Ensemble-solution à partir des signes de zone déjà extraits — même principe que
 * classifierSolutionProduit (signesProduit), mais chaque borne à la CE reste toujours ouverte
 * (voir construireMorceauZoneQuotient). En niveau 1 (2 racines simples et distinctes), le signe du
 * quotient alterne strictement d'une zone à l'autre (chaque racine, numérateur ou dénominateur,
 * inverse le signe exactement une fois) : les 3 zones valent donc toujours 2 fois un signe et 1
 * fois l'autre, jamais les 3 identiques ni 0 zone satisfaisante — seules "intervalle" (1 zone) et
 * "union" (2 zones) sont donc jamais atteintes ici ("vide"/"reel"/"reel_sauf_points" resteraient
 * pertinents pour un niveau futur où cette alternance stricte ne tiendrait plus, ex. dénominateur
 * au carré — hors périmètre de cette itération, voir spec section 0). `ce` accepte soit une seule
 * valeur (niveaux 1-3, un seul dénominateur) soit un tableau (niveau 4, deux dénominateurs P1_2 et
 * P1_4) — toutes les bornes CE, quel que soit leur nombre, restent toujours ouvertes.
 */
export function classifierSolutionQuotient(
  racines: number[],
  ce: number | number[],
  zonesSignes: Signe[],
  symbole: Symbole,
): SolutionEnsembleProduit {
  const inclureBornes = symbole === "≤" || symbole === "≥";
  const satisfaitPositif = symbole === ">" || symbole === "≥";
  const zonesSatisfaisantes = zonesSignes
    .map((signe, zone) => ({ signe, zone }))
    .filter(({ signe }) => (satisfaitPositif ? signe === "+" : signe === "-"))
    .map(({ zone }) => zone);

  const morceaux = zonesSatisfaisantes.map((zone) => construireMorceauZoneQuotient(zone, racines, ce, inclureBornes));
  if (morceaux.length === 1) return { forme: "intervalle", morceau: morceaux[0] };
  return { forme: "union", morceaux };
}

/**
 * Une colonne satisfait l'inégalité si son signe correspond au symbole ; une colonne à "0" ne
 * satisfait que les symboles larges (≤/≥) — même principe que colonneSatisfait (signesProduit,
 * exercice "tableau de signes à plusieurs facteurs"). Différence propre à ce générateur (section
 * 3 du prompt de corrections) : une colonne "∄" ne satisfait JAMAIS, quel que soit le symbole —
 * le quotient n'y est pas défini, elle est de toute façon exclue par la CE.
 */
export function colonneSatisfaitQuotient(valeur: ValeurCelluleQuotient, symbole: Symbole): boolean {
  if (valeur === "∄") return false;
  if (valeur === "0") return symbole === "≤" || symbole === "≥";
  const positif = valeur === "+";
  return symbole === ">" || symbole === "≥" ? positif : !positif;
}

/**
 * Étape "Aide" de l'écran intervalle (prompt de corrections, section 3) : détermine quelles
 * colonnes de la grille confirmée satisfont l'inégalité demandée, et lesquelles des racines de
 * l'en-tête leur correspondent — même principe que calculerAideGrille (signesProduit), jamais
 * utilisée pour la vérification de la réponse de l'élève (qui reste verifierSolutionSignesProduit).
 * Typé structurellement (pas sur un niveau précis) : `GrilleQuotient` (niveaux 1-2) et
 * `GrilleQuotientNiveau3` partagent tous deux un champ `ligneQuotient`, donc la même fonction sert
 * aux trois niveaux sans variante dédiée.
 */
export function calculerAideGrilleQuotient(exercice: {
  grille: { ligneQuotient: ValeurCelluleQuotient[] };
  racines: number[];
  symbole: Symbole;
}): { colonnes: boolean[]; racines: boolean[] } {
  const colonnes = exercice.grille.ligneQuotient.map((valeur) => colonneSatisfaitQuotient(valeur, exercice.symbole));
  const racines = exercice.racines.map((_, j) => colonnes[2 * j + 1]);
  return { colonnes, racines };
}
