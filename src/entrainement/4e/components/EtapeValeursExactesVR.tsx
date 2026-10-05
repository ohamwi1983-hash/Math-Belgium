import { useState } from "react";
import type { CelluleSinCos, CelluleTan, ExerciceValeursRemarquables, ReponseValeursExactes } from "../core/valeursRemarquables.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import { formatEnonceCercleTrigLatex } from "../ui/formatValeursRemarquables";
import {
  celluleSinCosErronee,
  celluleTanErronee,
  cyclerValeurSinCos,
  cyclerValeurTan,
  formatCelluleSinCosLatex,
  formatCelluleTanLatex,
} from "../ui/cycleValeurTrigonometrique";
import { AideSignesCercleTrig } from "./AideSignesCercleTrig";

/** Mêmes couleurs que l'aide "Signes" du générateur 14 (`App.css`,
 * `.cercle-trig-projection-*`/`.cercle-trig-point-*`) — coloration des en-têtes du tableau une fois
 * l'aide activée, jamais de la phrase de consigne (même règle que le générateur 14, lot 2). */
const COULEUR_COS = "#2f9e44";
const COULEUR_SIN = "#1971c2";
const COULEUR_TAN = "#f783ac";

interface Props {
  exercice: ExerciceValeursRemarquables;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseValeursExactes) => void;
}

/**
 * Dernière étape : tableau à cellules cycliques (sur le modèle de l'écran "Signes" du générateur
 * 14, `EtapeSignesCercleTrig.tsx`), 3 colonnes sin(θ)/cos(θ)/tan(θ), rendu en notation
 * mathématique (racines avec `√`, jamais `sqrt`) — `promptcreationgenerateur15.md`. Chaque cellule
 * cycle en boucle jusqu'à `"?"` ; "Valider" reste verrouillé tant qu'au moins une cellule y est
 * encore. Aide réutilisée telle quelle depuis le générateur 14 (`AideSignesCercleTrig`, construction
 * géométrique de tan(θ) déjà corrigée) — dès activation, les en-têtes du tableau se colorent
 * (bleu/vert/rose), jamais la phrase de consigne.
 */
export function EtapeValeursExactesVR({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [sin, setSin] = useState<CelluleSinCos>("?");
  const [cos, setCos] = useState<CelluleSinCos>("?");
  const [tan, setTan] = useState<CelluleTan>("?");

  const montrerErreurs = tentativesUtilisees > 0;
  const complet = sin !== "?" && cos !== "?" && tan !== "?";

  function classeCelluleSinCos(saisie: CelluleSinCos, attendu: number): string {
    return montrerErreurs && celluleSinCosErronee(saisie, attendu) ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }

  function classeCelluleTan(saisie: CelluleTan, attendu: number | null): string {
    return montrerErreurs && celluleTanErronee(saisie, attendu) ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatEnonceCercleTrigLatex(exercice.angleDepart)} block />
      </div>
      <p className="prompt-text">Donne la valeur exacte de sin(θ), cos(θ) et tan(θ).</p>

      <div className="grille-signes-scroll">
        <table className="grille-signes">
          <thead>
            <tr>
              <th className="grille-signes-zone">
                <Katex expression={aideActivee ? `\\textcolor{${COULEUR_SIN}}{\\sin(\\theta)}` : "\\sin(\\theta)"} />
              </th>
              <th className="grille-signes-zone">
                <Katex expression={aideActivee ? `\\textcolor{${COULEUR_COS}}{\\cos(\\theta)}` : "\\cos(\\theta)"} />
              </th>
              <th className="grille-signes-zone">
                <Katex expression={aideActivee ? `\\textcolor{${COULEUR_TAN}}{\\tan(\\theta)}` : "\\tan(\\theta)"} />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="grille-signes-zone">
                <button type="button" className={classeCelluleSinCos(sin, exercice.sinValeur)} onClick={() => setSin(cyclerValeurSinCos)}>
                  <Katex expression={formatCelluleSinCosLatex(sin)} />
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCelluleSinCos(cos, exercice.cosValeur)} onClick={() => setCos(cyclerValeurSinCos)}>
                  <Katex expression={formatCelluleSinCosLatex(cos)} />
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCelluleTan(tan, exercice.tanValeur)} onClick={() => setTan(cyclerValeurTan)}>
                  <Katex expression={formatCelluleTanLatex(tan)} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AideSignesCercleTrig exercice={exercice} aideActivee={aideActivee} onActiverAide={onActiverAide} />

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => complet && onValider({ sin, cos, tan })}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
