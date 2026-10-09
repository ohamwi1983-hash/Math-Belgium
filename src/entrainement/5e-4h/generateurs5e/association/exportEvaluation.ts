import katex from "katex";
import { lettreCorrecte, nombreElementsAssociation } from "../../core5e/association.types";
import type {
  ExerciceAssociation,
  ExerciceAssociationGrapheDerivee,
  ExerciceAssociationGrapheVerbal,
  ExerciceAssociationSymbolique,
  PolynomeAssociation,
} from "../../core5e/association.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { echapperHtml } from "../../../export/genererFeuilleExercicesHtml";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import { consigneAssociation } from "../../ui5e/formatAssociation";
import { evaluerPolynome } from "../domaineDefinition/polynome";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, derivee, genererExerciceAssociation } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAssociation>` pour 5gen25 ("Association
 * graphique/mots ↔ signe de f'/f''", premier générateur du chapitre "Dérivées et applications") —
 * feuille d'évaluation.
 *
 * L'écran interactif (`App5gen25.tsx`, `components5e/ComposantAssociation.tsx`) est un JEU
 * D'ASSOCIATION : `n` éléments NUMÉROTÉS (1..n) affichés avec leur rendu riche (graphique/LaTeX),
 * `n` candidats LETTRÉS (A, B, C…) affichés à côté, l'élève choisissant pour chaque numéro la lettre
 * du candidat qui lui correspond via un `<select>` — jamais de glisser-déposer. Traduction papier
 * naturelle (voir tâche) : les candidats lettrés et les éléments numérotés sont affichés UNE SEULE
 * FOIS en tête de l'exercice (`enteteHtml`, comme le graphique unique de
 * `lectureGraphiqueLimites/exportEvaluation.ts`), puis CHAQUE élément numéroté devient une question
 * lettrée a)/b)/c)… « Élément i : quelle lettre lui correspond ? » avec une simple ligne de réponse
 * (la lettre écrite à la main) — jamais un `<select>` sur papier.
 *
 * **3 familles gérées** (`grapheDerivee`, `grapheVerbal`, `symbolique` — les seules produites par
 * `genererExerciceAssociation`, voir `generateurs5e/association/index.ts::POIDS`). La famille
 * `grapheDeriveeAvancee` (accessible UNIQUEMENT via le panneau dev/le sélecteur de variante, jamais
 * tirée par défaut) introduit des points anguleux/de rebroussement/tangentes verticales et des
 * asymptotes/discontinuités/points vides sur f ET f' — un moteur de tracé SVG imprimé fidèle à ces
 * comportements pathologiques (buffers de coupure asymétriques par caractéristique, cohérents avec
 * `evaluerFonctionRiche`/`evaluerDeriveeFonctionRiche` de `generateurs5e/association/index.ts`)
 * dépasserait largement le cadre de cette tâche (adaptateur pour 5gen25 uniquement). Exclue ici :
 * `CATALOGUE_VARIANTES_EXPORT` ci-dessous filtre les entrées `grapheDeriveeAvancee-*` du catalogue
 * complet du générateur, et `construireEnteteHtmlAssociation` lève explicitement si jamais appelée
 * sur cette famille (ne peut pas arriver via ce fichier, mais rend l'exclusion vérifiable/explicite
 * plutôt que silencieuse).
 *
 * **Candidats/éléments graphiques** : réutilise `export/svgGraph.ts::construireSvgFonction` (déjà le
 * moteur de tracé imprimé générique de la plateforme, voir `lectureGraphiqueLimites/exportEvaluation.ts`)
 * avec `evaluerPolynome` (Couche A ↔ Couche A, `generateurs5e/domaineDefinition/polynome.ts`) — même
 * domaine fixe `[-4;4]` et même cadrage vertical par échantillonnage (marge 15%) que
 * `components5e/PolynomeAssociationGraph.tsx` (fonction interne non exportée, et de toute façon
 * `generateurs5e/` n'importe jamais un composant React — DUPLIQUÉE ici en pur JS,
 * `calculerViewBoxPolynomeAssociation`). Grille `.grille-graphes-cyclo` (CSS déjà écrite côté
 * `assemblerEvaluationHtml.ts`, réutilisée telle quelle par tous les QCM graphiques 6e — voir
 * `export/svgGraphCyclo.ts` — nom historique "cyclo" mais générique) : 2 colonnes, `page-break-inside:
 * avoid`.
 *
 * **Candidats/éléments non graphiques** (énoncés verbaux de la famille B, expressions LaTeX de la
 * famille C) : aucun mécanisme existant sur la plateforme ne les dispose en grille lettrée (les
 * adaptateurs QCM graphiques 6e ne connaissent que des SVG). `construireCarteTexteAssociation`
 * construit donc une carte HTML minimale (bordure, étiquette, contenu) au même gabarit visuel que les
 * cartes SVG, texte échappé via `echapperHtml` (`export/genererFeuilleExercicesHtml.ts`, déjà exportée
 * pour réutilisation hors de ce fichier) ou rendu KaTeX via `katex.renderToString` — LE MÊME appel que
 * celui déjà utilisé par le pipeline HTML générique (`genererFeuilleExercicesHtml.ts::fragmentsVersHtml`),
 * simplement invoqué ici directement pour composer une grille plutôt qu'un paragraphe. `displayMode:true`
 * choisi délibérément (formule seule dans sa carte, jamais mêlée à du texte environnant — aucun risque
 * du piège `enteteFragments`/`displayMode` documenté pour l'étape 3 de la tâche, qui ne concerne QUE
 * `SectionExercice.enteteFragments`, jamais un rendu HTML construit à la main dans `enteteHtml`).
 *
 * **Consigne générale RÉÉCRITE pour le papier** : `CONSIGNE_GENERALE_ASSOCIATION`
 * (`ui5e/formatAssociation.ts`) mentionne littéralement « en choisissant la bonne lettre dans chaque
 * menu déroulant » — un `<select>` HTML n'existe pas sur une feuille imprimée. Cette constante a été
 * écrite uniquement pour l'écran (jamais anticipée pour un export papier, contrairement à
 * `consigneGenerale()`/`consignePhase()` de `ui5e/formatLectureGraphiqueLimites.ts`, déjà génériques).
 * `consigneAssociation(exercice)` (texte PAR FAMILLE, aucune référence UI) reste, elle, réutilisée
 * TELLE QUELLE — c'est `CONSIGNE_GENERALE_ASSOCIATION_PAPIER` ci-dessous, propre à ce fichier, qui la
 * remplace pour la partie générique.
 *
 * **`construireCorrection` RESYNTHÉTISÉE** depuis `ordreLettres` (déjà connu de l'instance tirée) via
 * `lettreCorrecte` (`core5e/association.types.ts`, pure, commune aux 3 familles) — jamais recalculée
 * indépendamment, jamais un import de `moteur5e/verificationAssociation.ts` (règle Couche A/Couche B).
 * Texte seul (« Élément i → lettre X »), sans redessiner le graphique — même décision que
 * `lectureGraphiqueLimites/exportEvaluation.ts` (le corrigé texte suffit, le graphique reste visible
 * plus haut sur la copie imprimée elle-même, ou via `questionCorrectionHtml`/`corpsQuestionHtml` qui
 * réaffiche l'énoncé complet dans le pipeline `/admin`).
 *
 * **`regroupable` = `false`** (explicite) : ce générateur produit TOUJOURS plusieurs questions par
 * instance (`n` ∈ [3;5], jamais 1 seule) ET utilise `enteteHtml` pour 2 des 3 familles — les 2 conditions
 * d'exclusion de la doc de `AdaptateurFeuilleExercices.regroupable` sont réunies.
 */

const LETTRES = "ABCDEFGH";
const X_MIN_ASSOCIATION = -4;
const X_MAX_ASSOCIATION = 4;
const TAILLE_CARTE_ASSOCIATION = 150;

const CONSIGNE_GENERALE_ASSOCIATION_PAPIER =
  "Associe chaque élément numéroté au candidat lettré qui lui correspond : écris la lettre correspondante en face de chaque numéro.";

/** Catalogue exposé par cet adaptateur — sous-ensemble de `CATALOGUE_FAMILLES`
 * (`generateurs5e/association/index.ts`), sans les 7 entrées `grapheDeriveeAvancee-*` (voir le
 * commentaire de tête du fichier pour la justification de cette exclusion). */
export const CATALOGUE_VARIANTES_EXPORT_ASSOCIATION = CATALOGUE_FAMILLES.filter((entree) => !entree.id.startsWith("grapheDeriveeAvancee"));

// ============================================================================
// Cartes graphiques (familles A et B — graphiques de polynômes cubiques).
// ============================================================================

/** DUPLIQUÉE depuis `calculerYMinMax` de `components5e/PolynomeAssociationGraph.tsx` (fonction
 * interne non exportée, et `generateurs5e/` n'importe de toute façon jamais un composant React) —
 * même domaine fixe `[-4;4]`, même marge 15%, pour reproduire le cadrage déjà vu à l'écran. */
function calculerViewBoxPolynomeAssociation(coeffs: PolynomeAssociation): ViewBoxSvg {
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i <= 80; i++) {
    const x = X_MIN_ASSOCIATION + ((X_MAX_ASSOCIATION - X_MIN_ASSOCIATION) * i) / 80;
    const y = evaluerPolynome(coeffs, x);
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  const marge = Math.max(1, (yMax - yMin) * 0.15);
  return { xMin: X_MIN_ASSOCIATION, xMax: X_MAX_ASSOCIATION, yMin: yMin - marge, yMax: yMax + marge };
}

function construireSvgPolynomeAssociation(coeffs: PolynomeAssociation, etiquette: string): string {
  const viewBox = calculerViewBoxPolynomeAssociation(coeffs);
  return construireSvgFonction((x) => evaluerPolynome(coeffs, x), viewBox, {
    largeur: TAILLE_CARTE_ASSOCIATION,
    hauteur: TAILLE_CARTE_ASSOCIATION,
    classe: "graphe-cyclo",
    lettre: etiquette,
  });
}

// ============================================================================
// Cartes non graphiques (énoncés verbaux — famille B — et LaTeX — famille C).
// ============================================================================

/** Carte HTML minimale au même gabarit visuel que les cartes SVG (`TAILLE_CARTE_ASSOCIATION`) —
 * aucun mécanisme de grille lettrée existant sur la plateforme ne gère un contenu non graphique (voir
 * commentaire de tête du fichier). */
function construireCarteTexteAssociation(contenuHtml: string, etiquette: string): string {
  return (
    `<div class="graphe-cyclo" style="border:1px solid #adb5bd;border-radius:3px;padding:6px 8px;` +
    `width:${TAILLE_CARTE_ASSOCIATION}px;min-height:${TAILLE_CARTE_ASSOCIATION}px;box-sizing:border-box;` +
    `font-size:9pt;display:flex;flex-direction:column;">` +
    `<span style="font-weight:bold;font-size:12px;">${etiquette}</span>` +
    `<div style="flex:1;display:flex;align-items:center;justify-content:center;text-align:center;">${contenuHtml}</div>` +
    `</div>`
  );
}

