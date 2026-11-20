import { Fragment } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { MessageRetour, useTentativeLisible } from "../../4e/components/RetourSaisie";
import { RenduFragments } from "../../4e/components/RenduFragments";

/**
 * Règles communes des générateurs du 6e ch. 2 « Fonctions exponentielles » (6gen6–6gen12, audit
 * 6e ch. 2, lot B), sur le modèle du 4e ch. 2 (`4e/components/RetourSaisie.tsx`, dont le hook et le
 * message sont réutilisés tels quels) et du 5e ch. 2 (`RetourSaisieTrig.tsx`) :
 * - une saisie ILLISIBLE n'est jamais transmise au moteur : aucune tentative consommée, message
 *   adapté à la nature du champ (`ChampExpo`) ;
 * - message ciblé sur l'erreur du cours trahie par la dernière réponse fausse (jamais la réponse),
 *   textes dans `ui6e/retoursExponentielles.ts` ;
 * - aides à deux niveaux : une phrase (formules courtes entre `$…$`) terminée par « : », puis la
 *   formule en KaTeX EN LIGNE (`\displaystyle`) — en display elle sortait du bloc à 390 px.
 */

export { MessageRetour, useTentativeLisible };

/** Nature du champ, pour le message d'illisible. */
export type ChampExpo = "expressionX" | "expressionU" | "expressionT" | "nombre" | "liste" | "equationT" | "equationX" | "inequation" | "ensemble";

const FIN = " Cette saisie ne compte pas comme une tentative.";

export const MESSAGES_ILLISIBLE_EXPO: Record<ChampExpo, string> = {
  expressionX: "Expression non reconnue : vérifie les parenthèses, les signes et la place de x (par exemple 3·ln(2)·2^(3x))." + FIN,
  expressionU: "Expression non reconnue : écris une expression de la nouvelle variable, en vérifiant les parenthèses et les signes." + FIN,
  expressionT: "Expression non reconnue : vérifie les parenthèses, les signes et la place de t." + FIN,
  nombre: "Nombre non reconnu : écris un nombre (virgule ou point), une fraction comme −3/4, ou une valeur exacte avec e, ln ou une racine, par exemple 2·ln(3)." + FIN,
  liste: "Une valeur n'est pas reconnue : écris chaque valeur dans sa case, par exemple −2, 3/4 ou 1,5." + FIN,
  equationT: "Équation non reconnue : écris un membre en t, le signe =, puis l'autre membre." + FIN,
  equationX: "Équation non reconnue : écris un membre en x, le signe =, puis l'autre membre." + FIN,
  inequation: "Inéquation non reconnue : écris un membre, le signe <, >, ≤ ou ≥, puis l'autre membre." + FIN,
  ensemble: "Borne non reconnue : écris chaque borne comme un nombre, par exemple −3/2 ou 2,5 (ou choisis l'infini)." + FIN,
};

/** Une aide d'écran : `texte` (formules courtes entre `$…$`) puis, facultativement, une formule. */
export interface AideExpo {
  texte: string;
  latex: string | null;
}

/** Découpe « texte $formule$ texte » en fragments (texte / KaTeX). */
export function fragmentsDepuisTexte(texte: string): FragmentConsigne[] {
  const morceaux = texte.split("$");
  const fragments: FragmentConsigne[] = [];
  morceaux.forEach((m, i) => {
    if (m === "") return;
    fragments.push(i % 2 === 1 ? { type: "latex", valeur: m } : { type: "texte", valeur: m });
  });
  return fragments;
}

function fragmentsAide(aide: AideExpo): FragmentConsigne[] {
  const f = fragmentsDepuisTexte(aide.texte);
  if (aide.latex) f.push({ type: "texte", valeur: " " }, { type: "latex", valeur: `\\displaystyle ${aide.latex}` });
  return f;
}

/** Bloc des aides déjà ouvertes (niveau 1 puis niveau 2), rendu par chaque écran. */
export function AidesExpo({ aide1, aide2, niveauAide }: { aide1: AideExpo; aide2: AideExpo; niveauAide: number }) {
  if (niveauAide < 1) return null;
  return (
    <div className="aide-5e">
      {[aide1, aide2].slice(0, niveauAide).map((aide, i) => (
        <Fragment key={i}>
          <p>
            <RenduFragments fragments={fragmentsAide(aide)} />
          </p>
        </Fragment>
      ))}
    </div>
  );
}

/** Props communes des écrans (toutes facultatives : rétrocompatibles). `T` : forme de la réponse
 * transmise au moteur (texte, liste, objet de plusieurs champs). */
export interface PropsRetourChamp<T = string> {
  /** Chaque champ texte est-il lisible ? Faux : rien n'est transmis au moteur (aucune tentative). */
  lire?: (texte: string) => boolean;
  /** Message d'illisible propre au champ. */
  messageIllisible?: string;
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (null : générique). */
  cible?: (reponse: T) => FragmentConsigne[] | null;
}

/** Tous les textes lisibles (un `lire` absent accepte tout). */
export function tousLisibles(lire: ((texte: string) => boolean) | undefined, textes: string[]): boolean {
  return !lire || textes.every((t) => lire(t));
}
