import { useState } from "react";
import type { ReactNode } from "react";
import type { Morceau } from "./core/inequation.types";
import type {
  ExerciceCaracteristiquesAlgebriques,
  ReponseCE,
  ReponseCondition,
  ReponseDomaine,
  ReponseExistence,
  ReponseParite,
  ReponseResolutionBranches,
  ReponseSeparation,
  ReponseZerosCaracteristiques,
} from "./core/caracteristiquesAlgebriques.types";
import type { PhaseCaracteristiquesAlgebriques } from "./core/caracteristiquesAlgebriques.types";
import type { ReglagesSession } from "./core/session.types";
import {
  activerAideSuivante,
  demarrerSessionCaracteristiquesAlgebriques,
  soumettreReponseCE,
  soumettreReponseDebarrasser,
  soumettreReponseDomaine,
  soumettreReponseIsolement,
  soumettreReponseOrdonnee,
  soumettreReponseParite,
  soumettreReponseRegroupe,
  soumettreReponseResolutionBranches,
  soumettreReponseSeparation,
  soumettreReponseValidationSolution,
  soumettreReponseValidite,
  soumettreReponseZeros,
} from "./moteur/sessionCaracteristiquesAlgebriques";
import {
  brancheEstValide,
  ceAttendues,
  domaineAttendu,
  equationIsoleeAdmetSolution,
  necessiteRegroupe,
  necessiteValidite,
  pariteAttendue,
  racineRespecteCondition,
  racinesAValiderRacineCarree,
  zerosAttendus,
} from "./moteur/verificationCaracteristiquesAlgebriques";
import type { EtatSessionCaracteristiquesAlgebriques } from "./moteur/typesCaracteristiquesAlgebriques";
import {
  CATALOGUE_VARIANTES_FAMILLE_NIVEAU,
  construireAvecVarianteFamilleNiveau,
  genererExerciceFamilleNiveauAleatoire,
} from "./generateurs/caracteristiquesAlgebriques";
import type { GenerateurExerciceCaracteristiquesAlgebriques } from "./core/caracteristiquesAlgebriques.types";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import type { CodeExerciceDecode } from "../export/codeExercice";
import { SelecteurVarianteDev } from "./components/SelecteurVarianteDev";
import { RecapitulatifPanel } from "./components/RecapitulatifPanel";
import { calculerRecapitulatifCaracteristiquesAlgebriques } from "./ui/recapitulatifCaracteristiquesAlgebriques";
import { expressionLibreVersLatex } from "./ui/formatExpressionLatex";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { EtapeOrdonneeAlgebrique } from "./components/EtapeOrdonneeAlgebrique";
import { EtapeCE } from "./components/EtapeCE";
import { EtapeDomaineNiveau1 } from "./components/EtapeDomaineNiveau1";
import { EtapeParite } from "./components/EtapeParite";
import { EtapeIsolementNiveau1 } from "./components/EtapeIsolementNiveau1";
import { EtapeSeparation } from "./components/EtapeSeparation";
import { EtapeDebarrasser } from "./components/EtapeDebarrasser";
import { EtapeConditionValidite } from "./components/EtapeConditionValidite";
import { EtapeRegroupe } from "./components/EtapeRegroupe";
import { EtapeResolutionBranches } from "./components/EtapeResolutionBranches";
import { EtapeValidationSolution } from "./components/EtapeValidationSolution";
import { EtapeZerosAlgebrique } from "./components/EtapeZerosAlgebrique";
import { Katex } from "./components/Katex";
import {
  formatCEAttenduesLatex,
  formatConditionLatex,
  formatEquationDebarrasseeLatex,
  formatEquationDeveloppeeLatex,
  formatEquationIsoleeLatex,
  formatEquationsSepareesLatex,
  formatFractionLatex,
  formatOrdonneeExacteLatex,
  formatPariteLabel,
  formatTermesZerosAttendusLatex,
  formatValeurExacteLatex,
} from "./ui/formatCaracteristiquesAlgebriques";
import { formatFractionIrreductible } from "./ui/formatFraction";
import { formatDomaineLatex } from "./ui/apercuDomaine";
import type { EtatMorceauFraction } from "./ui/morceauFraction";
import { EnTeteExercice } from "./components/EnTeteExercice";
import { necessiteSeparation } from "./moteur/verificationCaracteristiquesAlgebriques";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { ProgressionPuces } from "../components/ProgressionPuces";

