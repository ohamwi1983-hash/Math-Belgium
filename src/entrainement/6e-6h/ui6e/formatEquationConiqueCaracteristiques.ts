import type { DonneeConiqueC, ExerciceEquationConiqueCaracteristiques, ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleD, FractionExacte } from "../core6e/equationConiqueCaracteristiques.types";
import type { PhaseEquationConiqueCaracteristiques, ResultatExerciceEquationConiqueCaracteristiques } from "../moteur6e/typesEquationConiqueCaracteristiques";
import { phasesPourExercice } from "../moteur6e/typesEquationConiqueCaracteristiques";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen59`. Dispatch sur
 * `exercice.famille` PUIS `sousType` PUIS `phase`, mirroir `formatIdentificationConiques.ts`
 * (6gen58), jamais importé par un autre générateur (chaque générateur reste indépendant —
 * CLAUDE.md).
 *
 * **Écran 1 famille B, choix de forme générale plutôt que texte libre** : le "champ posé" de la
 * mission (`(y-k)²=4p(x-h)` avec `p` symbolique) contient une lettre `p` NON RÉSOLUE — un champ
 * texte libre exigerait un évaluateur symbolique (aucun installé sur ce projet, convention CLAUDE.md
 * "jamais de bibliothèque de calcul formel") ou accepterait `p` comme une simple variable
 * (`expressionQuadratiqueXY.ts` n'en connaît que `x`,`y`). Remplacé par un choix `.btn.toggle-active`
 * entre les 2 gabarits déjà remplis de `h`,`k` — teste EXACTEMENT la même reconnaissance (quelle
 * forme s'applique), sans jamais soumettre `p` à un parseur numérique.
 *
 * **Vigilance signe orphelin / texte français en mode maths** — toute clause en français mêlée à du
 * LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths. Couverture de
 * régression : `formatEquationConiqueCaracteristiques.test.ts`.
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
  /** `true` pour un label réduit à une lettre de variable (ex. "a =", "c ="), voir
   * `.field-label-minuscule` (`App.css`). */
  minuscule?: boolean;
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

// ============================================================================
// Petits formateurs numériques/LaTeX partagés.
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function afficherFraction(num: number, den: number): string {
  const g = pgcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return `${n}`;
  return n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`;
}

function afficherFractionExacte(f: FractionExacte): string {
  return afficherFraction(f.num, f.den);
}

/** Fraction en TEXTE BRUT ("4/3", jamais `\frac{4}{3}`) — pour un `champ.label`, qui n'est JAMAIS
 * passé par KaTeX (rendu tel quel dans un `<label>` par
 * `EtapeChampsEquationConiqueCaracteristiques.tsx`) : y injecter du LaTeX afficherait le code source
 * brut ("\frac{4}{3}") au lieu d'une fraction — piège trouvé et corrigé pendant le développement
 * (`docs/historique-6e.md`, capture Playwright 375px). `afficherFractionExacte` (LaTeX) reste
 * réservé aux fragments passés à `<Katex>` (`blocDonnees`/`etatActuel`). */
