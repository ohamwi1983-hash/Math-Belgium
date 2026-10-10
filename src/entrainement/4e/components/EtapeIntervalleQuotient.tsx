import { useState } from "react";
import type { ExerciceInequationRationnelle } from "../core/inequationRationnelle.types";
import type { SolutionEnsembleProduit } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import {
  formatEnonceCombineDenominateurCarreLatex,
  formatEnonceCombineNiveau3Latex,
  formatEnonceCombineNiveau4Latex,
  formatEnonceCombineSansFacteurCommunLatex,
  formatEnonceCubiqueLatex,
  formatEnonceFacteurCommunSimplifieLatex,
  formatEnonceInequationRationnelleLatex,
} from "../ui/formatInequationRationnelle";
import { ListeMorceauxInput } from "./ListeMorceauxInput";
import { construireListe, etatListeInitiale } from "../ui/listeMorceaux";
import type { EtatListeMorceaux } from "../ui/listeMorceaux";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { formatTermesApercuSolutionProduit } from "../ui/apercuIntervalleProduit";
import { calculerAideGrilleQuotient } from "../generateurs/inequationRationnelle/grilleQuotient";
import { TableauSignesQuotientRecap } from "./TableauSignesQuotientRecap";
import { TableauSignesQuotientNiveau3Recap } from "./TableauSignesQuotientNiveau3Recap";
import { TableauSignesQuotientNiveau4Recap } from "./TableauSignesQuotientNiveau4Recap";
import { TableauSignesQuotientDenominateurCarreRecap } from "./TableauSignesQuotientDenominateurCarreRecap";
import { TableauSignesQuotientFacteurCommunRecap } from "./TableauSignesQuotientFacteurCommunRecap";
import { TableauSignesQuotientSansFacteurCommunRecap } from "./TableauSignesQuotientSansFacteurCommunRecap";
import { TableauSignesQuotientCubiqueRecap } from "./TableauSignesQuotientCubiqueRecap";
import { BoutonAide } from "./BoutonAide";

type Forme = SolutionEnsembleProduit["forme"];

const OPTIONS_FORME: { valeur: Forme; libelle: string }[] = [
  { valeur: "vide", libelle: "∅" },
  { valeur: "reel", libelle: "ℝ" },
  { valeur: "point", libelle: "Un point" },
  { valeur: "reel_sauf_points", libelle: "Tous les réels sauf plusieurs points" },
  { valeur: "intervalle", libelle: "Au moins un intervalle" },
];

const MIN_VALEURS_EXCLUES = 1;

interface Props {
  exercice: ExerciceInequationRationnelle;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: SolutionEnsembleProduit) => void;
}

/**
 * Étape "intervalle solution" (section 2, point 3 de la spec) : construction guidée déjà
 * généralisée (SolutionEnsembleProduit, plusieurs morceaux, notation francophone), même mécanisme
 * que EtapeIntervalleProduit.tsx (exercice "tableau de signes à plusieurs facteurs"). Affiche en
 * rappel la grille de signes correctement remplie (TableauSignesQuotientRecap) et un bouton "Aide"
 * (×0,5, activation à sens unique, prompt de corrections) — même principe que
 * EtapeIntervalleProduit.tsx, en tenant compte du symbole "∄" (jamais encadré, voir
 * calculerAideGrilleQuotient). Aucune vérification spéciale sur l'inclusion accidentelle de la CE :
 * une erreur sur ce point est traitée comme n'importe quelle autre réponse incorrecte.
 */
export function EtapeIntervalleQuotient({
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
  const highlight = aideActivee ? calculerAideGrilleQuotient(exercice) : undefined;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex
          expression={
            exercice.niveau === "niveau3"
              ? formatEnonceCombineNiveau3Latex(exercice)
              : exercice.niveau === "niveau4"
                ? formatEnonceCombineNiveau4Latex(exercice)
                : exercice.niveau === "denominateurCarre"
                  ? formatEnonceCombineDenominateurCarreLatex(exercice)
                  : exercice.niveau === "facteurCommun"
                    ? formatEnonceFacteurCommunSimplifieLatex(exercice)
                    : exercice.niveau === "sansFacteurCommun"
                      ? formatEnonceCombineSansFacteurCommunLatex(exercice)
                      : exercice.niveau === "cubique"
                        ? formatEnonceCubiqueLatex(exercice)
                        : formatEnonceInequationRationnelleLatex(exercice)
          }
          block
        />
      </div>
      {exercice.niveau === "niveau3" ? (
        <TableauSignesQuotientNiveau3Recap exercice={exercice} highlight={highlight} />
      ) : exercice.niveau === "niveau4" ? (
        <TableauSignesQuotientNiveau4Recap exercice={exercice} highlight={highlight} />
      ) : exercice.niveau === "denominateurCarre" ? (
        <TableauSignesQuotientDenominateurCarreRecap exercice={exercice} highlight={highlight} />
      ) : exercice.niveau === "facteurCommun" ? (
        <TableauSignesQuotientFacteurCommunRecap exercice={exercice} highlight={highlight} />
      ) : exercice.niveau === "sansFacteurCommun" ? (
        <TableauSignesQuotientSansFacteurCommunRecap exercice={exercice} highlight={highlight} />
      ) : exercice.niveau === "cubique" ? (
        <TableauSignesQuotientCubiqueRecap exercice={exercice} highlight={highlight} />
      ) : (
        <TableauSignesQuotientRecap exercice={exercice} highlight={highlight} />
      )}
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

      {forme === "intervalle" && <ListeMorceauxInput etat={liste} onChange={setListe} />}

      <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />

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