const CONSIGNE_GENERALE = "Étudie les caractéristiques algébriques de cette fonction de référence.";

const NOMBRE_EXERCICES_ALEATOIRE = 5;

const REGLAGES_BASE = {
  tentativesMax: 3,
  affichageReponseApresEchec: true,
  affichageExplication: true,
} as const;

const REGLAGES_SESSION: ReglagesSession = { ...REGLAGES_BASE, nombreExercices: NOMBRE_EXERCICES_ALEATOIRE };

/** Générateur d'une session : la variante choisie dans le sélecteur (famille ET niveau,
 * `CATALOGUE_VARIANTES_FAMILLE_NIVEAU`), sinon famille et niveau tirés au hasard. Plus d'écran de
 * réglages avant le premier exercice (demande de l'utilisateur : le sélecteur de variantes suffit). */
function generateurPour(varianteId: string | null): GenerateurExerciceCaracteristiquesAlgebriques {
  return varianteId === null ? genererExerciceFamilleNiveauAleatoire : () => construireAvecVarianteFamilleNiveau(varianteId);
}

function demarrer(varianteId: string | null): EtatSessionCaracteristiquesAlgebriques {
  return demarrerSessionCaracteristiquesAlgebriques(REGLAGES_SESSION, generateurPour(varianteId));
}

/** Générateur dont le PREMIER exercice est l'instance du code imprimé — tirée avec les MÊMES
 * fonctions et le MÊME catalogue que l'adaptateur d'export (`genererInstance` =
 * `genererExerciceFamilleNiveauAleatoire`, variante = `construireAvecVarianteFamilleNiveau`) ; la
 * suite de la session reste un tirage normal. */
function generateurDepuisCode(code: CodeExerciceDecode): GenerateurExerciceCaracteristiquesAlgebriques {
  let premier = true;
  return () => {
    if (!premier) return genererExerciceFamilleNiveauAleatoire();
    premier = false;
    return genererAvecCode(code, CATALOGUE_VARIANTES_FAMILLE_NIVEAU, genererExerciceFamilleNiveauAleatoire, construireAvecVarianteFamilleNiveau);
  };
}

/** Session initiale : l'exercice imprimé si l'URL porte un code, sinon un tirage aléatoire. */
function sessionInitiale(): EtatSessionCaracteristiquesAlgebriques {
  const code = lireCodeDepuisUrl();
  if (!code) return demarrer(null);
  return demarrerSessionCaracteristiquesAlgebriques(REGLAGES_SESSION, generateurDepuisCode(code));
}

/** Séquence de phases pour l'exercice courant — niveau 1 : `ce→domaine→ordonnee→parite→isolement→
 * [separation|debarrasser]→zeros` (`sessionCaracteristiquesAlgebriques.ts`, en-tête de fichier).
 * Niveau 2 : dispatch par famille après `isolement` (voir `phaseApresIsolement`, même fichier) —
 * `validationSolution` (qui se répète 0 à 2 fois sans jamais changer de `phase`, voir
 * `releveRevelePhase` ci-dessus) n'apparaît ici qu'UNE SEULE FOIS, comme un bloc agrégé : la barre
 * de puces n'a pas besoin d'un segment par répétition. */
function sequencePourExercice(exercice: ExerciceCaracteristiquesAlgebriques): PhaseCaracteristiquesAlgebriques[] {
  const basePartagee: PhaseCaracteristiquesAlgebriques[] = ["ce", "domaine", "ordonnee"];
  if (exercice.niveau === "niveau1") {
    // "parite" (audit du chapitre 3) n'existe qu'à ce niveau — voir `pariteAttendue`. Sans solution
    // à l'équation isolée (K<0), pas d'étape intermédiaire — même règle que `phaseApresIsolement`.
    const intermediaire: PhaseCaracteristiquesAlgebriques[] = !equationIsoleeAdmetSolution(exercice)
      ? []
      : [necessiteSeparation(exercice) ? "separation" : "debarrasser"];
    return [...basePartagee, "parite", "isolement", ...intermediaire, "zeros"];
  }
  const base: PhaseCaracteristiquesAlgebriques[] = [...basePartagee, "isolement"];
  switch (exercice.famille) {
    case "carre":
    case "cube":
      return [...base, "zeros"];
    case "inverse":
    case "racine_cubique":
      return [...base, "regroupe", "zeros"];
    case "racine_carree":
      return [...base, "validite", "regroupe", "zeros", "validationSolution"];
    case "valeur_absolue":
      return [...base, "validite", "resolutionBranches", "validationSolution", "zeros"];
  }
}

