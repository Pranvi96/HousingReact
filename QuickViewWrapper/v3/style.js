import { css } from '@emotion/core'

import colors from 'shared/styles/constants/colors'
import getIcon from 'shared/styles/icons/housing_phoenix'
import { textEllipsis, multiLineEllipsis } from 'shared/styles/mixins'

export const containerStyle = css`
  display: block;
  margin-top: 5px;
  background-color: #fff;
`

export const headerStyle = css`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
`

export const headerLeftStyle = css``

export const titleStyle = (propertyType) => {
  const marginStyles = ' margin-bottom: 6px;'
  return css`
    line-height: 20px;
    font-size: 16px;
    ${propertyType === 'resale' && marginStyles};
    font-weight: 500;
  `
}

export const developerStyle = css`
  line-height: 28px;
  color: #7f7f7f;
`

export const priceInfoStyle = css``

export const priceStyle = css`
  font-size: 18px;
  line-height: 16px;
  font-weight: 500;
`

export const rateStyle = css`
  margin-left: 8px;
  color: #7f7f7f;
`

export const headerRightStyle = css`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

export const badgeStyle = css`
  margin: -3px 0 5px;
`

export const galleryStyle = css`
  position: relative;
  height: 150px;
`

export const imageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #f3f3f3;
`

export const descriptionStyle = css`
  padding: 0px 8px 8px;
  font-size: 12px;
  line-height: 12px;
`

const galleryLabelStyle = css`
  position: absolute;
  left: 0;
  font-size: 12px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
`
export const seenStyle = css`
  ${galleryLabelStyle}
  top: 0;
  padding: 0 8px;
  line-height: 25px;
  text-transform: uppercase;
`

export const galleryCountStyle = css`
  ${galleryLabelStyle};
  position: absolute;
  bottom: 0;
  padding: 0 2px;
  line-height: 18px;
  &::before {
    ${getIcon('picture')};
    margin-right: 4px;
    padding-left: 4px;
  }
`

export const detailsStyle = css`
  padding: 0px 16px 12px;
  line-height: 18px;
  padding-top: 0px;
`

export const resaletitleStyle = css`
  margin-bottom: 4px;
  font-weight: 500;
`

export const locationStyle = css`
  color: #666;
  font-size: 14px;
  ${multiLineEllipsis(2)}
`

export const statsStyle = css`
  display: flex;
`

export const statStyle = css`
  margin-top: 8px;
  padding-right: 5px;

  &:not(:last-child):after {
    content: ' | ';
    color: grey;
  }
`

export const labelStyle = css`
  color: #7f7f7f;
`

export const valueStyle = css`
  margin-top: 4px;
`
export const offerBarStyle = css`
  display: flex;
  padding: 7px 10px;
  border-top: 1px solid #f0f0f0;
  line-height: 22px;
  background: white;
`
export const firstPromotionTextStyle = css`
  ${textEllipsis()}
  display: inline-block;
  color: #7f7f7f;
`
export const moreOfferStyle = css`
  font-size: 12px;
  margin-right: 16px;
  color: ${colors.primary};
  white-space: nowrap;
  margin-left: 4px;
`

export const offerButtonStyle = css`
  display: inline-block;
  margin-right: 9px;
  padding: 0 6px;
  font-size: 11px;
  line-height: 22px;
  color: #fff;
  text-transform: uppercase;
  background-color: ${colors.pink};
  border-radius: 2px;
`

export const footerStyle = css`
  justify-content: space-between;
  background-color: white;
  align-items: center;
  border-top: solid 1px #f0f0f0;
`

export const otherStyle = css`
  background-color: #f4f4f4;
  font-size: 16px;
  padding: 16px 0px 15px 12px;
`

export const pseudoCtaStyle = css`
  color: ${colors.primary};
`

export const crfCtaStyle = css`
  line-height: 42px;
  padding: 0 45px;
`

export const sellerNameStyle = css`
  display: inline-block;
  vertical-align: bottom;
  ${textEllipsis()}
`

export const shortListStyle = css`
  margin-right: 6px;
`

export const scrollContainerStyle = css`
  width: 100%;
  height: 96px;
  opacity: 0.87;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.73), #000);
  position: fixed;
  z-index: 2;
  bottom: 0;
  color: #fff;
  text-align: center;
  line-height: 30px;
  padding: 18px 0;
  &::after {
    display: block;
    width: 32px;
    height: 32px;
    color: #fff;
    margin: 0 auto;
    line-height: 20px;
    ${getIcon('downDoubleArrows')}
  }
`
