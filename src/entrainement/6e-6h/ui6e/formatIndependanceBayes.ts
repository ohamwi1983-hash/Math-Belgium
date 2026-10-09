import type { ExerciceFamilleAPannes, ExerciceFamilleAUnion, ExerciceFamilleBHistogramme, ExerciceFamilleBReconstruire, ExerciceFamilleBTableauDonne, ExerciceFamilleC, ExerciceIndependanceBayes, TypeQuestionTable } from "../core6e/independanceBayes.types";
import type { PhaseIndependanceBayes, ResultatExerciceIndependanceBayes } from "../moteur6e/typesIndependanceBayes";
import { phasesPourExercice } from "../moteur6e/typesIndependanceBayes";
import { bayesEcran3C, branchesArbreC, cellule00Reconstruire, cellule10Reconstruire, cellule20Reconstruire, pBDeduitUnion, probabiliteDepuisTable, probabiliteEffetC, proportionHistogramme, tableCompleteReconstruire, totauxLigneReconstruire, valeurEcran2Histogramme, valeurEcran2Pannes } from "../moteur6e/verificationIndependanceBayes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage pour `6gen32`. Dispatch sur
 * `exercice.famille` PUIS `exercice.sousType`/`phase` où pertinent, même principe que
 * `formatProbabilitesEnsembles.ts` (6gen30). Toutes les quantités DÉRIVÉES affichées (état actuel,
 * récapitulatif) réutilisent les fonctions de `moteur6e/verificationIndependanceBayes.ts` — JAMAIS
 * recalculées indépendamment ici (CLAUDE.md).
 *
 * **AUCUN écran à choix** — voir en-tête de `verificationIndependanceBayes.ts` : les 14 écrans de ce
 * générateur sont tous des champs texte libre. `champsEcran` couvre donc l'intégralité des écrans.
 */

export interface ChampDef {
  label: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Table en lecture seule pour l'affichage (données/état actuel) — TEXTE BRUT partout (jamais du
 * LaTeX : les libellés sont des mots ("Football", "Niveau faible") ou des nombres simples, rendus
 * comme un `<table>` HTML ordinaire, jamais via KaTeX — voir `components6e/
 * EtapeChampsIndependanceBayes.tsx`). `null` = case pas encore connue (affichée "?"). */
export interface TableauAffichage {
  libelleLignes: string[];
  libelleColonnes: string[];
  cellules: (string | null)[][];
}

const ANNONCE_TOLERANCE = "(forme exacte ou décimale arrondie au centième)";

/** Décimal court (2 décimales, virgule française) — notation utilisée pour TOUTE probabilité de ce
 * générateur (voir en-tête de `core6e/independanceBayes.types.ts` : les données de départ SONT des
 * décimales, pas des effectifs sur un dénominateur commun — jamais de fraction affichée ici). */
function formatDecimalVirgule(v: number): string {
  return String(Math.round(v * 100) / 100).replace(".", "{,}");
}

/** Entier exact (effectifs/cellules de tableau, toujours entiers par construction — voir
 * `generateurs6e/independanceBayes/familleB.ts`). */
function formatEntier(v: number): string {
  return String(Math.round(v));
}

// ============================================================================
// Famille A — sous-type "pannes".
// ============================================================================

/** Symboles courts A₁/A₂ utilisés dans TOUT fragment KaTeX de ce sous-type — jamais les libellés
 * `labelElement1`/`labelPanne` (des phrases françaises complètes) directement en mode mathématique :
 * KaTeX rend des mots bruts hors `\text{}` comme une suite de variables italiques collées sans
 * espace (ex. "l'ampouleL1grille"), illisible — piège de la même famille que le bug "signe orphelin"
 * documenté CLAUDE.md, guardé par la régression `formatIndependanceBayes.test.ts`. La définition
 * complète de A₁/A₂ (en prose, hors KaTeX) est donnée UNE FOIS dans `consigneGenerale`. */
function consigneGeneraleAPannes(ex: ExerciceFamilleAPannes): string {
  return `${ex.contexte.texte} A₁ : ${ex.contexte.labelElement1} ${ex.contexte.labelPanne}. A₂ : ${ex.contexte.labelElement2} ${ex.contexte.labelPanne}.`;
}

function blocDonneesAPannes(ex: ExerciceFamilleAPannes): string[] {
  return [`P(A_1)=${formatDecimalVirgule(ex.p1)}`, `P(A_2)=${formatDecimalVirgule(ex.p2)}`];
}

const LIBELLE_DEMANDE_PANNES: Record<ExerciceFamilleAPannes["demandeEcran2"], string> = {
  lesDeux: "les deux se produisent",
  aucun: "aucun des deux ne se produit",
  auMoinsUn: "au moins un des deux se produit",
  exactementUn: "exactement un des deux se produit",
};

