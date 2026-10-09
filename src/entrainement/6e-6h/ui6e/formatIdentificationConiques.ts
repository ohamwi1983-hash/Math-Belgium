import type { ExerciceConiqueA1, ExerciceConiqueA2, ExerciceConiqueB, ExerciceConiqueC, ExerciceIdentificationConiques, NatureConique } from "../core6e/identificationConiques.types";
import { LIBELLE_NATURE, categorieProbable, natureVersId } from "../generateurs6e/identificationConiques/classification";
import type { PhaseIdentificationConiques, ResultatExerciceIdentificationConiques } from "../moteur6e/typesIdentificationConiques";
import { phasesPourExercice } from "../moteur6e/typesIdentificationConiques";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen58`. Dispatch sur
 * `exercice.famille` PUIS `sousType` PUIS `phase`, mirroir `formatDenombrementFondamental.ts`
 * (6gen43)/`formatLoiBinomiale.ts` (6gen50), jamais importé par un autre générateur (chaque
 * générateur reste indépendant — CLAUDE.md). SEUL fichier de ce générateur autorisé à importer
 * `generateurs6e/identificationConiques/classification.ts` (`ui6e/` dépend librement des couches
 * inférieures, CLAUDE.md) — `moteur6e/verificationIdentificationConiques.ts` en duplique
 * volontairement une petite partie plutôt que de l'importer (voir son en-tête).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths.
 * Couverture de régression : `formatIdentificationConiques.test.ts`.
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
  /** `true` pour un label réduit à une lettre de variable (ex. "a =", "c ="), voir `.field-label-minuscule` (`App.css`). */
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
// Petits formateurs numériques/LaTeX partagés par toute la famille de fonctions ci-dessous.
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
  return d === 1 ? `${n}` : `\\frac{${n}}{${d}}`;
}

/** `carre` toujours un entier exact (voir `core6e/identificationConiques.types.ts`, `cCarre`) —
 * jamais un décimal affiché (CLAUDE.md), même quand la racine elle-même est irrationnelle. */
function afficherRacineOuEntier(carre: number): string {
  const racine = Math.round(Math.sqrt(carre));
  return Math.abs(racine * racine - carre) < 1e-9 ? `${racine}` : `\\sqrt{${carre}}`;
}

/** Reconstruit `num/den` (petits entiers) depuis une valeur décimale déjà connue pour être un
 * rapport exact de 2 petits entiers (ex. `elements.pente`, toujours `a/b` ou `b/a`, `a,b` entiers —
 * voir en-tête `classification.ts`). */
function fractionDepuisDecimal(valeur: number, maxDen = 60): { num: number; den: number } {
  for (let den = 1; den <= maxDen; den++) {
    const num = Math.round(valeur * den);
    if (Math.abs(num / den - valeur) < 1e-9) return { num, den };
  }
  return { num: Math.round(valeur * 1000), den: 1000 };
}

/** `variable-valeur`, signe géré proprement — jamais `variable-(-3)` (double signe "−−" non
 * simplifié, CLAUDE.md, point "simplification algébrique") : un `offset` négatif (centre décentré
 * de signe quelconque, familles B/C) doit s'afficher `variable+3`, jamais `variable-(-3)`.
 * `offset===0` omet la parenthèse entièrement (centre à l'origine, famille A1 seulement). */
function afficherDifferenceVariable(variable: string, offset: number): string {
  if (offset === 0) return variable;
  return offset > 0 ? `(${variable}-${offset})` : `(${variable}+${-offset})`;
}

/** `coeffDecimal` peut être un rationnel non entier (famille C, `coeffX`/`coeffY` — voir en-tête
 * `familleC.ts`, `m²·s`) — reconstruit sa fraction exacte plutôt que d'afficher un décimal
 * (CLAUDE.md). `corps` omet le "1" devant `(variable-offset)^2` si le rapport vaut exactement 1,
 * et omet le "-offset" si `offset===0` (centre à l'origine, famille A1 seulement). */
function formatCoeffFractionVariable(coeffDecimal: number, variable: string, offset = 0): { corps: string; signe: 1 | -1 } {
  const signe: 1 | -1 = coeffDecimal < 0 ? -1 : 1;
  const { num, den } = fractionDepuisDecimal(Math.abs(coeffDecimal));
  const base = afficherDifferenceVariable(variable, offset);
  const corps = num === den ? `${base}^2` : `${afficherFraction(num, den)}${base}^2`;
  return { corps, signe };
}

interface PartieSignee {
  coeff: number;
  texte: (abs: number) => string;
}

/** Assemble une somme signée à partir de termes `{coeff,texte}` — omet les termes de coefficient
 * nul, gère le signe du premier terme (jamais de "+" orphelin en tête), `"0"` si tout est nul. */
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
function lineaireTexte(variable: string): (abs: number) => string {
  return (abs) => (abs === 1 ? `${variable}` : `${abs}${variable}`);
}
function constanteTexte(abs: number): string {
  return `${abs}`;
}

// ============================================================================
// Options de choix "statut structuré" — restreintes à la catégorie/combinaison de signes CONFIRMÉE
// (jamais toutes les 13 en vrac sur un même écran — le sous-ensemble pertinent seulement).
// ============================================================================

function optionsNature(ids: import("../core6e/identificationConiques.types").IdentifiantNature[]): OptionChoix[] {
  return ids.map((id) => ({ valeur: id, label: LIBELLE_NATURE[id] }));
}

const OPTIONS_ELLIPSE_FAMILLE: OptionChoix[] = optionsNature(["ellipseHorizontal", "ellipseVertical", "cercle", "vide", "point"]);
const OPTIONS_HYPERBOLE_FAMILLE: OptionChoix[] = optionsNature(["hyperboleHorizontal", "hyperboleVertical", "droitesSecantes"]);

function optionsNaturePourCategorie(categorie: "ellipseCercleVidePoint" | "hyperboleDroitesSecantes"): OptionChoix[] {
  return categorie === "ellipseCercleVidePoint" ? OPTIONS_ELLIPSE_FAMILLE : OPTIONS_HYPERBOLE_FAMILLE;
}

// ============================================================================
// Famille A, sous-type 1 — Ax²+By²+C=0.
// ============================================================================

export function consigneGeneraleA1(): string {
  return "On considère une conique d'équation Ax²+By²+C=0 (les deux carrés sont présents, aucun terme linéaire). Identifie sa nature exacte, puis ses éléments caractéristiques si elle n'est pas dégénérée.";
}

export function blocDonneesA1(e: ExerciceConiqueA1): string[] {
  const eq = formatSommeSignee([{ coeff: e.A, texte: carreTexte("x") }, { coeff: e.B, texte: carreTexte("y") }, { coeff: e.C, texte: constanteTexte }]);
  return [`${eq}=0`];
}

export function consigneEcranA1(_e: ExerciceConiqueA1, phase: PhaseIdentificationConiques): string {
  if (phase === "a1Ecran1") return "Observe les signes de A et de B (sans regarder C pour l'instant) : à quelle grande catégorie l'équation appartient-elle probablement ?";
  if (phase === "a1Ecran2") return "Attention au cas C=0 (ne divise JAMAIS par C sans l'avoir vérifié en premier) : à partir de la catégorie CONFIRMÉE, tranche la nature exacte de la conique.";
  return "À partir de la nature CONFIRMÉE, donne les éléments caractéristiques de la conique.";
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, le même bug était présent sur `6gen1` : chaque écran ne montrait QUE l'info de l'écran
 * immédiatement précédent, jamais celles d'avant, ex. `a1Ecran3` omettait la catégorie de
 * `a1Ecran1`). Plus ancien en premier. */
export function etatActuelA1(e: ExerciceConiqueA1, phase: PhaseIdentificationConiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "a1Ecran2" || phase === "a1Ecran3") {
    lignes.push(`\\text{Catégorie confirmée (étape 1) : }\\textbf{${e.categorieProbable === "ellipseCercleVidePoint" ? "ellipse/cercle/∅/point" : "hyperbole/droites sécantes"}}`);
  }
  if (phase === "a1Ecran3") lignes.push(`\\text{Nature confirmée (étape 2) : }\\textbf{${LIBELLE_NATURE[natureVersId(e.nature)]}}`);
  return lignes.length > 0 ? lignes : null;
}

export function champsA1(e: ExerciceConiqueA1, phase: PhaseIdentificationConiques): ChampDef[] {
  if (phase === "a1Ecran1") {
    return [
      champChoix("Catégorie probable =", [
        { valeur: "ellipseCercleVidePoint", label: "Ellipse / Cercle / ∅ / Point (A, B de même signe)" },
        { valeur: "hyperboleDroitesSecantes", label: "Hyperbole / 2 droites sécantes (A, B de signes opposés)" },
      ]),
    ];
  }
  if (phase === "a1Ecran2") return [champChoix("Nature exacte =", optionsNaturePourCategorie(e.categorieProbable))];
  return champsElements(e.nature);
}

export function niveauAideMaxA1(phase: PhaseIdentificationConiques): number {
  return phase === "a1Ecran2" ? 2 : 0;
}

export function aideNiveau1A1(): AideAvecLatex {
  return { texte: "Une fois l'équation normalisée (divisée par −C si C≠0), le signe de la constante obtenue, comparé aux signes de A et B, détermine si le lieu est vide, réduit à un point, ou une conique non dégénérée.", latex: null };
}

export function aideNiveau2A1(e: ExerciceConiqueA1): AideAvecLatex {
  if (e.C === 0) return { texte: "C=0 : aucune division n'est possible ici — compare directement les signes de A et de B (classification finale non donnée).", latex: null };
  const normalisee = formatSommeSignee([{ coeff: e.A / -e.C, texte: carreTexte("x") }, { coeff: e.B / -e.C, texte: carreTexte("y") }]);
  return { texte: "Équation normalisée (divisée par −C) — classification finale non faite :", latex: `${normalisee}=1` };
}

// ============================================================================
// Famille A, sous-type 2 — un seul carré + un terme linéaire.
// ============================================================================

export function consigneGeneraleA2(): string {
  return "On considère une conique d'équation Av²+D·w=0 (un seul carré, un seul terme linéaire). Détermine si le terme linéaire porte sur la même variable que le carré (cas dégénéré) ou sur l'autre (parabole), puis résous en conséquence.";
}

export function blocDonneesA2(e: ExerciceConiqueA2): string[] {
  const variableLineaire = e.memeVariable ? e.variableCarre : e.variableCarre === "x" ? "y" : "x";
  const eq = formatSommeSignee([{ coeff: e.coeffCarre, texte: carreTexte(e.variableCarre) }, { coeff: e.coeffLineaire, texte: lineaireTexte(variableLineaire) }]);
  return [`${eq}=0`];
}

export function consigneEcranA2(e: ExerciceConiqueA2, phase: PhaseIdentificationConiques): string {
  if (phase === "a2Ecran1") return "Le terme linéaire porte-t-il sur la MÊME variable que le carré, ou sur l'AUTRE ?";
  if (phase === "a2Ecran2") {
    return e.memeVariable ? "Factorise (v(Av+D)=0) pour obtenir les 2 droites parallèles CONFIRMÉES par l'étape précédente." : "Mets l'équation sous forme standard v²=4p·w et identifie le coefficient 4p ainsi que l'orientation de la parabole.";
  }
  return "À partir de l'orientation CONFIRMÉE, donne le foyer et la directrice de la parabole.";
}

/** ACCUMULE les écrans déjà confirmés — même correctif que `etatActuelA1` (voir sa doc-string). */
export function etatActuelA2(e: ExerciceConiqueA2, phase: PhaseIdentificationConiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "a2Ecran2" || phase === "a2Ecran3") {
    lignes.push(`\\text{Cas confirmé (étape 1) : }\\textbf{${e.memeVariable ? "même variable (dégénéré)" : "autre variable (parabole)"}}`);
  }
  if (phase === "a2Ecran3") lignes.push(`\\text{Orientation confirmée (étape 2) : }\\textbf{${LIBELLE_NATURE[natureVersId(e.nature)]}}`, `p=${e.p}`);
  return lignes.length > 0 ? lignes : null;
}

const ORIENTATIONS_PAR_VARIABLE_CARREE: Record<"x" | "y", { valeur: string; label: string }[]> = {
  x: [
    { valeur: "paraboleHaut", label: LIBELLE_NATURE.paraboleHaut },
    { valeur: "paraboleBas", label: LIBELLE_NATURE.paraboleBas },
  ],
  y: [
    { valeur: "paraboleDroite", label: LIBELLE_NATURE.paraboleDroite },
    { valeur: "paraboleGauche", label: LIBELLE_NATURE.paraboleGauche },
  ],
};

export function champsA2(e: ExerciceConiqueA2, phase: PhaseIdentificationConiques): ChampDef[] {
  if (phase === "a2Ecran1") {
    return [
      champChoix("Le terme linéaire porte sur =", [
        { valeur: "meme", label: "La MÊME variable que le carré (dégénéré)" },
        { valeur: "autre", label: "L'AUTRE variable (parabole)" },
      ]),
    ];
  }
  if (phase === "a2Ecran2") {
    if (e.memeVariable) return [champTexte("1ʳᵉ solution =", "ex : 0"), champTexte("2ᵉ solution =", "ex : -3")];
    return [champTexte("Coefficient 4p (signé) =", "ex : -8"), champChoix("Orientation =", ORIENTATIONS_PAR_VARIABLE_CARREE[e.variableCarre])];
  }
  return [champTexte("Foyer, abscisse =", "ex : 0", true), champTexte("Foyer, ordonnée =", "ex : 2", true), champTexte("Directrice (constante) =", "ex : -2")];
}

export function niveauAideMaxA2(phase: PhaseIdentificationConiques): number {
  return phase === "a2Ecran1" ? 2 : 0;
}

export function aideNiveau1A2(): AideAvecLatex {
  return { texte: "Le terme linéaire doit porter sur la variable ABSENTE du carré pour donner une parabole — s'il porte sur la MÊME variable que le carré, l'équation se factorise directement (cas dégénéré).", latex: null };
}

export function aideNiveau2A2(e: ExerciceConiqueA2): AideAvecLatex {
  const variableLineaire = e.memeVariable ? e.variableCarre : e.variableCarre === "x" ? "y" : "x";
  return { texte: "Variables identifiées séparément (comparaison non faite) :", latex: `\\text{carré : }${e.variableCarre}\\text{, terme linéaire : }${variableLineaire}` };
}

// ============================================================================
// Éléments caractéristiques — COMMUN aux familles A1/B/C (mêmes champs selon `nature.type`).
// ============================================================================

function champsElements(nature: NatureConique): ChampDef[] {
  if (nature.type === "cercle") return [champTexte("Rayon r =", "ex : 5", true)];
  if (nature.type === "ellipse") return [champTexte("a =", `ex : 5`, true), champTexte("b =", `ex : 3`, true), champTexte("c =", `ex : 4`, true)];
  if (nature.type === "hyperbole") return [champTexte("a =", `ex : 3`, true), champTexte("b =", `ex : 4`, true), champTexte("c =", `ex : 5`, true), champTexte("Pente des asymptotes m =", `ex : 4/3`, true)];
  /* c8 ignore next */
  throw new Error("champsElements : nature dégénérée");
}

// ============================================================================
// Famille B — Ax²+By²+Dx+Ey+F=0, décentrée.
// ============================================================================

export function consigneGeneraleB(): string {
  return "On considère une conique décentrée d'équation Ax²+By²+Dx+Ey+F=0. Regroupe les termes par variable, complète le carré pour chacune séparément, puis classe la conique et donne ses éléments caractéristiques.";
}

export function blocDonneesB(e: ExerciceConiqueB): string[] {
  const eq = formatSommeSignee([
    { coeff: e.A, texte: carreTexte("x") },
    { coeff: e.B, texte: carreTexte("y") },
    { coeff: e.D, texte: lineaireTexte("x") },
    { coeff: e.E, texte: lineaireTexte("y") },
    { coeff: e.F, texte: constanteTexte },
  ]);
  return [`${eq}=0`];
}

export function consigneEcranB(_e: ExerciceConiqueB, phase: PhaseIdentificationConiques): string {
  if (phase === "bEcran1") return "Regroupe les termes par variable et complète le carré POUR CHACUNE séparément (forme intermédiaire A(x-h)²+B(y-k)²=constante, avant simplification finale) — une simple recopie de l'équation de départ, même réordonnée, ne sera PAS acceptée.";
  if (phase === "bEcran2") return "À partir de la forme CONFIRMÉE de l'étape précédente, identifie les signes de A, de B et de la constante finale.";
  if (phase === "bEcran3") return "À partir des signes CONFIRMÉS, classe la nature exacte de la conique.";
  return "À partir de la nature CONFIRMÉE, donne les éléments caractéristiques de la conique.";
}

/** ACCUMULE les écrans déjà confirmés — même correctif que `etatActuelA1` (voir sa doc-string) ;
 * famille B a 4 écrans, donc `bEcran4` doit maintenant montrer les 3 lignes de `bEcran1`/2/3,
 * jamais seulement celle de `bEcran3`. */
export function etatActuelB(e: ExerciceConiqueB, phase: PhaseIdentificationConiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "bEcran2" || phase === "bEcran3" || phase === "bEcran4") {
    lignes.push(`A${afficherDifferenceVariable("x", e.centre.x)}^2+B${afficherDifferenceVariable("y", e.centre.y)}^2=${e.M}\\text{ (structure confirmée, étape 1)}`);
  }
  if (phase === "bEcran3" || phase === "bEcran4") {
    const s = (v: number) => (v > 0 ? "+" : v < 0 ? "-" : "0");
    lignes.push(`\\text{signe}(A)=${s(e.A)}\\text{, signe}(B)=${s(e.B)}\\text{, signe}(M)=${s(e.M)}\\text{ (confirmés, étape 2)}`);
  }
  if (phase === "bEcran4") lignes.push(`\\text{Nature confirmée (étape 3) : }\\textbf{${LIBELLE_NATURE[natureVersId(e.nature)]}}`);
  return lignes.length > 0 ? lignes : null;
}

const OPTIONS_SIGNE = [
  { valeur: "positif", label: "Positif (+)" },
  { valeur: "negatif", label: "Négatif (−)" },
];
const OPTIONS_SIGNE_AVEC_NUL = [...OPTIONS_SIGNE, { valeur: "nul", label: "Nul (0)" }];

export function champsB(e: ExerciceConiqueB, phase: PhaseIdentificationConiques): ChampDef[] {
  if (phase === "bEcran1") return [champTexte("Forme intermédiaire complétée (équation) =", "ex : 2(x-1)^2+3(y+2)^2=12")];
  if (phase === "bEcran2") return [champChoix("Signe de A =", OPTIONS_SIGNE), champChoix("Signe de B =", OPTIONS_SIGNE), champChoix("Signe de la constante finale =", OPTIONS_SIGNE_AVEC_NUL)];
  if (phase === "bEcran3") return [champChoix("Nature exacte =", optionsNaturePourCategorie(categorieProbable(e.A, e.B)))];
  return champsElements(e.nature);
}

export function niveauAideMaxB(phase: PhaseIdentificationConiques): number {
  return phase === "bEcran1" || phase === "bEcran3" ? 2 : 0;
}

export function aideNiveau1B(phase: PhaseIdentificationConiques): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Divise d'abord chaque groupe par le coefficient de son carré avant de compléter — traite x et y INDÉPENDAMMENT l'une de l'autre.", latex: null };
  if (phase === "bEcran3") return { texte: "Compare le signe de la constante finale à celui des coefficients A et B pour trancher entre conique valide, point, ou ∅.", latex: null };
  return AUCUNE_AIDE;
}

export function aideNiveau2B(e: ExerciceConiqueB, phase: PhaseIdentificationConiques): AideAvecLatex {
  if (phase === "bEcran1") {
    const hx = e.centre.x;
    return { texte: "Complétion effectuée pour x seulement (y non encore complété) :", latex: `A${afficherDifferenceVariable("x", hx)}^2` };
  }
  if (phase === "bEcran3") return { texte: "Constante finale isolée (comparaison avec A, B non faite) :", latex: `M=${e.M}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — forme "racine isolée".
