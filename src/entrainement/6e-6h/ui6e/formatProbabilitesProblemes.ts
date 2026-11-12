import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleEMixte, ExerciceFamilleF, ExerciceFamilleGMelange, ExerciceProbabilitesProblemes } from "../core6e/probabilitesProblemes.types";
import type { PhaseProbabilitesProblemes } from "../moteur6e/typesProbabilitesProblemes";
import { bayesEcran3C, branchesArbreC, probabiliteEffetC } from "../moteur6e/verificationIndependanceBayes";
import {
  affirmationFEstVraie,
  configurationsExactementK,
  facteursEcran1,
  nombreCheminsKSucces,
  probabiliteConfiguration,
  probabiliteExactementKFamilleC,
  probabiliteTotaleMelange,
  probExactementKChemins,
  probToutesDifferentes,
  valeurAlternativeF,
  valeurConfigurationF,
  valeurEcran3EpreuvesRepetees,
} from "../moteur6e/verificationProbabilitesProblemes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage pour `6gen33`. Toutes les quantités dérivées
 * affichées réutilisent les fonctions de `moteur6e/verificationProbabilitesProblemes.ts`.
 *
 * Règles (audit 6e ch. 6) :
 * - la prose reste un fragment `texte()` ; seule une expression symbolique courte devient `latex()`
 *   (dans les blocs KaTeX, les mots sont toujours dans `\text{}`) ;
 * - pas de majuscules d'insistance, pas de « càd » ;
 * - placeholders HORS de l'espace de tirage et sans notation clavier (« valeur exacte ou
 *   arrondie », jamais « ex : 364/365 », qui était la réponse) ;
 * - récapitulatif (réponses des écrans déjà clos, réutilisées par l'élève) et aides : valeurs
 *   EXACTES (décimal fini, fraction) ou, à défaut, 6 décimales pour une valeur intermédiaire — jamais
 *   un arrondi au centième qui, repris par l'élève, ferait refuser la bonne réponse ;
 * - famille B (décision G) : le nombre de chemins à k succès se compte dans l'arbre ; aucun texte ne
 *   nomme un coefficient.
 */

export interface ChampDef {
  label: string;
  placeholder: string;
  /** Aperçu LaTeX en direct de la saisie (champ où un calcul est naturel). */
  apercu?: boolean;
}
export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}
export interface OptionChoix {
  id: string;
  label: string;
}

