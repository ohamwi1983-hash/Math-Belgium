import type { AngleRemarquable, ExerciceValeursRemarquables } from "../../core/valeursRemarquables.types";
import type { Quadrant } from "../../core/cercleTrigonometrique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { libelleQuadrant } from "../../ui/formatCercleTrigonometrique";
import { formatEnonceCercleTrigLatex } from "../../ui/formatValeursRemarquables";
import { LATEX_COS, LATEX_SIN, LATEX_TAN } from "./tables";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceValeursRemarquables } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceValeursRemarquables>` pour gen15 (Valeurs
 * trigonométriques remarquables — chapitre 3, deuxième exercice, `AppValeursRemarquables.tsx`) —
 * voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Mapping écran → question papier : `AppValeursRemarquables.tsx`/`moteur/sessionValeursRemarquables.ts`
 * fait passer l'élève par 3 écrans successifs et toujours dans le même ordre pour une même instance
 * (`quadrant` → `anglePremierQuadrant` → `valeursExactes`, voir le commentaire de tête de
 * `sessionValeursRemarquables.ts`), chacun avec sa propre consigne fixe (`EtapeQuadrantVR.tsx`,
 * `EtapeAnglePremierQuadrantVR.tsx`, `EtapeValeursExactesVR.tsx`) — reprises ici à l'identique comme
 * 3 questions a/b/c d'un même exercice papier plutôt qu'une par micro-écran :
 * a) "Dans quel quadrant ou sur quel axe se trouve cet angle ?" (quadrant/axe attendu :
 *    `exercice.quadrant`) ;
 * b) "Quel est l'angle du premier quadrant associé à cet angle ?" (`exercice.anglePremierQuadrant`,
 *    toujours l'une des 5 valeurs remarquables 0/30/45/60/90) ;
 * c) "Donne la valeur exacte de sin(θ), cos(θ) et tan(θ)." (`exercice.sinLatex`/`cosLatex`/`tanLatex`,
 *    déjà signés).
 *
 * PAS `regroupable` : 3 questions par instance (voir ci-dessus), jamais la question GÉNÉRIQUE unique
 * que ce mécanisme suppose (`genererFeuilleExercices.ts`, doc de `regroupable`) — même raison de
 * principe que `simplification/exportEvaluation.ts` (plusieurs questions substantielles par
 * instance), bien que chaque consigne individuelle soit ici, elle, indépendante des valeurs tirées :
 * ce n'est pas suffisant, le mécanisme de regroupement exige UNE SEULE question par instance.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance tirée, jamais recalculée
 * indépendamment : `exercice.quadrant`/`anglePremierQuadrant`/`sinLatex`/`cosLatex`/`tanLatex` sont
 * déjà entièrement dérivés à la génération (`generateurs/valeursRemarquables/index.ts`, jamais
 * recalculés différemment côté vérification — voir le commentaire de tête de
 * `core/valeursRemarquables.types.ts`). La question c) décompose en plus explicitement le
 * raisonnement magnitude (table des valeurs remarquables à l'angle du premier quadrant,
 * `LATEX_SIN`/`LATEX_COS`/`LATEX_TAN` de `./tables`) puis signe (quadrant/axe déterminé en a),
 * `exercice.sinLatex`/`cosLatex`/`tanLatex`) — même principe de composition que
 * `appliquerSigneValeur`/`appliquerSigneLatex` côté générateur (magnitude et signe indépendants, se
 * combinent sans cas particulier).
 *
 * Cas `tan` indéfinie (90°/270°, axe Oy) : `LATEX_TAN[90]`/`exercice.tanLatex` valent alors la
 * chaîne littérale `"n'existe pas"`, jamais du LaTeX — même distinction que côté écran
 * (`ResultatPanelValeursRemarquables.tsx`, comparaison explicite à cette chaîne avant de passer à
 * `<Katex>`) : rendue ici comme fragment `texte(...)`, jamais `latex(...)`, pour ne pas tenter de
 * rasteriser du texte français comme une formule.
 *
 * Aucune zone de réponse dédiée (`reponse` omis sur les 3 questions, consigne du prompt de ce
 * fichier) : les 3 réponses attendues sont courtes (un quadrant/axe, un angle, 3 valeurs exactes),
 * la ligne vierge par défaut d'`AdaptateurFeuilleExercices` (voir `genererFeuilleExercices.ts`,
 * `construireZoneReponse`) suffit, jamais un tableau de plusieurs lignes comme pour une résolution
 * détaillée (gen7/gen3).
 */

/** "θ = 210°" ⟹ quadrant II ⟹ angle du premier quadrant = 180° − 210°... non, 210 est déjà dans
 * ]90°,360°] : raisonnement de symétrie par rapport à l'axe Ox, un par quadrant/axe — jamais
 * recalculé indépendamment de `exercice.anglePremierQuadrant` (déjà correct), seulement reformulé en
 * phrase pour la correction. */
function raisonAnglePremierQuadrant(quadrant: Quadrant, angleReduit: number, anglePremierQuadrant: number): string {
  switch (quadrant) {
    case "axeOx":
      return "θ est sur l'axe Ox (0° ou 180°), donc l'angle du premier quadrant est 0°.";
    case "axeOy":
      return "θ est sur l'axe Oy (90° ou 270°), donc l'angle du premier quadrant est 90°.";
    case "I":
      return `θ = ${angleReduit}° est dans le quadrant I, donc l'angle du premier quadrant vaut θ lui-même : ${anglePremierQuadrant}°.`;
    case "II":
      return `θ = ${angleReduit}° est dans le quadrant II, donc l'angle du premier quadrant vaut 180° − ${angleReduit}° = ${anglePremierQuadrant}°.`;
    case "III":
      return `θ = ${angleReduit}° est dans le quadrant III, donc l'angle du premier quadrant vaut ${angleReduit}° − 180° = ${anglePremierQuadrant}°.`;
    case "IV":
      return `θ = ${angleReduit}° est dans le quadrant IV, donc l'angle du premier quadrant vaut 360° − ${angleReduit}° = ${anglePremierQuadrant}°.`;
  }
}

