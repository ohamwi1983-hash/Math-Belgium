/**
 * Couche A (5e) — génération pour 5gen27 ("Fonction dérivée"), 3e générateur du chapitre "Dérivées
 * et applications". 4 familles structurelles (`reglebase`/`produit`/`quotient`/`composee`), tirées
 * à fréquence comparable — voir `core5e/fonctionDerivee.types.ts` pour le contrat complet.
 * N'importe jamais rien de `moteur5e/`.
 *
 * `valeurAtome`/`valeurFonction` (évaluation numérique pure) sont volontairement RÉPLIQUÉS (jamais
 * importés) dans `moteur5e/verificationFonctionDerivee.ts` — règle non négociable CLAUDE.md,
 * `moteur5e/` n'importe jamais `generateurs5e/`.
 *
 * Réutilise DIRECTEMENT `entierAleatoire`/`entierNonNul`/`reduireFraction`
 * (`generateurs5e/limites/fraction.ts`, Couche A ↔ Couche A autorisé).
 */
import type {
  AtomeDerivable,
  DecompositionAttendue,
  ExerciceFonctionDerivee,
  ExerciceFonctionDeriveeComposee,
  ExerciceFonctionDeriveeProduit,
  ExerciceFonctionDeriveeQuotient,
  ExerciceFonctionDeriveeReglebase,
  NoyauDerivable,
  TypeDerivee,
} from "../../core5e/fonctionDerivee.types";
import { entierAleatoire, entierNonNul, reduireFraction } from "../limites/fraction";
import { formatPolynomeLatex } from "../domaineDefinition/polynome";

// ============================================================================
// Atome — valeur/dérivée numériques pures (RÉPLIQUÉES telles quelles côté moteur5e).
// ============================================================================

export function valeurAtome(atome: AtomeDerivable, x: number): number {
  const u = atome.interieurA * x + atome.interieurB;
  switch (atome.noyau.type) {
    case "monome":
      return atome.coeff * Math.pow(u, atome.noyau.exposant);
    case "racine":
      return atome.coeff * Math.sqrt(u);
    case "trig":
      return atome.noyau.fonction === "sin" ? atome.coeff * Math.sin(u) : atome.coeff * Math.cos(u);
  }
}

/** Dérivée fermée de l'atome (règle de chaîne intégrée via `du=interieurA`, constant). */
export function deriveeAtome(atome: AtomeDerivable, x: number): number {
  const u = atome.interieurA * x + atome.interieurB;
  const du = atome.interieurA;
  switch (atome.noyau.type) {
    case "monome": {
      const n = atome.noyau.exposant;
      return atome.coeff * n * Math.pow(u, n - 1) * du;
    }
    case "racine":
      return (atome.coeff * du) / (2 * Math.sqrt(u));
    case "trig":
      return atome.noyau.fonction === "sin" ? atome.coeff * Math.cos(u) * du : -atome.coeff * Math.sin(u) * du;
  }
}

export function valeurFonction(exercice: ExerciceFonctionDerivee, x: number): number {
  switch (exercice.famille) {
    case "reglebase":
      return exercice.atomes.reduce((s, a) => s + valeurAtome(a, x), 0);
    case "produit":
      return valeurAtome(exercice.atome1, x) * valeurAtome(exercice.atome2, x);
    case "quotient":
      if (exercice.ambigu) {
        const u = exercice.a * x + exercice.b;
        const t = exercice.trig === "sin" ? Math.sin(u) : Math.cos(u);
        return 1 / (t * t);
      }
      return valeurAtome(exercice.atome1, x) / valeurAtome(exercice.atome2, x);
    case "composee":
      return valeurAtome(exercice.atome, x);
  }
}

/** f'(x) EXACT (formule fermée numérique), utilisé UNIQUEMENT pour l'auto-cohérence LaTeX↔valeur
 * (tests) — la vérification élève réelle (`moteur5e/`) utilise une différence finie de
 * `valeurFonction`, jamais cette formule (voir `docs`, décision documentée dans le rapport de
 * tâche : éviter de dupliquer la logique de règle produit/quotient/chaîne une 2e fois côté moteur). */
