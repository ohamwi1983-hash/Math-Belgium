/**
 * Couche A — "Angles associés" (dix-septième générateur, chapitre 3). Voir
 * `core/anglesAssocies.types.ts` pour le détail du contrat et le raisonnement mathématique complet.
 *
 * Principe : `alpha` (angle de base, premier quadrant) est tiré en premier ; `sinAlpha`/`cosAlpha`
 * (ou `tanAlpha`) sont calculés puis ARRONDIS à 3 décimales — c'est cette valeur ARRONDIE, jamais
 * la valeur exacte, qui sert ensuite de base au calcul de `valeurCible`, pour que la cible reste
 * exactement dérivable des seules valeurs affichées à l'élève (self-consistance, aucune valeur
 * "secrète" plus précise que ce qui est montré).
 *
 * Pour la variante sin/cos, la relation "de référence" (`x`, exposée sur l'exercice sous le nom
 * `xReference` — voir `core/anglesAssocies.types.ts`) utilisée dans les identités
 * quadrant-par-quadrant (`sin(180°-x)=sin(x)`, etc.) vaut soit `alpha` (`sousCas="directe"`), soit
 * `90°-alpha` (`sousCas="complement"`, nécessitant l'identité de co-fonction supplémentaire
 * `sin(90°-alpha)=cos(alpha)`/`cos(90°-alpha)=sin(alpha)`) — les deux cas sont algébriquement
 * unifiés par un simple échange (`sinX`/`cosX` = `sinAlpha`/`cosAlpha` ou leur permutation), jamais
 * deux formules séparées dupliquées par quadrant. `theta` (l'angle réel affiché) suit la même
 * unification : `180-x` (Q2), `180+x` (Q3), `360-x` (Q4) — vérifié par calcul indépendant (voir
 * `index.test.ts`) que ceci retombe bien sur `90+alpha`/`270-alpha`/`270+alpha` pour le sous-cas
 * "complement", jamais une coïncidence non testée, et que la reconstruction indépendante de `x`
 * depuis `theta` seul (`90-theta`/`180-theta`/`theta-180`/`360-theta` selon le quadrant) retombe
 * toujours exactement sur `xReference`.
 */
import type {
  ExerciceAnglesAssocies,
  ExerciceAnglesAssociesSinCos,
  ExerciceAnglesAssociesTangente,
  FonctionSinCos,
  GenerateurExerciceAnglesAssocies,
  IdVarianteAnglesAssocies,
  QuadrantAnglesAssocies,
  RelationAnglesAssocies,
} from "../../core/anglesAssocies.types";
import { randomInt } from "./aleatoire";

function arrondir3(valeur: number): number {
  return Number(valeur.toFixed(3));
}

/**
 * Contraintes de génération sur `alpha` (`promptgen17contraintesgeneration.md`) — jamais appliquées
 * aux overrides explicites (`alphaImpose`, réservé au forçage de test/instance précise, comportement
 * historique inchangé). Trois règles, appliquées au SEUL `alpha` tiré :
 * 1. jamais un angle remarquable classique (multiple de 30° ou 45°) ;
 * 2. toujours à au moins `MARGE_MULTIPLE_90` d'un multiple de 90° ;
 * 3. pour les variantes où l'aide 3 (relation de complémentarité) peut s'activer (sinCos quadrants
 *    II/III/IV, jamais I ni tangente — voir `necessiteAide3`), en plus à au moins
 *    `MARGE_MULTIPLE_45` d'un multiple de 45°.
 *
 * Ces règles sur `alpha` seul suffisent à garantir les MÊMES marges pour `theta`/`xReference` —
 * jamais besoin d'un second filtre sur les valeurs dérivées : `xReference` vaut soit `alpha` (sousCas
 * "directe") soit `90-alpha` (sousCas "complement"), et la distance de `90-alpha` à un pivot `p`
 * parmi `{0,45,90}` égale toujours la distance de `alpha` au pivot symétrique `90-p` (lui-même dans
 * `{90,45,0}`) — donc exactement la même distance, quel que soit le pivot. `theta` (`90-x`/`180-x`/
 * `180+x`/`360-x` selon le quadrant) n'est jamais qu'un décalage de `x` par un multiple de 90°, donc
 * sa distance à ses propres pivots pertinents (`{0,90}`, `{90,180}`, `{180,270}` ou `{270,360}`) est
 * là encore exactement celle de `x` à `{0,90}` — même raisonnement pour le pivot 45° (`x` proche d'un
 * multiple de 45° ⟺ `theta` proche du multiple de 45° correspondant, décalé de 90°/180°/270°). Cette
 * garantie algébrique est cross-vérifiée sur un grand échantillon par `index.test.ts` (jamais
 * supposée sans preuve empirique) — voir aussi la contrainte 3 dédiée à la variante tangente
 * (`ANGLE_SYMETRIQUE_MAX_TANGENTE`), qui borne `alpha` par le haut plutôt que par une marge.
 */
