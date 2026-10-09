import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleD, ExerciceFamilleEMixte, ExerciceFamilleEParametrique, ExerciceFamilleF, ExerciceFamilleGDerangements, ExerciceFamilleGFinancier, ExerciceFamilleGMelange, ExerciceProbabilitesProblemes } from "../core6e/probabilitesProblemes.types";
import type { PhaseProbabilitesProblemes, ResultatExerciceProbabilitesProblemes } from "../moteur6e/typesProbabilitesProblemes";
import { phasesPourExercice } from "../moteur6e/typesProbabilitesProblemes";
import { bayesEcran3C, branchesArbreC, probabiliteEffetC } from "../moteur6e/verificationIndependanceBayes";
import { coeffAireTotale, coeffAireZone, configurationsExactementK, probToutesDifferentes, probabiliteConfiguration, probabiliteExactementKFamilleC, probabiliteGlobaleFinancier, probabiliteObjet1, probabiliteTotaleMelange, probabiliteZoneCible, probExactementKBinomiale, produitsCategoriesFinancier, resoudreInequationParametrique, resultatFinancier, valeurConfigurationF, valeurEcran3Binomiale } from "../moteur6e/verificationProbabilitesProblemes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage pour `6gen33`. Dispatch sur
 * `exercice.famille` PUIS `exercice.sousType`/`phase` où pertinent, même principe que
 * `formatIndependanceBayes.ts`/`formatTiragesArbres.ts`. Toutes les quantités DÉRIVÉES affichées
 * (état actuel, récapitulatif) réutilisent les fonctions de `moteur6e/
 * verificationProbabilitesProblemes.ts` — JAMAIS recalculées indépendamment ici (CLAUDE.md).
 *
 * ============================================================================
 * **Piège "signe orphelin" (6gen23) et piège "libellé français brut en mode KaTeX" (6gen32) — voir
 * l'en-tête de `formatIndependanceBayes.ts` pour le détail complet des deux bugs déjà rencontrés et
 * corrigés sur ce chantier.** Appliqué ici : `consigneGenerale`/`consigneEcran` restent TOUJOURS du
 * texte français BRUT (jamais passé par KaTeX — aucun risque), tandis que `blocDonnees`/`etatActuel`
 * (rendus via `<Katex expression={...} block/>`) n'embarquent JAMAIS un libellé français multi-mots
 * sans `\text{}` — les seuls libellés en KaTeX sont des symboles COURTS (`c_1`, `A_1`, noms de
 * catégories `\text{Catégorie A}`), tous définis en PROSE une fois dans `consigneGenerale`/
 * `consigneEcran` avant d'apparaître en KaTeX. Régression testée dans
 * `formatProbabilitesProblemes.test.ts` (scan de tirages aléatoires des 7 familles).
 * ============================================================================
 */

export interface ChampDef {
  label: string;
  placeholder: string;
}
export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}
export interface OptionChoix {
  id: string;
  label: string;
}

const ANNONCE_TOLERANCE = "(forme exacte ou décimale arrondie au centième)";
/** Famille A UNIQUEMENT — tolérance resserrée côté vérification (voir `moteur6e/
 * verificationProbabilitesProblemes.ts`, `TOLERANCE_ANNIVERSAIRE`), annoncée fidèlement ici. */
const ANNONCE_TOLERANCE_A = "(forme exacte ou décimale arrondie au millième)";

function formatDecimalVirgule(v: number): string {
  return String(Math.round(v * 1000) / 1000).replace(".", "{,}");
}
function formatDecimalCourt(v: number): string {
  return String(Math.round(v * 100) / 100).replace(".", "{,}");
}
/** Décimal virgule française pour du texte PROSE brut (`consigneGenerale`/`consigneEcran`, jamais
 * passé par KaTeX) — jamais `{,}` (échappement KaTeX uniquement valide en mode mathématique,
 * afficherait littéralement les accolades dans du texte HTML brut). */
function formatDecimalTextePlain(v: number): string {
  return String(Math.round(v * 100) / 100).replace(".", ",");
}

// ============================================================================
// Famille A — Paradoxe des anniversaires.
// ============================================================================

function consigneGeneraleA(ex: ExerciceFamilleA): string {
  return `${ex.n} personnes se trouvent dans une même pièce. On suppose 365 jours possibles pour un anniversaire (années bissextiles ignorées). On veut calculer la probabilité qu'au moins 2 de ces personnes partagent le même jour de naissance.`;
}
function blocDonneesA(ex: ExerciceFamilleA): string[] {
  return [`n=${ex.n}`];
}
function consigneEcranA(ex: ExerciceFamilleA, phase: PhaseProbabilitesProblemes): string {
  if (phase === "aEcran1") return `Calcule, dans l'ordre, chacun des ${ex.n - 1} facteurs de cette probabilité : pour k=1,...,${ex.n - 1}, la probabilité que la (k+1)-ième personne ait un jour de naissance différent des k précédentes.`;
  if (phase === "aEcran2") return "Multiplie tous les facteurs CORRECTS de l'étape précédente pour obtenir P(toutes les personnes ont un jour de naissance différent).";
  return "Calcule P(au moins 2 personnes partagent le même jour de naissance) = 1 − P(toutes différentes), à partir de la valeur CORRECTE de l'étape précédente.";
}
function champsA(ex: ExerciceFamilleA, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "aEcran1") {
    return Array.from({ length: ex.n - 1 }, (_, i) => ({ label: `Facteur k=${i + 1} =`, placeholder: `ex : ${365 - (i + 1)}/365` }));
  }
  if (phase === "aEcran2") return [{ label: "P(toutes différentes) =", placeholder: `ex : 0,973 ${ANNONCE_TOLERANCE_A}` }];
  return [{ label: "P(au moins 2 identiques) =", placeholder: `ex : 0,027 ${ANNONCE_TOLERANCE_A}` }];
}
// Correctif transversal (voir `etatActuelEMixte`/`etatActuelB` d'`ExponentiellesProblemes.ts` ci-
// dessus) : `aEcran3` ne montrait QUE la probabilité confirmée à `aEcran2`, jamais les facteurs
// confirmés à `aEcran1` — ACCUMULE désormais.
function etatActuelA(ex: ExerciceFamilleA, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "aEcran1") return null;
  const facteurs = Array.from({ length: ex.n - 1 }, (_, i) => `\\dfrac{${365 - (i + 1)}}{365}`);
  if (phase === "aEcran2") return facteurs;
  return [...facteurs, `P(\\text{toutes différentes})=${formatDecimalVirgule(probToutesDifferentes(ex.n))}`];
}
function aideNiveau1A(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Rappel : la 2e personne doit éviter 1 jour déjà pris par la 1re, la 3e doit en éviter 2 (ceux des 2 premières), etc.", latex: null };
  if (phase === "aEcran2") return { texte: "Multiplie simplement les facteurs entre eux.", latex: null };
  return { texte: "Rappel : P(au moins un cas contraire) = 1 − P(aucun cas, càd tous différents).", latex: null };
}
function aideNiveau2A(ex: ExerciceFamilleA, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Les deux premiers facteurs (les suivants suivent le même principe) :", latex: `\\dfrac{364}{365}\\quad\\dfrac{363}{365}` };
  if (phase === "aEcran2") return { texte: "Produit à effectuer (facteurs corrects, produit non fait) :", latex: Array.from({ length: ex.n - 1 }, (_, i) => `\\dfrac{${365 - (i + 1)}}{365}`).join("\\cdot ") };
  return { texte: "Valeur connue, soustraction non faite :", latex: `1-${formatDecimalVirgule(probToutesDifferentes(ex.n))}` };
}

// ============================================================================
// Famille B — Loi binomiale.
// ============================================================================

