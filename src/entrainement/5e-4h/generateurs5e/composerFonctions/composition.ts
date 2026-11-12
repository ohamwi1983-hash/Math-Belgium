import type { CompositionDirigee, ConditionSurG, DonneeFonction, ExerciceComposerFonctions, FonctionComposable, SensComposition } from "../../core5e/composerFonctions.types";
import type { EnsembleReelGuide, Polynome } from "../../core5e/domaineDefinition.types";
import { entierAleatoire } from "../domaineDefinition/aleatoire";
import { genererDonneeFonction } from "./familles";
import type { Formule } from "./familles";
import { intersecterEnsembles, normaliserEnMorceaux } from "./intervalles";
import { resoudreConditionSeuil, xTelQueGDansDomF } from "./solveur";
import { all, create } from "mathjs";
import type { MathNode } from "mathjs";
import { simplifierEnFractionUniqueNoeud, simplifierLatex, simplifierNoeud } from "../simplificationExpression";

const math = create(all);

/**
 * `dom(externe ∘ interne)` = `dom(interne) ∩ {x : interne(x) ∈ dom(externe)}` — seule source de
 * vérité pour le domaine FINAL d'une composition, réutilisée À L'IDENTIQUE pour les 2 pipelines
 * "simple" et "riche" (D.4) : pour "riche", ce domaine est mathématiquement IDENTIQUE à
 * `interieure.domaine ∩ domaineApresCarreDeConditions(...)` — preuve dans la note d'en-tête de
 * `core5e/composerFonctions.types.ts` — donc jamais recalculé une seconde fois pour l'écran D.
 */
function domaineCompose(interne: DonneeFonction, externe: DonneeFonction): EnsembleReelGuide {
  return intersecterEnsembles(interne.domaine, xTelQueGDansDomF(interne.fonction, externe.domaine));
}

function formuleComposee(externe: DonneeFonction, interne: DonneeFonction): string {
  return externe.formule.replace(/x/g, `(${interne.formule})`);
}

function latexCompose(externe: DonneeFonction, interne: DonneeFonction): string {
  return externe.corpsLatex.replace(/x/g, `\\left(${interne.corpsLatex}\\right)`);
}

// ============================================================================
// Forme de référence AFFICHÉE (aide, état actuel, réponse attendue) — audit 5e ch. 1, point 20 :
// `rationalize` produisait « −3x/(−6x−4) » ou « (4x√A + √A)/(8x−2) ». On remet le dénominateur à
// coefficient dominant positif (en changeant le signe des deux membres) et on met en facteur une
// racine commune à tous les termes d'un numérateur/dénominateur.
// ============================================================================

function sansParentheses(noeud: MathNode): MathNode {
  let n = noeud;
  while (n.type === "ParenthesisNode") n = (n as unknown as { content: MathNode }).content;
  return n;
}

function commenceParMoins(noeud: MathNode): boolean {
  return sansParentheses(noeud).toString().trim().startsWith("-");
}

function opposer(noeud: MathNode): MathNode {
  try {
    return simplifierNoeud(`-(${noeud.toString()})`) as unknown as MathNode;
  } catch {
    return new math.OperatorNode("-", "unaryMinus", [new math.ParenthesisNode(noeud)]);
  }
}

/** « 4x·√A + √A » → « (4x+1)·√A » quand UNE racine est en facteur de tous les termes (test exact :
 * le quotient par cette racine, racines rendues opaques, est un polynôme sans elle). */
