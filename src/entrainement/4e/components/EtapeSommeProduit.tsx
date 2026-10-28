import { useState } from "react";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

interface Props {
  tentativesUtilisees: number;
  tentativesMax: number;
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: { s: number; p: number }) => void;
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "somme et produit" (relations de Viète) : première étape, jamais de récapitulatif (rien
 * n'est encore confirmé pour cet exercice). Deux champs numériques séparés, validés ensemble en
 * une seule tentative — isole le piège de signe classique sur chacun des deux (oublier le "-"
 * dans S, en ajouter un par erreur dans P) sans jamais révéler les racines individuelles : ce
 * n'est que l'écran "factorisation" qui les révèle.
 */
export function EtapeSommeProduit({ tentativesUtilisees, tentativesMax, aideActivee, onActiverAide, onValider, validation }: Props) {
  const [s, setS] = useState("");
  const [p, setP] = useState("");

  const sValide = s.trim() !== "" && !Number.isNaN(Number(s));
  const pValide = p.trim() !== "" && !Number.isNaN(Number(p));

  function valider() {
    if (!sValide || !pValide) return;
    onValider({ s: Number(s), p: Number(p) });
  }

  return (
    <div>
      <p className="prompt-text">
        Calcule la somme S et le produit P des racines de cette équation, sans chercher les racines elles-mêmes.
      </p>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relrac-s">
            <Katex expression="S =" />
          </label>
          <input
            id="relrac-s"
            className="text-input"
            value={s}
            onChange={(e) => setS(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="relrac-p">
            <Katex expression="P =" />
          </label>
          <input
            id="relrac-p"
            className="text-input"
            value={p}
            onChange={(e) => setP(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      {!validation && (
        <>
          <div>
            {aideActivee && (
              <div className="triangle-quelconque-aide">
                <p>
                  Les relations de Viète : <Katex expression="S = -\dfrac{b}{a}" /> et <Katex expression="P = \dfrac{c}{a}" />.
                </p>
              </div>
            )}
            <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
          </div>
          <button type="button" className="btn btn-primary" disabled={!sValide || !pValide} onClick={valider}>
            Valider
          </button>
          {tentativesUtilisees > 0 && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax)}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