/** Même appel que `genererFeuilleExercicesHtml.ts::fragmentsVersHtml` pour un fragment `latex` —
 * `displayMode:true` : une formule seule dans sa carte, jamais mêlée à du texte environnant (le piège
 * `enteteFragments`/`displayMode` de l'étape 3 de la tâche ne concerne que
 * `SectionExercice.enteteFragments`, jamais un rendu HTML construit à la main dans `enteteHtml`). */
function rendreLatexCarte(expression: string): string {
  return katex.renderToString(expression, { throwOnError: false, displayMode: true });
}

function construireGrilleHtml(cartes: string[]): string {
  return `<div class="grille-graphes-cyclo">${cartes.join("")}</div>`;
}

// ============================================================================
// Entête (candidats lettrés + éléments numérotés) par famille.
// ============================================================================

function construireEnteteHtmlGrapheDerivee(exercice: ExerciceAssociationGrapheDerivee): string {
  const candidats = exercice.ordreLettres.map((numeroSource, j) => construireSvgPolynomeAssociation(derivee(exercice.fonctions[numeroSource]), LETTRES[j] ?? String(j + 1)));
  const elements = exercice.fonctions.map((coeffs, i) => construireSvgPolynomeAssociation(coeffs, String(i + 1)));
  return `<p><strong>Candidats — graphiques de f' :</strong></p>${construireGrilleHtml(candidats)}<p><strong>Éléments — graphiques de f :</strong></p>${construireGrilleHtml(elements)}`;
}

