import { useRef, useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceExponentiellesProblemes } from "./generateurs6e/exponentiellesProblemes";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionExponentiellesProblemes,
  soumettreReponseAEcran1,
  soumettreReponseAEcran2,
  soumettreReponseBEcran1,
  soumettreReponseBEcran2,
  soumettreReponseBEcran3,
  soumettreReponseBEcran4,
  soumettreReponseCEcran1,
  soumettreReponseCEcran2,
  soumettreReponseCEcran3,
  soumettreReponseDEcran1,
  soumettreReponseDEcran2,
  soumettreReponseDEcran3,
  soumettreReponseDEcran4,
  soumettreReponseEEcran1,
  soumettreReponseEEcran2,
  soumettreReponseEEcran3,
  soumettreReponseFEcran1,
  soumettreReponseFEcran2,
  soumettreReponseFEcran3,
  soumettreReponseFEcran4,
  soumettreReponseGEcran1,
  soumettreReponseGEcran2,
  soumettreReponseGEcran3,
} from "./moteur6e/sessionExponentiellesProblemes";
import type { EtatSessionExponentiellesProblemes } from "./moteur6e/typesExponentiellesProblemes";
import { EtapeChampExpoProblemes } from "./components6e/EtapeChampExpoProblemes";
import { EtapeDeuxValeursExpoProblemes } from "./components6e/EtapeDeuxValeursExpoProblemes";
import { EtapeListeExpoProblemes } from "./components6e/EtapeListeExpoProblemes";
import { EtapeChoixOuiNonExpoProblemes } from "./components6e/EtapeChoixOuiNonExpoProblemes";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "./ui6e/formatExponentiellesProblemes";
import { calculerRecapitulatifExponentiellesProblemes, calculerSegmentsProgressionExponentiellesProblemes } from "./ui6e/recapitulatifExponentiellesProblemes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionExponentiellesProblemes {
  return demarrerSessionExponentiellesProblemes(REGLAGES_DEMO, genererExerciceExponentiellesProblemes);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionExponentiellesProblemes;
  revele: boolean;
}

