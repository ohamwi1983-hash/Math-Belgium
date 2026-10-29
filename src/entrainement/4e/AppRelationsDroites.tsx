import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelationsDroites } from "./generateurs/relationsDroites";
import type { ExerciceRelationsDroites, RelationReconnue, VarianteRelationsDroites } from "./core/relationsDroites.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  activerAideSuivante,
  demarrerSessionRelationsDroites,
  soumettreReponseConstruction,
  soumettreReponseEquation,
  soumettreReponseExtraction,
  soumettreReponseExtraction2,
  soumettreReponseRelation,
} from "./moteur/sessionRelationsDroites";
import type { EtatSessionRelationsDroites, PhaseRelationsDroites, ReponseEquation } from "./moteur/typesRelationsDroites";
import { SEQUENCES_RELATIONS_DROITES } from "./moteur/typesRelationsDroites";
import type { ReponseVecteur } from "./moteur/verificationRelationsDroites";
import { EtapeConstructionRelationsDroites } from "./components/EtapeConstructionRelationsDroites";
import { EtapeEquationRelationsDroites } from "./components/EtapeEquationRelationsDroites";
import { EtapeExtractionRelationsDroites } from "./components/EtapeExtractionRelationsDroites";
import { EtapeRelationRelationsDroites } from "./components/EtapeRelationRelationsDroites";
import { Katex } from "./components/Katex";
import {
  LIBELLE_RELATION,
  formatConstructionAttendueLatex,
  formatEquationAttendueLatex,
  formatEtatActuelVecteur2Latex,
  formatEtatActuelVecteurReferenceLatex,
  formatRelationAttendueLatex,
} from "./ui/formatRelationsDroites";
import { formatRepresentationParametriqueLatex } from "./ui/formatEquationDroite";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifRelationsDroites } from "./ui/recapitulatifRelationsDroites";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionRelationsDroites {
  return demarrerSessionRelationsDroites(REGLAGES_DEMO, genererExerciceRelationsDroites);
}

/** Puces de progression — même ordre que la vraie séquence de la famille de l'exercice
 * (`SEQUENCES_RELATIONS_DROITES`, 3 phases fixes, aucun saut conditionnel). L'écran 2 et l'écran
 * 3 partagent les mêmes champs d'état quelle que soit la famille (voir `sessionRelationsDroites.ts`).
 * Les segments clos sont cliquables (`FicheReponseEcran`, même patron que `AppNormeDistance.tsx`). */