function construireEnteteHtmlGrapheVerbal(exercice: ExerciceAssociationGrapheVerbal): string {
  // `enonces[j]` décrit déjà `fonctions[ordreLettres[j]]` (contrat `core5e/association.types.ts`) —
  // directement indexé par position de lettre `j`, aucune indirection supplémentaire nécessaire.
  const candidats = exercice.enonces.map((enonce, j) => construireCarteTexteAssociation(echapperHtml(enonce), LETTRES[j] ?? String(j + 1)));
  const elements = exercice.fonctions.map((coeffs, i) => construireSvgPolynomeAssociation(coeffs, String(i + 1)));
  return `<p><strong>Candidats — énoncés :</strong></p>${construireGrilleHtml(candidats)}<p><strong>Éléments — graphiques de f :</strong></p>${construireGrilleHtml(elements)}`;
}

function construireEnteteHtmlSymbolique(exercice: ExerciceAssociationSymbolique): string {
  // `gLatex[j]` est déjà la dérivée de `fLatex[ordreLettres[j]]` — directement indexé par position de
  // lettre `j`, même remarque que pour `enonces` ci-dessus.
  const candidats = exercice.gLatex.map((expression, j) => construireCarteTexteAssociation(rendreLatexCarte(expression), LETTRES[j] ?? String(j + 1)));
  const elements = exercice.fLatex.map((expression, i) => construireCarteTexteAssociation(rendreLatexCarte(expression), String(i + 1)));
  return `<p><strong>Candidats — dérivées :</strong></p>${construireGrilleHtml(candidats)}<p><strong>Éléments — fonctions :</strong></p>${construireGrilleHtml(elements)}`;
}

