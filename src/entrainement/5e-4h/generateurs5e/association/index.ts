/**
 * Couche A (5e) — génération pour 5gen25 ("Association graphique/mots ↔ signe de f'/f''"). 3
 * familles STRUCTURELLEMENT DISJOINTES tirées à fréquence comparable — voir
 * `core5e/association.types.ts` pour le contrat complet. N'importe jamais rien de `moteur5e/`.
 *
 * Réutilise DIRECTEMENT `formatPolynomeLatex`/`evaluerPolynome` (`generateurs5e/domaineDefinition/
 * polynome.ts`, Couche A ↔ Couche A autorisé) pour tout affichage/évaluation de polynôme.
 */
import { evaluerPolynome, formatPolynomeLatex } from "../domaineDefinition/polynome";
import { estCategorie1 } from "../../core5e/association.types";
import type {
  CaracteristiqueAssociation,
  ExerciceAssociation,
  ExerciceAssociationGrapheDerivee,
  ExerciceAssociationGrapheDeriveeAvancee,
  ExerciceAssociationGrapheVerbal,
  ExerciceAssociationSymbolique,
  FonctionRicheAssociation,
  PolynomeAssociation,
  TypeCaracteristiqueAssociation,
} from "../../core5e/association.types";

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function entierNonNul(min: number, max: number): number {
  let v = 0;
  while (v === 0) v = entierAleatoire(min, max);
  return v;
}

