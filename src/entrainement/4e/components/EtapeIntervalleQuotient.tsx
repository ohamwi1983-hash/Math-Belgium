import { useState } from "react";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { ExerciceInequationRationnelle } from "../core/inequationRationnelle.types";
import type { SolutionEnsembleProduit } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import {
  formatEnonceCombineDenominateurCarreLatex,
  formatEnonceCombineNiveau3Latex,
  formatEnonceCombineNiveau4Latex,
  formatEnonceCombineSansFacteurCommunLatex,
  formatEnonceFacteurCommunSimplifieLatex,
  formatEnonceInequationRationnelleLatex,
} from "../ui/formatInequationRationnelle";
import { ListeMorceauxInput } from "./ListeMorceauxInput";
import { ListePointsIsolesInput, construirePointsIsoles } from "./ListePointsIsolesInput";
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
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { MESSAGE_BORNE_ILLISIBLE, MessageRetour, useTentativeLisible } from "./RetourSaisie";
import { RenduFragments } from "./RenduFragments";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { lireNombreSaisi } from "../ui/lireNombre";

type Forme = SolutionEnsembleProduit["forme"];

const OPTIONS_FORME: { valeur: Forme; libelle: string }[] = [
  { valeur: "vide", libelle: "∅" },
  { valeur: "reel", libelle: "ℝ" },
  { valeur: "point", libelle: "Un point" },
  { valeur: "reel_sauf_points", libelle: "Tous les réels sauf un ou plusieurs points" },
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
 * Étape "intervalle solution" (section 2, point 3 de la spec) : construction guidée déjà
 * généralisée (SolutionEnsembleProduit, plusieurs morceaux, notation francophone), même mécanisme
 * que EtapeIntervalleProduit.tsx (exercice "tableau de signes à plusieurs facteurs"). Affiche en
 * rappel la grille de signes correctement remplie (TableauSignesQuotientRecap) et un bouton "Aide"
 * (activation à sens unique, prompt de corrections) — même principe que
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
  const highlight = surligne ? calculerAideGrilleQuotient(exercice) : undefined;

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      {exercice.niveau !== "niveau1" && exercice.niveau !== "cubique" && (
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
                        : formatEnonceInequationRationnelleLatex(exercice)
            }
            block
          />
        </div>
      )}
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
