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
import { formatReponseAttenduePhaseLatex } from "./ui5e/formatVitessePosition";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionVitessePosition {
  return demarrerSessionVitessePosition(REGLAGES_DEMO, genererExerciceVitessePosition);
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionVitessePosition;
  revele: boolean;
}

export function App5gen35() {
  const [etat, setEtat] = useState<EtatSessionVitessePosition>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionVitessePosition) {
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
    setEtat(demarrerSessionVitessePosition(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, etat.phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Vitesse et position</h1>
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
  exercice: EtatSessionVitessePosition["exerciceCourant"];
  phase: EcranVitessePosition;
  etat: EtatSessionVitessePosition;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionVitessePosition) => void;
  setEtat: (etat: EtatSessionVitessePosition) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
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
          validation={validation}
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
          validation={validation}
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
          validation={validation}
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
          validation={validation}
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
          validation={validation}
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
          validation={validation}
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
          validation={validation}
        />
      );
  }
}
