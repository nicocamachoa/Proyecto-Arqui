package com.allconnect.billing.repository;

import com.allconnect.billing.model.Invoice;
import com.allconnect.billing.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByOrderId(Long orderId);

    List<Invoice> findByCustomerId(Long customerId);

    List<Invoice> findByCustomerIdOrderByIssuedAtDesc(Long customerId);

    List<Invoice> findByStatus(InvoiceStatus status);

    boolean existsByOrderId(Long orderId);
}
