import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceChantierTerrains } from "./core/chantierTerrains.types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceChantierTerrains } from "./generateurs/chantierTerrains";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { activerAide, demarrer, ecranSuivant, soumettre, tentativesMaxEcran, type EtatChantierTerrains } from "./moteur/sessionChantierTerrains";
import { diagnostiquerChamps, type StatutChamp } from "./moteur/verificationChantierTerrains";
import { CONSIGNE_GENERALE, NOMBRE_ECRANS, TITRES_ECRANS, ecrans, questionFragments, recitFragments, type Ecran } from "./ui/formatChantierTerrains";
import { figureChantierSvg } from "./ui/figureChantierTerrains";
import { ecranClos, segmentsDepuisHistorique, saisieEnLatex, type EcranClos } from "./ui/historiqueProgression";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { Katex } from "./components/Katex";
import { RenduFragments } from "./components/RenduFragments";
import { EtapeChampsChantier, EtapeChoixChantier } from "./components/EtapesChantierTerrains";
import { ProgressionPuces } from "../components/ProgressionPuces";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import type { ValidationEtapeProps } from "../components/ValidationEcran";

/**
 * gen88 — « Chantier et terrains : alignement, équerre, parallélisme, milieu » (4e, chapitre 6,
 * section « applications », processus 3 TRANSFÉRER). Un plan de terrain repéré en mètres, une
 * question posée avec les mots du chantier. Quatre écrans :
 * 1. choisir l'outil vectoriel caché derrière les mots (choix fermé, une tentative) ;
 * 2. calculer les composantes des vecteurs utiles ;
 * 3. appliquer le critère (déterminant, produit scalaire, demi-vecteur, égalité de vecteurs,
 *    équation du piquet) ;
 * 4. répondre dans le contexte (phrase-réponse, ou coordonnées / valeur).
 * Aucun point affiché. `?code=` (QR code d'une feuille) : première instance tirée avec les MÊMES
 * fonctions que l'adaptateur.
 */

function exerciceInitial(): ExerciceChantierTerrains {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceChantierTerrains();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceChantierTerrains, construireAvecVariante);
}

/** Saisie de l'élève pour la fiche de l'écran : KaTeX pour un nombre, texte (typographie corrigée)
 * pour une expression ou une équation avec lettre. */
function saisieLue(s: string): ReactNode {
  if (/[a-zA-Z=]/.test(s)) return s.replace(/-/g, "−").replace(/\*/g, "·").replace(/(\d)\.(\d)/g, "$1,$2");
  return saisieEnLatex(s);
}

interface TransitionEnAttente {
  revele: boolean;
  reponseAttendue: ReactNode;
  messageRevele?: string;
  derniere: boolean;
}

function reponseAttendue(def: Ecran): ReactNode {
  if (def.type === "choix") return <RenduFragments fragments={def.options[def.bonne]!} />;
  return <Katex expression={def.reponseLatex} />;
}

export function AppChantierTerrains() {
  const [etat, setEtat] = useState<EtatChantierTerrains>(() => demarrer(exerciceInitial()));
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  const [historique, setHistorique] = useState<EcranClos[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Clé des écrans : les champs repartent vides après « Générer » ou « Nouvel exercice ». */
  const [generation, setGeneration] = useState(0);
  const [statuts, setStatuts] = useState<StatutChamp[] | null>(null);
  const [erreurLecture, setErreurLecture] = useState(false);

  const e = etat.exercice;
  const ecran = etat.ecran;
  const def = ecrans(e)[ecran]!;

  function recommencer(exercice: ExerciceChantierTerrains) {
    setEtat(demarrer(exercice));
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setStatuts(null);
    setErreurLecture(false);
    setGeneration((g) => g + 1);
  }

  function conclure(correct: boolean, votreReponse: ReactNode) {
    const resultat = soumettre(etat, correct);
    setErreurLecture(false);
    if (!resultat.clos) {
      setEtat(resultat.etat);
      return;
    }
    const attendue = reponseAttendue(def);
    setHistorique((h) => [...h, ecranClos(TITRES_ECRANS[ecran]!, votreReponse, resultat.revele, etat.niveauAide > 0, attendue)]);
    setEtat(resultat.etat);
    setEnAttente({
      revele: resultat.revele,
      reponseAttendue: attendue,
      messageRevele: def.type === "choix" ? def.messageFaux : undefined,
      derniere: ecran >= NOMBRE_ECRANS - 1,
    });
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.derniere) {
      recommencer(genererExerciceChantierTerrains());
      return;
    }
    setEtat(ecranSuivant(etat));
    setStatuts(null);
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

  const communs = { niveauAide: etat.niveauAide, onActiverAide: () => setEtat(activerAide(etat)), validation, aides: def.aides, consigne: def.consigne };

  function ecranCourant(): ReactNode {
    if (def.type === "choix") {
      return <EtapeChoixChantier {...communs} options={def.options} bonne={def.bonne} onValider={(i) => conclure(i === def.bonne, <RenduFragments fragments={def.options[i]!} />)} />;
    }
    return (
      <EtapeChampsChantier
        {...communs}
        champs={def.champs}
        indication={def.indication}
        tentativesUtilisees={etat.tentativesUtilisees}
        tentativesMax={tentativesMaxEcran(e, ecran)}
        statuts={statuts}
        erreurLecture={erreurLecture}
        onValider={(saisies) => {
          const diagnostic = diagnostiquerChamps(saisies, def.champs);
          if (diagnostic.includes("parse_error")) {
            setErreurLecture(true);
            return;
          }
          setStatuts(diagnostic);
          conclure(
            diagnostic.every((s) => s === "correct"),
            <span>
              {def.champs.map((c, i) => (
                <span key={c.id} style={{ marginRight: 14, display: "inline-block" }}>
                  <RenduFragments fragments={c.libelle} /> {saisieLue(saisies[i]!)}
                </span>
              ))}
            </span>,
          );
        }}
      />
    );
  }

  const blocDonnees = (
    <>
      <p style={{ margin: "6px 0" }}>
        <RenduFragments fragments={recitFragments(e)} />
      </p>
      <p style={{ margin: "6px 0", fontWeight: 600 }}>
        <RenduFragments fragments={questionFragments(e)} />
      </p>
      <div style={{ margin: "8px 0 0" }} dangerouslySetInnerHTML={{ __html: figureChantierSvg(e) }} />
    </>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Chantier et terrains : alignement, équerre, parallélisme, milieu</h1>
        <p className="app-subtitle">Chapitre 6 — Calcul vectoriel</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => recommencer(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segmentsDepuisHistorique(historique, NOMBRE_ECRANS, !enAttente)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />

        <div className="card-body">
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={blocDonnees} />
          <Fragment key={`${generation}-${ecran}`}>{ecranCourant()}</Fragment>
          {enAttente?.derniere && (
            <div style={{ marginTop: 16 }}>
              <p className="prompt-text" style={{ marginBottom: 6 }}>
                Le plan avec les vecteurs utiles :
              </p>
              <div dangerouslySetInnerHTML={{ __html: figureChantierSvg(e, true) }} />
            </div>
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex].entree} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
