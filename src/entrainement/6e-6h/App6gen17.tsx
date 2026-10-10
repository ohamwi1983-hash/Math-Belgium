import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLimiteLogarithmique } from "./generateurs6e/limitesLogarithmiques";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionLimiteLogarithmique,
  soumettreReponseAConclure,
  soumettreReponseADominance,
  soumettreReponseBConclure,
  soumettreReponseBReformuler,
  soumettreReponseCConclure,
  soumettreReponseCDiagnostic,
  soumettreReponseDConclure,
  soumettreReponseDExposant,
  soumettreReponseDLimiteExposant,
  soumettreReponseEConclure,
  soumettreReponseEDevelopper,
  soumettreReponseESimplifier,
} from "./moteur6e/sessionLimitesLogarithmiques";
import type { EtatSessionLimiteLogarithmique, ResultatExerciceLimiteLogarithmique } from "./moteur6e/typesLimitesLogarithmiques";
import { EtapeChampLimiteLog } from "./components6e/EtapeChampLimiteLog";
import { EtapeDiagnosticC } from "./components6e/EtapeDiagnosticC";
import { EtapeDominanceA } from "./components6e/EtapeDominanceA";
import { EtapeReponseLimiteLog } from "./components6e/EtapeReponseLimiteLog";
import { ResultatPanelLimitesLogarithmiques } from "./components6e/ResultatPanelLimitesLogarithmiques";
import { ResumeSessionLimitesLogarithmiques } from "./components6e/ResumeSessionLimitesLogarithmiques";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, configDiagnosticPartiesC, consigneEcran, etatActuel, formatLimiteEnonceLatex } from "./ui6e/formatLimitesLogarithmiques";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLimiteLogarithmique {
  return demarrerSessionLimiteLogarithmique(REGLAGES_DEMO, genererExerciceLimiteLogarithmique);
}

interface Bilan {
  resultat: ResultatExerciceLimiteLogarithmique;
}


export function App6gen17() {
  const [etat, setEtat] = useState<EtatSessionLimiteLogarithmique>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLimiteLogarithmique) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1] });
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionLimiteLogarithmique(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const enonceLatex = formatLimiteEnonceLatex(exercice);
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const aide1 = aideNiveau1(phase, exercice);
  const aide2 = aideNiveau2(phase, exercice);
  const consigne = consigneEcran(phase, exercice);
  const etatAct = etatActuel(phase, exercice);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Calculer des limites (fonctions logarithmes)</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {enCoursDeSession && (
          <>
            {phase === "aDominance" && exercice.famille === "A" && (
              <EtapeDominanceA
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseADominance(etat, reponse))}
              />
            )}
            {phase === "aConclure" && exercice.famille === "A" && (
              <EtapeReponseLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                optionsCategorielles={["plus_infini", "moins_infini", "zero"]}
                autoriserValeurLibre
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseAConclure(etat, reponse))}
              />
            )}

            {phase === "bReformuler" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : ln(1+2*u)/(2*ln(1+u)) (en fonction de u)"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseBReformuler(etat, texte))}
              />
            )}
            {phase === "bConclure" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : 1/2, ln(3)..."
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseBConclure(etat, texte))}
              />
            )}

            {phase === "cDiagnostic" && exercice.famille === "C" && (
              <EtapeDiagnosticC
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                partie1={configDiagnosticPartiesC(exercice).partie1}
                partie2={configDiagnosticPartiesC(exercice).partie2}
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseCDiagnostic(etat, reponse))}
              />
            )}
            {phase === "cConclure" && (
              <EtapeReponseLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                optionsCategorielles={["plus_infini", "moins_infini", "zero"]}
                autoriserValeurLibre
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(reponse) => terminerEtape(soumettreReponseCConclure(etat, reponse))}
              />
            )}

            {phase === "dExposant" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : (3/x^2)*ln(cos(2*x))"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseDExposant(etat, texte))}
              />
            )}
            {phase === "dLimiteExposant" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : -6"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseDLimiteExposant(etat, texte))}
              />
            )}
            {phase === "dConclure" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : exp(-6)"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseDConclure(etat, texte))}
              />
            )}

            {phase === "eDevelopper" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : x^2*(ln(3)+1/2)"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseEDevelopper(etat, texte))}
              />
            )}
            {phase === "eSimplifier" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : (ln(3)+1/2)/4"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseESimplifier(etat, texte))}
              />
            )}
            {phase === "eConclure" && (
              <EtapeChampLimiteLog
                key={phase}
                consigneEcran={consigne}
                enonceLatex={enonceLatex}
                etatActuel={etatAct}
                placeholder="ex : (2*ln(3)+1)/8"
                aideNiveau1={aide1}
                aideNiveau2={aide2}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={() => setEtat(activerAideSuivante(etat))}
                onValider={(texte) => terminerEtape(soumettreReponseEConclure(etat, texte))}
              />
            )}
          </>
        )}
        {dernierBilan && <ResultatPanelLimitesLogarithmiques resultat={dernierBilan.resultat} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />}
        {etat.terminee && !dernierBilan && <ResumeSessionLimitesLogarithmiques resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />}
      </main>
    </div>
  );
}
