import type { CompositionDirigee, ConditionSurG, ExerciceComposerFonctions, FonctionComposable } from "../core5e/composerFonctions.types";
import type { ComparateurSeuil } from "../core5e/composerFonctions.types";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { PhaseComposerFonctions } from "../moteur5e/typesComposerFonctions";
import { formatPolynomeLatex } from "../generateurs5e/domaineDefinition/polynome";
import { formatEnsembleReelLatex, formatTermesEnsembleReelLatex, formatValeurLatex } from "./formatDomaineDefinition";

/** D.5 — consigne générale, affichée sur TOUS les écrans (A.2/A.9, ordre standard des blocs :
 * consigne générale → bloc de données → bloc "état actuel" → question de l'écran). */
export const CONSIGNE_GENERALE_COMPOSER_FONCTIONS = "Soient les fonctions f et g ci-dessous.";

function nomExterieure(dir: CompositionDirigee): "f" | "g" {
  return dir.nomInterieure === "f" ? "g" : "f";
}

function nomComposition(estFRondG: boolean): string {
  return estFRondG ? "f∘g" : "g∘f";
}

export function estPhaseFRondG(phase: PhaseComposerFonctions): boolean {
  return phase.endsWith("FRondG");
}

// ============================================================================
// Écran "formule" (A) — construire l'expression composée. Inchangé par rapport à l'ancien modèle,
// seule la consigne est désormais dérivée de la direction plutôt que codée en dur par écran.
// ============================================================================

export function consigneFormule(dir: CompositionDirigee): string {
  const ext = nomExterieure(dir);
  const int = dir.nomInterieure;
  return `Écris l'expression de (${ext}∘${int})(x) = ${ext}(${int}(x)), simplifiée au maximum.`;
}

export const PLACEHOLDER_FORMULE = "ex : sqrt(2x-4)";

export function texteAideFormuleNiveau1(dir: CompositionDirigee): string {
  return `Remplace chaque x de ${nomExterieure(dir)}(x) par ${dir.nomInterieure}(x), puis simplifie si possible.`;
}

export function latexAideFormuleNiveau2(dir: CompositionDirigee): string {
  return `(${nomExterieure(dir)}\\circ ${dir.nomInterieure})(x) = ${dir.latex}`;
}

// ============================================================================
// Écran "conditions" (B, riche uniquement) — poser la/les condition(s) imposées par le domaine de
// l'extérieure sur `interieure(x)`.
// ============================================================================

export function consigneConditions(dir: CompositionDirigee): string {
  const ext = nomExterieure(dir);
  const int = dir.nomInterieure;
  const pluriel = dir.conditions.length > 1;
  return `Sachant que ${int}(x) doit tomber dans dom(${ext}) pour que (${ext}∘${int})(x) soit défini, pose ${pluriel ? "les 2 conditions" : "la condition"} que ${int}(x) doit vérifier (arrondis au centième près si besoin).`;
}

export function texteAideConditionsNiveau1(dir: CompositionDirigee): string {
  return `dom(${nomExterieure(dir)}) impose une (ou plusieurs) restriction(s) sur son argument — remplace cet argument par ${dir.nomInterieure}(x).`;
}

export function latexAideConditionsNiveau2(dir: CompositionDirigee): string {
  return `\\text{dom}(${nomExterieure(dir)}) = ${formatEnsembleReelLatex(dir.exterieure.domaine)}`;
}

const LATEX_COMPARATEUR: Record<ComparateurSeuil, string> = { eq: "=", ne: "\\neq", ge: "\\geq", gt: ">", le: "\\leq", lt: "<" };

export function formatConditionLatex(dir: CompositionDirigee, c: ConditionSurG): string {
  return `${dir.nomInterieure}(x) ${LATEX_COMPARATEUR[c.comparateur]} ${formatValeurLatex(c.seuil)}`;
}

export function formatTermesConditionsLatex(dir: CompositionDirigee): string[] {
  return dir.conditions.map((c) => formatConditionLatex(dir, c));
}

