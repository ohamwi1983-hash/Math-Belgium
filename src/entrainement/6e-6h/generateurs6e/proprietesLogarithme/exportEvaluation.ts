import type { ExerciceProprieteLogarithme } from "../../core6e/proprietesLogarithme.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  ErreurFrequente,
  EtapeAmenagee,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { Caracteristique } from "../../core6e/decompositionLogarithme";
import { arbreVersLatexLogA, calculerEtatsArgument, etatVersLatex, resteVersLatexLogA } from "../../core6e/decompositionLogarithme";
import { caracteristiqueDeLEtape, nombreEtapesAlgebriques } from "../../moteur6e/typesProprietesLogarithme";
import {
  FORMULE_PROPRIETE,
  consigneEcriteEtape,
  consigneGenerale,
  expressionDemandeeLatex,
  formatReponseAttenduePhaseLatex,
  membreGaucheCorrigeLatex,
  nomProprieteDeLEtape,
  phaseTransformationDeLEtape,
} from "../../ui6e/formatProprietesLogarithme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesLogarithme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProprieteLogarithme>` pour `6gen13` (Propriétés du
 * logarithme) — feuille d'évaluation, REFONTE TOTALE : le nombre de questions par instance n'est
 * plus FIXE (2) mais dépend de la combinaison de caractéristiques tirée (3 ou 4 étapes algébriques,
 * voir `moteur6e/typesProprietesLogarithme.ts::nombreEtapesAlgebriques`) — boucle sur tous les écrans
 * plutôt que 2 appels écrits en dur, réutilise directement les textes/formats déjà écrits côté écran
 * interactif (`consigneEcran`, `aideNiveau2`, `formatReponseAttenduePhaseLatex`), jamais recalculés
 * indépendamment. Exercice PUREMENT SYMBOLIQUE : AUCUNE question numérique finale, toutes les
 * questions ont la même forme "étape intermédiaire".
 */

function construireEnonceProprietesLogarithme(exercice: ExerciceProprieteLogarithme): SectionExercice {
  const total = nombreEtapesAlgebriques(exercice);
  return {
    enteteFragments: [...consigneGenerale(exercice), texte(" "), latex(expressionDemandeeLatex(exercice)), texte(".")],
    questions: Array.from({ length: total }, (_, etape) => ({ consigne: consigneEcriteEtape(exercice, etape), reponse: { type: "lignes" as const, nombre: 2 } })),
  };
}

function construireCorrectionProprietesLogarithme(exercice: ExerciceProprieteLogarithme): BlocCorrection[] {
  const total = nombreEtapesAlgebriques(exercice);
  return Array.from({ length: total }, (_, etape) => {
    const lettre = String.fromCharCode(97 + etape); // a), b), c)...
    return {
      type: "paragraphe" as const,
      fragments: [
        texte(`${lettre}) ${nomProprieteDeLEtape(exercice, etape)} : `),
        latex(membreGaucheCorrigeLatex(exercice, etape)),
        texte(" = "),
        latex(formatReponseAttenduePhaseLatex(exercice, phaseTransformationDeLEtape(exercice, etape))[0]),
        texte("."),
      ],
    };
  });
}

// ============================================================================
// Feuilles enrichies (corrigé détaillé, barème, version aménagée) — tout est RECALCULÉ depuis
// l'instance avec les MÊMES fonctions que `construireCorrection` et que l'écran interactif
// (`membreGaucheCorrigeLatex`, `formatReponseAttenduePhaseLatex`) : jamais de seconde source.
// ============================================================================

const OPERATION_EXTERIEURE: Record<Exclude<Caracteristique, "changementBase">, string> = {
  produit: "un produit",
  quotient: "un quotient",
  puissance: "une puissance",
  racine: "une racine",
};

function lettreEtape(etape: number): string {
  return String.fromCharCode(97 + etape);
}

