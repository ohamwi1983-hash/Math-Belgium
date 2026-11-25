import { useState } from "react";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeDispersion } from "./generateurs/dispersion/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionDispersion,
  ordrePhasesDispersion,
  soumettreReponseCentresMoyenne,
  soumettreReponseTableau,
  soumettreReponseVarianceEcartType,
} from "./moteur/sessionDispersion";
import type { EtatSessionDispersion, PhaseDispersion } from "./moteur/typesDispersion";
import type { FamilleDispersion } from "./core/dispersion.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDispersion } from "./generateurs/dispersion";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapeCentresMoyenneDispersion } from "./components/EtapeCentresMoyenneDispersion";
import { EtapeTableauDispersion } from "./components/EtapeTableauDispersion";
import { EtapeVarianceEcartTypeDispersion } from "./components/EtapeVarianceEcartTypeDispersion";
import { SegmentsInline } from "./components/SegmentsInline";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import {
  formatCentresMoyenneAttendusTexte,
  formatEcartTypeAttendueTexte,
  formatEnonceSegments,
  formatTableauAttenduTexte,
  formatVarianceAttendueTexte,
} from "./ui/formatDispersion";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifDispersion } from "./ui/recapitulatifDispersion";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ReponseCentresMoyenneDispersion, ReponseTableauDispersion, ReponseVarianceEcartType } from "./moteur/verificationDispersion";

/** Titre de la fiche de consultation d'un écran clos (puces cliquables). */
const TITRE_PHASE: Record<PhaseDispersion, string> = {
  centresMoyenne: "Centres et moyenne",
  tableau: "Tableau et sommes",
  varianceEcartType: "Variance et écart-type",
};

function texteSaisi(valeur: string): string {
  return valeur.trim() === "" ? "—" : valeur.trim();
}

function saisieCentresMoyenne(r: ReponseCentresMoyenneDispersion): string {
  return `centres : ${r.centres.map(texteSaisi).join(" ; ")} — x̄ = ${texteSaisi(r.moyenne)}`;
}

function saisieTableau(r: ReponseTableauDispersion): string {
  return `produits : ${r.produits.map(texteSaisi).join(" ; ")} — Σnᵢ = ${texteSaisi(r.sommeN)}, Σ(xᵢ − x̄)²·nᵢ = ${texteSaisi(r.sommeProduits)}`;
}

function saisieVarianceEcartType(r: ReponseVarianceEcartType): string {
  return `V = ${texteSaisi(r.variance)}, σ = ${texteSaisi(r.ecartType)}`;
}

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionDispersion {
  return demarrerSessionDispersion(REGLAGES_DEMO, genererExerciceDispersion);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille), son PREMIER exercice est cette instance — tirée avec les MÊMES fonctions et le MÊME
 * catalogue que l'adaptateur d'export (`generateurs/dispersion/exportEvaluation.ts`) ; la suite reste un tirage normal. */
function sessionInitiale(): EtatSessionDispersion {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionDispersion(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDispersion, (id) => construireAvecVarianteId(id as FamilleDispersion)),
  );
}

/** Statut d'une puce d'écran déjà franchi. */
function statutPhaseClose(etat: EtatSessionDispersion, phase: PhaseDispersion): EtatPuceProgression {
  if (phase === "centresMoyenne") {
    if (etat.centresMoyenneRevele) return "revele";
    return etat.niveauAideCentresMoyenne > 0 ? "aide" : "correcte";
  }
  if (etat.tableauRevele) return "revele";
  return etat.niveauAideTableau > 0 ? "aide" : "correcte";
}

