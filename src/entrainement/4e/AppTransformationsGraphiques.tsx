import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionTransformationGraphique, soumettreReponse } from "./moteur/sessionTransformationsGraphiques";
import type { EtatSessionTransformationGraphique } from "./moteur/typesTransformationsGraphiques";
import { genererExerciceTransformationGraphique } from "./generateurs/transformationsGraphiques";
import { EtapeTransformationExercice } from "./components/EtapeTransformationExercice";
import { formatEquationTransformationLatex } from "./ui/formatTransformationsGraphiques";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

const CONSIGNE_GENERALE = "Étudie les transformations graphiques de cette parabole.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTransformationGraphique {
  return demarrerSessionTransformationGraphique(REGLAGES_DEMO, genererExerciceTransformationGraphique);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son exercice est
 * cette instance — tirée avec la MÊME fonction que l'adaptateur d'export
 * (`generateurs/transformationsGraphiques/exportEvaluation.ts`, sans catalogue de variantes). */
function sessionInitiale(): EtatSessionTransformationGraphique {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionTransformationGraphique(REGLAGES_DEMO, () => genererAvecCode(code, undefined, genererExerciceTransformationGraphique, undefined));
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
  const [etat, setEtat] = useState<EtatSessionTransformationGraphique>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Compteur de génération, clé de l'écran : « Nouvel exercice » remonte l'écran (champs vidés). */
  const [generation, setGeneration] = useState(0);

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
    if (enAttente.etatSuivant.terminee) setGeneration((g) => g + 1);
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
            {resultatEnAttente.equationRevele && (
              <div>
                Fonction attendue : <Katex expression={formatEquationTransformationLatex(exercice)} />
              </div>
            )}
            {resultatEnAttente.curseursRevele && (
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
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <EtapeTransformationExercice
            key={generation}
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
