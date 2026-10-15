import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLogarithmesProblemes } from "./generateurs6e/logarithmesProblemes";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionLogarithmesProblemes,
  soumettreReponseAEcran1,
  soumettreReponseAEcran2,
  soumettreReponseAEcran3,
  soumettreReponseBEcran1,
  soumettreReponseBEcran2,
  soumettreReponseBEcran3,
  soumettreReponseBEcran4,
  soumettreReponseCEcran1,
  soumettreReponseCEcran2,
  soumettreReponseCEcran3,
  soumettreReponseDEcran1,
  soumettreReponseDEcran2,
  soumettreReponseEEcran1,
  soumettreReponseEEcran2,
  soumettreReponseEEcran3,
  soumettreReponseEEcran4,
  soumettreReponseFEcran1,
  soumettreReponseFEcran2,
  soumettreReponseFEcran3,
  soumettreReponseGEcran1,
  soumettreReponseGEcran2,
  soumettreReponseGEcran3,
  soumettreReponseGEcran4,
} from "./moteur6e/sessionLogarithmesProblemes";
import type { EtatSessionLogarithmesProblemes, PhaseLogarithmesProblemes } from "./moteur6e/typesLogarithmesProblemes";
import {
  diagnostiquerAEcran1,
  diagnostiquerAEcran2,
  diagnostiquerAEcran3Decroissance,
  diagnostiquerAEcran3Simple,
  diagnostiquerAEcran3Taux,
  diagnostiquerBEcran1,
  diagnostiquerBEcran2,
  diagnostiquerBEcran3,
  diagnostiquerBEcran4,
  diagnostiquerCEcran1,
  diagnostiquerCEcran2,
  diagnostiquerCEcran3,
  diagnostiquerDEcran1,
  diagnostiquerDEcran2,
  diagnostiquerEEcran2,
  diagnostiquerEEcran3,
  diagnostiquerEEcran4,
  diagnostiquerFEcran1,
  diagnostiquerFEcran2,
  diagnostiquerFEcran3,
  diagnostiquerGEcran2,
  diagnostiquerGEcran3,
  diagnostiquerGEcran4,
} from "./moteur6e/verificationLogarithmesProblemes";
import { EtapeChampLogProblemes } from "./components6e/EtapeChampLogProblemes";
import { EtapeDeuxValeursLogProblemes } from "./components6e/EtapeDeuxValeursLogProblemes";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import { LIBELLE_PHASE, aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "./ui6e/formatLogarithmesProblemes";
import { calculerRecapitulatifLogarithmesProblemes, calculerSegmentsProgressionLogarithmesProblemes } from "./ui6e/recapitulatifLogarithmesProblemes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionLogarithmesProblemes {
  return demarrerSessionLogarithmesProblemes(REGLAGES_DEMO, genererExerciceLogarithmesProblemes);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionLogarithmesProblemes;
  revele: boolean;
}

