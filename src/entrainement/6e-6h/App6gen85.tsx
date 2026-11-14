import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import type { ExerciceLireCourbeLogarithmique } from "./core6e/lireCourbeLogarithmique.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireCourbeLogarithmique } from "./generateurs6e/lireCourbeLogarithmique";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionLireCourbeLogarithmique, soumettreReponseEcran, tentativesMaxCourant } from "./moteur6e/sessionLireCourbeLogarithmique";
import { estPhaseChoix, indiceCourbe } from "./moteur6e/typesLireCourbeLogarithmique";
import type { EtatSessionLireCourbeLogarithmique, PhaseLireCourbeLogarithmique, ReponseLireCourbeLog } from "./moteur6e/typesLireCourbeLogarithmique";
import { diagnostiquerEcran } from "./moteur6e/verificationLireCourbeLogarithmique";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeLireCourbeLogarithmique } from "./components6e/EtapeLireCourbeLogarithmique";
import type { ModeEcranLireCourbeLog } from "./components6e/EtapeLireCourbeLogarithmique";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import {
  LETTRES_EXPRESSIONS,
  LIBELLE_CHAMP,
  PLACEHOLDERS,
  RAPPEL_SAISIE_EXPRESSION,
  aideNiveau1,
  aideNiveau2,
  consigneEcran,
  consigneGenerale,
  descriptionFigure,
  expressionLatex,
  formatReponseAttenduePhaseLatex,
  libellePhase,
} from "./ui6e/formatLireCourbeLogarithmique";
import { figureLecture, figuresAssocier } from "./ui6e/figureCourbeLogarithmique";
import { calculerRecapitulatifLireCourbeLogarithmique, calculerSegmentsProgressionLireCourbeLogarithmique } from "./ui6e/recapitulatifLireCourbeLogarithmique";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

/**
 * `6gen85` — « Lire une courbe logarithmique » (chapitre 3 de 6e, section `parametres`,
 * processus 2). À partir du graphique de f(x) = log_a(x − c) + d : asymptote, domaine, base et
 * expression (variante `lecture`), ou association de 4 courbes et 4 expressions (`associer`). Même
 * patron que `App6gen77.tsx` ; le `?code=` (QR code des feuilles) rejoue l'instance de
 * `generateurs6e/lireCourbeLogarithmique/exportEvaluation.ts` avec les MÊMES fonctions de génération.
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionLireCourbeLogarithmique {
  return demarrerSessionLireCourbeLogarithmique(REGLAGES_DEMO, genererExerciceLireCourbeLogarithmique);
}

/** Première session : le code d'un exercice imprimé (`?code=XXXXXX`) en fixe le PREMIER exercice. */
function sessionInitiale(): EtatSessionLireCourbeLogarithmique {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionLireCourbeLogarithmique(REGLAGES_DEMO, () =>
    genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceLireCourbeLogarithmique, (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])),
  );
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionLireCourbeLogarithmique;
  revele: boolean;
}

function modeEcran(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique): ModeEcranLireCourbeLog {
  if (estPhaseChoix(phase) && e.variante === "associer") {
    return { type: "choix", options: e.expressions.map((k, i) => ({ lettre: LETTRES_EXPRESSIONS[i], latex: `y = ${expressionLatex(k)}` })) };
  }
  if (phase === "domaine") return { type: "ensemble", libelleLatex: "\\text{dom}\\,f =" };
  return { type: "texte", libelle: LIBELLE_CHAMP[phase] ?? "", placeholder: PLACEHOLDERS[phase] ?? "", rappel: phase === "expression" ? RAPPEL_SAISIE_EXPRESSION : undefined };
}

function reponseAttendue(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique): ReactNode {
  return (
    <span className="equation-box-termes">
      {formatReponseAttenduePhaseLatex(e, phase).map((frag, i) => (
        <Katex key={i} expression={frag} />
      ))}
    </span>
  );
}

function votreReponse(e: ExerciceLireCourbeLogarithmique, reponse: ReponseLireCourbeLog): ReactNode {
  if (reponse.type === "texte") return reponse.texte;
  if (reponse.type === "choix" && e.variante === "associer") return <Katex expression={`\\mathrm{${LETTRES_EXPRESSIONS[reponse.indice]}}\\colon\\; y = ${expressionLatex(e.expressions[reponse.indice])}`} />;
  return "intervalle construit";
}

