import { useState } from "react";
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
import type { EtatSessionBienaymeTchebychev } from "./moteur/typesBienaymeTchebychev";
import { SEQUENCES } from "./moteur/typesBienaymeTchebychev";
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
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifBienaymeTchebychev } from "./ui/recapitulatifBienaymeTchebychev";
import {
  formatEnonceSegments,
  formatIntervalleAttenduTexte,
  formatKAttenduTexte,
  formatNombreAttenduTexte,
  formatPourcentAttenduTexte,
  formatPourcentDepuisNombreAttenduTexte,
  formatSigmaAttenduTexte,
  formatXBarAttenduTexte,
} from "./ui/formatBienaymeTchebychev";
import { SegmentsInline } from "./components/SegmentsInline";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionBienaymeTchebychev {
  return demarrerSessionBienaymeTchebychev(REGLAGES_DEMO, genererExerciceBienaymeTchebychev);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionBienaymeTchebychev;
  revele: boolean;
}

/**
 * `revele` de l'écran qui vient de se clore (`etat.phase`, AVANT application de `nouvelEtat`) :
 * présent dans `scoresAccumules` sauf pour la DERNIÈRE phase de la séquence de la variante, dont la
 * clôture vide/remplace `scoresAccumules` (nouvel exercice, ou session terminée) — repris alors
 * depuis le `resultat` qui vient d'être poussé dans `resultats`.
 */
function reveleEcranClos(
  etat: EtatSessionBienaymeTchebychev,
  nouvelEtat: EtatSessionBienaymeTchebychev,
): boolean {
  const entree = nouvelEtat.scoresAccumules[etat.phase];
  if (entree) return entree.revele;
  const dernier = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
  switch (etat.phase) {
    case "v1Pourcent":
      return dernier.v1PourcentRevele;
    case "v2Intervalle":
      return dernier.v2IntervalleRevele;
    case "v3Nombre":
      return dernier.v3NombreRevele;
    case "v4Intervalle":
      return dernier.v4IntervalleRevele;
    case "v5Sigma":
      return dernier.v5SigmaRevele;
    case "v6XBar":
      return dernier.v6XBarRevele;
    case "v7Sigma":
      return dernier.v7SigmaRevele;
    case "v8XBar":
      return dernier.v8XBarRevele;
    default:
      throw new Error(`reveleEcranClos : phase finale inattendue ${etat.phase}`);
  }
}

/**
 * Réponse attendue de l'écran qui vient de se clore (`etat.phase`) — réplique exactement les 20
 * blocs `answer-reveal` de `ResultatPanelBienaymeTchebychev` (un par couple variante/phase), au
 * lieu de les sélectionner par score nul : la narrowing sur `exercice.variante` reste nécessaire
 * pour les signatures `formatXxxAttenduTexte` qui attendent la forme spécifique à la variante.
 */
function construireReponseAttendue(
  etat: EtatSessionBienaymeTchebychev,
  exercice: EtatSessionBienaymeTchebychev["exerciceCourant"],
) {
  if (exercice.variante === "intervalleVersPourcent") {
    if (etat.phase === "v1K") return <>k attendu : {formatKAttenduTexte(exercice)}</>;
    if (etat.phase === "v1Pourcent") return <>% minimal attendu : {formatPourcentAttenduTexte(exercice)}</>;
  }
  if (exercice.variante === "pourcentVersIntervalle") {
    if (etat.phase === "v2K") return <>k attendu : {formatKAttenduTexte(exercice)}</>;
    if (etat.phase === "v2Intervalle") return <>Intervalle attendu : {formatIntervalleAttenduTexte(exercice)}</>;
  }
  if (exercice.variante === "intervalleVersNombre") {
    if (etat.phase === "v3K") return <>k attendu : {formatKAttenduTexte(exercice)}</>;
    if (etat.phase === "v3Pourcent") return <>% minimal attendu : {formatPourcentAttenduTexte(exercice)}</>;
    if (etat.phase === "v3Nombre") return <>Nombre minimal attendu : {formatNombreAttenduTexte(exercice.nMinAttendu)}</>;
  }
  if (exercice.variante === "nombreVersIntervalle") {
    if (etat.phase === "v4Pourcent0") return <>% minimal attendu : {formatPourcentDepuisNombreAttenduTexte(exercice)}</>;
    if (etat.phase === "v4K") return <>k attendu : {formatKAttenduTexte(exercice)}</>;
    if (etat.phase === "v4Intervalle") return <>Intervalle attendu : {formatIntervalleAttenduTexte(exercice)}</>;
  }
  if (exercice.variante === "intervalleVersSigma") {
    if (etat.phase === "v5K") return <>k attendu : {formatKAttenduTexte(exercice)}</>;
    if (etat.phase === "v5Sigma") return <>σ attendu : {formatSigmaAttenduTexte(exercice)}</>;
  }
  if (exercice.variante === "intervalleVersXBar") {
    if (etat.phase === "v6K") return <>k attendu : {formatKAttenduTexte(exercice)}</>;
    if (etat.phase === "v6XBar") return <>x̄ attendu : {formatXBarAttenduTexte(exercice)}</>;
  }
  if (exercice.variante === "nombreVersSigma") {
    if (etat.phase === "v7Pourcent0") return <>% minimal attendu : {formatPourcentDepuisNombreAttenduTexte(exercice)}</>;
    if (etat.phase === "v7K") return <>k attendu : {formatKAttenduTexte(exercice)}</>;
    if (etat.phase === "v7Sigma") return <>σ attendu : {formatSigmaAttenduTexte(exercice)}</>;
  }
  if (exercice.variante === "nombreVersXBar") {
    if (etat.phase === "v8Pourcent0") return <>% minimal attendu : {formatPourcentDepuisNombreAttenduTexte(exercice)}</>;
    if (etat.phase === "v8K") return <>k attendu : {formatKAttenduTexte(exercice)}</>;
    if (etat.phase === "v8XBar") return <>x̄ attendu : {formatXBarAttenduTexte(exercice)}</>;
  }
  return undefined;
}

