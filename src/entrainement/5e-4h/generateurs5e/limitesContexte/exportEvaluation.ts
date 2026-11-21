import type { ExerciceLimitesContexte } from "../../core5e/limitesContexte.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  formatContexteTexte,
  formatReponseAttendueTexte,
  formatReponseAttenduePhaseLatex,
  formatTermesDonneesLatex,
  labelsChampsLatex,
  nombreTexte,
  texteAideNiveau1,
} from "../../ui5e/formatLimitesContexte";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimitesContexte } from "./index";
import { consigneEtapeLimitesContexte, correctionDetailleeLimitesContexte } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { profilLimitesContexte, FAMILLES_CALCULATRICE_LIMITES_CONTEXTE } from "../profilsEvaluationLimites22-23";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimitesContexte>` pour 5gen23 ("Limites et
 * asymptotes en contexte", `App5gen23.tsx`/`moteur5e/sessionLimitesContexte.ts`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence et
 * `generateurs5e/problemesContexte/exportEvaluation.ts` pour un exemple direct de condensation
 * d'un déroulé "en contexte" en questions papier.
 *
 * **4 familles, chacune sa propre séquence d'écrans** (`moteur5e/typesLimitesContexte.ts::ordreComplet`,
 * jamais un ordre variable dérivé de dimensions comme 5gen22) — condensées ici en 2 questions
 * papier par famille (une question par "thème" de l'écran, jamais une question par micro-écran) :
 * - `prixRevient` (3 écrans) → a) `asymptoteHorizontale` + `interpreter` fusionnés (calculer PUIS
 *   interpréter le même résultat, sans rupture) ; b) `vaSens`.
 * - `eauSalee` (3 écrans) → a) `construireC` + `limiteC` fusionnés (chaîne de calcul continue,
 *   même principe que le Système+Formule+Évaluation de `problemesContexte`) ; b) `interpreter`.
 * - `clubLoisirs` (4 écrans, AUCUN QCM) → a) `evaluer` + `inequation` fusionnés (évaluer f PUIS
 *   résoudre une inéquation sur f) ; b) `asymptoteOblique` + `interpreterPente` fusionnés (trouver
 *   l'asymptote PUIS interpréter sa pente).
 * - `population` (3 écrans) → a) `identification` + `interpreter` fusionnés (identifier a/b PUIS
 *   conclure croissance/régression à partir de b) ; b) `evaluerSeuil`.
 *
 * Contexte narratif (`formatContexteTexte`) et bloc de données (`formatTermesDonneesLatex`)
 * réutilisés TELS QUELS en tête d'énoncé (`enteteFragments`) — jamais reformulés. `enteteFragments`
 * est TOUJOURS rendu en mode KaTeX "bloc" (`assemblerEvaluationHtml.ts`) : chaque famille n'y place
 * qu'un texte narratif suivi d'UNE ou DEUX formules COMPLÈTES (jamais des fragments LaTeX courts
 * entrelacés avec du texte — voir le commentaire de tête de
 * `generateurs/distanceDroite/exportEvaluation.ts` pour le bug que ce motif éviterait). Le motif à 2
 * formules complètes séparées par un texte court (`eauSalee` : V(t) et Q(t)) suit le même patron
 * déjà utilisé par `generateurs5e/composerFonctions/exportEvaluation.ts` (deux fonctions définies
 * dans le même bloc d'entête), jamais une innovation risquée.
 *
 * **Écueil : les consignes `consignePhase(exercice, "interpreter"/"vaSens")` sont rédigées pour un
 * QCM** ("Choisis la phrase qui interprète correctement ce résultat.", "Choisis la justification
 * correcte.", etc.) — inutilisables telles quelles sur papier, où aucune liste d'options n'est
 * imprimée (voir `core5e/limitesContexte.types.ts::OptionInterpretation`, motif UNIQUEMENT
 * QCM/écran). Plutôt que d'omettre purement et simplement l'interprétation (ce que fait
 * `generateurs/triangleLies/exportEvaluation.ts` pour son propre écran QCM redondant), on la
 * transforme ici en question ouverte : `versJustificationEcrite` réutilise TEL QUEL le texte de
 * `consignePhase` (la question posée à l'écran ne change pas) et ne remplace QUE la dernière phrase
 * ("Choisis...") par une consigne de justification écrite — l'interprétation en contexte est le
 * cœur pédagogique de ce générateur ("Limites et asymptotes EN CONTEXTE"), elle ne peut pas être
 * simplement supprimée comme le fait triangleLies pour un écran secondaire. Le corrigé réutilise
 * `formatReponseAttendueTexte` (déjà le texte de l'option correcte, jamais reformulé) pour la
 * justification attendue.
 *
 * **Écueil secondaire** : `formatReponseAttenduePhaseLatex` omet le label pour 2 des 11 phases
 * (`clubLoisirs` "inequation"/"interpreterPente" renvoient la valeur seule, ex. `7\text{ mois}`,
 * sans le "x=" que `labelsChampsLatex` porte séparément — à la différence des 9 autres phases, déjà
 * rendues sous forme d'équation complète, ex. `f(0)\times100=400`). `avecLabel` ci-dessous zippe les
 * deux pour ces 2 cas précis, sans dupliquer aucun texte (labels ET valeurs viennent de `ui5e/`).
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues de l'instance tirée via les
 * formateurs déjà utilisés côté écran pour le récapitulatif final (`formatReponseAttenduePhaseLatex`/
 * `formatReponseAttendueTexte`, `ui5e/formatLimitesContexte.ts`) — jamais recalculée indépendamment.
 *
 * **PAS `regroupable`** : chaque famille produit 2 questions par instance (jamais une seule) avec
 * une consigne DÉPENDANTE des valeurs tirées (b, seuil, facteur, contexte narratif...), jamais une
 * constante générique — les 2 conditions requises sont donc violées, même raison que
 * `generateurs/triangleLies/exportEvaluation.ts`/`generateurs/distanceDroite/exportEvaluation.ts`.
 */

/** Zippe un label (`labelsChampsLatex`) avec sa valeur (`formatReponseAttenduePhaseLatex`) quand
 * cette dernière ne porte pas déjà le label — voir "Écueil secondaire" ci-dessus. */
function avecLabel(label: string, valeur: string): string {
  return `${label}${valeur}`;
}

// ============================================================================
// Feuilles et évaluations (méthode `.claude/rules/feuilles-evaluations.md`).
// Chaque famille garde ses VRAIES questions de problème (limite et interprétation, sens de l'AV,
// valeurs, seuil, asymptote et pente…) en a) b) c), rédigées pour le papier (plus aucune consigne de
// QCM « Choisis… » ni tournure d'écran) ; les écrans sont les étapes du corrigé, dans l'ordre de
// `ordreComplet`. Toutes les valeurs viennent des formateurs de l'écran (`ui5e/formatLimitesContexte.ts`).
// ============================================================================

type LettreEtape = "a" | "b" | "c" | "d";

/** Phase d'écran, typée via `ui5e/formatLimitesContexte.ts` (un générateur n'importe jamais le moteur). */
type PhaseLimitesContexte = Parameters<typeof texteAideNiveau1>[1];

/** Ordre des écrans par famille — copie fidèle de `moteur5e/typesLimitesContexte.ts::ordreComplet`
 * (à resynchroniser si l'écran change d'ordre). */
const ORDRE_ECRANS: Record<ExerciceLimitesContexte["famille"], PhaseLimitesContexte[]> = {
  prixRevient: ["asymptoteHorizontale", "interpreter", "vaSens"],
  eauSalee: ["construireC", "limiteC", "interpreter"],
  clubLoisirs: ["evaluer", "inequation", "asymptoteOblique", "interpreterPente"],
  population: ["identification", "interpreter", "evaluerSeuil"],
};

function enonceDonnees(exercice: ExerciceLimitesContexte): FragmentConsigne[] {
  const [formule1, formule2] = formatTermesDonneesLatex(exercice);
  return formule2
    ? [texte(`${formatContexteTexte(exercice)} `), latex(formule1), texte(" et "), latex(formule2), texte(".")]
    : [texte(`${formatContexteTexte(exercice)} `), latex(formule1), texte(".")];
}

/** Questions papier, une entrée par vraie question, avec les lettres d'étapes qu'elle couvre. */
function questionsPapier(exercice: ExerciceLimitesContexte): { consigne: FragmentConsigne[]; etapes: LettreEtape[] }[] {
  switch (exercice.famille) {
    case "prixRevient":
      return [
        { consigne: [texte("Calcule la limite du coût unitaire quand "), latex("x"), texte(" tend vers "), latex("+\\infty"), texte(", puis interprète ce résultat dans le contexte.")], etapes: ["a", "b"] },
        { consigne: [texte("L'asymptote verticale "), latex("x=0"), texte(" a-t-elle un sens dans ce contexte ? Justifie.")], etapes: ["c"] },
      ];
    case "eauSalee":
      return [
        { consigne: [texte(`Exprime la concentration ${exercice.contexte.quantitePhrase} à l'instant t, notée `), latex("C(t)"), texte(", puis calcule sa limite quand "), latex("t"), texte(" tend vers "), latex("+\\infty"), texte(".")], etapes: ["a", "b"] },
        { consigne: [texte("Ce résultat était-il prévisible sans calcul ? Justifie.")], etapes: ["c"] },
      ];
    case "clubLoisirs": {
      const { facteur, xEval, k0, contexte } = exercice;
      return [
        { consigne: [texte(`Calcule la valeur réelle (en ${contexte.unitePluriel}) à la création, puis après ${xEval} mois. Arrondis à l'unité.`)], etapes: ["a"] },
        { consigne: [texte(`Au bout de combien de mois entiers ${contexte.grandeurArticle} atteint-il pour la première fois ${k0 * facteur} ${contexte.unitePluriel} réels, c'est-à-dire `), latex(`f(x)\\geq ${k0}`), texte(" ?")], etapes: ["b"] },
        { consigne: [texte("Donne l'équation de l'asymptote oblique de la courbe de f en "), latex("+\\infty"), texte(`, puis interprète sa pente comme une évolution réelle (en ${contexte.unitePluriel} par mois).`)], etapes: ["c", "d"] },
      ];
    }
    case "population": {
      const x = exercice.anneeEval - exercice.anneeRef;
      return [
        {
          consigne: [
            texte("Écris "),
            latex("f(x)"),
            texte(" sous la forme "),
            latex("\\dfrac{a}{x+p}+b"),
            texte(` (division euclidienne), puis déduis-en si ${exercice.contexte.grandeurArticle} est en croissance ou en régression, et sa valeur limite à long terme.`),
          ],
          etapes: ["a", "b"],
        },
        {
          consigne: [
            texte(`Évalue ${exercice.contexte.grandeurArticle} en ${exercice.anneeEval}, c'est-à-dire `),
            latex(`f(${x})`),
            texte(` (arrondi au centième). Cette valeur est-elle supérieure ou inférieure au seuil de ${nombreTexte(exercice.seuil)} ${exercice.contexte.unitePourValeur} ?`),
          ],
          etapes: ["c"],
        },
      ];
    }
  }
}