// ============================================================================

export function consigneGeneraleC(): string {
  return "On considère une équation de la forme v_isolée = k ± m·√(expression quadratique). Isole le terme en racine (déjà fait ici), élève au carré, complète le carré sur la variable qui était SOUS LA RACINE, puis classe la conique.";
}

export function blocDonneesC(e: ExerciceConiqueC): string[] {
  const sousRacine = formatSommeSignee([{ coeff: e.a2, texte: carreTexte(e.variableRacine) }, { coeff: e.a1, texte: lineaireTexte(e.variableRacine) }, { coeff: e.a0, texte: constanteTexte }]);
  const mTexte = afficherFraction(e.mNum, e.mDen);
  const noyau = `${mTexte}\\sqrt{${sousRacine}}`;
  const signe = e.signeRacine > 0 ? "+" : "-";
  const expr = e.k === 0 ? (signe === "-" ? `-${noyau}` : noyau) : `${e.k} ${signe} ${noyau}`;
  return [`${e.variableIsolee}=${expr}`];
}

export function consigneEcranC(_e: ExerciceConiqueC, phase: PhaseIdentificationConiques): string {
  if (phase === "cEcran1") return "Isole le terme en ±racine (déjà fait dans l'énoncé) et élève au carré les deux membres.";
  if (phase === "cEcran2") return "Complète le carré sur la variable qui était SOUS LA RACINE dans l'énoncé d'origine — attention, ce n'est pas forcément celle isolée à gauche.";
  if (phase === "cEcran3") return "Assemble la forme standard finale (les deux carrés du même côté) et classe la conique : le signe sous la racine d'origine détermine ellipse ou hyperbole.";
  return "À partir de la nature CONFIRMÉE, donne les éléments caractéristiques de la conique.";
}