/** Réponse attendue de l'étape algébrique `etape` (LaTeX), identique au corrigé historique. */
function reponseEtapeLatex(exercice: ExerciceProprieteLogarithme, etape: number): string {
  return formatReponseAttenduePhaseLatex(exercice, phaseTransformationDeLEtape(exercice, etape))[0];
}

/** `\log_b(...)` de l'arbre entier (même rendu que l'écran, voir `formatProprietesLogarithme.ts`). */
function logBLatex(exercice: ExerciceProprieteLogarithme): string {
  return arbreVersLatexLogA(exercice.arbre).replace("\\log_a", `\\log_${exercice.b}`);
}

/** Expression finale en m, n, q (argument entièrement décomposé). */
function expressionFinaleLatex(exercice: ExerciceProprieteLogarithme): string {
  const etats = calculerEtatsArgument(exercice.arbre);
  return etatVersLatex(etats[etats.length - 1]);
}

/** Caractéristiques testées, dans l'ordre des étapes. */
function caracteristiquesDesEtapes(exercice: ExerciceProprieteLogarithme): Caracteristique[] {
  return Array.from({ length: nombreEtapesAlgebriques(exercice) }, (_, etape) => caracteristiqueDeLEtape(exercice, etape));
}

/** Vrai si un produit/quotient est pelé ALORS qu'un coefficient (p ou 1/k) attend déjà devant le
 * reste — l'élève doit alors distribuer ce coefficient sur les DEUX termes. */
function coefficientADistribuer(exercice: ExerciceProprieteLogarithme): boolean {
  const etats = calculerEtatsArgument(exercice.arbre);
  return etats.slice(0, -1).some((etat) => (etat.reste?.kind === "produit" || etat.reste?.kind === "quotient") && !(etat.coefficientReste.num === 1 && etat.coefficientReste.den === 1));
}

function reponseBreveProprietesLogarithme(exercice: ExerciceProprieteLogarithme): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = [latex(`${arbreVersLatexLogA(exercice.arbre)} = ${expressionFinaleLatex(exercice)}`)];
  if (exercice.avecChangementBase) {
    fragments.push(texte(" ; "), latex(`${logBLatex(exercice)} = ${reponseEtapeLatex(exercice, nombreEtapesAlgebriques(exercice) - 1)}`));
  }
  return fragments;
}

function difficulteProprietesLogarithme(exercice: ExerciceProprieteLogarithme): 1 | 2 | 3 {
  // 3 propriétés d'argument sans changement de base : plusieurs étapes routinières ; 4 étapes, ou
  // un changement de base (il faut réutiliser tout le résultat précédent), demandent davantage.
  return nombreEtapesAlgebriques(exercice) >= 4 || exercice.avecChangementBase ? 3 : 2;
}

function piegeProprietesLogarithme(exercice: ExerciceProprieteLogarithme): FragmentConsigne[] {
  const presentes = caracteristiquesDesEtapes(exercice);
  if (coefficientADistribuer(exercice)) {
    return [texte("Un coefficient déjà sorti (exposant p ou 1/k) multiplie TOUT ce qui reste : quand on décompose ensuite le produit ou le quotient, il s'applique aux deux termes, pas seulement au premier.")];
  }
  if (presentes.includes("changementBase")) {
    return [texte("On multiplie TOUTE l'expression obtenue en base a par "), latex(`c=\\log_${exercice.b}(a)`), texte(" — pas par "), latex(`\\log_a(${exercice.b})`), texte(", et pas seulement le premier terme.")];
  }
  if (presentes.includes("racine")) {
    return [texte("La racine k-ième est une puissance 1/k : on DIVISE le logarithme par k, on ne le multiplie pas.")];
  }
  if (presentes.includes("quotient")) {
    return [texte("Le logarithme d'un quotient est une DIFFÉRENCE : "), latex("\\log_a\\!\\left(\\dfrac{X}{Y}\\right)\\neq\\dfrac{\\log_a(X)}{\\log_a(Y)}"), texte(".")];
  }
  return [texte("Le logarithme d'un produit est une SOMME : "), latex("\\log_a(X\\cdot Y)\\neq\\log_a(X)\\cdot\\log_a(Y)"), texte(".")];
}