// ============================================================================
// Écran "c1" (riche uniquement) — poser/résoudre la contrainte de validité du domaine PROPRE de
// l'intérieure elle-même — nécessaire avant toute élévation au carré. Généralisé aux 3 familles
// riche (bug 1, `promptcorrections5gen3bugs.md`) — la forme de cette contrainte diffère par
// famille : une seule condition polynomiale (irrationnelleSimple), 2 conditions INDÉPENDANTES
// (racineSurFraction : radicande ≥ 0 ET dénominateur ≠ 0), une inéquation RATIONNELLE
// (fractionSousRacine : le quotient lui-même ≥ 0).
// ============================================================================

/** L'expression EXACTE sous la racine carrée que REPRÉSENTE `g(x)` — uniquement pour les 2
 * familles qui SONT directement une racine carrée (`sqrt(quelque chose)`), jamais
 * `racineSurFraction` (un QUOTIENT dont seul le numérateur est une racine — voir
 * `texteAideC2Niveau1`/`latexAideC2Niveau2`, qui la traitent séparément). */
function argumentSousRacineLatex(f: FonctionComposable): string | null {
  if (f.type === "irrationnelleSimple") return formatPolynomeLatex(f.radicande);
  if (f.type === "fractionSousRacine") return `\\dfrac{${formatPolynomeLatex(f.numerateur)}}{${formatPolynomeLatex(f.denominateur)}}`;
  return null;
}

/** Libellé partagé entre l'aide de C1/C2 et le bloc "état actuel" (bug 2), pour rester cohérent
 * d'un écran à l'autre. */
function libelleDomainePropre(dir: CompositionDirigee): string {
  return `\\text{domaine propre de } ${dir.nomInterieure}`;
}

export function consigneC1(dir: CompositionDirigee): string {
  return `Avant d'élever au carré, pose et résous la ou les condition(s) qui garantissent que ${dir.nomInterieure}(x) est bien définie (son propre domaine).`;
}

export function texteAideC1Niveau1(dir: CompositionDirigee): string {
  const f = dir.interieure.fonction;
  if (f.type === "racineSurFraction") return "Le radicande d'une racine carrée doit toujours être ≥ 0, ET un dénominateur ne peut jamais être nul — ici, 2 conditions indépendantes à combiner par ET.";
  if (f.type === "fractionSousRacine") return "Ce qui se trouve sous une racine carrée doit toujours être ≥ 0 — ici, un quotient : il faut étudier son signe (numérateur et dénominateur).";
  return "Le radicande d'une racine carrée doit toujours être ≥ 0.";
}

export function latexAideC1Niveau2(dir: CompositionDirigee): string | null {
  const f = dir.interieure.fonction;
  if (f.type === "racineSurFraction") {
    return `\\begin{gathered} ${formatPolynomeLatex(f.radicande)} \\geq 0 \\\\ ${formatPolynomeLatex(f.denominateur)} \\neq 0 \\end{gathered}`;
  }
  const argument = argumentSousRacineLatex(f);
  return argument === null ? null : `${argument} \\geq 0`;
}

// ============================================================================
// Écran "c2" (riche uniquement) — élever chaque condition de l'écran B au carré, résoudre,
// combiner (toujours par ET). Pour `irrationnelleSimple`/`fractionSousRacine`, `g(x)` EST
// directement une racine carrée (toujours ≥ 0) : élever au carré ne change jamais le sens de la
// condition, quel que soit le comparateur. Pour `racineSurFraction`, `g(x)` est un QUOTIENT dont
// le signe dépend du dénominateur — élever au carré exige de distinguer 2 régions (voir
// `texteAideC2Niveau1`) ; la cible RÉELLE de cet écran (`dir.domaineApresCarre`) reste correcte
// dans les 2 cas (calculée via `resoudreConditionSeuil`, `solveur.ts`, qui gère ce branchement en
// interne), seule l'AIDE affichée à l'élève diffère.
// ============================================================================