/** ACCUMULE les écrans déjà confirmés — même correctif que `etatActuelA1`/`etatActuelB` (voir leur
 * doc-string) ; famille C a aussi 4 écrans. */
export function etatActuelC(e: ExerciceConiqueC, phase: PhaseIdentificationConiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "cEcran2" || phase === "cEcran3" || phase === "cEcran4") {
    lignes.push(`\\text{Équation élevée au carré confirmée (étape 1, variable sous la racine : }${e.variableRacine}\\text{)}`);
  }
  if (phase === "cEcran3" || phase === "cEcran4") lignes.push(`\\text{Forme complétée confirmée sur }${e.variableRacine}\\text{ (étape 2)}`);
  if (phase === "cEcran4") lignes.push(`\\text{Nature confirmée (étape 3) : }\\textbf{${LIBELLE_NATURE[natureVersId(e.nature)]}}`);
  return lignes.length > 0 ? lignes : null;
}

const OPTIONS_NATURE_C: OptionChoix[] = optionsNature(["ellipseHorizontal", "ellipseVertical", "hyperboleHorizontal", "hyperboleVertical"]);

export function champsC(e: ExerciceConiqueC, phase: PhaseIdentificationConiques): ChampDef[] {
  if (phase === "cEcran1") return [champTexte("Équation après élévation au carré =", "ex : (y-1)^2=4*(x^2-2x+5)")];
  if (phase === "cEcran2") return [champTexte("Forme complétée =", "ex : (y-1)^2=4*((x-1)^2+4)")];
  if (phase === "cEcran3") return [champChoix("Nature exacte =", OPTIONS_NATURE_C), champTexte("Forme standard (équation) =", "ex : 4(x-1)^2-(y-1)^2=16")];
  return champsElements(e.nature);
}