function correctionDetailleeProprietesLogarithme(exercice: ExerciceProprieteLogarithme): EtapeCorrection[] {
  const etats = calculerEtatsArgument(exercice.arbre);
  const etapes: EtapeCorrection[] = [];
  const total = nombreEtapesAlgebriques(exercice);
  for (let etape = 0; etape < total; etape++) {
    const sousQuestion = lettreEtape(etape);
    const caracteristique = caracteristiqueDeLEtape(exercice, etape);
    const calcul = [latex(`${membreGaucheCorrigeLatex(exercice, etape)} = ${reponseEtapeLatex(exercice, etape)}`)];
    if (caracteristique === "changementBase") {
      etapes.push({ label: "Méthode", sousQuestion, fragments: [texte("Changement de base, appliqué à l'expression entière : "), latex(FORMULE_PROPRIETE.changementBase), texte(", avec "), latex(`\\log_${exercice.b}(a)=c`), texte(".")] });
      etapes.push({ label: "Calcul", sousQuestion, fragments: [latex(`${logBLatex(exercice)} = ${arbreVersLatexLogA(exercice.arbre)}\\cdot\\log_${exercice.b}(a)`), texte(", donc "), ...calcul] });
      continue;
    }
    etapes.push({
      label: "Méthode",
      sousQuestion,
      fragments: [
        texte("L'opération la plus extérieure de "),
        latex(resteVersLatexLogA(etats[etape]) ?? arbreVersLatexLogA(exercice.arbre)),
        texte(` est ${OPERATION_EXTERIEURE[caracteristique]} : ${nomProprieteDeLEtape(exercice, etape).toLowerCase()}, `),
        latex(FORMULE_PROPRIETE[caracteristique]),
        texte("."),
      ],
    });
    etapes.push({ label: "Calcul", sousQuestion, fragments: calcul });
  }
  const conclusion: FragmentConsigne[] = [latex(`${arbreVersLatexLogA(exercice.arbre)} = ${expressionFinaleLatex(exercice)}`)];
  if (exercice.avecChangementBase) conclusion.push(texte(" et "), latex(`${logBLatex(exercice)} = ${reponseEtapeLatex(exercice, total - 1)}`));
  etapes.push({ label: "Conclusion", fragments: [...conclusion, texte(".")] });
  etapes.push({ label: "Piège", fragments: piegeProprietesLogarithme(exercice) });
  return etapes;
}

function erreursFrequentesProprietesLogarithme(exercice: ExerciceProprieteLogarithme): ErreurFrequente[] {
  const presentes = caracteristiquesDesEtapes(exercice);
  const erreurs: ErreurFrequente[] = [];
  if (coefficientADistribuer(exercice)) {
    erreurs.push({ description: [texte("Coefficient (p ou 1/k) appliqué à un seul des deux termes du produit ou du quotient")], cout: "−0,5 sur l'étape" });
  }
  if (presentes.includes("racine")) {
    erreurs.push({ description: [texte("Racine k-ième traduite par « multiplier par k » au lieu de « diviser par k »")], cout: "0 pt sur l'étape" });
  }
  if (presentes.includes("changementBase")) {
    erreurs.push({ description: [texte("Multiplication par "), latex(`\\log_a(${exercice.b})`), texte(" (ou division par c) au lieu de la multiplication par c")], cout: "0 pt sur l'étape" });
  }
  if (presentes.includes("quotient") && erreurs.length < 3) {
    erreurs.push({ description: [texte("Logarithme d'un quotient écrit comme un quotient de logarithmes")], cout: "0 pt sur l'étape" });
  }
  if (presentes.includes("produit") && erreurs.length < 3) {
    erreurs.push({ description: [texte("Logarithme d'un produit écrit comme un produit de logarithmes")], cout: "0 pt sur l'étape" });
  }
  return erreurs.slice(0, 3);
}