function consigneEcranAPannes(ex: ExerciceFamilleAPannes, phase: PhaseIndependanceBayes): string {
  if (phase === "aPannesEcran1") return `Calcule les probabilités complémentaires P(Ā₁) et P(Ā₂) : la probabilité que ${ex.contexte.labelElement1} ${ex.contexte.labelPanneNegatif}, et que ${ex.contexte.labelElement2} ${ex.contexte.labelPanneNegatif}.`;
  return `Calcule la probabilité que ${LIBELLE_DEMANDE_PANNES[ex.demandeEcran2]}, à partir des valeurs CORRECTES de l'étape précédente.`;
}

function champsAPannes(phase: PhaseIndependanceBayes): ChampDef[] {
  if (phase === "aPannesEcran1") {
    return [
      { label: "P(Ā₁) =", placeholder: `ex : 0,8 ${ANNONCE_TOLERANCE}` },
      { label: "P(Ā₂) =", placeholder: `ex : 0,7 ${ANNONCE_TOLERANCE}` },
    ];
  }
  return [{ label: "Probabilité demandée =", placeholder: `ex : 0,3 ${ANNONCE_TOLERANCE}` }];
}

function etatActuelAPannes(ex: ExerciceFamilleAPannes, phase: PhaseIndependanceBayes): string[] | null {
  if (phase === "aPannesEcran1") return null;
  return [`P(\\overline{A_1})=${formatDecimalVirgule(1 - ex.p1)}`, `P(\\overline{A_2})=${formatDecimalVirgule(1 - ex.p2)}`];
}

function aideNiveau1APannes(phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "aPannesEcran1") return { texte: "Rappel : P(événement contraire) = 1 − P(événement).", latex: null };
  return { texte: "Deux événements indépendants : la probabilité que les DEUX se produisent est le PRODUIT de leurs probabilités — même règle pour toute combinaison de probabilités et de compléments.", latex: null };
}

function aideNiveau2APannes(ex: ExerciceFamilleAPannes, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "aPannesEcran1") return { texte: "Valeurs connues, soustraction non faite :", latex: `1-${formatDecimalVirgule(ex.p1)}\\quad 1-${formatDecimalVirgule(ex.p2)}` };
  if (ex.demandeEcran2 !== "exactementUn") return { texte: "Produit à effectuer (facteurs connus, produit non fait) :", latex: latexProduitPannes(ex) };
  return { texte: "Deux applications distinctes de l'indépendance, PUIS somme (aucun des deux produits n'est fait) :", latex: `P_1\\cdot(1-P_2)+(1-P_1)\\cdot P_2` };
}

function latexProduitPannes(ex: ExerciceFamilleAPannes): string {
  const p1 = formatDecimalVirgule(ex.p1);
  const p2 = formatDecimalVirgule(ex.p2);
  const q1 = formatDecimalVirgule(1 - ex.p1);
  const q2 = formatDecimalVirgule(1 - ex.p2);
  if (ex.demandeEcran2 === "lesDeux") return `${p1}\\cdot ${p2}`;
  if (ex.demandeEcran2 === "aucun") return `${q1}\\cdot ${q2}`;
  return `1-${q1}\\cdot ${q2}`;
}

// ============================================================================
// Famille A — sous-type "unionIndependance".
// ============================================================================

function consigneGeneraleAUnion(ex: ExerciceFamilleAUnion): string {
  return ex.contexte.texte;
}

function blocDonneesAUnion(ex: ExerciceFamilleAUnion): string[] {
  return [`P(A)=${formatDecimalVirgule(ex.pA)}`, `P(A\\cup B)=${formatDecimalVirgule(ex.pAouB)}`];
}

function consigneEcranAUnion(phase: PhaseIndependanceBayes): string {
  if (phase === "aUnionEcran1") return "Calcule P(Ā) — nécessaire pour résoudre l'équation d'union à l'étape suivante.";
  if (phase === "aUnionEcran2") return "Résous P(A∪B)=P(A)+P(B)−P(A)·P(B) pour trouver P(B), à partir de P(Ā) CORRECT de l'étape précédente.";
  return "Calcule P(A|B) et P(B|A), à partir des valeurs CORRECTES des étapes précédentes.";
}

function champsAUnion(phase: PhaseIndependanceBayes): ChampDef[] {
  if (phase === "aUnionEcran1") return [{ label: "P(Ā) =", placeholder: `ex : 0,7 ${ANNONCE_TOLERANCE}` }];
  if (phase === "aUnionEcran2") return [{ label: "P(B) =", placeholder: `ex : 0,4 ${ANNONCE_TOLERANCE}` }];
  return [
    { label: "P(A|B) =", placeholder: `ex : 0,3 ${ANNONCE_TOLERANCE}` },
    { label: "P(B|A) =", placeholder: `ex : 0,4 ${ANNONCE_TOLERANCE}` },
  ];
}

function etatActuelAUnion(ex: ExerciceFamilleAUnion, phase: PhaseIndependanceBayes): string[] | null {
  if (phase === "aUnionEcran1") return null;
  if (phase === "aUnionEcran2") return [`P(\\overline{A})=${formatDecimalVirgule(1 - ex.pA)}`];
  return [`P(\\overline{A})=${formatDecimalVirgule(1 - ex.pA)}`, `P(B)=${formatDecimalVirgule(pBDeduitUnion(ex))}`];
}