export function niveauAideMaxC(phase: PhaseIdentificationConiques): number {
  return phase === "cEcran2" ? 2 : 0;
}

export function aideNiveau1C(): AideAvecLatex {
  return { texte: "La variable à compléter est celle qui apparaît SOUS LA RACINE dans l'énoncé d'origine — pas celle isolée seule à gauche de l'égalité.", latex: null };
}

export function aideNiveau2C(e: ExerciceConiqueC): AideAvecLatex {
  return { texte: "Variable correcte identifiée (complétion non faite) :", latex: `\\text{variable sous la racine : }${e.variableRacine}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceIdentificationConiques): string {
  if (exercice.famille === "A") return exercice.sousType === "centree2Carres" ? consigneGeneraleA1() : consigneGeneraleA2();
  if (exercice.famille === "B") return consigneGeneraleB();
  return consigneGeneraleC();
}

export function blocDonnees(exercice: ExerciceIdentificationConiques): string[] {
  if (exercice.famille === "A") return exercice.sousType === "centree2Carres" ? blocDonneesA1(exercice) : blocDonneesA2(exercice);
  if (exercice.famille === "B") return blocDonneesB(exercice);
  return blocDonneesC(exercice);
}

export function consigneEcran(exercice: ExerciceIdentificationConiques, phase: PhaseIdentificationConiques): string {
  if (exercice.famille === "A") return exercice.sousType === "centree2Carres" ? consigneEcranA1(exercice, phase) : consigneEcranA2(exercice, phase);
  if (exercice.famille === "B") return consigneEcranB(exercice, phase);
  return consigneEcranC(exercice, phase);
}

export function etatActuel(exercice: ExerciceIdentificationConiques, phase: PhaseIdentificationConiques): string[] | null {
  if (exercice.famille === "A") return exercice.sousType === "centree2Carres" ? etatActuelA1(exercice, phase) : etatActuelA2(exercice, phase);
  if (exercice.famille === "B") return etatActuelB(exercice, phase);
  return etatActuelC(exercice, phase);
}

export function champsEcran(exercice: ExerciceIdentificationConiques, phase: PhaseIdentificationConiques): ChampDef[] {
  if (exercice.famille === "A") return exercice.sousType === "centree2Carres" ? champsA1(exercice, phase) : champsA2(exercice, phase);
  if (exercice.famille === "B") return champsB(exercice, phase);
  return champsC(exercice, phase);
}

export function niveauAideMaxEcran(exercice: ExerciceIdentificationConiques, phase: PhaseIdentificationConiques): number {
  if (exercice.famille === "A") return exercice.sousType === "centree2Carres" ? niveauAideMaxA1(phase) : niveauAideMaxA2(phase);
  if (exercice.famille === "B") return niveauAideMaxB(phase);
  return niveauAideMaxC(phase);
}

export function aideNiveau1(exercice: ExerciceIdentificationConiques, phase: PhaseIdentificationConiques): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  if (exercice.famille === "A") return exercice.sousType === "centree2Carres" ? aideNiveau1A1() : aideNiveau1A2();
  if (exercice.famille === "B") return aideNiveau1B(phase);
  return aideNiveau1C();
}

export function aideNiveau2(exercice: ExerciceIdentificationConiques, phase: PhaseIdentificationConiques): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  if (exercice.famille === "A") return exercice.sousType === "centree2Carres" ? aideNiveau2A1(exercice) : aideNiveau2A2(exercice);
  if (exercice.famille === "B") return aideNiveau2B(exercice, phase);
  return aideNiveau2C(exercice);
}

export const LIBELLE_PHASE: Record<PhaseIdentificationConiques, string> = {
  a1Ecran1: "Étape 1 (catégorie probable)",
  a1Ecran2: "Étape 2 (nature exacte)",
  a1Ecran3: "Étape 3 (éléments caractéristiques)",
  a2Ecran1: "Étape 1 (reconnaissance)",
  a2Ecran2: "Étape 2 (résultat)",
  a2Ecran3: "Étape 3 (foyer et directrice)",
  bEcran1: "Étape 1 (forme intermédiaire complétée)",
  bEcran2: "Étape 2 (signes)",
  bEcran3: "Étape 3 (nature exacte)",
  bEcran4: "Étape 4 (éléments caractéristiques)",
  cEcran1: "Étape 1 (élévation au carré)",
  cEcran2: "Étape 2 (forme complétée)",
  cEcran3: "Étape 3 (nature et forme standard)",
  cEcran4: "Étape 4 (éléments caractéristiques)",
};

export const LIBELLE_FAMILLE: Record<ExerciceIdentificationConiques["famille"], string> = {
  A: "A — Conique centrée",
  B: "B — Conique décentrée",
  C: "C — Racine isolée",
};

function formatElementsLatex(nature: NatureConique, e: { a?: number; b?: number; c?: number; cCarre?: number; pente?: number; rayon?: number }): string[] {
  if (nature.type === "cercle") return [`r=${e.rayon}`];
  if (nature.type === "ellipse") return [`a=${e.a}\\text{, }b=${e.b}\\text{, }c=${afficherRacineOuEntier(e.cCarre as number)}`];
  if (nature.type === "hyperbole") {
    const { num, den } = fractionDepuisDecimal(e.pente as number);
    return [`a=${e.a}\\text{, }b=${e.b}\\text{, }c=${afficherRacineOuEntier(e.cCarre as number)}\\text{, }m=${afficherFraction(num, den)}`];
  }
  /* c8 ignore next */
  return [];
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceIdentificationConiques, phase: PhaseIdentificationConiques): string[] {
  if (exercice.famille === "A" && exercice.sousType === "centree2Carres") {
    if (phase === "a1Ecran1") return [`\\text{${exercice.categorieProbable === "ellipseCercleVidePoint" ? "Ellipse/Cercle/∅/Point" : "Hyperbole/2 droites sécantes"}}`];
    if (phase === "a1Ecran2") return [`\\text{${LIBELLE_NATURE[natureVersId(exercice.nature)]}}`];
    return formatElementsLatex(exercice.nature, exercice.elements);
  }
  if (exercice.famille === "A" && exercice.sousType === "unCarreUnLineaire") {
    if (phase === "a2Ecran1") return [`\\text{${exercice.memeVariable ? "Même variable" : "Autre variable"}}`];
    if (phase === "a2Ecran2") {
      if (exercice.memeVariable) return [`0,\\,${exercice.autreRacine}`];
      return [`4p=${exercice.quatrePSigne}\\text{, }\\text{${LIBELLE_NATURE[natureVersId(exercice.nature)]}}`];
    }
    const foyer = exercice.foyer as { x: number; y: number };
    return [`F(${foyer.x};${foyer.y})\\text{, directrice}=${exercice.directrice}`];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`A${afficherDifferenceVariable("x", exercice.centre.x)}^2+B${afficherDifferenceVariable("y", exercice.centre.y)}^2=${exercice.M}`];
    if (phase === "bEcran2") {
      const s = (v: number) => (v > 0 ? "+" : v < 0 ? "-" : "0");
      return [`\\text{signe}(A)=${s(exercice.A)}\\text{, signe}(B)=${s(exercice.B)}\\text{, signe}(M)=${s(exercice.M)}`];
    }
    if (phase === "bEcran3") return [`\\text{${LIBELLE_NATURE[natureVersId(exercice.nature)]}}`];
    return formatElementsLatex(exercice.nature, exercice.elements);
  }
  // famille C
  if (phase === "cEcran1" || phase === "cEcran2") return [`\\text{(voir corrigé détaillé en classe — équivalence algébrique vérifiée)}`];
  if (phase === "cEcran3") {
    const tx = formatCoeffFractionVariable(exercice.coeffX, "x", exercice.centre.x);
    const ty = formatCoeffFractionVariable(exercice.coeffY, "y", exercice.centre.y);
    const eq = `${tx.signe < 0 ? "-" : ""}${tx.corps}${ty.signe < 0 ? " - " : " + "}${ty.corps}=${exercice.M}`;
    return [`\\text{${LIBELLE_NATURE[natureVersId(exercice.nature)]}}\\text{, }${eq}`];
  }
  return formatElementsLatex(exercice.nature, exercice.elements);
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsIdentificationConiques(resultat: ResultatExerciceIdentificationConiques): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
