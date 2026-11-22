import { useState } from "react";
import type { ExerciceEquationParaboleDeveloppee } from "../core/equationParaboleDeveloppee.types";
import { NIVEAU_AIDE_MAX_CARACTERISTIQUES } from "../moteur/sessionEquationParaboleDeveloppee";
import { diagnostiquerDirectrice, diagnostiquerFoyer, diagnostiquerP, diagnostiquerSommet } from "../moteur/verificationEquationParaboleDeveloppee";
import type { ReponseEcranCaracteristiques } from "../moteur/typesEquationParaboleDeveloppee";
import { CONSIGNE_CARACTERISTIQUES, CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE, PLACEHOLDER_COORDONNEE, PLACEHOLDER_P, placeholderDirectrice, formatAideCaracteristiquesNiveau1Latex, formatAideCaracteristiquesNiveau2Latex, formatEquationDeveloppeeLatex } from "../ui/formatEquationParaboleDeveloppee";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { PiedAnalytique } from "./PiedAnalytique";
import { ILLISIBLE_ANALYTIQUE, l, nombreOuNaN, nombresLisibles, t } from "../ui/retoursAnalytique";
import { normaliserSigneMoins as normaliserMoins } from "../../../lib/normaliserSaisie";
import { diagnostiquerEquivalenceQuadratiqueXY } from "../moteur/verificationEquationCercle";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

