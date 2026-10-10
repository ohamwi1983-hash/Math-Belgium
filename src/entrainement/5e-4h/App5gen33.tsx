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
import { indexIteration } from "./moteur5e/typesContexteEconomique";
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
import { PRECISION_ECART_POURCENT, precisionRacineApprochee } from "./ui5e/formatContexteEconomique";
import { EtapeChampsLibresCE } from "./components5e/EtapeChampsLibresCE";
import { EtapeChampsNumeriquesCE } from "./components5e/EtapeChampsNumeriquesCE";
import { EtapeExtremumCoutTotal } from "./components5e/EtapeExtremumCoutTotal";
import { EtapeResoudreEgaliteMarginales } from "./components5e/EtapeResoudreEgaliteMarginales";
import { EtapeTableauSigneBenefice } from "./components5e/EtapeTableauSigneBenefice";
import { EtapeConfirmationCoherence } from "./components5e/EtapeConfirmationCoherence";
import { EtapeIterationDichotomie } from "./components5e/EtapeIterationDichotomie";
import { ResultatPanelContexteEconomique } from "./components5e/ResultatPanelContexteEconomique";
import { ResumeSessionContexteEconomique } from "./components5e/ResumeSessionContexteEconomique";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionContexteEconomique {
  return demarrerSessionContexteEconomique(REGLAGES_DEMO, genererExerciceContexteEconomique);
}

interface Bilan {
  resultat: EtatSessionContexteEconomique["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

export function App5gen33() {
  const [etat, setEtat] = useState<EtatSessionContexteEconomique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionContexteEconomique) {
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
        <h1 className="app-title">Contexte économique</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionContexteEconomique(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
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
            <ResultatPanelContexteEconomique
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionContexteEconomique resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
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
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
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
        />
      );
    default:
      return null;
  }
}
