import { useState } from "react";
import type { ExerciceBienaymeTchebychev } from "./core/bienaymeTchebychev.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionBienaymeTchebychev,
  soumettreReponseV1K,
  soumettreReponseV1Pourcent,
  soumettreReponseV2Intervalle,
  soumettreReponseV2K,
  soumettreReponseV3K,
  soumettreReponseV3Nombre,
  soumettreReponseV3Pourcent,
  soumettreReponseV4Intervalle,
  soumettreReponseV4K,
  soumettreReponseV4Pourcent0,
  soumettreReponseV5K,
  soumettreReponseV5Sigma,
  soumettreReponseV6K,
  soumettreReponseV6XBar,
  soumettreReponseV7K,
  soumettreReponseV7Pourcent0,
  soumettreReponseV7Sigma,
  soumettreReponseV8K,
  soumettreReponseV8Pourcent0,
  soumettreReponseV8XBar,
} from "./moteur/sessionBienaymeTchebychev";
import type { EtatSessionBienaymeTchebychev, PhaseBienaymeTchebychev, ResultatExerciceBienaymeTchebychev } from "./moteur/typesBienaymeTchebychev";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceBienaymeTchebychev } from "./generateurs/bienaymeTchebychev";
import type { VarianteBienaymeTchebychev } from "./core/bienaymeTchebychev.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeKDepuisIntervalle } from "./components/EtapeKDepuisIntervalle";
import { EtapeKDepuisPourcent } from "./components/EtapeKDepuisPourcent";
import { EtapePourcentFinal } from "./components/EtapePourcentFinal";
import { EtapeIntervalleFinal } from "./components/EtapeIntervalleFinal";
import { EtapeNombreFinal } from "./components/EtapeNombreFinal";
import { EtapePourcentDepuisNombre } from "./components/EtapePourcentDepuisNombre";
import { EtapeSigmaFinal } from "./components/EtapeSigmaFinal";
import { EtapeXBarFinal } from "./components/EtapeXBarFinal";
import { ResultatPanelBienaymeTchebychev } from "./components/ResultatPanelBienaymeTchebychev";
import { ResumeSessionBienaymeTchebychev } from "./components/ResumeSessionBienaymeTchebychev";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionBienaymeTchebychev {
  return demarrerSessionBienaymeTchebychev(REGLAGES_DEMO, genererExerciceBienaymeTchebychev);
}

interface Bilan {
  resultat: ResultatExerciceBienaymeTchebychev;
  exercice: ExerciceBienaymeTchebychev;
}

const LIBELLE_PHASE: Record<PhaseBienaymeTchebychev, string> = {
  v1K: "k",
  v1Pourcent: "% minimal",
  v2K: "k",
  v2Intervalle: "Intervalle",
  v3K: "k",
  v3Pourcent: "% minimal",
  v3Nombre: "Nombre minimal d'individus",
  v4Pourcent0: "% minimal",
  v4K: "k",
  v4Intervalle: "Intervalle",
  v5K: "k",
  v5Sigma: "Écart-type σ",
  v6K: "k",
  v6XBar: "Moyenne x̄",
  v7Pourcent0: "% minimal",
  v7K: "k",
  v7Sigma: "Écart-type σ",
  v8Pourcent0: "% minimal",
  v8K: "k",
  v8XBar: "Moyenne x̄",
};

