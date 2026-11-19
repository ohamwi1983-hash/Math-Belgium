import type { ExerciceProprieteLogarithme } from "../../core6e/proprietesLogarithme.types";
import type {
  AdaptateurFeuilleExercices, EnoncePapier,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { Caracteristique } from "../../core6e/decompositionLogarithme";
import { arbreVersLatexLogA, calculerEtatsArgument, etatVersLatex } from "../../core6e/decompositionLogarithme";
import { caracteristiqueDeLEtape, nombreEtapesAlgebriques } from "../../moteur6e/typesProprietesLogarithme";
import {
  consigneEcriteEtape,
  regleNotationEcrite,
  consigneGenerale,
  expressionDemandeeLatex,
  formatReponseAttenduePhaseLatex,
  membreGaucheCorrigeLatex,
  nomProprieteDeLEtape,
  phaseTransformationDeLEtape,
} from "../../ui6e/formatProprietesLogarithme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesLogarithme } from "./index";
import { correctionDetailleeProprietesLogarithme } from "./corrigeDetaille";

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
    enteteFragments: [...consigneGenerale(exercice), texte(" "), latex(expressionDemandeeLatex(exercice)), texte(". "), ...regleNotationEcrite()],
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
// Feuilles enrichies (corrigé détaillé, barème) — tout est RECALCULÉ depuis
// l'instance avec les MÊMES fonctions que `construireCorrection` et que l'écran interactif
// (`membreGaucheCorrigeLatex`, `formatReponseAttenduePhaseLatex`) : jamais de seconde source.
// ============================================================================


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

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceProprieteLogarithme): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeProprietesLogarithme(e)), methode: 0, piege: 0 };
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

/** Énoncé PAPIER (feuille d'exercices, évaluation) : l'énoncé et la consigne globale seulement.
 * Les sous-questions de `construireEnonce` sont les étapes d'apprentissage du générateur
 * interactif : sur papier, elles passent dans le corrigé (voir `EnoncePapier`). */
function enoncePapierProprietesLogarithme(exercice: ExerciceProprieteLogarithme): EnoncePapier {
  return { section: { enteteFragments: [...consigneGenerale(exercice), texte(" "), latex(expressionDemandeeLatex(exercice)), texte(".")], questions: [] } };
}

export const adaptateurEvaluationProprietesLogarithme: AdaptateurFeuilleExercices<ExerciceProprieteLogarithme> = {
  titreDocument: "Propriétés du logarithme — Évaluation",
  nomFichierBase: "proprietes-logarithme",
  genererInstance: genererExerciceProprietesLogarithme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceProprietesLogarithme,
  construireCorrection: construireCorrectionProprietesLogarithme,
  criteresDifficulte,
  reponseBreve: reponseBreveProprietesLogarithme,
  correctionDetaillee: correctionDetailleeProprietesLogarithme,
  bareme: baremeProprietesLogarithme,
  enoncePapier: enoncePapierProprietesLogarithme,
  // Nombre de questions VARIABLE par instance (3 ou 4, selon la combinaison tirée) et consigne de
  // chaque écran dépendante de la caractéristique réellement testée — ni "1 seule question", ni
  // "consigne générique" : `regroupable` reste absent (voir `AdaptateurFeuilleExercices.regroupable`).
};
