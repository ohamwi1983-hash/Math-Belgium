import type { ExerciceEtudeComplete, ExerciceEtudeCompleteBonus, ExerciceEtudeCompletePipeline } from "../../core5e/etudeComplete.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { CONSIGNE_GENERALE_CONSTRUCTION_INVERSE, CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase, formatFonctionLatex, formatProprietesConstructionInverseTexte, formatReponseAttenduePhaseLatex } from "../../ui5e/formatEtudeComplete";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeComplete } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeComplete>` pour 5gen24 ("Étude complète",
 * DERNIER générateur — synthèse — du chapitre "Limites et asymptotes", `App5gen24.tsx`) — voir
 * `generateurs/exerciceSynthese/exportEvaluation.ts` (chapitre 4e) pour la méthodologie de
 * consolidation écrans→questions papier appliquée ci-dessous, et
 * `generateurs5e/domaineDefinition/exportEvaluation.ts` pour la convention exacte du namespace 5e.
 *
 * **`f(x)` affiché UNE SEULE FOIS en tête de l'exercice** (`enteteFragments`), jamais répété
 * question par question — comme à l'écran (bloc "données" persistant de tout le pipeline,
 * `ui5e/formatEtudeComplete.ts::formatDonneesLatex`). ⚠️ Piège `enteteFragments` (toujours rendu en
 * mode KaTeX `displayMode:true` par `assemblerEvaluationHtml.ts`) : on s'en tient à UN SEUL fragment
 * `latex()` (l'expression de `f(x)` complète, via `formatFonctionLatex`), jamais plusieurs petits
 * fragments LaTeX entrelacés avec du texte — voir le commentaire de tête de
 * `generateurs/distanceDroite/exportEvaluation.ts` pour le motif du bug déjà corrigé ailleurs.
 * `question.consigne`/`BlocCorrection.paragraphe` n'ont PAS cette contrainte (rendus inline, jamais
 * `displayMode:true` par défaut) : on y mélange librement texte et plusieurs fragments LaTeX courts,
 * comme dans `generateurs/exerciceSynthese/exportEvaluation.ts`.
 *
 * **Consolidation du pipeline "etude" (8-9 écrans à longueur VARIABLE selon l'instance,
 * `moteur5e/typesEtudeComplete.ts::ordreComplet`) en 3 à 5 questions papier lettrées — jamais une
 * question par micro-écran :**
 * - a) "domaine" + "typeLimite" (toujours présents) → « Détermine le domaine de définition, précise
 *   la nature de chaque valeur exclue (point vide ou exclusion réelle). »
 * - b) [UNIQUEMENT si une exclusion est un point vide] "pointVideSimplification" +
 *   "pointVideLimite" + "pointVideConclusion" (3 écrans) → « Simplifie f(x), calcule la limite au
 *   point vide, conclus (AV ? domaine ?). »
 * - c) "limitesGD1"/"limitesGD2" (UN écran par exclusion RÉELLE, donc 1 ou 2) + "av" → « Limites à
 *   gauche/à droite de chaque exclusion réelle, puis équation(s) des asymptotes verticales. » —
 *   toujours présente : par construction (`core5e/etudeComplete.types.ts`), une exclusion isolée
 *   n'est jamais un point vide et 2 exclusions ne sont jamais toutes deux des points vides, donc il y
 *   a TOUJOURS au moins une exclusion réelle.
 * - d) "infini" + "coefDirecteur" (si `infini.type !== "horizontale"`) + "coefB" (si
 *   `infini.type === "oblique"`) + "asymptoteInfini" (toujours présents/conditionnels comme à
 *   l'écran) → « Limites en ±∞, coefficient directeur a et ordonnée b si besoin, équation de
 *   l'asymptote horizontale/oblique (ou aucune). »
 * - e) [UNIQUEMENT si `casSpecial` existe] "casSpecial" (1 écran → 1 question, consigne RÉUTILISÉE
 *   telle quelle via `consignePhase`, déjà un unique bloc LaTeX autonome avec `\text{}` intégré,
 *   donc directement représentable comme UN SEUL fragment `latex()`).
 *
 * Aucun écran "graphique" n'existe réellement dans `App5gen24.tsx` (contrairement à une hypothèse de
 * départ) : aucune question ni `enteteHtml`/illustration n'est donc ajoutée pour ça.
 *
 * **Variante bonus "constructionInverse"** (`ExerciceEtudeCompleteBonus`, `CATALOGUE_FAMILLES`
 * contient l'id `"bonus"`) : UNE SEULE question (une seule phase côté écran), consigne générique
 * `CONSIGNE_GENERALE_CONSTRUCTION_INVERSE`. Vérifiée par PROPRIÉTÉS côté écran (plusieurs fonctions
 * différentes acceptées) : le corrigé présente donc un exemple de réponse valide construit
 * algébriquement (`limite + 1/(x-r)`, ou `pente·x+ordonnée + 1/(x-r)`) à partir des propriétés
 * DÉJÀ CONNUES de l'instance — jamais LA réponse unique attendue, qui n'existe pas pour ce mode.
 *
 * **Corrections RESYNTHÉTISÉES depuis les valeurs déjà connues de l'instance, jamais recalculées
 * indépendamment** — chaque bloc réutilise `formatReponseAttenduePhaseLatex` (`ui5e/formatEtudeComplete.ts`),
 * la fonction déjà écrite pour révéler la réponse attendue de CHAQUE écran, jamais une seconde
 * implémentation des calculs de limites/asymptotes (qui vivent dans `moteur5e/verificationEtudeComplete.ts`,
 * jamais importé ici — couche A/couche B).
 *
 * **PAS `regroupable`** (voir la doc de `AdaptateurFeuilleExercices.regroupable`,
 * `export/genererFeuilleExercices.ts`) : cet adaptateur produit plusieurs questions par instance (3 à
 * 5 selon la combinaison tirée, jamais 1 seule), à consignes dépendantes des valeurs tirées (positions
 * des exclusions notamment) — aucun des 2 cas ne satisfait le mécanisme (réservé à UNE question
 * générique, identique quelle que soit l'instance).
 *
 * **Aucune zone de réponse fixe (`reponse` en lignes vierges uniquement, jamais de tableau)** — pas de
 * structure tabulaire à compléter dans ce générateur (contrairement à `exerciceSynthese`), un nombre
 * de lignes par question suffit.
 */

const LETTRES = "abcdefgh";

// ============================================================================
// Mode "etude" — pipeline domaine/limites/asymptotes.
// ============================================================================

function texteListePositions(exclusions: ExerciceEtudeCompletePipeline["exclusions"]): string {
  return exclusions.length === 1 ? `x=${exclusions[0].position}` : exclusions.map((e) => `x=${e.position}`).join(" et ");
}

function questionDomaine(): { consigne: FragmentConsigne[] } {
  return {
    consigne: [
      texte(
        "Détermine le domaine de définition de f (les valeurs qui annulent le dénominateur). Pour chaque valeur exclue, précise s'il s'agit d'un point vide (elle annule AUSSI le numérateur, forme indéterminée 0/0) ou d'une exclusion réelle (le dénominateur seul s'annule, limite infinie).",
      ),
    ],
  };
}

function correctionDomaine(exercice: ExerciceEtudeCompletePipeline, lettre: string): BlocCorrection[] {
  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettre}) Domaine : `),
        latex(`\\mathbb{R} \\setminus ${formatReponseAttenduePhaseLatex(exercice, "domaine")[0]}`),
        texte(". Nature de chaque valeur exclue (dans le même ordre) : "),
        latex(formatReponseAttenduePhaseLatex(exercice, "typeLimite")[0]),
        texte("."),
      ],
    },
  ];
}

function questionPointVide(exercice: ExerciceEtudeCompletePipeline): { consigne: FragmentConsigne[] } {
  const point = exercice.exclusions.find((e) => e.type === "pointVide");
  const position = point?.position;
  return {
    consigne: [
      texte(
        `Pour la valeur exclue en x=${position} (point vide) : factorise le numérateur et le dénominateur de f, simplifie le facteur commun, calcule la limite de f en ce point à l'aide de la forme simplifiée, puis conclus si cette valeur donne lieu à une asymptote verticale et si elle appartient au domaine.`,
      ),
    ],
  };
}

