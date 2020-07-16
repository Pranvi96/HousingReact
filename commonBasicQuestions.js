import React from 'react'
import { numberValidator, numToCurrency } from 'utils/forms/commonValidators'
import { cleanValue, dateToVal } from 'utils/date'
import {
  furnishTypes,
  areaUnitTypes,
  getBedroomCount
} from 'constants/selfUpload/basicMappings'
import { findWithAttrByValue } from 'helpers'
import get from 'lodash/get'
import { isIndependentHouse, isVilla } from 'constants/selfUpload/basicMappings'
import { pgRestrictionsMap } from 'helpers/selfUpload/pgHelper'

const getValue = (options, value, key) => {
  const item = findWithAttrByValue(options, 'key', value)
  return item ? item[key] : ''
}

const getDimensionText = (masterData, value, field) => {
  const {
    selfUpload: { basic: { area_unit_id: areaUnitId } = {} } = {}
  } = masterData
  const unit = getValue(areaUnitTypes, areaUnitId, field)
  return `${value !== undefined ? value : ''} ${unit}`
}

var errorMsg
export const securityDeposit = {
  maxLength: 9,
  helper: ({ value }) => numToCurrency(value),
  validate: ({ value, masterData: { track }, tracking = false }) => {
    errorMsg = 'Deposit should be between 0 and 50 Lakhs'
    if (value === undefined) {
      return false
    } else if (value !== undefined && (value < 0 || value > 5000000)) {
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  },
  required: true,
  icon: 'icon-rupee',
  title: 'Security Deposit',
  key: 'security_deposit',
  quickView: true,
  type: 'number',
  trackChange: true,
  section: 'basic',
  path: 'selfUpload.basic.security_deposit',
  paramState: 'user_flats[0].user_flat_details.security_deposit'
}

export const furnishType = {
  title: 'Furnish Type',
  key: 'furnish_type_id',
  type: 'radio',
  section: 'basic',
  path: 'selfUpload.basic.furnish_type_id',
  options: furnishTypes,
  required: true,
  paramState: 'flat_details.furnish_type_id',
  trackChange: true
}

export const getPrice = (service, isPlot) => {
  let price = {
    title: 'Cost',
    plotTitle: 'Plot Price',
    key: 'price',
    type: 'number',
    trackChange: true,
    maxLength: 12,
    helper: ({ value }) => numToCurrency(value),
    validate: ({
      value,
      masterData: { selfUpload: { basic: { plot_area: plotArea } }, track },
      masterData: { selfUpload: { basic: { built_up_area: builtUpArea } } },
      tracking = false
    }) => {
      const minPrice = builtUpArea * 20
      const maxPrice = builtUpArea * 200000
      const minPlotPrice = plotArea * 100
      const maxPlotPrice = plotArea * 100000
      if (isNaN(value)) {
        return false
      }
      if (value < 100000 || value > 990000000) {
        errorMsg = 'Price should be between 1 Lakh and 99 Crore'
        tracking &&
          track &&
          track('ERROR_CHECK', {
            data: {
              error_msg: errorMsg,
              checkType: 'hard check'
            }
          })
        return errorMsg
      } else {
        if (
          plotArea !== undefined &&
          (value > maxPlotPrice || value < minPlotPrice)
        ) {
          errorMsg = 'Price per unit area should be between 100 and 100000'
          tracking &&
            track &&
            track('ERROR_CHECK', {
              data: {
                error_msg: errorMsg,
                checkType: 'hard check'
              }
            })
          return errorMsg
        } else if (value > maxPrice || value < minPrice) {
          errorMsg = 'Price per unit area should be between 200 and 200000'
          tracking &&
            track &&
            track('ERROR_CHECK', {
              data: {
                error_msg: errorMsg,
                checkType: 'hard check'
              }
            })
          return errorMsg
        }
        return true
      }
    },
    required: true,
    icon: 'icon-rupee',
    section: 'basic',
    path: 'selfUpload.basic.price',
    paramState: 'user_flats[0].user_flat_details.price'
  }
  return service !== 'rent'
    ? { ...price, title: isPlot ? price.plotTitle : price.title }
    : null
}

export const rent = {
  title: 'Monthly Rent',
  key: 'rent',
  type: 'number',
  maxLength: 9,
  section: 'basic',
  required: true,
  trackChange: true,
  path: 'selfUpload.basic.rent',
  icon: 'icon-rupee',
  helper: ({ value }) => numToCurrency(value),
  validate: ({
    value,
    masterData: {
      selfUpload: { basic: { built_up_area: builtUpArea } },
      track
    },
    tracking = false
  }) => {
    const minPrice = builtUpArea * 4
    const maxPrice = builtUpArea * 400
    if (isNaN(value)) {
      return false
    } else if (value < 1500 || value > 2000000) {
      errorMsg = 'Rent should be between 1500 and 20 Lakhs'
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    } else if (value > maxPrice || value < minPrice) {
      errorMsg = 'Price per unit area should be between 4 and 400'
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  },
  paramState: 'user_flats[0].user_flat_details.rent'
}

export const getAvailableFrom = ({
  service,
  isPlot,
  isUcProperty,
  showImmediate = false
}) => {
  let availableFrom = {
    title: 'Available From',
    possessionTitle: 'Possession Date',
    key: 'available_from',
    section: 'basic',
    type: 'date',
    helper: ({ value }) => cleanValue(value),
    quickView: true,
    path: 'selfUpload.basic.available_from',
    required: true,
    paramState: 'flat_details.available_from',
    trackChange: true,
    children: ({
      masterData: {
        setData,
        track,
        selfUpload: { basic: { available_from: availableFrom } }
      }
    }) => {
      if (!showImmediate) {
        return null
      }
      const currentDate = dateToVal(new Date())
      if (!isPlot && isUcProperty) {
        // !isPlot and Possesion status is not 'In Future'
        return (
          <label className='check'>
            <input
              type='checkbox'
              onChange={({ target: { checked } = {} } = {}) => {
                setData({
                  section: 'basic',
                  data: { available_from: checked ? currentDate : null }
                })
                checked &&
                  track('FIELD_CHANGE', {
                    data: {
                      key: 'available_from',
                      trackChange: true,
                      extra: { selection_type: 'check_box' }
                    }
                  })
              }}
            />
            <i
              className={`icon icon-checkbox${
                availableFrom === currentDate ? '-filled' : ''
              }`}
            />
            Immediately
          </label>
        )
      }
    },
    msg: ({
      value: available_from,
      masterData: { track },
      sendTracking = false
    }) => {
      if (available_from !== undefined) {
        const availableDate = new Date(available_from)
        const today = new Date()
        const month = today.getMonth()
        const year = today.getFullYear()
        const day = today.getDay()
        var futureDate = new Date(year, month, day)
        futureDate.setMonth(futureDate.getMonth() + 6)
        if (availableDate > futureDate === true) {
          errorMsg =
            'Available date should be within 6 months from the current date'
          sendTracking &&
            track &&
            track('ERROR_CHECK', {
              data: {
                error_msg: errorMsg,
                checkType: 'soft check'
              }
            })
          return errorMsg
        }
        return false
      }
    }
  }
  return service === 'rent' || isUcProperty
    ? {
      ...availableFrom,
      title:
          service !== 'rent'
            ? availableFrom.possessionTitle
            : availableFrom.title,
      disablePastDates: isUcProperty
    }
    : null
}

export function validateArea (isReqdApt, bedroomcount) {
  let area = []
  if (isReqdApt) {
    if (bedroomcount === 0 || bedroomcount === 1) {
      area = [150, 2000]
    } else if (bedroomcount === 2) {
      area = [400, 4000]
    } else if (bedroomcount === 3) {
      area = [600, 5000]
    } else if (bedroomcount === 4) {
      area = [1000, 7500]
    } else if (bedroomcount === 5) {
      area = [1500, 9500]
    } else if (bedroomcount === 6) {
      area = [2000, 11000]
    } else if (bedroomcount > 6) {
      area = [2500, 15000]
    }
  } else {
    if (bedroomcount === 0 || bedroomcount === 1) {
      area = [150, 1500]
    } else if (bedroomcount === 2) {
      area = [400, 3000]
    } else if (bedroomcount === 3) {
      area = [600, 5200]
    } else if (bedroomcount === 4) {
      area = [1000, 7000]
    } else if (bedroomcount === 5) {
      area = [1500, 9000]
    } else if (bedroomcount === 6) {
      area = [2000, 10000]
    } else if (bedroomcount > 6) {
      area = [2500, 15000]
    }
  }
  return area
}

export const builtUpArea = {
  title: 'Built Up Area',
  key: 'built_up_area',
  type: 'number',
  trackChange: true,
  maxLength: 8,
  path: 'selfUpload.basic.built_up_area',
  section: 'basic',
  quickView: true,
  required: true,
  paramState: 'flat_details.built_up_area',
  helper: ({ value }) => `${value !== undefined ? value : ''} Sq. ft.`,
  validate: ({
    value,
    masterData: {
      selfUpload: {
        basic: { apartment_type_id: id, property_type_id: propId }
      },
      track
    },
    tracking = false
  }) => {
    const bedroomcount = getBedroomCount(id)
    const isReqdApt = isVilla(propId) || isIndependentHouse(propId)
    const area = validateArea(isReqdApt, bedroomcount)
    const minArea = area[0]
    const maxArea = area[1]
    if (isNaN(value)) {
      return false
    } else if (value > maxArea || value < minArea) {
      errorMsg = `Saleable area should be between ${minArea} and ${maxArea}`
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  }
}

export const plotArea = {
  title: 'Plot Area',
  key: 'plot_area',
  type: 'number',
  maxLength: 8,
  path: 'selfUpload.basic.plot_area',
  section: 'basic',
  quickView: true,
  trackChange: true,
  required: true,
  // helper: ({ masterData, value }) => getDimensionText(masterData, value, 'label'),
  contClass: 'half va-top',
  validate: ({ value, masterData, tracking = false }) => {
    const {
      selfUpload: {
        basic: {
          plot_length: plotLength = 0,
          plot_width: plotWidth = 0,
          area_unit_id: areaUnitId = 3
        }
      } = {},
      track
    } = masterData
    const area = plotLength * plotWidth
    const fortyPercentOfArea = area * 0.4
    const minimumArea = areaUnitId === 3 ? 5 : 45
    const areaPlusForty = area + fortyPercentOfArea
    const areaMinusForty = area - fortyPercentOfArea
    let minPlotArea = 0,
      maxPlotArea = 0
    if (areaUnitId === 2) {
      ;(minPlotArea = 150), (maxPlotArea = 20000)
    } else if (areaUnitId === 3) {
      ;(minPlotArea = 50), (maxPlotArea = 5000)
    } else if (areaUnitId === 4) {
      ;(minPlotArea = 50), (maxPlotArea = 4000)
    }
    if (isNaN(value)) {
      return false
    } else if (value > maxPlotArea || value < minPlotArea) {
      errorMsg = `Saleable area should be between ${minPlotArea} and ${maxPlotArea}`
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    } else {
      return numberValidator(
        value,
        areaMinusForty >= minimumArea ? areaMinusForty : minimumArea,
        areaPlusForty || 250000,
        value >= minimumArea
          ? 'Area value is not as per the value of the dimensions'
          : 'Minimum area can be 5 sq yards/ 45 sqft'
      )
    }
  }
}

export const areaUnit = {
  title: 'Area Unit',
  key: 'area_unit_id',
  type: 'text',
  path: 'selfUpload.basic.area_unit_id',
  mask: ({ data: { options = [] } = {}, value }) => {
    return getValue(options, value, 'label')
  },
  section: 'basic',
  quickView: true,
  trackChange: true,
  required: true,
  readOnly: true,
  contClass: 'half second',
  options: areaUnitTypes,
  helperIcon: 'icon-arrow-down'
}

export const plotLength = {
  title: 'Length',
  key: 'plot_length',
  type: 'number',
  maxLength: 4,
  path: 'selfUpload.basic.plot_length',
  section: 'basic',
  quickView: true,
  trackChange: true,
  required: true,
  contClass: 'half',
  helper: ({ masterData, value }) =>
    getDimensionText(masterData, value, 'dimension'),
  validate: ({ value, masterData: { track }, tracking = false }) => {
    errorMsg = 'Length should be between 1 and 10000'
    if ((!isNaN(value) && value < 1) || value > 10000) {
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  }
}
export const plotWidth = {
  title: 'Width',
  key: 'plot_width',
  type: 'number',
  maxLength: 4,
  path: 'selfUpload.basic.plot_width',
  section: 'basic',
  quickView: true,
  trackChange: true,
  required: true,
  contClass: 'half second',
  helper: ({ masterData, value }) =>
    getDimensionText(masterData, value, 'dimension'),
  validate: ({ value, masterData: { track }, tracking = false }) => {
    errorMsg = 'Width should be between 1 and 10000'
    if ((!isNaN(value) && value < 1) || value > 10000) {
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  }
}
export const facingWidth = {
  title: 'Width of Facing Road',
  key: 'facing_road_width',
  type: 'number',
  maxLength: 8,
  path: 'selfUpload.basic.facing_road_width',
  section: 'basic',
  quickView: true,
  trackChange: true,
  required: true,
  helper: ({ masterData, value }) =>
    getDimensionText(masterData, value, 'dimension'),
  msg: ({
    value,
    masterData: { track } = {},
    sendTracking = true,
    tracking = false
  }) => {
    if (value !== undefined) {
      const isValid =
        numberValidator(value, 0, 4, '') ||
        numberValidator(value, 501, Infinity, '')
      if (isValid === true) {
        errorMsg = 'Facing road width should be between 5 and 500'
        tracking &&
          sendTracking &&
          track &&
          track('ERROR_CHECK', {
            data: {
              error_msg: errorMsg,
              checkType: 'soft check'
            }
          })
        return errorMsg
      }
      return false
    }
  }
}

export const rentBrokerage = {
  type: 'number',
  helper: ({ value }) => numToCurrency(value),
  icon: 'icon-rupee',
  section: 'basic',
  required: true,
  maxLength: 9,
  validate: ({
    value,
    masterData: { selfUpload: { basic: { rent = 0 } = {} }, track },
    tracking = false
  }) => {
    errorMsg = 'Please enter valid brokerage'
    if (!isNaN(value) && (value < 100 || value > 2000000)) {
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  },
  msg: ({
    value,
    masterData: { selfUpload: { basic: { rent = 0 } = {} }, track } = {},
    sendTracking = true,
    tracking = false
  }) => {
    if (isNaN(rent) || rent === 0) {
      return false
    }
    const isValid = numberValidator(value, 1, value, '')
    if (isValid === true && value > 99) {
      const res = numberValidator(value, 0, rent * 0.5, '')
      if (res === true) {
        errorMsg = 'Brokerage seems low as per market standards'
        sendTracking &&
          tracking &&
          track &&
          track('ERROR_CHECK', {
            data: {
              error_msg: errorMsg,
              checkType: 'soft check'
            }
          })
        return errorMsg
      } else if (numberValidator(value, rent + 1, Infinity, '') === true) {
        errorMsg = 'Brokerage seems high as per market standards'
        sendTracking &&
          tracking &&
          track &&
          track('ERROR_CHECK', {
            data: {
              error_msg: errorMsg,
              checkType: 'soft check'
            }
          })
        return errorMsg
      }
      return false
    }
  },
  path: 'selfUpload.basic.rent_brokerage',
  title: 'Brokerage (in Rupees)',
  key: 'rent_brokerage',
  paramState: 'user_flats[0].user_flat_details.rent_brokerage',
  trackChange: true
}

export const buyBrokerage = {
  title: 'Brokerage (in Rupees)',
  key: 'buy_brokerage',
  type: 'number',
  icon: 'icon-rupee',
  required: true,
  maxLength: 12,
  path: 'selfUpload.basic.buy_brokerage',
  section: 'basic',
  helper: ({ value }) => numToCurrency(value),
  validate: ({
    value,
    masterData: { selfUpload: { basic: { price = 0 } = {} } = {}, track },
    tracking = false
  }) => {
    errorMsg = 'Please enter valid brokerage'
    if (value !== undefined && value < 100) {
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    } else {
      errorMsg = 'Brokerage should be in between Rs. 100 to Rs. 99 Cr.'
      if (value !== undefined && (value < 100 || value > 990000000)) {
        tracking &&
          track &&
          track('ERROR_CHECK', {
            data: {
              error_msg: errorMsg,
              checkType: 'hard check'
            }
          })
        return errorMsg
      }
      return true
    }
  },
  msg: ({
    value,
    masterData: { selfUpload: { basic: { price = 0 } = {} }, track },
    sendTracking = true,
    tracking = false
  }) => {
    if (isNaN(price) || price === 0) {
      return false
    }
    const isValid = numberValidator(value, 1, value, '')
    if (isValid === true && value > 99) {
      const res = numberValidator(value, 0, price * 0.005, '')
      if (res === true) {
        errorMsg = 'Brokerage seems low as per market standards'
        sendTracking &&
          tracking &&
          track &&
          track('ERROR_CHECK', {
            data: {
              error_msg: errorMsg,
              checkType: 'soft check'
            }
          })
        return errorMsg
      } else if (value > price * 0.15 && value > 99) {
        errorMsg = 'Brokerage cannot be more than 15% of the sale price'
        tracking &&
          track &&
          track('ERROR_CHECK', {
            data: {
              error_msg: errorMsg,
              checkType: 'soft check'
            }
          })
        return errorMsg
      }
    }
    return false
  },
  paramState: 'user_flats[0].user_flat_details.buy_brokerage',
  trackChange: true
}

export const brokerageChargeableField = (service = 'buy') => {
  const field =
    service === 'rent'
      ? 'is_rent_brokerage_chargeable'
      : 'is_buy_brokerage_chargeable'
  return {
    title: 'Do you charge brokerage?',
    key: field,
    type: 'radio',
    required: true,
    section: 'basic',
    path: `selfUpload.basic.${field}`,
    paramState: `user_flats[0].user_flat_details.${field}`,
    options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }],
    trackChange: true
  }
}
export const brokerageNegotiable = (service = 'buy') => {
  const field =
    service === 'rent'
      ? 'is_rent_brokerage_negotiable'
      : 'is_buy_brokerage_negotiable'
  return {
    key: field,
    type: 'checkbox',
    section: 'basic',
    quickView: true,
    variation: 'tickbox',
    path: `selfUpload.basic.${field}`,
    contClass: 'no-margin',
    options: [{ label: 'Brokerage Negotiable', key: true }],
    paramState: `user_flats[0].user_flat_details.${field}`,
    trackChange: true,
    required: false,
    response: ({ value = {} }) => {
      return value && value[0] === true
    },
    populate: () => {},
    isAnswered: true
  }
}

export const getBrokerageFields = (
  {
    login: { isBroker } = {},
    selfUpload: {
      service,
      basic: {
        is_rent_brokerage_chargeable: brokerageChargeableRent,
        is_buy_brokerage_chargeable: brokerageChargeableBuy
      } = {}
    } = {}
  },
  { isBrokerProfile = isBroker, ...extraArg } = {}
) => {
  const brokerageChargeable =
    (brokerageChargeableRent && service === 'rent') ||
    (brokerageChargeableBuy && service === 'buy')
  return isBrokerProfile
    ? [
      brokerageChargeableField(service),
      brokerageChargeable
          ? service === 'rent'
            ? { ...rentBrokerage, ...extraArg }
            : { ...buyBrokerage, ...extraArg }
          : {},
      brokerageChargeable ? { ...brokerageNegotiable(service) } : {}
    ]
    : []
}

export const maintenanceCharge = {
  title: 'Maintenance Charges (per month)',
  key: 'maintenance_charges',
  type: 'number',
  maxLength: 8,
  section: 'basic',
  path: 'selfUpload.basic',
  quickView: true,
  shortLabel: 'Maintenance Charges',
  helper: ({ value }) => numToCurrency(value),
  icon: 'icon-rupee',
  contClass: 'maintenance_charges',
  validate: ({
    value: maintenance_charges,
    masterData: { selfUpload: { basic: { rent: price } }, track },
    tracking = false
  }) => {
    maintenance_charges = parseInt(maintenance_charges)
    price = parseInt(price)
    errorMsg = 'Maintenance charges should be between 0 and 5 Lakhs'
    if (isNaN(maintenance_charges)) {
      return false
    } else if (maintenance_charges > 500000 || maintenance_charges < 0) {
      tracking &&
        track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  },
  paramState: 'flat_details',
  trackChange: true
}

export const buyMaintenance = {
  ...maintenanceCharge,
  key: 'maintenance_charges_buy',
  path: 'selfUpload.basic.maintenance_charges_buy',
  paramState: 'flat_details.maintenance_charges_buy'
}
export const rentMaintenance = {
  ...maintenanceCharge,
  key: 'maintenance_charges_rent',
  path: 'selfUpload.basic.maintenance_charges_rent',
  msg: ({
    value: maintenance_charges,
    masterData: { selfUpload: { basic: { rent: price } }, track },
    sendTracking = true,
    tracking = false
  }) => {
    if (price !== undefined) {
      if (!isNaN(price) && maintenance_charges > 0.5 * price === true) {
        errorMsg = 'Maintenance charges cannot be greater than 50% of rent'
        sendTracking &&
          tracking &&
          track &&
          track('ERROR_CHECK', {
            data: {
              error_msg: errorMsg,
              checkType: 'soft check'
            }
          })
        return errorMsg
      }
      return false
    }
  },
  paramState: 'flat_details.maintenance_charges_rent'
}

export const getMaintenance = ({ service, contClass, title, isPlot }) => {
  if (isPlot) return []
  return service === 'rent'
    ? [{ ...rentMaintenance, contClass, title }]
    : [{ ...buyMaintenance, contClass, title }]
}

export const ageOfProperty = {
  title: 'Age of Property (in years)',
  key: 'age_of_property',
  type: 'number',
  path: 'selfUpload.basic.age_of_property',
  quickView: true,
  required: true,
  maxLength: 2,
  helper: ({ value }) => {
    return (
      <span
        className='tooltip status-reason tooltip-bottom-left age-of-property-tooltip'
        data-title='This field describes how old is the property. For new properties enter 0 years.'
      >
        <span className='va-middle status-reason-icon' />
      </span>
    )
  },
  validate: ({ value, masterData: { track }, tracking = false }) => {
    if (value === undefined) {
      return false
    } else {
      if (value < 0 || value > 99) {
        errorMsg = 'Age of property should be between 0 and 99'
        tracking &&
          track &&
          track('ERROR_CHECK', {
            data: {
              error_msg: errorMsg,
              checkType: 'hard check'
            }
          })
        return errorMsg
      }
      return true
    }
  },
  section: 'basic',
  paramState: 'flat_details.age_of_property',
  trackChange: true
}

export const totalWashroomsCount = {
  title: 'Bathroom',
  type: 'radio',
  key: 'total_bathroom_count',
  required: true,
  path: 'selfUpload.basic.total_bathroom_count',
  options: [...Array(10)].map((_, i) => {
    return { key: i, label: `${i}` }
  }),
  validate: ({
    value: total_bathroom_count,
    masterData: { selfUpload: { basic: { apartment_type_id: id } }, track }
  }) => {
    const bedroomcount = getBedroomCount(id)
    total_bathroom_count = parseInt(total_bathroom_count)
    if (isNaN(total_bathroom_count)) {
      return false
    } else if (total_bathroom_count > bedroomcount + 3) {
      errorMsg = `Bathrooms cannot be greater than ${bedroomcount + 3}`
      track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  },
  paramState: 'total_bathroom_count',
  trackChange: true,
  section: 'basic',
  trimOptions: {
    trimAfter: 3,
    trimLabel: '3+'
  }
}

export const totalBalconyCount = {
  title: 'Balcony',
  type: 'radio',
  key: 'total_balcony_count',
  section: 'basic',
  required: true,
  path: 'selfUpload.basic.total_balcony_count',
  options: [...Array(10)].map((_, i) => {
    return { key: i, label: `${i}` }
  }),
  validate: ({
    value: total_balcony_count,
    masterData: { selfUpload: { basic: { apartment_type_id: id } }, track }
  }) => {
    const bedroomcount = getBedroomCount(id)
    total_balcony_count = parseInt(total_balcony_count)
    if (isNaN(total_balcony_count)) {
      return false
    } else if (total_balcony_count > bedroomcount + 3) {
      errorMsg = `Balconies cannot be greater than ${bedroomcount + 3}`
      track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  },
  paramState: 'flat_details.total_balcony_count',
  trackChange: true,
  trimOptions: {
    trimAfter: 3,
    trimLabel: '3+'
  }
}

export const coveredParking = {
  title: 'Covered Parking',
  type: 'radio',
  key: 'covered_parking_count',
  section: 'basic',
  required: true,
  path: 'selfUpload.basic.covered_parking_count',
  options: [...Array(10)].map((_, i) => {
    return { key: i, label: `${i}` }
  }),
  validate: ({
    value: covered_parking_count,
    masterData: { selfUpload: { basic: { apartment_type_id: id } }, track },
    masterData: { selfUpload: { basic: { open_parking_count } } }
  }) => {
    const bedroomcount = getBedroomCount(id)
    covered_parking_count = parseInt(covered_parking_count)
    open_parking_count = parseInt(open_parking_count)
    if (isNaN(covered_parking_count)) {
      return false
    } else if (
      !isNaN(covered_parking_count) &&
      !isNaN(open_parking_count) &&
      covered_parking_count + open_parking_count > bedroomcount + 2
    ) {
      errorMsg = `Total car parking cannot be greater than ${bedroomcount + 2}`
      track &&
        track('ERROR_CHECK', {
          data: {
            error_msg: errorMsg,
            checkType: 'hard check'
          }
        })
      return errorMsg
    }
    return true
  },
  paramState: 'flat_details.covered_parking_count',
  trackChange: true,
  trimOptions: {
    trimAfter: 3,
    trimLabel: '3+'
  }
}

export const openParking = {
  title: 'Open Parking',
  type: 'radio',
  section: 'basic',
  key: 'open_parking_count',
  required: true,
  path: 'selfUpload.basic.open_parking_count',
  options: [...Array(10)].map((_, i) => {
    return { key: i, label: `${i}` }
  }),
  paramState: 'flat_details.open_parking_count',
  trackChange: true,
  trimOptions: {
    trimAfter: 3,
    trimLabel: '3+'
  }
}

export const sharingPg = {
  title: 'Room Type',
  key: 'occupancy_type_id',
  type: 'radio',
  required: true,
  onChange: ({ value, data, option, masterData: { updateKey, track } }) => {
    track('FIELD_CHANGE', { data, option })
  },
  options: [
    { key: 4, label: 'Private Room' },
    { key: 5, label: 'Double Sharing' },
    { key: 6, label: 'Triple Sharing' },
    { key: 7, label: '3+ Sharing' }
  ]
}

export const totalBedsPg = {
  maxLength: 2,
  required: false,
  title: 'Total Beds in this Room (Optional)',
  key: 'total_beds',
  type: 'number',
  section: 'basic'
}

export const pgRent = {
  maxLength: 9,
  helper: ({ value }) => numToCurrency(value),
  validate: ({ value }) =>
    value !== undefined &&
    numberValidator(value, 0, 5000000, 'Rent should be between 0 and 50 Lakhs'),
  required: true,
  icon: 'icon-rupee',
  title: 'Rent',
  key: 'monthly_rent',
  type: 'number',
  section: 'basic',
  contClass: 'adj-field'
}

export const pgSecurityDeposit = {
  maxLength: 9,
  helper: ({ value }) => numToCurrency(value),
  validate: ({ value }) =>
    value !== undefined &&
    numberValidator(
      value,
      0,
      5000000,
      'Deposit should be between 0 and 50 Lakhs'
    ),
  required: true,
  icon: 'icon-rupee',
  title: 'Security Deposit',
  key: 'security_deposit',
  type: 'number',
  section: 'basic',
  contClass: 'adj-field left-margin',
  defaultValue: 0,
  response: ({ value }) => {
    return value === undefined ? 0 : value
  }
}

// export const mealsIncludedPg = {
//   title: 'Meals Included in Price',
//   key: 'meals_included',
//   type: 'radio',
//   required: true,
//   path: 'meals_included',
//   onChange: ({
//     value: service,
//     data,
//     option,
//     masterData: { updateKey, track }
//   }) => {
//     updateKey({ service })
//     track('FIELD_CHANGE', { data, option })
//   },
//   options: [
//     { key: 'meals_yes', label: 'Yes', id: 79 },
//     { key: 'meals_no', label: 'No' }
//   ],
//   populate: () => {},
//   response: () => {
//     return undefined
//   },
//   trackChange: true
// }

export const facilitiesOfferedPg = {
  title: 'Facilities Offered',
  key: 'amenity_ids',
  type: 'checkbox',
  required: false,
  isAnswered: ({ value = [] }) => {
    return (value || []).length
  },
  onChange: ({
    value: service,
    data,
    option,
    masterData: { updateKey, track }
  }) => {
    updateKey({ service })
    track('FIELD_CHANGE', { data, option })
  },
  options: [
    { key: 74, label: 'Personal Cupboard' },
    { key: 76, label: 'Table Chair' },
    { key: 11, label: 'TV in Room' }, // check
    // { key: 'wifi', label: 'WiFi' },
    { key: 77, label: 'Attched Balcony' },
    { key: 78, label: 'Attached Bathroom' },
    { key: 79, label: 'Meals Included' }
  ],
  response: ({ value }) => {
    return value
  }
}

export const bathroomStyle = {
  title: 'Bathroom Style',
  key: 'offering_details.toilet_type_id',
  type: 'radio',
  required: true,
  options: [{ key: 2, label: 'Western' }, { key: 3, label: 'Indian' }],
  visible: ({
    data: { groupIndex },
    masterData: { selfUpload: { basic: { offerings = [] } } = {} } = {}
  }) => {
    if (
      offerings[groupIndex] &&
      offerings[groupIndex].amenity_ids &&
      ~offerings[groupIndex].amenity_ids.indexOf(78)
    ) {
      return true
    }
    return false
  },
  validate: ({ data, masterData, data: { visible, path } }) => {
    let isValid = true
    if (visible({ data, masterData }) && !get(masterData, path)) {
      isValid = false
    }
    return isValid
  },
  response: ({ value, masterData, data, data: { visible } }) => {
    if (visible({ data, masterData })) {
      return value
    }
    return 1
  }
}
export const moveInChargePg = {
  maxLength: 9,
  helper: ({ value }) => numToCurrency(value),
  validate: ({ value }) =>
    numberValidator(value, 0, 5000000, 'Should be between 0 and 50 Lakhs'),
  title: 'Onetime Move in Charges (Optional)',
  key: 'one_time_move_in_charges',
  type: 'number',
  trackChange: true,
  section: 'basic',
  path: 'selfUpload.basic.one_time_move_in_charges',
  paramState: 'flat_details.one_time_move_in_charges',
  icon: 'icon-rupee'
}
export const mealChargePg = {
  maxLength: 9,
  helper: ({ value }) => numToCurrency(value),
  validate: ({ value }) =>
    numberValidator(
      value,
      0,
      5000000,
      'Deposit should be between 0 and 50 Lakhs'
    ),
  title: 'Meal Charges per Month (Optional)',
  key: 'meal_charges',
  paramState: 'flat_details.meal_charges',
  type: 'number',
  section: 'basic',
  icon: 'icon-rupee',
  path: 'selfUpload.basic.meal_charges'
  // paramState: 'user_flats[0].user_flat_details.security_deposit'
}
export const eletricityChargePg = {
  maxLength: 9,
  helper: ({ value }) => numToCurrency(value),
  validate: ({ value }) =>
    numberValidator(value, 0, 10000, 'Should be between 0 and 10 Thousand'),
  title: 'Electricity Charges per Month (Optional)',
  key: 'electricity_charges',
  paramState: 'flat_details.electricity_charges',
  type: 'number',
  section: 'basic',
  icon: 'icon-rupee',
  path: 'selfUpload.basic.electricity_charges'
  // paramState: 'user_flats[0].user_flat_details.security_deposit'
}
export const additionalInfoPg = {
  maxLength: 1500,
  validate: ({ value }) =>
    numberValidator(value, 0, 5000000, 'Should be between 0 and 50 Lakhs'),
  title: 'Add Additional Information (Optional)',
  key: 'additional_information',
  type: 'textarea',
  trackChange: true,
  section: 'basic',
  helper: ({ value }) => `${(value || '').length} / 1500`,
  path: 'selfUpload.basic.additional_information',
  paramState: 'flat_details.additional_information'
  // paramState: 'user_flats[0].user_flat_details.security_deposit'
}

export const pgBasic1Heading1 = {
  type: 'raw',
  content: <div className='pg-subheading'>PG DETAILS</div>,
  required: false,
  isAnswered: true
}

export const pgName = {
  key: 'pg_name',
  type: 'text',
  title: 'PG Name (Optional)',
  path: 'selfUpload.basic.pg_name',
  paramState: 'flat_details.pg_name',
  required: false,
  validate: ({ value }) => {
    if (value && !/[a-zA-z]+/.test(value)) {
      return 'There should be at least one letter in the name'
    }
    return true
  }
}

export const pgBeds = {
  key: 'total_beds',
  type: 'text',
  title: 'Total Beds',
  path: 'selfUpload.basic.total_beds',
  paramState: 'flat_details.total_beds',
  required: true,
  validate: ({ value }) => {
    if (isNaN(value)) {
      return 'Total beds should be a number'
    }
    if (value > 2000) {
      return 'Total beds should be less than 2000'
    }
    return true
  }
}

export const pgGender = {
  title: 'PG is for',
  key: 'available_for',
  type: 'checkbox',
  required: true,
  path: 'selfUpload.basic.available_for',
  paramState: 'available_for',
  options: [{ key: 1, label: 'Girls' }, { key: 0, label: 'Boys' }],
  onChange: ({
    value,
    data,
    masterData,
    option,
    masterData: {
      updateKey,
      onChange,
      listings: {
        listingsSummary: {
          pg: {
            active: activeListingCount = 0,
            pending: pendingListingCount = 0
          } = {}
        } = {}
      } = {},
      login: {
        profile: {
          profile_details: { paying_guest_listing_cap: pgListingsCap = 0 } = {}
        } = {}
      } = {}
    }
  }) => {
    if (activeListingCount + pendingListingCount >= pgListingsCap) {
      updateKey({ showUpgradeModal: 'LIVE' })
      value = []
    }
    onChange({ value, data, masterData, option })
  },
  contClass: 'inline mobile'
}

export const pgOccupation = {
  title: 'Best suited for',
  key: 'suitable_entity_type_ids',
  type: 'checkbox',
  required: true,
  path: 'selfUpload.basic.suitable_entity_type_ids',
  paramState: 'suitable_entity_type_ids',
  options: [{ key: 7, label: 'Students' }, { key: 8, label: 'Professionals' }],
  contClass: 'inline mobile'
}

export const pgMealsAvailable = {
  title: 'Meals Available',
  key: 'meals_available',
  type: 'radio',
  required: true,
  path: 'selfUpload.basic.meals_available',
  paramState: 'flat_details.meals_available',
  options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }],
  contClass: 'mobile'
}

export const pgMealSpeciality = {
  title: 'Meal Speciality (Optional)',
  key: 'meal_cuisine_ids',
  type: 'checkbox',
  path: 'selfUpload.basic.meal_cuisine_ids',
  options: [
    { key: 1, label: 'Punjabi' },
    { key: 2, label: 'South Indian' },
    { key: 3, label: 'Andhra' },
    { key: 4, label: 'North Indian' },
    { key: 5, label: 'Others' }
  ],
  showLabel: true,
  contClass: 'mobile pg-dropdown',
  required: false,
  paramState: 'flat_details.meal_cuisine_ids',
  helperIcon: 'icon-arrow-down',
  response: ({ masterData, value }) => {
    const {
      selfUpload: { basic: { meals_available: mealsAvailable } = {} } = {}
    } =
      masterData || {}
    let val = mealsAvailable ? value : undefined
    return val
  },
  visible: ({ masterData }) => {
    const {
      selfUpload: { basic: { meals_available: mealsAvailable } = {} } = {}
    } =
      masterData || {}
    return mealsAvailable === true
  },
  populate: ({ flat_details: { meal_cuisine_ids: mealTypes } }) => {
    return mealTypes && mealTypes.length ? mealTypes : undefined
  }
}

export const pgMealOfferings = {
  title: 'Meal Offerings',
  key: 'meal_type_ids',
  type: 'checkbox',
  required: true,
  path: 'selfUpload.basic.meal_type_ids',
  options: [
    { key: 0, label: 'Breakfast' },
    { key: 1, label: 'Lunch' },
    { key: 2, label: 'Dinner' }
  ],
  paramState: 'flat_details.meal_type_ids',
  response: ({ masterData, value }) => {
    const {
      selfUpload: { basic: { meals_available: mealsAvailable } = {} } = {}
    } =
      masterData || {}
    let val = mealsAvailable ? value : undefined
    return val
  },
  visible: ({ masterData }) => {
    const {
      selfUpload: { basic: { meals_available: mealsAvailable } = {} } = {}
    } =
      masterData || {}
    return mealsAvailable === true
  },
  validate: ({ value, masterData, data: { visible } }) => {
    let valid = true
    if (visible({ masterData }) && !value) {
      valid = false
    }
    return valid
  }
}

export const pgNoticePeriod = {
  title: 'Notice Period (Days)',
  key: 'notice_period_in_days',
  type: 'number',
  required: true,
  path: 'selfUpload.basic.notice_period_in_days',
  contClass: 'inline pg-text',
  helper: ({ value }) => value && (value > 1 ? 'Days' : 'Day'),
  paramState: 'flat_details.notice_period_in_days',
  validate: ({ value }) => {
    if (isNaN(value)) {
      return 'Notice Period should be a number'
    }
    if (value > 120) {
      return 'Notice Period should be less than 120 days'
    }
    return true
  }
}

export const pgLockInPeriod = {
  title: 'Lock in Period (Days)',
  key: 'lock_in_period',
  type: 'number',
  required: true,
  path: 'selfUpload.basic.lock_in_period',
  contClass: 'inline',
  helper: ({ value }) => value && (value > 1 ? 'Days' : 'Day'),
  paramState: 'flat_details.lock_in_period',
  validate: ({ value }) => {
    if (isNaN(value)) {
      return ' Lock In Period should be a number'
    }
    if (value > 365) {
      return 'Lock In Period should be less than 365 days'
    }
    return true
  }
}

export const pgCommonAreas = {
  title: 'Common Areas',
  key: 'common_area_type_ids',
  type: 'checkbox',
  path: 'selfUpload.basic.common_area_type_ids',
  required: true,
  options: [
    { key: 1, label: 'Living Room' },
    { key: 2, label: 'Kitchen' },
    { key: 4, label: 'Dining Hall' },
    { key: 3, label: 'Study Room / Library' },
    { key: 5, label: 'Breakout Room' }
  ],
  paramState: 'flat_details.common_area_type_ids'
}

export const pgBasic1Heading2 = {
  type: 'raw',
  content: <div className='pg-subheading'>OWNER / CARETAKER DETAILS</div>,
  required: false,
  isAnswered: true
}

export const pgPropertyManager = {
  title: 'Property Managed By',
  key: 'property_manager_type_id',
  type: 'radio',
  path: 'selfUpload.basic.property_manager_type_id',
  required: true,
  options: [
    { key: 0, label: 'Landlord' },
    { key: 1, label: 'Caretaker' },
    { key: 2, label: 'Dedicated Professional' }
  ],
  paramState: 'flat_details.property_manager_type_id'
}

export const pgPropertyManagerStays = {
  title: 'Property Manager stays at Property',
  key: 'manager_on_property',
  type: 'radio',
  path: 'selfUpload.basic.manager_on_property',
  required: true,
  options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }],
  paramState: 'flat_details.manager_on_property'
}

export const pgBasic1Heading3 = {
  type: 'raw',
  content: <div className='pg-subheading'>PG RULES</div>,
  required: false,
  isAnswered: true
}

const pgRules = [
  {
    title: 'Non Veg Allowed',
    key: 'is_non_veg_allowed',
    options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }],
    type: 'radio'
  },
  {
    title: 'Opposite Sex Allowed',
    key: 'is_opposite_sex_allowed',
    options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }],
    type: 'radio'
  },
  {
    title: 'Any Time Allowed',
    key: 'timing_restriction',
    options: [{ key: false, label: 'Yes' }, { key: true, label: 'No' }],
    type: 'radio',
    populate: ({ flat_details: { timing_restriction: timingRestriction } }) => {
      return timingRestriction
    }
  },
  {
    title: 'Last Time Entry',
    key: 'last_entry_time',
    options: [
      { key: '6:00 pm', label: '6:00 pm' },
      { key: '6:30 pm', label: '6:30 pm' },
      { key: '7:00 pm', label: '7:00 pm' },
      { key: '7:30 pm', label: '7:30 pm' },
      { key: '8:00 pm', label: '8:00 pm' },
      { key: '8:30 pm', label: '8:30 pm' },
      { key: '9:00 pm', label: '9:00 pm' },
      { key: '9:30 pm', label: '9:30 pm' },
      { key: '10:00 pm', label: '10:00 pm' },
      { key: '10:30 pm', label: '10:30 pm' },
      { key: '11:00 pm', label: '11:00 pm' },
      { key: '11:30 pm', label: '11:30 pm' },
      { key: '12:00 am', label: '12:00 am' },
      { key: '12:30 am', label: '12:30 am' },
      { key: '1:00 am', label: '1:00 am' },
      { key: '1:30 am', label: '1:30 am' },
      { key: '2:00 am', label: '2:00 am' }
    ],
    type: 'dropdown',
    helperIcon: 'icon-arrow-down',
    icon: 'icon-clock',
    response: ({ masterData, value }) => {
      const {
        selfUpload: {
          basic: { timing_restriction: timingRestriction } = {}
        } = {}
      } =
        masterData || {}
      return timingRestriction ? value : undefined
    },
    visible: ({ masterData }) => {
      const {
        selfUpload: {
          basic: { timing_restriction: timingRestriction } = {}
        } = {}
      } =
        masterData || {}
      return timingRestriction === true
    },
    validate: ({ value, masterData, data: { visible } }) => {
      let valid = true
      if (visible({ masterData }) && !value) {
        valid = false
      }
      return valid
    },
    populate: ({ flat_details: { last_entry_time: value } }) => {
      return value
    }
  },
  {
    title: 'Visitors Allowed',
    key: 'are_visitors_allowed',
    options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }],
    type: 'radio'
  },
  {
    title: 'Guardian Allowed',
    key: 'is_guardian_allowed',
    options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }],
    type: 'radio'
  },

  {
    title: 'Drinking Allowed',
    key: 'is_drinking_allowed',
    options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }],
    type: 'radio'
  },
  {
    title: 'Smoking Allowed',
    key: 'is_smoking_allowed',
    options: [{ key: true, label: 'Yes' }, { key: false, label: 'No' }],
    type: 'radio'
  }
]

