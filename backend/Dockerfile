FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:8.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    libfontconfig1 libfreetype6 libharfbuzz0b libpng16-16 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /out ./

ENV ASPNETCORE_URLS=http://+:5196
EXPOSE 5196
ENTRYPOINT ["dotnet", "backend.dll"]