/** Fragment de consigne mêlant texte français et LaTeX court (convention de 6gen13). */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texteFrag(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latexFrag(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Annonce de précision (décision A) — reprise par `diagnostiquerProbabilite`. */
const PRECISION = "Donne chaque probabilité sous forme exacte (fraction ou calcul) ou arrondie au centième (au millième si elle est inférieure à 0,1).";
const PRECISION_FIABILITE = "La fiabilité d'un système est la probabilité qu'il fonctionne : donne-la sous forme exacte ou arrondie à 4 décimales.";
const PLACEHOLDER_PROBA = "valeur exacte ou arrondie";
const PLACEHOLDER_FIABILITE = "valeur exacte ou à 4 décimales";

// ============================================================================
// Nombres et fractions.
// ============================================================================

/** Écriture décimale EXACTE (au plus 6 décimales), `null` si la valeur n'est pas un décimal court. */
function decimalExact(v: number): string | null {
  const arrondi = Math.round(v * 1e6) / 1e6;
  if (Math.abs(arrondi - v) > 1e-10) return null;
  return String(Number(arrondi.toFixed(6)));
}
function versLatex(chaine: string): string {
  return chaine.replace(".", "{,}");
}
function versTexte(chaine: string): string {
  return chaine.replace(".", ",");
}
function arrondiChaine(v: number, decimales: number): string {
  return String(Number(v.toFixed(decimales)));
}
/** Nombre en LaTeX : exact si possible, sinon arrondi (le signe ≈ est géré par `egalite`). */
function nombreLatex(v: number, decimales = 6): string {
  return versLatex(decimalExact(v) ?? arrondiChaine(v, decimales));
}
/** Nombre en prose : décimal exact attendu (données de l'énoncé). */
function nombreTexte(v: number): string {
  return versTexte(decimalExact(v) ?? arrondiChaine(v, 4));
}
/** « gauche = valeur » si la valeur est un décimal court, « gauche ≈ valeur arrondie » sinon. */
function egalite(gauche: string, v: number, decimales = 6): string {
  return decimalExact(v) !== null ? `${gauche}=${nombreLatex(v)}` : `${gauche}\\approx ${nombreLatex(v, decimales)}`;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}
function fractionLatex(num: number, den: number): string {
  const d = pgcd(num, den);
  const n = num / d;
  const m = den / d;
  return m === 1 ? String(n) : `\\dfrac{${n}}{${m}}`;
}

// ============================================================================
// Famille A — Paradoxe des anniversaires.
// ============================================================================

function consigneGeneraleA(ex: ExerciceFamilleA): FragmentConsigne[] {
  return [
    texteFrag(
      `${ex.n} personnes se trouvent dans une même pièce. On suppose les 365 jours de l'année équiprobables pour un anniversaire (on ignore le 29 février). On cherche la probabilité qu'au moins 2 de ces personnes aient leur anniversaire le même jour. ${PRECISION}`,
    ),
  ];
}
function blocDonneesA(ex: ExerciceFamilleA): string[] {
  return [`n=${ex.n}`];
}
function consigneEcranA(ex: ExerciceFamilleA, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  if (phase === "aEcran1") {
    return [
      texteFrag("On numérote les personnes. Pour "),
      latexFrag(`k=1,\\ldots,${ex.n - 1}`),
      texteFrag(", calcule la probabilité que la personne numéro "),
      latexFrag("k+1"),
      texteFrag(" ait un anniversaire différent de ceux des "),
      latexFrag("k"),
      texteFrag(" premières, qui sont tous différents. Donne chaque facteur sous forme de fraction ou arrondi à 4 décimales."),
    ];
  }
  if (phase === "aEcran2") return [texteFrag(`Multiplie ces facteurs : tu obtiens la probabilité que les ${ex.n} anniversaires soient tous différents.`)];
  return [texteFrag("Déduis-en la probabilité qu'au moins 2 personnes aient leur anniversaire le même jour.")];
}
function champsA(ex: ExerciceFamilleA, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "aEcran1") return Array.from({ length: ex.n - 1 }, (_, i) => ({ label: `Facteur ${i + 1} =`, placeholder: "fraction ou 4 décimales" }));
  if (phase === "aEcran2") return [{ label: "P(toutes différentes) =", placeholder: PLACEHOLDER_PROBA, apercu: true }];
  return [{ label: "P(au moins 2 identiques) =", placeholder: PLACEHOLDER_PROBA, apercu: true }];
}
function facteursLatex(n: number): string[] {
  return Array.from({ length: n - 1 }, (_, i) => `\\dfrac{${365 - (i + 1)}}{365}`);
}
/** P(toutes différentes) sous forme EXACTE compacte : 364·363·…/365^(n−1). */
function produitExactLatex(n: number): string {
  const numerateurs = Array.from({ length: n - 1 }, (_, i) => String(365 - (i + 1)));
  return `\\dfrac{${numerateurs.join("\\cdot ")}}{365^{${n - 1}}}`;
}
function aideNiveau1A(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "La 2e personne doit éviter 1 jour déjà pris, la 3e doit en éviter 2, et ainsi de suite.", latex: null };
  if (phase === "aEcran2") return { texte: "Multiplie les facteurs entre eux.", latex: null };
  return { texte: "« Au moins 2 anniversaires identiques » est l'événement contraire de « tous différents ».", latex: "P(\\overline{A})=1-P(A)" };
}
function aideNiveau2A(ex: ExerciceFamilleA, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Le premier facteur : la 2e personne doit éviter 1 jour sur 365. Les suivants se construisent de la même façon.", latex: "\\dfrac{365-1}{365}" };
  if (phase === "aEcran2") return { texte: "Produit à effectuer :", latex: facteursLatex(ex.n).join("\\cdot ") };
  return { texte: "Soustraction à effectuer :", latex: `1-${produitExactLatex(ex.n)}` };
}
function reponseA(ex: ExerciceFamilleA, phase: PhaseProbabilitesProblemes): string[] {
  if (phase === "aEcran1") return facteursEcran1(ex.n).map((_, i) => `f_{${i + 1}}=\\dfrac{${365 - (i + 1)}}{365}`);
  // 6 décimales : valeur reprise par l'élève à l'étape 3 (affichée dans le récapitulatif).
  if (phase === "aEcran2") return [egalite(`P(\\text{toutes différentes})=${produitExactLatex(ex.n)}`, probToutesDifferentes(ex.n))];
  return [egalite("P(\\text{au moins 2 identiques})", 1 - probToutesDifferentes(ex.n), 4)];
}

// ============================================================================
// Famille B — Épreuves répétées (chemins comptés dans l'arbre).
// ============================================================================

