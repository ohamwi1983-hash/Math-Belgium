import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceOmbreSoleilSolidePose } from "../core/ombreSoleil.types";
import { NIVEAU_AIDE_MAX_CONTOUR } from "../moteur/sessionOmbreSoleil";
import {
  aidesContourSolidePose,
  appliquerEtiquettes,
  cibleSelectionContour,
  consigneContourSolidePose,
  COULEURS_OMBRE,
  dessinSegmentContour,
  elementsContourSolidePose,
  elementsScene,
  fusionner,
  libelleSegmentContour,
  ombresSolidePose,
  placerEtiquettesSolidePose,
  solidePourAffichage,
} from "../ui/formatOmbreSoleil";
import type { ElementsCroquis } from "../ui/formatOmbreSoleil";
import { Solide3DSketch } from "./Solide3DSketch";
import { BoutonAide } from "./BoutonAide";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { TexteInsistance } from "../../components/TexteInsistance";
import type { FicheChoixOmbre } from "./ChoixCandidatsOmbre";

interface Props {
  exercice: ExerciceOmbreSoleilSolidePose;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (ids: string[], fiche: FicheChoixOmbre) => void;
  validation?: ValidationEtapeProps | null;
}

function memeSelection(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/**
 * Variante D (solide posé au sol), dernier écran noté — le contour de l'ombre : cocher, parmi les
 * ombres de TOUTES les arêtes (une arête de la base est sa propre ombre), celles qui forment le bord.
 * Sélection MULTIPLE (cases carrées), trois tentatives ; chaque segment coché se dessine en orange sur
 * la figure. Message ciblé après une sélection refusée (segment intérieur coché / côté oublié, sans
 * dire lesquels) ; une fois l'écran clos, les côtés du contour en vert ✓ (même oubliés), les segments
 * choisis à tort en rouge ✗.
 */
export function EtapeContourSolidePose({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
  const [choisis, setChoisis] = useState<string[]>([]);
  const [soumis, setSoumis] = useState<string[] | null>(null);
  const gele = Boolean(validation);
  const aides = aidesContourSolidePose(exercice);
  const segments = exercice.segmentsCandidats;

  const { fond, decalages } = useMemo(() => {
    const fondBrut = fusionner(elementsScene(exercice), ombresSolidePose(exercice, exercice.piquets.length));
    // Étiquettes placées sur la figure de l'écran clos (fond + côtés du contour) : la placer sur les 12
    // segments candidats à la fois la serrait trop (mesuré : plus de contacts, même avec ce qui reste
    // dessiné) ; seul un segment coché À TORT peut donc frôler une étiquette.
    const tout: ElementsCroquis = fusionner(fondBrut, elementsContourSolidePose(exercice));
    const d = placerEtiquettesSolidePose(exercice, tout);
    return { fond: appliquerEtiquettes(fondBrut, d), decalages: d };
  }, [exercice]);

  function dessinSelection(ids: readonly string[], cloture: boolean): ElementsCroquis {
    const traces = segments.flatMap((s) => {
      const coche = ids.includes(s.id);
      if (cloture) {
        if (s.surContour) return [dessinSegmentContour(exercice, s, COULEURS_OMBRE.correct)];
        return coche ? [dessinSegmentContour(exercice, s, COULEURS_OMBRE.refuse)] : [];
      }
      return coche ? [dessinSegmentContour(exercice, s, COULEURS_OMBRE.selection)] : [];
    });
    return { points: [], segments: traces };
  }

  function croquis(ids: readonly string[], cloture: boolean): ReactNode {
    const e = appliquerEtiquettes(fusionner(fond, dessinSelection(ids, cloture)), decalages);
    return <Solide3DSketch solide={solidePourAffichage(exercice)} pointsExtra={e.points} segmentsExtra={e.segments} labelsSommets={false} />;
  }

  function basculer(id: string) {
    if (gele) return;
    setChoisis((liste) => (liste.includes(id) ? liste.filter((n) => n !== id) : [...liste, id]));
  }

  function valider() {
    if (choisis.length === 0) return;
    setSoumis(choisis);
    const contour = segments.filter((s) => s.surContour).map((s) => s.id);
    onValider(choisis, { votreReponse: croquis(choisis, false), reponseAttendue: croquis(contour, true) });
  }

  const selectionRefusee = !gele && tentativesUtilisees > 0 && soumis !== null && memeSelection(soumis, choisis);

  function classe(id: string, surContour: boolean): string {
    const actif = choisis.includes(id);
    if (gele) return surContour ? "btn is-juste" : actif ? "btn is-faux" : "btn";
    return `btn${actif ? " toggle-active" : ""}${selectionRefusee && actif ? " is-erronee" : ""}`;
  }

  function aria(id: string, surContour: boolean): string | undefined {
    if (!gele) return undefined;
    const actif = choisis.includes(id);
    if (surContour) return actif ? "choisi, juste" : "côté du contour, oublié";
    return actif ? "choisi à tort" : undefined;
  }

  return (
    <div>
      <p className="prompt-text">{consigneContourSolidePose(exercice)}</p>
      {croquis(choisis, gele)}

      <div className="options-grid-compact options-multiples" role="group" aria-label="Segments du contour de l'ombre">
        {segments.map((s) => {
          const libelleAria = aria(s.id, s.surContour);
          return (
            <button key={s.id} type="button" role="checkbox" className={classe(s.id, s.surContour)} onClick={() => basculer(s.id)} aria-checked={choisis.includes(s.id)} disabled={gele}>
              {libelleSegmentContour(s)}
              {libelleAria && <span className="sr-only"> — {libelleAria}</span>}
            </button>
          );
        })}
      </div>

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          {aides.slice(0, niveauAide).map((a, i) => (
            <p key={i}>
              <TexteInsistance texte={a} />
            </p>
          ))}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CONTOUR} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={choisis.length === 0} onClick={valider}>
            Valider
          </button>
          {tentativesUtilisees > 0 && soumis !== null && (
            <p className="alert-error" role="alert">
              <span>
                {cibleSelectionContour(exercice, soumis)} Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
              </span>
            </p>
          )}
        </>
      )}
      {validation && (
        <ValidationEcran
          {...validation}
          messageRevele={validation.revele && soumis ? `${cibleSelectionContour(exercice, soumis)} Le contour est en vert sur la figure.` : validation.messageRevele}
          reponseAttendue={<p>Contour {exercice.nomsContour.join("")}, en vert sur la figure.</p>}
        />
      )}
    </div>
  );
}
