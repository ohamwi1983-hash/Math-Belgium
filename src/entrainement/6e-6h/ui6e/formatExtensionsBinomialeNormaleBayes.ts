import type { ExerciceExtA, ExerciceExtB, ExerciceExtC, ExerciceExtD, ExerciceExtE, ExerciceExtF, ExerciceExtensionsBinomialeNormaleBayes } from "../core6e/extensionsBinomialeNormaleBayes.types";
import { destandardiserD, valeurCibleTableD, valeurZD } from "../generateurs6e/loiNormale/familleD";
import type { CalculerReferenceExtensionsBinomialeNormaleBayes, PhaseExtensionsBinomialeNormaleBayes, ResultatExerciceExtensionsBinomialeNormaleBayes } from "../moteur6e/typesExtensionsBinomialeNormaleBayes";
import { phasesPourExercice } from "../moteur6e/typesExtensionsBinomialeNormaleBayes";
import { esperanceF, jointCategorie3D, probabilitesF, probabiliteUniformeE, r3DeduitD } from "../moteur6e/verificationExtensionsBinomialeNormaleBayes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen52`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatLoiNormale.ts`/`formatDenombrementFondamental.ts`,
 * jamais importé par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **`calculerReferenceExtensionsBinomialeNormaleBayes`** — LA fonction qui relie Couche A
 * (`Phi`/`PhiInverse`, `generateurs6e/loiNormale/`, ce fichier a le droit d'importer) et Couche B
 * (`moteur6e/verificationExtensionsBinomialeNormaleBayes.ts`, qui ne le peut jamais) — MÊME PONT que
 * `6gen51` (`ui6e/formatLoiNormale.ts::calculerReferenceLoiNormale`) : injectée dans
 * `sessionExtensionsBinomialeNormaleBayes.ts` comme `calculerReference`, et réutilisée ICI pour les
 * mêmes calculs côté "état actuel". Seule la famille C en a besoin (loi normale inverse) — toutes
 * les autres familles renvoient `{}`.
 *
 * `probabilitesF`/`esperanceF`/`jointCategorie3D`/`r3DeduitD`/`probabiliteUniformeE` sont importées
 * de `moteur6e/verificationExtensionsBinomialeNormaleBayes.ts` (Couche B, "état actuel"/récap ont le
 * droit d'utiliser cette même vérité que la vérification — jamais une 2e formule dupliquée).
 *
 * **Vigilance signe orphelin / `%` non échappé / groupe LaTeX vide / débordement horizontal** (bugs
 * déjà rencontrés et corrigés sur plusieurs générateurs 6e, documentés CLAUDE.md) —
 * `formatDecimalVirgule`/`formatPourcentage` ci-dessous sont les SEULES fonctions qui convertissent
 * un nombre en LaTeX décimal/pourcentage dans ce module ; tout pourcentage narratif est TOUJOURS
 * suivi de `\%` échappé (jamais `%` brut dans un fragment `\text{...}`). Couverture de régression :
 * `formatExtensionsBinomialeNormaleBayes.test.ts`, scan de nombreux tirages des 6 familles.
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
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

/** Décimal français (virgule) — jamais un `.` anglais brut dans un fragment `\text{...}`/mode maths
 * (convention transversale du chantier). */
function formatDecimalVirgule(v: number): string {
  const arrondi = Math.round(v * 10000) / 10000;
  return String(arrondi).replace(".", "{,}");
}

/** Pourcentage en TEXTE BRUT pour une phrase narrative — MÊME convention que `formatPourcentageMot`
 * de `formatLoiBinomiale.ts` (`6gen50`, bug `%` non échappé trouvé et corrigé, CLAUDE.md) : le `\%`
 * est déjà collé au nombre (aucun espace), ce token reste donc intact face au découpage par mot de
 * `decouperEnFragmentsTexte`. */
function formatPourcentageMot(v: number): string {
  const pct = Math.round(v * 10000) / 100;
  return `${String(pct).replace(".", ",")}\\%`;
}

/** Longueur MAXIMALE (en caractères) d'un fragment `\text{...}` avant retour à la ligne — mirroir
 * EXACT `formatLoiBinomiale.ts`/`formatBinomialeSequenceOrdonnee.ts` (6gen48/50) : une phrase
 * française complète comme fragment KaTeX unique déborde horizontalement dès que l'écran est étroit
 * (`white-space:nowrap` interne à KaTeX, aucun retour à la ligne possible — bug trouvé et corrigé en
 * vérification Playwright, voir `docs/historique-6e.md`, section "Création — 6gen52"). */
const LONGUEUR_MAX_LIGNE = 28;

/** Découpe un texte narratif BRUT (jamais déjà en LaTeX) en plusieurs fragments `\text{...}` COURTS
 * — voir `LONGUEUR_MAX_LIGNE` ci-dessus. Toute phrase narrative de ce fichier passe par cette
 * fonction avant affichage, jamais un `\text{...}` unique englobant une phrase entière. */
function decouperEnFragmentsTexte(texte: string): string[] {
  const mots = texte.split(" ");
  const lignes: string[] = [];
  let courante = "";
  for (const mot of mots) {
    const candidate = courante === "" ? mot : `${courante} ${mot}`;
    if (candidate.length > LONGUEUR_MAX_LIGNE && courante !== "") {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = candidate;
    }
  }
  if (courante !== "") lignes.push(courante);
  return lignes.map((ligne) => `\\text{${ligne}}`);
}

// ============================================================================
// Famille A — Indépendance composée + trouver n via logarithme.
// ============================================================================

export function consigneGeneraleA(): string {
  return "Une expérience aléatoire, de probabilité de succès p à une seule répétition, est répétée de façon indépendante. Détermine le nombre minimal de répétitions pour que P(au moins 1 succès) dépasse un seuil donné.";
}

export function blocDonneesA(e: ExerciceExtA): string[] {
  return [...decouperEnFragmentsTexte(e.contexteTexte), `\\text{Seuil : }${formatDecimalVirgule(e.seuil)}`];
}

export function consigneEcranA(phase: PhaseExtensionsBinomialeNormaleBayes): string {
  if (phase === "aComposeEcran1P") return "Calcule p, la probabilité du succès composé (réussite des DEUX épreuves indépendantes).";
  if (phase === "aEcranAucunAuMoins") return "Pour UNE SEULE répétition : calcule P(aucun succès) puis P(au moins 1 succès).";
  if (phase === "aEcranTrouverN1") return "Pose l'inéquation correspondant à « P(au moins 1 succès) > seuil » en fonction de n, PUIS isole (1−p)ⁿ.";
  return "Résous l'inéquation CONFIRMÉE pour trouver n (utilise le logarithme), puis arrondis au nombre entier supérieur.";
}

/** Lignes confirmées à l'écran "p composé" — présent UNIQUEMENT pour `sousType==="compose"` (1er
 * écran dans ce cas ; réutilisées par tout écran ultérieur, correctif transversal accumulation, voir
 * CLAUDE.md/`docs/historique-6e.md`). */
function lignesEcranPComposeA(e: ExerciceExtA): string[] {
  return e.sousType === "compose" ? [`p=${formatDecimalVirgule(e.p)}\\text{ (confirmé, étape 1)}`] : [];
}

/** Lignes confirmées à l'écran "aucun/au moins" — écran 1 (sousType `direct`) ou écran 2 (sousType
 * `compose`, après l'écran p composé). */
function lignesEcranAucunAuMoinsA(e: ExerciceExtA): string[] {
  const numeroEcran = e.sousType === "compose" ? 2 : 1;
  return [`P(\\text{aucun succès})=${formatDecimalVirgule(1 - e.p)}\\text{ (confirmé, étape ${numeroEcran})}`, `P(\\text{au moins 1 succès})=${formatDecimalVirgule(e.p)}\\text{ (confirmé, étape ${numeroEcran})}`];
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, même bug que sur `6gen1`/`6gen58`) : `aEcranTrouverN1` omettait `p` (sousType `compose`) ;
 * `aEcranTrouverN2` ne montrait QUE l'inéquation isolée de l'écran précédent, jamais `p`/les
 * probabilités "aucun/au moins" des écrans antérieurs. Plus ancien en premier. */
export function etatActuelA(e: ExerciceExtA, phase: PhaseExtensionsBinomialeNormaleBayes): string[] | null {
  if (phase === "aEcranAucunAuMoins") return e.sousType === "compose" ? lignesEcranPComposeA(e) : null;
  const numeroEcranIsolee = e.sousType === "compose" ? 3 : 2;
  if (phase === "aEcranTrouverN1") return [...lignesEcranPComposeA(e), ...lignesEcranAucunAuMoinsA(e)];
  if (phase === "aEcranTrouverN2") {
    return [...lignesEcranPComposeA(e), ...lignesEcranAucunAuMoinsA(e), `1-(1-${formatDecimalVirgule(e.p)})^n<${formatDecimalVirgule(1 - e.seuil)}\\text{ (confirmé, étape ${numeroEcranIsolee}, forme isolée)}`];
  }
  return null;
}

function exempleInequationPoseeA(e: ExerciceExtA): string {
  return `ex : 1-(1-${e.p})^n > ${e.seuil}`;
}
function exempleInequationIsoleeA(e: ExerciceExtA): string {
  return `ex : (1-${e.p})^n < ${1 - e.seuil}`;
}

export function champsA(e: ExerciceExtA, phase: PhaseExtensionsBinomialeNormaleBayes): ChampDef[] {
  if (phase === "aComposeEcran1P") return [champTexte("p = p1 × p2 =", "ex : 0,12")];
  if (phase === "aEcranAucunAuMoins") return [champTexte("P(aucun succès) =", "ex : 0,88"), champTexte("P(au moins 1 succès) =", "ex : 0,12")];
  if (phase === "aEcranTrouverN1") return [champTexte("Inéquation posée (en n) =", exempleInequationPoseeA(e)), champTexte("Inéquation isolée (en n) =", exempleInequationIsoleeA(e))];
  return [champTexte("n (nombre minimal de répétitions) =", "ex : 22")];
}

export function niveauAideMaxA(phase: PhaseExtensionsBinomialeNormaleBayes): number {
  return phase === "aEcranTrouverN2" ? 2 : 0;
}

export function aideNiveau1A(phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  if (phase !== "aEcranTrouverN2") return AUCUNE_AIDE;
  return { texte: "Diviser (ou multiplier) une inégalité par un nombre négatif en inverse le sens. Ici, ln(1−p) est toujours négatif car 0<1−p<1.", latex: "\\ln(1-p)<0" };
}

export function aideNiveau2A(e: ExerciceExtA, phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  if (phase !== "aEcranTrouverN2") return AUCUNE_AIDE;
  const v = Math.log(1 - e.seuil) / Math.log(1 - e.p);
  return { texte: "La division a déjà été effectuée, SANS préciser le sens de l'inégalité ni arrondir (à toi de déterminer le sens correct, puis d'arrondir au nombre entier supérieur) :", latex: `n \\approx ${v.toFixed(3)}` };
}

// ============================================================================
// Famille B — Binomial classique étendu (réutilise 6gen48/6gen50).
// ============================================================================

const OPTIONS_STRATEGIE: OptionChoix[] = [
  { valeur: "termeUnique", label: "Terme unique" },
  { valeur: "somme", label: "Somme de termes" },
  { valeur: "complement", label: "Complément (1 − ...)" },
];

function libelleTypeQuestionB(e: ExerciceExtB): string {
  switch (e.typeQuestion) {
    case "exactement":
      return `P(X=${e.k})`;
    case "auMoins":
      return `P(X\\ge ${e.k})`;
    case "auPlus":
      return `P(X\\le ${e.k})`;
    case "aucun":
      return "P(X=0)";
    default:
      return "P(X=n)";
  }
}

export function consigneGeneraleB(): string {
  return "On étudie n épreuves identiques et indépendantes, chacune avec la même probabilité p de succès. Identifie d'abord la stratégie de calcul adaptée (terme unique, somme de plusieurs termes, ou complément), puis calcule.";
}

export function blocDonneesB(e: ExerciceExtB): string[] {
  return [...decouperEnFragmentsTexte(e.contexte.texte), `n=${e.n}`, `p=${formatDecimalVirgule(e.p)}`, `\\text{Calculer : }${libelleTypeQuestionB(e)}`];
}

function estEcran1B(phase: PhaseExtensionsBinomialeNormaleBayes): boolean {
  return phase === "bTermeUniqueEcran1" || phase === "bSommeEcran1" || phase === "bComplementEcran1";
}
function estEcran2B(phase: PhaseExtensionsBinomialeNormaleBayes): boolean {
  return phase === "bTermeUniqueEcran2" || phase === "bSommeEcran2" || phase === "bComplementEcran2";
}

export function consigneEcranB(phase: PhaseExtensionsBinomialeNormaleBayes): string {
  if (estEcran1B(phase)) return "Identifie la stratégie de calcul adaptée, puis liste le ou les termes k à calculer (séparés par des virgules).";
  if (estEcran2B(phase)) return "Calcule chaque valeur P(X=k) listée à l'étape précédente (CONFIRMÉE), dans le même ordre.";
  return "Combine les valeurs CONFIRMÉES de l'étape précédente pour obtenir le résultat final (somme, ou complément 1−...).";
}

/** Ligne confirmée à l'écran 1 (stratégie + termes) — réutilisée par tout écran ultérieur (correctif
 * transversal accumulation, voir CLAUDE.md/`docs/historique-6e.md`). */
function ligneEcran1B(e: ExerciceExtB): string {
  return `\\text{Stratégie confirmée (étape 1) : }${OPTIONS_STRATEGIE.find((o) => o.valeur === e.strategie)?.label}\\text{, termes : }${e.termesACalculer.join(",\\,")}`;
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal, voir CLAUDE.md/`docs/historique-
 * 6e.md`) : `bSommeEcran3`/`bComplementEcran3` omettait la stratégie/les termes de l'écran 1, ne
 * montrant que les valeurs de l'écran 2. Plus ancien en premier. */
export function etatActuelB(e: ExerciceExtB, phase: PhaseExtensionsBinomialeNormaleBayes): string[] | null {
  if (estEcran2B(phase)) return [ligneEcran1B(e)];
  if (phase === "bSommeEcran3" || phase === "bComplementEcran3") {
    return [ligneEcran1B(e), `\\text{Valeurs confirmées (étape 2) : }${e.valeursTermes.map((v) => formatDecimalVirgule(v)).join(",\\,")}`];
  }
  return null;
}

export function champsB(e: ExerciceExtB, phase: PhaseExtensionsBinomialeNormaleBayes): ChampDef[] {
  if (estEcran1B(phase)) return [{ type: "choix", label: "Stratégie :", options: OPTIONS_STRATEGIE }, champTexte("k à calculer (séparés par des virgules) =", "ex : 3")];
  if (estEcran2B(phase)) return e.termesACalculer.map((k) => champTexte(`P(X=${k}) =`, "ex : 0,25"));
  return [champTexte("Résultat final =", "ex : 0,84")];
}

export function niveauAideMaxB(phase: PhaseExtensionsBinomialeNormaleBayes): number {
  return estEcran1B(phase) ? 2 : 0;
}

export function aideNiveau1B(phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  if (!estEcran1B(phase)) return AUCUNE_AIDE;
  return { texte: "« Exactement k », « aucun » et « tous » se calculent avec un seul terme. « Au moins »/« au plus » se calculent par somme directe, sauf quand un simple complément (1 − ...) est plus rapide (souvent quand un seul terme manque au total).", latex: null };
}

export function aideNiveau2B(e: ExerciceExtB, phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  if (!estEcran1B(phase)) return AUCUNE_AIDE;
  return { texte: "La stratégie correcte pour cet exercice est déjà identifiée ci-dessous — la liste des termes k à calculer reste à toi :", latex: OPTIONS_STRATEGIE.find((o) => o.valeur === e.strategie)?.label ?? null };
}

// ============================================================================
// Famille C — Loi normale inverse en contexte (réutilise 6gen51 famille D).
// ============================================================================

const OPTIONS_TRANSFORMATION_C: OptionChoix[] = [
  { valeur: "cumulee", label: "Directe" },
  { valeur: "symetrique", label: "Symétrique" },
  { valeur: "encadree", label: "Encadrée" },
];

function equationCibleDepartC(e: ExerciceExtC): string {
  const b = e.base;
  if (b.sousType === "cumulee") return `P(X\\le a)=${formatDecimalVirgule(b.p)}`;
  if (b.sousType === "symetrique") return `P(\\mu\\le X\\le a)=${formatDecimalVirgule(b.p)}`;
  return `P(a\\le X\\le ${formatDecimalVirgule(b.b)})=${formatDecimalVirgule(b.p)}`;
}

export function consigneGeneraleC(): string {
  return "X suit une loi normale N(μ,σ). À partir d'un seuil de classement donné, détermine la valeur seuil a correspondante : reformule pour la table, lis-la à l'envers, puis dé-standardise.";
}

export function blocDonneesC(e: ExerciceExtC): string[] {
  return [...decouperEnFragmentsTexte(e.contexteTexte), `X\\sim\\mathcal{N}(${formatDecimalVirgule(e.base.mu)}\\text{ ; }${formatDecimalVirgule(e.base.sigma)})`, equationCibleDepartC(e)];
}

export function consigneEcranC(phase: PhaseExtensionsBinomialeNormaleBayes): string {
  if (phase === "cEcran1") return "Identifie la transformation nécessaire pour adapter la probabilité donnée à une lecture directe de la table, et calcule la valeur cible.";
  if (phase === "cEcran2") return "Lis la table À L'ENVERS : trouve z tel que Φ(z) égale la valeur cible CONFIRMÉE.";
  return "Dé-standardise à partir du z CONFIRMÉ : a=μ+z·σ.";
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal, voir CLAUDE.md/`docs/historique-
 * 6e.md`) : `cEcran3` omettait Φ(z) confirmé à `cEcran1`, ne montrant que z de `cEcran2`. Plus
 * ancien en premier. */
export function etatActuelC(e: ExerciceExtC, phase: PhaseExtensionsBinomialeNormaleBayes): string[] | null {
  if (phase === "cEcran2") return [`\\Phi(z)=${formatDecimalVirgule(valeurCibleTableD(e.base))}\\text{ (confirmé, étape 1)}`];
  if (phase === "cEcran3") return [`\\Phi(z)=${formatDecimalVirgule(valeurCibleTableD(e.base))}\\text{ (confirmé, étape 1)}`, `z=${formatDecimalVirgule(valeurZD(e.base))}\\text{ (confirmé, étape 2)}`];
  return null;
}

export function champsC(phase: PhaseExtensionsBinomialeNormaleBayes): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "choix", label: "Transformation :", options: OPTIONS_TRANSFORMATION_C }, champTexte("Φ(z) =", "ex : 0,9750")];
  if (phase === "cEcran2") return [champTexte("z =", "ex : 1,96")];
  return [champTexte("a =", "ex : 129,4")];
}

