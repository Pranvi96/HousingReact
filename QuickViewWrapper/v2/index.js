import React from 'react'
import connect from 'shared/utils/connect'
import BuyListComponent from 'shared/components/ListComponent/Buy/mobile'
import { containerStyle } from 'shared/components/QuickViewWrapper/v2/style'
import getHistory from 'shared/actions/getHistory'

const QuickViewColumn = ({
  propertyData,
  propertyData: { details: { images = [] } = {}, url= '', propertyType= ''} = {},
  qvId,
  id,
  cityId,
  getHistory
}) => {
  const [{ images: [coverImage] = [] } = {}] = images
  const imageCount = images.reduce((count, { images = [] }) => {
    return typeof count === 'object' ? count.images.length + images.length : count + images.length
  })
  id={qvId}
  const addressUrl={url}
  propertyData = {
    ...propertyData,
    coverImage,
    imageCount,
    url, 
    id,
    cityId,
    propertyType,
    addressUrl
  }
  return (
    <div css={containerStyle}>
      <BuyListComponent 
        listingId={qvId} 
        propertyData={propertyData} 
        onClick={() => {
          getHistory().push(url)
        }}
      />
    </div>
  )
}

const props = ({
  routeParams: { query: { listingId: qvId } = {} } = {},
  searchResults: { data: propertyData } = {},
  filters: {
    service,
    category,
    entities: [{ name: entityName } = {}] = [],
    selectedCity: { id } = {}
  },
  cookies: { experiments: { nearby_listings: nearByListings } = {} }
}) => ({
  propertyData: qvId && propertyData ? propertyData[qvId] : undefined,
  entityName,
  cityId: id,
  service,
  category,
  qvId,
  nearByListings
})

export default connect({
  props,
  actions: {
    getHistory
  }
})(QuickViewColumn)
