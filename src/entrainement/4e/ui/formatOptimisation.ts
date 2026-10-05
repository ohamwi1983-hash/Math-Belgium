/**
 * Couche présentation — "Problèmes d'optimisation (fonction du second degré)" (gen55,
 * `promptimplementationgen55.md`). Réutilise `formatSommeTermes` (`ui/formatEquation.ts`, déjà
 * partagée par les exercices 1-6) pour tout affichage de polynôme simplifié — jamais de coefficient
 * nul/±1 littéral, jamais de double signe, convention transversale de la plateforme.
 */
import type {
  CoefficientsQuadratiques,
  ContrainteOptimisation,
  DomaineOptimisation,
  ExerciceOptimisation,
  ExerciceOptimisationModelisation,
  FamilleOptimisation,
  GenreGrandeur,
  SensOptimisation,
} from "../core/optimisation.types";
import { formatSommeTermes } from "./formatEquation";
import { CATALOGUE_FAMILLES } from "../generateurs/optimisation/index";
import type { SegmentTexte } from "../components/SegmentsInline";

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** "de" + un nom de grandeur précédé de son article ("le"/"la"/"l'") — contracte "de le X" en
 * "du X" (jamais "de le X", faute grammaticale), laisse "la X"/"l'X" inchangés (pas de contraction
 * nécessaire en français dans ces 2 cas). */
function formatDeGrandeur(nomGrandeur: string): string {
  if (nomGrandeur.startsWith("le ")) return `du ${nomGrandeur.slice(3)}`;
  return `de ${nomGrandeur}`;
}

/** Retire l'article de tête d'un `nomGrandeur` (ex. "le revenu" → "revenu", "l'aire" → "aire") —
 * nécessaire pour recomposer un démonstratif ("ce revenu"/"cette aire"), jamais pour l'affichage
 * direct (qui garde toujours l'article, ex. dans `formatQuestionFinale`). */
function sansArticle(nomGrandeur: string): string {
  if (nomGrandeur.startsWith("l'")) return nomGrandeur.slice(2);
  if (nomGrandeur.startsWith("le ") || nomGrandeur.startsWith("la ")) return nomGrandeur.slice(3);
  return nomGrandeur;
}

/** Accord féminin d'un adjectif — double le "l" final des adjectifs en "-el" (réel→réelle,
 * naturel→naturelle), simple "e" sinon (atteint→atteinte, maximal→maximale : "-al" ne double
 * jamais) — bug trouvé sur "réel"→"réele" (`prompt-groupe-corrections-gen55.md`, point 4b). */
function accordGenre(mot: string, genre: GenreGrandeur): string {
  if (genre !== "feminin") return mot;
  return mot.endsWith("el") ? `${mot}le` : `${mot}e`;
}

function motSensOptimisation(sens: SensOptimisation, genre: GenreGrandeur): string {
  return accordGenre(sens === "max" ? "maximal" : "minimal", genre);
}

function demonstratif(genre: GenreGrandeur): string {
  return genre === "feminin" ? "cette" : "ce";
}

/** Découpe une phrase d'énoncé narrative sur ses segments `$...$` (LaTeX inline, ex. la fonction
 * déjà donnée pour la variante `fonctionDonnee`) — voir `components/SegmentsInline.tsx`, déjà
 * partagé, jamais un rendu KaTeX de la phrase entière (débordement mobile garanti). */
export function segmentsPhraseEnonce(phrase: string): SegmentTexte[] {
  const segments: SegmentTexte[] = [];
  const regex = /\$([^$]+)\$/g;
  let dernierIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(phrase)) !== null) {
    if (match.index > dernierIndex) {
      segments.push({ type: "texte", valeur: phrase.slice(dernierIndex, match.index) });
    }
    segments.push({ type: "katex", valeur: match[1] });
    dernierIndex = match.index + match[0].length;
  }
  if (dernierIndex < phrase.length) {
    segments.push({ type: "texte", valeur: phrase.slice(dernierIndex) });
  }
  return segments;
}

/** f(labelVariable) développée, simplifiée (jamais "0x²"/"1x"/double signe). */
export function formatFonctionDeveloppeeLatex(fonction: CoefficientsQuadratiques, labelVariable: string): string {
  return formatSommeTermes([
    { valeur: fonction.a, suffixe: `${labelVariable}^2` },
    { valeur: fonction.b, suffixe: labelVariable },
    { valeur: fonction.c, suffixe: "" },
  ]);
}