function BlocDonnees({ exercice, phase, fini }: { exercice: ExerciceLireCourbeLogarithmique; phase: PhaseLireCourbeLogarithmique; fini: boolean }) {
  if (exercice.variante === "lecture") {
    return (
      <div className="equation-box">
        <div style={{ maxWidth: 520, margin: "0 auto" }} dangerouslySetInnerHTML={{ __html: figureLecture(exercice, fini ? "corrige" : "ecran") }} />
        <p className="prompt-text">
          <RenduFragments fragments={descriptionFigure(exercice, fini)} />
        </p>
      </div>
    );
  }
  const surligne = estPhaseChoix(phase) && !fini ? indiceCourbe(phase) : undefined;
  return (
    <div className="equation-box">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, maxWidth: 560, margin: "0 auto" }}>
        {figuresAssocier(exercice, "ecran", surligne).map((svg, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: svg }} />
        ))}
      </div>
      <ul className="prompt-text" style={{ listStyle: "none", paddingLeft: 0, margin: "10px 0 0" }}>
        {exercice.expressions.map((k, i) => (
          <li key={i} style={{ margin: "4px 0" }}>
            <strong>{LETTRES_EXPRESSIONS[i]}</strong>&nbsp;: <Katex expression={`y = ${expressionLatex(k)}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function App6gen85() {
  const [etat, setEtat] = useState<EtatSessionLireCourbeLogarithmique>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseLireCourbeLogarithmique, boolean>>>({});
  /** Compteur d'exercices affichés : entre dans la `key` de l'écran pour vider la saisie à chaque
   * nouvel exercice (« Générer », « Nouvel exercice »), même quand la phase est la même. */
  const [compteur, setCompteur] = useState(0);

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  function terminerEtape(nouvelEtat: EtatSessionLireCourbeLogarithmique, reponse: ReponseLireCourbeLog) {
    const transition = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || nouvelEtat.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvelEtat);
      return;
    }
    const revele = nouvelEtat.derniereTransitionRevelee;
    setAideParPhase((prev) => ({ ...prev, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [...h, { titre: libellePhase(exercice, phase), votreReponse: votreReponse(exercice, reponse), correcte: !revele, reponseAttendue: revele ? reponseAttendue(exercice, phase) : undefined }]);
    setEnAttente({ etatSuivant: nouvelEtat, revele });
  }

  function reinitialiser(nouvelEtat: EtatSessionLireCourbeLogarithmique) {
    setEtat(nouvelEtat);
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setFicheOuverteIndex(null);
    setCompteur((c) => c + 1);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      reinitialiser(nouvelleSession());
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    reinitialiser(demarrerSessionLireCourbeLogarithmique(REGLAGES_DEMO, () => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0])));
  }

  // Hook DEV-ONLY (même garde que `SelecteurVarianteDev`) : exercice tiré exposé pour Playwright.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen85?: unknown }).__debug6gen85 = { exercice, phase };
  }

  const choix = estPhaseChoix(phase);
  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, phase),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        ...(choix ? { messageRevele: "Ce n'était pas la bonne expression (une seule tentative sur un choix fermé)." } : {}),
      }
    : null;
  const fini = !!enAttente?.etatSuivant.terminee;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Lire une courbe logarithmique</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={calculerSegmentsProgressionLireCourbeLogarithmique(etat, aideParPhase)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifLireCourbeLogarithmique(etat)} />
        <EtapeLireCourbeLogarithmique
          key={`${compteur}-${phase}`}
          consigneGenerale={consigneGenerale(exercice)}
          blocDonnees={<BlocDonnees exercice={exercice} phase={phase} fini={fini} />}
          consigneEcran={consigneEcran(exercice, phase)}
          mode={modeEcran(exercice, phase)}
          aideNiveau1={aideNiveau1(exercice, phase)}
          aideNiveau2={aideNiveau2(exercice, phase)}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxCourant(etat)}
          niveauAide={etat.niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX}
          onActiverAide={() => setEtat(activerAideSuivante(etat))}
          validation={validation}
          diagnostiquer={(reponse) => diagnostiquerEcran(exercice, phase, reponse)}
          onValider={(reponse) => terminerEtape(soumettreReponseEcran(etat, reponse), reponse)}
        />
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