function cheminLatex(n: number, k: number): string {
  return Array.from({ length: n }, (_, i) => (i < k ? "\\text{S}" : "\\text{É}")).join("\\,");
}
function termeLatex(n: number, p: number, i: number): string {
  return `${nombreCheminsKSucces(n, i)}\\cdot ${nombreLatex(p)}^{${i}}\\cdot ${nombreLatex(1 - p)}^{${n - i}}`;
}
function consigneGeneraleB(ex: ExerciceFamilleB): FragmentConsigne[] {
  return [texteFrag(`${ex.contexte.texte} On note n le nombre d'épreuves et p la probabilité de succès à chaque épreuve. ${PRECISION}`)];
}
function blocDonneesB(ex: ExerciceFamilleB): string[] {
  return [`n=${ex.n}`, `p=${nombreLatex(ex.p)}`];
}
function consigneEcranB(ex: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  if (phase === "bEcran1") {
    return [texteFrag(`Dans l'arbre des ${ex.n} épreuves, chaque chemin est une suite de ${ex.n} résultats : succès (S) ou échec (É). Compte, en les énumérant, les chemins qui comportent exactement ${ex.k} succès.`)];
  }
  if (phase === "bEcran2") return [texteFrag(`Tous ces chemins ont la même probabilité. Calcule la probabilité d'obtenir exactement ${ex.k} succès.`)];
  if (ex.demandeEcran3 === "auMoinsK") return [texteFrag(`Calcule la probabilité d'obtenir au moins ${ex.k} succès.`)];
  return [texteFrag("Calcule la probabilité d'obtenir au moins un succès et au moins un échec.")];
}
function champsB(ex: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "bEcran1") return [{ label: `Chemins à ${ex.k} succès :`, placeholder: "nombre entier" }];
  if (phase === "bEcran2") return [{ label: `P(exactement ${ex.k} succès) =`, placeholder: PLACEHOLDER_PROBA, apercu: true }];
  const libelle = ex.demandeEcran3 === "auMoinsK" ? `P(au moins ${ex.k} succès) =` : "P(au moins un succès et un échec) =";
  return [{ label: libelle, placeholder: PLACEHOLDER_PROBA, apercu: true }];
}
function aideNiveau1B(ex: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "bEcran1") return { texte: `Écris chaque chemin comme un mot de ${ex.n} lettres S ou É contenant exactement ${ex.k} fois la lettre S. Procède avec méthode pour n'en oublier aucun et n'en compter aucun deux fois.`, latex: null };
  if (phase === "bEcran2") return { texte: `Un chemin à ${ex.k} succès passe par ${ex.k} branches de probabilité p et ${ex.n - ex.k} branches de probabilité 1 − p : sa probabilité est le produit de ses branches. Additionne ensuite les probabilités de tous ces chemins.`, latex: `p^{${ex.k}}\\cdot(1-p)^{${ex.n - ex.k}}` };
  if (ex.demandeEcran3 === "auMoinsK") return { texte: `Additionne les probabilités d'obtenir exactement ${ex.k}, ${ex.k + 1}, …, ${ex.n} succès ; pour chaque nombre de succès, compte les chemins dans l'arbre comme à l'étape 1. L'événement contraire peut être plus rapide.`, latex: null };
  return { texte: "L'événement contraire de « au moins un succès et au moins un échec » est « que des succès ou que des échecs ».", latex: null };
}
function aideNiveau2B(ex: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Par exemple, place d'abord les S le plus à gauche possible, puis déplace-les un à un vers la droite. Premier chemin :", latex: cheminLatex(ex.n, ex.k) };
  if (phase === "bEcran2") return { texte: "Calcul à effectuer :", latex: termeLatex(ex.n, ex.p, ex.k) };
  if (ex.demandeEcran3 === "auMoinsK") {
    const termes: string[] = [];
    for (let i = ex.k; i <= ex.n; i++) termes.push(termeLatex(ex.n, ex.p, i));
    return { texte: "Somme à effectuer (chaque nombre de chemins est déjà compté) :", latex: termes.join("+") };
  }
  return { texte: "Calcul à effectuer :", latex: `1-${nombreLatex(ex.p)}^{${ex.n}}-${nombreLatex(1 - ex.p)}^{${ex.n}}` };
}
function reponseB(ex: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): string[] {
  if (phase === "bEcran1") return [`${nombreCheminsKSucces(ex.n, ex.k)}\\ \\text{chemins}`];
  if (phase === "bEcran2") return [egalite(`P(\\text{exactement }${ex.k}\\text{ succès})`, probExactementKChemins(ex.n, ex.p, ex.k), 4)];
  const gauche = ex.demandeEcran3 === "auMoinsK" ? `P(\\text{au moins }${ex.k}\\text{ succès})` : "P(\\text{au moins un succès et un échec})";
  return [egalite(gauche, valeurEcran3EpreuvesRepetees(ex), 4)];
}

// ============================================================================
// Famille C — Indépendants à probabilités différentes.
// ============================================================================

