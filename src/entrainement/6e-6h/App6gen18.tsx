import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDeterminerParametresLogarithme } from "./generateurs6e/determinerParametresLogarithme";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionDeterminerParametresLogarithme,
  soumettreReponseAEcran1,
  soumettreReponseAEcran2,
  soumettreReponseBEcran1,
  soumettreReponseBEcran2,
  soumettreReponseBEcran3,
  soumettreReponseCEcran1,
  soumettreReponseCEcran2,
  soumettreReponseCEcran3,
} from "./moteur6e/sessionDeterminerParametresLogarithme";
import type { EtatSessionDeterminerParametresLogarithme, PhaseDeterminerParametresLogarithme } from "./moteur6e/typesDeterminerParametresLogarithme";
import { diagnostiquerAEcran1, diagnostiquerAEcran2, diagnostiquerBEcran1, diagnostiquerBEcran2, diagnostiquerBEcran3, diagnostiquerCEcran1, diagnostiquerCEcran2, diagnostiquerCEcran3 } from "./moteur6e/verificationDeterminerParametresLogarithme";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { EtapeChampDeterminerParametres } from "./components6e/EtapeChampDeterminerParametres";
import { EtapeDeuxChampsDeterminerParametres } from "./components6e/EtapeDeuxChampsDeterminerParametres";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  aideNiveau1A,
  aideNiveau1B,
  aideNiveau1C,
  aideNiveau2A,
  aideNiveau2B,
  aideNiveau2C,
  blocDonneesA,
  blocDonneesB,
  blocDonneesC,
  consigneEcranA,
  consigneEcranB,
  consigneEcranC,
  consigneGeneraleA,
  consigneGeneraleB,
  consigneGeneraleC,
  LIBELLE_PHASE,
  PHASES_PAR_FAMILLE,
  formatReponseAttenduePhaseLatex,
  labelsEcranA,
  labelsEcranB,
  placeholderEcranC,
  placeholdersEcranA,
  placeholdersEcranB,
} from "./ui6e/formatDeterminerParametresLogarithme";
import { calculerRecapitulatifDeterminerParametresLogarithme, calculerSegmentsProgressionDeterminerParametresLogarithme } from "./ui6e/recapitulatifDeterminerParametresLogarithme";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionDeterminerParametresLogarithme {
  return demarrerSessionDeterminerParametresLogarithme(REGLAGES_DEMO, genererExerciceDeterminerParametresLogarithme);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDeterminerParametresLogarithme;
  revele: boolean;
}