function aideNiveau1AUnion(phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "aUnionEcran1") return { texte: "Rappel : P(Ā) = 1 − P(A).", latex: null };
  if (phase === "aUnionEcran2") return { texte: "Rappel de la relation d'union avec indépendance :", latex: "P(A\\cup B)=P(A)+P(B)-P(A)\\cdot P(B)" };
  return { texte: "Rappel : si A et B sont indépendants, conditionner par l'un ne change JAMAIS la probabilité de l'autre : P(A|B)=P(A) et P(B|A)=P(B).", latex: null };
}

function aideNiveau2AUnion(ex: ExerciceFamilleAUnion, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "aUnionEcran1") return { texte: "Valeur connue, soustraction non faite :", latex: `1-${formatDecimalVirgule(ex.pA)}` };
  if (phase === "aUnionEcran2") return { texte: "Équation posée, valeurs connues substituées (résolution non faite) :", latex: `${formatDecimalVirgule(ex.pAouB)}=${formatDecimalVirgule(ex.pA)}+P(B)-${formatDecimalVirgule(ex.pA)}\\cdot P(B)` };
  return { texte: "Un calcul complet P(A∩B)/P(B) et P(A∩B)/P(A) donnerait EXACTEMENT le même résultat — utilise directement le raccourci P(A|B)=P(A), P(B|A)=P(B).", latex: null };
}

// ============================================================================
// Famille B — sous-type "histogramme".
// ============================================================================

function consigneGeneraleBHisto(ex: ExerciceFamilleBHistogramme): string {
  return ex.contexte.texte;
}

function tableauHisto(ex: ExerciceFamilleBHistogramme): TableauAffichage {
  return {
    libelleLignes: ["Effectif"],
    libelleColonnes: ex.classes.map((c) => `[${c.debut} ; ${c.fin}[`),
    cellules: [ex.classes.map((c) => formatEntier(c.effectif))],
  };
}

function blocDonneesBHisto(ex: ExerciceFamilleBHistogramme): string[] {
  const total = ex.classes.reduce((a, c) => a + c.effectif, 0);
  return [`n=${total}`, `\\text{Valeur cible : }${ex.cible}\\ ${ex.contexte.unite}`];
}

const LIBELLE_DEMANDE_HISTO: Record<ExerciceFamilleBHistogramme["demande"], string> = { inferieur: "inférieure à", auMoins: "au moins égale à" };

function consigneEcranBHisto(ex: ExerciceFamilleBHistogramme, phase: PhaseIndependanceBayes): string {
  if (phase === "bHistoEcran1") return `Identifie la classe dans laquelle tombe la valeur cible, puis calcule la proportion de cette classe à prendre en compte (interpolation linéaire).`;
  return `Calcule la probabilité que ${ex.contexte.variable} soit ${LIBELLE_DEMANDE_HISTO[ex.demande]} ${ex.cible} ${ex.contexte.unite}, à partir de la proportion CORRECTE de l'étape précédente.`;
}

function champsBHisto(phase: PhaseIndependanceBayes): ChampDef[] {
  if (phase === "bHistoEcran1") return [{ label: "Proportion de la classe =", placeholder: `ex : 0,3 ${ANNONCE_TOLERANCE}` }];
  return [{ label: "Probabilité =", placeholder: `ex : 0,45 ${ANNONCE_TOLERANCE}` }];
}

function etatActuelBHisto(ex: ExerciceFamilleBHistogramme, phase: PhaseIndependanceBayes): string[] | null {
  if (phase === "bHistoEcran1") return null;
  return [`\\text{Proportion}=${formatDecimalVirgule(proportionHistogramme(ex))}`];
}

function aideNiveau1BHisto(phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "bHistoEcran1") return { texte: "Proportion = (valeur cible − début de la classe) / largeur de la classe.", latex: null };
  return { texte: "Combine la portion interpolée de la classe cible (proportion × effectif de la classe) avec les effectifs des classes entières pertinentes, puis divise par l'effectif total n.", latex: null };
}

function aideNiveau2BHisto(ex: ExerciceFamilleBHistogramme, phase: PhaseIndependanceBayes): AideAvecLatex {
  const classe = ex.classes[ex.indexClasseCible];
  if (phase === "bHistoEcran1") return { texte: "Valeurs connues, division non faite :", latex: `\\dfrac{${ex.cible}-${classe.debut}}{${classe.fin}-${classe.debut}}` };
  const avant = ex.classes.slice(0, ex.indexClasseCible).reduce((a, c) => a + c.effectif, 0);
  const total = ex.classes.reduce((a, c) => a + c.effectif, 0);
  return { texte: "Effectifs à combiner (division finale non faite) :", latex: `\\dfrac{${avant}+${formatDecimalVirgule(proportionHistogramme(ex))}\\cdot ${classe.effectif}}{${total}}` };
}