function nomSingulierC(ex: ExerciceFamilleC): string {
  return ex.contexte.nomPluriel.replace(/[sx]$/, "");
}
function evenementC(ex: ExerciceFamilleC): string {
  return ex.k === 1 ? `exactement 1 ${nomSingulierC(ex)} ${ex.contexte.evenementSingulier}` : `exactement ${ex.k} ${ex.contexte.nomPluriel} ${ex.contexte.evenementPluriel}`;
}
function configurationLatex(c: number[]): string {
  return `\\{${c.map((i) => i + 1).join("\\,;\\,")}\\}`;
}
function configurationTexte(c: number[]): string {
  return c.map((i) => i + 1).join(" et ");
}
function consigneGeneraleC(ex: ExerciceFamilleC): FragmentConsigne[] {
  return [texteFrag(`${ex.contexte.texte} ${PRECISION}`)];
}
function blocDonneesC(ex: ExerciceFamilleC): string[] {
  return ex.contexte.labelElements.map((label, i) => `P(\\text{${label} ${ex.contexte.evenementSingulier}})=${nombreLatex(ex.p[i])}`);
}
function consigneEcranC(ex: ExerciceFamilleC, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  if (phase === "cEcran1") {
    return [texteFrag(`On s'intéresse à l'événement « ${evenementC(ex)} ». Énumère toutes les configurations qui le réalisent : pour chacune, écris les numéros des ${ex.contexte.nomPluriel} qui ${ex.contexte.evenementPluriel} (pas les autres), une configuration par ligne.`)];
  }
  if (phase === "cEcran2") return [texteFrag("Calcule séparément la probabilité de chaque configuration : les éléments sont indépendants, multiplie donc, élément par élément, la probabilité de l'événement (élément concerné) ou celle de son contraire (élément non concerné).")];
  return [texteFrag(`Déduis-en la probabilité de l'événement « ${evenementC(ex)} ».`)];
}
function champsC(ex: ExerciceFamilleC, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "cEcran2") return configurationsExactementK(ex.k).map((c) => ({ label: `Configuration « ${configurationTexte(c)} » :`, placeholder: PLACEHOLDER_PROBA }));
  return [{ label: "Probabilité de l'événement =", placeholder: PLACEHOLDER_PROBA, apercu: true }];
}
function aideNiveau1C(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Plusieurs configurations réalisent cet événement : passe en revue toutes les possibilités, sans en oublier ni en répéter.", latex: null };
  if (phase === "cEcran2") return { texte: "Chaque configuration a sa propre probabilité : prends la probabilité de chaque élément concerné, le complément à 1 pour chaque élément non concerné, puis multiplie.", latex: null };
  return { texte: "Les configurations ne peuvent pas se produire en même temps : additionne leurs probabilités.", latex: null };
}
function aideNiveau2C(ex: ExerciceFamilleC, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "cEcran1") return { texte: `Il y a exactement ${configurationsExactementK(ex.k).length} configurations à trouver.`, latex: null };
  if (phase === "cEcran2") {
    const c = configurationsExactementK(ex.k)[0] ?? [];
    const facteurs = [0, 1, 2].map((i) => (c.includes(i) ? nombreLatex(ex.p[i]) : `(1-${nombreLatex(ex.p[i])})`));
    return { texte: `Pour la configuration « ${configurationTexte(c)} » (les autres se calculent de la même façon) :`, latex: facteurs.join("\\cdot ") };
  }
  return { texte: "Somme à effectuer :", latex: configurationsExactementK(ex.k).map((c) => nombreLatex(probabiliteConfiguration(ex.p, c))).join("+") };
}
function reponseC(ex: ExerciceFamilleC, phase: PhaseProbabilitesProblemes): string[] {
  const configs = configurationsExactementK(ex.k);
  if (phase === "cEcran1") return configs.map(configurationLatex);
  if (phase === "cEcran2") return configs.map((c) => egalite(`P(${configurationLatex(c)})`, probabiliteConfiguration(ex.p, c), 4));
  return [egalite("P", probabiliteExactementKFamilleC(ex), 4)];
}

// ============================================================================
// Famille E — Bayes en problème (données présentées mélangées).
// ============================================================================

