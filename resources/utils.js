export const convertToCSV = (arr) => {
    const array = [Object.keys(arr[0])].concat(arr)
  
    return array.map(it => {
      return Object.values(it).toString()
    }).join('\n')
}

const imagesZones = {
  "VICTORIANO_LORENZO": "979790670474801",
  "OMAR_TORRIJOS": "2787271578086853",
  "RUFINA_ALFARO": "442473768360218",
  "JOSE_D_ESPINAR": "966495364645319",
  "MATEO_ITURRALDE": "3802167426735614",
  "BELISARIO_PORRAS": "1106540577127062",
  "BELISARIO_FRIAS": "983858326638334",
  "ARNULFO_ARIAS": "6978178152281671",
  "AMELIA_D_DE_ICAZA": "4521979124694795",
}
export const zoneToImage = (zone) => {
  return imagesZones[zone]
}