using System;
using System.Collections.Generic;
using System.Linq;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend.Dtos;

namespace backend.PDFs
{
    public class UserOverviewPDF : IDocument
    {
        private readonly IReadOnlyList<TimeRegistrationDto> _rows;
        private readonly string _title;

        public UserOverviewPDF(IEnumerable<TimeRegistrationDto> rows, string? title = null)
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
                page.Size(PageSizes.A4.Landscape());
                page.Margin(20);
                page.DefaultTextStyle(TextStyle.Default.FontSize(9));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().AlignCenter().Text(txt =>
                {
                    txt.Span("Generated ").FontSize(8).FontColor(Colors.Grey.Darken2);
                    txt.Span($"{DateTime.Now:yyyy-MM-dd HH:mm}").FontSize(8).FontColor(Colors.Grey.Darken2);
                    txt.Span(" • Page ").FontSize(8).FontColor(Colors.Grey.Darken2);
                    txt.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Darken2);
                    txt.Span(" / ").FontSize(8).FontColor(Colors.Grey.Darken2);
                    txt.TotalPages().FontSize(8).FontColor(Colors.Grey.Darken2);
                });

                void ComposeHeader(IContainer header)
                {
                    header
                        .PaddingBottom(8)
                        .BorderBottom(1)
                        .BorderColor(Colors.Grey.Lighten1)
                        .Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text(_title).FontSize(16).SemiBold();
                                col.Item().Text($"Total entries: {_rows.Count}")
                                    .FontSize(9).FontColor(Colors.Grey.Darken2);
                                col.Item().Text($"Total hours (raw): {totalHours:0.##}")
                                    .FontSize(9).FontColor(Colors.Grey.Darken2);
                            });
                        });
                }

                void ComposeContent(IContainer content)
                {
                    content
                        .PaddingTop(8)
                        .Table(table =>
                        {
                            table.ColumnsDefinition(c =>
                            {
                                c.ConstantColumn(70);
                                c.ConstantColumn(70);
                                c.RelativeColumn(2);
                                c.ConstantColumn(70);
                                c.ConstantColumn(55);
                                c.ConstantColumn(55);
                                c.ConstantColumn(55);
                                c.RelativeColumn(2);
                                c.ConstantColumn(70);
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
                                .Element(e => e.PaddingTop(6).BorderTop(1).BorderColor(Colors.Grey.Darken1))
                                .Text("Total").SemiBold();

                            table.Cell()
                                .AlignRight()
                                .Element(e => e.PaddingTop(6).BorderTop(1).BorderColor(Colors.Grey.Darken1))
                                .Text($"{totalHours:0.##}")
                                .SemiBold();

                            table.Cell().ColumnSpan(2)
                                .Element(e => e.PaddingTop(6).BorderTop(1).BorderColor(Colors.Grey.Darken1))
                                .Text("");
                        });
                }
            });
        }

        static string FormatTime(TimeSpan ts) => ts.ToString(@"hh\:mm");

        static IContainer CellPadding(IContainer c) =>
            c.PaddingVertical(3).PaddingHorizontal(5);

        static IContainer HeaderCellStyle(IContainer c) =>
            c.DefaultTextStyle(x => x.SemiBold().FontSize(9))
             .PaddingVertical(4)
             .PaddingHorizontal(5)
             .Background(Colors.Grey.Lighten4)
             .BorderBottom(1)
             .BorderColor(Colors.Grey.Darken2);
    }
}
