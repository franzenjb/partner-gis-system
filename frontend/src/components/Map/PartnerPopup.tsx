import { useQuery } from '@tanstack/react-query'
import { partnersApi, servicesApi } from '../../api/client'
import type { Partner } from '../../store/appStore'

interface PartnerPopupProps {
  partner: Partner
  onClose: () => void
}

export default function PartnerPopup({ partner, onClose }: PartnerPopupProps) {
  // Fetch full partner details
  const { data: fullPartner } = useQuery({
    queryKey: ['partner', partner.id],
    queryFn: () => partnersApi.get(partner.id),
    enabled: !!partner.id,
  })

  // Fetch partner services
  const { data: services } = useQuery({
    queryKey: ['services', partner.id],
    queryFn: () => servicesApi.list(partner.id),
    enabled: !!partner.id,
  })

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-10">
      {/* Header */}
      <div className="bg-rc-red text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{partner.name}</h3>
            <p className="text-sm text-white/80 mt-1">
              {partner.type?.replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Address */}
        {partner.address && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Address</h4>
            <p className="text-sm text-gray-700">{partner.address}</p>
          </div>
        )}

        {/* Contact */}
        {fullPartner && (fullPartner.primary_contact_name || fullPartner.primary_contact_email) && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Contact</h4>
            {fullPartner.primary_contact_name && (
              <p className="text-sm text-gray-700">{fullPartner.primary_contact_name}</p>
            )}
            {fullPartner.primary_contact_email && (
              <a
                href={`mailto:${fullPartner.primary_contact_email}`}
                className="text-sm text-rc-red hover:underline"
              >
                {fullPartner.primary_contact_email}
              </a>
            )}
          </div>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Services</h4>
            <div className="flex flex-wrap gap-1">
              {services.map((service) => (
                <span
                  key={service.id}
                  className="px-2 py-1 bg-rc-red/10 text-rc-red text-xs rounded-full"
                >
                  {service.service_type.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {fullPartner?.languages_offered && fullPartner.languages_offered.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Languages</h4>
            <p className="text-sm text-gray-700">
              {fullPartner.languages_offered.join(', ')}
            </p>
          </div>
        )}

        {/* Accessibility */}
        {fullPartner?.ada_accessible && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Accessibility</h4>
            <span
              className={`inline-block px-2 py-1 text-xs rounded ${
                fullPartner.ada_accessible === 'yes'
                  ? 'bg-green-100 text-green-700'
                  : fullPartner.ada_accessible === 'partial'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              ADA: {fullPartner.ada_accessible}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <button className="w-full px-4 py-2 bg-rc-red text-white text-sm font-medium rounded-md hover:bg-rc-red-dark transition-colors">
          View Full Profile
        </button>
      </div>
    </div>
  )
}
