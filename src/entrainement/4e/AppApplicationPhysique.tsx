import { useState } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideNorme,
  demarrerSessionApplicationPhysique,
  soumettreReponseDeviation,
  soumettreReponseInterpretation,
  soumettreReponseModelisation,
  soumettreReponseNorme,
} from "./moteur/sessionApplicationPhysique";
import type { EtatSessionApplicationPhysique } from "./moteur/typesApplicationPhysique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceApplicationPhysique } from "./generateurs/applicationPhysique";
import type { VarianteApplicationPhysique } from "./core/applicationPhysique.types";
import { calculerRecapitulatifApplicationPhysique, notationVecteursApplicationPhysique } from "./ui/formatApplicationPhysique";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeModelisationApplicationPhysique } from "./components/EtapeModelisationApplicationPhysique";
import { EtapeNormeApplicationPhysique } from "./components/EtapeNormeApplicationPhysique";
import { EtapeDeviationApplicationPhysique } from "./components/EtapeDeviationApplicationPhysique";
import { EtapeInterpretationApplicationPhysique } from "./components/EtapeInterpretationApplicationPhysique";
import { Katex } from "./components/Katex";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  penaliteActivee: true,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionApplicationPhysique {
  return demarrerSessionApplicationPhysique(REGLAGES_DEMO, genererExerciceApplicationPhysique);
}

/** Loi des cosinus (norme de la résultante) puis loi des sinus (angle de déviation) — deux calculs
 * décimaux non fournis par l'énoncé ; "modelisation" est un choix catégoriel, "interpretation" un QCM. */
const PHASES_CALCULATRICE = new Set<EtatSessionApplicationPhysique["phase"]>(["norme", "deviation"]);

const LIBELLE_PHASE: Record<EtatSessionApplicationPhysique["phase"], string> = {
  modelisation: "Configuration",
  norme: "Norme",
  deviation: "Déviation",
  interpretation: "Interprétation",
};

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionApplicationPhysique;
  revele: boolean;
}

export function AppApplicationPhysique() {
  const [etat, setEtat] = useState<EtatSessionApplicationPhysique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionApplicationPhysique) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "modelisation"
          ? nouvelEtat.modelisationReveleExercice
          : etat.phase === "norme"
            ? nouvelEtat.normeReveleExercice
            : etat.phase === "deviation"
              ? nouvelEtat.deviationReveleExercice
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.interpretationRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setEtat(demarrerSessionApplicationPhysique(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteApplicationPhysique)));
  }

  const exercice = etat.exerciceCourant;
  const { v1, resultante, normeResultante } = notationVecteursApplicationPhysique(exercice.contexte);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue:
          !etat.reglages.affichageReponseApresEchec ? undefined : etat.phase === "norme" ? (
            <>
              Norme attendue (<Katex expression={normeResultante} />) : {Math.round(exercice.triangle.a * 100) / 100} {exercice.unite}
            </>
          ) : etat.phase === "deviation" ? (
            <>
              Déviation attendue (angle entre <Katex expression={v1} /> et <Katex expression={resultante} />) :{" "}
              {Math.round(exercice.triangle.C * 100) / 100}°
            </>
          ) : etat.phase === "interpretation" ? (
            <>Direction attendue : {exercice.directionCorrecte}</>
          ) : undefined,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Applications physiques (résultante de vecteurs)</h1>
        <p className="app-subtitle">Chapitre 4 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <div className="card-progress">
          <div className="card-progress-row">
            <span className="card-progress-phase">{LIBELLE_PHASE[etat.phase]}</span>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="card-body">
        {PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
        {etat.phase === "modelisation" ? (
          <EtapeModelisationApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onChoisir={(choix) => terminerEtape(soumettreReponseModelisation(etat, choix))}
            validation={validation}
          />
        ) : etat.phase === "norme" ? (
          <EtapeNormeApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideNorme}
            recapitulatif={calculerRecapitulatifApplicationPhysique(etat)}
            onActiverAide={() => setEtat(activerAideNorme(etat))}
            onValider={(valeur) => terminerEtape(soumettreReponseNorme(etat, valeur))}
            validation={validation}
          />
        ) : etat.phase === "deviation" ? (
          <EtapeDeviationApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            recapitulatif={calculerRecapitulatifApplicationPhysique(etat)}
            onValider={(valeur) => terminerEtape(soumettreReponseDeviation(etat, valeur))}
            validation={validation}
          />
        ) : (
          <EtapeInterpretationApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            recapitulatif={calculerRecapitulatifApplicationPhysique(etat)}
            onValider={(direction) => terminerEtape(soumettreReponseInterpretation(etat, direction))}
            validation={validation}
          />
        )}
        </div>
      </main>
    </div>
  );
}
