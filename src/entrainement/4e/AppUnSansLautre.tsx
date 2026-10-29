import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAide,
  demarrerSessionUnSansLautre,
  soumettreReponseCarre,
  soumettreReponseTangente,
  soumettreReponseValeurSignee,
} from "./moteur/sessionUnSansLautre";
import type { EtatSessionUnSansLautre, PhaseUnSansLautre } from "./moteur/typesUnSansLautre";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceUnSansLautre } from "./generateurs/unSansLautre";
import type { FonctionConnue } from "./core/unSansLautre.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeCarreUnSansLautre } from "./components/EtapeCarreUnSansLautre";
import { EtapeValeurSigneeUnSansLautre } from "./components/EtapeValeurSigneeUnSansLautre";
import { EtapeTangenteUnSansLautre } from "./components/EtapeTangenteUnSansLautre";
import { EnTeteExercice } from "./components/EnTeteExercice";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const CONSIGNE_GENERALE = "Retrouve sin, cos ou tan à partir de l'autre.";
import { Katex } from "./components/Katex";
import {
  formatCarreCibleLatex,
  formatIntervalleLatex,
  formatValeurCibleSimplifieeLatex,
  formatValeurConnueLatex,
  formatValeurTangenteSimplifieeLatex,
} from "./ui/formatUnSansLautre";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionUnSansLautre {
  return demarrerSessionUnSansLautre(REGLAGES_DEMO, genererExerciceUnSansLautre);
}

/** Ordre d'affichage des puces de progression — même ordre que la vraie séquence (3 phases fixes,
 * aucun saut conditionnel, voir `typesUnSansLautre.ts`). "tangente" (dernière phase) n'a jamais
 * besoin de sa propre branche "close" — même principe que gen9/gen55. Aide simple (booléen, pas de
 * niveau progressif) : "aide" si révélation évitée mais aide utilisée. Puces purement visuelles. */
const ORDRE_PHASES: PhaseUnSansLautre[] = ["carre", "valeurSignee", "tangente"];

function calculerSegmentsProgression(etat: EtatSessionUnSansLautre): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele = phase === "carre" ? etat.carreRevele : etat.valeurSigneeRevele;
    if (revele) return "revele";
    const aideUtilisee = phase === "carre" ? etat.aideCarreUtilisee : etat.aideValeurSigneeUtilisee;
    return aideUtilisee ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
/** Titre de la fiche de consultation de l'écran courant — la grandeur demandée par cet écran. */
function titreEcran(etat: EtatSessionUnSansLautre): string {
  const cible = etat.exerciceCourant.fonctionCible;
  return etat.phase === "carre" ? `Valeur de ${cible}²(θ)` : etat.phase === "valeurSignee" ? `Valeur de ${cible}(θ)` : "Valeur de tan(θ)";
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionUnSansLautre;
  revele: boolean;
}

export function AppUnSansLautre() {
  const [etat, setEtat] = useState<EtatSessionUnSansLautre>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, jamais dans le moteur ; remis à vide à chaque nouvel exercice (patron gen14). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») : inclus dans la `key`
   * des écrans, pour qu'un écran de même phase soit remonté à neuf — sans ça, la saisie de
   * l'exercice précédent restait dans le champ (même patron que gen31/gen32). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  /** `votreReponse` : poussée dans l'historique seulement quand l'écran se clôt réellement, avec la
   * réponse attendue de CET écran (`reponseAttendue`, calculée ci-dessous pour `etat.phase`). */
  function terminerEtape(nouvelEtat: EtatSessionUnSansLautre, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "carre"
          ? nouvelEtat.carreRevele
          : etat.phase === "valeurSignee"
            ? nouvelEtat.valeurSigneeRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.tangenteRevele;
      if (votreReponse !== undefined) {
        setHistorique((h) => [...h, { titre: titreEcran(etat), votreReponse, correcte: !revele, reponseAttendue: revele ? reponseAttendue : undefined }]);
      }
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
    setEtat(demarrerSessionUnSansLautre(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as FonctionConnue)));
  }

  const exercice = etat.exerciceCourant;

  const reponseAttendue =
    etat.phase === "carre" ? (
      <Katex expression={`\\displaystyle ${formatCarreCibleLatex(exercice)}`} />
    ) : etat.phase === "valeurSignee" ? (
      <Katex expression={`\\displaystyle ${formatValeurCibleSimplifieeLatex(exercice)}`} />
    ) : (
      <Katex expression={`\\displaystyle ${formatValeurTangenteSimplifieeLatex(exercice)}`} />
    );

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Retrouver sin ou cos à partir de l'autre</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={formatValeurConnueLatex(exercice)} block />
                <Katex expression={formatIntervalleLatex(exercice)} block />
              </div>
            }
          />
          {etat.phase === "carre" ? (
            <EtapeCarreUnSansLautre
              key={`${numeroExercice}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideCarreUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseCarre(etat, texte), texte)}
              validation={validation}
            />
          ) : etat.phase === "valeurSignee" ? (
            <EtapeValeurSigneeUnSansLautre
              key={`${numeroExercice}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideValeurSigneeUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseValeurSignee(etat, texte), texte)}
              validation={validation}
            />
          ) : (
            <EtapeTangenteUnSansLautre
              key={`${numeroExercice}-${etat.phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              aideActivee={etat.aideTangenteUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(texte) => terminerEtape(soumettreReponseTangente(etat, texte), texte)}
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
