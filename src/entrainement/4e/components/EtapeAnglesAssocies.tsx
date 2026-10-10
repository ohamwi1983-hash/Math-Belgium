import { useState } from "react";
import type { ExerciceAnglesAssocies } from "../core/anglesAssocies.types";
import { BlocEnonceAnglesAssocies } from "./BlocEnonceAnglesAssocies";
import { CercleTrigTrajetBase } from "./CercleTrigTrajetBase";
import { calculerAideCercleAnglesAssocies, fonctionCible, texteLabelQuestion } from "../ui/cercleAnglesAssociesAide";
import { CENTRE_CERCLE_TRIG, HAUTEUR_CERCLE_TRIG, RAYON_CERCLE_TRIG } from "../ui/cercleTrigGeometrie";
import { PLACEHOLDER_VALEUR_FINALE, texteAide2, texteAide3Intro } from "../ui/formatAnglesAssocies";
import { diagnostiquerValeurFinale, niveauAideMax } from "../moteur/verificationAnglesAssocies";
import { formatMessageErreur } from "../ui/messageErreur";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceAnglesAssocies;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (valeur: number) => void;
}

const X_TANGENTE = CENTRE_CERCLE_TRIG.x + RAYON_CERCLE_TRIG;

/**
 * Écran UNIQUE de "Angles associés" (refonte complète, `promptgen17refontecomplete.md` ; corrections
 * visuelles, `promptgen17gen15correctionsvisuelles.md`) — un seul champ de réponse numérique (la
 * valeur finale) avec une aide progressive additive à paliers, réutilisant `CercleTrigTrajetBase`
 * (générateur 14) comme socle du cercle (chiffres romains I-IV masqués, `masquerChiffresRomains` —
 * cet exercice ne pose jamais de question sur le numéro du quadrant lui-même) :
 * - Aide 1 (`niveauAide>=1`) — arc/rayon de `theta`, SANS son propre point sur le cercle ni son propre
 *   label (`afficherPointFinal={false}`/`afficherLabelAngleBrut={false}` — le point d'intersection
 *   rayon/cercle n'apporte rien de plus que le rayon lui-même, la valeur de l'angle est désormais
 *   intégrée au texte de la question) + UNE SEULE projection (celle de la fonction réellement
 *   demandée : point sur l'AXE, point de projection, pointillé de liaison — ce point de projection
 *   reste affiché, lui, contrairement au point sur le cercle), dans la MÊME couleur que `theta`
 *   (violet) ; le texte "fonction(theta°)=?" est positionné près du point de projection
 *   (`calculerAideCercleAnglesAssocies`, déjà repliée au bord du cadre pour le cas limite tan proche
 *   de 90°/270°). La droite tangente x=1 n'est tracée que pour la variante tangente. Les 3 arcs (aide
 *   1/2/3) sont tracés à des rayons concentriques FIXES par rôle (`RAYON_ARC_CIBLE`/`_ASSOCIE`/
 *   `_COMPLEMENTAIRE`, `ui/cercleAnglesAssociesAide.ts`), jamais recalculés selon le nombre d'aides
 *   réellement affichées pour la variante — sans quoi un balayage angulaire contenu dans un autre
 *   (ex. 22° dans 68°, dans 248°) rendait les tracés superposés et illisibles près de l'origine.
 * - Aide 2 (`niveauAide>=2`) — angle ASSOCIÉ (`xReference`) en orange : rayon + arc orienté (flèche)
 *   + point sur le cercle + valeur à l'extérieur du cercle, sur le modèle du rendu déjà en place
 *   pour l'aide "Angle du premier quadrant" des générateurs 14/15 (mêmes classes CSS
 *   `cercle-trig-rayon-question`/`-arc-question`/`-fleche-question`/`-point-question`) — plus un
 *   texte nommant explicitement la relation réelle avec les deux valeurs d'angle.
 * - Aide 3 (`niveauAide>=3`, uniquement si `niveauAideMax(exercice)===3`) — même logique graphique
 *   que l'aide 2 pour l'angle COMPLÉMENTAIRE (`alpha`), en vert — plus une phrase nommant les deux
 *   valeurs, sans formule générique.
 */
