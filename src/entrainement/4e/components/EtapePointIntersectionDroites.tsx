import { useState } from "react";
import type { ExerciceIntersectionDroites } from "../core/intersectionDroites.types";
import { NIVEAU_AIDE_MAX_POINT } from "../moteur/sessionIntersectionDroites";
import { diagnostiquerPoint, type ReponsePoint } from "../moteur/verificationIntersectionDroites";
import {
  CONSIGNE_GENERALE_INTERSECTION,
  PLACEHOLDER_COORDONNEE_INTERSECTION,
  PLACEHOLDER_PARAMETRE_INTERSECTION,
  formatAidePointNiveau2Latex,
  formatLignesEnonce,
  segmentsConsignePoint,
  texteAidePointNiveau1,
} from "../ui/formatIntersectionDroites";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, l, nombreOuNaN, nombresLisibles, surDroite, t as txt } from "../ui/retoursAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

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
  const lire = nombreOuNaN;

  /** Message ciblé (jamais la réponse) : le piège « s'arrêter à t » (valeur du paramètre donnée
   * comme coordonnée), point juste sur une seule des deux droites. */
  function cible(r: ReponsePoint) {
    const P = exercice.point!;
    if (exercice.tAttendu !== null && r.t !== null && Math.abs(r.t - exercice.tAttendu) < 1e-9 && (Math.abs(r.point.x - r.t) < 1e-9 || Math.abs(r.point.y - r.t) < 1e-9) && !(Math.abs(r.point.x - P.x) < 1e-9 && Math.abs(r.point.y - P.y) < 1e-9)) {
      return [txt("La valeur de "), l("t"), txt(" n'est pas une coordonnée : remplace-la dans les équations paramétriques pour obtenir le point.")];
    }
    const sur1 = surDroite(r.point, exercice.d1.implicite);
    const sur2 = surDroite(r.point, exercice.d2.implicite);
    if (sur1 !== sur2) return [txt("Ton point est sur "), l(sur1 ? "d_1" : "d_2"), txt(" mais pas sur "), l(sur1 ? "d_2" : "d_1"), txt(" : le point d'intersection vérifie les deux équations.")];
    return null;
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
            onChange={(e) => setT(normaliserSigneMoins(e.target.value))}
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
            onChange={(e) => setS(normaliserSigneMoins(e.target.value))}
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
            onChange={(e) => setX(normaliserSigneMoins(e.target.value))}
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
            onChange={(e) => setY(normaliserSigneMoins(e.target.value))}
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
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_POINT}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => construireReponse()}
          lisible={() => nombresLisibles(x, y, ...(besoinT ? [t] : []), ...(besoinS ? [s] : []))}
          onValider={(r) => onValider(r, { t, s, x, y })}
          texteIllisible={ILLISIBLE_ANALYTIQUE.coordonnee}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
