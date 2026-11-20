import { useState } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { evaluerExpressionCyclometrique, evaluerValeurCyclometrique } from "../moteur6e/expressionCyclometrique";
import { AidesExpo, MessageRetour, fragmentsDepuisTexte, useTentativeLisible } from "./RetourSaisieExpo";
import type { AideExpo } from "./RetourSaisieExpo";

/**
 * Règles communes des générateurs 6gen1–6gen5 (6e ch. 1 « Fonctions réciproques &
 * cyclométriques », audit du chapitre, lot B), sur le modèle du 6e ch. 2 (`RetourSaisieExpo.tsx`,
 * dont le hook, le message et les aides sont réutilisés tels quels) :
 * - une saisie ILLISIBLE n'est jamais transmise au moteur : aucune tentative consommée, message
 *   adapté à la nature du champ (`ChampCyclo`) ;
 * - une valeur approchée quand la valeur exacte est demandée : signalée, sans tentative ;
 * - message ciblé sur l'erreur du cours trahie par la dernière réponse fausse (jamais la réponse) ;
 * - aides à deux niveaux : une phrase (formules courtes entre `$…$`) terminée par « : », puis la
 *   formule en KaTeX en ligne.
 */

export { AidesExpo as AidesCyclo, MessageRetour, fragmentsDepuisTexte, useTentativeLisible };
export type { AideExpo as AideCyclo };

const FIN = " Cette saisie ne compte pas comme une tentative.";

/** Nature du champ, pour le message d'illisible. */
export type ChampCyclo = "valeurExacte" | "valeur" | "expressionX" | "equation" | "liste" | "borne" | "extremum";

export const MESSAGES_ILLISIBLE_CYCLO: Record<ChampCyclo, string> = {
  valeurExacte: "Écriture non reconnue : écris un nombre exact, par exemple π/3, −π/4, 2π/3, √3/2 ou −1/2." + FIN,
  valeur: "Nombre non reconnu : écris un nombre, une fraction comme −5/3, une racine comme √2 ou un multiple de π comme 3π/4." + FIN,
  expressionX: "Expression non reconnue : vérifie les parenthèses, les signes et la place de x, par exemple 2/√(1 − 4x²) ou (x − 1)/3." + FIN,
  equation: "Équation non reconnue : écris un membre en x, le signe =, puis l'autre membre, par exemple 4x² + 2x = 1." + FIN,
  liste: "Une valeur n'est pas reconnue : écris un nombre par case, par exemple −2, 3/5 ou (1 + √5)/2." + FIN,
  borne: "Borne non reconnue : écris chaque borne comme un nombre, par exemple −3/2, √2 ou π/2 (ou choisis l'infini)." + FIN,
  extremum: "Valeur non reconnue : écris chaque valeur comme un nombre, par exemple −3, π/2, 2 + π ou √3/2." + FIN,
};

export const MESSAGE_APPROCHEE_CYCLO =
  "C'est une valeur approchée : on demande la valeur exacte, avec une fraction, π ou une racine (par exemple 2π/3, √3/2 ou −5/3)." + FIN;

export const MESSAGE_RECOPIE_ARC =
  "Il reste une fonction trigonométrique ou cyclométrique dans ta réponse : calcule-la et écris le nombre obtenu (par exemple π/6 ou √2/2)." + FIN;

/** Valeur numérique lisible (π, √, fraction, « − ») ? */
export function lisibleValeurCyclo(texte: string): boolean {
  return evaluerValeurCyclometrique(texte) !== null;
}

/** Expression de x lisible (syntaxe seulement : « 1/√(1 − x²) » est lisible même hors domaine). */
export function lisibleExpressionCyclo(texte: string): boolean {
  if (texte.trim() === "") return false;
  try {
    evaluerExpressionCyclometrique(texte, 0.37);
    return true;
  } catch {
    return false;
  }
}

/** Équation « membre = membre », chaque membre lisible. */
export function lisibleEquationCyclo(texte: string): boolean {
  const parties = texte.split("=");
  return parties.length === 2 && parties.every((p) => lisibleExpressionCyclo(p));
}

/** La saisie est-elle un nombre décimal ÉCRIT (« 1,047 », « −0,5 ») — pas une fraction, ni π, ni √ ? */
export function estDecimalEcrit(texte: string): boolean {
  return /^[-−–—+]?\s*\d+\s*[.,]\s*\d+$/.test(texte.trim());
}

/** Écriture décimale proche (1 %) d'une valeur exacte qu'elle n'égale pas : « valeur approchée ». */
export function estApprocheeDe(texte: string, exact: number): boolean {
  if (!estDecimalEcrit(texte)) return false;
  const v = evaluerValeurCyclometrique(texte);
  if (v === null) return false;
  const ecart = Math.abs(v - exact);
  return ecart > 1e-9 * Math.max(1, Math.abs(exact)) && ecart <= 0.01 * Math.max(1, Math.abs(exact));
}

/** Une fonction trigonométrique ou cyclométrique reste-t-elle dans une valeur saisie ? */
export function contientFonctionTrig(texte: string): boolean {
  return /(arc|a)?(sin|cos|tan)/i.test(texte);
}

/**
 * Comme `useTentativeLisible`, avec un MESSAGE de blocage (illisible, valeur approchée, fonction
 * recopiée…) : `tenter(valeur, blocage, valider)` ne transmet rien au moteur quand `blocage` n'est
 * pas `null` (aucune tentative consommée) et l'affiche à la place.
 */
export function useRetourCyclo<T>() {
  const [blocage, setBlocage] = useState<string | null>(null);
  const [soumise, setSoumise] = useState<T | null>(null);
  return {
    blocage,
    soumise,
    tenter(valeur: T, messageBlocage: string | null, valider: (v: T) => void) {
      if (messageBlocage !== null) {
        setBlocage(messageBlocage);
        return;
      }
      setBlocage(null);
      setSoumise(valeur);
      valider(valeur);
    },
  };
}

/** Message sous « Valider » : blocage (sans tentative), ou message ciblé + « Incorrect — tentative n/m ». */
export function MessageRetourCyclo({
  blocage,
  tentativesUtilisees,
  tentativesMax,
  cible,
}: {
  blocage: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  cible?: FragmentConsigne[] | null;
}) {
  return <MessageRetour illisible={blocage !== null} texteIllisible={blocage ?? undefined} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={cible} />;
}

/** Fragments d'un message ciblé écrit « texte $formule$ texte ». */
export function cibleDepuisTexte(texte: string): FragmentConsigne[] {
  return fragmentsDepuisTexte(texte);
}