function phrasesMixte(base: ExerciceFamilleEMixte["base"]): [string, string, string] {
  return [
    `Parmi tous les cas, c₁ est vrai dans une proportion de ${nombreTexte(base.p)}.`,
    `Si on se limite aux cas où c₁ est vrai, E se produit dans une proportion de ${nombreTexte(base.q1)}.`,
    `Si on se limite aux cas où c₂ est vrai, E se produit dans une proportion de ${nombreTexte(base.q2)}.`,
  ];
}
function consigneGeneraleEMixte(ex: ExerciceFamilleEMixte): FragmentConsigne[] {
  const c = ex.base.contexte;
  return [texteFrag(`${c.texte} On note c₁ : « ${c.labelCause1} », c₂ : « ${c.labelCause2} » et E : « ${c.labelEffet} ». ${PRECISION}`)];
}
function consigneEcranEMixte(ex: ExerciceFamilleEMixte, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  if (phase === "eMixteEcran1") {
    const phrases = phrasesMixte(ex.base);
    const ordre = ex.ordreAffichage.map((i) => phrases[i]);
    return [texteFrag(`Voici 3 informations, données dans le désordre : (1) ${ordre[0]} (2) ${ordre[1]} (3) ${ordre[2]} Associe chacune à la bonne probabilité — P(c₁), P(E | c₁) ou P(E | c₂) — et complète les 3 champs.`)];
  }
  if (phase === "eMixteEcran2") return [texteFrag("Construis l'arbre (d'abord c₁ ou c₂, puis E ou non E) : calcule les probabilités des 4 chemins, puis P(E) par la formule des probabilités totales.")];
  return [texteFrag(ex.base.demandeEcran3 === "cause1SachantEffet" ? "Calcule la probabilité de c₁ sachant que E s'est produit." : "Calcule la probabilité de c₁ sachant que E ne s'est pas produit.")];
}
function champsEMixte(ex: ExerciceFamilleEMixte, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "eMixteEcran1") {
    return ["P(c₁) =", "P(E | c₁) =", "P(E | c₂) ="].map((label) => ({ label, placeholder: "valeur de l'énoncé" }));
  }
  if (phase === "eMixteEcran2") {
    return ["P(c₁ ∩ E) =", "P(c₁ ∩ Ē) =", "P(c₂ ∩ E) =", "P(c₂ ∩ Ē) =", "P(E) ="].map((label) => ({ label, placeholder: PLACEHOLDER_PROBA }));
  }
  return [{ label: ex.base.demandeEcran3 === "cause1SachantEffet" ? "P(c₁ | E) =" : "P(c₁ | Ē) =", placeholder: PLACEHOLDER_PROBA, apercu: true }];
}
function donneesEMixteLatex(ex: ExerciceFamilleEMixte): string[] {
  return [`P(c_1)=${nombreLatex(ex.base.p)}`, `P(E\\mid c_1)=${nombreLatex(ex.base.q1)}`, `P(E\\mid c_2)=${nombreLatex(ex.base.q2)}`];
}
function arbreEMixteLatex(ex: ExerciceFamilleEMixte, decimales = 6): string[] {
  const [b1, b2, b3, b4] = branchesArbreC(ex.base);
  return [
    egalite("P(c_1\\cap E)", b1, decimales),
    egalite("P(c_1\\cap\\overline{E})", b2, decimales),
    egalite("P(c_2\\cap E)", b3, decimales),
    egalite("P(c_2\\cap\\overline{E})", b4, decimales),
    egalite("P(E)", probabiliteEffetC(ex.base), decimales),
  ];
}
function aideNiveau1EMixte(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "eMixteEcran1") return { texte: "P(c₁) porte sur tous les cas ; P(E | c₁) et P(E | c₂) ne portent que sur une partie des cas (« si on se limite à… »).", latex: null };
  if (phase === "eMixteEcran2") return { texte: "La probabilité d'un chemin est le produit de ses branches ; P(E) est la somme des deux chemins qui mènent à E.", latex: "P(c_1\\cap E)=P(c_1)\\cdot P(E\\mid c_1)" };
  return { texte: "Probabilité conditionnelle : on se limite aux cas de la condition.", latex: "P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}" };
}
function aideNiveau2EMixte(ex: ExerciceFamilleEMixte, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "eMixteEcran1") return { texte: "Dans P(E | c₁), c₁ est la condition (le groupe auquel on se limite) et E est ce qu'on observe dans ce groupe.", latex: null };
  if (phase === "eMixteEcran2") return { texte: "Un chemin (les 3 autres se calculent de la même façon) :", latex: `P(c_1\\cap E)=${nombreLatex(ex.base.p)}\\cdot ${nombreLatex(ex.base.q1)}` };
  const [b1, b2] = branchesArbreC(ex.base);
  const pEffet = probabiliteEffetC(ex.base);
  const effet = ex.base.demandeEcran3 === "cause1SachantEffet";
  return { texte: "Division à effectuer (valeurs de l'étape précédente) :", latex: `\\dfrac{${nombreLatex(effet ? b1 : b2)}}{${nombreLatex(effet ? pEffet : 1 - pEffet)}}` };
}
function reponseEMixte(ex: ExerciceFamilleEMixte, phase: PhaseProbabilitesProblemes): string[] {
  if (phase === "eMixteEcran1") return donneesEMixteLatex(ex);
  if (phase === "eMixteEcran2") return arbreEMixteLatex(ex, 4);
  return [egalite(ex.base.demandeEcran3 === "cause1SachantEffet" ? "P(c_1\\mid E)" : "P(c_1\\mid\\overline{E})", bayesEcran3C(ex.base), 4)];
}

// ============================================================================
// Famille F — Montages en série / en parallèle.
// ============================================================================

