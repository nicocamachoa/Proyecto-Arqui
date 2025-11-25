using RestProvider.Data;
using RestProvider.Models;

namespace RestProvider.Services;

public class ProductService : IProductService
{
    private static readonly string[] Warehouses = { "Warehouse-A", "Warehouse-B", "Warehouse-C" };

    public IEnumerable<Product> GetAll() => MockData.Products;

    public Product? GetById(string id) =>
        MockData.Products.FirstOrDefault(p => p.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

    public IEnumerable<Product> GetByCategory(string category) =>
        MockData.Products.Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase));

    public InventoryStatus CheckInventory(string productId)
    {
        var product = GetById(productId);
        if (product == null)
        {
            return new InventoryStatus
            {
                ProductId = productId,
                AvailableStock = 0,
                ReservedStock = 0,
                WarehouseLocation = "N/A"
            };
        }

        return new InventoryStatus
        {
            ProductId = productId,
            AvailableStock = product.Stock,
            ReservedStock = Random.Shared.Next(0, Math.Min(10, product.Stock)),
            WarehouseLocation = Warehouses[Random.Shared.Next(Warehouses.Length)],
            LastUpdated = DateTime.UtcNow
        };
    }

    public bool ReserveStock(string productId, int quantity)
    {
        var product = GetById(productId);
        if (product == null || product.Stock < quantity)
        {
            return false;
        }

        product.Stock -= quantity;
        return true;
    }
}
