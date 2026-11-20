import { Fragment } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { MessageRetour, useTentativeLisible } from "../../4e/components/RetourSaisie";
import { RenduFragments } from "../../4e/components/RenduFragments";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";

/**
 * Règles communes des générateurs du 5e ch. 2 (audit 5e ch. 2, lot B), sur le modèle du 4e ch. 2
 * (`4e/components/RetourSaisie.tsx`, dont le hook et le message sont réutilisés tels quels) :
 * - une saisie ILLISIBLE (`parse_error`) n'est jamais transmise au moteur : aucune tentative
 *   consommée, message adapté au champ (angle, longueur, expression, équation…) ;
 * - message ciblé sur l'erreur du cours trahie par la dernière réponse fausse, jamais la réponse ;
 * - aides à deux niveaux (propriété du cours, puis application à l'instance) : une phrase terminée
 *   par « : », puis la formule en KaTeX — textes dans `ui5e/aidesTrigonometrie.ts`.
 */

export { useTentativeLisible };

/** Genre du champ, pour le message d'illisible. */
export type ChampTrig = "angleRad" | "angleDeg" | "longueur" | "aire" | "nombre" | "expression" | "equation" | "solutions" | "intervalles";

const FIN = " Cette saisie ne compte pas comme une tentative.";

export const MESSAGES_ILLISIBLE_TRIG: Record<ChampTrig, string> = {
  angleRad: "Nombre non reconnu : écris un angle en radians, par exemple 5π/6 ou 2,62." + FIN,
  angleDeg: "Nombre non reconnu : écris un nombre de degrés, par exemple 135 ou 37,5." + FIN,
  longueur: "Nombre non reconnu : écris une longueur, par exemple 5π/3 ou 5,24." + FIN,
  aire: "Nombre non reconnu : écris une aire, par exemple 25π/6 ou 13,09." + FIN,
  nombre: "Nombre non reconnu : écris un nombre, par exemple −3/2, 5π/6 ou 2,5." + FIN,
  expression: "Expression non reconnue : vérifie les parenthèses, les signes et la place de x." + FIN,
  equation: "Équation non reconnue : écris un membre, le signe =, puis l'autre membre." + FIN,
  solutions: "Solutions non reconnues : écris chaque valeur (par exemple π/6 ou 0,52), séparées par « ; »." + FIN,
  intervalles: "Bornes non reconnues : écris chaque borne comme un nombre, par exemple 2,5 ou 8/3." + FIN,
};

interface PropsRetour {
  illisible: boolean;
  champ: ChampTrig;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (null : message générique). */
  cible?: FragmentConsigne[] | null;
}

/** Message sous le bouton « Valider » : illisible (sans tentative), ou ciblé puis « Incorrect —
 * tentative n/3 ». */
export function RetourSaisieTrig({ illisible, champ, tentativesUtilisees, tentativesMax, cible }: PropsRetour) {
  return <MessageRetour illisible={illisible} texteIllisible={MESSAGES_ILLISIBLE_TRIG[champ]} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={cible} />;
}

/** Une saisie est lisible si le diagnostic n'est pas `parse_error` (sans diagnostic : lisible). */
export function estLisible(statut: StatutVerification | null | undefined): boolean {
  return statut !== "parse_error";
}

/** Aides progressives (le niveau est tenu par le moteur, plafonné à 2) — rend les niveaux déjà
 * ouverts. Jamais la réponse. */
export function AidesTrig({ niveauAide, aides }: { niveauAide: number; aides: AideTrig[] }) {
  if (niveauAide < 1 || aides.length === 0) return null;
  return (
    <div className="aide-5e">
      {aides.slice(0, niveauAide).map((aide, i) => (
        <Fragment key={i}>
          <p>
            <RenduFragments fragments={aide.texte} />
          </p>
          {(aide.formules ?? []).map((f, j) => (
            <Katex key={j} expression={f} block />
          ))}
        </Fragment>
      ))}
    </div>
  );
}
