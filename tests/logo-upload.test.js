import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getLogoUploadInfo,
  validateLogoFile,
  validateSvgContent
} from '../src/utils/logoUpload.js'

test('el logo SVG se acepta y se conserva como vector', () => {
  const file = {
    name: 'yacyreta-logo.svg',
    type: 'image/svg+xml',
    size: 12_000
  }

  assert.deepEqual(validateLogoFile(file), { valid: true })
  assert.deepEqual(getLogoUploadInfo(file), {
    extension: 'svg',
    contentType: 'image/svg+xml',
    isVector: true
  })
})

test('el validador rechaza SVG activo o con referencias externas', () => {
  const unsafeExamples = [
    '<svg><script>alert(1)</script></svg>',
    '<svg onload="alert(1)"></svg>',
    '<svg><image href="https://example.com/logo.png" /></svg>',
    '<svg><style>@import url(https://example.com/style.css)</style></svg>'
  ]

  for (const markup of unsafeExamples) {
    assert.equal(validateSvgContent(markup).valid, false, markup)
  }
})

test('el validador permite SVG de logo estatico', () => {
  const markup = '<svg viewBox="0 0 10 10"><path fill="#f4510b" d="M0 0h10v10H0z" /></svg>'

  assert.deepEqual(validateSvgContent(markup), { valid: true })
})