function consigneGeneraleB(ex: ExerciceFamilleB): string {
  return ex.contexte.texte;
}
function blocDonneesB(ex: ExerciceFamilleB): string[] {
  return [`n=${ex.n}`, `p=${formatDecimalCourt(ex.p)}`, `k=${ex.k}`];
}
const LIBELLE_DEMANDE_B: Record<ExerciceFamilleB["demandeEcran3"], string> = {
  auMoinsK: "au moins k succès",
  unDeChaqueResultat: "au moins un succès ET au moins un échec (pas tous identiques)",
};
function consigneEcranB(ex: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): string {
  if (phase === "bEcran1") return `Pose la formule complète de P(exactement k=${ex.k} succès), COEFFICIENT BINOMIAL C(n,k) INCLUS — calcule C(n,k) toi-même et utilise sa valeur numérique dans l'expression (indique une expression, sans forcément la réduire à l'avance).`;
  if (phase === "bEcran2") return "Calcule la valeur de cette probabilité, à partir de la formule CORRECTE de l'étape précédente.";
  return `Calcule P(${LIBELLE_DEMANDE_B[ex.demandeEcran3]}), à partir de la valeur CORRECTE de l'étape précédente.`;
}
function champsB(ex: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "bEcran1") return [{ label: "Formule (valeur numérique) =", placeholder: "ex : 10*0.3^2*0.7^3" }];
  if (phase === "bEcran2") return [{ label: "P(exactement k succès) =", placeholder: `ex : 0,13 ${ANNONCE_TOLERANCE}` }];
  const libelle = ex.demandeEcran3 === "auMoinsK" ? "P(au moins k succès) =" : "P(un de chaque résultat) =";
  return [{ label: libelle, placeholder: `ex : 0,45 ${ANNONCE_TOLERANCE}` }];
}
// Correctif transversal (voir `etatActuelA` ci-dessus) : `bEcran3` ne montrait QUE la valeur
// confirmée à `bEcran2`, jamais la formule confirmée à `bEcran1` — ACCUMULE.
function etatActuelB(ex: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "bEcran1") return null;
  const formule = [`C(${ex.n},${ex.k})\\cdot ${formatDecimalCourt(ex.p)}^{${ex.k}}\\cdot(1-${formatDecimalCourt(ex.p)})^{${ex.n - ex.k}}`];
  if (phase === "bEcran2") return formule;
  return [...formule, `P(\\text{exactement }${ex.k}\\text{ succès})=${formatDecimalVirgule(probExactementKBinomiale(ex.n, ex.p, ex.k))}`];
}
function aideNiveau1B(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Rappel : il existe PLUSIEURS façons d'obtenir exactement k succès parmi n épreuves — le coefficient binomial C(n,k) compte ces façons. L'oublier revient à ne compter qu'UNE seule configuration.", latex: null };
  if (phase === "bEcran2") return { texte: "Remplace n, k, p par leurs valeurs dans la formule ci-dessus (état actuel), puis calcule.", latex: null };
  return { texte: "Une somme de plusieurs termes P(exactement i succès), ou un complément à 1, selon ce qui est le plus rapide à calculer.", latex: null };
}
function aideNiveau2B(ex: ExerciceFamilleB, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "La formule complète (coefficient à calculer toi-même) :", latex: "C(n,k)\\cdot p^{k}\\cdot(1-p)^{n-k}" };
  if (phase === "bEcran2") return { texte: "Valeurs connues, calcul non fait :", latex: `C(${ex.n},${ex.k})\\cdot ${formatDecimalCourt(ex.p)}^{${ex.k}}\\cdot(1-${formatDecimalCourt(ex.p)})^{${ex.n - ex.k}}` };
  if (ex.demandeEcran3 === "auMoinsK") return { texte: "Somme à effectuer (termes non calculés) :", latex: `\\sum_{i=${ex.k}}^{${ex.n}} C(${ex.n},i)\\cdot p^{i}\\cdot(1-p)^{${ex.n}-i}` };
  return { texte: "Complément à effectuer (termes non calculés) :", latex: `1-${formatDecimalCourt(ex.p)}^{${ex.n}}-(1-${formatDecimalCourt(ex.p)})^{${ex.n}}` };
}

// ============================================================================
// Famille C — Indépendants à probabilités différentes.
// ============================================================================

function consigneGeneraleC(ex: ExerciceFamilleC): string {
  return `${ex.contexte.texte} Élément 1 : ${ex.contexte.labelElements[0]}. Élément 2 : ${ex.contexte.labelElements[1]}. Élément 3 : ${ex.contexte.labelElements[2]}.`;
}
function blocDonneesC(ex: ExerciceFamilleC): string[] {
  return ex.contexte.labelElements.map((label, i) => `P(\\text{${label}})=${formatDecimalCourt(ex.p[i])}`);
}
function consigneEcranC(ex: ExerciceFamilleC, phase: PhaseProbabilitesProblemes): string {
  if (phase === "cEcran1") return `Identifie TOUTES les configurations possibles correspondant à "exactement ${ex.k} succès parmi les 3 éléments" — pour chaque configuration, indique quels éléments réussissent (ex : "1,3" signifie que l'élément 1 ET l'élément 3 réussissent, l'élément 2 échoue).`;
  if (phase === "cEcran2") return "Calcule la probabilité de chaque configuration CORRECTE de l'étape précédente, SÉPARÉMENT (produit des probabilités individuelles — PAS un facteur binomial commun, les probabilités sont différentes d'un élément à l'autre).";
  return "Somme les probabilités CORRECTES de l'étape précédente pour obtenir la probabilité totale.";
}
function placeholderListeC(): string {
  return "ex : 1,3";
}
function champsC(ex: ExerciceFamilleC, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "cEcran2") {
    return configurationsExactementK(ex.k).map((c) => ({ label: `P(réussite : ${c.length === 0 ? "aucun" : c.map((i) => i + 1).join(",")}) =`, placeholder: `ex : 0,08 ${ANNONCE_TOLERANCE}` }));
  }
  return [{ label: "Probabilité totale =", placeholder: `ex : 0,4 ${ANNONCE_TOLERANCE}` }];
}
// Correctif transversal (voir `etatActuelA`/`etatActuelB` ci-dessus) : `cEcran3` ne montrait QUE
// les probabilités confirmées à `cEcran2`, jamais la liste des configurations confirmée à
// `cEcran1` — ACCUMULE.
function etatActuelC(ex: ExerciceFamilleC, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "cEcran1") return null;
  const configurations = configurationsExactementK(ex.k).map((c) => `\\text{Config. }\\{${c.map((i) => i + 1).join(",")}\\}`);
  if (phase === "cEcran2") return configurations;
  const probabilites = configurationsExactementK(ex.k).map((c) => `P(\\{${c.map((i) => i + 1).join(",")}\\})=${formatDecimalVirgule(probabiliteConfiguration(ex.p, c))}`);
  return [...configurations, ...probabilites];
}
function aideNiveau1C(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "\"Exactement k succès parmi 3 éléments différents\" correspond à PLUSIEURS configurations distinctes — énumère-les une par une.", latex: null };
  if (phase === "cEcran2") return { texte: "Chaque configuration a SA PROPRE probabilité — multiplie les probabilités (ou compléments) de chaque élément pour CETTE configuration précise.", latex: null };
  return { texte: "Additionne simplement les valeurs de l'étape précédente.", latex: null };
}
function aideNiveau2C(ex: ExerciceFamilleC, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "cEcran1") {
    const exemple = configurationsExactementK(ex.k)[0] ?? [];
    return { texte: "Une configuration donnée en exemple (les autres suivent le même principe) :", latex: `\\{${exemple.map((i) => i + 1).join(",")}\\}` };
  }
  if (phase === "cEcran2") {
    const c = configurationsExactementK(ex.k)[0] ?? [];
    const facteurs = [0, 1, 2].map((i) => (c.includes(i) ? formatDecimalCourt(ex.p[i]) : `(1-${formatDecimalCourt(ex.p[i])})`));
    return { texte: "Une configuration complète (les autres suivent le même principe) :", latex: facteurs.join("\\cdot ") };
  }
  return { texte: "Valeurs connues, somme non faite :", latex: configurationsExactementK(ex.k).map((c) => formatDecimalVirgule(probabiliteConfiguration(ex.p, c))).join("+") };
}

