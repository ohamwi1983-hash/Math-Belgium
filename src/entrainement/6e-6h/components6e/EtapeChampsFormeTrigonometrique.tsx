import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatFormeTrigonometrique";
import { BoutonAide } from "./BoutonAide";

/** Vrai si le placeholder NE représente PAS un simple nombre isolé (entier/décimal, signe
 * optionnel) — distingue un champ toujours réel (ex. "k =", "cos =") d'un champ composé (ex.
 * "θ =", placeholder "pi/3" ; "r =", composé SEULEMENT en famille C, placeholder "sqrt(2)", réel en
 * familles A/B, placeholder "2"). "Résultat =" est TOUJOURS considéré composé même quand
 * l'exemple statique choisi est réel pur (famille E, "ex : -1") — le résultat général reste
 * complexe (cos+isin) — CLAUDE.md, règle de câblage `ApercuExpressionLatex`. */
function champEstCompose(champ: ChampDef): boolean {
  if (champ.label === "Résultat =") return true;
  const valeur = (champ.placeholder ?? "").replace(/^ex\s*:\s*/i, "").trim();
  return valeur !== "" && !/^-?\d+([.,]\d+)?$/.test(valeur);
}

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
 * Écran GÉNÉRIQUE à N champs texte libre (1 à 4) pour `6gen37` — mirroir
 * `EtapeChampsNombresComplexes.tsx` (6gen34) : tous les écrans à SAISIE LIBRE de ce générateur
 * (tous sauf `dEcran2`, un écran de CHOIX — voir `EtapeChoixCongruenceFormeTrigonometrique.tsx`)
 * passent par ce composant. Structure d'écran imposée par CLAUDE.md (consigne générale → bloc
 * données → état actuel → bloc de travail) conservée à l'identique. `App6gen37.tsx` doit le rendre
 * avec `key={phase}`.
 */
export function EtapeChampsFormeTrigonometrique({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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
      {champs.map((champ, i) => champEstCompose(champ) && <ApercuExpressionLatex key={i} texte={valeurs[i]} label={champ.label} />)}
      {/* `field-row-wrap` dès 2 champs INDÉPENDANTS côte à côte (jusqu'à 4 pour la famille B, écran
       * 1, produit/quotient) — même piège/fix déjà documenté CLAUDE.md ("Débordement horizontal"),
       * voir `EtapeChampsNombresComplexes.tsx`. */}
      <div className={`field-row ${champs.length > 1 ? "field-row-wrap" : ""}`}>
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
