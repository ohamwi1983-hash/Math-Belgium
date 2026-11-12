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
// Fonctions polynomiales partagées (familles A et B) — cubiques construites par leur FORME
// (audit 5c5a, point 20) : extremums placés dans [−3 ; 3] avec une amplitude qui occupe une part
// lisible de la fenêtre [−4 ; 4], ou cubique monotone à courbure visible. Les coefficients ne sont
// jamais affichés (seuls les graphes le sont) : ils peuvent être décimaux.
// ============================================================================

const X_FENETRE = 4;

/** Caractéristiques lisibles d'une cubique — sert à la fois à rédiger l'énoncé verbal (famille B)
 * et à rejeter deux éléments indiscernables (familles A et B). */
export interface FormeCubique {
  /** Signe du coefficient dominant. */
  signe: 1 | -1;
  /** Abscisses des deux extremums, triées — absent pour une cubique monotone. */
  extremums?: [number, number];
  /** Abscisse du point d'inflexion. */
  inflexion: number;
  /** Ordonnée à l'origine f(0). */
  f0: number;
}

function etendueSurFenetre(coeffs: PolynomeAssociation): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i <= 160; i++) {
    const x = -X_FENETRE + (2 * X_FENETRE * i) / 160;
    const y = evaluerPolynome(coeffs, x);
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return { min, max };
}

function demiEntier(min: number, max: number): number {
  return entierAleatoire(min * 2, max * 2) / 2;
}

/** Cubique à deux extremums en r1 < r2 : f'(x) = 3a(x − r1)(x − r2). Rejet tant que la « bosse »
 * entre les deux extremums n'occupe pas au moins 30 % de la hauteur de la fenêtre. */
function tirerCubiqueDeuxExtremums(): PolynomeAssociation {
  for (let essai = 0; essai < 400; essai++) {
    const r1 = demiEntier(-3, 2);
    const r2 = demiEntier(-2, 3);
    if (r2 - r1 < 2.5) continue;
    if (Math.abs(r1) < 0.5 || Math.abs(r2) < 0.5) continue;
    const a = [-1, -0.5, 0.5, 1][entierAleatoire(0, 3)];
    const sans = [0, 3 * a * r1 * r2, -1.5 * a * (r1 + r2), a];
    const amplitude = Math.abs(evaluerPolynome(sans, r1) - evaluerPolynome(sans, r2));
    const { min, max } = etendueSurFenetre(sans);
    if (amplitude < 0.3 * (max - min)) continue;
    return [choisirOrdonneeOrigine(max - min), sans[1], sans[2], sans[3]];
  }
  return [2, -12, 0, 1]; // x³ − 12x + 2 : extremums en ±2, toujours lisible
}

/** Cubique monotone : f'(x) = 3a((x − m)² + q), q > 0 — inflexion en m, palier « adouci » visible. */
function tirerCubiqueMonotone(): PolynomeAssociation {
  for (let essai = 0; essai < 400; essai++) {
    const m = demiEntier(-2, 2);
    if (Math.abs(m) < 1 && m !== 0) continue;
    const q = [0.5, 1, 1.5][entierAleatoire(0, 2)];
    const a = [-1, -0.5, 0.5, 1][entierAleatoire(0, 3)];
    // a((x−m)³ + 3q(x−m)) développé, sans terme constant (ajouté ensuite).
    const sans = [0, a * (3 * m * m + 3 * q), -3 * a * m, a];
    const { min, max } = etendueSurFenetre(sans);
    if (max - min <= 0) continue;
    return [choisirOrdonneeOrigine(max - min), sans[1], sans[2], sans[3]];
  }
  return [1, 3, 0, 1];
}

/** Ordonnée à l'origine nettement au-dessus, en dessous, ou exactement à l'origine (un tiers des
 * cas chacun) — pour que « coupe l'axe des ordonnées au-dessus de l'origine » se lise sur le
 * graphe. */
function choisirOrdonneeOrigine(etendue: number): number {
  const signe = entierAleatoire(-1, 1);
  if (signe === 0) return 0;
  const valeur = Math.max(1, Math.round(etendue * (0.12 + 0.18 * Math.random())));
  return signe * valeur;
}

function genererCubique(): PolynomeAssociation {
  return Math.random() < 0.7 ? tirerCubiqueDeuxExtremums() : tirerCubiqueMonotone();
}

/** Racines réelles distinctes de Ax²+Bx+C, triées — tableau vide si discriminant ≤ 0. */
function racinesQuadratique(A: number, B: number, C: number): number[] {
  const disc = B * B - 4 * A * C;
  if (disc <= 1e-9) return [];
  const sq = Math.sqrt(disc);
  return [(-B - sq) / (2 * A), (-B + sq) / (2 * A)].sort((x, y) => x - y);
}

export function formeCubique(coeffs: PolynomeAssociation): FormeCubique {
  const [d, c, b, a] = coeffs;
  const racines = racinesQuadratique(3 * a, 2 * b, c);
  return {
    signe: a > 0 ? 1 : -1,
    extremums: racines.length === 2 ? [racines[0], racines[1]] : undefined,
    inflexion: -b / (3 * a),
    f0: d,
  };
}

function signeLisible(x: number): -1 | 0 | 1 {
  if (Math.abs(x) < 1e-9) return 0;
  return x > 0 ? 1 : -1;
}

