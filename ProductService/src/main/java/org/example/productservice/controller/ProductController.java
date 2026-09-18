package org.example.productservice.controller;



import lombok.extern.slf4j.Slf4j;
import org.example.productservice.common.ApiResponse;
import org.example.productservice.dto.ProductCreateDto;
import org.example.productservice.dto.ProductResponseDto;
import org.example.productservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.example.productservice.service.FileStorageService;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("products")
@Slf4j
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/register")
    //@PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER', 'SELLER')")
    public ResponseEntity<?> createProduct( @RequestBody ProductCreateDto productDto) {
        try {
            ProductResponseDto createdProduct = productService.createProduct(productDto);
            log.info("Product registered successfully: {}", productDto.getName());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Product registered successfully!", createdProduct));
        } catch (Exception e) {
            log.error("Error registering product: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadProductImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = fileStorageService.storeFile(file);
            return ResponseEntity.ok(new ApiResponse(true, "Image uploaded successfully!", imageUrl));
        } catch (Exception e) {
            log.error("Error uploading image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping(value = "/register-with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createProductWithImage(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("sku") String sku,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "quantity", required = false, defaultValue = "0") Integer quantity,
            @RequestParam(value = "discountPrice", required = false) BigDecimal discountPrice,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            String imageUrl = null;
            if (file != null && !file.isEmpty()) {
                imageUrl = fileStorageService.storeFile(file);
            }

            ProductCreateDto dto = new ProductCreateDto();
            dto.setName(name);
            dto.setDescription(description);
            dto.setPrice(price);
            dto.setSku(sku);
            dto.setCategory(category);
            dto.setQuantity(quantity);
            dto.setDiscountPrice(discountPrice);
            dto.setImageUrl(imageUrl);

            ProductResponseDto createdProduct = productService.createProduct(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Product registered with image successfully!", createdProduct));
        } catch (Exception e) {
            log.error("Error registering product with image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            List<ProductResponseDto> products = productService.getAllProducts();
            log.info("Fetching all products");
            return ResponseEntity.ok(new ApiResponse(true, "Products retrieved successfully!", products));
        } catch (Exception e) {
            log.error("Error fetching products: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            ProductResponseDto product = productService.getProductById(id);
            log.info("Fetching product with id: {}", id);
            return ResponseEntity.ok(new ApiResponse(true, "Product retrieved successfully!", product));
        } catch (Exception e) {
            log.error("Error fetching product: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable String category) {
        try {
            List<ProductResponseDto> products = productService.getProductsByCategory(category);
            log.info("Fetching products by category: {}", category);
            return ResponseEntity.ok(new ApiResponse(true, "Products retrieved successfully!", products));
        } catch (Exception e) {
            log.error("Error fetching products by category: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        try {
            List<String> categories = productService.getAllCategories();
            return ResponseEntity.ok(new ApiResponse(true, "Categories retrieved successfully!", categories));
        } catch (Exception e) {
            log.error("Error fetching categories: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/catalog")
    public ResponseEntity<?> getShopCatalog(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStockOnly) {
        try {
            List<ProductResponseDto> catalog = productService.getCatalog(category, minPrice, maxPrice, inStockOnly);
            log.info("Fetching shop catalog with filters category={}, minPrice={}, maxPrice={}", category, minPrice, maxPrice);
            return ResponseEntity.ok(new ApiResponse(true, "Shop catalog retrieved successfully!", catalog));
        } catch (Exception e) {
            log.error("Error fetching shop catalog: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String keyword) {
        try {
            List<ProductResponseDto> products = productService.searchProducts(keyword);
            log.info("Searching products with keyword: {}", keyword);
            return ResponseEntity.ok(new ApiResponse(true, "Products retrieved successfully!", products));
        } catch (Exception e) {
            log.error("Error searching products: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SECOND_LEVEL_USER')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductCreateDto productDto) {
        try {
            ProductResponseDto updatedProduct = productService.updateProduct(id, productDto);
            log.info("Product updated with id: {}", id);
            return ResponseEntity.ok(new ApiResponse(true, "Product updated successfully!", updatedProduct));
        } catch (Exception e) {
            log.error("Error updating product: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            log.info("Product deleted with id: {}", id);
            return ResponseEntity.ok(new ApiResponse(true, "Product deleted successfully!"));
        } catch (Exception e) {
            log.error("Error deleting product: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}