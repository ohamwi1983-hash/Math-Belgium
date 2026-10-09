/**
 * Couche core (6e) — contrat pour `6gen56` ("Lieux géométriques et élimination de paramètre"),
 * générateur D'OUVERTURE du nouveau chapitre "Lieux géométriques" (6e FWB, 6h). 5 familles (A à E),
 * tirage ÉQUIPROBABLE de la famille PUIS d'un sous-type dans la famille — voir
 * `generateurs6e/lieuxGeometriquesParametres/index.ts`.
 *
 * **`StatutLieu`** (ci-dessous) est le contrat NEUF introduit par ce générateur : une description
 * STRUCTURÉE (discriminant `type` + charge utile assortie) de la NATURE d'un lieu géométrique plan —
 * réplique délibérément le PATRON de `EnsembleReelGuide` (`core6e/ensembleReel.types.ts` : un
 * discriminant `forme`/`type` + charge utile assortie, comparé par une fonction dédiée côté
 * `moteur6e/`), jamais le même contrat (`EnsembleReelGuide` décrit une partie de ℝ à 1 variable ;
 * `StatutLieu` décrit un sous-ensemble du PLAN à 2 variables — formes disjointes, aucune
 * réutilisable pour l'autre). Utilisé par les familles B et E (seules familles de ce générateur où
 * la NATURE du lieu — pas seulement son équation — est elle-même une question posée à l'élève,
 * sous la forme d'un champ `choix` à 7 options parmi `StatutLieu["type"]`, comparées par égalité de
 * chaîne — jamais reconstruite depuis un texte libre parsé, voir en-tête `moteur6e/
 * verificationLieuxGeometriquesParametres.ts`).
 *
 * 7 valeurs (au-delà des 5 suggérées en encadré de mission — `pairDeDroites`/`formeEtendue`
 * couvrent des cas réels du programme absents de la liste initiale, voir `docs/historique-6e.md`
 * pour la justification détaillée) :
 * - `vide` : ∅.
 * - `point` : un point isolé (`x`,`y`).
 * - `droite` : une droite unique, équation `ax+by+c=0`.
 * - `pairDeDroites` : deux droites (ex. les 2 bissectrices d'un couple de droites, ou les 2
 *   droites parallèles supplémentaires obtenues au-delà du seuil critique en famille E) —
 *   distinctes de `droite` (nature qualitativement différente : 2 objets, pas 1).
 * - `cercle` : un cercle, centre (`cx`,`cy`) et rayon `r` (toujours choisi ENTIER à la génération —
 *   jamais de racine non simplifiable annoncée comme réponse attendue).
 * - `bandePleine` : une région PLEINE (bords compris) — la bande entre 2 droites parallèles à la
 *   distance critique, ou l'intérieur d'un carré à la distance critique (famille E, régime
 *   `k=seuil`) : `borne` décrit la demi-largeur (bande) ou le demi-côté (carré).
 * - `formeEtendue` : une forme étendue au-delà du seuil (losange/parallélogramme/octogone selon le
 *   sous-type de famille E) — `parametre` porte la valeur numérique clé de cette forme (ex. le
 *   sommet du losange, l'allongement de l'octogone au-delà du carré).
 */
export type TypeStatutLieu = "vide" | "point" | "droite" | "pairDeDroites" | "cercle" | "bandePleine" | "formeEtendue";

export interface DroiteEq {
  a: number;
  b: number;
  c: number;
}

export type StatutLieu =
  | { type: "vide" }
  | { type: "point"; x: number; y: number }
  | { type: "droite"; eq: DroiteEq }
  | { type: "pairDeDroites"; eq1: DroiteEq; eq2: DroiteEq }
  | { type: "cercle"; cx: number; cy: number; r: number }
  | { type: "bandePleine"; borne: number }
  | { type: "formeEtendue"; parametre: number };

// ============================================================================
// Famille A — Lieux définis par une équation à valeurs absolues (2-3 écrans, 3 sous-types).
// ============================================================================

