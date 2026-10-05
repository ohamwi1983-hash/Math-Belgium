import type { CoucheGeneree, ExerciceDecompositionFonction, TypeCoucheCatalogue } from "../../core5e/decompositionFonction.types";
import { choisirParmi, entierAleatoire, entierNonNulAleatoire } from "../domaineDefinition/aleatoire";
import { appliquerCouche } from "./catalogue";
import type { ParametresCouche, RenduCouche } from "./catalogue";
import { simplifierLatex } from "../simplificationExpression";

const TOUTES_COUCHES: TypeCoucheCatalogue[] = ["affine", "carre", "cube", "racineCarree", "racineCubique", "inverse", "valeurAbsolue"];
const COUCHES_NON_AFFINES: TypeCoucheCatalogue[] = TOUTES_COUCHES.filter((t) => t !== "affine");

/** Les 2 groupes "au maximum 1 opération sur toute la chaîne" (C.3) — carré/cube d'un côté,
 * racineCarree/racineCubique de l'autre : au sein d'un même groupe, une SEULE des 2 opérations peut
 * apparaître, jamais les 2 (contrairement à un simple "pas de répétition", qui aurait autorisé
 * carré ET cube ensemble puisque ce sont 2 opérations DIFFÉRENTES). "affine" et "brute"
 * n'appartiennent à aucun des deux groupes — elles peuvent coexister librement avec l'une ou
 * l'autre (C.3, explicite), et "affine" seule peut réapparaître plusieurs fois dans la chaîne
 * (couche 1 ET couche finale) — déjà le comportement d'origine, jamais restreint ici. */
const GROUPE_PUISSANCE: TypeCoucheCatalogue[] = ["carre", "cube"];
const GROUPE_RACINE: TypeCoucheCatalogue[] = ["racineCarree", "racineCubique"];

/**
 * Paires ADJACENTES interdites (C.4), dans les 2 sens — s'annulent algébriquement l'une l'autre si
 * elles se suivent DIRECTEMENT dans la chaîne de composition : carré∘valeurAbsolue (et l'inverse)
 * collapse en x² (une valeur absolue juste avant/après un carré ne change jamais la valeur, couche
 * redondante et détectable), cube∘racineCubique (et l'inverse) collapse en x, l'identité pure (ces 2
 * couches consécutives s'annulent complètement) — dans les deux cas la composition dégénère et casse
 * la vérification par équivalence numérique (le domaine effectif change de façon incohérente, ou
 * l'expression redevient triviale).
 *
 * `carre`↔`racineCarree` (C.1, `promptcorrectionsround2.md`) — 2 raisons mécaniques DISTINCTES,
 * jamais fondues avec la justification cube/racineCubique ci-dessus malgré la ressemblance
 * superficielle :
 * - **racineCarree puis carre** : `(√u)²=u` sur le domaine de `√u` — collapse vers l'IDENTITÉ, même
 *   mécanisme (couche redondante, détectable) que cube∘racineCubique.
 * - **carre puis racineCarree** : `√(u²)=|u|` pour tout u réel — collapse vers une fonction qui
 *   existe DÉJÀ dans le catalogue (`valeurAbsolue`), jamais vers l'identité : une chaîne à 2 couches
 *   `{carre, racineCarree}` devient indiscernable d'une chaîne à 1 couche `{valeurAbsolue}` — un
 *   problème de PROFONDEUR (la profondeur annoncée à l'élève ne correspond plus au nombre réel
 *   d'opérations distinctes) en plus d'un problème d'équivalence.
 */
const PAIRES_ADJACENTES_INTERDITES: [TypeCoucheCatalogue, TypeCoucheCatalogue][] = [
  ["carre", "valeurAbsolue"],
  ["cube", "racineCubique"],
  ["carre", "racineCarree"],
];

