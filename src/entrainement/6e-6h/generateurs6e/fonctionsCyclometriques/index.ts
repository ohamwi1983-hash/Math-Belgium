import type { Arcfonction, EntreeBanqueArc, PointCercleTrig, Trigfonction, ValeurExacte } from "../../core6e/cyclometrique.types";
import type {
  ExerciceCycloArcTrig,
  ExerciceCycloDirecte,
  ExerciceCycloTrigArc,
  ExerciceFonctionsCyclometriques,
  VarianteFonctionsCyclometriques,
} from "../../core6e/fonctionsCyclometriques.types";
import { BANQUE_16_POINTS, BANQUES_ARC } from "../cyclometrique/banqueAngles";

/**
 * Couche A (6e) — générateur pour `6gen2` ("Valeurs cyclométriques : existence et calcul",
 * REFONTE TOTALE, chapitre 1). Fusionne 3 variantes de calcul dans UN SEUL contrat d'exercice
 * (`core6e/fonctionsCyclometriques.types.ts`) :
 *
 * 1. "directe"  : arcfonction(nombre) — nombre TOUJOURS dans le domaine (tiré de sa propre banque
 *    remarquable) — jamais de cas "n'existe pas" pour cette variante.
 * 2. "arcTrig"  : arcfonction(trigfonction(θ)) — inexistence ssi arcfonction∈{arcsin,arccos} ET
 *    |trigfonction(θ)|>1, seulement atteignable via trigfonction="tan" (sin/cos sont bornés dans
 *    [-1;1], jamais hors domaine). Réutilise TEL QUEL le calcul déjà établi par l'ancienne variante
 *    "composite" de ce générateur.
 * 3. "trigArc"  : trigfonction(arcfonction(nombre)) — NOUVEAUTÉ CENTRALE du spec, 2 causes
 *    d'inexistence INDÉPENDANTES :
 *    - cause "horsDomaine" (partagée avec la variante 2) : nombre ∉ [-1;1] pour arcsin/arccos —
 *      arctan est TOUJOURS définie sur ℝ, ne peut jamais déclencher cette cause.
 *    - cause "anglePiSur2" (PROPRE à tan∘arccos et tan∘arcsin uniquement) : nombre pourtant valide,
 *      mais l'angle intermédiaire arcfonction(nombre) vaut exactement ±π/2, où tan est indéfinie.
 *      sin/cos n'ont JAMAIS cette cause (définis pour tout réel).
 *
 * **Piège flottant évité par construction** (voir `index.test.ts`, describe "vérification
 * mathématique manuelle") : `Math.tan(Math.PI/2)` n'est ni `NaN` ni `Infinity` en JS — un grand
 * nombre FINI (imprécision de `Math.PI/2`), donc un test de finitude sur un calcul direct serait
 * silencieusement faux. La cause "anglePiSur2" est donc déterminée par LOOKUP dans
 * `BANQUE_16_POINTS` (`PointCercleTrig.tan===null`, donnée EXACTE), jamais par un calcul flottant
 * direct de tangente.
 */

const ARCFONCTIONS: Arcfonction[] = ["arcsin", "arccos", "arctan"];
const TRIGFONCTIONS: Trigfonction[] = ["sin", "cos", "tan"];

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const TOLERANCE_RECHERCHE = 1e-9;

// ============================================================================
// Variante 1 — "directe".
// ============================================================================

export function construireDirecte(): ExerciceCycloDirecte {
  const arcfonction = tirerParmi(ARCFONCTIONS);
  const entree = tirerParmi(BANQUES_ARC[arcfonction]);
  return {
    variante: "directe",
    arcfonction,
    nombreLatex: entree.valeur.latex,
    nombreNumerique: entree.valeur.numerique,
    existe: true,
    valeurLatex: entree.angle.latex,
    valeurNumerique: entree.angle.numerique,
  };
}

// ============================================================================
// Variante 2 — "arcTrig" (arcfonction(trigfonction(θ))) — mécanique reprise TELLE QUELLE de
// l'ancienne variante "composite" de ce générateur (voir historique-6e.md).
// ============================================================================