export function valeurDeriveeExacte(exercice: ExerciceFonctionDerivee, x: number): number {
  switch (exercice.famille) {
    case "reglebase":
      return exercice.atomes.reduce((s, a) => s + deriveeAtome(a, x), 0);
    case "produit": {
      const { atome1, atome2 } = exercice;
      return deriveeAtome(atome1, x) * valeurAtome(atome2, x) + valeurAtome(atome1, x) * deriveeAtome(atome2, x);
    }
    case "quotient": {
      if (exercice.ambigu) {
        const u = exercice.a * x + exercice.b;
        if (exercice.trig === "cos") return (2 * exercice.a * Math.sin(u)) / Math.pow(Math.cos(u), 3);
        return (-2 * exercice.a * Math.cos(u)) / Math.pow(Math.sin(u), 3);
      }
      const { atome1, atome2 } = exercice;
      const u = valeurAtome(atome1, x);
      const v = valeurAtome(atome2, x);
      const up = deriveeAtome(atome1, x);
      const vp = deriveeAtome(atome2, x);
      return (up * v - u * vp) / (v * v);
    }
    case "composee":
      return deriveeAtome(exercice.atome, x);
  }
}

// ============================================================================
// Échantillonnage défensif — pool large de x fractionnaires (jamais entiers, pour ne jamais
// tomber pile sur une racine/un pôle entier), utilisé À LA FOIS pour le REJET à la génération
// (retirer un tirage dont le domaine réel laisse trop peu de points exploitables) et pour la
// vérification (Couche B, réplique identique) — approche VOLONTAIREMENT générique (jamais de
// calcul symbolique de domaine par famille), conforme à la consigne de la tâche.
// ============================================================================

export const CANDIDATS_X: number[] = [
  0.7, -0.4, 1.3, -0.9, 0.2, 1.7, 2.3, -1.6, 3.1, -2.7, 0.55, 1.05, -0.15, 4.2, -3.3, 2.85, -0.65, 1.45, -2.15, 3.65,
];

const MAGNITUDE_MAX_PLAUSIBLE = 1e6;

export function pointValide(valeur: number): boolean {
  return Number.isFinite(valeur) && Math.abs(valeur) < MAGNITUDE_MAX_PLAUSIBLE;
}

/** Nombre de points de `CANDIDATS_X` où `valeurFn` est finie et de magnitude plausible. */
export function compterPointsValides(valeurFn: (x: number) => number): number {
  let n = 0;
  for (const x of CANDIDATS_X) {
    let v: number;
    try {
      v = valeurFn(x);
    } catch {
      continue;
    }
    if (pointValide(v)) n++;
  }
  return n;
}

const MIN_POINTS_VALIDES = 4;
const MAX_ESSAIS_REJET = 100;

/** Rejette (retire) tout tirage dont `valeurFonction` laisse moins de `MIN_POINTS_VALIDES` points
 * exploitables parmi `CANDIDATS_X` — défensif à la GÉNÉRATION (pas seulement à la vérification),
 * garantit qu'un exercice produit reste toujours vérifiable en pratique. */
function genererAvecRejet<T>(fabrique: () => T, valeurFn: (t: T, x: number) => number): T {
  for (let essai = 0; essai < MAX_ESSAIS_REJET; essai++) {
    const candidat = fabrique();
    if (compterPointsValides((x) => valeurFn(candidat, x)) >= MIN_POINTS_VALIDES) return candidat;
  }
  // Filet de sécurité théorique — jamais atteint en pratique avec les plages de tirage retenues.
  return fabrique();
}

// ============================================================================
// Tirage d'atomes.
// ============================================================================

function tirerParmi<T>(candidats: T[]): T {
  return candidats[entierAleatoire(0, candidats.length - 1)];
}

const EXPOSANTS_REGLEBASE = [-2, -1, 2, 3, 4];
const EXPOSANTS_COMPOSEE = [-2, -1, 2, 3, 4];
const EXPOSANTS_PRODUIT_QUOTIENT = [1, 2, 3, 4];

function noyauTrig(): NoyauDerivable {
  return { type: "trig", fonction: Math.random() < 0.5 ? "sin" : "cos" };
}

function noyauMonomeOuRacine(exposants: number[]): NoyauDerivable {
  if (Math.random() < 0.6) return { type: "monome", exposant: tirerParmi(exposants) };
  return { type: "racine" };
}

/** Intérieure NON triviale garantie (ax+b, a≠1 systématiquement — donc jamais interieurA=1 ET
 * interieurB=0 quel que soit b). */
function interieurNonTrivial(): { interieurA: number; interieurB: number } {
  const interieurA = tirerParmi([-3, -2, 2, 3]);
  const interieurB = entierAleatoire(-3, 3);
  return { interieurA, interieurB };
}

// ============================================================================
// Famille 1 — reglebase : somme de 2-3 atomes, intérieure TOUJOURS triviale. Habillage trig sur
// UN SEUL terme, ~40% des tirages (indépendant, ni systématique ni jamais).
// ============================================================================

