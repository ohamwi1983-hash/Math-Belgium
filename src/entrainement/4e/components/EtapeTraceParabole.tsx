import { useState } from "react";
import { Line, Point as MafsPoint, useTransformContext, vec } from "mafs";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { pointsATracer, type AcquisConstruction } from "../moteur/modeleConstructionParabole";
import { NIVEAU_AIDE_MAX_CONSTRUCTION } from "../moteur/sessionConstructionParabole";
import { formatMessageErreur } from "../ui/messageErreur";
import { ArcParabole, COULEURS_PLAN, PlanConstructionParabole } from "./PlanConstructionParabole";
import { RenduFragments } from "./RenduFragments";
import { BoutonAide } from "./BoutonAide";
import { ValidationEcran, type ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  exercice: ExerciceConstructionParabole;
  acquis: AcquisConstruction;
  consigne: FragmentConsigne[];
  aides: FragmentConsigne[][];
  niveauAide: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  messageErreur: FragmentConsigne[] | null;
  onValider: (ordre: number[]) => void;
  validation: ValidationEtapeProps | null;
  bilan: FragmentConsigne[];
}

const RAYON_TOUCHE_MAX = 22;
const RAYON_TOUCHE_MIN = 9;
const COULEUR_ATTENTE = "#868e96";

/** Zones tactiles invisibles autour des points (rayon adapté à l'écart avec le voisin le plus proche). */
function PointsCliquables({ points, onClic, actif }: { points: Point[]; onClic: (index: number) => void; actif: boolean }) {
  const { viewTransform, userTransform } = useTransformContext();
  const matrice = vec.matrixMult(viewTransform, userTransform);
  const ecran = points.map((p) => vec.transform([p.x, p.y], matrice));
  return (
    <>
      {points.map((p, index) => {
        const voisin = Math.min(Infinity, ...ecran.filter((_, j) => j !== index).map((q) => vec.dist(q, ecran[index]!)));
        const rayon = Math.max(RAYON_TOUCHE_MIN, Math.min(RAYON_TOUCHE_MAX, voisin / 2));
        return (
          <MafsPoint
            key={index}
            x={p.x}
            y={p.y}
            opacity={0.001}
            svgCircleProps={{ r: rayon, onClick: actif ? () => onClic(index) : undefined, style: { cursor: actif ? "pointer" : "default" } }}
          />
        );
      })}
    </>
  );
}

export function EtapeTraceParabole({ exercice, acquis, consigne, aides, niveauAide, onActiverAide, tentativesUtilisees, tentativesMax, messageErreur, onValider, validation, bilan }: Props) {
  const points = pointsATracer(exercice, acquis);
  const [ordre, setOrdre] = useState<number[]>([]);
  const [tentativesVues, setTentativesVues] = useState(tentativesUtilisees);
  if (tentativesVues !== tentativesUtilisees) {
    setTentativesVues(tentativesUtilisees);
    setOrdre([]);
  }
  const clos = validation !== null;
  const xs = points.map((p) => p.x);

  const surcouche = (
    <>
      {clos ? (
        <ArcParabole exercice={exercice} x1={Math.min(...xs) - 0.6} x2={Math.max(...xs) + 0.6} couleur={COULEURS_PLAN.compas} />
      ) : (
        ordre.slice(1).map((indice, k) => {
          const precedent = ordre[k]!;
          const a = points[precedent]!;
          const b = points[indice]!;
          return Math.abs(indice - precedent) === 1 ? (
            <ArcParabole key={k} exercice={exercice} x1={a.x} x2={b.x} couleur={COULEURS_PLAN.compas} />
          ) : (
            <Line.Segment key={k} point1={[a.x, a.y]} point2={[b.x, b.y]} color={COULEUR_ATTENTE} weight={2} style="dashed" />
          );
        })
      )}
      {points.map((p, i) => (
        <MafsPoint key={`v${i}`} x={p.x} y={p.y} color={clos || ordre.includes(i) ? COULEURS_PLAN.point : COULEUR_ATTENTE} svgCircleProps={{ r: 6 }} />
      ))}
      <PointsCliquables points={points} onClic={(i) => !ordre.includes(i) && setOrdre([...ordre, i])} actif={!clos} />
    </>
  );

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={consigne} />
      </p>
      <PlanConstructionParabole exercice={exercice} acquis={acquis} surcouche={surcouche} masquerPoints />
      <p className="mafs-graph-pas">
        {ordre.length} / {points.length} points reliés
      </p>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aides.slice(0, niveauAide).map((aide, i) => (
            <p key={i}>
              <RenduFragments fragments={aide} />
            </p>
          ))}
        </div>
      )}

      {!clos && (
        <>
          <button type="button" className="btn btn-aide" disabled={ordre.length === 0} onClick={() => setOrdre([])}>
            Recommencer
          </button>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CONSTRUCTION} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={ordre.length !== points.length} onClick={() => onValider(ordre)}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              <span>
                {messageErreur && (
                  <>
                    <RenduFragments fragments={messageErreur} />{" "}
                  </>
                )}
                {formatMessageErreur(tentativesUtilisees, tentativesMax)}
              </span>
            </p>
          )}
        </>
      )}
      {clos && (
        <>
          <p className="construction-bilan">
            <RenduFragments fragments={bilan} />
          </p>
          <ValidationEcran {...validation} />
        </>
      )}
    </div>
  );
}
