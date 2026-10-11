import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionTransformationGraphique, soumettreReponse } from "./moteur/sessionTransformationsGraphiques";
import type { EtatSessionTransformationGraphique } from "./moteur/typesTransformationsGraphiques";
import { genererExerciceTransformationGraphique } from "./generateurs/transformationsGraphiques";
import { EtapeTransformationExercice } from "./components/EtapeTransformationExercice";
import { formatEquationTransformationLatex } from "./ui/formatTransformationsGraphiques";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTransformationGraphique {
  return demarrerSessionTransformationGraphique(REGLAGES_DEMO, genererExerciceTransformationGraphique);
}

/** État tenu en attente dès que les DEUX notes ("équation"/"curseurs") sont closes — l'état de
 * session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). Pas de pause intermédiaire : une note qui se clôt seule désactive
 * juste ses propres champs (déjà géré par `EtapeTransformationExercice`), l'élève continue de
 * travailler l'autre note. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionTransformationGraphique;
  revele: boolean;
}

export function AppTransformationsGraphiques() {
  const [etat, setEtat] = useState<EtatSessionTransformationGraphique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionTransformationGraphique) {
    if (nouvelEtat.terminee !== etat.terminee) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      setEnAttente({ etatSuivant: nouvelEtat, revele: resultat.equationRevele || resultat.curseursRevele });
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
  const resultatEnAttente = enAttente ? enAttente.etatSuivant.resultats[enAttente.etatSuivant.resultats.length - 1]! : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: resultatEnAttente && (
          <>
            {resultatEnAttente.scoreEquation === 0 && (
              <div>
                Fonction attendue : <Katex expression={formatEquationTransformationLatex(exercice)} />
              </div>
            )}
            {resultatEnAttente.scoreCurseurs === 0 && (
              <p>
                Curseurs attendus : TH = {exercice.p} ; TV = {exercice.q} ; EV = {exercice.ev} ; CV = {exercice.cv} ; SOX ={" "}
                {exercice.sox ? "Oui" : "Non"}
              </p>
            )}
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
        <h1 className="app-title">Transformations graphiques d'une parabole</h1>
        <p className="app-subtitle">Chapitre 1</p>
      </header>

      <main className="card">
        <div className="card-body">
          <EtapeTransformationExercice
            exercice={exercice}
            tentativesEquation={etat.etapeEquation.tentativesUtilisees}
            tentativesCurseurs={etat.etapeCurseurs.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            equationFermee={etat.etapeEquation.terminee}
            curseursFermee={etat.etapeCurseurs.terminee}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponse(etat, reponse))}
            validation={validation}
          />
        </div>
      </main>
    </div>
  );
}
