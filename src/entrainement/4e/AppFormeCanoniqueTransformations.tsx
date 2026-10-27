import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  demarrerSessionFormeCanoniqueTransformation,
  soumettreReponseCanonique,
  soumettreReponseEvCvSox,
  soumettreReponseTh,
  soumettreReponseTv,
} from "./moteur/sessionFormeCanoniqueTransformations";
import type { EtatSessionFormeCanoniqueTransformation, PhaseFormeCanoniqueTransformation } from "./moteur/typesFormeCanoniqueTransformations";
import { genererExerciceFormeCanoniqueTransformation } from "./generateurs/formeCanoniqueTransformations";
import { EtapeCanonique } from "./components/EtapeCanonique";
import { EtapeTh } from "./components/EtapeTh";
import { EtapeEvCvSox } from "./components/EtapeEvCvSox";
import { EtapeTv } from "./components/EtapeTv";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const CONSIGNE_GENERALE = "Détermine la forme canonique de cette fonction du second degré.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionFormeCanoniqueTransformation {
  return demarrerSessionFormeCanoniqueTransformation(REGLAGES_DEMO, genererExerciceFormeCanoniqueTransformation);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases
 * (`PhaseFormeCanoniqueTransformation`), toujours linéaire ici (jamais de phase sautée). */
const ORDRE_PHASES: PhaseFormeCanoniqueTransformation[] = ["canonique", "th", "evCvSox", "tv"];

/** `tv` (dernière phase) n'a jamais besoin de sa propre branche "close" : une fois l'exercice
 * terminé, un nouveau redémarre à "canonique" (index 0), donc `tv` reste "a-venir" jusqu'à devenir
 * "courante" — jamais consultée en tant que phase passée (même principe que `AppAnalyseFonction`/
 * `AppMethodeRapide`). Puces purement visuelles ici (pas de `onSegmentClick`, comportement explicitement
 * supporté par `ProgressionPuces` sans historique de consultation à câbler). */
function calculerSegmentsProgression(etat: EtatSessionFormeCanoniqueTransformation): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "canonique" ? etat.canoniqueRevele : phase === "th" ? etat.thRevele : etat.evCvSoxRevele;
    return revele ? "revele" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionFormeCanoniqueTransformation;
  revele: boolean;
}

export function AppFormeCanoniqueTransformations() {
  const [etat, setEtat] = useState<EtatSessionFormeCanoniqueTransformation>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionFormeCanoniqueTransformation) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "canonique"
          ? nouvelEtat.canoniqueRevele
          : etat.phase === "th"
            ? nouvelEtat.thRevele
            : etat.phase === "evCvSox"
              ? nouvelEtat.evCvSoxRevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.tvRevele;
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

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : etat.phase === "canonique" ? (
          <span className="equation-box-termes">
            <Katex expression={`x_S = ${exercice.xS}`} />
            <Katex expression={`y_S = ${exercice.yS}`} />
          </span>
        ) : etat.phase === "th" ? (
          <>TH attendu : {exercice.xS}</>
        ) : etat.phase === "evCvSox" ? (
          <>
            EV = {exercice.ev} ; CV = {exercice.cv} ; SOX = {exercice.sox ? "Oui" : "Non"}
          </>
        ) : (
          <>TV attendu : {exercice.yS}</>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Forme canonique et transformations — second degré</h1>
        <p className="app-subtitle">Chapitre 1</p>
      </header>

      <main className="card">
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          {etat.phase === "canonique" ? (
            <EtapeCanonique
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseCanonique(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "th" ? (
            <EtapeTh
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseTh(etat, reponse))}
              validation={validation}
            />
          ) : etat.phase === "evCvSox" ? (
            <EtapeEvCvSox
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseEvCvSox(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeTv
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) => terminerEtape(soumettreReponseTv(etat, reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>
    </div>
  );
}