function calculerSegmentsProgression(etat: EtatSessionRelationsDroites): EtatPuceProgression[] {
  const sequence = SEQUENCES_RELATIONS_DROITES[etat.exerciceCourant.famille];
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((_phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = index === 0 ? etat.extractionRevele : etat.constructionRevele;
    if (revele) return "revele";
    const niveauAide = index === 0 ? etat.niveauAideExtraction : etat.niveauAideConstruction;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

const TITRES_ECRANS: Record<PhaseRelationsDroites, string> = {
  extraction: "Vecteur directeur de la droite donnée",
  construction: "Vecteur directeur de d′",
  equation: "Équation de d′",
  extraction2: "Vecteur directeur de d₂",
  relation: "Relation entre d₁ et d₂",
};

/** Nombre saisi une fois lu : fraction à petit dénominateur (≤ 12), sinon décimal à virgule. */
function formatSaisieLatex(valeur: number): string {
  const q = Array.from({ length: 12 }, (_, i) => i + 1).find((d) => Math.abs(valeur * d - Math.round(valeur * d)) < 1e-9);
  if (q === undefined) return String(valeur).replace(".", "{,}");
  const n = Math.round(valeur * q);
  if (q === 1) return String(n);
  return `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${q}}`;
}

function formatVecteurSaisiLatex(nom: string, v: ReponseVecteur): string {
  return `\\vec{${nom}}\\begin{pmatrix} ${formatSaisieLatex(v.x)} \\\\ ${formatSaisieLatex(v.y)} \\end{pmatrix}`;
}

function formatEquationSaisie(reponse: ReponseEquation): ReactNode {
  if (typeof reponse === "string") return reponse.trim() === "" ? "—" : reponse;
  return <Katex expression={formatRepresentationParametriqueLatex(reponse.x0, reponse.a, reponse.y0, reponse.b)} />;
}

/** Réponse attendue de l'écran `phase` — VALEUR seule : `ValidationEcran` et `FicheReponseEcran`
 * affichent déjà eux-mêmes le libellé « Réponse attendue » (jamais « Équation attendue : » en
 * double, audit chapitre 7, point 5). Écran "equation" : l'équation elle-même, jamais le gabarit de
 * l'aide (gen45 point 19). */
function construireReponseAttendue(exercice: ExerciceRelationsDroites, phase: PhaseRelationsDroites): ReactNode {
  switch (phase) {
    case "extraction":
      return <Katex expression={`${formatEtatActuelVecteurReferenceLatex(exercice)} \\; \\text{(ou tout multiple non nul)}`} />;
    case "construction":
      return <Katex expression={formatConstructionAttendueLatex(exercice)} />;
    case "equation":
      return <Katex expression={formatEquationAttendueLatex(exercice)} />;
    case "extraction2":
      return <Katex expression={`${formatEtatActuelVecteur2Latex(exercice)} \\; \\text{(ou tout multiple non nul)}`} />;
    case "relation":
      return <Katex expression={formatRelationAttendueLatex(exercice)} />;
  }
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionRelationsDroites;
  revele: boolean;
}

export function AppRelationsDroites() {
  const [etat, setEtat] = useState<EtatSessionRelationsDroites>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans clos (puces cliquables) — un écran clos = une entrée,
   * dans l'ordre de la séquence (même index que sa puce). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice : entre dans la `key` des écrans pour qu'aucune saisie de
   * l'exercice précédent ne survive à « Générer » ou à « Nouvel exercice ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionRelationsDroites, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "extraction"
          ? nouvelEtat.extractionRevele
          : etat.phase === "construction" || etat.phase === "extraction2"
            ? nouvelEtat.constructionRevele
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

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    reinitialiserHistorique();
    setEtat(demarrerSessionRelationsDroites(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteRelationsDroites)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const recapitulatif = calculerRecapitulatifRelationsDroites(etat);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: construireReponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const cle = `${numeroExercice}-${phase}`;
  const commun = {
    exercice,
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  function rendreEcran() {
    switch (phase) {
      case "extraction":
        return (
          <EtapeExtractionRelationsDroites
            {...commun}
            key={cle}
            niveauAide={etat.niveauAideExtraction}
            onValider={(reponse) => terminerEtape(soumettreReponseExtraction(etat, reponse), <Katex expression={formatVecteurSaisiLatex("u", reponse)} />)}
          />
        );
      case "extraction2":
        return (
          <EtapeExtractionRelationsDroites
            {...commun}
            key={cle}
            seconde
            niveauAide={etat.niveauAideConstruction}
            onValider={(reponse) => terminerEtape(soumettreReponseExtraction2(etat, reponse), <Katex expression={formatVecteurSaisiLatex("v", reponse)} />)}
          />
        );
      case "construction":
        return (
          <EtapeConstructionRelationsDroites
            {...commun}
            key={cle}
            niveauAide={etat.niveauAideConstruction}
            onValider={(reponse) => terminerEtape(soumettreReponseConstruction(etat, reponse), <Katex expression={formatVecteurSaisiLatex("v", reponse)} />)}
          />
        );
      case "equation":
        return (
          <EtapeEquationRelationsDroites
            {...commun}
            key={cle}
            niveauAide={etat.niveauAideEquation}
            onValider={(reponse) => terminerEtape(soumettreReponseEquation(etat, reponse), formatEquationSaisie(reponse))}
          />
        );
      case "relation":
        return (
          <EtapeRelationRelationsDroites
            key={cle}
            exercice={exercice}
            niveauAide={etat.niveauAideEquation}
            onActiverAide={commun.onActiverAide}
            onValider={(reponse: RelationReconnue) => terminerEtape(soumettreReponseRelation(etat, reponse), LIBELLE_RELATION[reponse])}
            validation={validation}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Relations entre droites</h1>
        <p className="app-subtitle">Chapitre 7 — Géométrie analytique plane</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <RecapitulatifPanel entrees={recapitulatif} />
          {rendreEcran()}
        </div>
      </main>
      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