export function niveauAideMaxC(phase: PhaseExtensionsBinomialeNormaleBayes): number {
  return phase === "cEcran1" || phase === "cEcran3" ? 2 : 0;
}

export function aideNiveau1C(phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "La table ne donne QUE Φ(z)=P(Z≤z) directement — toute autre probabilité doit être reformulée sous cette forme avant lecture.", latex: null };
  if (phase === "cEcran3") return { texte: "Rappel de la formule inverse (à partir de z=(a−μ)/σ) :", latex: "a=\\mu+z\\cdot\\sigma" };
  return AUCUNE_AIDE;
}

export function aideNiveau2C(e: ExerciceExtC, phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  const b = e.base;
  if (phase === "cEcran1") {
    if (b.sousType === "cumulee") return { texte: "Relation de conversion (déjà sous la bonne forme) :", latex: `\\Phi(z)=p=${formatDecimalVirgule(b.p)}` };
    if (b.sousType === "symetrique") return { texte: "Relation de conversion appliquée en partie (valeur finale non isolée) :", latex: "\\Phi(z)=p+0{,}5" };
    return { texte: "Relation de conversion appliquée en partie (valeur finale non isolée) :", latex: "\\Phi(z)=\\Phi(z_b)-p" };
  }
  if (phase === "cEcran3") return { texte: "μ, σ et z substitués (calcul final non fait) :", latex: `a=${formatDecimalVirgule(b.mu)}+(${formatDecimalVirgule(valeurZD(b))})\\times ${formatDecimalVirgule(b.sigma)}` };
  return AUCUNE_AIDE;
}

