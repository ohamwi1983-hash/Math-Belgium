import { divise, donnees, estDecimalCourt, fois, frac, moins, partieFixe, pgcd, plus, UN, valeur } from "../core5e/sommeInfinieSituation.types";
import type { ExerciceSommeInfinie, Frac } from "../core5e/sommeInfinieSituation.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { sansEspacesMilliers } from "./saisieNombreSuites";
import type { PhaseSommeInfinie } from "./typesSommeInfinieSituation";

/**
 * Couche B (5e) — vérification de `5gen48` « Somme infinie en situation ». Toutes les valeurs
 * attendues viennent de `core5e/sommeInfinieSituation.types.ts` (source unique).
 *
 * Saisie lue par l'évaluateur du chantier (`evaluerExpressionGenerale`, virgule décimale, fraction
 * « 3/11 », calcul « 0,03/0,9 »), espace des milliers retirée (`sansEspacesMilliers`, comme 5gen45) ;
 * « 60 % » est lu 60/100. Toutes les réponses sont EXACTES : comparaison à 10⁻⁹ près (relatif), donc
 * 0,27 ne passe pas pour 3/11 (la tolérance 0,01 de 5gen45 l'aurait accepté).
 *
 * Refus SANS consommer de tentative (`refusFormat`, même décision que 5gen46) :
 * - valeur approchée (à 0,5 % près) d'une valeur qui n'a pas d'écriture décimale courte ;
 * - réponse finale d'un nombre périodique : bonne valeur, mais pas une fraction irréductible a/b.
 */

/** Valeur attendue de l'écran. */
export function valeurAttendue(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie): Frac {
  const d = donnees(e);
  switch (phase) {
    case "premierTerme":
      return d.u1;
    case "raison":
      return d.q;
    case "sommeInfinie":
      return d.sInfini;
    case "reponse":
      return d.reponse;
  }
}

