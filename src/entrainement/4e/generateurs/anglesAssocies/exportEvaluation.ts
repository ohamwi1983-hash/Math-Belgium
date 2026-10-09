import type {
  ExerciceAnglesAssocies,
  ExerciceAnglesAssociesSinCos,
  ExerciceAnglesAssociesTangente,
  FonctionSinCos,
  IdVarianteAnglesAssocies,
  QuadrantAnglesAssocies,
} from "../../core/anglesAssocies.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatBlocBaseLatex, formatBlocDemandeLatex, texteAide2, texteAide3Intro } from "../../ui/formatAnglesAssocies";
import { necessiteAide3 } from "../../moteur/verificationAnglesAssocies";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAnglesAssocies } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAnglesAssocies>` pour gen17 (Angles associés,
 * chapitre 3, `AppAnglesAssocies.tsx`) — voir `generateurs/analyseFonction/exportWord.ts` pour le
 * mécanisme générique de référence. Import de `moteur/verificationAnglesAssocies.ts::necessiteAide3`
 * légitime malgré la règle "`src/generateurs/` n'importe jamais `src/moteur/`" : cette règle ne vaut
 * que pour la Couche A (génération, `index.ts`), jamais pour l'export, qui a toujours réutilisé la
 * vérification/le formatage existants — voir le commentaire de tête de
 * `generateurs/formeCanoniqueFonctionsReference/exportEvaluation.ts`, même principe.
 *
 * Mapping des 7 variantes du catalogue (`CATALOGUE_VARIANTES`, `./index.ts`) — un seul écran/une
 * seule question par instance dans les 7 cas (écran unique, voir `EtapeAnglesAssocies.tsx`), donnée
 * (sin/cos ou tan de `alpha`) en tête d'énoncé, question = « détermine sans calculatrice
 * fonctionCible(theta°) » :
 * - `sinCos-complementaireDirecte` (quadrant I) : theta = 90°−alpha directement ; co-fonction
 *   appliquée en un seul temps (`sin(90°−x)=cos(x)`/`cos(90°−x)=sin(x)`), jamais de second palier
 *   de complémentarité (`necessiteAide3` toujours faux ici, `xReference===alpha` par construction).
 * - `sinCos-supplementaire`/`antiSupplementaire`/`oppose` (quadrants II/III/IV) : theta relié à
 *   `xReference` par la relation nommée (supplémentaire/anti-supplémentaire/opposé — jamais de
 *   changement sin↔cos à ce niveau, seulement un signe) ; PUIS, si `xReference≠alpha`
 *   (`necessiteAide3`), `xReference` est lui-même le complémentaire de `alpha` — second palier de
 *   co-fonction, sin↔cos échangés une seconde fois.
 * - `tangente-supplementaire`/`antiSupplementaire`/`oppose` (quadrants II/III/IV) : jamais de palier
 *   de complémentarité pour tan (`necessiteAide3` toujours faux — voir sa doc), seulement le signe
 *   (`tan` positive en III, négative en II/IV, tables `SIGNE_LIBELLE` ci-dessous — mêmes identités
 *   que `generateurs/anglesAssocies/index.ts::SIGNE_SIN_COS`/le signe codé en dur de
 *   `construireTangente`, jamais réimportées car privées à ce module — redérivées ici depuis les
 *   mêmes identités classiques des angles associés, cross-vérifiées par le smoke-test de portage
 *   (valeur recalculée localement comparée à `instance.valeurCible`) plutôt que supposées correctes
 *   sans preuve).
 *
 * Décision `regroupable` — **NON regroupable**, et ce n'est PAS parce qu'il y a 7 variantes
 * structurellement différentes (`AdaptateurFeuilleExercices.regroupable` n'a rien contre des
 * variantes multiples en soi, voir `formeCanoniqueFonctionsReference/exportEvaluation.ts`, gen11,
 * 6 familles, bien `regroupable: true`) : la vraie raison est que la consigne de l'unique question
 * MENTIONNE une valeur tirée — `formatBlocDemandeLatex(instance)`, qui encode `theta` (un entier qui
 * varie à chaque tirage) ET la fonction demandée (`sin`/`cos`/`tan`, qui varie aussi) — jamais un
 * texte constant comme l'exige `AdaptateurFeuilleExercices.regroupable` ("Ne JAMAIS activer pour un
 * générateur dont la consigne dépend de l'instance, ex. mentionne une valeur tirée"). Il serait
 * possible de déplacer l'expression demandée dans `enteteFragments` pour forcer une consigne
 * générique ("Calcule cette valeur."), mais ce serait artificiel : contrairement à gen11 (l'entête
 * montre l'état de DÉPART, la consigne demande une transformation dont le résultat n'est PAS
 * montré), ici l'expression demandée EST la question elle-même (ce que l'élève doit calculer), pas
 * une donnée de contexte — la structure à l'écran le confirme (`BlocEnonceAnglesAssocies.tsx` :
 * "Sachant que" + bloc 1 (donnée), puis "Déterminer sans calculatrice" + bloc 2 (la question)),
 * jamais un simple habillage du bloc donnée.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée, en
 * réutilisant directement les 2 textes déjà utilisés côté écran pour les aides 2/3
 * (`ui/formatAnglesAssocies.ts::texteAide2`/`texteAide3Intro`, identiques mot pour mot à ce qui est
 * révélé à l'élève en cas d'aide) plutôt que d'en réécrire une version parallèle — puis complétée
 * d'une dérivation numérique explicite (valeur en `xReference`, signe selon le quadrant, résultat
 * final) qui n'a, elle, jamais de pendant textuel à l'écran (l'aide 1, purement graphique — cercle
 * trigonométrique — n'a aucun texte à réutiliser, même decision que gen7 pour ses 4 aides visuelles,
 * voir `analyseFonction/exportWord.ts`).
 *
 * Aucune zone de réponse vierge dédiée à l'aide/au raisonnement : une seule question par instance,
 * `reponse: { type: "lignes", nombre: 3 }` (calcul court, jamais un tableau).
 */

type FonctionTrig = FonctionSinCos | "tan";

/** Signe de `sin`/`cos`/`tan` en fonction du quadrant de l'angle DEMANDÉ (`theta`) — identités
 * classiques des angles associés, redérivées ici indépendamment de `generateurs/anglesAssocies/index.ts`
 * (dont les tables équivalentes, `SIGNE_SIN_COS`/le signe de `construireTangente`, sont privées au
 * module) ; cross-vérifiées par le smoke-test de portage contre `instance.valeurCible`. */
const SIGNE_LIBELLE: Record<QuadrantAnglesAssocies, Record<FonctionTrig, "positif" | "négatif">> = {
  I: { sin: "positif", cos: "positif", tan: "positif" },
  II: { sin: "positif", cos: "négatif", tan: "négatif" },
  III: { sin: "négatif", cos: "négatif", tan: "positif" },
  IV: { sin: "négatif", cos: "positif", tan: "négatif" },
};

function cofonction(fonction: FonctionSinCos): FonctionSinCos {
  return fonction === "sin" ? "cos" : "sin";
}

/** "Sachant que sin(alpha°) ≈ …" (variante sin/cos, 2 lignes) ou "Sachant que tan(alpha°) ≈ …"
 * (variante tangente, 1 ligne) — reprend `formatBlocBaseLatex`, déjà la même fonction utilisée côté
 * écran (`BlocEnonceAnglesAssocies.tsx`), jamais reformatée indépendamment. */
function fragmentsBlocBase(instance: ExerciceAnglesAssocies): FragmentConsigne[] {
  const [premiere, seconde] = formatBlocBaseLatex(instance);
  if (seconde === undefined) {
    return [texte("Sachant que "), latex(premiere), texte(".")];
  }
  return [texte("Sachant que "), latex(premiere), texte(" et "), latex(seconde), texte(".")];
}

function construireEnonceAnglesAssocies(instance: ExerciceAnglesAssocies): SectionExercice {
  return {
    enteteFragments: fragmentsBlocBase(instance),
    questions: [
      {
        consigne: [
          texte("Détermine, sans utiliser de calculatrice, "),
          latex(formatBlocDemandeLatex(instance)),
          texte(" (valeur approchée)."),
        ],
        reponse: { type: "lignes", nombre: 3 },
      },
    ],
  };
}

/**
 * Quadrant I (`sinCos-complementaireDirecte`) : `theta = 90° − alpha` directement — un seul palier
 * de co-fonction, jamais de second palier (`necessiteAide3` toujours faux ici). `texteAide2` a déjà
 * nommé la relation ("theta° est le complémentaire de alpha°", puisque `xReference===alpha` en
 * quadrant I) ; ce bloc rajoute la dérivation numérique elle-même.
 */
function construireCorrectionQuadrantI(instance: ExerciceAnglesAssociesSinCos): BlocCorrection[] {
  const { alpha, theta, fonctionCible, valeurCible } = instance;
  const cf = cofonction(fonctionCible);
  return [
    { type: "paragraphe", fragments: [texte(texteAide2(instance))] },
    {
      type: "paragraphe",
      fragments: [
        texte("On utilise la co-fonction "),
        latex(`\\${fonctionCible}(90^\\circ - x) = \\${cf}(x)`),
        texte(" : "),
        latex(`\\${fonctionCible}(${theta}^\\circ) = \\${cf}(${alpha}^\\circ) \\approx ${valeurCible}.`),
      ],
    },
  ];
}

/**
 * Quadrants II/III/IV, variante sin/cos (`sinCos-supplementaire`/`antiSupplementaire`/`oppose`) :
 * `theta` relié à `xReference` par la relation nommée (signe seulement, jamais d'échange sin↔cos à
 * ce niveau) ; PUIS, si `xReference≠alpha` (`necessiteAide3`), `xReference` est lui-même le
 * complémentaire de `alpha` (second palier de co-fonction, sin↔cos échangés). Les 2 paliers
 * réutilisent `texteAide2`/`texteAide3Intro` (identiques à l'écran) avant la dérivation numérique.
 */
function construireCorrectionQuadrantsIIaIV(instance: ExerciceAnglesAssociesSinCos): BlocCorrection[] {
  const { alpha, theta, xReference, quadrant, fonctionCible, sinAlpha, cosAlpha, valeurCible } = instance;
  const blocs: BlocCorrection[] = [{ type: "paragraphe", fragments: [texte(texteAide2(instance))] }];

  const coFonctionUtilisee = necessiteAide3(instance);
  if (coFonctionUtilisee) {
    blocs.push({ type: "paragraphe", fragments: [texte(texteAide3Intro(instance))] });
  }

  const valeurEnXReference = coFonctionUtilisee
    ? fonctionCible === "sin"
      ? cosAlpha
      : sinAlpha
    : fonctionCible === "sin"
      ? sinAlpha
      : cosAlpha;

  const fragmentsValeurReference: FragmentConsigne[] = coFonctionUtilisee
    ? [latex(`\\${fonctionCible}(${xReference}^\\circ) = \\${cofonction(fonctionCible)}(${alpha}^\\circ) \\approx ${valeurEnXReference}`)]
    : [latex(`\\${fonctionCible}(${xReference}^\\circ) = \\${fonctionCible}(${alpha}^\\circ) \\approx ${valeurEnXReference}`)];

  blocs.push({ type: "paragraphe", fragments: [texte(`Valeur en ${xReference}° : `), ...fragmentsValeurReference, texte(".")] });

  const signe = SIGNE_LIBELLE[quadrant][fonctionCible];
  const nomFonctionLettres = fonctionCible === "sin" ? "le sinus" : "le cosinus";
  blocs.push({
    type: "paragraphe",
    fragments: [
      texte(`${theta}° appartient au quadrant ${quadrant}, où ${nomFonctionLettres} est ${signe}. Donc `),
      latex(`\\${fonctionCible}(${theta}^\\circ) \\approx ${valeurCible}.`),
    ],
  });

  return blocs;
}

function construireCorrectionSinCos(instance: ExerciceAnglesAssociesSinCos): BlocCorrection[] {
  return instance.quadrant === "I" ? construireCorrectionQuadrantI(instance) : construireCorrectionQuadrantsIIaIV(instance);
}

/**
 * Variante tangente (`tangente-supplementaire`/`antiSupplementaire`/`oppose`, quadrants II/III/IV
 * uniquement) : jamais de palier de co-fonction (`necessiteAide3` toujours faux pour tan — la
 * relation complémentaire est explicitement exclue pour cette variante, voir `core/anglesAssocies.types.ts`),
 * seulement le signe selon le quadrant.
 */
function construireCorrectionTangente(instance: ExerciceAnglesAssociesTangente): BlocCorrection[] {
  const { alpha, theta, quadrant, valeurCible } = instance;
  const signe = SIGNE_LIBELLE[quadrant].tan;
  return [
    { type: "paragraphe", fragments: [texte(texteAide2(instance))] },
    {
      type: "paragraphe",
      fragments: [
        texte(`${theta}° appartient au quadrant ${quadrant}, où la tangente est ${signe}. Donc `),
        latex(`\\tan(${theta}^\\circ) = ${signe === "négatif" ? "-" : ""}\\tan(${alpha}^\\circ) \\approx ${valeurCible}.`),
      ],
    },
  ];
}

function construireCorrectionAnglesAssocies(instance: ExerciceAnglesAssocies): BlocCorrection[] {
  return instance.variante === "sinCos" ? construireCorrectionSinCos(instance) : construireCorrectionTangente(instance);
}

export const adaptateurEvaluationAnglesAssocies: AdaptateurFeuilleExercices<ExerciceAnglesAssocies> = {
  titreDocument: "Angles associés — Évaluation",
  nomFichierBase: "angles-associes",
  genererInstance: genererExerciceAnglesAssocies,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteAnglesAssocies),
  construireEnonce: construireEnonceAnglesAssocies,
  construireCorrection: construireCorrectionAnglesAssocies,
  // Pas de `regroupable` (absent = comportement historique, une question complète par instance) —
  // voir le commentaire de tête pour la justification détaillée (consigne dépendante de `theta`/de
  // la fonction demandée, jamais générique).
};
