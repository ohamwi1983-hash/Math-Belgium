import { useState } from "react";
import type { Categorie, Exercice } from "./core/generateur.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideChamp1,
  activerAideDevelopper,
  activerAideIsolement,
  activerAideSimplification,
  activerAideZeros,
  demarrerSession,
  diagnostiquerChampPrincipal,
  diagnostiquerIsolement,
  diagnostiquerSimplification,
  soumettreChoixCategorie,
  soumettreReponseChamp1,
  soumettreReponseChamp2,
  soumettreReponseDevelopper,
  soumettreReponseIsolement,
  soumettreReponseSimplification,
} from "./moteur";
import type { EtatSession, ReponseZeros, ResultatExercice } from "./moteur";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSecondDegre, type VarianteSecondDegreId } from "./generateurs/secondDegre";
import { EtapeSimplificationCoefficients } from "./components/EtapeSimplificationCoefficients";
import { EtapeIsolement } from "./components/EtapeIsolement";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReconnaissance } from "./components/EtapeReconnaissance";
import { EtapeChamp1 } from "./components/EtapeChamp1";
import { EtapeZeros } from "./components/EtapeZeros";
import { ResultatPanel } from "./components/ResultatPanel";
import { ResumeSession } from "./components/ResumeSession";
import { calculerRecapitulatif } from "./ui/recapitulatif";
import { calculerEtatActuel } from "./ui/etatActuel";
import { formatEnonceAffichage } from "./ui/formatEquation";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 5,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSession {
  return demarrerSession(REGLAGES_DEMO, genererExerciceSecondDegre);
}

interface Bilan {
  resultat: ResultatExercice;
  exercice: Exercice;
}

const LIBELLE_PHASE: Record<EtatSession["phase"], string> = {
  simplification: "Simplification",
  isolement: "Isolement",
  developper: "Développement",
  reconnaissance: "Reconnaissance",
  champ1: "Calcul",
  champ2: "Solutions",
};

/**
 * Consigne générale — rappelle l'objectif complet de l'exercice, affichée identique sur tous les
 * écrans de travail (jamais sur les écrans de résultat/résumé), redondante avec les consignes
 * spécifiques à chaque étape mais utile pour ne jamais perdre de vue l'objectif final (prompt du
 * 27/09) — même principe que ConsigneGeneraleEquationDroite/ConsigneGeneraleRelationsDroites (6e),
 * ici un texte fixe puisqu'il ne dépend d'aucune donnée de l'exercice.
 */
const CONSIGNE_GENERALE = "Résous l'équation suivante en utilisant la méthode la plus rapide.";

/**
 * true ssi la forme de surface isolée garde un produit x(x+b) non développé
 * (formeAffichage "produit_egale_constante") pour une catégorie qui a besoin de a,b,c explicites
 * (cas_general : Δ ; produit_remarquable : carré parfait c=(b/2)²) — dans ce seul cas, l'isolement
 * lui-même ne fait que regrouper ("Regroupe tous les termes du même côté."), et une étape
 * "developper" séparée suit (gen1 "regroupe avant de développer", prompt du 27/09 — voir
 * moteur/session.ts::necessiteDeveloppement, même condition). Pour isolee_constante/isolee_carre
 * (rien à développer, regrouper y produit déjà directement ax²+bx+c=0), l'isolement demande
 * directement cette forme générale, en un seul écran.
 */
function demandeFormeGeneraleDirecte(exercice: Exercice): boolean {
  const c = exercice.categorie;
  if (c !== "cas_general" && c !== "produit_remarquable") return false;
  return exercice.formeAffichage !== "produit_egale_constante";
}

