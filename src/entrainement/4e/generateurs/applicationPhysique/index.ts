/**
 * Couche A — "Applications physiques (résultante de vecteurs)" (chapitre "Calcul vectoriel",
 * huitième générateur). **Réutilise directement `resoudreSAS` (`generateurs/triangle/
 * resoudreTriangle.ts`, chapitre 3 — "Cercle trigonométrique et triangles quelconques")** — les
 * deux vecteurs composants placés bout à bout (relation de Chasles) forment un triangle dont un
 * côté est la résultante ; `resoudreSAS(v1, v2, interieur)` le résout entièrement pour LES DEUX
 * variantes, l'angle droit n'étant qu'un cas particulier de la loi des cosinus (`cos(90°)=0`
 * réduit exactement à Pythagore) — jamais un second chemin de calcul dédié. Import
 * générateur→générateur, explicitement autorisé par l'architecture du projet (voir CLAUDE.md).
 *
 * Géométrie : v1 part de l'origine en direction du Nord ; v2 est attaché bout à bout à l'extrémité
 * de v1, faisant l'angle intérieur `180°-angleEntreVecteurs` avec lui (voir
 * `core/applicationPhysique.types.ts` pour la dérivation complète) ; la résultante va de l'origine
 * à l'extrémité de v2. `triangle.a` = norme de la résultante, `triangle.C` = angle de déviation
 * (entre v1 et la résultante).
 *
 * Convention CLAUDE.md ("Catalogue de variantes") : `CATALOGUE_VARIANTES`/`construireAvecVarianteId`
 * exposent l'axe `variante` (angleDroit/angleQuelconque) — `contexte` (avion/hélicoptère/forces),
 * l'axe secondaire, reste tiré aléatoirement sauf s'il est forcé via `overrides?.contexte`.
 */
import { resoudreSAS } from "../triangle/resoudreTriangle";
import type {
  ContexteApplicationPhysique,
  ExerciceApplicationPhysique,
  GenerateurExerciceApplicationPhysique,
  VarianteApplicationPhysique,
} from "../../core/applicationPhysique.types";
import { randomInt } from "./aleatoire";
import { deviationsAcceptables, resultantePencheEnArriere, TOLERANCE_DEVIATION } from "../../moteur/verificationApplicationPhysique";

interface DonneesContexte {
  labelV1: string;
  labelV2: string;
  unite: string;
  plageV1: [number, number];
  plageV2: [number, number];
}

const CONTEXTES: Record<ContexteApplicationPhysique, DonneesContexte> = {
  avion: {
    labelV1: "la vitesse propre de l'avion",
    labelV2: "la vitesse du vent",
    unite: "km/h",
    plageV1: [180, 320],
    plageV2: [30, 80],
  },
  helicoptere: {
    labelV1: "la vitesse propre de l'hélicoptère",
    labelV2: "la vitesse du vent",
    unite: "km/h",
    plageV1: [120, 220],
    plageV2: [20, 60],
  },
  forces: {
    labelV1: "la première force",
    labelV2: "la seconde force",
    unite: "N",
    plageV1: [20, 60],
    plageV2: [10, 40],
  },
};

const CONTEXTE_IDS: ContexteApplicationPhysique[] = ["avion", "helicoptere", "forces"];

/** Angles "quelconques" sûrs — évite les valeurs extrêmes proches de 0°/180° qui produiraient un
 * triangle vectoriel presque dégénéré ; jamais 90° (réservé à la variante "angleDroit"). */
const ANGLES_QUELCONQUES = [30, 45, 60, 75, 105, 120, 135, 150];

export const CATALOGUE_VARIANTES: { id: VarianteApplicationPhysique; label: string }[] = [
  { id: "angleDroit", label: "Angle droit entre les vecteurs composants" },
  { id: "angleQuelconque", label: "Angle quelconque entre les vecteurs composants" },
];

interface OverridesApplicationPhysique {
  contexte?: ContexteApplicationPhysique;
}

/** Convention CLAUDE.md ("Catalogue de variantes") — force la variante demandée ; `overrides?.
 * contexte` permet en plus de forcer le contexte narratif (avion/hélicoptère/forces), sans quoi il
 * reste tiré aléatoirement comme avant (comportement historique inchangé pour tout appelant qui
 * l'omet). */
/** Déviation trop proche de 90° (audit chapitre 6, point 3) : la résultante est presque plein
 * Est/Ouest — aucune des quatre directions proposées n'est franchement correcte — et la loi des
 * sinus y devient instable (un arrondi de la norme déplace la déviation de plusieurs degrés). */
const ECART_MIN_DEVIATION_ANGLE_DROIT = 10;

/** Marge entre une erreur plausible et toute déviation acceptée : l'erreur, même arrondie à
 * l'unité (±0,5°), doit rester hors de la fenêtre `TOLERANCE_DEVIATION`. */
const MARGE_ERREUR_PLAUSIBLE = TOLERANCE_DEVIATION + 0.5;

/** Déviations obtenues par les erreurs les plus probables à l'écran « déviation » : l'autre angle
 * du triangle vectoriel (entre v₂ et la résultante), le complément à 90°, l'angle θ de l'énoncé
 * lui-même. Pas la norme fausse (le récapitulatif affiche déjà la vraie norme à cet écran), ni la
 * tangente du triangle rectangle appliquée à un angle quelconque : pour un vent faible devant la
 * vitesse propre, elle tombe à moins d'un degré de la vraie déviation, et l'écarter ferait
 * disparaître presque tous les angles de 105° et 120° des contextes avion/hélicoptère. */