/** Pont Couche A ↔ Couche B — voir en-tête de fichier. Seule la famille C en a besoin. */
export const calculerReferenceExtensionsBinomialeNormaleBayes: CalculerReferenceExtensionsBinomialeNormaleBayes = (exercice, phase) => {
  if (exercice.famille !== "C") return {};
  if (phase === "cEcran1") return { cibleTable: valeurCibleTableD(exercice.base) };
  if (phase === "cEcran2") return { zReference: valeurZD(exercice.base) };
  if (phase === "cEcran3") return { aReference: destandardiserD(exercice.base, valeurZD(exercice.base)) };
  return {};
};

// ============================================================================
// Famille D — Théorème de Bayes à 3 catégories.
// ============================================================================

export function consigneGeneraleD(): string {
  return "3 catégories se partagent une population. Pour 2 d'entre elles, on connaît la probabilité conditionnelle d'un critère ; la probabilité totale du critère (toutes catégories confondues) permet de déduire par différence la conditionnelle manquante pour la 3e catégorie.";
}

export function blocDonneesD(e: ExerciceExtD): string[] {
  return [
    ...decouperEnFragmentsTexte(e.contexte.texte),
    ...decouperEnFragmentsTexte(`Catégorie 1 (${e.contexte.labelCategorie1}) : ${formatPourcentageMot(e.q1)} des individus`),
    ...decouperEnFragmentsTexte(`Catégorie 2 (${e.contexte.labelCategorie2}) : ${formatPourcentageMot(e.q2)} des individus`),
    ...decouperEnFragmentsTexte(`Catégorie 3 (${e.contexte.labelCategorie3}) : le reste des individus`),
    ...decouperEnFragmentsTexte(`Parmi la catégorie 1, ${formatPourcentageMot(e.r1)} vérifient : ${e.contexte.labelCritere}`),
    ...decouperEnFragmentsTexte(`Parmi la catégorie 2, ${formatPourcentageMot(e.r2)} vérifient : ${e.contexte.labelCritere}`),
    ...decouperEnFragmentsTexte(`Au total (toutes catégories), ${formatPourcentageMot(e.pTotal)} vérifient : ${e.contexte.labelCritere}`),
  ];
}