function trouverAngleBanque(arcfonction: Arcfonction, valeurNumerique: number): EntreeBanqueArc | undefined {
  return BANQUES_ARC[arcfonction].find((e) => Math.abs(e.valeur.numerique - valeurNumerique) < TOLERANCE_RECHERCHE);
}

const TENTATIVES_MAX = 200;

/**
 * "Aucune restriction au tirage" tient pour 8 des 9 combinaisons externe/interne — mais PAS
 * littéralement pour toutes : `interne=tan` produit 4 magnitudes possibles (0, √3/3, 1, √3, aux 4
 * angles de référence 0/π/6/π/4/π/3) ; seules 0 et 1 coïncident avec le domaine fini des banques
 * `arcsin`/`arccos`, et √3 déclenche correctement "n'existe pas" (>1, hors domaine RÉEL). La
 * magnitude √3/3 (référence π/6) est en revanche mathématiquement DANS le domaine ([-1;1]) mais ne
 * correspond à AUCUN angle remarquable de la banque `arcsin`/`arccos` — un vrai "n'existe pas"
 * serait donc FAUX pédagogiquement. Seule issue correcte : ne jamais générer cette combinaison
 * précise — reroll borné, jamais un throw ni une fausse réponse "n'existe pas".
 */
export function construireArcTrig(): ExerciceCycloArcTrig {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const arcfonction = tirerParmi(ARCFONCTIONS);
    const trigfonction = tirerParmi(TRIGFONCTIONS);
    // Contrainte de génération : si interne=tan, exclure θ=π/2+kπ (tangente indéfinie de l'INTÉRIEUR).
    const candidatsTheta = trigfonction === "tan" ? BANQUE_16_POINTS.filter((p) => p.tan !== null) : BANQUE_16_POINTS;
    const theta = tirerParmi(candidatsTheta);

    const valeurIntermediaire = theta[trigfonction] as ValeurExacte; // jamais null ici (filtré ci-dessus pour tan)
    const existe = arcfonction === "arctan" || Math.abs(valeurIntermediaire.numerique) <= 1 + TOLERANCE_RECHERCHE;

    if (!existe) {
      return { variante: "arcTrig", arcfonction, trigfonction, theta, existe: false, valeurLatex: null, valeurNumerique: null };
    }

    const entree = trouverAngleBanque(arcfonction, valeurIntermediaire.numerique);
    if (!entree) continue; // combinaison sans angle remarquable (voir doc ci-dessus) — reroll.
    return { variante: "arcTrig", arcfonction, trigfonction, theta, existe: true, valeurLatex: entree.angle.latex, valeurNumerique: entree.angle.numerique };
  }
  throw new Error("construireArcTrig : aucune combinaison valide trouvée après retirage");
}

function construireArcTrigForce(existeVoulu: boolean): ExerciceCycloArcTrig {
  for (let i = 0; i < TENTATIVES_MAX; i++) {
    const e = construireArcTrig();
    if (e.existe === existeVoulu) return e;
  }
  throw new Error(`construireArcTrigForce(${existeVoulu}) : aucun cas trouvé après retirage`);
}

// ============================================================================
// Variante 3 — "trigArc" (trigfonction(arcfonction(nombre))).
// ============================================================================

/** Valeurs REMARQUABLES mais hors domaine [-1;1] — banque LOCALE (propre à 6gen2, jamais
 * partagée), pour la cause "horsDomaine". Fraction irréductible/entier, jamais de décimal. */
const BANQUE_HORS_DOMAINE: ValeurExacte[] = [
  { latex: "2", numerique: 2 },
  { latex: "-2", numerique: -2 },
  { latex: "\\frac{3}{2}", numerique: 1.5 },
  { latex: "-\\frac{3}{2}", numerique: -1.5 },
  { latex: "3", numerique: 3 },
  { latex: "-3", numerique: -3 },
  { latex: "\\frac{5}{2}", numerique: 2.5 },
  { latex: "-\\frac{5}{2}", numerique: -2.5 },
];

/** Seuls arcsin/arccos ont un domaine borné — arctan ne peut jamais produire la cause "horsDomaine". */
const ARCFONCTIONS_DOMAINE_BORNE: Arcfonction[] = ["arcsin", "arccos"];

