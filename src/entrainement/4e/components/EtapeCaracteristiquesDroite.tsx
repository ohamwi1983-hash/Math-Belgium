import { useState } from "react";
import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import { NIVEAU_AIDE_MAX_CARACTERISTIQUES } from "../moteur/sessionCaracteristiquesDroite";
import { cibleChampPrincipal, diagnostiquerCaracteristiques, diagnostiquerChamp, toleranceChampPrincipal } from "../moteur/verificationCaracteristiquesDroite";
import { ILLISIBLE_ANALYTIQUE, ciblePente, l, lireNombreAnalytique, t } from "../ui/retoursAnalytique";
import { nomAngle } from "../ui/formatCaracteristiquesDroite";
import { PiedAnalytique } from "./PiedAnalytique";
import type { ReponseCaracteristiques, ReponseChamp } from "../moteur/verificationCaracteristiquesDroite";
import { PLACEHOLDER_ANGLE, PLACEHOLDER_ORDONNEE, PLACEHOLDER_PENTE, QUESTION_ORDONNEE, QUESTION_PENTE, formatAideCaracteristiquesNiveau2Latex, segmentsAideCaracteristiquesNiveau1 } from "../ui/formatCaracteristiquesDroite";
import { ConsigneCaracteristiquesDroiteEcran2 } from "./ConsigneCaracteristiquesDroiteEcran2";
import { Katex } from "./Katex";
import { RenduFragments } from "./RenduFragments";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

type Choix = "existe" | "nExistePas";

