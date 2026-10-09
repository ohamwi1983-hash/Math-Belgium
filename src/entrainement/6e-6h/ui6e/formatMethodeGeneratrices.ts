import type { DonneesGeneratrices, ExerciceMethodeGeneratrices, StatutMorceauLieu } from "../core6e/methodeGeneratrices.types";
import type { PhaseMethodeGeneratrices, ResultatExerciceMethodeGeneratrices } from "../moteur6e/typesMethodeGeneratrices";
import { phasesPourExercice } from "../moteur6e/typesMethodeGeneratrices";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage pour `6gen57`. DÉCISION DE CONCEPTION : les 5
 * écrans étant STRUCTURELLEMENT identiques pour les 5 familles (voir `moteur6e/
 * typesMethodeGeneratrices.ts`), `consigneEcran`/`champsEcran`/`aideNiveau1`/`aideNiveau2` ne
 * dispatchent JAMAIS sur `exercice.donnees.famille` — seuls `consigneGenerale`/`blocDonnees`
 * (le contexte géométrique concret) en dépendent. Les champs LaTeX affichés viennent des chaînes
 * déjà "quasi-LaTeX" (`*` pour la multiplication, `^` pour la puissance) produites par la Couche A —
 * `versKatex` les nettoie pour un rendu correct (`\cdot`, exposants, `\alpha`).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`. Couverture de régression :
 * `formatMethodeGeneratrices.test.ts`.
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

const LONGUEUR_MAX_LIGNE = 28;

/** Découpe un texte français long en PLUSIEURS fragments `\text{...}` COURTS, aux frontières de MOTS
 * uniquement — mirroir `decouperEnFragmentsTexte` de `formatBinomialeSequenceOrdonnee.ts` (6gen48) :
 * un `\text{...}` KaTeX rend en `white-space: nowrap` (jamais de retour à la ligne interne), donc
 * toute phrase française assez longue (ex. le label d'une option de restriction à l'écran 5,
 * "Segment ouvert entre le milieu de [AB]...") DOIT être scindée en plusieurs fragments COURTS
 * avant d'être injectée dans `\text{}`, jamais un seul `\text{}` géant — sinon débordement (visible
 * seulement à l'inspection visuelle, `document.body.scrollWidth` ne le détecte pas quand le
 * conteneur absorbe le débordement en scroll interne, voir en-tête `blocDonnees*` ci-dessous). */
function decouperEnFragmentsTexteKatex(texte: string): string[] {
  const mots = texte.split(" ");
  const lignes: string[] = [];
  let courante = "";
  for (const mot of mots) {
    const candidate = courante === "" ? mot : `${courante} ${mot}`;
    if (candidate.length > LONGUEUR_MAX_LIGNE && courante !== "") {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = candidate;
    }
  }
  if (courante !== "") lignes.push(courante);
  return lignes.map((ligne) => `\\text{${ligne}}`);
}

/** Convertit une chaîne "quasi-LaTeX" produite par la Couche A (`*` explicite, `^` pour la
 * puissance, `alpha` en toutes lettres) en LaTeX affichable — jamais l'inverse (aucune saisie élève
 * ne passe par cette fonction, uniquement les valeurs CONFIRMÉES/déjà connues de l'exercice). */
export function versKatex(expr: string): string {
  return expr
    .replace(/\bpi\b/g, "\\pi ")
    .replace(/\balpha\b/g, "\\alpha ")
    .replace(/\*/g, "\\cdot ")
    .replace(/tan\(/g, "\\tan(")
    .replace(/(\w|\)|\})\^(\d+)/g, "$1^{$2}")
    .replace(/<=|>=/g, (m) => (m === "<=" ? "\\leq" : "\\geq"));
}

// ============================================================================
// Bloc données — propre à chaque famille (contexte géométrique).
// ============================================================================

export function consigneGenerale(): string {
  return "Le paramètre α décrit une famille de droites mobiles (les génératrices). Le lieu cherché est l'ensemble des points d'intersection de 2 génératrices correspondantes, quand α varie. Élimine α algébriquement entre les 2 équations — jamais point par point.";
}

// **Fragments COURTS, un par ligne** (jamais une phrase française et plusieurs points/symboles
// concaténés dans un seul fragment KaTeX) — `.equation-box-donnees` empile chaque fragment sur sa
// propre ligne (`flex-direction: column`) SANS retour à la ligne interne (KaTeX rend en
// `white-space: nowrap`), contrairement à `.equation-box-termes` qui peut, elle, enrouler entre
// fragments. Un fragment trop long y déborde donc SILENCIEUSEMENT dans le scroll interne de
// `.equation-box` (`overflow-x:auto`, jamais visible sans faire défiler) plutôt que de forcer un
// scroll de PAGE détectable via `document.body.scrollWidth` — bug de régression trouvé par
// inspection VISUELLE d'une capture d'écran à 375px (texte tronqué à droite du bloc), jamais par le
// scan `scrollWidth` seul (voir CLAUDE.md, piège horizontal overflow — leçon 6gen57 : ce piège peut
// rester invisible à ce scan quand un conteneur interne absorbe le débordement).
function blocDonneesA(d: Extract<DonneesGeneratrices, { famille: "A" }>): string[] {
  return [
    `\\text{ABCD parallélogramme}`,
    `A(0;0),\\ B(${d.b};0)`,
    `D(0;${d.d}),\\ C(${d.b};${d.d})`,
    `\\text{YZ}\\parallel\\text{AB}`,
    `Z\\in]AD[,\\ Y\\in]BC[`,
    `\\text{à la hauteur }\\alpha\\in]0;${d.d}[`,
    `\\text{Lieu cherché :}`,
    `\\text{intersection de (AY) et (BZ)}`,
  ];
}
function blocDonneesB(d: Extract<DonneesGeneratrices, { famille: "B" }>): string[] {
  return [
    `\\text{ABC triangle}`,
    `B(0;0),\\ C(${d.c};0)`,
    `A(0;${d.a})`,
    `\\text{droite}\\parallel\\text{BC coupe [AB] en D}`,
    `\\text{et [AC] en E}`,
    `\\text{à la hauteur }\\alpha\\in]0;${d.a}[`,
    `\\text{Lieu cherché :}`,
    `\\text{intersection de (BE) et (CD)}`,
  ];
}
function blocDonneesC(d: Extract<DonneesGeneratrices, { famille: "C" }>): string[] {
  return [`\\text{Droite AB}`, `A(0;0),\\ B(${d.k};0)`, `\\text{Par A, droite a d'angle }\\alpha`, `\\text{Par B, droite b d'angle }2\\alpha`, `\\text{Lieu cherché :}`, `\\text{intersection de a et b}`];
}
function blocDonneesD(d: Extract<DonneesGeneratrices, { famille: "D" }>): string[] {
  if (d.sousCas === 1) {
    return [`\\text{ABC triangle}`, `B(0;0),\\ C(${d.c};0)`, `d\\equiv y=${d.h}`, `A(\\alpha;${d.h})\\text{ variable sur }d`, `\\text{M,N milieux de [AB],[AC]}`, `\\text{Lieu cherché :}`, `\\text{intersection de (BN) et (CM)}`];
  }
  return [
    `\\text{ABC triangle}`,
    `d\\equiv\\text{axe des ordonnées}`,
    `BC\\equiv\\text{axe des abscisses}`,
    `B(${d.b};0),\\ C(${d.c};0)`,
    `A(0;\\alpha)\\text{ variable sur }d`,
    `\\text{M,N milieux de [AB],[AC]}`,
    `\\text{Lieu cherché :}`,
    `\\text{intersection de (BN) et (CM)}`,
  ];
}
function blocDonneesE(d: Extract<DonneesGeneratrices, { famille: "E" }>): string[] {
  return [
    `A(${d.p};0),\\ B(${d.r};0)`,
    `d\\equiv\\text{axe des ordonnées}`,
    `C(0;\\alpha)\\text{ variable sur }d`,
    `a\\perp AC\\text{ passant par A}`,
    `b\\perp BC\\text{ passant par B}`,
    `\\text{Lieu cherché :}`,
    `\\text{intersection de a et b}`,
  ];
}

export function blocDonnees(exercice: ExerciceMethodeGeneratrices): string[] {
  const d = exercice.donnees;
  switch (d.famille) {
    case "A":
      return blocDonneesA(d);
    case "B":
      return blocDonneesB(d);
    case "C":
      return blocDonneesC(d);
    case "D":
      return blocDonneesD(d);
    case "E":
      return blocDonneesE(d);
  }
}

export const LIBELLE_FAMILLE: Record<ExerciceMethodeGeneratrices["donnees"]["famille"], string> = {
  A: "A — Parallélogramme",
  B: "B — Triangle et céviennes parallèles",
  C: "C — Angles α et 2α, cercle",
  D: "D — Centre de gravité, médianes",
  E: "E — Perpendiculaires variables",
};

export function labelVariante(exercice: ExerciceMethodeGeneratrices): string {
  const d = exercice.donnees;
  if (d.famille === "D") return `${LIBELLE_FAMILLE.D} (sous-cas ${d.sousCas})`;
  return LIBELLE_FAMILLE[d.famille];
}

// ============================================================================
// Écrans 1-5 — STRUCTURE UNIQUE, partagée par les 5 familles (voir en-tête).
// ============================================================================

export function consigneEcran(exercice: ExerciceMethodeGeneratrices, phase: PhaseMethodeGeneratrices): string {
  switch (phase) {
    case "ecran1":
      return "Pose les équations des 2 génératrices, en fonction de x, y et α (une équation par génératrice).";
    case "ecran2":
      return "Élimine α entre les 2 équations CONFIRMÉES de l'étape précédente (technique du produit croisé/déterminant, ou toute manipulation équivalente) — donne le résultat BRUT, non simplifié, en x et y uniquement.";
    case "ecran3":
      return "Factorise complètement le résultat CONFIRMÉ de l'étape précédente (typiquement sous la forme (expression)·(expression)=0).";
    case "ecran4": {
      if (exercice.morceaux.length === 1) {
        return "Cette famille ne comporte NI lieu singulier NI lieu parasite — indique simplement le statut de l'unique morceau obtenu.";
      }
      const notePasDeParasite = exercice.morceaux.every((m) => m.statut !== "parasite") ? " Cette famille ne comporte PAS de lieu parasite — ne cherche pas à en trouver un par réflexe." : "";
      return `Indique le statut de chaque morceau de l'équation factorisée CONFIRMÉE (singulier : α y coïncide pour les 2 génératrices ; parasite : ne correspond à aucune valeur admissible de α ; propre : fait réellement partie du lieu).${notePasDeParasite}`;
    }
    case "ecran5":
      return "Décris complètement le lieu propre : donne son équation isolée, puis choisis la restriction correcte (le domaine admissible de α borne-t-il le lieu à un segment, exclut-il un point, ou n'y a-t-il aucune restriction ?).";
  }
}