export function consigneC2(dir: CompositionDirigee): string {
  const pluriel = dir.conditions.length > 1;
  return `Élève ${pluriel ? "chaque condition" : "la condition"} de l'écran précédent au carré, résous ${pluriel ? "chacune" : "-la"}, puis combine ${pluriel ? "les 2 résultats (toujours par ET)" : "le résultat avec le domaine de " + dir.nomInterieure}.`;
}

export function texteAideC2Niveau1(dir: CompositionDirigee): string {
  const f = dir.interieure.fonction;
  if (f.type === "racineSurFraction") {
    return "Ici, g(x) est un quotient (racine carrée divisée par une expression) : son signe dépend du dénominateur, distingue 2 cas. Là où le dénominateur est positif, élever au carré ne change pas le sens de la condition. Là où il est négatif, la condition est automatiquement vraie ou fausse (une racine carrée est toujours ≥ 0, jamais inférieure à un nombre négatif) — inutile de résoudre quoi que ce soit sur le radicande dans ce cas.";
  }
  return "Le seuil de chaque condition est toujours strictement positif ici : g(x) est directement une racine carrée, donc toujours ≥ 0 — élever au carré ne change jamais le sens de la condition (aucun cas particulier à distinguer).";
}

export function latexAideC2Niveau2(dir: CompositionDirigee): string | null {
  const f = dir.interieure.fonction;
  if (f.type === "racineSurFraction") {
    return `\\begin{gathered} \\text{si } ${formatPolynomeLatex(f.denominateur)} > 0 : \\text{même sens, élève au carré} \\\\ \\text{si } ${formatPolynomeLatex(f.denominateur)} < 0 : \\text{condition automatiquement vraie ou fausse} \\end{gathered}`;
  }
  const argument = argumentSousRacineLatex(f);
  if (argument === null) return null;
  const lignes = dir.conditions.map((c) => `${argument} ${LATEX_COMPARATEUR[c.comparateur]} ${formatValeurLatex(c.seuil * c.seuil)}`);
  if (lignes.length <= 1) return lignes[0] ?? null;
  return `\\begin{gathered} ${lignes.join(" \\\\ ")} \\end{gathered}`;
}

// ============================================================================
// Écran "domaine" (D) — final, atteint dans les 2 pipelines (simple directement après "formule",
// riche après "c1"/"c2").
// ============================================================================

export function consigneDomaine(dir: CompositionDirigee): string {
  return `Exprime le domaine de définition de ${nomExterieure(dir)}∘${dir.nomInterieure}, dom(${nomExterieure(dir)}∘${dir.nomInterieure}).`;
}

export function texteAideDomaineNiveau1(dir: CompositionDirigee): string {
  if (dir.riche) return "Combine ce que tu as trouvé aux 2 écrans précédents — le domaine final est leur intersection.";
  return `dom(${nomExterieure(dir)}∘${dir.nomInterieure}) = dom(${dir.nomInterieure}) ∩ {x : ${dir.nomInterieure}(x) ∈ dom(${nomExterieure(dir)})} — il faut d'abord que x soit dans dom(${dir.nomInterieure}), ET que ${dir.nomInterieure}(x) tombe dans dom(${nomExterieure(dir)}).`;
}

export function latexAideDomaineNiveau2(dir: CompositionDirigee): string {
  if (dir.riche && dir.domaineApresCarre !== null) {
    return `\\begin{gathered} ${libelleDomainePropre(dir)} : ${formatEnsembleReelLatex(dir.interieure.domaine)} \\\\ \\text{après mise au carré} : ${formatEnsembleReelLatex(dir.domaineApresCarre)} \\end{gathered}`;
  }
  return `\\text{dom}(${dir.nomInterieure}) = ${formatEnsembleReelLatex(dir.interieure.domaine)} \\qquad \\text{dom}(${nomExterieure(dir)}) = ${formatEnsembleReelLatex(dir.exterieure.domaine)}`;
}

