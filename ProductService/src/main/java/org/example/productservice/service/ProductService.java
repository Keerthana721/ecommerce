package org.example.productservice.service;


import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.example.productservice.dto.ProductCreateDto;
import org.example.productservice.dto.ProductResponseDto;
import org.example.productservice.model.Product;
import org.example.productservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

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
        product.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0);
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setImageUrl(dto.getImageUrl());
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
        if (dto.getQuantity() != null) {
            product.setQuantity(dto.getQuantity());
        }
        product.setDiscountPrice(dto.getDiscountPrice());
        if (dto.getImageUrl() != null) {
            product.setImageUrl(dto.getImageUrl());
        }
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

    public List<String> getAllCategories() {
        return productRepository.findAll().stream()
                .filter(Product::getIsActive)
                .map(Product::getCategory)
                .filter(c -> c != null && !c.trim().isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }

    public List<ProductResponseDto> getCatalog(String category, BigDecimal minPrice, BigDecimal maxPrice, Boolean inStockOnly) {
        return productRepository.findAll().stream()
                .filter(Product::getIsActive)
                .filter(p -> category == null || category.equalsIgnoreCase("ALL") || (p.getCategory() != null && p.getCategory().equalsIgnoreCase(category)))
                .filter(p -> minPrice == null || (p.getPrice() != null && p.getPrice().compareTo(minPrice) >= 0))
                .filter(p -> maxPrice == null || (p.getPrice() != null && p.getPrice().compareTo(maxPrice) <= 0))
                .filter(p -> inStockOnly == null || !inStockOnly || (p.getQuantity() != null && p.getQuantity() > 0))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ProductResponseDto convertToDto(Product product) {
        ProductResponseDto dto = new ProductResponseDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setSku(product.getSku());
        dto.setCategory(product.getCategory());
        dto.setQuantity(product.getQuantity());
        dto.setDiscountPrice(product.getDiscountPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setIsActive(product.getIsActive());
        return dto;
    }
}