/** Segments de la barre de puces — "validationSolution" (bloc agrégé, voir `sequencePourExercice`)
 * est "révélé" si au moins une de ses répétitions l'a été (`scoresValidationSolutionExercice`,
 * aucune aide sur cet écran — voir `releveRevelePhase` ci-dessus — donc jamais de statut "aide"
 * pour ce segment). Les autres phases passées lisent directement leur `xxxRevele` dédié, puis leur
 * niveau d'aide (6 écrans à aide, voir `AIDE_PAR_PHASE`, `sessionCaracteristiquesAlgebriques.ts`) :
 * "revele" prime sur "aide", même convention que les autres générateurs à aide.
 * La dernière phase de chaque séquence (toujours terminale) n'a jamais besoin de sa propre branche
 * "close". */
function calculerSegmentsProgression(etat: EtatSessionCaracteristiquesAlgebriques): EtatPuceProgression[] {
  const sequence = sequencePourExercice(etat.exerciceCourant);
  const indexCourant = sequence.indexOf(etat.phase);
  return sequence.map((phase, index) => {
    if (index === indexCourant) return "courante";
    if (index > indexCourant) return "a-venir";
    if (phase === "validationSolution") {
      return etat.scoresValidationSolutionExercice.some((score) => score === 0) ? "revele" : "correcte";
    }
    const revele =
      phase === "ordonnee"
        ? etat.ordonneeRevele
        : phase === "ce"
          ? etat.ceRevele
          : phase === "domaine"
            ? etat.domaineRevele
            : phase === "parite"
              ? etat.pariteRevele
              : phase === "isolement"
                ? etat.isolementRevele
                : phase === "separation"
                  ? etat.separationRevele
                  : phase === "debarrasser"
                    ? etat.debarrasserRevele
                    : phase === "validite"
                      ? etat.validiteRevele
                      : phase === "regroupe"
                        ? etat.regroupeRevele
                        : phase === "resolutionBranches"
                          ? etat.resolutionBranchesRevele
                          : etat.zerosRevele;
    if (revele) return "revele";
    const niveauAide =
      phase === "ce"
        ? etat.niveauAideCE
        : phase === "parite"
          ? etat.niveauAideParite
          : phase === "isolement"
            ? etat.niveauAideIsolement
            : phase === "separation"
              ? etat.niveauAideSeparation
              : phase === "debarrasser"
                ? etat.niveauAideDebarrasser
                : phase === "zeros"
                  ? etat.niveauAideZeros
                  : 0;
    return niveauAide > 0 ? "aide" : "correcte";
  });
}

/** État tenu en attente dès qu'un écran se termine (bonne réponse, ou tentatives épuisées) — l'état
 * de session calculé par le moteur n'est appliqué (`setEtat`) qu'au clic sur le bouton de
 * `ValidationEcran`, jamais immédiatement (convention CLAUDE.md, "validation/invalidation avant de
 * passer à l'écran suivant"). */
interface TransitionEnAttente {
  etatSuivant: EtatSessionCaracteristiquesAlgebriques;
  revele: boolean;
}

/** Repris tel quel de l'ancien `ResultatPanelCaracteristiquesAlgebriques.tsx` (non exportés) — petites
 * fonctions pures dupliquées plutôt qu'importées, même principe de duplication assumée qu'ailleurs
 * sur le projet. */
