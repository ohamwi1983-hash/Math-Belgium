import { useState } from "react";
import type { ExerciceLieuxGeometriques } from "../core/lieuxGeometriques.types";
import { diagnostiquerResolution } from "../moteur/verificationLieuxGeometriques";
import type { ReponseResolutionLieuxGeometriques } from "../moteur/verificationLieuxGeometriques";
import {
  CONSIGNE_GENERALE_RESOLUTION,
  LIBELLE_AUCUN,
  LIBELLE_AU_MOINS_UN,
  PLACEHOLDER_COORDONNEE_INTERSECTION,
  formatQuadratiqueSubstitutionLatex,
  segmentsAideResolutionNiveau1,
} from "../ui/formatLieuxGeometriques";
import { ILLISIBLE_ANALYTIQUE, nombreOuNaN, t } from "../ui/retoursAnalytique";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

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
  /** Choix « Aucun / Au moins un » déjà jugé par le moteur (une fois), `null` tant qu'il ne l'est pas. */
  choixFige: { choisi: boolean; correct: boolean } | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 3 — Résolution. Choix catégoriel "Aucun"/"Au moins un" puis, si "Au moins un", les points
 * d'intersection en saisie add-as-needed (couvre 1 ou 2 points sans distinction préalable imposée
 * par l'interface) — même patron "Pas de.../Au moins un(e)..." que `EtapeRacinesFlexibles.tsx`,
 * adapté à des PAIRES x/y plutôt qu'une liste de valeurs isolées. */
export function EtapeResolutionLieuxGeometriques({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, choixFige, validation }: Props) {
  const [choixLibre, setChoix] = useState<Choix | null>(null);
  /** Choix affiché : libre tant qu'il n'est pas jugé ; ensuite le bon (révélé s'il était faux). */
  const bonChoix: Choix = exercice.nombrePoints !== 0 ? "auMoinsUn" : "aucun";
  const choix: Choix | null = choixFige ? (choixFige.correct ? (choixFige.choisi ? "auMoinsUn" : "aucun") : bonChoix) : choixLibre;
  const choixBloque = !!validation || choixFige !== null;
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
      // Coordonnée illisible : la réponse reste « complète » (« Valider » affiche le message
      // d'illisible, sans tentative — jamais un bouton grisé muet).
      const nombres = points.map((p) => ({ x: nombreOuNaN(p.x), y: nombreOuNaN(p.y) }));
      return { auMoinsUn: true, points: nombres };
    }
    return null;
  }

  const reponse = construireReponse();
  const statut = apresEchec && reponse !== null ? diagnostiquerResolution(exercice, reponse) : undefined;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_RESOLUTION}</p>

      <div className="options-grid-compact">
        <button type="button" disabled={choixBloque} className={`btn${choix === "aucun" ? " toggle-active" : ""}`} onClick={() => choisir("aucun")}>
          {LIBELLE_AUCUN}
        </button>
        <button type="button" disabled={choixBloque} className={`btn${choix === "auMoinsUn" ? " toggle-active" : ""}`} onClick={() => choisir("auMoinsUn")}>
          {LIBELLE_AU_MOINS_UN}
        </button>
      </div>

      {choixFige !== null && !choixFige.correct && !validation && (
        <p className="alert-error" role="status">
          <span>Ce n'était pas le bon choix : les deux lieux ont au moins un point commun. Donne maintenant ce ou ces points.</span>
        </p>
      )}

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
                    placeholder={PLACEHOLDER_COORDONNEE_INTERSECTION}
                    value={point.x}
                    onChange={(e) => modifierPoint(index, "x", normaliserSigneMoins(e.target.value))}
                  />
                </div>
                <div className="field field-inline">
                  <label className="field-label field-label-minuscule" htmlFor={`lieux-geometriques-resolution-y-${index}`}>
                    y{points.length > 1 ? index + 1 : ""} =
                  </label>
                  <input
                    id={`lieux-geometriques-resolution-y-${index}`}
                    className={`text-input${apresEchec && statut && statut !== "correct" ? " is-erronee" : ""}`}
                    placeholder={PLACEHOLDER_COORDONNEE_INTERSECTION}
                    value={point.y}
                    onChange={(e) => modifierPoint(index, "y", normaliserSigneMoins(e.target.value))}
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
              On obtient : <Katex expression={formatQuadratiqueSubstitutionLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={2}
          onActiverAide={onActiverAide}
          complet={reponse !== null}
          reponse={() => reponse as ReponseResolutionLieuxGeometriques}
          lisible={(r) => r.points.every((pt) => Number.isFinite(pt.x) && Number.isFinite(pt.y))}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.coordonnee}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={(r) => (r.points.length !== exercice.points.length && r.points.length > 0 ? [t(`Le nombre de points ne convient pas : compte les solutions de l'équation obtenue après substitution.`)] : null)}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
