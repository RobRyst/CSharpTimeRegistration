using System.Collections.Generic;
using backend.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace backend.PDFs
{
    public class UserOverviewPDF : IDocument
    {
        private readonly IEnumerable<ProjectDto> _projects;
        private readonly string _title;

        public UserOverviewPDF(IEnumerable<ProjectDto> projects, string title = "Projects Overview")
        {
            _projects = projects;
            _title = title;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Margin(36); // 0.5in

                page.Header().Row(row =>
                {
                    row.RelativeItem().Text(_title).FontSize(20).SemiBold();
                    row.ConstantItem(200).AlignRight().Text(txt =>
                    {
                        txt.Span("Generated: ").SemiBold();
                        txt.Span($"{System.DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC");
                    });
                });

                page.Content().Element(ComposeTable);

                page.Footer().AlignRight().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        }

        void ComposeTable(IContainer container)
        {
            container.PaddingVertical(10).Table(table =>
            {
                table.ColumnsDefinition(c =>
                {
                    c.ConstantColumn(45);     // ID
                    c.RelativeColumn(2);      // Name
                    c.RelativeColumn(3);      // Description
                    c.ConstantColumn(85);     // Status
                });

                // header
                table.Header(h =>
                {
                    h.Cell().Element(HeaderCell).Text("ID");
                    h.Cell().Element(HeaderCell).Text("Name");
                    h.Cell().Element(HeaderCell).Text("Description");
                    h.Cell().Element(HeaderCell).Text("Status");
                });

                foreach (var p in _projects)
                {
                    table.Cell().Element(Cell).Text(p.Id.ToString());
                    table.Cell().Element(Cell).Text(p.Name);
                    table.Cell().Element(Cell).Text(string.IsNullOrWhiteSpace(p.Description) ? "-" : p.Description);
                    table.Cell().Element(Cell).Text(p.Status ?? "Pending");
                }

                static IContainer HeaderCell(IContainer c) =>
                    c.DefaultTextStyle(x => x.SemiBold())
                     .PaddingVertical(6)
                     .BorderBottom(1)
                     .BorderColor(Colors.Grey.Darken2);

                static IContainer Cell(IContainer c) =>
                    c.PaddingVertical(4);
            });
        }
    }
}