/** Un "cas" de valeur absolue résolu : `label` la relation de signe (affichée, ex. "u⩾0, v⩾0"),
 * gabarit `ax+by=` (coefficients toujours ±1 par construction) et `c` la constante à trouver. */
export interface CasValeurAbsolue {
  label: string;
  a: number;
  b: number;
  c: number;
}

/** |αx+βy+γ|=k → 2 droites parallèles distinctes (α,β,γ,k tous donnés). Écran1 : nombre de cas
 * (=2). Écran2 : les 2 constantes `γ-k` et `γ+k` (gabarit `αx+βy+⬚=0` déjà affiché). */
export interface ExerciceLieuxA_Paralleles {
  famille: "A";
  sousType: "paralleles";
  alpha: number;
  beta: number;
  gamma: number;
  k: number;
  constante1: number;
  constante2: number;
}

/** |x-p|-|y-q|=k → lieu NON BORNÉ (4 rayons formant un "nœud papillon"), 4 cas selon signe(x-p),
 * signe(y-q). Écran1 : nombre de cas (=4). Écran2 : les 4 `cas` (gabarit `ax+by=` déjà affiché,
 * a,b∈{-1,1} donnés dans chaque `cas`, `c` à trouver). */
export interface ExerciceLieuxA_NonBorne {
  famille: "A";
  sousType: "nonBorne";
  p: number;
  q: number;
  k: number;
  cas: CasValeurAbsolue[];
}

/** |x-p|+|y-q|=k → LOSANGE borné, 4 sommets (p±k,q) et (p,q±k). Écran1 : nombre de cas (=4).
 * Écran2 : les 4 arêtes `cas` (mêmes gabarits que nonBorne, mais issus d'une SOMME). Écran3 :
 * assembler les 4 sommets (obtenus en annulant tour à tour chaque valeur absolue). */
export interface ExerciceLieuxA_Losange {
  famille: "A";
  sousType: "losange";
  p: number;
  q: number;
  k: number;
  cas: CasValeurAbsolue[];
  sommets: { x: number; y: number }[];
}

export type ExerciceLieuxA = ExerciceLieuxA_Paralleles | ExerciceLieuxA_NonBorne | ExerciceLieuxA_Losange;

// ============================================================================
// Famille B — Lieu depuis une condition de distance au carré, avec seuils (4 écrans uniformes,
// 6 sous-types). Écran3 est TOUJOURS présent mais son CONTENU diffère : pour les 3 sous-types
// SANS seuil (bissectrices/droite/cerclePerp), écran3 est un écran ALLÉGÉ qui fait confirmer
// explicitement qu'aucun seuil ne s'applique (piège central de la famille) plutôt qu'un vrai calcul
// de régime.
// ============================================================================

export interface ExerciceLieuxB_Bissectrices {
  famille: "B";
  sousType: "bissectrices";
  /** droites x+y=e1, x-y=e2 (normes égales — bissectrices obtenues SANS jamais développer de
   * carré, par simple égalité/opposition des deux expressions). */
  e1: number;
  e2: number;
  /** bissectrices : x=xBis, y=yBis. */
  xBis: number;
  yBis: number;
}

export interface ExerciceLieuxB_Droite {
  famille: "B";
  sousType: "droite";
  xa: number;
  ya: number;
  xb: number;
  yb: number;
  k: number;
  /** droite finale Ax+By+C=0. */
  A: number;
  B: number;
  C: number;
}

export interface ExerciceLieuxB_CerclePerp {
  famille: "B";
  sousType: "cerclePerp";
  /** droites perpendiculaires x=x0, y=y0 ; k>0 donné (rayon toujours entier par construction). */
  x0: number;
  y0: number;
  k: number;
  r: number;
  /** écran1 : constante obtenue en développant (x-x0)²+(y-y0)², = x0²+y0². */
  constanteEcran1: number;
  /** écran2 : x²+y²+Dx+Ey+F=0, D=-2x0, E=-2y0, F=x0²+y0²-k. */
  D: number;
  E: number;
  F: number;
}