function morceauVersEtatFraction(m: Morceau): EtatMorceauFraction {
  return {
    crochetGauche: m.crochetGauche,
    borneGaucheMode: m.borneGauche === "-inf" ? "-inf" : "nombre",
    borneGaucheValeur: typeof m.borneGauche === "number" ? formatFractionIrreductible(m.borneGauche) : "",
    crochetDroit: m.crochetDroit,
    borneDroiteMode: m.borneDroite === "+inf" ? "+inf" : "nombre",
    borneDroiteValeur: typeof m.borneDroite === "number" ? formatFractionIrreductible(m.borneDroite) : "",
  };
}

function formatDomaineAttenduLatex(exercice: ExerciceCaracteristiquesAlgebriques): string {
  const domaine = domaineAttendu(exercice);
  const points = domaine.points.map((p) => formatFractionIrreductible(p));
  const intervalles = domaine.intervalles.map(morceauVersEtatFraction);
  return formatDomaineLatex(domaine.forme, points, intervalles) ?? "";
}

/** Zéros à afficher lors de la révélation — `racine_carree` (niveau 2) fait exception : `zeros` y
 * grade les racines CANDIDATES (non filtrées, l'écran "zéros" précédant "validation" pour cette
 * famille). */
function zerosAAfficherPourRevelation(exercice: ExerciceCaracteristiquesAlgebriques): number[] {
  if (exercice.niveau === "niveau2" && exercice.famille === "racine_carree") {
    return racinesAValiderRacineCarree(exercice);
  }
  return zerosAttendus(exercice);
}

/** Nombre de solutions/branches à valider — même formule que `nombreSolutionsAValider`
 * (`sessionCaracteristiquesAlgebriques.ts`, non exportée), dupliquée ici. */
function totalValidationSolution(exercice: ExerciceCaracteristiquesAlgebriques): number {
  if (exercice.niveau !== "niveau2") return 0;
  if (exercice.famille === "racine_carree") return racinesAValiderRacineCarree(exercice).length;
  if (exercice.famille === "valeur_absolue") return 2;
  return 0;
}

/** Réponse Oui/Non attendue à l'étape "validation d'une solution", à l'index donné — même logique
 * que `soumettreReponseValidationSolution`, dupliquée ici. */
function attenduValidationSolution(exercice: ExerciceCaracteristiquesAlgebriques, index: number): boolean {
  if (exercice.niveau !== "niveau2") return false;
  if (exercice.famille === "racine_carree") return racineRespecteCondition(exercice, racinesAValiderRacineCarree(exercice)[index]);
  if (exercice.famille === "valeur_absolue") return brancheEstValide(exercice, index as 0 | 1);
  return false;
}

/** Reproduit exactement ce que `ResultatPanelCaracteristiquesAlgebriques.tsx` affichait pour UNE
 * phase donnée, scopé à l'exercice/phase qui vient juste de se terminer (`etat.exerciceCourant`/
 * `etat.phase`, jamais l'état suivant). */