const TAUX_TRIG_REGLEBASE = 0.4;

/** Clé de "forme" d'un atome reglebase (intérieure toujours triviale ici, jamais dans la clé) —
 * deux atomes de même clé sont des termes semblables, à fusionner par addition de coefficients. */
function cleFormeAtomeReglebase(atome: AtomeDerivable): string {
  if (atome.noyau.type === "monome") return `monome:${atome.noyau.exposant}`;
  if (atome.noyau.type === "racine") return "racine";
  return `trig:${atome.noyau.fonction}`;
}

/** Fusionne les termes semblables (même forme, ex. deux `x²`) en additionnant leurs coefficients —
 * ordre de première apparition préservé (voir `docs/historique-5e-derivees.md`, correction
 * "f(x) non simplifié" : "1/x²+x²+x²"→"1/x²+2x²", ordre du 1er terme distinct rencontré conservé).
 * Retourne `null` si la fusion fait s'annuler exactement un terme (coefficient combiné nul) ou
 * réduit à moins de 2 termes distincts (dégénère hors du contrat "somme de 2-3 termes" de la
 * famille) — signal de rejet pour l'appelant, qui retire un nouveau tirage complet. */
export function fusionnerTermesSemblablesReglebase(brut: AtomeDerivable[]): AtomeDerivable[] | null {
  const ordre: string[] = [];
  const groupes = new Map<string, AtomeDerivable>();
  for (const atome of brut) {
    const cle = cleFormeAtomeReglebase(atome);
    const existant = groupes.get(cle);
    if (existant) {
      existant.coeff += atome.coeff;
    } else {
      groupes.set(cle, { ...atome });
      ordre.push(cle);
    }
  }
  const fusionnes = ordre.map((cle) => groupes.get(cle)!);
  if (fusionnes.some((a) => a.coeff === 0) || fusionnes.length < 2) return null;
  return fusionnes;
}

export function genererReglebase(options?: { forcerTrig?: boolean }): ExerciceFonctionDeriveeReglebase {
  for (let essai = 0; essai < MAX_ESSAIS_REJET; essai++) {
    const nbTermes = entierAleatoire(2, 3);
    const avecTrig = options?.forcerTrig ?? Math.random() < TAUX_TRIG_REGLEBASE;
    const indexTrig = avecTrig ? entierAleatoire(0, nbTermes - 1) : -1;

    const brut: AtomeDerivable[] = [];
    for (let i = 0; i < nbTermes; i++) {
      const noyau = i === indexTrig ? noyauTrig() : noyauMonomeOuRacine(EXPOSANTS_REGLEBASE);
      brut.push({ noyau, coeff: entierNonNul(5), interieurA: 1, interieurB: 0 });
    }
    const atomes = fusionnerTermesSemblablesReglebase(brut);
    if (atomes === null) continue;
    return { famille: "reglebase", atomes, typesAcceptes: ["reglebase"], decompositions: {} };
  }
  // Filet de sécurité théorique — jamais atteint en pratique (probabilité négligeable de rejet
  // répété MAX_ESSAIS_REJET fois avec les plages de tirage retenues) : 2 termes de formes garanties
  // distinctes, jamais besoin de fusion.
  return {
    famille: "reglebase",
    atomes: [
      { noyau: { type: "monome", exposant: 2 }, coeff: entierNonNul(5), interieurA: 1, interieurB: 0 },
      { noyau: { type: "racine" }, coeff: entierNonNul(5), interieurA: 1, interieurB: 0 },
    ],
    typesAcceptes: ["reglebase"],
    decompositions: {},
  };
}

// ============================================================================
// Atome facteur (produit/quotient) — non-trig : intérieure TOUJOURS triviale, exposant positif
// (jamais de fraction imbriquée en affichage). Trig : intérieure triviale la plupart du temps,
// non triviale à un sous-taux (~40%) — piège documenté "chaîne oubliée sur un argument ≠ x".
// ============================================================================

const TAUX_INTERIEUR_NON_TRIVIAL_TRIG = 0.4;

function atomeFacteurNonTrig(): AtomeDerivable {
  return { noyau: noyauMonomeOuRacine(EXPOSANTS_PRODUIT_QUOTIENT), coeff: entierNonNul(4), interieurA: 1, interieurB: 0 };
}

function atomeFacteurTrig(): AtomeDerivable {
  const nonTrivial = Math.random() < TAUX_INTERIEUR_NON_TRIVIAL_TRIG;
  const interieur = nonTrivial ? interieurNonTrivial() : { interieurA: 1, interieurB: 0 };
  return { noyau: noyauTrig(), coeff: entierNonNul(3), ...interieur };
}

