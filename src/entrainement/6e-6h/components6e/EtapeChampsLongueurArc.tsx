import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "../ui6e/formatLongueurArc";
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
 * Écran GÉNÉRIQUE à N champs texte libre (1 à 2) pour `6gen28` — mirroir
 * `EtapeChampsCalculPrimitives.tsx` (6gen23) : tous les écrans de ce générateur sont de la saisie
 * libre (aucun champ "choix"/QCM, contrairement à 6gen26 — voir `ui6e/formatLongueurArc.ts`), donc
 * la version SIMPLE (texte uniquement, jamais le type "choix" de `EtapeChampsCalculAires.tsx`)
 * suffit. `champs: ChampDef[]` (voir `ui6e/formatLongueurArc.ts`) pilote entièrement le rendu.
 * Structure d'écran imposée par CLAUDE.md (consigne générale → bloc données → état actuel → bloc de
 * travail) conservée à l'identique. `App6gen28.tsx` doit le rendre avec `key={phase}`.
 */
/** Candidat à l'aperçu LaTeX en direct (`ApercuExpressionLatex`) : le placeholder montre un calcul
 * (dérivée/primitive, opérateur, formule) — jamais une simple valeur numérique isolée (les champs
 * "L =" de ce générateur attendent une longueur déjà réduite à un nombre décimal). */
function champComporteCalcul(placeholder: string | undefined): boolean {
  if (!placeholder) return false;
  const corps = placeholder.replace(/^ex\s*:\s*/i, "").trim();
  if (corps === "" || /^[a-zA-Z]$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*\([^)]*\))?$/.test(corps)) return false;
  if (/^-?\d+([.,]\d+)?(\s*,\s*-?\d+([.,]\d+)?)+$/.test(corps)) return false;
  return true;
}

export function EtapeChampsLongueurArc({ consigneGenerale, blocDonnees, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
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
      {champs.map((champ, i) => (champComporteCalcul(champ.placeholder) ? <ApercuExpressionLatex key={i} texte={valeurs[i]} label={champ.label} /> : null))}
      <div className="field-row">
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
