import { arbreVersLatexLogA, calculerEtatsArgument, etatVersLatex, etatVersLatexAvecLogPendant, etatVersTexte, resteVersLatexLogA } from "../core6e/decompositionLogarithme";
import type { Caracteristique, EtatDecomposition } from "../core6e/decompositionLogarithme";
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import { caracteristiqueDeLEtape, ecranDeLaPhase, sequenceEcrans } from "../moteur6e/typesProprietesLogarithme";
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

const NOM_CARACTERISTIQUE: Record<Caracteristique, string> = {
  produit: "produit",
  quotient: "quotient",
  puissance: "puissance",
  racine: "racine",
  changementBase: "changement de base",
};

/** Libellé d'une propriété avec son article (« propriété du produit », « … de la puissance »). */
function nomPropriete(caracteristique: Caracteristique): string {
  if (caracteristique === "puissance" || caracteristique === "racine") return `propriété de la ${NOM_CARACTERISTIQUE[caracteristique]}`;
  return `propriété du ${NOM_CARACTERISTIQUE[caracteristique]}`;
}

/** Options de l'écran de choix (décision K1) — TOUJOURS les 5, dans un ordre fixe, quel que soit
 * l'exercice : proposer seulement les propriétés présentes trahirait la structure de l'argument. */
export const OPTIONS_PROPRIETES: readonly { id: Caracteristique; label: string }[] = [
  { id: "produit", label: "Produit" },
  { id: "quotient", label: "Quotient" },
  { id: "puissance", label: "Puissance" },
  { id: "racine", label: "Racine" },
  { id: "changementBase", label: "Changement de base" },
];

export const FORMULE_PROPRIETE: Record<Caracteristique, string> = {
  produit: "\\log_a(X\\cdot Y)=\\log_a(X)+\\log_a(Y)",
  quotient: "\\log_a\\!\\left(\\dfrac{X}{Y}\\right)=\\log_a(X)-\\log_a(Y)",
  puissance: "\\log_a(X^{p})=p\\cdot\\log_a(X)",
  racine: "\\log_a(\\sqrt[k]{X})=\\dfrac{\\log_a(X)}{k}",
  changementBase: "\\log_b(X)=\\log_a(X)\\cdot\\log_b(a)",
};

function lettresUtilisees(exercice: ExerciceProprieteLogarithme): string[] {
  const lettres = ["m"];
  if (exercice.avecN) lettres.push("n");
  if (exercice.avecP) lettres.push("q");
  return lettres;
}

function listeLettres(lettres: string[]): string {
  return lettres.length === 1 ? lettres[0] : `${lettres.slice(0, -1).join(", ")} et ${lettres[lettres.length - 1]}`;
}

/** `\log_b(...)` de l'arbre entier — l'expression finale demandée quand l'exercice inclut le
 * changement de base. */
function arbreVersLatexLogB(exercice: ExerciceProprieteLogarithme): string {
  return arbreVersLatexLogA(exercice.arbre).replace("\\log_a", `\\log_${exercice.b}`);
}

/** Consigne générale — DYNAMIQUE : ne mentionne n/q/c que si l'exercice les utilise réellement.
 * Introduit CHAQUE lettre via l'égalité `log_a(...)=...` qui la définit, puis dit ce qu'on cherche
 * — avec changement de base, explicitement `log_a(...)` PUIS `log_b(...)` (avant l'audit 6e ch.3, la
 * consigne ne demandait que `log_a(...)` et le dernier écran attendait `log_b(...)` sans le nommer). */
export function consigneGenerale(exercice: ExerciceProprieteLogarithme): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = [texte("Sachant que "), latex("\\log_a(M)=m")];
  if (exercice.avecN) fragments.push(texte(", "), latex("\\log_a(N)=n"));
  if (exercice.avecP) fragments.push(texte(", "), latex("\\log_a(P)=q"));
  const lettres = lettresUtilisees(exercice);
  if (exercice.avecChangementBase) {
    fragments.push(
      texte(" et "),
      latex(`\\log_${exercice.b}(a)=c`),
      texte(`, exprime d'abord la première expression en fonction de ${listeLettres(lettres)}, puis la seconde en fonction de ${listeLettres([...lettres, "c"])} :`),
    );
    return fragments;
  }
  fragments.push(texte(`, exprime en fonction de ${listeLettres(lettres)} l'expression suivante :`));
  return fragments;
}

/** Expression(s) DEMANDÉE(S) — l'arbre ENTIER, en notation M/N/P, INCHANGÉE sur tous les écrans de
 * l'exercice ; suivie de `log_b(...)` quand l'exercice inclut le changement de base. */
export function expressionDemandeeLatex(exercice: ExerciceProprieteLogarithme): string {
  const logA = arbreVersLatexLogA(exercice.arbre);
  return exercice.avecChangementBase ? `${logA} \\quad\\text{puis}\\quad ${arbreVersLatexLogB(exercice)}` : logA;
}