const MARGE_MULTIPLE_90 = 20;
const MARGE_MULTIPLE_45 = 20;
/** Contrainte 3 — variantes tangente uniquement : l'angle du 1er quadrant obtenu par symétrie
 * (`xReference`, qui vaut toujours `alpha` pour tangente) doit rester ≤ 50°, pour garantir
 * `tan(xReference) ≤ tan(50°) ≈ 1,19` — évite la divergence vers l'infini près de 90° qui rendrait le
 * point représentant `tan` sur `x=1` impossible à cadrer proprement (voir `cercleAnglesAssociesAide.ts`,
 * le filet de sécurité pour ce cas limite reste en place malgré cette contrainte, voir sa doc). */
const ANGLE_SYMETRIQUE_MAX_TANGENTE = 50;
const TENTATIVES_MAX_ANGLE = 200;

function estAngleRemarquable(angleDeg: number): boolean {
  return angleDeg % 30 === 0 || angleDeg % 45 === 0;
}

/** `alpha` vit toujours dans `]0,90[` pour ce générateur — un simple modulo 45 suffit donc à
 * calculer sa distance au multiple de 45° le plus proche (0, 45 ou 90), pas besoin d'une fonction de
 * distance circulaire générale sur `[0,360[`. */
function margeMultiple45Respectee(alpha: number): boolean {
  return Math.abs(alpha - 45) >= MARGE_MULTIPLE_45;
}

/**
 * Tire un `alpha` ∈ `[bornInf,bornSup]` respectant les contraintes de génération ci-dessus — retry
 * borné (même patron que `construireAvecDroiteValide`/`construireFacteurFactorisable` ailleurs sur
 * la plateforme) plutôt qu'un domaine explicite calculé à la main : la plage valide a une forme
 * différente selon `margeMultiple45` (un intervalle simple sans lui, deux sous-intervalles disjoints
 * avec lui), et le retry reste correct dans les deux cas sans dupliquer cette logique. Les bornes
 * elles-mêmes encodent déjà la contrainte 2 (`MARGE_MULTIPLE_90`) — `bornInf`/`bornSup` sont toujours
 * appelées avec des valeurs déjà à au moins `MARGE_MULTIPLE_90` de 0°/90°, jamais revérifié ici.
 */
function tirerAlphaValide(bornInf: number, bornSup: number, margeMultiple45: boolean): number {
  for (let tentative = 0; tentative < TENTATIVES_MAX_ANGLE; tentative++) {
    const alpha = randomInt(bornInf, bornSup);
    if (estAngleRemarquable(alpha)) continue;
    if (margeMultiple45 && !margeMultiple45Respectee(alpha)) continue;
    return alpha;
  }
  throw new Error("tirerAlphaValide : échec après le nombre maximal de tentatives — incohérence interne inattendue");
}

/** `II`/`III`/`IV` uniquement — le quadrant I est un cas à part entière (voir `construireSinCos`). */
const RELATION_QUADRANT: Record<"II" | "III" | "IV", RelationAnglesAssocies> = {
  II: "supplementaire",
  III: "antiSupplementaire",
  IV: "oppose",
};

/** Signe de `sin(theta)`/`cos(theta)` en fonction de `sin(x)`/`cos(x)` (x = angle de référence en
 * quadrant I) — identités classiques des angles associés, jamais redérivées ailleurs dans ce
 * fichier. */
const SIGNE_SIN_COS: Record<"II" | "III" | "IV", Record<FonctionSinCos, 1 | -1>> = {
  II: { sin: 1, cos: -1 },
  III: { sin: -1, cos: -1 },
  IV: { sin: -1, cos: 1 },
};

function tirerFonctionCible(): FonctionSinCos {
  return Math.random() < 0.5 ? "sin" : "cos";
}

