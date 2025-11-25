using Microsoft.AspNetCore.Mvc;
using RestProvider.Models;
using RestProvider.Services;

namespace RestProvider.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _logger = logger;
    }

    [HttpPost]
    public ActionResult<OrderResponse> CreateOrder([FromBody] OrderRequest request)
    {
        _logger.LogInformation("Creating order for customer: {CustomerId}", request.CustomerId);
        var response = _orderService.CreateOrder(request);

        if (!response.Success)
        {
            _logger.LogWarning("Order creation failed: {Error}", response.ErrorMessage);
            return BadRequest(response);
        }

        _logger.LogInformation("Order created successfully: {OrderId}", response.OrderId);
        return CreatedAtAction(nameof(GetOrder), new { id = response.OrderId }, response);
    }

    [HttpGet("{id}")]
    public ActionResult<Order> GetOrder(string id)
    {
        _logger.LogInformation("Getting order: {OrderId}", id);
        var order = _orderService.GetOrder(id);
        if (order == null)
        {
            return NotFound(new { Message = $"Order {id} not found" });
        }
        return Ok(order);
    }

    [HttpGet("{id}/status")]
    public ActionResult<OrderStatus> GetOrderStatus(string id)
    {
        _logger.LogInformation("Getting order status: {OrderId}", id);
        var status = _orderService.GetOrderStatus(id);
        if (status.Status == "NOT_FOUND")
        {
            return NotFound(new { Message = $"Order {id} not found" });
        }
        return Ok(status);
    }

    [HttpDelete("{id}")]
    public ActionResult CancelOrder(string id)
    {
        _logger.LogInformation("Cancelling order: {OrderId}", id);
        var success = _orderService.CancelOrder(id);
        if (!success)
        {
            return BadRequest(new { Message = $"Cannot cancel order {id}. It may not exist or already be delivered/cancelled." });
        }
        return Ok(new { Success = true, Message = $"Order {id} cancelled successfully" });
    }

    [HttpGet("customer/{customerId}")]
    public ActionResult<IEnumerable<Order>> GetOrdersByCustomer(string customerId)
    {
        _logger.LogInformation("Getting orders for customer: {CustomerId}", customerId);
        return Ok(_orderService.GetOrdersByCustomer(customerId));
    }
}
