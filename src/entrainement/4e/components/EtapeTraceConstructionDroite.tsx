import { useState } from "react";
import type { ExerciceConstructionDroite } from "../core/constructionDroite.types";
import type { Point } from "../core/vecteur.types";
import { NIVEAU_AIDE_MAX_TRACE } from "../moteur/sessionConstructionDroite";
import { pointCorrespondAUneCible } from "../moteur/verificationConstructionDroite";
import {
  CONSIGNE_TRACE,
  consigneGeneraleTrace,
  formatEnonceLatex,
  formatEtatActuelPointsLatex,
  libelleBoutonAide,
  texteAideTraceNiveau1,
} from "../ui/formatConstructionDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConstructionDroiteGraph } from "./ConstructionDroiteGraph";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceConstructionDroite;
  cible1: Point;
  cible2: Point;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: { p1: Point; p2: Point }) => void;
}

const MARQUEUR1_INITIAL: [number, number] = [0, 0];
const MARQUEUR2_INITIAL: [number, number] = [1, 0];

/**
 * Écran 2 — placement, par glissement CRANTÉ, des 2 points confirmés (ou révélés) à l'écran 1.
 * `cible1`/`cible2` ne sont JAMAIS affichés numériquement sur le graphe (`ConstructionDroiteGraph`
 * ne rend que les 2 marqueurs déplaçables) — ils apparaissent en revanche dans le bloc "État
 * actuel" en toutes lettres, puisqu'ils viennent d'être validés par l'élève lui-même à l'écran
 * précédent (ou révélés après épuisement), jamais une donnée cachée.
 */
export function EtapeTraceConstructionDroite({ exercice, cible1, cible2, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [marqueur1, setMarqueur1] = useState<[number, number]>(MARQUEUR1_INITIAL);
  const [marqueur2, setMarqueur2] = useState<[number, number]>(MARQUEUR2_INITIAL);

  const p1: Point = { x: marqueur1[0], y: marqueur1[1] };
  const p2: Point = { x: marqueur2[0], y: marqueur2[1] };

  const apresEchec = tentativesUtilisees > 0;
  const marqueur1Errone = apresEchec && !pointCorrespondAUneCible(p1, cible1, cible2);
  const marqueur2Errone = apresEchec && !pointCorrespondAUneCible(p2, cible1, cible2);

  return (
    <div>
      <p className="prompt-text">{consigneGeneraleTrace(exercice)}</p>
      <div className="equation-box">
        <Katex expression={formatEnonceLatex(exercice)} />
      </div>
      <EtatActuelPanel latex={formatEtatActuelPointsLatex(cible1, cible2)} label="Points trouvés" />
      <p className="prompt-text">{CONSIGNE_TRACE}</p>

      <ConstructionDroiteGraph
        cible1={cible1}
        cible2={cible2}
        marqueur1={p1}
        marqueur2={p2}
        onDeplacerMarqueur1={(point) => setMarqueur1([point.x, point.y])}
        onDeplacerMarqueur2={(point) => setMarqueur2([point.x, point.y])}
        marqueur1Errone={marqueur1Errone}
        marqueur2Errone={marqueur2Errone}
      />

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideTraceNiveau1(cible1)}</p>
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_TRACE} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_TRACE)}
      </button>

      <button type="button" className="btn btn-primary" onClick={() => onValider({ p1, p2 })}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
    </div>
  );
}
