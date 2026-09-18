package org.example.invoiceservice.router;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.example.invoiceservice.shareddto.PaymentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", url = "http://payment-service:8005")
public interface PaymentServiceClient {

    @PostMapping("/api/payments/process")
    @CircuitBreaker(name = "paymentService", fallbackMethod = "processPaymentFallback")
    @Retry(name = "paymentService")
    void processPayment(@RequestBody PaymentDTO paymentRequest);

    default void processPaymentFallback(PaymentDTO request, Exception ex) {
        throw new RuntimeException("Payment service unavailable: " + ex.getMessage());
    }
}