function tirerSousCas(): "directe" | "complement" {
  return Math.random() < 0.5 ? "directe" : "complement";
}

function construireSinCos(
  quadrant: QuadrantAnglesAssocies,
  sousCasDemande: "directe" | "complement",
  fonctionCible: FonctionSinCos,
  alphaImpose?: number,
): ExerciceAnglesAssociesSinCos {
  // Aide 3 possible uniquement en quadrant II/III/IV (jamais I, sousCas toujours "directe" —
  // voir necessiteAide3) : seuls ces quadrants ont besoin de la marge supplémentaire autour des
  // multiples de 45°.
  const margeMultiple45 = quadrant !== "I";
  const alpha = alphaImpose ?? tirerAlphaValide(MARGE_MULTIPLE_90, 90 - MARGE_MULTIPLE_90, margeMultiple45);
  const rad = (alpha * Math.PI) / 180;
  const sinAlpha = arrondir3(Math.sin(rad));
  const cosAlpha = arrondir3(Math.cos(rad));

  if (quadrant === "I") {
    // Toujours "complémentaire directe" — l'angle demandé EST déjà le complémentaire de alpha,
    // aucun sous-cas possible par construction (voir core/anglesAssocies.types.ts).
    const theta = 90 - alpha;
    const valeurCible = fonctionCible === "sin" ? cosAlpha : sinAlpha;
    return {
      variante: "sinCos",
      alpha,
      quadrant,
      relation: "complementaireDirecte",
      theta,
      xReference: alpha, // x = alpha toujours en Q1 (voir doc "sousCas")
      sinAlpha,
      cosAlpha,
      fonctionCible,
      sousCas: "directe",
      valeurCible,
    };
  }

  const sousCas = sousCasDemande;
  // x = angle de référence en quadrant I : alpha (directe) ou 90-alpha (complement, co-fonction).
  const x = sousCas === "directe" ? alpha : 90 - alpha;
  const [sinX, cosX] = sousCas === "directe" ? [sinAlpha, cosAlpha] : [cosAlpha, sinAlpha];
  const fx = fonctionCible === "sin" ? sinX : cosX;
  const signe = SIGNE_SIN_COS[quadrant][fonctionCible];
  const valeurCible = arrondir3(signe * fx);

  const theta = quadrant === "II" ? 180 - x : quadrant === "III" ? 180 + x : 360 - x;

  return {
    variante: "sinCos",
    alpha,
    quadrant,
    relation: RELATION_QUADRANT[quadrant],
    theta,
    xReference: x, // stocké tel quel — la reconstruction indépendante depuis theta (voir index.test.ts) confirme qu'il coïncide toujours
    sinAlpha,
    cosAlpha,
    fonctionCible,
    sousCas,
    valeurCible,
  };
}

function construireTangente(quadrant: "II" | "III" | "IV", alphaImpose?: number): ExerciceAnglesAssociesTangente {
  // Jamais de marge supplémentaire autour des multiples de 45° ici (jamais de sousCas "complement"
  // pour tangente, voir core/anglesAssocies.types.ts) — seule la contrainte 3 (plafond à
  // ANGLE_SYMETRIQUE_MAX_TANGENTE) s'applique en plus de la marge 90° commune à toutes les variantes.
  const alpha = alphaImpose ?? tirerAlphaValide(MARGE_MULTIPLE_90, ANGLE_SYMETRIQUE_MAX_TANGENTE, false);
  const rad = (alpha * Math.PI) / 180;
  const tanAlpha = arrondir3(Math.tan(rad));

  // tan(180-x)=-tan(x) (Q2) ; tan(180+x)=tan(x) (Q3) ; tan(360-x)=-tan(x) (Q4).
  const signe = quadrant === "III" ? 1 : -1;
  const valeurCible = arrondir3(signe * tanAlpha);
  const theta = quadrant === "II" ? 180 - alpha : quadrant === "III" ? 180 + alpha : 360 - alpha;

  return {
    variante: "tangente",
    alpha,
    quadrant,
    relation: RELATION_QUADRANT[quadrant],
    theta,
    xReference: alpha, // jamais de sous-cas "complement" pour tan (spec) — x=alpha toujours
    tanAlpha,
    valeurCible,
  };
}

export interface OverridesAnglesAssocies {
  alpha?: number;
  fonctionCible?: FonctionSinCos;
  sousCas?: "directe" | "complement";
}

