import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { MessageRetour } from "../../4e/components/RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import { AidesTrig } from "./RetourSaisieTrig";
import { BoutonAide } from "./BoutonAide";

/**
 * Pied d'écran commun des générateurs du 5e ch. 1 (audit 5e ch. 1, lot B) : aides à deux niveaux
 * (KaTeX, `AidesTrig`), bouton « Aide », « Valider » (jamais grisé sans explication), puis le
 * message : saisie illisible (aucune tentative), message sans tentative (forme à reprendre…), ou
 * message ciblé suivi de « Incorrect — tentative n/3 ». Une fois l'écran clos : `ValidationEcran`.
 */
interface Props {
  aides: AideTrig[];
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: () => void;
  /** Rien à valider (champ vide) : bouton grisé ; une saisie illisible, elle, reste validable (message). */
  vide?: boolean;
  illisible: boolean;
  texteIllisible: string;
  /** Message affiché SANS consommer de tentative (ex. réponse juste mais pas simplifiée). */
  messageSansTentative?: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  cible?: FragmentConsigne[] | null;
  validation?: ValidationEtapeProps | null;
  /** Contenu entre les aides et les boutons (ex. surlignage d'un tableau). */
  apresAides?: ReactNode;
}

export function PiedEcranFonctions({ aides, niveauAide, niveauAideMax, onActiverAide, onValider, vide = false, illisible, texteIllisible, messageSansTentative, tentativesUtilisees, tentativesMax, cible, validation, apresAides }: Props) {
  return (
    <>
      <AidesTrig niveauAide={niveauAide} aides={aides} />
      {apresAides}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={vide} onClick={onValider}>
            Valider
          </button>
          {messageSansTentative ? (
            <p className="alert-error" role="alert">
              {messageSansTentative}
            </p>
          ) : (
            <MessageRetour illisible={illisible} texteIllisible={texteIllisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={cible} />
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </>
  );
}