// ============================================================================
// Famille D — Probabilité géométrique.
// ============================================================================

function consigneGeneraleD(ex: ExerciceFamilleD): string {
  return `${ex.contexte.texte} Zone 1 (interne) : ${ex.contexte.labelZones[0]}. Zone 2 : ${ex.contexte.labelZones[1]}. Zone 3 (externe) : ${ex.contexte.labelZones[2]}.`;
}
function blocDonneesD(ex: ExerciceFamilleD): string[] {
  return [`r_1=${ex.r[0]}`, `r_2=${ex.r[1]}`, `r_3=${ex.r[2]}`];
}
function libelleZoneCibleD(ex: ExerciceFamilleD): string {
  return ex.zoneCible.map((z) => ex.contexte.labelZones[z]).join(" ∪ ");
}
function consigneEcranD(ex: ExerciceFamilleD, phase: PhaseProbabilitesProblemes): string {
  if (phase === "dEcran1") return `Calcule l'aire de chacune des 3 zones (${ex.contexte.labelZones.join(", ")}), sous la forme d'un coefficient de π (indique seulement ce coefficient — π est sous-entendu). Rappel : l'aire d'un anneau est la différence entre l'aire du grand disque et celle du petit disque.`;
  return `Calcule la probabilité que le point tombe dans : ${libelleZoneCibleD(ex)}, à partir des aires CORRECTES de l'étape précédente.`;
}
function champsD(ex: ExerciceFamilleD, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "dEcran1") return ex.contexte.labelZones.map((_, i) => ({ label: `Aire zone ${i + 1} (coeff. de π) =`, placeholder: "ex : 12" }));
  return [{ label: "Probabilité =", placeholder: `ex : 0,4 ${ANNONCE_TOLERANCE}` }];
}
function etatActuelD(ex: ExerciceFamilleD, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "dEcran1") return null;
  return [0, 1, 2].map((z) => `\\text{${ex.contexte.labelZones[z]}}=${coeffAireZone(ex.r, z)}\\pi`);
}
function aideNiveau1D(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "Aire d'un disque de rayon r : πr². Aire d'un anneau : aire du grand disque MOINS aire du petit disque.", latex: null };
  return { texte: "Probabilité = aire de la zone concernée / aire totale (le plus grand disque).", latex: null };
}
function aideNiveau2D(ex: ExerciceFamilleD, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "Une des aires déjà calculée (les autres suivent le même principe) :", latex: `\\text{${ex.contexte.labelZones[0]}}=${ex.r[0]}^2\\pi=${coeffAireZone(ex.r, 0)}\\pi` };
  return { texte: "Valeurs connues, division non faite :", latex: `\\dfrac{${ex.zoneCible.map((z) => coeffAireZone(ex.r, z)).join("+")}}{${coeffAireTotale(ex.r)}}` };
}

// ============================================================================
// Famille E — sous-type "mixte".
// ============================================================================

function phrasesMixte(ex: ExerciceFamilleEMixte["base"]): [string, string, string] {
  return [
    `Parmi tous les cas, la proportion qui correspond à c₁ est de ${formatDecimalTextePlain(ex.p)}.`,
    `Si on se limite aux cas où c₁ est vrai, E se produit dans une proportion de ${formatDecimalTextePlain(ex.q1)}.`,
    `Si on se limite aux cas où c₂ est vrai, E se produit dans une proportion de ${formatDecimalTextePlain(ex.q2)}.`,
  ];
}
function consigneGeneraleEMixte(ex: ExerciceFamilleEMixte): string {
  return `${ex.base.contexte.texte} c₁ : ${ex.base.contexte.labelCause1}. c₂ : ${ex.base.contexte.labelCause2}. E : ${ex.base.contexte.labelEffet}.`;
}
function blocDonneesEMixte(): string[] {
  return [];
}
function consigneEcranEMixte(ex: ExerciceFamilleEMixte, phase: PhaseProbabilitesProblemes): string {
  if (phase === "eMixteEcran1") {
    const phrases = phrasesMixte(ex.base);
    const ordre = ex.ordreAffichage.map((i) => phrases[i]);
    return `Voici 3 informations, données dans un ordre volontairement mélangé : (1) ${ordre[0]} (2) ${ordre[1]} (3) ${ordre[2]} Identifie correctement à QUELLE probabilité (P(c₁), P(E|c₁) ou P(E|c₂)) correspond chaque information, puis remplis les 3 champs ci-dessous en conséquence — cette étape te servira à construire l'arbre à l'étape suivante.`;
  }
  if (phase === "eMixteEcran2") return "Construis l'arbre : calcule les 4 probabilités des branches finales, puis P(E) par la formule des probabilités totales, à partir des valeurs CORRECTES de l'étape précédente.";
  return "Applique le théorème de Bayes pour calculer la probabilité demandée, à partir de la valeur CORRECTE de l'étape précédente.";
}
function champsEMixte(ex: ExerciceFamilleEMixte, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "eMixteEcran1") {
    return [
      { label: "P(c₁) =", placeholder: `ex : 0,2 ${ANNONCE_TOLERANCE}` },
      { label: "P(E|c₁) =", placeholder: `ex : 0,3 ${ANNONCE_TOLERANCE}` },
      { label: "P(E|c₂) =", placeholder: `ex : 0,1 ${ANNONCE_TOLERANCE}` },
    ];
  }
  if (phase === "eMixteEcran2") {
    return [
      { label: "P(c₁∩E) =", placeholder: `ex : 0,06 ${ANNONCE_TOLERANCE}` },
      { label: "P(c₁∩Ē) =", placeholder: `ex : 0,14 ${ANNONCE_TOLERANCE}` },
      { label: "P(c₂∩E) =", placeholder: `ex : 0,08 ${ANNONCE_TOLERANCE}` },
      { label: "P(c₂∩Ē) =", placeholder: `ex : 0,72 ${ANNONCE_TOLERANCE}` },
      { label: "P(E) =", placeholder: `ex : 0,14 ${ANNONCE_TOLERANCE}` },
    ];
  }
  const libelle = ex.base.demandeEcran3 === "cause1SachantEffet" ? "P(c₁|E) =" : "P(c₁|Ē) =";
  return [{ label: libelle, placeholder: `ex : 0,43 ${ANNONCE_TOLERANCE}` }];
}
// Correctif transversal (même bug que 6gen1, voir CLAUDE.md/`docs/historique-6e.md`) :
// `eMixteEcran3` ne montrait QUE les 5 probabilités de l'arbre confirmées à `eMixteEcran2`, jamais
// les 3 proportions de départ confirmées à `eMixteEcran1` — ACCUMULE désormais, plus ancien en
// premier.
function etatActuelEMixte(ex: ExerciceFamilleEMixte, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "eMixteEcran1") return null;
  const depart = [`P(c_1)=${formatDecimalCourt(ex.base.p)}`, `P(E|c_1)=${formatDecimalCourt(ex.base.q1)}`, `P(E|c_2)=${formatDecimalCourt(ex.base.q2)}`];
  if (phase === "eMixteEcran2") return depart;
  const [b1, b2, b3, b4] = branchesArbreC(ex.base);
  const arbre = [`P(c_1\\cap E)=${formatDecimalCourt(b1)}`, `P(c_1\\cap\\overline{E})=${formatDecimalCourt(b2)}`, `P(c_2\\cap E)=${formatDecimalCourt(b3)}`, `P(c_2\\cap\\overline{E})=${formatDecimalCourt(b4)}`, `P(E)=${formatDecimalCourt(probabiliteEffetC(ex.base))}`];
  return [...depart, ...arbre];
}
function aideNiveau1EMixte(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "eMixteEcran1") return { texte: "P(c₁) est une proportion GLOBALE (sur tous les cas). P(E|c₁) et P(E|c₂) sont des proportions LIMITÉES à un sous-groupe (« si on se limite à... »).", latex: null };
  if (phase === "eMixteEcran2") return { texte: "Chaque branche finale = P(cause) × P(effet ou son contraire | cette cause).", latex: null };
  return { texte: "Rappel de la formule de Bayes :", latex: "P(\\text{cause}|\\text{effet})=\\dfrac{P(\\text{effet}|\\text{cause})\\cdot P(\\text{cause})}{P(\\text{effet})}" };
}
function aideNiveau2EMixte(ex: ExerciceFamilleEMixte, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "eMixteEcran1") return { texte: "L'information globale (sans condition) correspond toujours à P(c₁) — identifie-la en premier.", latex: null };
  if (phase === "eMixteEcran2") return { texte: "Une branche complète (les 3 autres suivent le même principe) :", latex: `P(c_1\\cap E)=${formatDecimalCourt(ex.base.p)}\\times ${formatDecimalCourt(ex.base.q1)}` };
  const [b1, b2] = branchesArbreC(ex.base);
  const pEffet = probabiliteEffetC(ex.base);
  const numerateur = ex.base.demandeEcran3 === "cause1SachantEffet" ? b1 : b2;
  const denominateur = ex.base.demandeEcran3 === "cause1SachantEffet" ? pEffet : 1 - pEffet;
  return { texte: "Numérateur et dénominateur (valeurs de l'étape précédente), division non faite :", latex: `\\dfrac{${formatDecimalCourt(numerateur)}}{${formatDecimalCourt(denominateur)}}` };
}