const TAUX_TRIG_PRODUIT_QUOTIENT = 0.45;

/** 2 atomes indépendants (ordre = [premier, second]) — au moins un trig à `tauxTrig` (position
 * tirée uniformément), sinon les deux non-trig. */
/** true si `a`/`b` sont structurellement IDENTIQUES (même noyau, même coefficient, même
 * intérieure) — un produit/quotient u·v ou u/v avec u≡v serait dégénéré (u et v indiscernables,
 * l'écran "decomposer" n'aurait plus de sens : n'importe quel ordre serait "correct"). */
function atomesIdentiques(a: AtomeDerivable, b: AtomeDerivable): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function genererDeuxAtomesFacteurs(tauxTrig: number, forcerTrig?: boolean): [AtomeDerivable, AtomeDerivable] {
  const avecTrig = forcerTrig ?? Math.random() < tauxTrig;
  for (let essai = 0; essai < 20; essai++) {
    let atomes: [AtomeDerivable, AtomeDerivable];
    if (!avecTrig) {
      atomes = [atomeFacteurNonTrig(), atomeFacteurNonTrig()];
    } else {
      const positionTrig = entierAleatoire(0, 1);
      atomes = [atomeFacteurNonTrig(), atomeFacteurNonTrig()];
      atomes[positionTrig] = atomeFacteurTrig();
    }
    if (!atomesIdentiques(atomes[0], atomes[1])) return atomes;
  }
  // Filet de sécurité théorique — jamais atteint en pratique.
  return [atomeFacteurNonTrig(), { ...atomeFacteurNonTrig(), coeff: 1 }];
}

/** Fusionne les coefficients de 2 facteurs d'un produit u·v en UN SEUL coefficient combiné,
 * porté par le facteur affiché en premier — jamais deux coefficients numériques visibles
 * multipliés l'un à l'autre dans f(x) (convention "coefficient toujours en tête du terme",
 * CLAUDE.md). Le facteur "monome" (puissance de x) passe en premier s'il y en a exactement un
 * (ordre canonique — voir `docs/historique-5e-derivees.md`, correction "f(x) non simplifié" :
 * "2√x·(−4x⁴)"→"−8x⁴·√x", le monome vient toujours avant la racine/le trig) ; sinon l'ordre de
 * génération (`atome1`,`atome2`) est conservé. L'autre facteur devient coefficient=1 (implicite,
 * jamais affiché) — le degré/l'intérieure de CHAQUE facteur restent inchangés, seul le
 * coefficient bouge (pas de 2e bug de calcul de degré). */
export function normaliserFacteursProduit(atome1: AtomeDerivable, atome2: AtomeDerivable): [AtomeDerivable, AtomeDerivable] {
  const estMonome = (a: AtomeDerivable) => a.noyau.type === "monome";
  const [premier, second] = estMonome(atome2) && !estMonome(atome1) ? [atome2, atome1] : [atome1, atome2];
  return [{ ...premier, coeff: premier.coeff * second.coeff }, { ...second, coeff: 1 }];
}

// ============================================================================
// Décompositions — construites à partir des atomes réellement tirés (jamais recalculées
// autrement, source de vérité unique : les champs de l'exercice).
// ============================================================================

function decompositionProduitOuQuotient(atome1: AtomeDerivable, atome2: AtomeDerivable, tolereEchangeUV: boolean): DecompositionAttendue {
  return { type: "produitOuQuotient", uLatex: formatAtomeLatex(atome1), vLatex: formatAtomeLatex(atome2), tolereEchangeUV };
}

function decompositionComposeeDepuisAtome(atome: AtomeDerivable): DecompositionAttendue {
  return { type: "composee", interieurLatex: formatInterieurLatex(atome), exterieurLatexEnU: formatExterieurEnULatex(atome) };
}

// ============================================================================
// Famille 2 — produit : f(x)=atome1(x)·atome2(x).
// ============================================================================

export function genererProduit(options?: { forcerTrig?: boolean }): ExerciceFonctionDeriveeProduit {
  return genererAvecRejet(
    () => {
      const [brut1, brut2] = genererDeuxAtomesFacteurs(TAUX_TRIG_PRODUIT_QUOTIENT, options?.forcerTrig);
      const [atome1, atome2] = normaliserFacteursProduit(brut1, brut2);
      return {
        famille: "produit" as const,
        atome1,
        atome2,
        typesAcceptes: ["produit"] as TypeDerivee[],
        decompositions: { produit: decompositionProduitOuQuotient(atome1, atome2, true) },
      };
    },
    (ex, x) => valeurFonction(ex, x),
  );
}

