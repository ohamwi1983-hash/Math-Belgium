import { useState } from "react";
import type { ExerciceCercleTrigonometrique, ReponseValeursAxe } from "../core/cercleTrigonometrique.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import type { EtatCelluleValeurAxe, EtatCelluleValeurAxeTan } from "../ui/cycleSigneCercleTrigonometrique";
import { cyclerValeurAxe, cyclerValeurAxeTan, libelleValeurAxe } from "../ui/cycleSigneCercleTrigonometrique";
import { AideSignesCercleTrig } from "./AideSignesCercleTrig";
import { ValidationEcran } from "../../components/ValidationEcran";
import { AidesNiveaux } from "./RetourSaisie";
import { aidesValeursAxe } from "../ui/aidesCercleTrigo";
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

  const complet = sin !== "?" && cos !== "?" && tan !== "?";
  // Choix fermé à UNE tentative (audit 4e ch. 5, G3) : jamais de correction case par case.
  const classeCellule = () => "btn toggle-signe";
  void tentativesUtilisees;
  void tentativesMax;
  void aideActivee;

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
                <button type="button" className={classeCellule()} onClick={() => setSin(cyclerValeurAxe)}>
                  {libelleValeurAxe(sin)}
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCellule()} onClick={() => setCos(cyclerValeurAxe)}>
                  {libelleValeurAxe(cos)}
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCellule()} onClick={() => setTan(cyclerValeurAxeTan)}>
                  {libelleValeurAxe(tan)}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!validation && (
        <>
          <AidesNiveaux
            aides={aidesValeursAxe()}
            figure={(n) => (n >= 2 ? <AideSignesCercleTrig exercice={exercice} aideActivee sansBouton onActiverAide={() => {}} /> : null)}
            onPremiereAide={onActiverAide}
          />
          <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider({ sin, cos, tan })}>
            Valider
          </button>
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
