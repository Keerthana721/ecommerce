package org.example.userservice.repository;

import org.example.userservice.model.MenuItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItemEntity, Long> {
    List<MenuItemEntity> findByParentIdOrderByDisplayOrderAsc(Long parentId);
}
