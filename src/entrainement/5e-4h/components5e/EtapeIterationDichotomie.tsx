import { useState } from "react";
import type { ExerciceContexteEconomiqueBonus, IterationDichotomie } from "../core5e/contexteEconomique.types";
import type { ReponseIterationDichotomie } from "../moteur5e/verificationContexteEconomique";
import { consigneEcranRiche, consigneGenerale, formatNombreLatex, formatNombreTexte, formatTermesDonneesLatex, questionFinale, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatContexteEconomique";
import type { EcranContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { Katex } from "../components/Katex";
import { TexteRiche5e } from "./TexteRiche5e";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceContexteEconomiqueBonus;
  ecran: Extract<EcranContexteEconomique, "iteration0" | "iteration1" | "iteration2" | "iteration3">;
  /** Intervalle COURANT (gauche;droite) de CETTE itération — vérité terrain pré-calculée par le
   * générateur, JAMAIS recalculée depuis la réponse de l'élève à l'itération précédente (même
   * convention "bloc état actuel" qu'ailleurs sur la plateforme). */
  intervalleCourant: Pick<IterationDichotomie, "gauche" | "droite">;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseIterationDichotomie) => void;
  diagnostiquerMilieu: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran d'itération de dichotomie (bonus) — RÉPÉTÉ 4 fois (`iteration0`..`iteration3`), un seul
 * composant générique paramétré par l'intervalle courant. 3 sous-réponses combinées en une seule
 * validation : milieu (champ numérique EXACT, pas de tolérance décimale nécessaire — dénominateur
 * toujours une puissance de 2), signe de P(milieu) (2 boutons), sous-intervalle à conserver (2
 * boutons « [gauche ; milieu] » / « [milieu ; droite] » — la valeur du milieu n'y figure plus, elle
 * révélait la réponse du champ). Un seul essai sur les deux choix (audit 5e ch. 5, point 11). */
export function EtapeIterationDichotomie({
  exercice,
  ecran,
  intervalleCourant,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquerMilieu,
  validation,
}: Props) {
  const [milieu, setMilieu] = useState("");
  const [signe, setSigne] = useState<1 | -1 | null>(null);
  const [garder, setGarder] = useState<"gauche" | "droite" | null>(null);
  const [ecritureIllisible, setEcritureIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;
  /** Un seul essai sur les deux choix fermés : gelés après la première validation (un choix faux
   * clôt l'écran, voir `sessionContexteEconomique.ts`). */
  const choixGeles = tentativesUtilisees > 0 || Boolean(validation);
  const complet = milieu.trim() !== "" && signe !== null && garder !== null;
  const apresEchec = tentativesUtilisees > 0;
  const statutMilieu = apresEchec ? diagnostiquerMilieu(milieu) : null;

  const { gauche, droite } = intervalleCourant;

  function valider() {
    if (!complet) return;
    if (diagnostiquerMilieu(milieu) === "parse_error") {
      setEcritureIllisible(true);
      return;
    }
    setEcritureIllisible(false);
    onValider({ milieu, signe: signe as 1 | -1, garder: garder as "gauche" | "droite" });
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<TexteRiche5e texte={consigneGenerale(exercice)} />}
        blocDonnees={
          <div className="equation-box equation-box-donnees">
            {formatTermesDonneesLatex(exercice).map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        }
      />
      <p className="question-finale">
        <TexteRiche5e texte={questionFinale(exercice)} />
      </p>
      <div className="etat-actuel-box etat-actuel-box-termes">
        <Katex expression={`\\text{intervalle courant : } [${formatNombreLatex(gauche)}\\,;\\,${formatNombreLatex(droite)}]`} />
      </div>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranRiche(exercice, ecran)} />
      </p>

      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="\text{milieu}=" />
        </label>
        <input
          type="text"
          className={`text-input${statutMilieu && statutMilieu !== "correct" ? " is-erronee" : ""}`}
          value={milieu}
          onChange={(e) => setMilieu(e.target.value)}
          placeholder="milieu de l'intervalle"
        />
      </div>

      <p className="field-label field-label-minuscule">
        Signe de <Katex expression="P" /> au milieu
      </p>
      <div className="options-grid-compact">
        {([1, -1] as const).map((v) => (
          <button key={v} type="button" className={`btn${signe === v ? " toggle-active" : ""}`} onClick={() => setSigne(v)} disabled={choixGeles}>
            {v === 1 ? "+" : "−"}
          </button>
        ))}
      </div>

      <p className="field-label field-label-minuscule">Sous-intervalle à conserver</p>
      <div className="options-grid-compact">
        <button type="button" className={`btn${garder === "gauche" ? " toggle-active" : ""}`} onClick={() => setGarder("gauche")} disabled={choixGeles}>
          {`[${formatNombreTexte(gauche)} ; milieu]`}
        </button>
        <button type="button" className={`btn${garder === "droite" ? " toggle-active" : ""}`} onClick={() => setGarder("droite")} disabled={choixGeles}>
          {`[milieu ; ${formatNombreTexte(droite)}]`}
        </button>
      </div>

      <CalculatriceScientifique />
      {niveauAide >= 1 && (
        <div className="aide-5e">
          {(() => {
            const aide1 = texteAideNiveau1(ecran, exercice);
            return (
              <>
                <p>{aide1.texte}</p>
                {aide1.latex && <Katex expression={aide1.latex} block />}
              </>
            );
          })()}
          {niveauAide >= 2 &&
            (() => {
              const aide2 = texteAideNiveau2(exercice, ecran);
              return (
                <>
                  <p>{aide2.texte}</p>
                  {aide2.latex && <Katex expression={aide2.latex} block />}
                </>
              );
            })()}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {ecritureIllisible && (
          <p className="alert-error" role="alert">
            Écriture non reconnue : vérifie ta saisie (cette tentative n'est pas décomptée).
          </p>
        )}
        {!ecritureIllisible && montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, corrige le milieu.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