function calculerSegmentsProgression(etat: EtatSessionDispersion): EtatPuceProgression[] {
  const ordre = ordrePhasesDispersion(etat.exerciceCourant);
  const indexCourant = ordre.indexOf(etat.phase);
  return ordre.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    return statutPhaseClose(etat, phase);
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`. */
interface TransitionEnAttente {
  etatSuivant: EtatSessionDispersion;
  revele: boolean;
}

export function AppDispersion() {
  const [etat, setEtat] = useState<EtatSessionDispersion>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Clé de génération : les champs repartent vides à chaque nouvel exercice (y compris « Générer »). */
  const [numeroExercice, setNumeroExercice] = useState(0);
  /** Consultation en lecture seule des écrans clos (puces cliquables), remise à vide à chaque exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function revelePhase(phase: PhaseDispersion, nouvelEtat: EtatSessionDispersion): boolean {
    if (phase === "centresMoyenne") return nouvelEtat.centresMoyenneRevele;
    if (phase === "tableau") return nouvelEtat.tableauRevele;
    return nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.varianceEcartTypeRevele;
  }

  function terminerEtape(nouvelEtat: EtatSessionDispersion, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = revelePhase(etat.phase, nouvelEtat);
      setHistorique((h) => [
        ...h,
        { corrigeDetaille: corrigeDetailleEcranCourant(), titre: TITRE_PHASE[etat.phase], votreReponse, correcte: !revele, reponseAttendue: revele ? reponseAttenduePhase(etat.phase) : undefined },
      ]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function reinitialiserAffichage() {
    setHistorique([]);
    setFicheOuverteIndex(null);
    setEnAttente(null);
    setNumeroExercice((n) => n + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setEtat(nouvelleSession());
      reinitialiserAffichage();
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  function onGenererDev(varianteId: string) {
    setEtat(demarrerSessionDispersion(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as FamilleDispersion)));
    reinitialiserAffichage();
  }

  const exercice = etat.exerciceCourant;
  const recapitulatif = calculerRecapitulatifDispersion(etat);

  function reponseAttenduePhase(phase: PhaseDispersion): ReactNode {
    if (phase === "centresMoyenne") return <SegmentsInline segments={formatCentresMoyenneAttendusTexte(exercice)} />;
    return phase === "tableau" ? (
      <SegmentsInline segments={formatTableauAttenduTexte(exercice)} />
    ) : (
      <>
        Variance attendue : {formatVarianceAttendueTexte(exercice)}, écart-type attendu : {formatEcartTypeAttendueTexte(exercice)}
      </>
    );
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeDispersion(exercice), lettreEtape(ordrePhasesDispersion(exercice).indexOf(etat.phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(etat.phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  const cle = `${numeroExercice}-${etat.phase}`;
  const communs = {
    exercice,
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: etat.reglages.tentativesMax,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Paramètres de dispersion</h1>
        <p className="app-subtitle">Chapitre 4</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={<SegmentsInline segments={formatEnonceSegments(exercice)} />} blocDonnees={null} />
          <RecapitulatifPanel entrees={recapitulatif} />
          {etat.phase !== "tableau" && <CalculatriceScientifique />}
          {etat.phase === "centresMoyenne" ? (
            <EtapeCentresMoyenneDispersion
              key={cle}
              {...communs}
              niveauAide={etat.niveauAideCentresMoyenne}
              onValider={(reponse) => terminerEtape(soumettreReponseCentresMoyenne(etat, reponse), saisieCentresMoyenne(reponse))}
            />
          ) : etat.phase === "tableau" ? (
            <EtapeTableauDispersion
              key={cle}
              {...communs}
              niveauAide={etat.niveauAideTableau}
              saisieIllisibleNonComptee
              onValider={(reponse) => terminerEtape(soumettreReponseTableau(etat, reponse), saisieTableau(reponse))}
            />
          ) : (
            <EtapeVarianceEcartTypeDispersion
              key={cle}
              {...communs}
              niveauAide={etat.niveauAideVarianceEcartType}
              saisieIllisibleNonComptee
              onValider={(reponse) => terminerEtape(soumettreReponseVarianceEcartType(etat, reponse), saisieVarianceEcartType(reponse))}
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