interface Props {
  exercice: ExerciceEquationParaboleDeveloppee;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseEcranCaracteristiques) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran 3 (dernier, toujours terminal) — la forme complétée CONFIRMÉE à l'écran 2 (et le
 * regroupement de l'écran 1) apparaissent désormais dans le récapitulatif accumulé en haut de
 * carte (`RecapitulatifPanel`/`AppEquationParaboleDeveloppee`), plus ici en isolation. S/F :
 * statut à 3 valeurs classique, 2 champs numériques chacun. p : 1 champ numérique
 * signé. Directrice : texte libre, gère les 2 orientations uniformément
 * (`diagnostiquerDirectrice`). Chaque champ diagnostiqué indépendamment pour isoler le piège
 * central (F et directrice échangés en cas d'erreur de signe sur p).
 */
export function EtapeCaracteristiquesEquationParaboleDeveloppee({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [sx, setSx] = useState("");
  const [sy, setSy] = useState("");
  const [fx, setFx] = useState("");
  const [fy, setFy] = useState("");
  const [p, setP] = useState("");
  const [directrice, setDirectrice] = useState("");

  const complet = [sx, sy, fx, fy, p, directrice].every((v) => v.trim() !== "");

  function construireReponse(): ReponseEcranCaracteristiques {
    return {
      sx: nombreOuNaN(sx),
      sy: nombreOuNaN(sy),
      fx: nombreOuNaN(fx),
      fy: nombreOuNaN(fy),
      p: nombreOuNaN(p),
      directrice,
    };
  }

  const apresEchec = tentativesUtilisees > 0;
  const reponse = apresEchec ? construireReponse() : null;
  const statutSommet = reponse ? diagnostiquerSommet(exercice, { x: reponse.sx, y: reponse.sy }) : undefined;
  const statutFoyer = reponse ? diagnostiquerFoyer(exercice, { x: reponse.fx, y: reponse.fy }) : undefined;
  const statutP = reponse ? diagnostiquerP(exercice, reponse.p) : undefined;
  const statutDirectrice = reponse ? diagnostiquerDirectrice(exercice, reponse.directrice) : undefined;

  const sommetErronee = apresEchec && statutSommet !== "correct";
  const foyerErronee = apresEchec && statutFoyer !== "correct";
  const pErronee = apresEchec && statutP !== "correct";
  const directriceErronee = apresEchec && statutDirectrice !== "correct";

  /** Message ciblé (jamais la réponse) : p au lieu de p/2, directrice du côté du foyer, p au lieu
   * de 2p. */
  function cible(r: ReponseEcranCaracteristiques) {
    const S = exercice.sommet;
    const vertical = exercice.variante === "vertical";
    const pp = exercice.p;
    const fLu = vertical ? r.fy : r.fx;
    const sAxe = vertical ? S.y : S.x;
    if (Math.abs(fLu - (sAxe + pp)) < 1e-9 && pp !== 0) return [t("Le foyer est à "), l("\\dfrac{p}{2}"), t(" du sommet, pas à "), l("p"), t(" : p est la distance entre le foyer et la directrice.")];
    if (Number.isFinite(r.p) && Math.abs(r.p - pp / 2) < 1e-9) return [t("Compare au modèle du cours : le coefficient du second membre vaut "), l("2p"), t(", donc p est la moitié de ce coefficient.")];
    const autreCote = vertical ? (x: number, y: number) => y - (S.y + pp / 2) + 0 * x : (x: number, y: number) => x - (S.x + pp / 2) + 0 * y;
    if (diagnostiquerEquivalenceQuadratiqueXY(r.directrice.replace(/^\s*d\s*(?::|≡)\s*/, ""), S.x, S.y, autreCote) === "correct") return [t("Ta directrice passe du côté du foyer : elle est de l'autre côté du sommet, à "), l("\\dfrac{p}{2}"), t(" de lui.")];
    return null;
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_CARACTERISTIQUES_PARABOLE}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationDeveloppeeLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_CARACTERISTIQUES}</p>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-sx">
            <Katex expression="x_S=" />
          </label>
          <input
            id="equation-parabole-developpee-sx"
            className={`text-input${sommetErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={sx}
            onChange={(e) => setSx(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-sy">
            <Katex expression="y_S=" />
          </label>
          <input
            id="equation-parabole-developpee-sy"
            className={`text-input${sommetErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={sy}
            onChange={(e) => setSy(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-fx">
            <Katex expression="x_F=" />
          </label>
          <input
            id="equation-parabole-developpee-fx"
            className={`text-input${foyerErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={fx}
            onChange={(e) => setFx(normaliserSigneMoins(e.target.value))}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-fy">
            <Katex expression="y_F=" />
          </label>
          <input
            id="equation-parabole-developpee-fy"
            className={`text-input${foyerErronee ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_COORDONNEE}
            value={fy}
            onChange={(e) => setFy(normaliserSigneMoins(e.target.value))}
          />
        </div>
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="equation-parabole-developpee-p">
          <Katex expression="p=" />
        </label>
        <input
          id="equation-parabole-developpee-p"
          className={`text-input${pErronee ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_P}
          value={p}
          onChange={(e) => setP(normaliserSigneMoins(e.target.value))}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="equation-parabole-developpee-directrice">
          Directrice :
        </label>
        <input
          id="equation-parabole-developpee-directrice"
          className={`text-input${directriceErronee ? " is-erronee" : ""}`}
          placeholder={placeholderDirectrice(exercice)}
          value={directrice}
          onChange={(e) => setDirectrice(normaliserMoins(e.target.value))}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <Katex expression={formatAideCaracteristiquesNiveau1Latex(exercice)} />
          </p>
          {niveauAide >= 2 && (
            <p>
              <Katex expression={formatAideCaracteristiquesNiveau2Latex(exercice)} />
            </p>
          )}
        </div>
      )}
      {!validation && (
        <PiedAnalytique
          niveauAide={niveauAide}
          niveauAideMax={NIVEAU_AIDE_MAX_CARACTERISTIQUES}
          onActiverAide={onActiverAide}
          complet={complet}
          reponse={construireReponse}
          lisible={(r) => nombresLisibles(sx, sy, fx, fy, p) && diagnostiquerDirectrice(exercice, r.directrice) !== "parse_error"}
          onValider={onValider}
          texteIllisible={nombresLisibles(sx, sy, fx, fy) ? (nombresLisibles(p) ? ILLISIBLE_ANALYTIQUE.equationDroite : ILLISIBLE_ANALYTIQUE.parametre) : ILLISIBLE_ANALYTIQUE.coordonnee}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
