import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEquationsExpLog } from "./generateurs6e/equationsExpLog";
import {
  activerAideSuivante,
  demarrerSessionEquationsExpLog,
  niveauAideMaxCourant,
  soumettreReponseAEcran1,
  soumettreReponseAEcran2,
  soumettreReponseBEcran1,
  soumettreReponseBEcran2,
  soumettreReponseCEcran1,
  soumettreReponseCEcran2,
  soumettreReponseCEcran3,
  soumettreReponseDEcran1,
  soumettreReponseDEcran2,
  soumettreReponseEEcran1,
  soumettreReponseEEcran2,
  soumettreReponseEEcran3,
  soumettreReponseFEcran1,
  soumettreReponseFEcran2,
  soumettreReponseFEcran3,
  soumettreReponseGEcran1,
  soumettreReponseGEcran2,
} from "./moteur6e/sessionEquationsExpLog";
import type { EtatSessionEquationsExpLog } from "./moteur6e/typesEquationsExpLog";
import {
  diagnostiquerAEcran1,
  diagnostiquerAEcran2,
  diagnostiquerBEcran1,
  diagnostiquerBEcran2,
  diagnostiquerCEcran1,
  diagnostiquerDEcran2,
  diagnostiquerEEcran2,
  diagnostiquerFEcran2,
  diagnostiquerGEcran1,
} from "./moteur6e/verificationEquationsExpLog";
import { EtapeCEEquationsExpLog } from "./components6e/EtapeCEEquationsExpLog";
import { EtapeChampEquationsExpLog } from "./components6e/EtapeChampEquationsExpLog";
import { EtapeListeEquationsExpLog } from "./components6e/EtapeListeEquationsExpLog";
import { EtapeStatutGEquationsExpLog } from "./components6e/EtapeStatutGEquationsExpLog";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "./ui6e/formatEquationsExpLog";
import { calculerRecapitulatifEquationsExpLog, calculerSegmentsProgressionEquationsExpLog } from "./ui6e/recapitulatifEquationsExpLog";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionEquationsExpLog {
  return demarrerSessionEquationsExpLog(REGLAGES_DEMO, genererExerciceEquationsExpLog);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationsExpLog;
  revele: boolean;
}

