import { useRef, useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDefinitionDerivee } from "./generateurs5e/definitionDerivee/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionDefinitionDerivee,
  niveauAideMaxDefinitionDerivee,
  soumettreReponseDevelopper,
  soumettreReponseLimite,
  soumettreReponseQuotient,
} from "./moteur5e/sessionDefinitionDerivee";
import type { EcranDefinitionDerivee, EtatSessionDefinitionDerivee } from "./moteur5e/typesDefinitionDerivee";
import { ORDRE_COMPLET } from "./moteur5e/typesDefinitionDerivee";
import {
  diagnostiquerDeveloppementH,
  diagnostiquerLimiteDerivee,
  diagnostiquerQuotientH,
  diagnostiquerValeurFA,
} from "./moteur5e/verificationDefinitionDerivee";
import type { ExerciceDefinitionDerivee } from "./core5e/definitionDerivee.types";
import { EtapeChampLibreDerivee } from "./components5e/EtapeChampLibreDerivee";
import { EtapeDevelopperDerivee } from "./components5e/EtapeDevelopperDerivee";
import { formatReponseAttendueEcranLatex, labelLimite, labelQuotient } from "./ui5e/formatDefinitionDerivee";
import { calculerRecapitulatifDefinitionDerivee } from "./ui5e/recapitulatifDefinitionDerivee";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDefinitionDerivee {
  return demarrerSessionDefinitionDerivee(REGLAGES_DEMO, genererExerciceDefinitionDerivee);
}

function reponseAttendueDefinitionDerivee(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee) {
  return (
    <span className="equation-box-termes">
      {formatReponseAttendueEcranLatex(exercice, ecran).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionDefinitionDerivee;
  revele: boolean;
}

/** Ordre d'affichage des puces de progression — séquence FIXE à 3 écrans (`ORDRE_COMPLET`, voir
 * `moteur5e/typesDefinitionDerivee.ts`). */
const ORDRE_PHASES: EcranDefinitionDerivee[] = ORDRE_COMPLET;

/** Même heuristique que `calculerRecapitulatifDefinitionDerivee` (`scoresPartiels[ecran] === 0 ⟺
 * révélée`) — jamais une valeur recalculée séparément. */
function calculerSegmentsProgression(etat: EtatSessionDefinitionDerivee): EtatPuceProgression[] {
  return ORDRE_PHASES.map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen26() {
  const [etat, setEtat] = useState<EtatSessionDefinitionDerivee>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionDefinitionDerivee) {
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
    setEtat(demarrerSessionDefinitionDerivee(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueDefinitionDerivee(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">Calculer f'(a) par la définition</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifDefinitionDerivee(etat)} />
          <EcranCourant
            exercice={exercice}
            phase={phase}
            etat={etat}
            estPremierEcran={estPremierEcran}
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
  exercice: ExerciceDefinitionDerivee;
  phase: EcranDefinitionDerivee;
  etat: EtatSessionDefinitionDerivee;
  estPremierEcran: boolean;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionDefinitionDerivee) => void;
  setEtat: (etat: EtatSessionDefinitionDerivee) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({
  exercice,
  phase,
  etat,
  estPremierEcran,
  tentativesUtilisees,
  tentativesMax,
  cleEcran,
  terminerEtape,
  setEtat,
  validation,
}: EcranProps) {
  const niveauAideMax = niveauAideMaxDefinitionDerivee();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  const a = exercice.a;

  switch (phase) {
    case "developper":
      return (
        <EtapeDevelopperDerivee
          key={cleEcran}
          exercice={exercice}
          estPremierEcran={estPremierEcran}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseDevelopper(etat, reponse))}
          diagnostiquer={(r) => ({ fA: diagnostiquerValeurFA(r.fA, exercice, a), fAH: diagnostiquerDeveloppementH(r.fAH, exercice, a) })}
          validation={validation}
        />
      );

    case "quotient":
      return (
        <EtapeChampLibreDerivee
          key={cleEcran}
          exercice={exercice}
          ecran="quotient"
          labelChamp={labelQuotient(a)}
          placeholder="ex : 2*a+h"
          estPremierEcran={estPremierEcran}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseQuotient(etat, texte))}
          diagnostiquer={(t) => diagnostiquerQuotientH(t, exercice, a)}
          validation={validation}
        />
      );

    case "limite":
      return (
        <EtapeChampLibreDerivee
          key={cleEcran}
          exercice={exercice}
          ecran="limite"
          labelChamp={labelLimite(a)}
          placeholder="ex : 3"
          estPremierEcran={estPremierEcran}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseLimite(etat, texte))}
          diagnostiquer={(t) => diagnostiquerLimiteDerivee(t, exercice, a)}
          validation={validation}
        />
      );
  }
}