// ============================================================================
// Famille B — sous-type "tableauDonne".
// ============================================================================

const LIBELLE_TYPE_QUESTION: Record<TypeQuestionTable, string> = {
  jointe: "P(ligne ∩ colonne)",
  margLigne: "P(ligne) — marginale",
  margColonne: "P(colonne) — marginale",
  condLigneSachantColonne: "P(ligne | colonne) — conditionnelle",
  condColonneSachantLigne: "P(colonne | ligne) — conditionnelle",
};

function consigneGeneraleBTable(ex: ExerciceFamilleBTableauDonne): string {
  return ex.contexte.texte;
}

function tableauBTable(ex: ExerciceFamilleBTableauDonne): TableauAffichage {
  return { libelleLignes: ex.table.libelleLignes, libelleColonnes: ex.table.libelleColonnes, cellules: ex.table.cellules.map((ligne) => ligne.map(formatEntier)) };
}

function blocDonneesBTable(ex: ExerciceFamilleBTableauDonne): string[] {
  const total = ex.table.cellules.reduce((acc, l) => acc + l.reduce((a, b) => a + b, 0), 0);
  return [`n=${total}`];
}

function consigneEcranBTable(ex: ExerciceFamilleBTableauDonne): string {
  const ligne = ex.table.libelleLignes[ex.ligneCible];
  const colonne = ex.table.libelleColonnes[ex.colonneCible];
  const type = LIBELLE_TYPE_QUESTION[ex.typeQuestion];
  return `Calcule ${type} pour la ligne « ${ligne} » et la colonne « ${colonne} ». Attention à ne pas confondre une probabilité MARGINALE (total d'une ligne/colonne divisé par le total général) avec une CONDITIONNELLE (cellule divisée par le total d'une seule ligne/colonne).`;
}

function champsBTable(): ChampDef[] {
  return [{ label: "Probabilité =", placeholder: `ex : 0,25 ${ANNONCE_TOLERANCE}` }];
}

function aideNiveau1BTable(): AideAvecLatex {
  return { texte: "Marginale : total d'UNE SEULE ligne (ou colonne) divisé par le total GÉNÉRAL. Conditionnelle : la cellule divisée par le total d'UNE SEULE ligne (ou colonne) — jamais le total général.", latex: null };
}

function aideNiveau2BTable(ex: ExerciceFamilleBTableauDonne): AideAvecLatex {
  const total = ex.table.cellules.reduce((acc, l) => acc + l.reduce((a, b) => a + b, 0), 0);
  const cell = ex.table.cellules[ex.ligneCible][ex.colonneCible];
  const totalLigne = ex.table.cellules[ex.ligneCible].reduce((a, b) => a + b, 0);
  const totalColonne = ex.table.cellules.reduce((a, l) => a + l[ex.colonneCible], 0);
  return { texte: "Valeurs connues pour cette case (division finale non faite) :", latex: `\\text{cellule}=${cell}\\quad \\text{total ligne}=${totalLigne}\\quad \\text{total colonne}=${totalColonne}\\quad n=${total}` };
}

// ============================================================================
// Famille B — sous-type "tableauReconstruire".
// ============================================================================

function consigneGeneraleBRecon(ex: ExerciceFamilleBReconstruire): string {
  return ex.contexte.texte;
}

function blocDonneesBRecon(ex: ExerciceFamilleBReconstruire): string[] {
  return [
    `N=${ex.total}`,
    `\\text{Ligne ${ex.contexte.libelleLignes[0]} : }${ex.pourcentageLigne[0]}\\%\\text{ de N}`,
    `\\text{Ligne ${ex.contexte.libelleLignes[1]} : }${ex.pourcentageLigne[1]}\\%\\text{ de N}`,
    `\\text{Ligne ${ex.contexte.libelleLignes[2]} : }${ex.pourcentageLigne[2]}\\%\\text{ de N}`,
    `\\text{« ${ex.contexte.libelleColonnes[0]} » dans ligne ${ex.contexte.libelleLignes[0]} : }${ex.pourcentageReussiteLigne1}\\%`,
    `\\text{« ${ex.contexte.libelleColonnes[0]} » dans ligne ${ex.contexte.libelleLignes[1]} : }${ex.pourcentageReussiteLigne2}\\%`,
    `\\text{« ${ex.contexte.libelleColonnes[0]} » au total : }${ex.pourcentageReussiteGlobale}\\%\\text{ de N}`,
  ];
}

