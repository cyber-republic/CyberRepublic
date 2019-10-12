import React from 'react'
import styled from 'styled-components'
import DOMPurify from 'dompurify'
import markdownIt from 'markdown-it'
import markdownItMermaid from '@liradb2000/markdown-it-mermaid'
import taskLists from 'markdown-it-task-lists'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import footnote from 'markdown-it-footnote'
import abbr from 'markdown-it-abbr'
import emoji from 'markdown-it-emoji'
import mark from 'markdown-it-mark'
import deflist from 'markdown-it-deflist'
import ins from 'markdown-it-ins'

const mdi = markdownIt({
  breaks: true,
  linkify: true, // Autoconvert URL-like text to links
  typographer: true // Enable some language-neutral replacement + quotes beautification
})
  .use(markdownItMermaid)
  .use(taskLists)
  .use(footnote)
  .use(sub)
  .use(sup)
  .use(abbr)
  .use(emoji)
  .use(mark)
  .use(ins)
  .use(deflist)

function MarkedPreview({ content }) {
  return (
    <Wrapper
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(mdi.render(content))
      }}
    />
  )
}

export default MarkedPreview

const Wrapper = styled.div`
  color: rgba(0, 0, 0, 0.75);
  font-size: 16px;
  font-family: 'Synthese', 'Montserrat', sans-serif;
  font-variant-ligatures: common-ligatures;
  line-height: 1.67;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  tab-size: 4;
  p,
  blockquote,
  pre,
  ul,
  ol,
  dl {
    margin: 1em 0;
    padding: 0;
  }

  ul,
  ol {
    margin-left: 1em;
    margin-right: 1em;
    > li {
      margin-left: 1em;
      margin-right: 1em;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1.5em 0;
    line-height: 1.33;
    padding: 0;
  }

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  h3 {
    font-size: 1.17em;
  }

  h4 {
    font-size: 1em;
  }

  h5 {
    font-size: 0.83em;
  }

  h1,
  h2 {
    &::after {
      content: '';
      display: block;
      position: relative;
      top: 0.33em;
      border-bottom: 1px solid rgba(128, 128, 128, 0.33);
    }
  }

  ol ul,
  ul ol,
  ul ul,
  ol ol {
    margin: 0;
  }

  dt {
    font-weight: bold;
  }

  a {
    color: #43af92;
    text-decoration: underline;
    text-decoration-skip: ink;
    &:hover,
    &:focus {
      text-decoration: none;
    }
  }

  code,
  pre,
  samp {
    font-family: 'Roboto Mono', 'Lucida Sans Typewriter', 'Lucida Console',
      monaco, Courrier, monospace;
    font-size: 0.85em;
    * {
      font-size: inherit;
    }
  }

  blockquote {
    color: rgba(0, 0, 0, 0.5);
    padding-left: 1.5em;
    border-left: 5px solid rgba(0, 0, 0, 0.1);
  }

  code {
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
    padding: 2px 4px;
  }

  hr {
    border: 0;
    border-top: 1px solid rgba(128, 128, 128, 0.33);
    margin: 2em 0;
  }

  pre > code {
    background-color: rgba(0, 0, 0, 0.05);
    display: block;
    padding: 0.5em;
    -webkit-text-size-adjust: none;
    overflow-x: auto;
    white-space: pre;
  }

  table {
    background-color: transparent;
    border-collapse: collapse;
    border-spacing: 0;
  }

  td,
  th {
    border-right: 1px solid #dcdcdc;
    padding: 8px 12px;
    &:last-child {
      border-right: 0;
    }
  }

  td {
    border-top: 1px solid #dcdcdc;
  }

  mark {
    background-color: #f8f840;
  }

  abbr {
    &[title] {
      border-bottom: 1px dotted #777;
      cursor: help;
    }
  }

  img {
    max-width: 100%;
  }

  .task-list-item {
    list-style-type: none;
  }

  .task-list-item-checkbox {
    margin: 0 0.2em 0 -1.3em;
  }

  .footnotes {
    font-size: 0.8em;
    position: relative;
    top: -0.25em;
    vertical-align: top;
  }
`