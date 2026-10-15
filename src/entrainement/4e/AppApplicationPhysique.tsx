import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideNorme,
  demarrerSessionApplicationPhysique,
  soumettreReponseDeviation,
  soumettreReponseInterpretation,
  soumettreReponseModelisation,
  soumettreReponseNorme,
} from "./moteur/sessionApplicationPhysique";
import type { EtatSessionApplicationPhysique, PhaseApplicationPhysique } from "./moteur/typesApplicationPhysique";
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
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

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

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence des phases du
 * générateur (voir `PhaseApplicationPhysique`/les branches de `terminerEtape` ci-dessous). */
const ORDRE_PHASES: PhaseApplicationPhysique[] = ["modelisation", "norme", "deviation", "interpretation"];

/** Même ternaire que `terminerEtape` (ci-dessous) et `calculerRecapitulatifApplicationPhysique`
 * (`ui/formatApplicationPhysique.ts`) pour lire `scoreXxxExercice`/`xxxReveleExercice` — jamais une
 * valeur recalculée séparément. "interpretation" (dernière phase) n'a pas de score tracké dans
 * `EtatSessionApplicationPhysique` : tant que l'exercice n'est pas terminé elle est forcément
 * "courante" (dernière phase active), et une fois terminé un nouvel exercice démarre (l'état entier
 * est remis à zéro). */
function calculerSegmentsProgression(etat: EtatSessionApplicationPhysique): EtatPuceProgression[] {
  return ORDRE_PHASES.map((phase) => {
    if (phase === etat.phase) return "courante";
    const score =
      phase === "modelisation"
        ? etat.scoreModelisationExercice
        : phase === "norme"
          ? etat.scoreNormeExercice
          : phase === "deviation"
            ? etat.scoreDeviationExercice
            : null;
    if (score === null) return "a-venir";
    const revele =
      phase === "modelisation" ? etat.modelisationReveleExercice : phase === "norme" ? etat.normeReveleExercice : etat.deviationReveleExercice;
    if (revele) return "revele";
    // "modelisation"/"deviation" n'ont aucun mécanisme d'aide (toujours "correcte", jamais "aide").
    return phase === "norme" && etat.normeAideUtiliseeExercice ? "aide" : "correcte";
  });
}

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
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionApplicationPhysique`, jamais dans le moteur : la saisie de
   * l'élève n'a aucune autre utilité une fois l'étape close. Remis à vide à chaque nouvel exercice,
   * comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  /** Appelé juste avant `terminerEtape`, avec l'état DÉJÀ mis à jour par `soumettreReponseXxx` —
   * réutilise `calculerRecapitulatifApplicationPhysique` pour la réponse ATTENDUE (l'entrée qui
   * vient d'être ajoutée est toujours la dernière du tableau, les étapes se closent dans l'ordre).
   * Jamais appelée pour "interpretation" (dernière phase, clôture toujours immédiatement
   * l'exercice — aucune entrée de récapitulatif, et sa puce de progression n'est d'ailleurs jamais
   * "correcte"/"revele" dans `calculerSegmentsProgression`, donc jamais cliquable — même convention
   * que `AppAnalyseFonction.tsx`/"tableauSignes", qui n'appelle pas non plus `ajouterHistorique`
   * pour sa dernière phase). `votreReponse` est formatée séparément par chaque appelant. */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionApplicationPhysique) {
    const recap = calculerRecapitulatifApplicationPhysique(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? derniere.valeur : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * réellement (`transitionDEcran`) — jamais à chaque clic sur "Valider" (voir le garde-fou
   * identique dans `AppAnalyseFonction.tsx`, bug déjà rencontré et corrigé là-bas). */
  function terminerEtape(nouvelEtat: EtatSessionApplicationPhysique, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
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
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      setHistorique([]);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
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
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        {PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
        {etat.phase === "modelisation" ? (
          <EtapeModelisationApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onChoisir={(choix) =>
              terminerEtape(soumettreReponseModelisation(etat, choix), choix === "angleDroit" ? "Angle droit" : "Angle quelconque")
            }
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
            onValider={(valeur) => terminerEtape(soumettreReponseNorme(etat, valeur), `${valeur} ${exercice.unite}`)}
            validation={validation}
          />
        ) : etat.phase === "deviation" ? (
          <EtapeDeviationApplicationPhysique
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            recapitulatif={calculerRecapitulatifApplicationPhysique(etat)}
            onValider={(valeur) => terminerEtape(soumettreReponseDeviation(etat, valeur), `${valeur}°`)}
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

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