function afficherFractionTexte(f: FractionExacte): string {
  const g = pgcd(f.num, f.den);
  const n = f.num / g;
  const d = f.den / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

/** `gauche-valeur`, signe géré proprement — jamais `gauche-(-3)` (double signe "−−" non simplifié,
 * CLAUDE.md, point "simplification algébrique") : un sommet `h`/`k` négatif (famille B, tiré dans
 * [-4;4]) doit s'afficher `gauche+3`, jamais `gauche-(-3)`. `gauche` peut être une variable
 * symbolique ("x") ou une coordonnée numérique déjà connue (`pt.x`, aide niveau 2) — les 2 cas
 * partagent la même règle de signe. */
function afficherDifference(gauche: string | number, valeur: number): string {
  if (valeur === 0) return `${gauche}`;
  return valeur > 0 ? `${gauche}-${valeur}` : `${gauche}+${-valeur}`;
}

const LIBELLE_NATURE_ELLIPSE_HYPERBOLE: Record<"ellipse" | "hyperbole", string> = { ellipse: "Ellipse", hyperbole: "Hyperbole" };

const OPTIONS_NATURE_C: OptionChoix[] = [
  { valeur: "ellipse", label: "Ellipse (e < 1)" },
  { valeur: "hyperbole", label: "Hyperbole (e > 1)" },
];

function optionsNatureMemeAxe(a: number, c: number): OptionChoix[] {
  return [
    { valeur: "ellipse", label: `Ellipse (a > c, ici ${a} > ${c} vérifié à confirmer)` },
    { valeur: "hyperbole", label: `Hyperbole (c > a)` },
  ];
}

const OPTIONS_AXE: OptionChoix[] = [
  { valeur: "horizontal", label: "Axe horizontal" },
  { valeur: "vertical", label: "Axe vertical" },
];

// ============================================================================
// Famille A, sous-type "même axe".
// ============================================================================

type ExoMemeAxe = Extract<ExerciceFamilleA, { sousType: "memeAxe" }>;
type ExoAxesPerp = Extract<ExerciceFamilleA, { sousType: "axesPerpendiculaires" }>;
type ExoDeuxSommets = Extract<ExerciceFamilleA, { sousType: "deuxSommets" }>;

function pointSommetFoyerMemeAxe(e: ExoMemeAxe): { s: { x: number; y: number }; f: { x: number; y: number } } {
  if (e.axe === "horizontal") return { s: { x: e.signeS * e.a, y: 0 }, f: { x: e.signeF * e.c, y: 0 } };
  return { s: { x: 0, y: e.signeS * e.a }, f: { x: 0, y: e.signeF * e.c } };
}

export function consigneGeneraleAMemeAxe(): string {
  return "On donne un sommet S et un foyer F d'une conique centrée à l'origine, tous les deux sur le MÊME axe. Détermine s'il s'agit d'une ellipse ou d'une hyperbole, puis construis son équation.";
}

export function blocDonneesAMemeAxe(e: ExoMemeAxe): string[] {
  const { s, f } = pointSommetFoyerMemeAxe(e);
  return [`\\text{Sommet : }S(${s.x};${s.y})`, `\\text{Foyer : }F(${f.x};${f.y})`];
}

export function consigneEcranAMemeAxe(_e: ExoMemeAxe, phase: PhaseEquationConiqueCaracteristiques): string {
  if (phase === "aMemeAxeEcran1") return "Extrais les distances a=|S| et c=|F| (par rapport au centre, à l'origine).";
  if (phase === "aMemeAxeEcran2") return "Compare a et c pour déterminer la nature exacte, puis calcule b² avec la formule appropriée (b²=a²-c² pour une ellipse, b²=c²-a² pour une hyperbole).";
  return "À partir de la nature et de b² CONFIRMÉS, donne l'équation finale de la conique.";
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, même bug déjà corrigé sur `formatIdentificationConiques.ts`, 6gen58) : `aMemeAxeEcran3` ne
 * montrait QUE l'info de `aMemeAxeEcran2`, jamais celle de `aMemeAxeEcran1`. Plus ancien en premier. */
export function etatActuelAMemeAxe(e: ExoMemeAxe, phase: PhaseEquationConiqueCaracteristiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "aMemeAxeEcran2" || phase === "aMemeAxeEcran3") {
    lignes.push(`a=${e.a}\\text{, }c=${e.c}\\text{ (confirmés, étape 1)}`);
  }
  if (phase === "aMemeAxeEcran3") {
    lignes.push(`\\text{Nature : }\\textbf{${LIBELLE_NATURE_ELLIPSE_HYPERBOLE[e.natureCible]}}\\text{, }b^2=${e.bCarre}\\text{ (confirmés, étape 2)}`);
  }
  return lignes.length > 0 ? lignes : null;
}

export function champsAMemeAxe(e: ExoMemeAxe, phase: PhaseEquationConiqueCaracteristiques): ChampDef[] {
  if (phase === "aMemeAxeEcran1") return [champTexte("a =", "ex : 5", true), champTexte("c =", "ex : 3", true)];
  if (phase === "aMemeAxeEcran2") return [champChoix("Nature =", optionsNatureMemeAxe(e.a, e.c)), champTexte("b² =", "ex : 16", true)];
  return [champTexte("Équation finale =", "ex : x^2/25+y^2/16=1")];
}

// ============================================================================
// Famille A, sous-type "axes perpendiculaires" — PIÈGE CENTRAL.
// ============================================================================

function pointSommetFoyerAxesPerp(e: ExoAxesPerp): { s: { x: number; y: number }; f: { x: number; y: number } } {
  if (e.axePrincipal === "horizontal") return { s: { x: 0, y: e.signeS * e.b }, f: { x: e.signeF * e.c, y: 0 } };
  return { s: { x: e.signeS * e.b, y: 0 }, f: { x: 0, y: e.signeF * e.c } };
}

export function consigneGeneraleAAxesPerp(): string {
  return "On donne un sommet S d'une ellipse centrée à l'origine, sur un axe, ET un foyer F sur l'axe PERPENDICULAIRE. Attention : c'est la position du foyer, jamais celle de S, qui détermine l'axe principal.";
}

export function blocDonneesAAxesPerp(e: ExoAxesPerp): string[] {
  const { s, f } = pointSommetFoyerAxesPerp(e);
  return [`\\text{Sommet : }S(${s.x};${s.y})`, `\\text{Foyer : }F(${f.x};${f.y})`];
}

