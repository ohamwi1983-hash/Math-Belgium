import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { labelAjoutCentreB, labelListeCentresB, labelRayonB, placeholderCentreB } from "../ui6e/formatCercles";
import type { AideAvecLatex } from "../ui6e/formatCercles";
import { SEPARATEUR_CENTRES_B } from "../moteur6e/verificationCercles";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
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

const MAX_LIGNES = 5;

/**
 * Écran DÉDIÉ à `bEcran3` (famille B, `6gen55`) — liste add-as-needed des centres possibles
 * (PIÈGE CENTRAL : n'en garder qu'un seul doit être rejeté), croix rouge `×` pour retirer une ligne
 * (jamais un bouton texte "Retirer" — convention CLAUDE.md), toujours au moins 1 ligne au départ,
 * PLUS un champ "rayon" séparé (déjà connu, simplement à reporter). Mirroir stylistique
 * `EtapeListeDecompositionsDenombrementCombinatoirePur.tsx` (6gen46) — mais ici une SEULE liste
 * (pas 2 simultanées), donc structure plus simple. Le tableau `string[]` plat transmis à
 * `onValider`/`diagnostiquer` encode la liste des centres puis le marqueur `SEPARATEUR_CENTRES_B`
 * puis le champ rayon — convention imposée par le moteur de session générique
 * (`soumettreReponseEcran(etat, valeurs: string[])`). `App6gen55.tsx` doit le rendre avec
 * `key={phase}`.
 */
export function EtapeListeCentresCercles({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [centres, setCentres] = useState<string[]>([""]);
  const [rayon, setRayon] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  function valeursCourantes(): string[] {
    return [...centres, SEPARATEUR_CENTRES_B, rayon];
  }

  const dernierStatut = montrerErreurs ? diagnostiquer(valeursCourantes()) : null;
  const toutRempli = centres.every((v) => v.trim() !== "") && rayon.trim() !== "";

  function valider() {
    if (!toutRempli) return;
    onValider(valeursCourantes());
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
      <div className="contenu-conditionnel">
        <div className="field">
          <label className="field-label field-label-minuscule">{labelListeCentresB()}</label>
          {centres.map((ligne, i) => (
            <div key={i} className="field-row">
              <input
                type="text"
                className={`text-input ${montrerErreurs ? "is-erronee" : ""}`}
                value={ligne}
                placeholder={placeholderCentreB()}
                onChange={(e) => setCentres((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
              />
              {centres.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer le centre ${i + 1}`} onClick={() => setCentres((arr) => arr.filter((_, j) => j !== i))}>
                  ×
                </button>
              )}
            </div>
          ))}
          {centres.length < MAX_LIGNES && (
            <button type="button" className="btn" onClick={() => setCentres((arr) => (arr.length >= MAX_LIGNES ? arr : [...arr, ""]))}>
              {labelAjoutCentreB()}
            </button>
          )}
        </div>
        <ApercuExpressionLatex texte={rayon} label="Rayon =" />
        <div className="field">
          <label className="field-label field-label-minuscule">{labelRayonB()}</label>
          <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={rayon} placeholder="ex : 4" onChange={(e) => setRayon(e.target.value)} />
        </div>
      </div>
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
