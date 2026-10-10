import { useState } from "react";
import type { ExerciceLieuxGeometriques } from "../core/lieuxGeometriques.types";
import { diagnostiquerResolution } from "../moteur/verificationLieuxGeometriques";
import type { ReponseResolutionLieuxGeometriques } from "../moteur/verificationLieuxGeometriques";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { PLACEHOLDER_COORDONNEE } from "../ui/formatEquationDroite";
import { CONSIGNE_GENERALE_RESOLUTION, LIBELLE_AUCUN, LIBELLE_AU_MOINS_UN, formatEtatActuelSystemeLatex, formatQuadratiqueSubstitutionLatex, segmentsAideResolutionNiveau1, segmentsEnonce } from "../ui/formatLieuxGeometriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { BoutonAide } from "./BoutonAide";

type Choix = "aucun" | "auMoinsUn";

/** Un lieu géométrique de ce générateur a au plus 2 points d'intersection. */
const MAX_POINTS = 2;

interface Props {
  exercice: ExerciceLieuxGeometriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseResolutionLieuxGeometriques) => void;
}

/** Écran 3 — Résolution. Choix catégoriel "Aucun"/"Au moins un" puis, si "Au moins un", les points
 * d'intersection en saisie add-as-needed (couvre 1 ou 2 points sans distinction préalable imposée
 * par l'interface) — même patron "Pas de.../Au moins un(e)..." que `EtapeRacinesFlexibles.tsx`,
 * adapté à des PAIRES x/y plutôt qu'une liste de valeurs isolées. */
export function EtapeResolutionLieuxGeometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [points, setPoints] = useState<{ x: string; y: string }[]>([{ x: "", y: "" }]);
  const apresEchec = tentativesUtilisees > 0;

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setPoints([{ x: "", y: "" }]);
  }

  function ajouterPoint() {
    if (points.length >= MAX_POINTS) return;
    setPoints([...points, { x: "", y: "" }]);
  }

  function retirerPoint(index: number) {
    if (points.length <= 1) return;
    setPoints(points.filter((_, i) => i !== index));
  }

  function modifierPoint(index: number, champ: "x" | "y", valeur: string) {
    setPoints(points.map((p, i) => (i === index ? { ...p, [champ]: valeur } : p)));
  }

  function construireReponse(): ReponseResolutionLieuxGeometriques | null {
    if (choix === "aucun") return { auMoinsUn: false, points: [] };
    if (choix === "auMoinsUn") {
      if (points.some((p) => p.x.trim() === "" || p.y.trim() === "")) return null;
      const nombres = points.map((p) => ({ x: Number(p.x.replace(",", ".")), y: Number(p.y.replace(",", ".")) }));
      if (nombres.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y))) return null;
      return { auMoinsUn: true, points: nombres };
    }
    return null;
  }

  const reponse = construireReponse();
  const statut = apresEchec && reponse !== null ? diagnostiquerResolution(exercice, reponse) : undefined;

  return (
    <div>
      <div className="equation-box">
        <p>
          <RenduFragments fragments={segmentsEnonce(exercice)} />
        </p>
      </div>
      <p className="prompt-text">{CONSIGNE_GENERALE_RESOLUTION}</p>
      <div className="equation-box">
        <Katex expression={formatEtatActuelSystemeLatex(exercice)} block />
      </div>

      <div className="options-grid-compact">
        <button type="button" className={`btn${choix === "aucun" ? " toggle-active" : ""}`} onClick={() => choisir("aucun")}>
          {LIBELLE_AUCUN}
        </button>
        <button type="button" className={`btn${choix === "auMoinsUn" ? " toggle-active" : ""}`} onClick={() => choisir("auMoinsUn")}>
          {LIBELLE_AU_MOINS_UN}
        </button>
      </div>

      {choix === "auMoinsUn" && (
        <div className="liste-morceaux contenu-conditionnel">
          {points.map((point, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <div className="field-row">
                <div className="field field-inline">
                  <label className="field-label field-label-minuscule" htmlFor={`lieux-geometriques-resolution-x-${index}`}>
                    x{points.length > 1 ? index + 1 : ""} =
                  </label>
                  <input
                    id={`lieux-geometriques-resolution-x-${index}`}
                    className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
                    placeholder={PLACEHOLDER_COORDONNEE}
                    value={point.x}
                    onChange={(e) => modifierPoint(index, "x", filtrerSaisieNumerique(e.target.value))}
                    onKeyDown={gererKeyDownNumerique}
                  />
                </div>
                <div className="field field-inline">
                  <label className="field-label field-label-minuscule" htmlFor={`lieux-geometriques-resolution-y-${index}`}>
                    y{points.length > 1 ? index + 1 : ""} =
                  </label>
                  <input
                    id={`lieux-geometriques-resolution-y-${index}`}
                    className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
                    placeholder={PLACEHOLDER_COORDONNEE}
                    value={point.y}
                    onChange={(e) => modifierPoint(index, "y", filtrerSaisieNumerique(e.target.value))}
                    onKeyDown={gererKeyDownNumerique}
                  />
                </div>
              </div>
              {points.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer le point ${index + 1}`} onClick={() => retirerPoint(index)}>
                  ×
                </button>
              )}
            </div>
          ))}
          {points.length < MAX_POINTS && (
            <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterPoint}>
              + Ajouter un point
            </button>
          )}
        </div>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideResolutionNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatQuadratiqueSubstitutionLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={2} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={() => reponse !== null && onValider(reponse)}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
