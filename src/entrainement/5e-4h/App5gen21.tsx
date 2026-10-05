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
import type { EtatSessionAsymptoteOblique, PhaseAsymptoteOblique, ResultatExerciceAsymptoteOblique } from "./moteur5e/typesAsymptoteOblique";
import { diagnostiquerFormeDeveloppee, diagnostiquerNombre, diagnostiquerQuotient } from "./moteur5e/verificationAsymptoteOblique";
import type { ExerciceAsymptoteOblique } from "./core5e/asymptoteOblique.types";
import { EtapeChampLibreAsymptote } from "./components5e/EtapeChampLibreAsymptote";
import { EtapeDiviserEuclidienne } from "./components5e/EtapeDiviserEuclidienne";
import { ResultatPanelAsymptoteOblique } from "./components5e/ResultatPanelAsymptoteOblique";
import { ResumeSessionAsymptoteOblique } from "./components5e/ResumeSessionAsymptoteOblique";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionAsymptoteOblique {
  return demarrerSessionAsymptoteOblique(REGLAGES_DEMO, genererExerciceAsymptoteOblique);
}

interface Bilan {
  resultat: ResultatExerciceAsymptoteOblique;
  aideParPhase: Partial<Record<PhaseAsymptoteOblique, { niveauAide: number; revele: boolean }>>;
}

export function App5gen21() {
  const [etat, setEtat] = useState<EtatSessionAsymptoteOblique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseAsymptoteOblique, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionAsymptoteOblique) {
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
  const phase = etat.phase;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Asymptote oblique</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setEtat(demarrerSessionAsymptoteOblique(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
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
              setEtat={setEtat}
            />
          )}
          {dernierBilan && (
            <ResultatPanelAsymptoteOblique
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionAsymptoteOblique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
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
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
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
        />
      );
  }
}