export function AppMethodeRapide() {
  const [etat, setEtat] = useState<EtatSession>(nouvelleSession);
  const [dernierBilan, setDernierBilan] = useState<Bilan | null>(null);

  function validerSimplification(reponse: string) {
    setEtat(soumettreReponseSimplification(etat, reponse));
  }

  function validerIsolement(reponse: string) {
    setEtat(soumettreReponseIsolement(etat, reponse));
  }

  function choisirCategorie(choix: Categorie) {
    setEtat(soumettreChoixCategorie(etat, choix));
  }

  function validerChamp1(reponse: string) {
    setEtat(soumettreReponseChamp1(etat, reponse));
  }

  function activerAideEtapeSimplification() {
    setEtat(activerAideSimplification(etat));
  }

  function activerAideEtapeIsolement() {
    setEtat(activerAideIsolement(etat));
  }

  function validerDevelopper(reponse: string) {
    setEtat(soumettreReponseDevelopper(etat, reponse));
  }

  function activerAideEtapeDevelopper() {
    setEtat(activerAideDevelopper(etat));
  }

  function activerAideEtapeChamp1() {
    setEtat(activerAideChamp1(etat));
  }

  function activerAideEtapeZeros() {
    setEtat(activerAideZeros(etat));
  }

  function validerZeros(reponse: ReponseZeros) {
    const exerciceTermine = etat.exerciceCourant;
    const nouvelEtat = soumettreReponseChamp2(etat, reponse);
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      setDernierBilan({ resultat: nouvelEtat.resultats[nouvelEtat.resultats.length - 1], exercice: exerciceTermine });
    }
    setEtat(nouvelEtat);
  }

  const enCoursDeSession = !etat.terminee && !dernierBilan;
  const recapitulatif = calculerRecapitulatif(etat);
  const etatActuel = calculerEtatActuel(etat);
  // Bloc "énoncé" fixe : toujours l'exercice tel que généré, jamais la forme réduite par la
  // simplification (etat.exerciceCourant) — voir EtatSession.exerciceOriginal et le bug
  // utilisateur du 26/09 (état actuel montrant la mauvaise équation).
  const enonceFixe = formatEnonceAffichage(
    etat.exerciceOriginal.enonce,
    etat.exerciceOriginal.formeAffichage,
    etat.exerciceOriginal.parametresAffichage,
    etat.exerciceOriginal.irrationnel,
  );

  function onGenererDev(varianteId: string) {
    setDernierBilan(null);
    setEtat(demarrerSession(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteSecondDegreId)));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Second degré — choisir la méthode la plus rapide</h1>
        <p className="app-subtitle">Équations du second degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        {enCoursDeSession && (
          <div className="progress">
            <div className="progress-label">
              <span>
                Exercice {etat.indexExercice + 1} / {etat.reglages.nombreExercices}
              </span>
              <span>{LIBELLE_PHASE[etat.phase]}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(etat.indexExercice / etat.reglages.nombreExercices) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      <main className="card">
        {dernierBilan ? (
          <ResultatPanel
            resultat={dernierBilan.resultat}
            exercice={dernierBilan.exercice}
            afficherReponseApresEchec={etat.reglages.affichageReponseApresEchec}
            labelBouton={etat.terminee ? "Voir le résumé" : "Exercice suivant"}
            onContinuer={() => setDernierBilan(null)}
          />
        ) : etat.terminee ? (
          <ResumeSession resultats={etat.resultats} onRecommencer={() => setEtat(nouvelleSession())} />
        ) : (
          <>
            <p className="prompt-text">{CONSIGNE_GENERALE}</p>
            {etat.phase === "simplification" ? (
              <EtapeSimplificationCoefficients
                exercice={etat.exerciceCourant}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                diagnostiquer={(v) => diagnostiquerSimplification(etat.exerciceCourant, v)}
                aideActivee={etat.aideSimplificationUtilisee}
                onActiverAide={activerAideEtapeSimplification}
                onValider={validerSimplification}
              />
            ) : etat.phase === "isolement" ? (
              <EtapeIsolement
                exercice={etat.exerciceCourant}
                enonceFixe={enonceFixe}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                recapitulatif={recapitulatif}
                etatActuel={etatActuel}
                question={demandeFormeGeneraleDirecte(etat.exerciceCourant) ? undefined : "Regroupe tous les termes du même côté."}
                label={demandeFormeGeneraleDirecte(etat.exerciceCourant) ? undefined : null}
                diagnostiquer={(v) => diagnostiquerIsolement(etat.exerciceCourant, v)}
                aideActivee={etat.aideIsolementUtilisee}
                onActiverAide={activerAideEtapeIsolement}
                onValider={validerIsolement}
              />
            ) : etat.phase === "developper" ? (
              <EtapeIsolement
                exercice={etat.exerciceCourant}
                enonceFixe={enonceFixe}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                recapitulatif={recapitulatif}
                etatActuel={etatActuel}
                diagnostiquer={(v) => diagnostiquerIsolement(etat.exerciceCourant, v)}
                aideActivee={etat.aideDevelopperUtilisee}
                onActiverAide={activerAideEtapeDevelopper}
                onValider={validerDevelopper}
              />
            ) : etat.phase === "reconnaissance" ? (
              <EtapeReconnaissance
                exercice={etat.exerciceCourant}
                enonceFixe={enonceFixe}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                recapitulatif={recapitulatif}
                etatActuel={etatActuel}
                onChoisir={choisirCategorie}
              />
            ) : etat.phase === "champ1" ? (
              <EtapeChamp1
                exercice={etat.exerciceCourant}
                enonceFixe={enonceFixe}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                recapitulatif={recapitulatif}
                etatActuel={etatActuel}
                diagnostiquer={(v) => diagnostiquerChampPrincipal(etat.exerciceCourant, v)}
                aideActivee={etat.aideChamp1Utilisee}
                onActiverAide={activerAideEtapeChamp1}
                onValider={validerChamp1}
              />
            ) : (
              <EtapeZeros
                exercice={etat.exerciceCourant}
                enonceFixe={enonceFixe}
                tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
                tentativesMax={etat.reglages.tentativesMax}
                recapitulatif={recapitulatif}
                etatActuel={etatActuel}
                aideActivee={etat.aideZerosUtilisee}
                onActiverAide={activerAideEtapeZeros}
                onValider={validerZeros}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
