import type { CategorieProbable, ElementsConiqueCentree, IdentifiantNature, NatureConique, Point } from "../../core6e/identificationConiques.types";

/**
 * ============================================================================
 * Couche A (6e) — FONDATION DU CHAPITRE "Les coniques". `6gen58` est le générateur D'OUVERTURE ;
 * `6gen59` à `6gen63` (construits APRÈS ce générateur) réutiliseront directement les fonctions de ce
 * fichier — jamais une réimplémentation locale. API PUBLIQUE destinée à cette réutilisation :
 *
 * - `classifierConiqueCentree(coeffX,coeffY,M,centre)` — LA fonction de classification centrale.
 *   Reçoit une conique déjà mise sous la forme canonique `coeffX·(x-h)²+coeffY·(y-k)²=M` (centre
 *   `{x:h,y:k}`, `{x:0,y:0}` par défaut pour une conique déjà centrée à l'origine) et renvoie sa
 *   `NatureConique` exacte — gère TOUS les cas (ellipse/cercle/vide/point des 2 côtés "même signe",
 *   hyperbole/droites sécantes des 2 côtés "signes opposés"), sans jamais diviser par `M` avant
 *   d'avoir vérifié `M===0` en premier (garantit qu'aucun appelant ne peut introduire une division
 *   par zéro pour le cas C=0/M=0 — voir le piège central de la famille A sous-type 1 dans la
 *   mission). Les 3 familles de `6gen58` s'y ramènent TOUTES : A sous-type 1 (`coeffX=A,coeffY=B,
 *   M=-C`, centre origine), B (`coeffX=A,coeffY=B,M`, centre `(h,k)` déjà complété), C (après
 *   assemblage de la forme standard, voir `familleC.ts`).
 * - `elementsConiqueCentree(coeffX,coeffY,M,nature)` — éléments caractéristiques numériques
 *   (`a`,`b`,`c`,`pente`,`rayon` selon `nature.type`) d'une conique NON dégénérée, cohérents par
 *   construction avec la `nature` déjà classifiée (jamais recalculés indépendamment).
 * - `categorieProbable(coeffX,coeffY)` — lecture de signe grossière (même signe → famille
 *   ellipse/cercle/vide/point ; signes opposés → famille hyperbole/droites sécantes), AVANT même de
 *   connaître `M` — le "écran 1" de toute conique à 2 carrés (familles A1/B).
 * - `tirerTripletCanonique(categorie)` — génère un triplet `{coeffX,coeffY,M}` ENTIER "propre"
 *   (jamais de décimal, cohérent avec CLAUDE.md) pour une catégorie donnée, centre implicite
 *   `(0,0)` — réutilisable par un générateur qui a juste besoin d'un exemple concret de chaque
 *   catégorie (comme `familleA.ts`/`familleB.ts` de CE générateur), un par un ou par tirage.
 * - `natureVersId`/`LIBELLE_NATURE`/`memeNature` — pont entre `NatureConique` (structuré) et
 *   `IdentifiantNature` (string plat), pour piloter des boutons `.btn.toggle-active` et comparer un
 *   choix élève à la valeur attendue.
 * - `classifierUnSeulCarre`/`elementsParabole` — l'autre moitié du chapitre (conique à UN SEUL
 *   carré, famille A sous-type 2 de CE générateur : `Av²+Dv=0` dégénéré ou parabole).
 * ============================================================================
 */

// ============================================================================
// Catégorie probable (lecture de signe, AVANT normalisation) — familles A1/B, écran "signes".
// ============================================================================

export function categorieProbable(coeffX: number, coeffY: number): CategorieProbable {
  return Math.sign(coeffX) === Math.sign(coeffY) ? "ellipseCercleVidePoint" : "hyperboleDroitesSecantes";
}

// ============================================================================
// Classification centrale — coeffX·(x-h)²+coeffY·(y-k)²=M.
// ============================================================================