function factoriserRacineCommune(noeud: MathNode): MathNode {
  const n = sansParentheses(noeud);
  const fn = n.type === "OperatorNode" ? (n as unknown as { fn: string }).fn : null;
  if (fn !== "add" && fn !== "subtract") return noeud;
  const atomes = new Map<string, MathNode>();
  const parTexte = new Map<string, string>();
  const coquille = n.transform((m) => {
    if (m.type !== "FunctionNode") return m;
    const cle = m.toString();
    let nom = parTexte.get(cle);
    if (nom === undefined) {
      nom = `R${parTexte.size}`;
      parTexte.set(cle, nom);
      atomes.set(nom, m);
    }
    return new math.SymbolNode(nom);
  });
  for (const [nom, atome] of atomes) {
    try {
      const quotient = math.rationalize(`(${coquille.toString()})/${nom}`) as unknown as MathNode;
      const texte = quotient.toString();
      if (texte.includes(nom) || texte.includes("/")) continue;
      const facteur = quotient.transform((m) => (m.type === "SymbolNode" && atomes.has((m as unknown as { name: string }).name) ? (atomes.get((m as unknown as { name: string }).name) as MathNode) : m));
      return new math.OperatorNode("*", "multiply", [new math.ParenthesisNode(facteur), atome]);
    } catch {
      continue;
    }
  }
  return noeud;
}

function estDivision(noeud: MathNode): boolean {
  const n = sansParentheses(noeud);
  return n.type === "OperatorNode" && (n as unknown as { fn: string }).fn === "divide";
}

function argsDivision(noeud: MathNode): [MathNode, MathNode] {
  return (sansParentheses(noeud) as unknown as { args: [MathNode, MathNode] }).args;
}

function developper(noeud: MathNode): MathNode {
  try {
    return simplifierNoeud(noeud.toString()) as unknown as MathNode;
  } catch {
    return noeud;
  }
}

/** « N/D₁/D₂ » → « N/(D₁·D₂) » et « N/(D₁/D₂) » → « (N·D₂)/D₁ », produits développés : `rationalize`
 * rend parfois ces fractions étagées quand une racine (symbole opaque) est en jeu. */
function aplatirDivisions(noeud: MathNode): MathNode {
  if (!estDivision(noeud)) return noeud;
  let [num, den] = argsDivision(noeud);
  num = aplatirDivisions(num);
  den = aplatirDivisions(den);
  if (estDivision(num)) {
    const [a, b] = argsDivision(num);
    return aplatirDivisions(new math.OperatorNode("/", "divide", [a, developper(new math.OperatorNode("*", "multiply", [new math.ParenthesisNode(b), new math.ParenthesisNode(den)]))]));
  }
  if (estDivision(den)) {
    const [c, d] = argsDivision(den);
    return aplatirDivisions(new math.OperatorNode("/", "divide", [developper(new math.OperatorNode("*", "multiply", [new math.ParenthesisNode(num), new math.ParenthesisNode(d)])), c]));
  }
  return new math.OperatorNode("/", "divide", [num, den]);
}

/** Une division (à dénominateur variable) encore présente sous une autre division ou dans une
 * somme : la forme n'est pas regroupée en une seule fraction. */
function contientFractionInterne(noeud: MathNode, profondeur = 0): boolean {
  const n = sansParentheses(noeud);
  if (n.type !== "OperatorNode") return false;
  const op = n as unknown as { fn: string; args: MathNode[] };
  if (op.fn === "divide" && profondeur > 0 && op.args[1].filter((m) => m.type === "SymbolNode" && (m as unknown as { name: string }).name === "x").length > 0) return true;
  return op.args.some((a) => contientFractionInterne(a, profondeur + 1));
}

function decimalesEnFractions(noeud: MathNode): MathNode {
  return noeud.transform((m) => {
    if (m.type === "ConstantNode" && typeof (m as unknown as { value: unknown }).value === "number") {
      const v = (m as unknown as { value: number }).value;
      if (!Number.isInteger(v)) {
        const f = math.fraction(v) as unknown as { s: number; n: number; d: number };
        return math.parse(`${f.s < 0 ? "-" : ""}${f.n}/${f.d}`);
      }
    }
    return m;
  });
}

/** Regroupe en une seule fraction, racines opaques : d'abord leurs ARGUMENTS (récursivement), puis
 * l'expression elle-même si elle contient encore une fraction interne. `rationalize` échoue sur
 * certaines écritures (« −3·7/(…) ») : on lui passe d'abord une forme simplifiée par mathjs. */
