import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationCercle } from "./generateurs/equationCercle";
import type { VarianteEquationCercle } from "./core/equationCercle.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionEquationCercle, soumettreReponseCentre, soumettreReponseEquation, soumettreReponseRayon } from "./moteur/sessionEquationCercle";
import type { EtatSessionEquationCercle, PhaseEquationCercle } from "./moteur/typesEquationCercle";
import { EtapeCentreEquationCercle } from "./components/EtapeCentreEquationCercle";
import { EtapeEquationEquationCercle } from "./components/EtapeEquationEquationCercle";
import { EtapeRayonEquationCercle } from "./components/EtapeRayonEquationCercle";
import { Katex } from "./components/Katex";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifEquationCercle } from "./ui/recapitulatifEquationCercle";
import { formatEquationAttendueLatex, formatEtatActuelCentreLatex, formatRayonLatex } from "./ui/formatEquationCercle";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import type { ExerciceEquationCercle } from "./core/equationCercle.types";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionEquationCercle {
  return demarrerSessionEquationCercle(REGLAGES_DEMO, genererExerciceEquationCercle);
}

const ORDRE_PHASES: PhaseEquationCercle[] = ["centre", "rayon", "equation"];

function calculerSegmentsProgression(etat: EtatSessionEquationCercle): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "centre" ? etat.centreRevele : etat.rayonRevele;
    if (revele) return "revele";
    const niveauAide = phase === "centre" ? etat.niveauAideCentre : etat.niveauAideRayon;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** Titre de la fiche de consultation — mêmes libellés que le récapitulatif
 * (`ui/recapitulatifEquationCercle.ts`). */
const TITRES_ECRANS: Record<PhaseEquationCercle, string> = {
  centre: "Centre",
  rayon: "Rayon",
  equation: "Équation",
};

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (audit chapitre 7, point 5). */
function construireReponseAttendue(exercice: ExerciceEquationCercle, phase: PhaseEquationCercle): ReactNode {
  if (phase === "centre") return <Katex expression={formatEtatActuelCentreLatex(exercice)} />;
  if (phase === "rayon") return <Katex expression={`R = ${formatRayonLatex(exercice)}`} />;
  return <Katex expression={formatEquationAttendueLatex(exercice)} />;
}

/** Saisie libre de l'élève, telle quelle — champ vide affiché « — ». */
function saisieBrute(texte: string): ReactNode {
  return texte.trim() === "" ? "—" : texte;
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationCercle;
  revele: boolean;
}

export function AppEquationCercle() {
  const [etat, setEtat] = useState<EtatSessionEquationCercle>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — un écran clos = une entrée,
   * dans l'ordre de `ORDRE_PHASES` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionEquationCercle, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "centre"
          ? nouvelEtat.centreRevele
          : etat.phase === "rayon"
            ? nouvelEtat.rayonRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.equationRevele;
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
  const recapitulatif = calculerRecapitulatifEquationCercle(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionEquationCercle(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteEquationCercle)));
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
        <h1 className="app-title">Équation d'un cercle (non développée) à partir d'un graphe</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "centre" ? (
          <EtapeCentreEquationCercle
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCentre}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCentre(etat, reponse), <Katex expression={`(${reponse.x} \\; ; \\; ${reponse.y})`} />)}
            validation={validation}
          />
        ) : etat.phase === "rayon" ? (
          <EtapeRayonEquationCercle
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideRayon}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseRayon(etat, reponse), saisieBrute(reponse))}
            validation={validation}
          />
        ) : (
          <EtapeEquationEquationCercle
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideEquation}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseEquation(etat, reponse), saisieBrute(reponse))}
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
