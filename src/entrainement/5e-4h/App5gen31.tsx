import { useState } from "react";
import type { EnsembleReelGuide } from "./core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudierFonction } from "./generateurs5e/etudierFonction/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  avancerRecap,
  demarrerSessionEtudierFonction,
  niveauAideMaxEtudierFonction,
  niveauAideMaxGraphique,
  soumettreReponseCalculerFPrime,
  soumettreReponseCalculerFSeconde,
  soumettreReponseDomaine,
  soumettreReponseGraphique,
  soumettreReponseLimites,
  soumettreReponseTableauFPrime,
  soumettreReponseTableauFSeconde,
} from "./moteur5e/sessionEtudierFonction";
import type { EcranEtudierFonction, EtatSessionEtudierFonction } from "./moteur5e/typesEtudierFonction";
import { diagnostiquerCalculerFPrime, diagnostiquerCalculerFSeconde, pointsClesEtudierFonction } from "./moteur5e/verificationEtudierFonction";
import { EtapeDomaineEtudierFonction } from "./components5e/EtapeDomaineEtudierFonction";
import { EtapeLimitesEtudierFonction } from "./components5e/EtapeLimitesEtudierFonction";
import { EtapeCalculerDeriveeGenerique } from "./components5e/EtapeCalculerDeriveeGenerique";
import { EtapeTableauEtudierFonction } from "./components5e/EtapeTableauEtudierFonction";
import { EtapeRecapitulatifEtudierFonction } from "./components5e/EtapeRecapitulatifEtudierFonction";
import { PlacementPointsGraphique } from "./components5e/PlacementPointsGraphique";
import { EtudierFonctionGraph } from "./components5e/EtudierFonctionGraph";
import { ResultatPanelEtudierFonction } from "./components5e/ResultatPanelEtudierFonction";
import { ResumeSessionEtudierFonction } from "./components5e/ResumeSessionEtudierFonction";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudierFonction {
  return demarrerSessionEtudierFonction(REGLAGES_DEMO, genererExerciceEtudierFonction);
}

interface Bilan {
  resultat: EtatSessionEtudierFonction["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

export function App5gen31() {
  const [etat, setEtat] = useState<EtatSessionEtudierFonction>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionEtudierFonction) {
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
        <h1 className="app-title">Étudier une fonction</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionEtudierFonction(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
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
            <ResultatPanelEtudierFonction
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionEtudierFonction resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: EtatSessionEtudierFonction["exerciceCourant"];
  phase: EcranEtudierFonction;
  etat: EtatSessionEtudierFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionEtudierFonction) => void;
  setEtat: (etat: EtatSessionEtudierFonction) => void;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
  const niveauAideMax = niveauAideMaxEtudierFonction();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "domaine":
      return (
        <EtapeDomaineEtudierFonction
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse: EnsembleReelGuide) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
        />
      );

    case "limites":
      return (
        <EtapeLimitesEtudierFonction
          key={cleEcran}
          exercice={exercice}
          phase="limites"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseLimites(etat, reponses))}
        />
      );

    case "calculerFPrime":
      return (
        <EtapeCalculerDeriveeGenerique
          key={cleEcran}
          exercice={exercice}
          phase="calculerFPrime"
          labelChamp="f'(x)="
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerFPrime(etat, texte))}
          diagnostiquer={(t) => diagnostiquerCalculerFPrime(t, exercice)}
        />
      );

    case "tableauFPrime":
      return (
        <EtapeTableauEtudierFonction
          key={cleEcran}
          exercice={exercice}
          phase="tableauFPrime"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFPrime(etat, reponse))}
        />
      );

    case "calculerFSeconde":
      return (
        <EtapeCalculerDeriveeGenerique
          key={cleEcran}
          exercice={exercice}
          phase="calculerFSeconde"
          labelChamp="f''(x)="
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseCalculerFSeconde(etat, texte))}
          diagnostiquer={(t) => diagnostiquerCalculerFSeconde(t, exercice)}
        />
      );

    case "tableauFSeconde":
      return (
        <EtapeTableauEtudierFonction
          key={cleEcran}
          exercice={exercice}
          phase="tableauFSeconde"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseTableauFSeconde(etat, reponse))}
        />
      );

    case "recap":
      return <EtapeRecapitulatifEtudierFonction key={cleEcran} exercice={exercice} onContinuer={() => setEtat(avancerRecap(etat))} />;

    case "graphique": {
      const points = pointsClesEtudierFonction(exercice);
      return (
        <div key={cleEcran}>
          <p className="prompt-text">Place chaque point demandé sur le graphique en tapant à l'endroit correspondant.</p>
          <PlacementPointsGraphique
            points={points}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMaxGraphique()}
            onActiverAide={onActiverAide}
            onValider={(resume) => terminerEtape(soumettreReponseGraphique(etat, resume))}
            renderGraphe={({ onTap, propositionsConfirmees, dernierTapRate, zoneAideActive, pointActif }) => (
              <EtudierFonctionGraph
                exercice={exercice}
                onTap={onTap}
                propositionsConfirmees={propositionsConfirmees}
                dernierTapRate={dernierTapRate}
                zoneAide={zoneAideActive && pointActif ? { x: pointActif.x, y: pointActif.y } : null}
              />
            )}
          />
        </div>
      );
    }
  }
}
