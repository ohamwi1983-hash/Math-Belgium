import type { ReactNode } from "react";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { AidesNiveaux, MessageRetour, useTentativeLisible } from "./RetourSaisie";

type Saisie<T> = ReturnType<typeof useTentativeLisible<T>>;

interface Props<T> {
  /** Aides à deux niveaux (`ui/retoursVecteurs*.ts`). */
  aides: FragmentConsigne[][];
  figure?: (niveau: number) => ReactNode;
  /** Drapeau d'aide du moteur, levé à la première ouverture. */
  onPremiereAide?: () => void;
  complet: boolean;
  saisie: Saisie<T>;
  /** Réponse lue dans les champs, et si elle est lisible (sinon : message, aucune tentative). */
  reponse: () => T;
  lisible: () => boolean;
  onValider: (reponse: T) => void;
  texteIllisible: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  /** Message ciblé sur la dernière réponse réellement transmise. */
  cible: (soumise: T) => FragmentConsigne[] | null;
}

/**
 * Pied d'écran commun des anciens générateurs du 4e ch. 6 (gen20–gen29, audit lot B) : aides à
 * deux niveaux, « Valider » (une saisie illisible n'est jamais transmise au moteur), message de
 * retour (illisible par nature de champ, ou message ciblé puis « Incorrect — tentative n/3 »).
 * À rendre seulement tant que l'écran n'est pas validé.
 */
export function PiedVecteurs<T>({ aides, figure, onPremiereAide, complet, saisie, reponse, lisible, onValider, texteIllisible, tentativesUtilisees, tentativesMax, cible }: Props<T>) {
  return (
    <>
      <AidesNiveaux aides={aides} figure={figure} onPremiereAide={onPremiereAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => saisie.tenter(reponse(), lisible(), onValider)}>
        Valider
      </button>
      <MessageRetour
        illisible={saisie.illisible}
        texteIllisible={texteIllisible}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={saisie.soumise !== null ? cible(saisie.soumise) : null}
      />
    </>
  );
}
