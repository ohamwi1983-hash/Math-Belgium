import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAide,
  demarrerSessionCercleTrigonometrique,
  soumettreReponseAnglePremierQuadrant,
  soumettreReponseQuadrant,
  soumettreReponseReduction,
  soumettreReponseSignes,
  soumettreReponseValeursAxe,
} from "./moteur/sessionCercleTrigonometrique";
import type { EtatSessionCercleTrigonometrique, PhaseCercleTrigonometrique } from "./moteur/typesCercleTrigonometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceCercleTrigonometrique } from "./generateurs/cercleTrigonometrique";
import type { VarianteCercleTrigId } from "./core/cercleTrigonometrique.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeReductionCercleTrig } from "./components/EtapeReductionCercleTrig";
import { EtapeQuadrantCercleTrig } from "./components/EtapeQuadrantCercleTrig";
import { EtapeAnglePremierQuadrantCercleTrig } from "./components/EtapeAnglePremierQuadrantCercleTrig";
import { EtapeSignesCercleTrig } from "./components/EtapeSignesCercleTrig";
import { EtapeValeursAxeCercleTrig } from "./components/EtapeValeursAxeCercleTrig";
import { formatEnonceCercleTrigLatex, libelleQuadrant } from "./ui/formatCercleTrigonometrique";
import { Katex } from "./components/Katex";
import { calculerRecapitulatifCercleTrigonometrique } from "./ui/recapitulatifCercleTrigonometrique";
import { estSurAxe, necessiteReduction, valeursAxeAttendues } from "./moteur/verificationCercleTrigonometrique";
import { libelleValeurAxe } from "./ui/cycleSigneCercleTrigonometrique";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { EnTeteExercice } from "./components/EnTeteExercice";

const CONSIGNE_GENERALE = "Place et lis des valeurs sur le cercle trigonométrique.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCercleTrigonometrique {
  return demarrerSessionCercleTrigonometrique(REGLAGES_DEMO, genererExerciceCercleTrigonometrique);
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCercleTrigonometrique;
  revele: boolean;
}

/** Phases toujours présentes, dans l'ordre réel — "reduction" s'intercale en tête, seulement si
 * nécessaire (voir `calculerSegmentsProgression` ci-dessous et le commentaire de tête de
 * sessionCercleTrigonometrique.ts). Un angle sur un axe (décision E1) saute « angle du premier
 * quadrant » et « signes » au profit de « valeursAxe ». */
const PHASES_FIXES: PhaseCercleTrigonometrique[] = ["quadrant", "anglePremierQuadrant", "signes"];
const PHASES_FIXES_AXE: PhaseCercleTrigonometrique[] = ["quadrant", "valeursAxe"];

/**
 * Segments de la barre de puces — "reduction" n'est incluse que si elle a réellement lieu : soit
 * déjà close (`scoreReductionExercice !== null`), soit encore à venir sur un angle hors [0°,360°[
 * (`necessiteReduction`) — valable après coup aussi, car l'angle de `exerciceCourant` ne change
 * jamais une fois l'exercice généré (contrairement aux coefficients réduits ailleurs sur ce
 * chantier). Les trois `xxxRevele` lus ci-dessous sont de vrais booléens trackés par le moteur
 * (pas l'heuristique score===0 des autres générateurs) — mêmes champs que
 * `calculerRecapitulatifCercleTrigonometrique` (ui/recapitulatifCercleTrigonometrique.ts). "signes"
 * (dernière phase) n'a pas de branche "close" propre : une fois notée, un nouvel exercice démarre.
 */
/** Signe affiché à l'élève — vrai signe moins typographique « − » (jamais le tiret « - » du modèle
 * interne). */
function libelleSigne(signe: "+" | "-" | "0"): string {
  return signe === "-" ? "−" : signe;
}

function calculerSegmentsProgression(etat: EtatSessionCercleTrigonometrique): EtatPuceProgression[] {
  const reductionApplicable = etat.scoreReductionExercice !== null || necessiteReduction(etat.exerciceCourant);
  const fixes = estSurAxe(etat.exerciceCourant) ? PHASES_FIXES_AXE : PHASES_FIXES;
  const phases: PhaseCercleTrigonometrique[] = reductionApplicable ? ["reduction", ...fixes] : fixes;
  const indexCourant = phases.indexOf(etat.phase);

  return phases.map((phase, k) => {
    if (k > indexCourant) return "a-venir";
    if (k === indexCourant) return "courante";
    switch (phase) {
      case "reduction":
        return etat.reductionRevele ? "revele" : etat.aideReductionUtilisee ? "aide" : "correcte";
      case "quadrant":
        // Pas de bouton Aide sur cet écran (`activerAide` le refuse) : jamais "aide".
        return etat.quadrantRevele ? "revele" : "correcte";
      default:
        return etat.anglePremierQuadrantRevele ? "revele" : etat.aideAnglePremierQuadrantUtilisee ? "aide" : "correcte";
    }
  });
}

