import type { ConiqueCentree, ConiqueParabole, ExerciceTangenteA, ExerciceTangenteB, ExerciceTangenteC, ExerciceTangenteD, ExerciceTangenteE, ExerciceTangentesConique } from "../core6e/tangentesConique.types";
import type { Point } from "../core6e/identificationConiques.types";
import { coefficientsEquationEnM, discriminantParalleles } from "../generateurs6e/tangentesConique/algebreTangente";
import type { PhaseTangentesConique, ResultatExerciceTangentesConique } from "../moteur6e/typesTangentesConique";
import { phasesPourExercice } from "../moteur6e/typesTangentesConique";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen62`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatEquationConiqueCaracteristiques.ts` (6gen59) : un
 * SEUL composant écran générique (`EtapeChampsTangentesConique`), piloté entièrement par
 * `champs: ChampDef[]` — jamais de JSX par famille/écran.
 *
 * `ChampDef.type==="liste"` (nouveau par rapport à 6gen59) porte le pattern add-as-needed des
 * écrans `bEcran4`/`cEcran4` DANS le composant générique plutôt que dans un composant dédié
 * séparé — convention de nommage imposée à ce générateur (3 composants seulement, voir
 * `components6e/EtapeChampsTangentesConique.tsx`) : chaque ligne porte `sousChamps.length` valeurs
 * (ici toujours 3 : équation, x, y), encodées par le composant en un SEUL `string` JSON
 * (`valeurs[i]`) — décodé côté `moteur6e/verificationTangentesConique.ts`.
 *
 * **Vigilance signe orphelin / texte français en mode maths** — toute clause en français mêlée à du
 * LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths.
 */

