import { useState } from "react";
import type { ReponseAsymptotesCaracteristiques, ReponseExistence, ReponseZerosCaracteristiques } from "./core/caracteristiquesFonction.types";
import type { ExerciceCaracteristiquesFonction } from "./core/caracteristiquesFonction.types";
import type { Morceau } from "./core/inequation.types";
import type { ReglagesSession } from "./core/session.types";
import {
  demarrerSessionCaracteristiquesFonction,
  soumettreReponseAsymptotes,
  soumettreReponseConstance,
  soumettreReponseCroissance,
  soumettreReponseDecroissance,
  soumettreReponseDomaine,
  soumettreReponseOrdonnee,
  soumettreReponseValeur,
  soumettreReponseZeros,
} from "./moteur/sessionCaracteristiquesFonction";
import type { EtatSessionCaracteristiquesFonction, ResultatExerciceCaracteristiquesFonction } from "./moteur/typesCaracteristiquesFonction";
import { genererExerciceCaracteristiquesFonction } from "./generateurs/caracteristiquesFonction";
import { EtapeDomaineCaracteristiques } from "./components/EtapeDomaineCaracteristiques";
import { EtapeZerosCaracteristiques } from "./components/EtapeZerosCaracteristiques";
import { EtapeCroissanceCaracteristiques } from "./components/EtapeCroissanceCaracteristiques";
import { EtapeDecroissanceCaracteristiques } from "./components/EtapeDecroissanceCaracteristiques";
import { EtapeConstanceCaracteristiques } from "./components/EtapeConstanceCaracteristiques";
import { EtapeOrdonneeCaracteristiques } from "./components/EtapeOrdonneeCaracteristiques";
import { EtapeValeurCaracteristiques } from "./components/EtapeValeurCaracteristiques";
import { EtapeAsymptotesCaracteristiques } from "./components/EtapeAsymptotesCaracteristiques";
import { ResultatPanelCaracteristiquesFonction } from "./components/ResultatPanelCaracteristiquesFonction";
import { ResumeSessionCaracteristiquesFonction } from "./components/ResumeSessionCaracteristiquesFonction";
import type { PhaseCaracteristiquesFonction } from "./core/caracteristiquesFonction.types";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCaracteristiquesFonction {
  return demarrerSessionCaracteristiquesFonction(REGLAGES_DEMO, genererExerciceCaracteristiquesFonction);
}

interface Bilan {
  resultat: ResultatExerciceCaracteristiquesFonction;
  exercice: ExerciceCaracteristiquesFonction;
}

const LIBELLE_PHASE: Record<PhaseCaracteristiquesFonction, string> = {
  domaine: "Domaine de définition",
  zeros: "Zéros",
  croissance: "Intervalles de croissance",
  decroissance: "Intervalles de décroissance",
  constance: "Constance",
  ordonnee: "Ordonnée à l'origine",
  valeur: "Valeur en un point",
  asymptotes: "Asymptotes",
};

export function AppCaracteristiquesFonction() {
  const [etat, setEtat] = useState<EtatSessionCaracteristiquesFonction>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function validerDomaine(reponse: Morceau[]) {
    setEtat(soumettreReponseDomaine(etat, reponse));
  }

  function validerZeros(reponse: ReponseZerosCaracteristiques) {
    setEtat(soumettreReponseZeros(etat, reponse));
  }

  function validerCroissance(reponse: Morceau[]) {
    setEtat(soumettreReponseCroissance(etat, reponse));
  }

  function validerDecroissance(reponse: Morceau[]) {
    setEtat(soumettreReponseDecroissance(etat, reponse));
  }

  function validerConstance(reponse: Morceau[]) {
    setEtat(soumettreReponseConstance(etat, reponse));
  }

  function validerOrdonnee(reponse: ReponseExistence) {
    setEtat(soumettreReponseOrdonnee(etat, reponse));
  }

  function validerValeur(reponse: ReponseExistence) {
    setEtat(soumettreReponseValeur(etat, reponse));
  }

  function validerAsymptotes(reponse: ReponseAsymptotesCaracteristiques) {
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseAsymptotes(etat, reponse);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Caractéristiques d'une fonction (lecture graphique)</h1>
        <p className="app-subtitle">Chapitre 2</p>
      </header>

      <main className="card">
        {enCoursDeSession && (
          <div className="card-progress">
            <div className="card-progress-row">
              <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
            </div>
          </div>
        )}

        <div className="card-body">
          {dernierBilan ? (
            <ResultatPanelCaracteristiquesFonction
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionCaracteristiquesFonction resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "domaine" ? (
            <EtapeDomaineCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerDomaine}
            />
          ) : etat.phase === "zeros" ? (
            <EtapeZerosCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerZeros}
            />
          ) : etat.phase === "croissance" ? (
            <EtapeCroissanceCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerCroissance}
            />
          ) : etat.phase === "decroissance" ? (
            <EtapeDecroissanceCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerDecroissance}
            />
          ) : etat.phase === "constance" ? (
            <EtapeConstanceCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerConstance}
            />
          ) : etat.phase === "ordonnee" ? (
            <EtapeOrdonneeCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerOrdonnee}
            />
          ) : etat.phase === "valeur" ? (
            <EtapeValeurCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerValeur}
            />
          ) : (
            <EtapeAsymptotesCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerAsymptotes}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
