import type { ExerciceVitessePosition } from "../../core5e/vitessePosition.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { consigneEcran, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex, phraseEnonce, segmentsEnonce } from "../../ui5e/formatVitessePosition";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVitessePosition } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceVitessePosition>` pour 5gen35 ("Vitesse et
 * position", `App5gen35.tsx`/`moteur5e/sessionVitessePosition.ts`), DERNIER générateur du chapitre
 * "Dérivées et applications" (5e) — voir `generateurs/analyseFonction/exportWord.ts` pour le
 * mécanisme générique de référence et `generateurs5e/limitesContexte/exportEvaluation.ts` pour un
 * exemple direct de condensation d'un déroulé "en contexte" en questions papier (patron suivi ici).
 *
 * **2 variantes STRUCTURELLEMENT DISJOINTES** (`core5e/vitessePosition.types.ts::ExerciceVitessePosition`),
 * chacune sa propre séquence d'écrans (`moteur5e/typesVitessePosition.ts::ordreEcransVitessePosition`,
 * jamais un ordre variable), condensées ici en 2 questions papier chacune (une question par "phase"
 * du mouvement, jamais une question par micro-écran) :
 * - "A" (5 écrans : derivee, evaluerV0, resoudre, vitessePointe, conversion) → a) dériver e(t),
 *   évaluer v(t₀), résoudre e(t)=D (chaîne de calcul continue, un seul régime de mouvement, jamais
 *   de rupture avant la fin de la course) ; b) vitesse de pointe + conversion km/h.
 * - "B" (6 écrans : mêmes 3 premiers + resoudre sur D₁, puis vitessePointe, segmentConstant,
 *   tempsTotal) → a) mêmes 3 écrans + vitessePointe (tout le régime accéléré, jusqu'au point de
 *   passage) ; b) segmentConstant + tempsTotal (changement de modèle explicite : vitesse constante
 *   sur le segment restant, PUIS somme des 2 temps — voir `core5e/vitessePosition.types.ts` en-tête
 *   de `ExerciceVitessePositionB`).
 *
 * **Écart assumé par rapport à la tâche de départ** : la tâche évoquait génériquement une
 * "accélération a(t)=x''(t)" et une "interprétation du sens du mouvement/accélération-décélération"
 * — mais ce générateur (lu en entier, `core5e/vitessePosition.types.ts` + `generateurs5e/
 * vitessePosition/index.ts` + `App5gen35.tsx`) n'a NI écran de dérivée seconde NI notion de sens du
 * mouvement : e(t) est une distance PARCOURUE (toujours croissante), a est une CONSTANTE
 * d'accélération donnée par construction (jamais calculée par l'élève), et le cœur pédagogique est
 * la résolution d'une équation du second degré (rejet de la racine négative) + un changement de
 * modèle explicite (régime accéléré → vitesse constante, variante B). Les questions papier
 * ci-dessous suivent donc le déroulé RÉEL du générateur, jamais la description générique de la
 * tâche.
 *
 * Contexte narratif (`phraseEnonce`) réutilisé TEL QUEL — `segmentsEnonce` (déjà utilisé côté écran
 * pour scinder le texte au niveau des délimiteurs `$...$`) est réutilisé directement pour convertir
 * cette même phrase en `FragmentConsigne[]` (texte + UNE formule LaTeX complète mêlée, e(t) —
 * JAMAIS de fragment LaTeX court isolé, voir le commentaire de tête de `generateurs5e/
 * distanceDroite/exportEvaluation.ts` pour le bug que ce motif évite). `t₀` n'apparaît PAS dans la
 * prose narrative (seul e(t) et D/D₁ y figurent) : il est ajouté séparément en tant que DEUXIÈME
 * formule complète (dernier terme de `formatTermesDonneesLatex`, réutilisé TEL QUEL) — même motif
 * "2 formules complètes séparées par un texte court" déjà validé par `generateurs5e/
 * composerFonctions/exportEvaluation.ts` et `generateurs5e/limitesContexte/exportEvaluation.ts`.
 *
 * **Consignes d'écran (`consigneEcran`, `ui5e/formatVitessePosition.ts`) réutilisées TELLES
 * QUELLES et simplement concaténées** pour former les 2 questions, à 2 exceptions documentées :
 * - `resoudre` est rédigée pour un écran avec QCM de justification ("... puis choisis la bonne
 *   justification pour le rejet de l'une d'elles.") — inutilisable telle quelle sur papier, où
 *   aucune liste d'options n'est imprimée (`core5e/vitessePosition.types.ts::OptionJustification`,
 *   motif UNIQUEMENT QCM/écran, même situation que `limitesContexte`). `versJustificationEcrite`
 *   ci-dessous ne remplace QUE cette fin par une consigne de justification écrite ouverte — même
 *   principe que la fonction homonyme de `generateurs5e/limitesContexte/exportEvaluation.ts`.
 * - `segmentConstant`/`tempsTotal` référencent des "écrans" ("calculée à l'écran précédent", "trouvé
 *   à l'écran « Résoudre »") — un repère qui n'a pas de sens sur une feuille imprimée où les écrans
 *   fusionnent en question a)/b). `versPapier` ci-dessous ne remplace QUE ces 2 références d'écran
 *   par un repère papier ("que tu viens de calculer", "à la question précédente"), sans toucher au
 *   reste du texte (le calcul demandé, lui, ne change pas).
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues de l'instance tirée, via
 * `formatReponseAttenduePhaseLatex` (déjà les formes canoniques confirmées utilisées côté écran
 * pour le récapitulatif final, `ui5e/formatVitessePosition.ts`) — jamais recalculée
 * indépendamment. La justification écrite attendue (racine rejetée) réutilise directement
 * `exercice.optionsRejetRacine.find(o => o.correcte)!.texte` — le texte de l'option correcte est
 * déjà stocké sur l'instance tirée (mélangé à la génération, mais le champ `correcte` le retrouve
 * sans jamais dupliquer `OPTIONS_REJET_BASE` ici).
 *
 * **PAS `regroupable`** : chaque instance produit 2 questions (jamais une seule), avec une consigne
 * DÉPENDANTE des valeurs tirées (D vs D₁ dans la consigne "resoudre", contexte narratif propre à
 * chaque instance) — les 2 conditions requises sont donc violées, même raison que
 * `generateurs5e/limitesContexte/exportEvaluation.ts`.
 */

