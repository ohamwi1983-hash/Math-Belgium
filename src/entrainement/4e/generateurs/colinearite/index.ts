/**
 * Couche A — "Colinéarité et alignement de points" (chapitre "Calcul vectoriel"), réécriture
 * complète (`promptcreationgenerateur24colinearitealignement.md`). Réutilise
 * `additionner`/`determinant`/`multiplier` (`generateurs/vecteur/arithmetique.ts`, module frère) —
 * jamais nommé "critère de colinéarité" côté présentation, voir `ui/formatColinearite.ts`.
 *
 * Simplification délibérée (même principe que "Loi des sinus", chapitre "Cercle
 * trigonométrique") : les 2 vecteurs des variantes "vecteurs"/"parametre" sont toujours nommés
 * u/v, les 3 points des variantes "points"/"pointsParametre" toujours A/B/C — la variété vient des
 * composantes tirées, pas des noms.
 */
import type {
  ComposantesLin,
  ExerciceColinearParametre,
  ExerciceColinearParametreCarre,
  ExerciceColinearPoints,
  ExerciceColinearPointsParametre,
  ExerciceColinearVecteurs,
  ExerciceColinearite,
  TypeSolutionColinearite,
  VarianteColinearite,
} from "../../core/colinearite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { additionner, determinant } from "../vecteur/arithmetique";
import { randomInt } from "./aleatoire";
import { construireVecteurAvecX } from "./linExpr";
import { tirerPaireUniforme } from "../vecteur/pairesUniformes";

/** `-0` produit par `a*b-a*b` quand les deux produits coïncident — jamais affiché "-0" à l'élève,
 * même précaution que `normaliserZero` (exercice "tableau de signes"). */
function normaliserZero(valeur: number): number {
  return valeur === 0 ? 0 : valeur;
}

function composantesLinFixe(v: Composantes): ComposantesLin {
  return { x: { coefX: 0, constante: v.x }, y: { coefX: 0, constante: v.y } };
}

function pointLinDepuisVecteur(origine: Point, v: ComposantesLin): ComposantesLin {
  return {
    x: { coefX: v.x.coefX, constante: origine.x + v.x.constante },
    y: { coefX: v.y.coefX, constante: origine.y + v.y.constante },
  };
}

function construireVecteurs(): ExerciceColinearVecteurs {
  const [v1, v2] = tirerPaireUniforme(determinant, Math.random() < 0.5);

  return {
    variante: "vecteurs",
    v1,
    v1Nom: "u",
    v2,
    v2Nom: "v",
    critere: normaliserZero(determinant(v1, v2)),
    colineaires: determinant(v1, v2) === 0,
  };
}

function construirePoints(): ExerciceColinearPoints {
  const pointA = { x: randomInt(-5, 5), y: randomInt(-5, 5) };
  const [vecteurAB, vecteurAC] = tirerPaireUniforme(determinant, Math.random() < 0.5);

  const pointB = additionner(pointA, vecteurAB);
  const pointC = additionner(pointA, vecteurAC);

  return {
    variante: "points",
    pointA,
    labelA: "A",
    pointB,
    labelB: "B",
    pointC,
    labelC: "C",
    vecteurAB,
    vecteurAC,
    critere: normaliserZero(determinant(vecteurAB, vecteurAC)),
    alignes: determinant(vecteurAB, vecteurAC) === 0,
  };
}

/** `variableEstV1` (ou `abEstVariable` pour la variante points) décide lequel des deux
 * vecteurs/côtés porte les composantes en `x` — le critère `critere(v1,v2)` change de signe selon
 * ce choix (`critere(fixe,variable) = -critere(variable,fixe)`), jamais recalculé indépendamment :
 * `coefX`/`coefConst` restent toujours ceux de l'équation RÉELLEMENT posée par `v1,v2` dans cet
 * ordre, quel que soit le côté choisi pour porter `x` — le signe global n'affecte jamais
 * `solutionX` (rapport `coefConst/coefX` invariant par un facteur global commun).
 *
 * `promptcorrectionsgenerateur24lot3.md`, point 2 — cette variante garantit désormais elle aussi
 * TOUJOURS exactement une solution (jamais identité/contradiction), `typeSolution` forcé à
 * `"unique"` comme `construirePointsParametre` ci-dessous — jamais tiré via `tirerTypeSolution()` —
 * pour permettre l'écran "résolution" simplifié à un simple champ numérique "x =", sans les 3 cas
 * dégénérés à gérer côté interface. */
function construireParametre(): ExerciceColinearParametre {
  const typeSolution: TypeSolutionColinearite = "unique";
  const { vecteurVariable, vecteurFixe, coefX, coefConst, solutionX } = construireVecteurAvecX(typeSolution);
  const variableEstV1 = Math.random() < 0.5;
  const signe = variableEstV1 ? 1 : -1;

  return {
    variante: "parametre",
    v1: variableEstV1 ? vecteurVariable : composantesLinFixe(vecteurFixe),
    v1Nom: "u",
    v2: variableEstV1 ? composantesLinFixe(vecteurFixe) : vecteurVariable,
    v2Nom: "v",
    coefX: normaliserZero(signe * coefX),
    coefConst: normaliserZero(signe * coefConst),
    typeSolution,
    solutionX,
  };
}

