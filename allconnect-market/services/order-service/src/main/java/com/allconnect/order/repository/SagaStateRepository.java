package com.allconnect.order.repository;

import com.allconnect.order.model.SagaState;
import com.allconnect.order.model.SagaStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SagaStateRepository extends JpaRepository<SagaState, Long> {

    Optional<SagaState> findByOrderId(Long orderId);

    List<SagaState> findByStatus(SagaStatus status);
}
