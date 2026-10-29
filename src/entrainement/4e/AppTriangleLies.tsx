import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionTriangleLies,
  sequencePourVariante,
  soumettreReponseAngles,
  soumettreReponseCible,
  soumettreReponseInterpretation,
  soumettreReponsePont,
  soumettreReponsePontSommetPartage,
  soumettreReponseSoustraction,
} from "./moteur/sessionTriangleLies";
import type { EtatSessionTriangleLies, PhaseTriangleLies } from "./moteur/typesTriangleLies";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceTriangleLies } from "./generateurs/triangleLies";
import type { FamilleTriangleLies } from "./core/triangleLies.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { CalculatriceScientifique } from "./components/CalculatriceScientifique";
import { EtapePontTriangleLies } from "./components/EtapePontTriangleLies";
import { EtapeAnglesTriangleLies } from "./components/EtapeAnglesTriangleLies";
import { EtapeSoustractionTriangleLies } from "./components/EtapeSoustractionTriangleLies";
import { EtapeCibleTriangleLies } from "./components/EtapeCibleTriangleLies";
import { EtapeInterpretationTriangleLies } from "./components/EtapeInterpretationTriangleLies";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ReponseAnglesTriangleLies, ReponsePontSommetPartage, ReponseSoustractionTriangleLies } from "./moteur/verificationTriangleLies";
import { calculerRecapitulatifTriangleLies, entreeRecapPourPhase } from "./ui/recapitulatifTriangleLies";
import { formatValeurUnite, libellesSommetPartage, uniteLongueurPont } from "./ui/formatTriangleLies";
import type { ExerciceTriangleLies } from "./core/triangleLies.types";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionTriangleLies {
  return demarrerSessionTriangleLies(REGLAGES_DEMO, genererExerciceTriangleLies);
}

/** Écrans nécessitant un calcul décimal non fourni par l'énoncé (résolution du triangle pont/cible
 * par loi des sinus/cosinus ou SOH-CAH-TOA) — "angles"/"soustraction" restent de l'arithmétique
 * triviale sur des données déjà affichées, "interpretation" un QCM. */
const PHASES_CALCULATRICE = new Set<PhaseTriangleLies>(["pont", "cible"]);

/** Segments de la barre de puces — réutilise `sequencePourVariante` (même séquence réelle que
 * `terminerEtape` ci-dessous, jamais une deuxième reconstitution). "interpretation" (toujours
 * dernière phase, voir `typesTriangleLies.ts`) n'a jamais besoin de sa propre branche "close" —
 * même principe que gen9/gen55. Puces purement visuelles. */