/** `valeurLatex === "n'existe pas"` ⟹ fragment texte (jamais rasterisé comme du LaTeX, voir le
 * commentaire de tête) ; sinon un unique fragment `latex(...)` "préfixe = valeur". */
function fragmentsValeurTan(prefixeLatex: string, valeurLatex: string): FragmentConsigne[] {
  if (valeurLatex === "n'existe pas") {
    return [latex(prefixeLatex), texte(" n'existe pas")];
  }
  return [latex(`${prefixeLatex} = ${valeurLatex}`)];
}

function construireEnonceValeursRemarquables(instance: ExerciceValeursRemarquables): SectionExercice {
  return {
    enteteFragments: [texte("On considère l'angle "), latex(formatEnonceCercleTrigLatex(instance.angleDepart)), texte(".")],
    questions: [
      { consigne: [texte("Dans quel quadrant ou sur quel axe se trouve cet angle ?")] },
      { consigne: [texte("Quel est l'angle du premier quadrant associé à cet angle ?")] },
      {
        consigne: [
          texte("Donne la valeur exacte de "),
          latex("\\sin(\\theta)"),
          texte(", "),
          latex("\\cos(\\theta)"),
          texte(" et "),
          latex("\\tan(\\theta)"),
          texte("."),
        ],
      },
    ],
  };
}

function construireCorrectionValeursRemarquables(instance: ExerciceValeursRemarquables): BlocCorrection[] {
  const { angleDepart, angleReduit, quadrant, anglePremierQuadrant, sinLatex, cosLatex, tanLatex } = instance;

  // Seul cas du domaine ]90°,360°] où la réduction modulo 360 change réellement la valeur affichée
  // (angleDepart=360 ⟹ angleReduit=0) — voir le commentaire de tête de `construireAngleDepart`
  // (index.ts) : jamais mentionné quand angleDepart est déjà la mesure réduite.
  const reduction = angleDepart !== angleReduit ? ` (soit θ = ${angleReduit}° une fois ramené dans [0°, 360°[)` : "";

  const fragmentsQuadrant: FragmentConsigne[] = [texte(`a) θ = ${angleDepart}°${reduction} — ${libelleQuadrant(quadrant)}.`)];

  const fragmentsAnglePremierQuadrant: FragmentConsigne[] = [
    texte(`b) ${raisonAnglePremierQuadrant(quadrant, angleReduit, anglePremierQuadrant)}`),
  ];

  const magnitudeTanLatex = LATEX_TAN[anglePremierQuadrant];
  const fragmentsValeursExactes: FragmentConsigne[] = [
    texte(`c) L'angle du premier quadrant (${anglePremierQuadrant}°) donne la magnitude, table des valeurs remarquables : `),
    latex(`\\sin(${anglePremierQuadrant}^\\circ) = ${LATEX_SIN[anglePremierQuadrant]}`),
    texte(", "),
    latex(`\\cos(${anglePremierQuadrant}^\\circ) = ${LATEX_COS[anglePremierQuadrant]}`),
    texte(", "),
    ...fragmentsValeurTan(`\\tan(${anglePremierQuadrant}^\\circ)`, magnitudeTanLatex),
    texte(`. Le signe dépend du quadrant/de l'axe déterminé en a) (${libelleQuadrant(quadrant)}) : `),
    latex(`\\sin(\\theta) = ${sinLatex}`),
    texte(", "),
    latex(`\\cos(\\theta) = ${cosLatex}`),
    texte(", "),
    ...fragmentsValeurTan("\\tan(\\theta)", tanLatex),
    texte("."),
  ];

  return [
    { type: "paragraphe", fragments: fragmentsQuadrant },
    { type: "paragraphe", fragments: fragmentsAnglePremierQuadrant },
    { type: "paragraphe", fragments: fragmentsValeursExactes },
  ];
}

export const adaptateurEvaluationValeursRemarquables: AdaptateurFeuilleExercices<ExerciceValeursRemarquables> = {
  titreDocument: "Valeurs trigonométriques remarquables — Évaluation",
  nomFichierBase: "valeurs-remarquables",
  genererInstance: genererExerciceValeursRemarquables,
  // `CATALOGUE_VARIANTES` (index.ts) porte des `id` numériques (`AngleRemarquable`, 5 angles) —
  // conversion en chaîne pour respecter `CatalogueVarianteEntree.id: string`, même conversion que
  // `AppValeursRemarquables.tsx` (`SelecteurVarianteDev`) et `construireAvecVarianteId` en sens
  // inverse (`Number(id)`), jamais un id texte natif comme les autres générateurs du projet.
  catalogueVariantes: CATALOGUE_VARIANTES.map((variante) => ({ id: String(variante.id), label: variante.label })),
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(Number(id) as AngleRemarquable),
  construireEnonce: construireEnonceValeursRemarquables,
  construireCorrection: construireCorrectionValeursRemarquables,
};