function descriptionMontage(ex: ExerciceFamilleF, configuration: ExerciceFamilleF["configuration"], position: 0 | 1 | 2 | undefined): string {
  if (configuration === "serie") return "tous en série (le système fonctionne seulement si tous les composants fonctionnent)";
  if (configuration === "parallele") return "tous en parallèle (le système fonctionne dès qu'au moins un composant fonctionne)";
  return `« ${ex.contexte.labelComposants[position ?? 0]} » en série avec le groupe formé par les 2 autres, montés en parallèle entre eux`;
}
function formuleLatexF(ex: ExerciceFamilleF, configuration: ExerciceFamilleF["configuration"], position: 0 | 1 | 2 | undefined): string {
  const [p0, p1, p2] = ex.p.map((v) => nombreLatex(v));
  if (configuration === "serie") return `${p0}\\cdot ${p1}\\cdot ${p2}`;
  if (configuration === "parallele") return `1-(1-${p0})(1-${p1})(1-${p2})`;
  const solo = position ?? 0;
  const autres = [0, 1, 2].filter((i) => i !== solo);
  return `${nombreLatex(ex.p[solo])}\\cdot\\left(1-(1-${nombreLatex(ex.p[autres[0]])})(1-${nombreLatex(ex.p[autres[1]])})\\right)`;
}
function consigneGeneraleF(ex: ExerciceFamilleF): FragmentConsigne[] {
  return [texteFrag(`${ex.contexte.texte} Les 3 composants (${ex.contexte.labelComposants.join(", ")}) sont montés ainsi : ${descriptionMontage(ex, ex.configuration, ex.positionMixte)}. ${PRECISION_FIABILITE}`)];
}
function blocDonneesF(ex: ExerciceFamilleF): string[] {
  return ex.contexte.labelComposants.map((label, i) => `P(\\text{${label} fonctionne})=${nombreLatex(ex.p[i])}`);
}
function consigneEcranF(ex: ExerciceFamilleF, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  if (phase === "fEcran1") return [texteFrag("Pose le calcul de la fiabilité du système à partir des probabilités données (tu peux laisser le calcul non effectué).")];
  if (phase === "fEcran2") return [texteFrag("Effectue ce calcul : donne la fiabilité du système.")];
  const nouveau = `On monte maintenant les mêmes composants autrement : ${descriptionMontage(ex, ex.configurationAlternative, ex.positionMixteAlternative)}.`;
  if (ex.demandeEcran3 === "comparerValeur") return [texteFrag(`${nouveau} Calcule la fiabilité de ce nouveau montage.`)];
  return [texteFrag(`${nouveau} Un technicien affirme : « La fiabilité de ce nouveau montage, arrondie à 4 décimales, vaut ${nombreTexte(ex.affirmationValeur ?? 0)}. » Cette affirmation est-elle vraie ou fausse ?`)];
}
function champsF(phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "fEcran1") return [{ label: "Calcul de la fiabilité :", placeholder: "calcul avec les données", apercu: true }];
  if (phase === "fEcran2") return [{ label: "Fiabilité du système =", placeholder: PLACEHOLDER_FIABILITE, apercu: true }];
  return [{ label: "Fiabilité du nouveau montage =", placeholder: PLACEHOLDER_FIABILITE, apercu: true }];
}
export function choixEcranF(): OptionChoix[] {
  return [
    { id: "vrai", label: "Vrai" },
    { id: "faux", label: "Faux" },
  ];
}
function aideNiveau1F(ex: ExerciceFamilleF, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "En série, tous les composants doivent fonctionner : on multiplie. En parallèle, le système ne tombe en panne que si tous les composants tombent en panne : on passe par l'événement contraire, avec la probabilité de panne de chaque composant.", latex: "P(\\text{panne})=1-p_i" };
  if (phase === "fEcran2") return { texte: "Effectue le calcul posé à l'étape précédente.", latex: null };
  const suite = ex.demandeEcran3 === "verifierAffirmation" ? ", puis compare ton résultat, arrondi à 4 décimales, à la valeur affirmée" : "";
  return { texte: `Identifie le nouveau montage (série, parallèle ou mixte) et applique la même méthode qu'aux étapes précédentes${suite}.`, latex: null };
}
function aideNiveau2F(ex: ExerciceFamilleF, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "fEcran1") {
    if (ex.configuration === "mixte") {
      const solo = ex.positionMixte ?? 0;
      const autres = [0, 1, 2].filter((i) => i !== solo);
      return { texte: "Calcule d'abord la fiabilité du groupe en parallèle, puis assemble-le en série avec le composant seul :", latex: `\\text{groupe}=1-(1-${nombreLatex(ex.p[autres[0]])})(1-${nombreLatex(ex.p[autres[1]])})` };
    }
    return { texte: "Formule à appliquer :", latex: ex.configuration === "serie" ? "p_1\\cdot p_2\\cdot p_3" : "1-(1-p_1)(1-p_2)(1-p_3)" };
  }
  if (phase === "fEcran2") return { texte: "Calcul à effectuer :", latex: formuleLatexF(ex, ex.configuration, ex.positionMixte) };
  return { texte: "Calcul à effectuer pour le nouveau montage :", latex: formuleLatexF(ex, ex.configurationAlternative, ex.positionMixteAlternative) };
}
function reponseF(ex: ExerciceFamilleF, phase: PhaseProbabilitesProblemes): string[] {
  const valeur = valeurConfigurationF(ex.p, ex.configuration, ex.positionMixte);
  if (phase === "fEcran1") return [`${formuleLatexF(ex, ex.configuration, ex.positionMixte)}=${nombreLatex(valeur)}`];
  if (phase === "fEcran2") return [egalite("\\text{fiabilité}", valeur)];
  const alternative = valeurAlternativeF(ex);
  if (ex.demandeEcran3 === "comparerValeur") return [egalite("\\text{fiabilité}", alternative)];
  return [affirmationFEstVraie(ex) ? "\\text{Vrai}" : "\\text{Faux}", egalite("\\text{fiabilité}", alternative)];
}

