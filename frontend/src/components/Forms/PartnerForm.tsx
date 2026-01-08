import { useForm } from 'react-hook-form'

interface PartnerFormData {
  organization_name: string
  organization_type: string
  mission_statement?: string
  year_founded?: number
  physical_address?: string
  latitude?: number
  longitude?: number
  primary_contact_name?: string
  primary_contact_email?: string
  primary_contact_phone?: string
  languages_offered?: string[]
  ada_accessible?: string
  transit_access?: boolean
  internet_access?: boolean
}

interface PartnerFormProps {
  onSubmit: (data: PartnerFormData) => void
  isLoading?: boolean
  initialData?: Partial<PartnerFormData>
  categories?: Record<string, string[]>
}

const ORGANIZATION_TYPES = [
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'faith_based', label: 'Faith-Based' },
  { value: 'government', label: 'Government' },
  { value: 'informal', label: 'Informal' },
  { value: 'coalition', label: 'Coalition' },
  { value: 'private', label: 'Private' },
]

const ACCESSIBILITY_OPTIONS = [
  { value: 'yes', label: 'Yes - Fully Accessible' },
  { value: 'partial', label: 'Partial' },
  { value: 'no', label: 'No' },
]

export default function PartnerForm({
  onSubmit,
  isLoading,
  initialData,
}: PartnerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerFormData>({
    defaultValues: initialData,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name *
            </label>
            <input
              {...register('organization_name', { required: 'Organization name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
            />
            {errors.organization_name && (
              <p className="text-red-500 text-sm mt-1">{errors.organization_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Type *
            </label>
            <select
              {...register('organization_type', { required: 'Organization type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
            >
              <option value="">Select type...</option>
              {ORGANIZATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year Founded</label>
            <input
              type="number"
              {...register('year_founded', { min: 1800, max: 2100 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mission Statement
            </label>
            <textarea
              {...register('mission_statement')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Physical Address
            </label>
            <input
              {...register('physical_address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
              placeholder="123 Main St, City, State ZIP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              {...register('latitude', { min: -90, max: 90 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
              placeholder="e.g., 37.7749"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              {...register('longitude', { min: -180, max: 180 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
              placeholder="e.g., -122.4194"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Contact</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <input
              {...register('primary_contact_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              {...register('primary_contact_email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              {...register('primary_contact_phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
            />
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Accessibility & Amenities</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ADA Accessible
            </label>
            <select
              {...register('ada_accessible')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rc-red"
            >
              <option value="">Select...</option>
              {ACCESSIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 pt-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('transit_access')}
                className="rounded border-gray-300 text-rc-red focus:ring-rc-red"
              />
              <span className="text-sm text-gray-700">Transit Access</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('internet_access')}
                className="rounded border-gray-300 text-rc-red focus:ring-rc-red"
              />
              <span className="text-sm text-gray-700">Internet Access</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-rc-red text-white rounded-md hover:bg-rc-red-dark transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Partner'}
        </button>
      </div>
    </form>
  )
}