function correctionPointVide(exercice: ExerciceEtudeCompletePipeline, lettre: string): BlocCorrection[] {
  const point = exercice.exclusions.find((e) => e.type === "pointVide");
  return [
    {
      type: "paragraphe",
      fragments: [
        texte(`${lettre}) Forme simplifiée : f(x) = `),
        latex(formatReponseAttenduePhaseLatex(exercice, "pointVideSimplification")[0]),
        texte(` (pour x≠${point?.position}). Limite en x=${point?.position} : `),
        latex(formatReponseAttenduePhaseLatex(exercice, "pointVideLimite")[0]),
        texte(". Conclusion : "),
        latex(formatReponseAttenduePhaseLatex(exercice, "pointVideConclusion")[0]),
        texte("."),
      ],
    },
  ];
}

function questionAsymptotesVerticales(exercice: ExerciceEtudeCompletePipeline): { consigne: FragmentConsigne[] } {
  const vraies = exercice.exclusions.filter((e) => e.type !== "pointVide");
  return {
    consigne: [
      texte(
        `Pour ${vraies.length === 1 ? "l'exclusion réelle" : "chaque exclusion réelle"} trouvée en a) (${texteListePositions(vraies)}) : détermine la limite de f à gauche et à droite (une racine double donne une seule limite valable des deux côtés), puis donne l'équation de ${vraies.length === 1 ? "l'" : "chaque "}asymptote verticale.`,
      ),
    ],
  };
}