export interface ExerciceLieuxB_Seuil2Points {
  famille: "B";
  sousType: "seuil2Points";
  xa: number;
  ya: number;
  xb: number;
  yb: number;
  k: number;
  /** seuil = d²/2 (d=|AB|), TOUJOURS entier par construction (xa,ya,xb,yb tous pairs). */
  seuil: number;
  regime: "cercle" | "point" | "vide";
  /** rayon du cercle final, UNIQUEMENT si regime==="cercle" (toujours entier). */
  rayon: number | null;
  /** écran1 : constantes xa²+ya² et xb²+yb² (issues du développement de chaque distance). */
  constanteA: number;
  constanteB: number;
  /** écran2 : x²+y²+Dx+Ey+F=0, D=-(xa+xb), E=-(ya+yb), F=(xa²+ya²+xb²+yb²-k)/2. */
  D: number;
  E: number;
  F: number;
}

export interface ExerciceLieuxB_Apollonius {
  famille: "B";
  sousType: "apollonius";
  /** A=(-a,0), B=(a,0). */
  a: number;
  casK1: boolean;
  /** k=1 si casK1 ; sinon k = (a+x0)/(x0-a) exact (triplet pythagoricien a²+r²=x0²). */
  k: { num: number; den: number };
  /** UNIQUEMENT si !casK1 : centre (x0,0), rayon r (triplet pythagoricien, toujours entiers). */
  x0: number | null;
  r: number | null;
  /** écran1 : coefficient de x dans le développement de PA² puis de PB² — casK1 : coefficient de
   * x² dans chacun (toujours 1,1, signale l'annulation) ; sinon coefficient de x (2a,-2a). */
  ecran1Val1: number;
  ecran1Val2: number;
  /** écran2 : casK1 → équation 4a·x=0 (coefficient unique, pas de terme constant) ; sinon
   * x²+y²+Dx+F=0 (E toujours nul par symétrie de la construction A=(-a,0),B=(a,0)). */
  ecran2CoefX: number;
  ecran2Constante: number | null;
}

export interface ExerciceLieuxB_SeuilCarre {
  famille: "B";
  sousType: "seuilCarre";
  /** carré [-c,c]×[-c,c] (c = demi-côté, toujours entier). */
  c: number;
  k: number;
  /** seuil = 4c² (somme minimale des 4 carrés de distances, atteinte au centre). */
  seuil: number;
  regime: "cercle" | "point" | "vide";
  rayon: number | null;
  /** écran1 : constante contribuée par UNE paire de côtés opposés, = 2c² ((x-c)²+(x+c)²=2x²+2c²). */
  constanteEcran1: number;
  /** écran2 (forme directe X²+Y²=... imposée par la mission pour ce sous-type) : RHS=(k-4c²)/2. */
  rhsEcran2: number;
}

export type ExerciceLieuxB = ExerciceLieuxB_Bissectrices | ExerciceLieuxB_Droite | ExerciceLieuxB_CerclePerp | ExerciceLieuxB_Seuil2Points | ExerciceLieuxB_Apollonius | ExerciceLieuxB_SeuilCarre;

// ============================================================================
// Famille C — Cercle depuis une équation quadratique (2 écrans, toujours le même sous-type).
// ============================================================================

/** m(x²+y²)+Dx+Ey+F=0 (m∈{1,2,3}). Écran1 : forme complétée m[(x+h)²+(y+k')²]=mR, valeurs
 * demandées h,k',R (R toujours un carré parfait par construction). Écran2 : centre (cx,cy)=(-h,-k')
 * et rayon r=√R. */
export interface ExerciceLieuxC {
  famille: "C";
  m: number;
  D: number;
  E: number;
  F: number;
  h: number;
  kPrime: number;
  R: number;
  cx: number;
  cy: number;
  r: number;
}

// ============================================================================
// Famille D — Éliminer un paramètre (3 écrans, 3 sous-types).
// ============================================================================

export type MethodeEliminationD = "substitution" | "fractions" | "ratio";

