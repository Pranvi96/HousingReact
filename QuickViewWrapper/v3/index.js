import React, { Fragment, useState, useEffect } from 'react'

import Image from 'shared/components/Image'
import ContactBar from 'shared/components/ListComponent/ContactBar'
import ShortList from 'shared/components/ShortList'
import PropertyImage from 'shared/components/PropertyImage'
import connect from 'shared/utils/connect'
import Link from 'shared/components/Link'
import premiumIcon from 'shared/assets/misc/premium.svg'
import premiumPlusIcon from 'shared/assets/misc/premium-plus.svg'
import CommonCrf from 'shared/components/Crf/CommonCrf'
import useContactedListing from 'shared/customHooks/useContactedListing'
import Gallery from 'shared/components/Gallery/galleryWrapperMobile'
import useGallery from 'shared/components/Gallery/useGallery'
import useListingSeen from 'shared/customHooks/useListingSeen'
import getSeenPropertiesKey from 'shared/utils/getSeenPropertiesKey'
import Description from 'shared/components/Search/PropertyDescriptionSERP'

import {
  containerStyle,
  headerStyle,
  headerLeftStyle,
  titleStyle,
  developerStyle,
  priceInfoStyle,
  priceStyle,
  headerRightStyle,
  badgeStyle,
  galleryStyle,
  imageStyle,
  seenStyle,
  galleryCountStyle,
  detailsStyle,
  locationStyle,
  statsStyle,
  statStyle,
  valueStyle,
  footerStyle,
  otherStyle,
  sellerNameStyle,
  shortListStyle,
  scrollContainerStyle,
  descriptionStyle,
  offerBarStyle,
  offerButtonStyle,
  firstPromotionTextStyle,
  moreOfferStyle
} from './style'
import useEventListener from 'shared/customHooks/useEventListener'
import { getBrandName } from 'shared/utils/getBrandName'

const quickViewV3 = ({ propertyData, service, category, cityId } = {}) => {
  let {
    listingId,
    title = '',
    url,
    brands,
    sellers = [],
    displayPrice: { displayValue: projectPrice } = {},
    badge = '',
    description,
    details = {},
    address: { address = '' } = {},
    features = [],
    propertyType,
    promotions,
    galleryTitle = '',
    meta: { polygon: { id: localityId } = {} } = {}
  } = propertyData
  const [{ name = '', type, image = '' } = {}] = sellers || []
  brands = brands || []
  promotions = promotions || []
  const projectSellerName = getBrandName(brands) || name
  const { images = [] } = details || {}
  const { overview } = description || {}
  const [{ images: [{ src: propertyImage = '' } = {}] = [], images: galleryPropertyImages } = {}] =
    images.filter(({ type }) => type === 'property') || []
  
  const [crfOpen, toggleCrf] = useState(null)
  const [{ [propertyType]: contactList = [] }] = useContactedListing()
  const contacted = ~contactList.indexOf(listingId)
  const [galleryOpen, galleryIndex, openGallery, closeGallery] = useGallery()
  const [showSeen, setSeen] = useListingSeen(getSeenPropertiesKey(service, category))
  const [showScroll, setShowScroll] = useState(true)

  const isSeen = showSeen(listingId)

  const setGalleryOpen = (e) => {
    e.stopPropagation()
    e.preventDefault()
    openGallery(0)
  }

  useEffect(() => {
    setTimeout(() => {
      setShowScroll(false)
    }, 3000)
  }, [])
  return (
    <Fragment>
      <Link
        href={url}
        style={containerStyle}
        className='quickViewV3-card'
        onClick={() => {
          if (!isSeen) {
            setSeen({ id: listingId, timeStamp: new Date().getTime(), localityId, cityId })
          }
        }}
      >
        <div css={galleryStyle}>
          <PropertyImage
            style={imageStyle}
            src={propertyImage}
            onClick={setGalleryOpen}
            lazy={false}
          />
          {isSeen && <span css={seenStyle}>Seen</span>}
          {galleryPropertyImages && !!galleryPropertyImages.length && (
            <span css={galleryCountStyle}>{galleryPropertyImages.length}</span>
          )}
        </div>

        <div css={headerStyle}>
          <div css={headerLeftStyle}>
            <span css={titleStyle(propertyType)}>{title} </span>
            {propertyType === 'project' && (
              <span css={developerStyle}>
                <span css={sellerNameStyle}>by {projectSellerName}</span>
                <span>{sellers.length > 1 && !brands.length && `+${sellers.length - 1} more`}</span>
              </span>
            )}
            <div css={priceInfoStyle}>
              <span css={priceStyle}>{projectPrice}</span>
            </div>
          </div>
          <div css={headerRightStyle}>
            <Badge badge={badge} />
            <ShortList style={shortListStyle} listingId={listingId} type={propertyType} />
          </div>
        </div>

        <div css={detailsStyle}>
          <div css={locationStyle}>{address}</div>
          <div css={statsStyle}>
            {features.slice(0, 3).map(({ description }, index) => (
              <div css={statStyle} key={index}>
                <span css={valueStyle}>{description}</span>
              </div>
            ))}
          </div>
        </div>
        {overview && <Description description={overview} style={descriptionStyle} />}
        {promotions.length > 0 && <OfferBar promotions={promotions} />}
      </Link>
      
      <div css={footerStyle}>
        <ContactBar
          propertyData={propertyData}
          onClickCta={() => toggleCrf(true)}
          contacted={contacted}
        />
      </div>
      <div css={otherStyle}>Other interesting properties in your locality and nearby</div>
      {crfOpen && (
        <CommonCrf
          data={propertyData}
          placement={'qv_footer'}
          inModal
          onClose={() => toggleCrf(false)}
          autoSubmit={false}
        />
      )}
      {galleryOpen && (
        <Gallery
          startSlide={galleryIndex}
          onClose={closeGallery}
          agentType={sellers && sellers.length > 1 ? 'All Sellers' : type}
          images={galleryPropertyImages}
          version='fs'
          heading={galleryTitle}
          details={propertyData}
          placement={'quick_view'}
          eventContract={{
            IMAGE_VIEWED: 'GALLERY_IMAGE_VIEWED_SERP'
          }}
        />
      )}
      {showScroll && <ScrollComponent setShowScroll={setShowScroll} />}
    </Fragment>
  )
}

const OfferBar = ({ promotions: [firstPromotion], promotions }) => {
  return (
    <div css={offerBarStyle}>
      <span css={offerButtonStyle}>Offer</span>
      <label css={firstPromotionTextStyle}>{firstPromotion}</label>
      {promotions.length > 1 && (
        <label css={moreOfferStyle}>
          {' '}
          + {promotions.length - 1} More {`${promotions.length - 1 === 1 ? 'Offer' : 'Offers'}`}
        </label>
      )}
    </div>
  )
}

const badgeMap = {
  premium: premiumIcon,
  premium_plus: premiumPlusIcon
}

const ScrollComponent = ({ setShowScroll }) => {
  const onClick = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setShowScroll(false)
  }
  useEventListener('click', onClick)
  return <div css={scrollContainerStyle}>Scroll Down to see more options</div>
}
const Badge = ({ badge }) => {
  const src = badgeMap[badge]
  return src ? <Image style={badgeStyle} src={src} /> : null
}

const props = ({
  routeParams: { query: { listingId: qvId } = {} } = {},
  searchResults: { data: propertyData } = {},
  filters: { service, category, selectedCity: { id: cityId } = {} } = {}
} = {}) => ({
  propertyData: qvId && propertyData ? propertyData[qvId] : undefined,
  service,
  category,
  cityId
})

export default connect({ props })(quickViewV3)