// ============================================================================
// Famille E — sous-type "parametrique".
// ============================================================================

function consigneGeneraleEParam(ex: ExerciceFamilleEParametrique): string {
  return ex.contexte.texte;
}
function blocDonneesEParam(ex: ExerciceFamilleEParametrique): string[] {
  return [`a=P(\\text{test}+\\mid\\text{malade})=${formatDecimalCourt(ex.a)}`, `b=P(\\text{test}+\\mid\\text{non malade})=${formatDecimalCourt(ex.b)}`, `x=P(\\text{malade})\\text{ (inconnue)}`];
}
function consigneEcranEParam(ex: ExerciceFamilleEParametrique, phase: PhaseProbabilitesProblemes): string {
  if (phase === "eParamEcran1") return "Exprime P(malade∩test+) et P(test+) en fonction de x (utilise x comme variable, et les valeurs numériques de a et b données ci-dessus).";
  if (phase === "eParamEcran2") return "Forme P(x)=P(malade|test+) comme fraction rationnelle en x, à partir des expressions CORRECTES de l'étape précédente.";
  return `Résous l'inéquation P(x)>${formatDecimalTextePlain(ex.seuil)} pour x∈]0;1[, à partir de l'expression CORRECTE de l'étape précédente.`;
}
function champsEParam(ex: ExerciceFamilleEParametrique, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "eParamEcran1") {
    return [
      { label: "P(malade∩test+) =", placeholder: `ex : ${ex.a}*x` },
      { label: "P(test+) =", placeholder: `ex : ${ex.a}*x+${ex.b}*(1-x)` },
    ];
  }
  return [{ label: "P(x) =", placeholder: `ex : (${ex.a}*x)/(${ex.a}*x+${ex.b}*(1-x))` }];
}
// Correctif transversal (voir `etatActuelEMixte` ci-dessus) : `eParamEcran3` ne montrait QUE P(x)
// confirmé à `eParamEcran2`, jamais les 2 expressions confirmées à `eParamEcran1` — ACCUMULE.
function etatActuelEParam(ex: ExerciceFamilleEParametrique, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "eParamEcran1") return null;
  const expressions = [`P(\\text{malade}\\cap\\text{test}+)=${ex.a}x`, `P(\\text{test}+)=${ex.a}x+${ex.b}(1-x)`];
  if (phase === "eParamEcran2") return expressions;
  return [...expressions, `P(x)=\\dfrac{${ex.a}x}{${ex.a}x+${ex.b}(1-x)}`];
}
function aideNiveau1EParam(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "eParamEcran1") return { texte: "P(malade)=x, P(test+|malade)=a, P(test+|non malade)=b (a,b donnés). Utilise la formule des probabilités totales pour P(test+).", latex: null };
  if (phase === "eParamEcran2") return { texte: "Rappel de la formule de Bayes appliquée avec x symbolique à la place d'une valeur numérique :", latex: "P(x)=\\dfrac{P(\\text{malade}\\cap\\text{test}+)}{P(\\text{test}+)}" };
  return { texte: "Multiplie les deux membres par le dénominateur (toujours positif sur ]0;1[), puis isole x.", latex: null };
}
function aideNiveau2EParam(ex: ExerciceFamilleEParametrique, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "eParamEcran1") return { texte: "Deuxième expression, structure donnée (calcul non fait) :", latex: `${ex.a}\\cdot x+${ex.b}\\cdot(1-x)` };
  if (phase === "eParamEcran2") return { texte: "Numérateur et dénominateur affichés séparément (fraction non formée) :", latex: `\\text{numérateur}=${ex.a}x\\qquad\\text{dénominateur}=${ex.a}x+${ex.b}(1-x)` };
  return { texte: "Inéquation avec valeurs substituées (résolution non faite) :", latex: `\\dfrac{${ex.a}x}{${ex.a}x+${ex.b}(1-x)}>${formatDecimalCourt(ex.seuil)}` };
}

// ============================================================================
// Famille F — Fiabilité de circuits.
// ============================================================================

