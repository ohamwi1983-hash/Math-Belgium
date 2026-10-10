import { useState } from "react";
import type { RacineEtudeLocale } from "./core5e/etudeLocale.types";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudeLocale } from "./generateurs5e/etudeLocale/index";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionEtudeLocale,
  niveauAideMaxEtudeLocale,
  soumettreReponseDomaine,
  soumettreReponseExtremums,
  soumettreReponseInflexions,
  soumettreReponseResoudreFPrime,
  soumettreReponseResoudreFSeconde,
  soumettreReponseTableauFPrime,
  soumettreReponseTableauFSeconde,
} from "./moteur5e/sessionEtudeLocale";
import type { EcranEtudeLocale, EtatSessionEtudeLocale } from "./moteur5e/typesEtudeLocale";
import {
  diagnostiquerChampParmiCibles,
  racinesFPrimeNumeriques,
  racinesFSecondeNumeriques,
  valeursFAuxExtremums,
  valeursFAuxInflexions,
} from "./moteur5e/verificationEtudeLocale";
import { EtapeDomaineEtudeLocale } from "./components5e/EtapeDomaineEtudeLocale";
import { EtapeChampsNumeriquesEtudeLocale } from "./components5e/EtapeChampsNumeriquesEtudeLocale";
import { EtapeZerosDeriveeEtudeLocale } from "./components5e/EtapeZerosDeriveeEtudeLocale";
import { EtapeTableauEtudeLocale } from "./components5e/EtapeTableauEtudeLocale";
import { ResultatPanelEtudeLocale } from "./components5e/ResultatPanelEtudeLocale";
import { ResumeSessionEtudeLocale } from "./components5e/ResumeSessionEtudeLocale";
import { labelsChampsValeurF, precisionAnnonceeRacines, precisionAnnonceeValeursF } from "./ui5e/formatEtudeLocale";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEtudeLocale {
  return demarrerSessionEtudeLocale(REGLAGES_DEMO, genererExerciceEtudeLocale);
}

function racinesExtremumsRetenues(exercice: EtatSessionEtudeLocale["exerciceCourant"]): RacineEtudeLocale[] {
  return exercice.racinesFPrime.filter((_, i) => exercice.classificationFPrime[i] !== "ni_lun_ni_lautre");
}

function racinesInflexionsRetenues(exercice: EtatSessionEtudeLocale["exerciceCourant"]): RacineEtudeLocale[] {
  return exercice.racinesFSeconde.filter((_, i) => exercice.classificationFSeconde[i] === "pi");
}

interface Bilan {
  resultat: EtatSessionEtudeLocale["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

export function App5gen29() {
  const [etat, setEtat] = useState<EtatSessionEtudeLocale>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionEtudeLocale) {
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
        <h1 className="app-title">Étude locale (extremums et points critiques)</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionEtudeLocale(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
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
            <ResultatPanelEtudeLocale
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionEtudeLocale resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: EtatSessionEtudeLocale["exerciceCourant"];
  phase: EcranEtudeLocale;
  etat: EtatSessionEtudeLocale;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionEtudeLocale) => void;
  setEtat: (etat: EtatSessionEtudeLocale) => void;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
  const niveauAideMax = niveauAideMaxEtudeLocale();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "domaine":
      return (
        <EtapeDomaineEtudeLocale
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponse) => terminerEtape(soumettreReponseDomaine(etat, reponse))}
        />
      );

    case "resoudreFPrime": {
      return (
        <EtapeZerosDeriveeEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="resoudreFPrime"
          precisionAnnoncee={precisionAnnonceeRacines(exercice.racinesFPrime)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseResoudreFPrime(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCibles(t, racinesFPrimeNumeriques(exercice))}
        />
      );
    }

    case "tableauFPrime":
      return (
        <EtapeTableauEtudeLocale
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

    case "extremums": {
      const racines = racinesExtremumsRetenues(exercice);
      return (
        <EtapeChampsNumeriquesEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="extremums"
          labels={labelsChampsValeurF(racines)}
          placeholders={racines.map(() => "ex : 4")}
          precisionAnnoncee={precisionAnnonceeValeursF(exercice, racines)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseExtremums(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCibles(t, valeursFAuxExtremums(exercice))}
        />
      );
    }

    case "resoudreFSeconde": {
      return (
        <EtapeZerosDeriveeEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="resoudreFSeconde"
          precisionAnnoncee={precisionAnnonceeRacines(exercice.racinesFSeconde)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseResoudreFSeconde(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCibles(t, racinesFSecondeNumeriques(exercice))}
        />
      );
    }

    case "tableauFSeconde":
      return (
        <EtapeTableauEtudeLocale
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

    case "inflexions": {
      const racines = racinesInflexionsRetenues(exercice);
      return (
        <EtapeChampsNumeriquesEtudeLocale
          key={cleEcran}
          exercice={exercice}
          phase="inflexions"
          labels={labelsChampsValeurF(racines)}
          placeholders={racines.map(() => "ex : 4")}
          precisionAnnoncee={precisionAnnonceeValeursF(exercice, racines)}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseInflexions(etat, reponses))}
          diagnostiquer={(t) => diagnostiquerChampParmiCibles(t, valeursFAuxInflexions(exercice))}
        />
      );
    }
  }
}
