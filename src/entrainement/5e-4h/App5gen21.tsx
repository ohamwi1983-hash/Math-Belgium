import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceAsymptoteOblique } from "./generateurs5e/asymptoteOblique";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionAsymptoteOblique,
  niveauAideMaxAsymptoteOblique,
  soumettreReponseCalculerCoefficientA,
  soumettreReponseCalculerCoefficientB,
  soumettreReponseConclureEquationAsymptote,
  soumettreReponseDiviserEuclidienne,
  soumettreReponseEcrireFormeDeveloppee,
} from "./moteur5e/sessionAsymptoteOblique";
import type { ReponseDiviserEuclidienne } from "./moteur5e/sessionAsymptoteOblique";
import type { EtatSessionAsymptoteOblique, PhaseAsymptoteOblique } from "./moteur5e/typesAsymptoteOblique";
import { diagnostiquerFormeDeveloppee, diagnostiquerNombre, diagnostiquerQuotient } from "./moteur5e/verificationAsymptoteOblique";
import type { ExerciceAsymptoteOblique } from "./core5e/asymptoteOblique.types";
import { EtapeChampLibreAsymptote } from "./components5e/EtapeChampLibreAsymptote";
import { EtapeDiviserEuclidienne } from "./components5e/EtapeDiviserEuclidienne";
import { Katex } from "./components/Katex";
import { formatReponseAttenduePhaseLatex } from "./ui5e/formatAsymptoteOblique";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionAsymptoteOblique {
  return demarrerSessionAsymptoteOblique(REGLAGES_DEMO, genererExerciceAsymptoteOblique);
}

function reponseAttendueAsymptoteOblique(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique) {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionAsymptoteOblique;
  revele: boolean;
}

export function App5gen21() {
  const [etat, setEtat] = useState<EtatSessionAsymptoteOblique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionAsymptoteOblique) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionAsymptoteOblique(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueAsymptoteOblique(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Asymptote oblique</h1>
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EcranCourant
            exercice={exercice}
            phase={phase}
            etat={etat}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            cleEcran={cleEcran}
            terminerEtape={terminerEtape}
            setEtat={setEtat}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceAsymptoteOblique;
  phase: PhaseAsymptoteOblique;
  etat: EtatSessionAsymptoteOblique;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionAsymptoteOblique) => void;
  setEtat: (etat: EtatSessionAsymptoteOblique) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxAsymptoteOblique();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  const { a, b, c, coeffsD } = exercice;

  switch (phase) {
    case "diviserEuclidienne":
      return (
        <EtapeDiviserEuclidienne
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseDiviserEuclidienne(etat, reponse))}
          diagnostiquer={(r: ReponseDiviserEuclidienne) => ({
            quotient: diagnostiquerQuotient(r.quotient, a, b),
            reste: diagnostiquerNombre(r.reste, c),
          })}
          validation={validation}
        />
      );

    case "ecrireFormeDeveloppee":
      return (
        <EtapeChampLibreAsymptote
          key={cleEcran}
          exercice={exercice}
          phase="ecrireFormeDeveloppee"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseEcrireFormeDeveloppee(etat, texte))}
          placeholder="ex : 2x-3+5/(x-1)"
          diagnostiquer={(t) => diagnostiquerFormeDeveloppee(t, a, b, c, coeffsD)}
          validation={validation}
        />
      );

    case "calculerCoefficientA":
      return (
        <EtapeChampLibreAsymptote
          key={cleEcran}
          exercice={exercice}
          phase="calculerCoefficientA"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerCoefficientA(etat, texte))}
          placeholder="ex : 2"
          diagnostiquer={(t) => diagnostiquerNombre(t, a)}
          validation={validation}
        />
      );

    case "calculerCoefficientB":
      return (
        <EtapeChampLibreAsymptote
          key={cleEcran}
          exercice={exercice}
          phase="calculerCoefficientB"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerCoefficientB(etat, texte))}
          placeholder="ex : -3"
          diagnostiquer={(t) => diagnostiquerNombre(t, b)}
          validation={validation}
        />
      );

    case "conclureEquationAsymptote":
      return (
        <EtapeChampLibreAsymptote
          key={cleEcran}
          exercice={exercice}
          phase="conclureEquationAsymptote"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseConclureEquationAsymptote(etat, texte))}
          placeholder="ex : 2x-3"
          diagnostiquer={(t) => diagnostiquerQuotient(t, a, b)}
          validation={validation}
        />
      );
  }
}
