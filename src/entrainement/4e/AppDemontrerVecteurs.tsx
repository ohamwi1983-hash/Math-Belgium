import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDemontrerVecteurs, IdBase, IdConclusion } from "./core/demontrerVecteurs.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDemontrerVecteurs } from "./generateurs/demontrerVecteurs";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatDemontrerVecteurs } from "./moteur/sessionDemontrerVecteurs";
import {
  diagnostiquerColinearite,
  diagnostiquerExpressions,
  lireRationnel,
  verifierBase,
  verifierConclusion,
  type SaisieVecteur,
} from "./moteur/verificationDemontrerVecteurs";
import { coefficientsVecteur, egaux } from "./moteur/modeleDemontrerVecteurs";
import {
  CONSIGNE_GENERALE,
  NOMBRE_ECRANS,
  TITRES_ECRANS,
  aDemontrerFragments,
  aidesBase,
  aidesColinearite,
  aidesConclusion,
  aidesExpressions,
  baseLatex,
  combinaisonLatex,
  conclusionFragments,
  consignesEcrans,
  enonceFragments,
  expressionVecteurLatex,
  messageBase,
  messageColinearite,
  messageConclusion,
  messageVecteur,
  relationColineariteLatex,
  uLatex,
  vLatex,
  vecLatex,
  type StatutVecteur,
} from "./ui/formatDemontrerVecteurs";
import { construireFigureDemontrerVecteurs } from "./ui/figureDemontrerVecteurs";
import { ecranClos, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChoixDemontrerVecteurs, EtapeCoefficientDemontrerVecteurs, EtapeExpressionsDemontrerVecteurs } from "./components/EtapesDemontrerVecteurs";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";

