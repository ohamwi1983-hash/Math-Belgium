import { useEffect, useState, type ReactNode } from "react";
import type { ReglagesSession6e } from "./core6e/session6e.types";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiquesCyclometriques } from "./generateurs6e/graphiquesCyclometriques/index";
import {
  NIVEAU_AIDE_MAX,
  activerAideSuivante,
  demarrerSessionGraphiquesCyclometriques,
  soumettreLettre,
  soumettreReponseEcranUnique,
} from "./moteur6e/sessionGraphiquesCyclometriques";
import type { EtatSessionGraphiquesCyclometriques } from "./moteur6e/typesGraphiquesCyclometriques";
import { CalculatriceScientifique } from "./components6e/CalculatriceScientifique";
import { EtapeApparierGraphiqueCyclo, type SaisiesApparierCyclo } from "./components6e/EtapeApparierGraphiqueCyclo";
import { GrapheOptionCyclo } from "./components6e/GrapheOptionCyclo";
import { SelecteurVarianteDev } from "./components6e/SelecteurVarianteDev";
import { RenduFragments } from "./components/RenduFragments";
import { LIBELLE_PARITE, calculerViewBoxGraphique, formatEnsembleReelApproxLatex } from "./ui6e/formatGraphiquesCyclometriques";
import { Katex } from "./components/Katex";
import type { ReponseEcranUniqueGraphiquesCyclometriques } from "./moteur6e/verificationGraphiquesCyclometriques";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { correctionDetailleeGraphiquesCyclometriques, reponseGraphiquesCyclo } from "./generateurs6e/graphiquesCyclometriques/corrigeDetaille";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "../4e/ui/historiqueProgression";
import { saisieEnLatex6e } from "./ui6e/saisieEnLatex6e";

const REGLAGES_DEMO: ReglagesSession6e = { nombreExercices: 1, tentativesMax: 3 };

function nouvelleSession(): EtatSessionGraphiquesCyclometriques {
  return demarrerSessionGraphiquesCyclometriques(REGLAGES_DEMO, genererExerciceGraphiquesCyclometriques);
}

/** Première session : `?code=XXXXXX` (QR code d'une feuille) rouvre l'exercice imprimé — mêmes
 * fonctions de tirage que l'adaptateur d'export, comme `App6gen14.tsx`. */
function sessionInitiale(): EtatSessionGraphiquesCyclometriques {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionGraphiquesCyclometriques(REGLAGES_DEMO, () => genererAvecCode(code, CATALOGUE_FAMILLES, genererExerciceGraphiquesCyclometriques, (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])));
}

/** État tenu en attente dès que l'écran unique se termine (bonne réponse, ou tentatives
 * épuisées) — l'état de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le
 * bouton de `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/
 * invalidation avant de passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionGraphiquesCyclometriques;
  revele: boolean;
}

const LETTRES = ["A", "B", "C", "D"];

/** Saisie de l'écran : graphique choisi, puis (s'il était juste) la justification telle que tapée ;
 * domaine et image : l'ensemble construit par l'élève (valeurs relues, à 2 décimales si besoin). */
function reponseApparierAffichee(lettre: number, justification?: { reponse: ReponseEcranUniqueGraphiquesCyclometriques; saisies: SaisiesApparierCyclo }): ReactNode {
  if (!justification) return `Graphique ${LETTRES[lettre] ?? lettre + 1}`;
  const { reponse, saisies } = justification;
  const extremum = (e: { x: string; y: string } | null) =>
    e === null ? (
      "n'existe pas"
    ) : (
      <>
        atteint en x = {saisieEnLatex6e(e.x)}, valeur y = {saisieEnLatex6e(e.y)}
      </>
    );
  return (
    <>
      <span style={{ display: "block" }}>Graphique {LETTRES[lettre] ?? lettre + 1}</span>
      <span style={{ display: "block" }}>Ordonnée à l'origine : {saisies.ordonnee === null ? "n'existe pas" : <>f(0) = {saisieEnLatex6e(saisies.ordonnee)}</>}</span>
      <span style={{ display: "block" }}>
        <Katex expression={`\\text{dom}\\,f = ${formatEnsembleReelApproxLatex(reponse.domf)}`} />
      </span>
      <span style={{ display: "block" }}>
        <Katex expression={`\\text{Im}\\,f = ${formatEnsembleReelApproxLatex(reponse.imf)}`} />
      </span>
      <span style={{ display: "block" }}>Parité : {LIBELLE_PARITE[reponse.parite].toLowerCase()}</span>
      <span style={{ display: "block" }}>Maximum : {extremum(saisies.maximum)}</span>
      <span style={{ display: "block" }}>Minimum : {extremum(saisies.minimum)}</span>
    </>
  );
}

/**
 * `6gen5` — REFONTE COMPLÈTE : un seul écran par tirage, toutes familles confondues (remplace
 * l'ancienne séquence "calcul (C-F) → sélection (A-F)" à 1 ou 2 écrans). Voir
 * `components6e/EtapeApparierGraphiqueCyclo.tsx` pour le détail de l'écran unique et
 * `moteur6e/sessionGraphiquesCyclometriques.ts` pour le moteur simplifié en conséquence (plus de
 * notion de phase).
 */