const LIBELLE_CONFIG_F: Record<ExerciceFamilleF["configuration"], (ex: ExerciceFamilleF) => string> = {
  serie: () => "montés EN SÉRIE : TOUS les composants doivent fonctionner pour que le système fonctionne",
  parallele: () => "montés EN PARALLÈLE : AU MOINS UN des composants doit fonctionner pour que le système fonctionne",
  mixte: (ex) => `montés en configuration MIXTE : le composant « ${ex.contexte.labelComposants[ex.positionMixte ?? 0]} » est monté EN SÉRIE avec le groupe formé par les 2 autres composants, eux-mêmes montés EN PARALLÈLE entre eux`,
};
function consigneGeneraleF(ex: ExerciceFamilleF): string {
  return `${ex.contexte.texte} Les 3 composants (${ex.contexte.labelComposants.join(", ")}) sont ${LIBELLE_CONFIG_F[ex.configuration](ex)}.`;
}
function blocDonneesF(ex: ExerciceFamilleF): string[] {
  return ex.contexte.labelComposants.map((label, i) => `P(\\text{${label} fonctionne})=${formatDecimalCourt(ex.p[i])}`);
}
function consigneEcranF(ex: ExerciceFamilleF, phase: PhaseProbabilitesProblemes): string {
  if (phase === "fEcran1") return "Identifie la configuration et pose la formule appropriée de la fiabilité du système, sous forme d'une valeur numérique (calcule-la toi-même à partir des probabilités ci-dessus).";
  if (phase === "fEcran2") return "Calcule la valeur de la fiabilité du système, à partir de la formule CORRECTE de l'étape précédente.";
  if (ex.demandeEcran3 === "comparerValeur") {
    const config = ex.configurationAlternative ?? ex.configuration;
    const position = ex.positionMixteAlternative;
    const description = config === "mixte" && position !== undefined ? `mixte (« ${ex.contexte.labelComposants[position]} » seul en série, les 2 autres en parallèle)` : config === "serie" ? "tous en série" : "tous en parallèle";
    return `Les mêmes 3 composants sont maintenant montés dans une configuration ALTERNATIVE : ${description}. Calcule la fiabilité de cette nouvelle configuration, à partir de la logique CORRECTE des étapes précédentes.`;
  }
  return `Un technicien affirme : « La fiabilité de ce système est de ${formatDecimalTextePlain(ex.affirmationValeur ?? 0)} ». Cette affirmation est-elle vraie ou fausse (à comparer à la valeur CORRECTE de l'étape précédente) ?`;
}
function champsF(phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "fEcran1") return [{ label: "Fiabilité du système (formule) =", placeholder: "ex : 0.8*0.9*0.7" }];
  if (phase === "fEcran2") return [{ label: "Fiabilité du système =", placeholder: `ex : 0,5 ${ANNONCE_TOLERANCE}` }];
  return [{ label: "Fiabilité de la configuration alternative =", placeholder: `ex : 0,9 ${ANNONCE_TOLERANCE}` }];
}
export function choixEcranF(): OptionChoix[] {
  return [
    { id: "vrai", label: "Vrai" },
    { id: "faux", label: "Faux" },
  ];
}
function formuleTexteF(ex: ExerciceFamilleF): string {
  const [p0, p1, p2] = ex.p.map(formatDecimalCourt);
  if (ex.configuration === "serie") return `${p0}\\times ${p1}\\times ${p2}`;
  if (ex.configuration === "parallele") return `1-(1-${p0})(1-${p1})(1-${p2})`;
  const solo = ex.positionMixte ?? 0;
  const autres = [0, 1, 2].filter((i) => i !== solo);
  const pSolo = formatDecimalCourt(ex.p[solo]);
  const pA = formatDecimalCourt(ex.p[autres[0]]);
  const pB = formatDecimalCourt(ex.p[autres[1]]);
  return `${pSolo}\\times(1-(1-${pA})(1-${pB}))`;
}
// Correctif transversal (voir `etatActuelA`/`etatActuelB`/`etatActuelC` ci-dessus) : `fEcran3` ne
// montrait QUE la fiabilité confirmée à `fEcran2`, jamais la formule confirmée à `fEcran1` —
// ACCUMULE.
function etatActuelF(ex: ExerciceFamilleF, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "fEcran1") return null;
  const formule = [formuleTexteF(ex)];
  if (phase === "fEcran2") return formule;
  return [...formule, `\\text{Fiabilité}=${formatDecimalVirgule(valeurConfigurationF(ex.p, ex.configuration, ex.positionMixte))}`];
}
function aideNiveau1F(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "Série : produit des probabilités. Parallèle : 1 moins le produit des probabilités de PANNE (1−pᵢ).", latex: null };
  if (phase === "fEcran2") return { texte: "Remplace chaque probabilité par sa valeur dans la formule ci-dessus (état actuel), puis calcule.", latex: null };
  return { texte: "Recalcule la fiabilité correcte, compare-la à la valeur affirmée.", latex: null };
}
function aideNiveau2F(ex: ExerciceFamilleF, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "fEcran1") {
    const solo = ex.positionMixte ?? 0;
    const autres = [0, 1, 2].filter((i) => i !== solo);
    if (ex.configuration === "mixte") return { texte: "Décomposition : le groupe en parallèle, PUIS l'assemblage final (formule complète non assemblée) :", latex: `\\text{groupe parallèle}=1-(1-${formatDecimalCourt(ex.p[autres[0]])})(1-${formatDecimalCourt(ex.p[autres[1]])})` };
    return { texte: "Formule à appliquer (valeurs non substituées) :", latex: ex.configuration === "serie" ? "p_1\\times p_2\\times p_3" : "1-(1-p_1)(1-p_2)(1-p_3)" };
  }
  return { texte: "Valeurs connues, calcul non fait :", latex: formuleTexteF(ex) };
}

// ============================================================================
// Famille G — sous-type "derangements" (réutilise le vocabulaire de 6gen31 famille B).
// ============================================================================

function consigneGeneraleGDerang(ex: ExerciceFamilleGDerangements): string {
  return ex.base.contexte === "lettres" ? "On glisse au hasard 4 lettres dans 4 enveloppes déjà adressées (une lettre par enveloppe)." : "Un lecteur MP3 joue 4 chansons dans un ordre totalement aléatoire.";
}
function blocDonneesGDerang(ex: ExerciceFamilleGDerangements): string[] {
  return [`n=${ex.base.n}`];
}
function consigneEcranGDerang(ex: ExerciceFamilleGDerangements, phase: PhaseProbabilitesProblemes): string {
  if (phase === "gDerangEcran1") return ex.base.demandeEcran1 === "une" ? "Calcule la probabilité qu'UNE position donnée soit correcte." : "Calcule la probabilité que DEUX positions données soient simultanément correctes.";
  if (phase === "gDerangEcran2") return "Calcule la probabilité que TOUT l'arrangement soit correct (chaque élément à sa place).";
  if (phase === "gDerangEcran3") return `Calcule la probabilité qu'EXACTEMENT k=${ex.base.k} positions soient correctes (piège : les positions restantes doivent former un DÉRANGEMENT COMPLET, aucune correcte parmi elles).`;
  return "Calcule la probabilité qu'AUCUNE position ne soit correcte.";
}
function champsGDerang(phase: PhaseProbabilitesProblemes): ChampDef[] {
  const labels: Partial<Record<PhaseProbabilitesProblemes, string>> = { gDerangEcran1: "Probabilité =", gDerangEcran2: "P(tout correct) =", gDerangEcran3: "P(exactement k correctes) =", gDerangEcran4: "P(aucune correcte) =" };
  return [{ label: labels[phase] ?? "Probabilité =", placeholder: `ex : 0,25 ${ANNONCE_TOLERANCE}` }];
}
function aideNiveau1GDerang(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "gDerangEcran1") return { texte: "P(une position fixée) = 1/n. P(deux positions fixées) = (n-2)!/n!.", latex: null };
  if (phase === "gDerangEcran2") return { texte: "Un seul arrangement, parmi n!, est entièrement correct.", latex: null };
  if (phase === "gDerangEcran3") return { texte: "Choisis quelles k positions sont correctes (C(n,k) façons), PUIS les n-k positions restantes doivent former un dérangement complet.", latex: null };
  return { texte: "Utilise directement la table des dérangements D(n).", latex: null };
}
function aideNiveau2GDerang(): AideAvecLatex {
  return { texte: "Table des dérangements : D(0)=1, D(1)=0, D(2)=1, D(3)=2, D(4)=9.", latex: null };
}

function factorielleGDerang(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function coefficientBinomialGDerang(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorielleGDerang(n) / (factorielleGDerang(k) * factorielleGDerang(n - k));
}
const DERANGEMENTS_G: readonly number[] = [1, 0, 1, 2, 9, 44];

/** Correctif transversal (même bug que `etatActuelA`/`etatActuelB`/`etatActuelC`/`etatActuelF`/
 * `etatActuelGFinancier` ci-dessus, non couvert par l'audit précédent qui n'avait fixé que
 * A/B/C/F/EMixte/EParam/GFinancier) : `etatActuel` renvoyait TOUJOURS `null` pour cette
 * famille/sous-type (4 écrans), quel que soit l'écran — aucune réponse validée n'était jamais
 * affichée, y compris à `gDerangEcran4`. ACCUMULE désormais, plus ancien en premier, même principe
 * que `etatActuelB` de `formatTiragesArbres.ts` (6gen31) dont cette famille réutilise le vocabulaire. */
function etatActuelGDerang(ex: ExerciceFamilleGDerangements, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "gDerangEcran1") return null;
  const { n, k, demandeEcran1 } = ex.base;
  const numPositions = demandeEcran1 === "une" ? 1 : factorielleGDerang(n - 2);
  const denPositions = demandeEcran1 === "une" ? n : factorielleGDerang(n);
  const base = [`P(\\text{position(s) fixée(s)})=${formatDecimalCourt(numPositions / denPositions)}`];
  if (phase === "gDerangEcran2") return base;
  const avecEcran2 = [...base, `P(\\text{tout correct})=\\dfrac{1}{${n}!}=${formatDecimalCourt(1 / factorielleGDerang(n))}`];
  if (phase === "gDerangEcran3") return avecEcran2;
  const numK = coefficientBinomialGDerang(n, k) * DERANGEMENTS_G[n - k];
  const denK = factorielleGDerang(n);
  return [...avecEcran2, `P(\\text{exactement }${k})=${formatDecimalCourt(numK / denK)}`];
}