function reponseAttenduePhase(etat: EtatSessionCaracteristiquesAlgebriques): ReactNode {
  const exercice = etat.exerciceCourant;
  switch (etat.phase) {
    case "ordonnee": {
      const attendu = formatOrdonneeExacteLatex(exercice);
      return (
        <>
          f(0) attendu : {attendu === null ? "n'existe pas" : <Katex expression={attendu} />}
        </>
      );
    }
    case "ce": {
      const attendu = formatCEAttenduesLatex(ceAttendues(exercice));
      return (
        <>
          CE attendues : {attendu === null ? "aucune" : <Katex expression={attendu} />}
        </>
      );
    }
    case "domaine":
      return (
        <>
          Domaine attendu : <Katex expression={formatDomaineAttenduLatex(exercice)} />
        </>
      );
    case "parite": {
      if (exercice.niveau !== "niveau1") return null;
      return <>Parité attendue : {formatPariteLabel(pariteAttendue(exercice))}</>;
    }
    case "isolement":
      return (
        <>
          Équation isolée attendue : <Katex expression={formatEquationIsoleeLatex(exercice)} />
        </>
      );
    case "separation": {
      if (exercice.niveau !== "niveau1") return null;
      return (
        <>
          <p>Deux équations attendues :</p>
          <Katex expression={formatEquationsSepareesLatex(exercice)} block />
        </>
      );
    }
    case "debarrasser": {
      if (exercice.niveau !== "niveau1") return null;
      return (
        <>
          Équation attendue : <Katex expression={formatEquationDebarrasseeLatex(exercice)} />
        </>
      );
    }
    case "validite": {
      if (!necessiteValidite(exercice)) return null;
      return (
        <>
          Condition attendue : <Katex expression={formatConditionLatex(exercice.conditionValidite)} />
        </>
      );
    }
    case "regroupe":
      return (
        <>
          Équation attendue : <Katex expression={formatEquationDeveloppeeLatex(exercice)} />
        </>
      );
    case "resolutionBranches": {
      if (!(exercice.niveau === "niveau2" && exercice.famille === "valeur_absolue")) return null;
      return (
        <>
          Racines attendues :{" "}
          <span className="equation-box-termes">
            <Katex expression={formatFractionLatex(exercice.racineBranche1)} />
            <Katex expression={`\\text{ et } ${formatFractionLatex(exercice.racineBranche2)}`} />
          </span>
        </>
      );
    }
    case "validationSolution": {
      if (exercice.niveau !== "niveau2") return null;
      const index = etat.scoresValidationSolutionExercice.length;
      const total = totalValidationSolution(exercice);
      return (
        <>
          Validation attendue{total > 1 ? ` (solution ${index + 1})` : ""} : {attenduValidationSolution(exercice, index) ? "Oui" : "Non"}
        </>
      );
    }
    case "zeros": {
      const termes = formatTermesZerosAttendusLatex(zerosAAfficherPourRevelation(exercice));
      return (
        <>
          Zéros attendus :{" "}
          {termes === null ? (
            "aucun"
          ) : (
            <span className="equation-box-termes">
              {termes.map((terme, i) => (
                <Katex key={i} expression={terme} />
              ))}
            </span>
          )}
        </>
      );
    }
  }
}

/** Signal `revele` de la phase qui vient JUSTE de se terminer (`etatAvant.phase`, avant la
 * transition). Chaque phase (hormis "validationSolution") expose un booléen `xxxRevele` dédié sur
 * `nouvelEtat` — "zeros" fait exception : `nouvelEtat.zerosRevele` tant que la transition mène à
 * "validationSolution" (racine_carree, clôture différée), `nouvelEtat.resultats[dernier].zerosRevele`
 * sinon (l'exercice vient de se clôturer). "validationSolution" n'a PAS de booléen dédié dans le
 * contrat (seulement un score agrégé, `scoresValidationSolutionExercice`) — mais
 * `soumettreEtapeTentatives` garantit score===0 <=> révélation (voir `etapeTentatives.ts` : le seul
 * chemin vers un score de 0 est l'échec après épuisement des tentatives), donc dérivable sans
 * ambiguïté ici — même technique que l'ancien `ResultatPanelCaracteristiquesAlgebriques.tsx`
 * (`scoresValidationSolution.map((score) => score === 0)`). */
function releveRevelePhase(etatAvant: EtatSessionCaracteristiquesAlgebriques, nouvelEtat: EtatSessionCaracteristiquesAlgebriques): boolean {
  switch (etatAvant.phase) {
    case "ordonnee":
      return nouvelEtat.ordonneeRevele;
    case "ce":
      return nouvelEtat.ceRevele;
    case "domaine":
      return nouvelEtat.domaineRevele;
    case "parite":
      return nouvelEtat.pariteRevele;
    case "isolement":
      return nouvelEtat.isolementRevele;
    case "separation":
      return nouvelEtat.separationRevele;
    case "debarrasser":
      return nouvelEtat.debarrasserRevele;
    case "validite":
      return nouvelEtat.validiteRevele;
    case "regroupe":
      return nouvelEtat.regroupeRevele;
    case "resolutionBranches":
      return nouvelEtat.resolutionBranchesRevele;
    case "validationSolution": {
      const scores = nouvelEtat.scoresValidationSolutionExercice;
      return scores[scores.length - 1] === 0;
    }
    case "zeros": {
      if (nouvelEtat.phase === "validationSolution") return nouvelEtat.zerosRevele;
      return nouvelEtat.resultats[nouvelEtat.resultats.length - 1].zerosRevele;
    }
  }
}