function regrouper(noeud: MathNode): MathNode {
  const atomes = new Map<string, MathNode>();
  const parTexte = new Map<string, string>();
  const coquille = sansParentheses(noeud).transform((m) => {
    if (m.type !== "FunctionNode") return m;
    const f = m as unknown as { fn: unknown; args: MathNode[] };
    const atome = new math.FunctionNode(f.fn as never, f.args.map(regrouper));
    const cle = atome.toString();
    let nom = parTexte.get(cle);
    if (nom === undefined) {
      nom = `R${parTexte.size}`;
      parTexte.set(cle, nom);
      atomes.set(nom, atome);
    }
    return new math.SymbolNode(nom);
  });
  let resultat = coquille;
  if (contientFractionInterne(coquille)) {
    for (const source of [coquille.toString(), () => math.simplify(coquille.toString()).toString()]) {
      try {
        const texte = typeof source === "string" ? source : source();
        const r = aplatirDivisions(decimalesEnFractions(math.rationalize(texte) as unknown as MathNode));
        if (!contientFractionInterne(r)) {
          resultat = r;
          break;
        }
      } catch {
        continue;
      }
    }
  }
  resultat = aplatirDivisions(resultat);
  return resultat.transform((m) => (m.type === "SymbolNode" && atomes.has((m as unknown as { name: string }).name) ? (atomes.get((m as unknown as { name: string }).name) as MathNode) : m));
}

function normaliserReference(noeudBrut: MathNode): MathNode {
  const n = sansParentheses(regrouper(noeudBrut));
  if (n.type === "OperatorNode" && (n as unknown as { fn: string }).fn === "divide") {
    let [num, den] = (n as unknown as { args: MathNode[] }).args;
    if (commenceParMoins(den)) {
      num = opposer(num);
      den = opposer(den);
    }
    return new math.OperatorNode("/", "divide", [factoriserRacineCommune(num), factoriserRacineCommune(den)]);
  }
  return factoriserRacineCommune(n);
}

