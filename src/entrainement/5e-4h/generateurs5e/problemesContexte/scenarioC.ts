/**
 * Couche A (5e) — scénario C de 5gen5 : coûts d'une entreprise. CF (constant), CV(x) tiré parmi 4
 * formes (k√x/k∛x/kx²/kx³), CP(x)=mx (toujours linéaire — c'est un coût PROPORTIONNEL par
 * définition), CT(x)=CF+CV(x)+CP(x), CA(x) tiré parmi 3 formes (px/p√x/p∛x, jamais convexe — un
 * chiffre d'affaires qui accélère plus vite que tout coût rendrait le bénéfice trivialement toujours
 * positif au-delà d'un seuil, sans intérêt pédagogique). 12 combinaisons (4×3), toutes les données du
 * graphique/tableau sont en MILLIERS d'euros (piège de conversion explicite à l'écran 2).
 *
 * Le seuil de rentabilité (CA(x)=CT(x)) n'a de forme fermée simple que pour QUELQUES combinaisons
 * (ex. racineCarree/affine → quadratique en √x) — `trouverSeuilRentabilite` le retrouve pour LES 12
 * par un balayage numérique générique (même esprit que `generateurs5e/comparaisonSuites/simulation.ts`,
 * 5gen18) : certaines combinaisons (CV à croissance rapide type carre/cube, ou CA sous-linéaire type
 * racine face au coût proportionnel mx qui finit toujours par dominer) redeviennent non rentables au-
 * delà d'un second seuil — on exige donc un SEUL changement de signe dans la fenêtre [0,xMax]
 * affichée, jamais deux, et on retire tant que ce n'est pas le cas (même logique que la fenêtre
 * lisible déjà en place).
 */
import type { ExerciceScenarioC, FormeChiffreAffairesC, FormeCoutVariableC } from "../../core5e/problemesContexte.types";
import { entierAleatoire, tirerElement } from "./utils";

const CF_MIN = 20;
const CF_MAX = 50;
const M_MIN = 1;
const M_MAX = 3;
const MARGE_P_MIN = 2;
const MARGE_P_MAX = 6;
const TENTATIVES_MAX = 500;
const FRACTION_FENETRE_LISIBLE = 0.15;

const FORMES_CV: FormeCoutVariableC[] = ["racineCarree", "racineCubique", "carre", "cube"];
const FORMES_CA: FormeChiffreAffairesC[] = ["affine", "racineCarree", "racineCubique"];

export function coutVariable(formeCV: FormeCoutVariableC, k: number, x: number): number {
  switch (formeCV) {
    case "racineCarree":
      return k * Math.sqrt(x);
    case "racineCubique":
      return k * Math.cbrt(x);
    case "carre":
      return k * x * x;
    case "cube":
      return k * x * x * x;
  }
}

export function coutProportionnel(m: number, x: number): number {
  return m * x;
}

export function coutTotal(cf: number, formeCV: FormeCoutVariableC, k: number, m: number, x: number): number {
  return cf + coutVariable(formeCV, k, x) + coutProportionnel(m, x);
}

export function chiffreAffaires(formeCA: FormeChiffreAffairesC, p: number, x: number): number {
  switch (formeCA) {
    case "affine":
      return p * x;
    case "racineCarree":
      return p * Math.sqrt(x);
    case "racineCubique":
      return p * Math.cbrt(x);
  }
}

export function benefice(cf: number, formeCV: FormeCoutVariableC, k: number, m: number, formeCA: FormeChiffreAffairesC, p: number, x: number): number {
  return chiffreAffaires(formeCA, p, x) - coutTotal(cf, formeCV, k, m, x);
}

const N_BISECTIONS = 80;
const N_TERNAIRE = 100;
/** Borne de recherche du sommet — assez large pour contenir le sommet réel de `benefice` sur toute
 * la plage de coefficients possibles (vérifié empiriquement, `scenarioC.test.ts`), sans incidence
 * sur la précision de la recherche ternaire (convergence logarithmique, indépendante de la taille de
 * la plage). */
const LIMITE_RECHERCHE_VERTEX = 2000;

