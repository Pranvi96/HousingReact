import React, { PureComponent } from 'react'
import autoBind from 'react-auto-bind'
import connect from 'react-redux/lib/connect/connect'
import { bindActionCreators } from 'redux'
import Link from 'react-router/lib/Link'
import SliderCarousel from '@housing/slider/dist/index'
import trackers from 'actions/selfUploadTrackers'
import DownloadAppCard from 'components/commonComponents/downloadAppCard'
import { timeDiff } from 'utils/date'
import OwnerProductHooks from './ownerProductHooks'
import { whatsAppSend } from 'actions/login'

const mapStateToProps = state => ({
  filterSelectedListing: state.filter.primary.service_type || 'sell',
  filterSelectedLeads: state.routeData.params.service || 'sell',
  pathname: state.routeData.pathname
})

const mapDispatchToProps = dispatch => ({
  track: bindActionCreators(trackers.trackSuServiceSelection, dispatch),
  whatsAppSend: bindActionCreators(whatsAppSend, dispatch)
})

const carouselCaptions = [
  '75 Lakh+ buyers/tenants search for a property on housing',
  'You will receive genuine verified leads'
]

class RightSideBar extends PureComponent {
  constructor () {
    super()
    this.state = {
      isChecked: false
    }
    autoBind(this)
  }

  handleChange () {
    const {
      login: { phone_number: number, country_data: { country_code: code } },
      whatsAppSend
    } = this.props
    this.setState({
      isChecked: !this.state.isChecked
    })
    if (this.state.isChecked) {
      whatsAppSend(number, code)
    }
  }

  track () {
    const { track, pageType } = this.props
    track(pageType)
  }

  render () {
    const {
      login: {
        profile_uuid: profileUuid,
        loggedin,
        profileType,
        lastActivity,
        isOwner,
        whatsappSubscribed = true
      },
      dashboardTrackers,
      pathname,
      filterSelectedListing,
      filterSelectedLeads
    } = this.props
    let { monthAbsolute = 0 } = timeDiff(lastActivity)
    return (
      <div>
        <div className='sidebar-card'>
          <div className='sb-title'>Why List with us?</div>
          <SliderCarousel
            className='sb-carousel'
            slidesToShow={1}
            slidesToScroll={1}
            previousTemplate={null}
            nextTemplate={null}
            centerMode={false}
            isMobile={false}
            navigatingDots
            autoPlay
          >
            {carouselCaptions.map((caption, index) => (
              <div key={index}>
                <div className='sbc-caption'>{caption}</div>
                <div className={'sbc-thumbnail thumbnail-' + index} />
              </div>
            ))}
          </SliderCarousel>
          <Link
            className='sb-cta'
            to='/my-listings/new/basic?service=rent'
            onClick={this.track}
          >
            Add a property
          </Link>
        </div>
        {monthAbsolute > 0 && (
          <DownloadAppCard
            track={dashboardTrackers}
            profileUuid={profileUuid}
            profileType={profileType}
          />
        )}
        <OwnerProductHooks
          pathname={pathname}
          isOwner={isOwner}
          filterSelectedListing={filterSelectedListing}
          filterSelectedLeads={filterSelectedLeads}
        />
        {!whatsappSubscribed &&
          loggedin && (
            <div className='whatsapp'>
              <div class='whatsapp-image'>
                <span class='afterImg'>
                  <span class='text'> Get latest update on whatsApp </span>
                  <label class='switch'>
                    <input
                      type='checkbox'
                      checked={this.state.isChecked}
                      onChange={this.handleChange}
                    />
                    <span class='slider' />
                  </label>
                </span>
              </div>
            </div>
          )}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RightSideBar)
