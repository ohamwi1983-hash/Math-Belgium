import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { EtapeCorrection } from "../../export/genererFeuilleExercices";
import { CorrigeDetailleEcran } from "../../components/CorrigeDetailleEcran";
import { lettreEtape, lignesDeLEtape } from "../../export/corrigeTableau";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "../../4e/ui/historiqueProgression";
import { ProgressionPuces } from "../../components/ProgressionPuces";
import { FicheReponseEcran } from "../../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { SelecteurVarianteDev } from "./SelecteurVarianteDev";
import { EnTeteExercice } from "./EnTeteExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, type EtatEcransTrig } from "../moteur5e/sessionEcransTrig";

/**
 * Coque commune des générateurs 5gen50–5gen53 (5e, chapitre 2 « Trigonométrie ») : en-tête,
 * `SelecteurVarianteDev` (toujours présent, jamais masqué), puces de progression et fiches des
 * écrans clos, transition « Écran suivant » avec corrigé détaillé de l'étape (même source que le
 * papier). Chaque appli fournit ses écrans (`rendreEcran`) : un écran appelle `conclure(correct,
 * votreReponse)` seulement pour une tentative LISIBLE (une saisie illisible n'est jamais transmise).
 * Aucun point ni pénalité affichés.
 */

export interface ContexteEcranTrig<E> {
  e: E;
  ecran: number;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  /** `explication` : texte ajouté au message d'un choix fermé faux (ce que donnerait le choix fait). */
  conclure: (correct: boolean, votreReponse: ReactNode, explication?: string) => void;
  validation: ValidationEtapeProps | null;
}

interface Props<E> {
  titre: string;
  sousTitre: string;
  /** Nom du crochet de débogage (`window.__debug5gen50`…). */
  idDebug: string;
  catalogue: { id: string; label: string }[];
  exerciceInitial: () => E;
  genererLibre: () => E;
  genererVariante: (id: string) => E;
  nombreEcrans: (e: E) => number;
  titreEcran: (e: E, ecran: number) => string;
  tentativesMax: (e: E, ecran: number) => number;
  reponseAttendue: (e: E, ecran: number) => ReactNode;
  /** Message d'un choix fermé faux (écran clos avant d'épuiser les tentatives). */
  messageRevele?: (e: E, ecran: number) => string | undefined;
  /** Figure montrée une fois l'écran clos (réussi ou révélé). */
  figureApres?: (e: E, ecran: number) => ReactNode;
  corrige: (e: E) => EtapeCorrection[];
  consigneGenerale: (e: E) => ReactNode;
  blocDonnees: (e: E, ecran: number, ecranClos: boolean, niveauAide: number) => ReactNode;
  rendreEcran: (ctx: ContexteEcranTrig<E>) => ReactNode;
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

export function CoqueTrig5e<E>(props: Props<E>) {
  const [etat, setEtat] = useState<EtatEcransTrig<E>>(() => demarrer(props.exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverte, setFicheOuverte] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const total = props.nombreEcrans(e);
  const tentativesMax = props.tentativesMax(e, ecran);

  function recommencer(exercice: E) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverte(null);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode, explication?: string) {
    const r = soumettre(etat, correct, tentativesMax);
    if (!r.clos) {
      setEtat(r.etat);
      return;
    }
    const attendue = props.reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(props.titreEcran(e, ecran), votreReponse, r.revele, etat.niveauAide > 0, attendue, corrigeDetailleEcranCourant())]);
    setEtat(r.etat);
    setEnAttente({
      revele: r.revele,
      reponseAttendue: attendue,
      messageRevele: r.revele && tentativesMax === 1 ? [props.messageRevele?.(e, ecran), explication].filter(Boolean).join(" ") || undefined : undefined,
      derniere: ecran >= total - 1,
    });
  }

  function suivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(props.genererLibre());
      return;
    }
    setEtat(ecranSuivant(etat));
    setEnAttente(null);
  }

  const modeDev = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDev) (window as unknown as Record<string, unknown>)[props.idDebug] = { exercice: e, ecran };

  /** Corrigé détaillé « comme au tableau » de l'écran en cours — UNE seule source pour la validation
   * (après la réponse) et pour l'entrée d'historique de l'étape (fiche de sa puce). */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(props.corrige(e), lettreEtape(ecran))} />;
  }

  const validation: ValidationEtapeProps | null = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: enAttente.reponseAttendue,
        labelSuivant: enAttente.derniere ? "Nouvel exercice" : "Écran suivant",
        onSuivant: suivant,
        corrigeDetaille: corrigeDetailleEcranCourant(),
        messageRevele: enAttente.messageRevele,
        figureApres: props.figureApres?.(e, ecran),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">5e — Entraînement</p>
        <h1 className="app-title">{props.titre}</h1>
        <p className="app-subtitle">{props.sousTitre}</p>
        <SelecteurVarianteDev options={props.catalogue} onGenerer={(id) => recommencer(props.genererVariante(id))} />
      </header>
      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, total, !enAttente)} onSegmentClick={(i) => setFicheOuverte(i)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={props.consigneGenerale(e)} blocDonnees={props.blocDonnees(e, ecran, !!enAttente, etat.niveauAide)} />
          <Fragment key={`${generation}-${ecran}`}>
            {props.rendreEcran({
              e,
              ecran,
              tentativesUtilisees: etat.tentativesUtilisees,
              tentativesMax,
              niveauAide: etat.niveauAide,
              onActiverAide: () => setEtat(activerAide(etat)),
              conclure,
              validation,
            })}
          </Fragment>
        </div>
      </main>
      {ficheOuverte !== null && historique[ficheOuverte] && <FicheReponseEcran entree={historique[ficheOuverte].entree} onFermer={() => setFicheOuverte(null)} />}
    </div>
  );
}