export function consigneEcranD(phase: PhaseExtensionsBinomialeNormaleBayes): string {
  if (phase === "dEcran1") return "Identifie les 3 catégories et leurs probabilités d'appartenance (converties en décimal), en déduisant celle de la 3e catégorie.";
  if (phase === "dEcran2") return "Calcule la probabilité conjointe (catégorie ∩ critère) pour les 2 catégories dont la conditionnelle est connue.";
  if (phase === "dEcran3") return "Utilise la probabilité totale du critère (donnée) pour déduire, PAR DIFFÉRENCE, la probabilité conjointe manquante de la 3e catégorie.";
  return "Calcule la conditionnelle demandée P(critère | 3e catégorie), à partir de la valeur CONFIRMÉE de l'étape précédente et de q₃ CONFIRMÉ de l'étape 1.";
}

/** Lignes confirmées à l'écran 1 (probabilités d'appartenance) — réutilisées par tout écran
 * ultérieur (correctif transversal accumulation, voir CLAUDE.md/`docs/historique-6e.md`). */
function lignesEcran1D(e: ExerciceExtD): string[] {
  return [`q_1=${formatDecimalVirgule(e.q1)}\\text{ (confirmé, étape 1)}`, `q_2=${formatDecimalVirgule(e.q2)}\\text{ (confirmé, étape 1)}`, `q_3=${formatDecimalVirgule(e.q3)}\\text{ (confirmé, étape 1)}`];
}

