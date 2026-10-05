import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimiteExponentielle } from "./generateurs6e/limitesExponentielles";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionLimiteExponentielle,
  soumettreReponseAExposant,
  soumettreReponseAGlobale,
  soumettreReponseBExponentielle,
  soumettreReponseBGlobale,
  soumettreReponseBPolynomiale,
  soumettreReponseCFacteurs,
  soumettreReponseCGlobale,
  soumettreReponseGCombiner,
  soumettreReponseGConclure,
  soumettreReponseGOrdre1,
  soumettreReponseHConclure,
  soumettreReponseHDenominateur,
  soumettreReponseHForme,
  soumettreReponseHNumerateur,
  soumettreReponseIConclure,
  soumettreReponseIDenominateur,
  soumettreReponseIForme,
  soumettreReponseINumerateur,
  soumettreReponseJConclure,
  soumettreReponseJDenominateur,
  soumettreReponseJForme,
  soumettreReponseJNumerateur,
  soumettreReponseKConclure,
  soumettreReponseKDenominateur1,
  soumettreReponseKDenominateur2,
  soumettreReponseKForme,
  soumettreReponseKNumerateur1,
  soumettreReponseKNumerateur2,
  soumettreReponseLConclure,
  soumettreReponseLReformuler,
  soumettreReponseNCombiner,
  soumettreReponseNConclure,
} from "./moteur6e/sessionLimitesExponentielles";
import type { EtatSessionLimiteExponentielle, ResultatExerciceLimiteExponentielle } from "./moteur6e/typesLimitesExponentielles";
import { EtapeChampLimiteExpo } from "./components6e/EtapeChampLimiteExpo";
import { EtapeFacteursC } from "./components6e/EtapeFacteursC";
import { EtapeFormeFI } from "./components6e/EtapeFormeFI";
import { EtapeOrdre1G } from "./components6e/EtapeOrdre1G";
import { EtapeReponseLimite } from "./components6e/EtapeReponseLimite";
import { ResultatPanelLimiteExponentielle } from "./components6e/ResultatPanelLimiteExponentielle";
import { ResumeSessionLimiteExponentielle } from "./components6e/ResumeSessionLimiteExponentielle";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { aideNiveau1, aideNiveau2, consigneEcran, etatActuel, formatLimiteEnonceLatex } from "./ui6e/formatLimitesExponentielles";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 5, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLimiteExponentielle {
  return demarrerSessionLimiteExponentielle(REGLAGES_DEMO, genererExerciceLimiteExponentielle);
}

interface Bilan {
  resultat: ResultatExerciceLimiteExponentielle;
}

