import { useState } from "react";
import type { ReglagesSession5e } from "./core5e/session5e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLectureGraphiqueDerivees } from "./generateurs5e/lectureGraphiqueDerivees";
import { SelecteurVarianteDev } from "./components5e/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionLectureGraphiqueDerivees,
  niveauAideMaxLectureGraphiqueDerivees,
  soumettreReponseAsymptotes,
  soumettreReponseExtremums,
  soumettreReponseInflexions,
  soumettreReponseTableauFPrime,
  soumettreReponseTableauFSeconde,
} from "./moteur5e/sessionLectureGraphiqueDerivees";
import type { EcranLectureGraphiqueDerivees, EtatSessionLectureGraphiqueDerivees } from "./moteur5e/typesLectureGraphiqueDerivees";
import { diagnostiquerCibleAsymptote, listeAsymptotes } from "./moteur5e/verificationLectureGraphiqueDerivees";
import { diagnostiquerChampParmiCiblesExtremum, diagnostiquerChampParmiCiblesInflexion } from "./moteur5e/verificationLectureGraphiqueDerivees";
import type { ExerciceLectureGraphiqueDerivees } from "./core5e/lectureGraphiqueDerivees.types";
import { EtapeAsymptotesLectureGraphiqueDerivees } from "./components5e/EtapeAsymptotesLectureGraphiqueDerivees";
import { EtapeTableauLectureGraphiqueDerivees } from "./components5e/EtapeTableauLectureGraphiqueDerivees";
import { EtapeChampsLectureGraphiqueDerivees } from "./components5e/EtapeChampsLectureGraphiqueDerivees";
import { ResultatPanelLectureGraphiqueDerivees } from "./components5e/ResultatPanelLectureGraphiqueDerivees";
import { ResumeSessionLectureGraphiqueDerivees } from "./components5e/ResumeSessionLectureGraphiqueDerivees";
import {
  labelsChampsExtremums,
  labelsChampsInflexions,
  precisionAnnonceeExtremum,
  precisionAnnonceeInflexion,
} from "./ui5e/formatLectureGraphiqueDerivees";

const REGLAGES_DEMO: ReglagesSession5e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLectureGraphiqueDerivees {
  return demarrerSessionLectureGraphiqueDerivees(REGLAGES_DEMO, genererExerciceLectureGraphiqueDerivees);
}

interface Bilan {
  resultat: EtatSessionLectureGraphiqueDerivees["resultats"][number];
  aideParPhase: Partial<Record<EcranLectureGraphiqueDerivees, { niveauAide: number; revele: boolean }>>;
}

export function App5gen30() {
  const [etat, setEtat] = useState<EtatSessionLectureGraphiqueDerivees>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<EcranLectureGraphiqueDerivees, { niveauAide: number; revele: boolean }>>>({});

  function terminerEtape(nouvelEtat: EtatSessionLectureGraphiqueDerivees) {
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
        <h1 className="app-title">Lecture graphique — dérivées et applications</h1>
      </header>
      <SelecteurVarianteDev
        options={CATALOGUE_VARIANTES}
        onGenerer={(id) => {
          setDernierBilan(null);
          setAideParPhase({});
          setEtat(demarrerSessionLectureGraphiqueDerivees(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
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
            <ResultatPanelLectureGraphiqueDerivees
              resultat={dernierBilan.resultat}
              aideParPhase={dernierBilan.aideParPhase}
              dernier={etat.terminee}
              onContinuer={() => setDernierBilan(null)}
            />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionLectureGraphiqueDerivees resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}

interface EcranProps {
  exercice: ExerciceLectureGraphiqueDerivees;
  phase: EcranLectureGraphiqueDerivees;
  etat: EtatSessionLectureGraphiqueDerivees;
  tentativesUtilisees: number;
  tentativesMax: number;
  cleEcran: string;
  terminerEtape: (nouvelEtat: EtatSessionLectureGraphiqueDerivees) => void;
  setEtat: (etat: EtatSessionLectureGraphiqueDerivees) => void;
}

function EcranCourant({ exercice, phase, etat, tentativesUtilisees, tentativesMax, cleEcran, terminerEtape, setEtat }: EcranProps) {
  const niveauAideMax = niveauAideMaxLectureGraphiqueDerivees();
  const onActiverAide = () => setEtat(activerAideSuivante(etat));

  switch (phase) {
    case "asymptotes": {
      const slots = listeAsymptotes(exercice.asymptotique);
      return (
        <EtapeAsymptotesLectureGraphiqueDerivees
          key={cleEcran}
          exercice={exercice}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(textes) => terminerEtape(soumettreReponseAsymptotes(etat, textes))}
          diagnostiquer={(textes) => textes.map((t, i) => diagnostiquerCibleAsymptote(t, slots[i].cible))}
        />
      );
    }

    case "tableauFPrime":
      return (
        <EtapeTableauLectureGraphiqueDerivees
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

    case "extremums":
      return (
        <EtapeChampsLectureGraphiqueDerivees
          key={cleEcran}
          exercice={exercice}
          phase="extremums"
          labels={labelsChampsExtremums(exercice.extrema)}
          placeholders={exercice.extrema.map(() => "ex : 4")}
          positions={exercice.extrema.map((e) => e.position)}
          precisionAnnoncee={precisionAnnonceeExtremum()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseExtremums(etat, reponses))}
          diagnostiquer={(t) =>
            diagnostiquerChampParmiCiblesExtremum(
              t,
              exercice.extrema.map((e) => e.valeur),
            )
          }
        />
      );

    case "tableauFSeconde":
      return (
        <EtapeTableauLectureGraphiqueDerivees
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

    case "inflexions":
      return (
        <EtapeChampsLectureGraphiqueDerivees
          key={cleEcran}
          exercice={exercice}
          phase="inflexions"
          labels={labelsChampsInflexions(exercice.inflexions)}
          placeholders={exercice.inflexions.map(() => "ex : -1.5")}
          positions={exercice.inflexions.map((p) => p.position)}
          precisionAnnoncee={precisionAnnonceeInflexion()}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          niveauAide={etat.niveauAide}
          niveauAideMax={niveauAideMax}
          onActiverAide={onActiverAide}
          onValider={(reponses) => terminerEtape(soumettreReponseInflexions(etat, reponses))}
          diagnostiquer={(t) =>
            diagnostiquerChampParmiCiblesInflexion(
              t,
              exercice.inflexions.map((p) => p.position),
            )
          }
        />
      );
  }
}
