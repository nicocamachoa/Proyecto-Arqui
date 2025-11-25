FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 4001

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["RestProvider/RestProvider.csproj", "RestProvider/"]
RUN dotnet restore "RestProvider/RestProvider.csproj"
COPY . .
WORKDIR "/src/RestProvider"
RUN dotnet build "RestProvider.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "RestProvider.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:4001
ENTRYPOINT ["dotnet", "RestProvider.dll"]
