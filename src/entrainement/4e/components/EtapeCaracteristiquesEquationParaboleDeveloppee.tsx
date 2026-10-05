import { useState } from "react";
import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import { NIVEAU_AIDE_MAX_CARACTERISTIQUES } from "../moteur/sessionEquationParaboleDeveloppee";
import { diagnostiquerDirectrice, diagnostiquerFoyer, diagnostiquerP, diagnostiquerSommet } from "../moteur/verificationEquationParaboleDeveloppee";
import type { ReponseEcranCaracteristiques } from "../moteur/typesEquationParaboleDeveloppee";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import {
  CONSIGNE_CARACTERISTIQUES,
  CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE,
  PLACEHOLDER_COORDONNEE,
  PLACEHOLDER_DIRECTRICE_HORIZONTAL,
  PLACEHOLDER_DIRECTRICE_VERTICAL,
  PLACEHOLDER_P,
  formatAideCaracteristiquesNiveau1Latex,
  formatAideCaracteristiquesNiveau2Latex,
  formatCompletionLatex,
  formatEquationDeveloppeeLatex,
  libelleBoutonAide,
} from "../ui/formatEquationParaboleDeveloppee";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceEquationParaboleDeveloppee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEcranCaracteristiques) => void;
}

/**
 * Écran 3 (dernier, toujours terminal) — "état actuel" rappelle la forme complétée CONFIRMÉE à
 * l'écran 2. S/F : statut à 3 valeurs classique, 2 champs numériques chacun. p : 1 champ numérique
 * signé. Directrice : texte libre, gère les 2 orientations uniformément
 * (`diagnostiquerDirectrice`). Chaque champ diagnostiqué indépendamment pour isoler le piège
 * central (F et directrice échangés en cas d'erreur de signe sur p).
 */
export function EtapeCaracteristiquesEquationParaboleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [sx, setSx] = useState("");
  const [sy, setSy] = useState("");
  const [fx, setFx] = useState("");
  const [fy, setFy] = useState("");
  const [p, setP] = useState("");
  const [directrice, setDirectrice] = useState("");

  const complet = [sx, sy, fx, fy, p, directrice].every((v) => v.trim() !== "");

  function construireReponse(): ReponseEcranCaracteristiques {
    return {
      sx: Number(sx.replace(",", ".")),
      sy: Number(sy.replace(",", ".")),
      fx: Number(fx.replace(",", ".")),
      fy: Number(fy.replace(",", ".")),
      p: Number(p.replace(",", ".")),
      directrice,
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const reponse = apresEchec ? construireReponse() : null;
  const statutSommet = reponse ? diagnostiquerSommet(exercice, { x: reponse.sx, y: reponse.sy }) : undefined;
  const statutFoyer = reponse ? diagnostiquerFoyer(exercice, { x: reponse.fx, y: reponse.fy }) : undefined;
  const statutP = reponse ? diagnostiquerP(exercice, reponse.p) : undefined;
  const statutDirectrice = reponse ? diagnostiquerDirectrice(exercice, reponse.directrice) : undefined;

  const sommetErronee = apresEchec && statutSommet !== "correct";
  const foyerErronee = apresEchec && statutFoyer !== "correct";
  const pErronee = apresEchec && statutP !== "correct";
  const directriceErronee = apresEchec && statutDirectrice !== "correct";

  const premierStatutEnDefaut = apresEchec ? [statutSommet, statutFoyer, statutP, statutDirectrice].find((s) => s !== "correct") : undefined;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE}</p>
      <div className="equation-box">
        <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={formatCompletionLatex(exercice)} />
      <p className="prompt-text">{CONSIGNE_CARACTERISTIQUES}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-sx">
            <Katex expression="x_S=" />
          </label>
          <input
            id="equation-parabole-developpee-sx"
            className={`text-input${sommetErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={sx}
            onChange={(e) => setSx(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-sy">
            <Katex expression="y_S=" />
          </label>
          <input
            id="equation-parabole-developpee-sy"
            className={`text-input${sommetErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={sy}
            onChange={(e) => setSy(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-fx">
            <Katex expression="x_F=" />
          </label>
          <input
            id="equation-parabole-developpee-fx"
            className={`text-input${foyerErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={fx}
            onChange={(e) => setFx(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-fy">
            <Katex expression="y_F=" />
          </label>
          <input
            id="equation-parabole-developpee-fy"
            className={`text-input${foyerErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={fy}
            onChange={(e) => setFy(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-p">
          <Katex expression="p=" />
        </label>
        <input
          id="equation-parabole-developpee-p"
          className={`text-input${pErronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_P}
          value={p}
          onChange={(e) => setP(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="equation-parabole-developpee-directrice">
          Directrice :
        </label>
        <input
          id="equation-parabole-developpee-directrice"
          className={`text-input${directriceErronee ? " is-erronee" : ""}`}
          placeholder={exercice.variante === "vertical" ? PLACEHOLDER_DIRECTRICE_VERTICAL : PLACEHOLDER_DIRECTRICE_HORIZONTAL}
          value={directrice}
          onChange={(e) => setDirectrice(e.target.value)}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <Katex expression={formatAideCaracteristiquesNiveau1Latex(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideCaracteristiquesNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_CARACTERISTIQUES} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_CARACTERISTIQUES)}
      </button>

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(construireReponse())}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, premierStatutEnDefaut)}
        </p>
      )}
    </div>
  );
}