/**
 * gen85 — « Démontrer avec des vecteurs » (4e, chapitre 6, section « colinearite », processus 3
 * TRANSFÉRER). Raisonnement vectoriel SANS repère : une figure de base (parallélogramme, triangle,
 * trapèze) et deux points E, F définis par des relations ; on démontre un alignement, un
 * parallélisme, un milieu ou un parallélogramme. Quatre écrans :
 * 1. choisir une base adaptée (choix fermé, une tentative : une base colinéaire, une base possible
 *    mais maladroite) ;
 * 2. exprimer les deux vecteurs utiles dans cette base (Chasles ; coefficients exacts, fractions) ;
 * 3. trouver k tel que v = k·w (proportionnalité des coefficients) ;
 * 4. choisir la conclusion correcte, qui cite la propriété (choix fermé, une tentative).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceDemontrerVecteurs {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceDemontrerVecteurs();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceDemontrerVecteurs, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function expressionsAttendues(e: ExerciceDemontrerVecteurs): ReactNode {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <Katex expression={expressionVecteurLatex(e, e.w)} />
      <Katex expression={expressionVecteurLatex(e, e.v)} />
    </div>
  );
}

function reponseAttendue(e: ExerciceDemontrerVecteurs, ecran: number): ReactNode {
  if (ecran === 0) return <Katex expression={baseLatex(e.bases.find((b) => b.id === "adaptee")!)} />;
  if (ecran === 1) return expressionsAttendues(e);
  if (ecran === 2) return <Katex expression={relationColineariteLatex(e)} />;
  return <RenduFragments fragments={conclusionFragments(e, "juste")} />;
}

export function AppDemontrerVecteurs() {
  const [etat, setEtat] = useState<EtatDemontrerVecteurs>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [messages, setMessages] = useState<FragmentConsigne[][]>([]);
  const [champsFaux, setChampsFaux] = useState<boolean[][] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;

  function recommencer(exercice: ExerciceDemontrerVecteurs) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setMessages([]);
    setChampsFaux(null);
    setErreurLecture(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode, messageRevele?: string) {
    const resultat = soumettre(etat, correct);
    setErreurLecture(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(e, ecran);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({ revele: resultat.revele, reponseAttendue: attendue, messageRevele, derniere: ecran >= NOMBRE_ECRANS - 1 });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceDemontrerVecteurs());
      return;
    }
    setEtat(ecranSuivant(etat));
    setMessages([]);
    setChampsFaux(null);
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

  // Les vecteurs utiles apparaissent sur la figure une fois exprimés (écran 2 clos), jamais avant.
  const clos = historique.length;
  const figure = useMemo(() => construireFigureDemontrerVecteurs(e, { theme: "ecran", vecteurs: clos >= 2 }), [e, clos]);

  const consigne = <RenduFragments fragments={consignesEcrans(e)[ecran]!} />;
  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation };

  function ecranCourant(): ReactNode {
    if (ecran === 0) {
      return (
        <EtapeChoixDemontrerVecteurs<IdBase>
          {...communs}
          aides={aidesBase(e)}
          consigne={consigne}
          options={e.bases.map((b) => ({ id: b.id, contenu: [{ type: "latex", valeur: baseLatex(b) }] }))}
          attendu="adaptee"
          onValider={(id) => conclure(verifierBase(id), <Katex expression={baseLatex(e.bases.find((b) => b.id === id)!)} />, messageBase(id))}
        />
      );
    }
    if (ecran === 1) {
      const vecteurs = [e.w, e.v];
      return (
        <EtapeExpressionsDemontrerVecteurs
          {...communs}
          aides={aidesExpressions(e)}
          consigne={consigne}
          vecteurs={[vecLatex(e.w), vecLatex(e.v)]}
          u={uLatex()}
          v={vLatex(e)}
          tentativesUtilisees={etat.tentativesUtilisees}
          tentativesMax={tentativesMaxEcran(ecran)}
          champsFaux={champsFaux}
          messages={messages}
          erreurLecture={erreurLecture}
          onValider={(saisies: [SaisieVecteur, SaisieVecteur]) => {
            const diagnostic = diagnostiquerExpressions(e, saisies);
            if (diagnostic.includes("parse_error")) {
              setErreurLecture(true);
              return;
            }
            const statuts = diagnostic as StatutVecteur[];
            setMessages(statuts.map((s, i) => (s === "correct" ? null : messageVecteur(vecteurs[i]!, s))).filter((m): m is FragmentConsigne[] => m !== null));
            setChampsFaux(
              saisies.map((s, i) => {
                const attendu = coefficientsVecteur(e, vecteurs[i]!);
                return [!egaux(lireRationnel(s.x)!, attendu.x), !egaux(lireRationnel(s.y)!, attendu.y)];
              }),
            );
            const lus = saisies.map((s) => ({ x: lireRationnel(s.x)!, y: lireRationnel(s.y)! }));
            conclure(
              statuts.every((s) => s === "correct"),
              <div style={{ display: "grid", gap: 4 }}>
                {lus.map((c, i) => (
                  <Katex key={i} expression={`${vecLatex(vecteurs[i]!)} = ${combinaisonLatex(c, uLatex(), vLatex(e))}`} />
                ))}
              </div>,
            );
          }}
        />
      );
    }
    if (ecran === 2) {
      return (
        <EtapeCoefficientDemontrerVecteurs
          {...communs}
          aides={aidesColinearite(e)}
          consigne={consigne}
          rappel={[{ type: "texte", valeur: "On a obtenu : " }, { type: "latex", valeur: expressionVecteurLatex(e, e.w) }, { type: "texte", valeur: " et " }, { type: "latex", valeur: expressionVecteurLatex(e, e.v) }, { type: "texte", valeur: "." }]}
          avant={vecLatex(e.v)}
          apres={`\\cdot ${vecLatex(e.w)}`}
          tentativesUtilisees={etat.tentativesUtilisees}
          tentativesMax={tentativesMaxEcran(ecran)}
          messages={messages}
          erreurLecture={erreurLecture}
          onValider={(texte: string) => {
            const statut = diagnostiquerColinearite(e, texte);
            if (statut === "parse_error") {
              setErreurLecture(true);
              return;
            }
            setMessages(statut === "correct" ? [] : [messageColinearite(e, statut)]);
            conclure(statut === "correct", <Katex expression={relationColineariteLatex(e, lireRationnel(texte)!)} />);
          }}
        />
      );
    }
    return (
      <EtapeChoixDemontrerVecteurs<IdConclusion>
        {...communs}
        aides={aidesConclusion(e)}
        consigne={consigne}
        longues
        options={e.ordreConclusions.map((id) => ({ id, contenu: conclusionFragments(e, id) }))}
        attendu="juste"
        onValider={(id) => conclure(verifierConclusion(id), <RenduFragments fragments={conclusionFragments(e, id)} />, messageConclusion(e, id))}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={enonceFragments(e)} />
      </p>
      <div className="demontrer-vecteurs-figure" style={{ maxWidth: 420, margin: "10px auto 0" }} dangerouslySetInnerHTML={{ __html: figure }} />
      <p style={{ margin: "8px 0 0", fontWeight: 600 }}>
        <RenduFragments fragments={aDemontrerFragments(e)} />
      </p>
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Démontrer avec des vecteurs</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