/** Titre de chaque écran dans la fiche des puces cliquables. */
const TITRE_PHASE: Record<PhaseCaracteristiquesAlgebriques, string> = {
  ce: "Conditions d'existence",
  domaine: "Domaine de définition",
  ordonnee: "Ordonnée à l'origine",
  parite: "Parité",
  isolement: "Équation isolée",
  separation: "Deux équations",
  debarrasser: "Équation sans la fonction de référence",
  validite: "Condition de validité",
  regroupe: "Équation regroupée",
  resolutionBranches: "Racines des deux branches",
  validationSolution: "Validation des solutions",
  zeros: "Zéros",
};

/** Nombre en LaTeX pour la fiche : valeur exacte (fraction) si elle est rationnelle, sinon arrondi
 * au millième avec la virgule décimale (une racine non parfaite tapée par l'élève). */
function valeurLatex(valeur: number): string {
  const exacte = formatFractionIrreductible(valeur);
  if (!exacte.includes(".")) return formatValeurExacteLatex(valeur);
  return `${String(Number(valeur.toFixed(3))).replace(".", "{,}")}`;
}

/** Saisie libre (équation, expression) rendue comme dans l'aperçu ; texte brut si elle ne se lit pas. */
function saisieLibre(texte: string): ReactNode {
  try {
    return <Katex expression={expressionLibreVersLatex(texte)} />;
  } catch {
    return texte;
  }
}

/** Réponse de l'élève telle qu'elle a été validée, mise en forme pour la fiche (lecture seule). */
function formatReponseCE(reponse: ReponseCE): ReactNode {
  const latexCE = formatCEAttenduesLatex(reponse);
  return latexCE === null ? "Pas de CE" : <Katex expression={latexCE} />;
}

function formatReponseDomaine(reponse: ReponseDomaine): ReactNode {
  const latexDomaine = formatDomaineLatex(reponse.forme, reponse.points.map((p) => formatFractionIrreductible(p)), reponse.intervalles.map(morceauVersEtatFraction));
  return latexDomaine === null ? "—" : <Katex expression={`\\mathrm{dom}\\,f = ${latexDomaine}`} />;
}

function formatReponseExistence(reponse: ReponseExistence): ReactNode {
  return reponse.existe && reponse.valeur !== null ? <Katex expression={`f(0) = ${valeurLatex(reponse.valeur)}`} /> : "n'existe pas";
}

function formatReponseCondition(reponse: ReponseCondition): ReactNode {
  if (reponse.forme === "reel") return <Katex expression={"\\mathbb{R}"} />;
  if (reponse.forme === "vide") return <Katex expression={"\\varnothing"} />;
  return reponse.intervalle ? <Katex expression={formatConditionLatex(reponse.intervalle)} /> : "—";
}

function formatReponseZeros(reponse: ReponseZerosCaracteristiques): ReactNode {
  if (reponse.aucun) return "aucun zéro";
  return <Katex expression={reponse.valeurs.map((v) => `x = ${valeurLatex(v)}`).join(" \\text{ ; } ")} />;
}