// ============================================================================
// Famille 3 — quotient (ordinaire OU cas ambigu délibéré 1/(trig(ax+b))²).
// ============================================================================

const TAUX_AMBIGU_QUOTIENT = 0.22;

function genererQuotientOrdinaire(forcerTrig?: boolean): ExerciceFonctionDeriveeQuotient {
  return genererAvecRejet(
    () => {
      const [atome1, atome2] = genererDeuxAtomesFacteurs(TAUX_TRIG_PRODUIT_QUOTIENT, forcerTrig);
      return {
        famille: "quotient" as const,
        ambigu: false as const,
        atome1,
        atome2,
        typesAcceptes: ["quotient"] as TypeDerivee[],
        decompositions: { quotient: decompositionProduitOuQuotient(atome1, atome2, false) },
      };
    },
    (ex, x) => valeurFonction(ex, x),
  );
}

const CANDIDATS_A_AMBIGU = [-3, -2, -1, 1, 2, 3];

function genererQuotientAmbigu(): ExerciceFonctionDeriveeQuotient {
  return genererAvecRejet(
    () => {
      const trig: "sin" | "cos" = Math.random() < 0.5 ? "sin" : "cos";
      const a = tirerParmi(CANDIDATS_A_AMBIGU);
      const b = entierAleatoire(-3, 3);
      const inner = formatPolynomeLatex([b, a], "x");
      const trigCmd = trig === "sin" ? "\\sin" : "\\cos";
      const vLatex = `${trigCmd}(${inner})^{2}`;
      const interieurLatex = `${trigCmd}(${inner})`;
      const exterieurLatexEnU = "\\dfrac{1}{u^{2}}";
      return {
        famille: "quotient" as const,
        ambigu: true as const,
        trig,
        a,
        b,
        typesAcceptes: ["quotient", "composee"] as TypeDerivee[],
        decompositions: {
          quotient: { type: "produitOuQuotient", uLatex: "1", vLatex, tolereEchangeUV: false },
          composee: { type: "composee", interieurLatex, exterieurLatexEnU },
        },
      };
    },
    (ex, x) => valeurFonction(ex, x),
  );
}

export function genererQuotient(options?: { forcerTrig?: boolean; forcerAmbigu?: boolean }): ExerciceFonctionDeriveeQuotient {
  const ambigu = options?.forcerAmbigu ?? Math.random() < TAUX_AMBIGU_QUOTIENT;
  if (ambigu) return genererQuotientAmbigu();
  return genererQuotientOrdinaire(options?.forcerTrig);
}

// ============================================================================
// Famille 4 — composee : UN SEUL atome, intérieure OBLIGATOIREMENT non triviale.
// ============================================================================

const TAUX_TRIG_COMPOSEE = 0.45;
const TAUX_RACINE_COMPOSEE = 0.25;

function noyauNonTrigComposee(): NoyauDerivable {
  return Math.random() < TAUX_RACINE_COMPOSEE / (1 - TAUX_TRIG_COMPOSEE) ? { type: "racine" } : { type: "monome", exposant: tirerParmi(EXPOSANTS_COMPOSEE) };
}

function noyauComposee(): NoyauDerivable {
  const r = Math.random();
  if (r < TAUX_TRIG_COMPOSEE) return noyauTrig();
  if (r < TAUX_TRIG_COMPOSEE + TAUX_RACINE_COMPOSEE) return { type: "racine" };
  return { type: "monome", exposant: tirerParmi(EXPOSANTS_COMPOSEE) };
}

export function genererComposee(options?: { forcerTrig?: boolean }): ExerciceFonctionDeriveeComposee {
  return genererAvecRejet(
    () => {
      const noyau = options?.forcerTrig === true ? noyauTrig() : options?.forcerTrig === false ? noyauNonTrigComposee() : noyauComposee();
      const atome: AtomeDerivable = { noyau, coeff: entierNonNul(4), ...interieurNonTrivial() };
      return { famille: "composee" as const, atome, typesAcceptes: ["composee"] as TypeDerivee[], decompositions: { composee: decompositionComposeeDepuisAtome(atome) } };
    },
    (ex, x) => valeurFonction(ex, x),
  );
}

// ============================================================================
// LaTeX — construction bas niveau, réutilisée par la génération (décompositions) ET par
// `ui5e/formatFonctionDerivee.ts` (dépend librement de cette Couche A, même patron que
// `formatDefinitionDerivee.ts` réutilisant `valeurExacte`/`deriveeExacte`). Réutilise
// `formatPolynomeLatex` (`generateurs5e/domaineDefinition/polynome.ts`) pour toute intérieure
// linéaire ax+b.
// ============================================================================