export function classifierConiqueCentree(coeffX: number, coeffY: number, M: number, centre: Point = { x: 0, y: 0 }): NatureConique {
  const memeSigne = Math.sign(coeffX) === Math.sign(coeffY);

  // M===0 vérifié EN PREMIER, avant toute division par M — évite structurellement la division par
  // zéro invisible (piège central de la famille A sous-type 1, mission).
  if (M === 0) {
    if (memeSigne) return { type: "point", centre };
    const pente = Math.sqrt(Math.abs(coeffX / coeffY));
    return { type: "droitesSecantes", centre, pente };
  }

  if (memeSigne) {
    // Ellipse/cercle ssi M/coeffX>0 (équivalent à "M et coeffX de même signe", coeffY ayant
    // nécessairement le même signe que coeffX dans cette branche) ; sinon vide.
    if (Math.sign(M) !== Math.sign(coeffX)) return { type: "vide" };
    const semiX = Math.sqrt(M / coeffX);
    const semiY = Math.sqrt(M / coeffY);
    if (Math.abs(semiX - semiY) < 1e-9) return { type: "cercle" };
    return { type: "ellipse", axe: semiX > semiY ? "horizontal" : "vertical" };
  }

  // Signes opposés, M≠0 : hyperbole, axe = direction du terme de MÊME signe que M (terme "positif"
  // une fois divisé par M, transverse).
  return { type: "hyperbole", axe: Math.sign(coeffX) === Math.sign(M) ? "horizontal" : "vertical" };
}

// ============================================================================
// Éléments caractéristiques d'une conique à centre NON dégénérée.
// ============================================================================

export function elementsConiqueCentree(coeffX: number, coeffY: number, M: number, nature: NatureConique): ElementsConiqueCentree {
  if (nature.type === "cercle") {
    return { rayon: Math.sqrt(M / coeffX) };
  }
  if (nature.type === "ellipse") {
    const semiX = Math.sqrt(M / coeffX);
    const semiY = Math.sqrt(M / coeffY);
    const a = Math.max(semiX, semiY);
    const b = Math.min(semiX, semiY);
    const cCarre = a * a - b * b;
    return { a, b, cCarre, c: Math.sqrt(cCarre) };
  }
  if (nature.type === "hyperbole") {
    const transverseHorizontal = Math.sign(coeffX) === Math.sign(M);
    const a = transverseHorizontal ? Math.sqrt(M / coeffX) : Math.sqrt(M / coeffY);
    const b = transverseHorizontal ? Math.sqrt(-M / coeffY) : Math.sqrt(-M / coeffX);
    const cCarre = a * a + b * b;
    return { a, b, cCarre, c: Math.sqrt(cCarre), pente: transverseHorizontal ? b / a : a / b };
  }
  return {};
}

// ============================================================================
// Triplets canoniques "propres" (entiers) par catégorie — réutilisé par familleA.ts/familleB.ts de
// CE générateur, et par tout générateur futur ayant besoin d'un exemple concret par catégorie.
// ============================================================================

