import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceChoisirModele } from "./generateurs/choisirModele/types";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceChoisirModele } from "./generateurs/choisirModele";
import { modeleLatex } from "./generateurs/choisirModele/modele";
import {
  aidesEcran1,
  aidesEcran2,
  aidesEcran3,
  aidesEcran4,
  aidesEcran5,
  champsEcran4,
  CONSIGNE_FAMILLES,
  justificationSens,
  NOM_FAMILLE,
  QUESTION_ECRAN_1,
  QUESTION_ECRAN_2,
  questionEcran3,
  questionEcran4,
  questionEcran5,
  REFERENCE_LATEX,
  reponseUtilisationLatex,
  situation,
  transformationsLatex,
} from "./generateurs/choisirModele/textes";
import { construireFigureModele, PALETTE_ECRAN } from "./generateurs/choisirModele/figure";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import type { EntreeRecapitulatif } from "./ui/recapitulatif";
import { Katex } from "./components/Katex";
import {
  EtapeExpressionModele,
  EtapeFamilleModele,
  EtapeSensModele,
  EtapeTransformationsModele,
  EtapeUtilisationModele,
  RenduFragments,
} from "./components/EtapesChoisirModele";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";

/**
 * gen69 — « Choisir le bon modèle » (4e, chapitre 3, section `transformer`, processus 3
 * TRANSFÉRER). Une situation, une courbe issue d'une fonction de référence transformée, 5 écrans :
 * 1. la famille (choix fermé, une seule tentative) ;
 * 2. les transformations (TH, TV, facteur vertical, symétrie) ;
 * 3. l'expression du modèle, vérifiée par équivalence ;
 * 4. l'utilisation du modèle (prédire une valeur ou résoudre une équation) ;
 * 5. le sens d'un paramètre en contexte (choix fermé, une seule tentative).
 * Ni points ni pénalités affichés ; aides graduées sans la réponse. Le premier exercice d'une URL
 * `?code=` est celui de la feuille imprimée (mêmes fonctions de tirage que `exportEvaluation.ts`).
 */

type Ecran = 0 | 1 | 2 | 3 | 4;
const NB_ECRANS = 5;
/** Tentatives par écran : une seule sur les choix fermés (écrans 1 et 5). */
const TENTATIVES_MAX: Record<Ecran, number> = { 0: 1, 1: 3, 2: 3, 3: 3, 4: 1 };
const TITRES = ["Famille", "Transformations", "Modèle", "Utiliser le modèle", "Sens d'un paramètre"];

interface EtatEcran {
  tentatives: number;
  aide: number;
}

interface Cloture {
  correcte: boolean;
  aide: boolean;
}

interface EnAttente {
  revele: boolean;
}

function exerciceInitial(): ExerciceChoisirModele {
  const code = lireCodeDepuisUrl();
  if (!code) return genererExerciceChoisirModele();
  return genererAvecCode(code, CATALOGUE_VARIANTES, genererExerciceChoisirModele, construireAvecVariante);
}

const ETATS_VIDES = (): EtatEcran[] => Array.from({ length: NB_ECRANS }, () => ({ tentatives: 0, aide: 0 }));

/** Réponse attendue de chaque écran (réponse révélée, fiche d'historique). */
function reponseAttendue(e: ExerciceChoisirModele, ecran: Ecran): ReactNode {
  switch (ecran) {
    case 0:
      return (
        <p>
          {NOM_FAMILLE[e.famille]} : <Katex expression={REFERENCE_LATEX[e.famille]} />
        </p>
      );
    case 1:
      return <Katex expression={transformationsLatex(e)} block />;
    case 2:
      return <Katex expression={modeleLatex(e)} block />;
    case 3:
      return <Katex expression={reponseUtilisationLatex(e)} block />;
    case 4: {
      const bonne = e.options5.find((o) => o.correcte);
      return (
        <>
          <p>{bonne && <RenduFragments fragments={bonne.fragments} />}</p>
          <p>
            <RenduFragments fragments={justificationSens(e)} />
          </p>
        </>
      );
    }
  }
}

function recapitulatif(e: ExerciceChoisirModele, clotures: (Cloture | null)[]): EntreeRecapitulatif[] {
  const entrees: EntreeRecapitulatif[] = [];
  const valeurs = [REFERENCE_LATEX[e.famille], transformationsLatex(e), modeleLatex(e), reponseUtilisationLatex(e)];
  const libelles = ["Fonction de référence", "Transformations", "Modèle", "Réponse"];
  for (let i = 0; i < 4; i++) {
    const c = clotures[i];
    if (c) entrees.push({ libelle: libelles[i], valeur: valeurs[i], estLatex: true, revele: !c.correcte });
  }
  return entrees;
}

