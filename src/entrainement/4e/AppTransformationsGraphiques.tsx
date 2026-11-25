import { useState, type ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionTransformationGraphique, soumettreReponse } from "./moteur/sessionTransformationsGraphiques";
import type { EtatSessionTransformationGraphique } from "./moteur/typesTransformationsGraphiques";
import { genererExerciceTransformationGraphique } from "./generateurs/transformationsGraphiques";
import { EtapeTransformationExercice } from "./components/EtapeTransformationExercice";
import { formatApercuEquation, formatEquationTransformationLatex } from "./ui/formatTransformationsGraphiques";
import type { ReponseTransformationGraphique } from "./core/transformationsGraphiques.types";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { correctionDetailleeTransformationsGraphiques } from "./generateurs/transformationsGraphiques/corrigeDetaille";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, nombreTexte, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";

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

/** Dernière soumission de l'écran unique (les parties déjà closes gardent leur valeur, champs gelés) :
 * fonction tapée (même aperçu que sous le champ), position des curseurs et choix de la symétrie. */
function reponseTransformationAffichee(reponse: ReponseTransformationGraphique): ReactNode {
  const c = reponse.curseurs;
  return (
    <>
      <span style={{ display: "block" }}>
        Fonction : <Katex expression={formatApercuEquation(reponse.equation)} />
      </span>
      <span style={{ display: "block" }}>
        Curseurs : TH = {nombreTexte(c.th)} ; TV = {nombreTexte(c.tv)} ; EV/CV = {nombreTexte(c.ev)}/{nombreTexte(c.cv)}
      </span>
      <span style={{ display: "block" }}>Symétrie d'axe Ox : {c.sox ? "oui" : "non"}</span>
    </>
  );
}

export function AppTransformationsGraphiques() {
  const [etat, setEtat] = useState<EtatSessionTransformationGraphique>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Compteur de génération, clé de l'écran : « Nouvel exercice » remonte l'écran (champs vidés). */
  const [generation, setGeneration] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionTransformationGraphique, votreReponse: ReactNode) {
    if (nouvelEtat.terminee !== etat.terminee) {
      const resultat = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!;
      const revele = resultat.equationRevele || resultat.curseursRevele || resultat.soxRevele;
      setHistorique((h) => [...h, ecranClos("Transformations", votreReponse, revele, etat.aideUtilisee, reponseAttendueEcran(resultat), corrigeDetailleEcranCourant())]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setGeneration((g) => g + 1);
      viderHistorique();
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const resultatEnAttente = enAttente ? enAttente.etatSuivant.resultats[enAttente.etatSuivant.resultats.length - 1]! : null;

  /** Parties révélées seulement (les autres étaient justes). */
  function reponseAttendueEcran(resultat: { equationRevele: boolean; curseursRevele: boolean; soxRevele: boolean }) {
    return (
      <>
        {resultat.equationRevele && (
          <div>
            Fonction attendue : <Katex expression={formatEquationTransformationLatex(exercice)} />
          </div>
        )}
        {resultat.curseursRevele && (
          <p>
            Curseurs attendus : TH = {String(exercice.p).replace("-", "−")} ; TV = {String(exercice.q).replace("-", "−")} ; EV/CV = {exercice.ev}/{exercice.cv} (ou un rapport égal)
          </p>
        )}
        {resultat.soxRevele && <p>Symétrie d'axe Ox : {exercice.sox ? "oui" : "non"}</p>}
      </>
    );
  }

  /** Corrigé détaillé « comme au tableau » de l'écran unique — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique (fiche de la puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={correctionDetailleeTransformationsGraphiques(exercice)} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: resultatEnAttente && reponseAttendueEcran(resultatEnAttente),
        corrigeDetaille: corrigeDetailleEcranCourant(),
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
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, 1, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
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
            soxFerme={etat.etapeSox.terminee}
            soxRevele={etat.etapeSox.revelee}
            aideActivee={etat.aideUtilisee}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponse(etat, reponse), reponseTransformationAffichee(reponse))}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
