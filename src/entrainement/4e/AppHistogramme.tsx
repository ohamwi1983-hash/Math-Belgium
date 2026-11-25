import { useState, type ReactNode } from "react";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleeHistogramme } from "./generateurs/histogramme/corrigeDetaille";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionHistogramme,
  soumettreReponseClassement,
  soumettreReponseFrequences,
  soumettreReponseTrace,
} from "./moteur/sessionHistogramme";
import type { EtatSessionHistogramme, PhaseHistogramme } from "./moteur/typesHistogramme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHistogramme } from "./generateurs/histogramme";
import type { VarianteHistogramme } from "./core/histogramme.types";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EtapeClassementHistogramme } from "./components/EtapeClassementHistogramme";
import { EtapeFrequencesHistogramme } from "./components/EtapeFrequencesHistogramme";
import { EtapeTraceHistogramme } from "./components/EtapeTraceHistogramme";
import { formatClasseTexte, formatClassementAttenduTexte, formatEnonceTexte, formatFrequencesAttenduesTexte, formatTraceAttendueTexte } from "./ui/formatHistogramme";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, nombreTexte, saisieTexte, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionHistogramme {
  return demarrerSessionHistogramme(REGLAGES_DEMO, genererExerciceHistogramme);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`, QR code de la
 * feuille), son PREMIER exercice est cette instance — tirée avec les MÊMES fonctions que l'adaptateur
 * d'export (même catalogue de variantes) ; la suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionHistogramme {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionHistogramme(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceHistogramme, (id) => construireAvecVarianteId(id as VarianteHistogramme)));
}

/** Séquence dépendant de `exercice.variante` ("effectif" : classement → trace ; "frequence" :
 * classement → frequences → trace, voir `typesHistogramme.ts`). Puces construites depuis
 * l'historique des écrans clos (`segmentsDepuisHistorique`), cliquables (fiche en lecture seule). */
function sequencePourExercice(exercice: EtatSessionHistogramme["exerciceCourant"]): PhaseHistogramme[] {
  return exercice.variante === "frequence" ? ["classement", "frequences", "trace"] : ["classement", "trace"];
}

const TITRES_PHASES: Record<PhaseHistogramme, string> = { classement: "Effectifs", frequences: "Fréquences", trace: "Histogramme" };

/** Valeurs saisies classe par classe, même présentation que la réponse attendue (« [a ; b[ → … »). */
function valeursParClasse(exercice: EtatSessionHistogramme["exerciceCourant"], valeurs: string[], unite = ""): string {
  return exercice.classes.map((_, i) => `${formatClasseTexte(exercice, i)} → ${saisieTexte(valeurs[i] ?? "")}${unite}`).join(", ");
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionHistogramme;
  revele: boolean;
}

export function AppHistogramme() {
  const [etat, setEtat] = useState<EtatSessionHistogramme>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Incrémenté à chaque nouvel exercice (dont « Générer ») : entre dans la `key` des écrans pour
   * remonter leur état local — sans lui, un exercice à moins de classes gardait les champs de
   * l'exercice précédent et « Valider » restait désactivé. */
  const [numeroExercice, setNumeroExercice] = useState(0);
  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  function terminerEtape(nouvelEtat: EtatSessionHistogramme, votreReponse: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      // "trace" est toujours la phase terminale (variante "effectif" : classement → trace ;
      // variante "frequence" : classement → frequences → trace) — seule sa clôture ne reporte plus
      // un champ racine `xxxRevele` à jour, donc on lit `revele` sur le `resultats` tout juste
      // construit dans ce cas ; "classement"/"frequences" gardent leur champ racine.
      const revele =
        etat.phase === "classement"
          ? nouvelEtat.classementRevele
          : etat.phase === "frequences"
            ? nouvelEtat.frequencesRevele
            : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.traceRevele;
      const niveauAide = etat.phase === "classement" ? etat.niveauAideClassement : etat.phase === "frequences" ? etat.niveauAideFrequences : etat.niveauAideTrace;
      setHistorique((h) => [...h, ecranClos(TITRES_PHASES[etat.phase], votreReponse, revele, niveauAide > 0, reponseAttendueEcran(), corrigeDetailleEcranCourant())]);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    viderHistorique();
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionHistogramme(REGLAGES_DEMO, () => construireAvecVarianteId(varianteId as VarianteHistogramme)));
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      setNumeroExercice((n) => n + 1);
      viderHistorique();
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  /** Texte de la réponse attendue (la fiche le montre tel quel ; l'écran l'encadre en `.answer-reveal`). */
  function reponseAttendueEcran() {
    return (
      <>
        {phase === "classement" && <>Effectifs attendus : {formatClassementAttenduTexte(exercice)}</>}
        {phase === "frequences" && <>Fréquences attendues : {formatFrequencesAttenduesTexte(exercice)}</>}
        {phase === "trace" && <>Hauteurs attendues : {formatTraceAttendueTexte(exercice)}</>}
      </>
    );
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleeHistogramme(exercice), lettreEtape(sequencePourExercice(exercice).indexOf(phase)))} />;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <div className="answer-reveal">{reponseAttendueEcran()}</div>,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Regroupement en classes et histogramme</h1>
        <p className="app-subtitle">Chapitre 4</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={onGenererDev} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, sequencePourExercice(exercice).length, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={formatEnonceTexte(exercice)} blocDonnees={null} />
          {phase === "classement" ? (
            <EtapeClassementHistogramme
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideClassement}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseClassement(etat, reponse), valeursParClasse(exercice, reponse))}
              validation={validation}
            />
          ) : phase === "frequences" ? (
            <EtapeFrequencesHistogramme
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideFrequences}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseFrequences(etat, reponse), valeursParClasse(exercice, reponse, " %"))}
              validation={validation}
            />
          ) : (
            <EtapeTraceHistogramme
              key={`${numeroExercice}-${phase}`}
              exercice={exercice}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideTrace}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse) => terminerEtape(soumettreReponseTrace(etat, reponse), valeursParClasse(exercice, reponse.map(nombreTexte), exercice.variante === "frequence" ? " %" : ""))}
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