function correctionAsymptotesVerticales(exercice: ExerciceEtudeCompletePipeline, lettre: string): BlocCorrection[] {
  const vraies = exercice.exclusions
    .map((e, i) => ({ exclusion: e, phase: (i === 0 ? "limitesGD1" : "limitesGD2") as Parameters<typeof formatReponseAttenduePhaseLatex>[1] }))
    .filter((v) => v.exclusion.type !== "pointVide");

  const fragments: FragmentConsigne[] = [texte(`${lettre}) `)];
  vraies.forEach((v, i) => {
    if (i > 0) fragments.push(texte(" "));
    fragments.push(texte(`En x=${v.exclusion.position} : `), latex(formatReponseAttenduePhaseLatex(exercice, v.phase)[0]), texte("."));
  });
  fragments.push(texte(" Asymptote(s) verticale(s) : "), latex(formatReponseAttenduePhaseLatex(exercice, "av")[0]), texte("."));

  return [{ type: "paragraphe", fragments }];
}

function questionInfiniEtAsymptote(): { consigne: FragmentConsigne[] } {
  return {
    consigne: [
      texte(
        "Détermine les limites de f en −∞ et en +∞. Si l'une de ces limites est infinie, calcule le coefficient directeur a = lim f(x)/x à cette (ces) borne(s) ; si a est fini et non nul, calcule aussi b = lim(f(x) − ax). Donne enfin l'équation de l'asymptote horizontale ou oblique de f (ou indique qu'il n'y en a pas).",
      ),
    ],
  };
}

function correctionInfiniEtAsymptote(exercice: ExerciceEtudeCompletePipeline, lettre: string): BlocCorrection[] {
  const hasCoefDirecteur = exercice.infini.type !== "horizontale";
  const hasCoefB = exercice.infini.type === "oblique";
  const fragments: FragmentConsigne[] = [
    texte(`${lettre}) Limites en -∞ et +∞ : `),
    latex(formatReponseAttenduePhaseLatex(exercice, "infini")[0]),
    texte("."),
  ];
  if (hasCoefDirecteur) {
    fragments.push(texte(" Coefficient directeur a : "), latex(formatReponseAttenduePhaseLatex(exercice, "coefDirecteur")[0]), texte("."));
  }
  if (hasCoefB) {
    fragments.push(texte(" Ordonnée b : "), latex(formatReponseAttenduePhaseLatex(exercice, "coefB")[0]), texte("."));
  }
  fragments.push(texte(" Asymptote : "), latex(formatReponseAttenduePhaseLatex(exercice, "asymptoteInfini")[0]), texte("."));

  return [{ type: "paragraphe", fragments }];
}

function questionCasSpecial(exercice: ExerciceEtudeCompletePipeline): { consigne: FragmentConsigne[] } {
  // Réutilisation TELLE QUELLE de la consigne déjà écrite pour l'écran (`consignePhase`) : c'est déjà
  // UN SEUL bloc LaTeX autonome (`\text{...}` intégré au fragment mathématique), donc directement
  // représentable comme UN SEUL fragment `latex()` — aucune reformulation.
  return { consigne: [latex(consignePhase(exercice, "casSpecial"))] };
}

function correctionCasSpecial(exercice: ExerciceEtudeCompletePipeline, lettre: string): BlocCorrection[] {
  return [
    {
      type: "paragraphe",
      fragments: [texte(`${lettre}) Point de recoupement : `), latex(formatReponseAttenduePhaseLatex(exercice, "casSpecial")[0]), texte(".")],
    },
  ];
}

