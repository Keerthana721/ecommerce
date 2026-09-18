package org.example.orderservice.service;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.model.Product;
import org.example.orderservice.shareddto.ProductCreateDto;
import org.example.orderservice.shareddto.ProductResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class ProductService {

    @Autowired
    private org.example.orderservice.repository.ProductRepository productRepository;

    public ProductResponseDto createProduct(ProductCreateDto dto) {
        if (productRepository.findBySku(dto.getSku()).isPresent()) {
            throw new RuntimeException("SKU already exists!");
        }

        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setSku(dto.getSku());
        product.setCategory(dto.getCategory());
        product.setIsActive(true);
        product.setCreatedAt(LocalDateTime.now());

        Product savedProduct = productRepository.save(product);
        log.info("Product created: {} with SKU: {}", savedProduct.getId(), savedProduct.getSku());
        return convertToDto(savedProduct);
    }

    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        return convertToDto(product);
    }

    public List<ProductResponseDto> getAllProducts() {
        return productRepository.findAll().stream()
                .filter(Product::getIsActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .filter(Product::getIsActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword).stream()
                .filter(Product::getIsActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ProductResponseDto updateProduct(Long id, ProductCreateDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        if (!product.getSku().equals(dto.getSku()) && productRepository.findBySku(dto.getSku()).isPresent()) {
            throw new RuntimeException("SKU already exists!");
        }

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setSku(dto.getSku());
        product.setCategory(dto.getCategory());
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);
        log.info("Product updated: {}", id);
        return convertToDto(updatedProduct);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        product.setIsActive(false);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
        log.info("Product deleted: {}", id);
    }

    public Product getProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
    }

    private ProductResponseDto convertToDto(Product product) {
        ProductResponseDto dto = new ProductResponseDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setSku(product.getSku());
        dto.setCategory(product.getCategory());
        dto.setIsActive(product.getIsActive());
        return dto;
    }
}