// ============================================================================
// Bloc "état actuel" — récapitule, sur chaque écran APRÈS le premier, les valeurs déjà CONFIRMÉES
// (jamais la saisie brute de l'élève, même convention que 5gen1). Corrigé (bug 2,
// `promptcorrections5gen3bugs.md`) : la première version ne poussait que les 2 "jalons" par
// direction (formule composée, domaine final), sautant les étapes intermédiaires riche
// (conditions/c1/c2) — l'élève travaillant sur l'écran c2 par exemple ne voyait donc jamais la
// condition posée à B ni le domaine propre confirmé à C1. Désormais, TANT QUE la direction
// courante est la MÊME que celle de la phase déjà close (`memeDirection`), conditions/c1/c2
// s'accumulent elles aussi ; une fois la direction ENTIÈREMENT close (progression vers l'autre
// direction, `sens==="lesDeux"`), seuls les 2 jalons (formule, domaine) restent visibles pour
// elle — jamais un historique qui grossirait indéfiniment sur toute la session.
// ============================================================================

/** Un fragment "dom(...) = ..." — bloc fitter (voir `formatTermesEnsembleReelLatex`) avec le
 * préfixe porté par le premier morceau seulement, même patron que `formatTermesEtatActuelCELatex`
 * (5gen1). */
function formatTermesDomaineAvecPrefixe(prefixe: string, ensemble: EnsembleReelGuide): string[] {
  const termes = formatTermesEnsembleReelLatex(ensemble);
  return termes.map((t, i) => (i === 0 ? `${prefixe} ${t}` : t));
}

export function formatTermesEtatActuelComposerFonctions(exercice: ExerciceComposerFonctions, ordre: PhaseComposerFonctions[], indexPhase: number): string[] {
  const termes: string[] = [];
  const phaseCourante = ordre[indexPhase] as PhaseComposerFonctions | undefined;
  const directionCourante = phaseCourante ? estPhaseFRondG(phaseCourante) : null;
  for (let i = 0; i < indexPhase; i++) {
    const phase = ordre[i];
    const estFRondG = estPhaseFRondG(phase);
    const dir = estFRondG ? exercice.fRondG : exercice.gRondF;
    if (dir === null) continue;
    const nom = nomComposition(estFRondG);
    const memeDirection = directionCourante !== null && estFRondG === directionCourante;
    if (phase.startsWith("formule")) {
      termes.push(`(${nom})(x) = ${dir.latex}`);
    } else if (phase.startsWith("conditions") && memeDirection) {
      termes.push(...formatTermesConditionsLatex(dir));
    } else if (phase.startsWith("c1") && memeDirection) {
      termes.push(...formatTermesDomaineAvecPrefixe(`${libelleDomainePropre(dir)} =`, dir.interieure.domaine));
    } else if (phase.startsWith("c2") && memeDirection && dir.domaineApresCarre !== null) {
      termes.push(...formatTermesDomaineAvecPrefixe(`\\text{après mise au carré} =`, dir.domaineApresCarre));
    } else if (phase.startsWith("domaine")) {
      termes.push(...formatTermesDomaineAvecPrefixe(`\\text{dom}(${nom}) =`, dir.domaine));
    }
  }
  return termes;
}

// ============================================================================
// Libellés du récapitulatif final (`ResultatPanelComposerFonctions.tsx`).
// ============================================================================

export function libellePhaseComposerFonctions(phase: PhaseComposerFonctions): string {
  const nom = nomComposition(estPhaseFRondG(phase));
  if (phase.startsWith("formule")) return nom;
  if (phase.startsWith("conditions")) return `Conditions (${nom})`;
  if (phase.startsWith("c1")) return `Validité du domaine propre (${nom})`;
  if (phase.startsWith("c2")) return `Après mise au carré (${nom})`;
  return `dom(${nom})`;
}