export function App6gen18() {
  const [etat, setEtat] = useState<EtatSessionDeterminerParametresLogarithme>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionDeterminerParametresLogarithme`, jamais dans le moteur. Remis
   * à vide à chaque nouvel exercice (mêmes endroits que `enAttente`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Aide utilisée PAR PHASE DÉJÀ CLOSE — le moteur ne garde aucune trace persistante de l'aide une
   * fois la phase refermée (`niveauAide` est remis à 0 à chaque transition), capturé ICI au moment
   * exact de la clôture réelle (même garde que `terminerEtape`). Remis à vide comme `historique`. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseDeterminerParametresLogarithme, boolean>>>({});

  function terminerEtape(nouvelEtat: EtatSessionDeterminerParametresLogarithme, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereTransitionRevelee;
      // `votreReponse`/`niveauAide` : UNIQUEMENT capturés dans la branche de transition RÉELLE —
      // jamais à chaque clic sur "Valider".
      if (votreReponse !== undefined) {
        const valeurs = formatReponseAttenduePhaseLatex(exercice, etat.phase);
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[etat.phase],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (
              <span className="equation-box-termes">
                {valeurs.map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : undefined,
          },
        ]);
      }
      if (etat.niveauAide > 0) {
        setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: true }));
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
      setAideUtiliseeParPhase({});
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setEtat(demarrerSessionDeterminerParametresLogarithme(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;
  const niveauAide = etat.niveauAide;

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

  const aideCommun = {
    tentativesUtilisees,
    tentativesMax,
    niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  // Calculatrice scientifique — visible uniquement sur les écrans où un calcul de ln(k1) à la main
  // est réellement en jeu (valeur de m/n sous-type "point", valeur de p famille B) ; les écrans
  // purement symboliques (poser une équation/relation/inéquation) ne l'obtiennent pas.
  const calculatriceVisible = (phase === "aEcran2" && exercice.famille === "A" && exercice.sousType === "point") || phase === "bEcran2";

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionDeterminerParametresLogarithme`
  // avec `aideUtiliseeParPhase` capturé localement ci-dessus.
  const sequence = PHASES_PAR_FAMILLE[exercice.famille];
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionDeterminerParametresLogarithme(etat).map((segment, index) =>
    segment === "correcte" && aideUtiliseeParPhase[sequence[index]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Déterminer des paramètres depuis des conditions graphiques</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifDeterminerParametresLogarithme(etat)} />
        {exercice.famille === "A" && (
          <>
            {phase === "aEcran1" && (
              <EtapeDeuxChampsDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleA()}
                blocDonnees={blocDonneesA(exercice)}
                consigneEcran={consigneEcranA(phase)}
                labelA={labelsEcranA(exercice, phase).a}
                labelB={labelsEcranA(exercice, phase).b}
                placeholderA={placeholdersEcranA(exercice, phase).a}
                placeholderB={placeholdersEcranA(exercice, phase).b}
                aideNiveau1={aideNiveau1A(phase)}
                aideNiveau2={aideNiveau2A(exercice, phase)}
                diagnostiquer={(reponse) => diagnostiquerAEcran1(exercice, reponse)}
                onValider={(reponse) =>
                  terminerEtape(soumettreReponseAEcran1(etat, reponse), `${labelsEcranA(exercice, phase).a} = ${reponse.a} ; ${labelsEcranA(exercice, phase).b} = ${reponse.b}`)
                }
              />
            )}
            {phase === "aEcran2" && (
              <EtapeDeuxChampsDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleA()}
                blocDonnees={blocDonneesA(exercice)}
                consigneEcran={consigneEcranA(phase)}
                labelA={labelsEcranA(exercice, phase).a}
                labelB={labelsEcranA(exercice, phase).b}
                placeholderA={placeholdersEcranA(exercice, phase).a}
                placeholderB={placeholdersEcranA(exercice, phase).b}
                aideNiveau1={aideNiveau1A(phase)}
                aideNiveau2={aideNiveau2A(exercice, phase)}
                diagnostiquer={(reponse) => diagnostiquerAEcran2(exercice, reponse)}
                onValider={(reponse) =>
                  terminerEtape(soumettreReponseAEcran2(etat, reponse), `${labelsEcranA(exercice, phase).a} = ${reponse.a} ; ${labelsEcranA(exercice, phase).b} = ${reponse.b}`)
                }
              />
            )}
          </>
        )}

        {exercice.famille === "B" && (
          <>
            {phase === "bEcran1" && (
              <EtapeDeuxChampsDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleB()}
                blocDonnees={blocDonneesB(exercice)}
                consigneEcran={consigneEcranB(phase)}
                labelA={labelsEcranB(phase).a}
                labelB={labelsEcranB(phase).b}
                placeholderA={placeholdersEcranB(exercice, phase).a}
                placeholderB={placeholdersEcranB(exercice, phase).b}
                aideNiveau1={aideNiveau1B(phase)}
                aideNiveau2={aideNiveau2B(exercice, phase)}
                diagnostiquer={(reponse) => diagnostiquerBEcran1(exercice, reponse)}
                onValider={(reponse) => terminerEtape(soumettreReponseBEcran1(etat, reponse), `${labelsEcranB(phase).a} = ${reponse.a} ; ${labelsEcranB(phase).b} = ${reponse.b}`)}
              />
            )}
            {phase === "bEcran2" && (
              <EtapeChampDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleB()}
                blocDonnees={blocDonneesB(exercice)}
                consigneEcran={consigneEcranB(phase)}
                placeholder="ex : 1,3"
                aideNiveau1={aideNiveau1B(phase)}
                aideNiveau2={aideNiveau2B(exercice, phase)}
                diagnostiquer={(texte) => diagnostiquerBEcran2(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseBEcran2(etat, texte), texte)}
              />
            )}
            {phase === "bEcran3" && (
              <EtapeDeuxChampsDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleB()}
                blocDonnees={blocDonneesB(exercice)}
                consigneEcran={consigneEcranB(phase)}
                labelA={labelsEcranB(phase).a}
                labelB={labelsEcranB(phase).b}
                placeholderA={placeholdersEcranB(exercice, phase).a}
                placeholderB={placeholdersEcranB(exercice, phase).b}
                aideNiveau1={aideNiveau1B(phase)}
                aideNiveau2={aideNiveau2B(exercice, phase)}
                diagnostiquer={(reponse) => diagnostiquerBEcran3(exercice, reponse)}
                onValider={(reponse) => terminerEtape(soumettreReponseBEcran3(etat, reponse), `${labelsEcranB(phase).a} = ${reponse.a} ; ${labelsEcranB(phase).b} = ${reponse.b}`)}
              />
            )}
          </>
        )}

        {exercice.famille === "C" && (
          <>
            {phase === "cEcran1" && (
              <EtapeChampDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleC(exercice)}
                blocDonnees={blocDonneesC(exercice)}
                consigneEcran={consigneEcranC(phase)}
                placeholder={placeholderEcranC(exercice, phase)}
                aideNiveau1={aideNiveau1C(phase)}
                aideNiveau2={aideNiveau2C(exercice, phase)}
                diagnostiquer={(texte) => diagnostiquerCEcran1(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseCEcran1(etat, texte), texte)}
              />
            )}
            {phase === "cEcran2" && (
              <EtapeChampDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleC(exercice)}
                blocDonnees={blocDonneesC(exercice)}
                consigneEcran={consigneEcranC(phase)}
                placeholder={placeholderEcranC(exercice, phase)}
                aideNiveau1={aideNiveau1C(phase)}
                aideNiveau2={aideNiveau2C(exercice, phase)}
                diagnostiquer={(texte) => diagnostiquerCEcran2(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseCEcran2(etat, texte), texte)}
              />
            )}
            {phase === "cEcran3" && (
              <EtapeChampDeterminerParametres
                key={phase}
                {...aideCommun}
                consigneGenerale={consigneGeneraleC(exercice)}
                blocDonnees={blocDonneesC(exercice)}
                consigneEcran={consigneEcranC(phase)}
                placeholder={placeholderEcranC(exercice, phase)}
                aideNiveau1={aideNiveau1C(phase)}
                aideNiveau2={aideNiveau2C(exercice, phase)}
                diagnostiquer={(texte) => diagnostiquerCEcran3(exercice, texte)}
                onValider={(texte) => terminerEtape(soumettreReponseCEcran3(etat, texte), texte)}
              />
            )}
          </>
        )}

        {calculatriceVisible && <CalculatriceScientifique />}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
