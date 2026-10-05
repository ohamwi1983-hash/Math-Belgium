import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLectureGraphiqueLimites } from "./generateurs5e/lectureGraphiqueLimites";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  demarrerSessionLectureGraphiqueLimites,
  soumettreReponseCompleterLimites,
  soumettreReponseNommerAsymptotes,
} from "./moteur5e/sessionLectureGraphiqueLimites";
import { listeAsymptotes, listeComportements } from "./moteur5e/typesLectureGraphiqueLimites";
import type {
  EtatSessionLectureGraphiqueLimites,
  PhaseLectureGraphiqueLimites,
  ResultatExerciceLectureGraphiqueLimites,
} from "./moteur5e/typesLectureGraphiqueLimites";
import { diagnostiquerCibleAsymptote, diagnostiquerCibleComportement } from "./moteur5e/verificationLectureGraphiqueLimites";
import type { ExerciceLectureGraphiqueLimites } from "./core5e/lectureGraphiqueLimites.types";
import { EtapeComportementsLimites } from "./components5e/EtapeComportementsLimites";
import { EtapeEquationsAsymptotes } from "./components5e/EtapeEquationsAsymptotes";
import { ResultatPanelLectureGraphiqueLimites } from "./components5e/ResultatPanelLectureGraphiqueLimites";
import { ResumeSessionLectureGraphiqueLimites } from "./components5e/ResumeSessionLectureGraphiqueLimites";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLectureGraphiqueLimites {
  return demarrerSessionLectureGraphiqueLimites(REGLAGES_DEMO, genererExerciceLectureGraphiqueLimites);
}

interface Bilan {
  resultat: ResultatExerciceLectureGraphiqueLimites;
  reveleParPhase: Partial<Record<PhaseLectureGraphiqueLimites, boolean>>;
}

export function App5gen22() {
  const [etat, setEtat] = useState<EtatSessionLectureGraphiqueLimites>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [reveleParPhase, setReveleParPhase] = useState<Partial<Record<PhaseLectureGraphiqueLimites, boolean>>>({});

  function terminerEtape(nouvelEtat: EtatSessionLectureGraphiqueLimites) {
    const miseAJour = { ...reveleParPhase, [etat.phase]: nouvelEtat.derniereEtapeRevelee };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], reveleParPhase: miseAJour });
      setReveleParPhase({});
    } else {
      setReveleParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Limites et asymptotes — lecture graphique</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionLectureGraphiqueLimites(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <EcranCourant
              exercice={exercice}
              phase={phase}
              etat={etat}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              cleEcran={cleEcran}
              terminerEtape={terminerEtape}
            />
          )}
          {dernierBilan && (
            <ResultatPanelLectureGraphiqueLimites
              resultat={dernierBilan.resultat}
              reveleParPhase={dernierBilan.reveleParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionLectureGraphiqueLimites resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceLectureGraphiqueLimites;
  phase: PhaseLectureGraphiqueLimites;
  etat: EtatSessionLectureGraphiqueLimites;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionLectureGraphiqueLimites) => void;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape }: EcranProps) {
  switch (phase) {
    case "completerLimites": {
      const slots = listeComportements(exercice);
      return (
        <EtapeComportementsLimites
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          onValider={(textes) => terminerEtape(soumettreReponseCompleterLimites(etat, textes))}
          diagnostiquer={(textes) => textes.map((t, i) => diagnostiquerCibleComportement(t, slots[i].cible))}
        />
      );
    }

    case "nommerAsymptotes": {
      const slots = listeAsymptotes(exercice);
      return (
        <EtapeEquationsAsymptotes
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          onValider={(textes) => terminerEtape(soumettreReponseNommerAsymptotes(etat, textes))}
          diagnostiquer={(textes) => textes.map((t, i) => diagnostiquerCibleAsymptote(t, slots[i].cible))}
        />
      );
    }
  }
}