export function AppBienaymeTchebychev() {
  const [etat, setEtat] = useState<EtatSessionBienaymeTchebychev>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function terminerEtape(exerciceTermine: ExerciceBienaymeTchebychev, nouvelEtat: EtatSessionBienaymeTchebychev) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const exercice = etat.exerciceCourant;

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionBienaymeTchebychev(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteBienaymeTchebychev)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Inégalité de Bienaymé-Tchebychev</h1>
        <p className="app-subtitle">Chapitre 5 — Statistiques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-step">
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="card-body">
          {enCoursDeSession && <CalculatriceScientifique />}
          {dernierBilan ? (
            <ResultatPanelBienaymeTchebychev
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionBienaymeTchebychev resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "v1K" && exercice.variante === "intervalleVersPourcent" ? (
            <EtapeKDepuisIntervalle
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseV1K(etat, texte))}
            />
          ) : etat.phase === "v1Pourcent" && exercice.variante === "intervalleVersPourcent" ? (
            <EtapePourcentFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseV1Pourcent(etat, texte));
              }}
            />
          ) : etat.phase === "v2K" && exercice.variante === "pourcentVersIntervalle" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseV2K(etat, texte))}
            />
          ) : etat.phase === "v2Intervalle" && exercice.variante === "pourcentVersIntervalle" ? (
            <EtapeIntervalleFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(borneInf, borneSup) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseV2Intervalle(etat, { borneInf, borneSup }));
              }}
            />
          ) : etat.phase === "v3K" && exercice.variante === "intervalleVersNombre" ? (
            <EtapeKDepuisIntervalle
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseV3K(etat, texte))}
            />
          ) : etat.phase === "v3Pourcent" && exercice.variante === "intervalleVersNombre" ? (
            <EtapePourcentFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseV3Pourcent(etat, texte))}
            />
          ) : etat.phase === "v3Nombre" && exercice.variante === "intervalleVersNombre" ? (
            <EtapeNombreFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(texte) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseV3Nombre(etat, texte));
              }}
            />
          ) : etat.phase === "v4Pourcent0" && exercice.variante === "nombreVersIntervalle" ? (
            <EtapePourcentDepuisNombre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(texte) => setEtat(soumettreReponseV4Pourcent0(etat, texte))}
            />
          ) : etat.phase === "v4K" && exercice.variante === "nombreVersIntervalle" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseV4K(etat, texte))}
            />
          ) : etat.phase === "v4Intervalle" && exercice.variante === "nombreVersIntervalle" ? (
            <EtapeIntervalleFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(borneInf, borneSup) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseV4Intervalle(etat, { borneInf, borneSup }));
              }}
            />
          ) : etat.phase === "v5K" && exercice.variante === "intervalleVersSigma" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseV5K(etat, texte))}
            />
          ) : etat.phase === "v5Sigma" && exercice.variante === "intervalleVersSigma" ? (
            <EtapeSigmaFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseV5Sigma(etat, texte));
              }}
            />
          ) : etat.phase === "v6K" && exercice.variante === "intervalleVersXBar" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseV6K(etat, texte))}
            />
          ) : etat.phase === "v6XBar" && exercice.variante === "intervalleVersXBar" ? (
            <EtapeXBarFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseV6XBar(etat, texte));
              }}
            />
          ) : etat.phase === "v7Pourcent0" && exercice.variante === "nombreVersSigma" ? (
            <EtapePourcentDepuisNombre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(texte) => setEtat(soumettreReponseV7Pourcent0(etat, texte))}
            />
          ) : etat.phase === "v7K" && exercice.variante === "nombreVersSigma" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseV7K(etat, texte))}
            />
          ) : etat.phase === "v7Sigma" && exercice.variante === "nombreVersSigma" ? (
            <EtapeSigmaFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseV7Sigma(etat, texte));
              }}
            />
          ) : etat.phase === "v8Pourcent0" && exercice.variante === "nombreVersXBar" ? (
            <EtapePourcentDepuisNombre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(texte) => setEtat(soumettreReponseV8Pourcent0(etat, texte))}
            />
          ) : etat.phase === "v8K" && exercice.variante === "nombreVersXBar" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => setEtat(soumettreReponseV8K(etat, texte))}
            />
          ) : etat.phase === "v8XBar" && exercice.variante === "nombreVersXBar" ? (
            <EtapeXBarFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => {
                const exerciceTermine = exercice;
                terminerEtape(exerciceTermine, soumettreReponseV8XBar(etat, texte));
              }}
            />
          ) : null}{" "}
        </div>
      </main>
    </div>
  );
}
