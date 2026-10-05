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
export function construireAvecVarianteId(
  varianteId: VarianteApplicationPhysique,
  overrides?: OverridesApplicationPhysique,
): ExerciceApplicationPhysique {
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
