import { useState } from "react";
import type { ExerciceIntersectionDroites } from "../core/intersectionDroites.types";
import { NIVEAU_AIDE_MAX_POINT } from "../moteur/sessionIntersectionDroites";
import { diagnostiquerPoint, type ReponsePoint } from "../moteur/verificationIntersectionDroites";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { filtrerSaisieNumeriqueFraction, gererKeyDownNumeriqueFraction } from "../ui/bloquerSaisieNonNumerique";
import {
  CONSIGNE_GENERALE_INTERSECTION,
  PLACEHOLDER_COORDONNEE_INTERSECTION,
  PLACEHOLDER_PARAMETRE_INTERSECTION,
  formatAidePointNiveau2Latex,
  formatLignesEnonce,
  segmentsConsignePoint,
  texteAidePointNiveau1,
} from "../ui/formatIntersectionDroites";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceIntersectionDroites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  /** `saisie` : les champs tels que tapés, pour la fiche de consultation (puces cliquables). */
  onValider: (reponse: ReponsePoint, saisie: { t: string; s: string; x: string; y: string }) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 2 — Point d'intersection, uniquement atteint si `exercice.conclusion === "secantes"`. Les
 * champs t/s n'apparaissent QUE pour les variantes qui en ont besoin (`tAttendu`/`sAttendu`
 * non-null) — jamais pour `cart_cart`, jamais `s` pour `param_cart`. Chaque champ marqué en rouge
 * INDÉPENDAMMENT selon son propre statut (`diagnostiquerPoint`), pour isoler le piège "s'arrêter à
 * t sans réinjecter" (param_cart) et "confondre t et s" (param_param).
 */
export function EtapePointIntersectionDroites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [t, setT] = useState("");
  const [s, setS] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const besoinT = exercice.tAttendu !== null;
  const besoinS = exercice.sAttendu !== null;

  const complet = (!besoinT || t.trim() !== "") && (!besoinS || s.trim() !== "") && x.trim() !== "" && y.trim() !== "";

  /** Fraction `p/q` acceptée (audit chapitre 7, point 40 : le point d'intersection peut désormais
   * être fractionnaire) — `NaN` pour un champ illisible (`parse_error`). */
  function lire(texte: string): number {
    return parserNombreOuFraction(texte) ?? Number.NaN;
  }

  function construireReponse(): ReponsePoint {
    return {
      t: besoinT ? lire(t) : null,
      s: besoinS ? lire(s) : null,
      point: { x: lire(x), y: lire(y) },
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerPoint(exercice, construireReponse()) : undefined;
  const statutGlobal = statut ? (statut.t === "parse_error" || statut.s === "parse_error" || statut.point === "parse_error" ? "parse_error" : statut.t === "not_equivalent" || statut.s === "not_equivalent" || statut.point === "not_equivalent" ? "not_equivalent" : "correct") : undefined;
  const [ligneD1, ligneD2] = formatLignesEnonce(exercice);

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_INTERSECTION}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={ligneD1} block />
            <Katex expression={ligneD2} block />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsignePoint(exercice)} />
      </p>

      {besoinT && (
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="intersection-droites-t">
            t =
          </label>
          <input
            id="intersection-droites-t"
            className={`text-input${apresEchec && statut?.t && statut.t !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_PARAMETRE_INTERSECTION}
            value={t}
            onChange={(e) => setT(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
      )}
      {besoinS && (
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="intersection-droites-s">
            s =
          </label>
          <input
            id="intersection-droites-s"
            className={`text-input${apresEchec && statut?.s && statut.s !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_PARAMETRE_INTERSECTION}
            value={s}
            onChange={(e) => setS(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
      )}
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="intersection-droites-x">
            x =
          </label>
          <input
            id="intersection-droites-x"
            className={`text-input${apresEchec && statut && statut.point !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE_INTERSECTION}
            value={x}
            onChange={(e) => setX(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="intersection-droites-y">
            y =
          </label>
          <input
            id="intersection-droites-y"
            className={`text-input${apresEchec && statut && statut.point !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE_INTERSECTION}
            value={y}
            onChange={(e) => setY(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAidePointNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAidePointNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_POINT} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse(), { t, s, x, y })}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