function sectionPapierLimitesContexte(exercice: ExerciceLimitesContexte): SectionExercice {
  return { enteteFragments: enonceDonnees(exercice), questions: questionsPapier(exercice).map((q) => ({ consigne: q.consigne })) };
}

/** Étapes (titres « Étape n — consigne » du corrigé) : un écran par étape, consignes rédigées pour le
 * papier (`consigneEtapeLimitesContexte`) — les vraies questions papier restent dans `enoncePapier`. */
function construireEnonceLimitesContexte(exercice: ExerciceLimitesContexte): SectionExercice {
  return { enteteFragments: enonceDonnees(exercice), questions: ORDRE_ECRANS[exercice.famille].map((phase) => ({ consigne: consigneEtapeLimitesContexte(exercice, phase) })) };
}

function enoncePapierLimitesContexte(exercice: ExerciceLimitesContexte): EnoncePapier {
  return { section: sectionPapierLimitesContexte(exercice), etapesParQuestion: questionsPapier(exercice).map((q) => q.etapes) };
}

function reponseBreveLimitesContexte(exercice: ExerciceLimitesContexte): FragmentConsigne[] {
  const l = (phase: PhaseLimitesContexte) => formatReponseAttenduePhaseLatex(exercice, phase).flatMap((v, i) => [...(i === 0 ? [] : [texte(" ; ")]), latex(v)]);
  const t = (phase: PhaseLimitesContexte) => texte(formatReponseAttendueTexte(exercice, phase) ?? "");
  switch (exercice.famille) {
    case "prixRevient":
      return [texte("a) "), ...l("asymptoteHorizontale"), texte(" — "), t("interpreter"), texte(" ; b) "), t("vaSens")];
    case "eauSalee":
      return [texte("a) "), ...l("construireC"), texte(" ; "), ...l("limiteC"), texte(" ; b) "), t("interpreter")];
    case "clubLoisirs":
      return [texte("a) "), ...l("evaluer"), texte(` ; b) ${exercice.moisAttendu} mois ; c) `), ...l("asymptoteOblique"), texte(" ; "), ...l("interpreterPente")];
    case "population":
      return [texte("a) "), ...l("identification"), texte(" — "), t("interpreter"), texte(" ; b) "), ...l("evaluerSeuil")];
  }
}

