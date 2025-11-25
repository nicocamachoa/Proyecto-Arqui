namespace RestProvider.Models;

public class InventoryStatus
{
    public string ProductId { get; set; } = string.Empty;
    public int AvailableStock { get; set; }
    public int ReservedStock { get; set; }
    public bool InStock => AvailableStock > 0;
    public string WarehouseLocation { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
