var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddHttpClient("GrpcProvider", client =>
{
    client.BaseAddress = new Uri("http://localhost:4003");
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();
app.UseRouting();
app.MapRazorPages();

app.Logger.LogInformation("gRPC Provider Web UI starting on port 5003...");
app.Logger.LogInformation("Open http://localhost:5003 in your browser");

app.Run();