// ============================================================================
// Famille G — sous-type "melangeObjets".
// ============================================================================

function consigneGeneraleGMelange(ex: ExerciceFamilleGMelange): string {
  return `${ex.contexteMelange.texte} Le dé de l'urne 1 a une face spéciale n°${ex.base.faceSpeciale} de probabilité CONNUE, les 5 autres faces équiprobables entre elles (probabilité commune INCONNUE, à déterminer).`;
}
function blocDonneesGMelange(ex: ExerciceFamilleGMelange): string[] {
  return [`P(\\text{face }${ex.base.faceSpeciale})=\\dfrac{${ex.base.p0.num}}{${ex.base.p0.den}}`, `\\text{Poids de l'urne 1}=${formatDecimalCourt(ex.poidsObjet1)}`, `P(\\text{${ex.contexteMelange.labelEvenement}}\\mid\\text{urne 2})=${formatDecimalCourt(ex.probabiliteAutreObjet)}`];
}
function consigneEcranGMelange(ex: ExerciceFamilleGMelange, phase: PhaseProbabilitesProblemes): string {
  if (phase === "gMelangeEcran1") return "Pose l'équation traduisant que les 6 probabilités de faces somment à 1 (utilise « a » pour la probabilité de la face spéciale, DÉJÀ connue, et « p » pour la probabilité commune, inconnue, des 5 autres faces).";
  if (phase === "gMelangeEcran2") return "Résous cette équation pour trouver p, à partir de l'équation CORRECTE de l'étape précédente.";
  if (phase === "gMelangeEcran3") return `Calcule P(face ${ex.base.faceSpeciale} ∪ face ${ex.base.autreFace}), à partir de p CORRECT.`;
  return `L'urne est choisie au hasard : avec probabilité ${formatDecimalTextePlain(ex.poidsObjet1)}, c'est l'urne 1 (le dé ci-dessus) ; sinon, c'est l'urne 2, pour laquelle P(${ex.contexteMelange.labelEvenement}) est DONNÉE directement ci-dessus. Combine les deux cas via la formule des probabilités totales, à partir de la valeur CORRECTE de l'étape précédente.`;
}
function champsGMelange(phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "gMelangeEcran1") return [{ label: "Équation =", placeholder: "ex : 5*p+a=1" }];
  if (phase === "gMelangeEcran2") return [{ label: "p =", placeholder: `ex : 0,05 ${ANNONCE_TOLERANCE}` }];
  return [{ label: "Probabilité =", placeholder: `ex : 0,25 ${ANNONCE_TOLERANCE}` }];
}
function aideNiveau1GMelange(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "gMelangeEcran1") return { texte: "La somme des probabilités des 6 faces d'un dé vaut toujours 1.", latex: null };
  if (phase === "gMelangeEcran2") return { texte: "Isole p dans l'équation de l'étape précédente.", latex: null };
  if (phase === "gMelangeEcran3") return { texte: "Deux faces distinctes : additionne simplement leurs probabilités.", latex: null };
  return { texte: "Probabilité totale = poids×P(objet1) + (1−poids)×P(objet2).", latex: null };
}
function aideNiveau2GMelange(ex: ExerciceFamilleGMelange, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "gMelangeEcran1") return { texte: "Équation attendue :", latex: "5p+a=1" };
  if (phase === "gMelangeEcran2") return { texte: "Équation avec a substitué (résolution non faite) :", latex: `5p+\\dfrac{${ex.base.p0.num}}{${ex.base.p0.den}}=1` };
  if (phase === "gMelangeEcran3") return { texte: "Valeurs connues, somme non faite :", latex: `\\dfrac{${ex.base.p0.num}}{${ex.base.p0.den}}+${formatDecimalVirgule(probabiliteObjet1(ex))}-\\dfrac{${ex.base.p0.num}}{${ex.base.p0.den}}` };
  return { texte: "Valeurs connues, calcul non fait :", latex: `${formatDecimalCourt(ex.poidsObjet1)}\\times ${formatDecimalCourt(probabiliteObjet1(ex))}+(1-${formatDecimalCourt(ex.poidsObjet1)})\\times ${formatDecimalCourt(ex.probabiliteAutreObjet)}` };
}

/** Correctif transversal (même bug que `etatActuelGDerang` ci-dessus, non couvert par l'audit
 * précédent) : `etatActuel` renvoyait TOUJOURS `null` pour cette famille/sous-type (4 écrans), quel
 * que soit l'écran. ACCUMULE désormais, plus ancien en premier. */
function etatActuelGMelange(ex: ExerciceFamilleGMelange, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "gMelangeEcran1") return null;
  const equation = ["5p+a=1"];
  if (phase === "gMelangeEcran2") return equation;
  const avecP = [...equation, `p=\\dfrac{${ex.base.p.num}}{${ex.base.p.den}}`];
  if (phase === "gMelangeEcran3") return avecP;
  return [...avecP, `P(\\text{face }${ex.base.faceSpeciale}\\cup\\text{face }${ex.base.autreFace})=${formatDecimalVirgule(probabiliteObjet1(ex))}`];
}

// ============================================================================
// Famille G — sous-type "financier".
// ============================================================================

