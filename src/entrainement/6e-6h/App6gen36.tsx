import { useState } from "react";
import type { ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationsComplexes } from "./generateurs6e/equationsComplexes";
import type { IdVarianteEquationsComplexes } from "./generateurs6e/equationsComplexes";
import { NIVEAU_AIDE_MAX, activerAideSuivante, demarrerSessionEquationsComplexes, soumettreReponseEcran, tentativesMaxPhase } from "./moteur6e/sessionEquationsComplexes";
import { controleQuotientEffectue, graineDepuis, melangerParGraine, prevaliderSaisiesComplexes } from "./moteur6e/saisieComplexe";
import { phasesPourExercice } from "./moteur6e/typesEquationsComplexes";
import type { EtatSessionEquationsComplexes, PhaseEquationsComplexes } from "./moteur6e/typesEquationsComplexes";
import { diagnostiquerEcran } from "./moteur6e/verificationEquationsComplexes";
import { Katex } from "./components/Katex";
import { EtapeChampsEquationsComplexes } from "./components6e/EtapeChampsEquationsComplexes";
import { EtapeChoixEquationsComplexes } from "./components6e/EtapeChoixEquationsComplexes";
import { EtapeListeEquationsComplexes } from "./components6e/EtapeListeEquationsComplexes";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { LIBELLE_PHASE, OPTIONS_EQUATION_B, OPTIONS_EQUATION_E, OPTIONS_SYSTEME_A, blocDonnees, champsEcran, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex, niveauAideMaxEcran, nombreCibleEnsemble, aideNiveau1 as formatAideNiveau1, aideNiveau2 as formatAideNiveau2 } from "./ui6e/formatEquationsComplexes";
import { calculerRecapitulatifEquationsComplexes, calculerSegmentsProgressionEquationsComplexes } from "./ui6e/recapitulatifEquationsComplexes";
import { RecapitulatifPanel } from "./components6e/RecapitulatifPanel";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * `6gen36` — Équations dans ℂ (chapitre 7, "Nombres complexes", TROISIÈME générateur de ce
 * chapitre, après `6gen34`/`6gen35`). Même patron dispatcher générique que `App6gen35.tsx`, avec 3
 * composants "Etape" possibles selon la NATURE de l'écran (pas seulement la famille) :
 * `EtapeChampsEquationsComplexes` (saisie libre à arité fixe), `EtapeChoixEquationsComplexes`
 * (QCM : aAvecEcran1, bEcran1, eEcran1), `EtapeListeEquationsComplexes` (add-as-needed, nombre de
 * valeurs VARIABLE selon l'écran — voir `nombreCibleEnsemble`).
 */

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionEquationsComplexes {
  return demarrerSessionEquationsComplexes(REGLAGES_DEMO, genererExerciceEquationsComplexes);
}

/** Première session : si l'URL porte `?code=` (QR code / code d'une feuille d'exercices ou d'une
 * évaluation), rejoue EXACTEMENT l'instance imprimée — même catalogue et mêmes fonctions de tirage
 * que l'adaptateur (`generateurs6e/…/exportEvaluation.ts`), voir `export/codeExercice.ts`. */
function sessionInitiale(): EtatSessionEquationsComplexes {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionEquationsComplexes(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceEquationsComplexes, (id) => construireAvecVarianteId(id as IdVarianteEquationsComplexes)));
}

interface TransitionEnAttente {
  etatSuivant: EtatSessionEquationsComplexes;
  revele: boolean;
}

