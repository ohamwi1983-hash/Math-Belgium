import { useState } from "react";
import type { ExerciceOptimisation } from "../core/optimisation.types";
import { diagnostiquerSommet } from "../moteur/verificationOptimisation";
import type { ReponseSommet } from "../moteur/verificationOptimisation";
import { NIVEAU_AIDE_MAX_SOMMET } from "../moteur/sessionOptimisation";
import {
  consigneSommet,
  contexteLabelX,
  contexteLabelY,
  formatDonneesConfirmeesLatex,
  libelleBoutonAide,
  segmentsPhraseEnonce,
  texteAideSommetNiveau1,
  texteAideSommetNiveau2,
} from "../ui/formatOptimisation";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceOptimisation } from "./EnonceOptimisation";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { SegmentsInline } from "./SegmentsInline";

interface Props {
  exercice: ExerciceOptimisation;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSommet) => void;
}

/**
 * Écran commun aux 2 variantes — calcule le sommet de la parabole. Première étape de la variante
 * `fonctionDonnee` (fonction ET domaine déjà fournis, voir `EtatActuelPanel`) ; pour `modelisation`,
 * fonction/domaine viennent d'être confirmés aux écrans précédents.
 *
 * **Labels de champs = nom concret de la grandeur/variable, REMPLACEMENT COMPLET** (`prompt-
 * restructuration-architecture-modelisation.md`, point 1 — jamais $x_S$/$y_S$ nus, jamais un ajout
 * entre parenthèses À CÔTÉ du label mathématique comme dans une version antérieure de cette
 * fonctionnalité) : `contexteLabelX`/`contexteLabelY` (`nomVariable`/`nomGrandeur` sans article)
 * REMPLACENT directement `x_S =`/`y_S =`. Repli sur la notation mathématique nue UNIQUEMENT si
 * `genreGrandeur` est absent (8 familles exclusives au 57e exercice, qui n'utilisent jamais cet
 * écran en pratique — voir `core/optimisation.types.ts` — repli défensif, jamais atteint). Les
 * textes d'aide contiennent leur propre notation à underscore ($x_S$...) rendue via
 * `<SegmentsInline>`, jamais en texte brut (point 2 du même prompt).
 */
export function EtapeSommetOptimisation({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const complet = x.trim() !== "" && y.trim() !== "";
  const reponse: ReponseSommet = { x, y };
  const statut = complet ? diagnostiquerSommet(exercice, reponse) : undefined;
  const apresEchec = tentativesUtilisees > 0;
  const statutGlobal = statut
    ? statut.x === "parse_error" || statut.y === "parse_error"
      ? "parse_error"
      : statut.x === "correct" && statut.y === "correct"
        ? "correct"
        : "not_equivalent"
    : undefined;

  const labelX = contexteLabelX(exercice) || "x_S";
  const labelY = contexteLabelY(exercice) || "y_S";

  return (
    <div>
      <EnonceOptimisation exercice={exercice} />
      <EtatActuelPanel latex={formatDonneesConfirmeesLatex(exercice)} label="Données" />
      <p className="prompt-text">{consigneSommet(exercice)}</p>
      <div className="field">
        <label className="field-label" htmlFor="optimisation-sommet-x">
          {labelX} =
        </label>
        <input
          id="optimisation-sommet-x"
          className={`text-input${apresEchec && statut && statut.x !== "correct" ? " is-erronee" : ""}`}
          value={x}
          onChange={(e) => setX(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="optimisation-sommet-y">
          {labelY} =
        </label>
        <input
          id="optimisation-sommet-y"
          className={`text-input${apresEchec && statut && statut.y !== "correct" ? " is-erronee" : ""}`}
          value={y}
          onChange={(e) => setY(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={segmentsPhraseEnonce(texteAideSommetNiveau1(exercice))} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <SegmentsInline segments={segmentsPhraseEnonce(texteAideSommetNiveau2(exercice))} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_SOMMET} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_SOMMET)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(reponse)}>
        Valider
      </button>
      {apresEchec && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statutGlobal)}
        </p>
      )}
    </div>
  );
}