export function App6gen22() {
  const [etat, setEtat] = useState<EtatSessionLogarithmesProblemes>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, jamais dans le moteur. Remis à vide à chaque nouvel exercice/variante forcée, comme
   * `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** `phaseFermee` est TOUJOURS l'ancien `etat.phase` — réutilise
   * `calculerRecapitulatifLogarithmesProblemes` pour la réponse ATTENDUE. Garde sur le libellé : le
   * dernier écran de l'exercice n'avance jamais `etat.phase` au-delà de lui-même, donc SANS cette
   * garde on repousserait l'entrée de l'écran PRÉCÉDENT une seconde fois (bug déjà rencontré sur la
   * référence 4e, `AppAnalyseFonction.tsx`). */
  function ajouterHistorique(phaseFermee: PhaseLogarithmesProblemes, votreReponse: ReactNode, nouvelEtat: EtatSessionLogarithmesProblemes) {
    const recap = calculerRecapitulatifLogarithmesProblemes(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere || derniere.libelle !== LIBELLE_PHASE[phaseFermee]) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? (
          <span className="equation-box-termes">{(derniere.valeurs ?? [derniere.valeur]).map((f, i) => <Katex key={i} expression={f} />)}</span>
        ) : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionLogarithmesProblemes, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(etat.phase, votreReponse, nouvelEtat);
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele: nouvelEtat.derniereTransitionRevelee });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
    setFicheOuverteIndex(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionLogarithmesProblemes(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
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
    consigneGenerale: consigneG,
    blocDonnees: donnees,
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

  // Calculatrice scientifique visible sur tout écran de RÉSOLUTION NUMÉRIQUE (log/exp/racine
  // n-ième) — jamais sur un écran purement symbolique (poser/isoler une équation, un modèle).
  const calculatriceVisible =
    phase === "aEcran3" ||
    phase === "bEcran2" ||
    phase === "bEcran3" ||
    phase === "bEcran4" ||
    phase === "cEcran1" ||
    phase === "cEcran2" ||
    phase === "cEcran3" ||
    phase === "eEcran2" ||
    phase === "eEcran3" ||
    phase === "eEcran4" ||
    phase === "fEcran1" ||
    phase === "fEcran2" ||
    phase === "gEcran1" ||
    phase === "gEcran3" ||
    phase === "gEcran4";

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Logarithmes : problèmes</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLogarithmesProblemes(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLogarithmesProblemes(etat)} />
        {phase === "aEcran1" && (
          <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 1000*1.05^t>=1500" diagnostiquer={(t) => (exercice.famille === "A" ? diagnostiquerAEcran1(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseAEcran1(etat, texte), texte)} />
        )}
        {phase === "aEcran2" && (
          <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 1.05^t>=1.5" diagnostiquer={(t) => (exercice.famille === "A" ? diagnostiquerAEcran2(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseAEcran2(etat, texte), texte)} />
        )}
        {phase === "aEcran3" && exercice.famille === "A" && exercice.sousType === "resoudreT" && exercice.variante === "fenetre" && (
          <EtapeDeuxValeursLogProblemes
            key={phase}
            consigneGenerale={consigneG}
            blocDonnees={donnees}
            consigneEcran={consigne}
            labelChamp1="t_1="
            labelChamp2="t_2="
            aideNiveau1={aide1}
            aideNiveau2={aide2}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texte, texte2) => terminerEtape(soumettreReponseAEcran3(etat, { texte, texte2 }), `t_1=${texte} ; t_2=${texte2}`)}
            validation={validation}
          />
        )}
        {phase === "aEcran3" && exercice.famille === "A" && !(exercice.sousType === "resoudreT" && exercice.variante === "fenetre") && (
          <EtapeChampLogProblemes
            key={phase}
            {...propsChampCommun}
            placeholder="ex : 9"
            diagnostiquer={(t) => {
              if (exercice.famille !== "A") return "parse_error";
              if (exercice.sousType === "resoudreT") return diagnostiquerAEcran3Simple(exercice, t);
              if (exercice.sousType === "resoudreTaux") return diagnostiquerAEcran3Taux(exercice, t);
              return diagnostiquerAEcran3Decroissance(exercice, t);
            }}
            onValider={(texte) => terminerEtape(soumettreReponseAEcran3(etat, { texte }), texte)}
          />
        )}

        {phase === "bEcran1" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 1.05" diagnostiquer={(t) => (exercice.famille === "B" ? diagnostiquerBEcran1(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseBEcran1(etat, texte), texte)} />}
        {phase === "bEcran2" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 100" diagnostiquer={(t) => (exercice.famille === "B" ? diagnostiquerBEcran2(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseBEcran2(etat, texte), texte)} />}
        {phase === "bEcran3" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 250" diagnostiquer={(t) => (exercice.famille === "B" ? diagnostiquerBEcran3(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseBEcran3(etat, texte), texte)} />}
        {phase === "bEcran4" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 30" diagnostiquer={(t) => (exercice.famille === "B" ? diagnostiquerBEcran4(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseBEcran4(etat, texte), texte)} />}

        {phase === "cEcran1" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 12" diagnostiquer={(t) => (exercice.famille === "C" ? diagnostiquerCEcran1(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseCEcran1(etat, texte), texte)} />}
        {phase === "cEcran2" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 20" diagnostiquer={(t) => (exercice.famille === "C" ? diagnostiquerCEcran2(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseCEcran2(etat, texte), texte)} />}
        {phase === "cEcran3" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 1.5" diagnostiquer={(t) => (exercice.famille === "C" ? diagnostiquerCEcran3(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseCEcran3(etat, texte), texte)} />}

        {phase === "dEcran1" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 20+(90-20)*exp(k*t)" diagnostiquer={(t) => (exercice.famille === "D" ? diagnostiquerDEcran1(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseDEcran1(etat, texte), texte)} />}
        {phase === "dEcran2" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : (1/k)*ln((T-20)/70)" diagnostiquer={(t) => (exercice.famille === "D" ? diagnostiquerDEcran2(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseDEcran2(etat, texte), texte)} />}

        {phase === "eEcran1" && exercice.famille === "E" && (
          <EtapeDeuxValeursLogProblemes
            key={phase}
            consigneGenerale={consigneG}
            blocDonnees={donnees}
            consigneEcran={consigne}
            labelChamp1="a="
            labelChamp2="b="
            aideNiveau1={aide1}
            aideNiveau2={aide2}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texteA, texteB) => terminerEtape(soumettreReponseEEcran1(etat, { texteA, texteB }), `a=${texteA} ; b=${texteB}`)}
            validation={validation}
          />
        )}
        {phase === "eEcran2" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 5" diagnostiquer={(t) => (exercice.famille === "E" ? diagnostiquerEEcran2(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseEEcran2(etat, texte), texte)} />}
        {phase === "eEcran3" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : -1" diagnostiquer={(t) => (exercice.famille === "E" ? diagnostiquerEEcran3(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseEEcran3(etat, texte), texte)} />}
        {phase === "eEcran4" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 3" diagnostiquer={(t) => (exercice.famille === "E" ? diagnostiquerEEcran4(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseEEcran4(etat, texte), texte)} />}

        {phase === "fEcran1" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 4" diagnostiquer={(t) => (exercice.famille === "F" ? diagnostiquerFEcran1(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseFEcran1(etat, texte), texte)} />}
        {phase === "fEcran2" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 1.5" diagnostiquer={(t) => (exercice.famille === "F" ? diagnostiquerFEcran2(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseFEcran2(etat, texte), texte)} />}
        {phase === "fEcran3" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 100" diagnostiquer={(t) => (exercice.famille === "F" ? diagnostiquerFEcran3(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseFEcran3(etat, texte), texte)} />}

        {phase === "gEcran1" && exercice.famille === "G" && (
          <EtapeDeuxValeursLogProblemes
            key={phase}
            consigneGenerale={consigneG}
            blocDonnees={donnees}
            consigneEcran={consigne}
            labelChamp1="o(x_0)="
            labelChamp2="d(x_0)="
            aideNiveau1={aide1}
            aideNiveau2={aide2}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(texteO, texteD) => terminerEtape(soumettreReponseGEcran1(etat, { texteO, texteD }), `o(x_0)=${texteO} ; d(x_0)=${texteD}`)}
            validation={validation}
          />
        )}
        {phase === "gEcran2" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 5000*u^2-13000=0" diagnostiquer={(t) => (exercice.famille === "G" ? diagnostiquerGEcran2(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseGEcran2(etat, texte), texte)} />}
        {phase === "gEcran3" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 0.1" diagnostiquer={(t) => (exercice.famille === "G" ? diagnostiquerGEcran3(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseGEcran3(etat, texte), texte)} />}
        {phase === "gEcran4" && <EtapeChampLogProblemes key={phase} {...propsChampCommun} placeholder="ex : 0.15" diagnostiquer={(t) => (exercice.famille === "G" ? diagnostiquerGEcran4(exercice, t) : "parse_error")} onValider={(texte) => terminerEtape(soumettreReponseGEcran4(etat, texte), texte)} />}

        {calculatriceVisible && <CalculatriceScientifique />}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
