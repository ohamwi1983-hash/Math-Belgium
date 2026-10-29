import { useState } from "react";
import type { ExerciceCercleTrigonometrique, ReponseValeursAxe } from "../core/cercleTrigonometrique.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import type { EtatCelluleValeurAxe, EtatCelluleValeurAxeTan } from "../ui/cycleSigneCercleTrigonometrique";
import { cyclerValeurAxe, cyclerValeurAxeTan, libelleValeurAxe } from "../ui/cycleSigneCercleTrigonometrique";
import { valeursAxeAttendues } from "../moteur/verificationCercleTrigonometrique";
import { AideSignesCercleTrig } from "./AideSignesCercleTrig";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceCercleTrigonometrique;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseValeursAxe) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Dernière étape d'un angle SUR UN AXE (décision E1) : 0°, 90°, 180° et 270° n'appartiennent à
 * aucun quadrant — le cours demande directement leur valeur exacte, pas leur signe. Même tableau à
 * cellules cycliques que l'écran « Signes » (`EtapeSignesCercleTrig`), avec les valeurs 1, −1, 0
 * (et « n'existe pas » pour tan). L'aide réutilise la construction des projections du cercle
 * (`AideSignesCercleTrig`), précédée d'un rappel de méthode.
 */
export function EtapeValeursAxeCercleTrig({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
  validation,
}: Props) {
  const [sin, setSin] = useState<EtatCelluleValeurAxe>("?");
  const [cos, setCos] = useState<EtatCelluleValeurAxe>("?");
  const [tan, setTan] = useState<EtatCelluleValeurAxeTan>("?");

  const attendu = valeursAxeAttendues(exercice);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = sin !== "?" && cos !== "?" && tan !== "?";

  function classeCellule(saisie: EtatCelluleValeurAxe | EtatCelluleValeurAxeTan, valeurAttendue: string): string {
    return montrerErreurs && saisie !== "?" && saisie !== valeurAttendue ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">
        Cet angle est sur un axe : il n'appartient à aucun quadrant. Donne directement la valeur exacte de sin(θ), cos(θ) et tan(θ).
      </p>

      <div className="grille-signes-scroll">
        <table className="grille-signes">
          <thead>
            <tr>
              <th className="grille-signes-zone">
                <Katex expression="\sin(\theta)" />
              </th>
              <th className="grille-signes-zone">
                <Katex expression="\cos(\theta)" />
              </th>
              <th className="grille-signes-zone">
                <Katex expression="\tan(\theta)" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="grille-signes-zone">
                <button type="button" className={classeCellule(sin, attendu.sin)} onClick={() => setSin(cyclerValeurAxe)}>
                  {libelleValeurAxe(sin)}
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCellule(cos, attendu.cos)} onClick={() => setCos(cyclerValeurAxe)}>
                  {libelleValeurAxe(cos)}
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCellule(tan, attendu.tan)} onClick={() => setTan(cyclerValeurAxeTan)}>
                  {libelleValeurAxe(tan)}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {aideActivee && (
        <div className="triangle-quelconque-aide">
          <p>
            Sur le cercle trigonométrique, cos(θ) est l'abscisse du point M(θ) et sin(θ) son ordonnée. Sur un axe, M(θ) est
            l'un des points (1 ; 0), (0 ; 1), (−1 ; 0) ou (0 ; −1). Enfin tan(θ) = sin(θ) / cos(θ) : elle n'existe pas quand
            cos(θ) = 0.
          </p>
        </div>
      )}
      <AideSignesCercleTrig exercice={exercice} aideActivee={aideActivee} onActiverAide={onActiverAide} />

      {!validation && (
        <>
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider({ sin, cos, tan })}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