export const pgBasic4Heading = {
  type: 'raw',
  content: <div className='pg-subheading'>OTHER PG DETAILS</div>,
  required: false,
  isAnswered: true
}

const getPgRules = () => {
  return pgRules.map(rule => {
    const { key, type } = rule
    return {
      path: `selfUpload.basic.${key}`,
      paramState: `flat_details.${key}`,
      required: true,
      contClass: `${type === 'radio' ? 'inline' : 'inline pg-dropdown'}`,
      populate: ({ flat_details: { restrictions = [] } }) => {
        const [{ id: ruleId }] = pgRestrictionsMap.filter(
          ({ key: mapKey }) => mapKey === key
        ) || [{}]
        let rest = restrictions.filter(({ id }) => id === ruleId) || [{}]
        const [{ value }] = (rest.length && rest) || [{}]
        return value
      },
      ...rule
    }
  })
}

export const getPgBasic2Fields = () => {
  return [
    sharingPg,
    totalBedsPg,
    pgRent,
    pgSecurityDeposit,
    facilitiesOfferedPg,
    bathroomStyle
  ]
}

export const getPgBasic4Fields = () => {
  return [
    pgBasic4Heading,
    moveInChargePg,
    mealChargePg,
    eletricityChargePg,
    additionalInfoPg
  ]
}

export const getPgBasic1Fields = () => {
  return [
    pgBasic1Heading1,
    pgName,
    pgBeds,
    pgGender,
    pgOccupation,
    pgMealsAvailable,
    pgMealOfferings,
    pgMealSpeciality,
    pgNoticePeriod,
    pgLockInPeriod,
    pgCommonAreas,
    pgBasic1Heading2,
    pgPropertyManager,
    pgPropertyManagerStays,
    pgBasic1Heading3,
    ...getPgRules()
  ]
}
