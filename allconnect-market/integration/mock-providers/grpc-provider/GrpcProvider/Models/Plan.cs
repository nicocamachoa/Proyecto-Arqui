namespace GrpcProvider.Models;

public class Plan
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string BillingCycle { get; set; } = "monthly";
    public List<string> Features { get; set; } = new();
    public string ImageUrl { get; set; } = string.Empty;
}