/** Lignes confirmées à l'écran 2 (probabilités conjointes connues) — réutilisées par tout écran
 * ultérieur. */
function lignesEcran2D(e: ExerciceExtD): string[] {
  return [`q_1\\cdot r_1=${formatDecimalVirgule(e.q1 * e.r1)}\\text{ (confirmé, étape 2)}`, `q_2\\cdot r_2=${formatDecimalVirgule(e.q2 * e.r2)}\\text{ (confirmé, étape 2)}`];
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, même bug que sur `6gen1`/`6gen58`) : `dEcran3` omettait `q1`/`q2`/`q3` de l'écran 1 ;
 * `dEcran4` omettait les probabilités conjointes de l'écran 2. Plus ancien en premier. */
export function etatActuelD(e: ExerciceExtD, phase: PhaseExtensionsBinomialeNormaleBayes): string[] | null {
  if (phase === "dEcran2") return lignesEcran1D(e);
  if (phase === "dEcran3") return [...lignesEcran1D(e), ...lignesEcran2D(e)];
  if (phase === "dEcran4") return [...lignesEcran1D(e), ...lignesEcran2D(e), `P(\\text{crit.}\\cap\\text{cat. 3})=${formatDecimalVirgule(jointCategorie3D(e))}\\text{ (confirmé, étape 3)}`];
  return null;
}

