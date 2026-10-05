import { useState } from "react";
import type { ExerciceExtremumsSinusoide } from "../core5e/extremumsSinusoide.types";
import {
  CONSIGNE_GENERALE_EXTREMUMS,
  TEXTE_AIDE_SOLUTIONS_NIVEAU1,
  TEXTE_AIDE_SOLUTIONS_NIVEAU2,
  TEXTE_CONSIGNE_SOLUTIONS,
  formatFonctionSourceLatex,
  formatTermesEtatActuelExtremums,
} from "../ui5e/formatExtremumsSinusoide";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

/** Bloc "état actuel" — accumule ici les 2 valeurs déjà confirmées (l'équation substituée puis x),
 * jamais un remplacement (même principe que "fractionSousRacine", 5gen1). Toujours symbolique
 * (fractions de π), jamais décimal (B.3). */
function EtatActuelExtremums({ exercice }: { exercice: ExerciceExtremumsSinusoide }) {
  const termes = formatTermesEtatActuelExtremums(exercice, "solutions");
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

interface Props {
  exercice: ExerciceExtremumsSinusoide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`
   * (5gen10). */
  diagnostiquer?: (textes: string[]) => StatutVerification;
}

/** Écran 3 (bonus) — lister les positions d'extremum distinctes dans [0;2π[. Add-as-needed, cercle
 * trigonométrique (réutilise `CercleTrigEquationSketch`, 5gen10) ABSENT DU RENDU tant que l'aide 2
 * n'est pas activée (B.3 : gate sur le COMPOSANT entier, jamais seulement sur ses points — un
 * cercle vide restait visible avant ce correctif) — l'aide 2 le fait alors apparaître avec le
 * PREMIER point placé à titre d'exemple seulement. Régime toujours "exact" (5gen11 n'a jamais de
 * régime décimal). */
export function EtapeSolutionsExtremum({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  // A.2 : un seul diagnostic pour l'ensemble des lignes (comparaison d'ENSEMBLE, ordre indifférent
  // — `diagnostiquerSolutionsExtremum` n'isole pas une ligne fautive en particulier), appliqué
  // uniformément à tous les champs de la liste tant que la réponse globale n'est pas correcte.
  const statutActuel = apresEchec && diagnostiquer ? diagnostiquer(lignes) : undefined;
  const ligneErronee = statutActuel !== undefined && statutActuel !== "correct";

  function ajouterLigne() {
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(lignes));
    onValider(lignes);
  }

  const pointsAffiches = niveauAide >= 2 && exercice.solutions.length > 0 ? [exercice.solutions[0]] : [];

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EXTREMUMS}</p>
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatFonctionSourceLatex(exercice)).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <EtatActuelExtremums exercice={exercice} />
      <p className="prompt-text">{TEXTE_CONSIGNE_SOLUTIONS}</p>
      {niveauAide >= 2 && <CercleTrigEquationSketch points={pointsAffiches} regime="exact" />}
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${ligneErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => modifierLigne(i, e.target.value)}
              placeholder="ex : pi/12"
            />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerLigne(i)}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={ajouterLigne}>
        + Ajouter une solution
      </button>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_SOLUTIONS_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_SOLUTIONS_NIVEAU2}</p>}
        </div>
      )}
    </div>
  );
}
