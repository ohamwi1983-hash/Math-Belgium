/**
 * Convention de lien vers un générateur de plateforme-maths :
 * https://plateforme-maths.vercel.app/{chantier}/{idGenerateur}
 */
export function generatorLink(chantier: string, generatorId: string): string {
  return `https://plateforme-maths.vercel.app/${chantier}/${generatorId}`
}
