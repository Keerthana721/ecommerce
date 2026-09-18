package org.example.userservice.service;

import org.example.userservice.model.Address;
import org.example.userservice.repository.AddressRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    // Save Address
    public Address save(Address address) {
        return addressRepository.save(address);
    }

    // Find Address by Id
    public Address findById(int id) {
        return addressRepository.findById(id).orElse(null);
    }

    // Update Address
    public Address updateAddress(int id, Address address) {

        Optional<Address> optional = addressRepository.findById(id);

        if (optional.isPresent()) {

            Address existing = optional.get();

            existing.setStreet(address.getStreet());
            existing.setCity(address.getCity());
            existing.setState(address.getState());
            existing.setCountry(address.getCountry());
            existing.setZipCode(address.getZipCode());

            return addressRepository.save(existing);
        }

        return null;
    }

    public void deleteById(int id) {
        addressRepository.deleteById(id);
    }
}