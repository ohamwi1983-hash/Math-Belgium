import { useState } from "react";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelEtudeComplete } from "./EtatActuelEtudeComplete";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceEtudeCompletePipeline;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer?: (valeurs: string[]) => StatutVerification;
}

/** Écran "domaine" — liste add-as-needed d'UNE valeur numérique par ligne (jamais de champs fixes),
 * même patron que `EtapeListerIntervalles.tsx`/5gen9. Seul écran restant utilisant ce composant
 * depuis la refonte `prompt5gen24refontecomplete.md` (l'ancien écran "classification" est remplacé
 * par `EtapeAVEtudeComplete.tsx`, avec son propre gate "Pas de AV"/"Au moins une AV"). */
export function EtapeListeNombresEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.length > 0 && valeurs.every((v) => v.trim() !== "");

  function ajouter() {
    setValeurs((arr) => [...arr, ""]);
  }
  function retirer(i: number) {
    setValeurs((arr) => arr.filter((_, j) => j !== i));
  }
  function modifier(i: number, v: string) {
    setValeurs((arr) => arr.map((x, j) => (j === i ? v : x)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(valeurs));
    onValider(valeurs);
  }

  const erronee = montrerErreurs && !!diagnostiquer && complet && diagnostiquer(valeurs) !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDE_COMPLETE}</p>
      <BlocDonneesEtudeComplete exercice={exercice} />
      <EtatActuelEtudeComplete exercice={exercice} phase="domaine" />
      <p className="prompt-text">{consignePhase(exercice, "domaine")}</p>
      {valeurs.map((v, i) => (
        <div key={i} className="field-row">
          <p className="field-label field-label-minuscule">x≠</p>
          <input type="text" className={`text-input${erronee ? " is-erronee" : ""}`} value={v} onChange={(e) => modifier(i, e.target.value)} placeholder="valeur exclue" />
          {valeurs.length > 1 && (
            <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirer(i)}>
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn" onClick={ajouter}>
        + Ajouter une valeur exclue
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
          <p>{texteAideNiveau1(exercice, "domaine")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "domaine")} block />}
        </div>
      )}
    </div>
  );
}
