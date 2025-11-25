var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddHttpClient("RestProvider", client =>
{
    client.BaseAddress = new Uri("http://localhost:4001");
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();
app.UseRouting();
app.MapRazorPages();

app.Logger.LogInformation("REST Provider Web UI starting on port 5001...");
app.Logger.LogInformation("Open http://localhost:5001 in your browser");

app.Run();
