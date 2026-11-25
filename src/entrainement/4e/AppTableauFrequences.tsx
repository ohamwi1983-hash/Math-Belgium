import { useState, type ReactNode } from "react";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeTableauFrequences } from "./generateurs/tableauFrequences/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionTableauFrequences,
  soumettreReponseCumules,
  soumettreReponseFrequences,
  soumettreReponseFrequencesCumulees,
  soumettreReponseIdentification,
} from "./moteur/sessionTableauFrequences";
import type { EtatSessionTableauFrequences, PhaseTableauFrequences } from "./moteur/typesTableauFrequences";
import { genererExerciceTableauFrequences } from "./generateurs/tableauFrequences";
import { EtapeIdentificationTableauFrequences } from "./components/EtapeIdentificationTableauFrequences";
import { EtapeFrequencesTableauFrequences } from "./components/EtapeFrequencesTableauFrequences";
import { EtapeCumulesTableauFrequences } from "./components/EtapeCumulesTableauFrequences";
import { EtapeFrequencesCumuleesTableauFrequences } from "./components/EtapeFrequencesCumuleesTableauFrequences";
import {
  formatEnonceTexte,
  formatTableCumulesTexte,
  formatTableFrequencesCumuleesTexte,
  formatTableFrequencesTexte,
  formatTableIdentificationTexte,
} from "./ui/formatTableauFrequences";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, saisieTexte, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { virgulesTexte } from "./ui/nombreFr";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTableauFrequences {
  return demarrerSessionTableauFrequences(REGLAGES_DEMO, genererExerciceTableauFrequences);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille), son PREMIER exercice est cette instance — tirée avec les MÊMES fonctions que l'adaptateur
 * d'export (sans catalogue de variantes) ; la suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionTableauFrequences {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionTableauFrequences(REGLAGES_DEMO, () => genererAvecCode(code, undefined, genererExerciceTableauFrequences, undefined));
}

/** Ordre des écrans — même ordre que la vraie séquence (4 phases fixes, aucun saut conditionnel,
 * voir `typesTableauFrequences.ts`). Puces construites depuis l'historique des écrans clos
 * (`segmentsDepuisHistorique`), cliquables (fiche en lecture seule, dernier écran compris). */
const ORDRE_PHASES: PhaseTableauFrequences[] = ["identification", "frequences", "cumules", "frequencesCumulees"];

const TITRES_PHASES: Record<PhaseTableauFrequences, string> = {
  identification: "Valeurs et effectifs",
  frequences: "Fréquences",
  cumules: "Effectifs cumulés",
  frequencesCumulees: "Fréquences cumulées",
};

/** Saisie ligne par ligne, même présentation que la réponse attendue (« valeur → … »). */
function valeursParLigne(exercice: EtatSessionTableauFrequences["exerciceCourant"], valeurs: string[], unite = ""): string {
  return exercice.lignes.map((l, i) => `${virgulesTexte(String(l.valeur))} → ${saisieTexte(valeurs[i] ?? "")}${unite}`).join(", ");
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionTableauFrequences;
  revele: boolean;
}

export function AppTableauFrequences() {
  const [etat, setEtat] = useState<EtatSessionTableauFrequences>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionTableauFrequences, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "identification"
          ? nouvelEtat.identificationRevele
          : etat.phase === "frequences"
            ? nouvelEtat.frequencesRevele
            : etat.phase === "cumules"
              ? nouvelEtat.cumulesRevele
              : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.frequencesCumuleesRevele;
      const niveauAide =
        etat.phase === "identification"
          ? etat.niveauAideIdentification
          : etat.phase === "frequences"
            ? etat.niveauAideFrequences
            : etat.phase === "cumules"
              ? etat.niveauAideCumules
              : etat.niveauAideFrequencesCumulees;
      setHistorique((h) => [...h, ecranClos(TITRES_PHASES[etat.phase], votreReponse, revele, niveauAide > 0, reponseAttendue, corrigeDetailleEcranCourant())]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) viderHistorique();
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;

  const reponseAttendue =
    etat.phase === "identification" ? (
      <>Valeurs/effectifs attendus : {formatTableIdentificationTexte(exercice)}</>
    ) : etat.phase === "frequences" ? (
      <>Fréquences attendues : {formatTableFrequencesTexte(exercice)}</>
    ) : etat.phase === "cumules" ? (
      <>Effectifs cumulés attendus : {formatTableCumulesTexte(exercice)}</>
    ) : (
      <>Fréquences cumulées attendues : {formatTableFrequencesCumuleesTexte(exercice)}</>
    );

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeTableauFrequences(exercice), lettreEtape(ORDRE_PHASES.indexOf(etat.phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Tableau de fréquences</h1>
        <p className="app-subtitle">Chapitre 4</p>
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, ORDRE_PHASES.length, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={null} />
          {etat.phase === "identification" ? (
            <EtapeIdentificationTableauFrequences
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideIdentification}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseIdentification(etat, reponse), reponse.map((l) => `${saisieTexte(l.valeur)} → ${saisieTexte(l.effectif)}`).join(", "))}
              validation={validation}
            />
          ) : etat.phase === "frequences" ? (
            <EtapeFrequencesTableauFrequences
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideFrequences}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFrequences(etat, reponse), valeursParLigne(exercice, reponse, " %"))}
              validation={validation}
            />
          ) : etat.phase === "cumules" ? (
            <EtapeCumulesTableauFrequences
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCumules}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseCumules(etat, reponse), valeursParLigne(exercice, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeFrequencesCumuleesTableauFrequences
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideFrequencesCumulees}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFrequencesCumulees(etat, reponse), valeursParLigne(exercice, reponse, " %"))}
              validation={validation}
            />
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
