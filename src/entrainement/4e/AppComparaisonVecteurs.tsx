import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceComparaisonVecteurs, ProprieteComparaison } from "./core/comparaisonVecteurs.types";
import type { ReglagesSession } from "./core/session.types";
import { demarrerSessionComparaisonVecteurs, soumettreReponseEgalite, soumettreReponseSelection } from "./moteur/sessionComparaisonVecteurs";
import type { EtatSessionComparaisonVecteurs, PhaseComparaisonVecteurs } from "./moteur/typesComparaisonVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparaisonVecteurs } from "./generateurs/comparaisonVecteurs";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeSelectionComparaison } from "./components/EtapeSelectionComparaison";
import { EtapeEgaliteComparaison } from "./components/EtapeEgaliteComparaison";
import { Katex } from "./components/Katex";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import type { EntreeRecapitulatif } from "./ui/recapitulatif";

const CONSIGNE_GENERALE = "Compare visuellement ces vecteurs sur la figure.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionComparaisonVecteurs {
  return demarrerSessionComparaisonVecteurs(REGLAGES_DEMO, genererExerciceComparaisonVecteurs);
}

/** Coefficient jamais explicite s'il vaut `1`/`-1` — même convention que le reste de la
 * plateforme (ex. `formatRelationVectorielle.ts::formatCoefficientTraduction`). */
function formatCoefficientLatex(coef: number): string {
  if (coef === 1) return "";
  if (coef === -1) return "-";
  return String(coef);
}

function formatVecteursAttendusLatex(labels: string[]): string {
  return labels.map((label) => `\\vec{${label}}`).join(", ");
}

function formatEgaliteAttendueLatex(exercice: ExerciceComparaisonVecteurs): string {
  return `\\vec{${exercice.cibleEgalite}} = ${formatCoefficientLatex(exercice.coefficientEgalite)}\\vec{${exercice.labelReference}}`;
}

const LIBELLES_PROPRIETE: Record<ProprieteComparaison, string> = {
  longueur: "même longueur",
  direction: "même direction",
  sens: "même sens",
};

/** Titre d'un écran (fiche de consultation et ligne du récapitulatif). */
function titreEcran(exercice: ExerciceComparaisonVecteurs, phase: PhaseComparaisonVecteurs): string {
  // Texte brut (pas de KaTeX dans un libellé) : « le vecteur rouge » plutôt qu'une lettre sans flèche.
  return phase === "selection" ? `Vecteurs de ${LIBELLES_PROPRIETE[exercice.propriete]} que le vecteur rouge` : "Égalité";
}

/** Récapitulatif « Ce qu'on sait déjà » — seule l'étape « sélection » précède une autre étape. */
function calculerRecapitulatif(etat: EtatSessionComparaisonVecteurs): EntreeRecapitulatif[] {
  if (etat.scoreSelectionExercice === null) return [];
  return [
    {
      libelle: titreEcran(etat.exerciceCourant, "selection"),
      estLatex: true,
      valeur: formatVecteursAttendusLatex(etat.exerciceCourant.labelsCorrects),
      revele: etat.selectionRevele,
    },
  ];
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionComparaisonVecteurs;
  revele: boolean;
}

const ORDRE_PHASES: PhaseComparaisonVecteurs[] = ["selection", "egalite"];

function calculerSegmentsProgression(etat: EtatSessionComparaisonVecteurs): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    return etat.selectionRevele ? "revele" : "correcte";
  });
}

export function AppComparaisonVecteurs() {
  const [etat, setEtat] = useState<EtatSessionComparaisonVecteurs>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables) — tenu ICI, jamais dans
   * le moteur ; remis à vide à chaque nouvel exercice (patron gen16). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») : inclus dans la `key`
   * des écrans, pour que la sélection/saisie de l'exercice précédent ne survive pas. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  const exercice = etat.exerciceCourant;

  const reponseAttendue =
    etat.phase === "selection" ? (
      <Katex expression={formatVecteursAttendusLatex(exercice.labelsCorrects)} />
    ) : (
      <Katex expression={formatEgaliteAttendueLatex(exercice)} />
    );

  function terminerEtape(nouvelEtat: EtatSessionComparaisonVecteurs, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "selection" ? nouvelEtat.selectionRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.egaliteRevele;
      setHistorique((h) => [
        ...h,
        { titre: titreEcran(exercice, etat.phase), votreReponse, correcte: !revele, reponseAttendue: revele ? reponseAttendue : undefined },
      ]);
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
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionComparaisonVecteurs(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as ProprieteComparaison)));
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Comparaison visuelle de vecteurs sur figure</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
        <RecapitulatifPanel entrees={calculerRecapitulatif(etat)} />
        {etat.phase === "selection" ? (
          <EtapeSelectionComparaison
            key={`${numeroExercice}-${etat.phase}`}
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(labels) =>
              terminerEtape(
                soumettreReponseSelection(etat, labels),
                <Katex expression={formatVecteursAttendusLatex([...labels].sort())} />,
              )
            }
            validation={validation}
          />
        ) : (
          <EtapeEgaliteComparaison
            key={`${numeroExercice}-${etat.phase}`}
            exercice={etat.exerciceCourant}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            onValider={(texte) => terminerEtape(soumettreReponseEgalite(etat, texte), texte)}
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
