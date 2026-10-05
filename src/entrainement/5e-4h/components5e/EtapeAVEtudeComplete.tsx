import { useState } from "react";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelEtudeComplete } from "./EtatActuelEtudeComplete";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ReponseAV } from "../moteur5e/sessionEtudeComplete";

interface Props {
  exercice: ExerciceEtudeCompletePipeline;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseAV) => void;
  diagnostiquer?: (textes: string[]) => StatutVerification;
}

/** Écran "av" — gate "Pas de AV"/"Au moins une AV" (`.options-grid` + `.btn.toggle-active`, même
 * patron que `EtapeCEDomaineDefinition.tsx`) puis, si "Au moins une AV", liste add-as-needed des
 * équations (une valeur numérique par ligne, jamais les points vides — simplifiés). */
export function EtapeAVEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [auMoinsUneAV, setAuMoinsUneAV] = useState<boolean | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const afficheFormulaire = auMoinsUneAV === true;
  const complet = auMoinsUneAV === false || (auMoinsUneAV === true && valeurs.length > 0 && valeurs.every((v) => v.trim() !== ""));

  function ajouter() {
    setValeurs((arr) => [...arr, ""]);
  }
  function retirer(i: number) {
    setValeurs((arr) => arr.filter((_, j) => j !== i));
  }
  function modifier(i: number, v: string) {
    setValeurs((arr) => arr.map((x, j) => (j === i ? v : x)));
  }
  function reponseActuelle(): ReponseAV {
    return auMoinsUneAV === false ? { aucuneAV: true } : { aucuneAV: false, textes: valeurs };
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(auMoinsUneAV === false ? [] : valeurs));
    onValider(reponseActuelle());
  }

  const erronee = montrerErreurs && !!diagnostiquer && complet && diagnostiquer(auMoinsUneAV === false ? [] : valeurs) !== "correct";

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDE_COMPLETE}</p>
      <BlocDonneesEtudeComplete exercice={exercice} />
      <EtatActuelEtudeComplete exercice={exercice} phase="av" />
      <p className="prompt-text">{consignePhase(exercice, "av")}</p>
      <div className="options-grid">
        <button type="button" className={auMoinsUneAV === false ? "btn toggle-active" : "btn"} onClick={() => setAuMoinsUneAV(false)}>
          Pas de AV
        </button>
        <button type="button" className={auMoinsUneAV === true ? "btn toggle-active" : "btn"} onClick={() => setAuMoinsUneAV(true)}>
          Au moins une AV
        </button>
      </div>
      {afficheFormulaire && (
        <div className="contenu-conditionnel">
          {valeurs.map((v, i) => (
            <div key={i} className="field-row">
              <p className="field-label field-label-minuscule">AV≡</p>
              <input
                type="text"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                value={v}
                onChange={(e) => modifier(i, e.target.value)}
                placeholder="ex : x=3"
              />
              {valeurs.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirer(i)}>
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn" onClick={ajouter}>
            + Ajouter une AV
          </button>
        </div>
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
          <p>{texteAideNiveau1(exercice, "av")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "av")} block />}
        </div>
      )}
    </div>
  );
}