/** Même nettoyage que `simplificationExpression.ts` (`\cdot` superflu retiré, `\dfrac`). */
function nettoyerLatexReference(brut: string): string {
  return brut
    .replace(/\\cdot\s*(?=[a-zA-Z\\{(])/g, "")
    .replace(/\\frac(?![a-zA-Z])/g, "\\dfrac")
    .replace(/-\s*\\left\(([^()+\-]+?)\\right\)/g, "-$1")
    .replace(/\{\s+/g, "{")
    .replace(/\s+\}/g, "}")
    .replace(/-\s+(?=[a-zA-Z0-9\\])/g, "-")
    .trim();
}

/** Forme simplifiée et normalisée, en LaTeX — `null` si mathjs n'interprète pas la formule. */
export function latexReferenceNormalisee(formule: string): string | null {
  try {
    return nettoyerLatexReference(normaliserReference(simplifierEnFractionUniqueNoeud(formule) as unknown as MathNode).toTex());
  } catch {
    return null;
  }
}

/** Même forme, ÉVALUABLE (utilisée par les contrôles : elle doit passer la vérification de l'écran). */
export function formuleReferenceNormalisee(formule: string): string | null {
  try {
    return normaliserReference(simplifierEnFractionUniqueNoeud(formule) as unknown as MathNode).toString();
  } catch {
    return null;
  }
}

/** Un domaine "pathologique" (vide, ou réduit à un ou des points isolés de largeur nulle) n'est pas
 * représentable proprement via `EnsembleReelGuideBuilder` (aucun bouton "ensemble vide" côté UI) ou
 * pédagogiquement peu intéressant — reroll plutôt qu'étendre `EnsembleReelGuide` pour ce cas rare
 * (voir CLAUDE.md section 5gen3, "reroll-on-degenerate-case"). */
function estDomainePathologique(e: EnsembleReelGuide): boolean {
  const morceaux = normaliserEnMorceaux(e);
  const largeur = morceaux.filter((m) => m.inf !== m.sup);
  return largeur.length === 0;
}

/** Racine d'une droite `ax+b` (coeffs ascendants `[b,a]`, `a≠0` garanti par construction — voir
 * `familles.ts::droiteNonNulle`). */
function racineDroite(droite: Polynome): number {
  return -droite[0] / droite[1];
}

/** `{comparateur,seuil}` tel que `a*u+b ◇ 0 ⟺ u ◇ seuil` — sens du comparateur dépend du signe de
 * `a` (positif : `≥` ; négatif : `≤`). */
function seuilPositifDroite(droite: Polynome): ConditionSurG {
  const [b, a] = droite;
  return { comparateur: a > 0 ? "ge" : "le", seuil: -b / a };
}

/**
 * D.4 — conditions posées par le domaine de l'EXTÉRIEURE sur `interieure(x)` (écran B, riche
 * uniquement). Dérivées DIRECTEMENT de la structure de chaque famille (jamais reconstruites depuis
 * `exterieure.domaine` par décomposition générique en morceaux — voir la note d'en-tête de
 * `core5e/composerFonctions.types.ts` pour la preuve de correction complète) :
 * - rationnelle : 1 condition (`≠`, racine du dénominateur).
 * - irrationnelleSimple : 1 condition (signe du radicande).
 * - racineSurFraction : 2 conditions INDÉPENDANTES (radicande, dénominateur) — toujours valable
 *   quelle que soit la position relative des 2 racines (préimage d'une intersection = intersection
 *   des préimages, un théorème général valable pour n'importe quelle fonction, pas une propriété de
 *   ce cas particulier).
 * - fractionSousRacine : le quotient `N(u)/D(u)≥0` n'est PAS décomposable en 2 conditions
 *   INDÉPENDANTES sur `u` (le signe du quotient dépend des 2 à la fois) — lu directement sur
 *   `exterieure.domaine`, déjà résolu et GARANTI réduit à un unique intervalle BORNÉ par la
 *   contrainte de génération "coefficients directeurs opposés"
 *   (`familles.ts::deuxDroitesSignesOpposes`) — les 2 bornes de cet unique morceau donnent alors
 *   exactement les 2 conditions cherchées.
 */
export function conditionsExterieurSurG(exterieure: DonneeFonction): ConditionSurG[] {
  const f = exterieure.fonction;
  if (f.type === "rationnelle") return [{ comparateur: "ne", seuil: racineDroite(f.denominateur) }];
  if (f.type === "irrationnelleSimple") return [seuilPositifDroite(f.radicande)];
  if (f.type === "racineSurFraction") {
    return [seuilPositifDroite(f.radicande), { comparateur: "ne", seuil: racineDroite(f.denominateur) }];
  }
  const morceaux = normaliserEnMorceaux(exterieure.domaine);
  const m = morceaux[0];
  const conditions: ConditionSurG[] = [];
  if (m.inf !== null) conditions.push({ comparateur: m.infInclus ? "ge" : "gt", seuil: m.inf });
  if (m.sup !== null) conditions.push({ comparateur: m.supInclus ? "le" : "lt", seuil: m.sup });
  return conditions;
}

/**
 * Cible de l'écran C2 (riche) — intersection des `conditions` (écran B), chacune résolue par
 * élévation au carré ("`interieure(x) ◇ seuil` ⟺ ..." selon la famille, voir `resoudreConditionSeuil`,
 * `solveur.ts`) : réutilise DIRECTEMENT le solveur général du pipeline "simple" (déjà cross-vérifié
 * pour les 3 familles à racine, voir `solveur.test.ts`) plutôt qu'une dérivation polynomiale
 * spécifique à `irrationnelleSimple` — nécessaire depuis que `riche` couvre `racineSurFraction`/
 * `fractionSousRacine` (voir `estRiche` ci-dessous) : `sqrt(U)/V ◇ seuil` (racineSurFraction) exige un
 * branchement sur le signe de V, `sqrt(N/D) ◇ seuil` (fractionSousRacine) se ramène à une inéquation
 * RATIONNELLE `N/D ◇ seuil²` — aucune des deux ne se réduit à une simple soustraction polynomiale
 * comme `irrationnelleSimple`, déjà géré en interne par `resoudreConditionSeuil`. `conditions.length`
 * toujours ≥1 pour une composition riche (voir `conditionsExterieurSurG`), `.reduce` sans valeur
 * initiale donc toujours sûr.
 */
export function domaineApresCarreDeConditions(g: FonctionComposable, conditions: ConditionSurG[]): EnsembleReelGuide {
  return conditions.map((c) => resoudreConditionSeuil(g, c.comparateur, c.seuil)).reduce((acc, e) => intersecterEnsembles(acc, e));
}

/** Marge stricte sous laquelle un `seuil` de condition (écran B) est rejeté par
 * `directionValide` — évite le cas dégénéré `seuil≤0` (`interieure(x)◇seuil` devient alors "toujours
 * vrai"/"toujours faux" pour ge/gt/le/lt, un cas trivial jamais rencontré par l'élève sur ce
 * pipeline, voir la note d'en-tête de `core5e/composerFonctions.types.ts`) — s'applique uniformément
 * aux 3 familles riche, `resoudreConditionSeuil` (`solveur.ts`) traitant ce cas dégénéré en interne
 * pour chacune. */
const SEUIL_MIN_CONDITION = 1e-6;

/** Dénominateur maximal pour qu'une borne soit considérée "saisissable" par l'élève (même seuil que
 * `formatFractionIrreductible`, `ui/formatFraction.ts` — jamais importé ici : Couche A ne dépend
 * jamais de `ui/`, la même petite recherche de fraction est répliquée localement, autonome). */
const DENOMINATEUR_MAX_BORNE = 100;
const TOLERANCE_RATIONNEL = 1e-9;

/** `true` ssi `v` s'écrit EXACTEMENT (à `TOLERANCE_RATIONNEL` près) comme une fraction de
 * dénominateur ≤ `DENOMINATEUR_MAX_BORNE` — jamais une approximation "assez proche", pour rester
 * fidèle à la convention "fraction irréductible, jamais de décimal" de la plateforme. */
function estRationnelSaisissable(v: number): boolean {
  if (Number.isInteger(v)) return true;
  for (let q = 2; q <= DENOMINATEUR_MAX_BORNE; q++) {
    if (Math.abs(v * q - Math.round(v * q)) < TOLERANCE_RATIONNEL) return true;
  }
  return false;
}

/** `true` ssi TOUTES les bornes finies de `e` sont rationnelles saisissables — `bug 5gen3 confirmé
 * empiriquement` (`prompt-corrections-precision-5e.md`, Partie 2) : pour les familles
 * `racineSurFraction`/`fractionSousRacine` en position intérieure, `resoudreConditionSeuil`
 * (`solveur.ts`) résout un polynôme degré 2 via `Math.sqrt(disc)` sans jamais garantir un
 * discriminant carré parfait — ~10% des bornes C2/domaine mesurées sur échantillon réel sont
 * irrationnelles, rendant l'exercice insoluble avec la saisie fraction/décimal disponible côté
 * élève. Repli sur un REGÉNÉRATION (comme `estDomainePathologique`), jamais un assouplissement de la
 * tolérance de vérification. */
function bornesRationnellesSaisissables(e: EnsembleReelGuide): boolean {
  return normaliserEnMorceaux(e).every((m) => (m.inf === null || estRationnelSaisissable(m.inf)) && (m.sup === null || estRationnelSaisissable(m.sup)));
}

/**
 * Une direction est "riche" ssi son intérieure contient une racine — les 3 familles
 * `irrationnelleSimple`/`racineSurFraction`/`fractionSousRacine` (jamais `rationnelle`, qui n'en a
 * pas). Corrigé (`promptcorrections5gen3bugs.md`, bug 1) : la première version ne testait que
 * `irrationnelleSimple`, laissant les 2 autres familles à racine traiter à tort comme "simple"
 * (écrans B/C1/C2 jamais atteints alors qu'ils auraient dû l'être).
 */
export function estRiche(fonction: FonctionComposable): boolean {
  return fonction.type === "irrationnelleSimple" || fonction.type === "racineSurFraction" || fonction.type === "fractionSousRacine";
}

/** Partie NUMÉRIQUE (bon marché) d'une direction — `riche`/`conditions`/`domaineApresCarre`/
 * `domaine`, jamais `formule`/`latex` (qui exige `simplifierLatex`, un appel mathjs coûteux,
 * `simplificationExpression.ts`). Séparée de `construireDirection` pour permettre de valider une
 * direction AVANT de payer le coût mathjs — indispensable depuis l'ajout du garde-fou
 * `bornesRationnellesSaisissables` (Partie 2, `prompt-corrections-precision-5e.md`) : certains
 * combos rejettent >99% des tirages, et calculer le LaTeX simplifié sur un tirage voué à être rejeté
 * multipliait la latence par un facteur mesuré ~500× (4,4s/tentative réussie contre quelques ms si
 * l'appel mathjs n'a lieu qu'une fois la direction confirmée valide). */
interface CoeurDirection {
  riche: boolean;
  conditions: ConditionSurG[];
  domaineApresCarre: EnsembleReelGuide | null;
  domaine: EnsembleReelGuide;
}

function construireCoeurDirection(interieure: DonneeFonction, exterieure: DonneeFonction): CoeurDirection {
  const riche = estRiche(interieure.fonction);
  const conditions = riche ? conditionsExterieurSurG(exterieure) : [];
  const domaineApresCarre = riche ? domaineApresCarreDeConditions(interieure.fonction, conditions) : null;
  return { riche, conditions, domaineApresCarre, domaine: domaineCompose(interieure, exterieure) };
}

function coeurDirectionValide(coeur: CoeurDirection): boolean {
  if (estDomainePathologique(coeur.domaine)) return false;
  if (!coeur.riche) return true;
  if (!coeur.conditions.every((c) => c.seuil > SEUIL_MIN_CONDITION)) return false;
  // Garde-fou génération (bug confirmé empiriquement, ~10% des tirages riche) — jamais atteint pour
  // `coeur.domaineApresCarre === null` (seulement possible si `!coeur.riche`, déjà exclu ci-dessus).
  if (coeur.domaineApresCarre !== null && !bornesRationnellesSaisissables(coeur.domaineApresCarre)) return false;
  return bornesRationnellesSaisissables(coeur.domaine);
}

/** Construit la partie coûteuse (formule/latex) — appelée UNIQUEMENT une fois `coeur` confirmé
 * valide par `coeurDirectionValide` (jamais avant, voir la note de `CoeurDirection`). */
function construireDirection(interieure: DonneeFonction, nomInterieure: "f" | "g", exterieure: DonneeFonction, coeur: CoeurDirection): CompositionDirigee {
  const formule = formuleComposee(exterieure, interieure);
  return {
    interieure,
    nomInterieure,
    exterieure,
    formule,
    // B.1 (promptcorrectionsround2.md) — la substitution brute (latexCompose) empile des parenthèses
    // et des fractions imbriquées jamais regroupées. `simplifierEnFractionUnique` (rationalize) est
    // tentée EN PREMIER : elle seule sait regrouper une fraction de fractions en une fraction unique
    // réduite (`9/(6/(-3x-2)-5)` → `(-27x-18)/(15x+16)`, le cas signalé pour 5gen3) — elle échoue vite
    // (`null`) sur toute composition "riche" (racine non résoluble algébriquement), auquel cas
    // `simplifierLatex` (distribue sans regrouper de fraction) prend le relais, avec son propre repli
    // sur la substitution brute si mathjs échoue (jamais d'exception ici, dans un cas comme l'autre).
    latex: latexReferenceNormalisee(formule) ?? simplifierLatex(formule, latexCompose(exterieure, interieure)),
    ...coeur,
  };
}

/** 200 suffisait avant le garde-fou `bornesRationnellesSaisissables` (Partie 2,
 * `prompt-corrections-precision-5e.md`) — depuis son ajout, le combo `racineSurFraction+
 * fractionSousRacine` en sens "lesDeux" (les 2 directions doivent réussir simultanément depuis LE
 * MÊME couple f/g) tombe à un taux de succès par essai d'environ 0,19 %, ce qui épuisait 200
 * tentatives ~68 % du temps (mesuré empiriquement, `construireAvecCombos` — seul le panneau dev
 * `SelecteurVarianteDev`, jamais `genererExerciceComposerFonctions`, qui retire un COMBO ALÉATOIRE
 * différent à chaque tentative et n'est donc jamais concentré sur ce cas rare). 5000 ramène ce taux
 * d'échec en dessous de 0,01 % (vérifié empiriquement) ; le coût par tentative reste négligeable
 * UNIQUEMENT parce que `construireExercice` valide `CoeurDirection` (numérique) AVANT tout appel à
 * `simplifierLatex` (mathjs) — voir la note de `CoeurDirection` ci-dessus. */
const TENTATIVES_MAX = 5000;

function construireExercice(f: DonneeFonction, g: DonneeFonction, sens: SensComposition): ExerciceComposerFonctions | null {
  const coeurFRondG = sens === "gRondF" ? null : construireCoeurDirection(g, f);
  if (coeurFRondG !== null && !coeurDirectionValide(coeurFRondG)) return null;
  const coeurGRondF = sens === "fRondG" ? null : construireCoeurDirection(f, g);
  if (coeurGRondF !== null && !coeurDirectionValide(coeurGRondF)) return null;
  const fRondG = coeurFRondG !== null ? construireDirection(g, "g", f, coeurFRondG) : null;
  const gRondF = coeurGRondF !== null ? construireDirection(f, "f", g, coeurGRondF) : null;
  return { f, g, sens, fRondG, gRondF };
}

export interface ComboFamilles {
  id: string;
  label: string;
  familles: [Formule, Formule];
}

const LABEL_FAMILLE: Record<Formule, string> = {
  rationnelle: "rationnelle",
  irrationnelleSimple: "racine simple",
  racineSurFraction: "racine sur fraction",
  fractionSousRacine: "fraction sous racine",
};

/** D.1 — 10 combinaisons NON ORDONNÉES des 4 familles composables (4 mêmes-famille + 6
 * familles-différentes) — `familles[0]` devient toujours f, `familles[1]` toujours g (convention
 * arbitraire pour les combos différents, sans incidence pour les combos même-famille : les 3
 * sous-variantes de sens — f∘g seul/g∘f seul/les deux — laissent de toute façon voir les 2 rôles). */
export const CATALOGUE_COMBOS: ComboFamilles[] = [
  { id: "rationnelle+rationnelle", label: `f ${LABEL_FAMILLE.rationnelle}, g ${LABEL_FAMILLE.rationnelle}`, familles: ["rationnelle", "rationnelle"] },
  { id: "irrationnelleSimple+irrationnelleSimple", label: `f ${LABEL_FAMILLE.irrationnelleSimple}, g ${LABEL_FAMILLE.irrationnelleSimple}`, familles: ["irrationnelleSimple", "irrationnelleSimple"] },
  { id: "racineSurFraction+racineSurFraction", label: `f ${LABEL_FAMILLE.racineSurFraction}, g ${LABEL_FAMILLE.racineSurFraction}`, familles: ["racineSurFraction", "racineSurFraction"] },
  { id: "fractionSousRacine+fractionSousRacine", label: `f ${LABEL_FAMILLE.fractionSousRacine}, g ${LABEL_FAMILLE.fractionSousRacine}`, familles: ["fractionSousRacine", "fractionSousRacine"] },
  { id: "rationnelle+irrationnelleSimple", label: `f ${LABEL_FAMILLE.rationnelle}, g ${LABEL_FAMILLE.irrationnelleSimple}`, familles: ["rationnelle", "irrationnelleSimple"] },
  { id: "rationnelle+racineSurFraction", label: `f ${LABEL_FAMILLE.rationnelle}, g ${LABEL_FAMILLE.racineSurFraction}`, familles: ["rationnelle", "racineSurFraction"] },
  { id: "rationnelle+fractionSousRacine", label: `f ${LABEL_FAMILLE.rationnelle}, g ${LABEL_FAMILLE.fractionSousRacine}`, familles: ["rationnelle", "fractionSousRacine"] },
  { id: "irrationnelleSimple+racineSurFraction", label: `f ${LABEL_FAMILLE.irrationnelleSimple}, g ${LABEL_FAMILLE.racineSurFraction}`, familles: ["irrationnelleSimple", "racineSurFraction"] },
  { id: "irrationnelleSimple+fractionSousRacine", label: `f ${LABEL_FAMILLE.irrationnelleSimple}, g ${LABEL_FAMILLE.fractionSousRacine}`, familles: ["irrationnelleSimple", "fractionSousRacine"] },
  { id: "racineSurFraction+fractionSousRacine", label: `f ${LABEL_FAMILLE.racineSurFraction}, g ${LABEL_FAMILLE.fractionSousRacine}`, familles: ["racineSurFraction", "fractionSousRacine"] },
];

export interface OptionSens {
  id: SensComposition;
  label: string;
}

/** D.1 — 3 sous-variantes de sens, ÉQUIPONDÉRÉES (jamais un tirage biaisé vers "les deux"). */
export const CATALOGUE_SENS: OptionSens[] = [
  { id: "fRondG", label: "f∘g seul" },
  { id: "gRondF", label: "g∘f seul" },
  { id: "lesDeux", label: "les deux" },
];

/** Panneau dev-only (`SelecteurVarianteDev`) — force la combinaison de familles ET le sens à la
 * fois (2 axes indépendants, jamais un seul catalogue combiné — même principe que gen57, 4e, pour
 * un générateur à 2 axes de tirage). */
export function construireAvecCombos(comboId: string, sens: SensComposition): ExerciceComposerFonctions {
  const combo = CATALOGUE_COMBOS.find((c) => c.id === comboId);
  if (!combo) throw new Error(`construireAvecCombos : combinaison inconnue "${comboId}"`);
  const [familleF, familleG] = combo.familles;
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const f = genererDonneeFonction("f", familleF);
    const g = genererDonneeFonction("g", familleG);
    const exercice = construireExercice(f, g, sens);
    if (exercice !== null) return exercice;
  }
  throw new Error(`construireAvecCombos : impossible d'obtenir une instance non dégénérée pour "${comboId}"/"${sens}" après ${TENTATIVES_MAX} tentatives`);
}

/** Audit 5e ch. 1, point 25 : retirer un nouveau COMBO à chaque rejet avantageait les combos qui
 * réussissent souvent (rationnelle + rationnelle à 25,5 % au lieu de 10 %). Le combo et le sens sont
 * désormais tirés UNE fois (équiprobables), seuls les coefficients sont retirés
 * (`construireAvecCombos`). Repli, en cas d'échec improbable après 5 000 essais, sur un autre tirage. */
export function genererExerciceComposerFonctions(): ExerciceComposerFonctions {
  for (let essai = 0; essai < 20; essai++) {
    const combo = CATALOGUE_COMBOS[entierAleatoire(0, CATALOGUE_COMBOS.length - 1)];
    const sens = CATALOGUE_SENS[entierAleatoire(0, CATALOGUE_SENS.length - 1)].id;
    try {
      return construireAvecCombos(combo.id, sens);
    } catch {
      continue;
    }
  }
  throw new Error("genererExerciceComposerFonctions : impossible d'obtenir une instance non dégénérée");
}