export function erreursPlausiblesDeviation(exercice: ExerciceApplicationPhysique): number[] {
  const { angleEntreVecteurs: theta, triangle } = exercice;
  return [theta - triangle.C, 90 - triangle.C, theta];
}

/** Écart maximal toléré entre la vraie déviation et celle obtenue avec la norme arrondie : au-delà,
 * la loi des sinus est trop instable (petite résultante, déviation proche de 90°) — un sinus arrondi
 * en cours de calcul suffirait alors à faire refuser un élève qui suit la consigne. */
const ECART_MAX_DEVIATION_NORME_ARRONDIE = 2;

function exerciceExploitable(exercice: ExerciceApplicationPhysique): boolean {
  if (Math.abs(exercice.triangle.C - 90) < ECART_MIN_DEVIATION_ANGLE_DROIT) return false;
  const acceptees = deviationsAcceptables(exercice);
  // 1 valeur exacte + 3 arrondis de la norme : moins de 4 ⟺ un sinus calculé dépasse 1.
  if (acceptees.length < 4) return false;
  if (acceptees.some((d) => Math.abs(d - exercice.triangle.C) > ECART_MAX_DEVIATION_NORME_ARRONDIE)) return false;
  return erreursPlausiblesDeviation(exercice).every((erreur) => acceptees.every((d) => Math.abs(erreur - d) > MARGE_ERREUR_PLAUSIBLE));
}

/** Part visée d'exercices « forces, angle quelconque » dont la résultante penche vers l'arrière
 * (déviation > 90°, F2 option b — piège du cours, section « Applications physiques ») : le tirage
 * uniforme n'en produisait que ~0,7 %, presque jamais vus. Avec cette probabilité de remplacement,
 * la part atteint ~17,5 % (0,007 + 0,993 × 0,17). Avion/hélicoptère et angle droit inchangés : le
 * piège y est géométriquement impossible (vent faible devant la vitesse propre, cos 90° = 0). */
const PROBABILITE_PIEGE_DEVIATION_OBTUSE = 0.17;

/** Même tirage et mêmes filtres que d'habitude (`exerciceExploitable`), restreint aux exercices
 * dont la résultante penche vers l'arrière — en pratique θ = 135° ou 150° avec F₂ grande devant F₁. */
function tirerPiegeDeviationObtuse(): ExerciceApplicationPhysique {
  for (;;) {
    const exercice = tirerExercice("angleQuelconque", { contexte: "forces" });
    if (resultantePencheEnArriere(exercice) && exerciceExploitable(exercice)) return exercice;
  }
}

export function construireAvecVarianteId(
  varianteId: VarianteApplicationPhysique,
  overrides?: OverridesApplicationPhysique,
): ExerciceApplicationPhysique {
  for (;;) {
    const exercice = tirerExercice(varianteId, overrides);
    if (!exerciceExploitable(exercice)) continue;
    // Remplacement APRÈS le tirage du contexte : la répartition avion/hélicoptère/forces reste
    // exactement celle d'avant, seule la composition des exercices « forces » change.
    if (
      exercice.contexte === "forces" &&
      exercice.variante === "angleQuelconque" &&
      !resultantePencheEnArriere(exercice) &&
      Math.random() < PROBABILITE_PIEGE_DEVIATION_OBTUSE
    ) {
      return tirerPiegeDeviationObtuse();
    }
    return exercice;
  }
}

function tirerExercice(varianteId: VarianteApplicationPhysique, overrides?: OverridesApplicationPhysique): ExerciceApplicationPhysique {
  const contexte = overrides?.contexte ?? CONTEXTE_IDS[randomInt(0, CONTEXTE_IDS.length - 1)];
  const donnees = CONTEXTES[contexte];

  const v1 = randomInt(donnees.plageV1[0], donnees.plageV1[1]);
  const v2 = randomInt(donnees.plageV2[0], donnees.plageV2[1]);
  const angleEntreVecteurs = varianteId === "angleDroit" ? 90 : ANGLES_QUELCONQUES[randomInt(0, ANGLES_QUELCONQUES.length - 1)];

  const interieur = 180 - angleEntreVecteurs;
  const triangle = resoudreSAS(v1, v2, interieur);

  const coteDeviation = Math.random() < 0.5 ? "est" : "ouest";
  // Bug corrigé (audit empirique confirmé sur 2400 tirages, promptgen29auditdirection.md) :
  // `directionCorrecte` doit dériver de la géométrie RÉELLE (triangle.C, l'angle de déviation
  // entre v1 et la résultante), jamais être figée à "Nord" par construction — triangle.C peut
  // dépasser 90° (surtout contexte "forces" + angle obtus entre les vecteurs composants), auquel
  // cas la résultante bascule réellement côté Sud.
  const cotePrincipal = triangle.C < 90 ? "Nord" : "Sud";
  const coteLateral = coteDeviation === "est" ? "Est" : "Ouest";
  const directionCorrecte = `${cotePrincipal}-${coteLateral}`;

  return {
    variante: varianteId,
    contexte,
    labelV1: donnees.labelV1,
    labelV2: donnees.labelV2,
    unite: donnees.unite,
    v1,
    v2,
    angleEntreVecteurs,
    coteDeviation,
    triangle,
    directionCorrecte,
  };
}

export const genererExerciceApplicationPhysique: GenerateurExerciceApplicationPhysique = () => {
  const varianteId: VarianteApplicationPhysique = Math.random() < 0.5 ? "angleDroit" : "angleQuelconque";
  return construireAvecVarianteId(varianteId);
};
