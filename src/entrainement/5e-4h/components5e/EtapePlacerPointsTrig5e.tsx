import { useRef, useState } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { BlocAides } from "../../4e/components/EtapesDetectiveErreurs";
import { RenduFragments } from "../../4e/components/RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { DiagnosticSaisie } from "../moteur5e/saisieTrig";
import type { PointPlace } from "../moteur5e/modeleSinusoidePoints";
import { pointDepuisClic, type Geometrie, type PointFigure } from "../ui5e/figureSinusoidePoints";

/**
 * Écran « placer des points » de 5gen52 : l'élève touche une intersection du quadrillage pour placer
 * un point (aimanté au nœud le plus proche), la touche à nouveau pour l'enlever ; « Valider » quand le
 * nombre demandé est atteint. 3 tentatives ; après une tentative fausse, les points faux sont marqués
 * en rouge (message ciblé). Une proposition « juste mais pas celle demandée » n'est pas comptée.
 * Le dessin vient de `figureSinusoidePoints` (même source que le papier) ; aucun point affiché.
 */

interface Props {
  consigne: FragmentConsigne[];
  nombre: number;
  geometrie: Geometrie;
  /** Points fixes (déjà connus, non cliquables). */
  fixes: PointPlace[];
  dessiner: (points: PointFigure[]) => string;
  aides: FragmentConsigne[][];
  niveauAide: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  diagnostiquer: (points: PointPlace[]) => DiagnosticSaisie;
  onValider: (correct: boolean, points: PointPlace[]) => void;
  validation: ValidationEtapeProps | null;
}

export function EtapePlacerPointsTrig5e(p: Props) {
  const [points, setPoints] = useState<PointPlace[]>([]);
  const [retour, setRetour] = useState<DiagnosticSaisie | null>(null);
  const [fauxIdx, setFauxIdx] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const fige = !!p.validation;

  function toucher(ev: React.MouseEvent<HTMLDivElement>) {
    if (fige) return;
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const vx = ((ev.clientX - r.left) * p.geometrie.W) / r.width;
    const vy = ((ev.clientY - r.top) * p.geometrie.H) / r.height;
    const pt = pointDepuisClic(p.geometrie, vx, vy);
    if (p.fixes.some((f) => f.i === pt.i && f.y === pt.y)) return;
    setFauxIdx([]);
    setRetour(null);
    setPoints((l) => {
      const k = l.findIndex((q) => q.i === pt.i && q.y === pt.y);
      if (k >= 0) return l.filter((_, j) => j !== k);
      if (l.length >= p.nombre) return l;
      return [...l, pt];
    });
  }

  function valider() {
    if (points.length !== p.nombre || fige) return;
    const d = p.diagnostiquer(points);
    setRetour(d);
    if (d.statut === "faux") setFauxIdx(d.champsFaux ?? []);
    if (d.statut === "correct" || d.statut === "faux") p.onValider(d.statut === "correct", points);
  }

  const figure = p.dessiner([
    ...p.fixes.map((f) => ({ ...f, style: "base" as const })),
    ...points.map((q, k) => ({ ...q, style: fauxIdx.includes(k) ? ("faux" as const) : ("eleve" as const) })),
  ]);

  return (
    <div>
      <p className="prompt-text">
        <RenduFragments fragments={p.consigne} />
      </p>
      <div
        ref={ref}
        role="application"
        aria-label="Repère quadrillé : touche une intersection pour placer ou enlever un point"
        onClick={toucher}
        style={{ width: "100%", maxWidth: 520, margin: "10px auto", cursor: fige ? "default" : "crosshair", touchAction: "manipulation" }}
        dangerouslySetInnerHTML={{ __html: figure.replace(/width="\d+" height="\d+"/, 'style="width:100%;height:auto;display:block"') }}
      />
      {!fige && (
        <p className="field-hint" style={{ fontSize: "0.9em", color: "var(--color-text-muted)", marginTop: 0 }}>
          {`Touche une intersection du quadrillage pour placer un point, touche-le à nouveau pour l'enlever. Points placés : ${points.length} / ${p.nombre}.`}{" "}
          {points.length > 0 && (
            <button type="button" className="btn" style={{ minHeight: 36, marginLeft: 6 }} onClick={() => (setPoints([]), setFauxIdx([]), setRetour(null))}>
              Tout effacer
            </button>
          )}
        </p>
      )}
      {!p.validation && (
        <>
          <BlocAides aides={p.aides} niveauAide={p.niveauAide} onActiverAide={p.onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={points.length !== p.nombre} onClick={valider}>
            Valider
          </button>
          {retour?.statut === "nonCompte" && (
            <p className="alert-error" role="alert">
              <span>
                <RenduFragments fragments={retour.message} /> Cette proposition ne compte pas comme une tentative.
              </span>
            </p>
          )}
          {retour?.statut === "faux" && p.tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              <span>
                {retour.message && retour.message.length > 0 && (
                  <>
                    <RenduFragments fragments={retour.message} />{" "}
                  </>
                )}
                {`Incorrect — tentative ${p.tentativesUtilisees}/${p.tentativesMax} : les points en rouge sont à revoir.`}
              </span>
            </p>
          )}
        </>
      )}
      {p.validation && <ValidationEcran {...p.validation} />}
    </div>
  );
}
