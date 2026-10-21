import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneGenerale: string;
  /** Expression logarithmique DEMANDÉE (KaTeX) — rattachée visuellement à la consigne générale
   * (même patron que `expressionLatex` de `EtapeChampCycloSimple.tsx`, 6gen2), affichée AVANT le
   * bloc de données m/n/M/N. */
  expressionLatex: string;
  blocDonnees: string[];
  /** `null` — jamais rendu — quand cet écran ne dépend d'aucun écran précédent (toute première
   * étape d'un exercice) — même convention que `EtapeChampHyperboliques.tsx`. */
  etatActuel: string[] | null;
  consigneEcran: string;
  placeholder: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs de la DERNIÈRE tentative (optionnel) — distingue un message "syntaxe non
   * reconnue" d'un simple "incorrect" (convention CLAUDE.md). */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le champ,
   * remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md, "validation/
   * invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran GÉNÉRIQUE à un seul champ texte libre pour `6gen13` — tous les écrans (étapes algébriques /
 * calcul numérique final) partagent strictement la même structure. Ordre imposé par CLAUDE.md :
 * consigne générale (+ expression logarithmique demandée) → bloc données (m/n/q/c, SANS valeur
 * numérique tant que l'écran est algébrique, voir `blocDonneesEcran`) → bloc de travail. `App6gen13.tsx`
 * doit le rendre avec `key={phase}` (remet le champ à vide à chaque écran).
 */
export function EtapeProprieteLogarithme({
  consigneGenerale,
  expressionLatex,
  blocDonnees,
  etatActuel,
  consigneEcran,
  placeholder,
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
}: Props) {
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs && diagnostiquer ? diagnostiquer(texte) : null;

  function valider() {
    if (texte.trim() === "") return;
    onValider(texte);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGenerale}
        blocDonnees={
          <>
            <div className="equation-box">
              <Katex expression={expressionLatex} />
            </div>
            {blocDonnees.length > 0 && (
              <div className="equation-box">
                <div className="equation-box-donnees">
                  {blocDonnees.map((frag, i) => (
                    <Katex key={i} expression={frag} />
                  ))}
                </div>
              </div>
            )}
          </>
        }
      />
      {etatActuel && (
        <div className="etat-actuel-box">
          {etatActuel.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <input
          type="text"
          className={`text-input ${montrerErreurs ? "is-erronee" : ""}`}
          value={texte}
          placeholder={placeholder}
          onChange={(e) => setTexte(e.target.value)}
          disabled={!!validation}
        />
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
          <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
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
