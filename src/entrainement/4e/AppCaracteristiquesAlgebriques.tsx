import { useState } from "react";
import type { ReglagesFamillesFonctionReference } from "./core/fonctionsReference.types";
import type {
  ExerciceCaracteristiquesAlgebriques,
  NiveauCaracteristiquesAlgebriques,
  ReponseCE,
  ReponseCondition,
  ReponseDomaine,
  ReponseExistence,
  ReponseResolutionBranches,
  ReponseSeparation,
  ReponseZerosCaracteristiques,
} from "./core/caracteristiquesAlgebriques.types";
import type { PhaseCaracteristiquesAlgebriques } from "./core/caracteristiquesAlgebriques.types";
import type { ReglagesSession } from "./core/session.types";
import {
  demarrerSessionCaracteristiquesAlgebriques,
  soumettreReponseCE,
  soumettreReponseDebarrasser,
  soumettreReponseDomaine,
  soumettreReponseIsolement,
  soumettreReponseOrdonnee,
  soumettreReponseRegroupe,
  soumettreReponseResolutionBranches,
  soumettreReponseSeparation,
  soumettreReponseValidationSolution,
  soumettreReponseValidite,
  soumettreReponseZeros,
} from "./moteur/sessionCaracteristiquesAlgebriques";
import { necessiteRegroupe, necessiteValidite } from "./moteur/verificationCaracteristiquesAlgebriques";
import type { EtatSessionCaracteristiquesAlgebriques, ResultatExerciceCaracteristiquesAlgebriques } from "./moteur/typesCaracteristiquesAlgebriques";
import {
  CATALOGUE_VARIANTES,
  construireNiveau1AvecFamille,
  construireNiveau2AvecFamille,
  creerGenerateurCaracteristiquesAlgebriques,
} from "./generateurs/caracteristiquesAlgebriques";
import type { FamilleReference } from "./core/fonctionsReference.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { calculerEtatActuelCaracteristiquesAlgebriques } from "./ui/etatActuelCaracteristiquesAlgebriques";
import { EtapeReglagesCaracteristiquesAlgebriques } from "./components/EtapeReglagesCaracteristiquesAlgebriques";
import { EtapeOrdonneeAlgebrique } from "./components/EtapeOrdonneeAlgebrique";
import { EtapeCE } from "./components/EtapeCE";
import { EtapeDomaineNiveau1 } from "./components/EtapeDomaineNiveau1";
import { EtapeIsolementNiveau1 } from "./components/EtapeIsolementNiveau1";
import { EtapeSeparation } from "./components/EtapeSeparation";
import { EtapeDebarrasser } from "./components/EtapeDebarrasser";
import { EtapeConditionValidite } from "./components/EtapeConditionValidite";
import { EtapeRegroupe } from "./components/EtapeRegroupe";
import { EtapeResolutionBranches } from "./components/EtapeResolutionBranches";
import { EtapeValidationSolution } from "./components/EtapeValidationSolution";
import { EtapeZerosAlgebrique } from "./components/EtapeZerosAlgebrique";
import { ResultatPanelCaracteristiquesAlgebriques } from "./components/ResultatPanelCaracteristiquesAlgebriques";
import { ResumeSessionCaracteristiquesAlgebriques } from "./components/ResumeSessionCaracteristiquesAlgebriques";

const NOMBRE_EXERCICES_ALEATOIRE = 5;

const REGLAGES_BASE = {
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
} as const;

/** Démarre (ou redémarre) une session à partir du réglage de sélection des familles et du niveau
 * (`prompt-niveau2caracteristiquesalgebriques.md`) — même principe que `AppFonctionsReference.tsx`
 * (dixième exercice). */
function demarrer(
  reglagesFamilles: ReglagesFamillesFonctionReference,
  niveau: NiveauCaracteristiquesAlgebriques,
): EtatSessionCaracteristiquesAlgebriques {
  const nombreExercices =
    reglagesFamilles.mode === "aleatoire"
      ? NOMBRE_EXERCICES_ALEATOIRE
      : Object.values(reglagesFamilles.quantites).reduce((total: number, quantite: number) => total + quantite, 0);
  const reglagesSession: ReglagesSession = { ...REGLAGES_BASE, nombreExercices };
  return demarrerSessionCaracteristiquesAlgebriques(reglagesSession, creerGenerateurCaracteristiquesAlgebriques(reglagesFamilles, niveau));
}

interface Bilan {
  resultat: ResultatExerciceCaracteristiquesAlgebriques;
  exercice: ExerciceCaracteristiquesAlgebriques;
}

const LIBELLE_PHASE: Record<PhaseCaracteristiquesAlgebriques, string> = {
  ordonnee: "Ordonnée à l'origine",
  ce: "Conditions d'existence",
  domaine: "Domaine de définition",
  isolement: "Zéros — isolement",
  separation: "Zéros — séparation",
  debarrasser: "Zéros — se débarrasser de...",
  validite: "Validité de l'équation",
  regroupe: "Zéros — regroupe",
  resolutionBranches: "Zéros — résolution des branches",
  validationSolution: "Zéros — validation",
  zeros: "Zéros",
};

