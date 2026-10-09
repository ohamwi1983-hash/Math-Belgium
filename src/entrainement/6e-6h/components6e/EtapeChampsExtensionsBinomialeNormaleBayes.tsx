import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef } from "../ui6e/formatExtensionsBinomialeNormaleBayes";
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
 * Écran GÉNÉRIQUE à N champs (texte libre ET/OU choix) pour `6gen52` — mirroir
 * `EtapeChampsDenombrementFondamental.tsx` (6gen43)/`EtapeChampsLoiNormale.tsx` (6gen51) :
 * `champ.type==="choix"` rend des boutons `.btn.toggle-active` (jamais `.btn-primary`, réservé à
 * "Valider"), utilisé pour les écrans de choix (famille B "stratégie", famille C "transformation").
 * `champs: ChampDef[]` (`ui6e/formatExtensionsBinomialeNormaleBayes.ts`) pilote entièrement le
 * rendu — AUCUN JSX par famille/écran dans ce composant. Structure d'écran imposée par CLAUDE.md
 * (consigne générale → bloc données → état actuel → bloc de travail) conservée à l'identique.
 * `App6gen52.tsx` doit le rendre avec `key={`${generationId}-${phase}`}` (jamais `phase` seul — voir
 * `typesExtensionsBinomialeNormaleBayes.ts`, `generationId`, famille B nombre de champs variable).
 *
 * **`.field` empilé, JAMAIS `.field-inline`, pour tout champ à label descriptif** (leçon 6gen44,
 * reconfirmée à chaque générateur depuis — CLAUDE.md) : contrairement à `EtapeChampsDenombrement
 * Fondamental.tsx`/`EtapeChampsLoiNormale.tsx` (qui utilisent `.field-inline` dès que `champs.length
 * > 1`), ce composant reste TOUJOURS en `.field` empilé, quel que soit le nombre de champs — les
 * labels de ce générateur (ex. "Choix chiffre fixé =" n'existe pas ici, mais "Stratégie :"/
 * "Transformation :"/"P(critère ∩ cat. 1) =") sont TOUS des labels descriptifs, jamais des `x=`
 * courts, donc `.field-inline` forcerait `white-space:nowrap` et déborderait sur mobile.
 */
/** Candidat à l'aperçu LaTeX en direct (`ApercuExpressionLatex`) : le placeholder montre un calcul
 * (fraction, opérateur, formule) — jamais une simple valeur numérique isolée (la grande majorité des
 * champs de ce générateur attendent une probabilité déjà réduite à un nombre). */
function champComporteCalcul(placeholder: string | undefined): boolean {
  if (!placeholder) return false;
  const corps = placeholder.replace(/^ex\s*:\s*/i, "").trim();
  if (corps === "" || /^[a-zA-Z]$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*\([^)]*\))?$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*,\s*-?\d+([.,]\d+)?)+$/.test(corps)) return false;
  return true;
}

export function EtapeChampsExtensionsBinomialeNormaleBayes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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
      <div className="field-row field-row-wrap">
        {champs.map((champ, i) =>
          champ.type === "choix" ? (
            <div className="field" key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <div className="options-grid">
                {(champ.options ?? []).map((option) => (
                  <button key={option.valeur} type="button" className={`btn ${valeurs[i] === option.valeur ? "toggle-active" : ""} ${montrerErreurs && valeurs[i] === option.valeur ? "is-erronee" : ""}`} onClick={() => changer(i, option.valeur)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="field" key={i}>
              <label className="field-label field-label-minuscule">{champ.label}</label>
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
            </div>
          ),
        )}
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
        <div className="aide-5e contenu-conditionnel">
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
