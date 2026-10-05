import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FORMES, construireAvecFormeId, genererExerciceParametresSinusoide } from "./generateurs5e/parametresSinusoide";
import type { ExerciceParametresSinusoide, FormeAffichageSinusoide } from "./core5e/parametresSinusoide.types";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  NIVEAU_AIDE_MAX_SINUSOIDE,
  activerAideSuivante,
  demarrerSessionParametresSinusoide,
  soumettreReponseParametresSinusoide,
} from "./moteur5e/sessionParametresSinusoide";
import type { EtatSessionParametresSinusoide, ResultatExerciceParametresSinusoide } from "./moteur5e/typesParametresSinusoide";
import { EtapeParametreSinusoide } from "./components5e/EtapeParametreSinusoide";
import { ResultatPanelParametresSinusoide } from "./components5e/ResultatPanelParametresSinusoide";
import { ResumeSessionParametresSinusoide } from "./components5e/ResumeSessionParametresSinusoide";
import type { PhaseParametresSinusoide } from "./moteur5e/typesParametresSinusoide";
import {
  cibleAmplitude,
  cibleDecalage,
  cibleDephasage,
  cibleFrequence,
  ciblePeriode,
  diagnostiquerValeurSinusoide,
} from "./moteur5e/verificationParametresSinusoide";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionParametresSinusoide {
  return demarrerSessionParametresSinusoide(REGLAGES_DEMO, genererExerciceParametresSinusoide);
}

/** Réplique le dispatch `cibleActuelle` (privé, `moteur5e/sessionParametresSinusoide.ts`) — même
 * phase→cible que le score, uniquement pour alimenter `diagnostiquerValeurSinusoide` côté A.1
 * (promptcorrectionsregroupees.md), jamais une nouvelle logique de vérification. */
function cibleActuellePourDiagnostic(exercice: ExerciceParametresSinusoide, phase: PhaseParametresSinusoide): number {
  switch (phase) {
    case "amplitude":
      return cibleAmplitude(exercice);
    case "phi":
      return cibleDephasage(exercice);
    case "periode":
      return ciblePeriode(exercice);
    case "frequence":
      return cibleFrequence(exercice);
    case "decalage":
      return cibleDecalage(exercice);
  }
}

type AideParPhase = Partial<Record<PhaseParametresSinusoide, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceParametresSinusoide;
  aideParPhase: AideParPhase;
}

export function App5gen8() {
  const [etat, setEtat] = useState<EtatSessionParametresSinusoide>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionParametresSinusoide) {
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Paramètres d'une fonction sinusoïdale</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FORMES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionParametresSinusoide(REGLAGES_DEMO, () => construireAvecFormeId(id as FormeAffichageSinusoide)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              <EtapeParametreSinusoide
                key={etat.phase}
                exercice={exercice}
                phase={etat.phase}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={etat.niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX_SINUSOIDE}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseParametresSinusoide(etat, texte))}
                diagnostiquer={(texte) => diagnostiquerValeurSinusoide(texte, cibleActuellePourDiagnostic(exercice, etat.phase))}
              />
            </>
          )}
          {dernierBilan && (
            <ResultatPanelParametresSinusoide
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionParametresSinusoide resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
