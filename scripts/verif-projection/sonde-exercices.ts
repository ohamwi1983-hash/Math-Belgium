// Sonde (hors appli, jamais importée) : énoncé papier, corrigé détaillé et réponse brève d'un générateur, comme les
// tire « Projeter un exercice ».
//   npx esbuild scripts/verif-projection/sonde-exercices.ts --bundle --platform=node --format=esm --loader:.css=empty --outfile=<tmp>/sonde.mjs
//   node <tmp>/sonde.mjs 6gen9 gen57
import { EVALUATION_ADAPTER_REGISTRY } from '../../src/lib/evaluationAdapterRegistry'

const ids = process.argv.slice(2)
for (const id of ids) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a: any = EVALUATION_ADAPTER_REGISTRY[id]
  const inst = a.genererInstance()
  const p = a.enoncePapier?.(inst)
  console.log('==', id, a.titreDocument, (a.catalogueVariantes || []).map((v: { id: string; label: string }) => v.id + ':' + v.label).join(' | '))
  console.log(JSON.stringify(p?.section ?? a.construireEnonce(inst)).slice(0, 900))
  console.log(
    JSON.stringify(
      (a.correctionDetaillee?.(inst) ?? []).map((e: { label: string; type?: string; fragments: { valeur: string }[]; calcul?: unknown[]; figureHtml?: string }) => ({
        l: e.label,
        t: e.type,
        f: e.fragments.map((x) => x.valeur).join(''),
        c: e.calcul?.length,
        fig: !!e.figureHtml,
      })),
    ).slice(0, 1500),
  )
  console.log(JSON.stringify(p?.reponseBreve ?? a.reponseBreve?.(inst)))
}
