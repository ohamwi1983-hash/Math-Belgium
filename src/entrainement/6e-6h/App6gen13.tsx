import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesLogarithme } from "./generateurs6e/proprietesLogarithme";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionProprietesLogarithme, soumettreReponse, tentativesMaxEcran } from "./moteur6e/sessionProprietesLogarithme";
import { ecranDeLaPhase } from "./moteur6e/typesProprietesLogarithme";
import type { EtatSessionProprietesLogarithme, PhaseProprietesLogarithme } from "./moteur6e/typesProprietesLogarithme";
import { diagnostiquerEcran } from "./moteur6e/verificationProprietesLogarithme";
import { Katex } from "./components/Katex";
import { EtapeProprieteLogarithme } from "./components6e/EtapeProprieteLogarithme";
import { EtapeChoixProprieteLogarithme } from "./components6e/EtapeChoixProprieteLogarithme";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { OPTIONS_PROPRIETES, PLACEHOLDER_TRANSFORMATION, consigneGenerale, etatActuel, expressionDemandeeLatex, consigneEcran, aideNiveau1, aideNiveau2, formatReponseAttenduePhaseLatex, libellePhase } from "./ui6e/formatProprietesLogarithme";
import { calculerRecapitulatifProprietesLogarithme, calculerSegmentsProgressionProprietesLogarithme } from "./ui6e/recapitulatifProprietesLogarithme";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionProprietesLogarithme {
  return demarrerSessionProprietesLogarithme(REGLAGES_DEMO, genererExerciceProprietesLogarithme);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec les MÊMES fonctions de génération que l'adaptateur
 * d'export (`generateurs6e/proprietesLogarithme/exportEvaluation.ts`) ; la suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionProprietesLogarithme {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionProprietesLogarithme(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceProprietesLogarithme, (id) => construireAvecVarianteId(id)));
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionProprietesLogarithme;
  revele: boolean;
}

export function App6gen13() {
  const [etat, setEtat] = useState<EtatSessionProprietesLogarithme>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionProprietesLogarithme`, jamais dans le moteur. Remis à vide à
   * chaque nouvel exercice (mêmes endroits que `enAttente`). */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Aide utilisée PAR ÉCRAN DÉJÀ CLOS (indexé par `phase`, le même index numérique que les
   * segments de `ProgressionPuces`) — le moteur ne garde aucune trace persistante de l'aide une fois
   * l'écran refermé (`niveauAide` est remis à 0 à chaque transition), capturé ICI au moment exact de
   * la clôture réelle (même garde que `terminerEtape`). Remis à vide comme `historique`. */
  const [aideUtiliseeParPhase, setAideUtiliseeParPhase] = useState<Partial<Record<PhaseProprietesLogarithme, boolean>>>({});
  /** Incrémenté à CHAQUE nouvel exercice (y compris via le sélecteur de développement) — entre dans
   * la `key` des écrans pour qu'un nouvel exercice reparte toujours de champs vides, même quand il
   * démarre sur le même index d'écran que le précédent. */
  const [numeroExercice, setNumeroExercice] = useState(0);

  function terminerEtape(nouvelEtat: EtatSessionProprietesLogarithme, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele = nouvelEtat.derniereTransitionRevelee;
      // `votreReponse`/`niveauAide` : UNIQUEMENT capturés dans la branche de transition RÉELLE —
      // jamais à chaque clic sur "Valider".
      if (votreReponse !== undefined) {
        const valeurs = formatReponseAttenduePhaseLatex(exercice, etat.phase);
        setHistorique((h) => [
          ...h,
          {
            titre: libellePhase(exercice, etat.phase),
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (
              <span className="equation-box-termes">
                {valeurs.map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : undefined,
          },
        ]);
      }
      if (etat.niveauAide > 0) {
        setAideUtiliseeParPhase((m) => ({ ...m, [etat.phase]: true }));
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
      setAideUtiliseeParPhase({});
      setNumeroExercice((n) => n + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideUtiliseeParPhase({});
    setNumeroExercice((n) => n + 1);
    setEtat(demarrerSessionProprietesLogarithme(REGLAGES_DEMO, () => construireAvecVarianteId(id)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = tentativesMaxEcran(etat);
  const ecran = ecranDeLaPhase(exercice, phase);
  const niveauAide = etat.niveauAide;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: (
          <span className="equation-box-termes">
            {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </span>
        ),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const propsCommun = {
    consigneGenerale: consigneGenerale(exercice),
    expressionLatex: expressionDemandeeLatex(exercice),
    etatActuel: etatActuel(exercice, phase),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: aideNiveau1(),
    aideNiveau2: aideNiveau2(exercice, phase),
    niveauAide,
    niveauAideMax: NIVEAU_AIDE_MAX,
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
    validation,
  };
  const libelleChoix = (id: string) => OPTIONS_PROPRIETES.find((o) => o.id === id)?.label ?? id;

  // "aide" (puce jaune) : post-traite les segments déjà calculés par `calculerSegmentsProgressionProprietesLogarithme`
  // avec `aideUtiliseeParPhase` capturé localement ci-dessus — indexé directement par `phase` (index
  // numérique), jamais besoin d'une séquence de noms à traduire (contrairement à l'ancienne version
  // à 2 écrans fixes).
  const segments: EtatPuceProgression[] = calculerSegmentsProgressionProprietesLogarithme(etat).map((segment, index) =>
    segment === "correcte" && aideUtiliseeParPhase[index] ? "aide" : segment,
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Propriétés du logarithme</h1>
        <p className="app-subtitle">Chapitre 3 — Fonctions logarithmes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifProprietesLogarithme(etat)} />
        {ecran.kind === "choix" ? (
          <EtapeChoixProprieteLogarithme
            key={`${numeroExercice}-${phase}`}
            {...propsCommun}
            options={OPTIONS_PROPRIETES}
            onValider={(choix) => terminerEtape(soumettreReponse(etat, choix), libelleChoix(choix))}
          />
        ) : (
          <EtapeProprieteLogarithme
            key={`${numeroExercice}-${phase}`}
            {...propsCommun}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            placeholder={PLACEHOLDER_TRANSFORMATION}
            diagnostiquer={(texte) => diagnostiquerEcran(exercice, phase, texte)}
            onValider={(texte) => terminerEtape(soumettreReponse(etat, texte), texte)}
          />
        )}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