export function App6gen36() {
  const [etat, setEtat] = useState<EtatSessionEquationsComplexes>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Consultation en lecture seule des écrans déjà clos (puces cliquables de `ProgressionPuces`) —
   * tenu ICI, à part de `EtatSessionEquationsComplexes`, jamais dans le moteur : la saisie de
   * l'élève n'a aucune autre utilité une fois l'étape close. Remis à vide à chaque nouvel exercice,
   * comme `enAttente`. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Puce "aide" (jaune) : le moteur ne garde `niveauAide` que pour l'écran COURANT (remis à 0 au
   * changement de phase) — on la persiste donc nous-mêmes ici, phase par phase, au même point que
   * `historique`. */
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<PhaseEquationsComplexes, boolean>>>({});
  /** Compteur de génération, inclus dans la `key` de l'écran : deux exercices successifs commençant
   * par la même phase ne réutilisent plus l'instance React (saisies/messages conservés). */
  const [generation, setGeneration] = useState(0);

  /** `votreReponse` : UNIQUEMENT formaté/poussé dans l'historique quand l'étape se clôt RÉELLEMENT
   * (même garde que la transition d'écran elle-même) — jamais à chaque tentative ratée. */
  function terminerEtape(nouvelEtat: EtatSessionEquationsComplexes, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const phaseFermee = etat.phase;
      const revele = nouvelEtat.derniereTransitionRevelee;
      setAideParPhase((prev) => ({ ...prev, [phaseFermee]: etat.niveauAide > 0 }));
      if (votreReponse !== undefined) {
        setHistorique((h) => [
          ...h,
          {
            titre: LIBELLE_PHASE[phaseFermee],
            votreReponse,
            correcte: !revele,
            reponseAttendue: revele ? (
              <span className="equation-box-termes">
                {formatReponseAttenduePhaseLatex(exercice, phaseFermee).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            ) : undefined,
          },
        ]);
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
      setAideParPhase({});
      setGeneration((g) => g + 1);
    } else {
      setEtat(enAttente.etatSuivant);
    }
    setEnAttente(null);
  }

  function forcerVariante(id: string) {
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setGeneration((g) => g + 1);
    setEtat(demarrerSessionEquationsComplexes(REGLAGES_DEMO, () => construireAvecVarianteId(id as IdVarianteEquationsComplexes)));
  }

  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  // Hook DEV-ONLY (jamais en dehors de import.meta.env.DEV/?dev=1) : expose l'exercice tiré tel
  // quel sur `window` — permet à la vérification Playwright (build de production) de reconstruire
  // la réponse EXACTE attendue à chaque écran depuis les vrais paramètres tirés, jamais en
  // re-parsant le LaTeX affiché (fragile). Jamais consommé par le code applicatif lui-même — mirroir
  // `App6gen35.tsx`.
  const modeDevActif = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDevActif) {
    (window as unknown as { __debug6gen36?: unknown }).__debug6gen36 = { exercice, phase };
  }

  const aideCommun = {
    tentativesUtilisees: etat.etapeCourante.tentativesUtilisees,
    tentativesMax: tentativesMaxPhase(etat),
    niveauAide: etat.niveauAide,
    niveauAideMax: Math.min(NIVEAU_AIDE_MAX, niveauAideMaxEcran(exercice, phase)),
    onActiverAide: () => setEtat(activerAideSuivante(etat)),
  };

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

  const ecranCommun = {
    consigneGenerale: consigneGenerale(exercice),
    blocDonnees: blocDonnees(exercice),
    consigneEcran: consigneEcran(exercice, phase),
    aideNiveau1: formatAideNiveau1(exercice, phase),
    aideNiveau2: formatAideNiveau2(exercice, phase),
    validation,
  };

  /** Options d'un choix fermé mélangées par une graine tirée de l'exercice (audit 6e ch. 5, point 6). */
  function melanger<T>(options: readonly T[]): T[] {
    return melangerParGraine(options, graineDepuis(exercice, phase));
  }

  /** Refus SANS tentative : saisie illisible, forme non réduite, ou (famille F) quotient recopié avec
   * « / ». Les champs « Quotient = » (polynôme en z) ne sont pas des nombres complexes : ignorés par le
   * contrôle complexe, contrôlés par `controleQuotientEffectue`. */
  function prevalider(valeurs: string[]): string | null {
    const champs = champsEcran(exercice, phase);
    const indicesPolynome = champs.map((c, i) => (c.label.startsWith("Quotient") ? i : -1)).filter((i) => i >= 0);
    for (const i of indicesPolynome) {
      const refus = controleQuotientEffectue(valeurs[i]);
      if (refus) return refus;
    }
    if (indicesPolynome.length > 0 && diagnostiquerEcran(exercice, phase, valeurs) === "parse_error")
      return "Saisie non reconnue — écris le quotient comme un polynôme développé, par exemple 2z^3-z+4 (et les nombres comme 3 ou -2). Cette saisie ne compte pas comme une tentative.";
    return prevaliderSaisiesComplexes(valeurs, { ignorer: indicesPolynome });
  }

  function rendreEcran() {
    if (phase === "aAvecEcran1" && exercice.famille === "A" && exercice.sousType === "avecBarre") {
      const options = melanger(OPTIONS_SYSTEME_A(exercice));
      return (
        <EtapeChoixEquationsComplexes
          key={`${generation}-${phase}`}
          {...aideCommun}
          {...ecranCommun}
          options={options}
          onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]), <Katex expression={options.find((o) => o.id === id)?.latex ?? id} />)}
        />
      );
    }
    if (phase === "bEcran1" && exercice.famille === "B") {
      const options = melanger(OPTIONS_EQUATION_B(exercice));
      return (
        <EtapeChoixEquationsComplexes
          key={`${generation}-${phase}`}
          {...aideCommun}
          {...ecranCommun}
          options={options}
          onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]), <Katex expression={options.find((o) => o.id === id)?.latex ?? id} />)}
        />
      );
    }
    if (phase === "eEcran1" && exercice.famille === "E") {
      const options = melanger(OPTIONS_EQUATION_E(exercice));
      return (
        <EtapeChoixEquationsComplexes
          key={`${generation}-${phase}`}
          {...aideCommun}
          {...ecranCommun}
          options={options}
          onValider={(id) => terminerEtape(soumettreReponseEcran(etat, [id]), <Katex expression={options.find((o) => o.id === id)?.latex ?? id} />)}
        />
      );
    }
    const nombreCible = nombreCibleEnsemble(exercice, phase);
    if (nombreCible > 0) {
      return (
        <EtapeListeEquationsComplexes
          key={`${generation}-${phase}`}
          {...aideCommun}
          {...ecranCommun}
          nombreCible={nombreCible}
          diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
          prevalider={(valeurs) => prevaliderSaisiesComplexes(valeurs)}
          onValider={(valeurs) => terminerEtape(soumettreReponseEcran(etat, valeurs), valeurs.join(", "))}
        />
      );
    }
    return (
      <EtapeChampsEquationsComplexes
        key={`${generation}-${phase}`}
        {...aideCommun}
        {...ecranCommun}
        champs={champsEcran(exercice, phase)}
        diagnostiquer={(valeurs) => diagnostiquerEcran(exercice, phase, valeurs)}
        prevalider={prevalider}
        onValider={(valeurs) =>
          terminerEtape(soumettreReponseEcran(etat, valeurs), champsEcran(exercice, phase).map((c, i) => `${c.label} : ${valeurs[i]}`).join(" ; "))
        }
      />
    );
  }

  /** Surcharge locale de `calculerSegmentsProgressionEquationsComplexes` : "correcte" devient "aide"
   * quand `aideParPhase` montre que l'écran a été fermé avec de l'aide active. */
  const segmentsBase = calculerSegmentsProgressionEquationsComplexes(etat);
  const segments: EtatPuceProgression[] = phasesPourExercice(exercice).map((p, i) =>
    segmentsBase[i] === "correcte" && aideParPhase[p] ? "aide" : segmentsBase[i],
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Équations dans ℂ</h1>
        <p className="app-subtitle">Chapitre 5 — Nombres complexes</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={forcerVariante} />
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={calculerRecapitulatifEquationsComplexes(etat)} />
        {rendreEcran()}
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
