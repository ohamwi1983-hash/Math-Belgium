import type { ExerciceCercleTrigonometrique, Quadrant, Signe, SigneTan, VarianteCercleTrigId } from "../../core/cercleTrigonometrique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatEnonceCercleTrigLatex, libelleQuadrant } from "../../ui/formatCercleTrigonometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercleTrigonometrique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCercleTrigonometrique>` pour gen14 (Placement et
 * lecture sur le cercle trigonométrique — chapitre 3, `AppCercleTrigonometrique.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/quelAngle/exportEvaluation.ts` (gen18, même chapitre) pour la décision jumelle sur
 * l'absence de graphique papier, reprise ici pour la même raison.
 *
 * Écran → question : `sessionCercleTrigonometrique.ts` enchaîne 4 phases dans l'ordre
 * [reduction] → quadrant → anglePremierQuadrant → signes ("reduction" n'existe comme écran séparé
 * que si `necessiteReduction`, mais les 3 variantes de `CATALOGUE_VARIANTES` ci-dessous imposent
 * TOUJOURS un `angleDepart !== angleReduit` — voir le commentaire de tête de
 * `generateurs/cercleTrigonometrique/index.ts` — donc les 4 phases sont toujours présentes pour
 * n'importe quelle instance tirée ici). Ceci devient ici 4 questions a/b/c/d, dans le même ordre,
 * jamais recombinées : (a) réduire l'angle dans [0°,360°[ (écran "Réduction", saisie numérique
 * simple) ; (b) quadrant ou axe (écran "Quadrant", QCM texte ici — voir plus bas pourquoi jamais un
 * graphique) ; (c) angle du premier quadrant (écran "Angle du premier quadrant", saisie numérique) ;
 * (d) signe de sin θ/cos θ/tan θ (écran "Signes", tableau à cellules cycliques à l'écran → tableau
 * vierge à 3 lignes/1 colonne ici, même patron que `signesProduit/exportEvaluation.ts`).
 *
 * Pourquoi AUCUN graphique papier (ni `enteteHtml`, ni `ZoneReponse` dessinée) — décision documentée
 * comme pour gen18 : l'écran "Quadrant" interactif (`CercleQuadrantSelecteur.tsx`) ne montre JAMAIS
 * l'angle de l'énoncé placé sur le cercle (voir son commentaire de tête, "Ce sélecteur ne montre
 * jamais l'angle de l'énoncé") — précisément pour ne pas révéler la réponse au clic. Dessiner un
 * cercle avec l'angle déjà placé dans l'énoncé papier ferait donc PIRE que l'écran interactif :
 * ça donnerait visuellement la réponse aux questions (b)/(c)/(d) avant même que l'élève ne
 * raisonne. Le seul contenu graphique existant pour cet exercice est le tracé du TRAJET
 * (`AideReductionCercleTrig.tsx`/`AideAnglePremierQuadrantCercleTrig.tsx`/`AideSignesCercleTrig.tsx`,
 * `ui/cercleTrigTrajet.ts`) : réservé au bouton "Aide" optionnel de l'écran, jamais affiché
 * d'emblée — même statut que l'aide géométrique de `AideQuelAngle.tsx` pour gen18, donc pas plus
 * reproduit ici que là-bas. L'énoncé papier reste donc purement l'angle en degrés
 * (`formatEnonceCercleTrigLatex`, déjà la même formule affichée sur les 4 écrans à l'écran), et les
 * 4 questions sont du texte/calcul, jamais un tracé à produire.
 *
 * PAS `regroupable` : 4 questions par instance (jamais 1 seule) — un des 3 cas explicitement exclus
 * par la doc de `AdaptateurFeuilleExercices.regroupable` (`genererFeuilleExercices.ts`).
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`angleReduit`/`quadrant`/`anglePremierQuadrant`/`signeSin`/`signeCos`/`signeTan`, tous calculés
 * une seule fois à la génération par `generateurs/cercleTrigonometrique/quadrantCalculs.ts` — jamais
 * recalculés indépendamment ici), en réutilisant directement `ui/formatCercleTrigonometrique.ts`
 * (`formatEnonceCercleTrigLatex`, `libelleQuadrant`, déjà les fonctions utilisées côté écran par les
 * 4 composants `Etape*CercleTrig.tsx`) plutôt que d'en resynthétiser de nouvelles. Le détail du calcul
 * de réduction (nombre de tours de 360° ajoutés/retranchés) et la règle de signe par quadrant
 * ("ASTC") sont en revanche un texte de résolution nouveau : aucune des 3 aides existantes
 * (`AideReductionCercleTrig.tsx` etc.) n'expose de texte à concaténer, seulement une construction
 * géométrique (même situation que gen7, voir `analyseFonction/exportWord.ts`).
 */

const LIBELLE_SIGNE: Record<Signe | SigneTan, string> = {
  "+": "positif (+)",
  "-": "négatif (−)",
  "0": "nul (0)",
  indefini: "non définie (∄)",
};

/** Valeur brute affichée dans la cellule du tableau (correction) — jamais la phrase complète de
 * `LIBELLE_SIGNE`, réservée au paragraphe de raisonnement. */
function symboleSigne(valeur: Signe | SigneTan): string {
  return valeur === "-" ? "−" : valeur === "indefini" ? "∄" : valeur;
}

const LIBELLES_LIGNES_SIGNES = ["sin θ", "cos θ", "tan θ"];

/**
 * Texte de réduction : nombre de tours de 360° à ajouter (`angleDepart` négatif) ou retrancher
 * (`angleDepart` ≥ 360°) pour retomber sur `angleReduit` — toujours un entier non nul ici, les 3
 * variantes de ce générateur garantissant `angleDepart !== angleReduit` (voir commentaire de tête).
 */
function texteReduction(exercice: ExerciceCercleTrigonometrique): string {
  const { angleDepart, angleReduit } = exercice;
  const nbAjouts = (angleReduit - angleDepart) / 360;
  if (nbAjouts > 0) {
    const decalage = nbAjouts * 360;
    const multiple = nbAjouts > 1 ? `${nbAjouts} × 360° = ${decalage}°` : "360°";
    return `${angleDepart}° n'est pas dans [0°,360°[. On y ajoute ${multiple} : ${angleDepart}° + ${decalage}° = ${angleReduit}°.`;
  }
  const k = -nbAjouts;
  const decalage = k * 360;
  const multiple = k > 1 ? `${k} × 360° = ${decalage}°` : "360°";
  return `${angleDepart}° n'est pas dans [0°,360°[. On lui retranche ${multiple} : ${angleDepart}° − ${decalage}° = ${angleReduit}°.`;
}