function construireEnonceEtude(exercice: ExerciceEtudeCompletePipeline): SectionExercice {
  const hasPointVide = exercice.exclusions.some((e) => e.type === "pointVide");
  const hasCasSpecial = !!exercice.casSpecial;

  const etapes: (() => { consigne: FragmentConsigne[] })[] = [() => questionDomaine()];
  if (hasPointVide) etapes.push(() => questionPointVide(exercice));
  etapes.push(() => questionAsymptotesVerticales(exercice));
  etapes.push(() => questionInfiniEtAsymptote());
  if (hasCasSpecial) etapes.push(() => questionCasSpecial(exercice));

  const NOMBRE_LIGNES: number[] = [3, ...(hasPointVide ? [4] : []), 4, 5, ...(hasCasSpecial ? [3] : [])];

  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE_ETUDE_COMPLETE} `), latex(formatFonctionLatex(exercice))],
    questions: etapes.map((construire, i) => ({ ...construire(), reponse: { type: "lignes" as const, nombre: NOMBRE_LIGNES[i] } })),
  };
}

function construireCorrectionEtude(exercice: ExerciceEtudeCompletePipeline): BlocCorrection[] {
  const hasPointVide = exercice.exclusions.some((e) => e.type === "pointVide");
  const hasCasSpecial = !!exercice.casSpecial;

  const etapes: ((ex: ExerciceEtudeCompletePipeline, lettre: string) => BlocCorrection[])[] = [correctionDomaine];
  if (hasPointVide) etapes.push(correctionPointVide);
  etapes.push(correctionAsymptotesVerticales, correctionInfiniEtAsymptote);
  if (hasCasSpecial) etapes.push(correctionCasSpecial);

  return etapes.flatMap((construire, i) => construire(exercice, LETTRES[i] ?? String(i + 1)));
}

// ============================================================================
// Mode "constructionInverse" — variante bonus.
// ============================================================================

/** (x−r), simplifié en "x" nu quand r=0 — petite primitive locale, RÉPLIQUÉE (jamais importée) car
 * `formatFacteurLatex` équivalent de `ui5e/formatEtudeComplete.ts` n'est pas exporté. */
function formatFacteurLocalLatex(racine: number): string {
  if (racine === 0) return "x";
  return racine >= 0 ? `x-${racine}` : `x+${-racine}`;
}

function formatAxBLatex(a: number, b: number): string {
  if (b === 0) return `${a}x`;
  return `${a}x${b > 0 ? "+" : "-"}${Math.abs(b)}`;
}

function construireEnonceConstructionInverse(exercice: ExerciceEtudeCompleteBonus): SectionExercice {
  const [p1, p2] = formatProprietesConstructionInverseTexte(exercice.proprietes);
  return {
    enteteFragments: [texte(`${p1} ${p2}`)],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE_CONSTRUCTION_INVERSE)], reponse: { type: "lignes", nombre: 4 } }],
  };
}

function construireCorrectionConstructionInverse(exercice: ExerciceEtudeCompleteBonus): BlocCorrection[] {
  const { racineDenominateur: r, asymptote } = exercice.proprietes;
  const denom = formatFacteurLocalLatex(r);
  const exempleLatex =
    asymptote.type === "horizontale" ? `f(x) = ${asymptote.limite} + \\dfrac{1}{${denom}}` : `f(x) = ${formatAxBLatex(asymptote.pente, asymptote.ordonnee)} + \\dfrac{1}{${denom}}`;

  return [
    {
      type: "paragraphe",
      fragments: [texte("Rappel des propriétés demandées : "), texte(formatProprietesConstructionInverseTexte(exercice.proprietes).join(" "))],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("Exemple de réponse valide (il en existe une infinité d'autres, toute réponse vérifiant les deux propriétés est acceptée) : "),
        latex(exempleLatex),
        texte(" — le dénominateur s'annule bien en "),
        latex(`x=${r}`),
        texte(", et le terme "),
        latex(`\\dfrac{1}{${denom}}`),
        texte(" tend vers 0 à l'infini des deux côtés, laissant apparaître l'asymptote demandée."),
      ],
    },
  ];
}

// ============================================================================
// Assemblage — dispatch par mode.
// ============================================================================

function construireEnonceEtudeComplete(exercice: ExerciceEtudeComplete): SectionExercice {
  return exercice.mode === "constructionInverse" ? construireEnonceConstructionInverse(exercice) : construireEnonceEtude(exercice);
}

function construireCorrectionEtudeComplete(exercice: ExerciceEtudeComplete): BlocCorrection[] {
  return exercice.mode === "constructionInverse" ? construireCorrectionConstructionInverse(exercice) : construireCorrectionEtude(exercice);
}

export const adaptateurEvaluationEtudeComplete: AdaptateurFeuilleExercices<ExerciceEtudeComplete> = {
  titreDocument: "Étude complète — Limites et asymptotes — Évaluation",
  nomFichierBase: "etude-complete-limites-asymptotes",
  genererInstance: genererExerciceEtudeComplete,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceEtudeComplete,
  construireCorrection: construireCorrectionEtudeComplete,
};