/** "x" (intérieure triviale) ou "ax+b" formaté via `formatPolynomeLatex`. */
export function formatInterieurLatex(atome: AtomeDerivable): string {
  if (atome.interieurA === 1 && atome.interieurB === 0) return "x";
  return formatPolynomeLatex([atome.interieurB, atome.interieurA], "x");
}

/** coeff·noyau(argLatex) — `argEstAtomique` : true si `argLatex` est un symbole unique ("x"/"u",
 * jamais besoin de parenthèses supplémentaires pour un exposant), false si c'est déjà une
 * expression composée (ex. "2x+1", alors parenthésée avant l'exposant). */
function formatCoeffNoyauLatex(noyau: NoyauDerivable, coeff: number, argLatex: string, argEstAtomique: boolean): string {
  const signe = coeff < 0 ? "-" : "";
  const abs = Math.abs(coeff);
  switch (noyau.type) {
    case "monome": {
      const n = noyau.exposant;
      // exposant===1 avec `argLatex` NON atomique (ex. "2x+3") : TOUJOURS parenthéser, même sans
      // exposant affiché — sinon un coefficient concaténé juste devant (ex. "-4" + "2x+3") donne
      // "-42x+3", lu comme -(4·2x)+3 au lieu de -4·(2x+3) (bug réel confirmé : dérivée d'une
      // composée monome, `formatDeriveeAtomeLatex`).
      const puissance = (exposant: number) =>
        exposant === 1 ? (argEstAtomique ? argLatex : `(${argLatex})`) : argEstAtomique ? `${argLatex}^{${exposant}}` : `(${argLatex})^{${exposant}}`;
      // u^0=1 (ex. dérivée d'un atome monome d'exposant 1, terme "atomique" pur, jamais de
      // variable/fraction affichée pour ce cas) — coeff seul, jamais "\dfrac{coeff}{u^{0}}".
      if (n === 0) return `${signe}${abs}`;
      if (n > 0) {
        const coeffAffiche = abs === 1 ? "" : `${abs}`;
        return `${signe}${coeffAffiche}${puissance(n)}`;
      }
      const coeffAffiche = abs === 1 ? "1" : `${abs}`;
      return `${signe}\\dfrac{${coeffAffiche}}{${puissance(-n)}}`;
    }
    case "racine": {
      const coeffAffiche = abs === 1 ? "" : `${abs}`;
      return `${signe}${coeffAffiche}\\sqrt{${argLatex}}`;
    }
    case "trig": {
      const coeffAffiche = abs === 1 ? "" : `${abs}`;
      const nomFn = noyau.fonction === "sin" ? "\\sin" : "\\cos";
      return `${signe}${coeffAffiche}${nomFn}(${argLatex})`;
    }
  }
}

/** L'atome en x, signé — ex. "3x^{4}", "-2\sqrt{2x+1}", "\sin(x)". */
export function formatAtomeLatex(atome: AtomeDerivable): string {
  const trivial = atome.interieurA === 1 && atome.interieurB === 0;
  const arg = trivial ? "x" : formatInterieurLatex(atome);
  return formatCoeffNoyauLatex(atome.noyau, atome.coeff, arg, trivial);
}

/** L'atome vu comme fonction extérieure EN u (placeholder, jamais de composition supplémentaire)
 * — ex. pour un atome noyau=racine coeff=2 : "2\sqrt{u}". */
export function formatExterieurEnULatex(atome: AtomeDerivable): string {
  return formatCoeffNoyauLatex(atome.noyau, atome.coeff, "u", true);
}

function signeLatex(s: string): "+" | "-" {
  return s.startsWith("-") ? "-" : "+";
}
function sansSigne(s: string): string {
  return s.startsWith("-") ? s.slice(1) : s;
}
function negatif(s: string): string {
  return s.startsWith("-") ? s.slice(1) : `-${s}`;
}
function joindre(termes: string[]): string {
  return termes
    .map((t, i) => {
      if (i === 0) return t;
      return signeLatex(t) === "-" ? ` - ${sansSigne(t)}` : ` + ${sansSigne(t)}`;
    })
    .join("");
}
function formatProduitDeDeux(s1: string, s2: string): string {
  const signe = signeLatex(s1) !== signeLatex(s2) ? "-" : "";
  return `${signe}${sansSigne(s1)}\\cdot ${sansSigne(s2)}`;
}