export function AppChoisirModele() {
  const [exercice, setExercice] = useState<ExerciceChoisirModele>(exerciceInitial);
  const [ecran, setEcran] = useState<Ecran>(0);
  const [etats, setEtats] = useState<EtatEcran[]>(ETATS_VIDES);
  const [clotures, setClotures] = useState<(Cloture | null)[]>(() => Array(NB_ECRANS).fill(null));
  const [historique, setHistorique] = useState<(EntreeHistoriqueEtape | null)[]>(() => Array(NB_ECRANS).fill(null));
  const [ficheOuverte, setFicheOuverte] = useState<number | null>(null);
  const [enAttente, setEnAttente] = useState<EnAttente | null>(null);
  /** Dans la `key` des écrans : un nouvel exercice vide tous les champs. */
  const [generation, setGeneration] = useState(0);

  function nouvelExercice(suivant: ExerciceChoisirModele) {
    setExercice(suivant);
    setEcran(0);
    setEtats(ETATS_VIDES());
    setClotures(Array(NB_ECRANS).fill(null));
    setHistorique(Array(NB_ECRANS).fill(null));
    setFicheOuverte(null);
    setEnAttente(null);
    setGeneration((g) => g + 1);
  }

  function activerAide() {
    setEtats((liste) => liste.map((et, i) => (i === ecran ? { ...et, aide: et.aide + 1 } : et)));
  }

  function onResultat(correct: boolean, votreReponse: ReactNode) {
    const etat = etats[ecran];
    const tentatives = correct ? etat.tentatives : etat.tentatives + 1;
    setEtats((liste) => liste.map((et, i) => (i === ecran ? { ...et, tentatives } : et)));
    if (!correct && tentatives < TENTATIVES_MAX[ecran]) return;
    const cloture: Cloture = { correcte: correct, aide: etat.aide > 0 };
    setClotures((liste) => liste.map((c, i) => (i === ecran ? cloture : c)));
    setHistorique((liste) =>
      liste.map((h, i) =>
        i === ecran ? { titre: TITRES[ecran], votreReponse, correcte: correct, reponseAttendue: correct ? undefined : reponseAttendue(exercice, ecran) } : h,
      ),
    );
    setEnAttente({ revele: !correct });
  }

  function passerSuivant() {
    if (ecran === NB_ECRANS - 1) {
      nouvelExercice(genererExerciceChoisirModele());
      return;
    }
    setEnAttente(null);
    setEcran((ecran + 1) as Ecran);
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttendue(exercice, ecran),
        labelSuivant: ecran === NB_ECRANS - 1 ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerSuivant,
        messageRevele: TENTATIVES_MAX[ecran] === 1 ? "Ce n'était pas la bonne réponse." : undefined,
      }
    : null;

  const segments: EtatPuceProgression[] = clotures.map((c, i) => {
    if (c) return c.correcte ? (c.aide ? "aide" : "correcte") : "revele";
    return i === ecran ? "courante" : "a-venir";
  });

  const figure = construireFigureModele(exercice, { palette: PALETTE_ECRAN }).replace(
    "<svg ",
    '<svg style="width:100%;height:auto;display:block;max-width:560px;margin:0 auto;border-radius:6px" ',
  );
  const consigne = (
    <>
      <RenduFragments fragments={situation(exercice)} /> <RenduFragments fragments={CONSIGNE_FAMILLES} />
    </>
  );
  const blocDonnees = <div className="figure-choisir-modele-bloc" style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: figure }} />;

  const etat = etats[ecran];
  const communes = {
    exercice,
    tentativesUtilisees: etat.tentatives,
    tentativesMax: TENTATIVES_MAX[ecran],
    niveauAide: etat.aide,
    onActiverAide: activerAide,
    onResultat,
    validation,
  };
  const cle = `${generation}-${ecran}`;
  const champs4 = champsEcran4(exercice);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Choisir le bon modèle</h1>
        <p className="app-subtitle">Chapitre 3 — fonctions de référence en contexte</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES} onGenerer={(id) => nouvelExercice(construireAvecVariante(id))} />
      </header>

      <main className="card">
        <ProgressionPuces segments={segments} onSegmentClick={(index) => setFicheOuverte(index)} />
        <div className="card-body">
          <EnTeteExercice consigneGenerale={consigne} blocDonnees={blocDonnees} />
          <RecapitulatifPanel entrees={recapitulatif(exercice, clotures.slice(0, ecran))} />
          {ecran === 0 && <EtapeFamilleModele key={cle} {...communes} aides={aidesEcran1(exercice)} question={QUESTION_ECRAN_1} />}
          {ecran === 1 && <EtapeTransformationsModele key={cle} {...communes} aides={aidesEcran2(exercice)} question={QUESTION_ECRAN_2} />}
          {ecran === 2 && <EtapeExpressionModele key={cle} {...communes} aides={aidesEcran3(exercice)} question={questionEcran3(exercice)} />}
          {ecran === 3 && <EtapeUtilisationModele key={cle} {...communes} aides={aidesEcran4(exercice)} question={questionEcran4(exercice)} libelles={champs4.libelles} unite={champs4.unite} />}
          {ecran === 4 && <EtapeSensModele key={cle} {...communes} aides={aidesEcran5(exercice)} question={questionEcran5(exercice)} />}
        </div>
      </main>

      {ficheOuverte !== null && historique[ficheOuverte] && <FicheReponseEcran entree={historique[ficheOuverte]!} onFermer={() => setFicheOuverte(null)} />}
    </div>
  );
}