// ============================================================================
// Famille G — Mélange de deux urnes (probabilités totales).
// ============================================================================

function evenementGLatex(ex: ExerciceFamilleGMelange): string {
  return `\\text{face }${ex.base.faceSpeciale}\\text{ ou }${ex.base.autreFace}`;
}
function fractionObjet1(ex: ExerciceFamilleGMelange): { num: number; den: number } {
  const { p0, p } = ex.base;
  return { num: p0.num * p.den + p.num * p0.den, den: p0.den * p.den };
}
function consigneGeneraleGMelange(ex: ExerciceFamilleGMelange): FragmentConsigne[] {
  const { faceSpeciale, autreFace } = ex.base;
  return [
    texteFrag(
      `On choisit une urne parmi deux, puis on lance le dé à 6 faces qu'elle contient. Le dé de l'urne 1 est truqué : la face ${faceSpeciale} a une probabilité connue, notée a, et les 5 autres faces ont toutes la même probabilité, notée p, inconnue. On s'intéresse à l'événement « obtenir la face ${faceSpeciale} ou la face ${autreFace} ». ${PRECISION}`,
    ),
  ];
}
function blocDonneesGMelange(ex: ExerciceFamilleGMelange): string[] {
  return [
    `a=P(\\text{face }${ex.base.faceSpeciale}\\mid\\text{urne 1})=${fractionLatex(ex.base.p0.num, ex.base.p0.den)}`,
    `P(\\text{urne 1})=${nombreLatex(ex.poidsObjet1)}`,
    `P(${evenementGLatex(ex)}\\mid\\text{urne 2})=${nombreLatex(ex.probabiliteAutreObjet)}`,
  ];
}
function consigneEcranGMelange(ex: ExerciceFamilleGMelange, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  const { faceSpeciale, autreFace } = ex.base;
  if (phase === "gMelangeEcran1") return [texteFrag("Écris l'équation qui exprime que les probabilités des 6 faces du dé de l'urne 1 ont pour somme 1 (utilise les lettres a et p).")];
  if (phase === "gMelangeEcran2") return [texteFrag("Résous cette équation : calcule p.")];
  if (phase === "gMelangeEcran3") return [texteFrag(`Calcule la probabilité d'obtenir la face ${faceSpeciale} ou la face ${autreFace} avec le dé de l'urne 1.`)];
  return [texteFrag(`L'urne n'est pas connue : calcule la probabilité d'obtenir la face ${faceSpeciale} ou la face ${autreFace} (formule des probabilités totales).`)];
}
function champsGMelange(ex: ExerciceFamilleGMelange, phase: PhaseProbabilitesProblemes): ChampDef[] {
  const { faceSpeciale, autreFace } = ex.base;
  if (phase === "gMelangeEcran1") return [{ label: "Équation :", placeholder: "équation en a et p", apercu: true }];
  if (phase === "gMelangeEcran2") return [{ label: "p =", placeholder: PLACEHOLDER_PROBA, apercu: true }];
  if (phase === "gMelangeEcran3") return [{ label: `P(face ${faceSpeciale} ou ${autreFace} | urne 1) =`, placeholder: PLACEHOLDER_PROBA, apercu: true }];
  return [{ label: `P(face ${faceSpeciale} ou ${autreFace}) =`, placeholder: PLACEHOLDER_PROBA, apercu: true }];
}
function aideNiveau1GMelange(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "gMelangeEcran1") return { texte: "La somme des probabilités de toutes les faces d'un dé vaut 1.", latex: null };
  if (phase === "gMelangeEcran2") return { texte: "Remplace a par sa valeur, puis isole p.", latex: null };
  if (phase === "gMelangeEcran3") return { texte: "Les deux faces ne peuvent pas sortir en même temps : additionne leurs probabilités.", latex: null };
  return { texte: "Formule des probabilités totales : additionne les deux chemins de l'arbre (choix de l'urne, puis résultat du dé).", latex: "P(F)=P(U_1)\\cdot P(F\\mid U_1)+P(U_2)\\cdot P(F\\mid U_2)" };
}
function aideNiveau2GMelange(ex: ExerciceFamilleGMelange, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  const a = fractionLatex(ex.base.p0.num, ex.base.p0.den);
  const p = fractionLatex(ex.base.p.num, ex.base.p.den);
  if (phase === "gMelangeEcran1") return { texte: "Une face vaut a, et chacune des 5 autres vaut p.", latex: null };
  if (phase === "gMelangeEcran2") return { texte: "Équation à résoudre :", latex: `5p+${a}=1` };
  if (phase === "gMelangeEcran3") return { texte: "Somme à effectuer :", latex: `${a}+${p}` };
  const f = fractionObjet1(ex);
  return { texte: "Calcul à effectuer :", latex: `${nombreLatex(ex.poidsObjet1)}\\cdot ${fractionLatex(f.num, f.den)}+${nombreLatex(1 - ex.poidsObjet1)}\\cdot ${nombreLatex(ex.probabiliteAutreObjet)}` };
}
function reponseGMelange(ex: ExerciceFamilleGMelange, phase: PhaseProbabilitesProblemes): string[] {
  if (phase === "gMelangeEcran1") return ["5p+a=1"];
  if (phase === "gMelangeEcran2") return [`p=${fractionLatex(ex.base.p.num, ex.base.p.den)}`];
  const f = fractionObjet1(ex);
  if (phase === "gMelangeEcran3") return [`P(${evenementGLatex(ex)}\\mid\\text{urne 1})=${fractionLatex(f.num, f.den)}`];
  return [egalite(`P(${evenementGLatex(ex)})`, probabiliteTotaleMelange(ex), 4)];
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceProbabilitesProblemes): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB(exercice);
    case "C":
      return consigneGeneraleC(exercice);
    case "E":
      return consigneGeneraleEMixte(exercice);
    case "F":
      return consigneGeneraleF(exercice);
    case "G":
      return consigneGeneraleGMelange(exercice);
  }
}

