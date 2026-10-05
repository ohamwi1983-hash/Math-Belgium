import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import type { ExerciceTangenteDoubleTangence, ExerciceTangenteHorizontale, ExerciceTangentePointDonne } from "./core5e/tangentes.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangente } from "./generateurs5e/tangentes/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import { labelTangenteEquiv } from "./ui5e/formatTangentes";
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
import { ResultatPanelTangentes } from "./components5e/ResultatPanelTangentes";
import { ResumeSessionTangentes } from "./components5e/ResumeSessionTangentes";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionTangente {
  return demarrerSessionTangentes(REGLAGES_DEMO, genererExerciceTangente);
}

interface Bilan {
  resultat: EtatSessionTangente["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

export function App5gen28() {
  const [etat, setEtat] = useState<EtatSessionTangente>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionTangente) {
    const miseAJour = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereEtapeRevelee } };
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
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Tangentes</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionTangentes(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
        }}
      />
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <EcranCourant
              exercice={exercice}
              phase={etat.phase}
              etat={etat}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              cleEcran={cleEcran}
              terminerEtape={terminerEtape}
              setEtat={setEtat}
            />
          )}
          {dernierBilan && (
            <ResultatPanelTangentes
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionTangentes resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
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
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
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
        />
      );
    }
  }
}