export function champsD(phase: PhaseExtensionsBinomialeNormaleBayes): ChampDef[] {
  if (phase === "dEcran1") return [champTexte("q₁ =", "ex : 0,3"), champTexte("q₂ =", "ex : 0,3"), champTexte("q₃ =", "ex : 0,4")];
  if (phase === "dEcran2") return [champTexte("P(critère ∩ cat. 1) =", "ex : 0,06"), champTexte("P(critère ∩ cat. 2) =", "ex : 0,09")];
  if (phase === "dEcran3") return [champTexte("P(critère ∩ cat. 3) =", "ex : 0,2")];
  return [champTexte("P(critère | cat. 3) =", "ex : 0,5")];
}

export function niveauAideMaxD(phase: PhaseExtensionsBinomialeNormaleBayes): number {
  return phase === "dEcran3" ? 2 : 0;
}

export function aideNiveau1D(phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  if (phase !== "dEcran3") return AUCUNE_AIDE;
  return { texte: "La probabilité totale du critère est la SOMME des probabilités conjointes sur les 3 catégories — isole celle qui manque par différence.", latex: "P(\\text{critère})=\\sum_{i=1}^{3}q_i\\cdot r_i" };
}

export function aideNiveau2D(e: ExerciceExtD, phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  if (phase !== "dEcran3") return AUCUNE_AIDE;
  return { texte: "Somme des 2 valeurs déjà connues effectuée (soustraction depuis le total non faite) :", latex: `${formatDecimalVirgule(e.q1 * e.r1 + e.q2 * e.r2)}` };
}

// ============================================================================
// Famille E — Loi uniforme continue.
// ============================================================================

export function consigneGeneraleE(): string {
  return "X suit une loi uniforme sur [a;b] : la densité de probabilité est constante sur tout l'intervalle. Calcule P(c≤X≤d) en comparant les longueurs des intervalles [c;d] et [a;b] (aucune table, aucune intégrale nécessaire).";
}

export function blocDonneesE(e: ExerciceExtE): string[] {
  return [...decouperEnFragmentsTexte(e.contexte.texte), `X\\sim\\mathcal{U}([${e.a}\\text{ ; }${e.b}])`, `\\text{Calculer : }P(${e.c}\\le X\\le ${e.d})`];
}

export function consigneEcranE(phase: PhaseExtensionsBinomialeNormaleBayes): string {
  if (phase === "eEcran1") return "Détermine la longueur de l'intervalle [c;d] (numérateur) et celle de [a;b] (dénominateur) — le rapport n'est pas encore demandé.";
  return "Calcule la probabilité finale : rapport des 2 longueurs CONFIRMÉES.";
}

export function etatActuelE(e: ExerciceExtE, phase: PhaseExtensionsBinomialeNormaleBayes): string[] | null {
  if (phase !== "eEcran2") return null;
  return [`\\text{longueur}[c;d]=${e.d - e.c}\\text{, longueur}[a;b]=${e.b - e.a}\\text{ (confirmées)}`];
}

export function champsE(phase: PhaseExtensionsBinomialeNormaleBayes): ChampDef[] {
  if (phase === "eEcran1") return [champTexte("Longueur de [c;d] =", "ex : 15"), champTexte("Longueur de [a;b] =", "ex : 60")];
  return [champTexte("P(c≤X≤d) =", "ex : 0,25")];
}

export function niveauAideMaxE(phase: PhaseExtensionsBinomialeNormaleBayes): number {
  return phase === "eEcran1" ? 2 : 0;
}

export function aideNiveau1E(phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  if (phase !== "eEcran1") return AUCUNE_AIDE;
  return { texte: "Pour une loi uniforme, la probabilité d'un intervalle est proportionnelle à sa longueur — quel que soit l'endroit où il se trouve dans [a;b].", latex: null };
}

export function aideNiveau2E(e: ExerciceExtE, phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  if (phase !== "eEcran1") return AUCUNE_AIDE;
  return { texte: "Longueur de [c;d] et de [a;b], données séparément (le rapport reste à faire) :", latex: `${e.d - e.c}\\text{ et }${e.b - e.a}` };
}

// ============================================================================
// Famille F — Reconstruire une loi depuis des % croisés + espérance appliquée.
// ============================================================================

export function consigneGeneraleF(): string {
  return "Plusieurs options se partagent une population. Reconstruis la loi de probabilité complète de X (le montant associé à chaque option), calcule son espérance, puis applique-la à une population donnée.";
}

export function blocDonneesF(e: ExerciceExtF): string[] {
  return [
    ...decouperEnFragmentsTexte(e.contexte.texte),
    `\\text{${e.labels[0]} : }${e.valeurs[0]}\\text{ €}`,
    `\\text{${e.labels[1]} : }${e.valeurs[1]}\\text{ €}`,
    `\\text{${e.labels[2]} : }${e.valeurs[2]}\\text{ €}`,
    ...decouperEnFragmentsTexte(`${e.labels[0]} choisie par ${formatPourcentageMot(e.pourcentage1 / 100)} des clients`),
    ...decouperEnFragmentsTexte(`${e.labels[1]} choisie par ${formatPourcentageMot(e.pourcentage2 / 100)} des clients`),
    ...decouperEnFragmentsTexte(`${e.labels[2]} choisie par le reste des clients`),
    `N=${e.population}\\text{ (population totale)}`,
  ];
}