function calculerSegmentsProgression(etat: EtatSessionTriangleLies): EtatPuceProgression[] {
  const sequence = sequencePourVariante(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele =
      phase === "pont" ? etat.pontRevele : phase === "angles" ? etat.anglesRevele : phase === "soustraction" ? etat.soustractionRevele : etat.cibleRevele;
    if (revele) return "revele";
    const niveauAide =
      phase === "pont"
        ? etat.niveauAidePont
        : phase === "angles"
          ? etat.niveauAideAngles
          : phase === "soustraction"
            ? etat.niveauAideSoustraction
            : etat.niveauAideCible;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionTriangleLies;
  revele: boolean;
}

/** Saisie de l'élève telle que relue dans la fiche de consultation — mêmes noms et unités que
 * l'écran (jamais « côté 1 »), virgule décimale. */
function saisiePontSommetPartage(exercice: ExerciceTriangleLies, r: ReponsePontSommetPartage): string {
  const l = libellesSommetPartage(exercice);
  const unite = uniteLongueurPont(exercice);
  return `${l.angle} = ${formatValeurUnite(r.angle, "°")} ; ${l.cote1} = ${formatValeurUnite(r.cote1, unite)} ; ${l.cote2} = ${formatValeurUnite(r.cote2, unite)}`;
}

function saisieSoustraction(exercice: ExerciceTriangleLies, r: ReponseSoustractionTriangleLies): string {
  const l = libellesSommetPartage(exercice);
  const unite = uniteLongueurPont(exercice);
  return `${l.coteCible1} = ${formatValeurUnite(r.cote1, unite)} ; ${l.coteCible2} = ${formatValeurUnite(r.cote2, unite)}`;
}

function saisieAngles(r: ReponseAnglesTriangleLies): string {
  return `angle utile = ${formatValeurUnite(r.angleUtile, "°")} ; angle (hypothèse) = ${formatValeurUnite(r.angleHypothese, "°")}`;
}

export function AppTriangleLies() {
  const [etat, setEtat] = useState<EtatSessionTriangleLies>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables) — une entrée par écran
   * clos, dans l'ordre des écrans, remise à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice et inclus dans la `key` des écrans : sinon la saisie de
   * l'exercice précédent reste dans les champs après « Générer ». */
  const [numeroExercice, setNumeroExercice] = useState(0);

  /** Entrée de la fiche pour l'écran qui vient de se fermer — lue explicitement pour CETTE phase
   * (`entreeRecapPourPhase`), jamais « la dernière ligne du récap ». */
  function ajouterHistorique(phaseClose: PhaseTriangleLies, votreReponse: ReactNode, nouvelEtat: EtatSessionTriangleLies) {
    const entree = entreeRecapPourPhase(nouvelEtat, phaseClose);
    if (!entree) return;
    setHistorique((h) => [
      ...h,
      { titre: entree.libelle, votreReponse, correcte: !entree.revele, reponseAttendue: entree.revele ? entree.valeur : undefined },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionTriangleLies, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) ajouterHistorique(etat.phase, votreReponse, nouvelEtat);
      const revele =
        etat.phase === "pont"
          ? nouvelEtat.pontRevele
          : etat.phase === "angles"
            ? nouvelEtat.anglesRevele
            : etat.phase === "soustraction"
              ? nouvelEtat.soustractionRevele
              : etat.phase === "cible"
                ? nouvelEtat.cibleRevele
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
      setFicheOuverteIndex(null);
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function onGenererDev(familleId: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionTriangleLies(REGLAGES_DEMO, () => construireAvecFamilleId(familleId as FamilleTriangleLies)));
  }

  const exercice = etat.exerciceCourant;

  const optionCorrecte = exercice.optionsInterpretation.find((option) => option.correcte);
  const recapitulatif = calculerRecapitulatifTriangleLies(etat);
  const entreeCourante = entreeRecapPourPhase(enAttente?.etatSuivant ?? etat, etat.phase);

  /** Réponse attendue de l'écran qui vient de se fermer — même texte que le récap, sans répéter
   * « Réponse attendue » (déjà titré par `ValidationEcran`). */
  const reponseAttendue: ReactNode =
    etat.phase === "interpretation" ? optionCorrecte?.texte : entreeCourante?.valeur;

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
        <h1 className="app-title">Triangles liés (triangulation, côté ou angle partagé)</h1>
        <p className="app-subtitle">Chapitre 5</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          {PHASES_CALCULATRICE.has(etat.phase) && <CalculatriceScientifique />}
          {etat.phase === "pont" ? (
            <EtapePontTriangleLies
              key={`${numeroExercice}-pont`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAidePont}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur) => terminerEtape(soumettreReponsePont(etat, valeur), `${exercice.labelCoteTransfere} = ${formatValeurUnite(valeur, uniteLongueurPont(exercice))}`)}
              onValiderSommetPartage={(reponse) => terminerEtape(soumettreReponsePontSommetPartage(etat, reponse), saisiePontSommetPartage(exercice, reponse))}
              validation={validation}
            />
          ) : etat.phase === "angles" ? (
            <EtapeAnglesTriangleLies
              key={`${numeroExercice}-angles`}
              recapitulatif={recapitulatif}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideAngles}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseAngles(etat, reponse), saisieAngles(reponse))}
              validation={validation}
            />
          ) : etat.phase === "soustraction" ? (
            <EtapeSoustractionTriangleLies
              key={`${numeroExercice}-soustraction`}
              recapitulatif={recapitulatif}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSoustraction}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSoustraction(etat, reponse), saisieSoustraction(exercice, reponse))}
              validation={validation}
            />
          ) : etat.phase === "cible" ? (
            <EtapeCibleTriangleLies
              key={`${numeroExercice}-cible`}
              recapitulatif={recapitulatif}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCible}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(valeur) => terminerEtape(soumettreReponseCible(etat, valeur), formatValeurUnite(valeur, exercice.uniteGrandeurCible))}
              validation={validation}
            />
          ) : (
            <EtapeInterpretationTriangleLies
              key={`${numeroExercice}-interpretation`}
              recapitulatif={recapitulatif}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideInterpretation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(indexChoisi) => terminerEtape(soumettreReponseInterpretation(etat, indexChoisi))}
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
