package org.example.apigateway.security;

import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }



//    private boolean isOpenEndpoint(String path) {
//        return  path.startsWith("/users/**", Integer.parseInt(path)) ||
//                path.startsWith("/student/createNewUser") ||
//                path.startsWith("/staff/admin/login") ||
//                path.startsWith("/staff/admin/register") ||
//                path.startsWith("/staff/admin/forget-password");
//    }

    private boolean isOpenEndpoint(String path) {
        return pathMatcher.match("/users/**", path) || pathMatcher.match("/orders/**", path) || // pathMatcher.match("/products/**", path)||
                pathMatcher.match("/payments/api/payments/razorpay/**", path) ||
                pathMatcher.match("/student/createNewUser", path) ||
                pathMatcher.match("/staff/admin/login", path) ||
                pathMatcher.match("/staff/admin/register", path) ||
                pathMatcher.match("/staff/admin/forget-password", path);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {



        String path = exchange.getRequest().getURI().getPath();

        System.out.println("👉 PATH: " + path);

        if (isOpenEndpoint(path)) {
            System.out.println("✅ OPEN API - No Token Required");
            return chain.filter(exchange); // ✅ CORRECT
        }


            // ✅ Step 2: Get Authorization Header
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ Missing or Invalid Header");
            return writeError(exchange, HttpStatus.UNAUTHORIZED, "Missing Authorization Header");
        }

        String token = authHeader.substring(7);
        String userId = null;
        String userRole = null;
        try {
            Claims claims = jwtUtil.validateToken(token);

            System.out.println("PATH = " + path);
            System.out.println("ROLE = " + claims.get("role"));

            boolean allowed = jwtUtil.isRequestAuthorized(path, claims);
            System.out.println("ALLOWED = " + allowed);
            if (!jwtUtil.isRequestAuthorized(path, claims)) {
                return writeError(exchange, HttpStatus.FORBIDDEN, "Access Denied");
            }

            userId = String.valueOf(claims.get("userId"));
            userRole = String.valueOf(claims.get("role"));

        } catch (Exception e) {
            return writeError(exchange, HttpStatus.UNAUTHORIZED, "Invalid Token");
        }

        // ✅ Step 4: Continue filter chain and forward headers
        org.springframework.http.server.reactive.ServerHttpRequest.Builder reqBuilder = exchange.getRequest().mutate()
                .header("Authorization", authHeader);
        if (userId != null && !userId.equals("null")) {
            reqBuilder.header("X-User-Id", userId);
        }
        if (userRole != null && !userRole.equals("null")) {
            reqBuilder.header("X-User-Role", userRole);
        }

        return chain.filter(
                exchange.mutate()
                        .request(reqBuilder.build())
                        .build()
        );
    }


    private Mono<Void> writeError(ServerWebExchange exchange, HttpStatus status, String message) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] payload = ("{\"error\":\"" + message + "\"}")
                .getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse()
                .writeWith(Flux.just(exchange.getResponse().bufferFactory().wrap(payload)));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}