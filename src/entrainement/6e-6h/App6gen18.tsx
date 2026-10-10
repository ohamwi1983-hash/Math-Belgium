import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDeterminerParametresLogarithme } from "./generateurs6e/determinerParametresLogarithme";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionDeterminerParametresLogarithme,
  soumettreReponseAEcran1,
  soumettreReponseAEcran2,
  soumettreReponseBEcran1,
  soumettreReponseBEcran2,
  soumettreReponseBEcran3,
  soumettreReponseCEcran1,
  soumettreReponseCEcran2,
  soumettreReponseCEcran3,
} from "./moteur6e/sessionDeterminerParametresLogarithme";
import type { EtatSessionDeterminerParametresLogarithme, PhaseDeterminerParametresLogarithme, ResultatExerciceDeterminerParametresLogarithme } from "./moteur6e/typesDeterminerParametresLogarithme";
import { diagnostiquerAEcran1, diagnostiquerAEcran2, diagnostiquerBEcran1, diagnostiquerBEcran2, diagnostiquerBEcran3, diagnostiquerCEcran1, diagnostiquerCEcran2, diagnostiquerCEcran3 } from "./moteur6e/verificationDeterminerParametresLogarithme";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { EtapeChampDeterminerParametres } from "./components6e/EtapeChampDeterminerParametres";
import { EtapeDeuxChampsDeterminerParametres } from "./components6e/EtapeDeuxChampsDeterminerParametres";
import { ResultatPanelDeterminerParametresLogarithme } from "./components6e/ResultatPanelDeterminerParametresLogarithme";
import { ResumeSessionDeterminerParametresLogarithme } from "./components6e/ResumeSessionDeterminerParametresLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  aideNiveau1A,
  aideNiveau1B,
  aideNiveau1C,
  aideNiveau2A,
  aideNiveau2B,
  aideNiveau2C,
  blocDonneesA,
  blocDonneesB,
  blocDonneesC,
  consigneEcranA,
  consigneEcranB,
  consigneEcranC,
  consigneGeneraleA,
  consigneGeneraleB,
  consigneGeneraleC,
  etatActuelA,
  etatActuelB,
  etatActuelC,
  labelsEcranA,
  labelsEcranB,
  placeholderEcranC,
  placeholdersEcranA,
  placeholdersEcranB,
} from "./ui6e/formatDeterminerParametresLogarithme";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionDeterminerParametresLogarithme {
  return demarrerSessionDeterminerParametresLogarithme(REGLAGES_DEMO, genererExerciceDeterminerParametresLogarithme);
}

type AideParPhase = Partial<Record<PhaseDeterminerParametresLogarithme, { niveauAide: number; revele: boolean }>>;

interface Bilan {
  resultat: ResultatExerciceDeterminerParametresLogarithme;
  aideParPhase: AideParPhase;
}


