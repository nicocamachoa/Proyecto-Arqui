package com.allconnect.billing.service;

import com.allconnect.billing.dto.*;
import com.allconnect.billing.model.*;
import com.allconnect.billing.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final AtomicLong invoiceCounter = new AtomicLong(1000);

    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        log.info("Creating invoice for order: {}", request.getOrderId());

        // Check if invoice already exists for this order
        if (invoiceRepository.existsByOrderId(request.getOrderId())) {
            throw new RuntimeException("Invoice already exists for order: " + request.getOrderId());
        }

        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .orderId(request.getOrderId())
                .customerId(request.getCustomerId())
                .subtotal(request.getSubtotal())
                .tax(request.getTax())
                .shippingCost(request.getShippingCost())
                .total(request.getTotal())
                .status(InvoiceStatus.ISSUED)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .billingAddress(request.getBillingAddress())
                .notes(request.getNotes())
                .pdfUrl(generatePdfUrl(invoiceNumber))
                .build();

        invoice = invoiceRepository.save(invoice);
        log.info("Invoice created: {}", invoiceNumber);

        publishInvoiceEvent("invoice.created", invoice);
        return mapToResponse(invoice);
    }

    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return mapToResponse(invoice);
    }

    public InvoiceResponse getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return mapToResponse(invoice);
    }

    public InvoiceResponse getInvoiceByOrder(Long orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for order"));
        return mapToResponse(invoice);
    }

    public List<InvoiceResponse> getInvoicesByCustomer(Long customerId) {
        return invoiceRepository.findByCustomerIdOrderByIssuedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public String getInvoicePdf(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // In a real implementation, this would generate/return the actual PDF
        return invoice.getPdfUrl();
    }

    @Transactional
    public InvoiceResponse markAsPaid(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getStatus() != InvoiceStatus.ISSUED) {
            throw new RuntimeException("Only issued invoices can be marked as paid");
        }

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        invoice = invoiceRepository.save(invoice);

        log.info("Invoice marked as paid: {}", invoice.getInvoiceNumber());
        publishInvoiceEvent("invoice.paid", invoice);

        return mapToResponse(invoice);
    }

    @Transactional
    public InvoiceResponse voidInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (invoice.getStatus() == InvoiceStatus.VOIDED) {
            throw new RuntimeException("Invoice is already voided");
        }

        invoice.setStatus(InvoiceStatus.VOIDED);
        invoice.setCancelledAt(LocalDateTime.now());
        invoice = invoiceRepository.save(invoice);

        log.info("Invoice voided: {}", invoice.getInvoiceNumber());
        publishInvoiceEvent("invoice.voided", invoice);

        return mapToResponse(invoice);
    }

    private String generateInvoiceNumber() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long counter = invoiceCounter.getAndIncrement();
        return "INV-" + date + "-" + String.format("%05d", counter);
    }

    private String generatePdfUrl(String invoiceNumber) {
        // Mock PDF URL - in production this would be a real storage URL
        return "https://storage.allconnect.com/invoices/" + invoiceNumber + ".pdf";
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .orderId(invoice.getOrderId())
                .customerId(invoice.getCustomerId())
                .subtotal(invoice.getSubtotal())
                .tax(invoice.getTax())
                .shippingCost(invoice.getShippingCost())
                .total(invoice.getTotal())
                .status(invoice.getStatus())
                .customerName(invoice.getCustomerName())
                .customerEmail(invoice.getCustomerEmail())
                .billingAddress(invoice.getBillingAddress())
                .notes(invoice.getNotes())
                .pdfUrl(invoice.getPdfUrl())
                .issuedAt(invoice.getIssuedAt())
                .paidAt(invoice.getPaidAt())
                .cancelledAt(invoice.getCancelledAt())
                .build();
    }

    private void publishInvoiceEvent(String eventType, Invoice invoice) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", eventType);
            event.put("invoiceId", invoice.getId());
            event.put("invoiceNumber", invoice.getInvoiceNumber());
            event.put("orderId", invoice.getOrderId());
            event.put("customerId", invoice.getCustomerId());
            event.put("total", invoice.getTotal());
            event.put("status", invoice.getStatus().name());
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("invoice-events", event);
            log.info("Published event: {} for invoice: {}", eventType, invoice.getInvoiceNumber());
        } catch (Exception e) {
            log.warn("Failed to publish Kafka event: {}", e.getMessage());
        }
    }
}