export function consigneEcranAAxesPerp(_e: ExoAxesPerp, phase: PhaseEquationConiqueCaracteristiques): string {
  if (phase === "aAxesPerpEcran1") return "Quel axe est l'axe PRINCIPAL (celui qui portera a) ? Et que vaut b (le sommet donné S, sur l'axe secondaire) ?";
  if (phase === "aAxesPerpEcran2") return "À partir de b CONFIRMÉ, calcule c=|F| puis a²=b²+c².";
  return "À partir de c et a² CONFIRMÉS, donne l'équation finale.";
}

/** ACCUMULE les écrans déjà confirmés — même correctif que `etatActuelAMemeAxe` (voir sa doc-string). */
export function etatActuelAAxesPerp(e: ExoAxesPerp, phase: PhaseEquationConiqueCaracteristiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "aAxesPerpEcran2" || phase === "aAxesPerpEcran3") {
    lignes.push(`\\text{Axe principal : }\\textbf{${e.axePrincipal}}\\text{, }b=${e.b}\\text{ (confirmés, étape 1)}`);
  }
  if (phase === "aAxesPerpEcran3") {
    lignes.push(`c=${e.c}\\text{, }a^2=${e.aCarre}\\text{ (confirmés, étape 2)}`);
  }
  return lignes.length > 0 ? lignes : null;
}

export function champsAAxesPerp(_e: ExoAxesPerp, phase: PhaseEquationConiqueCaracteristiques): ChampDef[] {
  if (phase === "aAxesPerpEcran1") {
    return [
      champChoix("Axe principal =", [
        { valeur: "axeS", label: "L'axe qui porte S" },
        { valeur: "axeF", label: "L'axe qui porte F" },
      ]),
      champTexte("b =", "ex : 3", true),
    ];
  }
  if (phase === "aAxesPerpEcran2") return [champTexte("c =", "ex : 4", true), champTexte("a² =", "ex : 25", true)];
  return [champTexte("Équation finale =", "ex : x^2/25+y^2/9=1")];
}

export function niveauAideMaxAAxesPerp(phase: PhaseEquationConiqueCaracteristiques): number {
  return phase === "aAxesPerpEcran1" ? 2 : 0;
}

export function aideNiveau1AAxesPerp(): AideAvecLatex {
  return { texte: "Les foyers d'une ellipse se trouvent TOUJOURS sur l'axe principal (le plus long) — le sommet donné sur l'AUTRE axe est donc le sommet secondaire, jamais le sommet principal.", latex: null };
}

export function aideNiveau2AAxesPerp(e: ExoAxesPerp): AideAvecLatex {
  return { texte: "Axe principal identifié (rôle de S non déduit) :", latex: `\\text{axe principal : }\\textbf{${e.axePrincipal}}` };
}

// ============================================================================
// Famille A, sous-type "2 sommets".
// ============================================================================

export function consigneGeneraleADeuxSommets(): string {
  return "On donne 2 sommets d'une ellipse centrée à l'origine, sur 2 axes perpendiculaires. Identifie quel sommet correspond à quel axe, puis donne l'équation.";
}

export function blocDonneesADeuxSommets(e: ExoDeuxSommets): string[] {
  return [`\\text{Sommet : }S(${e.signeSommetX * e.sommetX};0)`, `\\text{Sommet : }S'(0;${e.signeSommetY * e.sommetY})`];
}

export function consigneEcranADeuxSommets(_e: ExoDeuxSommets, phase: PhaseEquationConiqueCaracteristiques): string {
  if (phase === "aDeuxSommetsEcran1") return "Identifie a (sommet sur l'axe des x) et b (sommet sur l'axe des y).";
  return "À partir de a et b CONFIRMÉS, donne l'équation finale.";
}

export function etatActuelADeuxSommets(e: ExoDeuxSommets, phase: PhaseEquationConiqueCaracteristiques): string[] | null {
  if (phase === "aDeuxSommetsEcran2") return [`a=${e.sommetX}\\text{, }b=${e.sommetY}\\text{ (confirmés)}`];
  return null;
}

export function champsADeuxSommets(_e: ExoDeuxSommets, phase: PhaseEquationConiqueCaracteristiques): ChampDef[] {
  if (phase === "aDeuxSommetsEcran1") return [champTexte("a (sur l'axe des x) =", "ex : 5", true), champTexte("b (sur l'axe des y) =", "ex : 3", true)];
  return [champTexte("Équation finale =", "ex : x^2/25+y^2/9=1")];
}

// ============================================================================
// Famille B — parabole.
// ============================================================================

const OPTIONS_FORME_GENERALE = (e: ExerciceFamilleB): OptionChoix[] => [
  { valeur: "horizontal", label: `Axe horizontal : (${afficherDifference("y", e.k)})² = 4p(${afficherDifference("x", e.h)})` },
  { valeur: "vertical", label: `Axe vertical : (${afficherDifference("x", e.h)})² = 4p(${afficherDifference("y", e.k)})` },
];

