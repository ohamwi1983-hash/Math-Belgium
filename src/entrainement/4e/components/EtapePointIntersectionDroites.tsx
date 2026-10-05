import { useState } from "react";
import type { ExerciceIntersectionDroites } from "../core/intersectionDroites.types";
import { NIVEAU_AIDE_MAX_POINT } from "../moteur/sessionIntersectionDroites";
import { diagnostiquerPoint, type ReponsePoint } from "../moteur/verificationIntersectionDroites";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { PLACEHOLDER_COMPOSANTE, PLACEHOLDER_COORDONNEE } from "../ui/formatEquationDroite";
import { CONSIGNE_GENERALE_INTERSECTION, formatAidePointNiveau2Latex, formatLignesEnonce, libelleBoutonAide, segmentsConsignePoint, texteAidePointNiveau1 } from "../ui/formatIntersectionDroites";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceIntersectionDroites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponsePoint) => void;
}

/**
 * Écran 2 — Point d'intersection, uniquement atteint si `exercice.conclusion === "secantes"`. Les
 * champs t/s n'apparaissent QUE pour les variantes qui en ont besoin (`tAttendu`/`sAttendu`
 * non-null) — jamais pour `cart_cart`, jamais `s` pour `param_cart`. Chaque champ marqué en rouge
 * INDÉPENDAMMENT selon son propre statut (`diagnostiquerPoint`), pour isoler le piège "s'arrêter à
 * t sans réinjecter" (param_cart) et "confondre t et s" (param_param).
 */
export function EtapePointIntersectionDroites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [t, setT] = useState("");
  const [s, setS] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  const besoinT = exercice.tAttendu !== null;
  const besoinS = exercice.sAttendu !== null;

  const complet = (!besoinT || t.trim() !== "") && (!besoinS || s.trim() !== "") && x.trim() !== "" && y.trim() !== "";

  function construireReponse(): ReponsePoint {
    return {
      t: besoinT ? Number(t.replace(",", ".")) : null,
      s: besoinS ? Number(s.replace(",", ".")) : null,
      point: { x: Number(x.replace(",", ".")), y: Number(y.replace(",", ".")) },
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerPoint(exercice, construireReponse()) : undefined;
  const statutGlobal = statut ? (statut.t === "parse_error" || statut.s === "parse_error" || statut.point === "parse_error" ? "parse_error" : statut.t === "not_equivalent" || statut.s === "not_equivalent" || statut.point === "not_equivalent" ? "not_equivalent" : "correct") : undefined;
  const [ligneD1, ligneD2] = formatLignesEnonce(exercice);

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_INTERSECTION}</p>
      <div className="equation-box">
        <Katex expression={ligneD1} block />
        <Katex expression={ligneD2} block />
      </div>
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
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={t}
            onChange={(e) => setT(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
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
            placeholder={PLACEHOLDER_COMPOSANTE}
            value={s}
            onChange={(e) => setS(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
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
            placeholder={PLACEHOLDER_COORDONNEE}
            value={x}
            onChange={(e) => setX(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="intersection-droites-y">
            y =
          </label>
          <input
            id="intersection-droites-y"
            className={`text-input${apresEchec && statut && statut.point !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={y}
            onChange={(e) => setY(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
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
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_POINT} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_POINT)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
        </p>
      )}
    </div>
  );
}
