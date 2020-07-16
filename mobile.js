import React from 'react'
import connect from 'shared/utils/connect'
import pageWrap from 'shared/utils/pageWrapper'
import { SEARCH } from 'shared/constants/pageTypes'
import HeaderAndFilterBar from 'shared/pages/Search/HeaderAndFilterBar'
import BuyListComponent from 'shared/components/ListComponent/Buy/mobile'
import CommonSrpContent from 'shared/pages/Search/CommonSrpContent/mobile'
import getData from 'shared/pages/Search/fetchData'
import reducer from 'shared/pages/Search/reducer'
import { pageStyle } from 'shared/pages/Search/BuyV2/mobileStyle'
import LeadFeedBackFormWrapper from 'shared/components/LeadFeedback/wrapper'
import trackMap from 'shared/pages/Search/tracking'
import loadable from '@loadable/component'

const QuickViewWrapper = loadable(() =>
  import(/* webpackChunkName: "QuickViewWrapper" */ 'shared/components/QuickViewWrapper')
)
const BuyMobileSrp = ({ qvId, isActiveProperty, version }) => {
  return (
    <div css={pageStyle}>
      <HeaderAndFilterBar version ={version} showAlternateFilter={!!qvId} />
      {qvId && isActiveProperty && <QuickViewWrapper version ={version} />}
      <CommonSrpContent card={BuyListComponent} />
      <LeadFeedBackFormWrapper />
    </div>
  )
}

const props = ({
  routeParams: { query: { listingId: qvId } = {} } = {},
  cookies: { ssrExperiments: { quick_view: version = 'v1' } = {} } = {},
  searchResults: { data: { [qvId]: { isActiveProperty } = {} } = {} } = {}
} = {}) => ({
  isActiveProperty,
  qvId,
  version
})
// cacheTime 3 hours
export default pageWrap({ trackMap, reducer, getData, pageType: SEARCH, cacheTime: 10800 })(
  connect({ props })(BuyMobileSrp)
)
