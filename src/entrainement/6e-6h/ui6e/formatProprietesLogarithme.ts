import { arbreVersLatexLogA, calculerEtatsArgument, etatVersLatex, etatVersLatexAvecLogPendant, etatVersTexte, resteVersLatexLogA } from "../core6e/decompositionLogarithme";
import type { Noeud } from "../core6e/decompositionLogarithme";
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { PhaseProprietesLogarithme } from "../moteur6e/typesProprietesLogarithme";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen13`, REFONTE TOTALE : tout
 * dispatche maintenant sur `phase` (index numérique, voir `moteur6e/typesProprietesLogarithme.ts`)
 * ET sur la caractéristique RÉELLEMENT testée à cette phase (déduite de l'arbre de l'exercice, voir
 * `caracteristiqueDeLaPhase` ci-dessous) — jamais sur un `exercice.type` statique comme la version
 * précédente (il n'existe plus : un même exercice teste maintenant 3 ou 4 caractéristiques
 * successives, catalogue restreint — voir `generateurs6e/proprietesLogarithme/index.ts`). Exercice
 * PUREMENT SYMBOLIQUE : AUCUNE valeur numérique nulle part (ni dans les données affichées, ni dans
 * les réponses attendues, voir `core6e/proprietesLogarithme.types.ts`) — les lettres m/n/q/c ne sont
 * JAMAIS affichées seules (un bloc "données" qui ne ferait que les lister serait pure redondance
 * sans valeur à montrer) : elles n'apparaissent que DANS la phrase de consigne elle-même
 * (`consigneGenerale`), qui les introduit (`log_a(M)=m`, etc.) avant de demander l'expression en
 * fonction d'elles.
 *
 * **`log_a`/`log_b` en LaTeX, jamais en texte brut** : `consigneGenerale` et `consigneEcran`
 * renvoient un `FragmentConsigne[]` (texte brut mêlé à du LaTeX inline court, même contrat que
 * `ui/formatEquationDroite.ts` et son rendu `components/RenduFragments.tsx`) plutôt qu'une simple
 * `string` — tout `log_a(...)`/`log_b(...)` qui y apparaît est un fragment `latex`, jamais une
 * sous-chaîne littérale "log_a(...)" affichée telle quelle.
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

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`
 * (dupliqué ici à dessein, convention CLAUDE.md : un type aussi petit ne justifie pas un module
 * partagé) ; rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
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

/** Consigne générale — DYNAMIQUE : ne mentionne n/q/c que si l'exercice les utilise réellement.
 * Introduit CHAQUE lettre via l'égalité `log_a(...)=...` qui la définit (jamais une lettre non
 * introduite), puis demande l'expression en fonction de ces mêmes lettres — remplace l'ancien
 * couple "On donne : ... / Calcule : ..." par une seule phrase ("Sachant que ..., détermine en
 * fonction de ... l'expression suivante :"), le `blocDonnees` qui listait les lettres SEULES (sans
 * valeur à montrer) étant devenu une pure redondance avec cette phrase. */
export function consigneGenerale(exercice: ExerciceProprieteLogarithme): FragmentConsigne[] {
  const lettres = ["m"];
  const fragments: FragmentConsigne[] = [texte("Sachant que "), latex("\\log_a(M)=m")];
  if (exercice.avecN) {
    fragments.push(texte(", "), latex("\\log_a(N)=n"));
    lettres.push("n");
  }
  if (exercice.avecP) {
    fragments.push(texte(", "), latex("\\log_a(P)=q"));
    lettres.push("q");
  }
  if (exercice.avecChangementBase) {
    fragments.push(texte(", "), latex(`\\log_${exercice.b}(a)=c`));
    lettres.push("c");
  }
  fragments.push(texte(`, détermine en fonction de ${lettres.join(", ")} l'expression suivante :`));
  return fragments;
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

export function consigneEcran(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): FragmentConsigne[] {
  const caracteristique = caracteristiqueDeLaPhase(exercice, phase);
  if (caracteristique === "changementBase") {
    return [
      texte(`Applique la formule de changement de base à l'expression obtenue à l'étape précédente (nouvelle base ${exercice.b}). Utilise m, n, q (selon le cas) pour les termes déjà extraits, et c pour `),
      latex(`\\log_${exercice.b}(a)`),
      texte(` — jamais "`),
      latex("\\log_a(...)"),
      texte(`"/"`),
      latex(`\\log_${exercice.b}(...)`),
      texte(`" tels quels.`),
    ];
  }
  const etats = calculerEtatsArgument(exercice.arbre);
  const dejaExtraits = etats[phase].termes.length > 0;
  const rappelAnterieur = dejaExtraits ? " Garde les termes déjà extraits aux étapes précédentes (en m/n/q) et ajoute le résultat de cette nouvelle propriété." : "";
  return [
    texte(`Applique UNIQUEMENT la propriété du ${NOM_CARACTERISTIQUE[caracteristique]} du logarithme à l'expression ci-dessous (celle encore sous forme `),
    latex("\\log_a(...)"),
    texte(`, pas le reste déjà traité). Utilise m, n, q pour toute partie DÉJÀ extraite, et r pour toute partie ENCORE à décomposer (tu la décomposeras à une étape suivante) — jamais "`),
    latex("\\log_a(...)"),
    texte(`" tel quel.${rappelAnterieur}`),
  ];
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

