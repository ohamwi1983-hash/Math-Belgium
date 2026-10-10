import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVitessePosition } from "./generateurs5e/vitessePosition/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionVitessePosition,
  niveauAideMaxVitessePosition,
  soumettreReponseConversion,
  soumettreReponseDerivee,
  soumettreReponseEvaluerV0,
  soumettreReponseResoudre,
  soumettreReponseSegmentConstant,
  soumettreReponseTempsTotal,
  soumettreReponseVitessePointe,
} from "./moteur5e/sessionVitessePosition";
import type { EcranVitessePosition, EtatSessionVitessePosition } from "./moteur5e/typesVitessePosition";
import {
  diagnostiquerConversionKmh,
  diagnostiquerDeriveeVitesse,
  diagnostiquerEvaluerV0,
  diagnostiquerRacineChamp,
  diagnostiquerSegmentConstant,
  diagnostiquerTempsTotal,
  diagnostiquerVitessePointe,
} from "./moteur5e/verificationVitessePosition";
import { EtapeChampVitessePosition } from "./components5e/EtapeChampVitessePosition";
import { EtapeResoudreVitessePosition } from "./components5e/EtapeResoudreVitessePosition";
import { ResultatPanelVitessePosition } from "./components5e/ResultatPanelVitessePosition";
import { ResumeSessionVitessePosition } from "./components5e/ResumeSessionVitessePosition";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionVitessePosition {
  return demarrerSessionVitessePosition(REGLAGES_DEMO, genererExerciceVitessePosition);
}

interface Bilan {
  resultat: EtatSessionVitessePosition["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

export function App5gen35() {
  const [etat, setEtat] = useState<EtatSessionVitessePosition>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionVitessePosition) {
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
        <h1 className="app-title">Vitesse et position</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionVitessePosition(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
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
            <ResultatPanelVitessePosition
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionVitessePosition resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: EtatSessionVitessePosition["exerciceCourant"];
  phase: EcranVitessePosition;
  etat: EtatSessionVitessePosition;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionVitessePosition) => void;
  setEtat: (etat: EtatSessionVitessePosition) => void;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
  const niveauAideMax = niveauAideMaxVitessePosition();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "derivee":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="derivee"
          labelChamp="v(t)="
          placeholder="ex : 2*t+3"
          avecCalculatrice={false}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseDerivee(etat, texte))}
          diagnostiquer={(t) => diagnostiquerDeriveeVitesse(t, exercice)}
        />
      );

    case "evaluerV0":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="evaluerV0"
          labelChamp="v(t₀)="
          placeholder="ex : 7"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseEvaluerV0(etat, texte))}
          diagnostiquer={(t) => diagnostiquerEvaluerV0(t, exercice)}
        />
      );

    case "resoudre":
      return (
        <EtapeResoudreVitessePosition
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseResoudre(etat, reponse))}
          diagnostiquerRacine={(t) => diagnostiquerRacineChamp(t, exercice)}
        />
      );

    case "vitessePointe":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="vitessePointe"
          labelChamp="v="
          placeholder="ex : 13"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseVitessePointe(etat, texte))}
          diagnostiquer={(t) => diagnostiquerVitessePointe(t, exercice)}
        />
      );

    case "conversion":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="conversion"
          labelChamp="v (km/h) ="
          placeholder="ex : 46.8"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseConversion(etat, texte))}
          diagnostiquer={(t) => diagnostiquerConversionKmh(t, exercice)}
        />
      );

    case "segmentConstant":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="segmentConstant"
          labelChamp="t₂ ="
          placeholder="ex : 7.33"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseSegmentConstant(etat, texte))}
          diagnostiquer={(t) => diagnostiquerSegmentConstant(t, exercice)}
        />
      );

    case "tempsTotal":
      return (
        <EtapeChampVitessePosition
          key={cleEcran}
          exercice={exercice}
          ecran="tempsTotal"
          labelChamp="t total ="
          placeholder="ex : 11.33"
          avecCalculatrice={true}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseTempsTotal(etat, texte))}
          diagnostiquer={(t) => diagnostiquerTempsTotal(t, exercice)}
        />
      );
  }
}