/** f(x) littéral, une somme signée d'atomes — utilisé pour "reglebase" ET pour construire le
 * numérateur/dénominateur de "quotient". */
export function formatSommeAtomesLatex(atomes: AtomeDerivable[]): string {
  return joindre(atomes.map(formatAtomeLatex));
}

// ============================================================================
// f(x) — bloc de données, par famille.
// ============================================================================

function formatFacteurApresCdot(atome: AtomeDerivable): string {
  const s = formatAtomeLatex(atome);
  return s.startsWith("-") ? `(${s})` : s;
}

export function formatFDeXLatex(exercice: ExerciceFonctionDerivee): string {
  switch (exercice.famille) {
    case "reglebase":
      return `f(x)=${formatSommeAtomesLatex(exercice.atomes)}`;
    case "produit":
      return `f(x)=${formatAtomeLatex(exercice.atome1)}\\cdot ${formatFacteurApresCdot(exercice.atome2)}`;
    case "quotient": {
      if (exercice.ambigu) {
        const inner = formatPolynomeLatex([exercice.b, exercice.a], "x");
        const trigCmd = exercice.trig === "sin" ? "\\sin" : "\\cos";
        return `f(x)=\\dfrac{1}{${trigCmd}(${inner})^{2}}`;
      }
      return `f(x)=\\dfrac{${formatAtomeLatex(exercice.atome1)}}{${formatAtomeLatex(exercice.atome2)}}`;
    }
    case "composee":
      return `f(x)=${formatAtomeLatex(exercice.atome)}`;
  }
}

// ============================================================================
// f'(x) — forme fermée, DISPLAY UNIQUEMENT (jamais utilisée pour la vérification élève, qui
// reste une différence finie de `valeurFonction`).
// ============================================================================

/** Dérivée de l'atome, en LaTeX (chaîne SIGNÉE) — même formule fermée que `deriveeAtome`
 * (numérique), câblée ici en LaTeX pour l'affichage. Le coefficient de la dérivée d'une racine
 * peut être fractionnaire (coeff·interieurA/2) : réduit en fraction EXACTE via `reduireFraction`,
 * jamais un décimal affiché. */
export function formatDeriveeAtomeLatex(atome: AtomeDerivable): string {
  const trivial = atome.interieurA === 1 && atome.interieurB === 0;
  const arg = trivial ? "x" : formatInterieurLatex(atome);
  const du = atome.interieurA;

  switch (atome.noyau.type) {
    case "monome": {
      const n = atome.noyau.exposant;
      const coeffDerive = atome.coeff * n * du;
      return formatCoeffNoyauLatex({ type: "monome", exposant: n - 1 }, coeffDerive, arg, trivial);
    }
    case "racine": {
      const frac = reduireFraction(atome.coeff * du, 2);
      const signe = frac.num < 0 ? "-" : "";
      const absNum = Math.abs(frac.num);
      const coeffAffiche = absNum === 1 ? "" : `${absNum}`;
      const denomSqrt = frac.den === 1 ? `\\sqrt{${arg}}` : `${frac.den}\\sqrt{${arg}}`;
      return `${signe}\\dfrac{${coeffAffiche === "" ? "1" : coeffAffiche}}{${denomSqrt}}`;
    }
    case "trig": {
      const nomFn = atome.noyau.fonction === "sin" ? "cos" : "sin";
      const signeSupp = atome.noyau.fonction === "sin" ? 1 : -1;
      return formatCoeffNoyauLatex({ type: "trig", fonction: nomFn }, atome.coeff * du * signeSupp, arg, trivial);
    }
  }
}

function formatDeriveeProduitLatex(atome1: AtomeDerivable, atome2: AtomeDerivable): string {
  const t1 = formatProduitDeDeux(formatDeriveeAtomeLatex(atome1), formatAtomeLatex(atome2));
  const t2 = formatProduitDeDeux(formatAtomeLatex(atome1), formatDeriveeAtomeLatex(atome2));
  return joindre([t1, t2]);
}

/** true SSI `formatAtomeLatex(atome)` produit EXACTEMENT le symbole nu "x" (monome, coeff=1,
 * exposant=1, intérieure triviale) — seul cas où l'élever au carré n'a jamais besoin de
 * parenthèses (audit transversal, `promptauditparenthesessuperflues.md`). */
function estAtomeSymboleNu(atome: AtomeDerivable): boolean {
  return atome.coeff === 1 && atome.interieurA === 1 && atome.interieurB === 0 && atome.noyau.type === "monome" && atome.noyau.exposant === 1;
}

