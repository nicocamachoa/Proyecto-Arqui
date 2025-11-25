using Microsoft.AspNetCore.Mvc;
using RestProvider.Models;
using RestProvider.Services;

namespace RestProvider.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Product>> GetAll()
    {
        _logger.LogInformation("Getting all products");
        return Ok(_productService.GetAll());
    }

    [HttpGet("{id}")]
    public ActionResult<Product> GetById(string id)
    {
        _logger.LogInformation("Getting product by ID: {ProductId}", id);
        var product = _productService.GetById(id);
        if (product == null)
        {
            return NotFound(new { Message = $"Product {id} not found" });
        }
        return Ok(product);
    }

    [HttpGet("category/{category}")]
    public ActionResult<IEnumerable<Product>> GetByCategory(string category)
    {
        _logger.LogInformation("Getting products by category: {Category}", category);
        return Ok(_productService.GetByCategory(category));
    }
}