export function blocDonnees(exercice: ExerciceProbabilitesProblemes): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "E":
      return [];
    case "F":
      return blocDonneesF(exercice);
    case "G":
      return blocDonneesGMelange(exercice);
  }
}

export function consigneEcran(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(exercice, phase);
    case "E":
      return consigneEcranEMixte(exercice, phase);
    case "F":
      return consigneEcranF(exercice, phase);
    case "G":
      return consigneEcranGMelange(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(exercice, phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(exercice, phase);
    case "E":
      return champsEMixte(exercice, phase);
    case "F":
      return champsF(phase);
    case "G":
      return champsGMelange(exercice, phase);
  }
}

/** Placeholder de l'écran « liste » — famille C écran 1 seulement (hors espace de réponse). */
export function placeholderListe(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): string {
  if (exercice.famille === "C" && phase === "cEcran1") return `numéros des ${exercice.contexte.nomPluriel}`;
  return "";
}

/** Options de l'écran « choix » — famille F écran 3, variante "verifierAffirmation". */
export function choixEcran(): OptionChoix[] {
  return choixEcranF();
}

export function aideNiveau1(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(exercice, phase);
    case "C":
      return aideNiveau1C(phase);
    case "E":
      return aideNiveau1EMixte(phase);
    case "F":
      return aideNiveau1F(exercice, phase);
    case "G":
      return aideNiveau1GMelange(phase);
  }
}

export function aideNiveau2(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "E":
      return aideNiveau2EMixte(exercice, phase);
    case "F":
      return aideNiveau2F(exercice, phase);
    case "G":
      return aideNiveau2GMelange(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseProbabilitesProblemes, string> = {
  aEcran1: "Étape 1 (facteurs)",
  aEcran2: "Étape 2 (tous différents)",
  aEcran3: "Étape 3 (au moins 2 identiques)",
  bEcran1: "Étape 1 (nombre de chemins)",
  bEcran2: "Étape 2 (exactement k succès)",
  bEcran3: "Étape 3 (probabilité demandée)",
  cEcran1: "Étape 1 (configurations)",
  cEcran2: "Étape 2 (probabilité de chaque configuration)",
  cEcran3: "Étape 3 (probabilité de l'événement)",
  eMixteEcran1: "Étape 1 (sens des données)",
  eMixteEcran2: "Étape 2 (arbre et P(E))",
  eMixteEcran3: "Étape 3 (probabilité conditionnelle)",
  fEcran1: "Étape 1 (calcul posé)",
  fEcran2: "Étape 2 (fiabilité)",
  fEcran3: "Étape 3 (autre montage)",
  gMelangeEcran1: "Étape 1 (équation)",
  gMelangeEcran2: "Étape 2 (valeur de p)",
  gMelangeEcran3: "Étape 3 (avec l'urne 1)",
  gMelangeEcran4: "Étape 4 (probabilités totales)",
};

/** Réponse correcte de chaque écran (récapitulatif, correction des feuilles) — jamais recalculée
 * depuis la saisie de l'élève. Valeurs exactes, ou arrondies à 4 décimales avec « ≈ ». */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): string[] {
  switch (exercice.famille) {
    case "A":
      return reponseA(exercice, phase);
    case "B":
      return reponseB(exercice, phase);
    case "C":
      return reponseC(exercice, phase);
    case "E":
      return reponseEMixte(exercice, phase);
    case "F":
      return reponseF(exercice, phase);
    case "G":
      return reponseGMelange(exercice, phase);
  }
}
