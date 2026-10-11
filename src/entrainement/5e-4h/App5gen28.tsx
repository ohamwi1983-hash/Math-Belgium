import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { ExerciceTangenteDoubleTangence, ExerciceTangenteHorizontale, ExerciceTangentePointDonne } from "./core5e/tangentes.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangente } from "./generateurs5e/tangentes/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { formatReponseAttenduePhaseLatex, labelTangenteEquiv } from "./ui5e/formatTangentes";
import {
  activerAideSuivante,
  demarrerSessionTangentes,
  niveauAideMaxTangentes,
  soumettreReponseCoordonnees,
  soumettreReponseResoudre,
  soumettreReponseSubstituer,
  soumettreReponseTangenteEnP,
  soumettreReponseTangentePointDonne,
  soumettreReponseTrouverQ,
  soumettreReponseVerifierPente,
} from "./moteur5e/sessionTangentes";
import type { EcranTangente, EtatSessionTangente } from "./moteur5e/typesTangentes";
import {
  diagnostiquerCoordonneeChamp,
  diagnostiquerEquationTangentePointDonne,
  diagnostiquerEquationTangenteP,
  diagnostiquerFAPointDonne,
  diagnostiquerFPrimeAPointDonne,
  diagnostiquerFPrimeP,
  diagnostiquerFPrimeQ,
  diagnostiquerQ,
  diagnostiquerRacineChamp,
} from "./moteur5e/verificationTangentes";
import { EtapeSubstituerTangente } from "./components5e/EtapeSubstituerTangente";
import { EtapeChampUniqueTangente } from "./components5e/EtapeChampUniqueTangente";
import { EtapeRacinesTangente } from "./components5e/EtapeRacinesTangente";
import { EtapeCoordonneesTangente } from "./components5e/EtapeCoordonneesTangente";
import { EtapeTangenteEnP } from "./components5e/EtapeTangenteEnP";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionTangente {
  return demarrerSessionTangentes(REGLAGES_DEMO, genererExerciceTangente);
}

function reponseAttendueTangentes(exercice: EtatSessionTangente["exerciceCourant"], phase: EcranTangente) {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionTangente;
  revele: boolean;
}

export function App5gen28() {
  const [etat, setEtat] = useState<EtatSessionTangente>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionTangente) {
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
    setEtat(demarrerSessionTangentes(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueTangentes(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Tangentes</h1>
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <EcranCourant
            exercice={exercice}
            phase={etat.phase}
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
  exercice: EtatSessionTangente["exerciceCourant"];
  phase: EcranTangente;
  etat: EtatSessionTangente;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionTangente) => void;
  setEtat: (etat: EtatSessionTangente) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxTangentes();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "substituer": {
      const ex = exercice as ExerciceTangentePointDonne;
      return (
        <EtapeSubstituerTangente
          key={cleEcran}
          exercice={ex}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseSubstituer(etat, reponse))}
          diagnostiquer={(r) => ({ fA: diagnostiquerFAPointDonne(r.fA, ex), fPrimeA: diagnostiquerFPrimeAPointDonne(r.fPrimeA, ex) })}
          validation={validation}
        />
      );
    }

    case "tangente": {
      const ex = exercice as ExerciceTangentePointDonne;
      return (
        <EtapeChampUniqueTangente
          key={cleEcran}
          exercice={ex}
          phase="tangente"
          labelChamp={labelTangenteEquiv(ex.a)}
          placeholder="ex : y=4*x-3"
          avecCalculatrice={false}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseTangentePointDonne(etat, texte))}
          diagnostiquer={(t) => diagnostiquerEquationTangentePointDonne(t, ex)}
          validation={validation}
        />
      );
    }

    case "resoudre": {
      const ex = exercice as ExerciceTangenteHorizontale;
      return (
        <EtapeRacinesTangente
          key={cleEcran}
          exercice={ex}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseResoudre(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerRacineChamp(t, ex)}
          validation={validation}
        />
      );
    }

    case "coordonnees": {
      const ex = exercice as ExerciceTangenteHorizontale;
      return (
        <EtapeCoordonneesTangente
          key={cleEcran}
          exercice={ex}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseCoordonnees(etat, reponses))}
          diagnostiquer={(point) => diagnostiquerCoordonneeChamp(point, ex)}
          validation={validation}
        />
      );
    }

    case "tangenteEnP": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return (
        <EtapeTangenteEnP
          key={cleEcran}
          exercice={ex}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTangenteEnP(etat, reponse))}
          diagnostiquer={(r) => ({ fPrimeP: diagnostiquerFPrimeP(r.fPrimeP, ex), tangente: diagnostiquerEquationTangenteP(r.tangente, ex) })}
          validation={validation}
        />
      );
    }

    case "trouverQ": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return (
        <EtapeChampUniqueTangente
          key={cleEcran}
          exercice={ex}
          phase="trouverQ"
          labelChamp="q="
          placeholder="ex : 2"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseTrouverQ(etat, texte))}
          diagnostiquer={(t) => diagnostiquerQ(t, ex)}
          validation={validation}
        />
      );
    }

    case "verifierPente": {
      const ex = exercice as ExerciceTangenteDoubleTangence;
      return (
        <EtapeChampUniqueTangente
          key={cleEcran}
          exercice={ex}
          phase="verifierPente"
          labelChamp="f'(q)="
          placeholder="ex : 1"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseVerifierPente(etat, texte))}
          diagnostiquer={(t) => diagnostiquerFPrimeQ(t, ex)}
          validation={validation}
        />
      );
    }
  }
}