function melanger<T>(arr: T[]): T[] {
  const copie = [...arr];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Dérangement (permutation sans point fixe) de `[0..n-1]` — jamais l'identité, garantit que
 * "l'ordre des lettres ne correspond jamais trivialement à l'ordre des numéros" pour AUCUN élément
 * (pas seulement globalement). Rejet borné, repli déterministe (rotation cyclique, toujours un
 * dérangement pour n≥2). */
export function tirerDerangement(n: number): number[] {
  if (n < 2) return Array.from({ length: n }, (_, i) => i);
  for (let tentative = 0; tentative < 50; tentative++) {
    const perm = melanger(Array.from({ length: n }, (_, i) => i));
    if (perm.every((v, i) => v !== i)) return perm;
  }
  return Array.from({ length: n }, (_, i) => (i + 1) % n);
}

function tirerNombreElements(force?: number): number {
  return force ?? entierAleatoire(3, 5);
}

// ============================================================================
// Fonctions polynomiales partagées (familles A et B) — cubiques a≠0, coefficients petits.
// ============================================================================

function genererCubique(): PolynomeAssociation {
  const a = entierNonNul(-2, 2);
  const b = entierAleatoire(-3, 3);
  const c = entierAleatoire(-5, 5);
  const d = entierAleatoire(-3, 3);
  return [d, c, b, a];
}

/** Dérivée d'un polynôme (coefficients ascendants) — formule puissance terme à terme. */
export function derivee(coeffs: PolynomeAssociation): PolynomeAssociation {
  const r: number[] = [];
  for (let deg = 1; deg < coeffs.length; deg++) r.push(coeffs[deg] * deg);
  return r.length > 0 ? r : [0];
}

// ============================================================================
// Famille A — graphique de f ↔ graphique de f'.
// ============================================================================

export function genererExerciceGrapheDerivee(nombreForce?: number): ExerciceAssociationGrapheDerivee {
  const n = tirerNombreElements(nombreForce);
  const fonctions = Array.from({ length: n }, () => genererCubique());
  return { famille: "grapheDerivee", fonctions, ordreLettres: tirerDerangement(n) };
}

// ============================================================================
// Famille A avancée — richesse graphique (points anguleux/rebroussement/tangente verticale,
// asymptotes/discontinuités/points vides). Voir core5e/association.types.ts pour le contrat et le
// choix de conception (togglable indépendamment du tirage de base, jamais dans POIDS ci-dessous).
// ============================================================================

const TOUTES_CARACTERISTIQUES: TypeCaracteristiqueAssociation[] = ["angulaire", "cuspide", "tangenteVerticale", "asymptoteVerticale", "discontinuite", "pointVide"];

/** Fenêtre d'affichage commune à tous les graphes de la famille A avancée — voir
 * `FonctionRicheAssociationGraph.tsx`. Position toujours tirée strictement à l'intérieur, avec une
 * marge, pour ne jamais coller au bord affiché. */
export const X_MIN_AVANCEE = -4;
export const X_MAX_AVANCEE = 4;
const MARGE_POSITION = 1;

function genererBaseAvancee(): PolynomeAssociation {
  // Degré ≤ 2, coefficients modestes — laisse la caractéristique ajoutée bien visible plutôt que
  // noyée dans une forte courbure de fond.
  return [entierAleatoire(-2, 2), entierAleatoire(-1, 1), entierAleatoire(-1, 1)];
}

function genererCaracteristique(force?: TypeCaracteristiqueAssociation): CaracteristiqueAssociation {
  const type = force ?? TOUTES_CARACTERISTIQUES[entierAleatoire(0, TOUTES_CARACTERISTIQUES.length - 1)];
  const position = entierAleatoire((X_MIN_AVANCEE + MARGE_POSITION) * 10, (X_MAX_AVANCEE - MARGE_POSITION) * 10) / 10;
  const intensite = [1, 1.5, 2][entierAleatoire(0, 2)];
  return { type, position, intensite };
}

/** Valeur ajoutée par la caractéristique — 0 si absente. Catégorie 1 (angulaire/cuspide/
 * tangenteVerticale) : f reste DÉFINIE en `position` (juste non dérivable) — jamais d'exclusion de
 * domaine pour f elle-même, contrairement à la catégorie 2. */
function evaluerCaracteristique(c: CaracteristiqueAssociation, x: number): number {
  const { type, position: p, intensite: A } = c;
  switch (type) {
    case "angulaire":
      return A * Math.abs(x - p);
    case "cuspide":
      return A * Math.sqrt(Math.abs(x - p));
    case "tangenteVerticale":
      return A * Math.cbrt(x - p);
    case "asymptoteVerticale":
      return A / (x - p);
    case "discontinuite":
      return x > p ? A : 0;
    case "pointVide":
      return 0;
  }
}

export function evaluerFonctionRiche(f: FonctionRicheAssociation, x: number): number {
  return evaluerPolynome(f.base, x) + (f.caracteristique ? evaluerCaracteristique(f.caracteristique, x) : 0);
}

/** Dérivée analytique de la caractéristique seule (fonction construite à dessein, jamais besoin
 * d'une différence finie) :
 * - angulaire : `A·|x-p|` ⟹ dérivée `A·signe(x-p)` — deux valeurs finies distinctes de part et
 *   d'autre de p, AUCUNE valeur en p lui-même.
 * - cuspide : `A·√|x-p|` ⟹ dérivée `A·signe(x-p) / (2√|x-p|)` — diverge vers +∞ d'un côté et -∞ de
 *   l'autre en s'approchant de p.
 * - tangenteVerticale : `A·∛(x-p)` ⟹ dérivée `A / (3·∛(x-p)²)` — le carré rend le dénominateur
 *   toujours positif, donc diverge vers +∞ des DEUX côtés (contrairement à la cuspide).
 * - asymptoteVerticale : `A/(x-p)` ⟹ dérivée `-A/(x-p)²`.
 * - discontinuite/pointVide : la caractéristique ajoutée est localement constante de chaque côté
 *   (un simple décalage, ou rien du tout) — dérivée nulle, seule l'exclusion de domaine importe. */
function deriveeCaracteristique(c: CaracteristiqueAssociation, x: number): number {
  const { type, position: p, intensite: A } = c;
  switch (type) {
    case "angulaire":
      return A * Math.sign(x - p);
    case "cuspide":
      return (A * Math.sign(x - p)) / (2 * Math.sqrt(Math.abs(x - p)));
    case "tangenteVerticale": {
      const u = Math.cbrt(x - p);
      return A / (3 * u * u);
    }
    case "asymptoteVerticale":
      return -A / ((x - p) * (x - p));
    case "discontinuite":
    case "pointVide":
      return 0;
  }
}

export function evaluerDeriveeFonctionRiche(f: FonctionRicheAssociation, x: number): number {
  const derBase = evaluerPolynome(derivee(f.base), x);
  return derBase + (f.caracteristique ? deriveeCaracteristique(f.caracteristique, x) : 0);
}

/** Exclusion de domaine pour f ELLE-MÊME — `null` si aucune caractéristique, ou si elle est
 * catégorie 1 (f reste définie, juste non dérivable en `position`). */
export function exclusionAffichageF(f: FonctionRicheAssociation): number | null {
  if (!f.caracteristique) return null;
  return estCategorie1(f.caracteristique.type) ? null : f.caracteristique.position;
}

/** Exclusion de domaine pour f' — TOUJOURS `position` dès qu'une caractéristique existe, catégorie
 * 1 comprise : f' elle-même diverge ou saute en ce point (voir `deriveeCaracteristique`), qu'elle
 * soit dessinée comme réponse plausible (catégorie 2) ou comme distracteur (catégorie 1, jamais la
 * bonne réponse d'aucun élément — voir `core5e/association.types.ts`). */
export function exclusionAffichageDerivee(f: FonctionRicheAssociation): number | null {
  return f.caracteristique ? f.caracteristique.position : null;
}

export function genererExerciceGrapheDeriveeAvancee(nombreForce?: number, caracteristiqueForceePremierElement?: TypeCaracteristiqueAssociation): ExerciceAssociationGrapheDeriveeAvancee {
  const n = tirerNombreElements(nombreForce);
  const fonctions: FonctionRicheAssociation[] = Array.from({ length: n }, (_, i) => {
    if (i === 0 && caracteristiqueForceePremierElement) {
      return { base: genererBaseAvancee(), caracteristique: genererCaracteristique(caracteristiqueForceePremierElement) };
    }
    const avecCaracteristique = Math.random() < 0.7;
    return { base: genererBaseAvancee(), caracteristique: avecCaracteristique ? genererCaracteristique() : undefined };
  });
  const singulier = fonctions.map((f) => !!f.caracteristique && estCategorie1(f.caracteristique.type));
  return { famille: "grapheDeriveeAvancee", fonctions, singulier, ordreLettres: tirerDerangement(n) };
}

// ============================================================================
// Famille B — graphique de f ↔ énoncé verbal.
// ============================================================================

/** Racines réelles distinctes de Ax²+Bx+C, triées — tableau vide si discriminant ≤0 (aucun
 * changement de signe réel, y compris le cas limite d'une racine double, rarissime avec des
 * coefficients entiers petits, traité comme "pas de changement de signe" — mathématiquement
 * correct dans les deux cas). */
function racinesQuadratique(A: number, B: number, C: number): number[] {
  const disc = B * B - 4 * A * C;
  if (disc <= 1e-9) return [];
  const sq = Math.sqrt(disc);
  return [(-B - sq) / (2 * A), (-B + sq) / (2 * A)].sort((x, y) => x - y);
}

const GABARITS_MONOTONE = [
  (sens: string) => `Cette fonction est ${sens} sur tout son domaine, sans jamais changer de sens de variation.`,
  (sens: string) => `f ${sens === "croissante" ? "croît" : "décroît"} continuellement de gauche à droite du graphique.`,
];

const GABARITS_DEUX_EXTREMA = [
  (premier: string, second: string) => `En parcourant le graphique de gauche à droite, f ${premier} d'abord, puis ${second}, puis recroît.`,
  (premier: string, second: string) => `La fonction présente deux extremums : elle ${premier} jusqu'au premier, puis ${second} jusqu'au second.`,
];

const GABARITS_CONCAVITE = [
  (avant: string, apres: string) => `Sa concavité change une seule fois : ${avant} avant le point d'inflexion, ${apres} après.`,
  (avant: string, apres: string) => `La courbe est ${avant} puis ${apres}, avec un point d'inflexion entre les deux.`,
];

function genererEnonceVerbal(coeffs: PolynomeAssociation): string {
  const [, c, b, a] = coeffs;
  const racines = racinesQuadratique(3 * a, 2 * b, c);
  const concaveApres = a > 0; // f''(x)=6ax+2b : négatif avant x0, positif après, si a>0
  const texteConcavite = melanger(GABARITS_CONCAVITE)[0](concaveApres ? "concave (tournée vers le bas)" : "convexe (tournée vers le haut)", concaveApres ? "convexe (tournée vers le haut)" : "concave (tournée vers le bas)");

  if (racines.length === 0) {
    const sens = a > 0 ? "croissante" : "décroissante";
    return `${melanger(GABARITS_MONOTONE)[0](sens)} ${texteConcavite}`;
  }

  const premier = a > 0 ? "croît jusqu'à un maximum" : "décroît jusqu'à un minimum";
  const second = a > 0 ? "décroît jusqu'à un minimum" : "croît jusqu'à un maximum";
  return `${melanger(GABARITS_DEUX_EXTREMA)[0](premier, second)} ${texteConcavite}`;
}

export function genererExerciceGrapheVerbal(nombreForce?: number): ExerciceAssociationGrapheVerbal {
  const n = tirerNombreElements(nombreForce);
  const fonctions = Array.from({ length: n }, () => genererCubique());
  const ordreLettres = tirerDerangement(n);
  const enonces = ordreLettres.map((i) => genererEnonceVerbal(fonctions[i]));
  return { famille: "grapheVerbal", fonctions, enonces, ordreLettres };
}

// ============================================================================
// Famille C — fonction f ↔ dérivée g (symbolique, formes simples).
// ============================================================================

function formatCoeffFacteurLatex(coeff: number, groupeLatex: string): string {
  if (coeff === 1) return groupeLatex;
  if (coeff === -1) return `-${groupeLatex}`;
  return `${coeff}${groupeLatex}`;
}

interface PaireSymbolique {
  fLatex: string;
  gLatex: string;
}

function genererPaireMonomiale(): PaireSymbolique {
  const coeff = entierNonNul(-4, 4);
  const n = entierAleatoire(2, 4);
  const monome = new Array(n + 1).fill(0);
  monome[n] = coeff;
  const derive = new Array(n).fill(0);
  derive[n - 1] = coeff * n;
  return { fLatex: formatPolynomeLatex(monome), gLatex: formatPolynomeLatex(derive) };
}

/** Parenthèse `lin` UNIQUEMENT s'il s'agit d'une expression composée — jamais autour du symbole nu
 * "x" (seule sortie possible de `formatPolynomeLatex` pour un binôme trivial a=1,b=0), qui donnerait
 * "(x)" superflu (audit transversal, `promptauditparenthesessuperflues.md`). */
function parentheserSiComposite(lin: string): string {
  return lin === "x" ? lin : `(${lin})`;
}

function genererPaireProduit(): PaireSymbolique {
  const a = entierNonNul(-3, 3);
  const b = entierAleatoire(-4, 4);
  const c = entierNonNul(-3, 3);
  const d = entierAleatoire(-4, 4);
  const lin1 = formatPolynomeLatex([b, a]);
  const lin2 = formatPolynomeLatex([d, c]);
  const derive = formatPolynomeLatex([a * d + b * c, 2 * a * c]);
  return { fLatex: `${parentheserSiComposite(lin1)}${parentheserSiComposite(lin2)}`, gLatex: derive };
}

function genererPaireCarre(): PaireSymbolique {
  const a = entierNonNul(-3, 3);
  const b = entierAleatoire(-4, 4);
  const lin = formatPolynomeLatex([b, a]);
  const groupe = parentheserSiComposite(lin);
  return { fLatex: `${groupe}^2`, gLatex: formatCoeffFacteurLatex(2 * a, groupe) };
}

function genererPaireCube(): PaireSymbolique {
  const a = entierNonNul(-2, 2);
  const b = entierAleatoire(-3, 3);
  const lin = formatPolynomeLatex([b, a]);
  const groupe = parentheserSiComposite(lin);
  return { fLatex: `${groupe}^3`, gLatex: formatCoeffFacteurLatex(3 * a, `${groupe}^2`) };
}

const GENERATEURS_PAIRE_SYMBOLIQUE = [genererPaireMonomiale, genererPaireProduit, genererPaireCarre, genererPaireCube];

export function genererExerciceSymbolique(nombreForce?: number): ExerciceAssociationSymbolique {
  const n = tirerNombreElements(nombreForce);
  const paires = Array.from({ length: n }, () => GENERATEURS_PAIRE_SYMBOLIQUE[entierAleatoire(0, GENERATEURS_PAIRE_SYMBOLIQUE.length - 1)]());
  const fLatex = paires.map((p) => p.fLatex);
  const ordreLettres = tirerDerangement(n);
  const gLatex = ordreLettres.map((i) => paires[i].gLatex);
  return { famille: "symbolique", fLatex, gLatex, ordreLettres };
}

// ============================================================================
// Dispatch + panneau dev.
// ============================================================================

const POIDS: [ExerciceAssociation["famille"], number][] = [
  ["grapheDerivee", 1],
  ["grapheVerbal", 1],
  ["symbolique", 1],
];

export function genererExerciceAssociation(familleForcee?: ExerciceAssociation["famille"]): ExerciceAssociation {
  const famille =
    familleForcee ??
    (() => {
      const total = POIDS.reduce((s, [, p]) => s + p, 0);
      let r = Math.random() * total;
      for (const [f, p] of POIDS) {
        if (r < p) return f;
        r -= p;
      }
      return "grapheDerivee";
    })();
  if (famille === "grapheDerivee") return genererExerciceGrapheDerivee();
  if (famille === "grapheVerbal") return genererExerciceGrapheVerbal();
  return genererExerciceSymbolique();
}

export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "grapheDerivee-3", label: "A — Graphe f ↔ graphe f' (3 éléments)" },
  { id: "grapheDerivee-5", label: "A — Graphe f ↔ graphe f' (5 éléments)" },
  { id: "grapheVerbal-3", label: "B — Graphe f ↔ énoncé verbal (3 éléments)" },
  { id: "grapheVerbal-5", label: "B — Graphe f ↔ énoncé verbal (5 éléments)" },
  { id: "symbolique-3", label: "C — f ↔ f' symbolique (3 éléments)" },
  { id: "symbolique-5", label: "C — f ↔ f' symbolique (5 éléments)" },
  { id: "grapheDeriveeAvancee-mixte", label: "A avancé — mixte (aléatoire)" },
  { id: "grapheDeriveeAvancee-angulaire", label: "A avancé — point anguleux (catégorie 1)" },
  { id: "grapheDeriveeAvancee-cuspide", label: "A avancé — point de rebroussement (catégorie 1)" },
  { id: "grapheDeriveeAvancee-tangenteVerticale", label: "A avancé — tangente verticale (catégorie 1)" },
  { id: "grapheDeriveeAvancee-asymptoteVerticale", label: "A avancé — asymptote verticale (catégorie 2)" },
  { id: "grapheDeriveeAvancee-discontinuite", label: "A avancé — discontinuité (catégorie 2)" },
  { id: "grapheDeriveeAvancee-pointVide", label: "A avancé — point vide (catégorie 2)" },
];