function formePaireInterdite(a: TypeCoucheCatalogue, b: TypeCoucheCatalogue): boolean {
  return PAIRES_ADJACENTES_INTERDITES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

function contientPaireAdjacenteInterdite(couches: CoucheGeneree[]): boolean {
  for (let i = 0; i < couches.length - 1; i++) {
    if (formePaireInterdite(couches[i].type, couches[i + 1].type)) return true;
  }
  return false;
}

/**
 * Pool des types catalogue NON-AFFINES encore disponibles pour une position donnée, compte tenu des
 * types déjà utilisés ailleurs dans la chaîne (C.3 — pas de répétition) et des 2 groupes déjà
 * entamés (C.3 — au plus 1 par groupe). Ne filtre volontairement PAS les paires adjacentes
 * interdites (C.4) — un filtrage position-par-position sur l'adjacence, combiné aux contraintes
 * ci-dessus, viderait le pool dans le pire cas (profondeur 4, les 4 positions catalogue-non-affines
 * toutes nécessaires : 1 slot "puissance", 1 slot "racine", inverse, valeurAbsolue — exactement 4
 * types disponibles au total, aucune marge pour en exclure un de plus par adjacence sur la toute
 * dernière position). Le reroll global (`construireAvecProfondeur`, plus bas) reste donc la seule
 * stratégie sûre pour C.4 — jamais un filtrage local qui risquerait un pool vide.
 */
function couchesDisponibles(dejaUtilisees: ReadonlySet<TypeCoucheCatalogue>): TypeCoucheCatalogue[] {
  const groupePuissanceEntame = GROUPE_PUISSANCE.some((t) => dejaUtilisees.has(t));
  const groupeRacineEntame = GROUPE_RACINE.some((t) => dejaUtilisees.has(t));
  return COUCHES_NON_AFFINES.filter((t) => {
    if (dejaUtilisees.has(t)) return false;
    if (groupePuissanceEntame && GROUPE_PUISSANCE.includes(t)) return false;
    if (groupeRacineEntame && GROUPE_RACINE.includes(t)) return false;
    return true;
  });
}

/** Profondeur pondérée (spec) — ~50% à 2 couches, ~42% à 3, ~8% à 4 (jamais uniforme, la
 * profondeur 4 doit rester rare). */
function tirerProfondeur(): number {
  const r = Math.random();
  if (r < 0.5) return 2;
  if (r < 0.92) return 3;
  return 4;
}

function tirerParametresAffine(): ParametresCouche {
  return { a: entierNonNulAleatoire(-3, 3), b: entierAleatoire(-9, 9) };
}

/**
 * Poids de tirage de la couche "brute" en position couche 1 (C.2) — poids PROPOSÉ (35%), aucun
 * chiffre exact fourni par la tâche : garde couche 1 majoritairement issue du catalogue (comme
 * avant l'introduction de "brute"), tout en introduisant cette forme hors catalogue assez souvent
 * pour être rencontrée régulièrement par l'élève.
 */
const POIDS_COUCHE1_BRUTE = 0.35;

/**
 * `n` restreint à {2,3,4} — `n=1` est EXCLU : avec `m<n` et `m≥0`, `n=1` forcerait `m=0`, donnant
 * `a·x+b`, exactement la forme "affine" du catalogue — la couche "brute" perdrait alors sa raison
 * d'être (introduire une forme structurellement hors catalogue, jamais une simple redite). `a`/`b`
 * sont toujours des entiers NON NULS (`entierNonNulAleatoire`, |a|/|b| ∈ [1,5]) : la composition
 * `a·xⁿ+b·xᵐ` reste donc TOUJOURS un vrai binôme à 2 termes distincts — le cas dégénéré cité par la
 * tâche ("m=0,b=0,n=2,a=1 ≡ x²") est ainsi structurellement IMPOSSIBLE ici (b ne peut jamais valoir
 * 0), sans besoin d'un retirage dédié pour ce cas précis.
 *
 * Exportée (plutôt que privée) uniquement pour être testable DIRECTEMENT (`index.test.ts`) : sonder
 * `n`/`m`/`a`/`b` réellement générés reste plus robuste qu'essayer de prouver l'absence de
 * dégénérescence après coup, par échantillonnage numérique de la fonction résultante — un binôme
 * a·xⁿ+b·xᵐ non affine peut malgré tout, par pure coïncidence arithmétique sur un petit nombre de
 * points entiers choisis à l'avance, sembler localement "aligné" à CES points précis (piège
 * réellement rencontré en test : `a=1,n=3,b=-4,m=2` donne `x³-4x²`, qui vaut exactement 0, -3, -9
 * en x=0,1,3 — parfaitement colinéaire à ces 3 points précis bien que la fonction ne soit en rien
 * affine ailleurs, ex. x=2 donne -8, pas -6 comme le prédirait l'interpolation linéaire).
 */
export function tirerParametresBrute(): ParametresCouche {
  const n = choisirParmi([2, 3, 4] as const);
  const m = entierAleatoire(0, n - 1);
  const a = entierNonNulAleatoire(-5, 5);
  const b = entierNonNulAleatoire(-5, 5);
  return { a, n, b, m };
}

/** Reconstruit, EN PARALLÈLE de la construction symbolique (LaTeX/formule évaluable), une fonction
 * JS numérique PURE représentant la même couche — utilisée UNIQUEMENT par le garde-fou de
 * génération `comptePointsFinis` (plus bas), jamais exposée hors de ce module. Volontairement une
 * DUPLICATION locale plutôt qu'une réutilisation de `evaluerExpressionGenerale` (`src/moteur/`,
 * 4e) : ce module (Couche A, `src/generateurs5e/`) ne doit dépendre que de `src/core5e/` — jamais
 * d'un module de Couche B, même cross-chantier (règle d'architecture non négociable du projet,
 * "Les générateurs et le moteur ne dépendent que de src/core/") — un évaluateur numérique local,
 * pur et minuscule, l'évite entièrement sans repasser par aucun parseur de chaîne. */
function transformateurNumerique(type: TypeCoucheCatalogue, params: ParametresCouche): (v: number) => number {
  switch (type) {
    case "affine": {
      const a = params.a ?? 1;
      const b = params.b ?? 0;
      return (v) => a * v + b;
    }
    case "carre":
      return (v) => v * v;
    case "cube":
      return (v) => v * v * v;
    case "racineCarree":
      return (v) => (v < 0 ? NaN : Math.sqrt(v));
    case "racineCubique":
      return (v) => Math.sign(v) * Math.pow(Math.abs(v), 1 / 3);
    case "inverse":
      return (v) => 1 / v;
    case "valeurAbsolue":
      return (v) => Math.abs(v);
    case "brute": {
      const a = params.a ?? 1;
      const n = params.n ?? 2;
      const b = params.b ?? 1;
      const m = params.m ?? 0;
      return (v) => a * Math.pow(v, n) + b * Math.pow(v, m);
    }
  }
}

const DEMI_ETENDUE_ECHANTILLON = 15;
const PAS_ECHANTILLON = 0.25;

/** Marge de sécurité largement au-delà du seuil réellement exigé côté vérification
 * (`MIN_COMPARAISONS_VALIDES=15`, `moteur5e/verificationDecompositionFonction.ts`, INCHANGÉE) — la
 * couche "brute" (C.2) peut introduire un domaine plus étroit qu'avant (ex. une racine carrée
 * appliquée directement à un polynôme de degré pair à coefficient dominant négatif n'est définie
 * que sur une portion de `[-15,15]`) ; ce garde-fou de GÉNÉRATION (jamais un changement de la
 * vérification, hors de portée de cette tâche) reroll tant que le domaine effectif reste trop
 * étroit pour l'échantillonnage déjà en place côté vérification — un seuil "juste assez large"
 * resterait fragile face à d'éventuels écarts d'arrondi entre cette évaluation numérique locale et
 * l'évaluateur par chaîne de caractères réellement utilisé côté vérification. */
const SEUIL_POINTS_FINIS_SUR = 30;

function comptePointsFinis(f: (x: number) => number): number {
  let n = 0;
  for (let x = -DEMI_ETENDUE_ECHANTILLON; x <= DEMI_ETENDUE_ECHANTILLON; x += PAS_ECHANTILLON) {
    if (Number.isFinite(f(x))) n++;
  }
  return n;
}

interface TentativeConstruction {
  exercice: ExerciceDecompositionFonction;
  evaluer: (x: number) => number;
}

/**
 * Une seule tentative de construction de f(x) par composition — la couche 1 (la plus intérieure)
 * est SOIT une expression "brute" (C.2, poids `POIDS_COUCHE1_BRUTE`), SOIT choisie parmi les 7
 * entrées du catalogue ; les couches intermédiaires sont toujours parmi les 6 non-affines ; la
 * couche finale est SOIT une entrée non-affine, SOIT un habillage affine du résultat précédent
 * (`estAffineFinale`), ~50/50. Diversité (C.3) et paires adjacentes interdites (C.4, vérifiée après
 * coup par l'appelant `construireAvecProfondeur`, jamais ici) — voir `couchesDisponibles`.
 *
 * Garde-fou contre la dégénérescence (préexistant) : si profondeur===2 ET la couche finale est
 * affine, la couche 1 est forcée non-affine — sinon la composition de 2 affines redevient une simple
 * fonction affine, ce qui viderait l'exercice de tout contenu à décomposer. Une couche 1 "brute"
 * n'est jamais concernée par cette garde (un habillage affine du résultat d'un polynôme de degré ≥2
 * ne peut structurellement jamais redevenir une simple fonction affine).
 */
function tenterConstruireAvecProfondeur(profondeur: 2 | 3 | 4): TentativeConstruction {
  const finaleEstAffine = Math.random() < 0.5;
  const couche1EstBrute = Math.random() < POIDS_COUCHE1_BRUTE;

  const dejaUtilisees = new Set<TypeCoucheCatalogue>();
  let courant: RenduCouche = { formule: "x", latex: "x" };
  let evaluerCourant: (x: number) => number = (x) => x;
  const couches: CoucheGeneree[] = [];

  function ajouterCouche(type: TypeCoucheCatalogue, estAffineFinale: boolean, params: ParametresCouche = {}) {
    const argumentLatex = courant.latex;
    courant = appliquerCouche(type, courant, params);
    const propre = appliquerCouche(type, { formule: "x", latex: "x" }, params);
    couches.push({ type, estAffineFinale, argumentLatex, propreLatex: propre.latex, propreFormule: propre.formule });

    const transformateur = transformateurNumerique(type, params);
    const precedent = evaluerCourant;
    evaluerCourant = (x) => transformateur(precedent(x));

    // "affine" (peut réapparaître, couche 1 ET couche finale) et "brute" (couche 1 uniquement,
    // jamais répétable de toute façon) ne sont jamais comptées dans les contraintes de diversité C.3.
    if (type !== "affine" && type !== "brute") dejaUtilisees.add(type);
  }

  if (couche1EstBrute) {
    ajouterCouche("brute", false, tirerParametresBrute());
  } else {
    const poolNonAffine = couchesDisponibles(dejaUtilisees);
    const pool: TypeCoucheCatalogue[] = profondeur === 2 && finaleEstAffine ? poolNonAffine : ["affine", ...poolNonAffine];
    const typeCouche1 = choisirParmi(pool);
    ajouterCouche(typeCouche1, false, typeCouche1 === "affine" ? tirerParametresAffine() : {});
  }

  for (let i = 1; i < profondeur - 1; i++) {
    ajouterCouche(choisirParmi(couchesDisponibles(dejaUtilisees)), false);
  }

  if (finaleEstAffine) {
    ajouterCouche("affine", true, tirerParametresAffine());
  } else {
    ajouterCouche(choisirParmi(couchesDisponibles(dejaUtilisees)), false);
  }

  return {
    exercice: { profondeur, fLatex: `f(x) = ${simplifierLatex(courant.formule, courant.latex)}`, fFormule: courant.formule, couches },
    evaluer: evaluerCourant,
  };
}

const TENTATIVES_MAX_REROLL = 300;

/** Force la profondeur de composition (2/3/4 couches) plutôt que de la tirer aléatoirement — voir
 * `construireAvecProfondeur` côté panneau dev-only (`SelecteurVarianteDev`).
 *
 * Reroll BORNÉ (C.4, même patron "for tentative in range(N)" déjà établi ailleurs sur la
 * plateforme) : régénère l'intégralité de la tentative (couche 1, couches intermédiaires, couche
 * finale — jamais un correctif ciblé sur une seule position) tant que celle-ci contient une paire
 * ADJACENTE interdite (C.4) ou un domaine effectif trop étroit pour l'échantillonnage de la
 * vérification (voir `SEUIL_POINTS_FINIS_SUR`) — un filet ultime (jamais atteint en pratique, voir
 * `index.test.ts`, sweep de plusieurs milliers de tirages) retourne la dernière tentative même si
 * elle reste invalide plutôt que de planter l'application. */
export function construireAvecProfondeur(profondeur: 2 | 3 | 4): ExerciceDecompositionFonction {
  let derniereTentative = tenterConstruireAvecProfondeur(profondeur);
  for (let tentative = 0; tentative < TENTATIVES_MAX_REROLL; tentative++) {
    const valide = !contientPaireAdjacenteInterdite(derniereTentative.exercice.couches) && comptePointsFinis(derniereTentative.evaluer) >= SEUIL_POINTS_FINIS_SUR;
    if (valide) return derniereTentative.exercice;
    derniereTentative = tenterConstruireAvecProfondeur(profondeur);
  }
  return derniereTentative.exercice;
}

export function genererExerciceDecompositionFonction(): ExerciceDecompositionFonction {
  return construireAvecProfondeur(tirerProfondeur() as 2 | 3 | 4);
}
