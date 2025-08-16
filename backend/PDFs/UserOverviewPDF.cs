using System;
using System.Collections.Generic;
using System.Linq;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend.Dtos;
 
 /*
namespace backend.PDFs
{
    public class TimeRegistrationsOverviewDocument : IDocument
    {
        private readonly IReadOnlyList<TimeRegistrationDto> _rows;
        private readonly string _title;

        public TimeRegistrationsOverviewDocument(IEnumerable<TimeRegistrationDto> rows, string? title = null)
        {
            _rows = rows?.ToList() ?? new List<TimeRegistrationDto>();
            _title = string.IsNullOrWhiteSpace(title) ? "Time Registrations Overview" : title;
        }

        public DocumentMetadata GetMetadata() => new()
        {
            Title = _title,
            Author = "Time Registration System",
            Subject = "Overview of time registrations",
            Keywords = "time, registrations, overview, projects, users",
        };

        public void Compose(IDocumentContainer container)
        {
            var totalHours = _rows.Sum(r => r.Hours);

            container.Page(page =>
            {
                page.Margin(30);

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().AlignCenter().Text(txt =>
                {
                    txt.Span("Generated ").FontSize(9).FontColor(Colors.Grey.Darken2);
                    txt.Span($"{DateTime.Now:yyyy-MM-dd HH:mm}").FontSize(9).FontColor(Colors.Grey.Darken2);
                    txt.Span(" • Page ").FontSize(9).FontColor(Colors.Grey.Darken2);
                    txt.CurrentPageNumber().FontSize(9).FontColor(Colors.Grey.Darken2);
                    txt.Span(" / ").FontSize(9).FontColor(Colors.Grey.Darken2);
                    txt.TotalPages().FontSize(9).FontColor(Colors.Grey.Darken2);
                });

                void ComposeHeader(IContainer header)
                {
                    header
                        .Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text(_title).FontSize(18).SemiBold();
                                col.Item().Text($"Total entries: {_rows.Count}").FontSize(10).FontColor(Colors.Grey.Darken2);
                                col.Item().Text($"Total hours (raw): {totalHours:0.##}")
                                          .FontSize(10).FontColor(Colors.Grey.Darken2);
                            });
                        })
                        .PaddingBottom(10)
                        .BorderBottom(1)
                        .BorderColor(Colors.Grey.Lighten1);
                }

                void ComposeContent(IContainer content)
                {
                    content
                        .PaddingTop(10)
                        .Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(80);
                                c.ConstantColumn(80);
                                c.RelativeColumn(1.2f);
                                c.ConstantColumn(80);
                                c.ConstantColumn(60);
                                c.ConstantColumn(60);
                                c.ConstantColumn(60);
                                c.RelativeColumn(1.6f);
                                c.ConstantColumn(75);
                            });

                            table.Header(h =>
                            {
                                h.Cell().Element(HeaderCellStyle).Text("First Name");
                                h.Cell().Element(HeaderCellStyle).Text("Last Name");
                                h.Cell().Element(HeaderCellStyle).Text("Project");
                                h.Cell().Element(HeaderCellStyle).Text("Date");
                                h.Cell().Element(HeaderCellStyle).Text("Start");
                                h.Cell().Element(HeaderCellStyle).Text("End");
                                h.Cell().Element(HeaderCellStyle).AlignRight().Text("Hours");
                                h.Cell().Element(HeaderCellStyle).Text("Comment");
                                h.Cell().Element(HeaderCellStyle).Text("Status");
                            });

                            var zebra = false;
                            foreach (var r in _rows
                                .OrderBy(x => x.ProjectName)
                                .ThenBy(x => x.Date)
                                .ThenBy(x => x.StartTime))
                            {
                                var bg = zebra ? Colors.Grey.Lighten5 : Colors.White;
                                zebra = !zebra;

                                table.Cell().Background(bg).Element(CellPadding).Text(r.FirstName ?? "");
                                table.Cell().Background(bg).Element(CellPadding).Text(r.LastName ?? "");
                                table.Cell().Background(bg).Element(CellPadding).Text(r.ProjectName ?? "");
                                table.Cell().Background(bg).Element(CellPadding).Text(r.Date.ToString("yyyy-MM-dd"));
                                table.Cell().Background(bg).Element(CellPadding).Text(FormatTime(r.StartTime));
                                table.Cell().Background(bg).Element(CellPadding).Text(FormatTime(r.EndTime));
                                table.Cell().Background(bg).Element(CellPadding).AlignRight().Text($"{r.Hours:0.##}");
                                table.Cell().Background(bg).Element(CellPadding).Text(r.Comment ?? "");
                                table.Cell().Background(bg).Element(CellPadding).Text(r.Status ?? "Pending");
                            }

                            table.Cell().ColumnSpan(6)
                                .Element(e => e.PaddingTop(8).BorderTop(1).BorderColor(Colors.Grey.Darken1))
                                .Text("Total").SemiBold();

                            table.Cell()
                                .AlignRight()
                                .Element(e => e.PaddingTop(8).BorderTop(1).BorderColor(Colors.Grey.Darken1))
                                .Text($"{totalHours:0.##}")
                                .SemiBold();

                            table.Cell().ColumnSpan(2)
                                .Element(e => e.PaddingTop(8).BorderTop(1).BorderColor(Colors.Grey.Darken1))
                                .Text(""); // filler
                        });
                }
            });
        }
        static string FormatTime(TimeSpan ts) => ts.ToString(@"hh\:mm");

        static IContainer CellPadding(IContainer c) =>
            c.PaddingVertical(4).PaddingHorizontal(6);

        static IContainer HeaderCellStyle(IContainer c) =>
            c.DefaultTextStyle(x => x.SemiBold())
             .PaddingVertical(6)
             .PaddingHorizontal(6)
             .Background(Colors.Grey.Lighten4)
             .BorderBottom(1)
             .BorderColor(Colors.Grey.Darken2);
    }
}
*/