/** Forme isolée `lettreCherchee = pente·labelVariable + ordonnee`, simplifiée — état actuel affiché
 * sur l'écran "construction" (toujours dérivée de l'exercice, jamais de la saisie de l'élève). */
export function formatIsolementLatex(contrainte: ContrainteOptimisation, labelVariable: string): string {
  const membreDroit = formatSommeTermes([
    { valeur: contrainte.pente, suffixe: labelVariable },
    { valeur: contrainte.ordonnee, suffixe: "" },
  ]);
  return `${contrainte.lettreCherchee} = ${membreDroit}`;
}

// ============================================================================
// Consignes par écran.
// ============================================================================

/** Réutilisée par `consigneContrainteEtGrandeur` ci-dessous (écran "contrainteEtGrandeur", champ 1
 * — la relation NON isolée reliant `labelVariable`/`lettreCherchee`) — plus aucun autre appelant
 * depuis le retrait de l'ancienne architecture isolement/construction/domaine (8 écrans). */
export function consigneContrainte(exercice: ExerciceOptimisationModelisation): string {
  return `Traduis la description ci-dessus en une équation reliant ${exercice.contexte.labelVariable} et ${exercice.contrainte.lettreCherchee}.`;
}

/**
 * Écran "contrainteEtGrandeur" (`prompt-restructuration-architecture-modelisation.md`, écran 2 de la
 * nouvelle architecture à 7 écrans, A/B/T/V) — 2 consignes en une, une par champ : (1) poser la
 * relation NON isolée (même texte que l'ancien écran "contrainte" ci-dessus, `consigneContrainte`
 * réutilisée) ; (2) exprimer la grandeur avec x ET y encore présents (NOUVEAU champ). Pour V
 * (`rectangleInscrit`), le champ 1 est une proportion géométrique plutôt qu'une contrainte de somme
 * — même texte générique ("traduis...en une équation"), le raisonnement propre à V est porté par
 * `texteAideContrainteNiveau1`/`2` (peuplés par `rectangleInscrit.ts`), jamais par la consigne.
 */
export function consigneContrainteEtGrandeur(exercice: ExerciceOptimisationModelisation): string {
  const { labelVariable, nomGrandeur } = exercice.contexte;
  const { lettreCherchee } = exercice.contrainte;
  return `${consigneContrainte(exercice)} Puis exprime ${nomGrandeur} en fonction de ${labelVariable} et ${lettreCherchee} (sans encore substituer).`;
}

/**
 * Écran "systeme" (`prompt-restructuration-architecture-modelisation.md`, écran 3) — les 2 équations
 * validées à l'écran "contrainteEtGrandeur" sont résolues ENSEMBLE : isoler, substituer, développer,
 * en UNE seule réponse (perte assumée : les pièges "isoler" et "développer" ne sont plus diagnostiqués
 * séparément — voir `core/optimisation.types.ts`, en-tête).
 */
export function consigneSysteme(exercice: ExerciceOptimisationModelisation): string {
  return `Résous ce système : isole ${exercice.contrainte.lettreCherchee} dans la première équation, substitue-la dans la seconde, puis développe. Donne ${exercice.contexte.nomGrandeur} développée, en fonction de ${exercice.contexte.labelVariable} uniquement.`;
}

/** Les 3 consignes ci-dessous partagent la même tolérance réellement vérifiée (`TOLERANCE = 0.005`,
 * `verificationOptimisation.ts::statutValeur`) — soit un arrondi au centième, jamais annoncé
 * jusqu'ici (également réutilisée telle quelle par gen57, voie `modelisation`). */
export function consigneDomaine(exercice: ExerciceOptimisationModelisation): string {
  return `Détermine le domaine de validité ${formatDeGrandeur(exercice.contexte.nomVariable)} (${exercice.contexte.labelVariable}) — arrondi au centième accepté si besoin.`;
}

/**
 * Contextualisé (`spec-gen55-optimisation-second-degre.md`, section 4, écrans 6/7) — réutilise
 * automatiquement `nomVariable`/`nomGrandeur`/`genreGrandeur` déjà établis pour l'instance (contexte
 * narratif direct, ou combobox de l'écran d'identification x/y), JAMAIS une rédaction par skin (à la
 * différence de la justification du domaine, section 2) : un seul gabarit générique qui s'adapte.
 * Repli générique non genré si `genreGrandeur` est absent (uniquement les 8 familles exclusives au
 * cinquante-septième exercice, qui n'appellent jamais cette fonction — voir
 * `core/optimisation.types.ts::ContexteOptimisationCommun.genreGrandeur`).
 */
