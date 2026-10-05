import { useState } from "react";
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
import {
  diagnostiquerDeveloppementH,
  diagnostiquerLimiteDerivee,
  diagnostiquerQuotientH,
  diagnostiquerValeurFA,
} from "./moteur5e/verificationDefinitionDerivee";
import type { ExerciceDefinitionDerivee } from "./core5e/definitionDerivee.types";
import { EtapeChampLibreDerivee } from "./components5e/EtapeChampLibreDerivee";
import { EtapeDevelopperDerivee } from "./components5e/EtapeDevelopperDerivee";
import { ResultatPanelDefinitionDerivee } from "./components5e/ResultatPanelDefinitionDerivee";
import { ResumeSessionDefinitionDerivee } from "./components5e/ResumeSessionDefinitionDerivee";
import { labelLimite, labelQuotient } from "./ui5e/formatDefinitionDerivee";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDefinitionDerivee {
  return demarrerSessionDefinitionDerivee(REGLAGES_DEMO, genererExerciceDefinitionDerivee);
}

interface Bilan {
  resultat: EtatSessionDefinitionDerivee["resultats"][number];
  aideParPhase: Partial<Record<string, { niveauAide: number; revele: boolean }>>;
}

export function App5gen26() {
  const [etat, setEtat] = useState<EtatSessionDefinitionDerivee>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<string, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionDefinitionDerivee) {
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
        <h1 className="app-title">Calculer f'(a) par la définition</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_FAMILLES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionDefinitionDerivee(REGLAGES_DEMO, () => construireAvecFamilleId(id)));
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
            <ResultatPanelDefinitionDerivee
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionDefinitionDerivee resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
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
  terminerEtape: (nouvelEtat: EtatSessionDefinitionDerivee) => void;
  setEtat: (etat: EtatSessionDefinitionDerivee) => void;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
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
          onValider={(reponse) => terminerEtape(soumettreReponseDevelopper(etat, reponse))}
          diagnostiquer={(r) => ({ fA: diagnostiquerValeurFA(r.fA, exercice, a), fAH: diagnostiquerDeveloppementH(r.fAH, exercice, a) })}
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
          onValider={(texte) => terminerEtape(soumettreReponseQuotient(etat, texte))}
          diagnostiquer={(t) => diagnostiquerQuotientH(t, exercice, a)}
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
          onValider={(texte) => terminerEtape(soumettreReponseLimite(etat, texte))}
          diagnostiquer={(t) => diagnostiquerLimiteDerivee(t, exercice, a)}
        />
      );
  }
}
