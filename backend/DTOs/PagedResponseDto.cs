using System.Text.Json.Serialization;

namespace EmployeeManagement.Api.DTOs;

public class PagedResponseDto<T>
{
    [JsonPropertyName("Items")]
    public List<T> Items { get; set; } = [];

    [JsonPropertyName("Page_Number")]
    public int PageNumber { get; set; }

    [JsonPropertyName("Page_Size")]
    public int PageSize { get; set; }

    [JsonPropertyName("Total_Count")]
    public int TotalCount { get; set; }

    [JsonPropertyName("Total_Pages")]
    public int TotalPages { get; set; }

    [JsonPropertyName("Has_Previous_Page")]
    public bool HasPreviousPage => PageNumber > 1;

    [JsonPropertyName("Has_Next_Page")]
    public bool HasNextPage => PageNumber < TotalPages;
}
