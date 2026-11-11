import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "../ui6e/formatCalculPrimitives";
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
  /** Message d'erreur spécifique (ex. « valeur absolue oubliée »), affiché à la place du message
   * générique quand il s'applique — null sinon. */
  messageSpecifique?: (valeurs: string[]) => string | null;
}

/**
 * Écran GÉNÉRIQUE à N champs texte libre (1 à 3) pour `6gen23` — GÉNÉRALISATION délibérée du
 * patron à arité fixe déjà établi ailleurs sur le chantier (`EtapeChampDeterminerParametres.tsx` 1
 * champ / `EtapeDeuxChampsDeterminerParametres.tsx` 2 champs, 6gen18) : ce générateur compte ~24
 * écrans à travers 7 familles, avec des arités de 1 à 3 selon l'écran — un seul composant paramétré
 * par `champs: ChampDef[]` (voir `ui6e/formatCalculPrimitives.ts`) plutôt que 3 composants
 * quasi-identiques différant seulement par leur nombre de champs. Structure d'écran imposée par
 * CLAUDE.md (consigne générale → bloc données → bloc "état actuel" → bloc de travail) conservée à
 * l'identique. `App6gen23.tsx` doit le rendre avec `key={phase}` (remet les champs à vide à chaque
 * écran).
 */
export function EtapeChampsCalculPrimitives({
  consigneGenerale,
  blocDonnees,
  consigneEcran,
  champs,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  validation,
  messageSpecifique,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(valeurs) : null;
  const messageSpecifiqueActuel = montrerErreurs && dernierStatut !== "correct" && messageSpecifique ? messageSpecifique(valeurs) : null;
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
      {/* Un champ par ligne, libellé au-dessus (audit P12 : `.field-inline` côte à côte débordait de
          60 à 190 px à 390 px de large pour les écrans à 2 ou 3 champs). Chaque aperçu LaTeX reste
          juste au-dessus de SON champ. */}
      {champs.map((champ, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={valeurs[i]} label={champ.label} />
          <div className="field">
            <label className="field-label field-label-minuscule" htmlFor={`champ-primitive-${i}`}>
              {champ.label}
            </label>
            <input id={`champ-primitive-${i}`} type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
          </div>
        </div>
      ))}
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
            {messageSpecifiqueActuel ? `${messageSpecifiqueActuel} (tentative ${tentativesUtilisees}/${tentativesMax})` : formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