export function consigneSommet(exercice: ExerciceOptimisation): string {
  const { genreGrandeur, nomVariable, nomGrandeur } = exercice.contexte;
  if (!genreGrandeur) {
    return "Calcule les coordonnées du sommet de la parabole (arrondi au centième accepté si besoin).";
  }
  return `Calcule ${nomVariable} qui donne ${nomGrandeur} ${motSensOptimisation(exercice.sens, genreGrandeur)} théorique, et ${demonstratif(genreGrandeur)} ${sansArticle(nomGrandeur)} (arrondi au centième accepté si besoin).`;
}

export function consigneDecision(exercice: ExerciceOptimisation): string {
  const { genreGrandeur, nomVariable, nomGrandeur } = exercice.contexte;
  if (!genreGrandeur) {
    return "Le sommet appartient-il au domaine de validité ? Donne alors la valeur optimale recherchée (arrondi au centième accepté si besoin).";
  }
  return `La valeur théorique ${formatDeGrandeur(nomVariable)} (le sommet) appartient-elle au domaine de validité ? Donne alors ${nomGrandeur} réellement ${motSensOptimisation(exercice.sens, genreGrandeur)} (arrondi au centième accepté si besoin).`;
}

export function consigneInterpretation(): string {
  return "Choisis la phrase de conclusion correcte.";
}

/**
 * Rappel contextuel court (entre parenthèses sous le label) pour les champs `x_S`/`x_opt` des écrans
 * "sommet"/"decision" (`prompt-groupe-corrections-gen55.md`, point 4a — la spec prévoyait cette
 * possibilité, jamais câblée jusqu'ici) : `nomVariable` sans article, ce que le champ représente
 * concrètement. Chaîne vide si `genreGrandeur` est absent (8 familles exclusives au 57e exercice,
 * jamais nommées — même repli que `consigneSommet`/`consigneDecision`).
 */
export function contexteLabelX(exercice: ExerciceOptimisation): string {
  const { genreGrandeur, nomVariable } = exercice.contexte;
  return genreGrandeur ? sansArticle(nomVariable) : "";
}

/** Même principe pour les champs `y_S`/`y_opt` — `nomGrandeur` sans article (la grandeur optimisée). */
export function contexteLabelY(exercice: ExerciceOptimisation): string {
  const { genreGrandeur, nomGrandeur } = exercice.contexte;
  return genreGrandeur ? sansArticle(nomGrandeur) : "";
}

// ============================================================================
// Aides par écran.
// ============================================================================

/**
 * Écran "contrainteEtGrandeur", champ 1 — le piège dépend entièrement du contexte narratif (voir
 * `core/optimisation.types.ts`, `texteAideContrainteNiveau1`/`2` sur
 * `ExerciceOptimisationModelisation`), jamais généralisable : chaque famille avec un piège propre
 * fournit les deux textes explicitement. Le repli ci-dessous s'applique aux familles qui n'en
 * définissent pas (aide générique, signalée plutôt que devinée silencieusement).
 */
export function texteAideContrainteNiveau1(exercice: ExerciceOptimisationModelisation): string {
  return exercice.texteAideContrainteNiveau1 ?? `Rappel : identifie précisément quelle relation numérique lie ${exercice.contexte.labelVariable} et ${exercice.contrainte.lettreCherchee} dans cette situation.`;
}

export function texteAideContrainteNiveau2(exercice: ExerciceOptimisationModelisation): string {
  return exercice.texteAideContrainteNiveau2 ?? `Pose une équation reliant ${exercice.contexte.labelVariable} et ${exercice.contrainte.lettreCherchee}, sans encore la simplifier.`;
}

/**
 * Champ 2 de l'écran "contrainteEtGrandeur" (`prompt-restructuration-architecture-modelisation.md`)
 * — exprimer la grandeur avec x ET y encore présents, jamais substitué. Repli générique si la famille
 * ne fournit pas `texteAideGrandeurNiveau1` (règle géométrique universellement connue, ex.
 * aire=longueur×largeur) — override seulement quand la règle est propre au contexte (ex.
 * `sommeDeuxCarres` sous-skin `pierre` : valeur ∝ carré de la masse).
 */
export function texteAideGrandeurNiveau1(exercice: ExerciceOptimisationModelisation): string {
  return (
    exercice.texteAideGrandeurNiveau1 ??
    `Rappelle-toi la formule permettant de calculer ${exercice.contexte.nomGrandeur} à partir de ${exercice.contexte.labelVariable} et ${exercice.contrainte.lettreCherchee}.`
  );
}

