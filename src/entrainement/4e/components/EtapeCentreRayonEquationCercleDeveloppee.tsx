import { useState } from "react";
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import { NIVEAU_AIDE_MAX_CENTRE_RAYON } from "../moteur/sessionEquationCercleDeveloppee";
import { diagnostiquerCentreRayon } from "../moteur/verificationEquationCercleDeveloppee";
import type { ReponseEcranCentreRayon } from "../moteur/typesEquationCercleDeveloppee";
import { filtrerSaisieNumeriqueFraction, gererKeyDownNumeriqueFraction } from "../ui/bloquerSaisieNonNumerique";
import { filtrerSaisieNumeriqueRacine, gererKeyDownNumeriqueRacine } from "../ui/bloquerSaisieNonNumeriqueRacine";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { CONSIGNE_GENERALE_CENTRE_RAYON, PLACEHOLDER_COORDONNEE, PLACEHOLDER_RAYON, segmentsAideCentreRayonNiveau1, formatEquationDeveloppeeLatex, formatEquationReduiteLatex, segmentsConsigneCentreRayon } from "../ui/formatEquationCercleDeveloppee";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationCercleDeveloppee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEcranCentreRayon) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 3 (dernier, toujours terminal) — la forme complétée CONFIRMÉE à l'écran 2 (et le
 * regroupement de l'écran 1) apparaissent désormais dans le récapitulatif accumulé en haut de
 * carte (`RecapitulatifPanel`/`AppEquationCercleDeveloppee`), plus ici en isolation. Centre : 2
 * champs numériques, statut à 3 valeurs classique. Rayon : champ de texte
 * libre, parsé symboliquement (couvre les deux variantes de façon uniforme, jamais confondu avec
 * r² — le piège central de l'exercice).
 */
export function EtapeCentreRayonEquationCercleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [rayon, setRayon] = useState("");

  const complet = [x, y, rayon].every((v) => v.trim() !== "");

  /** Coordonnée lue comme entier, décimal ou fraction (« 1/2 », « -5/2 ») — le centre est souvent
   * demi-entier et la réponse affichée l'écrit en fraction (audit chapitre 7, point 9). */
  function lireCoordonnee(texte: string): number {
    return parserNombreOuFraction(texte) ?? Number.NaN;
  }

  function construireReponse(): ReponseEcranCentreRayon {
    return { x: lireCoordonnee(x), y: lireCoordonnee(y), rayon };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCentreRayon(exercice, { x: lireCoordonnee(x), y: lireCoordonnee(y) }, rayon) : undefined;
  const centreErronee = apresEchec && statut!.centre !== "correct";
  const rayonErronee = apresEchec && statut!.rayon !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_CENTRE_RAYON}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneCentreRayon(exercice)} />
      </p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-cercle-developpee-centre-x">
            x₀ =
          </label>
          <input
            id="equation-cercle-developpee-centre-x"
            className={`text-input${centreErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={x}
            onChange={(e) => setX(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-cercle-developpee-centre-y">
            y₀ =
          </label>
          <input
            id="equation-cercle-developpee-centre-y"
            className={`text-input${centreErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={y}
            onChange={(e) => setY(filtrerSaisieNumeriqueFraction(e.target.value))}
            onKeyDown={gererKeyDownNumeriqueFraction}
          />
        </div>
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="equation-cercle-developpee-rayon">
          R =
        </label>
        <input
          id="equation-cercle-developpee-rayon"
          className={`text-input${rayonErronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_RAYON}
          value={rayon}
          onChange={(e) => setRayon(filtrerSaisieNumeriqueRacine(e.target.value))}
          onKeyDown={gererKeyDownNumeriqueRacine}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideCentreRayonNiveau1()} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatEquationReduiteLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CENTRE_RAYON} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut?.centre !== "correct" ? statut?.centre : statut?.rayon)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