export function libellePhase(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string {
  const ecran = ecranDeLaPhase(exercice, phase);
  if (ecran.kind === "choix") return `Étape ${ecran.etape + 1} — propriété à appliquer`;
  return `Étape ${ecran.etape + 1} (${NOM_CARACTERISTIQUE[caracteristiqueDeLEtape(exercice, ecran.etape)]})`;
}

/** Ce qui reste à transformer à l'étape `etape`, en `\log_a(...)` (notation M/N/P). */
function resteDeLEtape(exercice: ExerciceProprieteLogarithme, etape: number): string {
  const etats = calculerEtatsArgument(exercice.arbre);
  return resteVersLatexLogA(etats[etape]) ?? arbreVersLatexLogA(exercice.arbre);
}

/** Consigne de l'écran — ne nomme JAMAIS la propriété à appliquer (décision K1 : la reconnaître est
 * le travail de l'écran de choix qui précède chaque transformation d'argument). */
export function consigneEcran(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): FragmentConsigne[] {
  const ecran = ecranDeLaPhase(exercice, phase);
  const caracteristique = caracteristiqueDeLEtape(exercice, ecran.etape);
  if (ecran.kind === "choix") {
    return [texte("Quelle propriété du logarithme dois-tu appliquer en premier à "), latex(resteDeLEtape(exercice, ecran.etape)), texte(" ?")];
  }
  if (caracteristique === "changementBase") {
    return [
      texte("Exprime "),
      latex(arbreVersLatexLogB(exercice)),
      texte(` en fonction de ${listeLettres([...lettresUtilisees(exercice), "c"])}, à partir de l'expression de `),
      latex(arbreVersLatexLogA(exercice.arbre)),
      texte(" obtenue à l'étape précédente (c remplace "),
      latex(`\\log_${exercice.b}(a)`),
      texte(")."),
    ];
  }
  const etats = calculerEtatsArgument(exercice.arbre);
  const dejaExtraits = etats[ecran.etape].termes.length > 0;
  const rappelAnterieur = dejaExtraits ? " Garde les termes déjà extraits aux étapes précédentes (en m, n, q) et ajoute le résultat de cette nouvelle propriété." : "";
  return [
    texte("Applique cette propriété à "),
    latex(resteDeLEtape(exercice, ecran.etape)),
    texte(". Écris m, n, q pour toute partie DÉJÀ extraite et r pour le logarithme de la partie ENCORE à décomposer (tu la décomposeras à une étape suivante) — jamais « "),
    latex("\\log_a(\\dots)"),
    texte(` » tel quel.${rappelAnterieur}`),
  ];
}

function etatAccumuleDeLEtape(exercice: ExerciceProprieteLogarithme, etape: number): EtatDecomposition {
  const etats = calculerEtatsArgument(exercice.arbre);
  const etapesArgument = etats.length - 1;
  return etape <= etapesArgument ? etats[etape] : etats[etapesArgument];
}

/** Rappel "où en est-on" — `null` sur la toute première étape (rien à rappeler), sinon l'expression
 * déjà accumulée (en m/n/q + éventuellement "log_a(reste)" encore en toutes lettres, PAS "r" — ce
 * bloc est un RAPPEL de lecture, jamais la notation attendue dans le champ de réponse). */
export function etatActuel(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string[] | null {
  const { etape } = ecranDeLaPhase(exercice, phase);
  if (etape === 0) return null;
  const etatAccumule = etatAccumuleDeLEtape(exercice, etape);
  if (etatAccumule.termes.length === 0 && !etatAccumule.reste) return null;
  return [`${arbreVersLatexLogA(exercice.arbre)} = ${etatVersLatexAvecLogPendant(etatAccumule)}`];
}

const RAPPEL_PROPRIETES: AideAvecLatex = {
  texte: "Rappel des propriétés du logarithme (sans indiquer laquelle s'applique ici) :",
  latex: `\\begin{gathered} ${(["produit", "quotient", "puissance", "racine"] as const).map((c) => FORMULE_PROPRIETE[c]).join(" \\\\[4pt] ")} \\\\[4pt] \\log_a(X)=\\dfrac{\\log_b(X)}{\\log_b(a)} \\end{gathered}`,
};

/** Niveau 1 CONSTANT (même rappel sur tous les écrans). */
export function aideNiveau1(): AideAvecLatex {
  return RAPPEL_PROPRIETES;
}

/** Niveau 2 — ne donne jamais la réponse de l'écran : sur un choix, la méthode pour reconnaître la
 * propriété (sans la nommer) ; sur une transformation, la SEULE formule utile, non substituée. */
export function aideNiveau2(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): AideAvecLatex {
  const ecran = ecranDeLaPhase(exercice, phase);
  if (ecran.kind === "choix") {
    return {
      texte:
        "Repère l'opération qu'on effectuerait EN DERNIER si l'on calculait l'argument (la plus « extérieure » : un produit, un quotient, une puissance ou une racine qui porte sur tout le reste). C'est elle que le logarithme « défait » en premier.",
      latex: null,
    };
  }
  const caracteristique = caracteristiqueDeLEtape(exercice, ecran.etape);
  if (caracteristique === "changementBase") {
    return { texte: "Formule du changement de base, à appliquer à l'expression entière (X désigne tout l'argument) :", latex: FORMULE_PROPRIETE.changementBase };
  }
  return { texte: "Formule de la propriété à appliquer ici (X et Y, p ou k sont à lire sur l'expression) :", latex: FORMULE_PROPRIETE[caracteristique] };
}

/** Réponse RÉELLEMENT attendue d'un écran donné, en LaTeX (réponse révélée, récapitulatif, fiche,
 * corrigé exporté) — jamais dérivée de la saisie élève, toujours reconstruite depuis `exercice`.
 * Plus jamais la syntaxe de saisie (`(1/2)*m`) affichée telle quelle (audit 6e ch.3). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string[] {
  const ecran = ecranDeLaPhase(exercice, phase);
  const caracteristique = caracteristiqueDeLEtape(exercice, ecran.etape);
  if (ecran.kind === "choix") return [`\\text{${nomProprieteDeLEtape(exercice, ecran.etape)}}`];
  const etats = calculerEtatsArgument(exercice.arbre);
  const etapesArgument = etats.length - 1;
  if (caracteristique === "changementBase") {
    // Parenthèses dès qu'il y a plusieurs termes : sans elles, "n + m·c" se lirait "n + (m·c)".
    const etatFinal = etats[etapesArgument];
    const v = etatVersLatex(etatFinal);
    return [etatFinal.termes.length > 1 ? `\\left(${v}\\right)\\cdot c` : `${v}\\cdot c`];
  }
  return [etatVersLatex(etats[ecran.etape + 1])];
}

/** Même réponse en SYNTAXE DE SAISIE (`(1/2)*m`) — jamais affichée : sert aux contrôles
 * automatiques (la réponse de référence réinjectée dans `diagnostiquerEcran` doit être acceptée).
 * Pour un écran de choix, l'identifiant de la caractéristique attendue. */
export function reponseAttenduePhaseTexte(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): string {
  const ecran = ecranDeLaPhase(exercice, phase);
  const caracteristique = caracteristiqueDeLEtape(exercice, ecran.etape);
  if (ecran.kind === "choix") return caracteristique;
  const etats = calculerEtatsArgument(exercice.arbre);
  if (caracteristique === "changementBase") return `(${etatVersTexte(etats[etats.length - 1])})*c`;
  return etatVersTexte(etats[ecran.etape + 1]);
}

/** Membre de gauche du corrigé d'une étape algébrique : l'expression accumulée AVANT l'étape (avec
 * la partie encore à décomposer en `\log_a(...)`), ou `log_b(...)` pour le changement de base —
 * jamais le seul « reste » (l'égalité « reste = expression accumulée » était fausse dès la 2e étape). */
export function membreGaucheCorrigeLatex(exercice: ExerciceProprieteLogarithme, etape: number): string {
  if (caracteristiqueDeLEtape(exercice, etape) === "changementBase") return arbreVersLatexLogB(exercice);
  return etatVersLatexAvecLogPendant(etatAccumuleDeLEtape(exercice, etape));
}

/** Index d'ÉCRAN de la transformation de l'étape algébrique `etape` (dans `sequenceEcrans`). */
export function phaseTransformationDeLEtape(exercice: ExerciceProprieteLogarithme, etape: number): PhaseProprietesLogarithme {
  return sequenceEcrans(exercice).findIndex((e) => e.kind === "transformation" && e.etape === etape);
}

/** Consigne d'une étape sur la FEUILLE papier (export) : pas d'écran de choix séparé, l'élève
 * identifie la propriété puis l'applique, sur la même question (décision K1 : jamais nommée). */
export function consigneEcriteEtape(exercice: ExerciceProprieteLogarithme, etape: number): FragmentConsigne[] {
  if (caracteristiqueDeLEtape(exercice, etape) === "changementBase") return consigneEcran(exercice, phaseTransformationDeLEtape(exercice, etape));
  const ecran = sequenceEcrans(exercice)[phaseTransformationDeLEtape(exercice, etape)];
  return [texte("Quelle propriété appliques-tu en premier à "), latex(resteDeLEtape(exercice, ecran.etape)), texte(" ? Applique-la.")];
}

/** Règle de notation de la feuille papier — énoncée UNE fois dans l'en-tête de l'exercice plutôt
 * que répétée à chaque sous-question (`consigneEcriteEtape`). */
export function regleNotationEcrite(): FragmentConsigne[] {
  return [
    texte("À chaque étape, écris m, n, q pour les parties déjà extraites et r pour le logarithme de la partie qui reste à décomposer, puis garde les termes déjà obtenus."),
  ];
}

/** Nom de la propriété appliquée à l'étape (corrigé exporté). */
export function nomProprieteDeLEtape(exercice: ExerciceProprieteLogarithme, etape: number): string {
  const nom = nomPropriete(caracteristiqueDeLEtape(exercice, etape));
  return nom.charAt(0).toUpperCase() + nom.slice(1);
}

/** Placeholder des écrans de transformation — coefficients 5 et 7, hors de l'espace des tirages
 * (les coefficients possibles sont 1, p, 1/k ou p/k avec p, k ∈ {2, 3, 4}). */
export const PLACEHOLDER_TRANSFORMATION = "ex : 5m - 7n";
