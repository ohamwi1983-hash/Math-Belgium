import { useState } from "react";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { RenduFragments } from "./RenduFragments";
import { BoutonAide } from "./BoutonAide";

/**
 * Règles communes des générateurs refondus (audit 4e ch. 2, lot B), partagées par les écrans de
 * saisie du chapitre :
 * - une saisie ILLISIBLE (`parse_error`) ne coûte jamais de tentative : elle n'est pas transmise
 *   au moteur, un message le dit (modèle : `sessionTransformationsEnsembles`, gen72) ;
 * - message ciblé sur l'erreur du cours quand la réponse fausse en trahit une (−b oublié, carré de
 *   b négatif, signe de a lu entre les racines, borne de CE incluse…), jamais la réponse ;
 * - aides à deux niveaux, formule en KaTeX (`FragmentConsigne[]`).
 */

export const MESSAGE_BORNE_ILLISIBLE =
  "Valeur non reconnue : écris chaque nombre (ou choisis l'infini) avant de valider. Cette saisie ne compte pas comme une tentative.";

export const MESSAGE_ILLISIBLE =
  "Expression non reconnue : vérifie les parenthèses, les signes et la place de x. Cette saisie ne compte pas comme une tentative.";

/** État « saisie illisible » + dernière réponse réellement transmise (pour le message ciblé). */
export function useTentativeLisible<T>() {
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<T | null>(null);
  return {
    illisible,
    soumise,
    /** `lisible` faux : rien n'est transmis au moteur (aucune tentative consommée). */
    tenter(valeur: T, lisible: boolean, valider: (v: T) => void) {
      if (!lisible) {
        setIllisible(true);
        return;
      }
      setIllisible(false);
      setSoumise(valeur);
      valider(valeur);
    },
  };
}

interface PropsMessage {
  illisible: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (null : message générique). */
  cible?: FragmentConsigne[] | null;
  /** Texte de la saisie illisible (défaut : expression ; `MESSAGE_BORNE_ILLISIBLE` pour un nombre). */
  texteIllisible?: string;
}

export function MessageRetour({ illisible, tentativesUtilisees, tentativesMax, cible, texteIllisible = MESSAGE_ILLISIBLE }: PropsMessage) {
  if (illisible) {
    return (
      <p className="alert-error" role="alert">
        {texteIllisible}
      </p>
    );
  }
  if (tentativesUtilisees === 0) return null;
  return (
    <p className="alert-error" role="alert">
      {/* Un seul enfant texte : `.alert-error` est un conteneur flex, chaque fragment y devenait
       * une colonne (« Relis le signe de | Δ | : … »). */}
      <span>
        {cible && cible.length > 0 && (
          <>
            <RenduFragments fragments={cible} />{" "}
          </>
        )}
        Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
      </span>
    </p>
  );
}

interface PropsAides {
  aides: FragmentConsigne[][];
  /** Appelé à la PREMIÈRE aide (drapeau d'aide du moteur, inchangé) ; le niveau 2 est local. */
  onPremiereAide?: () => void;
}

/** Aides progressives (2 niveaux) : niveau 1 = la propriété du cours, niveau 2 = comment
 * l'appliquer ici. Jamais la réponse. */
export function AidesNiveaux({ aides, onPremiereAide }: PropsAides) {
  const [niveau, setNiveau] = useState(0);
  if (aides.length === 0) return null;
  return (
    <div>
      {aides.slice(0, niveau).map((aide, i) => (
        <div key={i} className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={aide} />
          </p>
        </div>
      ))}
      <BoutonAide
        niveauAide={niveau}
        niveauAideMax={aides.length}
        onActiverAide={() => {
          if (niveau === 0) onPremiereAide?.();
          setNiveau((n) => Math.min(aides.length, n + 1));
        }}
      />
    </div>
  );
}
