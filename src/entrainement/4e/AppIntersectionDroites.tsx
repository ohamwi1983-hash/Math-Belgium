import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAideSuivante, demarrerSessionIntersectionDroites, soumettreReponseDiagnostic, soumettreReponsePoint } from "./moteur/sessionIntersectionDroites";
import type { EtatSessionIntersectionDroites, PhaseIntersectionDroites } from "./moteur/typesIntersectionDroites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntersectionDroites } from "./generateurs/intersectionDroites";
import type { VarianteIntersectionDroites } from "./core/intersectionDroites.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeDiagnosticIntersectionDroites } from "./components/EtapeDiagnosticIntersectionDroites";
import { EtapePointIntersectionDroites } from "./components/EtapePointIntersectionDroites";
import { texteConclusionAttendue, texteReponsePointAttendue } from "./ui/formatIntersectionDroites";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionIntersectionDroites {
  return demarrerSessionIntersectionDroites(REGLAGES_DEMO, genererExerciceIntersectionDroites);
}

/** Séquence dépendant de `exercice.conclusion` — "point" uniquement si `conclusion === "secantes"`,
 * sinon l'exercice se clôt directement après "diagnostic" (voir `typesIntersectionDroites.ts`).
 * "point", quand présent, est toujours la dernière phase : jamais consultée comme phase passée.
 * Puces purement visuelles (pas de `onSegmentClick`). */
function sequencePourExercice(exercice: EtatSessionIntersectionDroites["exerciceCourant"]): PhaseIntersectionDroites[] {
  return exercice.conclusion === "secantes" ? ["diagnostic", "point"] : ["diagnostic"];
}

function calculerSegmentsProgression(etat: EtatSessionIntersectionDroites): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    // phase === "diagnostic" (seule phase jamais terminale pouvant être "passée" ici)
    if (etat.diagnosticRevele) return "revele";
    return etat.niveauAideDiagnostic > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionIntersectionDroites;
  revele: boolean;
}

export function AppIntersectionDroites() {
  const [etat, setEtat] = useState<EtatSessionIntersectionDroites>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionIntersectionDroites) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // "diagnostic" clôture directement l'exercice quand la conclusion n'est pas "secantes" (pas
      // de second écran "point") — dans ce cas comme dans celui de "point" (toujours terminal),
      // `nouvelEtat` ne porte plus de champ `xxxRevele` à jour au niveau racine (reposé par
      // `cloturerExerciceOuSuivant`), donc on lit `revele` sur le `resultats` tout juste construit ;
      // seule la vraie transition interne diagnostic → point garde le champ racine `diagnosticRevele`.
      const revele = nouvelEtat.terminee
        ? etat.phase === "diagnostic"
          ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.diagnosticRevele
          : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.pointRevele
        : nouvelEtat.diagnosticRevele;
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

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionIntersectionDroites(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteIntersectionDroites)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <div className="answer-reveal">
            {phase === "diagnostic" ? texteConclusionAttendue(exercice) : <>Réponse attendue : {texteReponsePointAttendue(exercice)}.</>}
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
        <h1 className="app-title">Intersection entre deux droites</h1>
        <p className="app-subtitle">Chapitre 6 — Géométrie analytique</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />
      </header>

      <main className="card">
        <div className="card-body">
          {phase === "diagnostic" ? (
            <EtapeDiagnosticIntersectionDroites
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDiagnostic}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseDiagnostic(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapePointIntersectionDroites
              key={phase}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePoint}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponsePoint(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