function tableauEtatActuelBRecon(ex: ExerciceFamilleBReconstruire, phase: PhaseIndependanceBayes): TableauAffichage | null {
  if (phase === "bReconEcran1") return null;
  const [r0, r1, r2] = totauxLigneReconstruire(ex);
  const c00 = cellule00Reconstruire(ex);
  const c10 = cellule10Reconstruire(ex);
  if (phase === "bReconEcran2") {
    return {
      libelleLignes: ex.contexte.libelleLignes,
      libelleColonnes: [...ex.contexte.libelleColonnes, "Total"],
      cellules: [
        [formatEntier(c00), "?", formatEntier(r0)],
        [formatEntier(c10), "?", formatEntier(r1)],
        ["?", "?", formatEntier(r2)],
      ],
    };
  }
  const table = tableCompleteReconstruire(ex);
  const totauxLigne = [r0, r1, r2];
  return { libelleLignes: ex.contexte.libelleLignes, libelleColonnes: [...ex.contexte.libelleColonnes, "Total"], cellules: table.cellules.map((ligne, i) => [...ligne.map(formatEntier), formatEntier(totauxLigne[i])]) };
}

function consigneEcranBRecon(phase: PhaseIndependanceBayes): string {
  if (phase === "bReconEcran1") return "Traduis chaque contrainte donnée en % en effectif : calcule le total de chaque ligne, puis les 2 cellules directement déductibles.";
  if (phase === "bReconEcran2") return "Complète les cases restantes PAR DIFFÉRENCE (chaque ligne et chaque colonne doit sommer à son total connu), à partir des cases CORRECTES de l'étape précédente.";
  return "Lis la probabilité demandée dans le tableau CORRECT reconstruit.";
}

function champsBRecon(ex: ExerciceFamilleBReconstruire, phase: PhaseIndependanceBayes): ChampDef[] {
  if (phase === "bReconEcran1") {
    return [
      { label: `Total ligne ${ex.contexte.libelleLignes[0]} =`, placeholder: "ex : 40" },
      { label: `Total ligne ${ex.contexte.libelleLignes[1]} =`, placeholder: "ex : 60" },
      { label: `Total ligne ${ex.contexte.libelleLignes[2]} =`, placeholder: "ex : 100" },
      { label: `Case (${ex.contexte.libelleLignes[0]}, ${ex.contexte.libelleColonnes[0]}) =`, placeholder: "ex : 16" },
      { label: `Case (${ex.contexte.libelleLignes[1]}, ${ex.contexte.libelleColonnes[0]}) =`, placeholder: "ex : 30" },
    ];
  }
  if (phase === "bReconEcran2") {
    return [
      { label: `Case (${ex.contexte.libelleLignes[2]}, ${ex.contexte.libelleColonnes[0]}) =`, placeholder: "ex : 34" },
      { label: `Case (${ex.contexte.libelleLignes[0]}, ${ex.contexte.libelleColonnes[1]}) =`, placeholder: "ex : 24" },
      { label: `Case (${ex.contexte.libelleLignes[1]}, ${ex.contexte.libelleColonnes[1]}) =`, placeholder: "ex : 30" },
      { label: `Case (${ex.contexte.libelleLignes[2]}, ${ex.contexte.libelleColonnes[1]}) =`, placeholder: "ex : 66" },
    ];
  }
  return [{ label: "Probabilité =", placeholder: `ex : 0,17 ${ANNONCE_TOLERANCE}` }];
}

function aideNiveau1BRecon(phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "bReconEcran1") return { texte: "Effectif = pourcentage × N / 100. Une cellule « X% de la ligne Y » se calcule à partir du TOTAL de la ligne Y (déjà connu), jamais de N directement.", latex: null };
  if (phase === "bReconEcran2") return { texte: "Chaque ligne ET chaque colonne doit sommer à son total connu — utilise cette contrainte pour déduire les cases manquantes une à une.", latex: null };
  return aideNiveau1BTable();
}

function aideNiveau2BRecon(ex: ExerciceFamilleBReconstruire, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "bReconEcran1") {
    const [r0] = totauxLigneReconstruire(ex);
    return { texte: "Un exemple complet (les autres cases suivent le même principe) :", latex: `\\text{Total ligne 1}=${ex.total}\\times\\dfrac{${ex.pourcentageLigne[0]}}{100}=${formatEntier(r0)}` };
  }
  if (phase === "bReconEcran2") {
    const c20 = cellule20Reconstruire(ex);
    return { texte: "Une case supplémentaire déduite (les autres suivent le même principe) :", latex: `\\text{Case (${ex.contexte.libelleLignes[2]}, ${ex.contexte.libelleColonnes[0]})}=${formatEntier((ex.total * ex.pourcentageReussiteGlobale) / 100)}-${formatEntier(cellule00Reconstruire(ex))}-${formatEntier(cellule10Reconstruire(ex))}=${formatEntier(c20)}` };
  }
  return aideNiveau2BTable({ famille: "B", sousType: "tableauDonne", contexte: { texte: "" }, table: tableCompleteReconstruire(ex), typeQuestion: ex.typeQuestionFinale, ligneCible: ex.ligneCibleFinale, colonneCible: ex.colonneCibleFinale });
}

// ============================================================================
// Famille C.
// ============================================================================

