import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import { correctionDetailleePositionsPlans } from "./generateurs/positionsPlans/corrigeDetaille";
import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDeuxPlans, ExercicePositionsPlans } from "./core/positionsPlans.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePositionsPlans } from "./generateurs/positionsPlans";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, nombreEcrans, type EtatPositionsPlans } from "./moteur/sessionPositionsPlans";
import {
  conclusionTroisPlans,
  descriptionPlan,
  droitePaire,
  ecransExercice,
  elementsFigureFinale,
  enonce,
  estCommun,
  explicationEcran1,
  legendeFigureFinale,
  libellePaire,
  minusculeInitiale,
  nomPlan,
  paireCorrecte,
  raisonCandidat,
  reponseEcran,
} from "./ui/formatPositionsPlans";
import { COULEURS_PLANS, figurePositionsPlansSvg } from "./ui/figurePositionsPlans";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { EtapeChoixPlans, EtapePointsCommuns } from "./components/EtapesPositionsPlans";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen101 — « Positions de deux plans et de trois plans » (4e, chapitre 8 « Géométrie dans
 * l'espace », section `trois-plans`, couvre aussi `deux-plans`, processus 2 APPLIQUER). Deux
 * variantes :
 * - deux plans : parallèles / confondus / sécants (UNE tentative), puis deux points communs (la
 *   droite d'intersection se trace) ou la justification ;
 * - trois plans : un seul point commun / une droite commune / aucun point commun (UNE tentative),
 *   puis la justification.
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExercicePositionsPlans {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExercicePositionsPlans();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExercicePositionsPlans, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele: string;
  derniere: boolean;
  /** Paire confirmée de l'écran « deux points communs » (celle de l'élève si juste, sinon la paire
   * révélée) — sert à la figure finale. */
  paire: [number, number] | null;
}

function conclusionJustification(e: ExercicePositionsPlans): string {
  if (e.variante === "trois-plans") return conclusionTroisPlans(e);
  if (e.position === "paralleles") return `Deux droites sécantes de ${nomPlan(e, 0)} sont parallèles à deux droites de ${nomPlan(e, 1)} : les plans sont parallèles.`;
  const description = descriptionPlan(e, 0);
  return `Trois points non alignés de ${nomPlan(e, 1)} sont dans ${nomPlan(e, 0)} : c'est le même plan${description ? `, ${description}` : ""}.`;
}

function explicationJustification(e: ExercicePositionsPlans, choix: string): string[] {
  const valide = e.justifications.find((j) => j.valide)!;
  const choisie = e.justifications[Number(choix)]!;
  if (choisie.valide) return [`C'est la bonne justification. ${conclusionJustification(e)}`];
  return [`« ${choisie.texte} » ne convient pas : ${minusculeInitiale(choisie.defaut)}`,`La justification valable : ${valide.texte}`, conclusionJustification(e)];
}

function explicationPoints(e: ExerciceDeuxPlans, paire: [number, number]): string[] {
  if (paireCorrecte(e, paire[0], paire[1])) {
    return [...paire.map((i) => raisonCandidat(e, e.candidats[i]!)), `La droite d'intersection des deux plans passe par ces deux points : c'est ${droitePaire(e, paire)}.`];
  }
  const lignes: string[] = [];
  if (paire.every((i) => estCommun(e, e.candidats[i]!))) lignes.push("Ces deux points sont confondus : il faut deux points DISTINCTS.");
  for (const i of paire) if (!estCommun(e, e.candidats[i]!)) lignes.push(raisonCandidat(e, e.candidats[i]!));
  const attendue = e.paireAttendue!;
  lignes.push(`Par exemple, ${libellePaire(e, attendue)} conviennent :`);
  for (const i of attendue) lignes.push(raisonCandidat(e, e.candidats[i]!));
  lignes.push(`La droite d'intersection est ${droitePaire(e, attendue)}.`);
  return lignes;
}

function Legende({ e }: { e: ExercicePositionsPlans }) {
  return (
    <p style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", justifyContent: "center", margin: "4px 0 0", fontWeight: 600 }}>
      {e.plans.map((_, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span aria-hidden="true" style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3, background: COULEURS_PLANS[i], opacity: 0.75 }} />
          plan {nomPlan(e, i)}
        </span>
      ))}
    </p>
  );
}

