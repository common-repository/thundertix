import './style.scss'
import './editor.scss'

const { __ } = wp.i18n
const { registerBlockType } = wp.blocks
const { useEffect } = wp.element
const { Spinner } = wp.components

export default registerBlockType('thundertix/events', {
  title: __('Events', 'thundertix'),
  description: __(
    'This plugin allow us to share your next events with your audience.',
    'thundertix',
  ),
  category: 'thundertix',
  icon: 'calendar',
  attributes: {
    events: {
      type: 'array',
      source: 'children',
      selector: '.thundertix-events',
    },
    isLoading: {
      type: 'boolean',
      default: true,
    }
  },
  edit: ({ attributes, className, setAttributes }) => {
    const { events, isLoading } = attributes
    const events_uri = `${thundertix_base_api}/events`

    useEffect(() => {
      setAttributes({ isLoading: true })
      fetch( events_uri )
        .then( response => response.json() )
        .then( events => setAttributes({ events, isLoading: false }) )
    }, [])

    if ( isLoading ) {
      return (
        <p>
          <Spinner />
          {__('Loading Events', 'thundertix')}
        </p>
      )
    }

    if ( events.status === 'error' ) {
      return <a href={events.url} rel='nofollow'>{events.message}</a>
    }

    if ( events.length === 0 ) {
      return <p>{__('No Events', 'thundertix')}</p>
    }

    const format_month_day_year = ( time ) => {
      let date = new Date(time),
      options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }

      return date.toLocaleDateString('en-US', options)
    }

    const dates_range = ( created_at, expires ) => {
      return `${format_month_day_year(created_at)} - ${format_month_day_year(expires)}`
    }

    const show_button = ( on_sale ) => {
      return on_sale ?
        <button className="button button-success button-block">
          Buy Tickets
        </button> :
        null
    }

    const show_sold_out_message = ( without_availability, sold_out_message ) => {
      return without_availability ?
        <span className="warn sold-out-message">
          <strong>{sold_out_message}</strong>
        </span> :
        null
    }

    return (
      <div className={className}>
        <div className="thundertix_section">
          <div className="thundertix_events">
            { events.map( ( {
                name,
                picture,
                description,
                on_sale,
                without_availability,
                sold_out_message,
                created_at,
                expires
              }, index ) => (
              <div className="event" key={ index }>
                <div className="event-details">
                  <article>
                    { picture ?
                      <div
                        className="event-image"
                        style={{ backgroundImage: `url(${picture})` }}
                      ></div> :
                      <div className="not-event-image"></div>
                    }
                    <div className="title-description">
                      <div className="row event-title clear">
                        <h4>{ name }</h4>
                        <div className="row event-date clear">
                          { dates_range(created_at, expires) }
                        </div>
                      </div>
                      <div className="event-description"
                          dangerouslySetInnerHTML={ { __html: description } }>
                      </div>
                    </div>
                  </article>
                  <div className="event-actions">
                    { show_button(on_sale) }
                    { show_sold_out_message(without_availability, sold_out_message) }
                  </div>
                </div>
              </div>
            ) ) }
          </div>
        </div>
      </div>
    )
  },
  save: () => {
    return null
  },
})