export function consigneEcranF(phase: PhaseExtensionsBinomialeNormaleBayes): string {
  if (phase === "fEcran1") return "Traduis les pourcentages donnés en probabilités décimales, et déduis par différence la probabilité manquante (celle qui correspond à « le reste »).";
  if (phase === "fEcran2") return "Construis la loi complète de X : pour chaque option, reporte sa valeur (déjà connue) et sa probabilité CONFIRMÉE.";
  if (phase === "fEcran3") return "Calcule l'espérance E(X)=Σxᵢ·pᵢ à partir de la loi CONFIRMÉE de l'étape précédente.";
  return "Multiplie E(X) CONFIRMÉE par la taille de la population pour estimer le total attendu.";
}

/** Table confirmée à l'écran 2 (loi complète, valeurs ET probabilités CONFIRMÉES de l'écran 1
 * intégrées) — réutilisée par tout écran ultérieur (correctif transversal accumulation, voir
 * CLAUDE.md/`docs/historique-6e.md`). */
function ligneTableConfirmeeF(e: ExerciceExtF): string {
  const colonnes = "c".repeat(e.valeurs.length);
  const [p1, p2, p3] = probabilitesF(e);
  const ligneX = e.valeurs.map((v) => `${v}`).join(" & ");
  const ligneP = [p1, p2, p3].map((p) => formatDecimalVirgule(p)).join(" & ");
  return `\\begin{array}{c|${colonnes}}x_i & ${ligneX}\\\\\\hline p_i & ${ligneP}\\end{array}\\text{ (confirmée, étape 2)}`;
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal, voir CLAUDE.md/`docs/historique-
 * 6e.md`) : `fEcran4` ne montrait QUE E(X) de l'écran 3, jamais la loi complète (déjà confirmée à
 * l'écran 2, laquelle intègre elle-même p₁/p₂/p₃ de l'écran 1). Plus ancien en premier. */
export function etatActuelF(e: ExerciceExtF, phase: PhaseExtensionsBinomialeNormaleBayes): string[] | null {
  if (phase === "fEcran2") {
    const [p1, p2, p3] = probabilitesF(e);
    return [`p_1=${formatDecimalVirgule(p1)}\\text{, }p_2=${formatDecimalVirgule(p2)}\\text{, }p_3=${formatDecimalVirgule(p3)}\\text{ (confirmées, étape 1)}`];
  }
  if (phase === "fEcran3") return [ligneTableConfirmeeF(e)];
  if (phase === "fEcran4") return [ligneTableConfirmeeF(e), `E(X)=${formatDecimalVirgule(esperanceF(e))}\\text{ (confirmée, étape 3)}`];
  return null;
}

export function champsF(e: ExerciceExtF, phase: PhaseExtensionsBinomialeNormaleBayes): ChampDef[] {
  if (phase === "fEcran1") return [champTexte(`p(${e.labels[0]}) =`, "ex : 0,3"), champTexte(`p(${e.labels[1]}) =`, "ex : 0,2"), champTexte(`p(${e.labels[2]}) =`, "ex : 0,5")];
  if (phase === "fEcran2") return e.labels.flatMap((label, i) => [champTexte(`${label} — valeur =`, `ex : ${e.valeurs[i]}`), champTexte(`${label} — probabilité =`, "ex : 0,3")]);
  if (phase === "fEcran3") return [champTexte("E(X) =", "ex : 21")];
  return [champTexte("Total attendu sur la population =", "ex : 10500")];
}

export function niveauAideMaxF(): number {
  return 0;
}
export function aideNiveau1F(): AideAvecLatex {
  return AUCUNE_AIDE;
}
export function aideNiveau2F(): AideAvecLatex {
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceExtensionsBinomialeNormaleBayes): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
    case "E":
      return consigneGeneraleE();
    case "F":
      return consigneGeneraleF();
  }
}

export function blocDonnees(exercice: ExerciceExtensionsBinomialeNormaleBayes): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
    case "F":
      return blocDonneesF(exercice);
  }
}

export function consigneEcran(exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
    case "E":
      return consigneEcranE(phase);
    case "F":
      return consigneEcranF(phase);
  }
}

export function etatActuel(exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(exercice, phase);
    case "F":
      return etatActuelF(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(exercice, phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(phase);
    case "D":
      return champsD(phase);
    case "E":
      return champsE(phase);
    case "F":
      return champsF(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
    case "E":
      return niveauAideMaxE(phase);
    case "F":
      return niveauAideMaxF();
  }
}

export function aideNiveau1(exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
    case "E":
      return aideNiveau1E(phase);
    case "F":
      return aideNiveau1F();
  }
}

export function aideNiveau2(exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
    case "E":
      return aideNiveau2E(exercice, phase);
    case "F":
      return aideNiveau2F();
  }
}