function baremeLimitesContexte(exercice: ExerciceLimitesContexte): BaremeExercice {
  const c = (sousQuestion: LettreEtape, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  let criteres: CritereBareme[];
  const erreurs: ErreurFrequente[] = [];
  const acceptees: FragmentConsigne[][] = [];
  switch (exercice.famille) {
    case "prixRevient":
      criteres = [c("a", `Limite du coût unitaire : ${exercice.b} €`, 1.5), c("b", "Interprétation : le coût unitaire diminue vers ce plancher sans l'atteindre", 1), c("c", "L'asymptote verticale x = 0 n'a pas de sens (x ≥ nombre minimal), justifié", 1.5)];
      erreurs.push({ description: [texte("Limite donnée égale au coût fixe (le terme "), latex("\\dfrac{a}{x}"), texte(" tend vers 0, pas vers a)")], cout: "0 pt sur la limite" });
      acceptees.push([texte("Interprétation équivalente formulée avec ses mots (coût minimal vers lequel on tend, jamais atteint)")]);
      break;
    case "eauSalee":
      criteres = [
        { sousQuestion: "a", critere: [latex("C(t)=\\dfrac{Q(t)}{V(t)}"), texte(" bien construite (volume total)")], points: 1 },
        c("b", `Limite de C(t) : ${exercice.c} g/L`, 1.5),
        c("c", "Justification : le volume ajouté finit par imposer sa concentration", 1.5),
      ];
      erreurs.push({ description: [texte("Q(t) divisé par le seul volume ajouté")], cout: "0 pt sur a), suite notée sans double pénalité" });
      acceptees.push([texte("C(t) écrite sous une forme équivalente (numérateur et dénominateur divisés par un même nombre)")]);
      break;
    case "clubLoisirs":
      criteres = [c("a", "Valeurs réelles à la création et au mois demandé (conversion par le facteur)", 1), c("b", `Premier mois entier : ${exercice.moisAttendu}`, 1.5), c("c", "Équation de l'asymptote oblique", 0.75), c("d", "Pente convertie en évolution réelle par mois", 0.75)];
      erreurs.push({ description: [texte("Oubli de la conversion par le facteur (valeur laissée dans l'échelle du modèle)")], cout: "−0,5 sur a) et sur la pente" });
      erreurs.push({ description: [texte("Solution de l'équation arrondie à l'entier le plus proche au lieu de l'entier suivant")], cout: "−0,5 sur b)" });
      acceptees.push([texte("Asymptote écrite « y = … » ou « AO : y = … »")]);
      break;
    case "population":
      criteres = [c("a", `Division euclidienne : a = ${exercice.a}, b = ${exercice.b}`, 1.5), c("b", "Croissance ou régression justifiée par le signe de f(0) − b", 1), c("c", "Valeur au centième et comparaison au seuil", 1.5)];
      erreurs.push({ description: [texte("Conclusion croissance/régression tirée du seul signe de a")], cout: "0 pt sur la justification de b)" });
      acceptees.push([texte("Écriture "), latex("b+\\dfrac{a}{x+p}"), texte(" (termes dans l'autre ordre)")]);
      break;
  }
  return { reponseFinale: reponseBreveLimitesContexte(exercice), criteres, erreursFrequentes: erreurs, reponsesAcceptees: acceptees };
}

/** Niveau 1–7 : les interprétations (écrans à choix) sont des écrans de pure décision — prix de
 * revient b et c, eau salée c, population b — comme la conversion de la pente (club d) ; méthode :
 * 0 pour la limite directe du prix de revient, 1 sinon (construire C = Q/V, poser l'équation,
 * division euclidienne ; modèle donné : au plus 1) ; piège dans les DONNÉES : asymptote x = 0 hors du
 * domaine réel (prix de revient, constant), racine négative à rejeter et entier suivant (club) —
 * jamais le verdict croissance / régression ni la comparaison au seuil (population). Nombres :
 * profil `calcul` (club, population non exacte). */
function criteresDifficulteLimitesContexte(exercice: ExerciceLimitesContexte): CriteresDifficulte {
  const lecture: Record<ExerciceLimitesContexte["famille"], string[]> = { prixRevient: ["b", "c"], eauSalee: ["c"], clubLoisirs: ["d"], population: ["b"] };
  return {
    ...etapesDuCorrige(correctionDetailleeLimitesContexte(exercice), lecture[exercice.famille]),
    methode: exercice.famille === "prixRevient" ? 0 : 1,
    piege: exercice.famille === "prixRevient" || exercice.famille === "clubLoisirs" ? 1 : 0,
    // Nombres lus sur le profil (calculatrice), pas sur le « ≈ » que l'écran écrit même devant une valeur exacte.
    nombres: profilLimitesContexte(exercice).calcul === "calculatrice" ? 1 : 0,
  };
}

function construireCorrectionLimitesContexte(exercice: ExerciceLimitesContexte): BlocCorrection[] {
  switch (exercice.famille) {
    case "prixRevient": {
      const [limite] = formatReponseAttenduePhaseLatex(exercice, "asymptoteHorizontale");
      const interpretation = formatReponseAttendueTexte(exercice, "interpreter") ?? "";
      const vaSens = formatReponseAttendueTexte(exercice, "vaSens") ?? "";
      return [
        { type: "paragraphe", fragments: [texte("a) "), latex(limite), texte(" — " + interpretation)] },
        { type: "paragraphe", fragments: [texte("b) " + vaSens)] },
      ];
    }
    case "eauSalee": {
      const [construireC] = formatReponseAttenduePhaseLatex(exercice, "construireC");
      const [limiteC] = formatReponseAttenduePhaseLatex(exercice, "limiteC");
      const interpretation = formatReponseAttendueTexte(exercice, "interpreter") ?? "";
      return [
        { type: "paragraphe", fragments: [texte("a) "), latex(construireC), texte(", donc "), latex(limiteC), texte(".")] },
        { type: "paragraphe", fragments: [texte("b) " + interpretation)] },
      ];
    }
    case "clubLoisirs": {
      const [f0, fX] = formatReponseAttenduePhaseLatex(exercice, "evaluer");
      const [labelInequation] = labelsChampsLatex(exercice, "inequation");
      const [valeurInequation] = formatReponseAttenduePhaseLatex(exercice, "inequation");
      const [asymptoteOblique] = formatReponseAttenduePhaseLatex(exercice, "asymptoteOblique");
      const [labelPente] = labelsChampsLatex(exercice, "interpreterPente");
      const [valeurPente] = formatReponseAttenduePhaseLatex(exercice, "interpreterPente");
      return [
        {
          type: "paragraphe",
          fragments: [
            texte("a) "),
            latex(f0),
            texte(", "),
            latex(fX),
            texte(" — inéquation : "),
            latex(avecLabel(labelInequation, valeurInequation)),
            texte("."),
          ],
        },
        {
          type: "paragraphe",
          fragments: [texte("b) "), latex(asymptoteOblique), texte(" — pente interprétée : "), latex(avecLabel(labelPente, valeurPente)), texte(".")],
        },
      ];
    }
    case "population": {
      const [aLatex, bLatex] = formatReponseAttenduePhaseLatex(exercice, "identification");
      const interpretation = formatReponseAttendueTexte(exercice, "interpreter") ?? "";
      const [fLatex, comparaisonLatex] = formatReponseAttenduePhaseLatex(exercice, "evaluerSeuil");
      const positionSeuil = comparaisonLatex.includes(">") ? " (au-dessus du seuil)." : " (en dessous du seuil).";
      return [
        { type: "paragraphe", fragments: [texte("a) "), latex(aLatex), texte(", "), latex(bLatex), texte(" — " + interpretation)] },
        { type: "paragraphe", fragments: [texte("b) "), latex(fLatex), texte(", donc "), latex(comparaisonLatex), texte(positionSeuil)] },
      ];
    }
  }
}

export const adaptateurEvaluationLimitesContexte: AdaptateurFeuilleExercices<ExerciceLimitesContexte> = {
  // La famille « club » exige toujours la calculatrice (discriminant non carré) : avertissement du panneau.
  calculatriceIndispensable: [...FAMILLES_CALCULATRICE_LIMITES_CONTEXTE],
  titreDocument: "Limites et asymptotes en contexte — Évaluation",
  nomFichierBase: "limites-asymptotes-contexte",
  genererInstance: genererExerciceLimitesContexte,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceLimitesContexte,
  construireCorrection: construireCorrectionLimitesContexte,
  criteresDifficulte: criteresDifficulteLimitesContexte,
  reponseBreve: reponseBreveLimitesContexte,
  correctionDetaillee: correctionDetailleeLimitesContexte,
  bareme: baremeLimitesContexte,
  enoncePapier: enoncePapierLimitesContexte,
  profilInstance: profilLimitesContexte,
  // PAS regroupable — 2 questions par instance (jamais une seule), consigne dépendante des valeurs
  // tirées (b, seuil, facteur, contexte narratif...) : voir le commentaire de tête.
};
