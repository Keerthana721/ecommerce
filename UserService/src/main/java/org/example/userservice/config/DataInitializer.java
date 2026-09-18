//package org.example.userservice.config;
//
//import lombok.extern.slf4j.Slf4j;
//import org.example.userservice.model.MenuItemEntity;
//import org.example.userservice.model.PermissionEntity;
//import org.example.userservice.model.RoleEntity;
//import org.example.userservice.repository.MenuItemRepository;
//import org.example.userservice.repository.PermissionRepository;
//import org.example.userservice.repository.RoleEntityRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.stereotype.Component;
//
//import java.util.Arrays;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Set;
//
//import org.example.userservice.model.Role;
//import org.example.userservice.model.User;
//import org.example.userservice.repository.UserRepository;
//
//import java.time.LocalDateTime;
//
//@Component
//@Slf4j
//public class DataInitializer implements CommandLineRunner {
//
//    @Autowired
//    private RoleEntityRepository roleEntityRepository;
//
//    @Autowired
//    private PermissionRepository permissionRepository;
//
//    @Autowired
//    private MenuItemRepository menuItemRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
//
//    @Override
//    public void run(String... args) throws Exception {
//        if (userRepository.findByEmail("admin@ecommerce.com").isEmpty()) {
//            User adminUser = new User();
//            adminUser.setUsername("admin");
//            adminUser.setEmail("admin@ecommerce.com");
//            adminUser.setPassword(passwordEncoder.encode("admin123"));
//            adminUser.setFirstName("System");
//            adminUser.setLastName("Admin");
//            adminUser.setRole(Role.ADMIN);
//            adminUser.setIsActive(true);
//            adminUser.setIsEmailVerified(true);
//            adminUser.setCreatedAt(LocalDateTime.now());
//            userRepository.save(adminUser);
//            log.info("Default Admin User created: admin@ecommerce.com / admin123");
//        }
//
//        if (userRepository.findByEmail("manager@ecommerce.com").isEmpty()) {
//            User managerUser = new User();
//            managerUser.setUsername("manager");
//            managerUser.setEmail("manager@ecommerce.com");
//            managerUser.setPassword(passwordEncoder.encode("manager123"));
//            managerUser.setFirstName("System");
//            managerUser.setLastName("Manager");
//            managerUser.setRole(Role.MANAGER);
//            managerUser.setIsActive(true);
//            managerUser.setIsEmailVerified(true);
//            managerUser.setCreatedAt(LocalDateTime.now());
//            userRepository.save(managerUser);
//            log.info("Default Manager User created: manager@ecommerce.com / manager123");
//        }
//
//        if (userRepository.findByEmail("consumer@ecommerce.com").isEmpty()) {
//            User consumerUser = new User();
//            consumerUser.setUsername("consumer");
//            consumerUser.setEmail("consumer@ecommerce.com");
//            consumerUser.setPassword(passwordEncoder.encode("consumer123"));
//            consumerUser.setFirstName("System");
//            consumerUser.setLastName("Consumer");
//            consumerUser.setRole(Role.CONSUMER);
//            consumerUser.setIsActive(true);
//            consumerUser.setIsEmailVerified(true);
//            consumerUser.setCreatedAt(LocalDateTime.now());
//            userRepository.save(consumerUser);
//            log.info("Default Consumer User created: consumer@ecommerce.com / consumer123");
//        }
//
//        if (roleEntityRepository.count() > 0) {
//            log.info("RBAC Data already initialized.");
//            return;
//        }
//
//        log.info("Initializing RBAC Permissions, Menus, and Roles in PostgreSQL...");
//
//        // 1. Seed Permissions
//        PermissionEntity permUser = permissionRepository.save(PermissionEntity.builder().code("USER_MANAGE").name("Manage Users").module("USER").build());
//        PermissionEntity permProd = permissionRepository.save(PermissionEntity.builder().code("PRODUCT_MANAGE").name("Manage Products").module("PRODUCT").build());
//        PermissionEntity permOrder = permissionRepository.save(PermissionEntity.builder().code("ORDER_MANAGE").name("Manage Orders").module("ORDER").build());
//        PermissionEntity permInv = permissionRepository.save(PermissionEntity.builder().code("INVENTORY_MANAGE").name("Manage Inventory").module("INVENTORY").build());
//        PermissionEntity permInvc = permissionRepository.save(PermissionEntity.builder().code("INVOICE_MANAGE").name("Manage Invoices").module("INVOICE").build());
//        PermissionEntity permShip = permissionRepository.save(PermissionEntity.builder().code("SHIPPING_MANAGE").name("Manage Shipping").module("SHIPPING").build());
//        PermissionEntity permNotif = permissionRepository.save(PermissionEntity.builder().code("NOTIFICATION_MANAGE").name("Manage Notifications").module("NOTIFICATION").build());
//        PermissionEntity permPay = permissionRepository.save(PermissionEntity.builder().code("PAYMENT_VIEW").name("View Payments").module("PAYMENT").build());
//
//        // 2. Seed Menu Items
//        MenuItemEntity menuDash = menuItemRepository.save(MenuItemEntity.builder().title("Dashboard").path("/dashboard").icon("dashboard").displayOrder(1).build());
//        MenuItemEntity menuUser = menuItemRepository.save(MenuItemEntity.builder().title("User Management").path("/users").icon("users").displayOrder(2).permissionCode("USER_MANAGE").build());
//        MenuItemEntity menuProd = menuItemRepository.save(MenuItemEntity.builder().title("Products Catalog").path("/products").icon("shopping-bag").displayOrder(3).permissionCode("PRODUCT_MANAGE").build());
//        MenuItemEntity menuOrder = menuItemRepository.save(MenuItemEntity.builder().title("Orders").path("/orders").icon("shopping-cart").displayOrder(4).permissionCode("ORDER_MANAGE").build());
//        MenuItemEntity menuInv = menuItemRepository.save(MenuItemEntity.builder().title("Inventory Stock").path("/inventory").icon("box").displayOrder(5).permissionCode("INVENTORY_MANAGE").build());
//        MenuItemEntity menuInvc = menuItemRepository.save(MenuItemEntity.builder().title("Invoices & Billing").path("/invoices").icon("file-text").displayOrder(6).permissionCode("INVOICE_MANAGE").build());
//        MenuItemEntity menuShip = menuItemRepository.save(MenuItemEntity.builder().title("Shipping & Logistics").path("/shipping").icon("truck").displayOrder(7).permissionCode("SHIPPING_MANAGE").build());
//        MenuItemEntity menuNotif = menuItemRepository.save(MenuItemEntity.builder().title("Notifications").path("/notifications").icon("bell").displayOrder(8).permissionCode("NOTIFICATION_MANAGE").build());
//        MenuItemEntity menuPay = menuItemRepository.save(MenuItemEntity.builder().title("Payments").path("/payments").icon("credit-card").displayOrder(9).permissionCode("PAYMENT_VIEW").build());
//
//        // 3. Seed Roles & Assign Default Menus/Permissions
//        RoleEntity adminRole = RoleEntity.builder()
//                .name("ADMIN")
//                .description("System Administrator - Full Access")
//                .permissions(new HashSet<>(Arrays.asList(permUser, permProd, permOrder, permInv, permInvc, permShip, permNotif, permPay)))
//                .menuItems(new HashSet<>(Arrays.asList(menuDash, menuUser, menuProd, menuOrder, menuInv, menuInvc, menuShip, menuNotif, menuPay)))
//                .build();
//
//        RoleEntity managerRole = RoleEntity.builder()
//                .name("MANAGER")
//                .description("Store / Operations Manager")
//                .permissions(new HashSet<>(Arrays.asList(permProd, permOrder, permInv, permInvc, permShip, permNotif, permPay)))
//                .menuItems(new HashSet<>(Arrays.asList(menuDash, menuProd, menuOrder, menuInv, menuInvc, menuShip, menuNotif, menuPay)))
//                .build();
//
//        RoleEntity consumerRole = RoleEntity.builder()
//                .name("CONSUMER")
//                .description("Consumer / Customer User")
//                .permissions(new HashSet<>(Arrays.asList(permOrder, permPay)))
//                .menuItems(new HashSet<>(Arrays.asList(menuDash, menuProd, menuOrder, menuPay)))
//                .build();
//
//        roleEntityRepository.saveAll(Arrays.asList(adminRole, managerRole, consumerRole));
//        log.info("RBAC Data initialization complete.");
//    }
//}
