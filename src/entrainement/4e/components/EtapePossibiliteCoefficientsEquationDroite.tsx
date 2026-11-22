import { useState } from "react";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../ui/choixFige";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import type { ReponsePossibiliteCoefficients } from "../moteur/typesEquationDroite";
import { diagnostiquerPossibiliteCoefficients, estBonneDroiteMauvaiseForme } from "../moteur/verificationEquationDroite";
import { NIVEAU_AIDE_MAX_POSSIBILITE_COEFFICIENTS } from "../moteur/sessionEquationDroite";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatAideNiveau2PossibiliteCoefficientsLatex, formatEnonceLatex, latexGabaritPossibiliteCoefficients, segmentsConsignePossibiliteCoefficients } from "../ui/formatEquationDroite";
import { ILLISIBLE_ANALYTIQUE, cibleEquationDroite, l, t } from "../ui/retoursAnalytique";
import { normaliserSaisieEquation } from "../moteur/verificationEquationDroite";
import { parserEquationDroiteXY } from "../moteur/verificationDroite";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { ConsigneGeneraleEquationDroite } from "./ConsigneGeneraleEquationDroite";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponsePossibiliteCoefficients) => void;
  /** Choix déjà jugé par le moteur (une seule fois), `null` tant qu'il ne l'est pas. */
  choixFige: { choisi: "possible" | "impossible"; correct: boolean } | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Placeholder du champ texte — adapté au choix ET à la forme testée (`exercice.formeCible`,
 * explicite_y/explicite_x uniquement pour cet écran). Exemples HORS de l'espace des tirages (pente
 * 0,4 avec ordonnée 1,7, jamais atteinte — dénominateur 5 pour m, 10 pour p ; triplet 7/−9
 * irréalisable avec des composantes ≤ 5) : jamais la réponse (audit chapitre 7, point 10). */
function placeholderEquation(exercice: ExerciceEquationDroite, choix: "possible" | "impossible"): string {
  if (choix === "impossible") return "ex : 7x-9y+1=0";
  return exercice.formeCible === "explicite_y" ? "ex : y=0,4x+1,7" : "ex : x=0,4y+1,7";
}

/** Libellé KaTeX de la forme testée, pour le message « bonne droite, mauvaise forme ». */
function latexFormeTestee(exercice: ExerciceEquationDroite): string {
  return exercice.formeCible === "explicite_y" ? "y = mx + p" : "x = ny + q";
}

/**
 * Écran fusionné "possibilité + équation" (formes explicite_y/explicite_x uniquement,
 * `promptgen42modificationsv2.md`, partie A) — remplace l'ancien couple d'écrans "possibilite"
 * (choix catégoriel seul) + "coefficients" (champs numériques séparés m/p ou n/q) : une seule
 * question ("Cette droite peut-elle s'écrire sous forme $x=ny+q$/$y=mx+p$ ?"), puis un champ TEXTE
 * LIBRE unique dont le contenu attendu dépend du choix — la forme testée si "possible", la forme
 * implicite de secours (toujours atteignable) si "impossible". Vérifié par
 * `diagnostiquerPossibiliteCoefficients`, qui accepte n'importe quelle représentation valide de la
 * droite (`diagnostiquerEquationDroiteLibre`) quel que soit le choix, jamais un format imposé.
 */
export function EtapePossibiliteCoefficientsEquationDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, choixFige, validation }: Props) {
  const [choixLibre, setChoix] = useState<"possible" | "impossible" | null>(null);
  const [texte, setTexte] = useState("");
  const bonChoix: "possible" | "impossible" = exercice.possible ? "possible" : "impossible";
  /** Choix affiché : le choix libre tant qu'il n'est pas jugé ; ensuite le bon (révélé s'il était faux). */
  const choix = choixFige ? (choixFige.correct ? choixFige.choisi : bonChoix) : choixLibre;
  const choixBloque = !!validation || choixFige !== null;
  // Choix jugé (figé, ou écran clos) : l'option choisie fausse en rouge, la bonne en vert.
  const etatOptions = { selection: choixLibre, choisie: choixFige ? choixFige.choisi : validation ? choixLibre : null, bonne: bonChoix };
  const aria = (o: "possible" | "impossible") => ariaOptionChoixFerme(o, etatOptions);

  function choisir(nouveauChoix: "possible" | "impossible") {
    setChoix(nouveauChoix);
    setTexte("");
  }

  const complet = choix !== null && texte.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statut: StatutVerification | undefined = apresEchec && choix !== null ? diagnostiquerPossibiliteCoefficients(exercice, { choix, texte }) : undefined;
  const erronee = apresEchec && statut !== "correct";

  /** Message ciblé sur l'équation transmise (jugée avec le bon choix). */
  function cible(r: ReponsePossibiliteCoefficients) {
    if (estBonneDroiteMauvaiseForme(exercice, { choix: bonChoix, texte: r.texte })) {
      return [t("Ton équation décrit bien cette droite, mais elle n'est pas écrite sous la forme "), l(latexFormeTestee(exercice)), t(".")];
    }
    return cibleEquationDroite(parserEquationDroiteXY(normaliserSaisieEquation(r.texte).replace(/\s+/g, "")), exercice.referenceImplicite, exercice.point);
  }

  const messageChoixFaux =
    exercice.possible
      ? [t("Ce n'était pas le bon choix : cette droite n'est pas parallèle à l'axe concerné, elle peut s'écrire sous la forme "), l(latexFormeTestee(exercice)), t(". Écris maintenant son équation sous cette forme.")]
      : [t(`Ce n'était pas le bon choix : cette droite est ${exercice.formeCible === "explicite_y" ? "verticale" : "horizontale"}, elle ne peut pas s'écrire sous la forme `), l(latexFormeTestee(exercice)), t(". Écris maintenant une autre équation de cette droite.")];

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<ConsigneGeneraleEquationDroite exercice={exercice} />}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEnonceLatex(exercice)} />
          </div>
        }
      />
      <p className="prompt-text">
        <RenduFragments fragments={segmentsConsignePossibiliteCoefficients(exercice)} />
      </p>

      <div className="options-grid-compact">
        <button disabled={choixBloque} type="button" className={classeOptionChoixFerme("possible", etatOptions)} onClick={() => choisir("possible")}>
          Possible{aria("possible") && <span className="sr-only"> — {aria("possible")}</span>}
        </button>
        <button disabled={choixBloque} type="button" className={classeOptionChoixFerme("impossible", etatOptions)} onClick={() => choisir("impossible")}>
          Impossible{aria("impossible") && <span className="sr-only"> — {aria("impossible")}</span>}
        </button>
      </div>
      {choixFige !== null && !choixFige.correct && !validation && (
        <p className="alert-error" role="status">
          <span>
            <RenduFragments fragments={messageChoixFaux} />
          </span>
        </p>
      )}

      {choix !== null && (
        <div className="field contenu-conditionnel">
          <label className="field-label" htmlFor="equation-droite-possibilite-coefficients-texte">
            Équation
          </label>
          <input
            id="equation-droite-possibilite-coefficients-texte"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={placeholderEquation(exercice, choix)}
            value={texte}
            onChange={(e) => setTexte(normaliserSigneMoins(e.target.value))}
          />
        </div>
      )}

      {niveauAide > 0 && choix !== null && (
        <div className="triangle-quelconque-aide">
          <p>
            <Katex expression={latexGabaritPossibiliteCoefficients(exercice, choix)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideNiveau2PossibiliteCoefficientsLatex(exercice, choix)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_POSSIBILITE_COEFFICIENTS}
          onActiverAide={onActiverAide}
          aideIndisponible={choix === null}
          complet={complet}
          reponse={() => ({ choix: choix ?? "possible", texte })}
          lisible={(r) => diagnostiquerPossibiliteCoefficients(exercice, r) !== "parse_error"}
          onValider={onValider}
          texteIllisible={ILLISIBLE_ANALYTIQUE.equationDroite}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
