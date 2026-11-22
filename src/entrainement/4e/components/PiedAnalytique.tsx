import type { ReactNode } from "react";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { BoutonAide } from "./BoutonAide";
import { MessageRetour, useTentativeLisible } from "./RetourSaisie";

interface Props<T> {
  /** Aides du MOTEUR (niveau tenu par la session : pénalité et surlignages de figure inchangés). */
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  aideIndisponible?: boolean;
  complet: boolean;
  /** Réponse lue dans les champs. */
  reponse: () => T;
  /** Faux : rien n'est transmis au moteur (aucune tentative), message par nature de champ. */
  lisible: (reponse: T) => boolean;
  onValider: (reponse: T) => void;
  texteIllisible: string | ((reponse: T) => string);
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message ciblé sur la dernière réponse réellement transmise (jamais la réponse attendue). */
  cible?: (soumise: T) => FragmentConsigne[] | null;
  libelleValider?: string;
  /** Choix fermé jugé faux et figé : son message, en tête du bloc de retour (jamais un bloc à part). */
  messageChoix?: ReactNode;
}

/**
 * Pied d'écran commun des anciens générateurs du 4e ch. 7 (gen42–gen54, audit lot B) : bouton
 * d'aide du moteur, « Valider » (une saisie illisible n'est jamais transmise au moteur — aucune
 * tentative consommée), message de retour (illisible par nature de champ, ou message ciblé puis
 * « Incorrect — tentative n/3 »). À rendre seulement tant que l'écran n'est pas validé.
 */
export function PiedAnalytique<T>(props: Props<T>) {
  const saisie = useTentativeLisible<T>();
  const derniere = saisie.soumise;
  const texteIllisible = typeof props.texteIllisible === "function" ? props.texteIllisible(props.reponse()) : props.texteIllisible;
  return (
    <>
      <BoutonAide niveauAide={props.niveauAide} niveauAideMax={props.niveauAideMax} onActiverAide={props.onActiverAide} disabledSupplementaire={props.aideIndisponible} />
      <button
        type="button"
        className="btn btn-primary"
        disabled={!props.complet}
        onClick={() => {
          const r = props.reponse();
          saisie.tenter(r, props.lisible(r), props.onValider);
        }}
      >
        {props.libelleValider ?? "Valider"}
      </button>
      <MessageRetour
        illisible={saisie.illisible}
        texteIllisible={texteIllisible}
        tentativesUtilisees={props.tentativesUtilisees}
        tentativesMax={props.tentativesMax}
        cible={derniere !== null && props.cible ? props.cible(derniere) : null}
        entete={props.messageChoix}
      />
    </>
  );
}
