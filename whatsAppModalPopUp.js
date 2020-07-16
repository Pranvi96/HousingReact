import React, { PureComponent } from 'react'
import ModalBase from 'components/desktop/Modal'

if (!__SERVER__) {
  require('styles/components/commonComponents/whatsAppModalPopUp.scss')
}

class WhatsappModalPopUp extends PureComponent {
  componentDidMount () {
    const { onDidMount } = this.props
    onDidMount && onDidMount()
  }
  render () {
    const { onCancel, onAccept, onClose, serviceType, isMobile } = this.props
    return (
      <ModalBase
        className='whatsapp-container'
        width={!isMobile && '399px'}
        height={!isMobile && '341px'}
        onClose={onClose}
      >
        <div className='whatsapp'>
          <div className='image' />
          <div className='title'>Updates Over WhatsApp</div>
          <div className='content'>
            Do you want to receive latest updates and information over whatsApp?
          </div>
          {onAccept && (
            <div className='button-set'>
              <button className='button' onClick={onCancel}>
                No
              </button>
              {serviceType !== 'pg' && (
                <button className='button button-confirm' onClick={onAccept}>
                  Yes
                </button>
              )}
            </div>
          )}
        </div>
      </ModalBase>
    )
  }
}

export default WhatsappModalPopUp