/** Chaque valeur CONFIRMÉE est son PROPRE fragment, jamais concaténée avec son libellé français —
 * même précaution que `blocDonnees` ci-dessus (un `generatrice*`/`elimine*` peut être assez long,
 * ex. famille E avec des coefficients négatifs entre parenthèses).
 *
 * **Accumulation** (correctif transversal — le bloc "état actuel" doit lister TOUTES les réponses
 * validées des écrans précédents, du plus ancien au plus récent, jamais seulement celle de l'écran
 * immédiatement précédent, voir CLAUDE.md/`docs/historique-6e.md`) : `ecran3`/`ecran4`/`ecran5` ne
 * montraient auparavant QUE le résultat de l'écran immédiatement précédent (les génératrices de
 * `ecran1` disparaissaient dès `ecran3`, le résultat brut de `ecran2` disparaissait dès `ecran4`,
 * etc.) — corrigé en 4 fonctions `ligneXxx`, une par écran, concaténées cumulativement ci-dessous. */
function ligneGeneratrices(exercice: ExerciceMethodeGeneratrices): string[] {
  return [`\\text{Génératrice 1 (confirmée) :}`, versKatex(exercice.generatrice1), `\\text{Génératrice 2 (confirmée) :}`, versKatex(exercice.generatrice2)];
}
function ligneBrut(exercice: ExerciceMethodeGeneratrices): string[] {
  return [`\\text{Résultat brut (confirmé) :}`, versKatex(exercice.elimineBrut)];
}
function ligneFactorise(exercice: ExerciceMethodeGeneratrices): string[] {
  return [`\\text{Forme factorisée (confirmée) :}`, versKatex(exercice.elimineFactorise)];
}
function ligneMorceaux(exercice: ExerciceMethodeGeneratrices): string[] {
  return exercice.morceaux.flatMap((m) => [`\\text{${m.label}}`, `\\text{statut : }\\textbf{${m.statut}}\\text{ (confirmé)}`]);
}