/** `benefice(x)=CA(x)-CT(x)` est concave dès que sa dérivée seconde `CA''(x)-CV''(x)` est ≤0 — c'est
 * TOUJOURS le cas si `formeCA` est sous-linéaire (racine, `CA''<0`, `CT` domine forcément à cause du
 * terme `+mx` linéaire) OU si `formeCV∈{carre,cube}` (`CV''>0`, la pénalité quadratique/cubique finit
 * toujours par dominer). Dans ces cas, `benefice` admet UN SEUL sommet (recherche ternaire) au-delà
 * duquel il redevient négatif — le domaine affiché doit s'arrêter avant ce second croisement, jamais
 * le couvrir. Seule la combinaison CA=affine + CV∈{racineCarree,racineCubique} (marge (p-m)x qui
 * domine indéfiniment) n'a PAS de second croisement : `xVertex` reste alors à la borne de recherche
 * (fonction encore strictement croissante), signalé par `null`. */
function trouverVertexOuNull(f: (x: number) => number): number | null {
  let lo = 1e-6;
  let hi = LIMITE_RECHERCHE_VERTEX;
  for (let i = 0; i < N_TERNAIRE; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (f(m1) < f(m2)) lo = m1;
    else hi = m2;
  }
  const xVertex = (lo + hi) / 2;
  return xVertex > LIMITE_RECHERCHE_VERTEX * 0.98 ? null : xVertex;
}

/** Bissection du seuil de rentabilité sur [0,xMax] — n'est appelée qu'après que `xMax` a été choisi
 * pour garantir EXACTEMENT une traversée perte→profit (voir `construireScenarioCAvecFormes`), jamais
 * un balayage-détection générique qui pourrait manquer une traversée étroite près du bord. */
function bissectionSeuil(f: (x: number) => number, xMax: number): number {
  let a = 1e-6;
  let b = xMax;
  for (let i = 0; i < N_BISECTIONS; i++) {
    const milieu = (a + b) / 2;
    if (f(milieu) < 0) a = milieu;
    else b = milieu;
  }
  return (a + b) / 2;
}

/** Plage de (k, xMax "par défaut") par forme de CV — ajustée à l'échelle de chaque forme pour garder
 * CV(x) lisible (comparable à CF/CP). `xMax` par défaut n'est utilisé QUE si `trouverVertexOuNull`
 * ne trouve aucun sommet (bénéfice indéfiniment croissant) — sinon `xMax` est dérivé du sommet trouvé. */
function tirerKEtXMax(formeCV: FormeCoutVariableC): { k: number; xMax: number } {
  switch (formeCV) {
    case "racineCarree":
      return { k: entierAleatoire(3, 8), xMax: entierAleatoire(30, 60) };
    case "racineCubique":
      return { k: entierAleatoire(6, 15), xMax: entierAleatoire(30, 60) };
    case "carre":
      return { k: entierAleatoire(2, 10) / 100, xMax: entierAleatoire(15, 30) };
    case "cube":
      return { k: entierAleatoire(1, 5) / 100, xMax: entierAleatoire(8, 18) };
  }
}

/** Plage de p par forme de CA — indépendante de CV, la fenêtre lisible + le rejet à 2 traversées se
 * chargent de filtrer les combinaisons infeasibles plutôt qu'un calibrage croisé par les 12 paires. */
function tirerP(formeCA: FormeChiffreAffairesC, m: number): number {
  switch (formeCA) {
    case "affine":
      return m + entierAleatoire(MARGE_P_MIN, MARGE_P_MAX);
    case "racineCarree":
      return entierAleatoire(15, 40);
    case "racineCubique":
      return entierAleatoire(25, 60);
  }
}

const CARRES_PARFAITS = [1, 4, 9, 16, 25, 36, 49, 64];

