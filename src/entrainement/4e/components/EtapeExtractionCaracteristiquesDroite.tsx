import { useState } from "react";
import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import { NIVEAU_AIDE_MAX_EXTRACTION } from "../moteur/sessionCaracteristiquesDroite";
import { diagnostiquerExtraction } from "../moteur/verificationCaracteristiquesDroite";
import type { ReponseExtraction } from "../moteur/verificationCaracteristiquesDroite";
import { filtrerSaisieNumeriqueFraction, gererKeyDownNumeriqueFraction } from "../ui/bloquerSaisieNonNumerique";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { PLACEHOLDER_COMPOSANTE, PLACEHOLDER_COORDONNEE, formatAideExtractionNiveau2Latex, segmentsAideExtractionNiveau1 } from "../ui/formatCaracteristiquesDroite";
import { formatMessageErreur } from "../ui/messageErreur";
import { ConsigneExtractionCaracteristiquesDroite } from "./ConsigneExtractionCaracteristiquesDroite";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceCaracteristiquesDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseExtraction) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 1 — extraction d'un POINT et d'un VECTEUR DIRECTEUR de la droite de départ, 4 champs
 * numériques. Vérifiée par appartenance/proportionnalité (`diagnostiquerExtraction`), jamais par
 * égalité à un couple pré-déterminé — n'importe quel point de la droite avec n'importe quel
 * multiple non nul du vecteur directeur canonique est accepté.
 */
export function EtapeExtractionCaracteristiquesDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [px, setPx] = useState("");
  const [py, setPy] = useState("");
  const [vx, setVx] = useState("");
  const [vy, setVy] = useState("");

  const complet = [px, py, vx, vy].every((v) => v.trim() !== "");

  /** Fraction « p/q » acceptée (pente/ordonnée rationnelles : y = −1/3·x + 5/3 donne le point
   * (0 ; 5/3) et le vecteur (1 ; −1/3)) — une saisie illisible devient NaN (`parse_error`). */
  function lire(texte: string): number {
    return parserNombreOuFraction(texte) ?? Number.NaN;
  }

  function construireReponse(): ReponseExtraction {
    return {
      point: { x: lire(px), y: lire(py) },
      vecteur: { x: lire(vx), y: lire(vy) },
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerExtraction(exercice, construireReponse()) : undefined;
  const erronee = apresEchec && statut !== "correct";

  const champsPoint: { id: string; labelLatex: string; valeur: string; setter: (v: string) => void; placeholder: string }[] = [
    { id: "px", labelLatex: "x_A=", valeur: px, setter: setPx, placeholder: PLACEHOLDER_COORDONNEE },
    { id: "py", labelLatex: "y_A=", valeur: py, setter: setPy, placeholder: PLACEHOLDER_COORDONNEE },
  ];
  const champsVecteur: { id: string; labelLatex: string; valeur: string; setter: (v: string) => void; placeholder: string }[] = [
    { id: "vx", labelLatex: "x_{\\vec{u}}=", valeur: vx, setter: setVx, placeholder: PLACEHOLDER_COMPOSANTE },
    { id: "vy", labelLatex: "y_{\\vec{u}}=", valeur: vy, setter: setVy, placeholder: PLACEHOLDER_COMPOSANTE },
  ];

  return (
    <div>
      <ConsigneExtractionCaracteristiquesDroite exercice={exercice} />

      {[champsPoint, champsVecteur].map((paire) => (
        <div key={paire[0]!.id} className="field-row">
          {paire.map((champ) => (
            <div key={champ.id} className="field field-inline">
              <label className="field-label field-label-minuscule" htmlFor={`caracteristiques-droite-extraction-${champ.id}`}>
                <Katex expression={champ.labelLatex} />
              </label>
              <input
                id={`caracteristiques-droite-extraction-${champ.id}`}
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder={champ.placeholder}
                value={champ.valeur}
                onChange={(e) => champ.setter(filtrerSaisieNumeriqueFraction(e.target.value))}
                onKeyDown={gererKeyDownNumeriqueFraction}
              />
            </div>
          ))}
        </div>
      ))}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideExtractionNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideExtractionNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_EXTRACTION} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
