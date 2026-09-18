package org.example.userservice.service;

import lombok.extern.slf4j.Slf4j;
import org.example.userservice.model.MenuItemEntity;
import org.example.userservice.model.RoleEntity;
import org.example.userservice.repository.MenuItemRepository;
import org.example.userservice.repository.RoleEntityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MenuService {

    @Autowired
    private RoleEntityRepository roleEntityRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public Set<MenuItemEntity> getMenusForRole(String roleName) {
        Optional<RoleEntity> roleOpt = roleEntityRepository.findByName(roleName);
        if (roleOpt.isPresent()) {
            return roleOpt.get().getMenuItems();
        }
        return Collections.emptySet();
    }

    public List<Map<String, Object>> getHierarchicalMenuForRole(String roleName) {
        Set<MenuItemEntity> items = getMenusForRole(roleName);
        List<MenuItemEntity> itemList = new ArrayList<>(items);
        itemList.sort(Comparator.comparingInt(m -> m.getDisplayOrder() != null ? m.getDisplayOrder() : 0));

        Map<Long, Map<String, Object>> idToNodeMap = new HashMap<>();
        List<Map<String, Object>> rootNodes = new ArrayList<>();

        for (MenuItemEntity item : itemList) {
            Map<String, Object> node = new HashMap<>();
            node.put("id", item.getId());
            node.put("title", item.getTitle());
            node.put("path", item.getPath());
            node.put("icon", item.getIcon());
            node.put("permissionCode", item.getPermissionCode());
            node.put("children", new ArrayList<Map<String, Object>>());
            idToNodeMap.put(item.getId(), node);
        }

        for (MenuItemEntity item : itemList) {
            Map<String, Object> node = idToNodeMap.get(item.getId());
            if (item.getParentId() == null || item.getParentId() == 0L || !idToNodeMap.containsKey(item.getParentId())) {
                rootNodes.add(node);
            } else {
                Map<String, Object> parentNode = idToNodeMap.get(item.getParentId());
                ((List<Map<String, Object>>) parentNode.get("children")).add(node);
            }
        }

        return rootNodes;
    }

    public RoleEntity assignMenusToRole(Long roleId, Set<Long> menuItemIds) {
        RoleEntity role = roleEntityRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleId));

        List<MenuItemEntity> menuItems = menuItemRepository.findAllById(menuItemIds);
        role.setMenuItems(new HashSet<>(menuItems));
        return roleEntityRepository.save(role);
    }
}
