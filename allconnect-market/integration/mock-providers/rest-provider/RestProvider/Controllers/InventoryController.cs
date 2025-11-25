using Microsoft.AspNetCore.Mvc;
using RestProvider.Models;
using RestProvider.Services;

namespace RestProvider.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<InventoryController> _logger;

    public InventoryController(IProductService productService, ILogger<InventoryController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    [HttpGet("{productId}")]
    public ActionResult<InventoryStatus> CheckInventory(string productId)
    {
        _logger.LogInformation("Checking inventory for product: {ProductId}", productId);
        var inventory = _productService.CheckInventory(productId);

        if (!inventory.InStock && inventory.AvailableStock == 0 && inventory.WarehouseLocation == "N/A")
        {
            return NotFound(new { Message = $"Product {productId} not found" });
        }

        return Ok(inventory);
    }
}
