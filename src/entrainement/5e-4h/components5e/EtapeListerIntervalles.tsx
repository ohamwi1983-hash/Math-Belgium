import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import { consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { Katex } from "../components/Katex";
import { BlocDonneesModelisation } from "./BlocDonneesModelisation";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelModelisation } from "./EtatActuelModelisation";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceModelisationSinusoide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (paires: [string, string][]) => void;
  /** Statut à 3 valeurs (correct/not_equivalent/parse_error), même motif que 5gen2 (A.1) — voir
   * `EtapeChampSimpleModelisation.tsx` pour la documentation complète. */
  diagnostiquer?: (paires: [string, string][]) => StatutVerification;
}

/** Écran "listerIntervallesInequation" — add-as-needed de PAIRES (borne inf/borne sup), ordre
 * indifférent (équivalence d'ensembles côté vérification). */
export function EtapeListerIntervalles({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [paires, setPaires] = useState<[string, string][]>([["", ""]]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = paires.length > 0 && paires.every(([inf, sup]) => inf.trim() !== "" && sup.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  /** Les paires forment UNE seule réponse (l'ensemble d'intervalles, équivalence d'ensembles côté
   * vérification), jamais des champs indépendants — même flag partagé par toute la liste que
   * "pointsErronee" dans `EnsembleReelGuideBuilder.tsx` (A.2). */
  const pairesErronee = apresEchec && !!diagnostiquer && complet && diagnostiquer(paires) !== "correct";

  function ajouterPaire() {
    setPaires((arr) => [...arr, ["", ""]]);
  }
  function retirerPaire(i: number) {
    setPaires((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierBorne(i: number, cote: 0 | 1, valeur: string) {
    setPaires((arr) => arr.map((p, j) => (j === i ? ([cote === 0 ? valeur : p[0], cote === 1 ? valeur : p[1]] as [string, string]) : p)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(paires));
    onValider(paires);
  }

  return (
    <div>
      <BlocDonneesModelisation exercice={exercice} />
      <EtatActuelModelisation exercice={exercice} phase="listerIntervallesInequation" />
      <p className="prompt-text">{consignePhase(exercice, "listerIntervallesInequation")}</p>
      {paires.map(([inf, sup], i) => (
        <div key={i} className="field-row">
          <input
            type="text"
            className={`text-input${pairesErronee ? " is-erronee" : ""}`}
            value={inf}
            onChange={(e) => modifierBorne(i, 0, e.target.value)}
            placeholder="borne inf"
          />
          <input
            type="text"
            className={`text-input${pairesErronee ? " is-erronee" : ""}`}
            value={sup}
            onChange={(e) => modifierBorne(i, 1, e.target.value)}
            placeholder="borne sup"
          />
          {paires.length > 1 && (
            <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerPaire(i)}>
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn" onClick={ajouterPaire}>
        + Ajouter un intervalle
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
          <p>{texteAideNiveau1(exercice, "listerIntervallesInequation")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "listerIntervallesInequation")} block />}
        </div>
      )}
    </div>
  );
}