export function App6gen18() {
  const [etat, setEtat] = useState<EtatSessionDeterminerParametresLogarithme>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);
  const [aideParPhase, setAideParPhase] = useState<AideParPhase>({});

  function terminerEtape(nouvelEtat: EtatSessionDeterminerParametresLogarithme) {
    // `nouvelEtat.derniereTransitionRevelee` (jamais `etat.etapeCourante.revelee`, toujours false
    // ici — remis à zéro par `avancerPhase` DANS le même appel qui clôt l'écran, voir
    // `moteur6e/sessionDeterminerParametresLogarithme.ts` et `docs/historique-6e.md`).
    const miseAJour: AideParPhase = { ...aideParPhase, [etat.phase]: { niveauAide: etat.niveauAide, revele: nouvelEtat.derniereTransitionRevelee } };
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], aideParPhase: miseAJour });
      setAideParPhase({});
    } else {
      setAideParPhase(miseAJour);
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionDeterminerParametresLogarithme(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;

  const aideCommun = {
    tentativesUtilisees,
    tentativesMax,
    niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

  // Calculatrice scientifique — visible uniquement sur les écrans où un calcul de ln(k1) à la main
  // est réellement en jeu (valeur de m/n sous-type "point", valeur de p famille B) ; les écrans
  // purement symboliques (poser une équation/relation/inéquation) ne l'obtiennent pas.
  const calculatriceVisible = (phase === "aEcran2" && exercice.famille === "A" && exercice.sousType === "point") || phase === "bEcran2";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Déterminer des paramètres depuis des conditions graphiques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && exercice.famille === "A" && (
          <>
            {phase === "aEcran1" && (
              <EtapeDeuxChampsDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleA()}
                blocDonnees={blocDonneesA(exercice)}
                etatActuel={etatActuelA(exercice, phase)}
                consigneEcran={consigneEcranA(phase)}
                labelA={labelsEcranA(exercice, phase).a}
                labelB={labelsEcranA(exercice, phase).b}
                placeholderA={placeholdersEcranA(exercice, phase).a}
                placeholderB={placeholdersEcranA(exercice, phase).b}
                aideNiveau1={aideNiveau1A(phase)}
                aideNiveau2={aideNiveau2A(exercice, phase)}
                diagnostiquer={(reponse) => diagnostiquerAEcran1(exercice, reponse)}
                onValider={(reponse) => terminerEtape(soumettreReponseAEcran1(etat, reponse))}
              />
            )}
            {phase === "aEcran2" && (
              <EtapeDeuxChampsDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleA()}
                blocDonnees={blocDonneesA(exercice)}
                etatActuel={etatActuelA(exercice, phase)}
                consigneEcran={consigneEcranA(phase)}
                labelA={labelsEcranA(exercice, phase).a}
                labelB={labelsEcranA(exercice, phase).b}
                placeholderA={placeholdersEcranA(exercice, phase).a}
                placeholderB={placeholdersEcranA(exercice, phase).b}
                aideNiveau1={aideNiveau1A(phase)}
                aideNiveau2={aideNiveau2A(exercice, phase)}
                diagnostiquer={(reponse) => diagnostiquerAEcran2(exercice, reponse)}
                onValider={(reponse) => terminerEtape(soumettreReponseAEcran2(etat, reponse))}
              />
            )}
          </>
        )}

        {enCoursDeSession && exercice.famille === "B" && (
          <>
            {phase === "bEcran1" && (
              <EtapeDeuxChampsDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleB()}
                blocDonnees={blocDonneesB(exercice)}
                etatActuel={etatActuelB(exercice, phase)}
                consigneEcran={consigneEcranB(phase)}
                labelA={labelsEcranB(phase).a}
                labelB={labelsEcranB(phase).b}
                placeholderA={placeholdersEcranB(exercice, phase).a}
                placeholderB={placeholdersEcranB(exercice, phase).b}
                aideNiveau1={aideNiveau1B(phase)}
                aideNiveau2={aideNiveau2B(exercice, phase)}
                diagnostiquer={(reponse) => diagnostiquerBEcran1(exercice, reponse)}
                onValider={(reponse) => terminerEtape(soumettreReponseBEcran1(etat, reponse))}
              />
            )}
            {phase === "bEcran2" && (
              <EtapeChampDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleB()}
                blocDonnees={blocDonneesB(exercice)}
                etatActuel={etatActuelB(exercice, phase)}
                consigneEcran={consigneEcranB(phase)}
                placeholder="ex : 1,3"
                aideNiveau1={aideNiveau1B(phase)}
                aideNiveau2={aideNiveau2B(exercice, phase)}
                diagnostiquer={(texte) => diagnostiquerBEcran2(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseBEcran2(etat, texte))}
              />
            )}
            {phase === "bEcran3" && (
              <EtapeDeuxChampsDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleB()}
                blocDonnees={blocDonneesB(exercice)}
                etatActuel={etatActuelB(exercice, phase)}
                consigneEcran={consigneEcranB(phase)}
                labelA={labelsEcranB(phase).a}
                labelB={labelsEcranB(phase).b}
                placeholderA={placeholdersEcranB(exercice, phase).a}
                placeholderB={placeholdersEcranB(exercice, phase).b}
                aideNiveau1={aideNiveau1B(phase)}
                aideNiveau2={aideNiveau2B(exercice, phase)}
                diagnostiquer={(reponse) => diagnostiquerBEcran3(exercice, reponse)}
                onValider={(reponse) => terminerEtape(soumettreReponseBEcran3(etat, reponse))}
              />
            )}
          </>
        )}

        {enCoursDeSession && exercice.famille === "C" && (
          <>
            {phase === "cEcran1" && (
              <EtapeChampDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleC(exercice)}
                blocDonnees={blocDonneesC(exercice)}
                etatActuel={etatActuelC(exercice, phase)}
                consigneEcran={consigneEcranC(phase)}
                placeholder={placeholderEcranC(exercice, phase)}
                aideNiveau1={aideNiveau1C(phase)}
                aideNiveau2={aideNiveau2C(exercice, phase)}
                diagnostiquer={(texte) => diagnostiquerCEcran1(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseCEcran1(etat, texte))}
              />
            )}
            {phase === "cEcran2" && (
              <EtapeChampDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleC(exercice)}
                blocDonnees={blocDonneesC(exercice)}
                etatActuel={etatActuelC(exercice, phase)}
                consigneEcran={consigneEcranC(phase)}
                placeholder={placeholderEcranC(exercice, phase)}
                aideNiveau1={aideNiveau1C(phase)}
                aideNiveau2={aideNiveau2C(exercice, phase)}
                diagnostiquer={(texte) => diagnostiquerCEcran2(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseCEcran2(etat, texte))}
              />
            )}
            {phase === "cEcran3" && (
              <EtapeChampDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleC(exercice)}
                blocDonnees={blocDonneesC(exercice)}
                etatActuel={etatActuelC(exercice, phase)}
                consigneEcran={consigneEcranC(phase)}
                placeholder={placeholderEcranC(exercice, phase)}
                aideNiveau1={aideNiveau1C(phase)}
                aideNiveau2={aideNiveau2C(exercice, phase)}
                diagnostiquer={(texte) => diagnostiquerCEcran3(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseCEcran3(etat, texte))}
              />
            )}
          </>
        )}

        {enCoursDeSession && calculatriceVisible && <CalculatriceScientifique />}

        {dernierBilan && (
          <ResultatPanelDeterminerParametresLogarithme resultat={dernierBilan.resultat} aideParPhase={dernierBilan.aideParPhase} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />
        )}
        {etat.terminee && !dernierBilan && <ResumeSessionDeterminerParametresLogarithme resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
