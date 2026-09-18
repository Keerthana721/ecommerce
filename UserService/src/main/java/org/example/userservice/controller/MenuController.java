package org.example.userservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.userservice.model.RoleEntity;
import org.example.userservice.repository.RoleEntityRepository;
import org.example.userservice.service.MenuService;
import org.example.userservice.shareddto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("api/menus")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class MenuController {

    @Autowired
    private MenuService menuService;

    @Autowired
    private RoleEntityRepository roleEntityRepository;

    @GetMapping("/user-menu")
    public ResponseEntity<?> getUserMenu(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(new ApiResponse<>(false, "Unauthorized"));
            }

            // Extract the role from the authority (remove "ROLE_" prefix)
            String roleName = authentication.getAuthorities().stream()
                    .map(auth -> auth.getAuthority())
                    .filter(auth -> auth.startsWith("ROLE_"))
                    .map(auth -> auth.substring(5)) // strip "ROLE_"
                    .findFirst()
                    .orElse("CONSUMER"); // Default to CONSUMER if not found

            List<Map<String, Object>> menuTree = menuService.getHierarchicalMenuForRole(roleName);
            return ResponseEntity.ok(new ApiResponse<>(true, "Role menu retrieved successfully", menuTree));
        } catch (Exception e) {
            log.error("Error retrieving user menu: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllRoles() {
        try {
            List<RoleEntity> roles = roleEntityRepository.findAll();
            return ResponseEntity.ok(new ApiResponse<>(true, "Roles retrieved successfully", roles));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }

    @PostMapping("/roles/{roleId}/menus")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignMenusToRole(@PathVariable Long roleId, @RequestBody Set<Long> menuItemIds) {
        try {
            RoleEntity updatedRole = menuService.assignMenusToRole(roleId, menuItemIds);
            return ResponseEntity.ok(new ApiResponse<>(true, "Role menus updated successfully", updatedRole));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage()));
        }
    }
}
