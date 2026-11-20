/**
 * Couche A — tirage équilibré du verdict « le sommet est-il dans le domaine ? » de gen55 (décision de
 * l'utilisateur, audit 4e ch. 1, V2 / G9 : « sommet hors du domaine » ≈ 40 % PAR FAMILLE ; avant :
 * 0 % pour les 4 familles de modélisation, 24 à 26 % pour les familles « fonction donnée »).
 *
 * - Modélisation (`ajouterContrainteSupplementaire`) : une contrainte en plus, comme le massif de
 *   fleurs de l'exemple « cas 2 » du cours (x ≥ k ; x ≤ k pour un ajout plafonné), écrite en mots
 *   (« On ne retient que les cas où la largeur de la voile vaut au moins 44 dm. »). Elle
 *   apparaît dans 55 % des tirages, et resserre le domaine du côté du sommet dans 40 % des tirages
 *   (k au-delà du sommet), sinon sans l'écarter (k en deçà) : la présence d'une contrainte ne dit
 *   donc pas le verdict.
 * - Fonction donnée (`decalerHorsDuSommetSiTire`) : un domaine qui contenait le sommet est décalé d'un
 *   côté (même largeur), de sorte que ≈ 40 % des tirages l'excluent.
 *
 * Les tirages supplémentaires sont faits APRÈS ceux de la famille : une instance dont le domaine
 * n'est pas modifié reste identique (même `?code=`).
 */
import type { DomaineOptimisation, ExerciceOptimisation, ExerciceOptimisationModelisation, PointOptimisation } from "../../core/optimisation.types";
import { evaluerQuadratique, optimumSurDomaine, sommetDansIntervalle } from "./optimum";
import { nombreInterpretation } from "./interpretation";
import { randomInt } from "./aleatoire";

export const PART_CONTRAINTE = 0.55;
export const PART_HORS_DOMAINE = 0.4;

/** Valeur « propre » : au plus deux décimales (affichage et saisie exacts). */
function propre(v: number): boolean {
  return Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;
}

/** Options de conclusion recalculées pour le nouvel optimum : mêmes phrases, nombres remplacés. */
function optionsAvecOptimum(e: ExerciceOptimisation, ancien: PointOptimisation, nouveau: PointOptimisation): ExerciceOptimisation["optionsInterpretation"] | null {
  const ax = nombreInterpretation(ancien.x);
  const ay = nombreInterpretation(ancien.y);
  if (ax === ay) return null;
  const echapper = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const motif = new RegExp(`(?<![\\d,\\u202f])(${echapper(ax)}|${echapper(ay)})(?![\\d,\\u202f])`, "g");
  return e.optionsInterpretation.map((o) => ({ ...o, texte: o.texte.replace(motif, (m) => (m === ax ? nombreInterpretation(nouveau.x) : nombreInterpretation(nouveau.y))) }));
}

function avecDomaine<T extends ExerciceOptimisation>(e: T, domaine: DomaineOptimisation, phraseEnonce: string): T | null {
  const dans = sommetDansIntervalle(e.sommet.x, domaine);
  const optimal = optimumSurDomaine(e.fonction, domaine, e.sommet, dans);
  if (!propre(optimal.y)) return null;
  const options = optionsAvecOptimum(e, e.optimal, optimal);
  if (!options) return null;
  return { ...e, domaine, sommetDansDomaine: dans, optimal, optionsInterpretation: options, contexte: { ...e.contexte, phraseEnonce } };
}

function entiersEntre(min: number, max: number): number[] {
  const liste: number[] = [];
  for (let k = Math.ceil(min); k <= Math.floor(max); k++) liste.push(k);
  return liste;
}

export function ajouterContrainteSupplementaire(e: ExerciceOptimisationModelisation): ExerciceOptimisationModelisation {
  const u = Math.random();
  if (u >= PART_CONTRAINTE) return e;
  const hors = u < PART_HORS_DOMAINE;
  const plafond = e.famille === "revenuPrix";
  const { inf, sup } = e.domaine;
  const xS = e.sommet.x;
  // x ≥ k (x_S < k ≤ milieu de [x_S ; sup] : sommet exclu, domaine pas réduit à presque rien ;
  // inf < k ≤ x_S : sommet gardé) ; x ≤ k pour un plafond (k ≥ 1 : on ajoute au plus k unités).
  const candidatsBruts = plafond
    ? hors
      ? entiersEntre(Math.max(inf + 1, 1), xS - 1)
      : entiersEntre(xS, sup - 1)
    : hors
      ? entiersEntre(xS + 1, Math.max(xS + 1, Math.floor((xS + sup) / 2)))
      : entiersEntre(inf + 1, xS);
  const candidats = candidatsBruts.filter((k) => k < sup && k > inf && propre(evaluerQuadratique(e.fonction, k)));
  if (candidats.length === 0) return e;
  const k = candidats[randomInt(0, candidats.length - 1)]!;
  // En mots : x n'est pas défini dans l'énoncé (c'est la réponse de l'écran « identification »).
  const { nomVariable, uniteVariable } = e.contexte;
  const phrase = `${e.contexte.phraseEnonce} On ne retient que les cas où ${nomVariable} vaut au ${plafond ? "plus" : "moins"} ${k}${nomVariable.startsWith("le nombre") ? "" : ` ${uniteVariable}`}.`;
  const domaine = plafond ? { inf, sup: k } : { inf: k, sup };
  const resultat = avecDomaine(e, domaine, phrase);
  return resultat ? { ...resultat, domaineSansContrainte: { inf, sup } } : e;
}

/** Domaine de même largeur, décalé pour exclure le sommet (à gauche si possible, sinon à droite). */
export function domaineHorsDuSommet(xS: number, domaine: DomaineOptimisation, xMin: number): DomaineOptimisation {
  const largeur = domaine.sup - domaine.inf;
  if (xS - 1 - largeur >= xMin + 1) return { inf: xS - 1 - largeur, sup: xS - 1 };
  return { inf: xS + 1, sup: xS + 1 + largeur };
}

/** Part des domaines qui contenaient le sommet à décaler pour atteindre ≈ 40 % hors du domaine
 * (le tirage d'origine en exclut déjà 25 %) : 0,25 + 0,75 · p = 0,4. */
export const PART_DECALAGE = 0.2;

/** Fonction donnée : décale (tirage fait en DERNIER) un domaine qui contenait le sommet. */
export function decalerHorsDuSommetSiTire<T extends ExerciceOptimisation>(e: T, phrasePour: (d: DomaineOptimisation) => string, xMin = 0): T {
  if (!e.sommetDansDomaine || Math.random() >= PART_DECALAGE) return e;
  const domaine = domaineHorsDuSommet(e.sommet.x, e.domaine, xMin);
  return avecDomaine(e, domaine, phrasePour(domaine)) ?? e;
}