export function EtapeAnglesAssocies({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [texte, setTexte] = useState("");

  const nombre = Number(texte.trim().replace(",", "."));
  const complet = texte.trim() !== "";
  const statut = complet ? diagnostiquerValeurFinale(exercice, nombre) : undefined;

  const max = niveauAideMax(exercice);
  const aide = calculerAideCercleAnglesAssocies(exercice);

  return (
    <div>
      <BlocEnonceAnglesAssocies exercice={exercice} />
      <div className="field">
        <label className="field-label" htmlFor="angles-associes-valeur-finale">
          Réponse
        </label>
        <input
          id="angles-associes-valeur-finale"
          className={`text-input${tentativesUtilisees > 0 && statut !== undefined && statut !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_VALEUR_FINALE}
          value={texte}
          onChange={(e) => setTexte(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <CercleTrigTrajetBase
            trajet={aide.trajetTheta}
            labelAngleBrutTexte={`${exercice.theta}°`}
            afficherLabelAngleBrut={false}
            afficherPointFinal={false}
            masquerChiffresRomains
            ariaLabel="Cercle trigonométrique montrant l'angle de la question et la fonction trigonométrique demandée"
          >
            {fonctionCible(exercice) === "tan" && (
              <line x1={X_TANGENTE} y1={0} x2={X_TANGENTE} y2={HAUTEUR_CERCLE_TRIG} className="cercle-trig-tangente" />
            )}
            <line
              x1={aide.trajetTheta.pointFinal.x}
              y1={aide.trajetTheta.pointFinal.y}
              x2={aide.pointProjection.x}
              y2={aide.pointProjection.y}
              className="cercle-trig-projection-cible"
            />
            <circle cx={aide.pointProjection.x} cy={aide.pointProjection.y} r={4} className="cercle-trig-point-cible" />
            <text x={aide.pointQuestion.x} y={aide.pointQuestion.y} textAnchor={aide.ancrageQuestion} className="cercle-trig-label-cible">
              {texteLabelQuestion(exercice)}
            </text>

            {niveauAide >= 2 && (
              <>
                <line
                  x1={CENTRE_CERCLE_TRIG.x}
                  y1={CENTRE_CERCLE_TRIG.y}
                  x2={aide.trajetAssocie.pointFinal.x}
                  y2={aide.trajetAssocie.pointFinal.y}
                  className="cercle-trig-rayon-question"
                />
                <path d={aide.trajetAssocie.chemin} className="cercle-trig-arc-question" />
                <polygon points={aide.trajetAssocie.fleche} className="cercle-trig-fleche-question" />
                <circle cx={aide.trajetAssocie.pointFinal.x} cy={aide.trajetAssocie.pointFinal.y} r={5} className="cercle-trig-point-question" />
                <text x={aide.labelAssocie.x} y={aide.labelAssocie.y} textAnchor="middle" className="cercle-trig-label-associe">
                  {exercice.xReference}°
                </text>
              </>
            )}
            {niveauAide >= 3 && (
              <>
                <line
                  x1={CENTRE_CERCLE_TRIG.x}
                  y1={CENTRE_CERCLE_TRIG.y}
                  x2={aide.trajetComplementaire.pointFinal.x}
                  y2={aide.trajetComplementaire.pointFinal.y}
                  className="cercle-trig-rayon-complementaire"
                />
                <path d={aide.trajetComplementaire.chemin} className="cercle-trig-arc-complementaire" />
                <polygon points={aide.trajetComplementaire.fleche} className="cercle-trig-fleche-complementaire" />
                <circle
                  cx={aide.trajetComplementaire.pointFinal.x}
                  cy={aide.trajetComplementaire.pointFinal.y}
                  r={5}
                  className="cercle-trig-point-complementaire"
                />
                <text x={aide.labelComplementaire.x} y={aide.labelComplementaire.y} textAnchor="middle" className="cercle-trig-label-complementaire">
                  {exercice.alpha}°
                </text>
              </>
            )}
          </CercleTrigTrajetBase>
          {niveauAide >= 2 && <p>{texteAide2(exercice)}</p>}
          {niveauAide >= 3 && <p>{texteAide3Intro(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={max} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => complet && onValider(nombre)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
