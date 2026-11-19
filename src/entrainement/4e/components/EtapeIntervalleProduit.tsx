import { useState } from "react";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { ExerciceSignesProduit, SolutionEnsembleProduit } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import { formatTermesEnonceSignesProduitFactoriseLatex } from "../ui/formatSignesProduit";
import { ListeMorceauxInput } from "./ListeMorceauxInput";
import { ListePointsIsolesInput, construirePointsIsoles } from "./ListePointsIsolesInput";
import { construireListe, etatListeInitiale } from "../ui/listeMorceaux";
import type { EtatListeMorceaux } from "../ui/listeMorceaux";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { formatTermesApercuSolutionProduit } from "../ui/apercuIntervalleProduit";
import { calculerAideGrille } from "../generateurs/signesProduit/grille";
import { TableauSignesRecap } from "./TableauSignesRecap";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { MESSAGE_BORNE_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { RenduFragments } from "./RenduFragments";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { lireNombreSaisi } from "../ui/lireNombre";

type Forme = Exclude<SolutionEnsembleProduit["forme"], "union">;

const OPTIONS_FORME: { valeur: Forme; libelle: string }[] = [
  { valeur: "vide", libelle: "∅" },
  { valeur: "reel", libelle: "ℝ" },
  { valeur: "point", libelle: "Un point" },
  { valeur: "reel_sauf_points", libelle: "Tous les réels sauf un ou plusieurs points" },
  { valeur: "intervalle", libelle: "Au moins un intervalle" },
];

/** Nombre minimal de blocs pour la forme extensible "reel_sauf_points" — en dessous, ce n'est plus la bonne forme générale. */
const MIN_VALEURS_EXCLUES = 1;

interface Props {
  exercice: ExerciceSignesProduit;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  /** Aide de niveau 1 (KaTeX) : la règle de lecture ; le niveau 2 surligne le tableau. */
  aideTexte?: FragmentConsigne[];
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (valeur interdite incluse…). */
  messageCible?: (reponse: SolutionEnsembleProduit) => FragmentConsigne[] | null;
  onValider: (reponse: SolutionEnsembleProduit) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "intervalle solution" (section 2, point 4 de la spec ; section 5-6,
 * prompt-refonte-tableau-signes.md ; point 2, prompt-corrections-tableau-signes-3points.md) :
 * construction guidée par blocs structurés — jamais de palette de symboles librement cliquables,
 * toujours le même composant crochet-borne-virgule-borne-crochet (MorceauIntervalleInput) déjà en
 * place. "Un intervalle" et "Union de plusieurs intervalles" sont désormais fusionnées en une
 * seule option "Au moins un intervalle" (promptgenerateur5signesProduit.md, point 4), qui reprend
 * exactement le mécanisme de liste extensible du générateur "Caractéristiques d'une fonction"
 * (ListeMorceauxInput/listeMorceaux.ts — bouton "+ Ajouter un morceau"/"×" par ligne, jamais de
 * limite fixe) : `construireListe` retourne directement `Morceau[]`, converti en
 * `{forme:"intervalle", morceau}` si un seul morceau ou `{forme:"union", morceaux}` sinon — le
 * contrat SolutionEnsembleProduit/verifierSolutionSignesProduit reste inchangé, seule l'INTERFACE
 * DE SAISIE est unifiée — et `{forme:"mixte", morceaux, points}` dès qu'un point isolé est ajouté
 * (ListePointsIsolesInput, racine double avec ≤/≥, audit gen5). Les autres options (∅, ℝ, un point, tous les réels sauf un ou plusieurs points)
 * restent inchangées. Affiche en rappel le tableau de signes correctement rempli
 * (TableauSignesRecap) et un bouton "Aide" (activation à sens unique, même principe que
 * l'exercice "tableau de signes" simple). L'inéquation affichée en rappel montre la décomposition
 * complète en facteurs (formatEnonceSignesProduitFactoriseLatex, point 8), et l'aperçu en temps
 * réel comme la réponse en cours de construction porte désormais le préfixe "S = "
 * (promptgenerateur5signesProduit.md, point 4).
 */
export function EtapeIntervalleProduit({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  aideTexte,
  messageCible,
  onValider,
  validation,
}: Props) {
  const [forme, setForme] = useState<Forme | null>(null);
  const saisie = useTentativeLisible<SolutionEnsembleProduit>();
  const [niveauAide, setNiveauAide] = useState(aideActivee ? 2 : 0);
  const surligne = aideTexte ? niveauAide >= 2 : aideActivee;
  const [valeurPoint, setValeurPoint] = useState("");
  const [valeursExclues, setValeursExclues] = useState<string[]>([]);
  const [liste, setListe] = useState<EtatListeMorceaux>(etatListeInitiale());
  const [pointsIsoles, setPointsIsoles] = useState<string[]>([]);

  function choisirForme(nouvelleForme: Forme) {
    setForme(nouvelleForme);
    setValeurPoint("");
    setValeursExclues(nouvelleForme === "reel_sauf_points" ? Array(MIN_VALEURS_EXCLUES).fill("") : []);
    setListe(etatListeInitiale());
    setPointsIsoles([]);
  }

  function ajouterValeurExclue() {
    setValeursExclues((etat) => [...etat, ""]);
  }

  function supprimerValeurExclue(index: number) {
    setValeursExclues((etat) => (etat.length > MIN_VALEURS_EXCLUES ? etat.filter((_, i) => i !== index) : etat));
  }

  function modifierValeurExclue(index: number, valeur: string) {
    setValeursExclues((etat) => etat.map((v, i) => (i === index ? valeur : v)));
  }

  function construireReponse(): SolutionEnsembleProduit | null {
    if (forme === null) return null;
    if (forme === "vide") return { forme: "vide" };
    if (forme === "reel") return { forme: "reel" };
    if (forme === "point") {
      const texte = valeurPoint.trim();
      const valeur = lireNombreSaisi(texte) ?? NaN;
      if (texte === "" || !Number.isFinite(valeur)) return null;
      return { forme, valeur };
    }
    if (forme === "reel_sauf_points") {
      const valeurs = valeursExclues.map((texte) => lireNombreSaisi(texte) ?? NaN);
      const toutesValides = valeursExclues.every((texte) => texte.trim() !== "") && valeurs.every((v) => Number.isFinite(v));
      return toutesValides ? { forme, valeurs } : null;
    }
    const morceaux = construireListe(liste);
    const points = construirePointsIsoles(pointsIsoles);
    if (morceaux === null || points === null) return null;
    if (points.length > 0) return { forme: "mixte", morceaux, points };
    return morceaux.length === 1 ? { forme: "intervalle", morceau: morceaux[0] } : { forme: "union", morceaux };
  }

  const reponse = construireReponse();
  const termesApercu = formatTermesApercuSolutionProduit(forme, valeurPoint, valeursExclues, liste, pointsIsoles);
  const highlight = surligne ? calculerAideGrille(exercice) : undefined;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {/* Un fragment par facteur (retour à la ligne entre facteurs) : en un seul bloc, l'inéquation
          factorisée était coupée sur smartphone (audit gen5) — même rendu que EtapeGrilleSignes. */}
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceSignesProduitFactoriseLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>
      <TableauSignesRecap exercice={exercice} highlight={highlight} />
      {termesApercu !== null && (
        <div className="apercu-box apercu-box-termes">
          {termesApercu.map((terme, i) => (
            <Katex key={i} expression={terme} />
          ))}
        </div>
      )}
      <p className="prompt-text">Quel est l'ensemble-solution de cette inéquation ?</p>
      <div className="options-grid">
        {OPTIONS_FORME.map((option) => (
          <button
            key={option.valeur}
            type="button"
            className={forme === option.valeur ? "btn toggle-active" : "btn"}
            onClick={() => choisirForme(option.valeur)}
          >
            {option.libelle}
          </button>
        ))}
      </div>

      {forme === "point" && (
        <div className="field contenu-conditionnel">
          <label className="field-label" htmlFor="valeur-point">
            Valeur du point
          </label>
          <input
            id="valeur-point"
            className="text-input"
            value={valeurPoint}
            onChange={(e) => setValeurPoint(normaliserSigneMoins(e.target.value))}
          />
        </div>
      )}

      {forme === "reel_sauf_points" && (
        <div className="field">
          {valeursExclues.map((valeur, index) => (
            <div className="field-row" key={index}>
              <input
                className="text-input"
                value={valeur}
                onChange={(e) => modifierValeurExclue(index, normaliserSigneMoins(e.target.value))}
                placeholder="point exclu"
                aria-label={`Point exclu ${index + 1}`}
              />
              <button
                type="button"
                className="btn btn-supprimer"
                disabled={valeursExclues.length <= MIN_VALEURS_EXCLUES}
                onClick={() => supprimerValeurExclue(index)}
                aria-label={`Supprimer le point exclu ${index + 1}`}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="btn" onClick={ajouterValeurExclue}>
            + Ajouter un point
          </button>
        </div>
      )}

      {forme === "intervalle" && (
        <>
          <ListeMorceauxInput etat={liste} onChange={setListe} />
          <ListePointsIsolesInput valeurs={pointsIsoles} onChange={setPointsIsoles} />
        </>
      )}

      {!validation && (
        <>
        {aideTexte && niveauAide >= 1 && (
          <div className="triangle-quelconque-aide">
            <p>
              <RenduFragments fragments={aideTexte} />
            </p>
          </div>
        )}
        {aideTexte && niveauAide >= 2 && (
          <div className="triangle-quelconque-aide">
            <p>Dans le tableau, les zones où le signe convient sont surlignées.</p>
          </div>
        )}
        <BoutonAide
          niveauAide={aideTexte ? niveauAide : aideActivee ? 1 : 0}
          niveauAideMax={aideTexte ? 2 : 1}
          onActiverAide={() => {
            if (!aideTexte) return onActiverAide();
            if (niveauAide + 1 >= 2) onActiverAide();
            setNiveauAide((n) => Math.min(2, n + 1));
          }}
        />

        <button
          type="button"
          className="btn btn-primary"
          disabled={forme === null}
          onClick={() => saisie.tenter(reponse ?? { forme: "vide" }, reponse !== null, onValider)}
        >
          Valider
        </button>
        <MessageRetour texteIllisible={MESSAGE_BORNE_ILLISIBLE} illisible={saisie.illisible} tentativesUtilisees={tentativesUtilisees} tentativesMax={tentativesMax} cible={saisie.soumise !== null ? messageCible?.(saisie.soumise) : null} />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
