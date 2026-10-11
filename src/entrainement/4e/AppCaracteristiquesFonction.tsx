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
import type { EtatSessionCaracteristiquesFonction } from "./moteur/typesCaracteristiquesFonction";
import { genererExerciceCaracteristiquesFonction } from "./generateurs/caracteristiquesFonction";
import { EtapeDomaineCaracteristiques } from "./components/EtapeDomaineCaracteristiques";
import { EtapeZerosCaracteristiques } from "./components/EtapeZerosCaracteristiques";
import { EtapeCroissanceCaracteristiques } from "./components/EtapeCroissanceCaracteristiques";
import { EtapeDecroissanceCaracteristiques } from "./components/EtapeDecroissanceCaracteristiques";
import { EtapeConstanceCaracteristiques } from "./components/EtapeConstanceCaracteristiques";
import { EtapeOrdonneeCaracteristiques } from "./components/EtapeOrdonneeCaracteristiques";
import { EtapeValeurCaracteristiques } from "./components/EtapeValeurCaracteristiques";
import { EtapeAsymptotesCaracteristiques } from "./components/EtapeAsymptotesCaracteristiques";
import {
  constanceAttendueCaracteristiques,
  croissanceAttendueCaracteristiques,
  decroissanceAttendueCaracteristiques,
  domaineCaracteristiques,
  evaluerCourbeCaracteristiques,
  existeOrdonneeCaracteristiques,
  existeValeurEnVCaracteristiques,
} from "./moteur/verificationCaracteristiquesFonction";
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

/** Arrondi d'affichage (3 décimales) pour une révélation — jamais utilisé pour la vérification elle-même. */
function formatNombre(valeur: number): string {
  return `${Number(valeur.toFixed(3))}`;
}

function formatMorceau(m: Morceau): string {
  return `${m.crochetGauche}${m.borneGauche} ; ${m.borneDroite}${m.crochetDroit}`;
}

function formatDomaineAttendu(exercice: ExerciceCaracteristiquesFonction): string {
  return domaineCaracteristiques(exercice).map(formatMorceau).join(" ∪ ");
}

function formatZerosAttendus(exercice: ExerciceCaracteristiquesFonction): string {
  if (exercice.zeros.length === 0) return "aucun";
  return [...exercice.zeros].sort((a, b) => a - b).join(" ; ");
}

function formatMorceaux(morceaux: Morceau[]): string {
  return morceaux.map(formatMorceau).join(" ∪ ");
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCaracteristiquesFonction;
  revele: boolean;
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
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionCaracteristiquesFonction) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "domaine"
          ? nouvelEtat.domaineRevele
          : etat.phase === "zeros"
            ? nouvelEtat.zerosRevele
            : etat.phase === "croissance"
              ? nouvelEtat.croissanceRevele
              : etat.phase === "decroissance"
                ? nouvelEtat.decroissanceRevele
                : etat.phase === "constance"
                  ? nouvelEtat.constanceRevele
                  : etat.phase === "ordonnee"
                    ? nouvelEtat.ordonneeRevele
                    : etat.phase === "valeur"
                      ? nouvelEtat.valeurRevele
                      : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.asymptotesRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function validerDomaine(reponse: Morceau[]) {
    terminerEtape(soumettreReponseDomaine(etat, reponse));
  }

  function validerZeros(reponse: ReponseZerosCaracteristiques) {
    terminerEtape(soumettreReponseZeros(etat, reponse));
  }

  function validerCroissance(reponse: Morceau[]) {
    terminerEtape(soumettreReponseCroissance(etat, reponse));
  }

  function validerDecroissance(reponse: Morceau[]) {
    terminerEtape(soumettreReponseDecroissance(etat, reponse));
  }

  function validerConstance(reponse: Morceau[]) {
    terminerEtape(soumettreReponseConstance(etat, reponse));
  }

  function validerOrdonnee(reponse: ReponseExistence) {
    terminerEtape(soumettreReponseOrdonnee(etat, reponse));
  }

  function validerValeur(reponse: ReponseExistence) {
    terminerEtape(soumettreReponseValeur(etat, reponse));
  }

  function validerAsymptotes(reponse: ReponseAsymptotesCaracteristiques) {
    terminerEtape(soumettreReponseAsymptotes(etat, reponse));
  }

  const exercice = etat.exerciceCourant;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "domaine" ? (
              <>Domaine attendu : {formatDomaineAttendu(exercice)}</>
            ) : etat.phase === "zeros" ? (
              <>Zéros attendus : {formatZerosAttendus(exercice)}</>
            ) : etat.phase === "croissance" ? (
              <>Croissance attendue : {formatMorceaux(croissanceAttendueCaracteristiques(exercice))}</>
            ) : etat.phase === "decroissance" ? (
              <>Décroissance attendue : {formatMorceaux(decroissanceAttendueCaracteristiques(exercice))}</>
            ) : etat.phase === "constance" ? (
              <>Constance attendue : {formatMorceaux(constanceAttendueCaracteristiques(exercice))}</>
            ) : etat.phase === "ordonnee" ? (
              <>
                f(0) attendu :{" "}
                {existeOrdonneeCaracteristiques(exercice) ? formatNombre(evaluerCourbeCaracteristiques(exercice, 0)) : "n'existe pas"}
              </>
            ) : etat.phase === "valeur" ? (
              <>
                f({exercice.v}) attendu :{" "}
                {existeValeurEnVCaracteristiques(exercice)
                  ? formatNombre(evaluerCourbeCaracteristiques(exercice, exercice.v))
                  : "n'existe pas"}
              </>
            ) : (
              <>
                Asymptotes attendues : x = {exercice.AV} ; y = {exercice.L}
              </>
            ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Caractéristiques d'une fonction (lecture graphique)</h1>
        <p className="app-subtitle">Chapitre 2</p>
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
          {etat.phase === "domaine" ? (
            <EtapeDomaineCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerDomaine}
              validation={validation}
            />
          ) : etat.phase === "zeros" ? (
            <EtapeZerosCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerZeros}
              validation={validation}
            />
          ) : etat.phase === "croissance" ? (
            <EtapeCroissanceCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerCroissance}
              validation={validation}
            />
          ) : etat.phase === "decroissance" ? (
            <EtapeDecroissanceCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerDecroissance}
              validation={validation}
            />
          ) : etat.phase === "constance" ? (
            <EtapeConstanceCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerConstance}
              validation={validation}
            />
          ) : etat.phase === "ordonnee" ? (
            <EtapeOrdonneeCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerOrdonnee}
              validation={validation}
            />
          ) : etat.phase === "valeur" ? (
            <EtapeValeurCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerValeur}
              validation={validation}
            />
          ) : (
            <EtapeAsymptotesCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerAsymptotes}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