export function etatActuel(exercice: ExerciceMethodeGeneratrices, phase: PhaseMethodeGeneratrices): string[] | null {
  switch (phase) {
    case "ecran1":
      return null;
    case "ecran2":
      return ligneGeneratrices(exercice);
    case "ecran3":
      return [...ligneGeneratrices(exercice), ...ligneBrut(exercice)];
    case "ecran4":
      return [...ligneGeneratrices(exercice), ...ligneBrut(exercice), ...ligneFactorise(exercice)];
    case "ecran5":
      return [...ligneGeneratrices(exercice), ...ligneBrut(exercice), ...ligneFactorise(exercice), ...ligneMorceaux(exercice)];
  }
}

export function champsEcran(exercice: ExerciceMethodeGeneratrices, phase: PhaseMethodeGeneratrices): ChampDef[] {
  switch (phase) {
    case "ecran1":
      return [champTexte("Génératrice 1 (en x, y, alpha) =", "ex : alpha*x-3*y=0"), champTexte("Génératrice 2 (en x, y, alpha) =", "ex : alpha*(x-3)+3*y=0")];
    case "ecran2":
      return [champTexte("Résultat brut de l'élimination (en x, y) =", "ex : 3*y*(2*x-3)=0")];
    case "ecran3":
      return [champTexte("Forme factorisée (en x, y) =", "ex : y*(2*x-3)=0")];
    case "ecran4":
      return exercice.morceaux.map((m) => ({
        type: "choix",
        label: `Statut du morceau « ${m.label} »`,
        options: [
          { valeur: "singulier", label: "Singulier" },
          { valeur: "parasite", label: "Parasite" },
          { valeur: "propre", label: "Propre" },
        ],
      }));
    case "ecran5":
      return [
        champTexte("Équation du lieu propre =", "ex : x=3"),
        { type: "choix", label: "Restriction sur ce lieu", options: exercice.optionsRestriction.map((o) => ({ valeur: o.id, label: o.label })) },
      ];
  }
}