/** Remplace la fin "Choisis la bonne justification..." (rédigée pour un QCM écran) par une
 * consigne de justification écrite — la question elle-même (tout ce qui précède) reste le texte
 * EXACT de `consigneEcran(exercice, "resoudre")`, jamais reformulée. Voir le commentaire de tête. */
function versJustificationEcrite(consigneResoudre: string): string {
  return consigneResoudre.replace(
    /Indique les deux, puis choisis la bonne justification pour le rejet de l'une d'elles\.$/,
    "Indique les deux, puis justifie pourquoi l'une d'elles est rejetée.",
  );
}

/** Remplace une référence d'écran ("à l'écran précédent"/"à l'écran « Résoudre »") par un repère
 * papier — voir le commentaire de tête pour le détail de cet écueil. */
function versPapier(consigneEcranTexte: string): string {
  return consigneEcranTexte.replace("à l'écran précédent", "que tu viens de calculer").replace("à l'écran « Résoudre »", "à la question précédente");
}

/** Phrase narrative (contexte + e(t)) convertie en `FragmentConsigne[]` — voir le commentaire de
 * tête pour pourquoi `segmentsEnonce`/`phraseEnonce` sont réutilisés TELS QUELS. */
function fragmentsContexte(exercice: ExerciceVitessePosition): FragmentConsigne[] {
  return segmentsEnonce(phraseEnonce(exercice)).map((segment) => (segment.type === "katex" ? latex(segment.valeur) : texte(segment.valeur)));
}

