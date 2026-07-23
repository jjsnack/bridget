// data structure for images info
export interface ImageJSON {
  index: number
  alt: string
  moUrl: string
  moImgH: number
  moImgW: number
  loUrl: string
  loImgH: number
  loImgW: number
  hiUrl: string
  hiImgH: number
  hiImgW: number
}

export async function getImageJSON(): Promise<ImageJSON[]> {
  if (document.title.split(' | ')[0] === '404') {
    return [] // no images on 404 page
  }

  const ogUrlMetaTag = document.querySelector(
    'meta[property="og:url"]'
  ) as HTMLMetaElement | null
  const indexJsonUrl = ogUrlMetaTag?.content
    ? new URL('index.json', ogUrlMetaTag.content).href
    : new URL('index.json', window.location.href).href

  const response = await fetch(indexJsonUrl, {
    headers: {
      Accept: 'application/json'
    }
  })
  // let a bad response reject the resource instead of silently ready-with-[] —
  // a 500 serving an HTML body would otherwise throw in .json() and blank out
  if (!response.ok) {
    throw new Error(`failed to load ${indexJsonUrl}: ${response.status}`)
  }
  const data: ImageJSON[] = await response.json()
  return data.sort((a: ImageJSON, b: ImageJSON) => a.index - b.index)
}