export function App6gen6() {
  const [etat, setEtat] = useState<EtatSessionLimiteExponentielle>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionLimiteExponentielle) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1] });
    }
    setEtat(nouvelEtat);
  }

  function forcerVariante(id: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionLimiteExponentielle(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
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
  const rappelEtatActuel = etatActuel(exercice, phase);

  // Hook de vérification Playwright/dev — même principe que les autres générateurs 6e (ex.
  // App6gen23.tsx) : exposé UNIQUEMENT en mode dev (import.meta.env.DEV OU ?dev=1), jamais en prod.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen6?: unknown }).__debug6gen6 = { exercice, phase };
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Calcul de limites (fonctions exponentielles)</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <div className="card-body">
          {enCoursDeSession && (
            <>
              {(phase === "aExposant" || phase === "aGlobale") && (
                <EtapeReponseLimite
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  optionsCategorielles={phase === "aExposant" ? ["plus_infini", "moins_infini"] : ["plus_infini", "zero"]}
                  autoriserValeurLibre
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(phase === "aExposant" ? soumettreReponseAExposant(etat, reponse) : soumettreReponseAGlobale(etat, reponse))
                  }
                />
              )}

              {phase === "bExponentielle" && (
                <EtapeReponseLimite
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  optionsCategorielles={["plus_infini", "zero"]}
                  autoriserValeurLibre
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseBExponentielle(etat, reponse))}
                />
              )}
              {(phase === "bPolynomiale" || phase === "bGlobale") && (
                <EtapeReponseLimite
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  optionsCategorielles={["plus_infini", "moins_infini"]}
                  autoriserValeurLibre={false}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) =>
                    terminerEtape(phase === "bPolynomiale" ? soumettreReponseBPolynomiale(etat, reponse) : soumettreReponseBGlobale(etat, reponse))
                  }
                />
              )}

              {phase === "cFacteurs" && (
                <EtapeFacteursC
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseCFacteurs(etat, reponse))}
                />
              )}
              {phase === "cGlobale" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 0"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseCGlobale(etat, texte))}
                />
              )}

              {phase === "gCombiner" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder="ex : (1-exp(pi/2-x)+cos(x))/(cos(x)*(1-exp(pi/2-x)))"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGCombiner(etat, texte))}
                />
              )}
              {phase === "gOrdre1" && (
                <EtapeOrdre1G
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(ordre1Suffit) => terminerEtape(soumettreReponseGOrdre1(etat, ordre1Suffit))}
                />
              )}
              {phase === "gConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 1/2, 0.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseGConclure(etat, texte))}
                />
              )}

              {phase === "hForme" && (
                <EtapeFormeFI
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseHForme(etat, reponse))}
                />
              )}
              {phase === "hNumerateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={exercice.famille === "H" && exercice.expAuNumerateur ? `ex : 3*ln(${exercice.base})*${exercice.base}^(3*x)` : "ex : 2"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHNumerateur(etat, texte))}
                />
              )}
              {phase === "hDenominateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "H" && !exercice.expAuNumerateur ? `ex : 3*ln(${exercice.base})*${exercice.base}^(3*x)` : "ex : 2"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHDenominateur(etat, texte))}
                />
              )}
              {phase === "hConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3/2, 1.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseHConclure(etat, texte))}
                />
              )}

              {phase === "iForme" && (
                <EtapeFormeFI
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseIForme(etat, reponse))}
                />
              )}
              {phase === "iNumerateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "I" && !exercice.sinAuNumerateur ? `ex : 2*ln(${exercice.base})*${exercice.base}^(2*x)` : "ex : 3*cos(3*x)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseINumerateur(etat, texte))}
                />
              )}
              {phase === "iDenominateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "I" && exercice.sinAuNumerateur
                      ? "ex : 3*cos(3*x)"
                      : exercice.famille === "I"
                        ? `ex : 2*ln(${exercice.base})*${exercice.base}^(2*x)`
                        : "ex : 3*cos(3*x)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseIDenominateur(etat, texte))}
                />
              )}
              {phase === "iConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3/2, 1.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseIConclure(etat, texte))}
                />
              )}

              {phase === "jForme" && (
                <EtapeFormeFI
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseJForme(etat, reponse))}
                />
              )}
              {phase === "jNumerateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "J" && exercice.arcAuNumerateur
                      ? exercice.arcFn === "arctan"
                        ? "ex : 3/(1+(3*x)^2)"
                        : "ex : 3/sqrt(1-(3*x)^2)"
                      : exercice.famille === "J"
                        ? `ex : 2*ln(${exercice.base})*${exercice.base}^(2*x)`
                        : "ex : 3/(1+(3*x)^2)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJNumerateur(etat, texte))}
                />
              )}
              {phase === "jDenominateur" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "J" && !exercice.arcAuNumerateur
                      ? exercice.arcFn === "arctan"
                        ? "ex : 3/(1+(3*x)^2)"
                        : "ex : 3/sqrt(1-(3*x)^2)"
                      : exercice.famille === "J"
                        ? `ex : 2*ln(${exercice.base})*${exercice.base}^(2*x)`
                        : "ex : 2*exp(2*x)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJDenominateur(etat, texte))}
                />
              )}
              {phase === "jConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 3/2, 1.5"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseJConclure(etat, texte))}
                />
              )}

              {phase === "kForme" && (
                <EtapeFormeFI
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(reponse) => terminerEtape(soumettreReponseKForme(etat, reponse))}
                />
              )}
              {phase === "kNumerateur1" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "K" && exercice.expAuNumerateur ? `ex : 3*ln(${exercice.base})*(${exercice.base}^(3*x)-1)` : "ex : 4*x"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKNumerateur1(etat, texte))}
                />
              )}
              {phase === "kDenominateur1" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "K" && !exercice.expAuNumerateur ? `ex : 3*ln(${exercice.base})*(${exercice.base}^(3*x)-1)` : "ex : 4*x"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKDenominateur1(etat, texte))}
                />
              )}
              {phase === "kNumerateur2" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "K" && exercice.expAuNumerateur ? `ex : 9*ln(${exercice.base})^2*${exercice.base}^(3*x)` : "ex : 4"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKNumerateur2(etat, texte))}
                />
              )}
              {phase === "kDenominateur2" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "K" && !exercice.expAuNumerateur ? `ex : 9*ln(${exercice.base})^2*${exercice.base}^(3*x)` : "ex : 4"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKDenominateur2(etat, texte))}
                />
              )}
              {phase === "kConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder="ex : 9/4, 2.25"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseKConclure(etat, texte))}
                />
              )}

              {phase === "lReformuler" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={
                    exercice.famille === "L" && exercice.sousType === "L1"
                      ? "ex : (1+1/u)^(6*u) (en fonction de u)"
                      : "ex : (1+t)^(6/t) (en fonction de t)"
                  }
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseLReformuler(etat, texte))}
                />
              )}
              {phase === "lConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder="ex : e^6, exp(6)"
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseLConclure(etat, texte))}
                />
              )}

              {phase === "nCombiner" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={exercice.famille === "N" ? `ex : ${exercice.base}^(6+3*x)` : "ex : 2^(6+3*x)"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseNCombiner(etat, texte))}
                />
              )}
              {phase === "nConclure" && (
                <EtapeChampLimiteExpo
                  key={phase}
                  consigneEcran={consigne}
                  etatActuel={rappelEtatActuel}
                  enonceLatex={enonceLatex}
                  placeholder={exercice.famille === "N" ? `ex : ${exercice.base}^6` : "ex : 2^6"}
                  aideNiveau1={aide1}
                  aideNiveau2={aide2}
                  tentativesUtilisees={tentativesUtilisees}
                  tentativesMax={tentativesMax}
                  niveauAide={niveauAide}
                  niveauAideMax={NIVEAU_AIDE_MAX}
                  onActiverAide={() => setEtat(activerAideSuivante(etat))}
                  onValider={(texte) => terminerEtape(soumettreReponseNConclure(etat, texte))}
                />
              )}
            </>
          )}
          {dernierBilan && (
            <ResultatPanelLimiteExponentielle resultat={dernierBilan.resultat} dernier={etat.terminee} onContinuer={() => setDernierBilan(null)} />
          )}
          {etat.terminee && !dernierBilan && (
            <ResumeSessionLimiteExponentielle resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
