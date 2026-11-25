import { useState, type ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import { activerAide, demarrerSessionAnglesAssocies, soumettreReponse } from "./moteur/sessionAnglesAssocies";
import type { EtatSessionAnglesAssocies } from "./moteur/typesAnglesAssocies";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAnglesAssocies } from "./generateurs/anglesAssocies";
import type { IdVarianteAnglesAssocies } from "./core/anglesAssocies.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeAnglesAssocies } from "./components/EtapeAnglesAssocies";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { BlocEnonceAnglesAssocies } from "./components/BlocEnonceAnglesAssocies";
import { Katex } from "./components/Katex";
import { decimal3Latex } from "./ui/formatAnglesAssocies";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { lignesDeLEtape } from "../export/corrigeTableau";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { correctionDetailleeAnglesAssocies } from "./generateurs/anglesAssocies/corrigeDetaille";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, nombreDecimalSaisi, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";

const CONSIGNE_GENERALE = "Détermine la valeur demandée à l'aide des angles associés.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionAnglesAssocies {
  return demarrerSessionAnglesAssocies(REGLAGES_DEMO, genererExerciceAnglesAssocies);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille ou de l'évaluation), son PREMIER exercice est celui de la copie — même catalogue et mêmes
 * fonctions de génération que l'adaptateur d'export. */
function sessionInitiale(): EtatSessionAnglesAssocies {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionAnglesAssocies(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceAnglesAssocies, (id) => construireAvecVarianteId(id as IdVarianteAnglesAssocies)));
}

/** État tenu en attente dès que l'écran unique se termine (bonne réponse, ou tentatives épuisées) —
 * l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionAnglesAssocies;
  revele: boolean;
}

/** Refonte écran unique (`promptgen17refontecomplete.md`) — plus de routage par phase, un seul
 * composant d'écran (`EtapeAnglesAssocies`) par exercice. */
export function AppAnglesAssocies() {
  const [etat, setEtat] = useState<EtatSessionAnglesAssocies>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») — sert de `key` à
   * l'écran pour qu'il reparte d'un champ vide (audit du chapitre 5 : la saisie précédente restait
   * affichée sous le nouvel énoncé). */
  const [numeroExercice, setNumeroExercice] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionAnglesAssocies, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.resultats.length !== etat.resultats.length;
    if (transitionDEcran) {
      const revele = nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.revele;
      setHistorique((h) => [...h, ecranClos("Valeur demandée", votreReponse, revele, etat.niveauAide > 0, reponseAttendueEcran(), corrigeDetailleEcranCourant())]);
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
    setNumeroExercice((n) => n + 1);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    viderHistorique();
    setEtat(demarrerSessionAnglesAssocies(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteAnglesAssocies)));
    setNumeroExercice((n) => n + 1);
  }

  const exercice = etat.exerciceCourant;

  function reponseAttendueEcran() {
    return etat.reglages.affichageReponseApresEchec ? <Katex expression={decimal3Latex(exercice.valeurCible)} /> : undefined;
  }

  /** Corrigé détaillé « comme au tableau » de l'écran (mêmes lignes que le papier) — UNE seule source
   * pour la validation (après la réponse) et pour l'entrée d'historique (fiche de la puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeAnglesAssocies(exercice), "a")} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendueEcran(),
        corrigeDetaille: corrigeDetailleEcranCourant(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Angles associés</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, 1, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={<BlocEnonceAnglesAssocies exercice={exercice} />} />
          <EtapeAnglesAssocies
            key={numeroExercice}
            exercice={exercice}
            tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
            tentativesMax={etat.reglages.tentativesMax}
            niveauAide={etat.niveauAide}
            onActiverAide={() => setEtat(activerAide(etat))}
            onValider={(valeur) => terminerEtape(soumettreReponse(etat, valeur), nombreDecimalSaisi(valeur))}
            validation={validation}
          />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
