import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionMoyennePonderee,
  soumettreReponseCentres,
  soumettreReponseQuotient,
  soumettreReponseSommes,
} from "./moteur/sessionMoyennePonderee";
import type { EtatSessionMoyennePonderee, PhaseMoyennePonderee } from "./moteur/typesMoyennePonderee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceMoyennePonderee } from "./generateurs/moyennePonderee";
import type { ExerciceMoyennePonderee, VarianteMoyennePonderee } from "./core/moyennePonderee.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeCentresMoyennePonderee } from "./components/EtapeCentresMoyennePonderee";
import { EtapeSommesMoyennePonderee } from "./components/EtapeSommesMoyennePonderee";
import { EtapeQuotientMoyennePonderee } from "./components/EtapeQuotientMoyennePonderee";
import { SegmentsInline } from "./components/SegmentsInline";
import { formatCentresAttendusTexte, formatEnonceTexte, formatSommesAttenduesTexte } from "./ui/formatMoyennePonderee";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { calculerRecapitulatifMoyennePonderee } from "./ui/recapitulatifMoyennePonderee";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionMoyennePonderee {
  return demarrerSessionMoyennePonderee(REGLAGES_DEMO, genererExerciceMoyennePonderee);
}

/** Séquence FIXE mais choisie dès le départ selon la variante (même logique que `phaseInitiale`,
 * `moteur/sessionMoyennePonderee.ts`) : "classes" → centres → sommes → quotient (terminal) ; sinon
 * → sommes → quotient (terminal) directement. Pas de fichier recap exposant déjà une telle
 * séquence pour ce générateur, donc définie ici, depuis la même logique que le moteur. */
function sequencePourExercice(exercice: ExerciceMoyennePonderee): PhaseMoyennePonderee[] {
  return exercice.variante === "classes" ? ["centres", "sommes", "quotient"] : ["sommes", "quotient"];
}

/** "quotient" (dernière phase) n'a jamais besoin de sa propre branche "close" : un nouvel exercice
 * redémarre toujours juste après, donc elle reste "a-venir" jusqu'à devenir "courante" — jamais
 * consultée comme passée (même principe que la dernière phase d'`AppFormeCanoniqueTransformations`/
 * `AppOptimisation`). Puces purement visuelles (pas de `onSegmentClick`). */
function calculerSegmentsProgression(etat: EtatSessionMoyennePonderee): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "centres" ? etat.centresRevele : etat.sommesRevele;
    if (revele) return "revele";
    const niveauAide = phase === "centres" ? etat.niveauAideCentres : etat.niveauAideSommes;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionMoyennePonderee;
  revele: boolean;
}

export function AppMoyennePonderee() {
  const [etat, setEtat] = useState<EtatSessionMoyennePonderee>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionMoyennePonderee) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "centres"
          ? nouvelEtat.centresRevele
          : etat.phase === "sommes"
            ? nouvelEtat.sommesRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.quotientRevele;
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

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifMoyennePonderee(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionMoyennePonderee(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteMoyennePonderee)));
  }

  const reponseAttendue =
    phase === "centres" && exercice.variante === "classes" ? (
      <>Centres attendus : {formatCentresAttendusTexte(exercice)}</>
    ) : phase === "sommes" ? (
      <>
        Sommes attendues : <SegmentsInline segments={formatSommesAttenduesTexte(exercice)} />
      </>
    ) : (
      <>Moyenne pondérée attendue : {exercice.moyenne}</>
    );

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Moyenne pondérée</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={null} />
          <RecapitulatifPanel entrees={recapitulatif} />
          {phase === "quotient" && !enAttente && <CalculatriceScientifique />}
          {phase === "centres" && exercice.variante === "classes" ? (
            <EtapeCentresMoyennePonderee
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCentres}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCentres(etat, reponse))}
              validation={validation}
            />
          ) : phase === "sommes" ? (
            <EtapeSommesMoyennePonderee
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSommes}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSommes(etat, reponse))}
              validation={validation}
            />
          ) : phase === "quotient" ? (
            <EtapeQuotientMoyennePonderee
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideQuotient}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseQuotient(etat, reponse))}
              validation={validation}
            />
          ) : null}{" "}
        </div>
      </main>
    </div>
  );
}
