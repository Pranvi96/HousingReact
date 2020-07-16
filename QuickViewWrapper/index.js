import React from 'react'
import loadable from '@loadable/component'

const v1 = loadable(() =>
  import(
    /* webpackChunkName: "Search/QuickView/mobile" */ 'shared/components/Search/QuickView/mobile'
  )
)
const v2 = loadable(() =>
  import(
    /* webpackChunkName: "components/QuickViewWrapper/v2" */ 'shared/components/QuickViewWrapper/v2'
  )
)
// src/shared/components/QuickViewWrapper/v2/index.js
const v3 = loadable(() =>
  import(
    /* webpackChunkName: "components/QuickViewWrapper/v3" */ 'shared/components/QuickViewWrapper/v3'
  )
)

const QuickViewWrapper = ({ version, ...rest }) => {
  let View
  switch (version) {
    case 'v1':
      View = v1
      break
    case 'v2':
      View = v2
      break
    case 'v3':
      View = v3
      break
    default:
      View = v1
  }

  return <View {...rest} />
}

export default QuickViewWrapper
