import { useState } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "../ui6e/formatProbabilitesEnsembles";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  consigneEcran: FragmentConsigne[];
  champs: ChampDef[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran GÉNÉRIQUE à N champs texte libre (1 à 5) pour `6gen30` — même patron que
 * `EtapeChampsCalculPrimitives.tsx` (6gen23), copié plutôt qu'importé (fondation d'un nouveau
 * chapitre, aucun couplage entre chapitres). Structure d'écran imposée par CLAUDE.md (consigne
 * générale → bloc données → bloc de travail) conservée à l'identique.
 * `App6gen30.tsx` doit le rendre avec `key={phase}` (remet les champs à vide à chaque écran). */
export function EtapeChampsProbabilitesEnsembles({ consigneGenerale, blocDonnees, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(valeurs) : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");

  function valider() {
    if (!toutRempli) return;
    onValider(valeurs);
  }

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          <div className="equation-box">
            <div className="equation-box-donnees">
              {blocDonnees.map((frag, i) => (
                <Katex key={i} expression={frag} block />
              ))}
            </div>
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div className={`field-row ${champs.length > 3 ? "field-row-wrap" : ""}`}>
        {champs.map((champ, i) => (
          <div className={champs.length > 1 ? "field field-inline" : "field"} key={i}>
            <label className="field-label field-label-minuscule">{champ.label}</label>
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
          </div>
        ))}
      </div>
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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
