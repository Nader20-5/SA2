package com.smartrent.property.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "property_amenities",
       uniqueConstraints = @UniqueConstraint(columnNames = {"property_id", "amenity"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyAmenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AmenityType amenity;
}