const DEUX_PI = 2 * Math.PI;

/** Retrouve le point du cercle trigonométrique (parmi les 16 standards) correspondant à un angle
 * quelconque, y compris NÉGATIF (image de arcsin/arctan) — normalisé modulo 2π. Les 3 arcfonctions
 * ne produisent QUE des angles multiples de π/6 ou π/4, donc toujours présents dans la table —
 * jamais de `undefined` en pratique. Lookup EXACT (jamais un `Math.tan` direct — voir piège
 * flottant documenté en tête de fichier). */
function pointPourAngle(angleNumerique: number): PointCercleTrig {
  const normalise = ((angleNumerique % DEUX_PI) + DEUX_PI) % DEUX_PI;
  const trouve = BANQUE_16_POINTS.find((p) => Math.abs(p.angle.numerique - normalise) < TOLERANCE_RECHERCHE);
  if (!trouve) throw new Error(`pointPourAngle : aucun point trouvé pour l'angle ${angleNumerique}`);
  return trouve;
}

function construireTrigArcHorsDomaine(): ExerciceCycloTrigArc {
  const arcfonction = tirerParmi(ARCFONCTIONS_DOMAINE_BORNE);
  const nombre = tirerParmi(BANQUE_HORS_DOMAINE);
  const trigfonction = tirerParmi(TRIGFONCTIONS); // sans incidence : cause 1 l'emporte quel qu'il soit
  return {
    variante: "trigArc",
    trigfonction,
    arcfonction,
    nombreLatex: nombre.latex,
    nombreNumerique: nombre.numerique,
    existe: false,
    causeInexistence: "horsDomaine",
    valeurLatex: null,
    valeurNumerique: null,
  };
}

/** Nombre TOUJOURS dans le domaine de `arcfonction` (tiré de sa propre banque) — l'issue
 * (existe / cause "anglePiSur2") dépend alors UNIQUEMENT de `PointCercleTrig.tan===null` au point
 * trouvé, jamais forcée à l'avance : sin/cos ne peuvent structurellement jamais y aboutir (`.sin`/
 * `.cos` ne sont jamais `null` dans `BANQUE_16_POINTS`). */
function construireTrigArcDepuisDomaine(): ExerciceCycloTrigArc {
  const arcfonction = tirerParmi(ARCFONCTIONS);
  const trigfonction = tirerParmi(TRIGFONCTIONS);
  const entree = tirerParmi(BANQUES_ARC[arcfonction]);
  const point = pointPourAngle(entree.angle.numerique);
  const valeur = point[trigfonction];
  const existe = valeur !== null;
  return {
    variante: "trigArc",
    trigfonction,
    arcfonction,
    nombreLatex: entree.valeur.latex,
    nombreNumerique: entree.valeur.numerique,
    existe,
    causeInexistence: existe ? null : "anglePiSur2",
    valeurLatex: existe ? (valeur as ValeurExacte).latex : null,
    valeurNumerique: existe ? (valeur as ValeurExacte).numerique : null,
  };
}

/** Tirage NATUREL — pièce non biaisée entre les 2 chemins de génération (hors domaine tiré
 * directement / nombre valide dont l'issue dépend du tirage réel trigfonction×angle). */
export function construireTrigArc(): ExerciceCycloTrigArc {
  return Math.random() < 0.5 ? construireTrigArcHorsDomaine() : construireTrigArcDepuisDomaine();
}

/** Rejection sampling fiable ici : P(existe)≈96% avec un tirage naturel (voir
 * `construireTrigArcDepuisDomaine`), donc `TENTATIVES_MAX` largement suffisant. */
function construireTrigArcExisteForce(): ExerciceCycloTrigArc {
  for (let i = 0; i < TENTATIVES_MAX; i++) {
    const e = construireTrigArcDepuisDomaine();
    if (e.existe) return e;
  }
  throw new Error("construireTrigArcExisteForce : aucun cas trouvé après retirage");
}