/** Signature de ce que l'énoncé verbal décrit (famille B) — deux éléments de même signature
 * auraient le même énoncé : rejetés au tirage. */
function signatureVerbale(forme: FormeCubique): string {
  const position = forme.extremums ? `${signeLisible(forme.extremums[0])}${signeLisible(forme.extremums[1])}` : `i${signeLisible(forme.inflexion)}`;
  return `${forme.signe}|${position}|${signeLisible(forme.f0)}`;
}

/** Signature de la dérivée (famille A) — deux f de même f' (ou de f' indiscernables : mêmes zéros
 * et même sens) sont rejetées au tirage. */
function signatureDerivee(coeffs: PolynomeAssociation): string {
  const forme = formeCubique(coeffs);
  const position = forme.extremums ? forme.extremums.map((r) => r.toFixed(2)).join(";") : `m${forme.inflexion.toFixed(2)}`;
  return `${forme.signe}|${position}`;
}

function tirerCubiquesDistinctes(n: number, signature: (c: PolynomeAssociation) => string): PolynomeAssociation[] {
  const resultat: PolynomeAssociation[] = [];
  const vues = new Set<string>();
  let essais = 0;
  while (resultat.length < n) {
    const c = genererCubique();
    const sig = signature(c);
    essais += 1;
    if (vues.has(sig) && essais < 2000) continue;
    vues.add(sig);
    resultat.push(c);
  }
  return resultat;
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
  const fonctions = tirerCubiquesDistinctes(n, signatureDerivee);
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

function cote(x: number): string {
  return x < 0 ? "à gauche de l'axe des ordonnées" : "à droite de l'axe des ordonnées";
}

/** Énoncé verbal DISCRIMINANT (audit 5c5a, points 1 à 3) : sens de variation complet et juste
 * selon le signe de a, position des extremums (ou du point d'inflexion pour une cubique monotone)
 * par rapport à l'axe des ordonnées, position de f(0) — puis la concavité. Deux éléments d'un même
 * exercice n'ont jamais la même description (`signatureVerbale`). */
export function genererEnonceVerbal(coeffs: PolynomeAssociation): string {
  const forme = formeCubique(coeffs);
  const croissanteDabord = forme.signe > 0;
  const phrases: string[] = [];

  if (forme.extremums) {
    const [r1, r2] = forme.extremums;
    phrases.push(
      croissanteDabord
        ? "De gauche à droite, f croît jusqu'à un maximum, décroît jusqu'à un minimum, puis croît à nouveau."
        : "De gauche à droite, f décroît jusqu'à un minimum, croît jusqu'à un maximum, puis décroît à nouveau.",
    );
    const premier = croissanteDabord ? "maximum" : "minimum";
    const second = croissanteDabord ? "minimum" : "maximum";
    if (r1 < 0 && r2 < 0) phrases.push("Ses deux extremums sont situés à gauche de l'axe des ordonnées.");
    else if (r1 > 0 && r2 > 0) phrases.push("Ses deux extremums sont situés à droite de l'axe des ordonnées.");
    else phrases.push(`Son ${premier} est ${cote(r1)}, son ${second} ${cote(r2)}.`);
  } else {
    phrases.push(croissanteDabord ? "f est croissante sur tout le graphique, sans aucun extremum." : "f est décroissante sur tout le graphique, sans aucun extremum.");
    const i = signeLisible(forme.inflexion);
    phrases.push(i === 0 ? "Son point d'inflexion est sur l'axe des ordonnées." : `Son point d'inflexion est ${cote(forme.inflexion)}.`);
  }

  const s0 = signeLisible(forme.f0);
  phrases.push(
    s0 === 0
      ? "Sa courbe passe par l'origine du repère."
      : s0 > 0
        ? "Sa courbe coupe l'axe des ordonnées au-dessus de l'origine."
        : "Sa courbe coupe l'axe des ordonnées en dessous de l'origine.",
  );
  phrases.push(croissanteDabord ? "Elle est concave (tournée vers le bas) puis convexe (tournée vers le haut)." : "Elle est convexe (tournée vers le haut) puis concave (tournée vers le bas).");
  return phrases.join(" ");
}

export function genererExerciceGrapheVerbal(nombreForce?: number): ExerciceAssociationGrapheVerbal {
  const n = tirerNombreElements(nombreForce);
  const fonctions = tirerCubiquesDistinctes(n, (c) => signatureVerbale(formeCubique(c)));
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
  let c = entierNonNul(-3, 3);
  let d = entierAleatoire(-4, 4);
  // Jamais un facteur multiplié par lui-même (ou par un multiple de lui-même) : ce serait un
  // carré déguisé (audit 5c5a, point 4).
  while (a * d === b * c) {
    c = entierNonNul(-3, 3);
    d = entierAleatoire(-4, 4);
  }
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
  // Jamais deux dérivées identiques ni deux f identiques dans un même exercice (audit 5c5a, point 4).
  const paires: PaireSymbolique[] = [];
  for (let essai = 0; paires.length < n; essai++) {
    const p = GENERATEURS_PAIRE_SYMBOLIQUE[entierAleatoire(0, GENERATEURS_PAIRE_SYMBOLIQUE.length - 1)]();
    if (essai < 500 && paires.some((q) => q.gLatex === p.gLatex || q.fLatex === p.fLatex)) continue;
    paires.push(p);
  }
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