function construireEnteteHtmlAssociation(exercice: ExerciceAssociation): string {
  switch (exercice.famille) {
    case "grapheDerivee":
      return construireEnteteHtmlGrapheDerivee(exercice);
    case "grapheVerbal":
      return construireEnteteHtmlGrapheVerbal(exercice);
    case "symbolique":
      return construireEnteteHtmlSymbolique(exercice);
    case "grapheDeriveeAvancee":
      // Ne peut pas arriver via cet adaptateur (voir commentaire de tête) — `genererInstance`/
      // `genererInstanceAvecVariante` de l'adaptateur exporté ci-dessous ne produisent jamais cette
      // famille. Exclusion rendue explicite/vérifiable plutôt que silencieuse.
      throw new Error("Famille 'grapheDeriveeAvancee' non prise en charge par l'export papier de 5gen25 — voir le commentaire de tête d'exportEvaluation.ts.");
  }
}

// ============================================================================
// Questions (une par élément numéroté) + correction.
// ============================================================================

function construireQuestionsAssociation(n: number): QuestionExercice[] {
  return Array.from({ length: n }, (_, i) => ({
    consigne: [texte(`Élément ${i + 1} : quelle lettre lui correspond ?`)],
    reponse: { type: "lignes", nombre: 1 },
  }));
}

function construireEnonceAssociation(exercice: ExerciceAssociation): SectionExercice {
  const n = nombreElementsAssociation(exercice);
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE_ASSOCIATION_PAPIER} ${consigneAssociation(exercice)}`)],
    enteteHtml: construireEnteteHtmlAssociation(exercice),
    questions: construireQuestionsAssociation(n),
  };
}

/** RESYNTHÉTISÉE depuis `ordreLettres` (déjà connu de l'instance tirée) via `lettreCorrecte`
 * (`core5e/association.types.ts`, pure, commune aux 3 familles) — jamais recalculée indépendamment,
 * aucun import de `moteur5e/verificationAssociation.ts`. */
function construireCorrectionAssociation(exercice: ExerciceAssociation): BlocCorrection[] {
  const n = nombreElementsAssociation(exercice);
  return Array.from({ length: n }, (_, i) => {
    const lettre = LETTRES[lettreCorrecte(exercice.ordreLettres, i)] ?? "?";
    return { type: "paragraphe", fragments: [texte(`Élément ${i + 1} → lettre ${lettre}.`)] } as BlocCorrection;
  });
}

export const adaptateurEvaluationAssociation: AdaptateurFeuilleExercices<ExerciceAssociation> = {
  titreDocument: "Association graphique/mots ↔ signe de f'/f'' — Évaluation",
  nomFichierBase: "association-signe-derivees",
  genererInstance: genererExerciceAssociation,
  catalogueVariantes: CATALOGUE_VARIANTES_EXPORT_ASSOCIATION,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceAssociation,
  construireCorrection: construireCorrectionAssociation,
  // Toujours plusieurs questions par instance (n ∈ [3;5]) ET `enteteHtml` utilisé pour 2 des 3
  // familles — les 2 conditions d'exclusion de la doc de `regroupable` sont réunies (voir
  // `export/genererFeuilleExercices.ts`). Laissé explicite pour documenter la décision.
  regroupable: false,
};
