import { useState } from "react";
import type { ReactNode } from "react";
import type { ReponseAsymptotesCaracteristiques, ReponseExistence, ReponseZerosCaracteristiques } from "./core/caracteristiquesFonction.types";
import type { ExerciceCaracteristiquesFonction } from "./core/caracteristiquesFonction.types";
import type { Morceau } from "./core/inequation.types";
import type { ReglagesSession } from "./core/session.types";
import {
  demarrerSessionCaracteristiquesFonction,
  soumettreReponseAsymptotes,
  soumettreReponseConstance,
  soumettreReponseCroissance,
  soumettreReponseDecroissance,
  soumettreReponseDomaine,
  soumettreReponseOrdonnee,
  soumettreReponseValeur,
  soumettreReponseZeros,
} from "./moteur/sessionCaracteristiquesFonction";
import type { EtatSessionCaracteristiquesFonction } from "./moteur/typesCaracteristiquesFonction";
import { genererExerciceCaracteristiquesFonction } from "./generateurs/caracteristiquesFonction";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { EtapeDomaineCaracteristiques } from "./components/EtapeDomaineCaracteristiques";
import { EtapeZerosCaracteristiques } from "./components/EtapeZerosCaracteristiques";
import { EtapeCroissanceCaracteristiques } from "./components/EtapeCroissanceCaracteristiques";
import { EtapeDecroissanceCaracteristiques } from "./components/EtapeDecroissanceCaracteristiques";
import { EtapeConstanceCaracteristiques } from "./components/EtapeConstanceCaracteristiques";
import { EtapeOrdonneeCaracteristiques } from "./components/EtapeOrdonneeCaracteristiques";
import { EtapeValeurCaracteristiques } from "./components/EtapeValeurCaracteristiques";
import { EtapeAsymptotesCaracteristiques } from "./components/EtapeAsymptotesCaracteristiques";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { MafsGraphCaracteristiquesFonction } from "./components/MafsGraphCaracteristiquesFonction";
import {
  constanceAttendueCaracteristiques,
  croissanceAttendueCaracteristiques,
  decroissanceAttendueCaracteristiques,
  domaineCaracteristiques,
  evaluerCourbeCaracteristiques,
  existeOrdonneeCaracteristiques,
  existeValeurEnVCaracteristiques,
} from "./moteur/verificationCaracteristiquesFonction";
import type { PhaseCaracteristiquesFonction } from "./core/caracteristiquesFonction.types";
import { etatListeInitiale } from "./ui/listeMorceaux";
import type { EtatListeMorceaux } from "./ui/listeMorceaux";
import { morceauxCompletsPourSurlignage } from "./ui/surlignageCaracteristiques";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

const CONSIGNE_GENERALE = "Lis les caractéristiques de cette fonction sur son graphique.";

const REGLAGES_DEMO: ReglagesSession = {
  nombreExercices: 1,
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
};

function nouvelleSession(): EtatSessionCaracteristiquesFonction {
  return demarrerSessionCaracteristiquesFonction(REGLAGES_DEMO, genererExerciceCaracteristiquesFonction);
}

/** Première session : si l'URL porte le code d'un exercice imprimé (`?code=XXXXXX`), son PREMIER
 * exercice est cette instance — tirée avec la MÊME fonction de génération que l'adaptateur d'export
 * (`generateurs/caracteristiquesFonction/exportEvaluation.ts`, sans catalogue de variantes) ; la
 * suite de la session reste un tirage normal. */
function sessionInitiale(): EtatSessionCaracteristiquesFonction {
  const code = lireCodeDepuisUrl();
  if (!code) return nouvelleSession();
  return demarrerSessionCaracteristiquesFonction(REGLAGES_DEMO, () => genererAvecCode(code, undefined, genererExerciceCaracteristiquesFonction, undefined));
}

/** Arrondi d'affichage (3 décimales) pour une révélation — jamais utilisé pour la vérification
 * elle-même. Virgule décimale et « − » typographique. */
function formatNombre(valeur: number): string {
  return `${Number(valeur.toFixed(3))}`.replace(".", ",").replace("-", "−");
}

function formatBorne(borne: Morceau["borneGauche"]): string {
  return borne === "-inf" ? "−∞" : borne === "+inf" ? "+∞" : formatNombre(borne);
}