/** Justification du quadrant/axe à partir de `angleReduit`, mêmes bornes que `calculerQuadrant`
 * (`quadrantCalculs.ts`), jamais recalculées différemment ici. */
function texteJustificationQuadrant(exercice: ExerciceCercleTrigonometrique): string {
  const { angleReduit, quadrant } = exercice;
  const raison: Record<Quadrant, string> = {
    axeOx: `${angleReduit}° tombe exactement sur l'axe Ox`,
    axeOy: `${angleReduit}° tombe exactement sur l'axe Oy`,
    I: `${angleReduit}° ∈ ]0° ; 90°[`,
    II: `${angleReduit}° ∈ ]90° ; 180°[`,
    III: `${angleReduit}° ∈ ]180° ; 270°[`,
    IV: `${angleReduit}° ∈ ]270° ; 360°[`,
  };
  return `L'angle réduit vaut ${angleReduit}°. Or ${raison[quadrant]} → ${libelleQuadrant(quadrant)}.`;
}

/** Justification de l'angle du premier quadrant — même règle que `calculerAnglePremierQuadrant`
 * (`quadrantCalculs.ts`), jamais recalculée différemment ici. */
function texteJustificationAnglePremierQuadrant(exercice: ExerciceCercleTrigonometrique): string {
  const { angleReduit, quadrant, anglePremierQuadrant } = exercice;
  switch (quadrant) {
    case "axeOx":
      return `${angleReduit}° est déjà sur l'axe Ox (angle de référence) : angle du premier quadrant = 0°.`;
    case "axeOy":
      return `${angleReduit}° est déjà sur l'axe Oy (angle de référence) : angle du premier quadrant = 90°.`;
    case "I":
      return `Dans le quadrant I, l'angle réduit est déjà l'angle du premier quadrant : ${angleReduit}°.`;
    case "II":
      return `Dans le quadrant II, angle du premier quadrant = 180° − ${angleReduit}° = ${anglePremierQuadrant}°.`;
    case "III":
      return `Dans le quadrant III, angle du premier quadrant = ${angleReduit}° − 180° = ${anglePremierQuadrant}°.`;
    case "IV":
      return `Dans le quadrant IV, angle du premier quadrant = 360° − ${angleReduit}° = ${anglePremierQuadrant}°.`;
  }
}

