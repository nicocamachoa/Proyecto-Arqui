package com.allconnect.catalog.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Long parentId;
    private Boolean active;
    private LocalDateTime createdAt;
}
