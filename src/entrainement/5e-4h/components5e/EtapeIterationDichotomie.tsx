import { useState } from "react";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { ariaOptionChoixFerme, classeOptionChoixFerme } from "../../4e/ui/choixFige";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceContexteEconomiqueBonus, IterationDichotomie } from "../core5e/contexteEconomique.types";
import type { ReponseIterationDichotomie } from "../moteur5e/verificationContexteEconomique";
import { consigneEcranRiche, consigneGenerale, formatNombreLatex, formatNombreTexte, formatTermesDonneesLatex, questionFinale } from "../ui5e/formatContexteEconomique";
import type { EcranContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { Katex } from "../components/Katex";
import { TexteRiche5e } from "./TexteRiche5e";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
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
  /** Message ciblé sur l'erreur trahie par la dernière réponse fausse (lot B). */
  cible?: (valeurs: { milieu: string }) => FragmentConsigne[] | null;
  /** Aides à deux niveaux (niveau 2 posé pour l'instance). */
  aides: AideTrig[];
  /** Message d'illisible par nature de champ (déjà terminé par « … ne compte pas comme une tentative. »). */
  texteIllisible?: string;
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
  validation, cible, aides, texteIllisible }: Props) {
  const [milieu, setMilieu] = useState("");
  const [signe, setSigne] = useState<1 | -1 | null>(null);
  const [garder, setGarder] = useState<"gauche" | "droite" | null>(null);
  const [soumises, setSoumises] = useState<{ milieu: string } | null>(null);
  const [ecritureIllisible, setEcritureIllisible] = useState(false);
  /** Un seul essai sur les deux choix fermés : gelés après la première validation (un choix faux
   * clôt l'écran, voir `sessionContexteEconomique.ts`). */
  const choixGeles = tentativesUtilisees > 0 || Boolean(validation);
  const complet = milieu.trim() !== "" && signe !== null && garder !== null;
  const apresEchec = tentativesUtilisees > 0;
  const statutMilieu = apresEchec ? diagnostiquerMilieu(milieu) : null;

  const { gauche, droite } = intervalleCourant;
  const iteration = exercice.iterations[["iteration0", "iteration1", "iteration2", "iteration3"].indexOf(ecran)];

  function valider() {
    if (!complet) return;
    if (diagnostiquerMilieu(milieu) === "parse_error") {
      setEcritureIllisible(true);
      return;
    }
    setEcritureIllisible(false);
    setSoumises({ milieu });
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
          <button key={v} type="button" className={classeOptionChoixFerme<1 | -1 | null>(v, { selection: signe, choisie: validation ? signe : null, bonne: iteration.signeMilieu })} aria-label={ariaOptionChoixFerme<1 | -1 | null>(v, { choisie: validation ? signe : null, bonne: iteration.signeMilieu })} onClick={() => setSigne(v)} disabled={choixGeles}>
            {v === 1 ? "+" : "−"}
          </button>
        ))}
      </div>

      <p className="field-label field-label-minuscule">Sous-intervalle à conserver</p>
      <div className="options-grid-compact">
        <button type="button" className={classeOptionChoixFerme<"gauche" | "droite" | null>("gauche", { selection: garder, choisie: validation ? garder : null, bonne: iteration.garderCote })} onClick={() => setGarder("gauche")} disabled={choixGeles}>
          {`[${formatNombreTexte(gauche)} ; milieu]`}
        </button>
        <button type="button" className={classeOptionChoixFerme<"gauche" | "droite" | null>("droite", { selection: garder, choisie: validation ? garder : null, bonne: iteration.garderCote })} onClick={() => setGarder("droite")} disabled={choixGeles}>
          {`[milieu ; ${formatNombreTexte(droite)}]`}
        </button>
      </div>

      <CalculatriceScientifique />
      <PiedEcranFonctions
        aides={aides}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={ecritureIllisible}
        texteIllisible={texteIllisible ?? "Écriture non reconnue : vérifie les nombres, les parenthèses et la place de la variable. Cette saisie ne compte pas comme une tentative."}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumises !== null && tentativesUtilisees > 0 && cible ? cible(soumises) : null}
        validation={validation}
      />
    </div>
  );
}