/** Construction DÉTERMINISTE (jamais par rejection sampling) pour la cause "anglePiSur2" — la
 * combinaison exacte (arcfonction, nombre) qui produit l'angle ±π/2 est connue et FINIE (3
 * couples au total : arccos(0), arcsin(1), arcsin(-1)), donc piocher directement dedans plutôt que
 * de retirer au hasard jusqu'à tomber dessus. Piège déjà rencontré ici en TDD (voir
 * `index.test.ts`) : un rejection sampling naïf sur ce sous-cas précis n'a qu'environ 1/27 chance
 * par tirage (trigfonction=tan ET arcfonction∈{arcsin,arccos} ET nombre pile sur le bon point de la
 * banque) — assez rare pour dépasser `TENTATIVES_MAX` de façon non négligeable sur de nombreux
 * appels (observé empiriquement : échec réel sur un run de test, jamais depuis ce correctif). */
function construireTrigArcCausePiSur2(): ExerciceCycloTrigArc {
  const arcfonction = tirerParmi<Arcfonction>(["arcsin", "arccos"]);
  const entree =
    arcfonction === "arccos"
      ? (BANQUES_ARC.arccos.find((e) => Math.abs(e.valeur.numerique) < TOLERANCE_RECHERCHE) as EntreeBanqueArc)
      : tirerParmi(BANQUES_ARC.arcsin.filter((e) => Math.abs(Math.abs(e.valeur.numerique) - 1) < TOLERANCE_RECHERCHE));
  return {
    variante: "trigArc",
    trigfonction: "tan",
    arcfonction,
    nombreLatex: entree.valeur.latex,
    nombreNumerique: entree.valeur.numerique,
    existe: false,
    causeInexistence: "anglePiSur2",
    valeurLatex: null,
    valeurNumerique: null,
  };
}

// ============================================================================
// Catalogue de variantes `{id,label}` + `construireAvecVarianteId` — convention permanente. 6
// entrées : la variante 1 n'a pas de cas d'inexistence (1 entrée), la variante 2 en a un (2
// entrées : existe/inexistant), la variante 3 en a deux INDÉPENDANTS (3 entrées :
// existe/horsDomaine/anglePiSur2) — chacune forçable individuellement par le panneau dev.
// ============================================================================

export type IdVarianteFonctionsCyclometriques = "directe" | "arcTrig_existe" | "arcTrig_inexistant" | "trigArc_existe" | "trigArc_causeDomaine" | "trigArc_causePiSur2";

export const CATALOGUE_VARIANTES: { id: IdVarianteFonctionsCyclometriques; label: string }[] = [
  { id: "directe", label: "1. Lecture directe" },
  { id: "arcTrig_existe", label: "2. arcfonction(trig(θ)) — existe" },
  { id: "arcTrig_inexistant", label: "2. arcfonction(trig(θ)) — n'existe pas" },
  { id: "trigArc_existe", label: "3. trig(arcfonction(n)) — existe" },
  { id: "trigArc_causeDomaine", label: "3. trig(arcfonction(n)) — cause hors domaine" },
  { id: "trigArc_causePiSur2", label: "3. trig(arcfonction(n)) — cause angle π/2" },
];

export function construireAvecVarianteId(id: IdVarianteFonctionsCyclometriques): ExerciceFonctionsCyclometriques {
  switch (id) {
    case "directe":
      return construireDirecte();
    case "arcTrig_existe":
      return construireArcTrigForce(true);
    case "arcTrig_inexistant":
      return construireArcTrigForce(false);
    case "trigArc_existe":
      return construireTrigArcExisteForce();
    case "trigArc_causeDomaine":
      return construireTrigArcHorsDomaine();
    case "trigArc_causePiSur2":
      return construireTrigArcCausePiSur2();
  }
}

const VARIANTES_PRINCIPALES: VarianteFonctionsCyclometriques[] = ["directe", "arcTrig", "trigArc"];

/** Tirage ÉQUIPROBABLE parmi les 3 variantes de HAUT NIVEAU (spec : les 3 mécaniques de calcul) —
 * chacune décide ensuite elle-même, naturellement, si son exercice existe ou non. */
export function genererExerciceFonctionsCyclometriques(): ExerciceFonctionsCyclometriques {
  const variante = tirerParmi(VARIANTES_PRINCIPALES);
  if (variante === "directe") return construireDirecte();
  if (variante === "arcTrig") return construireArcTrig();
  return construireTrigArc();
}
