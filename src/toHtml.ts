import MD from 'markdown-it'
import mdhljs from 'markdown-it-highlightjs'
import { base, hljs } from './styles.js'

const md = new MD({
  html: true,
  typographer: true
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}).use(mdhljs as any, {})

type Snippet = {
  file: string
  snippet: string
}

export const toHtml = (snippets: Snippet[][]) => {
  const markdown = `
  # Detected structural duplications
  
  ${snippets
    .map((snippetGroup) =>
      snippetGroup.map((snippet) => `\`\`\`\n# ${snippet.file}\n\n${snippet.snippet}\n\`\`\``).join('\n\n')
    )
    .join(`\n\n---\n\n`)}
  `

  return `
  <html>
    <head>
      <style>${hljs}</style>
      <style>${base}</style>
    </head>
    <body>${md.render(markdown)}</body>
  </html>
  `
}
