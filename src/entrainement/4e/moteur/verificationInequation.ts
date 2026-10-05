import type { Borne, ExerciceInequation, Morceau, ReponseRacines, SigneA, Symbole, SolutionEnsemble } from "../core/inequation.types";
import { diagnostiquerFormeFactorisee } from "./expressionAlgebrique";
import { enonceOppose, enonceSimplifie } from "./simplificationInequation";
import type { StatutVerification } from "./statutVerification";

function borneEgale(a: Borne, b: Borne): boolean {
  return a === b;
}

function morceauEgal(a: Morceau, b: Morceau): boolean {
  return (
    a.crochetGauche === b.crochetGauche &&
    a.crochetDroit === b.crochetDroit &&
    borneEgale(a.borneGauche, b.borneGauche) &&
    borneEgale(a.borneDroite, b.borneDroite)
  );
}

/**
 * Compare la structure saisie par l'élève à la solution calculée (section 4) : même forme
 * générale, bornes numériques en égalité exacte (racines rationnelles pour cette V1), inclusion/
 * exclusion des bornes strictement respectée. Pour "union de deux intervalles", les deux ordres
 * de morceaux sont acceptés.
 */
export function verifierSolutionInequation(saisie: SolutionEnsemble, attendu: SolutionEnsemble): boolean {
  if (saisie.forme !== attendu.forme) return false;

  switch (saisie.forme) {
    case "vide":
    case "reel":
      return true;
    case "point":
    case "reel_sauf_point":
      return saisie.valeur === (attendu as typeof saisie).valeur;
    case "intervalle":
      return morceauEgal(saisie.morceau, (attendu as typeof saisie).morceau);
    case "union": {
      const { morceau1, morceau2 } = attendu as typeof saisie;
      const memeOrdre = morceauEgal(saisie.morceau1, morceau1) && morceauEgal(saisie.morceau2, morceau2);
      const ordreInverse = morceauEgal(saisie.morceau1, morceau2) && morceauEgal(saisie.morceau2, morceau1);
      return memeOrdre || ordreInverse;
    }
  }
}

/**
 * Étape "racines" : "aucune" correct ssi Δ<0 réel ; "deux" correct ssi l'exercice a de vraies
 * racines et {x1,x2} égale exercice.racines en paire non ordonnée (égalité exacte, racines
 * rationnelles). Couvre nativement la racine double : l'élève saisit alors deux fois la même
 * valeur, ce qui égale [r,r].
 */
export function verifierRacines(saisie: ReponseRacines, exercice: ExerciceInequation): boolean {
  if (saisie.type === "aucune") return exercice.delta < 0;
  if (exercice.racines === undefined) return false;

  const [a1, a2] = [...exercice.racines].sort((x, y) => x - y);
  const [b1, b2] = [saisie.x1, saisie.x2].sort((x, y) => x - y);
  return a1 === b1 && a2 === b2;
}

/** Étape "signe de a" : compare au signe réel du coefficient a de l'exercice généré. */
export function verifierSigneA(saisie: SigneA, exercice: ExerciceInequation): boolean {
  const signeReel: SigneA = exercice.enonce.a > 0 ? "+" : "-";
  return saisie === signeReel;
}

/**
 * Symbole opposé (retourné en divisant l'inéquation par un nombre négatif) — voir
 * diagnostiquerSimplification : diviser par le pgcd NÉGATIF plutôt que positif (ex. -4 plutôt que
 * 4 pour -4x²+8x+96) est une manière tout aussi valide de "simplifier au maximum, coefficients
 * entiers, sans facteur commun", mais qui exige de retourner le sens de la comparaison (bug
 * utilisateur du 26/09 : la saisie "x²-2x-24" ou "x²-2x-24<=0", pourtant mathématiquement
 * correcte pour -4x²+8x+96≥0, était rejetée car seule la forme à `a` inchangé était acceptée).
 */
const SYMBOLE_OPPOSE: Record<Symbole, Symbole> = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" };

/**
 * Suffixes textuels acceptés pour chaque symbole, à la toute fin de la saisie (avant le "0" final)
 * — réplique locale de verificationInequationRationnelle.ts::SUFFIXES_PAR_SYMBOLE (Couche B ↔
 * Couche B, contrat `Symbole` partagé, duplication volontaire — voir CLAUDE.md).
 */
const SUFFIXES_PAR_SYMBOLE: Record<Symbole, RegExp[]> = {
  "<": [/<\s*0\s*$/],
  ">": [/>\s*0\s*$/],
  "≤": [/≤\s*0\s*$/, /<=\s*0\s*$/],
  "≥": [/≥\s*0\s*$/, />=\s*0\s*$/],
};

/** Retire le suffixe "◇ 0" du symbole donné et retourne le préfixe, ou null si absent/autre symbole. */
function retirerSuffixeSymboleZero(texte: string, symbole: Symbole): string | null {
  for (const regex of SUFFIXES_PAR_SYMBOLE[symbole]) {
    if (regex.test(texte)) return texte.replace(regex, "");
  }
  return null;
}

/** true si `texte` se termine par un des 4 suffixes de symbole connus, quel qu'il soit. */
function contientUnSuffixeSymbole(texte: string): boolean {
  return Object.values(SUFFIXES_PAR_SYMBOLE).some((suffixes) => suffixes.some((regex) => regex.test(texte)));
}

/**
 * Étape "simplification" (précède désormais racines quand pgcd(|a|,|b|,|c|)>1 — voir
 * simplificationInequation.ts) : deux formes également valides de "coefficients entiers, sans
 * facteur commun" — diviser par le pgcd POSITIF (symbole inchangé, `a` garde son signe d'origine,
 * le trinôme seul suffit alors — jamais besoin de retaper le symbole) ou par son opposé NÉGATIF
 * (`a` change de signe, ce qui inverse le sens de la comparaison : le symbole retourné devient
 * alors obligatoire dans la saisie, pour distinguer cette forme de l'autre). Un symbole ni celui
 * d'origine ni son opposé (élève qui se trompe de sens) est une algèbre par ailleurs lisible, donc
 * jamais "parse_error" — voir verificationInequationRationnelle.ts pour le même principe.
 */
export function diagnostiquerSimplification(exercice: ExerciceInequation, valeurSaisie: string): StatutVerification {
  const texte = valeurSaisie.trim();

  const prefixeOppose = retirerSuffixeSymboleZero(texte, SYMBOLE_OPPOSE[exercice.symbole]);
  if (prefixeOppose !== null) {
    return diagnostiquerFormeFactorisee(prefixeOppose, enonceOppose(enonceSimplifie(exercice.enonce)));
  }

  const prefixeMeme = retirerSuffixeSymboleZero(texte, exercice.symbole);
  if (prefixeMeme !== null) {
    return diagnostiquerFormeFactorisee(prefixeMeme, enonceSimplifie(exercice.enonce));
  }

  if (contientUnSuffixeSymbole(texte)) return "not_equivalent";

  return diagnostiquerFormeFactorisee(texte, enonceSimplifie(exercice.enonce));
}

export function verifierSimplification(exercice: ExerciceInequation, valeurSaisie: string): boolean {
  return diagnostiquerSimplification(exercice, valeurSaisie) === "correct";
}