/** Règle "ASTC" (tous positifs en I, Sinus en II, Tangente en III, Cosinus en IV) + cas particuliers
 * des 2 axes — reprend la même dérivation que `calculerSigneSin`/`calculerSigneCos`/`calculerSigneTan`
 * (`quadrantCalculs.ts`), jamais recalculée différemment ici. */
function texteJustificationSignes(exercice: ExerciceCercleTrigonometrique): string {
  const { quadrant } = exercice;
  switch (quadrant) {
    case "axeOx":
      return "Sur l'axe Ox, le point M(θ) est sur l'axe des cosinus : sin θ et tan θ sont nuls, seul cos θ est non nul (+1 ou −1 selon le côté).";
    case "axeOy":
      return "Sur l'axe Oy, le point M(θ) est sur l'axe des sinus : cos θ est nul, donc tan θ = sin θ / cos θ n'est pas définie ; sin θ vaut +1 ou −1 selon le côté.";
    case "I":
      return "Dans le quadrant I, sin θ, cos θ et tan θ sont tous positifs.";
    case "II":
      return "Dans le quadrant II, seul sin θ est positif ; cos θ et tan θ sont négatifs.";
    case "III":
      return "Dans le quadrant III, seul tan θ est positif ; sin θ et cos θ sont négatifs.";
    case "IV":
      return "Dans le quadrant IV, seul cos θ est positif ; sin θ et tan θ sont négatifs.";
  }
}

function construireEnonceCercleTrigonometrique(exercice: ExerciceCercleTrigonometrique): SectionExercice {
  return {
    enteteFragments: [texte("On considère l'angle orienté suivant : "), latex(formatEnonceCercleTrigLatex(exercice.angleDepart))],
    questions: [
      {
        consigne: [texte("Quel est l'angle entre 0° et 360° qui donne le même point sur le cercle trigonométrique ?")],
        reponse: { type: "lignes", nombre: 2 },
      },
      {
        consigne: [texte("Dans quel quadrant (I, II, III ou IV) ou sur quel axe (Ox ou Oy) se trouve cet angle ?")],
        reponse: { type: "lignes", nombre: 0 },
      },
      {
        consigne: [texte("Quel est l'angle du premier quadrant (angle de référence) associé à cet angle ?")],
        reponse: { type: "lignes", nombre: 1 },
      },
      {
        consigne: [texte("Quel est le signe de "), latex("\\sin(\\theta)"), texte(", "), latex("\\cos(\\theta)"), texte(" et "), latex("\\tan(\\theta)"), texte(" ?")],
        reponse: { type: "tableau", libellesLignes: LIBELLES_LIGNES_SIGNES, nombreColonnes: 1 },
      },
    ],
  };
}

function paragraphe(lettre: string, texteCorps: string): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${lettre}) ${texteCorps}`)] as FragmentConsigne[] };
}

function construireCorrectionCercleTrigonometrique(exercice: ExerciceCercleTrigonometrique): BlocCorrection[] {
  const { signeSin, signeCos, signeTan } = exercice;

  return [
    paragraphe("a", texteReduction(exercice)),
    paragraphe("b", texteJustificationQuadrant(exercice)),
    paragraphe("c", texteJustificationAnglePremierQuadrant(exercice)),
    paragraphe(
      "d",
      `${texteJustificationSignes(exercice)} Donc sin θ est ${LIBELLE_SIGNE[signeSin]}, cos θ est ${LIBELLE_SIGNE[signeCos]} et tan θ est ${LIBELLE_SIGNE[signeTan]}.`,
    ),
    {
      type: "tableau",
      libellesLignes: LIBELLES_LIGNES_SIGNES,
      valeursParLigne: [[symboleSigne(signeSin)], [symboleSigne(signeCos)], [symboleSigne(signeTan)]],
    },
  ];
}

export const adaptateurEvaluationCercleTrigonometrique: AdaptateurFeuilleExercices<ExerciceCercleTrigonometrique> = {
  titreDocument: "Placement et lecture sur le cercle trigonométrique — Évaluation",
  nomFichierBase: "cercle-trigonometrique",
  genererInstance: genererExerciceCercleTrigonometrique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteCercleTrigId),
  construireEnonce: construireEnonceCercleTrigonometrique,
  construireCorrection: construireCorrectionCercleTrigonometrique,
  // 4 questions par instance (réduction, quadrant, angle du premier quadrant, signes) — jamais 1
  // seule : voir le commentaire de tête (pourquoi pas `regroupable`).
};
