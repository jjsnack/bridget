---
type: grid
layout: single
outputs: ['HTML']
title: '{{ replace .File.ContentBaseName `-` ` ` | title }}'
date: {{ .Date }}
url: /all/
# per-image tags power the filter bar; caption shows under the enlarged image.
# one entry per file in this bundle — every unique tag becomes a filter button;
# an image with no matching tag only appears under "all".
resources:
  - src: '1.jpg'
    params:
      tags: ['street']
      caption: ''
draft: true
---