export function AppCercleTrigonometrique() {
  const [etat, setEtat] = useState<EtatSessionCercleTrigonometrique>(nouvelleSession);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionCercleTrigonometrique`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Incrémenté à chaque nouvel exercice (« Nouvel exercice » ou « Générer ») : inclus dans la `key`
   * des écrans, pour qu'un écran de même phase soit remonté à neuf — sans ça, la saisie de
   * l'exercice précédent restait dans le champ (même patron que gen31/gen32/gen35). */
  const [numeroExercice, setNumeroExercice] = useState(0);

  /** Appelé juste avant `terminerEtape`, avec l'état DÉJÀ mis à jour par `soumettreReponseXxx` —
   * réutilise `calculerRecapitulatifCercleTrigonometrique` pour la réponse ATTENDUE (l'entrée qui
   * vient d'être ajoutée est toujours la dernière du tableau). Jamais appelée pour "signes"
   * (dernière phase, clôture toujours immédiatement l'exercice — aucune entrée de récapitulatif, et
   * sa puce de progression n'est jamais "correcte"/"revele" dans `calculerSegmentsProgression`, donc
   * jamais cliquable — même convention que `AppAnalyseFonction.tsx`/"tableauSignes"). */
  function ajouterHistorique(votreReponse: ReactNode, nouvelEtat: EtatSessionCercleTrigonometrique) {
    const recap = calculerRecapitulatifCercleTrigonometrique(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? derniere.valeur : undefined,
      },
    ]);
  }

  /** `votreReponse` : UNIQUEMENT formatée/poussée dans l'historique quand l'étape se clôt
   * réellement (`transitionDEcran`) — jamais à chaque clic sur "Valider" (même garde-fou que
   * `AppAnalyseFonction.tsx`, bug déjà rencontré et corrigé là-bas). */
  function terminerEtape(nouvelEtat: EtatSessionCercleTrigonometrique, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(votreReponse, nouvelEtat);
      }
      const revele =
        etat.phase === "reduction"
          ? nouvelEtat.reductionRevele
          : etat.phase === "quadrant"
            ? nouvelEtat.quadrantRevele
            : etat.phase === "anglePremierQuadrant"
              ? nouvelEtat.anglePremierQuadrantRevele
              : etat.phase === "valeursAxe"
                ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.valeursAxeRevele
                : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.signesRevele;
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

  const recapitulatif = calculerRecapitulatifCercleTrigonometrique(etat);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionCercleTrigonometrique(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteCercleTrigId)));
  }

  const exercice = etat.exerciceCourant;
  const attenduAxe = valeursAxeAttendues(exercice);

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "reduction" ? (
              <>{exercice.angleReduit}°</>
            ) : etat.phase === "quadrant" ? (
              <>{libelleQuadrant(exercice.quadrant)}</>
            ) : etat.phase === "anglePremierQuadrant" ? (
              <>{exercice.anglePremierQuadrant}°</>
            ) : etat.phase === "valeursAxe" ? (
              <>
                sin(θ) = {libelleValeurAxe(attenduAxe.sin)} ; cos(θ) = {libelleValeurAxe(attenduAxe.cos)} ; tan(θ){" "}
                {attenduAxe.tan === "indefini" ? "n'existe pas" : `= ${libelleValeurAxe(attenduAxe.tan)}`}
              </>
            ) : (
              <>
                sin(θ) : {libelleSigne(exercice.signeSin)} ; cos(θ) : {libelleSigne(exercice.signeCos)} ; tan(θ) :{" "}
                {exercice.signeTan === "indefini" ? "∄" : libelleSigne(exercice.signeTan)}
              </>
            ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Placement et lecture sur le cercle trigonométrique</h1>
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
                <Katex expression={formatEnonceCercleTrigLatex(exercice.angleDepart)} block />
              </div>
            }
          />
          {etat.phase === "reduction" ? (
            <EtapeReductionCercleTrig
              key={`${numeroExercice}-${etat.phase}`}
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideReductionUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(valeur) => terminerEtape(soumettreReponseReduction(etat, valeur), `${valeur}°`)}
              validation={validation}
            />
          ) : etat.phase === "quadrant" ? (
            <EtapeQuadrantCercleTrig
              key={`${numeroExercice}-${etat.phase}`}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              onValider={(quadrant) => terminerEtape(soumettreReponseQuadrant(etat, quadrant), libelleQuadrant(quadrant))}
              validation={validation}
            />
          ) : etat.phase === "anglePremierQuadrant" ? (
            <EtapeAnglePremierQuadrantCercleTrig
              key={`${numeroExercice}-${etat.phase}`}
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideAnglePremierQuadrantUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(valeur) => terminerEtape(soumettreReponseAnglePremierQuadrant(etat, valeur), `${valeur}°`)}
              validation={validation}
            />
          ) : etat.phase === "valeursAxe" ? (
            <EtapeValeursAxeCercleTrig
              key={`${numeroExercice}-${etat.phase}`}
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideValeursAxeUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseValeursAxe(etat, reponse))}
              validation={validation}
            />
          ) : (
            <EtapeSignesCercleTrig
              key={`${numeroExercice}-${etat.phase}`}
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              recapitulatif={recapitulatif}
              aideActivee={etat.aideSignesUtilisee}
              onActiverAide={() => setEtat(activerAide(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseSignes(etat, reponse))}
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
