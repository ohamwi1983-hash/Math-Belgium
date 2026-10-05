import { useState } from "react";
import type { ExerciceSignesProduit, SolutionEnsembleProduit } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import { formatEnonceSignesProduitFactoriseLatex } from "../ui/formatSignesProduit";
import { ListeMorceauxInput } from "./ListeMorceauxInput";
import { construireListe, etatListeInitiale } from "../ui/listeMorceaux";
import type { EtatListeMorceaux } from "../ui/listeMorceaux";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { formatTermesApercuSolutionProduit } from "../ui/apercuIntervalleProduit";
import { calculerAideGrille } from "../generateurs/signesProduit/grille";
import { TableauSignesRecap } from "./TableauSignesRecap";

type Forme = Exclude<SolutionEnsembleProduit["forme"], "union">;

const OPTIONS_FORME: { valeur: Forme; libelle: string }[] = [
  { valeur: "vide", libelle: "∅" },
  { valeur: "reel", libelle: "ℝ" },
  { valeur: "point", libelle: "Un point" },
  { valeur: "reel_sauf_points", libelle: "Tous les réels sauf plusieurs points" },
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
  onValider: (reponse: SolutionEnsembleProduit) => void;
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
 * DE SAISIE est unifiée. Les autres options (∅, ℝ, un point, tous les réels sauf plusieurs points)
 * restent inchangées. Affiche en rappel le tableau de signes correctement rempli
 * (TableauSignesRecap) et un bouton "Aide" (×0,5, activation à sens unique, même principe que
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
  onValider,
}: Props) {
  const [forme, setForme] = useState<Forme | null>(null);
  const [valeurPoint, setValeurPoint] = useState("");
  const [valeursExclues, setValeursExclues] = useState<string[]>([]);
  const [liste, setListe] = useState<EtatListeMorceaux>(etatListeInitiale());

  function choisirForme(nouvelleForme: Forme) {
    setForme(nouvelleForme);
    setValeurPoint("");
    setValeursExclues(nouvelleForme === "reel_sauf_points" ? Array(MIN_VALEURS_EXCLUES).fill("") : []);
    setListe(etatListeInitiale());
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
      const valeur = Number(texte.replace(",", "."));
      if (texte === "" || !Number.isFinite(valeur)) return null;
      return { forme, valeur };
    }
    if (forme === "reel_sauf_points") {
      const valeurs = valeursExclues.map((texte) => Number(texte.trim().replace(",", ".")));
      const toutesValides = valeursExclues.every((texte) => texte.trim() !== "") && valeurs.every((v) => Number.isFinite(v));
      return toutesValides ? { forme, valeurs } : null;
    }
    const morceaux = construireListe(liste);
    if (morceaux === null) return null;
    return morceaux.length === 1 ? { forme: "intervalle", morceau: morceaux[0] } : { forme: "union", morceaux };
  }

  const reponse = construireReponse();
  const termesApercu = formatTermesApercuSolutionProduit(forme, valeurPoint, valeursExclues, liste);
  const highlight = aideActivee ? calculerAideGrille(exercice) : undefined;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatEnonceSignesProduitFactoriseLatex(exercice)} block />
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
            onChange={(e) => setValeurPoint(e.target.value)}
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
                onChange={(e) => modifierValeurExclue(index, e.target.value)}
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
        <ListeMorceauxInput
          etat={liste}
          onChange={setListe}
        />
      )}

      <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
        {aideActivee ? "Aide utilisée" : "Aide"}
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={reponse === null}
        onClick={() => reponse !== null && onValider(reponse)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