function formatDeriveeQuotientOrdinaireLatex(atome1: AtomeDerivable, atome2: AtomeDerivable): string {
  const t1 = formatProduitDeDeux(formatDeriveeAtomeLatex(atome1), formatAtomeLatex(atome2));
  const t2 = formatProduitDeDeux(formatAtomeLatex(atome1), formatDeriveeAtomeLatex(atome2));
  const numerateur = joindre([t1, negatif(t2)]);
  const atome2Latex = formatAtomeLatex(atome2);
  const denominateur = estAtomeSymboleNu(atome2) ? `${atome2Latex}^{2}` : `(${atome2Latex})^{2}`;
  return `\\dfrac{${numerateur}}{${denominateur}}`;
}

function formatDeriveeAmbigueLatex(exercice: { trig: "sin" | "cos"; a: number; b: number }): string {
  const inner = formatPolynomeLatex([exercice.b, exercice.a], "x");
  const coeff2a = 2 * exercice.a;
  if (exercice.trig === "cos") {
    const signe = coeff2a < 0 ? "-" : "";
    return `${signe}\\dfrac{${Math.abs(coeff2a)}\\sin(${inner})}{\\cos(${inner})^{3}}`;
  }
  const signe = coeff2a > 0 ? "-" : "";
  return `${signe}\\dfrac{${Math.abs(coeff2a)}\\cos(${inner})}{\\sin(${inner})^{3}}`;
}

export function formatDeriveeFDeXLatex(exercice: ExerciceFonctionDerivee): string {
  switch (exercice.famille) {
    case "reglebase":
      return joindre(exercice.atomes.map(formatDeriveeAtomeLatex));
    case "produit":
      return formatDeriveeProduitLatex(exercice.atome1, exercice.atome2);
    case "quotient":
      if (exercice.ambigu) return formatDeriveeAmbigueLatex(exercice);
      return formatDeriveeQuotientOrdinaireLatex(exercice.atome1, exercice.atome2);
    case "composee":
      return formatDeriveeAtomeLatex(exercice.atome);
  }
}

// ============================================================================
// Dispatch + panneau dev — catalogue à granularité "famille × habillage trig", plus une entrée
// dédiée forçant le cas ambigu (testabilité indépendante, exigée par la tâche).
// ============================================================================

export function genererExerciceFonctionDerivee(): ExerciceFonctionDerivee {
  const famille = tirerParmi<TypeDerivee>(["reglebase", "produit", "quotient", "composee"]);
  switch (famille) {
    case "reglebase":
      return genererReglebase();
    case "produit":
      return genererProduit();
    case "quotient":
      return genererQuotient();
    case "composee":
      return genererComposee();
  }
}

export const CATALOGUE_FAMILLES: { id: string; label: string }[] = [
  { id: "reglebase-sans-trig", label: "1a. Règle de base — sans trig" },
  { id: "reglebase-avec-trig", label: "1b. Règle de base — avec trig" },
  { id: "produit-sans-trig", label: "2a. Produit u·v — sans trig" },
  { id: "produit-avec-trig", label: "2b. Produit u·v — avec trig" },
  { id: "quotient-sans-trig", label: "3a. Quotient u/v — sans trig" },
  { id: "quotient-avec-trig", label: "3b. Quotient u/v — avec trig" },
  { id: "quotient-ambigu", label: "3c. Quotient ambigu — 1/trig(ax+b)²" },
  { id: "composee-sans-trig", label: "4a. Composée (chaîne) — sans trig" },
  { id: "composee-avec-trig", label: "4b. Composée (chaîne) — avec trig" },
];

export function construireAvecFamilleId(id: string): ExerciceFonctionDerivee {
  switch (id) {
    case "reglebase-sans-trig":
      return genererReglebase({ forcerTrig: false });
    case "reglebase-avec-trig":
      return genererReglebase({ forcerTrig: true });
    case "produit-sans-trig":
      return genererProduit({ forcerTrig: false });
    case "produit-avec-trig":
      return genererProduit({ forcerTrig: true });
    case "quotient-sans-trig":
      return genererQuotient({ forcerAmbigu: false, forcerTrig: false });
    case "quotient-avec-trig":
      return genererQuotient({ forcerAmbigu: false, forcerTrig: true });
    case "quotient-ambigu":
      return genererQuotient({ forcerAmbigu: true });
    case "composee-sans-trig":
      return genererComposee({ forcerTrig: false });
    case "composee-avec-trig":
      return genererComposee({ forcerTrig: true });
    default:
      throw new Error(`construireAvecFamilleId : id inconnu "${id}"`);
  }
}
