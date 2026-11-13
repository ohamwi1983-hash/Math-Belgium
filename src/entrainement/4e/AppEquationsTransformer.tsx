import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceEquationsTransformer } from "./core/equationsTransformer.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquationsTransformer } from "./generateurs/equationsTransformer";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, TENTATIVES_MAX, type EtatEquationsTransformer } from "./moteur/sessionEquationsTransformer";
import { ecransDe } from "./moteur/modeleEquationsTransformer";
import { diagnostiquerBases, diagnostiquerEnsemble, diagnostiquerReference, diagnostiquerSolutions, lireAngle, type Diagnostic } from "./moteur/verificationEquationsTransformer";
import {
  CONSIGNE_GENERALE,
  DOMAINE_LATEX,
  aidesEcran,
  angleLatex,
  baseLatex,
  consigneEcran,
  enonceLatex,
  referenceAffichee,
  reponseAttendueFragments,
  titreEcran,
} from "./ui/formatEquationsTransformer";
import { ecranClos, saisieEnLatex, segmentsDepuisHistorique, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeBases, EtapeListeSolutions, EtapeReference, RappelBase, niveauAideMax } from "./components/EtapesEquationsTransformer";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen78 — « Équations trigonométriques à transformer » (4e, chapitre 5, section `equations`,
 * processus 2 APPLIQUER). Prolonge gen18 : a·f(α) + b = c, a·f²(α) + b = c, produit nul. Écrans :
 * 1. équation(s) de base (valeurs exactes ; pour le carré, verdict « pas de solution » possible) ;
 * 2. pour chaque équation de base : angle de référence (verdict + α₀), puis ses solutions (cercle
 *    de gen18 en aide) ;
 * 3. s'il y a plusieurs équations de base : l'ensemble des solutions.
 * Choix fermés : une tentative ; champs : 3 tentatives ; saisie illisible : aucune tentative
 * consommée. Aucun point affiché. `?code=` : première instance tirée avec les MÊMES fonctions que
 * l'adaptateur.
 */

function exerciceInitial(): ExerciceEquationsTransformer {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceEquationsTransformer();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceEquationsTransformer, construireAvecVariante);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

const MESSAGE_ILLISIBLE = "Une valeur n'est pas lisible : écris un nombre, une fraction comme 1/2 ou une racine comme √3/2. Aucune tentative n'est comptée.";

export function AppEquationsTransformer() {
  const [etat, setEtat] = useState<EtatEquationsTransformer>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const e = etat.exercice;
  const ecrans = ecransDe(e);
  const ecran = ecrans[etat.ecran]!;
  const aides = aidesEcran(e, ecran);
  const avecCercle = ecran.type === "solutions";

  function recommencer(exercice: ExerciceEquationsTransformer) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setMessage(null);
    setGeneration((g) => g + 1);
  }

  function conclure(d: Diagnostic, votreReponse: ReactNode) {
    if (d.statut === "parse_error") {
      setMessage(MESSAGE_ILLISIBLE);
      return;
    }
    const correct = d.statut === "correct";
    const resultat = soumettre(etat, correct, d.verdictFaux);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      setMessage(`Incorrect — tentative ${resultat.etat.tentativesUtilisees}/${TENTATIVES_MAX}, réessaie.`);
      return;
    }
    setMessage(null);
    const attendue = <RenduFragments fragments={reponseAttendueFragments(e, ecran)} />;
    setHistorique((h) => [...h, ecranClos(titreEcran(e, ecran), votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: d.verdictFaux ? "Ce n'était pas le bon choix." : undefined,
      derniere: etat.ecran >= ecrans.length - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceEquationsTransformer());
      return;
    }
    setEtat(ecranSuivant(etat));
    setMessage(null);
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

  const communs = {
    consigne: <RenduFragments fragments={consigneEcran(e, ecran)} />,
    aides,
    niveauAide: etat.niveauAide,
    onActiverAide: () => setEtat(activerAide(etat, niveauAideMax(aides, avecCercle))),
    tentativesUtilisees: etat.tentativesUtilisees,
    tentativesMax: TENTATIVES_MAX,
    message,
    validation,
  };

  function ecranCourant(): ReactNode {
    switch (ecran.type) {
      case "bases": {
        const f = e.forme;
        const fonctions = f.type === "affine" ? [f.membre.fonction] : f.type === "carre" ? [f.membre.fonction] : e.bases.map((b) => b.fonction);
        return (
          <EtapeBases
            {...communs}
            fonctions={fonctions}
            carre={f.type === "carre"}
            onValider={(aucune, valeurs) => {
              const d = diagnostiquerBases(e, aucune, valeurs);
              const reponse = aucune ? (
                "Pas de solution"
              ) : (
                <span>
                  {valeurs.map((v, i) => (
                    <Fragment key={i}>
                      {i > 0 && " ou "}
                      <Katex expression={`\\${fonctions[Math.min(i, fonctions.length - 1)]}\\alpha =`} /> {saisieEnLatex(v)}
                    </Fragment>
                  ))}
                </span>
              );
              conclure(d, reponse);
            }}
          />
        );
      }
      case "reference": {
        const b = e.bases[ecran.base]!;
        return (
          <EtapeReference
            {...communs}
            rappel={<RappelBase base={baseLatex(b)} />}
            onValider={(aucune, valeur) => {
              const v = lireAngle(valeur);
              conclure(diagnostiquerReference(e, ecran.base, aucune, valeur), aucune ? "Pas de solution" : <Katex expression={`\\alpha_0 = ${v === null ? "?" : angleLatex(v)}`} />);
            }}
          />
        );
      }
      case "solutions": {
        const b = e.bases[ecran.base]!;
        return (
          <EtapeListeSolutions
            {...communs}
            cercle={{ fonction: b.fonction, solutions: b.solutions }}
            rappel={<RappelBase base={baseLatex(b)} referenceLatex={`\\alpha_0 ${b.k.decimal ? "\\approx" : "="} ${angleLatex(referenceAffichee(b))}`} />}
            onValider={(valeurs) => {
              const lus = valeurs.map(lireAngle);
              conclure(diagnostiquerSolutions(e, ecran.base, valeurs), <Katex expression={lus.map((v) => `\\alpha = ${v === null ? "?" : angleLatex(v)}`).join("\\text{ ou }")} />);
            }}
          />
        );
      }
      case "ensemble":
        return (
          <EtapeListeSolutions
            {...communs}
            rappel={
              <div className="equation-box">
                {e.bases.map((b, i) => (
                  <Katex key={i} expression={baseLatex(b)} block />
                ))}
              </div>
            }
            onValider={(valeurs) => {
              const lus = valeurs.map(lireAngle);
              conclure(diagnostiquerEnsemble(e, valeurs), <Katex expression={lus.map((v) => `\\alpha = ${v === null ? "?" : angleLatex(v)}`).join("\\text{ ou }")} />);
            }}
          />
        );
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Équations trigonométriques à transformer</h1>
        <p className="app-subtitle">Chapitre 5 — Cercle trigonométrique et triangles quelconques</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, ecrans.length, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice
            consigneGenerale={CONSIGNE_GENERALE}
            blocDonnees={
              <div className="equation-box">
                <Katex expression={enonceLatex(e)} block />
                <Katex expression={`\\alpha \\in ${DOMAINE_LATEX}`} block />
                {e.calculatrice && <p style={{ margin: "4px 0 0", fontSize: "0.9em" }}>Calculatrice autorisée : angles au dixième de degré.</p>}
              </div>
            }
          />
          <Fragment key={`${generation}-${etat.ecran}`}>{ecranCourant()}</Fragment>
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