/**
 * `promptcorrectionsgenerateur24complet.md`, point 10 — cette variante garantit toujours EXACTEMENT
 * une solution (jamais identité/contradiction) : `typeSolution` forcé à `"unique"`, jamais tiré via
 * `tirerTypeSolution()`. Simplifie l'écran "résolution" en un simple champ numérique, sans les 3 cas
 * dégénérés à gérer — même principe désormais appliqué à `construireParametre` ci-dessus
 * (`promptcorrectionsgenerateur24lot3.md`, point 2).
 */
function construirePointsParametre(): ExerciceColinearPointsParametre {
  const typeSolution: TypeSolutionColinearite = "unique";
  const { vecteurVariable, vecteurFixe, coefX, coefConst, solutionX } = construireVecteurAvecX(typeSolution);
  const abEstVariable = Math.random() < 0.5;
  const signe = abEstVariable ? 1 : -1;
  const pointA = { x: randomInt(-5, 5), y: randomInt(-5, 5) };

  const vecteurAB: ComposantesLin = abEstVariable ? vecteurVariable : composantesLinFixe(vecteurFixe);
  const vecteurAC: ComposantesLin = abEstVariable ? composantesLinFixe(vecteurFixe) : vecteurVariable;

  return {
    variante: "pointsParametre",
    pointA,
    labelA: "A",
    pointB: pointLinDepuisVecteur(pointA, vecteurAB),
    labelB: "B",
    pointC: pointLinDepuisVecteur(pointA, vecteurAC),
    labelC: "C",
    vecteurAB,
    vecteurAC,
    coefX: normaliserZero(signe * coefX),
    coefConst: normaliserZero(signe * coefConst),
    typeSolution,
    solutionX,
  };
}

/**
 * « Paramètre au carré » (décision 3, audit 4e ch. 6) : u(x + p ; a), v(b ; x + r) — ou la disposition
 * miroir u(a ; x + p), v(x + r ; b) — d'où le critère ±[(x + p)(x + r) − ab], de discriminant
 * (p − r)² + 4ab. Le VERDICT (0, 1 ou 2 valeurs) est tiré d'abord, à parts égales ; puis p, r, a, b
 * sont tirés jusqu'à l'obtenir. Motif masqué (précédent gen95) : ab < 0 et p ≠ r pour TOUS les
 * verdicts — sinon « ab > 0 » trahissait deux solutions et « p = r » aucune ((x + p)² = ab < 0).
 * Deux solutions : Δ carré parfait, racines entières (même parité automatique).
 */
function construireParametreCarre(): ExerciceColinearParametreCarre {
  const typeSolution = (["zero", "une", "deux"] as const)[randomInt(0, 2)];
  for (;;) {
    const p = randomInt(-5, 5);
    const r = randomInt(-5, 5);
    if (p === r) continue;
    const a = randomInt(1, 6) * (Math.random() < 0.5 ? -1 : 1);
    const b = -Math.sign(a) * randomInt(1, 6);
    const delta = (p - r) * (p - r) + 4 * a * b;
    const racine = Math.round(Math.sqrt(Math.max(0, delta)));
    const verdict = delta < 0 ? "zero" : delta === 0 ? "une" : racine * racine === delta ? "deux" : null;
    if (verdict !== typeSolution) continue;
    const solutions = delta < 0 ? [] : delta === 0 ? [-(p + r) / 2] : [(-(p + r) - racine) / 2, (-(p + r) + racine) / 2];
    if (solutions.some((s) => Math.abs(s) > 9)) continue;
    const miroir = Math.random() < 0.5;
    const xp = { coefX: 1, constante: p };
    const xr = { coefX: 1, constante: r };
    const ca = { coefX: 0, constante: a };
    const cb = { coefX: 0, constante: b };
    // Critère x_u·y_v − y_u·x_v : (x+p)(x+r) − ab, ou ab − (x+p)(x+r) en miroir.
    const s = miroir ? -1 : 1;
    return {
      variante: "parametreCarre",
      v1: miroir ? { x: ca, y: xp } : { x: xp, y: ca },
      v1Nom: "u",
      v2: miroir ? { x: xr, y: cb } : { x: cb, y: xr },
      v2Nom: "v",
      coefX2: s,
      coefX: normaliserZero(s * (p + r)),
      coefConst: normaliserZero(s * (p * r - a * b)),
      typeSolution,
      solutions: solutions.map(normaliserZero),
    };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteColinearite; label: string }[] = [
  { id: "vecteurs", label: "Colinéarité de deux vecteurs" },
  { id: "parametre", label: "Déterminer x pour la colinéarité" },
  { id: "points", label: "Alignement de trois points" },
  { id: "pointsParametre", label: "Alignement avec x" },
  // Ajoutée EN FIN de catalogue (lot C, audit 4e ch. 6) : indices — donc `?code=` imprimés — inchangés.
  { id: "parametreCarre", label: "Déterminer x : paramètre au carré" },
];

export function construireAvecVarianteId(varianteId: VarianteColinearite): ExerciceColinearite {
  if (varianteId === "vecteurs") return construireVecteurs();
  if (varianteId === "parametre") return construireParametre();
  if (varianteId === "points") return construirePoints();
  if (varianteId === "parametreCarre") return construireParametreCarre();
  return construirePointsParametre();
}

/** Tirage libre des CODES et de l'adaptateur : les quatre variantes d'origine, comme avant l'ajout
 * de « paramètre au carré » — un `?code=` libre déjà imprimé rouvre le même exercice. */
export function genererExerciceColinearite(): ExerciceColinearite {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, 3)].id;
  return construireAvecVarianteId(varianteId);
}

/** Tirage libre de l'appli : les cinq variantes. */
export function genererExerciceColineariteLibre(): ExerciceColinearite {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