export type TypeChamp = "texte" | "choix" | "liste";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface SousChampListe {
  label: string;
  placeholder?: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
  /** `true` pour un label réduit à une lettre de variable (ex. "a =", "k ="), voir
   * `.field-label-minuscule` (`App.css`). */
  minuscule?: boolean;
  /** Présent ssi `type==="liste"` — décrit chaque colonne d'une ligne add-as-needed. */
  sousChamps?: SousChampListe[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

function champTexte(label: string, placeholder: string, minuscule = false): ChampDef {
  return { type: "texte", label, placeholder, minuscule };
}

function champChoix(label: string, options: OptionChoix[]): ChampDef {
  return { type: "choix", label, options };
}

function champListe(label: string, sousChamps: SousChampListe[]): ChampDef {
  return { type: "liste", label, sousChamps };
}

// ============================================================================
// Petits formateurs numériques/LaTeX partagés.
// ============================================================================

interface PartieSignee {
  coeff: number;
  texte: (abs: number) => string;
}

/** Assemble une somme signée à partir de termes `{coeff,texte}` — omet les termes de coefficient
 * nul, gère le signe du premier terme (jamais de "+" orphelin en tête). Mirroir
 * `formatIdentificationConiques.ts` (6gen58), dupliqué ici (chaque générateur reste indépendant). */
function formatSommeSignee(parties: PartieSignee[]): string {
  const nonNulles = parties.filter((p) => p.coeff !== 0);
  if (nonNulles.length === 0) return "0";
  return nonNulles
    .map((p, i) => {
      const abs = Math.abs(p.coeff);
      const corps = p.texte(abs);
      if (i === 0) return p.coeff < 0 ? `-${corps}` : corps;
      return p.coeff < 0 ? ` - ${corps}` : ` + ${corps}`;
    })
    .join("");
}

function carreTexte(variable: string): (abs: number) => string {
  return (abs) => (abs === 1 ? `${variable}^2` : `${abs}${variable}^2`);
}

/** Généralisation de `carreTexte` à un monôme arbitraire ("xk", "k^2", "m"...) — même convention
 * d'omission du coefficient "1" (CLAUDE.md, simplification algébrique). */
function termeTexte(expr: string): (abs: number) => string {
  return (abs) => (abs === 1 ? expr : `${abs}${expr}`);
}

/** Arrondi d'affichage pour une valeur potentiellement irrationnelle (racine carrée) — jamais une
 * valeur GÉNÉRÉE par la plateforme (celles-ci restent des entiers/fractions exacts partout ailleurs
 * dans ce générateur), utilisé UNIQUEMENT pour rappeler à l'élève une valeur déjà CONFIRMÉE
 * (`etatActuel`) qui peut être irrationnelle par nature (racine d'un discriminant). */
function formaterDecimal(n: number): string {
  if (Math.abs(n - Math.round(n)) < 1e-9) return `${Math.round(n)}`;
  return `${Math.round(n * 1000) / 1000}`;
}

function afficherPoint(p: Point): string {
  return `(${formaterDecimal(p.x)};${formaterDecimal(p.y)})`;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** `numCarre/denCarre` (déjà les carrés d'un numérateur/dénominateur entiers, ex. `kNum²/kDen²`) —
 * fraction EXACTE réduite, jamais un décimal (CLAUDE.md) : contrairement à `formaterDecimal`
 * (réservé aux quantités réellement irrationnelles, ex. `k`/`m` eux-mêmes en famille B/C/E), `k²`
 * et `m²` de la famille D restent des RATIONNELS exacts (`k`,`m` étant des fractions connues,
 * `kNum`/`kDen`/`mNum`/`mDen`) — les afficher en fraction réduite plutôt qu'arrondis. */
function afficherFractionCarree(numCarre: number, denCarre: number): string {
  const g = pgcd(numCarre, denCarre);
  const n = numCarre / g;
  const d = denCarre / g;
  return d === 1 ? `${n}` : `\\frac{${n}}{${d}}`;
}

/** `Ax²+By²=M` — signe de `B` géré par `formatSommeSignee` (hyperbole : `B<0`). */
function afficherConiqueCentree(c: ConiqueCentree): string {
  const gauche = formatSommeSignee([{ coeff: c.coeffX, texte: carreTexte("x") }, { coeff: c.coeffY, texte: carreTexte("y") }]);
  return `${gauche}=${c.M}`;
}

/** `y²=4px` (horizontal) / `x²=4py` (vertical). */
function afficherParabole(c: ConiqueParabole): string {
  const variableCarre = c.axe === "horizontal" ? "y" : "x";
  const variableLineaire = c.axe === "horizontal" ? "x" : "y";
  return `${variableCarre}^2=${4 * c.p}${variableLineaire}`;
}

function afficherConique(exercice: ExerciceTangenteA): string {
  return exercice.typeConique === "centree" ? afficherConiqueCentree(exercice.conique) : afficherParabole(exercice.conique);
}

/** Équation de la tangente CONFIRMÉE à `aEcran2` (dédoublement, non simplifiée) — recalculée depuis
 * les données de l'exercice (conique+P, jamais depuis la saisie élève), `x0,y0` TOUJOURS non nuls
 * par construction (voir `familleA.ts`). Bloc "état actuel", `aEcran3`. */
function formatDedoublementConfirmeA(e: ExerciceTangenteA): string {
  const { x: x0, y: y0 } = e.P;
  if (e.typeConique === "centree") {
    const { coeffX: A, coeffY: B, M } = e.conique;
    const corps = formatSommeSignee([
      { coeff: A * x0, texte: termeTexte("x") },
      { coeff: B * y0, texte: termeTexte("y") },
    ]);
    return `${corps}=${M}`;
  }
  const deuxP = 2 * e.conique.p;
  if (e.conique.axe === "horizontal") {
    const gauche = formatSommeSignee([{ coeff: y0, texte: termeTexte("y") }]);
    const droite = x0 > 0 ? `(x+${x0})` : `(x-${-x0})`;
    return `${gauche}=${deuxP}${droite}`;
  }
  const gauche = formatSommeSignee([{ coeff: x0, texte: termeTexte("x") }]);
  const droite = y0 > 0 ? `(y+${y0})` : `(y-${-y0})`;
  return `${gauche}=${deuxP}${droite}`;
}

/** `y=mx+k` avec `m`,`k` déjà connus numériquement — arrondi d'affichage (voir `formaterDecimal`). */
function afficherDroiteYmxk(m: number, k: number): string {
  const partieK = k === 0 ? "" : k > 0 ? `+${formaterDecimal(k)}` : `${formaterDecimal(k)}`;
  const mAbs = Math.abs(m);
  const partieM = mAbs === 1 ? (m < 0 ? "-" : "") : formaterDecimal(m);
  return `y=${partieM}x${partieK}`;
}

// ============================================================================
// Famille A — tangente en un point donné (dédoublement).
// ============================================================================

function consigneGeneraleA(): string {
  return "On donne une conique et un point P situé SUR cette conique. Détermine l'équation de la tangente à la conique en P, en appliquant la formule de dédoublement adaptée au type de conique.";
}

function blocDonneesA(e: ExerciceTangenteA): string[] {
  return [afficherConique(e), `\\text{Point } P${afficherPoint(e.P)}`];
}

function consigneEcranA(phase: PhaseTangentesConique): string {
  if (phase === "aEcran1") return "Vérifie que P appartient bien à la conique : substitue ses coordonnées dans l'équation. Quelle valeur obtiens-tu pour le membre substitué (elle doit égaler la constante de l'équation) ?";
  if (phase === "aEcran2") return "P étant confirmé sur la conique, applique la formule de dédoublement pour poser l'équation de la tangente en P.";
  return "Simplifie l'équation de la tangente obtenue à l'étape précédente.";
}

function champsEcranA(phase: PhaseTangentesConique): ChampDef[] {
  if (phase === "aEcran1") return [champTexte("Valeur obtenue par substitution =", "ex. 36")];
  if (phase === "aEcran2") return [champTexte("Équation de la tangente (dédoublement) :", "ex. 4x-3y=12")];
  return [champTexte("Équation finale simplifiée de la tangente :", "ex. y=2x-3")];
}

function aideA(e: ExerciceTangenteA, phase: PhaseTangentesConique, niveau: 1 | 2): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  if (niveau === 1) {
    if (e.typeConique === "centree") return { texte: "Formule de dédoublement pour une conique à centre Ax²+By²=M : remplace x² par x·x₀ et y² par y·y₀.", latex: "A\\cdot x\\cdot x_0+B\\cdot y\\cdot y_0=M" };
    const variableCarre = e.conique.axe === "horizontal" ? "y" : "x";
    return { texte: `Formule de dédoublement pour une parabole ${variableCarre}²=4p${e.conique.axe === "horizontal" ? "x" : "y"} :`, latex: e.conique.axe === "horizontal" ? "y\\cdot y_0=2p(x+x_0)" : "x\\cdot x_0=2p(y+y_0)" };
  }
  // niveau 2 : coefficients de la conique substitués, coordonnées de P encore symboliques.
  if (e.typeConique === "centree") return { texte: "Formule avec les coefficients de la conique déjà substitués (coordonnées de P restant symboliques) :", latex: `${e.conique.coeffX}\\cdot x\\cdot x_0${e.conique.coeffY < 0 ? "-" : "+"}${Math.abs(e.conique.coeffY)}\\cdot y\\cdot y_0=${e.conique.M}` };
  const p = e.conique.p;
  return { texte: "Formule avec p déjà substitué (coordonnées de P restant symboliques) :", latex: e.conique.axe === "horizontal" ? `y\\cdot y_0=${2 * p}(x+x_0)` : `x\\cdot x_0=${2 * p}(y+y_0)` };
}

// ============================================================================
// Famille B — tangentes parallèles à une droite donnée (hyperbole).
// ============================================================================

function consigneGeneraleB(): string {
  return "On donne une hyperbole et une direction (la pente m d'une droite d). Détermine s'il existe des tangentes à l'hyperbole de cette pente — et si oui, lesquelles.";
}

function blocDonneesB(e: ExerciceTangenteB): string[] {
  // Qualificatif "(seule la pente compte)" DÉLIBÉRÉMENT hors du fragment KaTeX (dans
  // `consigneGeneraleB`, texte HTML normal qui s'enroule) — un `\text{}` KaTeX multi-mots ne se
  // scinde JAMAIS sur plusieurs lignes et déborde silencieusement à 375px (piège documenté
  // CLAUDE.md, trouvé ici par capture Playwright 375px : "seule la pente compte)" tronqué).
  return [afficherConiqueCentree(e.conique), `\\text{Droite } d : ${afficherDroiteYmxk(e.m, e.c0)}`];
}

/** Équation en x confirmée à `bEcran1` (`k` reste symbolique) — dénominateurs de `m` EFFACÉS par
 * multiplication par `mDen²` (forme équivalente à `cibleBEcran1`, `verificationTangentesConique.ts`
 * : seule manière d'obtenir des coefficients ENTIERS quand `m` n'est pas entier, jamais de décimal
 * affiché, CLAUDE.md). Bloc "état actuel", `bEcran2`. */
function formatEquationXConfirmeeB(e: ExerciceTangenteB): string {
  const { coeffX: A, coeffY: B, M } = e.conique;
  const { mNum, mDen } = e;
  const coeffX2 = A * mDen * mDen + B * mNum * mNum;
  const coeffXK = 2 * B * mNum * mDen;
  const coeffK2 = B * mDen * mDen;
  const constante = -M * mDen * mDen;
  const corps = formatSommeSignee([
    { coeff: coeffX2, texte: termeTexte("x^2") },
    { coeff: coeffXK, texte: termeTexte("xk") },
    { coeff: coeffK2, texte: termeTexte("k^2") },
    { coeff: constante, texte: (abs) => `${abs}` },
  ]);
  return `${corps}=0`;
}

/** Équation en k confirmée à `bEcran2` — `cibleBEcran2`, mêmes dénominateurs de `m` effacés que
 * ci-dessus. Bloc "état actuel", `bEcran3`. */
function formatEquationKConfirmeeB(e: ExerciceTangenteB): string {
  const { coeffX: A, coeffY: B, M } = e.conique;
  const { mNum, mDen } = e;
  const coeffK2 = A * B * mDen * mDen;
  const constante = -M * A * mDen * mDen - M * B * mNum * mNum;
  const corps = formatSommeSignee([
    { coeff: coeffK2, texte: termeTexte("k^2") },
    { coeff: constante, texte: (abs) => `${abs}` },
  ]);
  return `${corps}=0`;
}

function consigneEcranB(phase: PhaseTangentesConique): string {
  if (phase === "bEcran1") return "Pose y=mx+k (k inconnu, m étant la pente donnée) et substitue dans l'équation de l'hyperbole. Donne l'équation du second degré en x obtenue (ses coefficients dépendent de k).";
  if (phase === "bEcran2") return "Pose la condition de tangence (discriminant nul) à partir de l'équation précédente. Donne l'équation résultante en k.";
  if (phase === "bEcran3") return "Résous l'équation en k. ATTENTION : si elle n'a pas de solution réelle, ce n'est pas une erreur de calcul — conclus explicitement qu'aucune tangente de cette pente n'existe.";
  return "Donne les équations complètes des tangentes trouvées et leurs points de tangence.";
}

function champsEcranB(e: ExerciceTangenteB, phase: PhaseTangentesConique): ChampDef[] {
  if (phase === "bEcran1") return [champTexte("Équation en x (k reste symbolique) :", "ex. -7x^2-16kx-4k^2-36=0")];
  if (phase === "bEcran2") return [champTexte("Équation en k :", "ex. -36k^2+252=0")];
  if (phase === "bEcran3") {
    const base: ChampDef[] = [
      champChoix("Conclusion :", [
        { valeur: "existe", label: "Des tangentes existent" },
        { valeur: "aucune", label: "Aucune tangente réelle" },
      ]),
    ];
    if (!e.aSolution) return base;
    return [...base, champTexte("Une valeur de k =", "ex. 3", true), champTexte("L'autre valeur de k =", "ex. -3", true)];
  }
  return [champListe("Tangentes trouvées (équation + point de tangence) :", [{ label: "Équation de la tangente", placeholder: "ex. y=2x+3" }, { label: "x du point de tangence", placeholder: "ex. 6" }, { label: "y du point de tangence", placeholder: "ex. 15" }])];
}

function aideB(e: ExerciceTangenteB, phase: PhaseTangentesConique, niveau: 1 | 2): AideAvecLatex {
  if (phase !== "bEcran3") return AUCUNE_AIDE;
  if (niveau === 1) return { texte: "Un discriminant négatif à cette étape signifie qu'AUCUNE tangente de la pente demandée n'existe pour cette conique — c'est une conclusion géométrique parfaitement légitime, pas un signe d'erreur.", latex: null };
  const D = discriminantParalleles(e.conique, e.m);
  return { texte: `Le discriminant (k²) vaut ${formaterDecimal(D)}, qui est ${D > 0 ? "strictement positif" : "négatif ou nul"}. À toi de formuler la conclusion.`, latex: null };
}

// ============================================================================
// Famille C — tangentes depuis un point donné (ellipse).
// ============================================================================

function consigneGeneraleC(): string {
  return "On donne une ellipse et un point P (pas nécessairement sur l'ellipse). Détermine s'il existe des tangentes à l'ellipse passant par P — et si oui, lesquelles.";
}

function blocDonneesC(e: ExerciceTangenteC): string[] {
  return [afficherConiqueCentree(e.conique), `\\text{Point } P${afficherPoint(e.P)}`];
}

/** Équation en x confirmée à `cEcran1` (`m` reste symbolique) — `x0,y0` TOUJOURS entiers par
 * construction (`familleC.ts`), jamais de fraction/décimal à gérer ici. Forme partiellement
 * factorisée (jamais développée plus loin, `m` restant l'inconnue) — `k0=y0-x0·m` (affine en `m`,
 * signe de `x0` géré par `formatSommeSignee`, jamais `y0-m·(-3)` non simplifié, CLAUDE.md) —
 * mirroir `cibleCEcran1` (`verificationTangentesConique.ts`). Bloc "état actuel", `cEcran2`. */
function formatEquationXConfirmeeC(e: ExerciceTangenteC): string {
  const { coeffX: A, coeffY: B, M } = e.conique;
  const { x: x0, y: y0 } = e.P;
  const k0 = formatSommeSignee([
    { coeff: y0, texte: (abs) => `${abs}` },
    { coeff: -x0, texte: termeTexte("m") },
  ]);
  const coeffX2 = formatSommeSignee([
    { coeff: A, texte: (abs) => `${abs}` },
    { coeff: B, texte: termeTexte("m^2") },
  ]);
  return `(${coeffX2})x^2+${2 * B}m(${k0})x+${B}(${k0})^2-${M}=0`;
}

/** Équation en m confirmée à `cEcran2` — `coefficientsEquationEnM` (Couche A, déjà importée),
 * coefficients TOUJOURS entiers (`x0,y0,A,B,M` tous entiers, famille C). Bloc "état actuel",
 * `cEcran3`. */
function formatEquationMConfirmeeC(e: ExerciceTangenteC): string {
  const { a2, a1, a0 } = coefficientsEquationEnM(e.conique, e.P);
  const corps = formatSommeSignee([
    { coeff: a2, texte: termeTexte("m^2") },
    { coeff: a1, texte: termeTexte("m") },
    { coeff: a0, texte: (abs) => `${abs}` },
  ]);
  return `${corps}=0`;
}

function consigneEcranC(phase: PhaseTangentesConique): string {
  if (phase === "cEcran1") return "Pose y-y₀=m(x-x₀) (m inconnu) et substitue dans l'équation de l'ellipse. Donne l'équation du second degré en x obtenue (ses coefficients dépendent de m).";
  if (phase === "cEcran2") return "Pose la condition de tangence (discriminant nul) à partir de l'équation précédente. Donne l'équation résultante en m.";
  if (phase === "cEcran3") return "Résous l'équation en m. ATTENTION : si elle n'a pas de solution réelle, ce n'est pas une erreur de calcul — conclus explicitement que P est situé à l'INTÉRIEUR de l'ellipse.";
  return "Donne les équations complètes des 2 tangentes et leurs points de tangence.";
}

function champsEcranC(e: ExerciceTangenteC, phase: PhaseTangentesConique): ChampDef[] {
  if (phase === "cEcran1") return [champTexte("Équation en x (m reste symbolique) :", "ex. (A+Bm^2)x^2+...=0")];
  if (phase === "cEcran2") return [champTexte("Équation en m :", "ex. a2*m^2+a1*m+a0=0")];
  if (phase === "cEcran3") {
    const base: ChampDef[] = [
      champChoix("Conclusion :", [
        { valeur: "exterieur", label: "P est extérieur — des tangentes existent" },
        { valeur: "interieur", label: "P est intérieur — aucune tangente réelle" },
      ]),
    ];
    if (!e.aSolution) return base;
    return [...base, champTexte("Une valeur de m =", "ex. 1", true), champTexte("L'autre valeur de m =", "ex. 2", true)];
  }
  return [champListe("Tangentes trouvées (équation + point de tangence) :", [{ label: "Équation de la tangente", placeholder: "ex. y=x+2" }, { label: "x du point de tangence", placeholder: "ex. 1" }, { label: "y du point de tangence", placeholder: "ex. 2" }])];
}

function aideC(e: ExerciceTangenteC, phase: PhaseTangentesConique, niveau: 1 | 2): AideAvecLatex {
  if (phase !== "cEcran3") return AUCUNE_AIDE;
  if (niveau === 1) return { texte: "Un point situé à l'INTÉRIEUR d'une ellipse ne peut être l'origine d'aucune tangente réelle — un discriminant négatif à cette étape le confirme. C'est une conclusion légitime, pas une erreur.", latex: null };
  const { a2, a1, a0 } = coefficientsEquationEnM(e.conique, e.P);
  const discriminant = a1 * a1 - 4 * a2 * a0;
  return { texte: `Le discriminant de l'équation en m vaut ${formaterDecimal(discriminant)}, qui est ${discriminant > 0 ? "strictement positif" : "négatif ou nul"}. À toi de formuler la conclusion.`, latex: null };
}

// ============================================================================
// Famille D — construire une conique depuis un point de passage et une tangente.
// ============================================================================

function consigneGeneraleD(): string {
  return "On cherche une conique (ellipse ou hyperbole) à axes de symétrie = axes de coordonnées, passant par un point P donné et tangente à une droite d donnée. Détermine son équation.";
}

/** Fragments DÉLIBÉRÉMENT courts (jamais une phrase complète en français dans un `\text{}` — un
 * bloc KaTeX ne se scinde jamais sur plusieurs lignes et déborde silencieusement à 375px, piège
 * documenté CLAUDE.md et déjà rencontré/corrigé pour la famille B de ce même générateur, voir
 * `blocDonneesB` ci-dessus — même correction appliquée ici après capture Playwright 375px montrant
 * "Hyperbole (axe transverse Oy)"/"Droite tangente d : ..." tronqués des 2 côtés). */
function blocDonneesD(e: ExerciceTangenteD): string[] {
  const typeTexte = e.natureCible === "ellipse" ? "\\text{Ellipse}" : `\\text{Hyperbole, axe } ${e.axeTransverse === "horizontal" ? "Ox" : "Oy"}`;
  return [typeTexte, `\\text{Point } P${afficherPoint(e.P)}`, `\\text{Droite } d : ${afficherDroiteYmxk(e.ligne.m, e.ligne.k)}`];
}

/** Équation « passe par P » confirmée à `dEcran1` (`a`,`b` restent symboliques) — `x0`,`y0` TOUJOURS
 * entiers par construction (voir en-tête de fichier, famille D). Bloc "état actuel", `dEcran2`. */
function formatEquationPasseParPConfirmeeD(e: ExerciceTangenteD): string {
  const { x: x0, y: y0 } = e.P;
  const signe = e.natureCible === "ellipse" ? "+" : "-";
  return `\\frac{${x0 * x0}}{a^2}${signe}\\frac{${y0 * y0}}{b^2}=1`;
}

/** Équation de tangence confirmée à `dEcran2` (`a`,`b` restent symboliques) — `k²`,`m²` des
 * RATIONNELS exacts (`k`,`m` fractions connues), affichés réduits plutôt qu'arrondis (même
 * technique que `aideD`, voir `afficherFractionCarree`). Bloc "état actuel", `dEcran3`. */
function formatEquationTangenceConfirmeeD(e: ExerciceTangenteD): string {
  const { kNum, kDen, mNum, mDen } = e.ligne;
  const kCarre = afficherFractionCarree(kNum * kNum, kDen * kDen);
  const mCarre = afficherFractionCarree(mNum * mNum, mDen * mDen);
  const signe = e.natureCible === "ellipse" ? "+" : "-";
  return `a^2\\cdot ${mCarre}${signe}b^2=${kCarre}`;
}

function consigneEcranD(phase: PhaseTangentesConique): string {
  if (phase === "dEcran1") return "Pose la condition « la conique passe par P » (équation en a² et b², encore inconnus).";
  if (phase === "dEcran2") return "Pose la condition de tangence à la droite d (équation en a² et b²).";
  if (phase === "dEcran3") return "Résous le système des 2 équations précédentes pour trouver a² et b².";
  return "Donne l'équation finale de la conique.";
}

function champsEcranD(phase: PhaseTangentesConique): ChampDef[] {
  if (phase === "dEcran1") return [champTexte("Équation « passe par P » (en a et b) :", "ex. x0^2/a^2+y0^2/b^2=1")];
  if (phase === "dEcran2") return [champTexte("Équation de tangence (en a et b) :", "ex. k^2=a^2*m^2+b^2")];
  if (phase === "dEcran3") return [champTexte("a² =", "ex. 25", true), champTexte("b² =", "ex. 25", true)];
  return [champTexte("Équation finale de la conique :", "ex. x^2/25+y^2/25=1")];
}

function aideD(e: ExerciceTangenteD, phase: PhaseTangentesConique, niveau: 1 | 2): AideAvecLatex {
  if (phase !== "dEcran3") return AUCUNE_AIDE;
  if (niveau === 1) return { texte: "Isole b² dans l'équation de tangence (étape 2), puis substitue cette expression dans l'équation « passe par P » (étape 1) — tu obtiens ainsi une équation à la seule inconnue a².", latex: null };
  const { x: x0, y: y0 } = e.P;
  const { kNum, kDen, mNum, mDen } = e.ligne;
  // ellipse : b²=k²-a²m² ; hyperbole : b²=a²m²-k² — k²/m² sont des RATIONNELS exacts (k,m eux-mêmes
  // des fractions connues), affichés en fraction réduite plutôt qu'arrondis (CLAUDE.md).
  const kCarre = afficherFractionCarree(kNum * kNum, kDen * kDen);
  const mCarre = afficherFractionCarree(mNum * mNum, mDen * mDen);
  const bCarreExpr = e.natureCible === "ellipse" ? `${kCarre}-a^2\\cdot ${mCarre}` : `a^2\\cdot ${mCarre}-${kCarre}`;
  const operateur = e.natureCible === "ellipse" ? "+" : "-";
  return { texte: "Substitution déjà effectuée (résolution finale, pour a², non faite) :", latex: `\\frac{${x0 * x0}}{a^2}${operateur}\\frac{${y0 * y0}}{${bCarreExpr}}=1` };
}

// ============================================================================
// Famille E — point d'une conique le plus proche d'une droite (réutilise famille B).
// ============================================================================

function consigneGeneraleE(): string {
  return "On donne une hyperbole et une droite d. Détermine, parmi les points de l'hyperbole où la tangente est parallèle à d, celui qui est le plus proche de d.";
}

function blocDonneesE(e: ExerciceTangenteE): string[] {
  return [afficherConiqueCentree(e.base.conique), `\\text{Droite } d : ${afficherDroiteYmxk(e.base.m, e.c0)}`];
}

function consigneEcranE(phase: PhaseTangentesConique): string {
  if (phase === "eEcran1") return "Trouve les tangentes à l'hyperbole parallèles à d et leurs points de tangence (comme à la famille B). Donne les 2 points de tangence, celui de plus petite abscisse d'abord.";
  if (phase === "eEcran2") return "Calcule la distance de chacun des 2 points précédents à la droite d.";
  return "Identifie lequel des 2 points est le plus proche de d (distance minimale).";
}

function champsEcranE(phase: PhaseTangentesConique): ChampDef[] {
  if (phase === "eEcran1") return [champTexte("x du 1er point", "ex. 6", true), champTexte("y du 1er point", "ex. 15", true), champTexte("x du 2e point", "ex. -6", true), champTexte("y du 2e point", "ex. -15", true)];
  if (phase === "eEcran2") return [champTexte("Distance du 1er point à d =", "ex. 5", true), champTexte("Distance du 2e point à d =", "ex. 10", true)];
  return [
    champChoix("Point le plus proche :", [
      { valeur: "point1", label: "Le 1er point" },
      { valeur: "point2", label: "Le 2e point" },
    ]),
    champTexte("Distance minimale =", "ex. 5", true),
  ];
}

function aideE(e: ExerciceTangenteE, phase: PhaseTangentesConique, niveau: 1 | 2): AideAvecLatex {
  if (phase !== "eEcran3") return AUCUNE_AIDE;
  if (niveau === 1) return { texte: "Le point le plus proche est celui dont la distance à la droite est la plus petite des deux — compare directement les 2 valeurs trouvées à l'étape précédente.", latex: null };
  return { texte: `Rappel des 2 distances trouvées : ${formaterDecimal(e.distances[0])} et ${formaterDecimal(e.distances[1])}. La comparaison reste à faire.`, latex: null };
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function consigneGenerale(exercice: ExerciceTangentesConique): string {
  if (exercice.famille === "A") return consigneGeneraleA();
  if (exercice.famille === "B") return consigneGeneraleB();
  if (exercice.famille === "C") return consigneGeneraleC();
  if (exercice.famille === "D") return consigneGeneraleD();
  return consigneGeneraleE();
}

export function blocDonnees(exercice: ExerciceTangentesConique): string[] {
  if (exercice.famille === "A") return blocDonneesA(exercice);
  if (exercice.famille === "B") return blocDonneesB(exercice);
  if (exercice.famille === "C") return blocDonneesC(exercice);
  if (exercice.famille === "D") return blocDonneesD(exercice);
  return blocDonneesE(exercice);
}

/** État actuel — dérivé UNIQUEMENT des valeurs déjà CONFIRMÉES par un écran précédent (jamais de
 * la saisie brute), CLAUDE.md. `null` sur le tout premier écran de chaque famille (rien n'est
 * encore confirmé). ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/
 * `docs/historique-6e.md`, même bug déjà corrigé sur `formatIdentificationConiques.ts`, 6gen58) :
 * chaque écran ne montrait QUE l'info de l'écran immédiatement précédent, jamais celles d'avant.
 * Plus ancien en premier. */
export function etatActuel(exercice: ExerciceTangentesConique, phase: PhaseTangentesConique): string[] | null {
  if (exercice.famille === "A") {
    const lignes: string[] = [];
    if (phase === "aEcran2" || phase === "aEcran3") lignes.push(`\\text{Valeur confirmée (étape 1) : }${exercice.valeurConfirmation}`);
    if (phase === "aEcran3") lignes.push(`\\text{Tangente confirmée (étape 2) : }${formatDedoublementConfirmeA(exercice)}`);
    return lignes.length > 0 ? lignes : null;
  }
  if (exercice.famille === "B") {
    const lignes: string[] = [];
    if (phase === "bEcran2" || phase === "bEcran3" || phase === "bEcran4") lignes.push(`\\text{Équation en x confirmée (étape 1) : }${formatEquationXConfirmeeB(exercice)}`);
    if (phase === "bEcran3" || phase === "bEcran4") lignes.push(`\\text{Équation en k confirmée (étape 2) : }${formatEquationKConfirmeeB(exercice)}`);
    if (phase === "bEcran4") {
      const [k1, k2] = exercice.tangentes.map((t) => t.k);
      lignes.push(`\\text{Tangentes existent (étape 3), } k_1=${formaterDecimal(k1!)}\\text{, }k_2=${formaterDecimal(k2!)}`);
    }
    return lignes.length > 0 ? lignes : null;
  }
  if (exercice.famille === "C") {
    const lignes: string[] = [];
    if (phase === "cEcran2" || phase === "cEcran3" || phase === "cEcran4") lignes.push(`\\text{Équation en x confirmée (étape 1) : }${formatEquationXConfirmeeC(exercice)}`);
    if (phase === "cEcran3" || phase === "cEcran4") lignes.push(`\\text{Équation en m confirmée (étape 2) : }${formatEquationMConfirmeeC(exercice)}`);
    if (phase === "cEcran4") {
      const [m1, m2] = exercice.tangentes.map((t) => t.m);
      lignes.push(`\\text{P extérieur (étape 3), } m_1=${formaterDecimal(m1!)}\\text{, }m_2=${formaterDecimal(m2!)}`);
    }
    return lignes.length > 0 ? lignes : null;
  }
  if (exercice.famille === "D") {
    const lignes: string[] = [];
    if (phase === "dEcran2" || phase === "dEcran3" || phase === "dEcran4") lignes.push(`\\text{Équation confirmée (étape 1) : }${formatEquationPasseParPConfirmeeD(exercice)}`);
    if (phase === "dEcran3" || phase === "dEcran4") lignes.push(`\\text{Équation de tangence confirmée (étape 2) : }${formatEquationTangenceConfirmeeD(exercice)}`);
    if (phase === "dEcran4") lignes.push(`a^2=${exercice.a * exercice.a}\\text{, }b^2=${exercice.b * exercice.b}\\text{ (confirmés, étape 3)}`);
    return lignes.length > 0 ? lignes : null;
  }
  // Famille E.
  const lignes: string[] = [];
  if (phase === "eEcran2" || phase === "eEcran3") {
    const [pt1, pt2] = exercice.base.tangentes.map((t) => t.point);
    lignes.push(`\\text{Point 1 (étape 1) : }${afficherPoint(pt1!)}`, `\\text{Point 2 (étape 1) : }${afficherPoint(pt2!)}`);
  }
  if (phase === "eEcran3") {
    lignes.push(`\\text{Distance 1 (étape 2) : }${formaterDecimal(exercice.distances[0])}`, `\\text{Distance 2 (étape 2) : }${formaterDecimal(exercice.distances[1])}`);
  }
  return lignes.length > 0 ? lignes : null;
}

export function consigneEcran(exercice: ExerciceTangentesConique, phase: PhaseTangentesConique): string {
  if (exercice.famille === "A") return consigneEcranA(phase);
  if (exercice.famille === "B") return consigneEcranB(phase);
  if (exercice.famille === "C") return consigneEcranC(phase);
  if (exercice.famille === "D") return consigneEcranD(phase);
  return consigneEcranE(phase);
}

export function champsEcran(exercice: ExerciceTangentesConique, phase: PhaseTangentesConique): ChampDef[] {
  if (exercice.famille === "A") return champsEcranA(phase);
  if (exercice.famille === "B") return champsEcranB(exercice, phase);
  if (exercice.famille === "C") return champsEcranC(exercice, phase);
  if (exercice.famille === "D") return champsEcranD(phase);
  return champsEcranE(phase);
}

export function aideNiveau1(exercice: ExerciceTangentesConique, phase: PhaseTangentesConique): AideAvecLatex {
  if (exercice.famille === "A") return aideA(exercice, phase, 1);
  if (exercice.famille === "B") return aideB(exercice, phase, 1);
  if (exercice.famille === "C") return aideC(exercice, phase, 1);
  if (exercice.famille === "D") return aideD(exercice, phase, 1);
  return aideE(exercice, phase, 1);
}

export function aideNiveau2(exercice: ExerciceTangentesConique, phase: PhaseTangentesConique): AideAvecLatex {
  if (exercice.famille === "A") return aideA(exercice, phase, 2);
  if (exercice.famille === "B") return aideB(exercice, phase, 2);
  if (exercice.famille === "C") return aideC(exercice, phase, 2);
  if (exercice.famille === "D") return aideD(exercice, phase, 2);
  return aideE(exercice, phase, 2);
}

/** 2 niveaux d'aide sur l'écran désigné par la mission pour chaque famille (A→écran2 ; B/C/D/E→
 * écran3), `0` partout ailleurs. */
export function niveauAideMaxEcran(exercice: ExerciceTangentesConique, phase: PhaseTangentesConique): number {
  const ecranAvecAide: Record<ExerciceTangentesConique["famille"], PhaseTangentesConique> = { A: "aEcran2", B: "bEcran3", C: "cEcran3", D: "dEcran3", E: "eEcran3" };
  return phase === ecranAvecAide[exercice.famille] ? 2 : 0;
}

// ============================================================================
// Récapitulatif final — libellés + réponse CORRECTE connue de l'exercice (jamais recalculée depuis
// la saisie élève) + total à maximum VARIABLE (100 × nombre d'écrans réellement traversés).
// ============================================================================

export const LIBELLE_PHASE: Record<PhaseTangentesConique, string> = {
  aEcran1: "Étape 1 (vérification de P)",
  aEcran2: "Étape 2 (dédoublement)",
  aEcran3: "Étape 3 (équation finale)",
  bEcran1: "Étape 1 (équation en x)",
  bEcran2: "Étape 2 (équation en k)",
  bEcran3: "Étape 3 (conclusion)",
  bEcran4: "Étape 4 (tangentes complètes)",
  cEcran1: "Étape 1 (équation en x)",
  cEcran2: "Étape 2 (équation en m)",
  cEcran3: "Étape 3 (conclusion)",
  cEcran4: "Étape 4 (tangentes complètes)",
  dEcran1: "Étape 1 (passe par P)",
  dEcran2: "Étape 2 (tangence)",
  dEcran3: "Étape 3 (a² et b²)",
  dEcran4: "Étape 4 (équation finale)",
  eEcran1: "Étape 1 (points de tangence)",
  eEcran2: "Étape 2 (distances)",
  eEcran3: "Étape 3 (point le plus proche)",
};

export const LIBELLE_FAMILLE: Record<ExerciceTangentesConique["famille"], string> = {
  A: "A — Tangente en un point donné",
  B: "B — Tangentes parallèles à une droite",
  C: "C — Tangentes depuis un point",
  D: "D — Construire une conique",
  E: "E — Point le plus proche d'une droite",
};

function afficherTangenteLatex(equation: string, point: Point): string {
  return `${equation}\\text{, point }${afficherPoint(point)}`;
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceTangentesConique, phase: PhaseTangentesConique): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [`${exercice.valeurConfirmation}`];
    // aEcran2/aEcran3 partagent la même cible algébrique (voir verificationTangentesConique.ts).
    return ["\\text{équation de la tangente (voir bloc de travail)}"];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1" || phase === "bEcran2") return ["\\text{(équation intermédiaire, voir bloc de travail)}"];
    if (phase === "bEcran3") return exercice.aSolution ? [`\\text{Tangentes existent, }k=\\pm${formaterDecimal(exercice.tangentes[0]!.k)}`] : ["\\text{Aucune tangente réelle}"];
    return exercice.tangentes.map((t) => afficherTangenteLatex(afficherDroiteYmxk(exercice.m, t.k), t.point));
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1" || phase === "cEcran2") return ["\\text{(équation intermédiaire, voir bloc de travail)}"];
    if (phase === "cEcran3") return exercice.aSolution ? [`\\text{P extérieur, }m_1=${formaterDecimal(exercice.tangentes[0]!.m)}\\text{, }m_2=${formaterDecimal(exercice.tangentes[1]!.m)}`] : ["\\text{P intérieur, aucune tangente réelle}"];
    return exercice.tangentes.map((t) => afficherTangenteLatex(afficherDroiteYmxk(t.m, t.point.y - t.m * t.point.x), t.point));
  }
  if (exercice.famille === "D") {
    if (phase === "dEcran1" || phase === "dEcran2") return ["\\text{(équation intermédiaire, voir bloc de travail)}"];
    if (phase === "dEcran3") return [`a^2=${exercice.a * exercice.a}\\text{, }b^2=${exercice.b * exercice.b}`];
    const signe = exercice.natureCible === "ellipse" ? "+" : "-";
    return [`\\frac{x^2}{${exercice.a * exercice.a}}${signe}\\frac{y^2}{${exercice.b * exercice.b}}=1`];
  }
  // Famille E.
  const [pt1, pt2] = exercice.base.tangentes.map((t) => t.point);
  if (phase === "eEcran1") return [`\\text{Point 1 : }${afficherPoint(pt1!)}\\text{, Point 2 : }${afficherPoint(pt2!)}`];
  if (phase === "eEcran2") return [`d_1=${formaterDecimal(exercice.distances[0])}\\text{, }d_2=${formaterDecimal(exercice.distances[1])}`];
  return [`\\text{Point }${exercice.indexPlusProche + 1}\\text{, distance }=${formaterDecimal(exercice.distances[exercice.indexPlusProche])}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice, familles B/C/E n'ayant pas toutes le même nombre selon `aSolution`). */
export function calculerTotalPointsTangentesConique(resultat: ResultatExerciceTangentesConique): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
