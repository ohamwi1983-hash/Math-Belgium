import type { ExerciceCercleTrigonometrique, Quadrant, Signe, SigneTan, ValeurAxeTan, VarianteCercleTrigId } from "../../core/cercleTrigonometrique.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatEnonceCercleTrigLatex, libelleQuadrant } from "../../ui/formatCercleTrigonometrique";
import { estSurAxe, valeursAxeAttendues } from "../../moteur/verificationCercleTrigonometrique";
import { libelleValeurAxe } from "../../ui/cycleSigneCercleTrigonometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercleTrigonometrique } from "./index";
import { LIBELLE_CAS_QUADRANT_I, profilCercleTrigonometrique } from "../profilsEvaluation4eCh5";

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

/** Angle sur un axe (décision E1) : ni angle du premier quadrant ni signes — on demande
 * directement la valeur exacte de sin, cos et tan. */
function construireEnonceAxe(exercice: ExerciceCercleTrigonometrique): SectionExercice {
  return {
    enteteFragments: [texte("On considère l'angle orienté suivant : "), latex(formatEnonceCercleTrigLatex(exercice.angleDepart))],
    questions: [
      {
        consigne: [texte("Quel est l'angle entre 0° et 360° qui donne le même point sur le cercle trigonométrique ?")],
      },
      {
        consigne: [texte("Dans quel quadrant (I, II, III ou IV) ou sur quel axe (Ox ou Oy) se trouve cet angle ?")],
      },
      {
        consigne: [texte("Donne la valeur exacte de "), latex("\\sin(\\theta)"), texte(", "), latex("\\cos(\\theta)"), texte(" et "), latex("\\tan(\\theta)"), texte(".")],
      },
    ],
  };
}

function libelleValeurExport(valeur: ValeurAxeTan): string {
  return valeur === "indefini" ? "n'existe pas" : libelleValeurAxe(valeur);
}

function construireCorrectionAxe(exercice: ExerciceCercleTrigonometrique): BlocCorrection[] {
  const attendu = valeursAxeAttendues(exercice);
  const explication =
    exercice.quadrant === "axeOx"
      ? `Un angle sur un axe n'appartient à aucun quadrant : on donne directement sa valeur exacte. M(θ) est le point (${libelleValeurAxe(attendu.cos)} ; 0) de l'axe Ox : cos θ = ${libelleValeurAxe(attendu.cos)}, sin θ = 0 et tan θ = sin θ / cos θ = 0.`
      : `Un angle sur un axe n'appartient à aucun quadrant : on donne directement sa valeur exacte. M(θ) est le point (0 ; ${libelleValeurAxe(attendu.sin)}) de l'axe Oy : sin θ = ${libelleValeurAxe(attendu.sin)}, cos θ = 0, donc tan θ = sin θ / cos θ n'existe pas.`;
  return [
    paragraphe("a", texteReduction(exercice)),
    paragraphe("b", texteJustificationQuadrant(exercice)),
    paragraphe("c", explication),
    {
      type: "tableau",
      libellesLignes: LIBELLES_LIGNES_SIGNES,
      valeursParLigne: [[libelleValeurExport(attendu.sin)], [libelleValeurExport(attendu.cos)], [libelleValeurExport(attendu.tan)]],
    },
  ];
}

function construireEnonceCercleTrigonometrique(exercice: ExerciceCercleTrigonometrique): SectionExercice {
  if (estSurAxe(exercice)) return construireEnonceAxe(exercice);
  return {
    enteteFragments: [texte("On considère l'angle orienté suivant : "), latex(formatEnonceCercleTrigLatex(exercice.angleDepart))],
    questions: [
      {
        consigne: [texte("Quel est l'angle entre 0° et 360° qui donne le même point sur le cercle trigonométrique ?")],
      },
      {
        consigne: [texte("Dans quel quadrant (I, II, III ou IV) ou sur quel axe (Ox ou Oy) se trouve cet angle ?")],
      },
      {
        consigne: [texte("Quel est l'angle du premier quadrant (angle de référence) associé à cet angle ?")],
      },
      {
        consigne: [texte("Quel est le signe de "), latex("\\sin(\\theta)"), texte(", "), latex("\\cos(\\theta)"), texte(" et "), latex("\\tan(\\theta)"), texte(" ?")],
      },
    ],
  };
}