export function texteAideGrandeurNiveau2(exercice: ExerciceOptimisationModelisation): string {
  return (
    exercice.texteAideGrandeurNiveau2 ??
    `Utilise la formule usuelle (produit, somme de carrés...) — n'y substitue pas encore ${exercice.contrainte.lettreCherchee}.`
  );
}

/** Version affichable (KaTeX) de `formuleGrandeurXYTexte` — seule différence avec la chaîne évaluable
 * (`verificationOptimisation.ts::diagnostiquerGrandeurXY`) : `*` devient `\cdot` (jamais un astérisque
 * littéral affiché à l'élève). */
export function formatGrandeurXYLatex(exercice: ExerciceOptimisationModelisation): string {
  return (exercice.formuleGrandeurXYTexte ?? "").replace(/\*/g, " \\cdot ");
}

/** Les 2 équations validées à l'écran "contrainteEtGrandeur", rappelées ensemble avec une accolade
 * (`\begin{cases}`) sur l'écran "systeme" — jamais celles de l'élève, toujours dérivées de
 * l'exercice (convention "état actuel" déjà en place sur toute la plateforme). */
export function formatSystemeAccoladeLatex(exercice: ExerciceOptimisationModelisation): string {
  return `\\begin{cases} ${exercice.contrainte.enonceLatex} \\\\ \\text{${exercice.contexte.nomGrandeur}} = ${formatGrandeurXYLatex(exercice)} \\end{cases}`;
}

/**
 * Écran "systeme" — même structure d'aide (méthode → résultat intermédiaire → expression substituée
 * non développée) que les anciens écrans "isolement"/"construction" fusionnés, RÉUTILISANT
 * `formatIsolementLatex`/`formuleSubstitueeTexte` tels quels (aucune nouvelle donnée nécessaire).
 */
export function texteAideSystemeNiveau1(): string {
  return "Rappel de méthode : isole une variable dans une des deux équations, substitue-la dans l'autre, puis développe.";
}

export function texteAideSystemeNiveau2(exercice: ExerciceOptimisationModelisation): string {
  return `La variable isolée : $${formatIsolementLatex(exercice.contrainte, exercice.contexte.labelVariable)}$.`;
}

export function texteAideSystemeNiveau3(exercice: ExerciceOptimisationModelisation): string {
  const rhs =
    exercice.formuleSubstitueeTexte ??
    `${exercice.contexte.labelVariable} · (${formatIsolementLatex(exercice.contrainte, exercice.contexte.labelVariable).replace(/^.*= /, "")})`;
  return `Expression substituée, non développée : ${exercice.contexte.nomGrandeur} = ${rhs}.`;
}

/**
 * Piège pédagogique propre à `revenuPrix` (famille B, `spec-gen55-optimisation-second-degre.md`,
 * section 4) : DEUX inéquations de nature DIFFÉRENTE à traiter séparément avant de les combiner (x
 * positif d'un côté, y positif de l'autre — contrairement à `aireEnclos`/`sommeDeuxCarres`, où une
 * seule contrainte de somme suffit des deux côtés) — le piège propre à B est de n'en traiter qu'une
 * et d'oublier l'autre. Texte dédié à cette seule famille, jamais aux autres.
 */
export function texteAideDomaineNiveau1(exercice: ExerciceOptimisationModelisation): string {
  if (exercice.famille === "revenuPrix") {
    // `nomVariableY` n'est pas persisté sur `contexte` (seul un champ générateur interne à
    // `revenuPrix.ts::SkinRevenuPrix`) — récupéré via la bonne réponse de l'écran d'identification
    // x/y, TOUJOURS présente sur cette famille (voir `revenuPrix.ts`, en-tête).
    const nomVariableY = exercice.identificationXY?.candidatsY[exercice.identificationXY.indexCorrectY] ?? "la quantité restante";
    return `Rappel : ici, il y a 2 grandeurs à vérifier séparément — ${exercice.contexte.nomVariable} (toujours positive) et ${nomVariableY} (toujours positive). Pose une inéquation pour chacune, puis combine-les.`;
  }
  return "Rappel : chaque grandeur physique du contexte doit rester dans un intervalle cohérent avec la situation (jamais négative, jamais au-delà d'une limite physique).";
}

