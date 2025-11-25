using System.Text.Json;
using RestProvider.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Use ISO 8601 format with 3 decimal places for Java compatibility
        options.JsonSerializerOptions.Converters.Add(new DateTimeConverter());
        options.JsonSerializerOptions.Converters.Add(new NullableDateTimeConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "AllConnect REST Provider - Physical Products",
        Version = "v1",
        Description = "Mock REST Provider for physical products (Amazon-like)"
    });
});

// Register services
builder.Services.AddSingleton<IProductService, ProductService>();
builder.Services.AddSingleton<IOrderService, OrderService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "REST Provider v1");
    c.RoutePrefix = string.Empty;
});

app.UseCors();
app.MapControllers();

app.Logger.LogInformation("REST Provider starting on port 4001...");
app.Logger.LogInformation("Swagger UI available at: http://localhost:4001/");

app.Run();

// Custom DateTime converter for Java compatibility (without 'Z' suffix for easier parsing)
public class DateTimeConverter : System.Text.Json.Serialization.JsonConverter<DateTime>
{
    private const string Format = "yyyy-MM-ddTHH:mm:ss.fff";

    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        return DateTime.Parse(reader.GetString()!);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToUniversalTime().ToString(Format));
    }
}

public class NullableDateTimeConverter : System.Text.Json.Serialization.JsonConverter<DateTime?>
{
    private const string Format = "yyyy-MM-ddTHH:mm:ss.fff";

    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var str = reader.GetString();
        return str == null ? null : DateTime.Parse(str);
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
            writer.WriteStringValue(value.Value.ToUniversalTime().ToString(Format));
        else
            writer.WriteNullValue();
    }
}