function paragraphe(lettre: string, texteCorps: string): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${lettre}) ${texteCorps}`)] as FragmentConsigne[] };
}

function construireCorrectionCercleTrigonometrique(exercice: ExerciceCercleTrigonometrique): BlocCorrection[] {
  if (estSurAxe(exercice)) return construireCorrectionAxe(exercice);
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

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les 4 écrans (réduction, quadrant, angle du premier quadrant, signes — 3 sur un axe) sont les
// étapes d'APPRENTISSAGE du générateur : sur papier, l'énoncé garde l'angle et une consigne globale,
// les écrans deviennent les étapes « a, b, c, d » du corrigé. Valeurs : les champs de l'instance,
// calculés une seule fois par `quadrantCalculs.ts` (les mêmes que l'écran).

/** Angle en degrés, LaTeX (signe moins typographique). */
function deg(angle: number): string {
  return `${angle}^\\circ`;
}

function consigneGlobale(exercice: ExerciceCercleTrigonometrique): string {
  return estSurAxe(exercice)
    ? "Situe cet angle sur le cercle trigonométrique (angle équivalent entre 0° et 360°, axe sur lequel il se trouve), puis donne la valeur exacte de sin θ, cos θ et tan θ."
    : "Situe cet angle sur le cercle trigonométrique (angle équivalent entre 0° et 360°, quadrant, angle associé du premier quadrant), puis donne le signe de sin θ, cos θ et tan θ.";
}

function enoncePapier(exercice: ExerciceCercleTrigonometrique): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("On considère l'angle orienté "), latex(formatEnonceCercleTrigLatex(exercice.angleDepart)), texte(`. ${consigneGlobale(exercice)}`)],
      questions: [],
    },
  };
}

/** Calcul de réduction en LaTeX : « −200° + 360° = 160° » ou « 750° − 2 × 360° = 30° ». */
function calculReductionLatex(exercice: ExerciceCercleTrigonometrique): string {
  const { angleDepart, angleReduit } = exercice;
  const k = (angleReduit - angleDepart) / 360;
  const tours = Math.abs(k) > 1 ? `${Math.abs(k)} \\times 360^\\circ` : "360^\\circ";
  return `${deg(angleDepart)} ${k > 0 ? "+" : "-"} ${tours} = ${deg(angleReduit)}`;
}

function ligneSignesLatex(exercice: ExerciceCercleTrigonometrique): string {
  const s = (v: Signe | SigneTan) => (v === "-" ? "-" : v === "+" ? "+" : v === "0" ? "0" : "\\nexists");
  return `\\sin\\theta : ${s(exercice.signeSin)} \\qquad \\cos\\theta : ${s(exercice.signeCos)} \\qquad \\tan\\theta : ${s(exercice.signeTan)}`;
}

function valeursAxeLatex(exercice: ExerciceCercleTrigonometrique): string {
  const v = valeursAxeAttendues(exercice);
  const l = (x: string) => (x === "-1" ? "-1" : x);
  const tan = v.tan === "indefini" ? "\\tan\\theta \\text{ n'existe pas}" : `\\tan\\theta = ${l(v.tan)}`;
  return `\\sin\\theta = ${l(v.sin)} ; \\ \\cos\\theta = ${l(v.cos)} ; \\ ${tan}`;
}

function correctionDetaillee(exercice: ExerciceCercleTrigonometrique): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Ajouter ou retrancher des tours complets de 360° ne change pas le point sur le cercle.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(calculReductionLatex(exercice))] },
    {
      label: "Conclusion",
      sousQuestion: "b",
      fragments: [
        texte(
          estSurAxe(exercice)
            ? `${exercice.angleReduit}° est sur l'axe ${exercice.quadrant === "axeOx" ? "Ox" : "Oy"} : il n'appartient à aucun quadrant.`
            : texteJustificationQuadrant(exercice),
        ),
      ],
    },
  ];
  if (estSurAxe(exercice)) {
    const v = valeursAxeAttendues(exercice);
    lignes.push(
      {
        label: "Méthode",
        sousQuestion: "c",
        fragments: [
          texte("Sur un axe, M(θ) est l'un des points (±1 ; 0) ou (0 ; ±1) : on lit cos θ (abscisse) et sin θ (ordonnée), puis "),
          latex("\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}"),
          texte("."),
        ],
      },
      { label: "Conclusion", sousQuestion: "c", fragments: [latex(valeursAxeLatex(exercice))] },
      {
        label: "Piège",
        sousQuestion: "c",
        fragments: [
          v.tan === "indefini"
            ? texte("Sur l'axe Oy, cos θ = 0 : tan θ n'existe pas (division par 0), elle ne vaut ni 0 ni 1.")
            : texte("Sur l'axe Ox, sin θ = 0 donc tan θ = 0 ; cos θ vaut 1 ou −1 selon le côté, pas toujours 1."),
        ],
      },
    );
    return lignes;
  }
  lignes.push(
    { label: "Calcul", sousQuestion: "c", fragments: [texte(texteJustificationAnglePremierQuadrant(exercice))] },
    { label: "Méthode", sousQuestion: "d", fragments: [texte(texteJustificationSignes(exercice))] },
    { label: "Conclusion", sousQuestion: "d", fragments: [latex(ligneSignesLatex(exercice))] },
    {
      label: "Piège",
      sousQuestion: exercice.quadrant === "I" ? "a" : "c",
      fragments: [
        exercice.quadrant === "I"
          ? texte("Le signe se lit sur l'angle réduit, pas sur l'angle de départ : un angle négatif peut très bien avoir tous ses rapports positifs.")
          : texte(`Dans le quadrant ${exercice.quadrant}, l'angle du premier quadrant n'est pas l'angle réduit lui-même : il faut passer par la symétrie (180° ou 360°).`),
      ],
    },
  );
  return lignes;
}

