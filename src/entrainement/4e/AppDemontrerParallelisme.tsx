import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDemontrerParallelisme } from "./core/demontrerParallelisme.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDemontrerParallelisme } from "./generateurs/demontrerParallelisme";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, nombreEcrans, type EtatDemontrerParallelisme } from "./moteur/sessionDemontrerParallelisme";
import {
  conclusionCritere,
  conclusionJustification,
  consigneGlobale,
  ecransExercice,
  elementsFigure,
  enonce,
  explicationOption,
  explicationPaires,
  explicationTemoin,
  legendeFigure,
  libelle,
  libelleCandidat,
  nomP,
  paireCorrecte,
  reponseEcran,
} from "./ui/formatDemontrerParallelisme";
import { COULEUR_DROITE, COULEURS_PLANS, figurePositionsPlansSvg } from "./ui/figurePositionsPlans";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { EtapeChoixPlans } from "./components/EtapesPositionsPlans";
import { EtapeDeuxChoix } from "./components/EtapesDemontrerParallelisme";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen103 — « Démontrer un parallélisme » (4e, chapitre 8 « Géométrie dans l'espace », section
 * `parallelisme`, processus 3 TRANSFÉRER). Deux variantes :
 * - droite parallèle à un plan : critère, droite témoin, justification (3 écrans) ;
 * - deux plans parallèles : critère, deux parallélismes à droites sécantes, deux justifications
 *   (4 écrans).
 * Tous les écrans sont des choix fermés (UNE tentative). La droite témoin (ou les deux parallélismes)
 * se trace sur la figure une fois l'écran 2 clos ; à la fin, les sections complètes des plans. Aucun
 * point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES fonctions
 * que l'adaptateur.
 */

function exerciceInitial(): ExerciceDemontrerParallelisme {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDemontrerParallelisme();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDemontrerParallelisme, construireAvecVariante);
}

type Temoins = number | [number, number] | null;

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele: string;
  derniere: boolean;
}

function Legende({ e }: { e: ExerciceDemontrerParallelisme }) {
  const pastille = (couleur: string, rond = false) => (
    <span aria-hidden="true" style={{ display: "inline-block", width: 14, height: rond ? 4 : 14, borderRadius: 3, background: couleur, opacity: rond ? 1 : 0.75 }} />
  );
  return (
    <p style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", justifyContent: "center", margin: "4px 0 0", fontWeight: 600 }}>
      {e.variante === "droite-plan" && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {pastille(COULEUR_DROITE, true)}
          droite {libelle(e.droite)}
        </span>
      )}
      {e.plans.map((_, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {pastille(COULEURS_PLANS[i]!)}
          plan {nomP(e, i)}
        </span>
      ))}
    </p>
  );
}

export function AppDemontrerParallelisme() {
  const [etat, setEtat] = useState<EtatDemontrerParallelisme>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Droite(s) témoin(s) confirmée(s) à l'écran 2 : celles de l'élève si justes, sinon les attendues. */
  const [temoins, setTemoins] = useState<Temoins>(null);
  /** Clé des écrans : les choix repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const paires = Array.isArray(temoins) ? temoins : null;
  const ecrans = ecransExercice(e, paires);
  const total = nombreEcrans(e);
  const courant = ecrans[ecran]!;

  function recommencer(exercice: ExerciceDemontrerParallelisme) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setTemoins(null);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode, attendueTexte: string, messageRevele: string) {
    const attendue = <p style={{ margin: 0 }}>{attendueTexte}</p>;
    setHistorique((h) => [...h, ecranClos(courant.titre, votreReponse, !correct, etat.niveauAide > 0, attendue)]);
    setEnAttente({ revele: !correct, reponseAttendue: attendue, messageRevele, derniere: ecran >= total - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDemontrerParallelisme());
      return;
    }
    setEtat(ecranSuivant(etat));
    setEnAttente(null);
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
      }
    : null;

  const communs = { aides: courant.aides, niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };
  const fin = !!enAttente?.derniere;
  const elements = elementsFigure(e, temoins, fin);
  const figure = figurePositionsPlansSvg(e, { mode: "ecran", ...elements });
  const legende = legendeFigure(e, temoins, fin);

  function ecranCourant(): ReactNode {
    if (courant.genre === "paires" && e.variante === "deux-plans") {
      return (
        <EtapeDeuxChoix
          {...communs}
          consigne={courant.consigne}
          etiquette={courant.titre}
          options={e.candidats.map(libelleCandidat)}
          estValable={(i) => e.candidats[i]!.defaut === null}
          explication={(paire) => explicationPaires(e, paire)}
          onValider={(paire) => {
            const juste = paireCorrecte(e, paire[0], paire[1]);
            setTemoins(juste ? paire : e.paireAttendue);
            conclure(juste, <p style={{ margin: 0 }}>{paire.map((i) => libelleCandidat(e.candidats[i]!)).join(" et ")}</p>, reponseEcran(e, 1), "Ce n'étaient pas deux bons parallélismes.");
          }}
        />
      );
    }
    if (courant.genre !== "choix") return null;
    const explication = (choix: string): string[] => {
      if (ecran === 0) return explicationOption(e.criteres, choix, conclusionCritere(e));
      if (e.variante === "droite-plan") return ecran === 1 ? explicationTemoin(e, choix) : explicationOption(e.justifications, choix, conclusionJustification(e, 1));
      const [a, b] = paires ?? e.paireAttendue;
      const c = e.candidats[ecran === 2 ? a : b]!;
      return explicationOption(c.justifications, choix, conclusionJustification(e, ecran - 1));
    };
    const message = ecran === 0 ? "Ce n'était pas le bon critère." : e.variante === "droite-plan" && ecran === 1 ? "Ce n'était pas une droite témoin." : "Ce n'était pas la bonne justification.";
    return (
      <EtapeChoixPlans
        {...communs}
        consigne={courant.consigne}
        etiquette={courant.titre}
        options={courant.options}
        attendue={courant.attendue}
        explication={explication}
        onValider={(id) => {
          if (e.variante === "droite-plan" && ecran === 1) setTemoins(e.temoin);
          conclure(id === courant.attendue, <p style={{ margin: 0 }}>{courant.options.find((o) => o.id === id)!.texte}</p>, reponseEcran(e, ecran, paires), message);
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <div style={{ maxWidth: 460, margin: "8px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />
      <Legende e={e} />
      {legende && <p style={{ margin: "6px 0 0", fontSize: "0.92em", textAlign: "center" }}>{legende}</p>}
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Démontrer un parallélisme</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={`${enonce(e)} ${consigneGlobale(e)}`} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