export function texteAideDomaineNiveau2(exercice: ExerciceOptimisationModelisation): string {
  return `Pose les inéquations correspondant à chaque contrainte physique du contexte, en fonction de ${exercice.contexte.labelVariable}.`;
}

export function texteAideDomaineNiveau3(exercice: ExerciceOptimisationModelisation): string {
  return `Une fois résolues séparément, combine ces inéquations : le domaine est [${formatNombre(exercice.domaine.inf)} ; ${formatNombre(exercice.domaine.sup)}].`;
}

/**
 * Toute notation à underscore ($x_S$, etc.) DOIT être rendue en KaTeX (vrai indice), jamais en texte
 * brut ("x_S" affiché tel quel, underscore littéral visible — bug trouvé en usage réel,
 * `prompt-restructuration-architecture-modelisation.md`, point 2) : les fragments `$...$` ci-dessous
 * sont extraits par `segmentsPhraseEnonce` et rendus via `<SegmentsInline>`
 * (`EtapeSommetOptimisation.tsx`), jamais un simple `<p>{texte}</p>`. Suit exactement le gabarit de
 * la spec : `$x_S=-b/(2a)$` reste générique, mais le second membre est respellé
 * `${nomGrandeur sans article}_S` (ex. "hauteur_S") pour rattacher le résultat à son sens concret.
 */
export function texteAideSommetNiveau1(exercice: ExerciceOptimisation): string {
  const { genreGrandeur, nomVariable, nomGrandeur } = exercice.contexte;
  if (!genreGrandeur) {
    return "Rappel : $x_S = -b/(2a)$, puis $y_S = f(x_S)$.";
  }
  return `Le sommet donne la valeur ${formatDeGrandeur(nomVariable)} qui optimise théoriquement ${nomGrandeur} (à confirmer ensuite si elle est physiquement atteignable) : $x_S = -b/(2a)$, puis ${sansArticle(nomGrandeur)}$_S = f(x_S)$.`;
}

export function texteAideSommetNiveau2(exercice: ExerciceOptimisation): string {
  return `$x_S = -(${formatNombre(exercice.fonction.b)})/(2 \\cdot (${formatNombre(exercice.fonction.a)}))$.`;
}

export function texteAideDecisionNiveau1(exercice: ExerciceOptimisation): string {
  const { genreGrandeur, nomVariable, nomGrandeur } = exercice.contexte;
  if (!genreGrandeur) {
    return "Rappel : le sommet ne donne l'optimum réel que s'il appartient au domaine de validité — sinon, l'optimum est atteint à l'une des deux bornes du domaine.";
  }
  return `Rappel : la valeur ${formatDeGrandeur(nomVariable)} au sommet ne donne ${nomGrandeur} réellement ${motSensOptimisation(exercice.sens, genreGrandeur)} que si elle appartient au domaine de validité ${formatDeGrandeur(nomVariable)} — sinon, ${nomGrandeur} ${accordGenre("réel", genreGrandeur)} est ${accordGenre("atteint", genreGrandeur)} à l'une des deux bornes du domaine.`;
}

export function texteAideDecisionNiveau2(exercice: ExerciceOptimisation): string {
  return `Sommet : $x_S = ${formatNombre(exercice.sommet.x)}$. Domaine : [${formatNombre(exercice.domaine.inf)} ; ${formatNombre(exercice.domaine.sup)}].`;
}

export function texteAideDecisionNiveau3(exercice: ExerciceOptimisation): string {
  const { genreGrandeur, nomVariable, nomGrandeur } = exercice.contexte;
  if (!genreGrandeur) {
    return "Si le sommet est hors du domaine, calcule la valeur de la grandeur à chacune des deux bornes du domaine, et compare-les.";
  }
  return `Si la valeur ${formatDeGrandeur(nomVariable)} au sommet est hors du domaine, calcule ${nomGrandeur} à chacune des deux bornes du domaine ${formatDeGrandeur(nomVariable)}, et compare les deux résultats.`;
}

export function texteAideInterpretationNiveau1(): string {
  return "Vérifie le sens (maximum ou minimum), l'unité de la grandeur, et que tu n'as pas confondu la variable avec la grandeur optimisée.";
}

// ============================================================================
// Révélation.
// ============================================================================

/** `labelVariable \in [inf ; sup]`, valeurs propres par construction (voir core, en-tête). */
export function formatDomaineLatex(domaine: DomaineOptimisation, labelVariable: string): string {
  return `${labelVariable} \\in [${formatNombre(domaine.inf)} ; ${formatNombre(domaine.sup)}]`;
}

