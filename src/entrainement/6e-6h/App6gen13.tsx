import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesLogarithme } from "./generateurs6e/proprietesLogarithme";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProprietesLogarithme, soumettreReponseEcran1, soumettreReponseEcran2 } from "./moteur6e/sessionProprietesLogarithme";
import type { EtatSessionProprietesLogarithme, PhaseProprietesLogarithme } from "./moteur6e/typesProprietesLogarithme";
import { diagnostiquerEcran1, diagnostiquerEcran2 } from "./moteur6e/verificationProprietesLogarithme";
import { Katex } from "./components/Katex";
import { EtapeProprieteLogarithme } from "./components6e/EtapeProprieteLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { CONSIGNE_GENERALE, LIBELLE_PHASE, aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, expressionDemandeeLatex, formatReponseAttenduePhaseLatex } from "./ui6e/formatProprietesLogarithme";
import { calculerRecapitulatifProprietesLogarithme, calculerSegmentsProgressionProprietesLogarithme } from "./ui6e/recapitulatifProprietesLogarithme";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProprietesLogarithme {
  return demarrerSessionProprietesLogarithme(REGLAGES_DEMO, genererExerciceProprietesLogarithme);
}

/** Séquence FIXE à 2 écrans (`typesProprietesLogarithme.ts`, "UNE SEULE famille, 2 écrans FIXES"). */
const SEQUENCE: PhaseProprietesLogarithme[] = ["ecran1", "ecran2"];

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionProprietesLogarithme;
  revele: boolean;
}

export function App6gen13() {
  const [etat, setEtat] = useState<EtatSessionProprietesLogarithme>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionProprietesLogarithme`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice (mêmes endroits que `enAttente`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Aide utilisée PAR PHASE DÉJÀ CLOSE — le moteur ne garde aucune trace persistante de l'aide une
   * fois la phase refermée (`niveauAide` est remis à 0 à chaque transition), capturé ICI au moment
   * exact de la clôture réelle (même garde que `terminerEtape`). Remis à vide comme `historique`. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseProprietesLogarithme, boolean>>>({});

  function terminerEtape(nouvelEtat: EtatSessionProprietesLogarithme, votreReponse?: ReactNode) {
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
    setEtat(demarrerSessionProprietesLogarithme(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
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

  const propsCommun = {
    consigneGenerale: CONSIGNE_GENERALE,
    expressionLatex: expressionDemandeeLatex(exercice),
    blocDonnees: blocDonnees(exercice),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: aideNiveau1(exercice, phase),
    aideNiveau2: aideNiveau2(exercice, phase),
    tentativesUtilisees,
    tentativesMax,
    niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionProprietesLogarithme`
  // avec `aideUtiliseeParPhase` capturé localement ci-dessus.
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionProprietesLogarithme(etat).map((segment, index) =>
    segment === "correcte" && aideUtiliseeParPhase[SEQUENCE[index]] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Propriétés du logarithme</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifProprietesLogarithme(etat)} />
        {phase === "ecran1" && (
          <EtapeProprieteLogarithme
            key={phase}
            {...propsCommun}
            placeholder="ex : m+n"
            diagnostiquer={(texte) => diagnostiquerEcran1(exercice, texte)}
            onValider={(texte) => terminerEtape(soumettreReponseEcran1(etat, texte), texte)}
          />
        )}
        {phase === "ecran2" && (
          <EtapeProprieteLogarithme
            key={phase}
            {...propsCommun}
            placeholder="ex : 3,874"
            diagnostiquer={(texte) => diagnostiquerEcran2(exercice, texte)}
            onValider={(texte) => terminerEtape(soumettreReponseEcran2(etat, texte), texte)}
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
