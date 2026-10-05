import { useState } from "react";
import type { ExerciceSuiteGeometrique } from "../core5e/suitesGeometriques.types";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteGeometrique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteGeometrique } from "./EtatActuelSuiteGeometrique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceSuiteGeometrique;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Statut à 3 valeurs calculé côté PRÉSENTATION uniquement — optionnel. */
  diagnostiquer?: (valeurs: string[]) => StatutVerification;
  /** Diagnostic INDÉPENDANT par champ, index par index (A.2, surlignage rouge) — chaque valeur de
   * q saisie est comparée à l'ENSEMBLE des q cibles (1 ou 2 branches, interchangeables). */
  diagnostiquerChamp?: (index: number, valeur: string) => StatutVerification;
}

const MAX_VALEURS = 2;

/** Écran "trouverQ" — add-as-needed borné à 2 valeurs (`statutQ` ne vaut plus jamais que "unique"
 * ou "double" — voir `core5e/suitesGeometriques.types.ts`, `StatutQ="aucune"` est devenu
 * mathématiquement impossible sous la nouvelle construction et le bouton "aucune solution" a été
 * retiré : il n'aurait plus jamais pu être la bonne réponse, un mode qui n'était plus qu'un piège
 * dégénéré plutôt qu'un vrai cas pédagogique). */
export function EtapeTrouverQ({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, diagnostiquerChamp }: Props) {
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const aide2 = texteAideNiveau2(exercice, "trouverQ");

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function ajouter() {
    if (valeurs.length < MAX_VALEURS) setValeurs((arr) => [...arr, ""]);
  }
  function retirer(i: number) {
    setValeurs((arr) => arr.filter((_, j) => j !== i));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(valeurs));
    onValider(valeurs);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteGeometrique exercice={exercice} phase="trouverQ" />
      <p className="prompt-text">{consignePhase(exercice, "trouverQ")}</p>

      {valeurs.map((v, i) => {
        const champErronee = apresEchec && !!diagnostiquerChamp && diagnostiquerChamp(i, v) !== "correct";
        return (
          <div key={i} className="field field-inline">
            <label className="field-label field-label-minuscule">
              <Katex expression={valeurs.length > 1 ? `q_{${i + 1}} =` : "q ="} />
            </label>
            <input type="text" className={`text-input${champErronee ? " is-erronee" : ""}`} value={v} onChange={(e) => modifier(i, e.target.value)} />
            {valeurs.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirer(i)}>
                ×
              </button>
            )}
          </div>
        );
      })}
      {valeurs.length < MAX_VALEURS && (
        <button type="button" className="btn" onClick={ajouter}>
          + Ajouter une autre valeur
        </button>
      )}

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
          <Katex expression={texteAideNiveau1(exercice, "trouverQ")} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}