export function consigneGeneraleB(): string {
  return "On donne le sommet d'une parabole et, selon le cas, son foyer ou un point de passage. Détermine la forme générale adaptée, la valeur signée de p, puis l'équation finale.";
}

export function blocDonneesB(e: ExerciceFamilleB): string[] {
  const lignes = [`\\text{Sommet : }S(${e.h};${e.k})`];
  if (e.donneeType === "foyer") lignes.push(`\\text{Foyer : }F(${e.foyer!.x};${e.foyer!.y})`);
  else lignes.push(`\\text{Point de passage : }P(${e.point!.x};${e.point!.y})`);
  return lignes;
}

export function consigneEcranB(e: ExerciceFamilleB, phase: PhaseEquationConiqueCaracteristiques): string {
  if (phase === "bEcran1") return "Identifie l'axe de symétrie (donc la forme générale adaptée) depuis les données.";
  if (phase === "bEcran2") {
    return e.donneeType === "foyer"
      ? "Calcule p = distance signée du sommet au foyer, dans la direction de l'axe (attention au signe : au-delà ou en-deçà du sommet)."
      : "Substitue les coordonnées du point de passage dans la forme générale CONFIRMÉE à l'étape précédente, et résous pour p — attention au signe.";
  }
  return "Assemble l'équation finale, en vérifiant que l'orientation est cohérente avec le signe de p CONFIRMÉ.";
}

/** ACCUMULE les écrans déjà confirmés — même correctif que `etatActuelAMemeAxe` (voir sa doc-string). */
export function etatActuelB(e: ExerciceFamilleB, phase: PhaseEquationConiqueCaracteristiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "bEcran2" || phase === "bEcran3") {
    lignes.push(`\\text{Axe : }\\textbf{${e.axe}}\\text{ (confirmé, étape 1)}`);
  }
  if (phase === "bEcran3") lignes.push(`p=${e.p}\\text{ (confirmé, étape 2)}`);
  return lignes.length > 0 ? lignes : null;
}

export function champsB(e: ExerciceFamilleB, phase: PhaseEquationConiqueCaracteristiques): ChampDef[] {
  if (phase === "bEcran1") return [champChoix("Forme générale adaptée =", OPTIONS_FORME_GENERALE(e))];
  if (phase === "bEcran2") return [champTexte("p (signé) =", "ex : -3")];
  return [champTexte("Équation finale =", "ex : (y-2)^2=12*(x-1)")];
}

export function niveauAideMaxB(e: ExerciceFamilleB, phase: PhaseEquationConiqueCaracteristiques): number {
  return phase === "bEcran2" && e.donneeType === "point" ? 2 : 0;
}

export function aideNiveau1B(e: ExerciceFamilleB, phase: PhaseEquationConiqueCaracteristiques): AideAvecLatex {
  if (phase === "bEcran2" && e.donneeType === "point") return { texte: "Substitue les coordonnées du point de passage dans la forme générale posée à l'étape précédente, pour isoler p.", latex: null };
  return AUCUNE_AIDE;
}