function ligneFonction(exercice: ExerciceOptimisation): string {
  return formatFonctionDeveloppeeLatex(exercice.fonction, exercice.contexte.labelVariable);
}

function ligneDomaine(exercice: ExerciceOptimisation): string {
  return formatDomaineLatex(exercice.domaine, exercice.contexte.labelVariable);
}

function ligneSommet(exercice: ExerciceOptimisation): string {
  return `S(${formatNombre(exercice.sommet.x)} ; ${formatNombre(exercice.sommet.y)})`;
}

function ligneOptimal(exercice: ExerciceOptimisation): string {
  return `\\text{Optimum} = ${formatNombre(exercice.optimal.y)} \\text{ pour } ${exercice.contexte.labelVariable} = ${formatNombre(exercice.optimal.x)}`;
}

function gathered(lignes: string[]): string {
  return `\\begin{gathered} ${lignes.join(" \\\\ ")} \\end{gathered}`;
}

/**
 * Lignes fonction (+domaine, sauf `fonctionDonnee`) communes aux 3 fonctions ci-dessous —
 * `prompt-groupe-corrections-gen55.md`, point 5 : sur C/E/G, le domaine est déjà justifié
 * narrativement dans le texte du contexte (`spec-gen55-optimisation-second-degre.md`, section 2) et
 * n'est jamais une donnée que l'élève détermine lui-même (fourni dès le départ, voir
 * `moteur/sessionOptimisation.ts::phaseInitiale`) — le répéter en brut ici est redondant. Sur
 * `modelisation` (A/B/T/V), le domaine est au contraire une réponse que l'élève vient de confirmer
 * (écran "domaine") : le garder ici en est la seule confirmation visuelle, jamais redondant.
 */
function lignesFonctionEtDomaine(exercice: ExerciceOptimisation): string[] {
  const lignes = [ligneFonction(exercice)];
  if (exercice.variante !== "fonctionDonnee") lignes.push(ligneDomaine(exercice));
  return lignes;
}

/** Bloc "données confirmées" — fonction+domaine (jamais le sommet, pas encore connu), affiché sur
 * l'écran "sommet" des 2 variantes (dérivé de l'exercice, jamais de la saisie de l'élève). */
export function formatDonneesConfirmeesLatex(exercice: ExerciceOptimisation): string {
  return gathered(lignesFonctionEtDomaine(exercice));
}

/** + le sommet, une fois confirmé — affiché sur l'écran "decision". */
export function formatDonneesAvecSommetLatex(exercice: ExerciceOptimisation): string {
  return gathered([...lignesFonctionEtDomaine(exercice), ligneSommet(exercice)]);
}

/** + l'optimum, une fois confirmé — affiché sur l'écran "interpretation" (dernier écran). */
export function formatDonneesFinalesLatex(exercice: ExerciceOptimisation): string {
  return gathered([...lignesFonctionEtDomaine(exercice), ligneSommet(exercice), ligneOptimal(exercice)]);
}

/** LaTeX réel (jamais `x_S`/`y_S` en texte brut, "_" littéral proscrit hors KaTeX) — à rendre via
 * `<Katex>`, jamais interpolé tel quel dans du texte brut. */
export function formatSommetAttenduLatex(exercice: ExerciceOptimisation): string {
  return `x_S = ${formatNombre(exercice.sommet.x)} \\, ; \\, y_S = ${formatNombre(exercice.sommet.y)}`;
}

/** LaTeX réel — coordonnée optimale + valeur de la grandeur, à rendre via `<Katex>`. */
export function formatOptimalAttenduLatex(exercice: ExerciceOptimisation): string {
  return `${exercice.contexte.labelVariable} = ${formatNombre(exercice.optimal.x)} \\, ; \\, \\text{optimum} = ${formatNombre(exercice.optimal.y)}`;
}

/** Texte brut (jamais de LaTeX) — précise si l'optimum provient du sommet ou d'une borne. */
export function libellePositionOptimum(exercice: ExerciceOptimisation): string {
  return exercice.sommetDansDomaine ? "dans le domaine" : "hors du domaine";
}

// ============================================================================
// Divers.
// ============================================================================

export function libelleBoutonAide(niveau: number, max: number): string {
  if (niveau >= max) return "Aide utilisée";
  return niveau === 0 ? "Aide" : "Aide supplémentaire";
}

export function libelleFamilleOptimisation(famille: FamilleOptimisation): string {
  return CATALOGUE_FAMILLES.find((f) => f.id === famille)?.label ?? famille;
}
