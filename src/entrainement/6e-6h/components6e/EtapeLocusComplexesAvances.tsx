import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { NatureLieu } from "../core6e/complexesAvances.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { NATURES_DISPONIBLES } from "../ui6e/formatComplexesAvances";
import type { AideAvecLatex } from "../ui6e/formatComplexesAvances";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  demandePoleExclu: boolean;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
}

const NOMBRE_MAX_ANGLES = 2;

/**
 * Écran DÉDIÉ famille B, écran 2 (sous-types simples uniquement — jamais "intersection") :
 * "identifier la nature du lieu (droite/cercle/demi-droite(s)) PUIS ses paramètres" — mirroir DIRECT
 * de `EtapeTypeParametresTransformationsPlan.tsx` (6gen40), généralisé à 3 natures au lieu de 2.
 * D'abord un choix `.btn.toggle-active` parmi `NATURES_DISPONIBLES` (JAMAIS `.btn-primary`,
 * convention CLAUDE.md), PUIS (bloc `.contenu-conditionnel`, révélé seulement après le choix) le(s)
 * champ(s) pertinent(s) : 2 champs "point" (a+bi) pour droite, "centre" (a+bi) + "rayon" (réel) pour
 * cercle, 1 à 2 champs "angle" (réel, add-as-needed) pour demi-droite(s). Si `demandePoleExclu`, un
 * champ supplémentaire "point exclu" (a+bi) est TOUJOURS demandé une fois une nature choisie — piège
 * transversal de la famille B (droite/cercle de Thalès), voir en-tête
 * `generateurs6e/complexesAvances/familleB.ts`.
 *
 * `valeurs` soumis à `onValider`/`diagnostiquer` : `[nature, ...params, poleTexte?]` — voir
 * `moteur6e/verificationComplexesAvances.ts`, `diagnostiquerBEcran2`. `App6gen42.tsx` doit le rendre
 * avec `key={phase}`.
 */
export function EtapeLocusComplexesAvances({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, demandePoleExclu, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [nature, setNature] = useState<NatureLieu | null>(null);
  const [point1, setPoint1] = useState("");
  const [point2, setPoint2] = useState("");
  const [centre, setCentre] = useState("");
  const [rayon, setRayon] = useState("");
  const [angles, setAngles] = useState<string[]>([""]);
  const [poleTexte, setPoleTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  function paramsPourNature(): string[] {
    if (nature === "droite") return [point1, point2];
    if (nature === "cercle") return [centre, rayon];
    if (nature === "demiDroite") return angles;
    return [];
  }

  const valeursActuelles = [nature ?? "", ...paramsPourNature(), ...(demandePoleExclu ? [poleTexte] : [])];
  const dernierStatut = montrerErreurs ? diagnostiquer(valeursActuelles) : null;

  const toutRempli =
    nature !== null &&
    (nature === "droite" ? point1.trim() !== "" && point2.trim() !== "" : nature === "cercle" ? centre.trim() !== "" && rayon.trim() !== "" : angles.length > 0 && angles.every((a) => a.trim() !== "")) &&
    (!demandePoleExclu || poleTexte.trim() !== "");

  function valider() {
    if (!toutRempli || nature === null) return;
    onValider([nature, ...paramsPourNature(), ...(demandePoleExclu ? [poleTexte] : [])]);
  }

  function ajouterAngle() {
    if (angles.length >= NOMBRE_MAX_ANGLES) return;
    setAngles((arr) => [...arr, ""]);
  }
  function retirerAngle(i: number) {
    setAngles((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierAngle(i: number, valeur: string) {
    setAngles((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      <div className="options-grid-compact">
        {NATURES_DISPONIBLES.map((option) => (
          <button type="button" key={option.id} className={`btn ${nature === option.id ? "toggle-active" : ""} ${montrerErreurs && nature === option.id ? "is-erronee" : ""}`} onClick={() => setNature(option.id)}>
            {option.label}
          </button>
        ))}
      </div>

      {nature === "droite" && (
        <div className="contenu-conditionnel">
          <ApercuExpressionLatex texte={point1} label="Point 1 (a+bi) =" />
          <ApercuExpressionLatex texte={point2} label="Point 2 (a+bi) =" />
          <div className="field-row field-row-wrap">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule">Point 1 (a+bi) =</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={point1} placeholder="ex : 1+2i" onChange={(e) => setPoint1(e.target.value)} />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule">Point 2 (a+bi) =</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={point2} placeholder="ex : -1-2i" onChange={(e) => setPoint2(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {nature === "cercle" && (
        <div className="contenu-conditionnel">
          <ApercuExpressionLatex texte={centre} label="Centre (a+bi) =" />
          <ApercuExpressionLatex texte={rayon} label="Rayon =" />
          <div className="field-row field-row-wrap">
            <div className="field field-inline">
              <label className="field-label field-label-minuscule">Centre (a+bi) =</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={centre} placeholder="ex : 0" onChange={(e) => setCentre(e.target.value)} />
            </div>
            <div className="field field-inline">
              <label className="field-label field-label-minuscule">Rayon =</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={rayon} placeholder="ex : sqrt(5)" onChange={(e) => setRayon(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {nature === "demiDroite" && (
        <div className="contenu-conditionnel">
          {angles.map((a, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={a} />
              <div className="field-row">
                <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={a} placeholder="ex : pi/3" onChange={(e) => modifierAngle(i, e.target.value)} />
                {angles.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer l'angle ${i + 1}`} onClick={() => retirerAngle(i)}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          {angles.length < NOMBRE_MAX_ANGLES && (
            <button type="button" className="btn" onClick={ajouterAngle}>
              + Ajouter un angle
            </button>
          )}
        </div>
      )}

      {nature !== null && demandePoleExclu && (
        <div className="contenu-conditionnel">
          <ApercuExpressionLatex texte={poleTexte} />
          <div className="field">
            <label className="field-label field-label-minuscule">Point exclu du lieu (le pôle, a+bi) =</label>
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={poleTexte} placeholder="ex : 1-i" onChange={(e) => setPoleTexte(e.target.value)} />
          </div>
        </div>
      )}

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