export function aideNiveau2B(e: ExerciceFamilleB, phase: PhaseEquationConiqueCaracteristiques): AideAvecLatex {
  if (phase === "bEcran2" && e.donneeType === "point") {
    const pt = e.point!;
    const latex = e.axe === "horizontal" ? `(${afficherDifference(pt.y, e.k)})^2=4p(${afficherDifference(pt.x, e.h)})` : `(${afficherDifference(pt.x, e.h)})^2=4p(${afficherDifference(pt.y, e.k)})`;
    return { texte: "Substitution effectuée (résolution pour p non faite) :", latex };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C.
// ============================================================================

const LIBELLE_DONNEE_C: Record<DonneeConiqueC, string> = {
  deuxC: "2c",
  excentricite: "e",
  distanceDirectrices: "d (distance entre les directrices)",
  deuxA: "2a",
};

const OPTIONS_RELATION_C: OptionChoix[] = [
  { valeur: "deuxC", label: "c = (distance focale)/2, soit 2c = |FF'|" },
  { valeur: "excentricite", label: "e = c/a" },
  { valeur: "distanceDirectrices", label: "distance entre les directrices = 2a²/c" },
  { valeur: "deuxA", label: "2a = distance entre les sommets" },
];

export function consigneGeneraleC(): string {
  return "On donne 2 caractéristiques parmi {2c, e, distance entre les directrices, 2a} d'une conique centrée à l'origine (l'axe des foyers est précisé). Identifie les relations, combine-les pour trouver a et c, détermine le type, puis donne l'équation.";
}

export function blocDonneesC(e: ExerciceFamilleC): string[] {
  // Phrase volontairement COURTE (jamais la formulation complète "Les foyers sont situés sur
  // l'axe...") — un `\text{...}` KaTeX ne se scinde jamais sur plusieurs lignes : une phrase trop
  // longue déborde silencieusement du cadre mobile (375px), un conteneur interne `overflow-x:auto`
  // absorbant le débordement SANS jamais faire remonter `document.body.scrollWidth` (piège trouvé
  // par inspection visuelle d'une capture 375px — voir `docs/historique-6e.md`).
  const axeTexte = e.axeTransverse === "horizontal" ? "Ox" : "Oy";
  return [`\\text{Foyers sur l'axe ${axeTexte}.}`, `${LIBELLE_DONNEE_C[e.donnee1].split(" ")[0]}=${afficherFractionExacte(e.valeurDonnee1)}`, `${LIBELLE_DONNEE_C[e.donnee2].split(" ")[0]}=${afficherFractionExacte(e.valeurDonnee2)}`];
}

export function consigneEcranC(_e: ExerciceFamilleC, phase: PhaseEquationConiqueCaracteristiques): string {
  if (phase === "cEcran1") return "Pour chacune des 2 données ci-dessus, identifie la relation qui la relie à a, b, c ou e — SANS la résoudre encore.";
  if (phase === "cEcran2") return "Combine les 2 relations CONFIRMÉES pour isoler a (et c).";
  if (phase === "cEcran3") return "Détermine le type de conique (e<1 : ellipse ; e>1 : hyperbole — ne le suppose JAMAIS par défaut), puis calcule b² avec la formule appropriée à ce type.";
  return "À partir du type et de b² CONFIRMÉS, donne l'équation finale.";
}

/** ACCUMULE les écrans déjà confirmés — même correctif que `etatActuelAMemeAxe` (voir sa doc-string) ;
 * famille C a 4 écrans, donc `cEcran4` doit montrer les 3 lignes de `cEcran1`/2/3, jamais seulement
 * celle de `cEcran3`. */
export function etatActuelC(e: ExerciceFamilleC, phase: PhaseEquationConiqueCaracteristiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "cEcran2" || phase === "cEcran3" || phase === "cEcran4") {
    lignes.push(`\\text{Relations confirmées (étape 1) : ${LIBELLE_DONNEE_C[e.donnee1]} et ${LIBELLE_DONNEE_C[e.donnee2]}}`);
  }
  if (phase === "cEcran3" || phase === "cEcran4") lignes.push(`a=${e.a}\\text{, }c=${e.c}\\text{ (confirmés, étape 2)}`);
  if (phase === "cEcran4") lignes.push(`\\text{Type : }\\textbf{${LIBELLE_NATURE_ELLIPSE_HYPERBOLE[e.natureCible]}}\\text{, }b^2=${e.bCarre}\\text{ (confirmés, étape 3)}`);
  return lignes.length > 0 ? lignes : null;
}

export function champsC(e: ExerciceFamilleC, phase: PhaseEquationConiqueCaracteristiques): ChampDef[] {
  if (phase === "cEcran1") {
    return [champChoix(`Relation pour la donnée « ${LIBELLE_DONNEE_C[e.donnee1].split(" ")[0]}=${afficherFractionTexte(e.valeurDonnee1)} » =`, OPTIONS_RELATION_C), champChoix(`Relation pour la donnée « ${LIBELLE_DONNEE_C[e.donnee2].split(" ")[0]}=${afficherFractionTexte(e.valeurDonnee2)} » =`, OPTIONS_RELATION_C)];
  }
  if (phase === "cEcran2") return [champTexte("a =", "ex : 5", true), champTexte("c =", "ex : 3", true)];
  if (phase === "cEcran3") return [champChoix("Type de conique =", OPTIONS_NATURE_C), champTexte("b² =", "ex : 16", true)];
  return [champTexte("Équation finale =", "ex : x^2/25+y^2/16=1")];
}

export function niveauAideMaxC(phase: PhaseEquationConiqueCaracteristiques): number {
  return phase === "cEcran1" ? 2 : 0;
}

export function aideNiveau1C(): AideAvecLatex {
  return { texte: "4 relations possibles : c=|FF'|/2 ; e=c/a ; distance entre les directrices=2a/e (=2a²/c) ; 2a=distance entre les sommets. Identifie lesquelles correspondent aux 2 données de l'énoncé.", latex: null };
}

export function aideNiveau2C(e: ExerciceFamilleC): AideAvecLatex {
  return { texte: "1ʳᵉ relation déjà posée (la 2ᵉ non déduite) :", latex: `\\text{${LIBELLE_DONNEE_C[e.donnee1]}}` };
}

// ============================================================================
// Famille D — hyperbole depuis une asymptote.
// ============================================================================

function libelleDonneeD(e: ExerciceFamilleD): string {
  if (e.sousType === "sommet") return `\\text{Sommet : }S(${e.sommet!.x};${e.sommet!.y})`;
  if (e.sousType === "foyer") return `\\text{Foyer : }F(${e.foyer!.x};${e.foyer!.y})`;
  return `2c=${e.distanceFocale}`;
}

export function consigneGeneraleD(): string {
  return "On donne une asymptote d'une hyperbole centrée à l'origine et un autre élément (sommet, foyer, ou distance focale). Identifie l'axe transverse et le rapport donné par la pente, reconstruis a et b, puis l'équation.";
}

export function blocDonneesD(e: ExerciceFamilleD): string[] {
  const lignes = [`y=\\pm${afficherFractionExacte(e.pente)}x\\text{ (asymptotes)}`, libelleDonneeD(e)];
  if (e.sousType === "distanceFocale") {
    // Phrase COURTE — voir le commentaire équivalent dans `blocDonneesC` (même piège de
    // débordement mobile évité).
    const axeTexte = e.axeTransverse === "horizontal" ? "Ox" : "Oy";
    lignes.push(`\\text{Axe transverse : ${axeTexte}.}`);
  }
  return lignes;
}

export function consigneEcranD(e: ExerciceFamilleD, phase: PhaseEquationConiqueCaracteristiques): string {
  if (phase === "dEcran1") return "Identifie l'axe transverse et le rapport (b/a si horizontal, a/b si vertical — jamais l'inverse) donné par la pente de l'asymptote.";
  if (phase === "dEcran2") return e.sousType === "sommet" ? "a est déjà connu directement : déduis b à partir du rapport CONFIRMÉ." : "Résous le système {rapport CONFIRMÉ, c²=a²+b²} pour trouver a et b séparément.";
  return "À partir de a et b CONFIRMÉS, donne l'équation finale.";
}

/** ACCUMULE les écrans déjà confirmés — même correctif que `etatActuelAMemeAxe` (voir sa doc-string). */
export function etatActuelD(e: ExerciceFamilleD, phase: PhaseEquationConiqueCaracteristiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "dEcran2" || phase === "dEcran3") {
    lignes.push(`\\text{Axe transverse : }\\textbf{${e.axeTransverse}}\\text{, rapport}=${afficherFractionExacte(e.pente)}\\text{ (confirmés, étape 1)}`);
  }
  if (phase === "dEcran3") lignes.push(`a=${e.a}\\text{, }b=${e.b}\\text{ (confirmés, étape 2)}`);
  return lignes.length > 0 ? lignes : null;
}

