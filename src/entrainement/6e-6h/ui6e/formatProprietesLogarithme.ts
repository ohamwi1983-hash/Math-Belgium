import { arbreVersLatexLogA, calculerEtatsArgument, etatVersLatex, etatVersLatexAvecLogPendant, etatVersTexte, resteVersLatexLogA } from "../core6e/decompositionLogarithme";
import type { Noeud } from "../core6e/decompositionLogarithme";
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { PhaseProprietesLogarithme, ResultatExerciceProprietesLogarithme } from "../moteur6e/typesProprietesLogarithme";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen13`, REFONTE TOTALE : tout
 * dispatche maintenant sur `phase` (index numérique, voir `moteur6e/typesProprietesLogarithme.ts`)
 * ET sur la caractéristique RÉELLEMENT testée à cette phase (déduite de l'arbre de l'exercice, voir
 * `caracteristiqueDeLaPhase` ci-dessous) — jamais sur un `exercice.type` statique comme la version
 * précédente (il n'existe plus : un même exercice teste maintenant 1 à 4 caractéristiques
 * successives). Exercice PUREMENT SYMBOLIQUE : AUCUNE valeur numérique nulle part (ni dans les
 * données affichées, ni dans les réponses attendues, voir `core6e/proprietesLogarithme.types.ts`).
 *
 * **Convention de notation** (inchangée) : tant qu'une partie de l'expression n'est pas encore
 * substituée en m/n/q, le fragment LaTeX garde la notation `\log_a(...)` en toutes lettres
 * (`etatVersLatexAvecLogPendant`) ; dès que l'expression est celle que l'ÉLÈVE SAISIT réellement
 * (champ de réponse, récapitulatif), on bascule sur m/n/q/r littéraux (`etatVersLatex`) — jamais les
 * deux mélangées sur un même écran.
 */

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const NOM_CARACTERISTIQUE: Record<"produit" | "quotient" | "puissance" | "racine" | "changementBase", string> = {
  produit: "produit",
  quotient: "quotient",
  puissance: "puissance",
  racine: "racine",
  changementBase: "changement de base",
};

/** Caractéristique RÉELLEMENT testée à la phase donnée — déduite du nœud pelé à cette étape (ou
 * "changementBase" pour la dernière étape quand l'exercice l'inclut). */
function caracteristiqueDeLaPhase(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): "produit" | "quotient" | "puissance" | "racine" | "changementBase" {
  const etats = calculerEtatsArgument(exercice.arbre);
  const etapesArgument = etats.length - 1;
  if (phase < etapesArgument) return (etats[phase].reste as Noeud).kind as "produit" | "quotient" | "puissance" | "racine";
  return "changementBase";
}

/** Consigne générale — DYNAMIQUE : ne mentionne n/q/c que si l'exercice les utilise réellement. */
export function consigneGenerale(exercice: ExerciceProprieteLogarithme): string {
  const donnees = ["log_a(M) ≈ m"];
  if (exercice.avecN) donnees.push("log_a(N) ≈ n");
  if (exercice.avecP) donnees.push("log_a(P) ≈ q");
  if (exercice.avecChangementBase) donnees.push(`log_${exercice.b}(a) ≈ c`);
  return `On donne (base a jamais précisée, jamais calculée) : ${donnees.join(", ")}.`;
}

/** Bloc de données — les lettres RÉELLEMENT utilisées par cet exercice (m/n/q/c), SANS valeur
 * numérique : aucune n'existe (exercice purement symbolique), seul le symbole compte. Partagé par
 * l'écran interactif ET la feuille imprimable (`exportEvaluation.ts`). */
export function blocDonnees(exercice: ExerciceProprieteLogarithme): string[] {
  const symboles = ["m"];
  if (exercice.avecN) symboles.push("n");
  if (exercice.avecP) symboles.push("q");
  if (exercice.avecChangementBase) symboles.push("c");
  return symboles;
}

/** Expression logarithmique DEMANDÉE — l'arbre ENTIER, en notation M/N/P, INCHANGÉE sur tous les
 * écrans de l'exercice (c'est la question de départ, affichée une fois en haut). */
export function expressionDemandeeLatex(exercice: ExerciceProprieteLogarithme): string {
  return arbreVersLatexLogA(exercice.arbre);
}

export function libellePhase(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string {
  const caracteristique = caracteristiqueDeLaPhase(exercice, phase);
  return `Étape ${phase + 1} (${NOM_CARACTERISTIQUE[caracteristique]})`;
}

export function consigneEcran(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string {
  const caracteristique = caracteristiqueDeLaPhase(exercice, phase);
  if (caracteristique === "changementBase") {
    return `Applique la formule de changement de base à l'expression obtenue à l'étape précédente (nouvelle base ${exercice.b}). Utilise m, n, q (selon le cas) pour les termes déjà extraits, et c pour log_${exercice.b}(a) — jamais "log_a(...)"/"log_${exercice.b}(...)" tels quels.`;
  }
  const etats = calculerEtatsArgument(exercice.arbre);
  const dejaExtraits = etats[phase].termes.length > 0;
  const rappelAnterieur = dejaExtraits ? " Garde les termes déjà extraits aux étapes précédentes (en m/n/q) et ajoute le résultat de cette nouvelle propriété." : "";
  return `Applique UNIQUEMENT la propriété du ${NOM_CARACTERISTIQUE[caracteristique]} du logarithme à l'expression ci-dessous (celle encore sous forme log_a(...), pas le reste déjà traité). Utilise m, n, q pour toute partie DÉJÀ extraite, et r pour toute partie ENCORE à décomposer (tu la décomposeras à une étape suivante) — jamais "log_a(...)" tel quel.${rappelAnterieur}`;
}