/** Segments de la barre de puces — réutilise `SEQUENCES` (même séquence réelle que le récapitulatif,
 * jamais une deuxième reconstitution) et `scoresAccumules[phase]` (score/aide déjà capturés à la
 * clôture de chaque écran, voir `ui/recapitulatifBienaymeTchebychev.ts`). La dernière phase de
 * chaque variante (toujours terminale) n'a jamais besoin de sa propre branche "close" — même
 * principe que `AppOptimisation.tsx`. Puces purement visuelles (pas de `onSegmentClick`). */
function calculerSegmentsProgression(etat: EtatSessionBienaymeTchebychev): EtatPuceProgression[] {
  const sequence = SEQUENCES[etat.exerciceCourant.variante];
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const entree = etat.scoresAccumules[phase]!;
    if (entree.revele) return "revele";
    return entree.niveauAide > 0 ? "aide" : "correcte";
  });
}

export function AppBienaymeTchebychev() {
  const [etat, setEtat] = useState<EtatSessionBienaymeTchebychev>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionBienaymeTchebychev) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: reveleEcranClos(etat, nouvelEtat) });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifBienaymeTchebychev(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionBienaymeTchebychev(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteBienaymeTchebychev)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : construireReponseAttendue(etat, exercice),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Inégalité de Bienaymé-Tchebychev</h1>
        <p className="app-subtitle">Chapitre 5 — Statistiques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={<SegmentsInline segments={formatEnonceSegments(exercice)} />} blocDonnees={null} />
          <RecapitulatifPanel entrees={recapitulatif} />
          <CalculatriceScientifique />
          {etat.phase === "v1K" && exercice.variante === "intervalleVersPourcent" ? (
            <EtapeKDepuisIntervalle
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV1K(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v1Pourcent" && exercice.variante === "intervalleVersPourcent" ? (
            <EtapePourcentFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV1Pourcent(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v2K" && exercice.variante === "pourcentVersIntervalle" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV2K(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v2Intervalle" && exercice.variante === "pourcentVersIntervalle" ? (
            <EtapeIntervalleFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(borneInf, borneSup) => terminerEtape(soumettreReponseV2Intervalle(etat, { borneInf, borneSup }))}
              validation={validation}
            />
          ) : etat.phase === "v3K" && exercice.variante === "intervalleVersNombre" ? (
            <EtapeKDepuisIntervalle
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV3K(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v3Pourcent" && exercice.variante === "intervalleVersNombre" ? (
            <EtapePourcentFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV3Pourcent(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v3Nombre" && exercice.variante === "intervalleVersNombre" ? (
            <EtapeNombreFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(texte) => terminerEtape(soumettreReponseV3Nombre(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v4Pourcent0" && exercice.variante === "nombreVersIntervalle" ? (
            <EtapePourcentDepuisNombre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(texte) => terminerEtape(soumettreReponseV4Pourcent0(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v4K" && exercice.variante === "nombreVersIntervalle" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV4K(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v4Intervalle" && exercice.variante === "nombreVersIntervalle" ? (
            <EtapeIntervalleFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(borneInf, borneSup) => terminerEtape(soumettreReponseV4Intervalle(etat, { borneInf, borneSup }))}
              validation={validation}
            />
          ) : etat.phase === "v5K" && exercice.variante === "intervalleVersSigma" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV5K(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v5Sigma" && exercice.variante === "intervalleVersSigma" ? (
            <EtapeSigmaFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV5Sigma(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v6K" && exercice.variante === "intervalleVersXBar" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV6K(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v6XBar" && exercice.variante === "intervalleVersXBar" ? (
            <EtapeXBarFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV6XBar(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v7Pourcent0" && exercice.variante === "nombreVersSigma" ? (
            <EtapePourcentDepuisNombre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(texte) => terminerEtape(soumettreReponseV7Pourcent0(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v7K" && exercice.variante === "nombreVersSigma" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV7K(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v7Sigma" && exercice.variante === "nombreVersSigma" ? (
            <EtapeSigmaFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV7Sigma(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v8Pourcent0" && exercice.variante === "nombreVersXBar" ? (
            <EtapePourcentDepuisNombre
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(texte) => terminerEtape(soumettreReponseV8Pourcent0(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v8K" && exercice.variante === "nombreVersXBar" ? (
            <EtapeKDepuisPourcent
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV8K(etat, texte))}
              validation={validation}
            />
          ) : etat.phase === "v8XBar" && exercice.variante === "nombreVersXBar" ? (
            <EtapeXBarFinal
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAide}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseV8XBar(etat, texte))}
              validation={validation}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}
