package com.smartrent.gateway.filter;

import com.smartrent.gateway.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import org.springframework.util.AntPathMatcher;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtUtil jwtUtil; // yst5dem el jwt util 3lashan y3mel check 3la el token
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Value("${app.public-paths}") // bys7b all paths from application.yaml
    private List<String> publicPaths;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // 1. Check if path is public
            boolean isPublic = publicPaths.stream().anyMatch(p -> pathMatcher.match(p, path));

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (isPublic && (authHeader == null || !authHeader.startsWith("Bearer "))) {
                return chain.filter(exchange);
            }

            // 2. Extract and validate token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            // 3. Propagate headers
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id", jwtUtil.extractUserId(token))
                    .header("X-User-Role", jwtUtil.extractRole(token))
                    .header("X-User-Email", jwtUtil.extractEmail(token))
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    public static class Config {
    }
}

// example of request :
// GET /api/properties HTTP/1.1
// Host: localhost:8080
// Content-Type: application/json
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
