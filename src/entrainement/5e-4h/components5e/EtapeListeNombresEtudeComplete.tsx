import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesEtude, cibleEtude, refusSaisieEtude } from "../ui5e/retoursEtudeComplete";
import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { CONSIGNE_GENERALE_ETUDE_COMPLETE, consignePhase } from "../ui5e/formatEtudeComplete";
import { BlocDonneesEtudeComplete } from "./BlocDonneesEtudeComplete";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEtudeCompletePipeline;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer?: (valeurs: string[]) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "domaine" — liste add-as-needed d'UNE valeur numérique par ligne (jamais de champs fixes),
 * même patron que `EtapeListerIntervalles.tsx`/5gen9. Seul écran restant utilisant ce composant
 * depuis la refonte `prompt5gen24refontecomplete.md` (l'ancien écran "classification" est remplacé
 * par `EtapeAVEtudeComplete.tsx`, avec son propre gate "Pas de AV"/"Au moins une AV"). */
export function EtapeListeNombresEtudeComplete({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [refusAffiche, setRefusAffiche] = useState<string | null>(null);
  const [saisieSoumise, setSaisieSoumise] = useState<string[] | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const [, setDernierStatut] = useState<StatutVerification | null>(null);
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
    const refus = refusSaisieEtude(exercice, "domaine", valeurs);
    setRefusAffiche(refus);
    if (refus) return;
    setSaisieSoumise(valeurs);
    if (diagnostiquer) setDernierStatut(diagnostiquer(valeurs));
    onValider(valeurs);
  }

  const erronee = montrerErreurs && !!diagnostiquer && complet && diagnostiquer(valeurs) !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_ETUDE_COMPLETE}
        blocDonnees={<BlocDonneesEtudeComplete exercice={exercice} />}
      />
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
      <PiedEcranFonctions
        aides={aidesEtude(exercice, "domaine")}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={refusAffiche !== null}
        texteIllisible={refusAffiche ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={saisieSoumise && tentativesUtilisees > 0 ? cibleEtude(exercice, "domaine", saisieSoumise) : null}
        validation={validation}
      />
    </div>
  );
}