/** Rappel "où en est-on" — `null` sur la toute première étape (rien à rappeler), sinon l'expression
 * déjà accumulée (en m/n/q + éventuellement "log_a(reste)" encore en toutes lettres, PAS "r" — ce
 * bloc est un RAPPEL de lecture, jamais la notation attendue dans le champ de réponse). */
export function etatActuel(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string[] | null {
  const etats = calculerEtatsArgument(exercice.arbre);
  const etapesArgument = etats.length - 1;
  if (phase === 0) return null;
  const etatAccumule = phase <= etapesArgument ? etats[phase] : etats[etapesArgument];
  const dejaRien = etatAccumule.termes.length === 0 && !etatAccumule.reste;
  if (dejaRien) return null;
  return [`\\text{Expression correcte : } ${etatVersLatexAvecLogPendant(etatAccumule)}`];
}

const RAPPEL_PROPRIETES: AideAvecLatex = {
  texte: "Rappel des propriétés du logarithme (sans indiquer laquelle s'applique ici) :",
  latex:
    "\\begin{gathered} \\log_a(X\\cdot Y)=\\log_a(X)+\\log_a(Y) \\\\[4pt] \\log_a\\!\\left(\\dfrac{X}{Y}\\right)=\\log_a(X)-\\log_a(Y) \\\\[4pt] \\log_a(X^{p})=p\\cdot\\log_a(X) \\\\[4pt] \\log_a(\\sqrt[k]{X})=\\dfrac{\\log_a(X)}{k} \\\\[4pt] \\log_a(X)=\\dfrac{\\log_b(X)}{\\log_b(a)} \\end{gathered}",
};

/** Niveau 1 CONSTANT (même rappel sur tous les écrans, aucun n'étant un calcul numérique à part). */
export function aideNiveau1(): AideAvecLatex {
  return RAPPEL_PROPRIETES;
}

export function aideNiveau2(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): AideAvecLatex {
  const caracteristique = caracteristiqueDeLaPhase(exercice, phase);
  const etats = calculerEtatsArgument(exercice.arbre);
  if (caracteristique === "changementBase") {
    const etatFinal = etats[etats.length - 1];
    return { texte: "Formule appliquée (facteur c non distribué) :", latex: `\\left(${etatVersLatex(etatFinal)}\\right)\\cdot c` };
  }
  const avant = resteVersLatexLogA(etats[phase]);
  return { texte: `La propriété du ${NOM_CARACTERISTIQUE[caracteristique]} s'applique à : `, latex: avant };
}

/** Réponse RÉELLEMENT attendue d'un écran donné (récapitulatif, texte élève) — jamais dérivée de la
 * saisie élève, toujours reconstruite depuis `exercice`. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string[] {
  const caracteristique = caracteristiqueDeLaPhase(exercice, phase);
  const etats = calculerEtatsArgument(exercice.arbre);
  const etapesArgument = etats.length - 1;
  if (caracteristique === "changementBase") {
    // Parenthèses INDISPENSABLES : sans elles, "n + m*c" se lit (en texte comme en mathématiques)
    // "n + (m*c)", pas "(n+m)*c" — bug trouvé par auto-vérification (la réponse "correcte" générée
    // ici, réinjectée dans `diagnostiquerEcran`, était rejetée) : la fonction de référence
    // (`referenceEcranAlgebrique`) multipliait déjà correctement la somme ENTIÈRE par c, seul ce
    // texte-ci oubliait l'équivalent algébrique de cette parenthèse.
    return [`(${etatVersTexte(etats[etapesArgument])})*c`];
  }
  return [etatVersTexte(etats[phase + 1])];
}

/** Total points du récapitulatif final — COMPLÉMENT de `LigneRecap`/`statutRecap`, jamais un
 * remplacement (CLAUDE.md). Maximum VARIABLE selon le nombre d'écrans de l'exercice (1 à 5
 * caractéristiques), contrairement à l'ancienne version (toujours 200). */
export function calculerTotalPointsProprietesLogarithme(resultat: ResultatExerciceProprietesLogarithme): { total: number; maximum: number } {
  const total = resultat.scores.reduce((s, v) => s + v, 0);
  return { total, maximum: resultat.scores.length * 100 };
}
