import { useState } from "react";
import type { ExerciceConstructionDroite } from "../core/constructionDroite.types";
import type { Point } from "../core/vecteur.types";
import { NIVEAU_AIDE_MAX_TRACE } from "../moteur/sessionConstructionDroite";
import { pointCorrespondAUneCible } from "../moteur/verificationConstructionDroite";
import { AIDE_TRACE_NIVEAU_1, CONSIGNE_TRACE, consigneGeneraleTrace, formatEnonceLatex, texteAideTraceNiveau1 } from "../ui/formatConstructionDroite";
import { PiedAnalytique } from "./PiedAnalytique";
import { ConstructionDroiteGraph } from "./ConstructionDroiteGraph";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteInsistance } from "../../components/TexteInsistance";

interface Props {
  exercice: ExerciceConstructionDroite;
  cible1: Point;
  cible2: Point;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: { p1: Point; p2: Point }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

const MARQUEUR1_INITIAL: [number, number] = [0, 0];
const MARQUEUR2_INITIAL: [number, number] = [1, 0];
const MARQUEURS_INITIAUX: Point[] = [MARQUEUR1_INITIAL, MARQUEUR2_INITIAL].map(([x, y]) => ({ x, y }));

/**
 * Écran 2 — placement, par glissement CRANTÉ, des 2 points confirmés (ou révélés) à l'écran 1.
 * `cible1`/`cible2` ne sont JAMAIS affichés numériquement sur le graphe (`ConstructionDroiteGraph`
 * ne rend que les 2 marqueurs déplaçables) — ils apparaissent en revanche dans le récapitulatif
 * "Ce qu'on sait déjà" (`RecapitulatifPanel`, câblé par `AppConstructionDroite.tsx`) en toutes
 * lettres, puisqu'ils viennent d'être validés par l'élève lui-même à l'écran précédent (ou
 * révélés après épuisement), jamais une donnée cachée.
 */
export function EtapeTraceConstructionDroite({ exercice, cible1, cible2, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [marqueur1, setMarqueur1] = useState<[number, number]>(MARQUEUR1_INITIAL);
  const [marqueur2, setMarqueur2] = useState<[number, number]>(MARQUEUR2_INITIAL);

  const p1: Point = { x: marqueur1[0], y: marqueur1[1] };
  const p2: Point = { x: marqueur2[0], y: marqueur2[1] };

  const apresEchec = tentativesUtilisees > 0;
  const marqueur1Errone = apresEchec && !pointCorrespondAUneCible(p1, cible1, cible2);
  const marqueur2Errone = apresEchec && !pointCorrespondAUneCible(p2, cible1, cible2);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGeneraleTrace(exercice)}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_TRACE}</p>

      <ConstructionDroiteGraph
        cible1={cible1}
        cible2={cible2}
        marqueursInitiaux={MARQUEURS_INITIAUX}
        marqueur1={p1}
        marqueur2={p2}
        onDeplacerMarqueur1={(point) => setMarqueur1([point.x, point.y])}
        onDeplacerMarqueur2={(point) => setMarqueur2([point.x, point.y])}
        marqueur1Errone={marqueur1Errone}
        marqueur2Errone={marqueur2Errone}
      />

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{AIDE_TRACE_NIVEAU_1}</p>
          {niveauAide >= 2 && <p><TexteInsistance texte={texteAideTraceNiveau1(cible1)} /></p>}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_TRACE}
          onActiverAide={onActiverAide}
          complet
          reponse={() => ({ p1, p2 })}
          lisible={() => !(p1.x === MARQUEUR1_INITIAL[0] && p1.y === MARQUEUR1_INITIAL[1] && p2.x === MARQUEUR2_INITIAL[0] && p2.y === MARQUEUR2_INITIAL[1]) || (pointCorrespondAUneCible(p1, cible1, cible2) && pointCorrespondAUneCible(p2, cible1, cible2))}
          onValider={onValider}
          texteIllisible="Les deux marqueurs sont encore à leur place de départ : fais-les glisser jusqu'aux deux points avant de valider. Cette validation ne compte pas comme une tentative."
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
