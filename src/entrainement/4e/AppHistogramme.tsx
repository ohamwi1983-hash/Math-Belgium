import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionHistogramme,
  soumettreReponseClassement,
  soumettreReponseFrequences,
  soumettreReponseTrace,
} from "./moteur/sessionHistogramme";
import type { EtatSessionHistogramme, PhaseHistogramme } from "./moteur/typesHistogramme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHistogramme } from "./generateurs/histogramme";
import type { VarianteHistogramme } from "./core/histogramme.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeClassementHistogramme } from "./components/EtapeClassementHistogramme";
import { EtapeFrequencesHistogramme } from "./components/EtapeFrequencesHistogramme";
import { EtapeTraceHistogramme } from "./components/EtapeTraceHistogramme";
import { formatClassementAttenduTexte, formatEnonceTexte, formatFrequencesAttenduesTexte, formatTraceAttendueTexte } from "./ui/formatHistogramme";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionHistogramme {
  return demarrerSessionHistogramme(REGLAGES_DEMO, genererExerciceHistogramme);
}

/** Séquence dépendant de `exercice.variante` ("effectif" : classement → trace ; "frequence" :
 * classement → frequences → trace, voir `typesHistogramme.ts`) — "trace" (toujours la dernière
 * phase) n'a jamais besoin de sa propre branche "close" : jamais consultée comme phase passée.
 * Puces purement visuelles (pas de `onSegmentClick`). */
function sequencePourExercice(exercice: EtatSessionHistogramme["exerciceCourant"]): PhaseHistogramme[] {
  return exercice.variante === "frequence" ? ["classement", "frequences", "trace"] : ["classement", "trace"];
}

function calculerSegmentsProgression(etat: EtatSessionHistogramme): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "classement" ? etat.classementRevele : etat.frequencesRevele;
    if (revele) return "revele";
    const niveauAide = phase === "classement" ? etat.niveauAideClassement : etat.niveauAideFrequences;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionHistogramme;
  revele: boolean;
}

export function AppHistogramme() {
  const [etat, setEtat] = useState<EtatSessionHistogramme>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionHistogramme) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // "trace" est toujours la phase terminale (variante "effectif" : classement → trace ;
      // variante "frequence" : classement → frequences → trace) — seule sa clôture ne reporte plus
      // un champ racine `xxxRevele` à jour, donc on lit `revele` sur le `resultats` tout juste
      // construit dans ce cas ; "classement"/"frequences" gardent leur champ racine.
      const revele =
        etat.phase === "classement"
          ? nouvelEtat.classementRevele
          : etat.phase === "frequences"
            ? nouvelEtat.frequencesRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.traceRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionHistogramme(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteHistogramme)));
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <div className="answer-reveal">
            {phase === "classement" && <>Effectifs attendus : {formatClassementAttenduTexte(exercice)}</>}
            {phase === "frequences" && <>Fréquences attendues : {formatFrequencesAttenduesTexte(exercice)}</>}
            {phase === "trace" && <>Hauteurs attendues : {formatTraceAttendueTexte(exercice)}</>}
          </div>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Regroupement en classes et histogramme</h1>
        <p className="app-subtitle">Chapitre 4</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={null} />
          {phase === "classement" ? (
            <EtapeClassementHistogramme
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideClassement}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseClassement(etat, reponse))}
              validation={validation}
            />
          ) : phase === "frequences" ? (
            <EtapeFrequencesHistogramme
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideFrequences}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFrequences(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeTraceHistogramme
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideTrace}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseTrace(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