/** Symboles courts c₁/c₂/E utilisés dans TOUT fragment KaTeX de cette famille — jamais
 * `labelCause1`/`labelCause2`/`labelEffet` (des phrases françaises complètes) directement en mode
 * mathématique, même piège que la famille A "pannes" ci-dessus (voir son en-tête). La définition
 * complète de c₁/c₂/E (en prose, hors KaTeX) est donnée UNE FOIS dans `consigneGenerale`. */
function consigneGeneraleC(ex: ExerciceFamilleC): string {
  return `${ex.contexte.texte} c₁ : ${ex.contexte.labelCause1}. c₂ : ${ex.contexte.labelCause2}. E : ${ex.contexte.labelEffet}.`;
}

function blocDonneesC(ex: ExerciceFamilleC): string[] {
  return [`P(c_1)=${formatDecimalVirgule(ex.p)}`, `P(E|c_1)=${formatDecimalVirgule(ex.q1)}`, `P(E|c_2)=${formatDecimalVirgule(ex.q2)}`];
}

function consigneEcranC(phase: PhaseIndependanceBayes): string {
  if (phase === "cEcran1") return "Construis l'arbre : calcule les probabilités des 4 branches finales.";
  if (phase === "cEcran2") return "Calcule P(effet) par la formule des probabilités totales, à partir de l'arbre CORRECT de l'étape précédente.";
  return "Applique le théorème de Bayes pour calculer la probabilité demandée, à partir de la valeur CORRECTE de l'étape précédente.";
}

function champsC(ex: ExerciceFamilleC, phase: PhaseIndependanceBayes): ChampDef[] {
  if (phase === "cEcran1") {
    return [
      { label: "P(cause1 ∩ effet) =", placeholder: `ex : 0,02 ${ANNONCE_TOLERANCE}` },
      { label: "P(cause1 ∩ pas effet) =", placeholder: `ex : 0,08 ${ANNONCE_TOLERANCE}` },
      { label: "P(cause2 ∩ effet) =", placeholder: `ex : 0,32 ${ANNONCE_TOLERANCE}` },
      { label: "P(cause2 ∩ pas effet) =", placeholder: `ex : 0,48 ${ANNONCE_TOLERANCE}` },
    ];
  }
  if (phase === "cEcran2") return [{ label: "P(effet) =", placeholder: `ex : 0,34 ${ANNONCE_TOLERANCE}` }];
  const libelle = ex.demandeEcran3 === "cause1SachantEffet" ? "P(cause1 | effet) =" : "P(cause1 | pas effet) =";
  return [{ label: libelle, placeholder: `ex : 0,06 ${ANNONCE_TOLERANCE}` }];
}

function etatActuelC(ex: ExerciceFamilleC, phase: PhaseIndependanceBayes): string[] | null {
  if (phase === "cEcran1") return null;
  const [b1, b2, b3, b4] = branchesArbreC(ex);
  const branches = [`P(\\text{c}_1\\cap E)=${formatDecimalVirgule(b1)}`, `P(\\text{c}_1\\cap\\overline{E})=${formatDecimalVirgule(b2)}`, `P(\\text{c}_2\\cap E)=${formatDecimalVirgule(b3)}`, `P(\\text{c}_2\\cap\\overline{E})=${formatDecimalVirgule(b4)}`];
  if (phase === "cEcran2") return branches;
  return [...branches, `P(E)=${formatDecimalVirgule(probabiliteEffetC(ex))}`];
}

function aideNiveau1C(phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Chaque branche finale = P(cause) × P(effet ou son contraire | cette cause).", latex: null };
  if (phase === "cEcran2") return { texte: "Rappel de la formule des probabilités totales :", latex: "P(\\text{effet})=p\\cdot q_1+(1-p)\\cdot q_2" };
  return { texte: "Rappel de la formule de Bayes :", latex: "P(\\text{cause}|\\text{effet})=\\dfrac{P(\\text{effet}|\\text{cause})\\cdot P(\\text{cause})}{P(\\text{effet})}" };
}

