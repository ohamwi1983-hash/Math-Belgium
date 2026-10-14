import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceContexteEconomique } from "./generateurs5e/contexteEconomique/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionContexteEconomique,
  niveauAideMaxContexteEconomique,
  soumettreReponseBeneficeDerivee,
  soumettreReponseBeneficeFormule,
  soumettreReponseBeneficeMaximum,
  soumettreReponseComparaisonEcart,
  soumettreReponseConfirmationCoherence,
  soumettreReponseCoutMarginalDiscret,
  soumettreReponseDeriveeSymbolique,
  soumettreReponseDeriveeValeur,
  soumettreReponseEgaliteMarginales,
  soumettreReponseExtremum,
  soumettreReponseIteration,
  soumettreReponseMarginales,
  soumettreReponsePoserEquationReduite,
  soumettreReponseRacineApprochee,
  soumettreReponseRecetteTotale,
  soumettreReponseTableauSigneBenefice,
} from "./moteur5e/sessionContexteEconomique";
import type { EcranContexteEconomique, EtatSessionContexteEconomique } from "./moteur5e/typesContexteEconomique";
import { indexIteration, ordreEcransContexteEconomique } from "./moteur5e/typesContexteEconomique";
import {
  diagnostiquerBeneficeDerivee,
  diagnostiquerBeneficeFormule,
  diagnostiquerBeneficeMaximum,
  diagnostiquerCoutMarginalB,
  diagnostiquerCoutMarginalDiscret,
  diagnostiquerDeriveeSymboliqueA,
  diagnostiquerDeriveeValeur,
  diagnostiquerEcartAbsolu,
  diagnostiquerEcartPourcent,
  diagnostiquerEquationReduite,
  diagnostiquerMilieuIteration,
  diagnostiquerPositionExtremumParmiCibles,
  diagnostiquerRacineApprochee,
  diagnostiquerRacineMarginale,
  diagnostiquerRecetteMarginale,
  diagnostiquerRecetteTotale,
} from "./moteur5e/verificationContexteEconomique";
import { formatReponseAttenduePhaseLatex, PRECISION_ECART_POURCENT, precisionRacineApprochee } from "./ui5e/formatContexteEconomique";
import { calculerRecapitulatifContexteEconomique } from "./ui5e/recapitulatifContexteEconomique";
import { RecapitulatifPanel } from "./components5e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { Katex } from "./components/Katex";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import { EtapeChampsLibresCE } from "./components5e/EtapeChampsLibresCE";
import { EtapeChampsNumeriquesCE } from "./components5e/EtapeChampsNumeriquesCE";
import { EtapeExtremumCoutTotal } from "./components5e/EtapeExtremumCoutTotal";
import { EtapeResoudreEgaliteMarginales } from "./components5e/EtapeResoudreEgaliteMarginales";
import { EtapeTableauSigneBenefice } from "./components5e/EtapeTableauSigneBenefice";
import { EtapeConfirmationCoherence } from "./components5e/EtapeConfirmationCoherence";
import { EtapeIterationDichotomie } from "./components5e/EtapeIterationDichotomie";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionContexteEconomique {
  return demarrerSessionContexteEconomique(REGLAGES_DEMO, genererExerciceContexteEconomique);
}

/** État tenu en attente dès qu'un écran se termine — l'état de session calculé par le moteur n'est
 * appliqué (`setEtat`) qu'au clic sur le bouton de `ValidationEcran` (convention CLAUDE.md). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionContexteEconomique;
  revele: boolean;
}

/** Même heuristique que `calculerRecapitulatifContexteEconomique` (`scoresPartiels[ecran] === 0 ⟺
 * révélée`) — `ordreEcransContexteEconomique(exercice)` donne la séquence RÉELLE (5 écrans pour la
 * famille "A", 8 pour "B", 6 pour le bonus, fixée dès le tirage). */