export function champsD(e: ExerciceFamilleD, phase: PhaseEquationConiqueCaracteristiques): ChampDef[] {
  if (phase === "dEcran1") return [champChoix("Axe transverse =", OPTIONS_AXE), champTexte("Rapport (valeur absolue) =", "ex : 3/4")];
  if (phase === "dEcran2") {
    if (e.sousType === "sommet") return [champTexte("b =", "ex : 4", true)];
    return [champTexte("a =", "ex : 3", true), champTexte("b =", "ex : 4", true)];
  }
  return [champTexte("Équation finale =", "ex : x^2/9-y^2/16=1")];
}

export function niveauAideMaxD(phase: PhaseEquationConiqueCaracteristiques): number {
  return phase === "dEcran1" ? 2 : 0;
}

export function aideNiveau1D(): AideAvecLatex {
  return { texte: "Les asymptotes d'une hyperbole d'axe transverse HORIZONTAL ont pour pente ±b/a ; d'axe transverse VERTICAL, ±a/b — identifie d'abord l'axe, avant d'extraire le rapport.", latex: null };
}

export function aideNiveau2D(e: ExerciceFamilleD): AideAvecLatex {
  return { texte: "Axe transverse identifié (rapport non extrait) :", latex: `\\text{axe transverse : }\\textbf{${e.axeTransverse}}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceEquationConiqueCaracteristiques): string {
  if (exercice.famille === "A") {
    if (exercice.sousType === "memeAxe") return consigneGeneraleAMemeAxe();
    if (exercice.sousType === "axesPerpendiculaires") return consigneGeneraleAAxesPerp();
    return consigneGeneraleADeuxSommets();
  }
  if (exercice.famille === "B") return consigneGeneraleB();
  if (exercice.famille === "C") return consigneGeneraleC();
  return consigneGeneraleD();
}

export function blocDonnees(exercice: ExerciceEquationConiqueCaracteristiques): string[] {
  if (exercice.famille === "A") {
    if (exercice.sousType === "memeAxe") return blocDonneesAMemeAxe(exercice);
    if (exercice.sousType === "axesPerpendiculaires") return blocDonneesAAxesPerp(exercice);
    return blocDonneesADeuxSommets(exercice);
  }
  if (exercice.famille === "B") return blocDonneesB(exercice);
  if (exercice.famille === "C") return blocDonneesC(exercice);
  return blocDonneesD(exercice);
}

export function consigneEcran(exercice: ExerciceEquationConiqueCaracteristiques, phase: PhaseEquationConiqueCaracteristiques): string {
  if (exercice.famille === "A") {
    if (exercice.sousType === "memeAxe") return consigneEcranAMemeAxe(exercice, phase);
    if (exercice.sousType === "axesPerpendiculaires") return consigneEcranAAxesPerp(exercice, phase);
    return consigneEcranADeuxSommets(exercice, phase);
  }
  if (exercice.famille === "B") return consigneEcranB(exercice, phase);
  if (exercice.famille === "C") return consigneEcranC(exercice, phase);
  return consigneEcranD(exercice, phase);
}

export function etatActuel(exercice: ExerciceEquationConiqueCaracteristiques, phase: PhaseEquationConiqueCaracteristiques): string[] | null {
  if (exercice.famille === "A") {
    if (exercice.sousType === "memeAxe") return etatActuelAMemeAxe(exercice, phase);
    if (exercice.sousType === "axesPerpendiculaires") return etatActuelAAxesPerp(exercice, phase);
    return etatActuelADeuxSommets(exercice, phase);
  }
  if (exercice.famille === "B") return etatActuelB(exercice, phase);
  if (exercice.famille === "C") return etatActuelC(exercice, phase);
  return etatActuelD(exercice, phase);
}

export function champsEcran(exercice: ExerciceEquationConiqueCaracteristiques, phase: PhaseEquationConiqueCaracteristiques): ChampDef[] {
  if (exercice.famille === "A") {
    if (exercice.sousType === "memeAxe") return champsAMemeAxe(exercice, phase);
    if (exercice.sousType === "axesPerpendiculaires") return champsAAxesPerp(exercice, phase);
    return champsADeuxSommets(exercice, phase);
  }
  if (exercice.famille === "B") return champsB(exercice, phase);
  if (exercice.famille === "C") return champsC(exercice, phase);
  return champsD(exercice, phase);
}

export function niveauAideMaxEcran(exercice: ExerciceEquationConiqueCaracteristiques, phase: PhaseEquationConiqueCaracteristiques): number {
  if (exercice.famille === "A") {
    if (exercice.sousType === "axesPerpendiculaires") return niveauAideMaxAAxesPerp(phase);
    return 0;
  }
  if (exercice.famille === "B") return niveauAideMaxB(exercice, phase);
  if (exercice.famille === "C") return niveauAideMaxC(phase);
  return niveauAideMaxD(phase);
}

export function aideNiveau1(exercice: ExerciceEquationConiqueCaracteristiques, phase: PhaseEquationConiqueCaracteristiques): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  if (exercice.famille === "A") return aideNiveau1AAxesPerp();
  if (exercice.famille === "B") return aideNiveau1B(exercice, phase);
  if (exercice.famille === "C") return aideNiveau1C();
  return aideNiveau1D();
}

export function aideNiveau2(exercice: ExerciceEquationConiqueCaracteristiques, phase: PhaseEquationConiqueCaracteristiques): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  if (exercice.famille === "A" && exercice.sousType === "axesPerpendiculaires") return aideNiveau2AAxesPerp(exercice);
  if (exercice.famille === "B") return aideNiveau2B(exercice, phase);
  if (exercice.famille === "C") return aideNiveau2C(exercice);
  if (exercice.famille === "D") return aideNiveau2D(exercice);
  /* c8 ignore next */
  return AUCUNE_AIDE;
}

export const LIBELLE_PHASE: Record<PhaseEquationConiqueCaracteristiques, string> = {
  aMemeAxeEcran1: "Étape 1 (a et c)",
  aMemeAxeEcran2: "Étape 2 (nature et b²)",
  aMemeAxeEcran3: "Étape 3 (équation finale)",
  aAxesPerpEcran1: "Étape 1 (axe principal et b)",
  aAxesPerpEcran2: "Étape 2 (c et a²)",
  aAxesPerpEcran3: "Étape 3 (équation finale)",
  aDeuxSommetsEcran1: "Étape 1 (a et b)",
  aDeuxSommetsEcran2: "Étape 2 (équation finale)",
  bEcran1: "Étape 1 (forme générale)",
  bEcran2: "Étape 2 (valeur de p)",
  bEcran3: "Étape 3 (équation finale)",
  cEcran1: "Étape 1 (relations identifiées)",
  cEcran2: "Étape 2 (a et c)",
  cEcran3: "Étape 3 (type et b²)",
  cEcran4: "Étape 4 (équation finale)",
  dEcran1: "Étape 1 (axe transverse et rapport)",
  dEcran2: "Étape 2 (a et b)",
  dEcran3: "Étape 3 (équation finale)",
};

export const LIBELLE_FAMILLE: Record<ExerciceEquationConiqueCaracteristiques["famille"], string> = {
  A: "A — Sommet(s)/foyer(s)",
  B: "B — Parabole",
  C: "C — Distance/excentricité/directrices",
  D: "D — Asymptote",
};

function formatEquationFinaleLatex(exercice: ExerciceEquationConiqueCaracteristiques): string {
  if (exercice.famille === "A") {
    if (exercice.sousType === "memeAxe") {
      const signe = exercice.natureCible === "ellipse" ? "+" : "-";
      return exercice.axe === "horizontal" ? `\\frac{x^2}{${exercice.a * exercice.a}}${signe}\\frac{y^2}{${exercice.bCarre}}=1` : `\\frac{y^2}{${exercice.a * exercice.a}}${signe}\\frac{x^2}{${exercice.bCarre}}=1`;
    }
    if (exercice.sousType === "axesPerpendiculaires") {
      return exercice.axePrincipal === "horizontal" ? `\\frac{x^2}{${exercice.aCarre}}+\\frac{y^2}{${exercice.bCarre}}=1` : `\\frac{y^2}{${exercice.aCarre}}+\\frac{x^2}{${exercice.bCarre}}=1`;
    }
    return `\\frac{x^2}{${exercice.sommetX * exercice.sommetX}}+\\frac{y^2}{${exercice.sommetY * exercice.sommetY}}=1`;
  }
  if (exercice.famille === "B") {
    return exercice.axe === "horizontal" ? `(${afficherDifference("y", exercice.k)})^2=${4 * exercice.p}(${afficherDifference("x", exercice.h)})` : `(${afficherDifference("x", exercice.h)})^2=${4 * exercice.p}(${afficherDifference("y", exercice.k)})`;
  }
  if (exercice.famille === "C") {
    const signe = exercice.natureCible === "ellipse" ? "+" : "-";
    return exercice.axeTransverse === "horizontal" ? `\\frac{x^2}{${exercice.a * exercice.a}}${signe}\\frac{y^2}{${exercice.bCarre}}=1` : `\\frac{y^2}{${exercice.a * exercice.a}}${signe}\\frac{x^2}{${exercice.bCarre}}=1`;
  }
  return exercice.axeTransverse === "horizontal" ? `\\frac{x^2}{${exercice.a * exercice.a}}-\\frac{y^2}{${exercice.b * exercice.b}}=1` : `\\frac{y^2}{${exercice.a * exercice.a}}-\\frac{x^2}{${exercice.b * exercice.b}}=1`;
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceEquationConiqueCaracteristiques, phase: PhaseEquationConiqueCaracteristiques): string[] {
  if (exercice.famille === "A" && exercice.sousType === "memeAxe") {
    if (phase === "aMemeAxeEcran1") return [`a=${exercice.a}\\text{, }c=${exercice.c}`];
    if (phase === "aMemeAxeEcran2") return [`\\text{${LIBELLE_NATURE_ELLIPSE_HYPERBOLE[exercice.natureCible]}}\\text{, }b^2=${exercice.bCarre}`];
    return [formatEquationFinaleLatex(exercice)];
  }
  if (exercice.famille === "A" && exercice.sousType === "axesPerpendiculaires") {
    if (phase === "aAxesPerpEcran1") return [`\\text{axe principal : }${exercice.axePrincipal}\\text{, }b=${exercice.b}`];
    if (phase === "aAxesPerpEcran2") return [`c=${exercice.c}\\text{, }a^2=${exercice.aCarre}`];
    return [formatEquationFinaleLatex(exercice)];
  }
  if (exercice.famille === "A" && exercice.sousType === "deuxSommets") {
    if (phase === "aDeuxSommetsEcran1") return [`a=${exercice.sommetX}\\text{, }b=${exercice.sommetY}`];
    return [formatEquationFinaleLatex(exercice)];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`\\text{axe : }${exercice.axe}`];
    if (phase === "bEcran2") return [`p=${exercice.p}`];
    return [formatEquationFinaleLatex(exercice)];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`\\text{${LIBELLE_DONNEE_C[exercice.donnee1]}}\\text{, }\\text{${LIBELLE_DONNEE_C[exercice.donnee2]}}`];
    if (phase === "cEcran2") return [`a=${exercice.a}\\text{, }c=${exercice.c}`];
    if (phase === "cEcran3") return [`\\text{${LIBELLE_NATURE_ELLIPSE_HYPERBOLE[exercice.natureCible]}}\\text{, }b^2=${exercice.bCarre}`];
    return [formatEquationFinaleLatex(exercice)];
  }
  // famille D
  if (phase === "dEcran1") return [`\\text{axe transverse : }${exercice.axeTransverse}\\text{, rapport}=${afficherFractionExacte(exercice.pente)}`];
  if (phase === "dEcran2") return [`a=${exercice.a}\\text{, }b=${exercice.b}`];
  return [formatEquationFinaleLatex(exercice)];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsEquationConiqueCaracteristiques(resultat: ResultatExerciceEquationConiqueCaracteristiques): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
