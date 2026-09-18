package org.example.orderservice.router;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.example.orderservice.shareddto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
@FeignClient(name = "product-service", url = "http://product-service:8002")
public interface ProductServiceClient {

    @GetMapping("/api/products/{id}")
    @CircuitBreaker(name = "productService", fallbackMethod = "getProductByIdFallback")
    @Retry(name = "productService")
    ProductDTO getProductById(@PathVariable Long id);

    default ProductDTO getProductByIdFallback(Long id, Exception ex) {
        return ProductDTO.builder()
                .id(id)
                .name("Unknown Product")
                .price(0.0)
                .build();
    }
}