/** Convention CLAUDE.md ("Catalogue de variantes") — force la combinaison (variante, relation)
 * demandée ; `overrides` reste sans effet sur les champs non pertinents pour la combinaison forcée
 * (ex. `sousCas` pour `sinCos-complementaireDirecte`, `fonctionCible` pour toute variante tangente). */
export function construireAvecVarianteId(
  varianteId: IdVarianteAnglesAssocies,
  overrides?: OverridesAnglesAssocies,
): ExerciceAnglesAssocies {
  switch (varianteId) {
    case "sinCos-complementaireDirecte":
      return construireSinCos("I", "directe", overrides?.fonctionCible ?? tirerFonctionCible(), overrides?.alpha);
    case "sinCos-supplementaire":
      return construireSinCos(
        "II",
        overrides?.sousCas ?? tirerSousCas(),
        overrides?.fonctionCible ?? tirerFonctionCible(),
        overrides?.alpha,
      );
    case "sinCos-antiSupplementaire":
      return construireSinCos(
        "III",
        overrides?.sousCas ?? tirerSousCas(),
        overrides?.fonctionCible ?? tirerFonctionCible(),
        overrides?.alpha,
      );
    case "sinCos-oppose":
      return construireSinCos(
        "IV",
        overrides?.sousCas ?? tirerSousCas(),
        overrides?.fonctionCible ?? tirerFonctionCible(),
        overrides?.alpha,
      );
    case "tangente-supplementaire":
      return construireTangente("II", overrides?.alpha);
    case "tangente-antiSupplementaire":
      return construireTangente("III", overrides?.alpha);
    case "tangente-oppose":
      return construireTangente("IV", overrides?.alpha);
    default: {
      const exhaustif: never = varianteId;
      throw new Error(`variante inconnue : ${String(exhaustif)}`);
    }
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteAnglesAssocies; label: string }[] = [
  { id: "sinCos-complementaireDirecte", label: "Sin/Cos — Complémentaire directe (Q1)" },
  { id: "sinCos-supplementaire", label: "Sin/Cos — Supplémentaire (Q2)" },
  { id: "sinCos-antiSupplementaire", label: "Sin/Cos — Anti-supplémentaire (Q3)" },
  { id: "sinCos-oppose", label: "Sin/Cos — Opposé (Q4)" },
  { id: "tangente-supplementaire", label: "Tangente — Supplémentaire (Q2)" },
  { id: "tangente-antiSupplementaire", label: "Tangente — Anti-supplémentaire (Q3)" },
  { id: "tangente-oppose", label: "Tangente — Opposé (Q4)" },
];

const QUADRANTS_SIN_COS: QuadrantAnglesAssocies[] = ["I", "II", "III", "IV"];
const QUADRANTS_TANGENTE: ("II" | "III" | "IV")[] = ["II", "III", "IV"];

const ID_SIN_COS: Record<QuadrantAnglesAssocies, IdVarianteAnglesAssocies> = {
  I: "sinCos-complementaireDirecte",
  II: "sinCos-supplementaire",
  III: "sinCos-antiSupplementaire",
  IV: "sinCos-oppose",
};

const ID_TANGENTE: Record<"II" | "III" | "IV", IdVarianteAnglesAssocies> = {
  II: "tangente-supplementaire",
  III: "tangente-antiSupplementaire",
  IV: "tangente-oppose",
};

/**
 * `variante` tirée en premier, 50/50 (spec : "Deux variantes"), PUIS un quadrant tiré uniformément
 * parmi ceux valides pour cette variante (4 pour sin/cos, 3 pour tangente — jamais un tirage
 * uniforme sur les 7 entrées du catalogue à plat, qui pencherait légèrement en faveur de sin/cos).
 */
export const genererExerciceAnglesAssocies: GenerateurExerciceAnglesAssocies = () => {
  if (Math.random() < 0.5) {
    const quadrant = QUADRANTS_SIN_COS[randomInt(0, QUADRANTS_SIN_COS.length - 1)];
    return construireAvecVarianteId(ID_SIN_COS[quadrant]);
  }
  const quadrant = QUADRANTS_TANGENTE[randomInt(0, QUADRANTS_TANGENTE.length - 1)];
  return construireAvecVarianteId(ID_TANGENTE[quadrant]);
};
