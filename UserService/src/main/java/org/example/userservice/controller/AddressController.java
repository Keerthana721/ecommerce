package org.example.userservice.controller;

import org.example.userservice.model.Address;
import org.example.userservice.service.AddressService;
import org.example.userservice.shareddto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @PostMapping
    public ApiResponse<Address> save(@RequestBody Address address) {

        ApiResponse<Address> response = new ApiResponse<>();

        try {
            Address savedAddress = addressService.save(address);

            response.setSuccess(true);
            response.setMessage("Address saved successfully");
            response.setData(savedAddress);

        } catch (Exception e) {

            response.setSuccess(false);
            response.setMessage("Failed to save address");
            response.setData(null);
        }

        return response;
    }

    @GetMapping("/{id}")
    public ApiResponse<Address> getById(@PathVariable int id) {

        ApiResponse<Address> response = new ApiResponse<>();

        try {

            Address address = addressService.findById(id);

            if (address != null) {
                response.setSuccess(true);
                response.setMessage("Address found");
                response.setData(address);
            } else {
                response.setSuccess(false);
                response.setMessage("Address not found");
                response.setData(null);
            }

        } catch (Exception e) {

            response.setSuccess(false);
            response.setMessage("Failed to fetch address");
            response.setData(null);
        }

        return response;
    }

    @PutMapping("/{id}")
    public ApiResponse<Address> update(
            @PathVariable int id,
            @RequestBody Address address) {

        ApiResponse<Address> response = new ApiResponse<>();

        try {

            Address existing = addressService.findById(id);

            if (existing == null) {
                response.setSuccess(false);
                response.setMessage("Address not found");
                response.setData(null);
                return response;
            }

            Address updated = addressService.updateAddress(id, address);

            response.setSuccess(true);
            response.setMessage("Address updated successfully");
            response.setData(updated);

        } catch (Exception e) {

            response.setSuccess(false);
            response.setMessage("Failed to update address");
            response.setData(null);
        }

        return response;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable int id) {

        ApiResponse<Void> response = new ApiResponse<>();

        try {

            addressService.deleteById(id);

            response.setSuccess(true);
            response.setMessage("Address deleted successfully");
            response.setData(null);

        } catch (Exception e) {

            response.setSuccess(false);
            response.setMessage("Failed to delete address");
            response.setData(null);
        }

        return response;
    }
}