import { useState } from "react";
import type {
  ExerciceFormeCanoniqueFonctionReference,
  FamilleReference,
  ReponseCanoniqueFR,
  ReponseEhChSoy,
  ReponseEvCvSoxFR,
  ReponseThFR,
  ReponseTvFR,
} from "./core/formeCanoniqueFonctionsReference.types";
import type { ReglagesSession } from "./core/session.types";
import {
  demarrerSessionFormeCanoniqueFonctionReference,
  soumettreChoixFamilleFR,
  soumettreReponseCanoniqueFR,
  soumettreReponseEhChSoy,
  soumettreReponseEvCvSoxFR,
  soumettreReponseThFR,
  soumettreReponseTvFR,
} from "./moteur/sessionFormeCanoniqueFonctionsReference";
import type {
  EtatSessionFormeCanoniqueFonctionReference,
  PhaseFormeCanoniqueFonctionReference,
  ResultatExerciceFormeCanoniqueFonctionReference,
} from "./moteur/typesFormeCanoniqueFonctionsReference";
import {
  CATALOGUE_VARIANTES,
  construireAvecFamille,
  genererExerciceFormeCanoniqueFonctionReference,
} from "./generateurs/formeCanoniqueFonctionsReference";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReconnaissanceFormeCanoniqueFR } from "./components/EtapeReconnaissanceFormeCanoniqueFR";
import { EtapeCanoniqueFR } from "./components/EtapeCanoniqueFR";
import { EtapeEhChSoy } from "./components/EtapeEhChSoy";
import { EtapeThFR } from "./components/EtapeThFR";
import { EtapeEvCvSoxFR } from "./components/EtapeEvCvSoxFR";
import { EtapeTvFR } from "./components/EtapeTvFR";
import { ResultatPanelFormeCanoniqueFonctionsReference } from "./components/ResultatPanelFormeCanoniqueFonctionsReference";
import { ResumeSessionFormeCanoniqueFonctionsReference } from "./components/ResumeSessionFormeCanoniqueFonctionsReference";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionFormeCanoniqueFonctionReference {
  return demarrerSessionFormeCanoniqueFonctionReference(REGLAGES_DEMO, genererExerciceFormeCanoniqueFonctionReference);
}

interface Bilan {
  resultat: ResultatExerciceFormeCanoniqueFonctionReference;
  exercice: ExerciceFormeCanoniqueFonctionReference;
}

const LIBELLE_PHASE: Record<PhaseFormeCanoniqueFonctionReference, string> = {
  reconnaissance: "Reconnaissance de la famille",
  canonique: "Forme canonique",
  ehChSoy: "Étirement / compression / symétrie horizontale",
  th: "Translation horizontale",
  evCvSox: "Étirement / compression / symétrie verticale",
  tv: "Translation verticale",
};

export function AppFormeCanoniqueFonctionsReference() {
  const [etat, setEtat] = useState<EtatSessionFormeCanoniqueFonctionReference>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function validerFamille(choix: FamilleReference) {
    setEtat(soumettreChoixFamilleFR(etat, choix));
  }

  function validerCanonique(reponse: ReponseCanoniqueFR) {
    setEtat(soumettreReponseCanoniqueFR(etat, reponse));
  }

  function validerEhChSoy(reponse: ReponseEhChSoy) {
    setEtat(soumettreReponseEhChSoy(etat, reponse));
  }

  function validerTh(reponse: ReponseThFR) {
    setEtat(soumettreReponseThFR(etat, reponse));
  }

  function validerEvCvSox(reponse: ReponseEvCvSoxFR) {
    setEtat(soumettreReponseEvCvSoxFR(etat, reponse));
  }

  function validerTv(reponse: ReponseTvFR) {
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseTvFR(etat, reponse);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  function onGenererDev(familleId: string) {
    setDernierBilan(null);
    setEtat(demarrerSessionFormeCanoniqueFonctionReference(REGLAGES_DEMO, () => construireAvecFamille(familleId as FamilleReference)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Forme canonique et transformations — fonctions de référence</h1>
        <p className="app-subtitle">Chapitre 2</p>
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
          {dernierBilan ? (
            <ResultatPanelFormeCanoniqueFonctionsReference
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionFormeCanoniqueFonctionsReference resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
          ) : etat.phase === "reconnaissance" ? (
            <EtapeReconnaissanceFormeCanoniqueFR
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onChoisir={validerFamille}
            />
          ) : etat.phase === "canonique" ? (
            <EtapeCanoniqueFR
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerCanonique}
            />
          ) : etat.phase === "ehChSoy" ? (
            <EtapeEhChSoy
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerEhChSoy}
            />
          ) : etat.phase === "th" ? (
            <EtapeThFR
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerTh}
            />
          ) : etat.phase === "evCvSox" ? (
            <EtapeEvCvSoxFR
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerEvCvSox}
            />
          ) : (
            <EtapeTvFR
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerTv}
            />
          )}{" "}
        </div>
      </main>
    </div>
  );
}
