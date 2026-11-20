import { useState } from "react";
import type { ReactNode } from "react";
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

/** Champs d'angle et de longueur (audit 4e ch. 5, G2 : jamais « la place de x » dans un champ
 * numérique). */
export const MESSAGE_ANGLE_ILLISIBLE =
  "Nombre non reconnu : écris un angle en degrés, par exemple 135 ou 47,5 (le symbole ° est facultatif). Cette saisie ne compte pas comme une tentative.";

export const MESSAGE_LONGUEUR_ILLISIBLE =
  "Nombre non reconnu : écris un nombre, par exemple 12,4 (virgule ou point). Cette saisie ne compte pas comme une tentative.";

export const MESSAGE_VALEUR_ILLISIBLE =
  "Nombre non reconnu : écris un nombre décimal, par exemple −0,342 (virgule ou point). Cette saisie ne compte pas comme une tentative.";

export const MESSAGE_VALEUR_EXACTE_ILLISIBLE =
  "Écriture non reconnue : écris un nombre, une fraction comme 3/5 ou une racine comme √3/2 (ou rac(3)/2). Cette saisie ne compte pas comme une tentative.";

export const MESSAGE_VALEUR_APPROCHEE =
  "C'est une valeur approchée : on demande la valeur exacte, avec une fraction ou une racine (par exemple √3/2 ou −4/5). Cette saisie ne compte pas comme une tentative.";

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
  /** Figure d'aide (optionnelle) affichée à partir d'un niveau donné — ex. le cercle trigonométrique
   * des générateurs 14–17 (audit 4e ch. 5) : `figure(niveau)` rend `null` tant qu'elle n'est pas
   * due. */
  figure?: (niveau: number) => ReactNode;
  /** Appelé à la PREMIÈRE aide (drapeau d'aide du moteur, inchangé) ; le niveau 2 est local. */
  onPremiereAide?: () => void;
  /** Optionnel : niveau atteint (ex. colorer les en-têtes d'un tableau avec la figure). */
  onNiveau?: (niveau: number) => void;
}

/** Aides progressives (2 niveaux) : niveau 1 = la propriété du cours, niveau 2 = comment
 * l'appliquer ici. Jamais la réponse. */
export function AidesNiveaux({ aides, figure, onPremiereAide, onNiveau }: PropsAides) {
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
      {figure?.(niveau)}
      <BoutonAide
        niveauAide={niveau}
        niveauAideMax={aides.length}
        onActiverAide={() => {
          if (niveau === 0) onPremiereAide?.();
          const suivant = Math.min(aides.length, niveau + 1);
          setNiveau(suivant);
          onNiveau?.(suivant);
        }}
      />
    </div>
  );
}