function reponseBreve(exercice: ExerciceCercleTrigonometrique): FragmentConsigne[] {
  const debut: FragmentConsigne[] = [latex(`\\theta \\equiv ${deg(exercice.angleReduit)}`), texte(` ; ${libelleQuadrant(exercice.quadrant)}`)];
  if (estSurAxe(exercice)) return [...debut, texte(" ; "), latex(valeursAxeLatex(exercice))];
  return [...debut, texte(` ; angle du premier quadrant ${exercice.anglePremierQuadrant}° ; `), latex(ligneSignesLatex(exercice))];
}

function bareme(exercice: ExerciceCercleTrigonometrique): BaremeExercice {
  if (estSurAxe(exercice)) {
    return {
      reponseFinale: reponseBreve(exercice),
      criteres: [
        { sousQuestion: "a", critere: [texte("Angle réduit : "), latex(deg(exercice.angleReduit))], points: 1 },
        { sousQuestion: "b", critere: [texte(libelleQuadrant(exercice.quadrant))], points: 1 },
        { sousQuestion: "c", critere: [texte("Valeurs exactes : "), latex(valeursAxeLatex(exercice))], points: 2 },
      ],
      erreursFrequentes: [
        { description: [texte("Un angle sur un axe classé dans un quadrant")], cout: "0 pt à l'étape 2" },
        exercice.quadrant === "axeOy"
          ? { description: [texte("tan θ = 0 ou 1 sur l'axe Oy (au lieu de « n'existe pas »)")], cout: "−1" }
          : { description: [texte("sin θ et cos θ échangés (abscisse et ordonnée de M(θ) confondues)")], cout: "−1" },
      ],
      reponsesAcceptees: [[texte("Valeurs lues sur un cercle trigonométrique dessiné et justifiées par les coordonnées de M(θ)")]],
    };
  }
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Angle réduit : "), latex(deg(exercice.angleReduit))], points: 1 },
      { sousQuestion: "b", critere: [texte(libelleQuadrant(exercice.quadrant))], points: 0.5 },
      { sousQuestion: "c", critere: [texte(`Angle du premier quadrant : ${exercice.anglePremierQuadrant}°`)], points: 1 },
      { sousQuestion: "d", critere: [texte("Les trois signes : "), latex(ligneSignesLatex(exercice))], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Signes lus sur l'angle de départ (négatif ou ≥ 360°) au lieu de l'angle réduit")], cout: "0 pt aux étapes 2 à 4" },
      { description: [texte("Angle du premier quadrant confondu avec l'angle réduit")], cout: "0 pt à l'étape 3" },
      { description: [texte("Un seul signe faux")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Quadrant et signes justifiés par un cercle trigonométrique dessiné")]],
  };
}

/** ★ un seul tour de 360° et quadrant I ; ★★ sinon. */
function difficulte(exercice: ExerciceCercleTrigonometrique): 1 | 2 | 3 {
  const tours = Math.abs((exercice.angleReduit - exercice.angleDepart) / 360);
  return tours <= 1 && (exercice.quadrant === "I" || estSurAxe(exercice)) ? 1 : 2;
}

export const adaptateurEvaluationCercleTrigonometrique: AdaptateurFeuilleExercices<ExerciceCercleTrigonometrique> = {
  titreDocument: "Placement et lecture sur le cercle trigonométrique — Évaluation",
  nomFichierBase: "cercle-trigonometrique",
  genererInstance: genererExerciceCercleTrigonometrique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteCercleTrigId),
  construireEnonce: construireEnonceCercleTrigonometrique,
  construireCorrection: construireCorrectionCercleTrigonometrique,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 4,
  profilInstance: profilCercleTrigonometrique,
  libelleCasParticulier: LIBELLE_CAS_QUADRANT_I,
  // 4 étapes par instance (réduction, quadrant, angle du premier quadrant, signes) — jamais 1
  // seule : voir le commentaire de tête (pourquoi pas `regroupable`).
};
