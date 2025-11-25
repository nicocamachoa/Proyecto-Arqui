package com.allconnect.billing.controller;

import com.allconnect.billing.dto.InvoiceRequest;
import com.allconnect.billing.dto.InvoiceResponse;
import com.allconnect.billing.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Invoice and Billing Management APIs")
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/invoices")
    @Operation(summary = "Create a new invoice")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(billingService.createInvoice(request));
    }

    @GetMapping("/invoices/{id}")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getInvoiceById(id));
    }

    @GetMapping("/invoices/number/{invoiceNumber}")
    @Operation(summary = "Get invoice by number")
    public ResponseEntity<InvoiceResponse> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(billingService.getInvoiceByNumber(invoiceNumber));
    }

    @GetMapping("/invoices/order/{orderId}")
    @Operation(summary = "Get invoice by order")
    public ResponseEntity<InvoiceResponse> getInvoiceByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(billingService.getInvoiceByOrder(orderId));
    }

    @GetMapping("/invoices/customer/{customerId}")
    @Operation(summary = "Get invoices by customer")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(billingService.getInvoicesByCustomer(customerId));
    }

    @GetMapping("/invoices/{id}/pdf")
    @Operation(summary = "Get invoice PDF URL")
    public ResponseEntity<Map<String, String>> getInvoicePdf(@PathVariable Long id) {
        String pdfUrl = billingService.getInvoicePdf(id);
        return ResponseEntity.ok(Map.of("pdfUrl", pdfUrl));
    }

    @PutMapping("/invoices/{id}/paid")
    @Operation(summary = "Mark invoice as paid")
    public ResponseEntity<InvoiceResponse> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.markAsPaid(id));
    }

    @PutMapping("/invoices/{id}/void")
    @Operation(summary = "Void an invoice")
    public ResponseEntity<InvoiceResponse> voidInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.voidInvoice(id));
    }
}