export function niveauAideMaxEcran(): number {
  return 2;
}

export function aideNiveau1(_exercice: ExerciceMethodeGeneratrices, phase: PhaseMethodeGeneratrices): AideAvecLatex {
  switch (phase) {
    case "ecran1":
      return { texte: "Chaque génératrice est une droite qui passe par un point FIXE et un point qui dépend de α — écris son équation via le rapport des coordonnées (y/x = pente), ou via 2 points connus.", latex: null };
    case "ecran2":
      return { texte: "Isole α dans chacune des 2 équations, puis élimine-le en égalant les 2 expressions obtenues (ou en multipliant chaque équation par le coefficient de α de l'AUTRE, puis en soustrayant).", latex: null };
    case "ecran3":
      return { texte: "Cherche un facteur commun (souvent une constante, ou la variable y) à mettre en évidence.", latex: null };
    case "ecran4":
      return { texte: "Un morceau est singulier si les 2 génératrices deviennent LA MÊME droite pour une valeur précise de α (souvent α=0) — regarde ce qui se passe aux valeurs limites du domaine de α.", latex: null };
    case "ecran5":
      return { texte: "Le domaine admissible de α (souvent un intervalle ouvert) se traduit en une restriction sur le lieu : un segment (bornes exclues), un point exclu, ou aucune restriction si toutes les valeurs de α sont admissibles.", latex: null };
  }
}

export function aideNiveau2(exercice: ExerciceMethodeGeneratrices, phase: PhaseMethodeGeneratrices): AideAvecLatex {
  switch (phase) {
    case "ecran1":
      return { texte: "Génératrice 1, déjà résolue (la 2ᵉ reste à déterminer) :", latex: versKatex(exercice.generatrice1) };
    case "ecran2":
      return { texte: "Résultat brut, déjà obtenu :", latex: versKatex(exercice.elimineBrut) };
    case "ecran3":
      return { texte: "Forme factorisée, déjà obtenue :", latex: versKatex(exercice.elimineFactorise) };
    case "ecran4": {
      const premier = exercice.morceaux[0];
      return { texte: `Statut du premier morceau « ${premier.label} », déjà déterminé (les autres restent à déterminer) :`, latex: `\\textbf{${premier.statut}}` };
    }
    case "ecran5":
      return { texte: "Équation du lieu propre, déjà obtenue (la restriction reste à choisir) :", latex: versKatex(exercice.equationLieuPropre) };
  }
}

export const LIBELLE_PHASE: Record<PhaseMethodeGeneratrices, string> = {
  ecran1: "Étape 1 (équations des génératrices)",
  ecran2: "Étape 2 (élimination de α)",
  ecran3: "Étape 3 (factorisation)",
  ecran4: "Étape 4 (statut des morceaux)",
  ecran5: "Étape 5 (description du lieu propre)",
};

function libelleStatut(s: StatutMorceauLieu): string {
  return s === "singulier" ? "Singulier" : s === "parasite" ? "Parasite" : "Propre";
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceMethodeGeneratrices, phase: PhaseMethodeGeneratrices): string[] {
  switch (phase) {
    case "ecran1":
      return [versKatex(exercice.generatrice1), versKatex(exercice.generatrice2)];
    case "ecran2":
      return [versKatex(exercice.elimineBrut)];
    case "ecran3":
      return [versKatex(exercice.elimineFactorise)];
    case "ecran4":
      return exercice.morceaux.map((m) => `\\text{${m.label} : }\\textbf{${libelleStatut(m.statut)}}`);
    case "ecran5": {
      const restriction = exercice.optionsRestriction.find((o) => o.id === exercice.idRestrictionCorrecte);
      return [versKatex(exercice.equationLieuPropre), ...decouperEnFragmentsTexteKatex(restriction?.label ?? "")];
    }
  }
}

/** Total points du récapitulatif final — toujours 5×100 (les 5 écrans sont fixes, contrairement à
 * la plupart des autres générateurs 6e — voir en-tête `moteur6e/typesMethodeGeneratrices.ts`). */
export function calculerTotalPointsMethodeGeneratrices(resultat: ResultatExerciceMethodeGeneratrices): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