/** x=√t+p, y=qt+r (t⩾0). Élimination : t=(x-p)², substitution : y=q(x-p)²+r. */
export interface ExerciceLieuxD_Substitution {
  famille: "D";
  sousType: "substitution";
  p: number;
  q: number;
  r: number;
  /** t = x² + coefX·x + coefConst (coefX=-2p, coefConst=p²). */
  coefX: number;
  coefConst: number;
  /** équation finale y = Afinal·x² + Bfinal·x + Cfinal. */
  Afinal: number;
  Bfinal: number;
  Cfinal: number;
}

/** x=1/(t+a), y=(t+b)/(t+a) (t≠-a). y = (b-a)·x + 1. */
export interface ExerciceLieuxD_Fractions {
  famille: "D";
  sousType: "fractions";
  a: number;
  b: number;
  /** y = pente·x + 1. */
  pente: number;
}

/** x=a·t³, y=b·t². x²/y³ = a²/b³ (constante) → x² = C·y³. */
export interface ExerciceLieuxD_Ratio {
  famille: "D";
  sousType: "ratio";
  a: number;
  b: number;
  exposantX: number;
  exposantY: number;
  /** C = a²/b³, exact (fraction). */
  C: { num: number; den: number };
}

export type ExerciceLieuxD = ExerciceLieuxD_Substitution | ExerciceLieuxD_Fractions | ExerciceLieuxD_Ratio;

// ============================================================================
// Famille E — Lieu par seuil, somme de DISTANCES SIMPLES (pas au carré), 4 sous-types, nombre
// d'écrans VARIABLE : 4 pour les sous-types À seuil (paralleles/carre), 2 pour les sous-types SANS
// seuil (perpendiculaires/secantes — écran2 ET écran3 réellement SAUTÉS, pas seulement allégés,
// contrairement à la famille B — voir mission).
// ============================================================================

export interface ExerciceLieuxE_Paralleles {
  famille: "E";
  sousType: "paralleles";
  /** droites x=0, x=d (d>0 = seuil = distance entre les 2 droites). */
  d: number;
  k: number;
  regime: "vide" | "bandePleine" | "pairDeDroites";
  /** UNIQUEMENT si regime==="pairDeDroites" : les 2 nouvelles droites x=xGauche, x=xDroite. */
  xGauche: number | null;
  xDroite: number | null;
}

/** dist(P,x=0)+dist(P,y=0)=k → TOUJOURS un losange (aucun seuil), sommets (±k,0),(0,±k). */
export interface ExerciceLieuxE_Perpendiculaires {
  famille: "E";
  sousType: "perpendiculaires";
  k: number;
}

/** droites a: y=0, b: 3x-4y=0 (normalisée, norme 5) — TOUJOURS un parallélogramme (aucun seuil),
 * diagonales portées par a et b, sommets (±5k/3,0) et (±4k/3,±k) (k multiple de 3). */
export interface ExerciceLieuxE_Secantes {
  famille: "E";
  sousType: "secantes";
  k: number;
  sommets: { x: number; y: number }[];
}

export interface ExerciceLieuxE_Carre {
  famille: "E";
  sousType: "carre";
  /** carré [-c,c]×[-c,c] (c = demi-côté). */
  c: number;
  k: number;
  /** seuil = 4c (somme minimale des 4 distances, atteinte au centre). */
  seuil: number;
  regime: "vide" | "bandePleine" | "formeEtendue";
  /** UNIQUEMENT si regime==="formeEtendue" : m=k/2-c, la coordonnée (>c) des 8 sommets de
   * l'octogone — 4 sommets (±m,±c), 4 sommets (±c,±m). */
  m: number | null;
}

export type ExerciceLieuxE = ExerciceLieuxE_Paralleles | ExerciceLieuxE_Perpendiculaires | ExerciceLieuxE_Secantes | ExerciceLieuxE_Carre;

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceLieuxGeometriquesParametres = ExerciceLieuxA | ExerciceLieuxB | ExerciceLieuxC | ExerciceLieuxD | ExerciceLieuxE;

export type FamilleLieuxGeometriquesParametres = ExerciceLieuxGeometriquesParametres["famille"];
