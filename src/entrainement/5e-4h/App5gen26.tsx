import { useState } from "react";
import type { ReactNode } from "react";
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
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3 };

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

/** Même source que `calculerRecapitulatifDefinitionDerivee` (`revelesPartiels[ecran]`) — jamais
 * une valeur recalculée séparément. */
function calculerSegmentsProgression(
  etat: EtatSessionDefinitionDerivee,
  aideParPhase: Partial<Record<EcranDefinitionDerivee, boolean>>,
): EtatPuceProgression[] {
  return ORDRE_PHASES.map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    if (etat.revelesPartiels[ecran]) return "revele";
    return aideParPhase[ecran] ? "aide" : "correcte";
  });
}

export function App5gen26() {
  const [etat, setEtat] = useState<EtatSessionDefinitionDerivee>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos — tenu ICI, à part de
   * `EtatSessionDefinitionDerivee`, jamais dans le moteur (même principe que `AppAnalyseFonction.tsx`, 4e). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Niveau d'aide RÉELLEMENT utilisé par écran close — capturé ici (présentation), `niveauAide`
   * (moteur) étant remis à 0 à chaque transition (même patron que `App5gen31.tsx::aideParPhase`). */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<EcranDefinitionDerivee, boolean>>>({});

  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionDefinitionDerivee) {
    const recap = calculerRecapitulatifDefinitionDerivee(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (derniere.estLatex ? <Katex expression={derniere.valeur} /> : derniere.valeur) : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionDefinitionDerivee, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, nouvelEtat);
      if (etat.niveauAide > 0) setAideParPhase((m) => ({ ...m, [etat.phase]: true }));
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereEtapeRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setEtat(demarrerSessionDefinitionDerivee(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const cleEcran = `${etat.indexExercice}-${etat.phase}`;
  const phase = etat.phase;

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
        <ProgressionPuces segments={calculerSegmentsProgression(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifDefinitionDerivee(etat)} />
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

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceDefinitionDerivee;
  phase: EcranDefinitionDerivee;
  etat: EtatSessionDefinitionDerivee;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionDefinitionDerivee, votreReponse?: ReactNode) => void;
  setEtat: (etat: EtatSessionDefinitionDerivee) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({
  exercice,
  phase,
  etat,
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
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseDevelopper(etat, reponse), `f(a) = ${reponse.fA} ; f(a+h) = ${reponse.fAH}`)}
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
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseQuotient(etat, texte), texte)}
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
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(texte) => terminerEtape(soumettreReponseLimite(etat, texte), `f'(a) = ${texte}`)}
          diagnostiquer={(t) => diagnostiquerLimiteDerivee(t, exercice, a)}
          validation={validation}
        />
      );
  }
}
