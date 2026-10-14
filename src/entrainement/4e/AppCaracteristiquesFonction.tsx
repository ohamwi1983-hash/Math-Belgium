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
import { EnTeteExercice } from "./components/EnTeteExercice";
import { MafsGraphCaracteristiquesFonction } from "./components/MafsGraphCaracteristiquesFonction";
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
import { etatListeInitiale } from "./ui/listeMorceaux";
import type { EtatListeMorceaux } from "./ui/listeMorceaux";
import { morceauxCompletsPourSurlignage } from "./ui/surlignageCaracteristiques";

const CONSIGNE_GENERALE = "Lis les caractéristiques de cette fonction sur son graphique.";

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

/** Phases dont la réponse se construit via `ListeMorceauxInput` — seules celles-ci surlignent le
 * graphe en temps réel (`blocDonnees`, voir plus bas) à partir de la construction en cours. */
const PHASES_AVEC_LISTE = new Set<PhaseCaracteristiquesFonction>(["domaine", "croissance", "decroissance", "constance"]);

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

  /** Bloc de données centralisé (`EnTeteExercice`) — le graphique Mafs était redessiné à l'identique
   * (même `exercice`) sur les 8 écrans (`MafsGraphCaracteristiquesFonction.tsx`, doc : "affiché en
   * permanence sur les 8 écrans, sans variation"). Le surlignage, lui, dépend de la construction en
   * cours via `ListeMorceauxInput` sur 4 des 8 écrans (domaine/croissance/decroissance/constance) —
   * son état (`liste`) est donc remonté ici plutôt que local à chaque Etape, pour rester visible au
   * moment de calculer `blocDonnees`. Reset explicite à chaque changement de phase (plutôt qu'un
   * montage/démontage de composant comme avant) : même comportement que l'ancien `useState` local,
   * qui se réinitialisait à chaque remontage d'un nouvel Etape. */
  const [liste, setListe] = useState<EtatListeMorceaux>(etatListeInitiale());
  const [phasePourListe, setPhasePourListe] = useState(etat.phase);
  if (phasePourListe !== etat.phase) {
    setPhasePourListe(etat.phase);
    setListe(etatListeInitiale());
  }

  const blocDonnees = (
    <MafsGraphCaracteristiquesFonction exercice={exercice} surlignage={PHASES_AVEC_LISTE.has(etat.phase) ? morceauxCompletsPourSurlignage(liste) : undefined} />
  );

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
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          {etat.phase === "domaine" ? (
            <EtapeDomaineCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              liste={liste}
              onChangeListe={setListe}
              onValider={validerDomaine}
              validation={validation}
            />
          ) : etat.phase === "zeros" ? (
            <EtapeZerosCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerZeros}
              validation={validation}
            />
          ) : etat.phase === "croissance" ? (
            <EtapeCroissanceCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              liste={liste}
              onChangeListe={setListe}
              onValider={validerCroissance}
              validation={validation}
            />
          ) : etat.phase === "decroissance" ? (
            <EtapeDecroissanceCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              liste={liste}
              onChangeListe={setListe}
              onValider={validerDecroissance}
              validation={validation}
            />
          ) : etat.phase === "constance" ? (
            <EtapeConstanceCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              liste={liste}
              onChangeListe={setListe}
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