export function AppCaracteristiquesAlgebriques() {
  const [reglagesFamilles, setReglagesFamilles] = useState<ReglagesFamillesFonctionReference | null>(null);
  const [niveau, setNiveau] = useState<NiveauCaracteristiquesAlgebriques>("niveau1");
  const [etat, setEtat] = useState<EtatSessionCaracteristiquesAlgebriques | null>(null);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function commencerSession(reglages: ReglagesFamillesFonctionReference, niveauChoisi: NiveauCaracteristiquesAlgebriques) {
    setReglagesFamilles(reglages);
    setNiveau(niveauChoisi);
    setEtat(demarrer(reglages, niveauChoisi));
  }

  function recommencer() {
    if (reglagesFamilles) setEtat(demarrer(reglagesFamilles, niveau));
  }

  function onGenererDev(familleId: string) {
    setDernierBilan(null);
    const reglagesSession: ReglagesSession = { ...REGLAGES_BASE, nombreExercices: NOMBRE_EXERCICES_ALEATOIRE };
    const construireAvecNiveauCourant = niveau === "niveau1" ? construireNiveau1AvecFamille : construireNiveau2AvecFamille;
    setEtat(demarrerSessionCaracteristiquesAlgebriques(reglagesSession, () => construireAvecNiveauCourant(familleId as FamilleReference)));
  }

  function validerOrdonnee(reponse: ReponseExistence) {
    if (etat) setEtat(soumettreReponseOrdonnee(etat, reponse));
  }

  function validerCE(reponse: ReponseCE) {
    if (etat) setEtat(soumettreReponseCE(etat, reponse));
  }

  function validerDomaine(reponse: ReponseDomaine) {
    if (etat) setEtat(soumettreReponseDomaine(etat, reponse));
  }

  function validerIsolement(reponse: string) {
    if (etat) setEtat(soumettreReponseIsolement(etat, reponse));
  }

  function validerSeparation(reponse: ReponseSeparation) {
    if (etat) setEtat(soumettreReponseSeparation(etat, reponse));
  }

  function validerDebarrasser(reponse: string) {
    if (etat) setEtat(soumettreReponseDebarrasser(etat, reponse));
  }

  function validerValidite(reponse: ReponseCondition) {
    if (etat) setEtat(soumettreReponseValidite(etat, reponse));
  }

  function validerRegroupe(reponse: string) {
    if (etat) setEtat(soumettreReponseRegroupe(etat, reponse));
  }

  function validerResolutionBranches(reponse: ReponseResolutionBranches) {
    if (etat) setEtat(soumettreReponseResolutionBranches(etat, reponse));
  }

  function validerValidationSolution(reponse: boolean) {
    if (etat) setEtat(soumettreReponseValidationSolution(etat, reponse));
  }

  function validerZeros(reponse: ReponseZerosCaracteristiques) {
    if (!etat) return;
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseZeros(etat, reponse);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  if (!etat) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <p className="app-eyebrow">4e — Entraînement</p>
          <h1 className="app-title">Caractéristiques algébriques d'une fonction de référence</h1>
          <p className="app-subtitle">Chapitre 2</p>
          <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        </header>
        <main className="card">
          <div className="card-body">
            <EtapeReglagesCaracteristiquesAlgebriques onCommencer={commencerSession} />
          </div>
        </main>
      </div>
    );
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Caractéristiques algébriques d'une fonction de référence</h1>
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
            <ResultatPanelCaracteristiquesAlgebriques
              resultat={dernierBilan.resultat}
              exercice={dernierBilan.exercice}
              afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
              labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
              onContinuer={() => setDernierBilan(null)}
            />
          ) : etat.terminee ? (
            <ResumeSessionCaracteristiquesAlgebriques resultats={etat.resultats} onRecommencer={recommencer} />
          ) : etat.phase === "ordonnee" ? (
            <EtapeOrdonneeAlgebrique
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerOrdonnee}
            />
          ) : etat.phase === "ce" ? (
            <EtapeCE
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerCE}
            />
          ) : etat.phase === "domaine" ? (
            <EtapeDomaineNiveau1
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerDomaine}
            />
          ) : etat.phase === "isolement" ? (
            <EtapeIsolementNiveau1
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerIsolement}
            />
          ) : etat.phase === "separation" ? (
            <EtapeSeparation
              exercice={etat.exerciceCourant}
              etatActuel={calculerEtatActuelCaracteristiquesAlgebriques(etat)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerSeparation}
            />
          ) : etat.phase === "debarrasser" ? (
            <EtapeDebarrasser
              exercice={etat.exerciceCourant}
              etatActuel={calculerEtatActuelCaracteristiquesAlgebriques(etat)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerDebarrasser}
            />
          ) : etat.phase === "validite" && necessiteValidite(etat.exerciceCourant) ? (
            <EtapeConditionValidite
              exercice={etat.exerciceCourant}
              etatActuel={calculerEtatActuelCaracteristiquesAlgebriques(etat)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerValidite}
            />
          ) : etat.phase === "regroupe" && necessiteRegroupe(etat.exerciceCourant) ? (
            <EtapeRegroupe
              exercice={etat.exerciceCourant}
              etatActuel={calculerEtatActuelCaracteristiquesAlgebriques(etat)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerRegroupe}
            />
          ) : etat.phase === "resolutionBranches" &&
            etat.exerciceCourant.niveau === "niveau2" &&
            etat.exerciceCourant.famille === "valeur_absolue" ? (
            <EtapeResolutionBranches
              exercice={etat.exerciceCourant}
              etatActuel={calculerEtatActuelCaracteristiquesAlgebriques(etat)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerResolutionBranches}
            />
          ) : etat.phase === "validationSolution" && necessiteValidite(etat.exerciceCourant) ? (
            <EtapeValidationSolution
              key={etat.scoresValidationSolutionExercice.length}
              exercice={etat.exerciceCourant}
              etatActuel={calculerEtatActuelCaracteristiquesAlgebriques(etat)}
              index={etat.scoresValidationSolutionExercice.length}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerValidationSolution}
            />
          ) : (
            <EtapeZerosAlgebrique
              exercice={etat.exerciceCourant}
              etatActuel={calculerEtatActuelCaracteristiquesAlgebriques(etat)}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerZeros}
            />
          )}
        </div>
      </main>
    </div>
  );
}