function formatMorceau(m: Morceau): string {
  return `${m.crochetGauche}${formatBorne(m.borneGauche)} ; ${formatBorne(m.borneDroite)}${m.crochetDroit}`;
}

function formatDomaineAttendu(exercice: ExerciceCaracteristiquesFonction): string {
  return domaineCaracteristiques(exercice).map(formatMorceau).join(" ∪ ");
}

function formatZerosAttendus(exercice: ExerciceCaracteristiquesFonction): string {
  if (exercice.zeros.length === 0) return "aucun";
  return [...exercice.zeros].sort((a, b) => a - b).map(formatNombre).join(" ; ");
}

/** Titre de chaque écran dans la fiche des puces cliquables (même ordre que `ORDRE_PHASES`). */
const TITRE_PHASE: Record<PhaseCaracteristiquesFonction, string> = {
  domaine: "Domaine de définition",
  zeros: "Zéros",
  croissance: "Intervalles de croissance",
  decroissance: "Intervalles de décroissance",
  constance: "Intervalles de constance",
  ordonnee: "Ordonnée à l'origine",
  valeur: "Image de v",
  asymptotes: "Asymptotes",
};

function formatListe(morceaux: Morceau[]): string {
  return morceaux.length === 0 ? "aucun" : formatMorceaux(morceaux);
}

function formatExistence(reponse: ReponseExistence): string {
  return reponse.existe && reponse.valeur !== null ? formatNombre(reponse.valeur) : "n'existe pas";
}

function formatMorceaux(morceaux: Morceau[]): string {
  return morceaux.map(formatMorceau).join(" ∪ ");
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCaracteristiquesFonction;
  revele: boolean;
}

/** Phases dont la réponse se construit via `ListeMorceauxInput` — seules celles-ci surlignent le
 * graphe en temps réel (`blocDonnees`, voir plus bas) à partir de la construction en cours. */
const PHASES_AVEC_LISTE = new Set<PhaseCaracteristiquesFonction>(["domaine", "croissance", "decroissance", "constance"]);

const ORDRE_PHASES: PhaseCaracteristiquesFonction[] = [
  "domaine",
  "zeros",
  "croissance",
  "decroissance",
  "constance",
  "ordonnee",
  "valeur",
  "asymptotes",
];

/** Segments de la barre de puces — séquence FIXE à 8 écrans, toujours la même (voir
 * `sessionCaracteristiquesFonction.ts`, "aucune étape n'est sautable ici"). Aucune aide tracée sur ce
 * générateur (pas de `niveauAide`/`onActiverAide` câblé sur ses 8 écrans) — correcte/révélé
 * seulement, même principe que `AppFormeCanoniqueTransformations.tsx`. "asymptotes" (dernière phase,
 * clôture l'exercice) n'a jamais besoin de sa propre branche "close". */
function calculerSegmentsProgression(etat: EtatSessionCaracteristiquesFonction): EtatPuceProgression[] {
  const indexCourant = ORDRE_PHASES.indexOf(etat.phase);
  return ORDRE_PHASES.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    const revele =
      phase === "domaine"
        ? etat.domaineRevele
        : phase === "zeros"
          ? etat.zerosRevele
          : phase === "croissance"
            ? etat.croissanceRevele
            : phase === "decroissance"
              ? etat.decroissanceRevele
              : phase === "constance"
                ? etat.constanceRevele
                : phase === "ordonnee"
                  ? etat.ordonneeRevele
                  : etat.valeurRevele;
    return revele ? "revele" : "correcte";
  });
}

