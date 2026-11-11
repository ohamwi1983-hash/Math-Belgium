import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideIntervalle,
  activerAideSimplification,
  demarrerSessionInequation,
  soumettreReponseIntervalle,
  soumettreReponseRacines,
  soumettreReponseSigneA,
  soumettreReponseSimplification,
} from "./moteur/sessionInequation";
import type { EtatSessionInequation, PhaseInequation } from "./moteur/sessionInequation";
import { diagnostiquerSimplification } from "./moteur/verificationInequation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInequation, type VarianteInequationId } from "./generateurs/inequations";
import { EtapeRacines } from "./components/EtapeRacines";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { EtapeSigneA } from "./components/EtapeSigneA";
import { EtapeInequation } from "./components/EtapeInequation";
import { EtapeSimplificationInequation } from "./components/EtapeSimplificationInequation";
import { formatSolutionEnsemble } from "./ui/formatSolutionEnsemble";
import { formatInequationLatex } from "./ui/formatInequation";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifInequation } from "./ui/recapitulatifInequation";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, nombreTexte, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Détermine le signe de ce trinôme du second degré.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionInequation {
  return demarrerSessionInequation(REGLAGES_DEMO, genererExerciceInequation);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille), son exercice est cette instance — tirée avec les MÊMES fonctions et le MÊME catalogue
 * que l'adaptateur d'export ; la suite reste un tirage normal. */
function sessionInitiale(): EtatSessionInequation {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionInequation(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceInequation, (id) => construireAvecVarianteId(id as VarianteInequationId)));
}

/** Nombre RÉEL d'écrans de l'exercice : la simplification (première phase) n'existe que si
 * pgcd(|a|,|b|,|c|) > 1 — elle est alors en cours ou déjà close. */
function nombreEcrans(etat: EtatSessionInequation): number {
  return 3 + (etat.phase === "simplification" || etat.scoreSimplificationExercice !== null ? 1 : 0);
}

const TITRES: Record<PhaseInequation, string> = {
  simplification: "Inéquation simplifiée",
  racines: "Racines",
  signe_a: "Signe de a",
  intervalle: "Ensemble des solutions",
};

function formatRacines(racines: readonly number[] | undefined): string {
  if (racines === undefined) return "∅";
  return racines[0] === racines[1] ? nombreTexte(racines[0]!) : racines.map(nombreTexte).join(" ; ");
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionInequation;
  revele: boolean;
}

export function AppInequation() {
  const [etat, setEtat] = useState<EtatSessionInequation>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionInequation`, jamais dans le moteur. Remis à vide à chaque
   * nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Réponse attendue de l'écran qui se clôt — la même que celle de l'écran de validation. */
  function reponseAttendueEcran(phase: PhaseInequation, nouvelEtat: EtatSessionInequation): ReactNode {
    const ex = etat.exerciceCourant;
    if (phase === "simplification") return <Katex expression={formatInequationLatex(nouvelEtat.exerciceCourant.enonce, nouvelEtat.exerciceCourant.symbole)} />;
    if (phase === "racines") return formatRacines(ex.racines);
    if (phase === "signe_a") return ex.enonce.a > 0 ? "a > 0" : "a < 0";
    return <>S = {formatSolutionEnsemble(ex.solution)}</>;
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * réellement (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde-fou que
   * `AppAnalyseFonction.tsx`, bug déjà rencontré et corrigé là-bas). */
  function terminerEtape(nouvelEtat: EtatSessionInequation, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "simplification"
          ? nouvelEtat.simplificationRevele
          : etat.phase === "racines"
            ? nouvelEtat.racinesRevele
            : etat.phase === "signe_a"
              ? nouvelEtat.signeARevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.intervalleRevele;
      const aide = etat.phase === "simplification" ? etat.aideSimplificationUtilisee : etat.phase === "intervalle" ? etat.aideUtilisee : false;
      setHistorique((h) => [...h, ecranClos(TITRES[etat.phase], votreReponse, revele, aide, reponseAttendueEcran(etat.phase, nouvelEtat))]);
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
      setFicheOuverteIndex(null);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEtat(demarrerSessionInequation(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteInequationId)));
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifInequation(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "simplification"
            ? <>Inéquation simplifiée attendue : {reponseAttendueEcran("simplification", enAttente.etatSuivant)}</>
            : etat.phase === "racines"
              ? <>Zéros attendus : {formatRacines(exercice.racines)}</>
              : etat.phase === "signe_a"
                ? <>Signe de a attendu : {exercice.enonce.a > 0 ? "a > 0" : "a < 0"}</>
                : <>Réponse attendue : S = {formatSolutionEnsemble(exercice.solution)}</>,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Tableau de signes d'un trinôme du second degré</h1>
        <p className="app-subtitle">Inéquations du second degré</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, nombreEcrans(etat), !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={formatInequationLatex(exercice.enonce, exercice.symbole)} block />
              </div>
            }
          />
          {etat.phase === "simplification" ? (
            <EtapeSimplificationInequation
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              diagnostiquer={(v) => diagnostiquerSimplification(exercice, v)}
              aideActivee={etat.aideSimplificationUtilisee}
              onActiverAide={() => setEtat(activerAideSimplification(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSimplification(etat, reponse), saisieEnLatex(reponse))}
              validation={validation}
            />
          ) : etat.phase === "racines" ? (
            <EtapeRacines
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse) =>
                terminerEtape(
                  soumettreReponseRacines(etat, reponse),
                  reponse.type === "aucune" ? "Pas de solution" : reponse.x1 === reponse.x2 ? `x = ${nombreTexte(reponse.x1)}` : `x = ${nombreTexte(reponse.x1)} ; x = ${nombreTexte(reponse.x2)}`,
                )
              }
              validation={validation}
            />
          ) : etat.phase === "signe_a" ? (
            <EtapeSigneA
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(reponse) => terminerEtape(soumettreReponseSigneA(etat, reponse), reponse === "+" ? "a > 0" : "a < 0")}
              validation={validation}
            />
          ) : (
            <EtapeInequation
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideUtilisee}
              onActiverAide={() => setEtat(activerAideIntervalle(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIntervalle(etat, reponse), <>S = {formatSolutionEnsemble(reponse)}</>)}
              validation={validation}
            />
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
