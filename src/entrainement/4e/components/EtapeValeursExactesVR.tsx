import { useState } from "react";
import type { CelluleSinCos, CelluleTan, ExerciceValeursRemarquables, ReponseValeursExactes } from "../core/valeursRemarquables.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import {
  cyclerValeurSinCos,
  cyclerValeurTan,
  formatCelluleSinCosLatex,
  formatCelluleTanLatex,
} from "../ui/cycleValeurTrigonometrique";
import { AideSignesCercleTrig } from "./AideSignesCercleTrig";
import { ValidationEcran } from "../../components/ValidationEcran";
import { AidesNiveaux } from "./RetourSaisie";
import { aidesValeursExactes } from "../ui/aidesCercleTrigo";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
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
  validation,
}: Props) {
  const [sin, setSin] = useState<CelluleSinCos>("?");
  const [cos, setCos] = useState<CelluleSinCos>("?");
  const [tan, setTan] = useState<CelluleTan>("?");

  const [niveauAide, setNiveauAide] = useState(0);
  const coloration = niveauAide >= 2;
  const complet = sin !== "?" && cos !== "?" && tan !== "?";
  // Choix fermé à UNE tentative (audit 4e ch. 5, G3) : jamais de correction case par case.
  const classeCelluleSinCos = () => "btn toggle-signe";
  const classeCelluleTan = () => "btn toggle-signe";
  void tentativesUtilisees;
  void tentativesMax;
  void aideActivee;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <p className="prompt-text">Donne la valeur exacte de sin(θ), cos(θ) et tan(θ).</p>

      <div className="grille-signes-scroll">
        <table className="grille-signes">
          <thead>
            <tr>
              <th className="grille-signes-zone">
                <Katex expression={coloration ? `\\textcolor{${COULEUR_SIN}}{\\sin(\\theta)}` : "\\sin(\\theta)"} />
              </th>
              <th className="grille-signes-zone">
                <Katex expression={coloration ? `\\textcolor{${COULEUR_COS}}{\\cos(\\theta)}` : "\\cos(\\theta)"} />
              </th>
              <th className="grille-signes-zone">
                <Katex expression={coloration ? `\\textcolor{${COULEUR_TAN}}{\\tan(\\theta)}` : "\\tan(\\theta)"} />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="grille-signes-zone">
                <button type="button" className={classeCelluleSinCos()} onClick={() => setSin(cyclerValeurSinCos)}>
                  <Katex expression={`\\displaystyle ${formatCelluleSinCosLatex(sin)}`} />
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCelluleSinCos()} onClick={() => setCos(cyclerValeurSinCos)}>
                  <Katex expression={`\\displaystyle ${formatCelluleSinCosLatex(cos)}`} />
                </button>
              </td>
              <td className="grille-signes-zone">
                <button type="button" className={classeCelluleTan()} onClick={() => setTan(cyclerValeurTan)}>
                  <Katex expression={`\\displaystyle ${formatCelluleTanLatex(tan)}`} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!validation && (
        <>
          <AidesNiveaux
            aides={aidesValeursExactes(exercice)}
            figure={(n) => (n >= 2 ? <AideSignesCercleTrig exercice={exercice} aideActivee sansBouton onActiverAide={() => {}} /> : null)}
            onPremiereAide={onActiverAide}
            onNiveau={setNiveauAide}
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
