import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEtudeFonctionLogarithme } from "./generateurs6e/etudeFonctionLogarithme";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionEtudeFonctionLogarithme,
  soumettreReponseAsymptotes,
  soumettreReponseConcavite,
  soumettreReponseCroissance,
  soumettreReponseDomaine,
  soumettreReponseGraphique,
  soumettreReponseLimites,
} from "./moteur6e/sessionEtudeFonctionLogarithme";
import type { EtatSessionEtudeFonctionLogarithme, PhaseEtudeFonctionLogarithme } from "./moteur6e/typesEtudeFonctionLogarithme";
import { tentativesMaxPhase } from "./moteur6e/typesEtudeFonctionLogarithme";
import { EtapeAsymptotesMultiLog } from "./components6e/EtapeAsymptotesMultiLog";
import { EtapeConcaviteLog } from "./components6e/EtapeConcaviteLog";
import { EtapeCroissanceGrilleCLog } from "./components6e/EtapeCroissanceGrilleCLog";
import { EtapeCroissanceStandardLog } from "./components6e/EtapeCroissanceStandardLog";
import { EtapeDomaineEtudeFonctionLog } from "./components6e/EtapeDomaineEtudeFonctionLog";
import { EtapeLimitesMultiLog } from "./components6e/EtapeLimitesMultiLog";
import { EtapeSelectionGraphiqueEtudeFonctionLog } from "./components6e/EtapeSelectionGraphiqueEtudeFonctionLog";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { Katex } from "./components/Katex";
import {
  aideAsymptotesNiveau1,
  aideAsymptotesNiveau2,
  aideConcaviteNiveau1,
  aideConcaviteNiveau2,
  aideCroissanceNiveau1,
  aideCroissanceNiveau2,
  aideDomaineNiveau1,
  aideDomaineNiveau2,
  aideGraphiqueNiveau1,
  aideGraphiqueNiveau2,
  aideLimitesNiveau1,
  aideLimitesNiveau2,
  consigneAsymptotes,
  consigneCroissance,
  consigneDomaine,
  consigneLimites,
  contenuRecapLatex,
  directionLabelsAsymptotes,
  directionLabelsLimites,
  forcerPresenceAsymptotes,
  formatFonctionLatex,
  intervallesGrilleCLatex,
  LIBELLE_PHASE_ETUDE_LOG,
} from "./ui6e/formatEtudeFonctionLogarithme";
import { calculerRecapitulatifEtudeFonctionLogarithme, calculerSegmentsProgressionEtudeFonctionLogarithme } from "./ui6e/recapitulatifEtudeFonctionLogarithme";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

const LIBELLES_CROISSANCE: Record<string, string> = {
  croissante_partout: "croissante partout",
  decroissante_partout: "décroissante partout",
  minimum: "minimum",
  maximum: "maximum",
};

const LIBELLES_CONCAVITE: Record<string, string> = {
  convexe_partout: "convexe partout",
  concave_partout: "concave partout",
  inflexions: "point(s) d'inflexion",
};

function nouvelleSession(): EtatSessionEtudeFonctionLogarithme {
  return demarrerSessionEtudeFonctionLogarithme(REGLAGES_DEMO, genererExerciceEtudeFonctionLogarithme);
}

/** Première session : l'exercice imprimé sur une feuille (`?code=XXXXXX`) s'il y en a un — MÊMES
 * fonctions de génération que l'adaptateur d'export (`generateurs6e/etudeFonctionLogarithme/exportEvaluation.ts`). */