export function AppPositionsPlans() {
  const [etat, setEtat] = useState<EtatPositionsPlans>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les choix repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const ecrans = ecransExercice(e);
  const total = nombreEcrans(e);
  const courant = ecrans[ecran]!;

  function recommencer(exercice: ExercicePositionsPlans) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode, paire: [number, number] | null) {
    const attendue = <p style={{ margin: 0 }}>{reponseEcran(e, ecran)}</p>;
    setHistorique((h) => [...h, ecranClos(courant.titre, votreReponse, !correct, etat.niveauAide > 0, attendue, corrigeDetailleEcranCourant(paire))]);
    setEnAttente({
      revele: !correct,
      reponseAttendue: attendue,
      messageRevele: ecran === 0 ? "Ce n'était pas la bonne réponse." : courant.genre === "points" ? "Ce n'était pas une bonne paire de points." : "Ce n'était pas la bonne justification.",
      derniere: ecran >= total - 1,
      paire,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExercicePositionsPlans());
      return;
    }
    setEtat(ecranSuivant(etat));
    setEnAttente(null);
  }

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). `paire` : la paire
   * de points choisie par l'élève sur cet écran (ou `null`). */
  function corrigeDetailleEcranCourant(paire: [number, number] | null) {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(correctionDetailleePositionsPlans(e, paire), lettreEtape(ecran))} />;
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
        messageRevele: enAttente.messageRevele,
        corrigeDetaille: corrigeDetailleEcranCourant(enAttente.paire),
      }
    : null;

  const communs = { aides: courant.aides, niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  const figureFinale = enAttente?.derniere ? figurePositionsPlansSvg(e, { mode: "ecran", ...elementsFigureFinale(e, enAttente.paire) }) : null;
  const figure = figureFinale ?? figurePositionsPlansSvg(e, { mode: "ecran" });

  function ecranCourant(): ReactNode {
    if (courant.genre === "points" && e.variante === "deux-plans") {
      return (
        <EtapePointsCommuns
          {...communs}
          consigne={courant.consigne}
          candidats={e.candidats}
          estCommun={(i) => estCommun(e, e.candidats[i]!)}
          explication={(paire) => explicationPoints(e, paire)}
          onValider={(paire) => {
            const juste = paireCorrecte(e, paire[0], paire[1]);
            conclure(juste, <p style={{ margin: 0 }}>{libellePaire(e, paire)}</p>, juste ? paire : e.paireAttendue);
          }}
        />
      );
    }
    if (courant.genre !== "choix") return null;
    return (
      <EtapeChoixPlans
        {...communs}
        consigne={courant.consigne}
        etiquette={courant.titre}
        options={courant.options}
        attendue={courant.attendue}
        explication={(choix) => (ecran === 0 ? [explicationEcran1(e)] : explicationJustification(e, choix))}
        onValider={(id) => conclure(id === courant.attendue, <p style={{ margin: 0 }}>{courant.options.find((o) => o.id === id)!.texte}</p>, null)}
      />
    );
  }

  const blocDonnees = (
    <>
      <div style={{ maxWidth: 460, margin: "8px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />
      <Legende e={e} />
      {figureFinale && (
        <p style={{ margin: "6px 0 0", fontSize: "0.92em", textAlign: "center" }}>
          {legendeFigureFinale(e)}
        </p>
      )}
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Positions de deux plans et de trois plans</h1>
        <p className="app-subtitle">Chapitre 8 — Géométrie dans l'espace</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={enonce(e)} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
