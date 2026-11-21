import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesEtude, cibleEtude, refusSaisieEtude } from "../ui5e/retoursEtudeComplete";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase } from "../ui5e/formatEtudeComplete";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ReponseAV } from "../moteur5e/sessionEtudeComplete";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEtudeCompletePipeline;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseAV) => void;
  diagnostiquer?: (textes: string[]) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "av" — gate "Pas de AV"/"Au moins une AV" (`.options-grid` + `.btn.toggle-active`, même
 * patron que `EtapeCEDomaineDefinition.tsx`) puis, si "Au moins une AV", liste add-as-needed des
 * équations (une valeur numérique par ligne, jamais les points vides — simplifiés). */
export function EtapeAVEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [refusAffiche, setRefusAffiche] = useState<string | null>(null);
  const [saisieSoumise, setSaisieSoumise] = useState<string[] | null>(null);
  const [auMoinsUneAV, setAuMoinsUneAV] = useState<boolean | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const [, setDernierStatut] = useState<StatutVerification | null>(null);
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
    const refus = refusSaisieEtude(exercice, "av", (auMoinsUneAV === false ? [] : valeurs));
    setRefusAffiche(refus);
    if (refus) return;
    setSaisieSoumise((auMoinsUneAV === false ? [] : valeurs));
    if (diagnostiquer) setDernierStatut(diagnostiquer(auMoinsUneAV === false ? [] : valeurs));
    onValider(reponseActuelle());
  }

  const erronee = montrerErreurs && !!diagnostiquer && complet && diagnostiquer(auMoinsUneAV === false ? [] : valeurs) !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ETUDE_COMPLETE}
        blocDonnees={<BlocDonneesEtudeComplete exercice={exercice} />}
      />
      <p className="prompt-text">{consignePhase(exercice, "av")}</p>
      <div className="options-grid">
        <button type="button" className={auMoinsUneAV === false ? "btn toggle-active" : "btn"} onClick={() => setAuMoinsUneAV(false)}>
          Aucune AV
        </button>
        <button type="button" className={auMoinsUneAV === true ? "btn toggle-active" : "btn"} onClick={() => setAuMoinsUneAV(true)}>
          Au moins une AV
        </button>
      </div>
      {afficheFormulaire && (
        <div className="contenu-conditionnel">
          {valeurs.map((v, i) => (
            <div key={i} className="field-row">
              <p className="field-label field-label-minuscule">AV :</p>
              <input
                type="text"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                value={v}
                onChange={(e) => modifier(i, e.target.value)}
                placeholder="ex : x=11"
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
      <PiedEcranFonctions
        aides={aidesEtude(exercice, "av")}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={refusAffiche !== null}
        texteIllisible={refusAffiche ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={saisieSoumise && tentativesUtilisees > 0 ? cibleEtude(exercice, "av", saisieSoumise) : null}
        validation={validation}
      />
    </div>
  );
}
