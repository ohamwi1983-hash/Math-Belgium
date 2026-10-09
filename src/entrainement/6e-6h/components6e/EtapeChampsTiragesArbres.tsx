import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatTiragesArbres";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
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
}

/**
 * Écran GÉNÉRIQUE à N champs texte libre (1 à 2) pour `6gen31` — même patron que
 * `EtapeChampsProbabilitesEnsembles.tsx` (6gen30), copié plutôt qu'importé (chaque générateur garde
 * sa propre pile de présentation, CLAUDE.md). Structure d'écran imposée par CLAUDE.md (consigne
 * générale → bloc données → bloc "état actuel" → bloc de travail) conservée à l'identique. Sert
 * INDIFFÉREMMENT un champ numérique (la plupart des écrans) ou un champ "équation" texte libre
 * (`cEcran1` de la famille C) — le `diagnostiquer`/`onValider` fournis par l'appelant savent déjà
 * quoi faire de chaque valeur, ce composant reste agnostique du contenu. `App6gen31.tsx` doit le
 * rendre avec `key={phase}` (remet les champs à vide à chaque écran). */
/** Candidat à l'aperçu LaTeX en direct (`ApercuExpressionLatex`) : le placeholder montre un calcul
 * (fraction, opérateur, formule/équation) — jamais une simple valeur numérique isolée (la grande
 * majorité des champs de ce générateur attendent une probabilité déjà réduite à un nombre). */
function champComporteCalcul(placeholder: string | undefined): boolean {
  if (!placeholder) return false;
  const corps = placeholder.replace(/^ex\s*:\s*/i, "").trim();
  if (corps === "" || /^[a-zA-Z]$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*\([^)]*\))?$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*,\s*-?\d+([.,]\d+)?)+$/.test(corps)) return false;
  return true;
}

export function EtapeChampsTiragesArbres({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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
      {champs.map((champ, i) => (champComporteCalcul(champ.placeholder) ? <ApercuExpressionLatex key={i} texte={valeurs[i]} label={champ.label} /> : null))}
      <div className={`field-row ${champs.length > 3 ? "field-row-wrap" : ""}`}>
        {champs.map((champ, i) => (
          <div className={champs.length > 1 ? "field field-inline" : "field"} key={i}>
            <label className="field-label field-label-minuscule">{champ.label}</label>
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
          </div>
        ))}
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