export function App6gen14() {
  const [etat, setEtat] = useState<EtatSessionEquationsExpLog>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionEquationsExpLog) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setEtat(demarrerSessionEquationsExpLog(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const premierePhaseRef = useRef(phase);
  const dernierExerciceRef = useRef(exercice);
  if (dernierExerciceRef.current !== exercice) {
    dernierExerciceRef.current = exercice;
    premierePhaseRef.current = phase;
  }
  const estPremierEcran = phase === premierePhaseRef.current;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;
  const niveauAideMax = niveauAideMaxCourant(etat);
  const aide1 = aideNiveau1(exercice, phase);
  const aide2 = aideNiveau2(exercice, phase);
  const consigneG = consigneGenerale(exercice);
  const donnees = blocDonnees(exercice);
  const consigne = consigneEcran(exercice, phase);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const propsChampCommun = {
    estPremierEcran,
    consigneGenerale: consigneG,
    blocDonnees: donnees,
    consigneEcran: consigne,
    aideNiveau1: aide1,
    aideNiveau2: aide2,
    tentativesUtilisees,
    tentativesMax,
    niveauAide,
    niveauAideMax,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  // Calculatrice scientifique — visible uniquement sur les écrans où un calcul décimal/logarithme
  // à la main est réellement en jeu (même inventaire écran par écran que 6gen12) : jamais sur un
  // écran purement symbolique (poser la CE, développer/combiner des logs, choisir un verdict).
  const calculatriceVisible = phase === "aEcran1" || phase === "aEcran2" || phase === "bEcran2" || phase === "cEcran2" || phase === "cEcran3" || phase === "dEcran2" || phase === "eEcran3" || phase === "fEcran3";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Résoudre une équation exponentielle ou logarithmique</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionEquationsExpLog(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEquationsExpLog(etat)} />
        {phase === "aEcran1" && exercice.famille === "A" && (
          <EtapeChampEquationsExpLog key={phase} {...propsChampCommun} placeholder="ex : 3 ou ln(20)/ln(3)" diagnostiquer={(t) => diagnostiquerAEcran1(exercice, t)} onValider={(texte) => terminerEtape(soumettreReponseAEcran1(etat, texte))} />
        )}
        {phase === "aEcran2" && exercice.famille === "A" && (
          <EtapeChampEquationsExpLog key={phase} {...propsChampCommun} placeholder="ex : 1,67" diagnostiquer={(t) => diagnostiquerAEcran2(exercice, t)} onValider={(texte) => terminerEtape(soumettreReponseAEcran2(etat, texte))} />
        )}

        {phase === "bEcran1" && exercice.famille === "B" && (
          <EtapeChampEquationsExpLog
            key={phase}
            {...propsChampCommun}
            placeholder="ex : (1*x+2)*ln(2)=(1*x-1)*ln(3)"
            diagnostiquer={(t) => diagnostiquerBEcran1(exercice, t)}
            onValider={(texte) => terminerEtape(soumettreReponseBEcran1(etat, texte))}
          />
        )}
        {phase === "bEcran2" && exercice.famille === "B" && (
          <EtapeChampEquationsExpLog key={phase} {...propsChampCommun} placeholder="ex : -2,31" diagnostiquer={(t) => diagnostiquerBEcran2(exercice, t)} onValider={(texte) => terminerEtape(soumettreReponseBEcran2(etat, texte))} />
        )}

        {phase === "cEcran1" && exercice.famille === "C" && (
          <EtapeChampEquationsExpLog
            key={phase}
            {...propsChampCommun}
            placeholder="ex : t^2-6*t+8=0"
            diagnostiquer={(t) => diagnostiquerCEcran1(exercice, t)}
            onValider={(texte) => terminerEtape(soumettreReponseCEcran1(etat, texte))}
          />
        )}
        {phase === "cEcran2" && exercice.famille === "C" && (
          <EtapeListeEquationsExpLog
            key={phase}
            {...propsChampCommun}
            placeholder="ex : 4"
            labelAjout="+ Ajouter une valeur de t"
            labelAucune="Pas de solution"
            onValider={(textes) => terminerEtape(soumettreReponseCEcran2(etat, textes))}
          />
        )}
        {phase === "cEcran3" && exercice.famille === "C" && (
          <EtapeListeEquationsExpLog
            key={phase}
            {...propsChampCommun}
            placeholder="ex : 2 ou ln(7)/ln(2)"
            labelAjout="+ Ajouter une valeur de x"
            labelAucune="Pas de solution"
            onValider={(textes) => terminerEtape(soumettreReponseCEcran3(etat, textes))}
          />
        )}

        {phase === "dEcran1" && exercice.famille === "D" && (
          <EtapeCEEquationsExpLog key={phase} {...propsChampCommun} onValider={(reponse) => terminerEtape(soumettreReponseDEcran1(etat, reponse))} />
        )}
        {phase === "dEcran2" && exercice.famille === "D" && (
          <EtapeChampEquationsExpLog key={phase} {...propsChampCommun} placeholder="ex : 8^(1/3)" diagnostiquer={(t) => diagnostiquerDEcran2(exercice, t)} onValider={(texte) => terminerEtape(soumettreReponseDEcran2(etat, texte))} />
        )}

        {phase === "eEcran1" && exercice.famille === "E" && <EtapeCEEquationsExpLog key={phase} {...propsChampCommun} onValider={(reponse) => terminerEtape(soumettreReponseEEcran1(etat, reponse))} />}
        {phase === "eEcran2" && exercice.famille === "E" && (
          <EtapeChampEquationsExpLog
            key={phase}
            {...propsChampCommun}
            placeholder="ex : (x-2)*(x-5)=1*x+2"
            diagnostiquer={(t) => diagnostiquerEEcran2(exercice, t)}
            onValider={(texte) => terminerEtape(soumettreReponseEEcran2(etat, texte))}
          />
        )}
        {phase === "eEcran3" && exercice.famille === "E" && (
          <EtapeListeEquationsExpLog
            key={phase}
            {...propsChampCommun}
            placeholder="ex : 7"
            labelAjout="+ Ajouter une solution"
            labelAucune="Pas de solution"
            onValider={(textes) => terminerEtape(soumettreReponseEEcran3(etat, textes))}
          />
        )}

        {phase === "fEcran1" && exercice.famille === "F" && <EtapeCEEquationsExpLog key={phase} {...propsChampCommun} onValider={(reponse) => terminerEtape(soumettreReponseFEcran1(etat, reponse))} />}
        {phase === "fEcran2" && exercice.famille === "F" && (
          <EtapeChampEquationsExpLog key={phase} {...propsChampCommun} placeholder="ex : y+1/y=5" diagnostiquer={(t) => diagnostiquerFEcran2(exercice, t)} onValider={(texte) => terminerEtape(soumettreReponseFEcran2(etat, texte))} />
        )}
        {phase === "fEcran3" && exercice.famille === "F" && (
          <EtapeListeEquationsExpLog
            key={phase}
            {...propsChampCommun}
            placeholder="ex : 4,79"
            labelAjout="+ Ajouter une solution"
            labelAucune="Pas de solution"
            onValider={(textes) => terminerEtape(soumettreReponseFEcran3(etat, textes))}
          />
        )}

        {phase === "gEcran1" && exercice.famille === "G" && (
          <EtapeChampEquationsExpLog key={phase} {...propsChampCommun} placeholder="ex : 0=0" diagnostiquer={(t) => diagnostiquerGEcran1(exercice, t)} onValider={(texte) => terminerEtape(soumettreReponseGEcran1(etat, texte))} />
        )}
        {phase === "gEcran2" && exercice.famille === "G" && (
          <EtapeStatutGEquationsExpLog key={phase} {...propsChampCommun} onValider={(choix) => terminerEtape(soumettreReponseGEcran2(etat, choix))} />
        )}

        {calculatriceVisible && <CalculatriceScientifique />}
      </main>
    </div>
  );
}