export function construireAvecFamilleId(id: string): ExerciceAssociation {
  switch (id) {
    case "grapheDerivee-3":
      return genererExerciceGrapheDerivee(3);
    case "grapheDerivee-5":
      return genererExerciceGrapheDerivee(5);
    case "grapheVerbal-3":
      return genererExerciceGrapheVerbal(3);
    case "grapheVerbal-5":
      return genererExerciceGrapheVerbal(5);
    case "symbolique-3":
      return genererExerciceSymbolique(3);
    case "symbolique-5":
      return genererExerciceSymbolique(5);
    case "grapheDeriveeAvancee-mixte":
      return genererExerciceGrapheDeriveeAvancee(4);
    case "grapheDeriveeAvancee-angulaire":
      return genererExerciceGrapheDeriveeAvancee(3, "angulaire");
    case "grapheDeriveeAvancee-cuspide":
      return genererExerciceGrapheDeriveeAvancee(3, "cuspide");
    case "grapheDeriveeAvancee-tangenteVerticale":
      return genererExerciceGrapheDeriveeAvancee(3, "tangenteVerticale");
    case "grapheDeriveeAvancee-asymptoteVerticale":
      return genererExerciceGrapheDeriveeAvancee(3, "asymptoteVerticale");
    case "grapheDeriveeAvancee-discontinuite":
      return genererExerciceGrapheDeriveeAvancee(3, "discontinuite");
    case "grapheDeriveeAvancee-pointVide":
      return genererExerciceGrapheDeriveeAvancee(3, "pointVide");
    default:
      throw new Error(`construireAvecFamilleId : id inconnu "${id}"`);
  }
}

export { evaluerPolynome };