export function App6gen5() {
  const [etat, setEtat] = useState<EtatSessionGraphiquesCyclometriques>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);

  // Hook de debug pour la vérification Playwright (`?dev=1`) — expose l'exercice courant (dont
  // `proprietes`, la vérité terrain calculée par la Couche A) pour remplir les 7 sous-réponses avec
  // les vraies valeurs plutôt qu'à l'aveugle. Ne concerne jamais un élève en usage normal (lecture
  // seule, aucun effet sur la logique de session).
  useEffect(() => {
    (window as unknown as { __debug6gen5?: unknown }).__debug6gen5 = {
      exercice: etat.exerciceCourant,
      phase: etat.terminee ? "terminee" : enAttente ? "bilan" : "ecran",
    };
  }, [etat, enAttente]);

  /** Écrans clos de l'exercice en cours (puces cliquables → fiche en lecture seule). */
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function viderHistorique() {
    setHistorique([]);
    setFicheOuverteIndex(null);
  }

  /** `votreReponse` n'est gardée que si l'écran se clôt vraiment (choix du graphique faux, ou
   * justification close) ; un choix juste ouvre seulement la justification, sur le même écran. */
  function terminerEtape(nouvelEtat: EtatSessionGraphiquesCyclometriques, votreReponse: ReactNode) {
    if (nouvelEtat.resultats.length > etat.resultats.length) {
      const revele = nouvelEtat.derniereRevelee;
      setHistorique((h) => [...h, ecranClos("Graphique et justification", votreReponse, revele, etat.niveauAide > 0, reponseAttendueEcran(), corrigeDetailleEcranCourant())]);
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

  function forcerVariante(id: string) {
    setEnAttente(null);
    viderHistorique();
    setEtat(
      demarrerSessionGraphiquesCyclometriques(REGLAGES_DEMO, () => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0])),
    );
  }

  const exercice = etat.exerciceCourant;
  const tentativesUtilisees = etat.etapeCourante.tentativesUtilisees;
  const tentativesMax = etat.reglages.tentativesMax;

  // Réponse attendue : le graphique (petit, graduations espacées) et les propriétés en valeurs
  // EXACTES, mêmes fragments que le résultat du corrigé (audit du 6e ch. 1, E11 : l'écran montrait
  // « [−1 ; −0,33] » au lieu de [−1 ; −1/3]).
  function reponseAttendueEcran() {
    return (
      <>
        <GrapheOptionCyclo exercice={exercice} index={exercice.indexCorrect} viewBox={calculerViewBoxGraphique(exercice)} largeur={180} hauteur={180} />
        <p>
          <RenduFragments fragments={reponseGraphiquesCyclo(exercice)} />
        </p>
      </>
    );
  }

  /** Corrigé détaillé « comme au tableau » (source unique avec le papier) — écran unique « a ». UNE
   * seule source pour la validation (après la réponse) et pour l'entrée d'historique (fiche de la puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={correctionDetailleeGraphiquesCyclometriques(exercice)} />;
  }

  const reponseAttendue = enAttente ? reponseAttendueEcran() : null;

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        // Clôture « révélée » par la parité seule (choix fermé faux, le reste juste) ou par le choix
        // du graphique : le message le dit, au lieu de « Tentatives épuisées ».
        messageRevele: !enAttente.etatSuivant.resultats.length
          ? undefined
          : !etat.lettreValidee
            ? "Ce n'était pas le bon graphique (choix fermé : une seule tentative)."
            : enAttente.etatSuivant.pariteRevelee && enAttente.etatSuivant.etapeCourante.tentativesUtilisees < etat.reglages.tentativesMax
              ? "La parité était fausse (une seule tentative) ; le reste de la justification est juste."
              : undefined,
        reponseAttendue,
        corrigeDetaille: corrigeDetailleEcranCourant(),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Apparier graphiques et expressions de fonctions cyclométriques</h1>
        <p className="app-subtitle">Chapitre 1 — Fonctions réciproques & cyclométriques</p>
        <SelecteurVarianteDev options={CATALOGUE_FAMILLES} onGenerer={forcerVariante} />
      </header>
      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, 1, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
        <div className="card-body">
          <EtapeApparierGraphiqueCyclo
            key={etat.indexExercice}
            exercice={exercice}
            // Écran unique par exercice (pas de notion de `phase` ici, voir `6gen5`
            // REFONTE COMPLÈTE ci-dessus) : chaque montage de ce composant EST le premier
            // (et seul) écran de l'exercice — constante, pas besoin de `useRef`.
            lettreValidee={etat.lettreValidee}
            pariteRevelee={etat.pariteRevelee}
            onValiderLettre={(lettre) => terminerEtape(soumettreLettre(etat, lettre), reponseApparierAffichee(lettre))}
            tentativesUtilisees={tentativesUtilisees}
            tentativesMax={tentativesMax}
            niveauAide={etat.niveauAide}
            niveauAideMax={NIVEAU_AIDE_MAX}
            onActiverAide={() => setEtat(activerAideSuivante(etat))}
            onValider={(reponse, saisies) => terminerEtape(soumettreReponseEcranUnique(etat, reponse), reponseApparierAffichee(reponse.lettre, { reponse, saisies }))}
            validation={validation}
          />
          {/* Les 6 propriétés justifiées peuvent porter une valeur irrationnelle (arctan/arcsin/arccos
            d'un argument quelconque, ordonnée, bornes de l'image famille D...) — TOUJOURS visible sur
            l'écran unique, jamais conditionnée par famille (contrairement à `necessiteCalculatrice`
            ailleurs sur ce chantier) puisque les 6 familles A-F peuvent chacune l'exiger. */}
          <CalculatriceScientifique />
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