export function AppCaracteristiquesFonction() {
  const [etat, setEtat] = useState<EtatSessionCaracteristiquesFonction>(sessionInitiale);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Puces cliquables : une entrée par écran clos (même index que `ORDRE_PHASES`, séquence fixe),
   * construite au moment où l'écran se clôt — jamais recalculée après coup. Remis à vide à chaque
   * nouvel exercice. */
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);

  function terminerEtape(nouvelEtat: EtatSessionCaracteristiquesFonction, votreReponse?: ReactNode) {
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee;
    if (transitionDEcran) {
      const revele =
        etat.phase === "domaine"
          ? nouvelEtat.domaineRevele
          : etat.phase === "zeros"
            ? nouvelEtat.zerosRevele
            : etat.phase === "croissance"
              ? nouvelEtat.croissanceRevele
              : etat.phase === "decroissance"
                ? nouvelEtat.decroissanceRevele
                : etat.phase === "constance"
                  ? nouvelEtat.constanceRevele
                  : etat.phase === "ordonnee"
                    ? nouvelEtat.ordonneeRevele
                    : etat.phase === "valeur"
                      ? nouvelEtat.valeurRevele
                      : nouvelEtat.resultats[nouvelEtat.resultats.length - 1]!.asymptotesRevele;
      if (votreReponse !== undefined) {
        const index = ORDRE_PHASES.indexOf(etat.phase);
        const attendue = reponseAttendueTexte(etat.phase);
        setHistorique((h) => {
          const copie = [...h];
          copie[index] = { titre: TITRE_PHASE[etat.phase], votreReponse, correcte: !revele, reponseAttendue: attendue };
          return copie;
        });
      }
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee || enAttente.etatSuivant.indexExercice !== etat.indexExercice) {
      setHistorique([]);
      setFicheOuverteIndex(null);
    }
    setEtat(enAttente.etatSuivant.terminee ? nouvelleSession() : enAttente.etatSuivant);
    setEnAttente(null);
  }

  /** Réponse attendue de l'écran courant (texte), même contenu que la révélation de `ValidationEcran`. */
  function reponseAttendueTexte(phase: PhaseCaracteristiquesFonction): string {
    const ex = etat.exerciceCourant;
    switch (phase) {
      case "domaine":
        return formatDomaineAttendu(ex);
      case "zeros":
        return formatZerosAttendus(ex);
      case "croissance":
        return formatListe(croissanceAttendueCaracteristiques(ex));
      case "decroissance":
        return formatListe(decroissanceAttendueCaracteristiques(ex));
      case "constance":
        return formatListe(constanceAttendueCaracteristiques(ex));
      case "ordonnee":
        return existeOrdonneeCaracteristiques(ex) ? `f(0) = ${formatNombre(evaluerCourbeCaracteristiques(ex, 0))}` : "n'existe pas";
      case "valeur":
        return existeValeurEnVCaracteristiques(ex) ? `f(${formatNombre(ex.v)}) = ${formatNombre(evaluerCourbeCaracteristiques(ex, ex.v))}` : "n'existe pas";
      case "asymptotes":
        return `x = ${formatNombre(ex.AV)} ; y = ${formatNombre(ex.L)}`;
    }
  }

  function validerDomaine(reponse: Morceau[]) {
    terminerEtape(soumettreReponseDomaine(etat, reponse), formatListe(reponse));
  }

  function validerZeros(reponse: ReponseZerosCaracteristiques) {
    terminerEtape(soumettreReponseZeros(etat, reponse), reponse.aucun ? "aucun" : [...reponse.valeurs].sort((a, b) => a - b).map(formatNombre).join(" ; "));
  }

  function validerCroissance(reponse: Morceau[]) {
    terminerEtape(soumettreReponseCroissance(etat, reponse), formatListe(reponse));
  }

  function validerDecroissance(reponse: Morceau[]) {
    terminerEtape(soumettreReponseDecroissance(etat, reponse), formatListe(reponse));
  }

  function validerConstance(reponse: Morceau[]) {
    terminerEtape(soumettreReponseConstance(etat, reponse), formatListe(reponse));
  }

  function validerOrdonnee(reponse: ReponseExistence) {
    terminerEtape(soumettreReponseOrdonnee(etat, reponse), reponse.existe ? `f(0) = ${formatExistence(reponse)}` : "n'existe pas");
  }

  function validerValeur(reponse: ReponseExistence) {
    terminerEtape(soumettreReponseValeur(etat, reponse), reponse.existe ? `f(${formatNombre(etat.exerciceCourant.v)}) = ${formatExistence(reponse)}` : "n'existe pas");
  }

  function validerAsymptotes(reponse: ReponseAsymptotesCaracteristiques) {
    terminerEtape(soumettreReponseAsymptotes(etat, reponse));
  }

  const exercice = etat.exerciceCourant;

  /** Bloc de données centralisé (`EnTeteExercice`) — le graphique Mafs était redessiné à l'identique
   * (même `exercice`) sur les 8 écrans (`MafsGraphCaracteristiquesFonction.tsx`, doc : "affiché en
   * permanence sur les 8 écrans, sans variation"). Le surlignage, lui, dépend de la construction en
   * cours via `ListeMorceauxInput` sur 4 des 8 écrans (domaine/croissance/decroissance/constance) —
   * son état (`liste`) est donc remonté ici plutôt que local à chaque Etape, pour rester visible au
   * moment de calculer `blocDonnees`. Reset explicite à chaque changement de phase (plutôt qu'un
   * montage/démontage de composant comme avant) : même comportement que l'ancien `useState` local,
   * qui se réinitialisait à chaque remontage d'un nouvel Etape. */
  const [liste, setListe] = useState<EtatListeMorceaux>(etatListeInitiale());
  const [phasePourListe, setPhasePourListe] = useState(etat.phase);
  if (phasePourListe !== etat.phase) {
    setPhasePourListe(etat.phase);
    setListe(etatListeInitiale());
  }

  const blocDonnees = (
    <MafsGraphCaracteristiquesFonction exercice={exercice} surlignage={PHASES_AVEC_LISTE.has(etat.phase) ? morceauxCompletsPourSurlignage(liste) : undefined} />
  );

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: !etat.reglages.affichageReponseApresEchec
          ? undefined
          : etat.phase === "domaine" ? (
              <>Domaine attendu : {formatDomaineAttendu(exercice)}</>
            ) : etat.phase === "zeros" ? (
              <>Zéros attendus : {formatZerosAttendus(exercice)}</>
            ) : etat.phase === "croissance" ? (
              <>Croissance attendue : {formatMorceaux(croissanceAttendueCaracteristiques(exercice))}</>
            ) : etat.phase === "decroissance" ? (
              <>Décroissance attendue : {formatMorceaux(decroissanceAttendueCaracteristiques(exercice))}</>
            ) : etat.phase === "constance" ? (
              <>Constance attendue : {formatMorceaux(constanceAttendueCaracteristiques(exercice))}</>
            ) : etat.phase === "ordonnee" ? (
              <>
                f(0) attendu :{" "}
                {existeOrdonneeCaracteristiques(exercice) ? formatNombre(evaluerCourbeCaracteristiques(exercice, 0)) : "n'existe pas"}
              </>
            ) : etat.phase === "valeur" ? (
              <>
                f({exercice.v}) attendu :{" "}
                {existeValeurEnVCaracteristiques(exercice)
                  ? formatNombre(evaluerCourbeCaracteristiques(exercice, exercice.v))
                  : "n'existe pas"}
              </>
            ) : (
              <>
                Asymptotes attendues : x = {exercice.AV} ; y = {exercice.L}
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
        <h1 className="app-title">Caractéristiques d'une fonction (lecture graphique)</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          {etat.phase === "domaine" ? (
            <EtapeDomaineCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              liste={liste}
              onChangeListe={setListe}
              onValider={validerDomaine}
              validation={validation}
            />
          ) : etat.phase === "zeros" ? (
            <EtapeZerosCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerZeros}
              validation={validation}
            />
          ) : etat.phase === "croissance" ? (
            <EtapeCroissanceCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              liste={liste}
              onChangeListe={setListe}
              onValider={validerCroissance}
              validation={validation}
            />
          ) : etat.phase === "decroissance" ? (
            <EtapeDecroissanceCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              liste={liste}
              onChangeListe={setListe}
              onValider={validerDecroissance}
              validation={validation}
            />
          ) : etat.phase === "constance" ? (
            <EtapeConstanceCaracteristiques
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              liste={liste}
              onChangeListe={setListe}
              onValider={validerConstance}
              validation={validation}
            />
          ) : etat.phase === "ordonnee" ? (
            <EtapeOrdonneeCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerOrdonnee}
              validation={validation}
            />
          ) : etat.phase === "valeur" ? (
            <EtapeValeurCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerValeur}
              validation={validation}
            />
          ) : (
            <EtapeAsymptotesCaracteristiques
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={validerAsymptotes}
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