function construireEntete(exercice: ExerciceVitessePosition): FragmentConsigne[] {
  const termes = formatTermesDonneesLatex(exercice);
  const t0Terme = termes[termes.length - 1];
  return [...fragmentsContexte(exercice), texte(" "), latex(t0Terme)];
}

function construireEnonceVitessePosition(exercice: ExerciceVitessePosition): SectionExercice {
  const consigneA = `${consigneEcran(exercice, "derivee")} ${consigneEcran(exercice, "evaluerV0")} ${versJustificationEcrite(consigneEcran(exercice, "resoudre"))}`;

  if (exercice.variante === "A") {
    const consigneB = `${consigneEcran(exercice, "vitessePointe")} ${consigneEcran(exercice, "conversion")}`;
    return {
      enteteFragments: construireEntete(exercice),
      questions: [
        { consigne: [texte(consigneA)], reponse: { type: "lignes", nombre: 6 } },
        { consigne: [texte(consigneB)], reponse: { type: "lignes", nombre: 3 } },
      ],
    };
  }

  const consigneAAvecPointe = `${consigneA} ${consigneEcran(exercice, "vitessePointe")}`;
  const consigneB = `${versPapier(consigneEcran(exercice, "segmentConstant"))} ${versPapier(consigneEcran(exercice, "tempsTotal"))}`;
  return {
    enteteFragments: construireEntete(exercice),
    questions: [
      { consigne: [texte(consigneAAvecPointe)], reponse: { type: "lignes", nombre: 7 } },
      { consigne: [texte(consigneB)], reponse: { type: "lignes", nombre: 4 } },
    ],
  };
}

function construireCorrectionVitessePosition(exercice: ExerciceVitessePosition): BlocCorrection[] {
  const [vDeT] = formatReponseAttenduePhaseLatex(exercice, "derivee");
  const [v0] = formatReponseAttenduePhaseLatex(exercice, "evaluerV0");
  const [racineRetenue, racineRejetee] = formatReponseAttenduePhaseLatex(exercice, "resoudre");
  const [vitessePointe] = formatReponseAttenduePhaseLatex(exercice, "vitessePointe");
  const justification = exercice.optionsRejetRacine.find((option) => option.correcte)!.texte;

  if (exercice.variante === "A") {
    const [conversion] = formatReponseAttenduePhaseLatex(exercice, "conversion");
    return [
      {
        type: "paragraphe",
        fragments: [
          texte("a) "),
          latex(vDeT),
          texte(" ; "),
          latex(v0),
          texte(" ; "),
          latex(racineRetenue),
          texte(", "),
          latex(racineRejetee),
          texte(" — " + justification),
        ],
      },
      { type: "paragraphe", fragments: [texte("b) "), latex(vitessePointe), texte(" ; "), latex(conversion)] },
    ];
  }

  const [segmentConstant] = formatReponseAttenduePhaseLatex(exercice, "segmentConstant");
  const [tempsTotal] = formatReponseAttenduePhaseLatex(exercice, "tempsTotal");
  return [
    {
      type: "paragraphe",
      fragments: [
        texte("a) "),
        latex(vDeT),
        texte(" ; "),
        latex(v0),
        texte(" ; "),
        latex(racineRetenue),
        texte(", "),
        latex(racineRejetee),
        texte(" — " + justification + " ; "),
        latex(vitessePointe),
      ],
    },
    { type: "paragraphe", fragments: [texte("b) "), latex(segmentConstant), texte(" ; "), latex(tempsTotal)] },
  ];
}

export const adaptateurEvaluationVitessePosition: AdaptateurFeuilleExercices<ExerciceVitessePosition> = {
  titreDocument: "Vitesse et position — Évaluation",
  nomFichierBase: "vitesse-position",
  genererInstance: genererExerciceVitessePosition,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceVitessePosition,
  construireCorrection: construireCorrectionVitessePosition,
  // PAS regroupable — 2 questions par instance (jamais une seule), consigne dépendante des valeurs
  // tirées (D vs D₁ dans "resoudre", contexte narratif propre à chaque instance) : voir le
  // commentaire de tête.
};
