import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCaracteristiquesDroite } from "./generateurs/caracteristiquesDroite";
import type { VarianteCaracteristiquesDroite } from "./core/caracteristiquesDroite.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { activerAideSuivante, demarrerSessionCaracteristiquesDroite, soumettreReponseCaracteristiques, soumettreReponseExtraction } from "./moteur/sessionCaracteristiquesDroite";
import type { EtatSessionCaracteristiquesDroite, PhaseCaracteristiquesDroite } from "./moteur/typesCaracteristiquesDroite";
import { EtapeCaracteristiquesDroite } from "./components/EtapeCaracteristiquesDroite";
import { EtapeExtractionCaracteristiquesDroite } from "./components/EtapeExtractionCaracteristiquesDroite";
import { Katex } from "./components/Katex";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifCaracteristiquesDroite } from "./ui/recapitulatifCaracteristiquesDroite";
import { formatCaracteristiquesAttenduesLatex, formatEnonceLatex, formatEtatActuelPointVecteurLatex } from "./ui/formatCaracteristiquesDroite";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import type { ReponseCaracteristiques, ReponseChamp, ReponseExtraction } from "./moteur/verificationCaracteristiquesDroite";
import { formatNombreLatex } from "./ui/formatCaracteristiquesDroite";

const CONSIGNE_GENERALE = "Détermine les caractéristiques de cette droite.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCaracteristiquesDroite {
  return demarrerSessionCaracteristiquesDroite(REGLAGES_DEMO, genererExerciceCaracteristiquesDroite);
}

const ORDRE_PHASES: PhaseCaracteristiquesDroite[] = ["extraction", "caracteristiques"];

/** Segments de la barre de puces — séquence FIXE à 2 écrans, toujours la même (voir
 * `typesCaracteristiquesDroite.ts`). "caracteristiques" (dernière phase, clôture l'exercice) n'a
 * jamais besoin de sa propre branche "close" — même principe que `AppFormeCanoniqueTransformations.tsx`.
 * Les segments clos sont cliquables (`FicheReponseEcran`, même patron que `AppNormeDistance.tsx`). */
function calculerSegmentsProgression(etat: EtatSessionCaracteristiquesDroite): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    if (etat.extractionRevele) return "revele";
    return etat.niveauAideExtraction > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCaracteristiquesDroite;
  revele: boolean;
}

const TITRES_ECRANS: Record<PhaseCaracteristiquesDroite, string> = {
  extraction: "Point et vecteur directeur",
  caracteristiques: "Caractéristiques",
};

/** Nombre saisi par l'élève une fois lu : fraction à petit dénominateur (≤ 12, ce qu'il a pu taper
 * « p/q ») sinon décimal à virgule (« 0,33 » reste « 0,33 », jamais « 33/100 »). */
function formatSaisieLatex(valeur: number): string {
  const q = Array.from({ length: 12 }, (_, i) => i + 1).find((d) => Math.abs(valeur * d - Math.round(valeur * d)) < 1e-9);
  return q !== undefined ? formatNombreLatex(valeur) : String(valeur).replace(".", "{,}");
}

/** « n'existe pas » pour un champ déclaré inexistant. */
function formatChampLatex(champ: ReponseChamp): string {
  return champ.existe ? formatSaisieLatex(champ.valeur) : "\\text{n'existe pas}";
}

function formatReponseExtraction(reponse: ReponseExtraction): ReactNode {
  return (
    <Katex
      expression={`A(${formatSaisieLatex(reponse.point.x)} ; ${formatSaisieLatex(reponse.point.y)}) \\quad \\vec{u}\\begin{pmatrix} ${formatSaisieLatex(reponse.vecteur.x)} \\\\ ${formatSaisieLatex(reponse.vecteur.y)} \\end{pmatrix}`}
    />
  );
}

function formatReponseCaracteristiques(exercice: EtatSessionCaracteristiquesDroite["exerciceCourant"], reponse: ReponseCaracteristiques): ReactNode {
  const principal = exercice.caracteristiqueDemandee === "pente" ? `m = ${formatChampLatex(reponse.champPrincipal)}` : `\\alpha = ${formatChampLatex(reponse.champPrincipal)}^\\circ`;
  return <Katex expression={`${principal}, \\quad p = ${formatChampLatex(reponse.ordonnee)}`} />;
}

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue ». */
function construireReponseAttendue(exercice: EtatSessionCaracteristiquesDroite["exerciceCourant"], phase: PhaseCaracteristiquesDroite): ReactNode {
  return phase === "extraction" ? <Katex expression={formatEtatActuelPointVecteurLatex(exercice)} /> : <Katex expression={formatCaracteristiquesAttenduesLatex(exercice)} />;
}

export function AppCaracteristiquesDroite() {
  const [etat, setEtat] = useState<EtatSessionCaracteristiquesDroite>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — un écran clos = une entrée,
   * dans l'ordre de `ORDRE_PHASES` (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionCaracteristiquesDroite, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "extraction" ? nouvelEtat.extractionRevele : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.caracteristiquesRevele;
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

  function forcerVariante(id: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionCaracteristiquesDroite(REGLAGES_DEMO, () => construireAvecVarianteId(id as VarianteCaracteristiquesDroite)));
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifCaracteristiquesDroite(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec ? undefined : construireReponseAttendue(exercice, etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Caractéristiques d'une droite</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
        <EnTeteExercice
          consigneGenerale={CONSIGNE_GENERALE}
          blocDonnees={
            <div className="equation-box">
              <Katex expression={formatEnonceLatex(exercice)} />
            </div>
          }
        />
        <RecapitulatifPanel entrees={recapitulatif} />
        {etat.phase === "extraction" ? (
          <EtapeExtractionCaracteristiquesDroite
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideExtraction}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseExtraction(etat, reponse), formatReponseExtraction(reponse))}
            validation={validation}
          />
        ) : (
          <EtapeCaracteristiquesDroite
            key={`${numeroExercice}-${etat.phase}`}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAideCaracteristiques}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse) => terminerEtape(soumettreReponseCaracteristiques(etat, reponse), formatReponseCaracteristiques(exercice, reponse))}
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
