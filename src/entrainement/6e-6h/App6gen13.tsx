import { useState } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesLogarithme } from "./generateurs6e/proprietesLogarithme";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProprietesLogarithme, soumettreReponseEcran1, soumettreReponseEcran2 } from "./moteur6e/sessionProprietesLogarithme";
import type { EtatSessionProprietesLogarithme } from "./moteur6e/typesProprietesLogarithme";
import { diagnostiquerEcran1, diagnostiquerEcran2 } from "./moteur6e/verificationProprietesLogarithme";
import { Katex } from "./components/Katex";
import { EtapeProprieteLogarithme } from "./components6e/EtapeProprieteLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { CONSIGNE_GENERALE, aideNiveau1, aideNiveau2, blocDonnees, consigneEcran, etatActuel, expressionDemandeeLatex, formatReponseAttenduePhaseLatex } from "./ui6e/formatProprietesLogarithme";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3, penaliteActivee: true };

function nouvelleSession(): EtatSessionProprietesLogarithme {
  return demarrerSessionProprietesLogarithme(REGLAGES_DEMO, genererExerciceProprietesLogarithme);
}

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

  function terminerEtape(nouvelEtat: EtatSessionProprietesLogarithme) {
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
    etatActuel: etatActuel(exercice, phase),
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Propriétés du logarithme</h1>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        {phase === "ecran1" && (
          <EtapeProprieteLogarithme
            key={phase}
            {...propsCommun}
            placeholder="ex : m+n"
            diagnostiquer={(texte) => diagnostiquerEcran1(exercice, texte)}
            onValider={(texte) => terminerEtape(soumettreReponseEcran1(etat, texte))}
          />
        )}
        {phase === "ecran2" && (
          <EtapeProprieteLogarithme
            key={phase}
            {...propsCommun}
            placeholder="ex : 3,874"
            diagnostiquer={(texte) => diagnostiquerEcran2(exercice, texte)}
            onValider={(texte) => terminerEtape(soumettreReponseEcran2(etat, texte))}
          />
        )}
      </main>
    </div>
  );
}