/** Valeurs "lisibles" pour xLecture/xBenefice — carrés parfaits si CV=k√x (racine qui tombe juste,
 * calcul mental), n'importe quel entier sinon. Pour CV=k∛x (racine cubique), la liste des cubes
 * parfaits (1,8,27,64) s'est révélée trop clairsemée : la fenêtre lisible [0,xMax] pour cette forme
 * dépasse rarement 30 (le seuil de rentabilité y est structurellement TRÈS bas, cf. `scenarioC.test.ts`),
 * ne laissant souvent qu'un seul cube parfait disponible — aucun tirage valide possible. `EtapeLectureC`
 * affiche donc désormais la calculatrice scientifique dès que CV=k∛x (ou k∛x n'est de toute façon pas
 * un calcul mental), même convention que carre/cube (kx²/kx³, jamais des racines "qui tombent juste"
 * non plus). */
function candidatsLisibles(formeCV: FormeCoutVariableC, xMax: number): number[] {
  if (formeCV === "racineCarree") return CARRES_PARFAITS.filter((v) => v >= 4 && v <= xMax - 2);
  const bas = 4;
  const haut = Math.max(bas, Math.floor(xMax - 2));
  const tous: number[] = [];
  for (let v = bas; v <= haut; v++) tous.push(v);
  return tous;
}

function tirerDeuxDistincts(candidats: number[]): [number, number] {
  const i = Math.floor(Math.random() * candidats.length);
  let j = Math.floor(Math.random() * candidats.length);
  while (j === i) j = Math.floor(Math.random() * candidats.length);
  return [candidats[i], candidats[j]];
}

export function construireScenarioCAvecFormes(formeCV: FormeCoutVariableC, formeCA: FormeChiffreAffairesC): ExerciceScenarioC {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const cf = entierAleatoire(CF_MIN, CF_MAX);
    const { k, xMax: xMaxParDefaut } = tirerKEtXMax(formeCV);
    const m = entierAleatoire(M_MIN, M_MAX);
    const p = tirerP(formeCA, m);
    const f = (x: number) => benefice(cf, formeCV, k, m, formeCA, p, x);

    if (f(1e-6) >= 0) continue; // devrait toujours être <0 (=-cf) — garde-fou défensif
    const xVertex = trouverVertexOuNull(f);
    if (xVertex !== null && f(xVertex) <= 0) continue; // jamais rentable, quel que soit x — retirer

    let xMax: number;
    let xSeuil: number;
    if (xVertex === null) {
      // Bénéfice indéfiniment croissant (pas de second croisement) — domaine "par défaut" comme
      // avant cette évolution, aucun risque de double traversée à filtrer.
      xMax = xMaxParDefaut;
      xSeuil = bissectionSeuil(f, xMax);
    } else {
      // Bénéfice concave/unimodal — xSeuil est structurellement TRÈS PROCHE de 0 pour certaines
      // combinaisons (marge généreuse dès les premières unités) : plutôt qu'un xMax tiré au hasard
      // dans une plage fixe (qui placerait alors xSeuil hors de la fenêtre lisible la plupart du
      // temps), xMax est dérivé de xSeuil pour GARANTIR par construction qu'il tombe à la fraction
      // basse de la fenêtre — jamais au-delà du sommet, seule vraie contrainte physique.
      xSeuil = bissectionSeuil(f, xVertex);
      xMax = Math.min(xVertex, xSeuil / FRACTION_FENETRE_LISIBLE);
    }
    if (xSeuil < xMax * FRACTION_FENETRE_LISIBLE || xSeuil > xMax * (1 - FRACTION_FENETRE_LISIBLE)) continue;

    const candidats = candidatsLisibles(formeCV, xMax);
    if (candidats.length < 2) continue;
    const [xLecture, xBenefice] = tirerDeuxDistincts(candidats);

    return { scenario: "C", formeCV, formeCA, cf, k, m, p, xMax, xLecture, xBenefice, xSeuil };
  }
  throw new Error(`construireScenarioCAvecFormes(${formeCV},${formeCA}) : aucun tirage valide trouvé après ${TENTATIVES_MAX} tentatives.`);
}

export function genererExerciceScenarioC(): ExerciceScenarioC {
  return construireScenarioCAvecFormes(tirerElement(FORMES_CV), tirerElement(FORMES_CA));
}
