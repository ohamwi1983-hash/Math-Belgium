import type { ExerciceOptimisation } from "../../core5e/optimisationGeometrique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGenerale, formatReponseAttendueEcranLatex, formatTermesDonneesLatex } from "../../ui5e/formatOptimisationGeometrique";
import {
  CATALOGUE_VARIANTES,
  alphaOptTrapeze,
  construireAvecVarianteId,
  genererExerciceOptimisation,
  valeurBaseSupTrapeze,
  valeurFOptimisation,
  valeurHauteurCylindre,
  valeurHauteurTrapeze,
  valeurLienFenetre,
  valeurLienMarges,
} from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceOptimisation>` pour 5gen32 ("Optimisation
 * géométrique", `App5gen32.tsx`/`moteur5e/sessionOptimisationGeometrique.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence et
 * `generateurs5e/limitesContexte/exportEvaluation.ts` pour l'exemple direct de condensation d'un
 * déroulé "en contexte narratif" en questions papier (même esprit ici).
 *
 * **7 familles structurellement disjointes** (`core5e/optimisationGeometrique.types.ts`), toutes
 * couvertes (le catalogue de variantes dev les couvre déjà toutes, et `ExerciceOptimisation` est un
 * type union exhaustif — omettre une famille casserait la compilation `switch`). 6 familles
 * partagent la même séquence d'écrans (`lien→construire→deriver→resoudre→justifier→conclure`,
 * +`application` en bonus rare pour "cylindre") condensée en 2 QUESTIONS PAPIER génériques :
 * - a) fusion `lien+construire+deriver` — isoler la dimension manquante, construire la fonction à
 *   une seule variable, la dériver. Chaîne de calcul continue, même principe que `eauSalee`
 *   (`limitesContexte/exportEvaluation.ts`).
 * - b) fusion `resoudre+justifier+conclure` — résoudre dérivée=0 (rejet de racine justifié si
 *   applicable), étudier le signe pour conclure max/min, donner les valeurs numériques finales.
 * - c) (cylindre, UNIQUEMENT si `avecApplicationNumerique`) — écran bonus `application` isolé,
 *   présent seulement pour cette variante rare (voir `SectionExercice.questions`, longueur
 *   variable selon l'instance — jamais un nombre fixe de questions par famille).
 * La 7e famille, "cubique" (bonus 2, reconstruction d'un polynôme — SANS RAPPORT avec
 * l'optimisation géométrique à proprement parler, voir tête de `core5e/optimisationGeometrique.types.ts`),
 * a sa PROPRE séquence (`coeffsImmediats→relation→resoudreA→expressionFinale`) condensée en 2
 * questions distinctes (a: coefficients immédiats + relation b(a) ; b: résolution de a + expression
 * finale).
 *
 * Contexte narratif/géométrique (`consigneGenerale`) et données d'énoncé (`formatTermesDonneesLatex`)
 * réutilisés TELS QUELS depuis `ui5e/formatOptimisationGeometrique.ts`, jamais reformulés.
 *
 * **Piège `enteteFragments` (toujours rendu en KaTeX `displayMode:true`, `assemblerEvaluationHtml.ts`)** :
 * `formatTermesDonneesLatex` renvoie PLUSIEURS termes courts pour "trapeze" (b, l), "margesA"/
 * "margesB" (T ou A, mh, mv — 3 termes !) et "cubique" (4 termes) — les entrelacer avec du texte en
 * `enteteFragments` (plusieurs fragments `latex()` séparés par des fragments `texte()`) casserait la
 * phrase narrative en blocs disjoints (voir consigne de tâche). On les joint ici en UN SEUL fragment
 * `latex()` (séparés par `,\ ` à l'intérieur d'une unique chaîne KaTeX) plutôt qu'un fragment par
 * terme — `enteteFragments` ne contient donc jamais plus d'UN texte narratif suivi d'UNE formule
 * (même motif "texte + 1-2 formules complètes" que `limitesContexte`/`problemesContexte`), jamais
 * plusieurs fragments latex courts alternés avec du texte.
 *
 * **Formules `lien`/`construire` par famille (correction, questions a)** : recopiées directement du
 * CORPS des fonctions `valeurLienMarges`/`valeurLienFenetre`/`valeurHauteurCylindre`/
 * `valeurFOptimisation` de ce même fichier `index.ts` (jamais re-dérivées indépendamment) — voir
 * chaque bloc `case` ci-dessous pour la correspondance explicite. Les dérivées F'(x) et la
 * résolution F'(x)=0 ont été vérifiées à la main (voir rapport de tâche) pour retomber EXACTEMENT
 * sur `xOpt`/`rOpt`/`alphaOptTrapeze` déjà connus de l'instance — présentées en LaTeX pour la
 * correction, mais jamais utilisées pour recalculer une valeur qui n'existe pas déjà dans
 * l'instance tirée.
 *
 * **Valeurs numériques finales (`conclure`)** RESYNTHÉTISÉES via les fonctions pures déjà utilisées
 * côté écran pour la vérification, répliquées d'identique façon (mais jamais importées) dans
 * `moteur5e/verificationOptimisationGeometrique.ts::diagnostiquerConclureXxx` — même patron que
 * `limitesContexte`. `formatReponseAttendueEcranLatex(exercice, "resoudre")` (`ui5e/`) est réutilisé
 * TEL QUEL pour le récapitulatif de la racine retenue (u/α pour "trapeze", x/r sinon) — seule phase
 * où ce formateur renvoie une valeur concrète pour les familles non-"cubique" (ses autres phases,
 * ex. "conclure", ne renvoient qu'un texte générique "voir bloc état actuel" pensé pour l'écran
 * interactif, inutilisable tel quel sur une feuille imprimée statique). Pour "cubique", ce même
 * formateur renvoie une valeur concrète à CHAQUE phase (coefficients déjà connus) — réutilisé pour
 * les 4 phases sans aucun calcul supplémentaire.
 *
 * **PAS `regroupable`** : 2-3 questions par instance (jamais une seule), ET la consigne dépend de la
 * FAMILLE tirée (7 familles, texte différent), jamais une constante générique indépendante des
 * valeurs/famille tirées — les 2 conditions requises sont violées (même raison que
 * `limitesContexte`/`triangleLies`/`distanceDroite`).
 */

// ============================================================================
// Formatage numérique — entier si (quasi) entier, sinon 2 décimales. Jamais un flottant brut.
// ============================================================================

function formatDecimal(valeur: number): string {
  const arrondi = Math.round(valeur);
  if (Math.abs(valeur - arrondi) < 1e-6) return `${arrondi}`;
  return valeur.toFixed(2);
}

/** Coefficient exact de π si `valeur` en est (quasi) un multiple entier, sinon décimal — utilisé
 * pour les grandeurs de "cylindre"/"fenetre" dont l'objectif optimal reste un multiple exact de π
 * (ex. cylindre : `S_min=6x_{opt}^2\pi`, vérifié par égalité avec `valeurFOptimisation`). */
function formatAvecPiEventuel(valeur: number): string {
  const coeff = valeur / Math.PI;
  const coeffArrondi = Math.round(coeff);
  if (Math.abs(coeff - coeffArrondi) < 1e-6) {
    if (coeffArrondi === 0) return "0";
    if (coeffArrondi === 1) return "\\pi";
    return `${coeffArrondi}\\pi`;
  }
  return formatDecimal(valeur);
}

function variableAffichee(exercice: ExerciceOptimisation): string {
  if (exercice.famille === "trapeze") return "\\alpha";
  if (exercice.famille === "fenetreA" || exercice.famille === "fenetreB") return "r";
  return "x";
}

// ============================================================================
// En-tête commune (texte narratif TEL QUEL + UN SEUL fragment latex regroupant les données —
// voir "Piège enteteFragments" en tête de fichier).
// ============================================================================

function enteteOptimisation(exercice: ExerciceOptimisation) {
  const donnees = formatTermesDonneesLatex(exercice).join(",\\ ");
  return [texte(`${consigneGenerale(exercice)} Données : `), latex(donnees)];
}

// ============================================================================
// Question a) — fusion lien + construire + deriver.
// ============================================================================

const GRANDEUR_OPTIMISEE: Record<Exclude<ExerciceOptimisation["famille"], "trapeze" | "cubique">, string> = {
  cylindre: "l'aire totale S du cylindre",
  margesA: "l'aire imprimée",
  margesB: "l'aire totale de la page",
  fenetreA: "l'aire de la fenêtre",
  fenetreB: "le périmètre extérieur de la fenêtre",
};

function consigneLienConstruireDeriver(exercice: ExerciceOptimisation): string {
  if (exercice.famille === "trapeze") {
    return "Exprime la hauteur h et la base supérieure B du trapèze en fonction de l'angle α, construis la fonction A(α) donnant l'aire du trapèze, puis calcule sa dérivée A'(α). Détaille chaque étape.";
  }
  if (exercice.famille === "cubique") {
    return "Donne c et d directement à partir des deux conditions en x=0, puis exprime b en fonction de a à partir de la deuxième tangente horizontale (en x=x₂). Détaille tes calculs.";
  }
  const v = variableAffichee(exercice);
  return `Isole la dimension manquante en fonction de ${v} à partir de la contrainte donnée, construis la fonction à une seule variable donnant ${GRANDEUR_OPTIMISEE[exercice.famille]}, puis calcule sa dérivée. Détaille chaque étape.`;
}

// ============================================================================
// Question b) — fusion resoudre + justifier + conclure.
// ============================================================================

const AVEC_REJET_RACINE: Partial<Record<ExerciceOptimisation["famille"], true>> = { margesA: true, margesB: true, fenetreB: true };
const NATURE_EXTREMUM: Partial<Record<ExerciceOptimisation["famille"], "maximum" | "minimum">> = {
  trapeze: "maximum",
  cylindre: "minimum",
  margesA: "maximum",
  margesB: "minimum",
  fenetreA: "maximum",
  fenetreB: "minimum",
};

function consigneResoudreJustifierConclure(exercice: ExerciceOptimisation): string {
  if (exercice.famille === "trapeze") {
    return "Pose u=cos(α), résous l'équation dérivée=0 pour u, puis donne α (en degrés). Calcule la dérivée seconde à cette valeur et interprète son signe pour justifier qu'il s'agit d'un maximum. Termine en donnant les valeurs numériques finales (hauteur, base supérieure, aire) dans le contexte de l'énoncé.";
  }
  if (exercice.famille === "cubique") {
    return "Utilise le point de passage supplémentaire donné pour résoudre et trouver a, puis écris l'expression complète de f(x).";
  }
  const v = variableAffichee(exercice);
  const rejet = AVEC_REJET_RACINE[exercice.famille] ? " Si une racine doit être rejetée, justifie ton choix." : "";
  return `Résous dérivée=0 et donne la valeur de ${v} retenue.${rejet} Étudie le signe de la dérivée avant et après cette valeur pour justifier qu'il s'agit d'un ${NATURE_EXTREMUM[exercice.famille]}, puis donne les valeurs numériques finales dans le contexte de l'énoncé.`;
}

// ============================================================================
// Énoncé.
// ============================================================================

function construireEnonceOptimisation(exercice: ExerciceOptimisation): SectionExercice {
  const questions = [
    { consigne: [texte(consigneLienConstruireDeriver(exercice))], reponse: { type: "lignes" as const, nombre: exercice.famille === "cubique" ? 4 : 5 } },
    { consigne: [texte(consigneResoudreJustifierConclure(exercice))], reponse: { type: "lignes" as const, nombre: exercice.famille === "cubique" ? 3 : 6 } },
  ];
  if (exercice.famille === "cylindre" && exercice.avecApplicationNumerique) {
    questions.push({
      consigne: [texte(`Utilise les dimensions optimales déjà trouvées pour calculer le coût total du matériau (prix unitaire : ${exercice.prixUnitaireMateriau} €/cm²).`)],
      reponse: { type: "lignes" as const, nombre: 2 },
    });
  }
  return { enteteFragments: enteteOptimisation(exercice), questions };
}

// ============================================================================
// Correction — question a) : formule "lien" (recopiée du corps de `valeurLienMarges`/
// `valeurLienFenetre`/`valeurHauteurCylindre`, jamais re-dérivée) + fonction objectif F(x).
// ============================================================================

function correctionLienEtFonction(exercice: ExerciceOptimisation): BlocCorrection {
  switch (exercice.famille) {
    case "trapeze":
      return {
        type: "paragraphe",
        fragments: [
          texte("a) "),
          latex(`h(\\alpha)=${exercice.l}\\sin(\\alpha),\\ B(\\alpha)=${exercice.b}+2\\cdot ${exercice.l}\\cos(\\alpha)`),
          texte(". Donc "),
          latex(`A(\\alpha)=\\frac{${exercice.b}+B(\\alpha)}{2}\\cdot h(\\alpha)=${exercice.l}\\cdot ${exercice.b}\\sin(\\alpha)+${exercice.l}^2\\sin(\\alpha)\\cos(\\alpha)`),
          texte(", d'où "),
          latex(`A'(\\alpha)=${exercice.l}\\cdot ${exercice.b}\\cos(\\alpha)+${exercice.l}^2(2\\cos^2(\\alpha)-1)`),
          texte("."),
        ],
      };
    case "cylindre": {
      const V = `${exercice.coeffV}\\pi`;
      return {
        type: "paragraphe",
        fragments: [
          texte("a) "),
          latex(`h(x)=\\frac{V}{\\pi x^2}=\\frac{${V}}{\\pi x^2}=\\frac{${exercice.coeffV}}{x^2}`),
          texte(", donc "),
          latex(`S(x)=2\\pi x^2+2\\pi x\\cdot h(x)=2\\pi x^2+\\frac{${2 * exercice.coeffV}\\pi}{x}`),
          texte(", d'où "),
          latex(`S'(x)=4\\pi x-\\frac{${2 * exercice.coeffV}\\pi}{x^2}`),
          texte("."),
        ],
      };
    }
    case "margesA":
      return {
        type: "paragraphe",
        fragments: [
          texte("a) "),
          latex(`y(x)=\\frac{T}{x+2m_h}-2m_v=\\frac{${exercice.T}}{x+${2 * exercice.mh}}-${2 * exercice.mv}`),
          texte(", donc "),
          latex(`F(x)=x\\cdot y(x)`),
          texte(", d'où "),
          latex(`F'(x)=\\frac{2m_h\\cdot T}{(x+2m_h)^2}-2m_v=\\frac{${2 * exercice.mh * (exercice.T as number)}}{(x+${2 * exercice.mh})^2}-${2 * exercice.mv}`),
          texte("."),
        ],
      };
    case "margesB":
      return {
        type: "paragraphe",
        fragments: [
          texte("a) "),
          latex(`y(x)=\\frac{A}{x}=\\frac{${exercice.A}}{x}`),
          texte(", donc "),
          latex(`F(x)=(x+2m_h)(y(x)+2m_v)`),
          texte(", d'où "),
          latex(`F'(x)=2m_v-\\frac{2m_h\\cdot A}{x^2}=${2 * exercice.mv}-\\frac{${2 * exercice.mh * (exercice.A as number)}}{x^2}`),
          texte("."),
        ],
      };
    case "fenetreA":
      return {
        type: "paragraphe",
        fragments: [
          texte("a) "),
          latex(`h(r)=\\frac{P-(2+\\pi)r}{2}`),
          texte(", donc "),
          latex(`F(r)=2r\\cdot h(r)+\\frac{\\pi r^2}{2}`),
          texte(", d'où "),
          latex(`F'(r)=P-(4+\\pi)r`),
          texte("."),
        ],
      };
    case "fenetreB":
      return {
        type: "paragraphe",
        fragments: [
          texte("a) "),
          latex(`h(r)=\\frac{A}{2r}-\\frac{\\pi r}{4}`),
          texte(", donc "),
          latex(`F(r)=2r+2h(r)+\\pi r`),
          texte(", d'où "),
          latex(`F'(r)=\\left(2+\\frac{\\pi}{2}\\right)-\\frac{A}{r^2}`),
          texte("."),
        ],
      };
    case "cubique":
      return {
        type: "paragraphe",
        fragments: [
          texte("a) "),
          latex(formatReponseAttendueEcranLatex(exercice, "coeffsImmediats")),
          texte(". "),
          latex(formatReponseAttendueEcranLatex(exercice, "relation")),
          texte("."),
        ],
      };
  }
}

// ============================================================================
// Correction — question b) : racine retenue (récap écran, `ui5e/`), signe/nature, valeurs
// numériques finales (RESYNTHÉTISÉES via les fonctions pures de `index.ts`, jamais recalculées
// indépendamment).
// ============================================================================

function correctionResolutionEtConclusion(exercice: ExerciceOptimisation): BlocCorrection {
  // Bug corrigé par rapport à la source plateforme-maths : la phase "resoudre" n'existe pas pour
  // "cubique" (sa propre séquence utilise "resoudreA"/"expressionFinale", voir le `case "cubique"`
  // ci-dessous) — `formatReponseAttendueEcranLatex(exercice, "resoudre")` y plante sur
  // `opt!.toFixed(2)` (`opt` vaut `null` pour cette famille). `racine` n'est de toute façon jamais
  // lu par le `case "cubique"`, donc calculé seulement pour les autres familles.
  const racine = exercice.famille === "cubique" ? "" : formatReponseAttendueEcranLatex(exercice, "resoudre");
  switch (exercice.famille) {
    case "trapeze": {
      const alphaOpt = alphaOptTrapeze(exercice);
      const hauteur = valeurHauteurTrapeze(exercice, alphaOpt);
      const baseSup = valeurBaseSupTrapeze(exercice, alphaOpt);
      const aire = valeurFOptimisation(exercice, alphaOpt);
      return {
        type: "paragraphe",
        fragments: [
          texte("b) "),
          latex(racine),
          texte(". "),
          latex(`A''(\\alpha)=-${exercice.l}\\sin(\\alpha)\\cdot B(\\alpha)`),
          texte(" est TOUJOURS négatif sur ]0;π/2[ (l>0, sin(α)>0, B(α)>0) : c'est un MAXIMUM. Conclusion : "),
          latex(`h_{opt}\\approx ${formatDecimal(hauteur)},\\ B_{opt}\\approx ${formatDecimal(baseSup)},\\ A_{max}\\approx ${formatDecimal(aire)}`),
          texte("."),
        ],
      };
    }
    case "cylindre": {
      const hauteur = valeurHauteurCylindre(exercice, exercice.xOpt);
      const aire = valeurFOptimisation(exercice, exercice.xOpt);
      return {
        type: "paragraphe",
        fragments: [
          texte("b) "),
          latex(racine),
          texte(" (racine cubique réelle unique, positive — pas de rejet). S' passe de − à + : MINIMUM. Conclusion : "),
          latex(`h_{opt}=${formatDecimal(hauteur)},\\ S_{min}=${formatAvecPiEventuel(aire)}\\text{ cm}^2`),
          texte("."),
        ],
      };
    }
    case "margesA": {
      const y = valeurLienMarges(exercice, exercice.xOpt);
      const aireImprimee = valeurFOptimisation(exercice, exercice.xOpt);
      return {
        type: "paragraphe",
        fragments: [
          texte("b) "),
          latex(racine),
          texte(" (l'autre racine est négative — une longueur ne peut pas être négative, on la rejette). F' passe de + à − : MAXIMUM. Conclusion : "),
          latex(`y_{opt}=${formatDecimal(y)},\\ A_{imprim\\acute{e}e,max}=${formatDecimal(aireImprimee)}`),
          texte("."),
        ],
      };
    }
    case "margesB": {
      const y = valeurLienMarges(exercice, exercice.xOpt);
      const aireTotale = valeurFOptimisation(exercice, exercice.xOpt);
      return {
        type: "paragraphe",
        fragments: [
          texte("b) "),
          latex(racine),
          texte(" (l'autre racine est négative — une longueur ne peut pas être négative, on la rejette). F' passe de − à + : MINIMUM. Conclusion : "),
          latex(`y_{opt}=${formatDecimal(y)},\\ T_{min}=${formatDecimal(aireTotale)}`),
          texte("."),
        ],
      };
    }
    case "fenetreA": {
      const hauteur = valeurLienFenetre(exercice, exercice.rOpt);
      const aire = valeurFOptimisation(exercice, exercice.rOpt);
      return {
        type: "paragraphe",
        fragments: [
          texte("b) "),
          latex(racine),
          texte(" (racine unique, linéaire — pas de rejet nécessaire). F' passe de + à − : MAXIMUM. Conclusion : "),
          latex(`h_{opt}\\approx ${formatDecimal(hauteur)},\\ \\text{Aire}_{max}\\approx ${formatDecimal(aire)}`),
          texte("."),
        ],
      };
    }
    case "fenetreB": {
      const hauteur = valeurLienFenetre(exercice, exercice.rOpt);
      const perimetre = valeurFOptimisation(exercice, exercice.rOpt);
      return {
        type: "paragraphe",
        fragments: [
          texte("b) "),
          latex(racine),
          texte(" (l'autre racine est négative — un rayon ne peut pas être négatif, on la rejette). F' passe de − à + : MINIMUM. Conclusion : "),
          latex(`h_{opt}\\approx ${formatDecimal(hauteur)},\\ P_{min}\\approx ${formatDecimal(perimetre)}`),
          texte("."),
        ],
      };
    }
    case "cubique":
      return {
        type: "paragraphe",
        fragments: [
          texte("b) "),
          latex(formatReponseAttendueEcranLatex(exercice, "resoudreA")),
          texte(". "),
          latex(formatReponseAttendueEcranLatex(exercice, "expressionFinale")),
          texte("."),
        ],
      };
  }
}

function construireCorrectionOptimisation(exercice: ExerciceOptimisation): BlocCorrection[] {
  const blocs: BlocCorrection[] = [correctionLienEtFonction(exercice), correctionResolutionEtConclusion(exercice)];
  if (exercice.famille === "cylindre" && exercice.avecApplicationNumerique) {
    const cout = (exercice.prixUnitaireMateriau ?? 0) * valeurFOptimisation(exercice, exercice.xOpt);
    blocs.push({ type: "paragraphe", fragments: [texte("c) "), latex(`\\text{Coût}=${exercice.prixUnitaireMateriau}\\times ${formatAvecPiEventuel(valeurFOptimisation(exercice, exercice.xOpt))}\\approx ${formatDecimal(cout)}\\text{ €}`)] });
  }
  return blocs;
}

// ============================================================================
// Export.
// ============================================================================

export const adaptateurEvaluationOptimisationGeometrique: AdaptateurFeuilleExercices<ExerciceOptimisation> = {
  titreDocument: "Optimisation géométrique — Évaluation",
  nomFichierBase: "optimisation-geometrique",
  genererInstance: genererExerciceOptimisation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceOptimisation,
  construireCorrection: construireCorrectionOptimisation,
  // PAS regroupable — 2-3 questions par instance (jamais une seule) ET consigne dépendante de la
  // famille tirée (7 familles, texte différent), jamais une constante générique : voir tête de
  // fichier.
};