function sessionInitiale(): EtatSessionEtudeFonctionLogarithme {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionEtudeFonctionLogarithme(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceEtudeFonctionLogarithme, (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionEtudeFonctionLogarithme;
  revele: boolean;
}

export function App6gen21() {
  const [etat, setEtat] = useState<EtatSessionEtudeFonctionLogarithme>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, jamais dans le moteur : la saisie de l'élève n'a aucune autre utilité une fois l'écran
   * clos. Remis à vide à chaque nouvel exercice/variante forcée, comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur d'exercices de la page — `indexExercice` du moteur repart à 0 à chaque nouvelle
   * session (1 exercice par session), il ne suffit donc pas à remonter les écrans entre deux
   * exercices consécutifs de même phase. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  /** `phaseFermee` est TOUJOURS l'ancien `etat.phase` (jamais `nouvelEtat.phase`), appelé avant que
   * `setEtat` n'applique la transition — réutilise `calculerRecapitulatifEtudeFonctionLogarithme`
   * (même source que `RecapitulatifPanel`) pour la réponse ATTENDUE. Garde explicite sur le libellé :
   * le dernier écran de l'exercice (famille E : "comportementInfini", A-D : "graphique") n'avance
   * jamais `etat.phase` au-delà de lui-même, donc le récapitulatif ne le voit JAMAIS comme "clos" —
   * sans cette garde on repousserait l'entrée de l'écran PRÉCÉDENT une seconde fois (bug déjà
   * rencontré sur la référence 4e, voir `AppAnalyseFonction.tsx`). */
  function ajouterHistorique(phaseFermee: PhaseEtudeFonctionLogarithme, votreReponse: ReactNode, nouvelEtat: EtatSessionEtudeFonctionLogarithme) {
    const recap = calculerRecapitulatifEtudeFonctionLogarithme(nouvelEtat);
    const derniere = recap[recap.length - 1];
    if (!derniere || derniere.libelle !== LIBELLE_PHASE_ETUDE_LOG[phaseFermee]) return;
    setHistorique((h) => [
      ...h,
      {
        titre: derniere.libelle,
        votreReponse,
        correcte: !derniere.revele,
        reponseAttendue: derniere.revele ? <Katex expression={derniere.valeur} /> : undefined,
      },
    ]);
  }

  function terminerEtape(nouvelEtat: EtatSessionEtudeFonctionLogarithme, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      if (votreReponse !== undefined) {
        ajouterHistorique(etat.phase, votreReponse, nouvelEtat);
      }
      // La phase qui vient PRÉCISÉMENT de se fermer est `etat.phase` (pas `nouvelEtat.phase`) — son
      // détail vit soit dans `detailsPartiels` (écran intermédiaire), soit dans le `resultats` qui
      // vient d'être poussé (dernier écran de l'exercice), même principe que `App6gen16.tsx`.
      const exerciceVientDeFinir = nouvelEtat.resultats.length > etat.resultats.length;
      const detail = exerciceVientDeFinir
        ? nouvelEtat.resultats[nouvelEtat.resultats.length - 1].details[etat.phase]
        : nouvelEtat.detailsPartiels[etat.phase];
      setEnAttente({ etatSuivant: nouvelEtat, revele: detail?.revele ?? false });
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
    setFicheOuverteIndex(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionEtudeFonctionLogarithme(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxPhase(etat.phase, etat.reglages.tentativesMax);
  const niveauAide = etat.niveauAide;
  const enonceLatex = formatFonctionLatex(exercice);
  const onActiverAide = () => setEtat(activerAideSuivante(etat));
  // Clé = compteur d'exercices de la page + phase : chaque nouvel exercice remonte l'écran (champs
  // et choix vidés), même quand la phase reste identique.
  const cle = `${numeroExercice}-${etat.phase}`;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Katex expression={contenuRecapLatex(exercice, etat.phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Étudier une fonction (synthèse, logarithmes)</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionEtudeFonctionLogarithme(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEtudeFonctionLogarithme(etat)} />
        {etat.phase === "domaine" && (
              <EtapeDomaineEtudeFonctionLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneDomaine(exercice)}
                aideNiveau1={aideDomaineNiveau1(exercice)}
                aideNiveau2={aideDomaineNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseDomaine(etat, reponse),
                    reponse.forme === "reel"
                      ? "ℝ"
                      : reponse.forme === "prive_points"
                        ? `ℝ \\ {${reponse.points.join(", ")}}`
                        : reponse.morceaux.map((m) => `${m.infInclus ? "[" : "]"}${m.inf ?? "-∞"} ; ${m.sup ?? "+∞"}${m.supInclus ? "]" : "["}`).join(" ∪ "),
                  )
                }
                validation={validation}
              />
            )}

            {etat.phase === "limites" && (
              <EtapeLimitesMultiLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneLimites(exercice)}
                labels={directionLabelsLimites(exercice)}
                aideNiveau1={aideLimitesNiveau1(exercice)}
                aideNiveau2={aideLimitesNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseLimites(etat, reponse),
                    reponse.map((r) => (r.type === "plus_infini" ? "+∞" : r.type === "moins_infini" ? "-∞" : r.type === "zero" ? "0" : r.texte)).join(" ; "),
                  )
                }
                validation={validation}
              />
            )}

            {etat.phase === "asymptotes" && (
              <EtapeAsymptotesMultiLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneAsymptotes(exercice)}
                labels={directionLabelsAsymptotes(exercice)}
                forcerPresence={forcerPresenceAsymptotes(exercice)}
                aideNiveau1={aideAsymptotesNiveau1(exercice)}
                aideNiveau2={aideAsymptotesNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) =>
                  terminerEtape(soumettreReponseAsymptotes(etat, reponse), reponse.map((d) => (d.existe ? d.texte : "n'existe pas")).join(" ; "))
                }
                validation={validation}
              />
            )}

            {etat.phase === "croissance" && exercice.famille === "C" && (
              <EtapeCroissanceGrilleCLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneCroissance(exercice)}
                intervalles={intervallesGrilleCLatex(exercice)}
                aideNiveau1={aideCroissanceNiveau1(exercice)}
                aideNiveau2={aideCroissanceNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseCroissance(etat, { type: "grilleC", reponse }),
                    `${reponse.signes.map((s) => (s === "croissante" ? "croissante" : "décroissante")).join(" ; ")} ; extremum local : ${reponse.valeurExtremum}`,
                  )
                }
                validation={validation}
              />
            )}
            {etat.phase === "croissance" && exercice.famille !== "C" && (
              <EtapeCroissanceStandardLog
                key={cle}
                enonceLatex={enonceLatex}
                consigneEcran={consigneCroissance(exercice)}
                aideNiveau1={aideCroissanceNiveau1(exercice)}
                aideNiveau2={aideCroissanceNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseCroissance(etat, { type: "standard", reponse }),
                    `${LIBELLES_CROISSANCE[reponse.type]}${reponse.position ? ` en x=${reponse.position}` : ""}`,
                  )
                }
                validation={validation}
              />
            )}

            {etat.phase === "concavite" && (
              <EtapeConcaviteLog
                key={cle}
                enonceLatex={enonceLatex}
                aideNiveau1={aideConcaviteNiveau1(exercice)}
                aideNiveau2={aideConcaviteNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(reponse) =>
                  terminerEtape(
                    soumettreReponseConcavite(etat, reponse),
                    `${LIBELLES_CONCAVITE[reponse.type]}${reponse.positionsTexte.length > 0 ? ` en x=${reponse.positionsTexte.join(" et x=")}` : ""}`,
                  )
                }
                validation={validation}
              />
            )}

            {etat.phase === "graphique" && (
              <EtapeSelectionGraphiqueEtudeFonctionLog
                key={cle}
                exercice={exercice}
                aideNiveau1={aideGraphiqueNiveau1(exercice)}
                aideNiveau2={aideGraphiqueNiveau2(exercice)}
                tentativesUtilisees={tentativesUtilisees}
                tentativesMax={tentativesMax}
                niveauAide={niveauAide}
                niveauAideMax={NIVEAU_AIDE_MAX}
                onActiverAide={onActiverAide}
                onValider={(index) => terminerEtape(soumettreReponseGraphique(etat, index), `Graphique ${String.fromCharCode(65 + index)}`)}
                validation={validation}
              />
            )}

      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