function consigneGeneraleGFinancier(ex: ExerciceFamilleGFinancier): string {
  return ex.contexte.texte;
}
function blocDonneesGFinancier(ex: ExerciceFamilleGFinancier): string[] {
  return [...ex.categories.map((c) => `\\text{${c.label}}: ${Math.round(c.proportion * 100)}\\%\\text{ des clients, taux}=${Math.round(c.taux * 100)}\\%`), `\\text{${ex.contexte.libelleValeur}}=${ex.valeurUnitaire}€`, `N=${ex.nombreTotalIndividus}`];
}
function consigneEcranGFinancier(phase: PhaseProbabilitesProblemes): string {
  if (phase === "gFinancierEcran1") return "Calcule, pour chaque catégorie, le produit (proportion × taux).";
  if (phase === "gFinancierEcran2") return "Somme ces produits pour obtenir la probabilité globale qu'un client achète, à partir des valeurs CORRECTES de l'étape précédente.";
  return "Multiplie cette probabilité par la valeur unitaire et le nombre total de clients pour obtenir le résultat financier total attendu, à partir de la valeur CORRECTE de l'étape précédente.";
}
function champsGFinancier(ex: ExerciceFamilleGFinancier, phase: PhaseProbabilitesProblemes): ChampDef[] {
  if (phase === "gFinancierEcran1") return ex.categories.map((c) => ({ label: `Produit (${c.label}) =`, placeholder: `ex : 0,12 ${ANNONCE_TOLERANCE}` }));
  if (phase === "gFinancierEcran2") return [{ label: "Probabilité globale =", placeholder: `ex : 0,3 ${ANNONCE_TOLERANCE}` }];
  return [{ label: "Résultat financier (€) =", placeholder: "ex : 12000" }];
}
// Correctif transversal (voir `etatActuelA`/`etatActuelB`/`etatActuelC`/`etatActuelF` ci-dessus) :
// `gFinancierEcran3` ne montrait QUE la probabilité globale confirmée à `gFinancierEcran2`, jamais
// les produits par catégorie confirmés à `gFinancierEcran1` — ACCUMULE.
function etatActuelGFinancier(ex: ExerciceFamilleGFinancier, phase: PhaseProbabilitesProblemes): string[] | null {
  if (phase === "gFinancierEcran1") return null;
  const produits = produitsCategoriesFinancier(ex).map((v, i) => `\\text{${ex.categories[i].label}}=${formatDecimalVirgule(v)}`);
  if (phase === "gFinancierEcran2") return produits;
  return [...produits, `\\text{Probabilité globale}=${formatDecimalVirgule(probabiliteGlobaleFinancier(ex))}`];
}
function aideNiveau1GFinancier(phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "gFinancierEcran1") return { texte: "Produit = proportion × taux, pour chaque catégorie séparément.", latex: null };
  if (phase === "gFinancierEcran2") return { texte: "Additionne simplement les produits de l'étape précédente (formule des probabilités totales).", latex: null };
  return { texte: "Résultat = probabilité globale × valeur unitaire × nombre total de clients.", latex: null };
}
function aideNiveau2GFinancier(ex: ExerciceFamilleGFinancier, phase: PhaseProbabilitesProblemes): AideAvecLatex {
  if (phase === "gFinancierEcran1") return { texte: "Un exemple complet (les autres catégories suivent le même principe) :", latex: `\\text{${ex.categories[0].label}}=${formatDecimalCourt(ex.categories[0].proportion)}\\times ${formatDecimalCourt(ex.categories[0].taux)}` };
  if (phase === "gFinancierEcran2") return { texte: "Somme à effectuer (valeurs non additionnées) :", latex: produitsCategoriesFinancier(ex).map(formatDecimalVirgule).join("+") };
  return { texte: "Produit à effectuer (calcul non fait) :", latex: `${formatDecimalVirgule(probabiliteGlobaleFinancier(ex))}\\times ${ex.valeurUnitaire}\\times ${ex.nombreTotalIndividus}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceProbabilitesProblemes): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB(exercice);
    case "C":
      return consigneGeneraleC(exercice);
    case "D":
      return consigneGeneraleD(exercice);
    case "E":
      return exercice.sousType === "mixte" ? consigneGeneraleEMixte(exercice) : consigneGeneraleEParam(exercice);
    case "F":
      return consigneGeneraleF(exercice);
    case "G":
      if (exercice.sousType === "derangements") return consigneGeneraleGDerang(exercice);
      if (exercice.sousType === "melangeObjets") return consigneGeneraleGMelange(exercice);
      return consigneGeneraleGFinancier(exercice);
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
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return exercice.sousType === "mixte" ? blocDonneesEMixte() : blocDonneesEParam(exercice);
    case "F":
      return blocDonneesF(exercice);
    case "G":
      if (exercice.sousType === "derangements") return blocDonneesGDerang(exercice);
      if (exercice.sousType === "melangeObjets") return blocDonneesGMelange(exercice);
      return blocDonneesGFinancier(exercice);
  }
}

export function consigneEcran(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(exercice, phase);
    case "D":
      return consigneEcranD(exercice, phase);
    case "E":
      return exercice.sousType === "mixte" ? consigneEcranEMixte(exercice, phase) : consigneEcranEParam(exercice, phase);
    case "F":
      return consigneEcranF(exercice, phase);
    case "G":
      if (exercice.sousType === "derangements") return consigneEcranGDerang(exercice, phase);
      if (exercice.sousType === "melangeObjets") return consigneEcranGMelange(exercice, phase);
      return consigneEcranGFinancier(phase);
  }
}

export function etatActuel(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): string[] | null {
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
      return exercice.sousType === "mixte" ? etatActuelEMixte(exercice, phase) : etatActuelEParam(exercice, phase);
    case "F":
      return etatActuelF(exercice, phase);
    case "G":
      if (exercice.sousType === "derangements") return etatActuelGDerang(exercice, phase);
      if (exercice.sousType === "melangeObjets") return etatActuelGMelange(exercice, phase);
      return etatActuelGFinancier(exercice, phase);
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
    case "D":
      return champsD(exercice, phase);
    case "E":
      return exercice.sousType === "mixte" ? champsEMixte(exercice, phase) : champsEParam(exercice, phase);
    case "F":
      return champsF(phase);
    case "G":
      if (exercice.sousType === "derangements") return champsGDerang(phase);
      if (exercice.sousType === "melangeObjets") return champsGMelange(phase);
      return champsGFinancier(exercice, phase);
  }
}

/** Placeholder pour l'écran "liste" (add-as-needed) — SEULEMENT famille C écran 1. */
export function placeholderListe(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): string {
  if (exercice.famille === "C" && phase === "cEcran1") return placeholderListeC();
  return "";
}

/** Options de l'écran "choix" — SEULEMENT famille F écran 3, variante "verifierAffirmation". */
export function choixEcran(): OptionChoix[] {
  return choixEcranF();
}

export function aideNiveau1(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): AideAvecLatex {
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
      return exercice.sousType === "mixte" ? aideNiveau1EMixte(phase) : aideNiveau1EParam(phase);
    case "F":
      return aideNiveau1F(phase);
    case "G":
      if (exercice.sousType === "derangements") return aideNiveau1GDerang(phase);
      if (exercice.sousType === "melangeObjets") return aideNiveau1GMelange(phase);
      return aideNiveau1GFinancier(phase);
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
    case "D":
      return aideNiveau2D(exercice, phase);
    case "E":
      return exercice.sousType === "mixte" ? aideNiveau2EMixte(exercice, phase) : aideNiveau2EParam(exercice, phase);
    case "F":
      return aideNiveau2F(exercice, phase);
    case "G":
      if (exercice.sousType === "derangements") return aideNiveau2GDerang();
      if (exercice.sousType === "melangeObjets") return aideNiveau2GMelange(exercice, phase);
      return aideNiveau2GFinancier(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseProbabilitesProblemes, string> = {
  aEcran1: "Étape 1 (facteurs)",
  aEcran2: "Étape 2 (P(toutes différentes))",
  aEcran3: "Étape 3 (P(au moins 2 identiques))",
  bEcran1: "Étape 1 (formule posée)",
  bEcran2: "Étape 2 (valeur calculée)",
  bEcran3: "Étape 3 (variante demandée)",
  cEcran1: "Étape 1 (configurations)",
  cEcran2: "Étape 2 (probabilités par configuration)",
  cEcran3: "Étape 3 (probabilité totale)",
  dEcran1: "Étape 1 (aires)",
  dEcran2: "Étape 2 (probabilité)",
  eMixteEcran1: "Étape 1 (identifier le sens des données)",
  eMixteEcran2: "Étape 2 (arbre et P(E))",
  eMixteEcran3: "Étape 3 (théorème de Bayes)",
  eParamEcran1: "Étape 1 (expressions en x)",
  eParamEcran2: "Étape 2 (fraction rationnelle P(x))",
  eParamEcran3: "Étape 3 (inéquation résolue)",
  fEcran1: "Étape 1 (formule posée)",
  fEcran2: "Étape 2 (valeur calculée)",
  fEcran3: "Étape 3 (comparaison/vérification)",
  gDerangEcran1: "Étape 1 (position(s) fixée(s))",
  gDerangEcran2: "Étape 2 (tout correct)",
  gDerangEcran3: "Étape 3 (exactement k correctes)",
  gDerangEcran4: "Étape 4 (aucune correcte)",
  gMelangeEcran1: "Étape 1 (équation)",
  gMelangeEcran2: "Étape 2 (résolution)",
  gMelangeEcran3: "Étape 3 (probabilité composée)",
  gMelangeEcran4: "Étape 4 (probabilités totales)",
  gFinancierEcran1: "Étape 1 (produits par catégorie)",
  gFinancierEcran2: "Étape 2 (probabilité globale)",
  gFinancierEcran3: "Étape 3 (résultat financier)",
};

const LIBELLE_FAMILLE_SOUS_TYPE: Record<string, string> = {
  A: "A — Paradoxe des anniversaires",
  B: "B — Loi binomiale",
  C: "C — Indépendants à probabilités différentes",
  D: "D — Probabilité géométrique",
  "E-mixte": "E — Bayes numérique (données mixtes)",
  "E-parametrique": "E — Bayes paramétrique",
  F: "F — Fiabilité de circuits",
  "G-derangements": "G — Réutilisation : dérangements",
  "G-melangeObjets": "G — Réutilisation : mélange d'objets",
  "G-financier": "G — Réutilisation : cadre financier",
};

export function libelleFamilleSousType(exercice: ExerciceProbabilitesProblemes): string {
  if (exercice.famille === "E") return LIBELLE_FAMILLE_SOUS_TYPE[`E-${exercice.sousType}`];
  if (exercice.famille === "G") return LIBELLE_FAMILLE_SOUS_TYPE[`G-${exercice.sousType}`];
  return LIBELLE_FAMILLE_SOUS_TYPE[exercice.famille];
}

/** Récapitulatif final — réponse CORRECTE de chaque écran, jamais recalculée depuis la saisie
 * élève (CLAUDE.md). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return facteursEcran1Local(exercice.n).map((f, i) => `f_{${i + 1}}=${formatDecimalVirgule(f)}`);
    if (phase === "aEcran2") return [`P(\\text{toutes différentes})=${formatDecimalVirgule(probToutesDifferentes(exercice.n))}`];
    return [`P(\\text{au moins 2 identiques})=${formatDecimalVirgule(1 - probToutesDifferentes(exercice.n))}`];
  }
  if (exercice.famille === "B") {
    const valeur = probExactementKBinomiale(exercice.n, exercice.p, exercice.k);
    if (phase === "bEcran1" || phase === "bEcran2") return [`\\text{Réponse}=${formatDecimalCourt(valeur)}`];
    return [`\\text{Réponse}=${formatDecimalCourt(valeurEcran3Binomiale(exercice))}`];
  }
  if (exercice.famille === "C") {
    const configs = configurationsExactementK(exercice.k);
    if (phase === "cEcran1") return configs.map((c) => `\\{${c.map((i) => i + 1).join(",")}\\}`);
    if (phase === "cEcran2") return configs.map((c) => `P(\\{${c.map((i) => i + 1).join(",")}\\})=${formatDecimalCourt(probabiliteConfiguration(exercice.p, c))}`);
    return [`\\text{Réponse}=${formatDecimalCourt(probabiliteExactementKFamilleC(exercice))}`];
  }
  if (exercice.famille === "D") {
    if (phase === "dEcran1") return [0, 1, 2].map((z) => `\\text{Aire}_{${z + 1}}=${coeffAireZone(exercice.r, z)}\\pi`);
    return [`\\text{Réponse}=${formatDecimalCourt(probabiliteZoneCible(exercice))}`];
  }
  if (exercice.famille === "E" && exercice.sousType === "mixte") {
    if (phase === "eMixteEcran1") return [`P(c_1)=${formatDecimalCourt(exercice.base.p)}`, `P(E|c_1)=${formatDecimalCourt(exercice.base.q1)}`, `P(E|c_2)=${formatDecimalCourt(exercice.base.q2)}`];
    if (phase === "eMixteEcran2") {
      const [b1, b2, b3, b4] = branchesArbreC(exercice.base);
      return [`P(c_1\\cap E)=${formatDecimalCourt(b1)}`, `P(c_1\\cap\\overline{E})=${formatDecimalCourt(b2)}`, `P(c_2\\cap E)=${formatDecimalCourt(b3)}`, `P(c_2\\cap\\overline{E})=${formatDecimalCourt(b4)}`, `P(E)=${formatDecimalCourt(probabiliteEffetC(exercice.base))}`];
    }
    return [`\\text{Réponse}=${formatDecimalCourt(bayesEcran3C(exercice.base))}`];
  }
  if (exercice.famille === "E" && exercice.sousType === "parametrique") {
    if (phase === "eParamEcran1") return [`P(\\text{malade}\\cap\\text{test}+)=${exercice.a}x`, `P(\\text{test}+)=${exercice.a}x+${exercice.b}(1-x)`];
    if (phase === "eParamEcran2") return [`P(x)=\\dfrac{${exercice.a}x}{${exercice.a}x+${exercice.b}(1-x)}`];
    const sol = resoudreInequationParametrique(exercice);
    const borne = sol.morceaux[0].inf as number;
    return [`x\\in\\left]${formatDecimalCourt(borne)}\\ ;\\ 1\\right[`];
  }
  if (exercice.famille === "F") {
    const valeur = valeurConfigurationF(exercice.p, exercice.configuration, exercice.positionMixte);
    if (phase === "fEcran1" || phase === "fEcran2") return [`\\text{Fiabilité}=${formatDecimalCourt(valeur)}`];
    if (exercice.demandeEcran3 === "comparerValeur") {
      const alt = valeurConfigurationF(exercice.p, exercice.configurationAlternative ?? exercice.configuration, exercice.positionMixteAlternative);
      return [`\\text{Réponse}=${formatDecimalCourt(alt)}`];
    }
    const estVraie = Math.abs((exercice.affirmationValeur ?? 0) - valeur) <= 0.01;
    return [estVraie ? `\\text{Vrai}` : `\\text{Faux}`];
  }
  // Famille G.
  if (exercice.famille === "G" && exercice.sousType === "derangements") {
    const { n, k, demandeEcran1 } = exercice.base;
    const factorielle = (m: number) => Array.from({ length: m }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
    const coeffBin = (m: number, j: number) => factorielle(m) / (factorielle(j) * factorielle(m - j));
    const DERANGEMENTS = [1, 0, 1, 2, 9, 44];
    if (phase === "gDerangEcran1") return [`\\text{Réponse}=${formatDecimalCourt(demandeEcran1 === "une" ? factorielle(n - 1) / factorielle(n) : factorielle(n - 2) / factorielle(n))}`];
    if (phase === "gDerangEcran2") return [`\\text{Réponse}=${formatDecimalCourt(1 / factorielle(n))}`];
    if (phase === "gDerangEcran3") return [`\\text{Réponse}=${formatDecimalCourt((coeffBin(n, k) * DERANGEMENTS[n - k]) / factorielle(n))}`];
    return [`\\text{Réponse}=${formatDecimalCourt(DERANGEMENTS[n] / factorielle(n))}`];
  }
  if (exercice.famille === "G" && exercice.sousType === "melangeObjets") {
    if (phase === "gMelangeEcran1") return ["5p+a=1"];
    if (phase === "gMelangeEcran2") return [`p=${exercice.base.p.num}/${exercice.base.p.den}`];
    if (phase === "gMelangeEcran3") return [`\\text{Réponse}=${formatDecimalCourt(probabiliteObjet1(exercice))}`];
    return [`\\text{Réponse}=${formatDecimalCourt(probabiliteTotaleMelange(exercice))}`];
  }
  const g = exercice as Extract<ExerciceProbabilitesProblemes, { famille: "G"; sousType: "financier" }>;
  if (phase === "gFinancierEcran1") return produitsCategoriesFinancier(g).map((v, i) => `\\text{${g.categories[i].label}}=${formatDecimalCourt(v)}`);
  if (phase === "gFinancierEcran2") return [`\\text{Réponse}=${formatDecimalCourt(probabiliteGlobaleFinancier(g))}`];
  return [`\\text{Réponse}=${Math.round(resultatFinancier(g))}€`];
}

function facteursEcran1Local(n: number): number[] {
  const facteurs: number[] = [];
  for (let k = 1; k <= n - 1; k++) facteurs.push((365 - k) / 365);
  return facteurs;
}

/** Total points du récapitulatif final — maximum VARIABLE selon la famille/sous-type (2 à 4 écrans
 * × 100). */
export function calculerTotalPointsProbabilitesProblemes(resultat: ResultatExerciceProbabilitesProblemes): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
