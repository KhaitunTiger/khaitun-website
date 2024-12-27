import React from 'react';

interface Address {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  solanaAddress?: string;
}

interface AddressFormProps {
  formData: Address;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          required
          className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">
          Street Address
        </label>
        <input
          type="text"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleInputChange}
          required
          className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
          placeholder="Enter your street address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
            placeholder="Enter state"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">
            Postal Code
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
            placeholder="Enter postal code"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
            placeholder="Enter country"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
