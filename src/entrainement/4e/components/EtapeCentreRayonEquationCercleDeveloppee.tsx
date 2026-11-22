import { useState } from "react";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../ui/choixFige";
import { natureEquationCercle } from "../moteur/verificationEquationCercleDeveloppee";

type Nature = "cercle" | "point" | "vide";
const NATURES: Nature[] = ["cercle", "point", "vide"];
const LIBELLE_NATURE: Record<Nature, string> = { cercle: "Un cercle", point: "Un seul point", vide: "Aucun point" };
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import { NIVEAU_AIDE_MAX_CENTRE_RAYON } from "../moteur/sessionEquationCercleDeveloppee";
import { diagnostiquerCentreRayon } from "../moteur/verificationEquationCercleDeveloppee";
import type { ReponseEcranCentreRayon } from "../moteur/typesEquationCercleDeveloppee";
import { consigneGeneraleCentreRayon, PLACEHOLDER_COORDONNEE, PLACEHOLDER_RAYON, segmentsAideCentreRayonNiveau1, formatEquationDeveloppeeLatex, formatEquationReduiteLatex, segmentsConsigneCentreRayon } from "../ui/formatEquationCercleDeveloppee";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, l, lireNombreAnalytique, nombreOuNaN, nombresLisibles, t } from "../ui/retoursAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceEquationCercleDeveloppee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEcranCentreRayon) => void;
  /** Variante « Est-ce un cercle ? » : nature déjà jugée par le moteur (une fois), sinon `null`. */
  natureFigee?: { choisie: Nature; correcte: boolean } | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 3 (dernier, toujours terminal) — la forme complétée CONFIRMÉE à l'écran 2 (et le
 * regroupement de l'écran 1) apparaissent désormais dans le récapitulatif accumulé en haut de
 * carte (`RecapitulatifPanel`/`AppEquationCercleDeveloppee`), plus ici en isolation. Centre : 2
 * champs numériques, statut à 3 valeurs classique. Rayon : champ de texte
 * libre, parsé symboliquement (couvre les deux variantes de façon uniforme, jamais confondu avec
 * r² — le piège central de l'exercice).
 */
export function EtapeCentreRayonEquationCercleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation, natureFigee = null }: Props) {
  const estNature = exercice.variante === "est_ce_un_cercle";
  const bonneNature = natureEquationCercle(exercice);
  const [natureLibre, setNatureLibre] = useState<Nature | null>(null);
  const nature: Nature | null = natureFigee ? (natureFigee.correcte ? natureFigee.choisie : bonneNature) : natureLibre;
  const champsVisibles = !estNature || nature === "cercle";
  const etatOptions = { selection: natureLibre, choisie: natureFigee ? natureFigee.choisie : validation ? natureLibre : null, bonne: bonneNature };
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [rayon, setRayon] = useState("");

  const complet = estNature ? nature !== null && (nature !== "cercle" || [x, y, rayon].every((v) => v.trim() !== "")) : [x, y, rayon].every((v) => v.trim() !== "");

  /** Coordonnée lue comme entier, décimal ou fraction (« 1/2 », « -5/2 ») — le centre est souvent
   * demi-entier et la réponse affichée l'écrit en fraction (audit chapitre 7, point 9). */
  const lireCoordonnee = nombreOuNaN;

  /** Message ciblé (jamais la réponse) : signe du centre, r² pris pour r. */
  function cible(r: ReponseEcranCentreRayon) {
    const c = exercice.centre;
    if ((r.x === -c.x && c.x !== 0) || (r.y === -c.y && c.y !== 0)) return [t("Attention au signe : "), l("(x-x_0)^2"), t(" donne le centre d'abscisse "), l("x_0"), t(" ; "), l("(x+3)^2"), t(" correspond à "), l("x_0=-3"), t(".")];
    const lu = lireNombreAnalytique(r.rayon);
    if (lu !== null && Math.abs(lu - exercice.rayonCarre) < 1e-9 && exercice.rayonCarre !== exercice.rayon) return [t("Tu as donné "), l("r^2"), t(" : le rayon est la racine carrée du second membre.")];
    return null;
  }

  function construireReponse(): ReponseEcranCentreRayon {
    return { x: lireCoordonnee(x), y: lireCoordonnee(y), rayon, ...(estNature && nature ? { nature } : {}) };
  }

  const apresEchec = tentativesUtilisees > 0;
  const statut = apresEchec ? diagnostiquerCentreRayon(exercice, { x: lireCoordonnee(x), y: lireCoordonnee(y) }, rayon) : undefined;
  const centreErronee = apresEchec && statut!.centre !== "correct";
  const rayonErronee = apresEchec && statut!.rayon !== "correct";

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGeneraleCentreRayon(exercice)}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsigneCentreRayon(exercice)} />
      </p>

      {estNature && (
        <div className="options-grid">
          {NATURES.map((n) => (
            <button key={n} type="button" disabled={!!validation || natureFigee !== null} className={classeOptionChoixFerme<Nature>(n, etatOptions)} onClick={() => setNatureLibre(n)}>
              {LIBELLE_NATURE[n]}
              {ariaOptionChoixFerme(n, etatOptions) && <span className="sr-only"> — {ariaOptionChoixFerme(n, etatOptions)}</span>}
            </button>
          ))}
        </div>
      )}
      {estNature && natureFigee !== null && !natureFigee.correcte && !validation && (
        <p className="alert-error" role="status">
          <span>Ce n'était pas la bonne nature : le second membre de la forme complétée est positif, c'est un cercle. Donne maintenant son centre et son rayon.</span>
        </p>
      )}

      {champsVisibles && (
      <>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-cercle-developpee-centre-x">
            x₀ =
          </label>
          <input
            id="equation-cercle-developpee-centre-x"
            className={`text-input${centreErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={x}
            onChange={(e) => setX(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-cercle-developpee-centre-y">
            y₀ =
          </label>
          <input
            id="equation-cercle-developpee-centre-y"
            className={`text-input${centreErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={y}
            onChange={(e) => setY(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="equation-cercle-developpee-rayon">
          r =
        </label>
        <input
          id="equation-cercle-developpee-rayon"
          className={`text-input${rayonErronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_RAYON}
          value={rayon}
          onChange={(e) => setRayon(normaliserSigneMoins(e.target.value))}
        />
      </div>
      </>
      )}

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideCentreRayonNiveau1(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatEquationReduiteLatex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_CENTRE_RAYON}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={() => construireReponse()}
          lisible={(r) => !champsVisibles || (nombresLisibles(x, y) && diagnostiquerCentreRayon(exercice, { x: r.x, y: r.y }, r.rayon).rayon !== "parse_error")}
          onValider={onValider}
          texteIllisible={nombresLisibles(x, y) ? ILLISIBLE_ANALYTIQUE.rayon : ILLISIBLE_ANALYTIQUE.coordonnee}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