function aideNiveau2C(ex: ExerciceFamilleC, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "cEcran1") {
    const p = formatDecimalVirgule(ex.p);
    const q1 = formatDecimalVirgule(ex.q1);
    return { texte: "Une branche complète (les 3 autres suivent le même principe) :", latex: `P(\\text{c}_1\\cap E)=${p}\\times ${q1}` };
  }
  if (phase === "cEcran2") {
    const p = formatDecimalVirgule(ex.p);
    const q1 = formatDecimalVirgule(ex.q1);
    const q2 = formatDecimalVirgule(ex.q2);
    return { texte: "Équation posée, valeurs connues substituées (calcul non fait) :", latex: `${p}\\times ${q1}+(1-${p})\\times ${q2}` };
  }
  const numerateur = ex.demandeEcran3 === "cause1SachantEffet" ? branchesArbreC(ex)[0] : branchesArbreC(ex)[1];
  const denominateur = ex.demandeEcran3 === "cause1SachantEffet" ? probabiliteEffetC(ex) : 1 - probabiliteEffetC(ex);
  return { texte: "Numérateur (branche concernée de l'arbre) et dénominateur (valeur de l'étape précédente), division non faite :", latex: `\\dfrac{${formatDecimalVirgule(numerateur)}}{${formatDecimalVirgule(denominateur)}}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceIndependanceBayes): string {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? consigneGeneraleAPannes(exercice) : consigneGeneraleAUnion(exercice);
  if (exercice.famille === "B") {
    if (exercice.sousType === "histogramme") return consigneGeneraleBHisto(exercice);
    if (exercice.sousType === "tableauDonne") return consigneGeneraleBTable(exercice);
    return consigneGeneraleBRecon(exercice);
  }
  return consigneGeneraleC(exercice);
}

export function blocDonnees(exercice: ExerciceIndependanceBayes): string[] {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? blocDonneesAPannes(exercice) : blocDonneesAUnion(exercice);
  if (exercice.famille === "B") {
    if (exercice.sousType === "histogramme") return blocDonneesBHisto(exercice);
    if (exercice.sousType === "tableauDonne") return blocDonneesBTable(exercice);
    return blocDonneesBRecon(exercice);
  }
  return blocDonneesC(exercice);
}

/** Table de données CONSTANTE affichée à côté de `blocDonnees` — `null` si la famille/sous-type
 * n'en a pas besoin (A, C : consigne + `blocDonnees` suffisent). */
export function tableauDonnees(exercice: ExerciceIndependanceBayes): TableauAffichage | null {
  if (exercice.famille !== "B") return null;
  if (exercice.sousType === "histogramme") return tableauHisto(exercice);
  if (exercice.sousType === "tableauDonne") return tableauBTable(exercice);
  return null;
}

export function consigneEcran(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): string {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? consigneEcranAPannes(exercice, phase) : consigneEcranAUnion(phase);
  if (exercice.famille === "B") {
    if (exercice.sousType === "histogramme") return consigneEcranBHisto(exercice, phase);
    if (exercice.sousType === "tableauDonne") return consigneEcranBTable(exercice);
    return consigneEcranBRecon(phase);
  }
  return consigneEcranC(phase);
}

export function etatActuel(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): string[] | null {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? etatActuelAPannes(exercice, phase) : etatActuelAUnion(exercice, phase);
  if (exercice.famille === "B") {
    if (exercice.sousType === "histogramme") return etatActuelBHisto(exercice, phase);
    return null;
  }
  return etatActuelC(exercice, phase);
}

/** Table "état actuel" (récap des cases déjà connues) — UNIQUEMENT pour "tableauReconstruire",
 * `null` sinon. */
export function tableauEtatActuel(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): TableauAffichage | null {
  if (exercice.famille !== "B" || exercice.sousType !== "tableauReconstruire") return null;
  return tableauEtatActuelBRecon(exercice, phase);
}

export function champsEcran(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): ChampDef[] {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? champsAPannes(phase) : champsAUnion(phase);
  if (exercice.famille === "B") {
    if (exercice.sousType === "histogramme") return champsBHisto(phase);
    if (exercice.sousType === "tableauDonne") return champsBTable();
    return champsBRecon(exercice, phase);
  }
  return champsC(exercice, phase);
}

export function aideNiveau1(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? aideNiveau1APannes(phase) : aideNiveau1AUnion(phase);
  if (exercice.famille === "B") {
    if (exercice.sousType === "histogramme") return aideNiveau1BHisto(phase);
    if (exercice.sousType === "tableauDonne") return aideNiveau1BTable();
    return aideNiveau1BRecon(phase);
  }
  return aideNiveau1C(phase);
}

export function aideNiveau2(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? aideNiveau2APannes(exercice, phase) : aideNiveau2AUnion(exercice, phase);
  if (exercice.famille === "B") {
    if (exercice.sousType === "histogramme") return aideNiveau2BHisto(exercice, phase);
    if (exercice.sousType === "tableauDonne") return aideNiveau2BTable(exercice);
    return aideNiveau2BRecon(exercice, phase);
  }
  return aideNiveau2C(exercice, phase);
}

export const LIBELLE_PHASE: Record<PhaseIndependanceBayes, string> = {
  aPannesEcran1: "Étape 1 (compléments)",
  aPannesEcran2: "Étape 2 (combinaison demandée)",
  aUnionEcran1: "Étape 1 (P(Ā))",
  aUnionEcran2: "Étape 2 (P(B) déduit)",
  aUnionEcran3: "Étape 3 (conditionnelles, raccourci d'indépendance)",
  bHistoEcran1: "Étape 1 (proportion d'interpolation)",
  bHistoEcran2: "Étape 2 (probabilité totale)",
  bTableEcran1: "Étape unique (lecture du tableau)",
  bReconEcran1: "Étape 1 (cases directement calculables)",
  bReconEcran2: "Étape 2 (cases déduites par différence)",
  bReconEcran3: "Étape 3 (lecture du tableau reconstruit)",
  cEcran1: "Étape 1 (arbre de probabilité)",
  cEcran2: "Étape 2 (probabilités totales)",
  cEcran3: "Étape 3 (théorème de Bayes)",
};

export const LIBELLE_FAMILLE_SOUS_TYPE: Record<string, string> = {
  "A-pannes": "A — Indépendance : pannes",
  "A-unionIndependance": "A — Indépendance : union",
  "B-histogramme": "B — Histogramme et interpolation",
  "B-tableauDonne": "B — Lecture d'un tableau donné",
  "B-tableauReconstruire": "B — Reconstruire un tableau",
  C: "C — Arbre et théorème de Bayes",
};

export function libelleFamilleSousType(exercice: ExerciceIndependanceBayes): string {
  if (exercice.famille === "C") return LIBELLE_FAMILLE_SOUS_TYPE.C;
  return LIBELLE_FAMILLE_SOUS_TYPE[`${exercice.famille}-${exercice.sousType}`];
}

/** Récapitulatif final — réponse CORRECTE de chaque écran, jamais recalculée depuis la saisie
 * élève (CLAUDE.md). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): string[] {
  if (exercice.famille === "A" && exercice.sousType === "pannes") {
    if (phase === "aPannesEcran1") return [`P(\\overline{A_1})=${formatDecimalVirgule(1 - exercice.p1)}`, `P(\\overline{A_2})=${formatDecimalVirgule(1 - exercice.p2)}`];
    return [`\\text{Réponse}=${formatDecimalVirgule(valeurEcran2Pannes(exercice))}`];
  }
  if (exercice.famille === "A" && exercice.sousType === "unionIndependance") {
    if (phase === "aUnionEcran1") return [`P(\\overline{A})=${formatDecimalVirgule(1 - exercice.pA)}`];
    if (phase === "aUnionEcran2") return [`P(B)=${formatDecimalVirgule(pBDeduitUnion(exercice))}`];
    return [`P(A|B)=${formatDecimalVirgule(exercice.pA)}`, `P(B|A)=${formatDecimalVirgule(pBDeduitUnion(exercice))}`];
  }
  if (exercice.famille === "B" && exercice.sousType === "histogramme") {
    if (phase === "bHistoEcran1") return [`\\text{Proportion}=${formatDecimalVirgule(proportionHistogramme(exercice))}`];
    return [`\\text{Réponse}=${formatDecimalVirgule(valeurEcran2Histogramme(exercice))}`];
  }
  if (exercice.famille === "B" && exercice.sousType === "tableauDonne") {
    return [`\\text{Réponse}=${formatDecimalVirgule(probabiliteDepuisTable(exercice.table, exercice.typeQuestion, exercice.ligneCible, exercice.colonneCible))}`];
  }
  if (exercice.famille === "B" && exercice.sousType === "tableauReconstruire") {
    if (phase === "bReconEcran1") {
      const [r0, r1, r2] = totauxLigneReconstruire(exercice);
      return [`R_1=${formatEntier(r0)}`, `R_2=${formatEntier(r1)}`, `R_3=${formatEntier(r2)}`, `\\text{Case 1}=${formatEntier(cellule00Reconstruire(exercice))}`, `\\text{Case 2}=${formatEntier(cellule10Reconstruire(exercice))}`];
    }
    const table = tableCompleteReconstruire(exercice);
    if (phase === "bReconEcran2") return [`\\text{Case 3}=${formatEntier(cellule20Reconstruire(exercice))}`, `\\text{Case 4}=${formatEntier(table.cellules[0][1])}`, `\\text{Case 5}=${formatEntier(table.cellules[1][1])}`, `\\text{Case 6}=${formatEntier(table.cellules[2][1])}`];
    return [`\\text{Réponse}=${formatDecimalVirgule(probabiliteDepuisTable(table, exercice.typeQuestionFinale, exercice.ligneCibleFinale, exercice.colonneCibleFinale))}`];
  }
  // Famille C.
  if (phase === "cEcran1") {
    const [b1, b2, b3, b4] = branchesArbreC(exercice);
    return [`P(c_1\\cap E)=${formatDecimalVirgule(b1)}`, `P(c_1\\cap\\overline{E})=${formatDecimalVirgule(b2)}`, `P(c_2\\cap E)=${formatDecimalVirgule(b3)}`, `P(c_2\\cap\\overline{E})=${formatDecimalVirgule(b4)}`];
  }
  if (phase === "cEcran2") return [`P(E)=${formatDecimalVirgule(probabiliteEffetC(exercice))}`];
  const libelleBayes = exercice.demandeEcran3 === "cause1SachantEffet" ? "P(c_1|E)" : "P(c_1|\\overline{E})";
  return [`${libelleBayes}=${formatDecimalVirgule(bayesEcran3C(exercice))}`];
}

/** Total points du récapitulatif final — maximum VARIABLE selon la famille/sous-type
 * (2 à 3 écrans × 100). */
export function calculerTotalPointsIndependanceBayes(resultat: ResultatExerciceIndependanceBayes): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