interface Props {
  exercice: ExerciceCaracteristiquesDroite;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCaracteristiques) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Valeur saisie — entier, décimal (virgule ou point) ou fraction « p/q » (pente et ordonnée à
 * l'origine rationnelles, ex. −1/3, 5/3) ; `null` tant que le champ est vide ou incomplet. */
function lireValeur(valeur: string): ReponseChamp | null {
  if (valeur.trim() === "") return null;
  // Une saisie non vide mais illisible reste « complète » : « Valider » affiche alors le message
  // d'illisible, sans tentative (jamais un bouton grisé muet).
  const nombre = lireNombreAnalytique(valeur);
  return { existe: true, valeur: nombre !== null && Number.isFinite(nombre) ? nombre : Number.NaN };
}

function lisibleChamp(r: ReponseChamp | null): boolean {
  return r !== null && (!r.existe || Number.isFinite(r.valeur));
}

function champDepuisSaisie(choix: Choix | null, valeur: string, toggleDisponible: boolean): ReponseChamp | null {
  if (!toggleDisponible) return lireValeur(valeur);
  if (choix === "nExistePas") return { existe: false };
  if (choix === "existe") return lireValeur(valeur);
  return null;
}

/**
 * Écran 2 — pente-ou-angle (`exercice.caracteristiqueDemandee`, pente/angleOx/angleOy) + ordonnée
 * à l'origine. Le champ "angle" (Ox ou Oy) n'a JAMAIS de toggle "n'existe pas" (un angle avec un
 * axe reste toujours défini, y compris pour une verticale/horizontale) — seuls "pente" et
 * "ordonnée à l'origine" peuvent valoir "n'existe pas" (cas vertical). Chaque champ est diagnostiqué
 * INDÉPENDAMMENT en direct après un échec (`diagnostiquerChamp`), pour isoler une erreur sur l'un
 * sans jamais marquer l'autre à tort — le marquage disparaît dès que l'élève corrige, jamais figé à
 * l'instant de la dernière tentative. Les deux questions ("pente"/"ordonnée à l'origine") sont
 * chacune structurées dans leur propre bloc visuellement séparé et étiqueté (`.champ-bloc`,
 * `QUESTION_PENTE`/`QUESTION_ORDONNEE`) — corrige une ambiguïté sur 4 boutons empilés sans en-tête
 * (`promptgen46modifications.md`, point 3).
 */
export function EtapeCaracteristiquesDroite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const estAngle = exercice.caracteristiqueDemandee !== "pente";

  const [choixPrincipal, setChoixPrincipal] = useState<Choix | null>(null);
  const [valeurPrincipal, setValeurPrincipal] = useState("");
  const [choixOrdonnee, setChoixOrdonnee] = useState<Choix | null>(null);
  const [valeurOrdonnee, setValeurOrdonnee] = useState("");

  const reponsePrincipale = champDepuisSaisie(choixPrincipal, valeurPrincipal, !estAngle);
  const reponseOrdonnee = champDepuisSaisie(choixOrdonnee, valeurOrdonnee, true);
  const complet = reponsePrincipale !== null && reponseOrdonnee !== null;

  const apresEchec = tentativesUtilisees > 0;
  const statutPrincipal = apresEchec && reponsePrincipale !== null ? diagnostiquerChamp(reponsePrincipale, cibleChampPrincipal(exercice), toleranceChampPrincipal(exercice)) : undefined;
  const statutOrdonnee = apresEchec && reponseOrdonnee !== null ? diagnostiquerChamp(reponseOrdonnee, exercice.ordonneeOrigine) : undefined;
  const erroneePrincipal = statutPrincipal !== undefined && statutPrincipal !== "correct";
  const erroneeOrdonnee = statutOrdonnee !== undefined && statutOrdonnee !== "correct";
  const statutCombine = apresEchec && complet ? diagnostiquerCaracteristiques(exercice, { champPrincipal: reponsePrincipale, ordonnee: reponseOrdonnee }) : undefined;

  void statutCombine;

  /** Message ciblé (jamais la réponse) : pente inversée ou de signe changé, signe de p, angle
   * négatif non corrigé. */
  function cible(r: ReponseCaracteristiques) {
    const pr = r.champPrincipal;
    if (!exercice.verticale && pr.existe) {
      if (exercice.caracteristiqueDemandee === "pente") {
        const m = ciblePente(pr.valeur, exercice.pente!);
        if (m) return m;
      } else if (exercice.caracteristiqueDemandee === "angleOx" && Math.abs(pr.valeur - (exercice.angleDeg - 180)) <= 0.5) {
        return [t("La calculatrice donne un angle négatif : on ajoute 180°, l'angle d'une droite avec "), l("Ox"), t(" est compris entre 0° et 180°.")];
      }
    }
    const o = r.ordonnee;
    if (o.existe && exercice.ordonneeOrigine !== null && Math.abs(exercice.ordonneeOrigine) > 1e-9 && Math.abs(o.valeur + exercice.ordonneeOrigine) < 1e-6) {
      return [t("Le signe de ton ordonnée à l'origine est faux : "), l("p=y_A-m\\cdot x_A"), t(", c'est la valeur de "), l("y"), t(" quand "), l("x=0"), t(".")];
    }
    return null;
  }

  function choisirPrincipal(choix: Choix) {
    setChoixPrincipal(choix);
    setValeurPrincipal("");
  }
  function choisirOrdonnee(choix: Choix) {
    setChoixOrdonnee(choix);
    setValeurOrdonnee("");
  }

  return (
    <div>
      <ConsigneCaracteristiquesDroiteEcran2 exercice={exercice} />

      {estAngle ? (
        <div className="field">
          <label className="field-label field-label-minuscule" htmlFor="caracteristiques-droite-principal">
            Angle <Katex expression={nomAngle(exercice)} /> (en degrés, arrondi à l'unité) =
          </label>
          <input
            id="caracteristiques-droite-principal"
            className={`text-input${erroneePrincipal ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_ANGLE}
            value={valeurPrincipal}
            onChange={(e) => setValeurPrincipal(normaliserSigneMoins(e.target.value))}
          />
        </div>
      ) : (
        <div className="champ-bloc">
          <p className="champ-bloc-question">{QUESTION_PENTE}</p>
          <div className="options-grid">
            <button type="button" className={choixPrincipal === "nExistePas" ? "btn toggle-active" : "btn"} onClick={() => choisirPrincipal("nExistePas")}>
              N'existe pas
            </button>
            <button type="button" className={choixPrincipal === "existe" ? "btn toggle-active" : "btn"} onClick={() => choisirPrincipal("existe")}>
              Existe
            </button>
          </div>
          {choixPrincipal === "existe" && (
            <div className="field contenu-conditionnel">
              <label className="field-label field-label-minuscule" htmlFor="caracteristiques-droite-principal">
                Pente m =
              </label>
              <input
                id="caracteristiques-droite-principal"
                className={`text-input${erroneePrincipal ? " is-erronee" : ""}`}
                placeholder={PLACEHOLDER_PENTE}
                value={valeurPrincipal}
                onChange={(e) => setValeurPrincipal(normaliserSigneMoins(e.target.value))}
              />
            </div>
          )}
        </div>
      )}

      <div className="champ-bloc">
        <p className="champ-bloc-question">{QUESTION_ORDONNEE}</p>
        <div className="options-grid">
          <button type="button" className={choixOrdonnee === "nExistePas" ? "btn toggle-active" : "btn"} onClick={() => choisirOrdonnee("nExistePas")}>
            N'existe pas
          </button>
          <button type="button" className={choixOrdonnee === "existe" ? "btn toggle-active" : "btn"} onClick={() => choisirOrdonnee("existe")}>
            Existe
          </button>
        </div>
        {choixOrdonnee === "existe" && (
          <div className="field contenu-conditionnel">
            <label className="field-label field-label-minuscule" htmlFor="caracteristiques-droite-ordonnee">
              Ordonnée à l'origine p =
            </label>
            <input
              id="caracteristiques-droite-ordonnee"
              className={`text-input${erroneeOrdonnee ? " is-erronee" : ""}`}
              placeholder={PLACEHOLDER_ORDONNEE}
              value={valeurOrdonnee}
              onChange={(e) => setValeurOrdonnee(normaliserSigneMoins(e.target.value))}
            />
          </div>
        )}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>
            <RenduFragments fragments={segmentsAideCaracteristiquesNiveau1(exercice)} />
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
          reponse={() => ({ champPrincipal: reponsePrincipale as ReponseChamp, ordonnee: reponseOrdonnee as ReponseChamp })}
          lisible={(r) => lisibleChamp(r.champPrincipal) && lisibleChamp(r.ordonnee)}
          onValider={onValider}
          texteIllisible={!lisibleChamp(reponsePrincipale) && estAngle ? ILLISIBLE_ANALYTIQUE.angle : ILLISIBLE_ANALYTIQUE.pentePente}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
