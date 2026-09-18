package org.example.productservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.productservice.common.ApiResponse;
import org.example.productservice.dto.ProductCreateDto;
import org.example.productservice.dto.ProductResponseDto;
import org.example.productservice.service.FileStorageService;
import org.example.productservice.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private FileStorageService fileStorageService;

    @Autowired
    private ObjectMapper objectMapper;

    private ProductResponseDto mockResponseDto;

    @BeforeEach
    void setUp() {
        mockResponseDto = new ProductResponseDto();
        mockResponseDto.setId(1L);
        mockResponseDto.setName("Test Laptop");
        mockResponseDto.setDescription("A high performance test laptop");
        mockResponseDto.setPrice(new BigDecimal("999.99"));
        mockResponseDto.setSku("LAP-12345");
        mockResponseDto.setCategory("Electronics");
        mockResponseDto.setQuantity(10);
        mockResponseDto.setDiscountPrice(new BigDecimal("899.99"));
    }

    @Test
    public void testGetAllProducts_Success() throws Exception {
        Mockito.when(productService.getAllProducts()).thenReturn(Collections.singletonList(mockResponseDto));

        mockMvc.perform(get("/products")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Products retrieved successfully!"))
                .andExpect(jsonPath("$.data[0].name").value("Test Laptop"))
                .andExpect(jsonPath("$.data[0].discountPrice").value(899.99));
    }

    @Test
    public void testGetProductById_Success() throws Exception {
        Mockito.when(productService.getProductById(1L)).thenReturn(mockResponseDto);

        mockMvc.perform(get("/products/1")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Product retrieved successfully!"))
                .andExpect(jsonPath("$.data.name").value("Test Laptop"))
                .andExpect(jsonPath("$.data.discountPrice").value(899.99));
    }

    @Test
    public void testCreateProduct_Success() throws Exception {
        ProductCreateDto createDto = new ProductCreateDto();
        createDto.setName("Test Laptop");
        createDto.setDescription("A high performance test laptop");
        createDto.setPrice(new BigDecimal("999.99"));
        createDto.setSku("LAP-12345");
        createDto.setCategory("Electronics");
        createDto.setQuantity(10);
        createDto.setDiscountPrice(new BigDecimal("899.99"));

        Mockito.when(productService.createProduct(any(ProductCreateDto.class))).thenReturn(mockResponseDto);

        mockMvc.perform(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Product registered successfully!"))
                .andExpect(jsonPath("$.data.name").value("Test Laptop"))
                .andExpect(jsonPath("$.data.discountPrice").value(899.99));
    }
}
