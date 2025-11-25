using RestProvider.Models;

namespace RestProvider.Services;

public interface IProductService
{
    IEnumerable<Product> GetAll();
    Product? GetById(string id);
    IEnumerable<Product> GetByCategory(string category);
    InventoryStatus CheckInventory(string productId);
    bool ReserveStock(string productId, int quantity);
}