export function App6gen12() {
  const [etat, setEtat] = useState<EtatSessionExponentiellesProblemes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionExponentiellesProblemes) {
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
    setEtat(
      demarrerSessionExponentiellesProblemes(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
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
    etatActuel: null,
    consigneEcran: consigne,
    aideNiveau1: aide1,
    aideNiveau2: aide2,
    tentativesUtilisees,
    tentativesMax,
    niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  // Wiring calculatrice scientifique — inventaire écran par écran (voir rapport de livraison) :
  // toute case où le calcul à la main implique une puissance décimale, un logarithme ou une
  // exponentielle non triviale l'obtient ; les écrans purement symboliques (poser un modèle,
  // factoriser, un statut oui/non, une soustraction/division entière simple) ne l'obtiennent pas.
  const calculatriceVisible =
    (phase === "aEcran2" && exercice.famille === "A" && exercice.sousType === "evaluer") ||
    phase === "bEcran3" ||
    phase === "bEcran4" ||
    phase === "cEcran1" ||
    phase === "cEcran2" ||
    phase === "cEcran3" ||
    phase === "dEcran1" ||
    phase === "dEcran2" ||
    phase === "dEcran3" ||
    phase === "dEcran4" ||
    phase === "eEcran3" ||
    phase === "fEcran2" ||
    phase === "fEcran3" ||
    phase === "fEcran4" ||
    phase === "gEcran1" ||
    phase === "gEcran2";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Exponentielles : problèmes</h1>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionExponentiellesProblemes(etat)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifExponentiellesProblemes(etat)} />
        <div className="card-body">
          {phase === "aEcran1" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder={exercice.famille === "A" && exercice.sousType === "evaluer" ? "ex : 5000*1.08^t" : "ex : 80-t"}
              onValider={(texte) => terminerEtape(soumettreReponseAEcran1(etat, texte))}
            />
          )}
          {phase === "aEcran2" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 12,5"
              onValider={(texte) => terminerEtape(soumettreReponseAEcran2(etat, texte))}
            />
          )}

          {phase === "bEcran1" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 20*0.8^t"
              onValider={(texte) => terminerEtape(soumettreReponseBEcran1(etat, texte))}
            />
          )}
          {phase === "bEcran2" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 20*(1-0.8^t)"
              onValider={(texte) => terminerEtape(soumettreReponseBEcran2(etat, texte))}
            />
          )}
          {phase === "bEcran3" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 12,5"
              onValider={(texte) => terminerEtape(soumettreReponseBEcran3(etat, texte))}
            />
          )}
          {phase === "bEcran4" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 8,3"
              onValider={(texte) => terminerEtape(soumettreReponseBEcran4(etat, texte))}
            />
          )}

          {phase === "cEcran1" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 0,9"
              onValider={(texte) => terminerEtape(soumettreReponseCEcran1(etat, texte))}
            />
          )}
          {phase === "cEcran2" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 15,2"
              onValider={(texte) => terminerEtape(soumettreReponseCEcran2(etat, texte))}
            />
          )}
          {phase === "cEcran3" && exercice.famille === "C" && (
            <EtapeListeExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 42,3"
              labelAjout="+ Ajouter une valeur"
              onValider={(textes) => terminerEtape(soumettreReponseCEcran3(etat, textes))}
            />
          )}

          {phase === "dEcran1" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 0,64"
              onValider={(texte) => terminerEtape(soumettreReponseDEcran1(etat, texte))}
            />
          )}
          {phase === "dEcran2" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 20"
              onValider={(texte) => terminerEtape(soumettreReponseDEcran2(etat, texte))}
            />
          )}
          {phase === "dEcran3" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 20+25*0.8^t"
              onValider={(texte) => terminerEtape(soumettreReponseDEcran3(etat, texte))}
            />
          )}
          {phase === "dEcran4" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 25,4"
              onValider={(texte) => terminerEtape(soumettreReponseDEcran4(etat, texte))}
            />
          )}

          {phase === "eEcran1" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 20*t*exp(-t)*(2-t)"
              onValider={(texte) => terminerEtape(soumettreReponseEEcran1(etat, texte))}
            />
          )}
          {phase === "eEcran2" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 2"
              onValider={(texte) => terminerEtape(soumettreReponseEEcran2(etat, texte))}
            />
          )}
          {phase === "eEcran3" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 10,8"
              onValider={(texte) => terminerEtape(soumettreReponseEEcran3(etat, texte))}
            />
          )}

          {phase === "fEcran1" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 1"
              onValider={(texte) => terminerEtape(soumettreReponseFEcran1(etat, texte))}
            />
          )}
          {phase === "fEcran2" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 0,86"
              onValider={(texte) => terminerEtape(soumettreReponseFEcran2(etat, texte))}
            />
          )}
          {phase === "fEcran3" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 950000"
              onValider={(texte) => terminerEtape(soumettreReponseFEcran3(etat, texte))}
            />
          )}
          {phase === "fEcran4" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 125000"
              onValider={(texte) => terminerEtape(soumettreReponseFEcran4(etat, texte))}
            />
          )}

          {phase === "gEcran1" && exercice.famille === "G" && (
            <EtapeDeuxValeursExpoProblemes
              key={phase}
              estPremierEcran={estPremierEcran}
              consigneGenerale={consigneG}
              blocDonnees={donnees}
              consigneEcran={consigne}
              labelChamp1={`f(${exercice.tEval1})=`}
              labelChamp2={`f(${exercice.tEval2})=`}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(texte1, texte2) => terminerEtape(soumettreReponseGEcran1(etat, { texte1, texte2 }))}
              validation={validation}
            />
          )}
          {phase === "gEcran2" && (
            <EtapeChampExpoProblemes
              key={phase}
              {...propsChampCommun}
              placeholder="ex : 4,2"
              onValider={(texte) => terminerEtape(soumettreReponseGEcran2(etat, texte))}
            />
          )}
          {phase === "gEcran3" && (
            <EtapeChoixOuiNonExpoProblemes
              key={phase}
              estPremierEcran={estPremierEcran}
              consigneGenerale={consigneG}
              blocDonnees={donnees}
              etatActuel={null}
              consigneEcran={consigne}
              aideNiveau1={aide1}
              aideNiveau2={aide2}
              tentativesUtilisees={tentativesUtilisees}
              tentativesMax={tentativesMax}
              niveauAide={niveauAide}
              niveauAideMax={NIVEAU_AIDE_MAX}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(atteignable) => terminerEtape(soumettreReponseGEcran3(etat, atteignable))}
              validation={validation}
            />
          )}

          {calculatriceVisible && <CalculatriceScientifique />}
        </div>
      </main>
    </div>
  );
}