function baremeProprietesLogarithme(exercice: ExerciceProprieteLogarithme): BaremeExercice {
  const total = nombreEtapesAlgebriques(exercice);
  // 1 point par étape (3 ou 4 étapes) : chaque propriété reconnue ET correctement appliquée.
  const criteres: CritereBareme[] = Array.from({ length: total }, (_, etape) => ({
    sousQuestion: lettreEtape(etape),
    critere: [texte(`${nomProprieteDeLEtape(exercice, etape)} : `), latex(`${membreGaucheCorrigeLatex(exercice, etape)} = ${reponseEtapeLatex(exercice, etape)}`)],
    points: 1,
  }));
  const acceptees: FragmentConsigne[][] = [[texte("Termes écrits dans un autre ordre, ou coefficient non simplifié (ex. "), latex("\\dfrac{2}{4}"), texte(" pour "), latex("\\dfrac{1}{2}"), texte(")")]];
  if (exercice.avecChangementBase) acceptees.push([texte("Au changement de base, la forme développée (chaque terme multiplié par c)")]);
  else acceptees.push([texte("Une étape « r » écrite directement avec "), latex("\\log_a(\\dots)"), texte(" si le calcul est juste")]);
  return { reponseFinale: reponseBreveProprietesLogarithme(exercice), criteres, erreursFrequentes: erreursFrequentesProprietesLogarithme(exercice), reponsesAcceptees: acceptees };
}

function enonceAmenageProprietesLogarithme(exercice: ExerciceProprieteLogarithme): EtapeAmenagee[] {
  const etats = calculerEtatsArgument(exercice.arbre);
  const total = nombreEtapesAlgebriques(exercice);
  return Array.from({ length: total }, (_, etape): EtapeAmenagee => {
    if (caracteristiqueDeLEtape(exercice, etape) === "changementBase") {
      return {
        consigne: [texte("Exprime "), latex(logBLatex(exercice)), texte(" à l'aide du résultat de l'étape précédente et de c.")],
        rappel: [texte("Changement de base : "), latex(FORMULE_PROPRIETE.changementBase), texte(" ; ici "), latex(`\\log_${exercice.b}(a)=c`), texte(".")],
        points: 1,
      };
    }
    const reste = resteVersLatexLogA(etats[etape]) ?? arbreVersLatexLogA(exercice.arbre);
    return {
      consigne: [texte("Transforme "), latex(reste), texte(" avec UNE propriété du logarithme.")],
      rappel:
        etape === 0
          ? [texte("Cherche l'opération qu'on ferait en dernier en calculant l'argument. Écris m, n, q pour ce qui est extrait, r pour ce qui reste.")]
          : [texte("Garde les termes déjà obtenus. Un coefficient devant le logarithme multiplie tout ce qui en sort.")],
      points: 1,
    };
  });
}

export const adaptateurEvaluationProprietesLogarithme: AdaptateurFeuilleExercices<ExerciceProprieteLogarithme> = {
  titreDocument: "Propriétés du logarithme — Évaluation",
  nomFichierBase: "proprietes-logarithme",
  genererInstance: genererExerciceProprietesLogarithme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceProprietesLogarithme,
  construireCorrection: construireCorrectionProprietesLogarithme,
  difficulte: difficulteProprietesLogarithme,
  reponseBreve: reponseBreveProprietesLogarithme,
  correctionDetaillee: correctionDetailleeProprietesLogarithme,
  bareme: baremeProprietesLogarithme,
  enonceAmenage: enonceAmenageProprietesLogarithme,
  dureeMinutes: 7,
  // Nombre de questions VARIABLE par instance (3 ou 4, selon la combinaison tirée) et consigne de
  // chaque écran dépendante de la caractéristique réellement testée — ni "1 seule question", ni
  // "consigne générique" : `regroupable` reste absent (voir `AdaptateurFeuilleExercices.regroupable`).
};