export function AppCaracteristiquesAlgebriques() {
  const [etat, setEtat] = useState<EtatSessionCaracteristiquesAlgebriques>(sessionInitiale);
  /** Variante choisie dans le sélecteur (famille + niveau) — `null` : tirage aléatoire. Une session
   * terminée redémarre avec le même choix. */
  const [varianteForcee, setVarianteForcee] = useState<string | null>(null);
  const [enAttente, setEnAttente] = useState<TransitionEnAttente | null>(null);
  /** Puces cliquables : une entrée par SEGMENT de la barre (même index), construite au moment où
   * l'écran se clôt — jamais recalculée après coup. Les répétitions de « validation des solutions »
   * (un seul segment) sont réunies dans la même entrée. Remis à vide à chaque nouvel exercice. */
  const [historique, setHistorique] = useState<(EntreeHistoriqueEtape | undefined)[]>([]);
  const [ficheOuverteIndex, setFicheOuverteIndex] = useState<number | null>(null);
  /** Compteur de génération : remonte les écrans (champs vidés) à chaque « Générer ». */
  const [generation, setGeneration] = useState(0);

  function onGenererDev(varianteId: string) {
    setEnAttente(null);
    setHistorique([]);
    setFicheOuverteIndex(null);
    setVarianteForcee(varianteId);
    setGeneration((g) => g + 1);
    setEtat(demarrer(varianteId));
  }

  function ajouterHistorique(votreReponse: ReactNode, revele: boolean) {
    if (!etat) return;
    const index = sequencePourExercice(etat.exerciceCourant).indexOf(etat.phase);
    if (index < 0) return;
    const attendue = reponseAttenduePhase(etat);
    setHistorique((h) => {
      const copie = [...h];
      const existante = copie[index];
      if (etat.phase === "validationSolution" && existante) {
        // 2e solution à valider : même segment, réponses mises bout à bout.
        copie[index] = {
          titre: existante.titre,
          votreReponse: (
            <>
              {existante.votreReponse}
              <br />
              {votreReponse}
            </>
          ),
          correcte: existante.correcte && !revele,
          reponseAttendue: (
            <>
              {existante.reponseAttendue}
              {existante.reponseAttendue ? <br /> : null}
              {attendue}
            </>
          ),
        };
      } else {
        copie[index] = { titre: TITRE_PHASE[etat.phase], votreReponse, correcte: !revele, reponseAttendue: attendue };
      }
      return copie;
    });
  }

  function terminerEtape(nouvelEtat: EtatSessionCaracteristiquesAlgebriques, votreReponse?: ReactNode) {
    // "validationSolution" se répète (jusqu'à 2 fois) SANS jamais changer `phase` entre deux
    // répétitions — seule `scoresValidationSolutionExercice` grandit. Chaque répétition ferme
    // néanmoins un véritable écran (droit à `validation`, voir `EtapeValidationSolution.tsx`), donc
    // détectée en plus du changement de phase/fin de session.
    const validationSolutionAvancee = nouvelEtat.scoresValidationSolutionExercice.length > etat.scoresValidationSolutionExercice.length;
    const transitionDEcran = nouvelEtat.phase !== etat.phase || nouvelEtat.terminee !== etat.terminee || validationSolutionAvancee;
    if (transitionDEcran) {
      const revele = releveRevelePhase(etat, nouvelEtat);
      if (votreReponse !== undefined) ajouterHistorique(votreReponse, revele);
      setEnAttente({ etatSuivant: nouvelEtat, revele });
      return;
    }
    setEtat(nouvelEtat);
  }

  function passerEcranSuivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      // Session ENTIÈREMENT terminée (les N exercices) — redémarre avec le même choix de variante.
      setEtat(demarrer(varianteForcee));
    } else {
      setEtat(enAttente.etatSuivant);
    }
    // Nouvel exercice (dans la session ou nouvelle session) : historique des puces remis à vide.
    if (enAttente.etatSuivant.terminee || enAttente.etatSuivant.indexExercice !== etat.indexExercice) {
      setHistorique([]);
      setFicheOuverteIndex(null);
    }
    setEnAttente(null);
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: reponseAttenduePhase(etat),
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passerEcranSuivant,
      }
    : null;

  const recapitulatif = calculerRecapitulatifCaracteristiquesAlgebriques(etat);

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">4e — Entraînement</p>
        <h1 className="app-title">Caractéristiques algébriques d'une fonction de référence</h1>
        <p className="app-subtitle">Chapitre 3</p>
        <SelecteurVarianteDev options={CATALOGUE_VARIANTES_FAMILLE_NIVEAU} onGenerer={onGenererDev} />
        <ProgressionPuces segments={calculerSegmentsProgression(etat)} onSegmentClick={(index) => setFicheOuverteIndex(index)} />
      </header>

      <main className="card">
        <div className="card-body" key={`${generation}-${etat.indexExercice}`}>
          <EnTeteExercice consigneGenerale={CONSIGNE_GENERALE} blocDonnees={null} />
          <RecapitulatifPanel entrees={recapitulatif} />
          {etat.phase === "ordonnee" ? (
            <EtapeOrdonneeAlgebrique
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse: ReponseExistence) => terminerEtape(soumettreReponseOrdonnee(etat, reponse), formatReponseExistence(reponse))}
              validation={validation}
            />
          ) : etat.phase === "ce" ? (
            <EtapeCE
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideCE}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse: ReponseCE) => terminerEtape(soumettreReponseCE(etat, reponse), formatReponseCE(reponse))}
              validation={validation}
            />
          ) : etat.phase === "domaine" ? (
            <EtapeDomaineNiveau1
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse: ReponseDomaine) => terminerEtape(soumettreReponseDomaine(etat, reponse), formatReponseDomaine(reponse))}
              validation={validation}
            />
          ) : etat.phase === "parite" && etat.exerciceCourant.niveau === "niveau1" ? (
            <EtapeParite
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideParite}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse: ReponseParite) => terminerEtape(soumettreReponseParite(etat, reponse), formatPariteLabel(reponse))}
              validation={validation}
            />
          ) : etat.phase === "isolement" ? (
            <EtapeIsolementNiveau1
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideIsolement}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse: string) => terminerEtape(soumettreReponseIsolement(etat, reponse), saisieLibre(reponse))}
              validation={validation}
            />
          ) : etat.phase === "separation" ? (
            <EtapeSeparation
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideSeparation}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse: ReponseSeparation) =>
                terminerEtape(
                  soumettreReponseSeparation(etat, reponse),
                  <>
                    {saisieLibre(reponse.equation1)} ou {saisieLibre(reponse.equation2)}
                  </>,
                )
              }
              validation={validation}
            />
          ) : etat.phase === "debarrasser" ? (
            <EtapeDebarrasser
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideDebarrasser}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse: string) => terminerEtape(soumettreReponseDebarrasser(etat, reponse), saisieLibre(reponse))}
              validation={validation}
            />
          ) : etat.phase === "validite" && necessiteValidite(etat.exerciceCourant) ? (
            <EtapeConditionValidite
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse: ReponseCondition) => terminerEtape(soumettreReponseValidite(etat, reponse), formatReponseCondition(reponse))}
              validation={validation}
            />
          ) : etat.phase === "regroupe" && necessiteRegroupe(etat.exerciceCourant) ? (
            <EtapeRegroupe
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse: string) => terminerEtape(soumettreReponseRegroupe(etat, reponse), saisieLibre(reponse))}
              validation={validation}
            />
          ) : etat.phase === "resolutionBranches" &&
            etat.exerciceCourant.niveau === "niveau2" &&
            etat.exerciceCourant.famille === "valeur_absolue" ? (
            <EtapeResolutionBranches
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse: ReponseResolutionBranches) =>
                terminerEtape(
                  soumettreReponseResolutionBranches(etat, reponse),
                  <Katex expression={`x = ${valeurLatex(reponse.racineBranche1)} \\text{ et } x = ${valeurLatex(reponse.racineBranche2)}`} />,
                )
              }
              validation={validation}
            />
          ) : etat.phase === "validationSolution" && necessiteValidite(etat.exerciceCourant) ? (
            <EtapeValidationSolution
              key={etat.scoresValidationSolutionExercice.length}
              exercice={etat.exerciceCourant}
              index={etat.scoresValidationSolutionExercice.length}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              onValider={(reponse: boolean) =>
                terminerEtape(
                  soumettreReponseValidationSolution(etat, reponse),
                  `${totalValidationSolution(etat.exerciceCourant) > 1 ? `Solution ${etat.scoresValidationSolutionExercice.length + 1} : ` : ""}${reponse ? "Oui" : "Non"}`,
                )
              }
              validation={validation}
            />
          ) : (
            <EtapeZerosAlgebrique
              exercice={etat.exerciceCourant}
              tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
              tentativesMax={etat.reglages.tentativesMax}
              niveauAide={etat.niveauAideZeros}
              onActiverAide={() => setEtat(activerAideSuivante(etat))}
              onValider={(reponse: ReponseZerosCaracteristiques) => terminerEtape(soumettreReponseZeros(etat, reponse), formatReponseZeros(reponse))}
              validation={validation}
            />
          )}
        </div>
      </main>

      {ficheOuverteIndex !== null && historique[ficheOuverteIndex] && (
        <FicheReponseEcran entree={historique[ficheOuverteIndex]!} onFermer={() => setFicheOuverteIndex(null)} />
      )}
    </div>
  );
}
