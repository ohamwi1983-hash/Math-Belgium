import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercleDeveloppee } from "./generateurs/equationCercleDeveloppee";
import type { VarianteEquationCercleDeveloppee } from "./core/equationCercleDeveloppee.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import {
  activerAideSuivante,
  demarrerSessionEquationCercleDeveloppee,
  soumettreReponseCentreRayon,
  soumettreReponseCompletion,
  soumettreReponseRegroupement,
} from "./moteur/sessionEquationCercleDeveloppee";
import type { EtatSessionEquationCercleDeveloppee, PhaseEquationCercleDeveloppee } from "./moteur/typesEquationCercleDeveloppee";
import { EtapeCentreRayonEquationCercleDeveloppee } from "./components/EtapeCentreRayonEquationCercleDeveloppee";
import { EtapeCompletionEquationCercleDeveloppee } from "./components/EtapeCompletionEquationCercleDeveloppee";
import { EtapeRegroupementEquationCercleDeveloppee } from "./components/EtapeRegroupementEquationCercleDeveloppee";
import { Katex } from "./components/Katex";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifEquationCercleDeveloppee } from "./ui/recapitulatifEquationCercleDeveloppee";
import { formatCentreAttenduLatex, formatCompletionLatex, formatRayonAttenduLatex, formatRegroupementLatex } from "./ui/formatEquationCercleDeveloppee";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import type { ExerciceEquationCercleDeveloppee } from "./core/equationCercleDeveloppee.types";
import { nombreFr } from "./ui/nombreFr";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationCercleDeveloppee {
  return demarrerSessionEquationCercleDeveloppee(REGLAGES_DEMO, genererExerciceEquationCercleDeveloppee);
}

const ORDRE_PHASES: PhaseEquationCercleDeveloppee[] = ["regroupement", "completion", "centreRayon"];

function calculerSegmentsProgression(etat: EtatSessionEquationCercleDeveloppee): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "regroupement" ? etat.regroupementRevele : etat.completionRevele;
    if (revele) return "revele";
    const niveauAide = phase === "regroupement" ? etat.niveauAideRegroupement : etat.niveauAideCompletion;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** Titre de la fiche de consultation — mêmes libellés que le récapitulatif
 * (`ui/recapitulatifEquationCercleDeveloppee.ts`). */
const TITRES_ECRANS: Record<PhaseEquationCercleDeveloppee, string> = {
  regroupement: "Regroupement",
  completion: "Complétion du carré",
  centreRayon: "Centre et rayon",
};

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (audit chapitre 7, point 5). */
function construireReponseAttendue(exercice: ExerciceEquationCercleDeveloppee, phase: PhaseEquationCercleDeveloppee): ReactNode {
  if (phase === "regroupement") return <Katex expression={formatRegroupementLatex(exercice)} />;
  if (phase === "completion") return <Katex expression={formatCompletionLatex(exercice)} />;
  return <Katex expression={`\\text{centre } ${formatCentreAttenduLatex(exercice)}, \\quad R = ${formatRayonAttenduLatex(exercice)}`} />;
}

/** Saisie libre de l'élève, telle quelle — champ vide affiché « — ». */
function saisieBrute(texte: string): ReactNode {
  return texte.trim() === "" ? "—" : texte;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationCercleDeveloppee;
  revele: boolean;
}

export function AppEquationCercleDeveloppee() {
  const [etat, setEtat] = useState<EtatSessionEquationCercleDeveloppee>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — un écran clos = une entrée,
   * dans l'ordre de `ORDRE_PHASES` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionEquationCercleDeveloppee, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "regroupement"
          ? nouvelEtat.regroupementRevele
          : etat.phase === "completion"
            ? nouvelEtat.completionRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.centreRayonRevele;
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      setHistorique((h) => [
        ...h,
        { titre: TITRES_ECRANS[etat.phase], votreReponse, correcte: !revele, reponseAttendue: construireReponseAttendue(etat.exerciceCourant, etat.phase) },
      ]);
      return;
    }
    setEtat(nouvelEtat);
  }

  function reinitialiserHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) reinitialiserHistorique();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifEquationCercleDeveloppee(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionEquationCercleDeveloppee(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteEquationCercleDeveloppee)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: construireReponseAttendue(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Centre et rayon d'un cercle depuis l'équation développée</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "centreRayon" && exercice.variante === "irrationnel" && <CalculatriceScientifique />}
        {etat.phase === "regroupement" ? (
          <EtapeRegroupementEquationCercleDeveloppee
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideRegroupement}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseRegroupement(etat, reponse), saisieBrute(reponse))}
            validation={validation}
          />
        ) : etat.phase === "completion" ? (
          <EtapeCompletionEquationCercleDeveloppee
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCompletion}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCompletion(etat, reponse), saisieBrute(reponse))}
            validation={validation}
          />
        ) : (
          <EtapeCentreRayonEquationCercleDeveloppee
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCentreRayon}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCentreRayon(etat, reponse), <>centre ({nombreFr(reponse.x)} ; {nombreFr(reponse.y)}), R = {saisieBrute(reponse.rayon)}</>)}
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