/** Lecture d'une saisie (nombre, fraction, petit calcul, pourcentage) ; `null` si illisible. */
export function lire(texte: string): number | null {
  const t = sansEspacesMilliers(texte).replace(/%/g, "/100").trim();
  if (t === "" || /[a-zA-Z]/.test(t)) return null;
  try {
    const v = evaluerExpressionGenerale(t, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function egal(v: number, cible: number | Frac): boolean {
  const c = typeof cible === "number" ? cible : valeur(cible);
  return Math.abs(v - c) <= 1e-9 * Math.max(1, Math.abs(c));
}

export function diagnostiquerChamp(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie, texte: string): StatutVerification {
  const v = lire(texte);
  if (v === null) return "parse_error";
  return egal(v, valeurAttendue(e, phase)) ? "correct" : "not_equivalent";
}

export function diagnostiquerChamps(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie, valeurs: string[]): StatutVerification[] {
  return [diagnostiquerChamp(e, phase, valeurs[0] ?? "")];
}

export function verifierEcran(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie, valeurs: string[]): boolean {
  return diagnostiquerChamp(e, phase, valeurs[0] ?? "") === "correct";
}

export function messageIllisible(): string {
  return "Écriture non reconnue — écris un nombre (virgule décimale) ou une fraction comme 3/11 ; aucune tentative n'a été comptée.";
}

/** Fraction « a/b » écrite telle quelle (signe éventuel), ou entier ; `null` sinon. */
function fractionEcrite(texte: string): Frac | null {
  const t = sansEspacesMilliers(texte).replace(/\s+/g, "");
  const m = t.match(/^(-?)(\d+)(?:\/(\d+))?$/);
  if (!m) return null;
  const num = Number(m[2]) * (m[1] ? -1 : 1);
  const den = m[3] === undefined ? 1 : Number(m[3]);
  if (den === 0) return null;
  return { num, den };
}

/** Écriture refusée sans consommer de tentative ; `null` si la saisie peut être jugée. */
export function refusFormat(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie, valeurs: string[]): string | null {
  const texte = valeurs[0] ?? "";
  const v = lire(texte);
  if (v === null) return null;
  const cible = valeurAttendue(e, phase);
  if (!egal(v, cible) && !estDecimalCourt(cible) && !texte.includes("/") && Math.abs(v - valeur(cible)) <= Math.max(0.005 * Math.abs(valeur(cible)), 6e-5)) {
    return "C'est une valeur approchée : on demande la valeur EXACTE, écris-la sous forme de fraction ; aucune tentative n'a été comptée.";
  }
  if (phase === "reponse" && e.variante === "periodique" && egal(v, cible)) {
    const f = fractionEcrite(texte);
    if (f === null) return "Ta réponse a la bonne valeur, mais elle doit s'écrire comme UNE fraction a/b (un seul numérateur, un seul dénominateur) ; aucune tentative n'a été comptée.";
    if (f.den !== 1 && pgcd(f.num, f.den) !== 1) {
      return "Ta fraction est égale au nombre, mais elle n'est pas irréductible : simplifie-la (divise le numérateur et le dénominateur par un diviseur commun) ; aucune tentative n'a été comptée.";
    }
  }
  return null;
}

// ============================================================================
// Pièges reconnus (jamais la valeur attendue).
// ============================================================================

function piegePremierTerme(e: ExerciceSommeInfinie, v: number): string | null {
  const d = donnees(e);
  switch (e.variante) {
    case "periodique": {
      if (egal(v, partieFixe(e)) && valeur(partieFixe(e)) !== 0) return "Ce nombre est la partie qui ne se répète pas : la suite commence au PREMIER BLOC qui se répète.";
      if (egal(v, Number(e.periode))) return "Le bloc qui se répète est placé après la virgule : écris-le à sa place, avec des zéros devant si besoin.";
      if (egal(v, fois(d.u1, frac(10))) || egal(v, divise(d.u1, frac(10)))) return "Le bloc n'est pas à la bonne place : compte les décimales, le premier bloc qui se répète commence juste après la partie qui ne se répète pas.";
      if (egal(v, d.q)) return "Ce nombre est le facteur qui fait passer d'un bloc au suivant (la raison), pas le premier bloc.";
      return null;
    }
    case "rebonds":
      if (egal(v, e.hauteur)) return "C'est la hauteur de la chute de départ : u₁ est la hauteur atteinte APRÈS le premier rebond.";
      if (egal(v, e.pourcent)) return "Un pourcentage n'est pas une hauteur : calcule le pourcentage de la hauteur de chute.";
      if (egal(v, e.hauteur - valeur(d.u1))) return "Tu as calculé la hauteur PERDUE au rebond ; la remontée, elle, vaut ce pourcentage de la hauteur de chute.";
      return null;
    case "zenon":
      if (egal(v, e.avance)) return "C'est la distance parcourue par le poursuivant pendant la 1re étape ; uₙ est la distance parcourue par le poursuivi.";
      if (egal(v, e.avance * e.k)) return "Le poursuivi va moins vite : pendant la même étape, il parcourt une distance plus PETITE que le poursuivant.";
      return null;
    case "figures":
      if (egal(v, e.aire)) return "C'est l'aire de la figure de départ : u₁ est l'aire de la première partie coloriée seulement.";
      if (e.sousCas === "hexagones" && egal(v, (3 * e.aire) / 4)) return "C'est l'aire du 2e hexagone : la couronne est ce qui reste du 1er hexagone quand on en retire le 2e.";
      if (e.sousCas === "triangle" && egal(v, e.aire / 2)) return "En joignant les milieux, le triangle est partagé en QUATRE triangles identiques.";
      return null;
  }
}

function piegeRaison(e: ExerciceSommeInfinie, v: number): string | null {
  const d = donnees(e);
  if (egal(v, divise(UN, d.q))) return "Tu as divisé à l'envers : q est un terme divisé par le terme PRÉCÉDENT ; ici les termes diminuent, donc q < 1.";
  if (egal(v, moins(UN, d.q))) return "Ce nombre est la part qui DISPARAÎT d'un terme au suivant ; q est la part qui reste.";
  switch (e.variante) {
    case "periodique":
      if (e.periode.length > 1 && egal(v, frac(1, 10))) return `Le bloc compte ${e.periode.length} chiffres : d'un terme au suivant, il se décale de ${e.periode.length} rangs vers la droite.`;
      return null;
    case "rebonds":
      if (egal(v, e.pourcent)) return "Une raison n'est pas un pourcentage écrit tel quel : remonter à un pourcentage d'une hauteur, c'est la multiplier par ce pourcentage divisé par 100.";
      if (egal(v, 1 + e.pourcent / 100)) return "Après un rebond, la hauteur atteinte est plus PETITE que la hauteur de chute : on multiplie par un nombre plus petit que 1.";
      return null;
    case "zenon":
      if (egal(v, e.k)) return "Le poursuivi va moins vite : chaque étape est plus COURTE que la précédente, donc q < 1.";
      return null;
    case "figures":
      if (e.sousCas === "hexagones" && egal(v, frac(3, 4))) return "Multiplier par trois quarts fait passer d'un hexagone au suivant ; entre deux couronnes coloriées, on saute un hexagone : il y a deux réductions.";
      if (e.sousCas === "triangle" && egal(v, frac(1, 2))) return "Le côté est divisé par 2, mais l'aire diminue plus vite : regarde le partage en quatre triangles identiques.";
      return null;
  }
}

function piegeSomme(e: ExerciceSommeInfinie, v: number): string | null {
  const d = donnees(e);
  if (egal(v, divise(d.u1, plus(UN, d.q)))) return "Le dénominateur de la formule est 1 − q, pas 1 + q.";
  if (egal(v, divise(UN, moins(UN, d.q)))) return "Au numérateur de la formule, il y a le premier terme u₁.";
  if (egal(v, divise(d.u2, moins(UN, d.q)))) return "Tu as commencé la somme à u₂ : le premier terme de la somme est u₁.";
  if (egal(v, divise(d.u1, d.q))) return "La formule est u₁ divisé par (1 − q), pas par q.";
  if (e.variante === "rebonds" && egal(v, divise(frac(e.hauteur), moins(UN, d.q)))) return "Tu as pris la hauteur de départ comme premier terme : la somme des remontées commence à u₁.";
  if (e.variante === "figures" && egal(v, divise(frac(e.aire), moins(UN, d.q)))) return "Tu as pris l'aire de la figure de départ comme premier terme : la somme des parties coloriées commence à u₁.";
  return null;
}

function piegeReponse(e: ExerciceSommeInfinie, v: number): string | null {
  const d = donnees(e);
  switch (e.variante) {
    case "periodique":
      if (valeur(partieFixe(e)) !== 0 && egal(v, d.sInfini)) return "N'oublie pas la partie qui ne se répète pas : le nombre vaut cette partie PLUS la somme infinie.";
      return null;
    case "rebonds":
      if (egal(v, plus(frac(e.hauteur), d.sInfini))) return "Chaque remontée est suivie d'une descente de même longueur : les remontées comptent deux fois.";
      if (egal(v, fois(frac(2), plus(frac(e.hauteur), d.sInfini)))) return "La première chute n'est parcourue qu'une fois : elle n'est précédée d'aucune montée.";
      if (egal(v, fois(frac(2), d.sInfini))) return "N'oublie pas la première chute, depuis la hauteur de départ.";
      if (egal(v, d.sInfini)) return "S∞ ne compte que les remontées : ajoute les descentes et la première chute.";
      return null;
    case "zenon":
      if (egal(v, d.sInfini)) return "S∞ est la distance parcourue par le poursuivi ; le poursuivant a dû parcourir en plus l'avance de départ.";
      if (egal(v, moins(frac(e.avance), d.sInfini))) return "Les deux distances s'ajoutent : le poursuivant parcourt l'avance PUIS tout le chemin fait par le poursuivi.";
      return null;
    case "figures":
      if (egal(v, d.sInfini)) return "S∞ est l'aire COLORIÉE ; on demande l'aire qui reste non coloriée.";
      if (egal(v, e.aire - valeur(d.u1))) return "Tu n'as retiré que la première partie coloriée : il faut retirer toutes les parties coloriées, donc S∞.";
      return null;
  }
}

/** Message ciblé sur une erreur classique, `null` si rien de reconnaissable (ou réponse juste). */
export function messagePiege(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie, valeurs: string[]): string | null {
  const v = lire(valeurs[0] ?? "");
  if (v === null || egal(v, valeurAttendue(e, phase))) return null;
  switch (phase) {
    case "premierTerme":
      return piegePremierTerme(e, v);
    case "raison":
      return piegeRaison(e, v);
    case "sommeInfinie":
      return piegeSomme(e, v);
    case "reponse":
      return piegeReponse(e, v);
  }
}