export const LIBELLE_PHASE: Record<PhaseExtensionsBinomialeNormaleBayes, string> = {
  aComposeEcran1P: "Étape 1 (probabilité composée p₁×p₂)",
  aEcranAucunAuMoins: "Étape (aucun succès / au moins 1 succès)",
  aEcranTrouverN1: "Étape (inéquation posée + isolée)",
  aEcranTrouverN2: "Étape (valeur finale de n)",
  bTermeUniqueEcran1: "Étape 1 (stratégie + terme)",
  bTermeUniqueEcran2: "Étape 2 (valeur du terme)",
  bSommeEcran1: "Étape 1 (stratégie + termes)",
  bSommeEcran2: "Étape 2 (valeurs des termes)",
  bSommeEcran3: "Étape 3 (somme finale)",
  bComplementEcran1: "Étape 1 (stratégie + terme)",
  bComplementEcran2: "Étape 2 (valeur du terme)",
  bComplementEcran3: "Étape 3 (complément final)",
  cEcran1: "Étape 1 (transformation + valeur cible)",
  cEcran2: "Étape 2 (lecture inverse de la table)",
  cEcran3: "Étape 3 (dé-standardisation)",
  dEcran1: "Étape 1 (probabilités d'appartenance)",
  dEcran2: "Étape 2 (probabilités conjointes connues)",
  dEcran3: "Étape 3 (déduction par différence)",
  dEcran4: "Étape 4 (conditionnelle finale)",
  eEcran1: "Étape 1 (longueurs des intervalles)",
  eEcran2: "Étape 2 (probabilité finale)",
  fEcran1: "Étape 1 (probabilités reconstruites)",
  fEcran2: "Étape 2 (loi complète de X)",
  fEcran3: "Étape 3 (espérance E(X))",
  fEcran4: "Étape 4 (total attendu sur la population)",
};

export const LIBELLE_FAMILLE: Record<ExerciceExtensionsBinomialeNormaleBayes["famille"], string> = {
  A: "A — Indépendance composée + trouver n",
  B: "B — Binomial classique étendu",
  C: "C — Loi normale inverse en contexte",
  D: "D — Bayes à 3 catégories",
  E: "E — Loi uniforme continue",
  F: "F — Reconstruire une loi + espérance appliquée",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes): string[] {
  if (exercice.famille === "A") {
    if (phase === "aComposeEcran1P") return [`${formatDecimalVirgule(exercice.p)}`];
    if (phase === "aEcranAucunAuMoins") return [`${formatDecimalVirgule(1 - exercice.p)},\\,${formatDecimalVirgule(exercice.p)}`];
    if (phase === "aEcranTrouverN1") return [`1-(1-${formatDecimalVirgule(exercice.p)})^n>${formatDecimalVirgule(exercice.seuil)}\\text{, puis }(1-${formatDecimalVirgule(exercice.p)})^n<${formatDecimalVirgule(1 - exercice.seuil)}`];
    return [`${exercice.valeurN}`];
  }
  if (exercice.famille === "B") {
    if (estEcran1B(phase)) return [`${OPTIONS_STRATEGIE.find((o) => o.valeur === exercice.strategie)?.label}\\text{, }${exercice.termesACalculer.join(",\\,")}`];
    if (estEcran2B(phase)) return [exercice.valeursTermes.map((v) => formatDecimalVirgule(v)).join(",\\,")];
    return [`${formatDecimalVirgule(exercice.resultatFinal)}`];
  }
  if (exercice.famille === "C") {
    if (phase === "cEcran1") return [`${formatDecimalVirgule(valeurCibleTableD(exercice.base))}`];
    if (phase === "cEcran2") return [`${formatDecimalVirgule(valeurZD(exercice.base))}`];
    return [`${formatDecimalVirgule(destandardiserD(exercice.base, valeurZD(exercice.base)))}`];
  }
  if (exercice.famille === "D") {
    if (phase === "dEcran1") return [`${formatDecimalVirgule(exercice.q1)},\\,${formatDecimalVirgule(exercice.q2)},\\,${formatDecimalVirgule(exercice.q3)}`];
    if (phase === "dEcran2") return [`${formatDecimalVirgule(exercice.q1 * exercice.r1)},\\,${formatDecimalVirgule(exercice.q2 * exercice.r2)}`];
    if (phase === "dEcran3") return [`${formatDecimalVirgule(jointCategorie3D(exercice))}`];
    return [`${formatDecimalVirgule(r3DeduitD(exercice))}`];
  }
  if (exercice.famille === "E") {
    if (phase === "eEcran1") return [`${exercice.d - exercice.c},\\,${exercice.b - exercice.a}`];
    return [`${formatDecimalVirgule(probabiliteUniformeE(exercice))}`];
  }
  // famille F
  const [p1, p2, p3] = probabilitesF(exercice);
  if (phase === "fEcran1") return [`${formatDecimalVirgule(p1)},\\,${formatDecimalVirgule(p2)},\\,${formatDecimalVirgule(p3)}`];
  if (phase === "fEcran2") {
    const probas = [p1, p2, p3];
    return [exercice.valeurs.map((v, i) => `${v}\\text{ (}${formatDecimalVirgule(probas[i])}\\text{)}`).join(",\\,")];
  }
  if (phase === "fEcran3") return [`${formatDecimalVirgule(esperanceF(exercice))}`];
  return [`${Math.round(esperanceF(exercice) * exercice.population)}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsExtensionsBinomialeNormaleBayes(resultat: ResultatExerciceExtensionsBinomialeNormaleBayes): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