function tirerEntierLocal(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export type CategorieConiqueCentree = Exclude<IdentifiantNature, "paraboleDroite" | "paraboleGauche" | "paraboleHaut" | "paraboleBas" | "droitesParalleles">;

export function tirerTripletCanonique(categorie: CategorieConiqueCentree): { coeffX: number; coeffY: number; M: number } {
  switch (categorie) {
    case "cercle": {
      const r = tirerEntierLocal(2, 6);
      return { coeffX: 1, coeffY: 1, M: r * r };
    }
    case "ellipseHorizontal":
    case "ellipseVertical": {
      const grand = tirerEntierLocal(3, 6);
      const petit = tirerEntierLocal(2, grand - 1);
      const M = grand * grand * petit * petit;
      // axe horizontal ⟺ demi-grand axe le long de x ⟺ coeffX PLUS PETIT (dénominateur plus grand).
      return categorie === "ellipseHorizontal" ? { coeffX: petit * petit, coeffY: grand * grand, M } : { coeffX: grand * grand, coeffY: petit * petit, M };
    }
    case "hyperboleHorizontal":
    case "hyperboleVertical": {
      const a = tirerEntierLocal(2, 6);
      const b = tirerEntierLocal(2, 6);
      const M = a * a * b * b;
      // axe horizontal (transverse en x) : x²/a²-y²/b²=1 ⟺ coeffX=b², coeffY=-a².
      return categorie === "hyperboleHorizontal" ? { coeffX: b * b, coeffY: -(a * a), M } : { coeffX: -(b * b), coeffY: a * a, M };
    }
    case "vide": {
      const coeffX = tirerEntierLocal(1, 5);
      const coeffY = tirerEntierLocal(1, 5);
      const M = -tirerEntierLocal(1, 8);
      return { coeffX, coeffY, M };
    }
    case "point": {
      const coeffX = tirerEntierLocal(1, 5);
      const coeffY = tirerEntierLocal(1, 5);
      return { coeffX, coeffY, M: 0 };
    }
    case "droitesSecantes": {
      const coeffX = tirerEntierLocal(1, 5);
      const coeffY = -tirerEntierLocal(1, 5);
      return { coeffX, coeffY, M: 0 };
    }
  }
}

// ============================================================================
// Un seul carré + un terme linéaire — Av²+Dv=0 (dégénéré) ou Av²+Dw=0 (parabole).
// ============================================================================

/** `variableCarre` : la variable au carré. Si le terme linéaire porte sur la MÊME variable
 * (`memeVariable=true`), factorise en `v(Av+D)=0` → 2 droites parallèles `v=0`/`v=-D/A`. Sinon,
 * parabole `v²=4p·w` — orientation déduite du signe de `p` ET de `variableCarre` (x²=4py ⟹
 * haut/bas ; y²=4px ⟹ droite/gauche). */
export function classifierUnSeulCarre(coeffCarre: number, variableCarre: "x" | "y", coeffLineaire: number, memeVariable: boolean): NatureConique {
  if (memeVariable) {
    return { type: "droitesParalleles", variable: variableCarre, valeurs: [0, -coeffLineaire / coeffCarre] };
  }
  const quatrePSigne = -coeffLineaire / coeffCarre;
  const pSigne = quatrePSigne / 4;
  if (variableCarre === "x") return { type: "parabole", orientation: pSigne > 0 ? "haut" : "bas" };
  return { type: "parabole", orientation: pSigne > 0 ? "droite" : "gauche" };
}

export function elementsParabole(orientation: "droite" | "gauche" | "haut" | "bas", p: number): { foyer: Point; directrice: number } {
  switch (orientation) {
    case "haut":
      return { foyer: { x: 0, y: p }, directrice: -p };
    case "bas":
      return { foyer: { x: 0, y: -p }, directrice: p };
    case "droite":
      return { foyer: { x: p, y: 0 }, directrice: -p };
    case "gauche":
      return { foyer: { x: -p, y: 0 }, directrice: p };
  }
}

// ============================================================================
// Pont NatureConique (structuré) ↔ IdentifiantNature (string plat, pour boutons de choix).
// ============================================================================

export function natureVersId(nature: NatureConique): IdentifiantNature {
  switch (nature.type) {
    case "ellipse":
      return nature.axe === "horizontal" ? "ellipseHorizontal" : "ellipseVertical";
    case "hyperbole":
      return nature.axe === "horizontal" ? "hyperboleHorizontal" : "hyperboleVertical";
    case "cercle":
      return "cercle";
    case "parabole":
      return nature.orientation === "droite" ? "paraboleDroite" : nature.orientation === "gauche" ? "paraboleGauche" : nature.orientation === "haut" ? "paraboleHaut" : "paraboleBas";
    case "vide":
      return "vide";
    case "point":
      return "point";
    case "droitesParalleles":
      return "droitesParalleles";
    case "droitesSecantes":
      return "droitesSecantes";
  }
}

export function memeNature(a: NatureConique, b: NatureConique): boolean {
  return natureVersId(a) === natureVersId(b);
}

/** Libellés FRANÇAIS réutilisables pour les boutons de choix `.btn.toggle-active` de tout
 * générateur du chapitre "Les coniques" — DÉLIBÉRÉMENT dans cette Couche A (comme
 * `ENSEMBLES_DERNIER_CHIFFRE.label`, `generateurs6e/denombrementFondamental/familleA.ts`) plutôt que
 * dans une couche `ui6e/` par générateur : la correspondance ID↔libellé est UNIVERSELLE au chapitre,
 * jamais reformulée différemment d'un générateur à l'autre. */
export const LIBELLE_NATURE: Record<IdentifiantNature, string> = {
  ellipseHorizontal: "Ellipse (axe horizontal)",
  ellipseVertical: "Ellipse (axe vertical)",
  hyperboleHorizontal: "Hyperbole (axe horizontal)",
  hyperboleVertical: "Hyperbole (axe vertical)",
  cercle: "Cercle",
  paraboleDroite: "Parabole (ouverte vers la droite)",
  paraboleGauche: "Parabole (ouverte vers la gauche)",
  paraboleHaut: "Parabole (ouverte vers le haut)",
  paraboleBas: "Parabole (ouverte vers le bas)",
  vide: "Ensemble vide (∅)",
  point: "Un seul point",
  droitesParalleles: "2 droites parallèles",
  droitesSecantes: "2 droites sécantes",
};