function calculerSegmentsProgression(etat: EtatSessionContexteEconomique): EtatPuceProgression[] {
  return ordreEcransContexteEconomique(etat.exerciceCourant).map((ecran) => {
    if (ecran === etat.phase) return "courante";
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) return "a-venir";
    return score === 0 ? "revele" : "correcte";
  });
}

export function App5gen33() {
  const [etat, setEtat] = useState<EtatSessionContexteEconomique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionContexteEconomique) {
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
    setEtat(demarrerSessionContexteEconomique(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
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
        <h1 className="app-title">Contexte économique</h1>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>
      <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={calculerRecapitulatifContexteEconomique(etat)} />
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
  exercice: EtatSessionContexteEconomique["exerciceCourant"];
  phase: EcranContexteEconomique;
  etat: EtatSessionContexteEconomique;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionContexteEconomique) => void;
  setEtat: (etat: EtatSessionContexteEconomique) => void;
  validation: ValidationEtapeProps | null;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat, validation }: EcranProps) {
  const niveauAideMax = niveauAideMaxContexteEconomique();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  if (exercice.famille === "A") {
    switch (phase) {
      case "coutMarginalDiscret":
        return (
          <EtapeChampsNumeriquesCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={["C_m(q_0)="]}
            placeholders={["ex : 12"]}
            precisionAnnoncee={null}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseCoutMarginalDiscret(etat, r[0]))}
            diagnostiquer={(r) => [diagnostiquerCoutMarginalDiscret(r[0], exercice)]}
            validation={validation}
          />
        );
      case "deriveeSymbolique":
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={["C'_T(q)="]}
            placeholders={["ex : 4q-3"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseDeriveeSymbolique(etat, r[0]))}
            diagnostiquer={(r) => [diagnostiquerDeriveeSymboliqueA(r[0], exercice)]}
            validation={validation}
          />
        );
      case "deriveeValeur":
        return (
          <EtapeChampsNumeriquesCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={["C'_T(q_0)="]}
            placeholders={["ex : 13"]}
            precisionAnnoncee={null}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseDeriveeValeur(etat, r[0]))}
            diagnostiquer={(r) => [diagnostiquerDeriveeValeur(r[0], exercice)]}
            validation={validation}
          />
        );
      case "comparaisonEcart":
        return (
          <EtapeChampsNumeriquesCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={["\\text{écart absolu}=", "\\text{écart en \\%}="]}
            placeholders={["ex : 2", "ex : 15.38"]}
            precisionAnnoncee={PRECISION_ECART_POURCENT}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseComparaisonEcart(etat, { ecartAbsolu: r[0], ecartPourcent: r[1] }))}
            diagnostiquer={(r) => [diagnostiquerEcartAbsolu(r[0], exercice), diagnostiquerEcartPourcent(r[1], exercice)]}
            validation={validation}
          />
        );
      case "extremum":
        return (
          <EtapeExtremumCoutTotal
            key={cleEcran}
            exercice={exercice}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseExtremum(etat, r))}
            diagnostiquerPosition={(t) => diagnostiquerPositionExtremumParmiCibles(t, exercice)}
            validation={validation}
          />
        );
      default:
        return null;
    }
  }

  if (exercice.famille === "B") {
    switch (phase) {
      case "recetteTotale":
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={["R_T(x)="]}
            placeholders={["ex : 3x^2+2x"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseRecetteTotale(etat, r[0]))}
            diagnostiquer={(r) => [diagnostiquerRecetteTotale(r[0], exercice)]}
            validation={validation}
          />
        );
      case "marginales":
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={["C'_T(x)=", "R'_T(x)="]}
            placeholders={["ex : 3x^2-2", "ex : 4x+5"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseMarginales(etat, { coutMarginal: r[0], recetteMarginale: r[1] }))}
            diagnostiquer={(r) => [diagnostiquerCoutMarginalB(r[0], exercice), diagnostiquerRecetteMarginale(r[1], exercice)]}
            validation={validation}
          />
        );
      case "resoudreEgaliteMarginales":
        return (
          <EtapeResoudreEgaliteMarginales
            key={cleEcran}
            exercice={exercice}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseEgaliteMarginales(etat, r))}
            diagnostiquerRacine={(t) => diagnostiquerRacineMarginale(t, exercice)}
            validation={validation}
          />
        );
      case "beneficeFormule":
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={["B(x)="]}
            placeholders={["ex : -x^3+2x^2+7x"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseBeneficeFormule(etat, r[0]))}
            diagnostiquer={(r) => [diagnostiquerBeneficeFormule(r[0], exercice)]}
            validation={validation}
          />
        );
      case "beneficeDerivee":
        return (
          <EtapeChampsLibresCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={["B'(x)="]}
            placeholders={["ex : -3x^2+4x+7"]}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseBeneficeDerivee(etat, r[0]))}
            diagnostiquer={(r) => [diagnostiquerBeneficeDerivee(r[0], exercice)]}
            validation={validation}
          />
        );
      case "tableauSigneBenefice":
        return (
          <EtapeTableauSigneBenefice
            key={cleEcran}
            exercice={exercice}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseTableauSigneBenefice(etat, r))}
            validation={validation}
          />
        );
      case "confirmationCoherence":
        return (
          <EtapeConfirmationCoherence
            key={cleEcran}
            exercice={exercice}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseConfirmationCoherence(etat, r))}
            validation={validation}
          />
        );
      case "beneficeMaximum":
        return (
          <EtapeChampsNumeriquesCE
            key={cleEcran}
            exercice={exercice}
            ecran={phase}
            labels={[`B(${exercice.xOpt})=`]}
            placeholders={["ex : 24"]}
            precisionAnnoncee={null}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={niveauAideMax}
            onActiverAide={onActiverAide}
            onValider={(r) => terminerEtape(soumettreReponseBeneficeMaximum(etat, r[0]))}
            diagnostiquer={(r) => [diagnostiquerBeneficeMaximum(r[0], exercice)]}
            validation={validation}
          />
        );
      default:
        return null;
    }
  }

  // Bonus.
  switch (phase) {
    case "poserEquationReduite":
      return (
        <EtapeChampsLibresCE
          key={cleEcran}
          exercice={exercice}
          ecran={phase}
          labels={["P(q)="]}
          placeholders={["ex : 2q^3+2q^2-12"]}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(r) => terminerEtape(soumettreReponsePoserEquationReduite(etat, r[0]))}
          diagnostiquer={(r) => [diagnostiquerEquationReduite(r[0], exercice)]}
          validation={validation}
        />
      );
    case "iteration0":
    case "iteration1":
    case "iteration2":
    case "iteration3": {
      const index = indexIteration(phase);
      const it = exercice.iterations[index];
      return (
        <EtapeIterationDichotomie
          key={cleEcran}
          exercice={exercice}
          ecran={phase}
          intervalleCourant={{ gauche: it.gauche, droite: it.droite }}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(r) => terminerEtape(soumettreReponseIteration(etat, r))}
          diagnostiquerMilieu={(t) => diagnostiquerMilieuIteration(t, it.milieu)}
          validation={validation}
        />
      );
    }
    case "racineApprochee":
      return (
        <EtapeChampsNumeriquesCE
          key={cleEcran}
          exercice={exercice}
          ecran={phase}
          labels={["q\\approx"]}
          placeholders={["ex : 1.31"]}
          precisionAnnoncee={precisionRacineApprochee(exercice)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(r) => terminerEtape(soumettreReponseRacineApprochee(etat, r[0]))}
          diagnostiquer={(r) => [diagnostiquerRacineApprochee(r[0], exercice)]}
          validation={validation}
        />
      );
    default:
      return null;
  }
}
